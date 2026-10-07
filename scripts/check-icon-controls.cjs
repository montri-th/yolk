/* Actual control markup + caption enhancement + scoped CSS cascade regression.
 * This fixture checks namespace collisions, not native font shaping or visual conformance.
 */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), site = path.join(root, 'prototype');
const read = name => fs.readFileSync(path.join(root, name), 'utf8'), checks = [];
async function check(name, fn) {try {await fn(); checks.push({name, passed: true}); console.log('PASS', name);} catch (error) {checks.push({name, passed: false, error: String(error.stack || error)}); console.error('FAIL', name, error.message);}}
const fixtureSource = read('scripts/check-brand-presets.cjs').split('\n(async () => {\n')[0];
const makeHarness = Function('require', '__dirname', fixtureSource + '\nreturn harness;')(require, __dirname);

class Node {
  constructor(tag, attrs = {}, value = '') {this.tag = tag; this.attrs = attrs; this.nodeType = tag === '#text' ? 3 : 1; this.value = value; this.childNodes = []; this.parent = null; this.ownerDocument = {createElement: tag => new Node(tag)}; this.classList = {add: name => {this.attrs.class = [...new Set((this.attrs.class || '').split(/\s+/).concat(name))].filter(Boolean).join(' ');}};}
  get className() {return this.attrs.class || '';}
  set className(value) {this.attrs.class = value;}
  get textContent() {return this.nodeType === 3 ? this.value : this.childNodes.map(c => c.textContent).join('');}
  getAttribute(name) {return this.attrs[name] ?? null;}
  appendChild(child) {child.parent = this; this.childNodes.push(child);}
  replaceWith(node) {const at = this.parent.childNodes.indexOf(this); node.parent = this.parent; this.parent.childNodes[at] = node;}
  matches(selector) {return selector.split(',').some(simple => simple === this.tag || simple.startsWith('.') && this.className.split(/\s+/).includes(simple.slice(1)) || simple.startsWith('[') && this.attrs[simple.slice(1, -1)] !== undefined);}
  querySelector(selector) {return this.querySelectorAll(selector)[0] || null;}
  querySelectorAll(selector) {return this.childNodes.flatMap(child => [child, ...child.querySelectorAll(selector)]).filter(child => child.nodeType === 1 && child.matches(selector));}
}
function parse(html) {
  const root = new Node('root'), stack = [root];
  for (const part of html.matchAll(/<\/?[^>]+>|[^<]+/g)) {
    const value = part[0];
    if (value.startsWith('</')) {stack.pop(); continue;}
    if (value.startsWith('<')) {const tag = /^<([\w-]+)/.exec(value)?.[1]; if (!tag) continue; const attrs = {}; for (const a of value.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) if (a[1] !== tag) attrs[a[1]] = a[2] ?? ''; const node = new Node(tag, attrs); stack.at(-1).appendChild(node); if (!['input', 'img', 'br'].includes(tag)) stack.push(node);}
    else stack.at(-1).appendChild(new Node('#text', {}, value));
  }
  return root;
}
function matchesSimple(node, token) {
  if (node.nodeType !== 1 || token.startsWith('@')) return false;
  const excluded = [...token.matchAll(/:not\(([^)]+)\)/g)].map(m => m[1]);
  if (excluded.some(selector => matchesSimple(node, selector))) return false;
  token = token.replace(/:not\([^)]+\)/g, '');
  if (token.includes(':')) return false; // Interactive/pseudo rules are outside this resting-state fixture.
  const tag = /^[a-z][\w-]*/i.exec(token)?.[0]; if (tag && tag !== node.tag) return false;
  for (const cls of token.matchAll(/\.([\w-]+)/g)) if (!node.className.split(/\s+/).includes(cls[1])) return false;
  for (const id of token.matchAll(/#([\w-]+)/g)) if (node.attrs.id !== id[1]) return false;
  for (const attr of token.matchAll(/\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/g)) if (node.attrs[attr[1]] === undefined || attr[2] && node.attrs[attr[1]] !== attr[2]) return false;
  return !!token.trim();
}
function matchesSelector(node, selector) {
  const pieces = selector.replace(/\s*>\s*/g, ' > ').trim().split(/\s+/);
  if (!matchesSimple(node, pieces.pop())) return false;
  let current = node;
  while (pieces.length) {
    if (pieces.at(-1) === '>') {pieces.pop(); current = current.parent; if (!current || !matchesSimple(current, pieces.pop())) return false;}
    else {const parentToken = pieces.pop(); do {current = current.parent;} while (current && !matchesSimple(current, parentToken)); if (!current) return false;}
  }
  return true;
}
const orderedStyles = [...read('prototype/index.html').matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"?]+)(?:\?[^"]*)?"/g)].map(m => path.join(site, m[1])).filter(fs.existsSync);
const rules = orderedStyles.flatMap(file => [...fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(match => match[1].trim().split(',').map(selector => ({selector: selector.trim(), declarations: match[2].split(';').map(d => {const at = d.indexOf(':'); return [d.slice(0, at).trim(), d.slice(at + 1).trim()];}).filter(([name]) => name && !name.startsWith('@'))}))));
function specificity(selector) {
  const ids=(selector.match(/#[\w-]+/g)||[]).length;
  const classes=(selector.match(/\.[\w-]+|\[[^\]]+\]/g)||[]).length;
  const types=(selector.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|:not\([^)]+\)/g,'').match(/\b[a-z][\w-]*\b/gi)||[]).length;
  return ids*10000+classes*100+types;
}
function family(node) {
  const candidates = [];
  rules.forEach((rule, order) => {if (!matchesSelector(node, rule.selector)) return; for (const [name, value] of rule.declarations) if (name === 'font-family' || name === 'font') candidates.push({rule, order, name, value, specificity: specificity(rule.selector)});});
  candidates.sort((a, b) => a.specificity - b.specificity || a.order - b.order);
  const winner = candidates.at(-1); if (!winner || winner.value === 'inherit') return node.parent ? family(node.parent) : 'Bai Jamjuree';
  const quoted = /['"]([^'"]+)['"]/.exec(winner.value)?.[1]; return quoted || winner.value;
}
async function actualSupply(lang) {
  const h = makeHarness(); h.sandbox.num = n => String(n); h.sandbox.feed = () => ''; h.sandbox.inMapPoi = () => true; h.sandbox.inPoiArea = () => true;
  h.sandbox.window.document = h.sandbox.document; h.sandbox.YolkAnalysisUI = {supplySummary: () => ''}; h.sandbox.window.YolkWorkspaceMap = {navigationLabel: () => 'Country', provinceForPoint: () => ''};
  h.sandbox.uiIcon = h.sandbox.window.YolkIcons.icon;
  vm.runInContext(read('prototype/supply-ui.js'), h.sandbox, {filename: 'actual-supply-ui.js'});
  await h.select('grocery', 'grocery-brand:SEVEN_ELEVEN', 'C_STORE'); h.sandbox.langFixture = lang; h.evaluate('Y.lang=langFixture;Y.poiTab="all"');
  const html = h.evaluate('supply()'), onlyTabs = /<div class="supply-tabs"[\s\S]*?<\/div>/.exec(html)?.[0]; assert(onlyTabs);
  const dom = parse(onlyTabs); h.sandbox.window.YolkIcons.captionControls(dom); return {h, html, dom, buttons: dom.querySelectorAll('button')};
}
function iconLoader(mode) {
  const classes = new Set(), requests = [], document = {documentElement: {classList: {toggle(name, enabled) {if (enabled) classes.add(name); else classes.delete(name);}, remove: name => classes.delete(name)}}, fonts: {load(font, glyphs) {requests.push({font, glyphs}); return mode === 'failed' ? Promise.reject(new Error('network failed')) : Promise.resolve(mode === 'loaded' ? [{}] : []);}}};
  const sandbox = {document, Promise}; vm.runInNewContext(read('prototype/icons.js'), sandbox); return {api: sandbox.YolkIcons, classes, requests};
}

