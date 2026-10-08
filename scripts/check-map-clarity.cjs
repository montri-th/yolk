/* Actual map controller, native sources and DOM/Leaflet adapter. Native pointer/layout QA is separate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const prefix=fs.readFileSync(path.join(__dirname,'check-workspace-map.cjs'),'utf8').split('(async()=>{')[0];
const env=Function('require','__dirname',prefix+'\nreturn {h,run,api,maps,geoGroups,host,panel,document,controls,hitPaths,boundaryPaths,provincePaths,districtPaths,finePaths,camera,tick};')(require,__dirname);
const {h,run,api,maps,geoGroups,controls,hitPaths,boundaryPaths,provincePaths,districtPaths,finePaths,camera,tick}=env;
vm.runInContext(fs.readFileSync(path.join(root,'prototype/data/thailand-provinces.js'),'utf8'),h.sandbox,{filename:'thailand-provinces.js'});run('P.push(...window.YOLK_PROVINCES)');
for(const file of ['relative-supply.js','map-analysis.js','supply-treemap.js','analysis-ui.js'])vm.runInContext(fs.readFileSync(path.join(root,'prototype',file),'utf8'),h.sandbox,{filename:file});
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
 await check('Country hover has one owner and labels the exact province with direct parent source totals, units and brand composition',()=>{
  const hit=hitPaths().find(p=>p.feature.properties.code==='10');assert(hit);
  assert(maps[0].renderOrder.every(p=>!p.tooltip),'Analytical children and navigation hits must not retain a second Leaflet tooltip');
  for(const paint of [...provincePaths(),...districtPaths()]){assert.equal(paint.element.getAttribute('aria-hidden'),'true');assert(!paint.element.hasAttribute('role'));assert(!paint.element.hasAttribute('tabindex'));}
  assert.equal(hit.element.getAttribute('role'),'button');assert.equal(hit.element.getAttribute('tabindex'),'0');assert(!hit.element.hasAttribute('aria-hidden'));
  const summary=api.supplyBreakdown({level:'province',provinceCode:'10'}),record=h.sandbox.window.YolkMapAnalysis.value({id:'10',supply:summary.supply},{kind:'supply',metric:'count',relation:'total'},run('Y.criteria'));
  hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);const content=activeTips()[0].content;
  assert(content.includes('Bangkok'));assert(content.includes('Direct source value for this boundary'));assert(!content.includes('Maximum known native district value'));assert(content.includes(unit(record)));assert(content.includes(String(record.value)));assert(content.includes('supply-treemap-chart'));assert(/not sales market share|branch share, not sales share/.test(content));
  for(let i=0;i<4;i++)hit.handlers.mousemove({latlng:{lat:13.7+i/100,lng:100.5}});assert.equal(activeTips().length,1);assert.deepEqual(camera(),before);clearTip(hit);assert.equal(activeTips().length,0);
 });
 await check('Keyboard focus shows the same single value tooltip at the stable source-layer bounds centre',()=>{
  const hit=hitPaths().find(p=>p.feature.properties.code==='10');hit.element.listeners.focus({});assert.equal(activeTips().length,1);assert.deepEqual(activeTips()[0].coordinate,hit.getBounds().getCenter());assert(activeTips()[0].content.includes('Direct source value for this boundary'));hit.element.listeners.blur({});assert.equal(activeTips().length,0);
 });
 await check('Province hover names the clickable district and reports its direct source value while fine colours remain independent',async()=>{
  await nav({level:'province',provinceCode:'10'});const hit=hitPaths().find(p=>Array.from(api.analysisState().fine.records).some(([id,r])=>r.exact&&index.areas[id]?.districtIds.includes(p.feature.properties.id)));assert(hit);
  const summary=api.supplyBreakdown({level:'district',provinceCode:'10',districtId:hit.feature.properties.id}),record=h.sandbox.window.YolkMapAnalysis.value({id:hit.feature.properties.id,supply:summary.supply},{kind:'supply',metric:'count',relation:'total'},run('Y.criteria'));
  hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);const content=activeTips()[0].content;assert(content.includes(hit.feature.properties.nameTh));assert(content.includes('Direct source value for this boundary'));assert(!content.includes('Maximum known fine-location value'));assert(content.includes(unit(record)));assert(content.includes(String(record.value)));assert(content.includes('supply-treemap-chart'));clearTip(hit);
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
  await nav({level:'country'});const cam=camera();api.setSupplyView('regions');assert.deepEqual(camera(),cam);assert.equal(districtPaths().length,928);assert(districtPaths().every(p=>p.style.fill&&p.style.fillOpacity===1&&p.style.weight===0.30));assert(provincePaths().every(p=>p.style.weight>0.45));assert.equal(run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),source);
 });
 await check('Language changes refresh the single hover title and metric text on cached navigation layers',()=>{
  run('Y.lang="th"');api.sync();const hit=hitPaths().find(p=>p.feature.properties.code==='10');hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);assert(activeTips()[0].content.includes('กรุงเทพมหานคร'));assert(activeTips()[0].content.includes('ยอดต้นทางตามขอบเขตที่เลือก'));clearTip(hit);
 });
 await check('Supply panel receives scoped native/fine brand totals after every navigation and never uses visible POI counts',async()=>{
  const sink={innerHTML:''};h.sandbox.window.document.querySelectorAll=selector=>selector==='[data-supply-breakdown]'?[sink]:[];
  run('Y.lang="en"');for(const navigation of [{level:'country'},{level:'province',provinceCode:'10'},{level:'district',provinceCode:'10',districtId:index.areas[run('AREAS[0].id')].districtIds[0]},{level:'location',provinceCode:'10',districtId:index.areas[run('AREAS[0].id')].districtIds[0],areaId:run('AREAS[0].id')}]){await nav(navigation);const summary=api.supplyBreakdown();assert.equal(summary.sourceRows,1);assert.equal(summary.geography.level,navigation.level);assert(sink.innerHTML.includes('data-supply-breakdown-state'));assert(sink.innerHTML.includes('not sales market share'));assert.equal(summary.rows.reduce((n,r)=>n+r.count,0),summary.identifiedTotal);}
  delete h.sandbox.window.document.querySelectorAll;
 });
 await check('Share metric preserves demand/source data, camera and white/yellow boundary hierarchy while using exact fixed profile41 bins',async()=>{
  await nav({level:'country'});const cam=camera(),original=run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))');h.sandbox.window.YolkAnalysisUI.set('metric','share');api.sync();assert.deepEqual(camera(),cam);
  const prepared=api.analysisState().district;assert.equal(prepared.metadata.scaleId,'li.market_share');assert.equal(prepared.metadata.classificationMethod,'fixed_0_100_percent_41_equal_width_classes');assert.equal(prepared.legend.length,41);assert.equal(prepared.legend[40].upper,100);assert.equal(prepared.legend[40].upperInclusive,true);
  const paints=districtPaths();assert(paints.some(p=>p.style.fill&&h.sandbox.window.YolkMapAnalysis.palettes['li.market_share'].includes(p.style.fillColor)));assert(paints.every(p=>p.style.fillOpacity===1&&p.style.color==='#FFFFFF'));
  const hit=hitPaths().find(p=>p.feature.properties.code==='10'),summary=api.supplyBreakdown({level:'province',provinceCode:'10'});hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);assert(activeTips()[0].content.includes(h.sandbox.window.YolkAnalysisUI.metricLabel()));assert(activeTips()[0].content.includes(new Intl.NumberFormat('en-US',{maximumSignificantDigits:4}).format(summary.sharePercent)));assert(activeTips()[0].content.includes('supply-treemap-chart'));assert.equal(maps[0].renderOrder.at(-1).style.color,'#FFBC1F');clearTip(hit);assert.equal(run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),original);h.sandbox.window.YolkAnalysisUI.set('metric','count');api.sync();
 });
 await check('Optional rate views show actual native parent denominator rather than an unavailable row or a child maximum',async()=>{
  await nav({level:'country'});h.sandbox.savedDenominator=run('Y.criteria.supplyDenominatorId');run('Y.lang="en";Y.criteria.supplyDenominatorId="gfa"');const hit=hitPaths().find(p=>p.feature.properties.code==='10'),summary=api.supplyBreakdown({level:'province',provinceCode:'10'});
  for(const metric of ['area','market']){h.sandbox.window.YolkAnalysisUI.set('metric',metric);api.sync();const record=h.sandbox.window.YolkMapAnalysis.value({id:'10',supply:summary.supply,areaKm2:summary.sourceContext.areaKm2,metrics:summary.contextMetrics},h.sandbox.window.YolkAnalysisUI.state(),run('Y.criteria'));assert(record.exact,JSON.stringify(record));hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert(activeTips()[0].content.includes(h.sandbox.window.YolkAnalysisUI.formatted(record)));assert(activeTips()[0].content.includes(unit(record)));assert(!activeTips()[0].content.includes('No data'));clearTip(hit);}
  run('Y.criteria.supplyDenominatorId=savedDenominator');h.sandbox.window.YolkAnalysisUI.set('metric','count');api.sync();
 });
 await check('Share heading names the selected metric and an exact empty identified denominator is explained rather than called missing inventory',async()=>{
  run('Y.lang="en"');h.sandbox.window.YolkAnalysisUI.set('metric','share');api.sync();assert(controls.get('[data-workspace-map-title]').innerHTML.includes('Supply · Our branch share'));assert(!controls.get('[data-workspace-map-title]').innerHTML.includes('Where are the branches'));
  const native=JSON.parse(fs.readFileSync(path.join(root,'prototype/data/real/fuel-district-supply.json'),'utf8')),empty=native.rows.find(r=>Object.entries(r[2]).filter(([id])=>id!=='UNKNOWN').reduce((sum,[id,n])=>sum+n,0)===0),ctx=native.contextsById[empty[0]];assert(empty);await nav({level:'province',provinceCode:ctx.provinceCode});
  const hit=hitPaths().find(p=>p.feature.properties.id===empty[0]);assert(hit);hit.handlers.mouseover({latlng:{lat:13.7,lng:100.5}});assert.equal(activeTips().length,1);const content=activeTips()[0].content;assert(content.includes('Identified branch total is 0; percentage undefined'));assert(content.includes('No identified branches in the source'));assert(!content.includes(' · No data'));clearTip(hit);h.sandbox.window.YolkAnalysisUI.set('metric','count');await nav({level:'country'});
 });
 await check('Retained location-map focus honours personal or OS reduced motion without adding new map animations',()=>{
  const code=fs.readFileSync(path.join(root,'prototype/location-map.js'),'utf8'),expression=code.match(/\{animate:(.*?)\}\);marker\.openPopup/);assert(expression,'Exercise the actual retained marker-focus option');
  for(const [personal,os]of [[true,false],[false,true],[true,true],[false,false]]){const animate=vm.runInNewContext(expression[1],{global:{YolkActionGuidance:{isReduced:()=>personal},matchMedia:()=>({matches:os})}});assert.equal(animate,!personal&&!os);}
  assert.equal(vm.runInNewContext(expression[1],{global:{}}),true,'Missing optional preferences retain existing behaviour');
 });
 const report={schemaVersion:1,version:'1.9.1',test:'check-map-clarity',passed:checks.every(c=>c.passed),checks,scope:'Real map controller, fixed source datasets and bounded DOM/Leaflet adapter. Native pointer overlap, layout, touch, basemap and physical-device review remain separate.'};
 const out=path.join(root,'../deliverables/yolk-v1.9.1/map-clarity-regression-results.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.passed?'':'\n'+c.error));console.log(JSON.stringify({passed:report.passed,checks:checks.length,report:out}));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
