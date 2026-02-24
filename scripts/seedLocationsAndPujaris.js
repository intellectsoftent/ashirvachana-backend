// scripts/seedLocationsAndPujaris.js
// Run: node scripts/seedLocationsAndPujaris.js

const { sequelize, Location, Pujari, Pooja, Idol, PoojaLocation, IdolLocation } = require('../models');
require('dotenv').config();

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected\n');

    // ─── SYNC NEW TABLES ────────────────────────────────────────────────────
    console.log('🔄 Syncing new tables...');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced\n');

    // ─── LOCATIONS ──────────────────────────────────────────────────────────
    console.log('📍 Seeding 24 Locations...');
    const locationData = [
      { name: 'New Delhi', state: 'Delhi' },
      { name: 'Mumbai', state: 'Maharashtra' },
      { name: 'Chennai', state: 'Tamil Nadu' },
      { name: 'Bangalore', state: 'Karnataka' },
      { name: 'Hyderabad', state: 'Telangana' },
      { name: 'Kolkata', state: 'West Bengal' },
      { name: 'Ahmedabad', state: 'Gujarat' },
      { name: 'Pune', state: 'Maharashtra' },
      { name: 'Jaipur', state: 'Rajasthan' },
      { name: 'Lucknow', state: 'Uttar Pradesh' },
      { name: 'Bhopal', state: 'Madhya Pradesh' },
      { name: 'Chandigarh', state: 'Punjab/Haryana' },
      { name: 'Thiruvananthapuram', state: 'Kerala' },
      { name: 'Patna', state: 'Bihar' },
      { name: 'Bhubaneswar', state: 'Odisha' },
      { name: 'Dehradun', state: 'Uttarakhand' },
      { name: 'Guwahati', state: 'Assam' },
      { name: 'Ranchi', state: 'Jharkhand' },
      { name: 'Raipur', state: 'Chhattisgarh' },
      { name: 'Shimla', state: 'Himachal Pradesh' },
      { name: 'Panaji', state: 'Goa' },
      { name: 'Gandhinagar', state: 'Gujarat' },
      { name: 'Dispur', state: 'Assam' },
      { name: 'Srinagar', state: 'Jammu & Kashmir' }
    ];

    await Location.bulkCreate(locationData, { ignoreDuplicates: true });
    console.log('✅ 24 Locations seeded\n');

    // ─── PUJARIS ────────────────────────────────────────────────────────────
    console.log('🙏 Seeding Pujaris...');

    // Get location IDs by name
    const locations = await Location.findAll({ attributes: ['id', 'name'] });
    const locMap = {};
    locations.forEach(l => { locMap[l.name] = l.id; });

    await Pujari.bulkCreate([
      {
        full_name: 'Pandit Raghunath Sharma',
        phone: '+91 98765 43210',
        experience: '25+ years',
        rating: 4.9,
        specializations: ['Homam', 'Protection Rituals', 'Aghora Pasupatha'],
        service_location_ids: [locMap['New Delhi'], locMap['Mumbai']].filter(Boolean),
        is_available: true,
        bio: 'A highly experienced Vedic priest specializing in powerful Homam rituals and protection ceremonies.'
      },
      {
        full_name: 'Pandit Vishwanath Dikshit',
        phone: '+91 87654 32109',
        experience: '30+ years',
        rating: 4.8,
        specializations: ['Shanti Pooja', 'Devi Homam', 'Pratyangira'],
        service_location_ids: [locMap['New Delhi'], locMap['Bangalore']].filter(Boolean),
        is_available: true,
        bio: 'Senior Vedic scholar with expertise in Devi worship and Shanti rituals.'
      },
      {
        full_name: 'Pandit Keshav Joshi',
        phone: '+91 76543 21098',
        experience: '20+ years',
        rating: 4.7,
        specializations: ['Graha Shanti', 'Navagraha Pooja', 'Vastu Pooja'],
        service_location_ids: [locMap['Chennai'], locMap['Hyderabad']].filter(Boolean),
        is_available: true,
        bio: 'Specialized in planetary remedies, Vastu corrections, and Navagraha pacification rituals.'
      },
      {
        full_name: 'Pandit Suresh Iyer',
        phone: '+91 65432 10987',
        experience: '15+ years',
        rating: 4.6,
        specializations: ['Ganesh Pooja', 'Festival Rituals', 'Satyanarayan Katha'],
        service_location_ids: [locMap['Chennai'], locMap['Bangalore'], locMap['Mumbai']].filter(Boolean),
        is_available: true,
        bio: 'Expert in South Indian Vedic traditions and festival pooja ceremonies.'
      },
      {
        full_name: 'Pandit Ramesh Tiwari',
        phone: '+91 54321 09876',
        experience: '18+ years',
        rating: 4.5,
        specializations: ['Vastu Shanti', 'Griha Pravesh', 'Marriage Rituals'],
        service_location_ids: [locMap['Lucknow'], locMap['Jaipur'], locMap['Bhopal']].filter(Boolean),
        is_available: false,
        bio: 'Renowned for home blessing ceremonies, Vastu corrections and auspicious occasion rituals.'
      }
    ], { ignoreDuplicates: true });
    console.log('✅ 5 Pujaris seeded\n');

    // ─── ASSIGN POOJAS TO MAJOR CITIES ──────────────────────────────────────
    console.log('🗺️  Assigning Poojas to major cities...');
    const allPoojas = await Pooja.findAll({ attributes: ['id'] });
    const majorCities = ['New Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune'];

    for (const cityName of majorCities) {
      const loc = locations.find(l => l.name === cityName);
      if (!loc) continue;
      const records = allPoojas.map(p => ({ pooja_id: p.id, location_id: loc.id }));
      await PoojaLocation.bulkCreate(records, { ignoreDuplicates: true });
    }
    console.log(`✅ All poojas assigned to ${majorCities.length} major cities\n`);

    // ─── ASSIGN IDOLS TO MAJOR CITIES ───────────────────────────────────────
    console.log('🪔 Assigning Idols to major cities...');
    const allIdols = await Idol.findAll({ attributes: ['id'] });

    for (const cityName of majorCities) {
      const loc = locations.find(l => l.name === cityName);
      if (!loc) continue;
      const records = allIdols.map(i => ({ idol_id: i.id, location_id: loc.id }));
      await IdolLocation.bulkCreate(records, { ignoreDuplicates: true });
    }
    console.log(`✅ All idols assigned to ${majorCities.length} major cities\n`);

    console.log('🎉 Location & Pujari seeding complete!');
    console.log('\nNext steps:');
    console.log('  - Admin can add more locations via: POST /api/locations/admin/create');
    console.log('  - Admin can assign poojas to new cities via: POST /api/locations/admin/:id/assign-pooja');
    console.log('  - Frontend should pass ?location_id=X to filter available items');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();