(async () => {
  const th = await actualSupply('th'), en = await actualSupply('en');
  await check('Actual Thai and English Supply filter controls preserve five visible captions and their real count role', () => {
    for (const fixture of [th, en]) {assert.equal(fixture.buttons.length, 5); fixture.buttons.forEach(button => {const icon = button.querySelector('.yl-icon'), caption = button.querySelector('.control-caption'), count = button.querySelector('.supply-tab-count'); assert(icon && caption && count); assert(caption.textContent.trim()); assert(/^\d+$/.test(count.textContent)); assert(count.attrs['data-yolk-counter'] !== undefined);});}
  });
  await check('Actual loaded chip cascade gives symbols their Material face, readable captions Bai Jamjuree and only counts the mono face', () => {
    for (const fixture of [th, en]) for (const button of fixture.buttons) {assert.equal(family(button.querySelector('.yl-icon')), 'Yolk Material Symbols'); assert.equal(family(button.querySelector('.control-caption')), 'Bai Jamjuree'); assert.equal(family(button.querySelector('.supply-tab-count')), 'JetBrains Mono');}
  });
  await check('Store, shield, swords and verification glyphs retain the current approved names and icon bytes', () => {
    assert.deepEqual(th.buttons.map(b => b.querySelector('.yl-icon').attrs['data-yolk-glyph']), ['store', 'shield', 'swords', 'fact_check', 'store']);
    const contract = JSON.parse(read('contracts/icons.v1.8.0.json')); for (const b of th.buttons) assert(contract.glyphs.includes(b.querySelector('.yl-icon').attrs['data-yolk-glyph']));
    const font = contract.assets.find(a => a.path.endsWith('material-symbols-rounded-yolk-300-v1.8.0.woff2')); assert(font); const hash = require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root, font.path))).digest('hex'); assert.equal(hash, font.sha256);
  });
  await check('Caption enhancement is idempotent and never wraps ligature text or numeric metadata', () => {
    const before = th.buttons.map(button => ({children: button.childNodes.length, caption: button.querySelectorAll('.control-caption').length, glyphText: button.querySelector('.yl-icon').textContent, countChildren: button.querySelector('.supply-tab-count').childNodes.length}));
    th.h.sandbox.window.YolkIcons.captionControls(th.dom); const after = th.buttons.map(button => ({children: button.childNodes.length, caption: button.querySelectorAll('.control-caption').length, glyphText: button.querySelector('.yl-icon').textContent, countChildren: button.querySelector('.supply-tab-count').childNodes.length})); assert.deepEqual(after, before); assert(before.every(row => row.caption === 1 && row.countChildren === 1));
  });
  await check('Glyph namespace withstands the retained numeric summary span rule in location detail', () => {
    const dom = parse('<div class="yl-poi-detail"><summary><span class="yl-icon" data-yolk-glyph="store">store</span>ดูสาขา<span>4</span></summary></div>'); assert.equal(family(dom.querySelector('.yl-icon')), 'Yolk Material Symbols');
  });
  await check('Glyph namespace also survives inherited numeric or display type in headers, counters and icon-bearing labels', () => {
    for (const html of ['<div class="score"><span class="yl-icon" data-yolk-glyph="shield">shield</span></div>', '<a class="compact-brand"><span class="yl-icon" data-yolk-glyph="egg_alt">egg_alt</span></a>', '<div class="version-tag"><span class="yl-icon" data-yolk-glyph="fact_check">fact_check</span></div>']) assert.equal(family(parse(html).querySelector('.yl-icon')), 'Yolk Material Symbols');
  });
  await check('Font success enables symbols only after the declared glyph face resolves', async () => {const loader = iconLoader('loaded'); assert(await loader.api.load()); assert(loader.classes.has('yolk-icons-ready')); assert(loader.requests.every(r => r.font === '300 24px "Yolk Material Symbols"'));});
  await check('Missing or failed symbol fonts keep fallback glyph names hidden while caption meaning survives', async () => {
    for (const state of ['empty', 'failed']) {const loader = iconLoader(state); assert.equal(await loader.api.load(), false); assert(!loader.classes.has('yolk-icons-ready'));}
    const style = read('prototype/icons.css'); assert(/\.yl-icon\s*\{[^}]*visibility:\s*hidden/s.test(style)); assert(th.buttons.every(button => button.querySelector('.control-caption').textContent.trim()));
  });
  await check('Counter formatting no longer globally targets every Supply span, including icons and Thai captions', () => {
    const genericNumberRules = rules.filter(rule => rule.selector === '.supply-tabs button span' && rule.declarations.some(([name]) => ['font-family', 'font', 'font-size', 'margin-left'].includes(name))); assert.equal(genericNumberRules.length, 0);
  });
  console.log(JSON.stringify({suite: 'icon-controls', version: '1.9.2', checks: checks.length, passed: checks.filter(c => c.passed).length, failures: checks.filter(c => !c.passed), evidence: 'Actual Supply renderer, caption enhancer, declared font/namespace and scoped resting-state CSS cascade fixture. Native font shaping, geometry, themes and device rendering remain separate.'}, null, 2));
  if (checks.some(c => !c.passed)) process.exitCode = 1;
})();
