const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 1, max: 5 }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'testimonials'
});

module.exports = Testimonial;
