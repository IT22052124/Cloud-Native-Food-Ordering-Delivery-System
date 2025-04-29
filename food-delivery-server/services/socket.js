const { Server } = require('socket.io');
const axios = require('axios');
const { Delivery } = require('../models/Delivery');
const LiveDriver = require('../models/LiveDriver'); // Live driver model
// const { retryDeliveryAssignment } = require('../controllers/deliveryController'); // ⛔ Commented for future use

/**
 * Setup Socket.IO for real-time delivery updates
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} - Socket.IO server
 */
function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token provided'));

      const response = await axios.get(`${global.gConfig.auth_url}/api/auth/validate-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.user) {
        socket.user = response.data.user;
        console.log('✅ Socket auth success for user:', socket.user.id);
        return next();
      }

      next(new Error('Authentication failed'));
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Handle new connection
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 User connected: ${user.id} (${user.role})`);

    // Join user-specific room
    socket.join(`user_${user.id}`);

    if (user.role === 'delivery') {
      socket.join('drivers_room');
    }

    /**
     * ⛔ Future accept/reject logic is commented for now
     */
    /*
    socket.on('driverResponse', async ({ deliveryId, accept }) => {
      try {
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery || delivery.status !== 'PENDING_ASSIGNMENT') {
          return socket.emit('responseError', { message: 'Invalid delivery' });
        }

        const proposed = delivery.proposedDrivers.some(
          d => d.driverId.toString() === user.id
        );
        if (!proposed) {
          return socket.emit('responseError', { message: 'Not authorized' });
        }

        const io = socket.nsp;

        if (accept) {
          delivery.status = 'DRIVER_ASSIGNED';
          delivery.driver = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            assignedAt: new Date(),
          };
          await delivery.save();

          io.to(`user_${delivery.restaurant.id}`).emit('driverAssigned', {
            deliveryId: delivery._id,
            orderId: delivery.orderId,
            driver: delivery.driver,
          });

          io.to(`user_${delivery.customer.id}`).emit('driverAssigned', {
            deliveryId: delivery._id,
            orderId: delivery.orderId,
            driver: delivery.driver,
          });

          socket.emit('responseSuccess', { message: 'Delivery accepted' });
        } else {
          delivery.proposedDrivers = delivery.proposedDrivers.filter(
            d => d.driverId.toString() !== user.id
          );
          await delivery.save();

          if (delivery.proposedDrivers.length === 0) {
            await retryDeliveryAssignment(deliveryId, io, socket.handshake.auth.token);
          }

          socket.emit('responseSuccess', { message: 'Delivery declined' });
        }
      } catch (err) {
        console.error('Driver response error:', err);
        socket.emit('responseError', { message: 'Processing error' });
      }
    });
    */

    socket.on('driverAvailableToggle', async ({ isAvailable, location }) => {
      try {
        if (isAvailable) {
          if (!location?.coordinates) {
            return socket.emit('toggleError', { message: 'Location required to go online' });
          }
    
          await LiveDriver.findOneAndUpdate(
            { driverId: user.id },
            {
              driverId: user.id,
              name: user.name,
              phone: user.phone,
              isAvailable: true,
              location
            },
            { upsert: true }
          );
    
        } else {
          await LiveDriver.deleteOne({ driverId: user.id });
        }
    
        socket.emit('toggleSuccess', { isAvailable });
      } catch (err) {
        console.error('Toggle availability socket error:', err.message);
        socket.emit('toggleError', { message: 'Could not update availability' });
      }
    });

    socket.on('goOnline', async ({ lat, lng }) => {
      try {
        if (!lat || !lng) {
          return socket.emit('availabilityError', { message: 'Location required' });
        }
    
        const response = await axios.put(`${global.gConfig.auth_url}/api/users/me/availability/toggle`, {}, {
          headers: { Authorization: `Bearer ${socket.handshake.auth.token}` }
        });
    
        // Save/update live driver location
        await LiveDriver.findOneAndUpdate(
          { driverId: socket.user.id },
          {
            driverId: socket.user.id,
            name: socket.user.name,
            phone: socket.user.phone,
            coordinates: [lng, lat],
            isAvailable: true
          },
          { upsert: true }
        );
    
        socket.emit('availabilityUpdated', { isAvailable: true });
      } catch (err) {
        console.error('Go online error:', err);
        socket.emit('availabilityError', { message: 'Failed to go online' });
      }
    });

    socket.on('goOffline', async () => {
      try {
        await axios.put(`${global.gConfig.auth_url}/api/users/me/availability/toggle`, {}, {
          headers: { Authorization: `Bearer ${socket.handshake.auth.token}` }
        });
    
        await axios.delete(`${process.env.DELIVERY_SERVICE_URL || 'http://localhost:5004'}/api/live-drivers/${socket.user.id}`, {
          headers: { Authorization: `Bearer ${socket.handshake.auth.token}` }
        });
        socket.emit('availabilityUpdated', { isAvailable: false });
      } catch (err) {
        console.error('Go offline error:', err);
        socket.emit('availabilityError', { message: 'Failed to go offline' });
      }
    });
    
    

    // ✅ NEW: Delivery directly assigned to driver
    socket.on('deliveryAssignedDirect', (data) => {
      console.log(`📦 New delivery assigned to driver ${user.id}`, data);
      // Frontend should display popup with this data
    });

    // Driver sends live location for active delivery
    socket.on('updateLocation', async ({ deliveryId, lat, lng }) => {
      try {
        const delivery = await Delivery.findOne({
          _id: deliveryId,
          'driver.id': user.id,
          status: { $in: ['DRIVER_ASSIGNED', 'EN_ROUTE_TO_RESTAURANT', 'PICKED_UP', 'EN_ROUTE_TO_CUSTOMER'] },
        });

        if (!delivery) {
          return socket.emit('locationUpdateError', { message: 'Invalid delivery' });
        }

        delivery.driver.currentLocation = {
          type: 'Point',
          coordinates: [lng, lat],
        };

        delivery.locationHistory = delivery.locationHistory || [];
        delivery.locationHistory.push({
          coordinates: [lng, lat],
          timestamp: new Date(),
        });

        await delivery.save();

        io.to(`user_${delivery.customer.id}`).emit('driverLocationUpdated', {
          deliveryId,
          location: { lat, lng },
          updatedAt: new Date(),
        });

        socket.emit('locationUpdateSuccess');
      } catch (err) {
        console.error('Location update error:', err);
        socket.emit('locationUpdateError', { message: 'Failed to update location' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected: ${user.id}`);
    });
  });

  return { io };
}

module.exports = { setupSocket };
