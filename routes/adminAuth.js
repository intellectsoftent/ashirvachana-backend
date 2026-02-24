const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { adminProtect } = require('../middleware/auth');
require('dotenv').config();

const generateAdminToken = () => {
  return jwt.sign({ role: 'admin', id: 'admin' }, process.env.ADMIN_JWT_SECRET, { expiresIn: '24h' });
};

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const isMatch = password === process.env.ADMIN_PASSWORD;
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin password' });
    }

    const token = generateAdminToken();

    res.json({
      success: true,
      message: 'Admin login successful',
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/verify
router.get('/verify', adminProtect, (req, res) => {
  res.json({ success: true, message: 'Admin token valid' });
});

module.exports = router;
