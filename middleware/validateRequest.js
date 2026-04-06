const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors: errors.array().map(({ msg, path, value }) => ({
      field: path,
      message: msg,
      value
    }))
  });
};

module.exports = validateRequest;
