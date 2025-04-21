const jwt = require('jsonwebtoken');
const axios = require('axios');

/**
 * Microservice-friendly authentication middleware
 * 
 * 1. Validates JWT tokens either:
 *    - Locally using shared secret (fast)
 *    - Via auth service API (more secure)
 * 2. Implements proper role authorization
 * 3. Handles all edge cases
 */

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized' 
    });
  }

  try {
    // Verify token using the SHARED JWT_SECRET
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET // Same as auth-service
    );

    // Optional: Validate token with auth-service (microservice communication)
    const authResponse = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/validate-token`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!authResponse.data.success) {
      throw new Error('Invalid token');
    }

    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token expired or invalid' 
    });
  }
};

/**
 * Role authorization middleware
 * @param {...String} roles - Allowed roles
 */
const authorize = (...roles) => {
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
        message: `Role '${req.user.role}' not authorized for this action`
      });
    }

    // Additional status check if needed
    if (req.user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${req.user.status} - Access denied`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };