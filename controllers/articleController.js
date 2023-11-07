const mongoose = require('mongoose');
const Article = require('./../models/articleModel');
const User = require('./../models/userModel');
const catchAsync = require('../catchAsync');
const AppError = require('../appError');

// create a article
// [POST]: api/v1/articles
// privite - admin
exports.createArticle = catchAsync(async (req, res) => {
  const article = await Article.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// Get a article
// [GET]: api/v1/articles/:id
// public
exports.getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findOne({ slug: req.params.id })
    .populate({ path: 'likedUsers' })
    .populate({ path: 'author' })
    .populate({ path: 'comments' });

  if (!article)
    return next(new AppError('No a article found with that slug', 404));

  res.status(200).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// update a article
// [PATCH]: api/v1/articles/:id
// privite - admin
exports.updateArticle = catchAsync(async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  // hearting article
  if (req.body.type === 'heart') {
    const article = await Article.findById(id);

    if (!article) return next(new AppError('Article is not found', 404));

    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(new AppError('User is not found', 404));

    if (!article.likedUsers.includes(user._id)) {
      article.numLikes = article.numLikes + 1;
      article.likedUsers.push(user._id);
    } else {
      article.numLikes = article.numLikes - 1;
      article.likedUsers = article.likedUsers.filter(
        (user) => !user._id === req.params.id,
      );
    }
    await article.save();
  }

  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// get all articles
// [GET]: api/v1/articles
// public
exports.getAllArticles = catchAsync(async (req, res) => {
  // 1. BUID QUERY
  let query = Article.aggregate()
    .match({})
    .lookup({
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    })
    .lookup({
      from: 'users',
      localField: 'likedUsers',
      foreignField: '_id',
      as: 'likedUsers',
    });

  // keyword - title
  if (req.query.keyword) {
    const keyword = req.query.keyword;
    query.match({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
      ],
    });
  }
  // sort by num likes
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy;
    const criteria = req.query.asc * 1 || 1;
    query = query.sort({ [sortBy]: criteria });
  }

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    query = query.skip(skip).limit(limit);
    const numArticles = await Article.countDocuments();
    if (skip >= numArticles) throw new Error('This page does not exist');
  }

  // 2. EXECUSE QUERY
  const articles = await query;

  // 3. RESPONSE
  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: {
      articles,
    },
  });
});
