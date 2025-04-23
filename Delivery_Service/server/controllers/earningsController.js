import DeliveryEarningsReport from '../models/DeliveryEarningsReport.js';

/**
 * @desc    Get earnings history for current driver
 * @route   GET /api/earnings/history
 * @access  Private/Delivery
 */
export const getEarningsHistory = async (req, res) => {
  try {
    const reports = await DeliveryEarningsReport.find({ driverId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Failed to fetch earnings history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};