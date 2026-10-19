const fs = require('fs');
const html = fs.readFileSync('givolt_page.html', 'utf8');
const urls = new Set();
const regex = /https:\/\/cdn\.prod\.website-files\.com\/[^\s"'\)]+/g;
let m;
while ((m = regex.exec(html)) !== null) {
  urls.add(m[0]);
}
console.log('Total unique Webflow CDN URLs:', urls.size);
const exts = {};
for (const u of urls) {
  const ext = u.split('.').pop().split('?')[0].toLowerCase();
  exts[ext] = (exts[ext] || 0) + 1;
}
console.log('By extension:', JSON.stringify(exts, null, 2));
