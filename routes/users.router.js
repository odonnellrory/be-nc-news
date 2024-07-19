const usersRouter = require("express").Router();
const {
  getAllUsers,
  getUserByUsername,
} = require("../controllers/users.controller");

usersRouter.route("/").get(getAllUsers);
usersRouter.route("/:username").get(getUserByUsername);

module.exports = usersRouter;
