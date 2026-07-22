const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  next(ApiError.validation(details));
}

module.exports = validate;
