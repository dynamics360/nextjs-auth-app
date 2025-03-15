const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in cookies or headers
  if (req.cookies.token) {
    console.log('Token found in cookies');
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log('Token found in Authorization header');
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    console.log('No token found');
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    console.log('Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    console.log('Token verified, user id:', decoded.id);

    // Add user to request
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('User not found with id:', decoded.id);
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    console.log('User found:', req.user.email);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
}; 