const puppeteer = require('puppeteer-core');
const path = require('path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ART = 'C:\\Users\\Intekhab Ansari\\.gemini\\antigravity-ide\\brain\\aff24297-46a9-477e-bcf2-7f4e76787ad9';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({
    executablePath: EDGE, headless: false, defaultViewport: { width: 1000, height: 1000 },
    userDataDir: path.join(ART, 'scratch', 'dbg_' + Date.now()),
    args: ['--no-first-run', '--no-default-browser-check', '--disable-sync', '--remote-debugging-port=0'],
  });
  const p = (await b.pages())[0];
  await p.goto('https://salvagereef.com/login', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await p.waitForSelector('input[type="password"]');
  await p.type('input[type="text"], input[type="email"]', 'live.vendor.1791036201491@salvagereef.com');
  await p.type('input[type="password"]', 'VendorPass@1791036201491');
  await p.click('button[type="submit"]');
  await sleep(5000);
  console.log('After login URL:', p.url());
  await p.goto('https://salvagereef.com/auctions/live-demo-auction-industrial-copper-cables', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await sleep(6000);
  const info = await p.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].map((x) => x.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean);
    const text = document.body.innerText;
    const i = text.indexOf('Place a Bid');
    return { btns, hasBidForm: i >= 0, snippet: text.slice(Math.max(0, i - 200), i + 600), tail: text.slice(-1200) };
  });
  console.log(JSON.stringify(info, null, 1));
  await b.close();
})();
