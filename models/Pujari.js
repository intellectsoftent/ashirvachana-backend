const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pujari = sequelize.define('Pujari', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  experience: {
    type: DataTypes.STRING(50),
    allowNull: true   // e.g. "10+ years", "25+ years"
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 5.0
  },
  specializations: {
    type: DataTypes.JSON,
    defaultValue: []  // ["Homam", "Protection Rituals"]
  },
  // Array of location IDs this pujari serves
  service_location_ids: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pujaris'
});

module.exports = Pujari;
