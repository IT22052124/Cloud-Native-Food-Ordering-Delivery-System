const { axios } = require('axios');
const { mongoose } = require('mongoose');

const checkHealth = async () => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  // Check dependent services
  let authServiceStatus = 'unreachable';
  try {
    await axios.get(`${global.gConfig.auth_url}/health`);
    authServiceStatus = 'ok';
  } catch (e) {
    console.error('Auth service health check failed:', e.message);
  }

  return {
    status: 'ok',
    service: 'Delivery Service',
    database: dbStatus,
    dependencies: {
      auth_service: authServiceStatus,
      order_service: 'not_checked' // Can implement similar check
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
};