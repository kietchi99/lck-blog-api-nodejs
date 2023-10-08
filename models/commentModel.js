const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'A comment must have a content !'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  article: {
    type: mongoose.Schema.ObjectId,
    ref: 'Article',
    required: [true, 'Comment must belong to a article.'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Comment must belong to a user.'],
  },
  replyTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  parent: this,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
