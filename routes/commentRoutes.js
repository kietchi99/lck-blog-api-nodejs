const express = require('express');

const commentController = require('./../controllers/commentController');

const router = express.Router();

router
  .route('/')
  .post(commentController.createComment)
  .get(commentController.getAllComments);
router
  .route('/:id')
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

router.route('/articles/:id').get(commentController.getCommentByArticleId);

module.exports = router;
