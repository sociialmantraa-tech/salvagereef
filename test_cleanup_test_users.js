const https = require('https');

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://salvagereef.com/backend/server.php/api/v1' + path);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 SalvageReefCleanup/2.0',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
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

async function cleanTestUsers() {
  console.log('Fetching users from live API...');
  const res = await request('GET', '/admin/users', null, { Authorization: 'Bearer sr_master_admin_token' });
  const users = res.data?.data || res.data || [];
  console.log(`Found ${users.length} total users.`);

  let deletedCount = 0;
  for (const u of users) {
    const email = (u.email || '').toLowerCase();
    const name = u.name || '';
    if (
      email.startsWith('test.bidder.') ||
      email.includes('audit') ||
      name.startsWith('Test Metal Recycler') ||
      name.includes('Audit')
    ) {
      console.log(`Deleting test user ID #${u.id} (${u.name} - ${u.email})...`);
      const delRes = await request('DELETE', `/admin/users/${u.id}`, null, { Authorization: 'Bearer sr_master_admin_token' });
      console.log(`  -> Status: ${delRes.status}`, delRes.data?.message || delRes.data);
      deletedCount++;
    }
  }

  console.log(`\n✅ Finished cleanup! Successfully deleted ${deletedCount} leftover test accounts.`);
}

cleanTestUsers().catch(console.error);
