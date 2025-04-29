const { cleanupOldLocations } = require('../redis/driverLocationService');

setInterval(() => {
  cleanupOldLocations().then(() => {
    console.log('🧹 Cleaned up stale driver locations');
  });
}, 5 * 60 * 1000); // Every 5 minutes
