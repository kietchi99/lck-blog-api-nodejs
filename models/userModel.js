const mongoose = require('mongoose');
const validator = require('validator');

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
    unique: true,
    required: [true, 'A user must have a email !'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  name: {
    type: String,
    required: [true, 'A user must have a name !'],
  },
  savedArticles: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Article',
    },
  ],
  avatar: {
    type: String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
