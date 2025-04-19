const express = require('express');
const {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  validateToken
} = require('../controllers/authController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.post('/register', register); // Handles delivery registration only
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/validate-token', validateToken); // For internal service use
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);

module.exports = router;