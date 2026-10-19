const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const sections = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted_sections.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'map.json'), 'utf8'));

function mapUrl(url) {
  if (!url) return url;
  if (map[url]) return map[url];
  const clean = url.split('?')[0];
  if (map[clean]) return map[clean];
  for (const [k, v] of Object.entries(map)) {
    if (clean.endsWith(k.split('/').pop())) return v;
  }
  return url;
}

function processHtml(rawHtml) {
  let content = rawHtml;
  
  // Replace all mapped URLs
  for (const [cdn, local] of Object.entries(map)) {
    content = content.split(cdn).join(local);
  }

  // Load in Cheerio to sanitize attributes
  const $ = cheerio.load(content, { xmlMode: false, decodeEntities: false }, false);

  // Update any remaining images
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src) $(el).attr('src', mapUrl(src));
    // Remove remote srcset so it relies on clean local src
    const srcset = $(el).attr('srcset');
    if (srcset && srcset.includes('https://cdn.prod.website-files.com')) {
      $(el).removeAttr('srcset');
    }
  });

  // Remove scripts from sections if any
  $('script').remove();

  // Return processed inner HTML
  return $.html();
}

function cleanJsx(htmlStr) {
  let s = htmlStr;

  // React property conversions
  s = s.replace(/\bclass="/g, 'className="');
  s = s.replace(/\bfor="/g, 'htmlFor="');
  s = s.replace(/\btabindex="([^"]*)"/g, 'tabIndex={$1}');
  s = s.replace(/\bautocomplete="([^"]*)"/g, 'autoComplete="$1"');
  s = s.replace(/\bautofocus="([^"]*)"/g, 'autoFocus');
  s = s.replace(/\binputmode="([^"]*)"/g, 'inputMode="$1"');
  s = s.replace(/\baria-haspopup="([^"]*)"/g, 'aria-haspopup="$1"');
  s = s.replace(/\bstyle="([^"]*)"/g, (match, styleStr) => {
    // Convert inline style string to style object
    if (!styleStr.trim()) return '';
    const rules = styleStr.split(';').filter(r => r.trim());
    const obj = {};
    for (const rule of rules) {
      const idx = rule.indexOf(':');
      if (idx === -1) continue;
      const key = rule.slice(0, idx).trim();
      const val = rule.slice(idx + 1).trim();
      const camelKey = key.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      obj[camelKey] = val;
    }
    return `style={${JSON.stringify(obj)}}`;
  });

  // Void tags
  s = s.replace(/<img([^>]*)(?<!\/)>/gi, '<img$1 />');
  s = s.replace(/<input([^>]*)(?<!\/)>/gi, '<input$1 />');
  s = s.replace(/<br([^>]*)(?<!\/)>/gi, '<br$1 />');
  s = s.replace(/<hr([^>]*)(?<!\/)>/gi, '<hr$1 />');

  // SVG attributes
  s = s.replace(/\bfill-rule="/g, 'fillRule="');
  s = s.replace(/\bclip-rule="/g, 'clipRule="');
  s = s.replace(/\bstroke-width="/g, 'strokeWidth="');
  s = s.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
  s = s.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
  s = s.replace(/\bstroke-miterlimit="/g, 'strokeMiterlimit="');
  s = s.replace(/\bxmlns:xlink="/g, 'xmlnsXlink="');
  s = s.replace(/\bxlink:href="/g, 'xlinkHref="');

  return s;
}

module.exports = { sections, processHtml, cleanJsx };
console.log('Converter module ready.');
