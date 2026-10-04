/* Native district adapters and personal analysis controls with actual source/model modules.
 * DOM/event/loader transport adapters are scoped evidence, not browser verification. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),site=path.join(root,'prototype'),read=name=>JSON.parse(fs.readFileSync(path.join(site,'data/real',name),'utf8'));
const prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const make=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname),h=make(),run=h.evaluate;
const native=Object.fromEntries(['fuel','grocery','nonbank'].map(i=>[i,read(i+'-district-supply.json')])),context=read('district-context.json'),provenance=read('district-source-provenance.json'),geometry=read('district-boundaries.geojson'),hierarchy=read('hierarchy-index.json');
const plain=v=>JSON.parse(JSON.stringify(v)),digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const checks=[],observations={contexts:[]};
h.sandbox.window.document=h.sandbox.document;h.sandbox.num=n=>Number(n).toLocaleString('en-US');
h.sandbox.window.YolkIcons={icon:name=>'<i data-icon="'+name+'"></i>',yolkIcon:()=>'<i data-icon="yolk"></i>'};
for(const file of ['relative-supply.js','map-analysis.js','analysis-ui.js'])vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),h.sandbox,{filename:file});
const app=fs.readFileSync(path.join(site,'app.js'),'utf8'),navStart=app.indexOf('function mapNavigation(){'),navEnd=app.indexOf('\nfunction market()',navStart);
assert(navStart>=0&&navEnd>navStart,'Actual app personal-navigation helper extraction failed');vm.runInContext(app.slice(navStart,navEnd),h.sandbox,{filename:'actual-app-map-filters.js'});
const UI=h.sandbox.window.YolkAnalysisUI,A=h.sandbox.window.YolkMapAnalysis;
async function check(name,test){const at=Date.now();try{await test();checks.push({name,passed:true,elapsedMs:Date.now()-at})}catch(error){checks.push({name,passed:false,error:String(error.stack||error),elapsedMs:Date.now()-at})}}
function actualRows(industry){return UI.districtRows(native[industry]);}
function addCounts(target,counts){for(const [id,n]of Object.entries(counts||{}))target[id]=(target[id]||0)+n;}
function sortedCounts(counts){return Object.fromEntries(Object.entries(counts).filter(([,n])=>n!==0).sort(([a],[b])=>a.localeCompare(b)));}
function companyMember(id,scope){
 if(scope==='office_context')return true;
 const licenses=h.runtime.companyScopes[id]?.licenses;if(!licenses)return null;
 const types={potential_retail_branch_service:['nano','ploan','ploan_car','pico','pico_plus'],vehicle_title:['ploan_car'],personal:['ploan'],nano:['nano'],pico:['pico'],pico_plus:['pico_plus']}[scope];
 if(licenses.filter(([type,status])=>types.includes(type)&&status==='active').length)return true;
 return licenses.filter(([type,status])=>types.includes(type)&&['unknown','not_found',null].includes(status)).length?null:false;
}
function expectedSourceSupply(industry,brand,scope,source){
 const ownKey=industry==='fuel'?brand.toUpperCase().replaceAll('-','_'):brand.split(':').slice(1).join(':');let own=0,competitor=0,u=0,uncertain=0;
 for(const [key,n]of Object.entries(source[2])){
  if(industry==='grocery'){const [format,id]=key.split(':');if(format!==scope||format==='PHARMACY')continue;if(id==='UNKNOWN')u+=n;else if(id===ownKey)own+=n;else competitor+=n;}
  else if(industry==='fuel'){if(key==='UNKNOWN')u+=n;else if(key===ownKey)own+=n;else competitor+=n;}
  else if(key===ownKey)own+=n;else {const member=companyMember(key,scope);if(member===true)competitor+=n;else if(member===null)uncertain+=n;}
 }
 const ownAvailable=industry!=='nonbank'||companyMember(ownKey,scope)===true;
 return {own:ownAvailable?own:null,competitor,unverified:u,competitorLower:competitor,competitorUpper:competitor+uncertain,ownAvailable};
}
function personalMetric(route,metric){h.sandbox.testRoute=route;run('Y.route=testRoute');const handler=h.documentListeners.get('change').at(-1);handler({target:{value:metric,matches:selector=>selector==='[data-analysis-metric]'}});}
function personalRelation(relation){run('Y.route="supply"');const handler=h.documentListeners.get('click').at(-1);handler({target:{closest:()=>({dataset:{analysisRelation:relation}})}});}

(async()=>{
 await check('All three native adapters have exactly the geometry/hierarchy 928 UUIDs and source periods, with verified provenance bytes',()=>{
  const geoIds=geometry.features.map(f=>f.properties.id).sort(),hierarchyIds=hierarchy.districts.map(d=>d.id).sort();assert.equal(geoIds.length,928);assert.equal(new Set(geoIds).size,928);assert.deepEqual(geoIds,hierarchyIds);
  assert.deepEqual(Object.keys(context.contextsById).sort(),geoIds);assert.equal(Object.keys(context.provinceContextsById).length,77);
  for(const [industry,data]of Object.entries(native)){
   assert.equal(data.industryId,industry);assert.equal(data.metadata.grain,'DISTRICT');assert.deepEqual(data.rows.map(r=>r[0]).sort(),geoIds);assert.deepEqual(Object.keys(data.contextsById).sort(),geoIds);assert.equal(data.metadata.coverage.present,928);assert.equal(data.metadata.coverage.missing,0);assert.deepEqual(data.faults,[]);
   assert.equal(data.metadata.populationPeriod,'2026-08');assert.equal(data.metadata.buildingVersion,'V4');assert.equal(data.metadata.countEffectiveDate,null);
   for(const r of data.rows){const ctx=data.contextsById[r[0]],feature=geometry.features.find(f=>f.properties.id===r[0]);assert.equal(ctx.provinceCode,feature.properties.provinceCode);assert(data.sourceCatalog[r[4]],'Native row provenance key must resolve');}
  }
  for(const [name,info]of Object.entries(provenance.fileIntegrity)){const bytes=fs.readFileSync(path.join(site,'data/real',name));assert.equal(bytes.length,info.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),info.sha256)}
 });
 await check('Native district brand/company dimensions reconcile to each province and country source totals, rather than fine crosswalk sums',()=>{
  for(const [industry,data]of Object.entries(native)){
   const country={},byProvince=new Map();
   for(const r of data.rows){assert.equal(r[1],'source_row_present');assert(Object.values(r[2]).every(n=>Number.isInteger(n)&&n>=0));assert.equal(Object.values(r[2]).reduce((s,n)=>s+n,0),r[3]);addCounts(country,r[2]);const pid=data.contextsById[r[0]].provinceId;if(!byProvince.has(pid))byProvince.set(pid,{});addCounts(byProvince.get(pid),r[2]);}
   assert.equal(byProvince.size,77);
   for(const p of data.provinceRows){assert.deepEqual(sortedCounts(byProvince.get(p[0])),sortedCounts(p[2]));assert.equal(Object.values(p[2]).reduce((s,n)=>s+n,0),p[3])}
   assert.deepEqual(sortedCounts(country),sortedCounts(data.countryDimensionCounts));const total=data.rows.reduce((s,r)=>s+r[3],0),provinceTotal=data.provinceRows.reduce((s,r)=>s+r[3],0);assert.equal(total,provinceTotal);assert.equal(total,data.countryTotal);assert.equal(total,provenance.provinceDistrictCountryReconciliation[industry].countryTotal);assert(provenance.provinceDistrictCountryReconciliation[industry].allDimensionTotalsMatch);
   observations[industry]={nativeDistricts:data.rows.length,nativeProvinces:data.provinceRows.length,countryTotal:total,dimensions:Object.keys(country).length};
  }
 });
 const selections=[['fuel','bangchak',null],['fuel','shell','all_fuel'],['grocery','grocery-brand:SEVEN_ELEVEN',null],['grocery','grocery-brand:LOTUSS',null],['grocery','grocery-brand:LOTUSS','SUPERMARKET'],['nonbank','legal:0107557000195',null],['nonbank','legal:0105559126747',null],['nonbank','legal:0107557000195','vehicle_title']];
 await check('Actual native district adapters honor all three industry defaults, alternate own identities and Grocery/Non-bank product scopes',async()=>{
  for(const [industry,brand,scope]of selections){
   await h.select(industry,brand,scope);assert.equal(run('Y.loadError'),null);const selectedScope=run('Y.supplyScope'),rows=actualRows(industry);assert.equal(rows.length,928);
   for(let i=0;i<rows.length;i++){const actual=rows[i].supply,expected=expectedSourceSupply(industry,brand,selectedScope,native[industry].rows[i]);for(const k of ['own','competitor','unverified'])assert.equal(actual[k],expected[k],industry+'/'+brand+'/'+selectedScope+' '+rows[i].id+' '+k);
    if(industry==='nonbank'){assert.equal(actual.competitorLower,expected.competitorLower);assert.equal(actual.competitorUpper,expected.competitorUpper);if(expected.ownAvailable){assert.equal(actual.ownLower,expected.own);assert.equal(actual.ownUpper,expected.own)}else assert(actual.ownScopeUnavailable)}
   }
   observations.contexts.push({industry,brand,scope:selectedScope,rows:rows.length,own:rows.reduce((s,r)=>s+(r.supply.own||0),0),competitor:rows.reduce((s,r)=>s+r.supply.competitor,0)});
  }
 });
 await check('Native Non-bank inventory retains all direct offices and never imports the 5,534 fine-area residual into a district',async()=>{
  await h.select('nonbank','legal:0107557000195','office_context');const data=native.nonbank,rows=actualRows('nonbank'),fineTotal=h.runtime.supplyCache.get('nonbank').rows.reduce((s,r)=>s+(r[3]||0),0),nativeTotal=data.rows.reduce((s,r)=>s+r[3],0);
  assert.equal(nativeTotal-fineTotal,5534);assert.equal(rows.reduce((s,r)=>s+r.supply.own+r.supply.competitor,0),nativeTotal);
  assert(rows.every(r=>r.supply.ownLower===r.supply.ownUpper&&r.supply.competitorLower===r.supply.competitorUpper));
  const before=digest(rows),original=h.runtime.assignmentBounds;h.runtime.assignmentBounds=Object.fromEntries(Object.keys(original).map(p=>[p,{'0107557000195':999999}]));try{assert.equal(digest(actualRows('nonbank')),before)}finally{h.runtime.assignmentBounds=original}
  observations.nonbank.fineAssignedTotal=fineTotal;observations.nonbank.nativeVsFineResidual=nativeTotal-fineTotal;
 });
 await check('Native Grocery counts do not receive fine Nakhon Ratchasima/Surat Thani ±1 bounds and exclude PHARMACY from selected format',async()=>{
  await h.select('grocery','grocery-brand:SEVEN_ELEVEN','C_STORE');const rows=actualRows('grocery'),affected=rows.filter(r=>['30','84'].includes(r.province));assert(affected.length>0);assert(affected.every(r=>!r.supply.reconciliationReview&&r.supply.ownLower===undefined&&r.supply.ownUpper===undefined));
  assert(run('AREAS.some(a=>a.province==="84"&&a.supply.reconciliationReview&&a.supply.ownUpper>a.supply.ownLower)'));
  for(let i=0;i<rows.length;i++){const allowed=Object.entries(native.grocery.rows[i][2]).filter(([key])=>key.startsWith('C_STORE:')).reduce((sum,[,n])=>sum+n,0);assert.equal(rows[i].supply.own+rows[i].supply.competitor+rows[i].supply.unverified,allowed)}
  const nativePharmacy=Object.entries(native.grocery.countryDimensionCounts).filter(([key])=>key.startsWith('PHARMACY:')).reduce((s,[,n])=>s+n,0);assert(nativePharmacy>0);observations.grocery.excludedPharmacy=nativePharmacy;
 });
 await check('Every native district uses its direct same-grain land area, population and modeled GFA denominators',async()=>{
  await h.select('fuel','bangchak','all_fuel');const rows=actualRows('fuel');
  for(const r of rows){const ctx=context.contextsById[r.id];assert.equal(r.areaKm2,ctx.areaKm2);assert.equal(r.areaKm2,ctx.areaSqm/1000000);for(const metric of ['population','gfa','adult_population_20_64','working_age_15_64'])assert.equal(r.metrics[metric],ctx.metrics[metric]);assert.equal(r.metricStates.population,ctx.metricStates.population)}
  const chosen=rows.find(r=>r.supply.own>0&&r.supply.unverified===0&&r.metrics.population>0&&r.metrics.gfa>0&&r.areaKm2>0);assert(chosen);
  for(const [metric,criteria,expected]of [['area',run('Y.criteria'),chosen.supply.own/chosen.areaKm2],['market',{...plain(run('Y.criteria')),supplyDenominatorId:'population'},chosen.supply.own/chosen.metrics.population*10000],['market',{...plain(run('Y.criteria')),supplyDenominatorId:'gfa'},chosen.supply.own/chosen.metrics.gfa*100000]])assert.equal(A.value(chosen,{kind:'supply',metric,relation:'own'},criteria).value,expected);
  const original=run('AREAS[0].metrics.gfa'),originalArea=run('AREAS[0].areaKm2');run('AREAS[0].metrics.gfa=1;AREAS[0].areaKm2=1');try{assert.deepEqual(plain(actualRows('fuel')),plain(rows))}finally{h.sandbox.originalGfa=original;h.sandbox.originalArea=originalArea;run('AREAS[0].metrics.gfa=originalGfa;AREAS[0].areaKm2=originalArea')}
 });
 await check('Personal Demand/Supply metric and relation handlers preserve full ordered fine results, criteria, drafts, events and storage for each industry',async()=>{
  for(const [industry,brand,scope]of [['fuel','bangchak','all_fuel'],['grocery','grocery-brand:SEVEN_ELEVEN','C_STORE'],['nonbank','legal:0107557000195','potential_retail_branch_service']]){
   await h.select(industry,brand,scope);const baseline=run('evaluate()'),resultHash=digest(baseline),criteriaHash=digest(run('Y.criteria')),draftHash=digest(run('draft')),eventsHash=digest(run('Y.events')),sourceHash=digest(h.runtime.supplyCache.get(industry)),writesHash=digest([...h.writes]);
   for(const metric of ['tier',run('enabledMetricIds(Y.criteria)[0]')]){personalMetric('demand',metric);const html=UI.demandPage();assert(html.includes('analysis-controls'));A.prepare(baseline,UI.state('demand'),run('Y.criteria'));}
   for(const metric of ['market','count','area'])for(const role of ['own','competitor','total']){personalMetric('supply',metric);personalRelation(role);const nativeRows=actualRows(industry),prepared=A.prepare(nativeRows,UI.state('supply'),run('Y.criteria'),{cohortId:'national_native_district_928',cohortRows:nativeRows});assert.equal(prepared.cohort.total,928);assert.equal(UI.state('supply').relation,role);assert.equal(run('Y.poiTab'),role==='total'?'all':role);}
   assert.equal(digest(run('evaluate()')),resultHash);assert.equal(run('evaluate()'),baseline);assert.equal(digest(run('Y.criteria')),criteriaHash);assert.equal(digest(run('draft')),draftHash);assert.equal(digest(run('Y.events')),eventsHash);assert.equal(digest(h.runtime.supplyCache.get(industry)),sourceHash);assert.equal(digest([...h.writes]),writesHash);
  }
 });
 await check('Personal Demand tier page includes qualifying Yolks excluded by preferred pattern and max-tier screening',async()=>{
  await h.select('fuel','bangchak','all_fuel');const previous=plain(run('Y.criteria'));run('Y.criteria={...Y.criteria,patterns:["Quiet"],maxDemandTier:1};Y.route="demand"');UI.set('metric','tier');
  try{const rows=run('evaluate()'),high=rows.filter(r=>r.demand===true),excluded=high.filter(r=>r.qualifyingTier>1&&!r.eligible);assert(high.length>0);assert(excluded.length>0);assert.equal(rows.filter(r=>r.eligible).length,0);
   const p=A.prepare(rows,UI.state('demand'),run('Y.criteria'));assert(excluded.every(r=>p.records.get(r.id).exact&&p.records.get(r.id).value===r.qualifyingTier));const html=UI.demandPage();for(const tier of [1,2,3])assert(html.includes('<strong>'+high.filter(r=>r.qualifyingTier===tier).length.toLocaleString('en-US')+'</strong>'));
   observations.demand={confirmed:high.length,excludedByPersonalScreening:excluded.length,eligible:0};
  }finally{h.sandbox.previousCriteria=previous;run('Y.criteria=previousCriteria')}
 });
 await check('Demand and Supply personal states remain separate; province filters do not recalibrate either national cohort',async()=>{
  await h.select('fuel','bangchak','all_fuel');personalMetric('demand','gfa');personalMetric('supply','area');personalRelation('competitor');assert.equal(UI.state('demand').metric,'gfa');assert.equal(UI.state('supply').metric,'area');assert.equal(UI.state('supply').relation,'competitor');
  const full=run('evaluate()'),fine=A.prepare(full,UI.state('demand'),run('Y.criteria')),nativeRows=actualRows('fuel'),district=A.prepare(nativeRows,UI.state('supply'),run('Y.criteria'),{cohortId:'national_native_district_928',cohortRows:nativeRows});run('Y.province="10"');assert.deepEqual(plain(A.prepare(full.filter(r=>r.province==='10'),UI.state('demand'),run('Y.criteria')).cutoffs),plain(fine.cutoffs));assert.deepEqual(plain(A.prepare(nativeRows.filter(r=>r.province==='10'),UI.state('supply'),run('Y.criteria'),{cohortId:'national_native_district_928',cohortRows:nativeRows}).cutoffs),plain(district.cutoffs));run('Y.province=""');
 });
 await check('Actual async bootstrap loads analytical modules after their dependencies and before map/app, one script at a time',async()=>{
  const scripts=[],requests=[],content={innerHTML:''};let pending=0,maxPending=0;
  const document={getElementById:id=>id==='content'?content:null,createElement:name=>{assert.equal(name,'script');return {}},body:{append(script){scripts.push(script.src.split('?')[0]);pending++;maxPending=Math.max(maxPending,pending);setImmediate(()=>{pending--;script.onload()})}}};
  const boot=vm.createContext({window:{},document,localStorage:{getItem:()=>null},fetch:async file=>{requests.push(file);const local=path.join(site,file);assert(fs.existsSync(local),'Bootstrap file must exist: '+file);return {ok:true,json:async()=>JSON.parse(fs.readFileSync(local,'utf8'))}},console,Map,Promise});
  await vm.runInContext(fs.readFileSync(path.join(site,'bootstrap.js'),'utf8'),boot,{filename:'actual-bootstrap.js'});
  for(const [before,after]of [['metrics.js','map-analysis.js'],['model.js','map-analysis.js'],['relative-supply.js','map-analysis.js'],['industry-workspace.js','analysis-ui.js'],['map-analysis.js','analysis-ui.js'],['analysis-ui.js','workspace-map.js'],['workspace-map.js','app.js']])assert(scripts.indexOf(before)>=0&&scripts.indexOf(before)<scripts.indexOf(after),before+' before '+after);
  assert.equal(maxPending,1);assert.equal(scripts.at(-1),'app.js');assert.equal(boot.window.YOLK_DEMO_DATA.areas.length,7954);assert(!content.innerHTML.includes('Data unavailable'));observations.bootstrap={moduleOrder:scripts,transportOnly:true};
 });
 const sourceFiles=['prototype/analysis-ui.js','prototype/industry-workspace.js','prototype/map-analysis.js','prototype/bootstrap.js','prototype/model.js','prototype/data/real/district-source-provenance.json','prototype/data/real/district-context.json',...Object.keys(native).map(i=>'prototype/data/real/'+i+'-district-supply.json')];
 const result={schemaVersion:1,test:'check-analysis-integration',testedAt:new Date().toISOString(),passed:checks.every(c=>c.passed),checks,observations,scope:'Actual native-D adapters, analysis controls, source snapshots, fixed-cohort helper, full ordered fine-row preservation and asynchronous bootstrap loader. DOM/events/script transport mocked; no browser rendering, provider availability or physical-device claim.',sourceHashes:Object.fromEntries(sourceFiles.map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]))};
 const output=path.resolve(root,'../deliverables/yolk-v1.7.2-review/analysis-integration-regression-results.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.error?'\n'+c.error:''));console.log(JSON.stringify({passed:result.passed,checks:checks.length,receipt:output}));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
