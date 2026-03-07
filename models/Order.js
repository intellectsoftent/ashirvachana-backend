const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true  // null for guest orders (e.g. pooja without login)
  },
  order_type: {
    type: DataTypes.ENUM('pooja', 'idol', 'mixed'),
    allowNull: false,
    defaultValue: 'idol'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  // Pooja specific fields
  pooja_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pooja_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  pooja_time: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  priest_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Address
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  // Pricing
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  shipping_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  advance_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  pending_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  // Payment
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'refunded'),
    defaultValue: 'unpaid'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  razorpay_order_id: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  razorpay_payment_id: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  razorpay_signature: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Contact
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  customer_email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'orders'
});

module.exports = Order;
