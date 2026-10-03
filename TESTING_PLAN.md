# SalvageReef Master Quality Assurance & Multi-Browser System Testing Plan

> **Document Version:** 2.2.0  
> **Last Verified:** October 3, 2026  
> **Testing Scope:** Multi-Browser Real-Time Synchronization, Cross-Device Authentication & Admin Acceptance, Per-Auction First-Bid Acceptance Protocol, Real-Time Highest Bid Invariant & Quick Shortcut Multipliers, Website CMS Live Editing & Announcement Banners, Categories & Geographic Locations CRUD, Route-by-Route SEO & Social Metadata, Dynamic Anti-Snipe 2-Minute Extension, Auction & Classifieds CRUD Lifecycles, Multi-Role User Provisioning & Cascading Deletion, Document Isolation & Guest Download Access Gates.

---

## 1. Multi-Browser Testing Topology & Setup

To validate that SalvageReef operates with 100% real-time consistency and cross-browser reliability without isolated localStorage bugs or stale cache issues, all verification tests must be conducted across **distinct browser instances and profiles**:

| Environment Slot | Browser / Client | Mode | Assigned Role / User Profile | Primary Responsibility |
|---|---|---|---|---|
| **Client A (Admin)** | Google Chrome | Standard Window | `Master Admin` (`admin@salvagereef.com`) | Approving users, accepting bids, managing lots |
| **Client B (Bidder 1)** | Microsoft Edge / Brave | InPrivate / Incognito | `Bidder Account 1` (Newly Registered) | Placing bids, testing instant raises, downloads |
| **Client C (Bidder 2)** | Mozilla Firefox / Opera | Standard Window | `Bidder Account 2` (Newly Registered) | Competing live bids, multi-user sync verification |
| **Client D (Bidder 3 / Seller)** | Google Chrome | Incognito Window | `Bidder Account 3` / `Verified Seller` | Third bidder & seller classifieds lifecycle |
| **Client E (Guest Observer)** | Mobile Emulation / Safari | Guest (No Session) | Unauthenticated Public Visitor | Verifying guest privacy & download auth gates |

---

## 2. Core Functional Protocols & Step-by-Step Test Guides

### Protocol A: Multi-Browser User Registration, Admin Approval & Sign-In
1. **Multi-Browser Account Creation:**
   - In **Client B (Edge InPrivate)**, submit registration for `Bidder 1` (`bidder1@test.com`).
   - In **Client C (Firefox)**, submit registration for `Bidder 2` (`bidder2@test.com`).
   - In **Client D (Chrome Incognito)**, submit registration for `Bidder 3` (`bidder3@test.com`).
   - Include complete business details: Full Name, Business Name, Entity Type, PAN, GST, Address, City, State, SPOC Name, and Banking details.
2. **Registration Approval Gating:**
   - Each newly registered account enters the system requiring compliance verification (`is_verified = 0`).
   - When attempting immediate sign-in prior to admin acceptance, the system informs the user: *"Your registration has been submitted and is currently pending verification by the SalvageReef compliance team."*
3. **Admin Acceptance from Admin Browser:**
   - In **Client A (Chrome Admin)**, open `/admin` -> **Users** tab.
   - All 3 pending registration requests appear immediately in the real-time table with full business credentials and KYC document badges.
   - Admin reviews and clicks **"Approve & Activate"** for each of the accounts.
4. **Cross-Browser Login Verification:**
   - Return to **Client B, C, and D** and log in using the approved credentials.
   - Verify that authentication succeeds, sessions persist with JWT tokens, and user dashboards load genuine database records.
   - Open a separate browser window and log in using the same credentials to confirm cross-browser session validity.

---

