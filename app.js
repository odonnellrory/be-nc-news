const express = require("express");
const apiRouter = require("./routes/api.router");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Path Not Found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "22003" || err.code === "23502") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
