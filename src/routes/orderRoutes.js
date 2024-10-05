// routes/orderRoutes.js
const express = require('express');
const { saveOrder } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.post('/save-order', saveOrder);

module.exports = router;