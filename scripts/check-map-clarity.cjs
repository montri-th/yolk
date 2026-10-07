/* Actual map controller, native sources and DOM/Leaflet adapter. Native pointer/layout QA is separate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const prefix=fs.readFileSync(path.join(__dirname,'check-workspace-map.cjs'),'utf8').split('(async()=>{')[0];
const env=Function('require','__dirname',prefix+'\nreturn {h,run,api,maps,geoGroups,host,panel,document,controls,hitPaths,boundaryPaths,provincePaths,districtPaths,finePaths,camera,tick};')(require,__dirname);
const {h,run,api,maps,geoGroups,hitPaths,boundaryPaths,provincePaths,districtPaths,finePaths,camera,tick}=env;
vm.runInContext(fs.readFileSync(path.join(root,'prototype/data/thailand-provinces.js'),'utf8'),h.sandbox,{filename:'thailand-provinces.js'});run('P.push(...window.YOLK_PROVINCES)');
for(const file of ['map-analysis.js','analysis-ui.js'])vm.runInContext(fs.readFileSync(path.join(root,'prototype',file),'utf8'),h.sandbox,{filename:file});
const checks=[],index=JSON.parse(fs.readFileSync(path.join(root,'prototype/data/real/hierarchy-index.json'),'utf8'));
const activeTips=()=>maps[0].layers.filter(l=>l.kind==='tooltip'&&l.options.className==='workspace-map-hover-tooltip');
const areaPaths=()=>maps[0].renderOrder.filter(p=>p.feature&&p.options.interactive!==false);
const clearTip=hit=>hit.handlers.mouseout?.();
async function check(name,fn){try{await fn();checks.push({name,passed:true});}catch(e){checks.push({name,passed:false,error:String(e.stack||e)});}}
async function nav(p){api.navigate(p,{fit:false,notify:false});await tick();await tick();api.sync();}
const unit=r=>h.sandbox.window.YolkAnalysisUI.unit(r);
(async()=>{
 api.mount();await tick();await tick();run('Y.route="supply";Y.lang="en";Y.pointState="ready"');
 h.sandbox.window.YolkAnalysisUI.set('metric','count');h.sandbox.window.YolkAnalysisUI.set('relation','total');
 await nav({level:'country'});await tick();api.sync();
 const source=run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),before=camera();
 await check('Country hover has one owner and labels the exact clickable province with a native-district maximum and unit',()=>{
  const hit=hitPaths().find(p=>p.feature.properties.code==='10');assert(hit);
  assert(maps[0].renderOrder.every(p=>!p.tooltip),'Analytical children and navigation hits must not retain a second Leaflet tooltip');
  for(const paint of [...provincePaths(),...districtPaths()]){assert.equal(paint.element.getAttribute('aria-hidden'),'true');assert(!paint.element.hasAttribute('role'));assert(!paint.element.hasAttribute('tabindex'));}
  assert.equal(hit.element.getAttribute('role'),'button');assert.equal(hit.element.getAttribute('tabindex'),'0');assert(!hit.element.hasAttribute('aria-hidden'));
  const records=Array.from(api.analysisState().district.records).filter(([id])=>index.districts.find(d=>d.id===id)?.provinceCode==='10').map(([,r])=>r).filter(r=>r.exact),max=Math.max(...records.map(r=>r.value));
  hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);const content=activeTips()[0].content;
  assert(content.includes('Bangkok'));assert(content.includes('Maximum known native district value'));assert(content.includes('not a province total'));assert(content.includes(unit(records[0])));assert(content.includes(String(max)));
  for(let i=0;i<4;i++)hit.handlers.mousemove({latlng:{lat:13.7+i/100,lng:100.5}});assert.equal(activeTips().length,1);assert.deepEqual(camera(),before);clearTip(hit);assert.equal(activeTips().length,0);
 });
 await check('Keyboard focus shows the same single value tooltip at the stable source-layer bounds centre',()=>{
  const hit=hitPaths().find(p=>p.feature.properties.code==='10');hit.element.listeners.focus({});assert.equal(activeTips().length,1);assert.deepEqual(activeTips()[0].coordinate,hit.getBounds().getCenter());assert(activeTips()[0].content.includes('Maximum known native district value'));hit.element.listeners.blur({});assert.equal(activeTips().length,0);
 });
 await check('Province hover names the clicked district and explicitly reports a maximum fine-area value, not a district sum',async()=>{
  await nav({level:'province',provinceCode:'10'});const hit=hitPaths().find(p=>Array.from(api.analysisState().fine.records).some(([id,r])=>r.exact&&index.areas[id]?.districtIds.includes(p.feature.properties.id)));assert(hit);
  const records=Array.from(api.analysisState().fine.records).filter(([id,r])=>r.exact&&index.areas[id]?.districtIds.includes(hit.feature.properties.id)).map(([,r])=>r),max=Math.max(...records.map(r=>r.value));
  hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);const content=activeTips()[0].content;assert(content.includes(hit.feature.properties.nameTh));assert(content.includes('Maximum known fine-location value'));assert(content.includes('not a total'));assert(content.includes(unit(records[0])));assert(content.includes(String(max)));clearTip(hit);
  for(const paint of [...districtPaths(),...finePaths()]){assert.equal(paint.element.getAttribute('aria-hidden'),'true');assert(!paint.element.hasAttribute('role'));assert(!paint.element.hasAttribute('tabindex'));}
  assert.equal(hit.element.getAttribute('role'),'button');assert(!hit.element.hasAttribute('aria-hidden'));
 });
 await check('Exact zero remains zero and unresolved evidence is never formatted as zero',async()=>{
  h.sandbox.window.YolkAnalysisUI.set('relation','own');api.sync();const [id]=Array.from(api.analysisState().fine.records).find(([id,r])=>r.zero&&index.areas[id]?.provinceCode==='10')||[];assert(id,'Actual source fixture must include observed own-store zero');
  const parent=index.areas[id].districtIds[0];await nav({level:'district',provinceCode:'10',districtId:parent});const hit=areaPaths().find(p=>p.feature.properties?.areaId===id);assert(hit);hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);assert(activeTips()[0].content.includes('Observed zero'));assert(!activeTips()[0].content.includes('No confirmed value'));clearTip(hit);
  api.setSupplyView('points');run('Y.pointState="loading"');api.sync();const loadingHit=areaPaths().find(p=>p.feature.properties?.areaId===id);loadingHit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);assert(activeTips()[0].content.includes('Loading coordinates'));assert(!activeTips()[0].content.includes('0 filtered'));clearTip(loadingHit);run('Y.pointState="ready"');
 });
 await check('Country POI view removes the district mesh but retains exact province hover and filtered coordinate-record counts',async()=>{
  h.sandbox.fixturePoints=[{id:'in',area:null,lat:13.75,lng:100.5,brand:'A',relation:'own',industryId:'fuel',status:'source'},{id:'out',area:null,lat:15,lng:104,brand:'A',relation:'own',industryId:'fuel',status:'source'},{id:'filtered',area:null,lat:13.75,lng:100.5,brand:'B',relation:'competitor',industryId:'fuel',status:'source'}];run('Y.pois=fixturePoints;Y.poiQuery="";Y.brandFilter="A";Y.poiTab="all";Y.poiArea=""');
  await nav({level:'country'});assert.equal(api.getSupplyView(),'points');assert.equal(districtPaths().length,0);assert.equal(finePaths().length,0);assert.equal(provincePaths().length,77);assert(provincePaths().every(p=>p.style.color==='#FFFFFF'&&p.style.fill===false));
  const hit=hitPaths().find(p=>p.feature.properties.code==='10');hit.handlers.mouseover({latlng:{lat:13.75,lng:100.5}});assert.equal(activeTips().length,1);const content=activeTips()[0].content;assert(content.includes('1 filtered coordinate records'));assert(content.includes('inside this boundary'));assert(content.includes('not total branch inventory'));assert.equal(maps[0].renderOrder.at(-1).style.color,'#FFBC1F');clearTip(hit);
 });
 await check('Province POI view retains quiet district context and hides fine mesh without changing camera or data',async()=>{
  await nav({level:'province',provinceCode:'10'});assert.equal(finePaths().length,0);assert(districtPaths().length>0);assert(districtPaths().every(p=>p.style.weight===0.65&&p.style.fill===false));assert(provincePaths().every(p=>p.style.weight>0.65));const cam=camera();api.sync();assert.deepEqual(camera(),cam);assert.equal(run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),source);
 });
 await check('District POI view has one parent outline and transparent fine hit areas; hover/click still drills into the source fine polygon',async()=>{
  const id=run('AREAS.find(a=>a.province==="10").id'),parent=index.areas[id].districtIds[0];await nav({level:'district',provinceCode:'10',districtId:parent});assert.equal(districtPaths().length,1);assert.equal(finePaths().length,0);const hit=areaPaths().find(p=>p.feature.properties?.areaId===id);assert(hit);assert.equal(hit.style.stroke,false);assert.equal(hit.style.fill,false);assert.equal(hit.options.className,'workspace-location-hit');
  assert.equal(hit.element.getAttribute('role'),'button');assert.equal(hit.element.getAttribute('tabindex'),'0');assert(!hit.element.hasAttribute('aria-hidden'),'Cached fine targets must regain real button semantics at district scope');
  hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);const outline=maps[0].renderOrder.at(-1);assert.equal(outline.feature,hit.feature);assert.equal(outline.style.color,'#FFBC1F');assert.equal(outline.style.fill,false);clearTip(hit);hit.handlers.click();assert.equal(api.getNavigation().areaId,id);const selected=finePaths();assert.equal(selected.length,1);assert(selected.every(p=>p.style.fill===false&&p.style.color==='#FFFFFF'));
 });
 await check('Switching back to choropleth restores child colours and original hierarchy without changing the camera',async()=>{
  await nav({level:'country'});const cam=camera();api.setSupplyView('regions');assert.deepEqual(camera(),cam);assert.equal(districtPaths().length,928);assert(districtPaths().every(p=>p.style.fill&&p.style.fillOpacity===1&&p.style.weight===0.45));assert(provincePaths().every(p=>p.style.weight>0.45));assert.equal(run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),source);
 });
 await check('Language changes refresh the single hover title and metric text on cached navigation layers',()=>{
  run('Y.lang="th"');api.sync();const hit=hitPaths().find(p=>p.feature.properties.code==='10');hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);assert(activeTips()[0].content.includes('กรุงเทพมหานคร'));assert(activeTips()[0].content.includes('ค่าสูงสุดที่ทราบของอำเภอในจังหวัด'));clearTip(hit);
 });
 await check('Retained location-map focus honours personal or OS reduced motion without adding new map animations',()=>{
  const code=fs.readFileSync(path.join(root,'prototype/location-map.js'),'utf8'),expression=code.match(/\{animate:(.*?)\}\);marker\.openPopup/);assert(expression,'Exercise the actual retained marker-focus option');
  for(const [personal,os]of [[true,false],[false,true],[true,true],[false,false]]){const animate=vm.runInNewContext(expression[1],{global:{YolkActionGuidance:{isReduced:()=>personal},matchMedia:()=>({matches:os})}});assert.equal(animate,!personal&&!os);}
  assert.equal(vm.runInNewContext(expression[1],{global:{}}),true,'Missing optional preferences retain existing behaviour');
 });
 const report={schemaVersion:1,version:'1.9.1',test:'check-map-clarity',passed:checks.every(c=>c.passed),checks,scope:'Real map controller, fixed source datasets and bounded DOM/Leaflet adapter. Native pointer overlap, layout, touch, basemap and physical-device review remain separate.'};
 const out=path.join(root,'../deliverables/yolk-v1.9.1/map-clarity-regression-results.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.passed?'':'\n'+c.error));console.log(JSON.stringify({passed:report.passed,checks:checks.length,report:out}));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
