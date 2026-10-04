/* Actual source geometry with a small Leaflet adapter. Browser pointer QA is separate. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const readJSON = filename => JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
const districts = readJSON('prototype/data/real/district-boundaries.geojson').features;
const fines = readJSON('prototype/data/real/fine-boundaries/10.geojson').features;
const provincesFile = fs.readdirSync(path.join(root,'prototype/data/real')).find(n => /province.*(?:geojson|json)$/.test(n) && !/provenance|hierarchy/.test(n));
let provinces = provincesFile ? readJSON('prototype/data/real/'+provincesFile).features : null;
if (!provinces) {
  const candidates = fs.readdirSync(path.join(root,'prototype/data')).filter(n=>/province.*(?:geojson|json)$/.test(n));
  for (const candidate of candidates) { const content = readJSON('prototype/data/'+candidate); if (content.features?.length) { provinces = content.features; break; } }
}
assert(provinces?.length, 'actual province source fixture not found');
const countScale = readJSON('reference/lds-0.9.7/color-srgb-10.scales.json').scales.find(s=>s.scaleId==='count'&&s.theme==='light');
assert.equal(countScale.lut.length,41);
const sourcePaints = [0,20,40].map((index,i)=>Object.freeze({feature:districts[i],style:Object.freeze({fill:true,fillColor:countScale.lut[index],fillOpacity:1,color:'#FFFFFF',weight:0.45}),nativeClass:index}));
const map = {layers:new Set(),renderOrder:[...sourcePaints],fitBounds(){throw Error('Hover must not refit the map');},setView(){throw Error('Hover must not alter viewport');},removeLayer(layer){this.layers.delete(layer);this.renderOrder=this.renderOrder.filter(x=>x!==layer);}};
const shapes = [], tips = [];
const L = {
  geoJSON(feature, options) { const layer = {feature, options, styles:[], addTo(m){m.layers.add(this);if(!m.renderOrder.includes(this))m.renderOrder.push(this);return this;},remove(){map.removeLayer(this);},setStyle(style){this.styles.push(style);},bringToFront(){map.renderOrder=map.renderOrder.filter(x=>x!==this);map.renderOrder.push(this);}}; shapes.push(layer); return layer; },
  tooltip(options) { const tip = {options, setLatLng(v){this.latlng=v;return this;},setContent(v){this.content=v;return this;},addTo(m){m.layers.add(this);return this;},remove(){map.layers.delete(this);}};tips.push(tip);return tip; }
};
const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(root,'prototype/map-hover.js'),'utf8'),sandbox);
let color = 'var(--yl-map-hover)', count = 0;
const helper = sandbox.YolkMapHover.create({map,L,token:()=>color});
const target = (level,id,feature,label) => ({level,id,feature,label});
const a = target('province','10',provinces[0],'Explore province');
const b = target('district',districts[0].properties?.districtId || 'source-district',districts[0],'Explore district');
const c = target('location',fines[0].properties?.areaId || 'source-fine',fines[0],'Explore fine location');
function check(name, action) { action();count++;console.log('PASS',name); }
check('outline uses the exact supplied province source polygon over district colouring',()=>{
  const before = JSON.stringify(a.feature);assert(helper.show(a,{lat:13,lng:100}));assert.equal(shapes.at(-1).feature,a.feature);assert.equal(helper.getState().level,'province');assert.equal(JSON.stringify(a.feature),before);
});
check('province and district drill targets use their exact respective district/fine source features',()=>{
  for (const t of [b,c]) { assert(helper.show(t));assert.equal(shapes.at(-1).feature,t.feature);assert.equal(helper.getState().id,t.id);assert.equal(helper.getState().level,t.level); }
});
check('hover adds only an unfilled non-interactive outline with an exact caller-supplied token',()=>{
  for (const shape of shapes) { assert.equal(shape.options.style.fill,false);assert.equal(shape.options.style.opacity,1);assert.equal(shape.options.style.color,color);assert.equal(shape.options.interactive,false);assert.equal(shape.options.bubblingMouseEvents,false); }
});
check('same target mouse movement reuses outline and tooltip rather than re-rendering data',()=>{
  helper.clear();helper.show(a,{lat:13,lng:100});const n=shapes.length,t=tips.length;helper.show(a,{lat:13.1,lng:100.1});assert.equal(shapes.length,n);assert.equal(tips.length,t);assert.equal(tips.at(-1).latlng.lat,13.1);assert.equal(map.layers.size,2);
});
check('replacement removes the old outline; stale mouseout cannot erase newer hover',()=>{
  helper.show(b,{lat:13,lng:100});assert.equal(map.layers.size,2);assert(!helper.clear(a));assert.equal(helper.getState().level,'district');assert(helper.clear(b));assert.equal(map.layers.size,0);
});
check('outline refreshes the caller hover token without changing source geometry or analytical fill',()=>{
  helper.show(c);const n=shapes.length;color='#FFBC1F';helper.show(c);assert.equal(shapes.length,n);assert.equal(shapes.at(-1).styles.at(-1).color,color);assert.equal(shapes.at(-1).options.style.fill,false);
});
check('yellow hover stays above native LUT fills and removal restores the untouched source painter order',()=>{
  const original=JSON.stringify(sourcePaints);helper.clear();assert.deepEqual(map.renderOrder,sourcePaints);helper.show(a,{lat:13,lng:100});const outline=shapes.at(-1);assert.equal(map.renderOrder.at(-1),outline);assert.equal(outline.options.style.color,'#FFBC1F');assert(outline.options.style.weight>Math.max(...sourcePaints.map(p=>p.style.weight)),'Hover must remain visible above thin white data boundaries');assert.equal(outline.options.style.fill,false);assert.equal(outline.options.interactive,false);helper.clear();assert.deepEqual(map.renderOrder,sourcePaints);assert.equal(JSON.stringify(sourcePaints),original);assert.equal(map.layers.size,0);
});
check('unsupported extents, missing geometry or missing target labels fail visibly closed',()=>{
  for (const bad of [{...a,feature:{type:'Feature',geometry:{type:'Point',coordinates:[100,13]}}},{...a,feature:null},{...a,label:''},{...a,level:'country'},{...a,feature:{type:'Feature',geometry:{type:'Polygon',coordinates:[]}}}]) {assert(!helper.show(bad));assert.equal(helper.getState().active,false);assert.equal(map.layers.size,0);}
});
check('tooltip escapes labels and never becomes a navigation or mutation proxy',()=>{
  helper.show({...a,label:'<img src=x onerror=evil()> · province'},{lat:13,lng:100});assert(tips.at(-1).content.includes('&lt;img'));assert(!tips.at(-1).content.includes('<img'));assert.equal(tips.at(-1).options.interactive,false);
});
function eventLayer() {
  const handlers = new Map(), dom = new Map();
  return {handlers,dom,on(type,fn){handlers.set(type,fn);return this;},off(type,fn){if(handlers.get(type)===fn)handlers.delete(type);return this;},getElement(){return {addEventListener(type,fn){dom.set(type,fn);},removeEventListener(type,fn){if(dom.get(type)===fn)dom.delete(type);}};}};
}
check('native hover/move/out binding controls the actual target and preserves click owner',()=>{
  helper.clear();const layer=eventLayer(),unbind=helper.bind(layer,()=>b);assert.equal(layer.handlers.has('click'),false);layer.handlers.get('mouseover')({latlng:{lat:13,lng:100}});assert.equal(helper.getState().level,'district');assert.equal(map.renderOrder.at(-1).feature,b.feature);assert.equal(map.renderOrder.at(-1).options.style.color,'#FFBC1F');layer.handlers.get('mouseout')();assert.equal(helper.getState().active,false);unbind();assert.equal(layer.handlers.size,0);
});
check('keyboard focus/blur uses the same exact target outline without synthetic click',()=>{
  const layer=eventLayer(),unbind=helper.bind(layer,()=>c);layer.dom.get('focus')({});assert.equal(helper.getState().id,c.id);assert.equal(map.renderOrder.at(-1).feature,c.feature);assert.equal(map.renderOrder.at(-1).options.style.color,'#FFBC1F');layer.dom.get('blur')({});assert.equal(helper.getState().active,false);unbind();assert.equal(layer.dom.size,0);
});
check('binding cleanup and destruction remove active geometry and all handlers',()=>{
  const layer=eventLayer();helper.bind(layer,()=>a);layer.handlers.get('mouseover')({latlng:{lat:13,lng:100}});helper.destroy();assert.equal(map.layers.size,0);assert.equal(layer.handlers.size,0);assert.equal(layer.dom.size,0);assert(!helper.show(a));assert.equal(helper.getState().bindingCount,0);
});
check('module contains no centroid, crosswalk guess, opaque paint, fetch or team mutation',()=>{
  const code = fs.readFileSync(path.join(root,'prototype/map-hover.js'),'utf8');
  assert(!/\bfetch\s*\(|fitBounds\s*\(|setView\s*\(|fill\s*:\s*true|localStorage|dispatchEvent|onNavigate\(/.test(code));assert(!/#[a-f\d]{3,8}\b/i.test(code));
});
console.log(`MAP HOVER REGRESSION: ${count} PASS`);
