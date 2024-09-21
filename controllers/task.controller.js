const { Tasks, taskSchema } = require("../models/task.model");

const asyncWrapper = require("../middlewares/asyncWrapper");

const AppError = require("../utils/appError");

const { Users } = require("../models/user.model");

const httpStatusText = require("../utils/httpStatusText");

const { getCurrentTimestamp } = require("../utils/timeStamps");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const VALID_PRIORITIES = ["high", "medium", "low"];
const VALID_SORT_FIELDS = ["createdat", "title"];

const validatePriority = (priority) => {
  if (!VALID_PRIORITIES.includes(priority.toLowerCase())) {
    throw AppError.create("Invalid priority filter", 400, httpStatusText.FAIL);
  }
  return priority.toLowerCase();
};

const validateSortField = (sortField) => {
  if (!VALID_SORT_FIELDS.includes(sortField.toLowerCase())) {
    throw AppError.create("Invalid sort field", 400, httpStatusText.FAIL);
  }
  return sortField.toLowerCase();
};

const filterByPriority = (tasks, priority) =>
  tasks.filter((task) => task.priority === priority);

const filterBySearch = (tasks, searchTerm) =>
  tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) ||
      task.assignedTo.toLowerCase() === searchTerm
  );

const sortTasks = (tasks, sortField, order) => {
  const sortOrder = order === "desc" ? -1 : 1;
  if (sortField === "createdat") {
    return tasks.sort(
      (a, b) => sortOrder * (new Date(a.createdAt) - new Date(b.createdAt))
    );
  }
  if (sortField === "title") {
    return tasks.sort((a, b) => sortOrder * a.title.localeCompare(b.title));
  }
};

const paginateTasks = (tasks, skip, limit) => tasks.slice(skip, skip + limit);

const getTasks = asyncWrapper(async (req, res, next) => {
  const { query } = req;

  const page = parseInt(query.page, 10) || DEFAULT_PAGE;
  const limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  try {
    let tasksToReturn = Tasks;

    if (query.priority) {
      tasksToReturn = filterByPriority(
        tasksToReturn,
        validatePriority(query.priority)
      );
    }

    if (query.search) {
      tasksToReturn = filterBySearch(tasksToReturn, query.search.toLowerCase());
    }

    if (query.sort) {
      tasksToReturn = sortTasks(
        tasksToReturn,
        validateSortField(query.sort),
        query.order
      );
    }

    const paginatedTasks = paginateTasks(tasksToReturn, skip, limit);

    res.json({
      status: httpStatusText.SUCCESS,
      page,
      data: {
        tasks: paginatedTasks,
        total: tasksToReturn.length,
        totalPages: Math.ceil(tasksToReturn.length / limit),
        hasMore: skip + limit < tasksToReturn.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

const getUserTasks = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { query } = req;

  const page = parseInt(query.page, 10) || DEFAULT_PAGE;
  const limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const userExists = Users.some((user) => user.id.toString() === id.toString());
  if (!userExists) {
    return next(AppError.create("User not found", 404, httpStatusText.FAIL));
  }

  console.log(`id: ${id}`);
  console.log(`query: ${JSON.stringify(query)}`);


  let userTasks = Tasks.filter((task) => task.assignedTo.toString() === id.toString());

  if (query.priority) {
    userTasks = filterByPriority(userTasks, validatePriority(query.priority));
  }

  if (query.search) {
    userTasks = filterBySearch(userTasks, query.search.toLowerCase());
  }

  if (query.sort) {
    userTasks = sortTasks(userTasks, validateSortField(query.sort), query.order);
  }

  const paginatedTasks = paginateTasks(userTasks, skip, limit);

  res.json({
    status: httpStatusText.SUCCESS,
    page,
    data: {
      tasks: paginatedTasks,
      total: userTasks.length,
      totalPages: Math.ceil(userTasks.length / limit),
      hasMore: skip + limit < userTasks.length,
    },
  });
});

const getTaskById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const task = Tasks.find((t) => t.id === parseInt(id, 10));
  if (!task) {
    const error = AppError.create("Task not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  if (task.assignedTo.toString() !== userId.toString()) {
    return next(AppError.create("Access denied", 403, httpStatusText.FAIL));
  }
  res.status(200).json({ status: httpStatusText.SUCCESS, data: task });
});

const createTask = asyncWrapper(async (req, res, next) => {
  const isValidTask = (task) => {
    const validKeys = Object.keys(taskSchema);
    return Object.keys(task).every((key) => validKeys.includes(key));
  };

  if (!isValidTask(req.body)) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Invalid task properties provided.",
    });
  }

  const newTask = {
    id: Tasks.length + 1,
    ...req.body,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
  Tasks.push(newTask);
  res.status(201).json({ status: httpStatusText.SUCCESS, data: newTask });
});

const findTaskById = (id) => Tasks.find((t) => t.id === parseInt(id, 10));

const isUserAuthorized = (task, userId) =>
  task.assignedTo.toString() === userId.toString();

const isValidTask = (task) => {
  const validKeys = Object.keys(taskSchema);
  return Object.keys(task).every((key) => validKeys.includes(key));
};

const updateTask = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { assignedTo } = req.body;

  const foundTask = findTaskById(id);
  if (!foundTask) {
    return next(AppError.create("Task not found", 404, httpStatusText.FAIL));
  }

  if (assignedTo) {
    const userExists = Users.some(
      (user) => user.id.toString() === assignedTo.toString()
    );
    if (!userExists) {
      return next(
        AppError.create("Invalid assignedTo user ID", 400, httpStatusText.FAIL)
      );
    }
  }

  if (!isUserAuthorized(foundTask, userId)) {
    return next(AppError.create("Access denied", 403, httpStatusText.FAIL));
  }

  if (!isValidTask(req.body)) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Invalid task properties provided.",
    });
  }

  const updatedTask = {
    ...foundTask,
    ...req.body,
    updatedAt: getCurrentTimestamp(),
  };
  Tasks[Tasks.indexOf(foundTask)] = updatedTask;

  res.status(200).json({ status: httpStatusText.SUCCESS, data: updatedTask });
});

const deleteTask = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const foundTask = findTaskById(id);
  if (!foundTask) {
    return next(AppError.create("Task not found", 404, httpStatusText.FAIL));
  }

  if (!isUserAuthorized(foundTask, userId)) {
    return next(AppError.create("Access denied", 403, httpStatusText.FAIL));
  }

  const deletedTask = Tasks.splice(Tasks.indexOf(foundTask), 1)[0];
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: deletedTask,
  });
});

module.exports = {
  getTasks,
  getUserTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
