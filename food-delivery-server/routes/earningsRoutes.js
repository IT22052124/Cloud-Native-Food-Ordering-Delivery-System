const express = require('express');
const { getEarningsHistory } = require('../controllers/earningsController');
const { protect, authorize } = require('../middleware/auth');
const { getCurrentEarnings } = require('../controllers/deliveryController');

const router = express.Router();

router.use(protect);
router.get('/history', authorize('delivery'), getEarningsHistory);

// --- Earnings-related
router.get('/current/:id', authorize('delivery'), getCurrentEarnings);

module.exports = router;