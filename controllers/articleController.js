const mongoose = require('mongoose');
const Article = require('./../models/articleModel');

// create a article
// [POST]: api/v1/articles
// privite
exports.createArticle = async (req, res) => {
  try {
    const testData = {
      title: 'Learn react',
      content: 'lean react with me',
      imageCover: 'cover-image',
      author: mongoose.Types.ObjectId('65203afec3685b347110d627'),
      likedUsers: [
        mongoose.Types.ObjectId('65203afec3685b347110d627'),
        mongoose.Types.ObjectId('652163cb0017a9878e49c0db'),
      ],
      tags: [
        mongoose.Types.ObjectId('65202d53cc084288ab7e2ebe'),
        mongoose.Types.ObjectId('652161d90017a9878e49c0d9'),
      ],
    };
    const article = await Article.create(testData);

    res.status(201).json({
      status: 'success',
      data: {
        article,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Get a article
// [GET]: api/v1/articles/:id
// privite
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate({ path: 'likedUsers' })
      .populate({ path: 'author' })
      .populate({ path: 'tags' });

    res.status(200).json({
      status: 'success',
      data: {
        article,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// update a article
// [PATCH]: api/v1/articles/:id
// privite

exports.updateArticle = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// get all articles
// [GET]: api/v1/articles
// public
exports.getAllArticles = async (req, res) => {
  try {
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
      })
      .lookup({
        from: 'tags',
        localField: 'tags',
        foreignField: '_id',
        as: 'tags',
      });

    // keyword - title, tag
    if (req.query.keyword) {
      const keyword = req.query.keyword;
      query.match({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { 'tags.label': { $regex: keyword, $options: 'i' } },
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
    const limit = req.query.limit * 1 || 1;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
