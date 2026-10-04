# SalvageReef — Master System Architecture & Technical Specifications

> **System Status**: Active & Production-Ready  
> **Production Domain**: [https://salvagereef.com](https://salvagereef.com)  
> **Last Updated**: October 2026  

---

## 1. Executive Summary & Stack Overview

**SalvageReef** is an enterprise-grade B2B Industrial Scrap Auctions & Classifieds Marketplace platform. It allows scrap sellers, buyers, bidders, and desk admins to participate in online auctions, manage classified listings, submit buyer tenders, and handle corporate KYC compliance.

### Core Technology Stack
- **Frontend Framework**: React 18 with TypeScript & Vite
- **Routing & State**: React Router 6, Context API, LocalStorage persistence
- **Styling**: Tailwind CSS & Modern Vanilla CSS Design Tokens
- **Backend API**: PHP 8.x Single-File REST Engine (`backend/server.php`)
- **Security & Headers Engine**: `backend/security_config.php`
- **Database Engines**:
  - **cPanel Production MySQL**: Database `scrab` | User `scrab_user` | Host `127.0.0.1:3306`
  - **Zero-Config SQLite**: `backend/database/database.sqlite` (File mode `0666`)
  - **MySQL Dump Schema**: `salvagereef_mysql.sql`
- **Web Server Compatibility**: Apache / LiteSpeed / GoDaddy cPanel FastCGI

---

## 2. Directory & Website File Structure

```
scrab/
├── backend/
│   ├── database/
│   │   └── database.sqlite             # Primary SQLite Database (0666 permissions)
│   ├── logs/                           # System, Security & Error Logs
│   ├── security_config.php             # Rate limiting, CORS, token validation rules
│   ├── server.php                      # Main API endpoint engine & routing
│   ├── .htaccess                       # Apache rewrite rules & Bearer token header forwarding
│   ├── seed_db.php                     # Standalone database reset/seeder script
│   └── index.php                       # Entry point fallback
├── frontend/
│   ├── src/
│   │   ├── components/                 # React UI Components (Navbar, Footer, Modals)
│   │   ├── context/                    # AuthContext & Session state providers
│   │   ├── services/                   # API Axios/Fetch client (`api.ts`, `mockService.ts`)
│   │   ├── types/                      # TypeScript Interface definitions
│   │   ├── views/                      # Main Page Views (Home, Auctions, Classifieds, Admin)
│   │   └── App.tsx                     # Main App Component & Router configuration
│   ├── dist/                           # Vite production output build
│   └── vite.config.ts                  # Vite build options
├── deploy_hosting/
│   └── public_html/                    # Production deployment root directory
│       ├── assets/                     # Compiled JavaScript, CSS, and media bundles
│       ├── backend/                    # Production PHP backend files & SQLite database
│       ├── uploads/                    # Uploaded KYC documents, images, and auction PDFs
│       ├── .htaccess                   # Production SPA router & API rewrite rules
│       └── index.html                  # Root HTML entry point
├── build_hosting_package.cjs           # Automated Vite build & cPanel ZIP bundler script
├── salvagereef_FULL_UPLOAD.zip         # First-time full hosting deployment package
├── salvagereef_UPDATE_SAFE_NO_DATABASE.zip # Code-only update package (preserves SQLite DB)
├── salvagereef_mysql.sql               # Full MySQL database dump script
├── test_full_system.js                 # 46-test automated backend & live site test suite
├── AGENTS.md                           # Project standards & guidelines
└── PROJECT_SYSTEM_ARCHITECTURE.md      # Master System Architecture (This file)
```

---

## 3. Pre-Seeded User Accounts & Access Credentials

The database comes pre-seeded with 6 role-based user accounts for testing and administration:

| Role Name | Login ID | Email | Default Password | Access Level & Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Master Admin** | `SR-ADMIN` | `admin@salvagereef.com` | `sociial123` | Full System Control (Auctions, Classifieds, Users, Rates, Bids, Winner Confirmation, Errors) |
| **Executive Desk Admin** | `SR-EXEC-1` | `executive@salvagereef.com` | `execadmin123` | Operational Admin Desk (Bid Approvals, Tender Moderation, Lot Creation) |
| **Desk Admin (Read-Only)** | `SR-DESK-1` | `inspector@salvagereef.com` | `deskadmin123` | Audit & Monitoring Desk (View-only access to all dashboards) |
| **Verified Seller** | `SR-SELLER-1` | `seller@salvagereef.com` | `SellerPass@2026` | Verified Scrap Seller (Apex Scrap Recyclers Ltd - Can list scrap & lots) |
| **Verified Bidder** | `SR-BIDDER-1` | `bidder@salvagereef.com` | `BidderPass@2026` | Verified Scrap Bidder (Neelkanth Sharma / Metals & Alloys Co - Can place bids & tenders) |
| **Pending Seller** | `SR-SELLER-2` | `rajesh@rajeshmetals.com` | `Rajesh@2026` | Pending Registration Seller (Rajesh Industrial Scrap Traders - Awaiting verification) |

---

## 4. Database Schemas & Table Specifications

The SQLite database (`backend/database/database.sqlite`) contains 14 structured tables:

### 1. `users`
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT), `email` (TEXT UNIQUE), `login_id` (TEXT), `password` (TEXT HASH)
- `phone` (TEXT), `role` (`admin` | `master_admin` | `desk_admin` | `read_only_admin` | `agent` | `bidder`)
- `company_name` (TEXT), `entity_type` (TEXT), `pan_number` (TEXT), `gst_number` (TEXT)
- `registered_address` (TEXT), `city` (TEXT), `state` (TEXT), `pincode` (TEXT)
- `spoc_name` (TEXT), `bank_name` (TEXT), `bank_account_number` (TEXT), `bank_ifsc_code` (TEXT)
- `is_verified` (1/0), `is_email_verified` (1/0), `is_phone_verified` (1/0), `is_active` (1/0)

