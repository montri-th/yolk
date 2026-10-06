/* Supply identity/party regression. Native rendering and release evidence remain separate. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),source=name=>fs.readFileSync(path.join(base,'prototype',name),'utf8');
const logos=JSON.parse(source('data/brand-logos.v1.7.json')),presets=JSON.parse(source('data/brand-presets.v1.7.json'));
const sandbox={URLSearchParams,document:{documentElement:{lang:'th'}},YOLK_RUNTIME:{brandPresets:presets,brandLogos:logos}};
vm.runInNewContext(source('icons.js'),sandbox);vm.runInNewContext(source('poi-popup.js'),sandbox);
const api=sandbox.YolkPoiPopup, p={id:'test-point',name:'สาขาตัวอย่าง',brandId:'grocery-brand:CJ_MORE',brand:'CJ More',relation:'competitor',lat:13.7,lng:100.5};
let checks=0;function check(name,run){run();checks++;console.log('PASS',name);}
check('party glyphs are registered DS icon names, retaining machine source codes',()=>{
 for(const [relation,glyph,symbol]of [['own','shield','O'],['competitor','swords','C'],['unverified','fact_check','U']]){
  assert(sandbox.YolkIcons.glyphs.includes(glyph));assert.equal(api.relationship({...p,relation},'en').glyph,glyph);assert.equal(api.relationship({...p,relation},'en').symbol,symbol);
 }
});
check('known POI uses its own real square graphic plus the competitor badge',()=>{
 const html=api.marker(p,{lang:'en'}),entry=logos.entries.find(e=>e.brandId===p.brandId&&e.verifiedSquareGraphic);
 assert(entry);assert(html.includes(entry.localPath));assert(html.includes('yolk-supply-pin-badge'));assert(html.includes('data-supply-party="competitor"'));assert(html.includes('data-yolk-glyph="swords"'));
 const other=logos.entries.find(e=>e.brandId==='grocery-brand:SEVEN_ELEVEN');assert(!html.includes(other.localPath));
});
check('own branch changes only its party badge, not the company graphic',()=>{
 const html=api.marker({...p,relation:'own'});assert(html.includes('data-yolk-glyph="shield"'));assert(!html.includes('data-yolk-glyph="swords"'));assert(html.includes('data-supply-party="own"'));assert(html.includes(logos.entries.find(e=>e.brandId===p.brandId).localPath));
});
check('missing compact artwork falls back to the party icon without inventing a logo',()=>{
 const html=api.marker({...p,brandId:'unknown'});assert(html.includes('data-yolk-glyph="swords"'));assert(!html.includes('<img'));assert(!html.includes('yolk-supply-pin-badge'));
});
check('unresolved party is distinct from no competitor or unbranded',()=>{
 const html=api.marker({...p,brandId:'unknown',relation:null});assert(html.includes('data-supply-party="unverified"'));assert(html.includes('data-yolk-glyph="fact_check"'));assert(!html.includes('data-yolk-glyph="swords"'));assert(!html.includes('data-yolk-glyph="shield"'));
});
check('TH and EN popup captions explain the same stable glyph assignment',()=>{
 for(const [relation,glyph,th,en]of [['own','shield','สาขาเรา','Our store'],['competitor','swords','คู่แข่ง','Competitor'],['unverified','fact_check','รอตรวจสอบ','To verify']]){
  const htmlTH=api.render({...p,relation},{lang:'th'}),htmlEN=api.render({...p,relation},{lang:'en'});assert(htmlTH.includes(th));assert(htmlEN.includes(en));assert(htmlTH.includes(`data-yolk-glyph="${glyph}"`));assert(htmlEN.includes(`data-yolk-glyph="${glyph}"`));
 }
});
check('unsafe artwork paths cannot become map image requests',()=>{
 sandbox.YOLK_RUNTIME.brandLogos={entries:[{brandId:'hostile',verifiedSquareGraphic:true,localPath:'https://host.invalid/logo.svg'}]};
 const html=api.marker({...p,brandId:'hostile'});assert(!html.includes('https://host.invalid'));assert(!html.includes('<img'));sandbox.YOLK_RUNTIME.brandLogos=logos;
});
check('symbol CSS retains exact existing party tokens and original image containment',()=>{
 const css=source('supply-symbols.css');assert(css.includes('var(--yl-own-ink)'));assert(css.includes('var(--yl-rival-ink)'));assert(css.includes('var(--warn)'));assert(css.includes('object-fit:contain'));assert(!css.includes('object-fit:cover'));assert(!/#[0-9a-f]{3,8}\b/i.test(css));assert(css.includes('border-style:dashed'));assert(css.includes('text-decoration:none'));
});
check('persistent map still shows actual POIs only at fine selection or explicit editor focus',()=>{
 const code=source('workspace-map.js');assert(code.includes("const showPoints=S.nav.level==='location'||Y.route==='poi'"));assert(code.includes('global.YolkPoiPopup?.marker?.'));assert(code.includes('data-workspace-party-caption'));assert(code.includes('title=[brand,branchName(p),party]'));assert(code.includes('record.iconHTML!==markerIcon.options?.html'));
});
check('legacy location detail also preserves transparent selected boundary and real marker identity',()=>{
 const code=source('location-map.js');assert(code.includes("fill:false,opacity:1,weight:.8"));assert(!code.includes('fillOpacity:.12'));assert(code.includes('global.YolkPoiPopup.marker(pointRecord,{lang})'));assert(code.includes('global.YolkPoiPopup.render(pointRecord'));
});
console.log(JSON.stringify({suite:'supply-symbols',checks,passed:true,scope:'Source/VM semantics only; native visual review and provider verification are separate.'}));
