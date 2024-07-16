const {
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  fetchAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  Promise.all([
    fetchArticleById(article_id),
    fetchCommentsByArticleId(article_id),
  ])
    .then(([article, comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
