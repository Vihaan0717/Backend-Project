const express = require('express');
const { query } = require('express-validator');
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { recordFilterValidation } = require('../validators/commonValidators');

const router = express.Router();

const trendValidation = [
  query('granularity').optional().isIn(['monthly', 'weekly']).withMessage('granularity must be monthly or weekly')
];

// All roles (Admin, Analyst, Viewer) can access the dashboard summary
router.get('/summary', authMiddleware, recordFilterValidation, validateRequest, DashboardController.getSummary);

// Trends and deeper insights are restricted to Admins and Analysts
router.get(
  '/trends',
  authMiddleware,
  roleMiddleware(['Admin', 'Analyst']),
  [...recordFilterValidation, ...trendValidation],
  validateRequest,
  DashboardController.getTrends
);

module.exports = router;
