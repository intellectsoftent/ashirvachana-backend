const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  item_type: {
    type: DataTypes.ENUM('pooja', 'idol'),
    allowNull: false
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  item_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  item_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items'
});

module.exports = OrderItem;
