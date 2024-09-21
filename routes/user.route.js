const express = require("express");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

const userConroller = require("../controllers/user.controller");
const taskController = require("../controllers/task.controller");

router.route("/register").post(userConroller.userRegister);

router.route("/login").post(userConroller.userLogin);

router.route('/:id/tasks').get(authenticate, taskController.getUserTasks);

module.exports = router;
