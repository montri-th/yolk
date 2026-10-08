/* Pure analytical map contract: execute the production helper with real model and source modules. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prototype=path.join(root,'prototype');
const prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const make=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname),h=make(),run=h.evaluate;
for(const name of ['relative-supply.js','yolk-tier-style.js','map-analysis.js'])vm.runInContext(fs.readFileSync(path.join(prototype,name),'utf8'),h.sandbox,{filename:name});
const A=h.sandbox.window.YolkMapAnalysis,plain=v=>JSON.parse(JSON.stringify(v)),checks=[];
const supply=(own,competitor,unverified=0,extra={})=>({own,competitor,unverified,state:'reported_assigned_inventory',...extra});
const row=(id,sp,metrics={population:10000,gfa:100000},areaKm2=2)=>({id,metrics,areaKm2,supply:sp});
const state=(metric='count',relation='own')=>({kind:'supply',metric,relation});
const c={industry:'fuel',supplyDenominatorId:'gfa',maxDemandTier:1,patterns:[]};
async function check(name,test){const start=Date.now();try{await test();checks.push({name,passed:true,elapsedMs:Date.now()-start})}catch(error){checks.push({name,passed:false,error:String(error.stack||error),elapsedMs:Date.now()-start})}}
(async()=>{
 await check('Every quantitative palette exactly matches all41native LDS LUT values on light and dark; tiers use the owner category helper',()=>{
  const story=JSON.parse(fs.readFileSync(path.join(root,'reference/lds-0.9.7/color-srgb-10.scales.json'),'utf8'));
  const location=JSON.parse(fs.readFileSync(path.join(root,'reference/lds-0.9.7/location-intelligence-0.9.7.json'),'utf8'));
  for(const [id,palette]of Object.entries(A.palettes))for(const theme of ['light','dark']){
   assert.equal(palette.length,41);assert.deepEqual(plain(palette),(id==='li.market_share'?location:story).scales.find(s=>s.scaleId===id&&s.theme===theme).lut);
  }
  assert.equal(A.scaleSource.fillOpacity,1);assert.equal(A.scaleSource.themePolicy,'identical-light-values-on-both-themes');
  for(const [file,expected]of [['Landometer-Design-System-v0.9.7.md',A.scaleSource.baseDocumentSha256],['Location-Intelligence-Profile-for-LDS-v0.9.7.md',A.scaleSource.profileSha256]])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'reference/lds-0.9.7',file))).digest('hex'),expected);
 });
 await check('Exact zero is known and distinct from absent or invalid source supply',()=>{
  const zero=A.value(row('zero',supply(0,0)),state(),c);assert.equal(zero.state,'known');assert.equal(zero.value,0);assert(zero.zero&&zero.exact);assert.equal(zero.evidenceState,'observed_zero');
  for(const sp of [undefined,supply(null,0),supply(-1,0),supply(1.5,0),supply(2,0,0,{state:'missing'})]){const r=A.value(row('missing',sp),state(),c);assert.equal(r.state,'missing');assert.equal(r.value,null);assert(!r.zero)}
 });
 await check('Unidentified U widens each per-role interval without inventing a midpoint',()=>{
  const source=row('u',supply(2,5,3));
  for(const [relation,lo,hi]of [['own',2,5],['competitor',5,8]]){const r=A.value(source,state('count',relation),c);assert.equal(r.lo,lo);assert.equal(r.hi,hi);assert.equal(r.state,'review');assert.equal(r.value,null);assert(!r.exact)}
 });
 await check('Unknown U and missing assignment bounds preserve open uncertainty rather than exact role counts',()=>{
  for(const sp of [supply(2,5,null),supply(2,5,0,{unverified:undefined}),supply(2,5,0,{ownLower:2,ownUpper:2,boundsKnown:false})]){
   if(sp.unverified===undefined)delete sp.unverified;
   const r=A.value(row('open',sp),state(),c);assert.equal(r.lo,2);assert.equal(r.hi,null);assert(r.upperOpen);assert.equal(r.state,'review');assert.equal(r.value,null);
  }
 });
 await check('Identified total sums O+C only and explicitly excludes known or unknown U',()=>{
  for(const u of [0,3,null]){const r=A.value(row('total',supply(2,5,u)),state('count','total'),c);assert.equal(r.value,7);assert.equal(r.state,'known');assert.equal(r.unverified,u);assert(r.identifiedOnly);assert(r.meaningEn.includes('excluding unidentified U'))}
 });
 await check('Existing source assignment/reconciliation bounds survive role and total views',()=>{
  const r=row('bounds',supply(2,5,0,{ownLower:2,ownUpper:4,competitorLower:5,competitorUpper:9,unknownLicense:2,boundsKnown:true}));
  for(const [relation,lo,hi]of [['own',2,4],['competitor',5,9],['total',7,13]]){const v=A.value(r,state('count',relation),c);assert.equal(v.lo,lo);assert.equal(v.hi,hi);assert.equal(v.value,null);assert.equal(v.state,'review')}
  const incomplete=A.value(row('partial',supply(2,5,0,{ownLower:2})),state(),c);assert.equal(incomplete.state,'missing');
  const unavailable=row('unavailable',supply(null,5,0,{ownScopeUnavailable:true}));assert.equal(A.value(unavailable,state(),c).reason,'own_scope_unavailable');assert.equal(A.value(unavailable,state('count','total'),c).state,'missing');assert.equal(A.value(unavailable,state('count','competitor'),c).value,5);
 });
 await check('Area density requires positive finite km² and uses the native area-density scale',()=>{
  const exact=A.value(row('area',supply(2,5)),state('area'),c);assert.equal(exact.value,1);assert.equal(exact.denominatorValue,2);assert.equal(exact.scaleId,'density.area');assert.equal(exact.unitEn,'branch records/km²');
  for(const area of [0,-1,null,NaN,Infinity]){const r=A.value(row('bad-area',supply(2,5),{},area),state('area'),c);assert.equal(r.state,'missing');assert.equal(r.value,null);assert(!r.zero)}
 });
 await check('Market rates use the actual relative-supply normalization and explicit dimensional denominator',()=>{
  const r=row('market',supply(3,6),{population:20000,gfa:50000,factory_workers:25000,hotel_rooms:2000});
  const pop=A.value(r,state('market'),{...c,supplyDenominatorId:'population'});assert.equal(pop.value,(3/20000)*10000);assert.equal(pop.normalization,10000);assert.equal(pop.scaleId,'density.capita');assert(pop.unitEn.includes('10,000 persons'));
  const gfa=A.value(r,state('market'),c);assert.equal(gfa.value,6);assert.equal(gfa.normalization,100000);assert.equal(gfa.scaleId,'built');assert.equal(gfa.scaleReuse,true);assert(gfa.unitEn.includes('100,000 m²'));
  const workers=A.value(r,state('market'),{...c,supplyDenominatorId:'factory_workers'});assert.equal(workers.value,(3/25000)*10000);assert.equal(workers.scaleId,'density.capita');
  const rooms=A.value(r,state('market'),{...c,supplyDenominatorId:'hotel_rooms'});assert.equal(rooms.value,(3/2000)*1000);assert(rooms.scaleReuse);assert(rooms.unitEn.includes('1,000 rooms'));
  assert.equal(A.value(r,state('market'),{...c,supplyDenominatorId:'gfa_per_person'}).state,'missing');
  for(const d of [null,0,-1])assert.equal(A.value(row('bad-market',supply(3,6),{gfa:d}),state('market'),c).state,'missing');
 });
 await check('Confirmed Demand tier ignores preferred patterns, eligibility and maximum allowed tier',()=>{
  const source={...row('tier',supply(0,0)),demand:true,qualifyingTier:3,eligible:false,tierEligible:false,pattern:'Crowded'};
  const r=A.value(source,{kind:'demand',metric:'tier'},c);assert.equal(r.value,3);assert.equal(r.state,'known');
  for(const patch of [{demand:null},{demand:true,qualifyingTier:null}]){const r=A.value({...source,...patch},{kind:'demand',metric:'tier'},c);assert.equal(r.state,'review');assert.equal(r.value,null)}
  const low=A.value({...source,demand:false,qualifyingTier:null},{kind:'demand',metric:'tier'},c);assert.equal(low.evidenceState,'not_qualified');assert.equal(low.value,null);
 });
 await check('Raw Demand reads the source metric and national percentile, ignoring stored same-grain or viewport percentiles',()=>{
  const source=plain(run('AREAS[0]'));source.percentiles={population:100};
  const r=A.value(source,{kind:'demand',metric:'population'},{...c,cohortMode:'same_grain'});
  h.sandbox.observedValue=r.value;assert.equal(r.value,source.metrics.population);assert.equal(r.percentile,run('rankValue(observedValue,DISTRIBUTIONS.population)'));assert.notEqual(r.percentile,100);
  for(const [metric,scale]of [['gfa','built'],['gfa_per_km2','density.area'],['gfa_per_person','density.capita'],['fiscal_total_thb','price']])assert.equal(A.metadata({kind:'demand',metric},c).scaleId,scale);
  const suppressed={...source,metricStates:{population:{state:'suppressed'}}};assert.equal(A.value(suppressed,{kind:'demand',metric:'population'},c).evidenceState,'suppressed');assert.equal(A.value(suppressed,{kind:'demand',metric:'population'},c).value,null);
 });
 await check('Fixed national quantiles include exact zero, exclude uncertain rows, and have deterministic cutoff ties',()=>{
  const national=[0,10,20,30,40].map((n,i)=>row('district-'+i,supply(n,0)));
  national.push(row('district-review',supply(15,0,0,{ownLower:15,ownUpper:25})),row('district-missing',supply(null,0)));
  const opts={cohortId:'synthetic_national_district_7',cohortRows:national},prepared=A.prepare(national,state(),c,opts);
  assert.equal(prepared.cutoffs.length,40);for(let i=0;i<40;i++)assert(Math.abs(prepared.cutoffs[i]-40*(i+1)/41)<1e-12);assert.equal(prepared.legend.length,41);assert.equal(prepared.cohort.total,7);assert.equal(prepared.cohort.exact,5);assert.equal(prepared.cohort.review,1);assert.equal(prepared.cohort.missing,1);
  for(let i=0;i<4;i++)assert.equal(prepared.records.get('district-'+i).classIndex,i===0?0:Math.floor(i*41/4));
  assert.equal(prepared.records.get('district-4').classIndex,40);assert.equal(prepared.records.get('district-review').color,null);assert.equal(prepared.records.get('district-review').value,null);assert.equal(prepared.records.get('district-missing').color,null);
  const subset=A.prepare([national[3]],state(),c,opts);assert.deepEqual(plain(subset.cutoffs),plain(prepared.cutoffs));assert.equal(subset.records.get('district-3').classIndex,30);assert.equal(subset.cohort.viewportRecalibration,false);
  const tied=[row('a',supply(5,0)),row('b',supply(5,0))],ties=A.prepare(tied,state(),c,{cohortId:'synthetic_ties',cohortRows:tied});assert.deepEqual(plain(ties.cutoffs),Array(40).fill(5));assert.equal(ties.records.get('a').classIndex,40);assert.equal(ties.records.get('b').classIndex,40);assert.equal(ties.records.get('a').percentile,50);
 });
 await check('Native rows without an explicit national cohort stay unclassified; no fine-area aggregation fallback exists',()=>{
  const native=row('unregistered-native-district',supply(10,5)),prepared=A.prepare([native],state(),c);assert.equal(prepared.records.get(native.id).value,10);assert.equal(prepared.records.get(native.id).color,null);assert.equal(prepared.records.get(native.id).classificationState,'missing_national_cohort');assert.equal(prepared.cohort.state,'missing');
  const noSource=A.prepare([row(native.id,{own:null,competitor:null,unverified:null,state:'missing'})],state(),c,{cohortId:'synthetic_native_missing',cohortRows:[native]});assert.equal(noSource.records.get(native.id).value,null);assert.equal(noSource.records.get(native.id).color,null);
 });
 await check('Fine-area view subsets retain the fixed 7,954-row national cohort and do not mutate source rows or criteria',async()=>{
  await h.select('fuel','bangchak','all_fuel');const national=run('AREAS'),before=crypto.createHash('sha256').update(JSON.stringify(national)).digest('hex'),criteria=plain(run('Y.criteria')),criteriaBefore=JSON.stringify(criteria);
  const all=A.prepare(national,state('area','competitor'),criteria),subset=A.prepare(national.slice(0,5),state('area','competitor'),criteria);
  assert.equal(subset.cohort.total,7954);assert.deepEqual(plain(subset.cutoffs),plain(all.cutoffs));
  for(const source of national.slice(0,5))assert.equal(subset.records.get(source.id).color,all.records.get(source.id).color);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(national)).digest('hex'),before);assert.equal(JSON.stringify(criteria),criteriaBefore);
 });
 await check('Real Grocery and Non-bank reconciliation/assignment rows remain ranges rather than invented exact values',async()=>{
  await h.select('grocery','grocery-brand:SEVEN_ELEVEN','C_STORE');const grocery=run('AREAS.find(a=>a.supply.ownLower!==undefined&&a.supply.ownUpper>a.supply.ownLower)');assert(grocery);const g=A.value(grocery,state(),c);assert.equal(g.state,'review');assert.equal(g.value,null);assert(g.hi>g.lo);
  await h.select('nonbank','legal:0107557000195','potential_retail_branch_service');const nb=run('AREAS.find(a=>a.supply.ownUpper>a.supply.ownLower)');assert(nb);const n=A.value(nb,state(),c);assert.equal(n.state,'review');assert.equal(n.value,null);assert(n.hi>n.lo);
 });
 const result={schemaVersion:1,test:'check-map-analysis',testedAt:new Date().toISOString(),passed:checks.every(c=>c.passed),checks,scope:'Production pure helper with actual source/model/relative-supply modules plus labelled synthetic boundary/interval fixtures. No browser rendering or physical-device accessibility claim.',sourceHashes:Object.fromEntries(['prototype/map-analysis.js','prototype/yolk-tier-style.js','prototype/relative-supply.js','reference/lds-0.9.7/color-srgb-10.scales.json','reference/lds-0.9.7/location-intelligence-0.9.7.json'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]))};
 const output=path.resolve(root,'../deliverables/yolk-v1.9.0/map-analysis-regression-results.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 for(const t of checks)console.log((t.passed?'PASS ':'FAIL ')+t.name+(t.error?'\n'+t.error:''));console.log(JSON.stringify({passed:result.passed,checks:checks.length,receipt:output}));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
