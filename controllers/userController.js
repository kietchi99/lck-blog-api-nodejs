const User = require('./../models/userModel');

// Get a user
// [GET]: api/v1/users/:id
// privite
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'savedArticles',
      populate: [{ path: 'author' }, { path: 'likedUsers' }, { path: 'tags' }],
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update a user
// [PATCH]: api/v1/users/:id
// privite
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// Get all users with pagination , sort, search
// [GET] api/v1/users
// privite
exports.getAllUsers = async (req, res) => {
  try {
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
    const limit = req.query.limit * 1 || 1;
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

//authorization
exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      throw new Error('you do not have permission to perform this action');
    }
    next();
  };
};
