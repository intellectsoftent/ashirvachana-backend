const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// ─── User Auth Middleware ──────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// ─── Admin Auth Middleware ─────────────────────────────────────────────────────
const adminProtect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin access denied, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not an admin' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Admin token invalid' });
  }
};

module.exports = { protect, adminProtect };
