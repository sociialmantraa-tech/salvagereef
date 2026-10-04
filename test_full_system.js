/**
 * Comprehensive SalvageReef End-to-End System Test Suite
 * Tests all requirements:
 * 1. User Registration & Admin Panel User List Visibility
 * 2. User Sign-in verification with registered credentials
 * 3. Per-auction first-bid Admin Acceptance workflow
 * 4. Subsequent instant bid increment without approval on approved lot
 * 5. Second auction first-bid requiring approval anew
 * 6. Full admin panel features & endpoints verification
 */

const http = require('http');
const https = require('https');

const isLive = process.argv.includes('--live');
const isDev = process.argv.includes('--dev');
const BASE_URL = isLive 
  ? 'https://salvagereef.com/backend/server.php/api/v1' 
  : (isDev ? 'http://localhost:5173/api/v1' : 'http://127.0.0.1:8000/backend/server.php/api/v1');

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const client = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 SalvageReefTestSuite/2.0',
        ...headers,
      },
    };

    const req = client.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => { resBody += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.statusCode, data: parsed, raw: resBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: resBody, raw: resBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTestSuite() {
  const { execSync } = require('child_process');
  try {
    execSync('C:\\\\xampp\\\\php\\\\php.exe backend/reset_test_auctions.php', { stdio: 'ignore' });
  } catch (e) {}

  let targetAuctionId = 999;
  let secondAuctionId = 101;

  try {
    const auc1Res = await request('POST', '/admin/auctions', {
      title: '50 MT Industrial Copper Cable Scrap Grade-A',
      slug: '50-mt-industrial-copper-cable-scrap-grade-a',
      category_id: 1,
      description: 'High grade copper cable scrap from factory decommissioning.',
      starting_price: 750000,
      current_highest_bid: 750000,
      bid_increment: 1000,
      emd_amount: 50000,
      quantity: '50 MT',
      location_city: 'Mumbai',
      location_state: 'Maharashtra',
      status: 'live',
      winner_confirmed: 0,
      awarded_winner_type: null,
      winner_user_id: null,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 864000000).toISOString(),
      auction_type: 'public'
    }, { Authorization: 'Bearer sr_master_admin_token' });
    if (auc1Res.data?.id) targetAuctionId = auc1Res.data.id;

    const auc2Res = await request('POST', '/admin/auctions', {
      title: '100 MT Heavy Melting Steel (HMS 1&2) Scrap Lot',
      slug: '100-mt-heavy-melting-steel-hms-scrap-lot',
      category_id: 1,
      description: 'Industrial structural steel beams, plates, and heavy machinery scrap.',
      starting_price: 4000000,
      current_highest_bid: 4000000,
      bid_increment: 5000,
      emd_amount: 100000,
      quantity: '100 MT',
      location_city: 'Navi Mumbai',
      location_state: 'Maharashtra',
      status: 'live',
      winner_confirmed: 0,
      awarded_winner_type: null,
      winner_user_id: null,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 864000000).toISOString(),
      auction_type: 'public'
    }, { Authorization: 'Bearer sr_master_admin_token' });
    if (auc2Res.data?.id) secondAuctionId = auc2Res.data.id;
  } catch (e) {}

  console.log('===============================================================');
  console.log('🚀 STARTING SALVAGEREEF COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testUserEmail = `test.bidder.${timestamp}@salvagereef.com`;
  const testUserPass = `SecurePass@${timestamp}`;
  const testUserName = `Test Metal Recycler ${timestamp}`;
  const testCompanyName = `Test Alloys & Recycling Ltd ${timestamp}`;

  let userToken = '';
  let registeredUserId = null;
  let firstAuctionBidId = null;

  // ---------------------------------------------------------------------------
  // TEST CASE 1: User Registration
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. USER REGISTRATION & PERSISTENCE ---');
  const regRes = await request('POST', '/auth/register', {
    name: testUserName,
    email: testUserEmail,
    password: testUserPass,
    phone: '9820112233',
    company_name: testCompanyName,
    entity_type: 'Private Limited',
    pan_number: 'ABCDE1234F',
    gst_number: `27ABCDE${Math.floor(1000 + Math.random() * 9000)}F1Z5`,
    city: 'Mumbai',
    state: 'Maharashtra',
    role: 'bidder',
  });

  assert(regRes.status === 201 || regRes.status === 200, 'Registration API returns HTTP 200/201', `Status: ${regRes.status}`);
  assert(regRes.data?.user?.email === testUserEmail, 'Registered user object has matching email', JSON.stringify(regRes.data));
  assert(Number(regRes.data?.user?.is_verified) === 0, 'New manual registration is NOT auto-approved (is_verified = 0, requires Admin approval)', JSON.stringify(regRes.data?.user));
  userToken = regRes.data?.token || '';
  registeredUserId = regRes.data?.user?.id;

  // ---------------------------------------------------------------------------
  // TEST CASE 2: User in Admin Panel & Admin Approval
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. ADMIN PANEL USER VISIBILITY & APPROVAL ---');
  const adminUsersRes = await request('GET', '/admin/users', null, { Authorization: 'Bearer sr_master_admin_token' });
  assert(adminUsersRes.status === 200, 'Admin users list API returns HTTP 200', `Status: ${adminUsersRes.status}`);
  const usersList = adminUsersRes.data?.data || adminUsersRes.data || [];
  const foundUserInAdmin = usersList.find((u) => u.email === testUserEmail || Number(u.id) === Number(registeredUserId));
  assert(!!foundUserInAdmin, `Registered user "${testUserEmail}" is visible in Admin Panel Users list`, `Found: ${!!foundUserInAdmin}`);
  assert(Number(foundUserInAdmin?.is_verified) === 0, 'User status in Admin Panel is unverified / pending approval');

  // Admin approves the user account
  const approveUserRes = await request('PUT', `/admin/users/${registeredUserId}/verify`, { is_verified: 1 }, { Authorization: 'Bearer sr_master_admin_token' });
  assert(approveUserRes.status === 200, 'Admin approves user via PUT /admin/users/:id/verify', `Status: ${approveUserRes.status}`);

  // Verify user is now verified
  const adminUsersAfterRes = await request('GET', '/admin/users', null, { Authorization: 'Bearer sr_master_admin_token' });
  const usersListAfter = adminUsersAfterRes.data?.data || adminUsersAfterRes.data || [];
  const approvedUserInAdmin = usersListAfter.find((u) => Number(u.id) === Number(registeredUserId));
  assert(Number(approvedUserInAdmin?.is_verified) === 1, 'User is now verified & approved in Admin Panel (is_verified = 1)');

  // ---------------------------------------------------------------------------
  // TEST CASE 2b: Google Sign-In/Sign-Up (Instant Access, No Approval Needed)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2b. GOOGLE SIGN-UP (INSTANT ACCESS WITHOUT APPROVAL) ---');
  const googleEmail = `google.user.${timestamp}@gmail.com`;
  const googleRes = await request('POST', '/auth/google', {
    email: googleEmail,
    name: `Google User ${timestamp}`,
  });
  assert(googleRes.status === 200 || googleRes.status === 201, 'Google auth returns HTTP 200/201', `Status: ${googleRes.status}`);
  assert(Number(googleRes.data?.user?.is_verified) === 1, 'Google sign-up user is INSTANTLY verified without requiring admin approval!');

  // ---------------------------------------------------------------------------
  // TEST CASE 3: Sign In with Registered Email & Password
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. USER SIGN-IN VERIFICATION ---');
  const loginRes = await request('POST', '/auth/login', {
    email: testUserEmail,
    password: testUserPass,
  });
  assert(loginRes.status === 200, 'Sign-in with registered email & password returns HTTP 200', `Status: ${loginRes.status}`);
  assert(loginRes.data?.user?.email === testUserEmail, 'Sign-in returns valid authenticated user object');
  const loginToken = loginRes.data?.token;
  assert(!!loginToken, 'Sign-in generates valid bearer access token');

  // ---------------------------------------------------------------------------
  // TEST CASE 4: First Bid on Demo Auction (Requires Admin Approval)
  // ---------------------------------------------------------------------------
  console.log(`\n--- 4. PER-AUCTION FIRST BID (DEMO AUCTION #${targetAuctionId}) ---`);
  const firstBidRes = await request('POST', `/auctions/${targetAuctionId}/bid`, { amount: 760000 }, { Authorization: `Bearer ${loginToken}` });
  assert(firstBidRes.status === 200, 'First bid placement returns HTTP 200', `Status: ${firstBidRes.status}`);
  assert(firstBidRes.data?.status === 'pending' || firstBidRes.data?.requires_admin_approval === true, 'First bid is marked as PENDING (requires Admin Acceptance)', JSON.stringify(firstBidRes.data));
  firstAuctionBidId = firstBidRes.data?.bid?.id || firstBidRes.data?.bid_id;

  // Verify first bid appears in Admin Bids list
  const adminBidsRes = await request('GET', '/admin/bids', null, { Authorization: 'Bearer sr_master_admin_token' });
  const allBids = adminBidsRes.data?.data || adminBidsRes.data?.bids || [];
  const foundPendingBid = allBids.find((b) => (firstAuctionBidId && String(b.id) === String(firstAuctionBidId)) || (String(b.user_id) === String(registeredUserId) && String(b.auction_id) === String(targetAuctionId)));
  assert(!!foundPendingBid, `Pending initial bid #${firstAuctionBidId} appears in Admin Panel Bids approval queue`, `Found: ${!!foundPendingBid}`);
  assert(foundPendingBid?.status === 'pending', 'Bid status in admin panel is "pending"');

  // ---------------------------------------------------------------------------
  // TEST CASE 5: Admin Approves the First Bid on Auction
  // ---------------------------------------------------------------------------
  console.log(`\n--- 5. ADMIN ACCEPTS / APPROVES FIRST BID ON LOT #${targetAuctionId} ---`);
  const approveBidRes = await request('PUT', `/admin/bids/${firstAuctionBidId || foundPendingBid?.id}/status`, { status: 'approved' }, { Authorization: 'Bearer sr_master_admin_token' });
  assert(approveBidRes.status === 200, 'Admin approve bid API returns HTTP 200', `Status: ${approveBidRes.status}`);

  // ---------------------------------------------------------------------------
  // TEST CASE 6: Subsequent Bid on Approved Auction (Instant Auto-Approved)
  // ---------------------------------------------------------------------------
  console.log(`\n--- 6. SUBSEQUENT BID ON APPROVED AUCTION #${targetAuctionId} ---`);
  const secondBidRes = await request('POST', `/auctions/${targetAuctionId}/bid`, { amount: 800000 }, { Authorization: `Bearer ${loginToken}` });
  assert(secondBidRes.status === 200, 'Subsequent bid returns HTTP 200', `Status: ${secondBidRes.status}`);
  assert(secondBidRes.data?.status === 'approved' && secondBidRes.data?.requires_admin_approval === false, 'Subsequent bid is APPROVED instantly without requiring admin re-approval', JSON.stringify(secondBidRes.data));
  assert(secondBidRes.data?.current_highest_bid === 800000, 'Auction current highest bid updated to ₹8,00,000');

  // ---------------------------------------------------------------------------
  // TEST CASE 7: First Bid on SECOND Auction Lot (Requires Approval Anew)
  // ---------------------------------------------------------------------------
  console.log(`\n--- 7. FIRST BID ON SECOND AUCTION LOT #${secondAuctionId} ---`);
  const secondLotBidRes = await request('POST', `/auctions/${secondAuctionId}/bid`, { amount: 4200000 }, { Authorization: `Bearer ${loginToken}` });
  assert(secondLotBidRes.status === 200, `Bid on second lot #${secondAuctionId} returns HTTP 200`, `Status: ${secondLotBidRes.status}`);
  assert(secondLotBidRes.data?.status === 'pending' || secondLotBidRes.data?.requires_admin_approval === true, `First bid on second lot #${secondAuctionId} correctly requires Admin Acceptance anew!`, JSON.stringify(secondLotBidRes.data));

  // ---------------------------------------------------------------------------
  // TEST CASE 8: Unlimited Continuous Bidding & Official Admin Award Closure
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. UNLIMITED CONTINUOUS BIDDING (NO PREMATURE AUTO-CLOSURE) ---');
  // Auction currently has 2 approved bids (760,000 and 800,000).
  // Placing 3rd continuous bid:
  const bid3Res = await request('POST', `/auctions/${targetAuctionId}/bid`, { amount: 820000 }, { Authorization: `Bearer ${loginToken}` });
  assert(bid3Res.status === 200, '3rd bid placed successfully (₹8,20,000)', `Status: ${bid3Res.status}`);
  assert(!bid3Res.data?.auction_closed, 'Auction remains active after 3rd bid');

  // Placing 4th continuous bid:
  const bid4Res = await request('POST', `/auctions/${targetAuctionId}/bid`, { amount: 840000 }, { Authorization: `Bearer ${loginToken}` });
  assert(bid4Res.status === 200, '4th bid placed successfully (₹8,40,000)', `Status: ${bid4Res.status}`);
  assert(!bid4Res.data?.auction_closed, 'Auction remains active after 4th bid');

  // Placing 5th continuous bid (must NOT auto-close!):
  const bid5Res = await request('POST', `/auctions/${targetAuctionId}/bid`, { amount: 860000 }, { Authorization: `Bearer ${loginToken}` });
  assert(bid5Res.status === 200, '5th continuous bid placed successfully (₹8,60,000)', `Status: ${bid5Res.status}`);
  assert(bid5Res.data?.auction_closed === false || !bid5Res.data?.auction_closed, 'Auction stays LIVE on 5th bid (no auto-close constraint)');
  assert(bid5Res.data?.status === 'approved', '5th bid is approved and live');

  // Placing 6th continuous bid (verifying unlimited rounds):
  const bid6Res = await request('POST', `/auctions/${targetAuctionId}/bid`, { amount: 880000 }, { Authorization: `Bearer ${loginToken}` });
  assert(bid6Res.status === 200, '6th continuous bid placed successfully (₹8,80,000 - unlimited rounds verified)', `Status: ${bid6Res.status}`);
  assert(!bid6Res.data?.auction_closed, 'Auction remains active after 6th bid');

  // Now test official Admin Winner Confirmation & Closure:
  const confirmWinnerRes = await request('POST', `/auctions/${targetAuctionId}/confirm-winner`, { winner_type: 'H1' }, { Authorization: 'Bearer sr_master_admin_token' });
  assert(confirmWinnerRes.status === 200, `Admin officially awards H1 winner and closes auction #${targetAuctionId}`, `Status: ${confirmWinnerRes.status}`);

  // Verify Auction is persisted as closed with H1 winner in Database
  const adminAucCheckRes = await request('GET', '/admin/auctions/all', null, { Authorization: 'Bearer sr_master_admin_token' });
  const allAdminAuctions = adminAucCheckRes.data?.data || adminAucCheckRes.data || [];
  const closedAuc = allAdminAuctions.find((a) => Number(a.id) === Number(targetAuctionId)) || {};
  assert(adminAucCheckRes.status === 200, `Fetch closed auction #${targetAuctionId} returns HTTP 200`);
  assert(closedAuc?.status === 'closed', 'Auction status in central database is now "closed"');
  assert(Number(closedAuc?.winner_confirmed) === 1, 'Auction winner_confirmed is set to 1');
  assert(closedAuc?.awarded_winner_type === 'H1', 'Awarded winner type is "H1"');

  // Attempting another bid on officially closed auction must be rejected
  const bid7Res = await request('POST', `/auctions/${targetAuctionId}/bid`, { amount: 900000 }, { Authorization: `Bearer ${loginToken}` });
  assert(bid7Res.status === 400 || bid7Res.status === 422, 'Submitting bid on closed auction is cleanly rejected (HTTP 400/422)', `Status: ${bid7Res.status}`);

  // ---------------------------------------------------------------------------
  // TEST CASE 9: Admin Panel All Options & Endpoints Test
  // ---------------------------------------------------------------------------
  console.log('\n--- 9. COMPLETE ADMIN PANEL ENDPOINTS VERIFICATION ---');

  // 8a. Dashboard Stats
  const statsRes = await request('GET', '/admin/dashboard/stats', null, { Authorization: 'Bearer sr_master_admin_token' });
  assert(statsRes.status === 200, 'Admin Dashboard Stats API returns HTTP 200', `Status: ${statsRes.status}`);

  // 8b. Auctions List
  const auctionsRes = await request('GET', '/admin/auctions/all', null, { Authorization: 'Bearer sr_master_admin_token' });
  assert(auctionsRes.status === 200, 'Admin Auctions List API returns HTTP 200', `Status: ${auctionsRes.status}`);

  // 8c. Classifieds List
  const classifiedsRes = await request('GET', '/admin/classifieds/all', null, { Authorization: 'Bearer sr_master_admin_token' });
  assert(classifiedsRes.status === 200, 'Admin Classifieds List API returns HTTP 200', `Status: ${classifiedsRes.status}`);

  // 8d. Sell Scrap Requests
  const scrapReqRes = await request('GET', '/admin/sell-scrap-requests', null, { Authorization: 'Bearer sr_master_admin_token' });
  assert(scrapReqRes.status === 200, 'Admin Sell Scrap Requests API returns HTTP 200', `Status: ${scrapReqRes.status}`);

  // 8e. Top Bidders for Lot (H1, H2, H3)
  const topBiddersRes = await request('GET', `/admin/auctions/${targetAuctionId}/top-bidders`, null, { Authorization: 'Bearer sr_master_admin_token' });
  assert(topBiddersRes.status === 200, 'Admin Top Bidders (H1/H2/H3) API returns HTTP 200', `Status: ${topBiddersRes.status}`);
  assert(!!topBiddersRes.data?.h1, 'Top bidders API correctly computes H1 highest bidder');

  // 8f. Confirm Auction Winner
  const confirmWinRes = await request('POST', `/auctions/${targetAuctionId}/confirm-winner`, { winner_type: 'H1', winner_user_id: registeredUserId }, { Authorization: 'Bearer sr_master_admin_token' });
  assert(confirmWinRes.status === 200, 'Admin Confirm Winner (H1) API returns HTTP 200', `Status: ${confirmWinRes.status}`);

  // 8g. System Settings
  const settingsRes = await request('GET', '/system/status');
  assert(settingsRes.status === 200, 'Public System Status API returns HTTP 200', `Status: ${settingsRes.status}`);

  console.log('\n===============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================');

  if (failed === 0) {
    console.log('🎉 ALL TESTS COMPLETED WITH 100% SUCCESS!');
  } else {
    console.error('⚠️ SOME TESTS FAILED. PLEASE REVIEW THE LOGS ABOVE.');
  }
}

runTestSuite().catch(console.error);
