const express = require('express');
const { body } = require('express-validator');
const RecordController = require('../controllers/recordController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation
const recordValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date')
];

// Routes
// Admins and Analysts can view records. Viewers are restricted from this list.
router.get('/', authMiddleware, roleMiddleware(['Admin', 'Analyst']), RecordController.getAll);
router.get('/:id', authMiddleware, roleMiddleware(['Admin', 'Analyst']), RecordController.getById);

// Only Admins can modify records
router.post('/', authMiddleware, roleMiddleware(['Admin']), recordValidation, RecordController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), RecordController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), RecordController.delete);

module.exports = router;
