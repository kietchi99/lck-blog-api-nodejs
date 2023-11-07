const express = require('express');
const userController = require('./../controllers/userController');

const router = express.Router();

router
  .route('/:id')
  .patch(userController.updateUser)
  .get(userController.getUser);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id/articles').get(userController.getSavedArticles);

module.exports = router;
