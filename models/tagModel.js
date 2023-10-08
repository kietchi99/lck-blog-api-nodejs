const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'A tag must have a label !'],
    unique: true,
  },
  url: {
    type: String,
    required: [true, 'A tag must have a url!'],
    trim: true,
    unique: true,
  },
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
