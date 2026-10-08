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

function actualSemanticNavigation(api, lang, route = 'demand') {
  const app = read('prototype/app.js'), elements = new Map();
  const $ = key => {if (!elements.has(key)) elements.set(key, {querySelector: () => null}); return elements.get(key);};
  const sandbox = {document: {documentElement: {}, activeElement: null}, $, Y: {lang, route, pois: []},
    window: {YolkIcons: api}, YolkIcons: api, YolkBrands: {displayName: (id, name) => name}, ownBrandName: () => 'Brand',
    escapeHTML: s => String(s), tr: (th, en) => lang === 'th' ? th : en, YolkTheme: {renderControl: () => ''},
    unreadCount: () => 0, pendingSupplyBadge: () => '', PEOPLE: [{id: 'm', role: 'admin'}], person: () => 'Manee',
    sidebarExpanded: false, setSidebarExpanded() {}};
  const declarations = ['const uiIcon=', 'const navIcon=', 'const navItems=', 'const tabTitle=', 'const compactNavLabels=']
    .map(prefix => {const line = app.split('\n').find(line => line.startsWith(prefix)); assert(line); return line;}).join('\n');
  const start = app.indexOf('function header()'), end = app.indexOf('\nfunction ', start + 1);
  vm.runInNewContext(declarations + '\n' + app.slice(start, end) + '\nheader()', sandbox);
  const controls = ['#sidebar', '#mobile-nav'].map(id => {
    const dom = parse($(id).innerHTML); api.captionControls(dom);
    return dom.querySelectorAll('a').find(a => a.attrs.href === '#' + route && (route !== 'market' || !a.className.includes('yolk-brand')));
  });
  if (route === 'market') {const dom = parse($('#header').innerHTML); api.captionControls(dom); controls.push(dom.querySelectorAll('a').find(a => a.attrs.href === '#market' && a.className.includes('header-team-link')));}
  return controls;
}

