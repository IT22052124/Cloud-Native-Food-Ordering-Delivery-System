const jwt = require('jsonwebtoken');
const axios = require('axios');

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Validate token with auth service
    const response = await axios.get(`${global.gConfig.auth_url}/api/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data && response.data.user) {
      req.user = response.data.user;
      return next();
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };