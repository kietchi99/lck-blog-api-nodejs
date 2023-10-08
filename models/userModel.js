const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  isActived: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have a email !'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  savedArticles: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Article',
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