async function actualDemandUI(lang) {
  const h = makeHarness(); h.sandbox.num = n => String(n); h.sandbox.inMapArea = () => true;
  h.sandbox.window.document = h.sandbox.document;
  h.sandbox.mapNavigation = () => ({level: 'country'}); h.sandbox.mapNavigationTitle = () => 'Country';
  for (const name of ['relative-supply.js', 'decision-ui.js', 'supply-compare.js', 'simple-criteria.js', 'analysis-ui.js'])
    vm.runInContext(read('prototype/' + name), h.sandbox, {filename: 'actual-' + name});
  await h.select('grocery', 'grocery-brand:SEVEN_ELEVEN', 'C_STORE'); h.sandbox.langFixture = lang;
  h.evaluate('Y.lang=langFixture;draft=structuredClone(Y.criteria)');
  return {h, page: h.sandbox.window.YolkAnalysisUI.demandPage(), criteria: h.sandbox.window.YolkSimpleCriteria.demand(''),
    detail: h.sandbox.window.YolkDecisions.detail(h.evaluate('evaluate().find(a=>a.eligible)'))};
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
  await check('Demand graphic reuses the exact original Yolk O glyph without changing identity or font bytes', () => {
    const api = iconLoader('loaded').api, demand = api.demandIcon(), egg = api.yolkIcon();
    assert.equal(demand.replace('class="yl-icon yolk-demand-icon" data-yolk-semantic="demand"', 'class="yl-icon"'), egg);
    assert(api.yolkWordmark().includes(egg)); assert(!api.yolkWordmark().includes('data-yolk-semantic="demand"'));
    assert(demand.includes('aria-hidden="true"')); assert(demand.includes('data-yolk-glyph="egg_alt"'));
    const asset = JSON.parse(read('contracts/icons.v1.8.0.json')).assets[0], bytes = fs.readFileSync(path.join(root, asset.path));
    assert.equal(bytes.length, asset.bytes); assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  });
  await check('Actual Thai and English desktop/mobile Demand navigation uses the fried egg with one readable caption and current state', () => {
    const api = iconLoader('loaded').api;
    for (const lang of ['th', 'en']) for (const control of actualSemanticNavigation(api, lang)) {
      assert(control); assert.equal(control.attrs['aria-current'], 'page');
      const glyph = control.querySelector('.yl-icon'); assert(glyph); assert.equal(glyph.attrs['data-yolk-glyph'], 'egg_alt');
      assert.equal(glyph.attrs['data-yolk-semantic'], 'demand'); assert.equal(glyph.textContent, 'egg_alt');
      assert(control.querySelector('.control-caption')?.textContent.includes('Demand'));
      assert(!control.querySelectorAll('.yl-icon').some(icon => icon.attrs['data-yolk-glyph'] === 'location_on'));
      const count = control.querySelectorAll('.control-caption').length; api.captionControls({querySelectorAll: () => [control]});
      assert.equal(control.querySelectorAll('.control-caption').length, count);
    }
  });
  await check('Actual Demand headings, map-analysis controls, simple criteria and location verdict reuse the same labelled egg in both languages', async () => {
    for (const lang of ['th', 'en']) {
      const fixture = await actualDemandUI(lang);
      for (const html of [fixture.page, fixture.criteria, fixture.detail]) {
        const dom = parse(html), eggs = dom.querySelectorAll('.yolk-demand-icon'); assert(eggs.length > 0);
        assert(eggs.every(egg => egg.attrs['data-yolk-glyph'] === 'egg_alt' && egg.attrs['aria-hidden'] === 'true'));
        assert(!dom.querySelectorAll('.yl-icon').some(icon => icon.attrs['data-yolk-glyph'] === 'location_on'));
      }
      assert.equal(parse(fixture.page).querySelectorAll('.yolk-demand-icon').length, 2);
    }
  });
  await check('Demand semantic styling retains the Material namespace, theme-aware product accent and caption-only hover rules', () => {
    const api = iconLoader('loaded').api, dom = parse('<a href="#demand">' + api.demandIcon() + 'Demand</a>'); api.captionControls(dom);
    assert.equal(family(dom.querySelector('.yl-icon')), 'Yolk Material Symbols');
    const style = read('prototype/icons.css'); assert(style.includes('.yl-icon.yolk-demand-icon{color:var(--yl-yolk-accent,var(--accent));text-decoration:none}'));
    assert(style.includes('.has-caption-icon .yl-icon{text-decoration:none}'));
    assert(style.includes('a.has-caption-icon:hover .control-caption'));
    assert(!/\.yolk-demand-icon[^}]*\b(?:filter|transform|opacity|background|font-variation-settings)\s*:/s.test(style));
  });
  await check('Opportunity collection composes exactly three original Yolk egg graphics with no alternate glyph or changed identity', () => {
    const api = iconLoader('loaded').api, graphic = parse(api.opportunityIcon()).querySelector('.yolk-opportunity-icon'); assert(graphic);
    assert.equal(graphic.attrs['data-yolk-semantic'], 'opportunity'); assert.equal(graphic.attrs['aria-hidden'], 'true');
    assert.equal(graphic.childNodes.length, 3); assert(graphic.childNodes.every(egg => egg.attrs['data-yolk-glyph'] === 'egg_alt' && egg.attrs['aria-hidden'] === 'true' && egg.textContent === 'egg_alt'));
    assert.equal(api.opportunityIcon().split(api.yolkIcon()).length - 1, 3);
    assert(!api.yolkWordmark().includes('yolk-opportunity-icon')); assert.equal(parse(api.demandIcon()).querySelectorAll('[data-yolk-glyph]').length, 1);
  });
  await check('Actual Thai and English Opportunity navigation and menu use the three-egg graphic with preserved captions and state', () => {
    const api = iconLoader('loaded').api;
    for (const lang of ['th', 'en']) for (const [i, control] of actualSemanticNavigation(api, lang, 'market').entries()) {
      assert(control); if (i < 2) assert.equal(control.attrs['aria-current'], 'page');
      const graphic = control.querySelector('.yolk-opportunity-icon'); assert(graphic); assert.equal(graphic.childNodes.length, 3);
      assert(control.querySelector('.control-caption')?.textContent.trim()); assert(graphic.childNodes.every(egg => family(egg) === 'Yolk Material Symbols'));
      assert(!graphic.querySelectorAll('.control-caption').length); const captions = control.querySelectorAll('.control-caption').length;
      api.captionControls({querySelectorAll: () => [control]}); assert.equal(control.querySelectorAll('.control-caption').length, captions);
    }
  });
  await check('Three-egg opportunity layout stays in one unframed icon slot; strategy-specific and field-navigation compass glyphs stay unchanged', () => {
    const style = read('prototype/icons.css'), app = read('prototype/app.js'), strategy = read('prototype/strategy-ui.js');
    assert(style.includes('.yolk-opportunity-icon>.yl-icon[data-yolk-glyph]{position:absolute;font-size:.64em!important;line-height:1;width:1em;height:1em;margin:0'));
    for (const position of ['nth-child(1){top:0;left:0}', 'nth-child(2){top:0;right:0}', 'nth-child(3){bottom:0;left:18%}']) assert(style.includes(position));
    assert(!/\.yolk-opportunity-icon[^}]*\b(?:filter|transform|opacity|background|border|font-variation-settings)\s*:/s.test(style));
    assert(app.includes("market:'opportunity'")); assert(app.includes("['market',tr('เลือกโอกาส','Explore opportunities'),'opportunity']"));
    assert(strategy.includes("${global.YolkIcons?.opportunityIcon()||''}${t('โอกาสขยาย'"));
    assert(strategy.includes("const glyphs={underserved_market:'explore',segment_gap:'groups',competitive_entry:'swords',cluster_participation:'store',complementary_location:'layers',route_capture:'arrow_forward',network_infill:'shield',future_entry:'flag'};"));
    assert(strategy.includes("${icon('explore')}${t('งานแรก','First field task')}"));
  });
  console.log(JSON.stringify({suite: 'icon-controls', version: '1.9.6', checks: checks.length, passed: checks.filter(c => c.passed).length, failures: checks.filter(c => !c.passed), evidence: 'Actual Supply/Demand renderers, navigation, caption enhancer, retained font/identity bytes and scoped resting-state CSS cascade fixture. Native font shaping, geometry, themes and device rendering remain separate.'}, null, 2));
  if (checks.some(c => !c.passed)) process.exitCode = 1;
})();
