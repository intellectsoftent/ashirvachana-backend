const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Junction table: which poojas are available in which locations
const PoojaLocation = sequelize.define('PoojaLocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pooja_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'pooja_locations',
  indexes: [{ unique: true, fields: ['pooja_id', 'location_id'] }]
});

module.exports = PoojaLocation;
