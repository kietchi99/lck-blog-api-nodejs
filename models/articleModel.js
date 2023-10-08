const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: [true, 'A article must have a title'],
  },
  content: String,
  isPublic: {
    type: Boolean,
    default: true,
  },
  imageCover: {
    type: String,
    //required: [true, 'A article must have a cover image'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  numLikes: {
    type: Number,
    default: 0,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Article must belong to a author.'],
  },
  likedUsers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
  ],
  tags: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tag',
    },
  ],
  // images: [String]
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
