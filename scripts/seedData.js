// scripts/seedData.js
// Run: node scripts/seedData.js
// Adds all sample data shown in the website screenshots

const { sequelize, Pooja, Idol, BlogPost, Testimonial } = require('../models');
require('dotenv').config();

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB, seeding data...\n');

    // ─── POOJAS ───────────────────────────────────────────────────────────────
    console.log('🙏 Seeding Poojas...');
    await Pooja.bulkCreate([
      {
        title: 'Aghora Pasupatha Homam',
        category: 'Protection',
        price: 3000, original_price: 5000,
        duration: '3-4 Hours',
        image_url: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?w=800',
        description: 'A powerful homam invoking Lord Shiva\'s Aghora form for ultimate protection against evil forces, black magic, and negative energies. This ancient Vedic fire ritual creates a divine shield around you and your family.',
        benefits: ['Protection from evil eye & black magic', 'Removes negative energies from home', 'Brings mental peace and clarity', 'Strengthens spiritual aura', 'Blesses family with divine protection'],
        includes: ['All pooja samagri', 'Experienced Vedic priest', 'Homam fire setup', 'Prasadam distribution', 'Post-pooja guidance'],
        rating: 4.9, review_count: 187, is_featured: true, badge: 'Protection', advance_percent: 30
      },
      {
        title: 'Pratyangira Devi Homam',
        category: 'Shanti',
        price: 4000, original_price: 6000,
        duration: '4-5 Hours',
        image_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
        description: 'A sacred homam dedicated to Goddess Pratyangira Devi to neutralize negative energies, remove black magic effects, and bring peace and prosperity to your home.',
        benefits: ['Removes black magic & evil effects', 'Brings peace and harmony', 'Protects family from enemies', 'Blesses with prosperity', 'Destroys negative karmas'],
        includes: ['Complete pooja samagri', 'Experienced priest', 'Havan kund setup', 'Prasadam', 'Post-ritual guidance'],
        rating: 4.8, review_count: 142, is_featured: true, badge: 'Shanti', advance_percent: 30
      },
      {
        title: 'Shani Shanti Homam',
        category: 'Graha',
        price: 10000, original_price: 15000,
        duration: '5-6 Hours',
        image_url: 'https://images.unsplash.com/photo-1570913149827-d2ac81c46ef7?w=800',
        description: 'A grand Shani Shanti Homam to pacify the effects of Saturn and reduce the influence of Sade Sati and Dhaiya. This powerful ritual brings relief from Saturn\'s hardships.',
        benefits: ['Reduces Sade Sati effects', 'Removes Saturn-related obstacles', 'Brings career growth', 'Improves financial stability', 'Grants inner peace'],
        includes: ['Grand homam setup', 'Senior Vedic priest', 'All samagri', 'Prasad kit', 'Astrological consultation'],
        rating: 4.7, review_count: 98, is_featured: true, badge: 'Graha', advance_percent: 30
      },
      {
        title: 'Vastu Shanti Pooja',
        category: 'Home',
        price: 5000, original_price: 7500,
        duration: '3-4 Hours',
        image_url: 'https://images.unsplash.com/photo-1571508601936-4f9a6deec6e8?w=800',
        description: 'A comprehensive Vastu Shanti Pooja to harmonize the energies in your home or office, remove Vastu doshas, and attract positive vibrations for health, wealth and happiness.',
        benefits: ['Removes Vastu doshas', 'Attracts positive energies', 'Improves family harmony', 'Brings prosperity', 'Ensures occupant health'],
        includes: ['Complete pooja samagri', 'Vastu expert priest', 'Vastu report', 'Prasadam', 'Follow-up consultation'],
        rating: 4.9, review_count: 215, is_featured: false, badge: 'Home', advance_percent: 30
      },
      {
        title: 'Ganesh Chaturthi Pooja',
        category: 'Festival',
        price: 2500, original_price: 3500,
        duration: '2-3 Hours',
        image_url: 'https://images.unsplash.com/photo-1609166214994-502d326bbe71?w=800',
        description: 'Celebrate Ganesh Chaturthi with a traditional and authentic pooja performed by experienced priests. Lord Ganesha blesses devotees with wisdom, success and removal of obstacles.',
        benefits: ['Removes obstacles', 'Brings wisdom & intellect', 'Grants success in endeavors', 'Family blessings', 'Positive beginnings'],
        includes: ['Ganesh idol', 'All pooja items', 'Modak prasad', 'Experienced priest', 'Aarti kit'],
        rating: 4.8, review_count: 330, is_featured: false, badge: 'Festival', advance_percent: 30
      },
      {
        title: 'Shatru Samhara Pooja',
        category: 'Protection',
        price: 2000, original_price: 3000,
        duration: '2-3 Hours',
        image_url: 'https://images.unsplash.com/photo-1601928851377-8d2af08e1e6e?w=800',
        description: 'A powerful protection pooja to ward off enemies, jealousy, and ill-wishers. This ancient ritual creates a shield of divine protection around you and your loved ones.',
        benefits: ['Protection from enemies', 'Removes jealousy effects', 'Creates divine shield', 'Brings courage', 'Grants victory'],
        includes: ['All samagri', 'Experienced priest', 'Special herbs', 'Kavach mantra', 'Post-pooja guidance'],
        rating: 4.6, review_count: 78, is_featured: false, badge: null, advance_percent: 30
      }
    ], { ignoreDuplicates: true });
    console.log('✅ Poojas seeded');

    // ─── IDOLS ────────────────────────────────────────────────────────────────
    console.log('🪔 Seeding Idols...');
    await Idol.bulkCreate([
      {
        name: 'Lord Ganesha Brass Idol',
        deity: 'Ganesha',
        price: 2499, original_price: 3500,
        material: 'Pure Brass', height: '6 inches', weight: '800g',
        image_url: 'https://images.unsplash.com/photo-1609166214994-502d326bbe71?w=800',
        description: 'A beautifully crafted pure brass Lord Ganesha idol. Perfect for home temples and gifting. Handcrafted by skilled artisans with intricate detailing.',
        features: ['Pure brass construction', 'Hand-crafted', 'Antique finish', 'Comes with wooden base', 'Certificate of authenticity'],
        in_stock: true, rating: 4.8, review_count: 156, is_featured: true
      },
      {
        name: 'Goddess Lakshmi Brass Idol',
        deity: 'Lakshmi',
        price: 2999, original_price: 4000,
        material: 'Pure Brass', height: '7 inches', weight: '950g',
        image_url: 'https://images.unsplash.com/photo-1607337202714-a88f7abbdee7?w=800',
        description: 'An exquisite Goddess Lakshmi brass idol that brings wealth and prosperity. Ideal for pooja rooms and gifting on auspicious occasions.',
        features: ['Pure brass', 'Detailed craftwork', 'Auspicious posture', 'Gold-plated accents', 'Gift packaging'],
        in_stock: true, rating: 4.9, review_count: 203, is_featured: true
      },
      {
        name: 'Lord Shiva Nataraja Idol',
        deity: 'Shiva',
        price: 3499, original_price: 5000,
        material: 'Panchaloha', height: '8 inches', weight: '1.2kg',
        image_url: 'https://images.unsplash.com/photo-1580196969807-cc6de06c0585?w=800',
        description: 'A magnificent Lord Shiva Nataraja idol depicting the cosmic dance. Made from Panchaloha (five metals) alloy following traditional Agama Shastra.',
        features: ['Panchaloha alloy', 'Traditional crafting', 'Intricate detailing', 'Museum quality', 'Includes wooden pedestal'],
        in_stock: true, rating: 4.7, review_count: 89, is_featured: false
      },
      {
        name: 'Lord Krishna with Flute',
        deity: 'Krishna',
        price: 1999, original_price: 2800,
        material: 'Brass', height: '5 inches', weight: '600g',
        image_url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
        description: 'A charming Lord Krishna idol playing the divine flute. This beautiful idol radiates joy and divine love, perfect for any pooja room.',
        features: ['Brass with gold plating', 'Flute & peacock feather', 'Smooth finish', 'Compact size', 'Velvet gift box'],
        in_stock: true, rating: 4.8, review_count: 178, is_featured: false
      },
      {
        name: 'Lord Hanuman Devotional Idol',
        deity: 'Hanuman',
        price: 1799, original_price: 2500,
        material: 'Brass', height: '6 inches', weight: '700g',
        image_url: 'https://images.unsplash.com/photo-1570993492891-13d9fd0b6f4c?w=800',
        description: 'A powerful Lord Hanuman idol in the devotional stance. Lord Hanuman\'s presence brings strength, protection and devotion to your home.',
        features: ['Pure brass', 'Sindoor coating', 'Traditional styling', 'Mace & mountain detailing', 'Protective energy'],
        in_stock: true, rating: 4.9, review_count: 234, is_featured: false
      },
      {
        name: 'Goddess Saraswati with Veena',
        deity: 'Saraswati',
        price: 2799, original_price: 3800,
        material: 'Brass', height: '7 inches', weight: '900g',
        image_url: 'https://images.unsplash.com/photo-1617611413726-4ad4c69e5e22?w=800',
        description: 'A graceful Goddess Saraswati idol with Veena, swan and lotus. Perfect for students, artists and scholars seeking blessings of wisdom.',
        features: ['Brass with silver finish', 'Veena & swan detailing', 'White lotus base', 'Fine craftsmanship', 'Premium packaging'],
        in_stock: true, rating: 4.7, review_count: 112, is_featured: false
      },
      {
        name: 'Lord Vishnu on Shesha',
        deity: 'Vishnu',
        price: 4999, original_price: 7000,
        material: 'Panchaloha', height: '10 inches', weight: '1.8kg',
        image_url: 'https://images.unsplash.com/photo-1613526209394-5a47ab1d1de3?w=800',
        description: 'A magnificent Lord Vishnu resting on Shesha Naag idol. This premium Panchaloha idol represents divine preservation and cosmic order.',
        features: ['Panchaloha metal', 'Large format', 'Shesha Naag base', 'Antique patina finish', 'Certificate included'],
        in_stock: true, rating: 4.8, review_count: 67, is_featured: false
      },
      {
        name: 'Navgraha Yantra Set',
        deity: 'Navgraha',
        price: 1299, original_price: 1800,
        material: 'Copper', height: 'Flat plate', weight: '200g',
        image_url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800',
        description: 'A complete set of 9 Navgraha Yantras on copper plates. These sacred geometric diagrams represent the nine planetary deities and help balance planetary influences.',
        features: ['Pure copper plates', 'All 9 planets', 'Energized & blessed', 'Instruction booklet', 'Velvet pouch'],
        in_stock: true, rating: 4.6, review_count: 145, is_featured: false
      }
    ], { ignoreDuplicates: true });
    console.log('✅ Idols seeded');

    // ─── BLOG POSTS ───────────────────────────────────────────────────────────
    console.log('📝 Seeding Blog Posts...');
    await BlogPost.bulkCreate([
      {
        title: 'The Spiritual Significance of Ganesh Puja',
        category: 'Rituals',
        author: 'Pandit Sharma',
        date: '2026-02-01',
        read_time: '5 min read',
        image_url: 'https://images.unsplash.com/photo-1609166214994-502d326bbe71?w=800',
        excerpt: 'Ganesh Puja is one of the most widely performed rituals in Hindu tradition. Lord Ganesha, the elephant-headed deity, is revered as the remover of obstacles and the lord of new beginnings.',
        full_content: `Ganesh Puja is one of the most widely performed rituals in Hindu tradition. Lord Ganesha, the elephant-headed deity, is revered as the remover of obstacles and the lord of new beginnings.

The ritual of Ganesh Puja holds deep spiritual significance that goes beyond mere ceremonial observance. When we invoke Lord Ganesha at the beginning of any auspicious activity, we are acknowledging the need for divine guidance and the removal of internal and external obstacles that might hinder our progress.

The symbolism of Lord Ganesha is rich and multifaceted. His elephant head represents wisdom and intelligence. The large ears symbolize the importance of listening and absorbing knowledge. The small eyes represent concentration and focus. His large belly represents the ability to digest all experiences of life, both good and bad.

During Ganesh Puja, devotees offer specific items that hold symbolic meaning. Modak, a sweet dumpling, represents the sweetness of spiritual knowledge. Durva grass represents longevity and vitality. Red flowers are associated with energy and devotion.

The mantras chanted during Ganesh Puja carry vibrational frequencies that resonate with the cosmic energies associated with Lord Ganesha. The most fundamental mantra is "Om Gam Ganapataye Namaha" which invokes the presence and blessings of Lord Ganesha.

Performing Ganesh Puja regularly, especially on Wednesdays and during Ganesh Chaturthi, is believed to clear the path of obstacles, enhance wisdom, and bring success in endeavors.`,
        tags: ['Ganesh', 'Puja', 'Rituals', 'Spirituality'],
        is_published: true
      },
      {
        title: 'Vastu Shastra: Essential Tips for a Harmonious Home',
        category: 'Vastu',
        author: 'Acharya Mishra',
        date: '2026-01-25',
        read_time: '7 min read',
        image_url: 'https://images.unsplash.com/photo-1571508601936-4f9a6deec6e8?w=800',
        excerpt: 'Vastu Shastra, the ancient Indian science of architecture and space, provides guidelines for creating harmonious living environments that promote health, happiness, and prosperity.',
        full_content: `Vastu Shastra, the ancient Indian science of architecture and space, provides guidelines for creating harmonious living environments that promote health, happiness, and prosperity.

The word Vastu means dwelling or house, while Shastra means science or doctrine. Together, Vastu Shastra translates to the science of dwellings. This ancient system, dating back thousands of years, integrates architecture with nature, spirituality, and cosmic energies.

The Five Elements (Pancha Bhuta) form the foundation of Vastu Shastra. Earth (Prithvi), Water (Jal), Fire (Agni), Air (Vayu), and Space (Akasha) must be balanced in your home for optimal energy flow.

Key Vastu principles for your home include proper placement of rooms based on cardinal directions, the importance of the Brahmasthan (center of the home), and the role of natural light and ventilation.

The entrance of your home is particularly important in Vastu. The main door should ideally face North, Northeast, East, or West. Keep the entrance well-lit, clean, and free from obstacles. Avoid placing shoes or dustbins near the main entrance.

The kitchen represents the fire element and should ideally be in the Southeast corner of the home. The person cooking should face East. Avoid having the kitchen directly opposite the main door or adjacent to the bathroom.

Bedrooms should ideally be in the Southwest area of the home. Sleep with your head pointing South or East. Avoid mirrors facing the bed as they are believed to disturb sleep and create restlessness.

Regular Vastu Puja can help correct existing doshas (imbalances) and maintain positive energy flow in your home, even if the structure cannot be physically modified.`,
        tags: ['Vastu', 'Home', 'Architecture', 'Energy'],
        is_published: true
      },
      {
        title: 'Navagraha Puja: Aligning Planetary Energies',
        category: 'Astrology',
        author: 'Jyotish Acharya Dev',
        date: '2026-01-18',
        read_time: '6 min read',
        image_url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800',
        excerpt: 'The nine planets or Navagrahas in Vedic astrology significantly influence our lives. Navagraha Puja is performed to appease these planetary deities and reduce the malefic effects of unfavorable planetary positions.',
        full_content: `The nine planets or Navagrahas in Vedic astrology significantly influence our lives. Navagraha Puja is performed to appease these planetary deities and reduce the malefic effects of unfavorable planetary positions.

In Vedic astrology, the nine planets are Surya (Sun), Chandra (Moon), Mangala (Mars), Budha (Mercury), Brihaspati (Jupiter), Shukra (Venus), Shani (Saturn), Rahu (North Node), and Ketu (South Node). Each planet governs different aspects of human life and has specific periods of influence called Dashas and Antardhashas.

Navagraha Puja is typically performed when a person is experiencing a difficult planetary period, as indicated by their birth chart. It is also performed during auspicious occasions like marriage, business launches, or home purchases to ensure favorable planetary support.

The ritual involves offering specific materials to each planet: red flowers and wheat for the Sun, white rice and milk for the Moon, red lentils and coral for Mars, green mung beans and emeralds for Mercury, yellow items and gold for Jupiter, white rice and diamonds for Venus, black sesame and iron for Saturn, and specific offerings for Rahu and Ketu.

Specific mantras are chanted 108 times for each planetary deity. These sacred sounds create vibrational patterns that are believed to harmonize with the cosmic frequencies of each planet.

Benefits of regular Navagraha Puja include relief from planetary doshas (malefic effects), strengthening of favorable planetary influences, improved health, relationships, and financial stability, and overall harmony in life.`,
        tags: ['Navagraha', 'Astrology', 'Planets', 'Vedic'],
        is_published: true
      },
      {
        title: 'How to Choose the Perfect Idol for Your Home Temple',
        category: 'Guides',
        author: 'Pandit Sharma',
        date: '2026-01-10',
        read_time: '4 min read',
        image_url: 'https://images.unsplash.com/photo-1609166214994-502d326bbe71?w=800',
        excerpt: 'Setting up a home temple is a sacred endeavor that requires careful consideration. The choice of deity idols plays a crucial role in establishing the spiritual energy of your pooja room.',
        full_content: `Setting up a home temple is a sacred endeavor that requires careful consideration. The choice of deity idols plays a crucial role in establishing the spiritual energy of your pooja room.

When choosing idols for your home temple, consider the family deity (Kula Devata) first. The family deity is passed down through generations and holds special significance for your lineage. Worshipping the family deity strengthens ancestral connections and brings blessings specific to your family line.

The material of the idol matters significantly. Brass and panchaloha (five-metal alloy) idols are traditionally considered most auspicious for home temples. Brass idols are durable, have natural antibacterial properties, and are traditionally associated with divine energy. Panchaloha idols, made from gold, silver, copper, iron, and lead (or zinc), are considered most sacred according to Agama Shastra.

The size of the idol should be appropriate for your pooja room. As a general guideline, idols for home temples should not exceed 12 inches in height. The thumb rule is that the idol should not be larger than the devotee's palm. This ensures proper worship without creating an overwhelming presence.

The posture of the idol carries symbolic meaning. Standing postures (Sthanaka Mudra) represent active blessings and are considered most auspicious for home worship. Sitting postures (Asana Mudra) represent stability and meditation. Choose based on the quality of blessing you seek.

Always purchase idols from reputable sources that procure from skilled craftsmen following traditional iconographic guidelines (Shilpa Shastra). Ashirvachana's idol collection is handpicked from authentic craftsmen following these sacred traditions.

After installation, perform a Prana Pratishtha ceremony to consecrate the idol with divine energy. This ritual breathes life into the idol, transforming it from a mere sculpture into a living representation of the deity.`,
        tags: ['Idols', 'Home Temple', 'Pooja Room', 'Guide'],
        is_published: true
      }
    ], { ignoreDuplicates: true });
    console.log('✅ Blog Posts seeded');

    // ─── TESTIMONIALS ─────────────────────────────────────────────────────────
    console.log('💬 Seeding Testimonials...');
    await Testimonial.bulkCreate([
      {
        name: 'Paritosh Parate',
        location: 'Mumbai',
        language: 'Hindi',
        title: 'Hassle Free Puja',
        review_text: 'The experience was amazing... Pandit ji was in no rush, everything was well organised, no hassle, it was zero effort from our end... Truly what we needed from our busy schedule.',
        rating: 5, is_active: true
      },
      {
        name: 'Amrita Patole',
        location: 'Hyderabad',
        language: 'Telugu',
        title: 'Time Punctuality',
        review_text: 'We are extremely happy with the service. Guruji reached 30 mins before time and also finished Pooja in time. He was humble, prompt and adjusted with available resources. We felt pleased.',
        rating: 5, is_active: true
      },
      {
        name: 'Mangesh Hagargi',
        location: 'Chennai',
        language: 'Marathi',
        title: 'Way Of Chanting Mantras',
        review_text: 'The pujari performed an outstanding pooja, showcasing deep knowledge and reverence. His meticulous attention to detail, rhythmic chanting, and graceful rituals created a spiritually enriching experience.',
        rating: 5, is_active: true
      }
    ], { ignoreDuplicates: true });
    console.log('✅ Testimonials seeded');

    console.log('\n🎉 All data seeded successfully!');
    console.log('🚀 You can now start the server with: npm start');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();
