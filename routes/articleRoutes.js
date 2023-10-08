const express = require('express');
const articleController = require('./../controllers/articleController');

const router = express.Router();

router
  .route('/')
  .post(articleController.createArticle)
  .get(articleController.getAllArticles);

router.route('/:id').get(articleController.getArticle);

module.exports = router;
