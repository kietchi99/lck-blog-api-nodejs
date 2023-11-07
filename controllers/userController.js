const User = require('./../models/userModel');
const catchAsync = require('../catchAsync');
const AppError = require('../appError');
const mongoose = require('mongoose');

// Get a user
// [GET]: api/v1/users/:id
// privite
exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.params.id }).populate({
    path: 'savedArticles',
    populate: [{ path: 'author' }, { path: 'likedUsers' }, { path: 'tags' }],
  });

  if (!user) return next(new AppError('User is not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Create a user
// [POST]: api/v1/users
//
exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Update a user
// [PATCH]: api/v1/users/:id
// privite
exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User is not found', 404));

  //bookmark feature
  if (req.body.type === 'bookmark') {
    if (!user.savedArticles.includes(req.body.article)) {
      user.savedArticles.push(req.body.article);
    } else {
      user.savedArticles = user.savedArticles.filter(
        (article) => !article._id === article,
      );
    }
  }
  await user.save();

  // Update information or password
  // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Get all users with pagination , sort, search
// [GET] api/v1/users
// privite
exports.getAllUsers = catchAsync(async (req, res) => {
  // A. BUILD QUERY
  let query = User.aggregate().match({});

  // 1. sort
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy;
    const criteria = req.query.asc * 1 || 1;
    query = query.sort({ [sortBy]: criteria });
  }

  // keyword - search
  if (req.query.keyword) {
    const keyword = req.query.keyword;
    query = query.match({
      fullName: new RegExp(keyword, 'i'),
    });
  }

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numUsers = await User.countDocuments();
    if (skip >= numUsers) throw new Error('This page does not exist');
  }

  // EXECUTE QUERY
  const users = await query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

//authorization
exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      throw new Error('you do not have permission to perform this action');
    }
    next();
  };
};

exports.getSavedArticles = catchAsync(async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  const user = await User.findById(id).populate({
    path: 'savedArticles',
    populate: [{ path: 'author' }, { path: 'likedUsers' }],
  });

  if (!user) return next(new AppError('User is not found', 404));

  let savedArticles = user.savedArticles;

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 2;
  const skip = (page - 1) * limit;
  // 0 1 2 3 4 - 5 6 7  8 9
  savedArticles = savedArticles.slice(skip, skip + limit);
  res.status(200).json({
    status: 'success',
    data: {
      result: savedArticles.length,
      savedArticles,
    },
  });
});
