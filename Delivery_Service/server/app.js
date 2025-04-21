import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import deliveryRoutes from './routes/deliveryRoutes.js';
import { protect } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for Delivery Service'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set global service URLs
global.gConfig = {
  auth_url: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  order_url: process.env.ORDER_SERVICE_URL || 'http://localhost:5002',
  restaurant_url: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003'
};

// Routes
app.use('/api/deliveries', protect, deliveryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Delivery Service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Validate token with auth service
    const response = await axios.get(`${global.gConfig.auth_url}/api/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data && response.data.user) {
      socket.user = response.data.user;
      return next();
    }
    return next(new Error('Authentication failed'));
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`New connection from user ${socket.user.id} (${socket.user.role})`);
  
  // Join user-specific room
  socket.join(`user_${socket.user.id}`);
  
  // Join driver-specific room if user is a driver
  if (socket.user.role === 'delivery') {
    socket.join('drivers_room');
  }

  socket.on('disconnect', () => {
    console.log(`User ${socket.user.id} disconnected`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Delivery Service running on port ${PORT}`);
});