/* Real source/context regressions. Display-geometry inference is not legal or aggregate assignment. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),prototype=path.join(root,'prototype');
const prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const makeHarness=Function('require','__dirname',prefix+'\nreturn harness;'),h=makeHarness(require,__dirname)(),run=h.evaluate;
const modulePath=path.join(prototype,'branch-context.js');
if(!fs.existsSync(modulePath)){console.error('Missing prototype/branch-context.js; implement the runtime contract before running these checks.');process.exit(1);}
vm.runInContext(fs.readFileSync(modulePath,'utf8'),h.sandbox,{filename:'branch-context.js'});
const api=h.sandbox.window.YolkBranchContext,checks=[],observations={};
const plain=value=>JSON.parse(JSON.stringify(value));
const read=name=>JSON.parse(fs.readFileSync(path.join(prototype,name),'utf8'));
const sourceHash=name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(prototype,name))).digest('hex');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const point={lat:15.597502,lng:103.808856};
const feature=coordinates=>({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates}});
const square=feature([[[0,0],[4,0],[4,4],[0,4],[0,0]]]);
const hole=feature([square.geometry.coordinates[0],[[1,1],[3,1],[3,3],[1,3],[1,1]]]);
const multi={type:'Feature',properties:{},geometry:{type:'MultiPolygon',coordinates:[square.geometry.coordinates,[[[10,10],[14,10],[14,14],[10,14],[10,10]]]]}};
const insideCandidates=(features,p)=>features.map(f=>({feature:f,classification:api.classifyPoint(f,p)})).filter(x=>['inside','boundary'].includes(x.classification));
const signatures=()=>({areas:run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),pois:run('JSON.stringify(Y.pois)'),criteria:run('JSON.stringify(Y.criteria)'),draft:run('JSON.stringify(draft)'),contexts:run('JSON.stringify(Y.contexts)')});
async function check(name,test){try{await test();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:String(error.stack||error)});}}
function setContext(values){h.sandbox.branchContextTestValues=values;run('Object.assign(Y,branchContextTestValues)');}
function brandId(value){return value?.id||value?.brandId;}

async function formFixture({existing=null,nav={level:'country'},values={}}={}){
 const f=makeHarness(require,__dirname)(),runForm=f.evaluate,timers=new Map(),listeners=new Map(),previews=[];let timerId=0,held=null,rejectNext=false;
 f.sandbox.setTimeout=fn=>{const id=++timerId;timers.set(id,fn);return id;};f.sandbox.clearTimeout=id=>timers.delete(id);
 vm.runInContext(fs.readFileSync(modulePath,'utf8'),f.sandbox,{filename:'branch-context.js'});
 vm.runInContext(fs.readFileSync(path.join(prototype,'supply-ui.js'),'utf8'),f.sandbox,{filename:'supply-ui.js'});
 await f.select('fuel','bangchak','all_fuel');
 const fineId='8f69c8f1-b275-4616-8ab5-8c641881e93f',districtId='a52c56b4-46e2-477f-bde9-99bb328394a1';
 const match={state:'unique',provinceCandidates:[{code:'45',classification:'inside'}],districtCandidates:[{id:districtId,classification:'inside'}],areaCandidates:[{id:fineId,province:'45',classification:'inside'}],sourceFiles:['data/real/fine-boundaries/45.geojson']};
 const outside={state:'unresolved',provinceCandidates:[],districtCandidates:[],areaCandidates:[],sourceFiles:['data/real/province-boundaries.geojson']};
 let currentNav={...nav};f.sandbox.window.YolkWorkspaceMap={getNavigation:()=>({...currentNav}),areaIdsForDistrict:()=>[fineId],previewBranchArea:id=>{previews.push(id);currentNav={level:'location',provinceCode:'45',areaId:id};},clearBranchArea:()=>{previews.push(null);currentNav={level:'country'};},async resolvePoint(p){if(rejectNext){rejectNext=false;throw Error('Simulated geometry transport failure');}if(held)return held.promise;return p.lat===point.lat&&p.lng===point.lng?plain(match):plain(outside);}};
 f.sandbox.formExisting=existing;runForm('Y.pois=formExisting?[structuredClone(formExisting)]:[];Y.poiArea="";Y.poiTab="all";Y.brandFilter=""');
 const initial=f.sandbox.window.YolkBranchContext.initialValues(existing,currentNav),apiForm=f.sandbox.window.YolkBranchContext;
 class Select{
  constructor(name,options,value=''){this.name=name;this.options=[...options];this._value='';this.value=value;this._html='';}
  set value(value){const text=String(value??'');this._value=this.options.includes(text)?text:'';}
  get value(){return this._value;}
  set innerHTML(html){this._html=html;const rows=[...html.matchAll(/<option\s+value="([^"]*)"([^>]*)>/g)];this.options=rows.map(r=>r[1]);this.value=rows.find(r=>/\bselected\b/.test(r[2]))?.[1]??this.options[0]??'';}
  get innerHTML(){return this._html;}
 }
 const value={...initial,...values},elements={};
 for(const name of ['lat','lng','brand','name','note'])elements[name]={name,value:String(value[name]??'')};
 elements.province=new Select('province',['',...new Set(runForm('AREAS.map(a=>a.province)'))],value.province);
 elements.area=new Select('area',['',...runForm('AREAS.map(a=>a.id)')],value.area);
 elements.relation=new Select('relation',['own','competitor','unverified'],value.relation);elements.status=new Select('status',['source','pending','active','closed'],value.status);
 const note={innerHTML:'',textContent:''},label={textContent:''},form={id:'poi-form',isConnected:true,dataset:{id:initial.id,revision:String(initial.revision),photoDraftId:apiForm.photoDraftId(initial)},elements,querySelector:s=>s==='#branch-context-note'?note:s==='label[for="branch-area"]'?label:null,addEventListener:(type,fn)=>listeners.set(type,fn)};
 f.sandbox.document.getElementById=id=>id==='poi-form'?form:null;f.sandbox.location.hash='#poi/'+initial.id;
 const dispatch=(type,name,text)=>{if(text!==undefined)elements[name].value=text;listeners.get(type)?.({target:elements[name]});};
 const settle=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
 const flush=async()=>{const queued=[...timers.values()];timers.clear();for(const fn of queued)await fn();await settle();};
 const hold=()=>{let release;const promise=new Promise(resolve=>release=resolve);held={promise,release};return result=>{const pending=held;held=null;pending.release(result);};};
 apiForm.bind(form);await settle();
 return {f,api:apiForm,form,elements,note,dispatch,flush,settle,previews,match,outside,hold,reject:()=>{rejectNext=true;}};
}

(async()=>{
 await check('Required reusable context APIs are available',()=>{for(const method of ['classifyPoint','initialValues','brands','canonicalBrand','coordinatePair'])assert.equal(typeof api?.[method],'function',method);});
 await check('Blank, partial and invalid coordinates remain missing instead of becoming zero',()=>{
  for(const pair of [['',''],['   ','103.8'],[null,null],[undefined,undefined],['15.5',''],['NaN','103.8'],['91','103.8'],['15.5','181'],[Infinity,100]])assert.equal(api.coordinatePair(...pair),null,JSON.stringify(pair));
 });
 await check('Valid numeric zero and source decimal coordinates remain exact',()=>{
  assert.deepEqual(plain(api.coordinatePair('0','0')),{lat:0,lng:0});
  assert.deepEqual(plain(api.coordinatePair('15.597502','103.808856')),point);
  assert.deepEqual(plain(api.coordinatePair('-90','180')),{lat:-90,lng:180});
 });
 await check('Strict interior is distinct from exterior',()=>{assert.equal(api.classifyPoint(square,{lat:2,lng:2}),'inside');assert.equal(api.classifyPoint(square,{lat:5,lng:2}),'outside');});
 await check('Every square edge and vertex is a boundary, never an automatic interior assignment',()=>{
  for(const p of [{lat:0,lng:2},{lat:4,lng:2},{lat:2,lng:0},{lat:2,lng:4},{lat:0,lng:0},{lat:4,lng:4}])assert.equal(api.classifyPoint(square,p),'boundary',JSON.stringify(p));
 });
 await check('Polygon holes exclude their interior and retain the hole-edge boundary',()=>{assert.equal(api.classifyPoint(hole,{lat:0.5,lng:0.5}),'inside');assert.equal(api.classifyPoint(hole,{lat:2,lng:2}),'outside');assert.equal(api.classifyPoint(hole,{lat:1,lng:2}),'boundary');});
 await check('MultiPolygon includes either component without filling the gap',()=>{assert.equal(api.classifyPoint(multi,{lat:2,lng:2}),'inside');assert.equal(api.classifyPoint(multi,{lat:12,lng:12}),'inside');assert.equal(api.classifyPoint(multi,{lat:7,lng:7}),'outside');assert.equal(api.classifyPoint(multi,{lat:10,lng:12}),'boundary');});
 await check('Invalid points and unsupported/malformed geometry never become candidates',()=>{
  for(const f of [null,{},feature([]),feature([[[0,0]]]),{geometry:{type:'Point',coordinates:[1,1]}},{geometry:{type:'MultiPolygon',coordinates:{}}}])assert.equal(api.classifyPoint(f,{lat:1,lng:1}),'invalid');
  for(const p of [null,{}, {lat:NaN,lng:1},{lat:null,lng:null},{lat:'',lng:''},{lat:100,lng:1}])assert.equal(api.classifyPoint(square,p),'invalid');
 });
 await check('Overlapping polygons retain both candidates rather than claiming a unique assignment',()=>{
  const shifted=feature([[[1,1],[5,1],[5,5],[1,5],[1,1]]]);assert.equal(insideCandidates([square,shifted],{lat:2,lng:2}).length,2);
 });
 await check('A shared polygon edge retains boundary candidates on both sides',()=>{
  const adjacent=feature([[[4,0],[8,0],[8,4],[4,4],[4,0]]]);const matches=insideCandidates([square,adjacent],{lat:2,lng:4});assert.equal(matches.length,2);assert(matches.every(x=>x.classification==='boundary'));
 });
 await check('The reported source coordinate has exactly one strict province match across all 77 provinces',()=>{
  const data=read('data/real/province-boundaries.geojson');assert.equal(data.features.length,77);const matches=insideCandidates(data.features,point);assert.equal(matches.length,1);assert.equal(matches[0].classification,'inside');assert.equal(matches[0].feature.properties.code,'45');observations.province={code:'45',sha256:sourceHash('data/real/province-boundaries.geojson')};
 });
 await check('The source coordinate has exactly one strict native district match across 928 districts',()=>{
  const data=read('data/real/district-boundaries.geojson');assert.equal(data.features.length,928);const matches=insideCandidates(data.features,point);assert.equal(matches.length,1);assert.equal(matches[0].classification,'inside');assert.equal(matches[0].feature.properties.code,'4511');assert.equal(matches[0].feature.properties.nameTh,'สุวรรณภูมิ');observations.district={code:'4511',sha256:sourceHash('data/real/district-boundaries.geojson')};
 });
 await check('All 7,954 fine source polygons produce one strict Suwannaphum local-authority candidate',()=>{
  let count=0;const matches=[];for(const file of fs.readdirSync(path.join(prototype,'data/real/fine-boundaries')).filter(x=>x.endsWith('.geojson')).sort()){const data=read('data/real/fine-boundaries/'+file);count+=data.features.length;matches.push(...insideCandidates(data.features,point));}
  assert.equal(count,7954);assert.equal(matches.length,1);const match=matches[0];assert.equal(match.classification,'inside');assert.equal(match.feature.properties.areaId,'8f69c8f1-b275-4616-8ab5-8c641881e93f');assert.equal(match.feature.properties.nameTh,'เทศบาลตำบล สุวรรณภูมิ');assert.equal(match.feature.properties.legalBoundaryIndependentlyVerified,false);observations.fine={province:'45',name:'เทศบาลตำบล สุวรรณภูมิ',sha256:sourceHash('data/real/fine-boundaries/45.geojson'),universeCount:count,legalBoundaryIndependentlyVerified:false};
 });
 await h.select('fuel','bangchak','all_fuel');
 const savedSelected=run('AREAS.find(a=>a.province==="10").id'),fineId='8f69c8f1-b275-4616-8ab5-8c641881e93f';
 setContext({selected:savedSelected,poiArea:'',province:'',poiTab:'all',brandFilter:'',pois:[]});
 await check('A new nationwide record never inherits an old selected sample area or forced Bangkok',()=>{
  const p=api.initialValues(null,{level:'country',provinceCode:'',areaId:''});assert.equal(p.area||'', '');assert.equal(p.province||'', '');assert.equal(p.status,'pending');assert.equal(p.relation,'unverified');assert.equal(p.brand||'','');
 });
 await check('A new record uses the current province but does not invent its fine location',()=>{
  const p=api.initialValues(null,{level:'province',provinceCode:'45',areaId:''});assert.equal(p.province,'45');assert.equal(p.area||'','');assert.equal(p.lat??'','');assert.equal(p.lng??'','');
 });
 await check('A district context narrows geography without choosing an arbitrary fine location',()=>{
  const p=api.initialValues(null,{level:'district',provinceCode:'45',districtId:'a52c56b4-46e2-477f-bde9-99bb328394a1',areaId:''});assert.equal(p.province,'45');assert.equal(p.area||'','');
 });
 await check('A current fine-location context seeds its real reporting UUID and parent province',()=>{
  const p=api.initialValues(null,{level:'location',provinceCode:'45',districtId:'a52c56b4-46e2-477f-bde9-99bb328394a1',areaId:fineId});assert.equal(p.area,fineId);assert.equal(p.province,'45');assert.equal(p.lat??'','');assert.equal(p.lng??'','');
 });
 await check('Existing source fields override unrelated map/filter defaults without mutating the record',()=>{
  const existing={id:'test-source-record',name:'Original branch',area:fineId,province:'45',brand:'PTT',brandId:'ptt',relation:'competitor',status:'source',lat:point.lat,lng:point.lng,note:'Source evidence',revision:1,sourceRecord:true,adminScope:{province_code:'45'},photos:[{id:'test-photo'}]},before=JSON.stringify(existing);
  setContext({poiTab:'own',brandFilter:'Bangchak'});const p=api.initialValues(existing,{level:'location',provinceCode:'10',areaId:savedSelected});for(const key of ['id','name','area','province','brand','brandId','relation','status','lat','lng','note','revision','sourceRecord'])assert.equal(p[key],existing[key],key);assert.equal(JSON.stringify(existing),before);assert.deepEqual(plain(p.adminScope),existing.adminScope);
 });
 await check('A known source province is retained even when fine membership is unresolved',()=>{
  setContext({poiTab:'all',brandFilter:''});const p=api.initialValues({id:'unassigned-source',area:null,province:'45',brand:'PTT',brandId:'ptt',relation:'competitor',status:'source',lat:point.lat,lng:point.lng,sourceRecord:true},{level:'province',provinceCode:'10'});assert.equal(p.province,'45');assert.equal(p.area||'','');assert.equal(p.status,'source');
 });
 await check('An unknown source province does not inherit unrelated current map geography',()=>{
  const p=api.initialValues({id:'coordinate-only-source',area:null,province:null,brand:'PTT',brandId:'ptt',relation:'competitor',status:'source',lat:point.lat,lng:point.lng,sourceRecord:true},{level:'province',provinceCode:'10'});assert.equal(p.area||'','');assert.equal(p.province||'','');assert.equal(p.lat,point.lat);assert.equal(p.lng,point.lng);
 });
 await check('Explicit Our stores context seeds the canonical selected identity while remaining pending',()=>{
  setContext({poiTab:'own',brandFilter:''});const p=api.initialValues(null,{level:'country'});assert.equal(p.relation,'own');assert.equal(p.brand,'Bangchak');assert.equal(p.status,'pending');assert.equal(p.area||'','');
 });
 await check('Cold Fuel suggestions contain every known source brand despite an empty point cache',()=>{
  setContext({poiTab:'all',brandFilter:'',pois:[]});const expected=h.runtime.supplyCache.get('fuel').brands.map(b=>b.id).sort(),actual=api.brands().map(brandId).sort();assert.deepEqual(plain(actual),expected);assert(actual.includes('pt'));assert(actual.includes('susco'));assert.equal(run('Y.pois.length'),0);
 });
 await check('Canonical identity accepts actual aliases and registry display names without fuzzy invention',()=>{
  for(const name of ['PTT','PTT Station','ปตท.'])assert.equal(brandId(api.canonicalBrand(name)),'ptt',name);
  for(const name of ['Bangchak','BANGCHAK','บางจาก'])assert.equal(brandId(api.canonicalBrand(name)),'bangchak',name);
  assert.equal(api.canonicalBrand('A completely new unverified brand'),null);assert.equal(api.canonicalBrand('PTT imaginary franchise'),null);
 });
 await check('An existing identity remains usable when the source label is absent',()=>{assert.equal(brandId(api.canonicalBrand('', 'ptt')),'ptt');});
 await check('A recognized new identity is not overwritten by an unrelated previous brand ID',()=>{assert.equal(brandId(api.canonicalBrand('Shell','ptt')),'shell');});
 await check('Industry changes refresh cold suggestions and do not resolve an unrelated industry alias',async()=>{
  await h.select('grocery','grocery-brand:SEVEN_ELEVEN','C_STORE');setContext({pois:[],poiTab:'all',brandFilter:''});assert(api.brands().some(b=>brandId(b)==='grocery-brand:SEVEN_ELEVEN'));assert(api.brands().every(b=>!['ptt','bangchak'].includes(brandId(b))));assert.equal(api.canonicalBrand('PTT'),null);assert.equal(brandId(api.canonicalBrand('7-Eleven')),'grocery-brand:SEVEN_ELEVEN');
 });
 await check('Non-bank source identity resolves despite harmless whitespace differences',async()=>{
  await h.select('nonbank','legal:0107557000195','potential_retail_branch_service');setContext({pois:[],poiTab:'all',brandFilter:''});assert.equal(brandId(api.canonicalBrand('บริษัท เงินติดล้อ จำกัด (มหาชน)')),'legal:0107563000355');
 });
 await check('Context suggestions and classification never write records, criteria or aggregate supply',()=>{
  const before=signatures(),cacheBefore=digest([...h.runtime.supplyCache]);api.initialValues(null,{level:'province',provinceCode:'45'});api.brands();api.canonicalBrand('บริษัท เงินติดล้อ จำกัด (มหาชน)');api.coordinatePair(point.lat,point.lng);api.classifyPoint(square,{lat:2,lng:2});assert.deepEqual(signatures(),before);assert.equal(digest([...h.runtime.supplyCache]),cacheBefore);
 });
 await check('An automatic coordinate hint fills the actual candidate and records its spatial evidence',async()=>{
  const f=await formFixture({values:point});assert.equal(f.elements.province.value,'45');assert.equal(f.elements.area.value,fineId);assert.equal(f.api.assignment(f.form)?.method,'coordinate_display_polygon');assert.equal(f.api.assignment(f.form)?.legalBoundaryIndependentlyVerified,false);
 });
 await check('Changing coordinates invalidates an old automatic hint immediately, before debounce or response',async()=>{
  const f=await formFixture({values:point});f.dispatch('input','lat','0');assert.equal(f.elements.area.value,'');assert.equal(f.elements.province.value,'');assert.equal(f.api.assignment(f.form),null);await f.flush();assert.equal(f.elements.area.value,'');
 });
 await check('Typing coordinates also invalidates automatic map-context defaults before the first lookup',async()=>{
  const f=await formFixture({nav:{level:'location',provinceCode:'10',areaId:savedSelected}});assert.equal(f.elements.area.value,savedSelected);assert.equal(f.elements.province.value,'10');f.dispatch('input','lat',String(point.lat));assert.equal(f.elements.area.value,'');assert.equal(f.elements.province.value,'');assert.equal(f.api.assignment(f.form),null);
 });
 await check('Invalid coordinate typing clears automatic values and does not keep old assignment evidence',async()=>{
  const f=await formFixture({values:point});f.dispatch('input','lat','');await f.flush();assert.equal(f.elements.area.value,'');assert.equal(f.elements.province.value,'');assert.equal(f.api.assignment(f.form),null);
 });
 await check('Outside-coordinate resolution leaves automatic geography unresolved rather than keeping an old location',async()=>{
  const f=await formFixture({values:point});f.dispatch('input','lat','0');f.dispatch('input','lng','0');await f.flush();assert.equal(f.elements.area.value,'');assert.equal(f.elements.province.value,'');assert.equal(f.api.assignment(f.form),null);
 });
 await check('A failed geometry lookup cannot revive previous automatic location or assignment evidence',async()=>{
  const f=await formFixture({values:point});f.reject();f.dispatch('input','lat','15.6');await f.flush();assert.equal(f.elements.area.value,'');assert.equal(f.elements.province.value,'');assert.equal(f.api.assignment(f.form),null);assert(f.note.textContent.includes('โหลด')||f.note.textContent.includes('Boundaries'));
 });
 await check('Manual location choices survive invalid/outside coordinates and geometry failure',async()=>{
  const f=await formFixture({values:point});f.dispatch('change','area',fineId);f.dispatch('input','lat','');await f.flush();assert.equal(f.elements.area.value,fineId);assert.equal(f.elements.province.value,'45');assert.equal(f.api.assignment(f.form),null);
  f.reject();f.dispatch('input','lat','15.6');await f.flush();assert.equal(f.elements.area.value,fineId);assert.equal(f.elements.province.value,'45');
 });
 await check('A late lookup result cannot replace newer coordinates, manual area choice or another route',async()=>{
  const f=await formFixture(),release=f.hold();f.dispatch('input','lat',String(point.lat));f.dispatch('input','lng',String(point.lng));const pending=f.flush();await f.settle();f.dispatch('change','province','10');f.f.sandbox.location.hash='#supply';release(f.match);await pending;assert.equal(f.elements.province.value,'10');assert.equal(f.elements.area.value,'');assert.equal(f.api.assignment(f.form),null);
 });
 await check('Known branch typing follows canonical relation and explicit Our stores fills its canonical brand',async()=>{
  const f=await formFixture();f.dispatch('input','brand','PTT Station');assert.equal(f.elements.relation.value,'competitor');f.dispatch('change','brand','PTT Station');assert.equal(f.elements.brand.value,'PTT');f.dispatch('change','relation','own');assert.equal(f.elements.brand.value,'Bangchak');assert.equal(f.elements.status.value,'pending');
 });
 await check('Map coordinate resolution returns source candidates without moving the persistent camera or changing aggregates',async()=>{
  // Reuse the existing real-model Leaflet adapter, rather than introducing a second map approximation.
  const mapPrefix=fs.readFileSync(path.join(__dirname,'check-workspace-map.cjs'),'utf8').split('(async()=>{')[0];
  const mapHarness=Function('require','__dirname',mapPrefix+'\nreturn {h,api,run,maps,tick};')(require,__dirname);
  vm.runInContext(fs.readFileSync(modulePath,'utf8'),mapHarness.h.sandbox,{filename:'branch-context.js'});
  const mapApi=mapHarness.api;assert.equal(typeof mapApi.resolvePoint,'function');mapApi.mount();
  await mapHarness.tick();await mapHarness.tick();
  const camera=()=>JSON.stringify(mapHarness.maps.map(m=>({fits:m.fits,views:m.views,center:m.center,zoom:m.zoom})));
  const beforeCamera=camera(),before=mapHarness.run('JSON.stringify({criteria:Y.criteria,draft,pois:Y.pois,areas:AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply}))})');
  const result=await mapApi.resolvePoint(point);assert.equal(typeof result.state,'string');
  assert.equal(result.provinceCandidates.length,1);assert.equal(result.provinceCandidates[0].code,'45');assert.equal(result.provinceCandidates[0].classification,'inside');
  assert.equal(result.districtCandidates.length,1);assert.equal(result.districtCandidates[0].id,'a52c56b4-46e2-477f-bde9-99bb328394a1');assert.equal(result.districtCandidates[0].classification,'inside');
  assert.equal(result.areaCandidates.length,1);assert.equal(result.areaCandidates[0].id,fineId);assert.equal(result.areaCandidates[0].province,'45');assert.equal(result.areaCandidates[0].classification,'inside');
  assert(JSON.stringify(result.sourceFiles).includes('45.geojson'));assert(JSON.stringify(result.sourceFiles).includes('district-boundaries.geojson'));
  assert.equal(camera(),beforeCamera);assert.equal(mapHarness.run('JSON.stringify({criteria:Y.criteria,draft,pois:Y.pois,areas:AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply}))})'),before);
  const again=await mapApi.resolvePoint(point);assert.deepEqual(plain(again),plain(result));assert.equal(camera(),beforeCamera);
  const outside=await mapApi.resolvePoint({lat:0,lng:0});assert.equal(outside.provinceCandidates.length,0);assert.equal(outside.areaCandidates.length,0);assert.equal(camera(),beforeCamera);
  const coordinateOnly={id:'test-coordinate-only',area:null,province:null,...point};
  mapApi.navigate({level:'province',provinceCode:'45'},{fit:false,notify:false});assert(mapApi.poiMatchesNavigation(coordinateOnly));
  assert(!mapApi.poiMatchesNavigation({...coordinateOnly,province:'10'}),'Source province must not be overwritten by disagreeing display coordinates');
  mapApi.navigate({level:'province',provinceCode:'10'},{fit:false,notify:false});assert(mapApi.poiMatchesNavigation({...coordinateOnly,province:'10'}));assert(!mapApi.poiMatchesNavigation(coordinateOnly));
  const districtId='a52c56b4-46e2-477f-bde9-99bb328394a1',otherDistrict=read('data/real/district-boundaries.geojson').features.find(f=>f.properties.provinceCode==='45'&&f.properties.id!==districtId).properties.id;
  mapApi.navigate({level:'district',provinceCode:'45',districtId},{fit:false,notify:false});assert(mapApi.poiMatchesNavigation(coordinateOnly));assert(!mapApi.poiMatchesNavigation({...coordinateOnly,province:'45',adminScope:{district_id:otherDistrict}}),'Known source district must take priority over coordinate-only membership');
  assert(mapApi.poiMatchesNavigation({...coordinateOnly,area:fineId,province:'10',lat:0,lng:0}),'Assigned area UUID retains its actual parent geography');
  assert.equal(camera(),beforeCamera);assert.equal(mapHarness.run('JSON.stringify({criteria:Y.criteria,draft,pois:Y.pois,areas:AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply}))})'),before);
 });
 observations.limits=['Local source geometries support display candidates, not independently checked statutory assignment.','Same coordinates do not establish physical branch identity.','Pure/context checks do not substitute for native browser typing, dropdown, async race and mobile usability QA.'];
 console.log(JSON.stringify({checks,passed:checks.filter(c=>c.passed).length,total:checks.length,observations},null,2));
 if(checks.some(c=>!c.passed))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
