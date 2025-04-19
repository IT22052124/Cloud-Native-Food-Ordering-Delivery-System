const jwt = require('jsonwebtoken');
const axios = require('axios');

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

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} not authorized`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };