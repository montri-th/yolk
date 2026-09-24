/* Source regression for the owner's no-logo-frame correction. Not browser QA. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const prototype = path.join(root, 'prototype');
const read = p => fs.readFileSync(path.join(prototype, p), 'utf8');
const app = read('app.js');
const index = read('index.html').replace(/(\.(?:css|js))\?[^"]*(?=")/g,'$1');
const iconContext = {};
vm.runInNewContext(read('icons.js'), iconContext);
const iconContract = JSON.parse(fs.readFileSync(path.join(root,'contracts/icons.v1.5.json'),'utf8'));
const iconReceipt = JSON.parse(fs.readFileSync(path.join(root,iconContract.approvalReceiptRef),'utf8'));
const cssFiles = ['base.css', 'yolk.css', 'experience.css', 'identity.css'];
const css = cssFiles.map(file => ({file, text:read(file)}));
let checks = 0;
function check(name, action) { action(); checks++; console.log('PASS', name); }

const renderedHeaderPieces = [];
// Execute the isolated header template with a DOM-shaped sink. No UI engine or browser.
function sidebarFor(lang) {
  const start = app.indexOf('function header()');
  assert(start >= 0, 'header template not found');
  const end = app.indexOf('\nfunction ', start + 1);
  assert(end > start, 'header template boundary not found');
  const elements = new Map();
  const context = {
    document:{documentElement:{}, title:''},
    Y:{lang, route:'market', pois:[]},
    $:selector => { if (!elements.has(selector)) elements.set(selector, {}); return elements.get(selector); },
    tr:(th,en) => lang === 'en' ? en : th,
        YolkTheme:{renderControl:() => ''},
    YolkIcons:iconContext.YolkIcons,
    window:{YolkIcons:iconContext.YolkIcons},
    unreadCount:() => 0,
    PEOPLE:[{id:'m', role:'admin'}],
    person:() => 'Manee',
    tabTitle:() => 'CityMETER: Yolk'
  };
  const declarations=['const uiIcon=','const navIcon=','const navItems=','const tabTitle='].map(prefix => {
    const line=app.split('\n').find(line=>line.startsWith(prefix));
    assert(line,`header declaration missing: ${prefix}`);return line;
  }).join('\n');
  vm.runInNewContext(declarations + '\n' + app.slice(start, end) + '\nheader();', context);
  renderedHeaderPieces.push(elements.get('#sidebar').innerHTML,elements.get('#header').innerHTML,elements.get('#mobile-nav').innerHTML);
  return elements.get('#sidebar').innerHTML;
}
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function parseHTML(html) {
  const root = {tag:'root', attrs:{}, children:[], parent:null};
  const stack = [root];
  const tokens = /<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b([^>]*?)>/gi;
  let m;
  while ((m = tokens.exec(html))) {
    if (!m[1]) continue;
    const tag = m[1].toLowerCase();
    if (m[0].startsWith('</')) {
      const at = stack.map(n => n.tag).lastIndexOf(tag);
      if (at > 0) {stack[at].end=m.index;stack.length = at;}
      continue;
    }
    const attrs = {};
    for (const a of m[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1]] = a[2] ?? a[3];
    const node = {tag, attrs, children:[], parent:stack.at(-1), start:tokens.lastIndex, html};
    node.parent.children.push(node);
    if (!voidTags.has(tag) && !m[0].endsWith('/>')) stack.push(node);
  }
  return root;
}
function flat(node) { return [node, ...node.children.flatMap(flat)]; }
function hasClass(node, cls) { return (node.attrs.class || '').split(/\s+/).includes(cls); }
function ancestors(node) { const out=[]; for(let p=node.parent;p;p=p.parent) out.push(p); return out; }
function identityNodes(html) { return flat(parseHTML(html)).filter(n => hasClass(n,'landometer-identity-img')); }
const sidebarFragments = [sidebarFor('th'), sidebarFor('en')];
const fragments = [...sidebarFragments, ...renderedHeaderPieces.filter(html=>html.includes('header-identity'))];

check('rejected plate wrapper and CSS are absent', () => {
  for (const [name, source] of [['app.js',app],['index.html',index],...css.map(x=>[x.file,x.text])]) {
    assert(!source.includes('logo-plate'), `rejected plate remains in ${name}`);
  }
});
check('native transparent logo bytes remain unchanged', () => {
  const data = fs.readFileSync(path.join(prototype,'assets/landometer-logo-horizontal-v12-889.png'));
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'), '989f58583bc54e4b9a743d0f04308df92fb7cf0bb2ae3ba9398ec9c03c481554');
});
check('desktop and mobile use the native logo directly on the existing layout surface', () => {
  fragments.forEach((html, i) => {
    const images = identityNodes(html);
    const allNativeImages = flat(parseHTML(html)).filter(n=>n.tag==='img'&&/landometer-logo-horizontal/.test(n.attrs.src||''));
    assert.equal(allNativeImages.length,1,`unexpected duplicate/unclassified native logo in fragment ${i}`);
    assert.equal(images.length,1,`expected one native identity image in fragment ${i}`);
    const image = images[0];
    assert.equal(image.tag,'img');
    assert.equal(image.attrs.src,'assets/landometer-logo-horizontal-v12-889.png');
    assert.equal(image.attrs.alt,'Landometer');
    assert.equal(image.attrs.width,'889');
    assert.equal(image.attrs.height,'244');
    assert(!image.attrs.style,'native logo must not carry inline paint/filter styles');
    assert(hasClass(image, i < 2 ? 'sidebar-identity' : 'header-identity'), 'native image owns its placement class; do not add a frame wrapper');
    assert(image.parent.tag==='root'||hasClass(image.parent,'header-menu-panel'),'native logo belongs directly to the sidebar or the normal settings menu; no logo-only carrier');
    assert(!ancestors(image).some(n=>hasClass(n,'brand-footer')||hasClass(n,'mobile-signature')), 'native logo must not be put inside a decorative blue panel');
  });
});
check('native identity is prominent and governed-text fallback is removed', () => {
  assert.equal(fragments.length,4,'TH/EN sidebar and header must all carry the native logo');
  fragments.forEach((html,i) => {
    assert(!html.includes('landometer-identity-text'),'do not replace the requested logo with a text fallback');
    if(i<2)assert(html.indexOf('sidebar-identity')<html.indexOf('yolk-brand'),'sidebar logo must precede Yolk branding');
  });
  assert(!index.includes('mobile-identity'),'no duplicate logo at the bottom of the page');
});

const rules=[];
for(const {file,text} of css) {
  const clean=text.replace(/\/\*[\s\S]*?\*\//g,'');
  for(const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if(m[1].trim().startsWith('@'))continue;
    for(const selector of m[1].split(',')) {
      const declarations=Object.fromEntries(m[2].split(';').map(x=>{const i=x.indexOf(':');return i<0?null:[x.slice(0,i).trim().toLowerCase(),x.slice(i+1).trim()]}).filter(Boolean));
      rules.push({file,selector:selector.trim(),declarations});
    }
  }
}
function logoImageSelector(s) {
  return /\.landometer-identity-img\b/.test(s) || /landometer-logo-horizontal/.test(s) || /^(?:html\s+|body\s+)?img$/.test(s) || /\.(?:sidebar|mobile)-identity(?:\s*>?\s+img)$/.test(s);
}
check('native image is not painted, framed, filtered or padded', () => {
  const forbidden=/^(?:background(?:-.+)?|padding(?:-.+)?|border(?:-.+)?|box-shadow|filter|backdrop-filter|mask(?:-.+)?|clip-path|mix-blend-mode|opacity|transform|object-fit)$/;
  for(const rule of rules.filter(r=>logoImageSelector(r.selector))) {
    for(const prop of Object.keys(rule.declarations)) assert(!forbidden.test(prop),`${rule.file}: ${rule.selector} must not apply ${prop} to native identity image`);
  }
});
check('identity layout regions do not recreate the white frame', () => {
  for(const rule of rules.filter(r=>/\.(?:sidebar|mobile)-identity\b/.test(r.selector)&&!/[ >]img|landometer-identity-(?:img|text)/.test(r.selector))) {
    for(const prop of Object.keys(rule.declarations)) assert(!/^(?:background(?:-.+)?|border-radius|box-shadow|filter|backdrop-filter)$/.test(prop),`${rule.file}: ${rule.selector} adds a painted identity carrier`);
  }
});
check('navigation follows the selected theme without a beige dark-mode override', () => {
  const dark=rules.filter(r=>/\[data-theme\s*=\s*["']?dark["']?\]/.test(r.selector));
  const latestImage=dark.filter(r=>/\.landometer-identity-img\b/.test(r.selector)).at(-1);
  assert.equal(latestImage.declarations.display,'block','dark theme must keep native logo unchanged');
  for(const surface of ['#sidebar','#header']) {
    const declarations=Object.assign({},...rules.filter(r=>r.file==='identity.css'&&r.selector===surface).map(r=>r.declarations));
    assert.equal(declarations.background,'var(--canvas)');
    assert.equal(declarations['color-scheme'],'inherit');
    assert(!declarations['--ink'],'navigation must inherit the active theme foreground');
  }
  assert(index.includes('href="identity.css"'));
  assert(index.indexOf('href="identity.css"')>index.indexOf('href="experience.css"'));
});
check('all motifs are excluded from app markup and shipped assets', () => {
  const motifFiles=fs.readdirSync(path.join(prototype,'assets')).filter(name=>/^(?:dial|rings|layers|slice|cultivate|logo)-(?:quiet|full)\.svg$/.test(name));
  assert.equal(motifFiles.length,0,'motif files must not ship in this Yolk asset bundle');
  for(const [name,html] of [['app.js',app],['index.html',index]]) {
    assert(!/data-motif(?:-|=)/.test(html), `motif binding remains in ${name}`);
    assert(!/assets\/(?:dial|rings|layers|slice|cultivate|logo)-(?:quiet|full)\.svg/.test(html), `motif asset remains in ${name}`);
    assert(!/class=["'][^"']*(?:brand-footer|mobile-signature)/.test(html), `decorative footer panel remains in ${name}`);
  }
});
check('supplemental icon source, font and licence hashes match their declared scope', () => {
  assert.equal(iconContract.kind,'product_specific_subset_extension_not_canonical_ds_asset');
  assert.equal(iconContract.runtime.family_alias,'Yolk Material Symbols');
  for(const a of [...iconContract.assets, iconContract.licenseOrPermission]) {
    const data=fs.readFileSync(path.join(root,a.path));
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'),a.sha256,`asset drift: ${a.path}`);
    if(a.bytes)assert.equal(data.length,a.bytes);
  }
  const receiptBytes=fs.readFileSync(path.join(root,iconContract.approvalReceiptRef));
  assert.equal(crypto.createHash('sha256').update(receiptBytes).digest('hex'),iconContract.approvalReceiptSha256);
  const font=fs.readFileSync(path.join(root,iconContract.assets[0].path));
  assert.equal(font.subarray(0,4).toString('ascii'),'wOF2');
  const canonical=fs.readFileSync(path.join(prototype,'assets/material-symbols-rounded-nav-300.woff2'));
  assert.equal(crypto.createHash('sha256').update(canonical).digest('hex'),'d7e283106ed2898726b24504c4e0f5ad524292984a90a4d29553c7dcf53b9657');
});
check('requested icon glyphs, contract and runtime allowlist agree', () => {
  const declared=[...iconContract.glyphs].sort();
  assert.equal(new Set(declared).size,37);
  assert.deepEqual([...iconContext.YolkIcons.glyphs].sort(),declared);
  assert.deepEqual([...iconReceipt.glyphs].sort(),declared);
  assert.deepEqual(Object.fromEntries(Object.entries(iconContract.axes)),{FILL:0,wght:300,GRAD:0,opsz:24});
  for(const name of declared) {
    const html=iconContext.YolkIcons.icon(name);
    assert(html.includes(`data-yolk-glyph="${name}"`));
    assert(html.includes('aria-hidden="true"'));
  }
  for(const invalid of ['not_a_glyph','<script>','undefined','check_circle'])assert.equal(iconContext.YolkIcons.icon(invalid),'');
  const runtimeSources=fs.readdirSync(prototype).filter(name=>name.endsWith('.js')).map(read);
  for(const source of [...runtimeSources,index,...renderedHeaderPieces]) {
    const names=[...source.matchAll(/\b(?:YolkIcons\.)?(?:icon|uiIcon)\(['"]([a-z_]+)['"]\)/g),...source.matchAll(/data-yolk-(?:glyph|icon)=["']([a-z_]+)["']/g)].map(m=>m[1]);
    for(const name of names)assert(declared.includes(name),`unsupported runtime icon ${name}`);
  }
});
check('navigation and header icons retain meaningful TH/EN text labels', () => {
  for(const html of renderedHeaderPieces) {
    const nodes=flat(parseHTML(html));
    for(const icon of nodes.filter(n=>hasClass(n,'yl-icon'))) {
      assert.equal(icon.attrs['aria-hidden'],'true');
      assert(iconContract.glyphs.includes(icon.attrs['data-yolk-glyph']));
      const control=ancestors(icon).find(n=>['a','button','label','summary'].includes(n.tag));
      assert(control,'header icon must belong to a labelled control');
      const raw=html.slice(control.start,control.end);
      const text=raw.replace(/<span\b[^>]*class="[^"]*yl-icon[^"]*"[^>]*>[\s\S]*?<\/span>/g,'').replace(/<[^>]*>/g,'').trim();
      assert(text,'visible action/navigation label must survive font failure');
    }
  }
});
check('icons keep their own font namespace and remain hidden until loaded', () => {
  const style=read('icons.css'),code=read('icons.js');
  assert(style.includes('font-family: "Yolk Material Symbols"'));
  assert(style.includes('material-symbols-rounded-yolk-300-v1.5.woff2'));
  assert(/\.yl-icon\s*\{[^}]*visibility:\s*hidden/s.test(style));
  assert(/\.yolk-icons-ready\s+\.yl-icon\s*\{\s*visibility:\s*visible/.test(style));
  assert(code.includes("doc.documentElement.classList.remove('yolk-icons-ready')"));
  assert(code.includes("doc.fonts.load('300 24px \"Yolk Material Symbols\"'"));
  assert.equal(iconContract.runtime.visible_text_required,true);
  assert(index.includes('href="icons.css"'));
  assert(index.indexOf('src="icons.js"')>=0 && index.indexOf('src="icons.js"')<index.indexOf('src="app.js"'));
});
console.log(`${checks} brand/icon source checks passed; configured glyph coverage is not rendered shaping. Browser/device QA remains open.`);
