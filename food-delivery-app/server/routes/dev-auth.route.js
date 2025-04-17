const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

// 🔐 ENV vars
const USER_DB_URI = process.env.AUTH_MONGO_DB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// 🧠 Define schema and model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  status: String,
});

let User;
let isConnected = false;

// 🔌 Connect to user DB only once
const connectToUserDB = async () => {
  if (!isConnected) {
    const userDB = await mongoose.createConnection(USER_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    User = userDB.model('User', userSchema, 'users');
    isConnected = true;
  }
};

// 🧾 Token generator
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

// 🚪 POST /dev-login
router.post('/dev-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    await connectToUserDB();

    const user = await User.findOne({ email });

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or inactive user',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }

    const tokens = generateTokens(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    });
  } catch (err) {
    console.error('Dev login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message || 'Server error',
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    await connectToUserDB();
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
