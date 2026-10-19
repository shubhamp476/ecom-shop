const fs = require('fs');
const path = require('path');
const https = require('https');

const map = JSON.parse(fs.readFileSync('public/assets/map.json', 'utf8'));
const files = ['shop_page.html', 'category_page.html', 'product_page.html'];
const newUrls = new Set();

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, 'utf8');
  const regex = /https:\/\/cdn\.prod\.website-files\.com\/[^"'\s<>\)]+/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    let u = m[0];
    if (u.endsWith('.js') || u.endsWith('.css')) continue;
    const clean = u.split('?')[0];
    if (!map[u] && !map[clean]) {
      newUrls.add(u);
    }
  }
}

console.log('Missing assets from new pages:', newUrls.size);

async function downloadMissing() {
  const assetsDir = path.join(__dirname, '..', 'public', 'assets');
  for (const url of newUrls) {
    try {
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('/');
      let filename = parts[parts.length - 1];
      filename = decodeURIComponent(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(assetsDir, filename);
      if (!fs.existsSync(filePath)) {
        await new Promise((res, rej) => {
          https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
            if (resp.statusCode !== 200) return rej(new Error(resp.statusCode));
            const chunks = [];
            resp.on('data', c => chunks.push(c));
            resp.on('end', () => {
              fs.writeFileSync(filePath, Buffer.concat(chunks));
              res();
            });
          }).on('error', rej);
        });
      }
      map[url] = `/assets/${filename}`;
      map[cleanUrl] = `/assets/${filename}`;
      console.log(`Saved /assets/${filename}`);
    } catch (e) {
      console.warn(`Failed ${url}: ${e.message}`);
    }
  }
  fs.writeFileSync('public/assets/map.json', JSON.stringify(map, null, 2));
  console.log('Updated map.json with all new page assets.');
}

downloadMissing().catch(console.error);
