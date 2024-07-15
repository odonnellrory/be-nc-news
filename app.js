const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const { getApi } = require("./controllers/api.controller");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getApi);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Path Not Found" });
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
