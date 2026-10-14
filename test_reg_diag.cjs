const https = require('https');

const email = `diag.${Date.now()}@test.com`;
const body = JSON.stringify({
  name: 'Diagnostic User',
  email: email,
  phone: '9876543210',
  password: 'Password@123',
  company_name: 'Diag Test Ltd',
  city: 'Mumbai',
  state: 'Maharashtra',
  role: 'bidder'
});

console.log('Sending registration for:', email);

const req = https.request('https://salvagereef.com/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  },
  rejectUnauthorized: false
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('DATA:', data);
  });
});

req.on('error', (err) => console.error('REQUEST ERROR:', err));
req.write(body);
req.end();
