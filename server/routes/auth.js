const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  checkUserExists,
  directResetPassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// New routes for direct password reset
router.post('/check-user', checkUserExists);
router.post('/direct-reset-password', directResetPassword);

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Auth API is working!' });
});

module.exports = router; 