### 2. `personal_access_tokens`
- `id` (INTEGER PRIMARY KEY)
- `tokenable_type` (TEXT), `tokenable_id` (INTEGER -> `users.id`)
- `name` (TEXT), `token` (TEXT UNIQUE), `abilities` (TEXT)
- `last_used_at` (DATETIME), `expires_at` (DATETIME), `created_at` (DATETIME)

### 3. `auctions`
- `id` (INTEGER PRIMARY KEY)
- `title` (TEXT), `slug` (TEXT), `description` (TEXT), `condition` (TEXT)
- `category_id` (INTEGER -> `categories.id`), `auction_type` (`public` | `private` | `group`)
- `status` (`live` | `upcoming` | `closed` | `draft`)
- `quantity` (NUMERIC), `unit` (TEXT), `starting_price` (NUMERIC), `current_highest_bid` (NUMERIC)
- `bid_increment` (NUMERIC), `emd_amount` (NUMERIC), `location_city` (TEXT), `location_state` (TEXT)
- `start_time` (DATETIME), `end_time` (DATETIME)
- `created_by` (INTEGER -> `users.id`), `winner_confirmed` (0/1)
- `winner_h1_user_id` (INTEGER), `winner_h2_user_id` (INTEGER), `winner_h3_user_id` (INTEGER)
- `awarded_winner_type` (`h1` | `h2` | `h3`), `awarded_winner_id` (INTEGER -> `users.id`)
- `pdf_url` (TEXT)

### 4. `auction_images`
- `id` (INTEGER PRIMARY KEY), `auction_id` (INTEGER -> `auctions.id`), `image_path` (TEXT), `is_primary` (0/1)

### 5. `bids`
- `id` (INTEGER PRIMARY KEY), `auction_id` (INTEGER -> `auctions.id`), `user_id` (INTEGER -> `users.id`), `amount` (NUMERIC), `status` (`approved` | `pending` | `rejected`), `created_at` (DATETIME)

### 6. `classifieds`
- `id` (INTEGER PRIMARY KEY), `title` (TEXT), `slug` (TEXT), `description` (TEXT), `category_id` (INTEGER), `price` (NUMERIC), `quantity` (NUMERIC), `unit` (TEXT), `location_city` (TEXT), `location_state` (TEXT), `status` (`available` | `sold` | `hidden`), `created_by` (INTEGER -> `users.id`)

### 7. `classified_images`
- `id` (INTEGER PRIMARY KEY), `classified_id` (INTEGER -> `classifieds.id`), `image_path` (TEXT), `is_primary` (0/1)

### 8. `enquiry_or_interests` (Buyer Tenders)
- `id` (INTEGER PRIMARY KEY), `auction_id` (INTEGER -> `auctions.id`), `user_id` (INTEGER -> `users.id`), `message` (TEXT), `status` (`pending` | `approved` | `rejected`)

### 9. `sell_scrap_requests`
- `id` (INTEGER PRIMARY KEY), `title` (TEXT), `seller_name` (TEXT), `seller_phone` (TEXT), `seller_email` (TEXT), `price` (NUMERIC), `quantity` (NUMERIC), `unit` (TEXT), `location_city` (TEXT), `location_state` (TEXT), `status` (`pending` | `approved`)

### 10. `categories`, `locations`, `system_settings`, `error_logs`, `security_logs`, `rate_limits`, `ai_activity_logs`, `ai_custom_features`

---

## 5. Zero-Maintenance Safeguards & Auto-Healing Mechanisms

To guarantee that the platform **never renders empty listing screens** on `/auctions` or `/classifieds` even after months without manual administration, the backend implements the `ensureActiveContentAutoSeeded($pdo)` routine on every API initialization:

1. **Unawarded Auction Auto-Renewal**:
   - Any auction whose `end_time` passes in the database without an admin officially awarding a winner (`winner_confirmed = 0`) automatically has its `end_time` extended to **+7 days from current time** and remains marked `status = 'live'`.
2. **Live Auctions Auto-Seeding**:
   - If the total count of `status = 'live'` auctions drops below 3, the system automatically reactivates or seeds 3 default high-grade industrial scrap lots (Copper Cable Scrap, HMS Steel Lot, CNC Milling Machine).
3. **Classified Listings Auto-Seeding**:
   - If the total count of active classified listings drops below 3, the system automatically reactivates or seeds 3 default classified listings (Server Rack E-Waste, Kirloskar Diesel Generator, Brass Shell Scrap).

---

## 6. Authentication Architecture & Header Forwarding

- **Token Storage**: User sessions are stored in `personal_access_tokens` table.
- **Header Parsing**: The backend checks `Authorization: Bearer <token>`, `REDIRECT_HTTP_AUTHORIZATION` (Apache CGI/FastCGI environment variable), and `?token=` request parameters.
- **Apache Header Rule (`backend/.htaccess`)**:
  ```apache
  RewriteEngine On
  RewriteCond %{HTTP:Authorization} ^(.*)
  RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]
  ```

---

## 7. Build, Deployment & Maintenance Procedures

To generate production deployment bundles:
```bash
node build_hosting_package.cjs
```
This produces two ZIP archives:
- `salvagereef_FULL_UPLOAD.zip`: First-time deployment including full database setup.
- `salvagereef_UPDATE_SAFE_NO_DATABASE.zip`: Update package that updates code without overwriting active database records.

---
*Document saved to repository for permanent reference.*
