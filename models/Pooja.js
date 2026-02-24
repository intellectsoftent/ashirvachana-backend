const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pooja = sequelize.define('Pooja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Protection', 'Shanti', 'Graha', 'Home', 'Festival', 'Health', 'Prosperity', 'Other'),
    defaultValue: 'Other'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  includes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 4.5
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  badge: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  advance_percent: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  }
}, {
  tableName: 'poojas'
});

module.exports = Pooja;
