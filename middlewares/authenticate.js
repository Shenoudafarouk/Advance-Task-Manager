const jwt = require("jsonwebtoken");
const httpStatusText = require("../utils/httpStatusText");
const appError = require("../utils/appError");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return next(
      appError.create("Token is required", 401, httpStatusText.ERROR)
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(
      appError.create("Token is required", 401, httpStatusText.ERROR)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; 
    next();
  } catch (err) {
    return next(
      appError.create("Invalid or expired token", 401, httpStatusText.ERROR)
    );
  }
};

module.exports = authenticate;
