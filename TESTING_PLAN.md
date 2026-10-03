# SalvageReef Master Quality Assurance & Multi-Browser System Testing Plan

> **Document Version:** 2.0.0  
> **Last Verified:** October 3, 2026  
> **Testing Scope:** Multi-Browser Real-Time Synchronization, Cross-Device Authentication & Admin Acceptance, Per-Auction First-Bid Acceptance Protocol, Dynamic Anti-Snipe 2-Minute Extension, Auction & Classifieds CRUD Lifecycles, Multi-Role User Provisioning & Cascading Deletion, Document Isolation & Guest Download Access Gates.

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

---

## 4. How to Execute Automated Test Suite

To run the automated backend test suite at any time, execute:

```powershell
node test_full_system.js
```

### Expected Suite Summary:
```
===============================================================
📊 TEST SUITE SUMMARY: 25 PASSED | 0 FAILED
===============================================================
🎉 ALL TESTS COMPLETED WITH 100% SUCCESS!
```
