const mongoose = require('mongoose');
const { Schema, model } = mongoose; 

const liveDriverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  coordinates: {
    type: [Number], // [lng, lat]
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

liveDriverSchema.index({ coordinates: '2dsphere' });

const LiveDriver = model('LiveDriver', liveDriverSchema);

module.exports = LiveDriver;