// services/cron/generateMonthlyEarnings.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Delivery, DeliveryEarningsReport } from '../../models/Delivery.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const generateMonthlyReports = async () => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  try {
    // Find all delivered and unrecorded deliveries
    const deliveries = await Delivery.find({
      status: 'DELIVERED',
      earningsRecorded: false,
    });

    const grouped = {};

    deliveries.forEach((d) => {
      const driverId = d.driver.id;
      if (!grouped[driverId]) grouped[driverId] = [];
      grouped[driverId].push(d);
    });

    for (const [driverId, driverDeliveries] of Object.entries(grouped)) {
      const total = driverDeliveries.reduce((sum, d) => sum + (d.earningsAmount || 0), 0);

      const report = await DeliveryEarningsReport.create({
        driverId,
        year,
        month,
        total,
        deliveries: driverDeliveries.map((d) => d._id),
      });

      await Delivery.updateMany(
        { _id: { $in: driverDeliveries.map((d) => d._id) } },
        { $set: { earningsRecorded: true } }
      );

      console.log(`Generated report for ${driverId}: ${report.total}`);
    }

    console.log('Monthly earnings report generation completed.');
    process.exit(0);
  } catch (error) {
    console.error('Report generation failed:', error);
    process.exit(1);
  }
};

generateMonthlyReports();
