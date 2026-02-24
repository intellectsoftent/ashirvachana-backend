const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Idol = sequelize.define('Idol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  deity: {
    type: DataTypes.STRING(100),
    allowNull: true
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
  material: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  height: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  weight: {
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
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  in_stock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 100
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
  }
}, {
  tableName: 'idols'
});

module.exports = Idol;
