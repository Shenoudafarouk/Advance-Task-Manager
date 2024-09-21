const { check } = require("express-validator");
const validationMiddleware = require("../../middlewares/validationMiddleware");

exports.createTaskValidator = [
  check("title")
    .notEmpty()
    .withMessage("Please fill in the title field")
    .isLength({ min: 3 })
    .withMessage("title needs to be 3 char at least")
    .isLength({ max: 32 })
    .withMessage("title needs to be 32 char maximum"),
  validationMiddleware,

  check("description")
    .notEmpty()
    .withMessage("Please fill in the description field")
    .isLength({ min: 10 })
    .withMessage("description needs to be 10 char at least")
    .isLength({ max: 255 })
    .withMessage("description needs to be 255 char maximum"),
  validationMiddleware,

  check("assignedTo")
    .notEmpty()
    .withMessage("Please fill in the assignedTo field"),
];

exports.updateTaskValidator = [
  check("title")
    .notEmpty()
    .withMessage("Please fill in the title field")
    .isLength({ min: 3 })
    .withMessage("title needs to be 3 char at least")
    .isLength({ max: 32 })
    .withMessage("title needs to be 32 char maximum"),
  check("description")
    .notEmpty()
    .withMessage("Please fill in the description field")
    .isLength({ min: 10 })
    .withMessage("description needs to be 10 char at least")
    .isLength({ max: 255 })
    .withMessage("description needs to be 255 char maximum"),
  validationMiddleware,

  check("assignedTo")
    .notEmpty()
    .withMessage("Please fill in the assignedTo field"),
  validationMiddleware,
];
