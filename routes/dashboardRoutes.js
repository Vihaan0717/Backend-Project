const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All roles (Admin, Analyst, Viewer) can access the dashboard summary
router.get('/summary', authMiddleware, DashboardController.getSummary);

// Trends and deeper insights are restricted to Admins and Analysts
router.get('/trends', authMiddleware, roleMiddleware(['Admin', 'Analyst']), DashboardController.getTrends);

module.exports = router;
