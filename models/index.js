const sequelize = require('../config/database');
const User = require('./User');
const Pooja = require('./Pooja');
const Idol = require('./Idol');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const BlogPost = require('./BlogPost');
const Testimonial = require('./Testimonial');
const Cart = require('./Cart');
const Location = require('./Location');
const Pujari = require('./Pujari');
const PoojaLocation = require('./PoojaLocation');
const IdolLocation = require('./IdolLocation');

// ─── Associations ─────────────────────────────────────────────────────────────

// User → Orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order → OrderItems
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Order → Pooja
Order.belongsTo(Pooja, { foreignKey: 'pooja_id', as: 'pooja' });
Pooja.hasMany(Order, { foreignKey: 'pooja_id', as: 'bookings' });

// User → Cart
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cart_items', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Pooja <-> Location (many-to-many via pooja_locations)
Pooja.belongsToMany(Location, {
  through: PoojaLocation, foreignKey: 'pooja_id', otherKey: 'location_id', as: 'locations'
});
Location.belongsToMany(Pooja, {
  through: PoojaLocation, foreignKey: 'location_id', otherKey: 'pooja_id', as: 'poojas'
});

// Idol <-> Location (many-to-many via idol_locations)
Idol.belongsToMany(Location, {
  through: IdolLocation, foreignKey: 'idol_id', otherKey: 'location_id', as: 'locations'
});
Location.belongsToMany(Idol, {
  through: IdolLocation, foreignKey: 'location_id', otherKey: 'idol_id', as: 'idols'
});

// Order → Location
Order.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
Location.hasMany(Order, { foreignKey: 'location_id', as: 'orders' });

module.exports = {
  sequelize,
  User,
  Pooja,
  Idol,
  Order,
  OrderItem,
  BlogPost,
  Testimonial,
  Cart,
  Location,
  Pujari,
  PoojaLocation,
  IdolLocation
};
