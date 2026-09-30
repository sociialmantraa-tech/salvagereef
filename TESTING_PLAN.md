# SalvageReef Master Quality Assurance & System Testing Plan

> **Document Version:** 1.0.0  
> **Last Verified:** September 30, 2026  
> **Scope:** Authentication, Admin-to-User State Synchronization, Per-Auction Bidder Approval Workflow, Scrap Requests, Content Management, Multi-Browser Consistency.

---

## 1. System Architecture & Bidding Acceptance Model

### 1.1 Per-Auction First-Bid Admin Acceptance Rule
1. **First-Time Bid on Any Auction Lot ($A$):**
   - When any registered user places their very first bid on auction $A$, the bid is saved with `status: "pending"`.
   - The user interface notifies the bidder: *"Your initial bid on this auction lot has been submitted for Admin Acceptance."*
   - The bid immediately appears in the Admin Panel under **Bids / Approvals Desk** (`/admin` -> Bid Approvals).
   - While pending, the user cannot place conflicting bids on this lot until approved.

2. **Admin Acceptance:**
   - Admin reviews the bid in the Admin Panel and clicks **"Accept / Approve"** (API: `PUT /api/v1/admin/bids/:id/status` -> `approved`).
   - The bid status becomes `"approved"`, and the auction's `current_highest_bid` is updated.
   - A real-time WebSocket / SSE broadcast (`bid_status_updated`) and polling sync notifies the bidder's browser.

3. **Subsequent Instant Bidding on Approved Lot ($A$):**
   - Once approved for auction $A$, the user is officially an **Approved Bidder for Lot $A$**.
   - All subsequent bids (raises/increments) placed by this user on auction $A$ are **immediately approved (`status: "approved"`)** without requiring further admin intervention.
   - The auction's highest bid and live stream update instantly.

4. **Second Auction Lot ($B$):**
   - When the same user navigates to a different auction lot $B$ and places a bid:
   - Because they are not yet approved for lot $B$, their first bid on lot $B$ **requires 1-time Admin Acceptance** anew (`status: "pending"`).
   - Once approved on lot $B$, they can increase bids on lot $B$ freely.

---

## 2. Comprehensive Test Cases & Verification Matrix

| Test ID | Module / Feature | Step-by-Step Action | Expected Output | Status |
|---|---|---|---|---|
| **TC-01** | User Registration | Submit registration form with Name, Email, Password, Company, GST/PAN | User created in DB (`dev_users.json` / SQLite `users`), returns JWT token | **PASS (100%)** |
| **TC-02** | Admin User Visibility | Open Admin Panel (`/admin` -> Users tab) | Newly registered user appears in table with all business details & KYC badge | **PASS (100%)** |
| **TC-03** | User Sign-In | Log in on `/login` using registered Email & Password | Auth credentials verified, session active with 7-day token persistence | **PASS (100%)** |
| **TC-04** | Initial Bid (Lot #999) | Place bid of ₹7,60,000 on Demo Auction #999 | Bid marked `status: "pending"`; toast displays "Awaiting Admin Acceptance" | **PASS (100%)** |
| **TC-05** | Admin Bid Desk | Open Admin Panel -> Bid Approvals tab | Pending bid appears in approval queue with 1-click "Approve" button | **PASS (100%)** |
| **TC-06** | Admin Bid Approval | Admin clicks "Approve" on pending bid | Bid status becomes `approved`; auction `current_highest_bid` updates | **PASS (100%)** |
| **TC-07** | Subsequent Bid (Lot #999) | Same user places raise bid of ₹7,80,000 on Lot #999 | Bid is `approved` instantly without requiring admin re-approval | **PASS (100%)** |
| **TC-08** | Second Lot (Lot #101) | Same user places first bid on Auction Lot #101 | Bid is correctly marked `pending`, requiring 1-time Admin Acceptance for Lot #101 | **PASS (100%)** |
| **TC-09** | Admin Dashboard Stats | View `/admin` Overview tab | Displays live stats (Auctions, Bids, Users, Scrap Requests, Pending Approvals) | **PASS (100%)** |
| **TC-10** | Sell Scrap Requests | User submits scrap pickup; Admin updates status | Request persisted to DB; Admin can approve, reject, or delete requests | **PASS (100%)** |
| **TC-11** | Winner Selection (H1/H2/H3) | Admin opens Top Bidders modal and confirms winner | H1/H2/H3 awarded; customizable email & WhatsApp alert generated; lot closed | **PASS (100%)** |
| **TC-12** | System Maintenance Toggle | Admin toggles Maintenance Mode / Temp Closed | System mode persists; public visitors see custom maintenance splash | **PASS (100%)** |
| **TC-13** | Error Diagnostics Desk | Check System Errors desk | Logs real-time client/server errors with stack trace, resolve & clear buttons | **PASS (100%)** |

---

## 3. How to Execute Automated Test Suite

To run the complete test suite at any time, execute:

```powershell
node test_full_system.js
```

### Expected Output:
```
===============================================================
📊 TEST SUITE SUMMARY: 25 PASSED | 0 FAILED
===============================================================
🎉 ALL TESTS COMPLETED WITH 100% SUCCESS!
```
