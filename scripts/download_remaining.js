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
  const mapPath = path.join(assetsDir, 'map.json');
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

  const files = ['home.har', 'shop.har', 'categorypage.har', 'productpage.har'];
  const newUrls = new Set();

  for (const f of files) {
    const fullPath = path.join(__dirname, '..', f);
    if (!fs.existsSync(fullPath)) continue;
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    for (const e of data.log.entries) {
      const u = e.request.url;
      if (u.includes('cdn.prod.website-files.com') && !u.endsWith('.js') && !u.endsWith('.css')) {
        const clean = u.split('?')[0];
        if (!map[u] && !map[clean]) {
          newUrls.add(u);
        }
      }
    }
  }

  console.log(`Downloading ${newUrls.size} new assets...`);
  for (const url of newUrls) {
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
      map[url] = `/assets/${filename}`;
      map[cleanUrl] = `/assets/${filename}`;
      console.log(`Saved: /assets/${filename}`);
    } catch (e) {
      console.error(`Failed ${url}: ${e.message}`);
    }
  }

  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  console.log('Updated public/assets/map.json successfully.');
}

main().catch(console.error);
