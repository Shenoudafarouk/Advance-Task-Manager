const express = require("express");

const authenticate = require("../middlewares/authenticate");

const router = express.Router({});

const {
  createTaskValidator,
  updateTaskValidator,
} = require("../utils/validators/taskValidator");

const taskController = require("../controllers/task.controller");

router.use(authenticate);

router
  .route("/")
  .get(authenticate, taskController.getTasks)
  .post(authenticate, createTaskValidator, taskController.createTask);

router
  .route("/:id")
  .get(authenticate, taskController.getTaskById)
  .put(authenticate, updateTaskValidator, taskController.updateTask)
  .delete(authenticate, taskController.deleteTask);

module.exports = router;
