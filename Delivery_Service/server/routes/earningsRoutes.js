const express = require('express');
const { getEarningsHistory } = require('../controllers/earningsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/history', authorize('delivery'), getEarningsHistory);

module.exports = router;