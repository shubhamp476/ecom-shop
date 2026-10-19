const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const rawHtml = fs.readFileSync('givolt_page.html', 'utf8');
const map = JSON.parse(fs.readFileSync('public/assets/map.json', 'utf8'));

function mapUrl(u) {
  if (!u) return u;
  if (map[u]) return map[u];
  const clean = u.split('?')[0];
  if (map[clean]) return map[clean];
  for (const [k, v] of Object.entries(map)) {
    if (clean.endsWith(k.split('/').pop())) return v;
  }
  return u;
}

// Clean and prepare HTML string
let html = rawHtml;
for (const [cdn, local] of Object.entries(map)) {
  html = html.split(cdn).join(local);
}

const $ = cheerio.load(html, { xmlMode: false, decodeEntities: false }, false);

// Fix all img src and remove remote srcset
$('img').each((_, el) => {
  const src = $(el).attr('src');
  if (src) $(el).attr('src', mapUrl(src));
  $(el).removeAttr('srcset');
  $(el).removeAttr('sizes');
});

// Remove Webflow scripts inside sections
$('script').remove();

// Clean up styles that hide elements
$('[style]').each((_, el) => {
  let style = $(el).attr('style') || '';
  // remove opacity: 0, filter: blur, and initial translation that hide elements
  style = style.replace(/opacity:\s*0(\.0+)?\s*;?/gi, '');
  style = style.replace(/filter:\s*blur\([^)]+\)\s*;?/gi, '');
  style = style.replace(/transform:\s*translate3d\([^)]+\)\s*;?/gi, '');
  style = style.replace(/transform-style:[^;]+;?/gi, '');
  style = style.replace(/will-change:[^;]+;?/gi, '');
  style = style.trim();
  if (!style || style === ';') {
    $(el).removeAttr('style');
  } else {
    $(el).attr('style', style);
  }
});

// Helper to convert HTML snippet to JSX
function toJsx(snippet) {
  let s = snippet;

  // React attributes
  s = s.replace(/\bclass="/g, 'className="');
  s = s.replace(/\bfor="/g, 'htmlFor="');
  s = s.replace(/\btabindex="(-?[0-9]+)"/g, 'tabIndex={$1}');
  s = s.replace(/\btabindex=""/g, '');
  s = s.replace(/\bautocomplete="([^"]*)"/g, 'autoComplete="$1"');
  s = s.replace(/\bautofocus="true"/g, 'autoFocus');
  s = s.replace(/\bautofocus=""/g, 'autoFocus');
  s = s.replace(/\binputmode="([^"]*)"/g, 'inputMode="$1"');
  s = s.replace(/\baria-haspopup="([^"]*)"/g, 'aria-haspopup="$1"');
  s = s.replace(/\bstyle="([^"]*)"/g, (match, styleStr) => {
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

// Output processed sections
const sections = [];
$('header.main-header, section').each((i, el) => {
  sections.push({
    index: i,
    tag: el.tagName,
    className: $(el).attr('class') || '',
    jsx: toJsx($.html(el))
  });
});

fs.writeFileSync(path.join(__dirname, 'exact_sections.json'), JSON.stringify(sections, null, 2));
console.log(`Generated ${sections.length} exact sections in exact_sections.json`);
