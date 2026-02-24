const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
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
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: { min: 1 }
  },
  // Snapshot of price at time of add
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'cart_items'
});

module.exports = Cart;
