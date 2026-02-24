-- ============================================================
-- Migration: Add Location Master + Pujari Master
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================================

USE `ashirvachana_db`;

-- ─── LOCATIONS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `state` VARCHAR(100),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── POOJA LOCATIONS (junction) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pooja_locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pooja_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_pooja_location` (`pooja_id`, `location_id`),
  FOREIGN KEY (`pooja_id`) REFERENCES `poojas`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── IDOL LOCATIONS (junction) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `idol_locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `idol_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_idol_location` (`idol_id`, `location_id`),
  FOREIGN KEY (`idol_id`) REFERENCES `idols`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── PUJARIS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pujaris` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20),
  `experience` VARCHAR(50),
  `rating` DECIMAL(3,1) DEFAULT 5.0,
  `specializations` JSON,
  `service_location_ids` JSON,
  `is_available` TINYINT(1) DEFAULT 1,
  `profile_image` VARCHAR(500),
  `bio` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Add location_id to orders table ──────────────────────────────────────────
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `location_id` INT NULL,
  ADD FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL;

-- ─── SEED: 24 Cities ──────────────────────────────────────────────────────────
INSERT IGNORE INTO `locations` (name, state) VALUES
('New Delhi', 'Delhi'),
('Mumbai', 'Maharashtra'),
('Chennai', 'Tamil Nadu'),
('Bangalore', 'Karnataka'),
('Hyderabad', 'Telangana'),
('Kolkata', 'West Bengal'),
('Ahmedabad', 'Gujarat'),
('Pune', 'Maharashtra'),
('Jaipur', 'Rajasthan'),
('Lucknow', 'Uttar Pradesh'),
('Bhopal', 'Madhya Pradesh'),
('Chandigarh', 'Punjab/Haryana'),
('Thiruvananthapuram', 'Kerala'),
('Patna', 'Bihar'),
('Bhubaneswar', 'Odisha'),
('Dehradun', 'Uttarakhand'),
('Guwahati', 'Assam'),
('Ranchi', 'Jharkhand'),
('Raipur', 'Chhattisgarh'),
('Shimla', 'Himachal Pradesh'),
('Panaji', 'Goa'),
('Gandhinagar', 'Gujarat'),
('Dispur', 'Assam'),
('Srinagar', 'Jammu & Kashmir');

-- ─── SEED: Sample Pujaris ─────────────────────────────────────────────────────
INSERT IGNORE INTO `pujaris` (full_name, phone, experience, rating, specializations, service_location_ids, is_available, bio) VALUES
('Pandit Raghunath Sharma', '+91 98765 43210', '25+ years', 4.9, '["Homam", "Protection Rituals", "Aghora Pasupatha"]', '[1, 2]', 1, 'A highly experienced Vedic priest specializing in powerful Homam rituals and protection ceremonies.'),
('Pandit Vishwanath Dikshit', '+91 87654 32109', '30+ years', 4.8, '["Shanti Pooja", "Devi Homam", "Pratyangira"]', '[1, 4]', 1, 'Senior Vedic scholar with expertise in Devi worship and Shanti rituals.'),
('Pandit Keshav Joshi', '+91 76543 21098', '20+ years', 4.7, '["Graha Shanti", "Navagraha Pooja", "Vastu Pooja"]', '[3, 5]', 1, 'Specialized in planetary remedies, Vastu corrections, and Navagraha pacification rituals.');
