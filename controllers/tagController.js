const Tag = require('./../models/tagModel');
// Get all tags
// [GET]: api/v1/tags
// public
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json({
      status: 'success',
      results: tags.length,
      data: {
        tags,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