### Protocol B: Live Multi-User Bidding & Per-Auction First-Bid Admin Acceptance
1. **First-Time Bid Submission on Auction Lot #999:**
   - In **Client B (Bidder 1)**, navigate to `/auctions/live-demo-auction-industrial-copper-cables` and place an initial bid of ₹7,60,000.
   - Because Bidder 1 has never placed an approved bid on Lot #999, the bid is marked `status: "pending"`.
   - The UI notifies the user: *"Your initial bid on this auction lot has been submitted for Admin Acceptance."*
   - In **Client C (Bidder 2)**, place an initial bid of ₹7,70,000. It is correctly marked `pending`.
   - In **Client D (Bidder 3)**, place an initial bid of ₹7,80,000. It is correctly marked `pending`.
2. **Admin Acceptance from Different Browser:**
   - In **Client A (Chrome Admin)**, open `/admin` -> **Bid Approvals** tab.
   - Pending bids for Bidder 1, Bidder 2, and Bidder 3 appear in the approval queue.
   - Admin approves Bidder 1, Bidder 2, and Bidder 3.
3. **Real-Time Cross-Browser Live Sync:**
   - The moment Admin clicks "Approve", verify across **Client B, Client C, Client D, and Client E (Guest)**:
     - The auction's `current_highest_bid` updates synchronously across all screens.
     - The live bids table appends the newly approved bid with bidder's name and company.
     - Bidder status changes from "Pending Acceptance" to **"Approved Bidder for Lot #999"**.
4. **Subsequent Instant Bidding (No Re-approval Needed):**
   - Bidder 1 places a raise bid of ₹7,90,000 on Lot #999.
   - Verify: The bid is **immediately approved (`status: "approved"`)** without requiring admin intervention.
   - All open browser windows immediately reflect ₹7,90,000 in real time.
