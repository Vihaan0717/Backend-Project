const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All user management routes are Admin only
router.get('/', authMiddleware, roleMiddleware(['Admin']), UserController.getAll);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), UserController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), UserController.delete);

module.exports = router;
