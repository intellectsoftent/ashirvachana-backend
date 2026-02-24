const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Junction table: which idols are available in which locations
const IdolLocation = sequelize.define('IdolLocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idol_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'idol_locations',
  indexes: [{ unique: true, fields: ['idol_id', 'location_id'] }]
});

module.exports = IdolLocation;