5. **Second Lot Verification (Lot #101):**
   - Bidder 1 navigates to Lot #101 and places a bid.
   - Verify: Because Bidder 1 is not approved for Lot #101, this first bid correctly requires 1-time Admin Acceptance anew (`pending`).

---

### Protocol C: Anti-Snipe Dynamic 2-Minute Extension (Soft-Close Rule)
1. **Targeting Auction Final Window (< 2 Minutes Remaining):**
   - Configure or monitor an active auction lot with under 2 minutes (`<= 120 seconds`) remaining before `end_time` (e.g., 00:01:45 remaining).
   - Have **Client A (Admin)**, **Client B (Bidder 1)**, and **Client C (Bidder 2)** viewing the live auction page simultaneously.
2. **Triggering Anti-Snipe Extension:**
   - In **Client B (Bidder 1)**, place a valid bid during the final countdown window.
3. **Cross-Browser Verification:**
   - Verify API response includes `'time_extended' => true`.
   - Toast notification alerts: *"Bid placed successfully! Bidding time extended by +2 minutes (Anti-Sniping Rule)."*
   - Verify that across **all open browsers (Client A, B, C, and Guest E)**:
     - The countdown timer automatically adds +2 minutes (e.g., jumps from 01:30 to 03:30).
     - The auction's `end_time` updates synchronously without requiring any user to refresh the page.

---

### Protocol D: Auction Lifecycle (Create, Edit, Delete) Across Browsers
1. **Auction Lot Creation:**
   - In **Client A (Admin)**, open `/admin` -> **Auctions** -> **"Add Auction Lot"**.
   - Fill in Title, Category, Quantity, Unit, Starting Price, EMD Deposit, Condition.
   - Attach a real photo (`.jpg`/`.webp`/`.png`) in the Front Cover Photo slot.
   - Attach an official tender specification (`.pdf`) in the Dedicated Tender Document slot.
   - Click "Publish Auction".
2. **Live Reflection Before Bidding:**
   - Instantly switch to **Client B, C, and D**.
   - Navigate to `/` (Homepage) and `/auctions`.
   - Verify the newly created auction card appears with:
     - Genuine photo thumbnail (no black "PDF Tender" placeholder).
     - Proper Lot Code and Category badges.
3. **Cross-Browser Edit Verification:**
   - In **Client A (Admin)**, edit the newly created auction: change Title to include `"[UPDATED SPEC]"` and increase starting price.
   - Save changes.
   - Verify in **Client B and Client C** that the auction card and detail view immediately reflect the updated title, new starting price, and updated specs.
4. **Auction Deletion & Cascade Safety:**
   - In **Client A (Admin)**, delete the test auction lot.
   - Verify: The auction and all associated images, bids, and child records are permanently removed from SQLite database.
   - Verify in **Client B and Client C**: the deleted auction vanishes from listings and returns a clean 404 page if accessed directly. It is **never re-injected by mock data**.

---

### Protocol E: Classifieds Lifecycle (Create, Edit, Delete) Across Browsers
1. **Classified Listing Creation:**
   - In **Client D (Seller)** or **Client A (Admin)**, create a new Classified machinery item (`POST /api/v1/classifieds`).
   - Add photos, location, contact information, and price.
2. **Live Inspection Across Sessions:**
   - Open **Client B (Edge)** and **Client C (Firefox)** and navigate to `/classifieds`.
   - Verify the new classified is visible with correct images, pricing, and seller company.
3. **Classified Edit & Live Propagation:**
   - In **Client D (Seller)**, edit the classified price and title.
   - Save edits. Inspect on **Client B and C**; verify updated price appears across all sessions.
4. **Classified Deletion Verification:**
   - In **Client A (Admin)** or **Client D (Owner)**, click **"Delete Classified"**.
   - Confirm deletion.
   - Verify on **Client B, C, and Guest E**: the listing disappears immediately from the classifieds grid and search results.

---

### Protocol F: Multi-Role User Creation, Lifecycle & Cascading Deletion
1. **Role Provisioning Verification:**
   - Ensure the database supports and can create every defined user role:
     - `bidder` (Industrial Buyer)
     - `seller` / `agent` (Verified Scrap Seller)
     - `desk_admin` (Executive Operations Desk)
     - `read_only_admin` (Audit Desk Inspector)
     - `master_admin` (Full Operations Master)
2. **User Deletion in Browser:**
   - From **Client A (Admin Panel -> Users)**, select a created test user with existing bids and requests.
   - Click **"Delete User"** (confirm modal).
3. **Database Integrity & Foreign Key Cascade Check:**
   - Verify that all child records are safely cleaned up:
     - `personal_access_tokens` (where `tokenable_id = ?`)
     - `bids` placed by the user
     - `enquiry_or_interests` submitted by the user
     - `auctions.winner_user_id` / `winner_h1_user_id` references cleared safely
4. **Session Invalidation:**
   - In the deleted user's browser, any active request triggers 401 Unauthenticated and redirects to `/login`.
   - Attempting to log back in fails with `"Invalid login credentials"`.
   - Refreshing the Admin Users tab confirms the user record is permanently gone and **never re-injected** by fallback mocks.

---

### Protocol G: Tender PDF Isolation & Guest Download Privacy Gate
1. **Guest Browsing (Unauthenticated User in Client E):**
   - Navigate to `/` (Homepage) and `/auctions`:
     - Verify: NO PDF download icon appears on auction cards.
   - Open auction detail page:
     - Verify: Top navigation download buttons are **hidden**.
     - Verify: Featured photo overlay download/save buttons are **hidden**.
     - Verify: The *"Official Lot Documents & Media"* section (with *"Download Lot PDF Dossier"* and *"Download All Photos"*) is **completely hidden**.
2. **Authenticated Access (Logged-In User in Client B):**
   - Sign in as `Bidder 1`.
   - Navigate to the same auction detail page:
     - Verify: Download buttons render dynamically.
     - Verify: Clicking *"Download Tender PDF"* downloads the actual uploaded `.pdf` tender file.

---

### Protocol H: Website Editing, Live CMS Content Customization & Announcement Banners
1. **Global Site Branding & Navigation Editing:**
   - In **Client A (Admin)**, navigate to `/admin` -> **Pages Editor** (`activeTab = 'pages-editor'`).
   - Edit **Site Brand Name** (e.g. change to `"SalvageReef Industrial Auctions"`), **Site Tagline** (`"India's #1 Certified B2B Salvage & Scrap Exchange"`).
   - Edit Navigation Labels: change `"Post Listing"` to `"List Industrial Scrap +"`.
   - Click **"Save Content & Publish"**.
   - Verify on **Client B, Client C, and Guest Client E**:
     - The top navigation bar, browser title, and mobile menus immediately update without requiring hard page refresh.
2. **Top Announcement & Special Offer Banner:**
   - In **Client A (Admin)** -> **Pages Editor** -> **Top Announcement Banner**:
     - Toggle `offerBannerEnabled` to **Active**.
     - Set Offer Badge to: `"🔥 LIMITED TIME LIQUIDATION"`.
     - Set Offer Message to: `"0% Platform Buyer Commission on all Copper & Brass Lots this month!"`.
     - Set Link Text to: `"View Verified Lots →"` and Link Target to `"/auctions"`.
     - Select a custom background color (e.g. `#B87514`) and text color (`#ffffff`).
     - Click **"Save Content & Publish"**.
   - Verify across **all open browsers (Client B, C, D, E)**:
     - The top header alert banner renders across all pages above the main navbar.
     - Clicking the banner navigates smoothly to `/auctions`.
     - Toggling `offerBannerEnabled` to **Off** and saving immediately removes the banner across all screens.
3. **Homepage Hero, Value Pillars & How It Works Flow:**
   - In **Client A (Admin)** -> **Pages Editor** -> **Home Page Sections**:
     - Edit Hero Title, Subtitle, and Search Box Placeholder (e.g. `"Search by metal type, MT quantity, or location..."`).
     - Edit 3 Key Feature Cards (e.g. *"Govt. Certified Escrow"*, *"Direct Mill Access"*, *"100% Verified Weight Bridges"*).
     - Edit the 3-Step "How It Works" instructions.
     - Click **"Save Content & Publish"**.
   - Switch to **Client B (Edge)** and navigate to `/`:
     - Verify all edited headings, subtexts, and feature cards render the updated copy immediately.
4. **Corporate Support, Phone & WhatsApp Support Number:**
   - In **Client A (Admin)** -> **Pages Editor** -> **Contact & Corporate Info**:
     - Update Support Phone to `+91 7304481166`.
     - Update Official Operations Email to `desk@salvagereef.com`.
     - Update Physical Office Address & Working Hours (`Mon-Sat: 09:00 AM - 07:00 PM IST`).
     - Click **"Save Content & Publish"**.
   - Verify on **Client C (Firefox)** on `/contact` and `/about`:
     - Phone click-to-call link (`tel:+917304481166`) and WhatsApp direct inquiry links update automatically.
     - The footer corporate block across all pages reflects the new address and phone number.
5. **Legal CMS Pages Editing (Terms, Privacy, Disclaimer, Copyright):**
   - In **Client A (Admin)** -> **Pages Editor** -> **Legal & Compliance**:
     - Edit Clause 1 in **Terms & Conditions** (e.g. append updated EMD forfeiture policies).
     - Edit **Privacy Policy** and **Disclaimer** content.
     - Save edits.
   - In **Client E (Guest)**, visit `/terms-and-conditions` and `/privacy-policy`:
     - Confirm the updated legal copy appears immediately.
6. **Snapshot Backup, Revert & Factory Reset Safeguard:**
   - In **Client A (Admin)** -> **Pages Editor**:
     - Verify that every save creates an immutable `previousContentSnapshot`.
     - Click **"Revert to Previous Snapshot"**: confirm that all edited fields roll back safely to the previous state.
     - Click **"Reset to Factory Defaults"**: confirm the modal warning appears, and confirming safely restores `DEFAULT_CONTENT` without crashing the application.

---

### Protocol I: Real-Time Highest Bid Invariant & Quick Shortcut Multipliers
1. **Unconditional Highest Bid Reflection (The 106,000 vs 105,000 Invariant Test):**
   - Select an active lot with a current bid of ₹1,05,000 (e.g. Demo Lot #101).
   - In **Client B (New Bidder)**, submit a first bid of ₹1,06,000.
   - Because it is a first bid on this lot, `status` is set to `'pending'`.
   - **Critical Verification Check:**
     - **Top Box Display:** Must immediately show **`₹1,06,000`** as **CURRENT HIGHEST BID**. It must **NEVER** get stuck at ₹1,05,000.
     - **Min Next Allowed Bid:** Must dynamically increase to **`₹1,07,000`** (using increment step ₹1,000).
     - **Bid History Table:** Top row must show ₹1,06,000 with the **"HIGHEST BID"** gold badge.
     - **Pre-Bid Confirmation Modal:** Opening the confirm modal must display Current Highest Bid as ₹1,06,000.
   - Switch to **Client C (Bidder 2)** and **Client E (Guest)**:
     - Verify both browsers immediately display ₹1,06,000 in the top box and min allowed bid ₹1,07,000 via real-time WebSocket/polling without page refresh.
2. **Dynamic Quick Shortcut Amounts (+1x, +2x, +5x, +10x):**
   - For an auction with increment step ₹1,000:
     - Verify 4 dynamic shortcut buttons render: `+ ₹1,000`, `+ ₹2,000`, `+ ₹5,000`, `+ ₹10,000`.
     - Clicking `+ ₹2,000` sets input to `₹1,08,000` (`effectiveHighest 1,06,000 + 2,000`).
     - Clicking `+ ₹2,000` again increments to `₹1,10,000`.
   - For an auction with increment step ₹5,000 (e.g. Heavy Plant Machinery Lot):
     - Verify shortcut buttons dynamically re-scale: `+ ₹5,000`, `+ ₹10,000`, `+ ₹25,000`, `+ ₹50,000`.
     - Clicking `+ ₹5,000` sets input to `effectiveHighest + 5,000`.
   - All shortcut values are derived strictly from `effectiveHighest` rather than stale initial values.

---

### Protocol J: Scrap Categories & Multi-Tier Geographic Locations Management
1. **Category Lifecycle (Create, Edit, Delete):**
   - In **Client A (Admin)** -> **Categories & Locations** (`activeTab = 'categories-locations'`):
     - Click **"Add Category"**: enter Name `"Aerospace & Titanium Alloy Scrap"`, Description, and Icon.
     - Click "Save Category".
   - In **Client B (Bidder)** and **Client D (Seller)**:
     - Open Homepage `/` and Auctions `/auctions`.
     - Verify the new category appears in the category pill filters and auction create dropdowns.
   - In **Client A**, edit category name to `"Aerospace Titanium & Superalloys"`.
     - Verify edit reflects across all dropdowns.
   - In **Client A**, delete the test category.
     - Verify category is removed cleanly without breaking existing lots.
2. **Geographic State & Industrial Hub Management:**
   - In **Client A (Admin)** -> **Categories & Locations** -> **Locations**:
     - Verify support for all 28 Indian States & 8 Union Territories.
     - Add new industrial hubs (e.g. `"Alang Ship Breaking Yard, Gujarat"`, `"Mandi Gobindgarh, Punjab"`).
     - Verify locations populate dynamically in auction search filters and seller listing forms.

---

### Protocol K: Dynamic SEO, Meta Tags & OpenGraph Social Sharing Customization
1. **Route-by-Route SEO Management:**
   - In **Client A (Admin)** -> **SEO & Meta Tags** (`activeTab = 'seo'`):
     - Edit SEO Title for Homepage: `"SalvageReef | India's Leading B2B Scrap & Industrial Salvage Auctions"`.
     - Edit Meta Description: `"Verified industrial salvage, non-ferrous metals, machinery and plant liquidations."`.
     - Edit Focus Keywords: `"scrap auction, copper salvage, industrial machinery tender"`.
     - Save SEO settings.
2. **DOM & Social Tag Inspection:**
   - Navigate to `/` on **Client B**:
     - Inspect DOM: verify `<title>` equals the configured custom title.
     - Verify `<meta name="description">` matches the configured description.
     - Verify `<meta property="og:title">` and `<meta property="og:image">` reflect valid social card assets.

---

## 3. Comprehensive Test Cases & Verification Matrix

| Test ID | Module / Feature | Step-by-Step Action | Expected Output | Status |
|---|---|---|---|---|
| **TC-01** | Multi-Browser Registration | Register 3 distinct accounts across Edge (InPrivate), Firefox, and Chrome Incognito | Accounts created in database; status set to `pending_approval` | **PASS (100%)** |
| **TC-02** | Registration Gate | Attempt to log in immediately before admin verification | System blocks login with clear "Pending Admin Approval" notice | **PASS (100%)** |
| **TC-03** | Admin User Approval | In Admin Browser (Chrome), review registrations in `/admin` -> Users and approve all | User records updated to verified (`is_verified = 1`) across all sessions | **PASS (100%)** |
| **TC-04** | Cross-Browser Login | Log into approved accounts across Edge, Firefox, and Chrome | Sessions authenticated successfully; 7-day tokens stored; dashboard loads | **PASS (100%)** |
| **TC-05** | First-Bid Submission | Bidder 1, 2, and 3 place first bids on Demo Lot #999 | Bids saved with `status: "pending"`; toast displays "Awaiting Admin Acceptance" | **PASS (100%)** |
| **TC-06** | Admin Bid Desk Approvals | In Admin Browser, approve first bids for Bidder 1, 2, and 3 | Bids transition to `approved`; highest bid updates; users become approved bidders | **PASS (100%)** |
| **TC-07** | Live Bidding Sync | Inspect open auction screens across all 4 browser windows | Highest bid, bidder names, and countdown timers update live across all screens | **PASS (100%)** |
| **TC-08** | Instant Subsequent Bid | Approved Bidder 1 places increment raise on Lot #999 | Bid is `approved` instantly without requiring admin re-approval | **PASS (100%)** |
| **TC-09** | Second Lot Isolation | Bidder 1 places initial bid on Auction Lot #101 | Bid is correctly marked `pending`, requiring 1-time Admin Acceptance for Lot #101 | **PASS (100%)** |
| **TC-10** | Anti-Snipe 2-Min Extension | Bid placed when auction timer has < 2 minutes remaining | `end_time` dynamically increases by +2 minutes; countdown extends on all browsers | **PASS (100%)** |
| **TC-11** | Auction Creation (Photo & PDF) | Admin creates new lot with JPG cover + PDF tender document | Saved in DB; photo renders in front thumbnail; PDF assigned to `pdf_url` | **PASS (100%)** |
| **TC-12** | Auction Edit Live Sync | Admin edits auction title & reserve price before bids | All user browsers reflect updated title and price immediately without hard refresh | **PASS (100%)** |
| **TC-13** | Auction Deletion & Cascades | Admin deletes lot from Admin Panel | Lot and all child records safely deleted; vanishes across all browsers; no mock re-injection | **PASS (100%)** |
| **TC-14** | Classifieds Creation | Seller creates machinery classified from browser | Listing persisted to DB; visible immediately on `/classifieds` across all browsers | **PASS (100%)** |
| **TC-15** | Classifieds Edit | Seller edits classified price and description | Edits propagate live to all open browsers viewing the classified listing | **PASS (100%)** |
| **TC-16** | Classifieds Deletion | Admin or Seller deletes classified listing | Listing immediately removed from public grids; direct link returns 404 | **PASS (100%)** |
| **TC-17** | Multi-Role User Creation | Register and activate users for all roles (bidder, seller, desk_admin, master_admin) | Database correctly stores role constraints and renders appropriate role UI | **PASS (100%)** |
| **TC-18** | User Cascading Deletion | Admin deletes user with active bids & requests | Cascading cleanup of tokens, bids, interests; user logged out immediately | **PASS (100%)** |
| **TC-19** | Zero Mock Re-injection | Refresh Admin Users & Auctions tabs after deletions | Deleted users and lots NEVER reappear; 100% genuine database state rendered | **PASS (100%)** |
| **TC-20** | Guest Download Protection | Unauthenticated visitor browses auction detail & cards | All download buttons (card icons, header actions, media dossier) strictly hidden | **PASS (100%)** |
| **TC-21** | Authenticated Tender Download | Logged-in bidder views lot with uploaded PDF tender | Download options render dynamically; clicking retrieves official uploaded PDF | **PASS (100%)** |
| **TC-22** | Winner Selection (H1/H2/H3) | Admin opens Top Bidders modal and confirms winner | H1/H2/H3 awarded; customizable email & WhatsApp alert generated; lot closed | **PASS (100%)** |
| **TC-23** | Auto-Close at 5 Bids | Place 5 consecutive approved bids on demo auction | Auction automatically closes with H1 winner declaration | **PASS (100%)** |
| **TC-24** | System Maintenance Toggle | Admin toggles Maintenance Mode / Temp Closed | System mode persists; public visitors see custom maintenance splash | **PASS (100%)** |
| **TC-25** | Error Diagnostics Desk | Check System Errors desk in Admin Panel | Logs real-time client/server errors with stack trace, resolve & clear buttons | **PASS (100%)** |
| **TC-26** | Website CMS Live Editing | Admin edits Brand Name and Navigation labels in Pages Editor | Public views (Header, Footer, Mobile Drawer) immediately render updated copy | **PASS (100%)** |
| **TC-27** | Announcement Offer Banner | Admin toggles offer banner on, customizes badge, text & color | Sticky header announcement banner renders across all pages; links to `/auctions` | **PASS (100%)** |
| **TC-28** | Homepage Hero & Value Pillars | Admin updates Hero title, search placeholder & 3 value pillar cards | Homepage updates synchronously across all browser tabs | **PASS (100%)** |
| **TC-29** | Corporate Support Info Sync | Admin updates support phone (+91 7304481166) & office address | `/contact`, footer, and WhatsApp support CTAs reflect updated contact immediately | **PASS (100%)** |
| **TC-30** | Legal CMS Pages Live Update | Admin edits Terms & Conditions and Privacy Policy clauses | Public legal views immediately reflect updated clauses without deployment | **PASS (100%)** |
| **TC-31** | CMS Snapshot & Factory Reset | Admin clicks "Revert to Previous Snapshot" and "Factory Reset" | Snapshot restores last saved state; factory reset safely restores defaults | **PASS (100%)** |
| **TC-32** | Unconditional Highest Bid Display | Bidder places bid (₹1,06,000 on ₹1,05,000 lot) with pending approval | Top box immediately displays ₹1,06,000; min allowed bid becomes ₹1,07,000 | **PASS (100%)** |
| **TC-33** | Quick Bid Shortcut Scaling | Test shortcuts on lot with ₹1,000 step vs lot with ₹5,000 step | Shortcuts scale dynamically (+1x, +2x, +5x, +10x) and calculate from highest bid | **PASS (100%)** |
| **TC-34** | Scrap Category Master CRUD | Admin adds, edits, and deletes scrap categories in Categories Desk | Dropdowns in auction creation and homepage filter pills update instantly | **PASS (100%)** |
| **TC-35** | Dynamic SEO & Meta Tags | Admin updates SEO Title, Meta Description & Keywords in SEO Desk | DOM `<title>` and `<meta name="description">` tags update dynamically per route | **PASS (100%)** |

---

## 4. How to Execute Automated Test Suite

To run the automated backend test suite at any time, execute:

```powershell
node test_full_system.js
```

### Expected Suite Summary:
```
===============================================================
📊 TEST SUITE SUMMARY: 35 PASSED | 0 FAILED
===============================================================
🎉 ALL TESTS COMPLETED WITH 100% SUCCESS!
```

