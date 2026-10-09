/* POI popup semantics, identity and outbound-link regression. Not browser/provider QA. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const presets = JSON.parse(fs.readFileSync(path.join(base, 'prototype/data/brand-presets.v1.7.json'), 'utf8'));
const logos = JSON.parse(fs.readFileSync(path.join(base, 'prototype/data/brand-logos.v1.7.json'), 'utf8'));
const context = {URLSearchParams, document:{documentElement:{lang:'th'}}, YOLK_RUNTIME:{brandPresets:presets, brandLogos:logos}};
vm.runInNewContext(fs.readFileSync(path.join(base, 'prototype/icons.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(base, 'prototype/poi-popup.js'), 'utf8'), context);
const popup = context.YolkPoiPopup;
const css = fs.readFileSync(path.join(base, 'prototype/poi-popup.css'), 'utf8');
let count = 0;
function check(name, action) { action(); count++; console.log('PASS', name); }
const p = {id:'citymeter:grocery:test', name:'ซอยอินทามระ41', brandId:'grocery-brand:CJ_MORE', brand:'CJ More', lat:13.78791, lng:100.56913, relation:'competitor', status:'source', sourceRecord:true, industryId:'grocery', observedAt:'2026-10-03', note:'PRIVATE-NOTE', sales:999, customers:['PRIVATE-PERSON']};
const opts = {lang:'en', area:{nameTh:'รัชดาภิเษก', nameEn:'Ratchadaphisek', provinceNameEn:'Bangkok'}, ownBrandId:'grocery-brand:SEVEN_ELEVEN', ownBrandName:'7-Eleven'};
const rendered = popup.render(p, opts);
check('POI identity uses the actual competitor brand, not selected own brand', () => {
  assert.match(rendered, /class="yolk-poi-brand">CJ More</);
  assert.match(rendered, /class="yolk-poi-branch">ซอยอินทามระ41</);
  const entry = logos.entries.find(l => l.brandId === p.brandId);
  assert.match(rendered, new RegExp(entry.localPath.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert(!rendered.includes(logos.entries.find(l => l.brandId === 'grocery-brand:SEVEN_ELEVEN').localPath));
});
check('relationship has readable label plus shield/swords/review cue', () => {
  for (const [relation, glyph, word] of [['own','shield','Our store'], ['competitor','swords','Competitor'], ['unverified','fact_check','To verify']]) {
    const html = popup.render({...p, relation}, {lang:'en'});
    assert.match(html, new RegExp(`data-yolk-glyph="${glyph}"`)); assert(html.includes(word));
  }
});
check('source status stays visible, source date does not certify current operation', () => {
  assert(rendered.includes('Source record · not field checked')); assert(rendered.includes('2026-10-03'));
  assert(popup.render({...p, relation:'unverified'},opts).includes('Identity or operation needs checking'));
  assert(popup.render({...p, status:'active'},opts).includes('Team confirmed open'));
  assert(!popup.render({...p, status:'active'},opts).includes('not field checked'));
  assert(popup.render({...p, status:'verified'},opts).includes('Team checked the record'));
  for(const lang of ['th','en']){const active=popup.verification({status:'active',relation:'unverified'},lang);assert.equal(active,lang==='th'?'ทีมยืนยันว่าเปิดอยู่':'Team confirmed open');assert(!/field|survey|สำรวจ/.test(active));}
});
check('native map editor hook preserves exact POI ID', () => {
  assert(rendered.includes(`data-workspace-open-poi="${p.id}"`));
  assert(rendered.includes('View branch'));
});
check('Street View uses the official Maps URL and original coordinates', () => {
  const url = new URL(popup.links(p,opts).streetView);
  assert.equal(url.origin,'https://www.google.com'); assert.equal(url.pathname,'/maps/@');
  assert.equal(url.searchParams.get('api'),'1'); assert.equal(url.searchParams.get('map_action'),'pano');
  assert.equal(url.searchParams.get('viewpoint'),`${p.lat},${p.lng}`);
});
check('missing/invalid coordinates never turn into a Street View zero-point', () => {
  for (const invalid of [{lat:null}, {lat:undefined}, {lng:NaN}, {lng:181}, {lat:'13.7'}, {lat:91}]) assert.equal(popup.links({...p,...invalid},opts).streetView,null);
  assert(popup.render({...p,lat:null},opts).includes('Street View needs usable coordinates'));
});
check('Google AI Mode and plain Search carry the same user-visible question', () => {
  const links = popup.links(p,opts), ai = new URL(links.aiMode), search = new URL(links.search);
  assert.equal(ai.origin,'https://www.google.com'); assert.equal(ai.pathname,'/search');
  assert.equal(ai.searchParams.get('udm'),'50'); assert.equal(ai.searchParams.get('q'),links.prompt);
  assert.equal(search.searchParams.get('q'),links.prompt); assert.equal(search.searchParams.get('udm'),null);
  assert(rendered.includes('Question for your site study')); assert(rendered.includes('Google Search'));
});
check('question uses branch, location and own-brand expansion context', () => {
  const question = popup.prompt(p,opts);
  assert(question.includes('CJ More')); assert(question.includes('ซอยอินทามระ41')); assert(question.includes('Ratchadaphisek'));
  assert(question.includes('7-Eleven')); assert(question.includes('store format')); assert(question.includes('site visit'));
});
check('each supported industry asks for relevant field-study evidence', () => {
  const fuel = popup.prompt({...p,industryId:'fuel'},opts); assert(fuel.includes('U-turns')); assert(fuel.includes('fuel stations'));
  const nonbank = popup.prompt({...p,industryId:'nonbank'},opts); assert(nonbank.includes('financial-service branches')); assert(nonbank.includes('services'));
  const grocery = popup.prompt(p,opts); assert(grocery.includes('homes')); assert(grocery.includes('grocery stores'));
});
check('public search context excludes notes, personal data, metrics and implicit outcomes', () => {
  const links = popup.links(p,opts);
  assert(!JSON.stringify(links).includes('PRIVATE')); assert(!links.prompt.includes('999'));
  assert(links.prompt.includes('Do not infer sales or customer counts'));
});
check('Thai copy is explicit and does not rely on raw ligature labels', () => {
  const html = popup.render(p, {lang:'th'});
  assert(html.includes('คู่แข่ง')); assert(html.includes('ดูข้อมูลสาขา')); assert(html.includes('คำถามสำหรับสำรวจทำเล'));
  assert(popup.prompt(p,{lang:'th'}).includes('ไม่เดายอดขายหรือจำนวนลูกค้า'));
  assert(html.includes('data-yolk-glyph="explore"')); assert(html.includes('data-yolk-glyph="search"'));
});
check('unknown/missing marks keep brand text without inventing a brand graphic', () => {
  const html = popup.render({...p,brandId:'unknown',brand:'Trade name pending'}, opts);
  assert(html.includes('Trade name pending')); assert(html.includes('yolk-poi-mark-fallback')); assert(!html.includes('<img'));
});
check('historical wordmarks cannot bypass the verified compact-graphic gate', () => {
  const html = popup.render({...p,brandId:'pure',brand:'PURE'}, opts);
  assert(html.includes('PURE')); assert(html.includes('yolk-poi-mark-fallback')); assert(!html.includes('<img'));
});
check('official theme-limited mark provides a neutral dark fallback', () => {
  const entry = logos.entries.find(e => e.themeSupport === 'lightOnly' && e.verifiedSquareGraphic);
  assert(entry, 'expected theme-limited evidence fixture');
  const html = popup.render({...p, brandId:entry.brandId},opts);
  assert(html.includes('yolk-poi-mark-dark yolk-poi-mark-fallback')); assert(html.includes(entry.localPath));
});
check('all external actions are user-activated links with safe new-tab semantics', () => {
  const external = [...rendered.matchAll(/<a\b[^>]*>/g)].map(m=>m[0]); assert.equal(external.length,3);
  for (const tag of external) { assert(tag.includes('target="_blank"')); assert(tag.includes('rel="noopener noreferrer"')); assert(tag.includes('referrerpolicy="no-referrer"')); }
  const source = fs.readFileSync(path.join(base,'prototype/poi-popup.js'),'utf8');
  assert(!/\bfetch\s*\(|sendBeacon|window\.open|localStorage/.test(source));
});
check('source labels and IDs are escaped without changing the record', () => {
  const hostile = {...p, id:'\"><img src=x onerror=alert(1)>', name:'<script>alert(1)</script>', brandId:null, brand:'<svg onload=evil()>'};
  const before = JSON.stringify(hostile), html = popup.render(hostile,opts);
  assert(!html.includes('<script>')); assert(!html.includes('<svg onload')); assert(!html.includes('<img src=x'));
  assert(html.includes('&lt;script&gt;')); assert.equal(JSON.stringify(hostile),before);
});
check('new popup CSS has no logo frame, crop or invented analytical colours', () => {
  assert(css.includes('object-fit:contain')); assert(!css.includes('object-fit:cover'));
  assert(!/#[a-f\d]{3,8}\b|rgba?\(|hsl\(/i.test(css));
  assert(css.includes('min-height:44px')); assert(css.includes(':focus-visible'));
  const markRules = [...css.matchAll(/[^{}]*\.yolk-poi-mark[^{}]*\{([^}]+)\}/g)].map(m=>m[1]);
  assert(markRules.every(r=>!/(?:background|border|box-shadow)\s*:/.test(r)));
});
console.log(`POI POPUP REGRESSION: ${count} PASS`);
