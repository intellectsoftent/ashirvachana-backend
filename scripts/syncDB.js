// scripts/syncDB.js
// Run: node scripts/syncDB.js
// This creates all tables in your MySQL database

const { sequelize } = require('../models');
require('dotenv').config();

const syncDatabase = async () => {
  try {
    console.log('🔄 Connecting to MySQL...');
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    console.log('🔄 Syncing database schema...');
    // force: true will DROP and recreate tables (use only in dev!)
    // alter: true will modify existing tables to match models
    await sequelize.sync({ alter: true });

    console.log('✅ All tables created/updated successfully!');
    console.log('\nTables created:');
    console.log('  - users');
    console.log('  - poojas');
    console.log('  - idols');
    console.log('  - orders');
    console.log('  - order_items');
    console.log('  - blog_posts');
    console.log('  - testimonials');
    console.log('  - cart_items');
    console.log('\n✨ Database ready! Run: node scripts/seedData.js to add sample data');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    process.exit(1);
  }
};

syncDatabase();
