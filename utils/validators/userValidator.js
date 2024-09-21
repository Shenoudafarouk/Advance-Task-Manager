const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validationMiddleware");

exports.registerationValidator = [
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 4, max: 20 })
    .withMessage("Username must be between 4 and 20 characters long"),
  validationMiddleware,

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 8 and 20 characters long"),
  validationMiddleware,
];
