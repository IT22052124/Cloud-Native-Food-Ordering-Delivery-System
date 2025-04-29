// controllers/liveDriverController.js

const LiveDriver = require('../models/LiveDriver');

exports.saveOrUpdate = async (req, res) => {
  try {
    const { driverId, coordinates, name, phone } = req.body;

    const updated = await LiveDriver.findOneAndUpdate(
      { driverId },
      { coordinates, name, phone, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Live location save failed' });
  }
};

exports.remove = async (req, res) => {
  try {
    await LiveDriver.findOneAndDelete({ driverId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove live driver' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const drivers = await LiveDriver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch live drivers' });
  }
};
