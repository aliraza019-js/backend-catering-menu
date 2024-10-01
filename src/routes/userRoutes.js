const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

router.get('/', authenticate, authorize([ROLES.ADMIN]), userController.getAllUsers);
router.get('/:id', authenticate, authorize([ROLES.ADMIN]), userController.getUserById);

module.exports = router;