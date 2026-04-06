const express = require('express');
const { body } = require('express-validator');
const RecordController = require('../controllers/recordController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { paginationValidation, recordFilterValidation, uuidParamValidation } = require('../validators/commonValidators');

const router = express.Router();

// Validation
const recordValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be at most 1000 characters'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date')
];

const recordUpdateValidation = [
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be at most 1000 characters'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date')
];

// Routes
// Admins and Analysts can view records. Viewers are restricted from this list.
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Admin', 'Analyst']),
  [...recordFilterValidation, ...paginationValidation],
  validateRequest,
  RecordController.getAll
);
router.get('/:id', authMiddleware, roleMiddleware(['Admin', 'Analyst']), uuidParamValidation, validateRequest, RecordController.getById);

// Only Admins can modify records
router.post('/', authMiddleware, roleMiddleware(['Admin']), recordValidation, validateRequest, RecordController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), [...uuidParamValidation, ...recordUpdateValidation], validateRequest, RecordController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), uuidParamValidation, validateRequest, RecordController.delete);

module.exports = router;
