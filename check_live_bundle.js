const https = require('https');
const get = (u) => new Promise((r, j) => https.get(u, (x) => { let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => r(d)); }).on('error', j));
(async () => {
  const idx = await get('https://salvagereef.com/assets/index-CFk_1pBE.js');
  const chunks = [...new Set([...idx.matchAll(/assets\/([A-Za-z0-9_-]+-[A-Za-z0-9_-]{6,}\.js)|"\.\/([A-Za-z0-9_-]+-[A-Za-z0-9_-]{6,}\.js)"/g)].map((m) => m[1] || m[2]))];
  console.log('chunks referenced:', chunks.length);
  for (const c of chunks) {
    const js = await get('https://salvagereef.com/assets/' + c);
    const hit = /Bidding Rounds|Final Round Reached|Consecutive Bidding Rounds/.test(js);
    if (hit || /Place a Bid|LiveBidding/.test(js)) console.log(c, js.length, 'LIMIT TEXT:', hit);
  }
})();
