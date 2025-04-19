/*import Delivery from '../models/Delivery.js';

export const toggleAvailability = async (req, res) => {
  try {
    const driver = await Delivery.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { isAvailable: !req.body.isAvailable } },
      { new: true }
    );
    res.json({ success: true, isAvailable: driver.isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling availability' });
  }
};

export const getAssignedOrders = async (req, res) => {
  // Fetch orders assigned to this driver
  const orders = await Order.find({ driverId: req.user.id });
  res.json({ success: true, orders });
};*/