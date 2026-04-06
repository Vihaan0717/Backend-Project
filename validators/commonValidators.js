const { query, param } = require('express-validator');
const { RECORD_TYPES } = require('../utils/constants');

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
];

const recordFilterValidation = [
  query('type').optional().isIn(Object.values(RECORD_TYPES)).withMessage('type must be income or expense'),
  query('category').optional().isString().trim().notEmpty().withMessage('category must be a non-empty string'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO8601 date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO8601 date'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('minAmount must be a non-negative number'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('maxAmount must be a non-negative number')
];

const uuidParamValidation = [
  param('id').isUUID().withMessage('id must be a valid UUID')
];

module.exports = {
  paginationValidation,
  recordFilterValidation,
  uuidParamValidation
};
