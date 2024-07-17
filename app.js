const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const { getApi } = require("./controllers/api.controller");
const {
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postComment,
  patchArticleVotes,
} = require("./controllers/articles.controller");
const { deleteComment } = require("./controllers/comments.controller");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getApi);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteComment);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Path Not Found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "22003") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
