const https = require('https');

function post(path, data, token = null) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);

    const req = https.request(`https://salvagereef.com${path}`, {
      method: data ? 'POST' : 'GET',
      headers,
      rejectUnauthorized: false
    }, (res) => {
      let resData = '';
      res.on('data', c => resData += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const loginRes = await post('/api/v1/auth/login', {
    email: 'admin@salvagereef.com',
    password: 'sociial123'
  });
  console.log('LOGIN STATUS:', loginRes.status);
  const token = loginRes.data.token;
  console.log('TOKEN:', token ? token.slice(0, 15) + '...' : 'NONE');

  const usersRes = await post('/api/v1/admin/users', null, token);
  console.log('USERS STATUS:', usersRes.status);
  const users = usersRes.data.users || usersRes.data.data || usersRes.data || [];
  console.log(`TOTAL USERS FOUND: ${users.length}`);
  for (const u of users) {
    console.log(`  • ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Verified: ${u.is_verified}`);
  }
}

main().catch(console.error);
