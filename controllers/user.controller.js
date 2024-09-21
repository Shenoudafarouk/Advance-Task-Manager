const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");
const { Users } = require("../models/user.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const { getCurrentTimestamp } = require("../utils/timeStamps");

const userRegister = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(AppError.create("Username and password are required", 400, httpStatusText.FAIL));
  }

  const oldUser = Users.find(user => user.username.toLowerCase() === username.toLowerCase());

  if (oldUser) {
    return next(AppError.create("User already exists", 400, httpStatusText.FAIL));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Users.length + 1,
    username,
    password: hashedPassword,
    createdAt: getCurrentTimestamp(),
  };

  const token = await generateJWT({ username: newUser.username, id: newUser.id });
  newUser.token = token;
  Users.push(newUser);

  res.status(201).json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});

const userLogin = asyncWrapper(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(AppError.create("Username and password are required", 400, httpStatusText.FAIL));
  }

  const user = Users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return next(AppError.create("User not found", 404, httpStatusText.FAIL));
  }

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (!matchedPassword) {
    return next(AppError.create("Invalid password", 401, httpStatusText.FAIL));
  }

  const token = await generateJWT({ username: user.username, id: user.id });
  res.json({ status: httpStatusText.SUCCESS, data: { token } });
});

module.exports = {
  userRegister,
  userLogin,
};