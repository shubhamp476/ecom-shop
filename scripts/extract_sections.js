const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const html = fs.readFileSync(path.join(__dirname, '..', 'givolt_page.html'), 'utf8');
const map = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'map.json'), 'utf8'));

const $ = cheerio.load(html);

// Helper to convert HTML string to JSX-compatible TSX
function htmlToJsx(htmlStr) {
  let res = htmlStr;
  
  // Replace Webflow CDN links with local /assets/ paths
  for (const [cdn, local] of Object.entries(map)) {
    res = res.split(cdn).join(local);
  }

  // Also replace any remaining CDN occurrences if encoded
  res = res.replace(/https:\/\/cdn\.prod\.website-files\.com\/[^\s"'>\)]+/g, (matched) => {
    return map[matched] || matched;
  });

  // Replace class= with className=
  res = res.replace(/\bclass="/g, 'className="');
  
  // Replace for= with htmlFor=
  res = res.replace(/\bfor="/g, 'htmlFor="');

  // Replace tabindex= with tabIndex=
  res = res.replace(/\btabindex="/g, 'tabIndex="');

  // Replace autocomplete= with autoComplete=
  res = res.replace(/\bautocomplete="/g, 'autoComplete="');

  // Replace inputmode= with inputMode=
  res = res.replace(/\binputmode="/g, 'inputMode="');

  // Replace readonly with readOnly
  res = res.replace(/\breadonly\b/g, 'readOnly');

  // Remove empty or unparsed style attributes or convert simple styles
  // Self close void tags: img, input, br, hr
  res = res.replace(/<img([^>]*)(?<!\/)>/g, '<img$1 />');
  res = res.replace(/<input([^>]*)(?<!\/)>/g, '<input$1 />');
  res = res.replace(/<br([^>]*)(?<!\/)>/g, '<br$1 />');
  res = res.replace(/<hr([^>]*)(?<!\/)>/g, '<hr$1 />');

  // Remove data-wf-* or data-w-id if desired, or keep them for CSS styling
  // Replace comments
  res = res.replace(/<!--[\s\S]*?-->/g, '');

  return res;
}

const sections = [];
$('header.main-header, section').each((i, el) => {
  const cls = $(el).attr('class') || '';
  const outer = $.html(el);
  sections.push({
    index: i,
    tag: el.tagName,
    className: cls,
    html: outer
  });
});

console.log(`Found ${sections.length} total sections.`);
fs.writeFileSync(path.join(__dirname, 'extracted_sections.json'), JSON.stringify(sections, null, 2));
