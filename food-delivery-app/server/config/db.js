const mongoose = require('mongoose');

const connectDBs = async () => {
  try {
    await mongoose.createConnection(process.env.AUTH_MONGO_DB_URI, {
      dbName: 'food-delivery-auth',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to Auth DB');

    await mongoose.createConnection(process.env.ORDER_MONGO_DB_URI, {
      dbName: 'food-delivery-order',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to Order DB');

    await mongoose.connect(process.env.DELIVERY_MONGO_DB_URI, {
      dbName: 'food-delivery-delivery',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to Delivery DB');

    await mongoose.connect(process.env.RESTAURANT_MONGO_DB_URI, {
      dbName: 'food-delivery-restaurant',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to Restaurant DB');
  } catch (err) {
    console.error('❌ Error connecting to DBs:', err);
    process.exit(1);
  }
};

module.exports = connectDBs;
