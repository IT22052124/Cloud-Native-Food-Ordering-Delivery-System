import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import deliveryRoutes from './routes/deliveryRoutes.js';
import { protect } from './middleware/auth.js';
import { checkHealth } from './middleware/health.js';
import authRoutes from './routes/authRoutes.js'
import Delivery from './models/Delivery.js';
import axios from 'axios';
import { retryDeliveryAssignment } from './controllers/deliveryController.js';

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
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', protect, deliveryRoutes);

// Health check
app.get('/health', async (_req, res) => {
  const health = await checkHealth();
  res.status(200).json(health);
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
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
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
  
  // Join role-specific rooms
  if (socket.user.role === 'delivery') {
    socket.join('drivers_room');
    console.log(`Driver ${socket.user.id} joined drivers room`);
  } else if (socket.user.role === 'restaurant') {
    socket.join('restaurants_room');
  }

  // Driver accepts/rejects delivery assignment
  socket.on('driverResponse', async (data) => {
    try {
      const { deliveryId, accept } = data;
      const delivery = await Delivery.findById(deliveryId);
      
      if (!delivery || delivery.status !== 'PENDING_ASSIGNMENT') {
        return socket.emit('responseError', { message: 'Invalid delivery assignment' });
      }

      // Check if this driver was proposed for this delivery
      const wasProposed = delivery.proposedDrivers.some(
        d => d.driverId.toString() === socket.user.id
      );
      
      if (!wasProposed) {
        return socket.emit('responseError', { message: 'Not authorized to respond' });
      }

      if (accept) {
        // Accept the delivery
        delivery.status = 'DRIVER_ASSIGNED';
        delivery.driver = {
          id: socket.user.id,
          name: socket.user.name,
          phone: socket.user.phone,
          assignedAt: new Date()
        };
        
        await delivery.save();

        // Notify restaurant and customer
        io.to(`user_${delivery.restaurant.id}`).emit('driverAssigned', {
          deliveryId: delivery._id,
          orderId: delivery.orderId,
          driver: delivery.driver
        });
        
        io.to(`user_${delivery.customer.id}`).emit('driverAssigned', {
          deliveryId: delivery._id,
          orderId: delivery.orderId,
          driver: delivery.driver
        });

        socket.emit('responseSuccess', { 
          message: 'Delivery accepted',
          deliveryId: delivery._id
        });

      } else {
        // Reject the delivery
        delivery.proposedDrivers = delivery.proposedDrivers.filter(
          d => d.driverId.toString() !== socket.user.id
        );
        
        await delivery.save();
        
        // Notify restaurant if no more proposed drivers
        if (delivery.proposedDrivers.length === 0) {
          await retryDeliveryAssignment(deliveryId, io, socket.handshake.auth.token);
        }

        socket.emit('responseSuccess', { 
          message: 'Delivery declined',
          deliveryId: delivery._id
        });
      }
    } catch (error) {
      console.error('Driver response error:', error);
      socket.emit('responseError', { message: 'Error processing response' });
    }
  });

  // Real-time location updates from driver
  socket.on('updateLocation', async (data) => {
    try {
      const { deliveryId, lat, lng } = data;
      
      // Validate delivery and driver assignment
      const delivery = await Delivery.findOne({
        _id: deliveryId,
        'driver.id': socket.user.id,
        status: { 
          $in: ['DRIVER_ASSIGNED', 'EN_ROUTE_TO_RESTAURANT', 'PICKED_UP', 'EN_ROUTE_TO_CUSTOMER'] 
        }
      });
      
      if (!delivery) {
        return socket.emit('locationUpdateError', { 
          message: 'Invalid delivery for location update' 
        });
      }

      // Update delivery with new location
      delivery.driver.currentLocation = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      
      delivery.locationHistory = delivery.locationHistory || [];
      delivery.locationHistory.push({
        coordinates: [lng, lat],
        timestamp: new Date()
      });
      
      await delivery.save();

      // Broadcast to customer
      io.to(`user_${delivery.customer.id}`).emit('driverLocationUpdated', {
        deliveryId: delivery._id,
        location: { lat, lng },
        updatedAt: new Date()
      });

      socket.emit('locationUpdateSuccess');
    } catch (error) {
      console.error('Socket location update error:', error);
      socket.emit('locationUpdateError', { message: 'Error updating location' });
    }
  });

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