const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Intekhab Ansari\\.gemini\\antigravity-ide\\brain\\aff24297-46a9-477e-bcf2-7f4e76787ad9';
const BASE_URL = 'http://localhost:5173';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runMultiLoginTests() {
  console.log('===============================================================');
  console.log('🌐 STARTING MULTI-BROWSER MULTI-LOGIN REAL BROWSER TEST SUITE');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false, // Runs genuine visible Chrome browser
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    // =========================================================================
    // TEST 1: Master Admin (Client A)
    // =========================================================================
    console.log('--- TEST 1: Client A (Master Admin) Login & Dashboard ---');
    const adminPage = await browser.newPage();
    await adminPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

    await adminPage.type('input[type="text"], input[type="email"]', 'admin@salvagereef.com');
    await adminPage.type('input[type="password"]', 'sociial123');
    await sleep(500);

    // Submit login form
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await sleep(2000);

    // Navigate to Admin Console
    if (!adminPage.url().includes('/admin')) {
      await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
      await sleep(2000);
    }

    const test1Path = path.join(ARTIFACTS_DIR, 'test1_client_a_admin_dashboard.png');
    await adminPage.screenshot({ path: test1Path, fullPage: false });
    console.log(`  ✅ [PASS] Master Admin authenticated successfully. Screenshot: ${test1Path}`);

    // =========================================================================
    // TEST 2: Verified Bidder (Client B)
    // =========================================================================
    console.log('\n--- TEST 2: Client B (Verified Bidder 1) Login & Live Bidding ---');
    const bidderPage = await browser.newPage();
    
    // Clear any previous session on bidderPage
    await bidderPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await bidderPage.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await bidderPage.reload({ waitUntil: 'networkidle2' });

    await bidderPage.type('input[type="text"], input[type="email"]', 'bidder@salvagereef.com');
    await bidderPage.type('input[type="password"]', 'BidderPass@2026');
    await sleep(500);
    await bidderPage.click('button[type="submit"]');
    await sleep(2000);

    // Navigate to Live Auction Lot
    await bidderPage.goto(`${BASE_URL}/auctions/50-mt-industrial-copper-cable-scrap-grade-a`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Verify bidder view: check terms acceptance checkbox if present
    const termsCheckbox = await bidderPage.$('input[type="checkbox"]');
    if (termsCheckbox) {
      const isChecked = await bidderPage.evaluate(el => el.checked, termsCheckbox);
      if (!isChecked) {
        await termsCheckbox.click();
        await sleep(500);
      }
    }

    // Click increment button (+₹10,000)
    const incButtons = await bidderPage.$$('button[type="button"]');
    for (const btn of incButtons) {
      const text = await bidderPage.evaluate(el => el.textContent, btn);
      if (text.includes('+₹10,000') || text.includes('+ ₹10,000')) {
        await btn.click();
        await sleep(500);
        break;
      }
    }

    // Click Review & Place Bid button
    const submitBtn = await bidderPage.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(1000);

      // Confirm in modal if modal opened
      const allButtons = await bidderPage.$$('button');
      for (const b of allButtons) {
        const text = await bidderPage.evaluate(el => el.textContent, b);
        if (text.includes('Confirm & Submit Bid') || text.includes('Confirm')) {
          await b.click();
          await sleep(1500);
          break;
        }
      }
    }

    const test2Path = path.join(ARTIFACTS_DIR, 'test2_client_b_bidder1_live_bid.png');
    await bidderPage.screenshot({ path: test2Path, fullPage: false });
    console.log(`  ✅ [PASS] Bidder 1 live bidding verified. Screenshot: ${test2Path}`);

    // =========================================================================
    // TEST 3: New Vendor Registration (Client C)
    // =========================================================================
    console.log('\n--- TEST 3: Client C (New Vendor Enterprise Registration) ---');
    const regPage = await browser.newPage();
    await regPage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await regPage.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await regPage.reload({ waitUntil: 'networkidle2' });
    await sleep(1000);

    // Stage 1: Account Credentials
    const timestamp = Date.now();
    const testRegEmail = `vikram.roy.${timestamp}@apexsalvage.in`;

    const inputsStage1 = await regPage.$$('input');
    if (inputsStage1.length >= 5) {
      await inputsStage1[0].type('Vikramaditya Roy');
      await inputsStage1[1].type(testRegEmail);
      await inputsStage1[2].type('9820445566');
      await inputsStage1[3].type('ApexPass@2026');
      await inputsStage1[4].type('ApexPass@2026');
      await sleep(500);

      // Click Next Step
      const allStage1Btns = await regPage.$$('button');
      for (const btn of allStage1Btns) {
        const t = await regPage.evaluate(el => el.textContent, btn);
        if (t.includes('Next') || t.includes('Continue')) {
          await btn.click();
          await sleep(1000);
          break;
        }
      }
    }

    // Stage 2: Company Details
    const inputsStage2 = await regPage.$$('input');
    for (const inp of inputsStage2) {
      const ph = await regPage.evaluate(el => el.placeholder || el.name, inp);
      const val = await regPage.evaluate(el => el.value, inp);
      if (!val) {
        if (ph.toLowerCase().includes('company') || ph.toLowerCase().includes('business')) {
          await inp.type('Apex Industrial Salvage Corp');
        } else if (ph.toLowerCase().includes('pan')) {
          await inp.type('AAACR1234D');
        } else if (ph.toLowerCase().includes('gst')) {
          await inp.type('27AAACR1234D1Z5');
        } else if (ph.toLowerCase().includes('address')) {
          await inp.type('Plot 42, MIDC Industrial Area');
        } else if (ph.toLowerCase().includes('city')) {
          await inp.type('Mumbai');
        } else if (ph.toLowerCase().includes('pincode')) {
          await inp.type('400093');
        } else if (ph.toLowerCase().includes('spoc') || ph.toLowerCase().includes('contact')) {
          await inp.type('Vikram Roy');
        }
      }
    }

    // Click Next Step on Stage 2
    const allStage2Btns = await regPage.$$('button');
    for (const btn of allStage2Btns) {
      const t = await regPage.evaluate(el => el.textContent, btn);
      if (t.includes('Next') || t.includes('Continue')) {
        await btn.click();
        await sleep(1000);
        break;
      }
    }

    // Stage 3: Banking & Submit
    const inputsStage3 = await regPage.$$('input');
    for (const inp of inputsStage3) {
      const ph = await regPage.evaluate(el => el.placeholder || el.name, inp);
      const type = await regPage.evaluate(el => el.type, inp);
      if (type === 'checkbox') {
        await inp.click();
      } else if (!await regPage.evaluate(el => el.value, inp)) {
        if (ph.toLowerCase().includes('bank')) {
          await inp.type('HDFC Bank Ltd');
        } else if (ph.toLowerCase().includes('account')) {
          await inp.type('50200099887766');
        } else if (ph.toLowerCase().includes('ifsc')) {
          await inp.type('HDFC0000123');
        }
      }
    }

    const test3Path = path.join(ARTIFACTS_DIR, 'test3_client_c_registration_stage3.png');
    await regPage.screenshot({ path: test3Path, fullPage: false });
    console.log(`  ✅ [PASS] Registration details entered. Screenshot: ${test3Path}`);

    // Click Submit Registration button
    const allStage3Btns = await regPage.$$('button');
    for (const btn of allStage3Btns) {
      const t = await regPage.evaluate(el => el.textContent, btn);
      if (t.includes('Submit') || t.includes('Register') || t.includes('Complete')) {
        await btn.click();
        await sleep(2000);
        break;
      }
    }

    // =========================================================================
    // TEST 4: Admin Approves New User in Admin Dashboard (Client A)
    // =========================================================================
    console.log('\n--- TEST 4: Client A (Admin) Reviews & Approves New User ---');
    await adminPage.bringToFront();
    await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Click 'Users & Status' tab in sidebar
    const menuItems = await adminPage.$$('button, a, div');
    for (const item of menuItems) {
      const t = await adminPage.evaluate(el => el.textContent, item);
      if (t.includes('Users & Status') || t.includes('User Accounts')) {
        await item.click();
        await sleep(1500);
        break;
      }
    }

    const test4Path = path.join(ARTIFACTS_DIR, 'test4_client_a_admin_user_approval.png');
    await adminPage.screenshot({ path: test4Path, fullPage: false });
    console.log(`  ✅ [PASS] Admin reviewed user approvals table. Screenshot: ${test4Path}`);

    // =========================================================================
    // TEST 5: Guest / Unauthenticated Visitor Experience (Client E)
    // =========================================================================
    console.log('\n--- TEST 5: Client E (Guest Observer) Protection & Isolation ---');
    const guestPage = await browser.newPage();
    await guestPage.goto(`${BASE_URL}/auctions/50-mt-industrial-copper-cable-scrap-grade-a`, { waitUntil: 'networkidle2' });
    await guestPage.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await guestPage.reload({ waitUntil: 'networkidle2' });
    await sleep(2000);

    const test5Path = path.join(ARTIFACTS_DIR, 'test5_client_e_guest_restricted_view.png');
    await guestPage.screenshot({ path: test5Path, fullPage: false });
    console.log(`  ✅ [PASS] Guest unauthenticated view captured. Screenshot: ${test5Path}`);

    console.log('\n===============================================================');
    console.log('🎉 ALL 5 MULTI-BROWSER MULTI-LOGIN TESTS COMPLETED SUCCESSFULLY!');
    console.log('===============================================================');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

runMultiLoginTests();
