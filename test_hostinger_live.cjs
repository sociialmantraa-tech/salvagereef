const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });
const BASE_URL = 'https://salvagereef.com/server.php/api/v1';

function api(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = https.request(url, { method, headers, agent }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, data, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 SalvageReef Hostinger Live Backend Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Admin Login
  console.log('--- Test 1: Admin Authentication ---');
  const loginRes = await api('POST', '/auth/login', {
    email: 'admin@salvagereef.com',
    password: 'sociial123'
  });
  assert(loginRes.status === 200 && loginRes.data.token, `Admin Login succeeded (status: ${loginRes.status})`);
  const adminToken = loginRes.data.token;

  // TEST 2: Auctions List
  console.log('\n--- Test 2: Live Auctions Availability ---');
  const aucRes = await api('GET', '/auctions');
  const auctions = aucRes.data.data || aucRes.data.auctions || [];
  assert(aucRes.status === 200, `Auctions endpoint returned 200 (found ${auctions.length} auctions)`);
  assert(auctions.length >= 3, `Zero-empty guarantee: Found ${auctions.length} live auctions`);
  for (const a of auctions) {
    console.log(`  • [${a.id}] ${a.title} - ₹${a.starting_price} in ${a.location_city}`);
  }

  // TEST 3: Categories & Locations
  console.log('\n--- Test 3: Categories & Locations Verification ---');
  const catRes = await api('GET', '/categories');
  const categories = catRes.data.categories || catRes.data || [];
  assert(categories.length >= 5, `Categories verified (count: ${categories.length})`);

  const locRes = await api('GET', '/locations');
  const locations = locRes.data.locations || locRes.data.data || locRes.data || [];
  assert(locations.length >= 7, `Locations verified (count: ${locations.length})`);

  // TEST 4: Protocol A - User Registration & Admin Approval
  console.log('\n--- Test 4: Protocol A - User Registration & Approval ---');
  const uid = Math.floor(1000 + Math.random() * 9000);
  const testEmail = `qa.bidder.${Date.now()}@salvagereef.com`;
  const regRes = await api('POST', '/auth/register', {
    name: 'QA Test Bidder',
    email: testEmail,
    phone: `9820${uid}11`,
    password: 'BidderPass@2026',
    company_name: 'QA Scrap Recycling Pvt Ltd',
    city: 'Mumbai',
    state: 'Maharashtra',
    role: 'bidder',
    pan_number: `ABCDE${uid}F`,
    gst_number: `27ABCDE${uid}F1Z5`,
    entity_type: 'Private Limited'
  });
  assert(regRes.status === 200 || regRes.status === 201, `User Registration completed (status: ${regRes.status})`);

  // Verify pending user appears in admin user list
  const usersRes = await api('GET', '/admin/users', null, adminToken);
  const usersList = usersRes.data.users || usersRes.data.data || usersRes.data || [];
  const createdUser = usersList.find(u => u.email === testEmail);
  assert(createdUser !== undefined, `Registered user [${testEmail}] found in Admin User list`);

  // Admin approves user
  if (createdUser) {
    const approveRes = await api('PUT', `/admin/users/${createdUser.id}/verify`, null, adminToken);
    assert(approveRes.status === 200, `Admin approved user (status: ${approveRes.status})`);

    // Verify user can log in
    const userLogin = await api('POST', '/auth/login', {
      email: testEmail,
      password: 'BidderPass@2026'
    });
    assert(userLogin.status === 200 && userLogin.data.token, `Approved user login verified (status: ${userLogin.status})`);
  }

  // TEST 5: Protocol F - Cascade Deletion
  console.log('\n--- Test 5: Protocol F - Cascade User Deletion ---');
  if (createdUser) {
    const delRes = await api('DELETE', `/admin/users/${createdUser.id}`, null, adminToken);
    assert(delRes.status === 200, `User deleted safely via cascade API (status: ${delRes.status})`);

    // Confirm deleted user cannot log in
    const deletedLogin = await api('POST', '/auth/login', {
      email: testEmail,
      password: 'BidderPass@2026'
    });
    assert(deletedLogin.status === 401 || deletedLogin.status === 404, `Deleted user session rejected (status: ${deletedLogin.status})`);
  }

  // TEST 6: Classifieds List
  console.log('\n--- Test 6: Classifieds Verification ---');
  const classRes = await api('GET', '/classifieds');
  const classifieds = classRes.data.data || classRes.data.classifieds || [];
  assert(classRes.status === 200, `Classifieds endpoint returned 200 (count: ${classifieds.length})`);

  console.log('\n====================================================');
  console.log(`Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
