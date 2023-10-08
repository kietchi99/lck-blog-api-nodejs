const mongoose = require('mongoose');
const Comment = require('./../models/commentModel');

// create a comment
exports.createComment = async (req, res) => {
  try {
    const testData = {
      content: 'This article is helpful',
      article: mongoose.Types.ObjectId('65228159eabd324454d2ce6b'),
      user: mongoose.Types.ObjectId('652270e5eabd324454d2ce56'),
      replyTo: mongoose.Types.ObjectId('65227132eabd324454d2ce57'),
      parent: 'null',
    };
    const data = testData || req.body;
    const comment = await Comment.create(data);
    res.status(201).json({
      status: 'success',
      data: {
        comment,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update a comment
// [PATCH]: api/v1/comments/:id
// privite
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        comment,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// delete a comment
// [DELETE]: api/v1/comments/:id
// privite
exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// get all comments
// [GET]: api/v1/comments
// public
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find();

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 1;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numComments = await Comment.countDocuments();
      if (skip >= numComments) throw new Error('This page does not exist');
    }
    res.status(200).json({
      status: 'success',
      data: {
        comments,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
