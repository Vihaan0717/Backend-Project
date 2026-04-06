const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { uuidParamValidation } = require('../validators/commonValidators');
const { ROLES, USER_STATUSES } = require('../utils/constants');

const router = express.Router();

const createUserValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('status').optional().isIn(Object.values(USER_STATUSES)).withMessage('Invalid status')
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('status').optional().isIn(Object.values(USER_STATUSES)).withMessage('Invalid status')
];

// All user management routes are Admin only
router.get('/', authMiddleware, roleMiddleware(['Admin']), UserController.getAll);
router.post('/', authMiddleware, roleMiddleware(['Admin']), createUserValidation, validateRequest, UserController.create);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), [...uuidParamValidation, ...updateUserValidation], validateRequest, UserController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), uuidParamValidation, validateRequest, UserController.delete);

module.exports = router;
