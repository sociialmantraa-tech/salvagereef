const https = require('https');

function apiCall(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = https.request(`https://salvagereef.com/api/v1${path}`, {
      method,
      headers,
      rejectUnauthorized: false
    }, (res) => {
      let resBody = '';
      res.on('data', c => resBody += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Logging in as Master Admin...');
  const loginRes = await apiCall('POST', '/auth/login', {
    email: 'admin@salvagereef.com',
    password: 'sociial123'
  });
  console.log('Login Status:', loginRes.status);
  const token = loginRes.data.token;
  if (!token) {
    console.error('Failed to get admin token!');
    return;
  }

  // 1. Create Executive Desk Admin
  console.log('\nCreating Executive Desk Admin (executive@salvagereef.com)...');
  const execRes = await apiCall('POST', '/admin/users', {
    name: 'SalvageReef Executive Desk Admin',
    email: 'executive@salvagereef.com',
    password: 'execadmin123',
    role: 'desk_admin',
    company_name: 'SalvageReef Executive Desk',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '7304481166',
    is_verified: 1,
    is_active: 1
  }, token);
  console.log('Executive Admin Create Status:', execRes.status, execRes.data || execRes.raw);

  // 2. Create Read-Only Desk Admin
  console.log('\nCreating Read-Only Desk Admin (inspector@salvagereef.com)...');
  const readRes = await apiCall('POST', '/admin/users', {
    name: 'Desk Audit Inspector',
    email: 'inspector@salvagereef.com',
    password: 'deskadmin123',
    role: 'read_only_admin',
    company_name: 'SalvageReef Audit Desk',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '7304481166',
    is_verified: 1,
    is_active: 1
  }, token);
  console.log('Read-Only Admin Create Status:', readRes.status, readRes.data || readRes.raw);

  // Verify
  const listRes = await apiCall('GET', '/admin/users', null, token);
  const users = listRes.data?.data || [];
  console.log(`\nVerified Total Users: ${users.length}`);
  const exec = users.find(u => u.email === 'executive@salvagereef.com');
  const insp = users.find(u => u.email === 'inspector@salvagereef.com');
  console.log('Executive Admin in DB:', !!exec, exec?.name, exec?.role);
  console.log('Inspector in DB:', !!insp, insp?.name, insp?.role);
}

main().catch(console.error);
