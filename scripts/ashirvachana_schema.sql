-- ============================================================
-- Ashirvachana Database Schema
-- Import this in phpMyAdmin or run in MySQL
-- XAMPP: http://localhost/phpmyadmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS `ashirvachana_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ashirvachana_db`;

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `address` TEXT,
  `city` VARCHAR(100),
  `is_active` TINYINT(1) DEFAULT 1,
  `google_id` VARCHAR(255),
  `profile_image` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── POOJAS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `poojas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `category` ENUM('Protection','Shanti','Graha','Home','Festival','Health','Prosperity','Other') DEFAULT 'Other',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `original_price` DECIMAL(10,2),
  `duration` VARCHAR(50),
  `image_url` VARCHAR(500),
  `description` TEXT,
  `benefits` JSON,
  `includes` JSON,
  `rating` DECIMAL(3,1) DEFAULT 4.5,
  `review_count` INT DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `badge` VARCHAR(50),
  `advance_percent` INT DEFAULT 30,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── IDOLS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `idols` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `deity` VARCHAR(100),
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `original_price` DECIMAL(10,2),
  `material` VARCHAR(100),
  `height` VARCHAR(50),
  `weight` VARCHAR(50),
  `image_url` VARCHAR(500),
  `description` TEXT,
  `features` JSON,
  `in_stock` TINYINT(1) DEFAULT 1,
  `stock_quantity` INT DEFAULT 100,
  `rating` DECIMAL(3,1) DEFAULT 4.5,
  `review_count` INT DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `order_type` ENUM('pooja','idol','mixed') DEFAULT 'idol',
  `status` ENUM('pending','confirmed','processing','completed','cancelled','refunded') DEFAULT 'pending',
  `pooja_id` INT,
  `pooja_date` DATE,
  `pooja_time` VARCHAR(20),
  `priest_name` VARCHAR(100),
  `address` TEXT,
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `pincode` VARCHAR(10),
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(10,2) DEFAULT 0,
  `shipping_amount` DECIMAL(10,2) DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `advance_amount` DECIMAL(10,2) DEFAULT 0,
  `pending_amount` DECIMAL(10,2) DEFAULT 0,
  `payment_status` ENUM('unpaid','partial','paid','refunded') DEFAULT 'unpaid',
  `payment_method` VARCHAR(50),
  `razorpay_order_id` VARCHAR(200),
  `razorpay_payment_id` VARCHAR(200),
  `razorpay_signature` VARCHAR(500),
  `customer_name` VARCHAR(100),
  `customer_phone` VARCHAR(20),
  `customer_email` VARCHAR(150),
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pooja_id`) REFERENCES `poojas`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ORDER ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `item_type` ENUM('pooja','idol') NOT NULL,
  `item_id` INT NOT NULL,
  `item_name` VARCHAR(200) NOT NULL,
  `item_image` VARCHAR(500),
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── BLOG POSTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(300) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Rituals',
  `author` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `read_time` VARCHAR(30) DEFAULT '5 min read',
  `image_url` VARCHAR(500),
  `excerpt` TEXT,
  `full_content` LONGTEXT NOT NULL,
  `tags` JSON,
  `is_published` TINYINT(1) DEFAULT 1,
  `view_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100),
  `language` VARCHAR(50),
  `title` VARCHAR(200) NOT NULL,
  `review_text` TEXT NOT NULL,
  `rating` INT DEFAULT 5,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── CART ITEMS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `item_type` ENUM('pooja','idol') NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

INSERT IGNORE INTO `poojas` (title, category, price, original_price, duration, description, benefits, includes, rating, review_count, is_featured, badge, advance_percent) VALUES
('Aghora Pasupatha Homam', 'Protection', 3000, 5000, '3-4 Hours', 'A powerful homam invoking Lord Shiva Aghora form for ultimate protection against evil forces.', '["Protection from evil eye & black magic","Removes negative energies","Brings mental peace","Strengthens spiritual aura","Blesses family"]', '["All pooja samagri","Experienced Vedic priest","Homam fire setup","Prasadam distribution","Post-pooja guidance"]', 4.9, 187, 1, 'Protection', 30),
('Pratyangira Devi Homam', 'Shanti', 4000, 6000, '4-5 Hours', 'A sacred homam dedicated to Goddess Pratyangira Devi to neutralize negative energies.', '["Removes black magic","Brings peace","Protects from enemies","Blesses with prosperity","Destroys negative karmas"]', '["Complete samagri","Experienced priest","Havan kund setup","Prasadam","Post-ritual guidance"]', 4.8, 142, 1, 'Shanti', 30),
('Shani Shanti Homam', 'Graha', 10000, 15000, '5-6 Hours', 'Grand Shani Shanti Homam to pacify effects of Saturn and Sade Sati.', '["Reduces Sade Sati","Removes Saturn obstacles","Career growth","Financial stability","Inner peace"]', '["Grand homam setup","Senior Vedic priest","All samagri","Prasad kit","Astrological consultation"]', 4.7, 98, 1, 'Graha', 30),
('Vastu Shanti Pooja', 'Home', 5000, 7500, '3-4 Hours', 'Comprehensive Vastu Shanti Pooja to harmonize energies in home or office.', '["Removes Vastu doshas","Positive energies","Family harmony","Brings prosperity","Occupant health"]', '["Complete samagri","Vastu expert priest","Vastu report","Prasadam","Follow-up consultation"]', 4.9, 215, 0, 'Home', 30),
('Ganesh Chaturthi Pooja', 'Festival', 2500, 3500, '2-3 Hours', 'Traditional and authentic Ganesh Chaturthi pooja by experienced priests.', '["Removes obstacles","Wisdom & intellect","Success in endeavors","Family blessings","Positive beginnings"]', '["Ganesh idol","All pooja items","Modak prasad","Experienced priest","Aarti kit"]', 4.8, 330, 0, 'Festival', 30),
('Shatru Samhara Pooja', 'Protection', 2000, 3000, '2-3 Hours', 'Protection pooja to ward off enemies, jealousy and ill-wishers.', '["Protection from enemies","Removes jealousy","Creates divine shield","Brings courage","Grants victory"]', '["All samagri","Experienced priest","Special herbs","Kavach mantra","Post-pooja guidance"]', 4.6, 78, 0, NULL, 30);

INSERT IGNORE INTO `idols` (name, deity, price, original_price, material, height, weight, description, features, in_stock, rating, review_count, is_featured) VALUES
('Lord Ganesha Brass Idol', 'Ganesha', 2499, 3500, 'Pure Brass', '6 inches', '800g', 'Beautifully crafted pure brass Lord Ganesha idol. Perfect for home temples.', '["Pure brass construction","Hand-crafted","Antique finish","Wooden base","Certificate"]', 1, 4.8, 156, 1),
('Goddess Lakshmi Brass Idol', 'Lakshmi', 2999, 4000, 'Pure Brass', '7 inches', '950g', 'Exquisite Goddess Lakshmi brass idol that brings wealth and prosperity.', '["Pure brass","Detailed craftwork","Auspicious posture","Gold-plated accents","Gift packaging"]', 1, 4.9, 203, 1),
('Lord Shiva Nataraja Idol', 'Shiva', 3499, 5000, 'Panchaloha', '8 inches', '1.2kg', 'Magnificent Lord Shiva Nataraja idol depicting the cosmic dance.', '["Panchaloha alloy","Traditional crafting","Intricate detailing","Museum quality","Wooden pedestal"]', 1, 4.7, 89, 0),
('Lord Krishna with Flute', 'Krishna', 1999, 2800, 'Brass', '5 inches', '600g', 'Charming Lord Krishna idol playing the divine flute.', '["Brass with gold plating","Flute & peacock feather","Smooth finish","Compact size","Velvet gift box"]', 1, 4.8, 178, 0),
('Lord Hanuman Devotional Idol', 'Hanuman', 1799, 2500, 'Brass', '6 inches', '700g', 'Powerful Lord Hanuman idol in devotional stance.', '["Pure brass","Sindoor coating","Traditional styling","Mace & mountain detailing","Protective energy"]', 1, 4.9, 234, 0),
('Goddess Saraswati with Veena', 'Saraswati', 2799, 3800, 'Brass', '7 inches', '900g', 'Graceful Goddess Saraswati idol with Veena and swan.', '["Brass with silver finish","Veena & swan detailing","White lotus base","Fine craftsmanship","Premium packaging"]', 1, 4.7, 112, 0),
('Lord Vishnu on Shesha', 'Vishnu', 4999, 7000, 'Panchaloha', '10 inches', '1.8kg', 'Magnificent Lord Vishnu resting on Shesha Naag idol.', '["Panchaloha metal","Large format","Shesha Naag base","Antique patina","Certificate"]', 1, 4.8, 67, 0),
('Navgraha Yantra Set', 'Navgraha', 1299, 1800, 'Copper', 'Flat plate', '200g', 'Complete set of 9 Navgraha Yantras on copper plates.', '["Pure copper plates","All 9 planets","Energized & blessed","Instruction booklet","Velvet pouch"]', 1, 4.6, 145, 0);

INSERT IGNORE INTO `testimonials` (name, location, language, title, review_text, rating) VALUES
('Paritosh Parate', 'Mumbai', 'Hindi', 'Hassle Free Puja', 'The experience was amazing... Pandit ji was in no rush, everything was well organised, no hassle, it was zero effort from our end...', 5),
('Amrita Patole', 'Hyderabad', 'Telugu', 'Time Punctuality', 'We are extremely happy with the service. Guruji reached 30 mins before time and also finished Pooja in time. He was humble, prompt and adjusted with available resources.', 5),
('Mangesh Hagargi', 'Chennai', 'Marathi', 'Way Of Chanting Mantras', 'The pujari performed an outstanding pooja, showcasing deep knowledge and reverence. His meticulous attention to detail, rhythmic chanting, and graceful rituals created a spiritually enriching experience.', 5);
