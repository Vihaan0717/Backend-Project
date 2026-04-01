const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['Viewer', 'Analyst', 'Admin']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

module.exports = router;
