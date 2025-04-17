require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDBs = require('./config/db');

const devAuthRoutes = require('./routes/dev-auth.route');
const deliveryRoutes = require('./routes/delivery.routes')

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Connect to DBs
connectDBs();

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Food Delivery API - Delivery Service Running!');
});

app.use('/api/deliveries', deliveryRoutes);
app.use('/api/dev-auth', devAuthRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
