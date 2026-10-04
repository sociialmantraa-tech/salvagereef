-- =============================================================================
-- SalvageReef — Production MySQL / MariaDB Schema & Seed Dump
-- Compatible with: cPanel phpMyAdmin, MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Generated on: October 3, 2026
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- Table structure for `migrations`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `migration` VARCHAR(255) NOT NULL,
  `batch` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `categories`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `parent_id` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `categories` (3 records)
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `created_at`, `updated_at`) VALUES
  (1, 'Scrap Metals (Ferrous & Non-Ferrous)', 'scrap-metals', NULL, '2026-08-08 16:46:32', '2026-08-08 16:46:32'),
  (2, 'Damaged Vehicles & Fleet Salvage', 'damaged-vehicles', NULL, '2026-08-08 16:46:32', '2026-08-08 16:46:32'),
  (3, 'Industrial Idle Assets & Machinery', 'industrial-machinery', NULL, '2026-08-08 16:46:32', '2026-08-08 16:46:32');

-- ------------------------------------------------------------
-- Table structure for `locations`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) DEFAULT 'Maharashtra',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `locations` (9 records)
INSERT INTO `locations` (`id`, `city`, `state`, `is_active`, `created_at`) VALUES
  (1, 'Mumbai', 'Maharashtra', 1, '2026-08-10 06:45:13'),
  (2, 'Thane', 'Maharashtra', 1, '2026-08-10 06:45:13'),
  (3, 'Navi Mumbai', 'Maharashtra', 1, '2026-08-10 06:45:13'),
  (4, 'Pune', 'Maharashtra', 1, '2026-08-10 06:45:14'),
  (5, 'Gujarat', 'Gujarat', 1, '2026-08-10 06:45:14'),
  (6, 'Delhi NCR', 'Delhi', 1, '2026-08-10 06:45:14'),
  (7, 'Bengaluru', 'Karnataka', 1, '2026-08-10 06:45:14'),
  (8, 'Bhayander West', 'Maharashtra', 1, '2026-08-12 07:26:10'),
  (9, 'Bhayander West', 'Maharashtra', 1, '2026-08-12 07:27:57');

