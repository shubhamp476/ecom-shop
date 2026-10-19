const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

async function fetchWithRetry(url, isBinary = true) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://givolt.webflow.io/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchWithRetry(res.headers.location, isBinary));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed ${url}: status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(isBinary ? buffer : buffer.toString('utf8'));
      });
    });
    req.on('error', reject);
  });
}

async function main() {
  const assetsDir = path.join(__dirname, '..', 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Download Webflow CSS
  console.log('Downloading Webflow CSS...');
  const cssUrl = 'https://cdn.prod.website-files.com/69896fff4e4f45bb25a046a6/css/givolt.webflow.shared.9da068ba9.css';
  try {
    const cssContent = await fetchWithRetry(cssUrl, false);
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'webflow.css'), cssContent);
    console.log('Saved src/app/webflow.css');
  } catch (err) {
    console.error('Error fetching CSS:', err);
  }

  // 2. Collect all CDN URLs from givolt_page.html and CSS
  const html = fs.readFileSync(path.join(__dirname, '..', 'givolt_page.html'), 'utf8');
  const css = fs.existsSync(path.join(__dirname, '..', 'src', 'app', 'webflow.css'))
    ? fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'webflow.css'), 'utf8')
    : '';

  const urls = new Set();
  // Match URLs in src="...", srcset="...", url(...)
  const regex = /https:\/\/cdn\.prod\.website-files\.com\/[^"'\s<>]+/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    let u = m[0];
    if (u.endsWith(')') && !u.includes('(')) u = u.slice(0, -1);
    urls.add(u);
  }
  while ((m = regex.exec(css)) !== null) {
    let u = m[0];
    if (u.endsWith(')') && !u.includes('(')) u = u.slice(0, -1);
    urls.add(u);
  }

  console.log(`Found ${urls.size} unique CDN URLs.`);

  let assetMap = {};
  if (fs.existsSync(path.join(assetsDir, 'map.json'))) {
    try {
      assetMap = JSON.parse(fs.readFileSync(path.join(assetsDir, 'map.json'), 'utf8'));
    } catch (e) {}
  }

  let downloaded = 0;
  let failed = 0;

  for (const url of urls) {
    if (url.endsWith('.css') || url.endsWith('.js')) {
      continue;
    }

    try {
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('/');
      let filename = parts[parts.length - 1];
      filename = decodeURIComponent(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      
      const filePath = path.join(assetsDir, filename);
      if (!fs.existsSync(filePath)) {
        const buffer = await fetchWithRetry(url, true);
        fs.writeFileSync(filePath, buffer);
      }
      assetMap[url] = `/assets/${filename}`;
      downloaded++;
    } catch (e) {
      console.warn(`Failed to download ${url}: ${e.message}`);
      failed++;
    }
  }

  fs.writeFileSync(path.join(assetsDir, 'map.json'), JSON.stringify(assetMap, null, 2));
  console.log(`Done! Success: ${downloaded}, Failed: ${failed}. Map updated in public/assets/map.json`);
}

main().catch(console.error);
