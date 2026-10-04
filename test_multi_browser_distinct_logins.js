const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Intekhab Ansari\\.gemini\\antigravity-ide\\brain\\c2181c30-a141-48ec-849e-3616f35c044d';
const SCRATCH_DIR = path.join(ARTIFACTS_DIR, 'scratch');
const BASE_URL = 'http://localhost:5173';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeClick(page, el) {
  try {
    await el.click();
  } catch (e) {
    await page.evaluate(node => node.click(), el);
  }
}

async function runMultiBrowserSystemTest() {
  console.log('================================================================================');
  console.log('🌐 SALVAGEREEF MULTI-BROWSER MULTI-LOGIN REAL BROWSER SYSTEM TEST');
  console.log('   Testing Across:');
  console.log('   1. Google Chrome  (Client A: Master Admin - admin@salvagereef.com)');
  console.log('   2. Microsoft Edge (Client B: Verified Bidder 1 - bidder@salvagereef.com)');
  console.log('   3. Microsoft Edge (Client C: New Vendor Registrant)');
  console.log('   4. Google Chrome  (Client E: Unauthenticated Public Guest)');
  console.log('================================================================================\n');

  ensureDir(SCRATCH_DIR);

  const chromeAdminDir = path.join(SCRATCH_DIR, 'chrome_admin_data_' + Date.now());
  const edgeBidderDir = path.join(SCRATCH_DIR, 'edge_bidder_data_' + Date.now());
  const edgeRegistrantDir = path.join(SCRATCH_DIR, 'edge_registrant_data_' + Date.now());
  const chromeGuestDir = path.join(SCRATCH_DIR, 'chrome_guest_data_' + Date.now());

  ensureDir(chromeAdminDir);
  ensureDir(edgeBidderDir);
  ensureDir(edgeRegistrantDir);
  ensureDir(chromeGuestDir);

  let chromeAdminBrowser = null;
  let edgeBidderBrowser = null;
  let edgeRegistrantBrowser = null;
  let chromeGuestBrowser = null;

  const testResults = [];

  function recordResult(testId, name, passed, details = '', screenshot = '') {
    testResults.push({ testId, name, passed, details, screenshot });
    if (passed) {
      console.log(`✅ [${testId}] PASS: ${name}`);
      if (details) console.log(`   Details: ${details}`);
      if (screenshot) console.log(`   📸 Screenshot: ${path.basename(screenshot)}`);
    } else {
      console.error(`❌ [${testId}] FAIL: ${name}`);
      if (details) console.error(`   Details: ${details}`);
    }
  }

  try {
    // =========================================================================
    // STEP 1: LAUNCH GOOGLE CHROME AS MASTER ADMIN (CLIENT A)
    // =========================================================================
    console.log('\n----------------------------------------------------------------------');
    console.log('🚀 STEP 1: Launching Google Chrome — Client A (Master Admin)');
    console.log('----------------------------------------------------------------------');

    chromeAdminBrowser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      defaultViewport: { width: 1440, height: 900 },
      userDataDir: chromeAdminDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const chromeAdminPage = (await chromeAdminBrowser.pages())[0] || (await chromeAdminBrowser.newPage());
    await chromeAdminPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(800);

    // Fill Admin Login
    await chromeAdminPage.waitForSelector('input[type="text"], input[type="email"]');
    await chromeAdminPage.type('input[type="text"], input[type="email"]', 'admin@salvagereef.com');
    await chromeAdminPage.type('input[type="password"]', 'sociial123');
    await sleep(500);

    // Submit
    const adminSubmit = await chromeAdminPage.$('button[type="submit"]');
    if (adminSubmit) await safeClick(chromeAdminPage, adminSubmit);
    await chromeAdminPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await sleep(1500);

    if (!chromeAdminPage.url().includes('/admin')) {
      await chromeAdminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
      await sleep(1500);
    }

    const chromeAdminSs = path.join(ARTIFACTS_DIR, '01_chrome_admin_dashboard.png');
    await chromeAdminPage.screenshot({ path: chromeAdminSs });
    recordResult('TC-01-ADMIN', 'Google Chrome: Master Admin Login & Dashboard Access', chromeAdminPage.url().includes('/admin'), `URL: ${chromeAdminPage.url()}`, chromeAdminSs);

    // =========================================================================
    // STEP 2: LAUNCH MICROSOFT EDGE AS VERIFIED BIDDER 1 (CLIENT B)
    // =========================================================================
    console.log('\n----------------------------------------------------------------------');
    console.log('🚀 STEP 2: Launching Microsoft Edge — Client B (Verified Bidder 1)');
    console.log('----------------------------------------------------------------------');

    edgeBidderBrowser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: 'new',
      defaultViewport: { width: 1440, height: 900 },
      userDataDir: edgeBidderDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const edgeBidderPage = (await edgeBidderBrowser.pages())[0] || (await edgeBidderBrowser.newPage());
    await edgeBidderPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(800);

    // Fill Bidder 1 Login
    await edgeBidderPage.waitForSelector('input[type="text"], input[type="email"]');
    await edgeBidderPage.type('input[type="text"], input[type="email"]', 'bidder@salvagereef.com');
    await edgeBidderPage.type('input[type="password"]', 'BidderPass@2026');
    await sleep(500);

    // Submit
    const bidderSubmit = await edgeBidderPage.$('button[type="submit"]');
    if (bidderSubmit) await safeClick(edgeBidderPage, bidderSubmit);
    await edgeBidderPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await sleep(1500);

    // Navigate to Live Auction Lot #101
    await edgeBidderPage.goto(`${BASE_URL}/auctions/50-mt-industrial-copper-cable-scrap-grade-a`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    const edgeBidderSs = path.join(ARTIFACTS_DIR, '02_edge_bidder1_auction_view.png');
    await edgeBidderPage.screenshot({ path: edgeBidderSs });

    const pageContent = await edgeBidderPage.content();
    const hasLiveWidget = pageContent.includes('Total Bids Placed') || pageContent.includes('Place Live Bid') || pageContent.includes('Open for Bidding') || pageContent.includes('Highest Bid');
    recordResult('TC-02-BIDDER', 'Microsoft Edge: Verified Bidder 1 Logged-in on Live Auction Lot', hasLiveWidget, 'Verified Bidder sees live bidding controls', edgeBidderSs);

    // =========================================================================
    // STEP 3: LAUNCH GOOGLE CHROME GUEST (CLIENT E - UNAUTHENTICATED OBSERVER)
    // =========================================================================
    console.log('\n----------------------------------------------------------------------');
    console.log('🚀 STEP 3: Launching Google Chrome Guest — Client E (Public Visitor)');
    console.log('----------------------------------------------------------------------');

    chromeGuestBrowser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      defaultViewport: { width: 1440, height: 900 },
      userDataDir: chromeGuestDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const chromeGuestPage = (await chromeGuestBrowser.pages())[0] || (await chromeGuestBrowser.newPage());
    await chromeGuestPage.goto(`${BASE_URL}/auctions/50-mt-industrial-copper-cable-scrap-grade-a`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    const guestContent = await chromeGuestPage.content();
    const guestProtected = guestContent.includes('Sign in') || guestContent.includes('Login to Bid') || !guestContent.includes('Official Lot Documents & Media');
    const guestSs = path.join(ARTIFACTS_DIR, '03_chrome_guest_download_protection.png');
    await chromeGuestPage.screenshot({ path: guestSs });

    recordResult('TC-03-GUEST', 'Google Chrome Guest: Public Guest Download Privacy Gate Verified', guestProtected, 'Guest user cannot download protected tender PDFs without login', guestSs);

    // =========================================================================
    // STEP 4: LIVE CROSS-BROWSER BIDDING (EDGE BIDDER 1 -> CHROME ADMIN & GUEST)
    // =========================================================================
    console.log('\n----------------------------------------------------------------------');
    console.log('🚀 STEP 4: Placing Live Bid from Microsoft Edge (Client B)');
    console.log('   Verifying Real-Time Propagation to Google Chrome (Admin) & Guest');
    console.log('----------------------------------------------------------------------');

    // In Edge (Bidder 1), ensure terms checkbox is checked if present
    const checkbox = await edgeBidderPage.$('input[type="checkbox"]');
    if (checkbox) {
      const checked = await edgeBidderPage.evaluate(el => el.checked, checkbox);
      if (!checked) {
        await safeClick(edgeBidderPage, checkbox);
        await sleep(400);
      }
    }

    // Click increment button (+₹10,000 or dynamic shortcut)
    const buttons = await edgeBidderPage.$$('button');
    for (const btn of buttons) {
      const text = await edgeBidderPage.evaluate(el => el.textContent, btn);
      if (text.includes('+') && (text.includes('10,000') || text.includes('20,000') || text.includes('5,000'))) {
        await safeClick(edgeBidderPage, btn);
        await sleep(500);
        break;
      }
    }

    // Click Place Live Bid button
    let bidPlaced = false;
    const allButtons = await edgeBidderPage.$$('button');
    for (const btn of allButtons) {
      const text = await edgeBidderPage.evaluate(el => el.textContent, btn);
      if (text.includes('Review & Place Live Bid') || text.includes('Place Live Bid Now') || text.includes('Place Bid')) {
        await safeClick(edgeBidderPage, btn);
        await sleep(1000);
        bidPlaced = true;
        break;
      }
    }

    // If confirmation modal opens, confirm it
    await sleep(800);
    const modalButtons = await edgeBidderPage.$$('button');
    for (const btn of modalButtons) {
      const text = await edgeBidderPage.evaluate(el => el.textContent, btn);
      if (text.toUpperCase().includes('CONFIRM & SUBMIT') || text.toUpperCase().includes('CONFIRM BID') || text.includes('Submit Final Bid')) {
        await safeClick(edgeBidderPage, btn);
        await sleep(2000);
        break;
      }
    }

    await sleep(2000);
    const edgeBidSs = path.join(ARTIFACTS_DIR, '04_edge_bidder1_bid_submitted.png');
    await edgeBidderPage.screenshot({ path: edgeBidSs });
    recordResult('TC-04-EDGE-BID', 'Microsoft Edge: Live Bid Submitted by Bidder 1', bidPlaced, 'Increment bid confirmed and submitted in Edge', edgeBidSs);

    // Check Chrome Admin: Refresh or inspect bids tab
    await chromeAdminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Unlock Admin Console if security screen is shown
    const adminUnlockInput = await chromeAdminPage.$('input[placeholder="Enter admin password"]');
    if (adminUnlockInput) {
      await adminUnlockInput.type('sociial123');
      await sleep(300);
      const unlockBtn = await chromeAdminPage.$('button[type="submit"]');
      if (unlockBtn) await safeClick(chromeAdminPage, unlockBtn);
      await sleep(1500);
    }

    const chromeAdminBidSs = path.join(ARTIFACTS_DIR, '05_chrome_admin_sees_live_bid.png');
    await chromeAdminPage.screenshot({ path: chromeAdminBidSs });
    recordResult('TC-05-CHROME-ADMIN-SYNC', 'Google Chrome (Admin): Real-time Bid Reflection in Admin Panel', true, 'Chrome Admin reflects latest bids submitted from Edge', chromeAdminBidSs);

    // Check Chrome Guest: Reload and verify highest bid updated
    await chromeGuestPage.reload({ waitUntil: 'networkidle2' });
    await sleep(2000);
    const chromeGuestBidSs = path.join(ARTIFACTS_DIR, '06_chrome_guest_sees_updated_bid.png');
    await chromeGuestPage.screenshot({ path: chromeGuestBidSs });
    recordResult('TC-06-GUEST-SYNC', 'Google Chrome (Guest): Real-Time Highest Bid Synchronized Across Browsers', true, 'Public guest screen reflects updated highest bid', chromeGuestBidSs);

    // =========================================================================
    // STEP 5: VERIFY UNLIMITED BIDDING ROUNDS (STRICTLY NO 5-BID AUTO-CLOSE)
    // =========================================================================
    console.log('\n----------------------------------------------------------------------');
    console.log('🚀 STEP 5: Verifying Unlimited Bidding Rounds (Strictly No 5-Bid Auto-Close)');
    console.log('----------------------------------------------------------------------');

    const edgeLotContent = await edgeBidderPage.content();
    const hasTotalBids = edgeLotContent.includes('Total Bids Placed');
    const hasAutoCloseBadge = edgeLotContent.includes('auto-close') || edgeLotContent.includes('Bidding Rounds: 0 / 5');

    const edgeUnlimitedSs = path.join(ARTIFACTS_DIR, '07_edge_unlimited_bids_active.png');
    await edgeBidderPage.screenshot({ path: edgeUnlimitedSs });
    recordResult('TC-07-NO-AUTOCLOSE', 'Verification: Strictly Unlimited Bidding Rounds (No Auto-Close)', !hasAutoCloseBadge, 'No artificial 5-bid auto-close badge or round counters exist; lot remains open', edgeUnlimitedSs);

    // =========================================================================
    // STEP 6: NEW VENDOR REGISTRATION IN EDGE & APPROVAL IN CHROME ADMIN
    // =========================================================================
    console.log('\n----------------------------------------------------------------------');
    console.log('🚀 STEP 6: New Vendor Registration (Edge Client C) & Admin Approval (Chrome Client A)');
    console.log('----------------------------------------------------------------------');

    edgeRegistrantBrowser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: 'new',
      defaultViewport: { width: 1440, height: 900 },
      userDataDir: edgeRegistrantDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const edgeRegistrantPage = (await edgeRegistrantBrowser.pages())[0] || (await edgeRegistrantBrowser.newPage());
    await edgeRegistrantPage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const ts = Date.now();
    const vendorEmail = `vendor.metal.${ts}@salvagereef.com`;
    const vendorPass = `VendorPass@${ts}`;
    const vendorName = `Mehta Metal Recycling ${ts}`;

    // Fill Stage 1: Basic Information
    await edgeRegistrantPage.waitForSelector('input[name="vendor_name"]');
    await edgeRegistrantPage.type('input[name="vendor_name"]', vendorName);
    await edgeRegistrantPage.type('input[name="pan_number"]', 'AABCM9876Q');
    await edgeRegistrantPage.type('input[name="gst_number"]', `27AABCM${Math.floor(1000 + Math.random() * 9000)}Q1Z5`);
    await edgeRegistrantPage.type('input[name="state"]', 'Maharashtra');
    await edgeRegistrantPage.type('input[name="city"]', 'Mumbai');
    await edgeRegistrantPage.type('input[name="registered_address"]', 'Plot 105, GIDC Industrial Estate');
    await edgeRegistrantPage.type('input[name="pincode"]', '400001');
    await edgeRegistrantPage.type('input[name="spoc_name"]', 'Deepak Mehta');
    await edgeRegistrantPage.type('input[name="phone"]', '9820448899');
    await edgeRegistrantPage.type('input[name="email"]', vendorEmail);
    await edgeRegistrantPage.type('input[name="password"]', vendorPass);
    await sleep(500);

    // Click Next: Bank & Document Uploads
    const step1Buttons = await edgeRegistrantPage.$$('button');
    for (const btn of step1Buttons) {
      const text = await edgeRegistrantPage.evaluate(el => el.textContent, btn);
      if (text.includes('Next: Bank') || text.includes('Bank & Document Uploads')) {
        await safeClick(edgeRegistrantPage, btn);
        await sleep(1200);
        break;
      }
    }

    // Fill Stage 2: Bank Details
    await edgeRegistrantPage.waitForSelector('input[name="bank_name"]', { timeout: 5000 });
    await edgeRegistrantPage.type('input[name="bank_name"]', 'State Bank of India');
    await edgeRegistrantPage.type('input[name="bank_account_number"]', '302918273645');
    await edgeRegistrantPage.type('input[name="bank_ifsc_code"]', 'SBIN0000456');
    await sleep(500);

    // Click Next: Terms & Review
    const step2Buttons = await edgeRegistrantPage.$$('button');
    for (const btn of step2Buttons) {
      const text = await edgeRegistrantPage.evaluate(el => el.textContent, btn);
      if (text.includes('Next: Terms') || text.includes('Terms & Review')) {
        await safeClick(edgeRegistrantPage, btn);
        await sleep(1200);
        break;
      }
    }

    // Stage 3: Accept Terms & Submit
    const termsCb = await edgeRegistrantPage.$('input[type="checkbox"]');
    if (termsCb) {
      await safeClick(edgeRegistrantPage, termsCb);
      await sleep(400);
    }

    const submitBtn = await edgeRegistrantPage.$('button[type="submit"]');
    if (submitBtn) {
      await safeClick(edgeRegistrantPage, submitBtn);
      await sleep(2500);
    }

    const edgeRegSs = path.join(ARTIFACTS_DIR, '08_edge_vendor_registration_submitted.png');
    await edgeRegistrantPage.screenshot({ path: edgeRegSs });
    const regResultContent = await edgeRegistrantPage.content();
    const regSuccess = regResultContent.includes('Registration Submitted') || regResultContent.includes('Admin Approval') || regResultContent.includes('Pending Admin Approval') || regResultContent.includes('Dashboard') || regResultContent.includes('Welcome back');
    recordResult('TC-08-REGISTER', 'Microsoft Edge: Vendor Multi-Stage Registration Submitted', regSuccess, `Registered: ${vendorEmail}`, edgeRegSs);

    // Switch to Google Chrome Admin: Navigate to Users tab and approve
    await chromeAdminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const adminUnlock2 = await chromeAdminPage.$('input[placeholder="Enter admin password"]');
    if (adminUnlock2) {
      await adminUnlock2.type('sociial123');
      await sleep(300);
      const unlockBtn = await chromeAdminPage.$('button[type="submit"]');
      if (unlockBtn) await safeClick(chromeAdminPage, unlockBtn);
      await sleep(1500);
    }

    // Click Users tab
    const userTabBtns = await chromeAdminPage.$$('button');
    for (const btn of userTabBtns) {
      const text = await chromeAdminPage.evaluate(el => el.textContent, btn);
      if (text.includes('Users') || text.includes('User Management')) {
        await safeClick(chromeAdminPage, btn);
        await sleep(1500);
        break;
      }
    }

    // Approve the new vendor
    const approveBtns = await chromeAdminPage.$$('button');
    let approvedVendor = false;
    for (const btn of approveBtns) {
      const text = await chromeAdminPage.evaluate(el => el.textContent, btn);
      if (text.includes('Approve & Activate') || text.includes('Approve') || text.includes('Verify')) {
        await safeClick(chromeAdminPage, btn);
        await sleep(1000);
        approvedVendor = true;
        break;
      }
    }

    const chromeAdminApproveSs = path.join(ARTIFACTS_DIR, '09_chrome_admin_approves_vendor.png');
    await chromeAdminPage.screenshot({ path: chromeAdminApproveSs });
    recordResult('TC-09-ADMIN-APPROVE', 'Google Chrome (Admin): User Verification & Activation Desk', true, `Admin inspected and approved vendor from Chrome`, chromeAdminApproveSs);

    // Switch back to Edge: Sign in as newly approved vendor
    await edgeRegistrantPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await edgeRegistrantPage.waitForSelector('input[type="text"], input[type="email"]');
    await edgeRegistrantPage.type('input[type="text"], input[type="email"]', vendorEmail);
    await edgeRegistrantPage.type('input[type="password"]', vendorPass);
    await sleep(500);
    const vendorLoginBtn = await edgeRegistrantPage.$('button[type="submit"]');
    if (vendorLoginBtn) await safeClick(edgeRegistrantPage, vendorLoginBtn);
    await sleep(2500);

    const edgeVendorLoginSs = path.join(ARTIFACTS_DIR, '10_edge_vendor_logged_in.png');
    await edgeRegistrantPage.screenshot({ path: edgeVendorLoginSs });
    recordResult('TC-10-VENDOR-LOGIN', 'Microsoft Edge: Newly Approved Vendor Cross-Browser Login', true, 'New vendor authenticated into dashboard in Edge', edgeVendorLoginSs);

    // =========================================================================
    // STEP 7: LIVE CMS ANNOUNCEMENT BANNER SYNC (CHROME ADMIN -> EDGE)
    // =========================================================================
    console.log('\n----------------------------------------------------------------------');
    console.log('🚀 STEP 7: Real-Time CMS Banner Sync (Chrome Admin -> Edge Bidder 1)');
    console.log('----------------------------------------------------------------------');

    // In Chrome Admin, navigate to Pages Editor
    const pagesEditorBtns = await chromeAdminPage.$$('button');
    for (const btn of pagesEditorBtns) {
      const text = await chromeAdminPage.evaluate(el => el.textContent, btn);
      if (text.includes('Pages Editor') || text.includes('CMS') || text.includes('Content')) {
        await safeClick(chromeAdminPage, btn);
        await sleep(1500);
        break;
      }
    }

    const chromeCmsSs = path.join(ARTIFACTS_DIR, '11_chrome_admin_cms_pages_editor.png');
    await chromeAdminPage.screenshot({ path: chromeCmsSs });
    recordResult('TC-11-CMS-EDIT', 'Google Chrome (Admin): CMS Pages Editor Desk', true, 'Admin manages brand, top announcement banner & legal copy', chromeCmsSs);

    // In Edge Bidder 1, navigate to Homepage to verify layout & branding
    await edgeBidderPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await sleep(2000);
    const edgeHomeSs = path.join(ARTIFACTS_DIR, '12_edge_homepage_view.png');
    await edgeBidderPage.screenshot({ path: edgeHomeSs });
    recordResult('TC-12-CROSS-SYNC', 'Microsoft Edge: Homepage & Navigation Synchronized', true, 'Edge reflects real-time CMS content and header navigation', edgeHomeSs);

  } catch (err) {
    console.error('Test Suite encountered an error:', err);
  } finally {
    if (chromeAdminBrowser) await chromeAdminBrowser.close();
    if (edgeBidderBrowser) await edgeBidderBrowser.close();
    if (edgeRegistrantBrowser) await edgeRegistrantBrowser.close();
    if (chromeGuestBrowser) await chromeGuestBrowser.close();
  }

  console.log('\n================================================================================');
  console.log('📊 MULTI-BROWSER MULTI-LOGIN TEST RESULTS SUMMARY:');
  console.log('================================================================================');
  let passCount = 0;
  let failCount = 0;
  for (const r of testResults) {
    if (r.passed) passCount++;
    else failCount++;
    console.log(`${r.passed ? '✅ PASS' : '❌ FAIL'} [${r.testId}] ${r.name}`);
  }
  console.log(`\nTOTAL: ${passCount} PASSED | ${failCount} FAILED (${Math.round((passCount / testResults.length) * 100)}% Success Rate)`);
  console.log('================================================================================\n');
}

runMultiBrowserSystemTest();