-- ------------------------------------------------------------
-- Table structure for `users`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(30) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'master_admin', 'desk_admin', 'read_only_admin', 'agent', 'seller', 'bidder') NOT NULL DEFAULT 'bidder',
  `company_name` VARCHAR(191) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT 'Mumbai',
  `state` VARCHAR(100) DEFAULT 'Maharashtra',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `email_otp` VARCHAR(10) DEFAULT NULL,
  `email_otp_expires_at` DATETIME DEFAULT NULL,
  `phone_otp` VARCHAR(10) DEFAULT NULL,
  `phone_otp_expires_at` DATETIME DEFAULT NULL,
  `is_email_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `is_phone_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `remember_token` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `login_id` VARCHAR(50) DEFAULT NULL,
  `google_id` VARCHAR(100) DEFAULT NULL,
  `email_verified_at` DATETIME DEFAULT NULL,
  `email_verification_token` VARCHAR(255) DEFAULT NULL,
  `email_verification_expires_at` DATETIME DEFAULT NULL,
  `pan_number` VARCHAR(20) DEFAULT NULL,
  `gst_number` VARCHAR(20) DEFAULT NULL,
  `entity_type` VARCHAR(50) DEFAULT 'Proprietorship',
  `registered_address` TEXT DEFAULT NULL,
  `pincode` VARCHAR(10) DEFAULT NULL,
  `spoc_name` VARCHAR(100) DEFAULT NULL,
  `bank_name` VARCHAR(100) DEFAULT NULL,
  `bank_account_number` VARCHAR(50) DEFAULT NULL,
  `bank_ifsc_code` VARCHAR(20) DEFAULT NULL,
  `cheque_file` VARCHAR(255) DEFAULT NULL,
  `pan_file` VARCHAR(255) DEFAULT NULL,
  `gst_file` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `users` (21 records)
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `company_name`, `city`, `state`, `is_verified`, `is_active`, `email_otp`, `email_otp_expires_at`, `phone_otp`, `phone_otp_expires_at`, `is_email_verified`, `is_phone_verified`, `remember_token`, `created_at`, `updated_at`, `login_id`, `google_id`, `email_verified_at`, `email_verification_token`, `email_verification_expires_at`, `pan_number`, `gst_number`, `entity_type`, `registered_address`, `pincode`, `spoc_name`, `bank_name`, `bank_account_number`, `bank_ifsc_code`, `cheque_file`, `pan_file`, `gst_file`) VALUES
  (1, 'SalvageReef Operations Desk', 'admin@salvagereef.com', '7304481166', '$2y$12$/yJZRHkrM4iK2uV/JobeheK./6y7r44Jpc4HkN2ksHd2N8za3zxN6', 'admin', 'SalvageReef Desk Admin', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-08-08 16:46:34', '2026-08-10 11:37:27', NULL, NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', '/uploads/kyc/cheque_user_1.svg', '/uploads/kyc/pan_card_user_1.svg', '/uploads/kyc/gst_cert_user_1.svg'),
  (2, 'Rajesh Metals Agent', 'agent@salvagereef.com', '9820198201', '$2y$12$wRhxtlzxIWu2tQBfgmXe.OkFIGm5FCen8J.mUYTElHYosDnRflQFC', 'agent', 'Rajesh Industrial Scrap Traders', 'Bhayander', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-08-08 16:46:34', '2026-08-10 11:37:27', NULL, NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', '/uploads/kyc/cheque_user_2.svg', '/uploads/kyc/pan_card_user_2.svg', '/uploads/kyc/gst_cert_user_2.svg'),
  (3, 'SalvageReef Master Verified', 'bidder@salvagereef.com', '9988776655', '$2y$12$lhFyEO7LNwojQBkhvBemhOBjR6pQS4i3D7.7wPZ/kPnvru7njotZS', 'bidder', 'Apex Recyclers Ltd', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, '2026-08-08 16:46:35', '2026-08-10 11:37:28', NULL, NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', NULL, NULL, NULL),
  (4, 'Sunil Automotive Recycler', 'bidder2@salvagereef.com', '9123456789', '$2y$12$a08FNbzVu9YOn5aszxbleO5a.mEk0vNf046AJQqJDjAMZAiCTEqei', 'bidder', 'Green Earth Salvage', 'Pune', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 0, 0, NULL, '2026-08-08 16:46:35', '2026-08-08 16:46:35', NULL, NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', NULL, NULL, NULL),
  (5, 'Audit Tester Bidder', 'bidder_audit_1786519570466@test.com', '9820123456', '$2y$10$sZRZE0I1id0vy32/BuKwwOai82Az2FHMCHsOs.D6./5dCvJyjghuy', 'bidder', 'Audit Scrap Traders', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-856699', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', NULL, NULL, NULL),
  (6, 'Audit Seller', 'seller_audit_1786519570896@test.com', '9820982098', '$2y$10$hNzpljDm/7k2fOZQ4SWLHe5twQCR7Kh3fEgOS3hsOOVP1/S308hZ2', 'agent', 'Apex Industrial Recycling', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-125707', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', NULL, NULL, NULL),
  (7, 'Audit Tester Bidder', 'bidder_audit_1786519678202@test.com', '9820123456', '$2y$10$ObTFGGZEtBOaQgBiiGzcpO7F8r6YlASD4CpUX0oD45665TCKI.oUq', 'bidder', 'Audit Scrap Traders', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-570920', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', NULL, NULL, NULL),
  (12, 'Test Metal Recycler 1790943270986', 'test.bidder.1790943270986@salvagereef.com', '9820112233', '$2y$10$ZltWKbPfNcWcgN3kHTxvoekB87c.lkkD6e.ucN6E/5FYNmJN6mPYy', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790943270986', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-136800', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE7333F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790943270986', NULL, NULL, NULL, NULL, NULL, NULL),
  (13, 'Test Metal Recycler 1790945801202', 'test.bidder.1790945801202@salvagereef.com', '9820112233', '$2y$10$gxwnDAp92IAZB6hinubCM.l7Vcu4uBlzxVR.YX2nsCBDqM/YBZxAm', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790945801202', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-426337', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE5055F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790945801202', NULL, NULL, NULL, NULL, NULL, NULL),
  (14, 'Test Metal Recycler 1790945866591', 'test.bidder.1790945866591@salvagereef.com', '9820112233', '$2y$10$7ZdPZHDjMXDKgEzQo59pVOqj169VAxzyTzzzu0Hme/0eG/tm37TyC', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790945866591', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-877303', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE4930F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790945866591', NULL, NULL, NULL, NULL, NULL, NULL),
  (15, 'Test Metal Recycler 1790945880851', 'test.bidder.1790945880851@salvagereef.com', '9820112233', '$2y$10$u6NCjZdKYlAgBhDEKI9lge5epoHCu26/m2TyM.3zPIhMYn04hIMca', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790945880851', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-645660', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE3256F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790945880851', NULL, NULL, NULL, NULL, NULL, NULL),
  (16, 'Test Metal Recycler 1790945984088', 'test.bidder.1790945984088@salvagereef.com', '9820112233', '$2y$10$91rsHjRIXUVxtGK9OVSF..eYBa.Go9HLMnLN5ULq/eWitld4OJQ9m', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790945984088', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-731981', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE4310F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790945984088', NULL, NULL, NULL, NULL, NULL, NULL),
  (17, 'Test Metal Recycler 1790945994365', 'test.bidder.1790945994365@salvagereef.com', '9820112233', '$2y$10$H7C9G.YNPfC2.DWMb8gne.myVZSGvvCz3p0Y9ug3U2hSi2Nvj92w6', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790945994365', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-473262', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE5638F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790945994365', NULL, NULL, NULL, NULL, NULL, NULL),
  (18, 'Test Metal Recycler 1790946846599', 'test.bidder.1790946846599@salvagereef.com', '9820112233', '$2y$10$hZnbEixZ1jJT7zVDr8QSU.8asMAIzqSCfdz9OVLqF/pey0sSlndza', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790946846599', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-649779', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE7060F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790946846599', NULL, NULL, NULL, NULL, NULL, NULL),
  (19, 'Test Metal Recycler 1790946879329', 'test.bidder.1790946879329@salvagereef.com', '9820112233', '$2y$10$PiJTwBW2VNCdTp8TmwdQj.2P5r.e0ug3K38MlfJHk2W0vUsZiEfbS', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790946879329', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-984740', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE2344F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790946879329', NULL, NULL, NULL, NULL, NULL, NULL),
  (20, 'Test Metal Recycler 1790946949426', 'test.bidder.1790946949426@salvagereef.com', '9820112233', '$2y$10$GpqlB3iFQIbeXs2sH4uykuH6o1SyzzKGrhX7vPQ5wm3rezI9xJ9N2', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790946949426', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-906830', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE3263F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790946949426', NULL, NULL, NULL, NULL, NULL, NULL),
  (21, 'Test Metal Recycler 1790947016110', 'test.bidder.1790947016110@salvagereef.com', '9820112233', '$2y$10$ITaNid4GN0NYYCvcsnpOb.T5rYygR4rzqkJL21ZxT9hPC/uuL3uR.', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790947016110', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-823576', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE1210F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790947016110', NULL, NULL, NULL, NULL, NULL, NULL),
  (22, 'Test Metal Recycler 1790947624722', 'test.bidder.1790947624722@salvagereef.com', '9820112233', '$2y$10$7bHQEBAzvR6v.Ea5DRV1LuoxxZzG2dDjY9vLbVfYHTccbdcVuMD5W', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790947624722', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-121075', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE3165F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790947624722', NULL, NULL, NULL, NULL, NULL, NULL),
  (23, 'Google User 1790947624722', 'google.user.1790947624722@gmail.com', NULL, '$2y$10$iGTmFOe0UWcxBamlkugRwuSZBShl.NYYh6dk88dEfgnYriS4kNo/2', 'bidder', 'Google SSO Account', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-103277', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', NULL, NULL, NULL),
  (24, 'Test Metal Recycler 1790947679968', 'test.bidder.1790947679968@salvagereef.com', '9820112233', '$2y$10$sq/hNVmht4WipC3keNh3AuEbWxMbgfv6rdyypHOKIXtyeipBdhHfa', 'bidder', 'Test Alloys &amp; Recycling Ltd 1790947679968', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-347344', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27ABCDE8738F1Z5', 'Private Limited', NULL, NULL, 'Test Metal Recycler 1790947679968', NULL, NULL, NULL, NULL, NULL, NULL),
  (25, 'Google User 1790947679968', 'google.user.1790947679968@gmail.com', NULL, '$2y$10$T49jhVvNU0Hc8Z8KHf52SOsAj/KS1zHzKs5T2bcu6XGUBwAvjCyfy', 'bidder', 'Google SSO Account', 'Mumbai', 'Maharashtra', 1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 'SR-694979', NULL, NULL, NULL, NULL, 'ABCDE1234F', '27AAAAA0000A1Z5', 'Proprietorship', 'Industrial Area, Andheri East, Mumbai, Maharashtra 400093', NULL, NULL, 'HDFC Bank Ltd', '50200088991122', 'HDFC0000123', NULL, NULL, NULL);

-- ------------------------------------------------------------
-- Table structure for `auctions`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `auctions`;
CREATE TABLE `auctions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category_id` INT NOT NULL DEFAULT 1,
  `auction_type` ENUM('public', 'private', 'group') NOT NULL DEFAULT 'public',
  `status` ENUM('draft', 'upcoming', 'live', 'closed') NOT NULL DEFAULT 'live',
  `quantity` DECIMAL(12,2) NOT NULL DEFAULT 1.00,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'lot',
  `starting_price` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `current_highest_bid` DECIMAL(14,2) DEFAULT NULL,
  `start_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `end_time` DATETIME DEFAULT NULL,
  `location_city` VARCHAR(100) NOT NULL DEFAULT 'Mumbai',
  `location_state` VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
  `is_group` TINYINT(1) NOT NULL DEFAULT 0,
  `group_id` INT DEFAULT NULL,
  `created_by` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `winner_confirmed` TINYINT(1) DEFAULT 0,
  `winner_user_id` INT DEFAULT NULL,
  `bid_increment` DECIMAL(14,2) DEFAULT 1000.00,
  `winner_h1_user_id` INT DEFAULT NULL,
  `winner_h2_user_id` INT DEFAULT NULL,
  `winner_h3_user_id` INT DEFAULT NULL,
  `awarded_winner_type` VARCHAR(50) DEFAULT NULL,
  `awarded_winner_id` INT DEFAULT NULL,
  `emd_amount` DECIMAL(14,2) DEFAULT 0.00,
  `condition` VARCHAR(100) DEFAULT NULL,
  `pdf_url` VARCHAR(255) DEFAULT NULL,
  KEY `idx_auctions_status` (`status`),
  KEY `idx_auctions_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `auctions` (3 records)
INSERT INTO `auctions` (`id`, `title`, `slug`, `description`, `category_id`, `auction_type`, `status`, `quantity`, `unit`, `starting_price`, `current_highest_bid`, `start_time`, `end_time`, `location_city`, `location_state`, `is_group`, `group_id`, `created_by`, `created_at`, `updated_at`, `winner_confirmed`, `winner_user_id`, `bid_increment`, `winner_h1_user_id`, `winner_h2_user_id`, `winner_h3_user_id`, `awarded_winner_type`, `awarded_winner_id`, `emd_amount`, `condition`, `pdf_url`) VALUES
  (101, '50 MT Industrial Copper Cable Scrap - Grade A Clean Wire', '50-mt-industrial-copper-cable-scrap-grade-a', 'Bulk lot of high-grade copper cables stripped from power sub-station dismantling. Inspection invited at Thane scrap yard. Purity verified at 99.2% Cu.', 2, 'public', 'live', 50, 'MT', 3500000, 3500000, '2026-09-28 08:43:14', '2026-10-09 13:28:13', 'Mumbai', 'Maharashtra', 0, NULL, 1, NULL, NULL, 0, NULL, 10000.0, NULL, NULL, NULL, NULL, NULL, 0.0, NULL, NULL),
  (102, 'CNC Milling Machine 5-Axis (Industrial Plant Dismantling Surplus)', 'cnc-milling-machine-5-axis-surplus-equipment', 'Heavy duty Japanese manufactured 5-axis CNC Milling machine in prime working condition. Includes original control panel, tool changers, and coolant system.', 1, 'public', 'live', 2, 'nos', 8000000, 9200000, '2026-09-28 08:43:14', '2026-10-01 09:43:14', 'Mumbai', 'Maharashtra', 0, NULL, 1, NULL, NULL, 0, NULL, 25000.0, NULL, NULL, NULL, NULL, NULL, 0.0, NULL, NULL),
  (999, '⚡ 7-Day Live Demo Auction: Industrial Copper Armoured Cables & Heavy Melting Steel Scrap Lot', 'live-demo-auction-industrial-copper-cables', 'Official 7-Day Demo Auction Lot for live system testing, PDF spec sheet generation, 2-minute dynamic anti-sniping validation, and multi-user bidding verification. Lot contains sorted commercial grade heavy melting steel (HMS 1 & 2) and high-conductivity copper armoured power cables.', 2, 'public', 'live', 45, 'MT', 500000, 500000, '2026-10-01 07:08:53', '2026-10-09 13:28:13', 'Mumbai', 'Maharashtra', 0, NULL, 1, NULL, NULL, 0, NULL, 10000.0, NULL, NULL, NULL, NULL, NULL, 0.0, NULL, NULL);

-- ------------------------------------------------------------
-- Table structure for `auction_images`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `auction_images`;
CREATE TABLE `auction_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` INT NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_auction_images_auction` (`auction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `auction_images` (5 records)
INSERT INTO `auction_images` (`id`, `auction_id`, `image_path`, `is_primary`, `created_at`, `updated_at`) VALUES
  (12, 101, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', 1, NULL, NULL),
  (13, 102, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80', 1, NULL, NULL),
  (21, 999, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', 1, NULL, NULL),
  (22, 999, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80', 0, NULL, NULL),
  (23, 999, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 0, NULL, NULL);

-- ------------------------------------------------------------
-- Table structure for `bids`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `bids`;
CREATE TABLE `bids` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `amount` DECIMAL(14,2) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) DEFAULT 'approved',
  KEY `idx_bids_auction` (`auction_id`),
  KEY `idx_bids_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `bids` (1 records)
INSERT INTO `bids` (`id`, `auction_id`, `user_id`, `amount`, `created_at`, `status`) VALUES
  (504, 102, 2, 9200000, '2026-09-28 09:33:14', 'approved');

-- ------------------------------------------------------------
-- Table structure for `classifieds`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `classifieds`;
CREATE TABLE `classifieds` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category_id` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `quantity` DECIMAL(12,2) NOT NULL DEFAULT 1.00,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'nos',
  `location_city` VARCHAR(100) NOT NULL DEFAULT 'Mumbai',
  `location_state` VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
  `status` ENUM('available', 'sold') NOT NULL DEFAULT 'available',
  `created_by` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `classifieds` (3 records)
INSERT INTO `classifieds` (`id`, `title`, `slug`, `description`, `category_id`, `price`, `quantity`, `unit`, `location_city`, `location_state`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
  (302, 'Mixed Brass Shell & Valve Scrap - 3 Tons Lot', 'mixed-brass-shell-valve-scrap-3-tons', 'Clean sorted brass shell scrap, plumbing valves, and turning chips. Minimum order 1 MT or take complete 3 MT lot. High brass alloy percentage.', 2, 1250000, 3, 'MT', 'Bhiwandi', 'Maharashtra', 'available', 1, NULL, NULL),
  (303, 'Used 50 HP Kirloskar Diesel Generator Set with Acoustic Canopy', 'used-50-hp-kirloskar-diesel-generator-set', '50 HP Silent DG set with Kirloskar engine and Stamford alternator. Self start battery kit included. 1,400 running hours on meter.', 1, 240000, 1, 'nos', 'Pune', 'Maharashtra', 'available', 1, NULL, NULL),
  (304, 'Server Rack E-Waste Scrap Boards & Green Motherboards', 'server-rack-e-waste-scrap-boards-bulk-lot', 'Bulk lot of telecom and server motherboard scrap for gold and precious metal recovery. Gold plated pins intact.', 1, 95000, 500, 'kg', 'Mumbai', 'Maharashtra', 'available', 1, NULL, NULL);

-- ------------------------------------------------------------
-- Table structure for `classified_images`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `classified_images`;
CREATE TABLE `classified_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `classified_id` INT NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `classified_images` (3 records)
INSERT INTO `classified_images` (`id`, `classified_id`, `image_path`, `is_primary`, `created_at`, `updated_at`) VALUES
  (7, 302, 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80', 1, NULL, NULL),
  (8, 303, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', 1, NULL, NULL),
  (9, 304, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', 1, NULL, NULL);

-- ------------------------------------------------------------
-- Table structure for `sell_scrap_requests`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `sell_scrap_requests`;
CREATE TABLE `sell_scrap_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category_id` INT DEFAULT 1,
  `category_name` VARCHAR(100) DEFAULT 'General Scrap',
  `price` DECIMAL(14,2) DEFAULT 0.00,
  `quantity` DECIMAL(12,2) DEFAULT 1.00,
  `unit` VARCHAR(50) DEFAULT 'MT',
  `location_state` VARCHAR(100) DEFAULT 'Maharashtra',
  `location_city` VARCHAR(100) DEFAULT 'Mumbai',
  `site_address` TEXT DEFAULT NULL,
  `gst_number` VARCHAR(50) DEFAULT NULL,
  `seller_name` VARCHAR(150) NOT NULL,
  `seller_phone` VARCHAR(30) NOT NULL,
  `seller_email` VARCHAR(150) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `user_id` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `enquiry_or_interests`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `enquiry_or_interests`;
CREATE TABLE `enquiry_or_interests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `message` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `personal_access_tokens`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `tokenable_type` VARCHAR(191) NOT NULL DEFAULT 'App\\Models\\User',
  `tokenable_id` BIGINT NOT NULL,
  `name` VARCHAR(191) NOT NULL DEFAULT 'auth_token',
  `token` VARCHAR(64) NOT NULL UNIQUE,
  `abilities` TEXT DEFAULT NULL,
  `last_used_at` DATETIME DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_pat_tokenable` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `system_settings`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(191) NOT NULL UNIQUE,
  `value` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `system_settings` (4 records)
INSERT INTO `system_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
  (1, 'maintenance_mode', 'false', NULL, '2026-08-19 11:20:02'),
  (2, 'maintenance_message', 'SalvageReef is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly!', NULL, '2026-08-19 11:20:02'),
  (13, 'system_mode', 'online', NULL, '2026-08-19 11:20:02'),
  (14, 'temporary_closed_message', 'SalvageReef operations are temporarily closed for standard maintenance and operational update. We will reopen shortly!', NULL, '2026-08-19 11:20:03');

-- ------------------------------------------------------------
-- Table structure for `rate_limits`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `rate_limits`;
CREATE TABLE `rate_limits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `attempts` INT DEFAULT 1,
  `blocked_until` DATETIME DEFAULT NULL,
  `last_attempt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `window_start` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_rate_limits_ip_action` (`ip_address`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `security_logs`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `security_logs`;
CREATE TABLE `security_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `endpoint` VARCHAR(255) DEFAULT NULL,
  `method` VARCHAR(10) DEFAULT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `severity` VARCHAR(20) DEFAULT 'warning',
  `user_id` INT DEFAULT NULL,
  `extra` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `error_logs`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `error_logs`;
CREATE TABLE `error_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `severity` VARCHAR(20) DEFAULT 'error',
  `message` TEXT DEFAULT NULL,
  `exception_class` VARCHAR(191) DEFAULT NULL,
  `file` VARCHAR(255) DEFAULT NULL,
  `line` INT DEFAULT NULL,
  `url` VARCHAR(255) DEFAULT NULL,
  `method` VARCHAR(10) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `stack_trace` TEXT DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT 'unresolved',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `ai_activity_logs`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `ai_activity_logs`;
CREATE TABLE `ai_activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `receipt_code` VARCHAR(100) UNIQUE,
  `action_code` VARCHAR(100) NOT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `status` VARCHAR(30) DEFAULT 'success',
  `parameters_json` LONGTEXT DEFAULT NULL,
  `changes_json` LONGTEXT DEFAULT NULL,
  `developer_notes` TEXT DEFAULT NULL,
  `initiated_by` VARCHAR(100) DEFAULT 'Admin via Salvage AI Copilot',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `ai_custom_features`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `ai_custom_features`;
CREATE TABLE `ai_custom_features` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `feature_key` VARCHAR(100) UNIQUE NOT NULL,
  `feature_name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'general',
  `description` TEXT DEFAULT NULL,
  `config_json` LONGTEXT DEFAULT NULL,
  `code_snippet` LONGTEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `ai_custom_features` (1 records)
INSERT INTO `ai_custom_features` (`id`, `feature_key`, `feature_name`, `category`, `description`, `config_json`, `code_snippet`, `is_active`, `created_at`, `updated_at`) VALUES
  (1, 'feat_1790665650', 'Custom Dynamic Function', 'general', '', '{}', NULL, 1, '2026-09-29 07:07:30', '2026-09-29 07:07:30');

-- ------------------------------------------------------------
-- Table structure for `password_reset_otps`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_otps`;
CREATE TABLE `password_reset_otps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `email` VARCHAR(191) NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `reset_token_hash` VARCHAR(255) DEFAULT NULL,
  `expires_at` DATETIME NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `verified_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Dump completed successfully.