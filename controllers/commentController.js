const mongoose = require('mongoose');
const Comment = require('./../models/commentModel');
const catchAsync = require('../catchAsync');
const AppError = require('../appError');

// create a comment
exports.createComment = catchAsync(async (req, res) => {
  const data = {
    ...req.body,
    article: mongoose.Types.ObjectId(req.body.article),
    user: mongoose.Types.ObjectId(req.body.user),
  };
  const comment = await Comment.create(data);

  res.status(201).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

// Update a comment
// [PATCH]: api/v1/comments/:id
// privite
exports.updateComment = catchAsync(async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!comment)
    return next(new AppError('No a commnet found with that id', 404));
  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

// delete a comment
// [DELETE]: api/v1/comments/:id
// privite
exports.deleteComment = catchAsync(async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);

  if (!comment)
    return next(new AppError('No a commnet found with that id', 404));

  // delete reply commnent
  if (!comment.parent) await Comment.deleteMany({ parent: comment._id });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

// get all comments
// [GET]: api/v1/comments
// public
exports.getAllComments = catchAsync(async (req, res) => {
  const comments = await Comment.find().skip(skip).limit(limit);

  const topComments = comments.filter((comment) => !comment.parent);

  const replyComments = comments.filter((comment) => comment.parent);

  const numComments = await Comment.countDocuments();
  if (skip >= numComments) throw new Error('This page does not exist');

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      topComments,
      replyComments,
    },
  });
});

exports.getCommentByArticleId = catchAsync(async (req, res) => {
  let comments = [];
  if (req.query.page) {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;

    comments = await Comment.find({ article: req.params.id })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'user' })
      .populate({ path: 'article' })
      .populate({ path: 'replyTo' })
      .sort({ createdAt: -1 });
  } else {
    comments = await Comment.find({ article: req.params.id })
      .populate({ path: 'user' })
      .populate({ path: 'article' })
      .populate({ path: 'replyTo' })
      .sort({ createdAt: -1 });
  }

  const topComments = comments.filter((comment) => !comment.parent);

  const replyComments = comments.filter((comment) => comment.parent);

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      topComments,
      replyComments,
    },
  });
});
