const articlesRouter = require("express").Router();
const {
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postComment,
  patchArticleVotes,
  postArticle,
} = require("../controllers/articles.controller");

articlesRouter.route("/").get(getAllArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = articlesRouter;
