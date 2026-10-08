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
 await check('Identified own share excludes known/unknown U and distinguishes observed 0%, 100% and an undefined empty denominator',()=>{
  for(const u of [0,99,null]){const r=A.value(row('share',supply(2,6,u)),state('share','total'),c);assert.equal(r.value,25);assert.equal(r.relation,'own');assert.equal(r.denominatorValue,8);assert(r.exact&&r.identifiedOnly);assert.equal(r.scaleId,'li.market_share');assert(r.meaningEn.includes('not sales market share'));}
  const zero=A.value(row('zero-share',supply(0,3,6)),state('share'),c);assert.equal(zero.value,0);assert(zero.zero&&zero.exact);
  assert.equal(A.value(row('full-share',supply(7,0,6)),state('share'),c).value,100);
  const empty=A.value(row('empty-share',supply(0,0,6)),state('share'),c);assert.equal(empty.value,null);assert.equal(empty.reason,'zero_identified_denominator');assert.equal(empty.denominatorValue,0);assert(!empty.zero);
  for(const sourceState of ['missing','invalid','suppressed','withheld','not_applicable'])assert.equal(A.value(row('missing-share',supply(2,6,0,{state:sourceState})),state('share'),c).value,null);
 });
 await check('Share intervals retain source role bounds; assignment uncertainty is never painted as an exact ratio',()=>{
  const sp=supply(2,6,100,{ownLower:2,ownUpper:4,competitorLower:6,competitorUpper:10,boundsKnown:true}),r=A.value(row('range',sp),state('share'),c);
  assert.equal(r.state,'review');assert.equal(r.value,null);assert(Math.abs(r.lo-100*2/12)<1e-12);assert.equal(r.hi,40);assert(!r.exact);
  const open=A.value(row('open',supply(2,6,0,{boundsKnown:false})),state('share'),c);assert.equal(open.lo,0);assert.equal(open.hi,100);assert.equal(open.value,null);
  const unavailable=A.value(row('scope',supply(2,6,0,{ownScopeUnavailable:true})),state('share'),c);assert.equal(unavailable.evidenceState,'not_applicable');assert.equal(unavailable.value,null);
 });
 await check('Share choropleth consumes exact li.market_share41 LUT with an immutable 0–100% domain, independent of cohort and viewport',()=>{
  const values=[0,25,50,75,100].map((n,i)=>row('percent-'+i,supply(n,100-n,23))),prepared=A.prepare(values,state('share'),c,{cohortRows:values,cohortId:'synthetic_percent'});
  assert.equal(prepared.metadata.classificationMethod,'fixed_0_100_percent_41_equal_width_classes');assert.deepEqual(plain(prepared.metadata.domain),[0,100]);assert.equal(prepared.metadata.quantileBoundaryCount,0);assert.equal(prepared.metadata.quantileFormula,null);assert.equal(prepared.legend.length,41);assert.equal(prepared.legend[40].upper,100);assert(prepared.legend[40].upperInclusive);assert.equal(prepared.legend[0].zeroCue,'observed_zero');
  for(const [i,n]of [0,25,50,75,100].entries()){const r=prepared.records.get('percent-'+i);assert.equal(r.classIndex,Math.min(40,Math.floor(n*41/100)));assert.equal(r.color,A.palettes['li.market_share'][r.classIndex]);assert.equal(r.fillOpacity,1);assert.equal(r.percentile,null);const single=A.prepare([values[i]],state('share'),c).records.get(r.id);assert.equal(single.color,r.color);}
  const review=A.prepare([row('review',supply(2,6,0,{ownLower:2,ownUpper:3}))],state('share'),c).records.get('review');assert.equal(review.color,null);assert.equal(review.fillOpacity,null);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,prepared.metadata.lutSource))).digest('hex'),prepared.metadata.lutSourceSha256);
 });
 const sourceData=industry=>({nativeData:JSON.parse(fs.readFileSync(path.join(prototype,'data/real/'+industry+'-district-supply.json'),'utf8')),fineData:JSON.parse(fs.readFileSync(path.join(prototype,'data/real/'+industry+'-supply.json'),'utf8'))});
 await check('Brand composition reads one direct native country/province/district row; it never sums source LAO joins or point records',()=>{
  const data=sourceData('fuel'),options={...data,industryId:'fuel',ownBrandId:'bangchak',supplyScope:'all_fuel'};
  const country=A.brandBreakdown({level:'country'},options);assert.equal(country.sourceRows,1);assert.equal(country.grain,'COUNTRY');assert.equal(country.sourceTotal,8736);assert.equal(country.identifiedTotal,5606);assert.equal(country.unknown,3130);assert.equal(country.state,'known');assert(country.coverage.complete);assert(!country.coverage.allProvidersComplete);assert.equal(country.own,data.nativeData.countryDimensionCounts.BANGCHAK);assert.equal(country.sharePercent,100*country.own/5606);
  const first=data.nativeData.provinceRows[0],ctx=data.nativeData.provinceContextsById[first[0]],province=A.brandBreakdown({level:'province',provinceCode:ctx.provinceCode},options);assert.equal(province.sourceRowId,first[0]);assert.equal(province.sourceRows,1);assert.equal(province.identifiedTotal,first[3]-(first[2].UNKNOWN||0));assert.equal(province.own,first[2].BANGCHAK||0);
  const raw=data.nativeData.rows[0],district=A.brandBreakdown({level:'district',districtId:raw[0]},options);assert.equal(district.sourceRowId,raw[0]);assert.equal(district.identifiedTotal,raw[3]-(raw[2].UNKNOWN||0));assert.equal(district.sourceRows,1);
  const contaminated={...options,fineData:{...data.fineData,rows:[[first[0],'source_row_present',{BANGCHAK:99999},99999]],},points:Array(1000).fill({brand:'bangchak'})};assert.equal(A.brandBreakdown({level:'province',provinceCode:ctx.provinceCode},contaminated).identifiedTotal,province.identifiedTotal);
 });
 await check('Grocery brand composition is filtered by exact format; PHARMACY and other formats never enter the denominator',()=>{
  const data=sourceData('grocery'),options={...data,industryId:'grocery',ownBrandId:'grocery-brand:TOPS',supplyScope:'SUPERMARKET'},summary=A.brandBreakdown({level:'country'},options),counts=data.nativeData.countryDimensionCounts;
  const selected=Object.entries(counts).filter(([id])=>id.startsWith('SUPERMARKET:')).reduce((sum,[id,n])=>sum+n,0);assert.equal(summary.identifiedTotal,selected);assert.equal(summary.own,counts['SUPERMARKET:TOPS']);assert(summary.rows.every(r=>r.brandId.startsWith('grocery-brand:')));assert(!summary.rows.some(r=>r.brandId==='grocery-brand:PURE'));assert(summary.excluded>0);assert.equal(summary.state,'known');assert.equal(summary.rows.reduce((n,r)=>n+r.count,0),selected);
  const alternative=A.brandBreakdown({level:'country'},{...options,supplyScope:'C_STORE'});assert.notEqual(alternative.identifiedTotal,selected);assert.equal(alternative.own,counts['C_STORE:TOPS']);
 });
 await check('Non-bank direct scopes retain all1233 source legal IDs, not just selectable top10; unknown license membership creates review bounds',()=>{
  const data=sourceData('nonbank'),options={...data,industryId:'nonbank',ownBrandId:'legal:0107557000195',supplyScope:'office_context'},country=A.brandBreakdown({level:'country'},options);assert.equal(country.identifiedTotal,23524);assert(country.rows.length>1000);assert.equal(country.rows.reduce((n,r)=>n+r.count,0),23524);assert.equal(country.state,'known');
  const mixed=A.brandBreakdown({level:'country'},{...options,supplyScope:'personal',scopeIncludes:id=>id==='0107557000195'?true:null,ownScopeAvailable:true});assert.equal(mixed.state,'review');assert.equal(mixed.sharePercent,null);assert.equal(mixed.rows.length,1);assert(mixed.unclassified>0);assert(mixed.shareUpper>mixed.shareLower);assert(!mixed.coverage.complete);const ownUnresolved=A.brandBreakdown({level:'country'},{...options,supplyScope:'personal',scopeIncludes:()=>null,ownScopeAvailable:true});assert.equal(ownUnresolved.state,'not_applicable');assert.equal(ownUnresolved.sharePercent,null);assert(!ownUnresolved.coverage.complete);
 });
 await check('Fine brand breakdown uses one reporting UUID and keeps real reconciliation/assignment uncertainty without duplicating province residuals',async()=>{
  for(const [industry,brand,format]of [['grocery','grocery-brand:SEVEN_ELEVEN','C_STORE'],['nonbank','legal:0107557000195','potential_retail_branch_service']]){
   await h.select(industry,brand,format);const data=sourceData(industry),area=run('AREAS.find(a=>a.supply.ownUpper>a.supply.ownLower)'),options={...data,industryId:industry,ownBrandId:brand,supplyScope:format,fineRows:run('AREA_INDEX'),scopeIncludes:id=>{h.sandbox.testBrandId=id;return run('selectedScopeIncludes(testBrandId)')},ownScopeAvailable:true};
   const result=A.brandBreakdown({level:'location',areaId:area.id,provinceCode:area.province},options);assert.equal(result.sourceRows,1);assert.equal(result.grain,'SOURCE_REPORTING_UUID');assert.equal(result.state,'review');assert.equal(result.sharePercent,null);assert(result.coverage.assignmentOrReconciliationReview);assert.equal(result.supply.ownUpper,area.supply.ownUpper);assert.equal(result.supply.competitorUpper,area.supply.competitorUpper);
  }
 });
 await check('Missing, suppressed, invalid or absent source brand rows never fabricate zero or percentages; an exact empty row has an undefined share',()=>{
  const metadata={grain:'DISTRICT',coverage:{missing:0}},nativeData={metadata,contextsById:{d:{provinceCode:'10'}},rows:[['d','source_row_present',{},0]],countryDimensionCounts:{},countryTotal:0},options={nativeData,industryId:'fuel',ownBrandId:'bangchak',supplyScope:'all_fuel'};
  const empty=A.brandBreakdown({level:'district',districtId:'d'},options);assert.equal(empty.state,'known');assert.equal(empty.status,'empty');assert.equal(empty.identifiedTotal,0);assert.equal(empty.sharePercent,null);
  assert.equal(A.brandBreakdown({level:'district',districtId:'absent'},options).identifiedTotal,null);
  for(const raw of [['d','suppressed',null,null],['d','source_row_present',{PTT:-1},-1],['d','source_row_present',null,null]]){const result=A.brandBreakdown({level:'district',districtId:'d'},{...options,nativeData:{...nativeData,rows:[raw]}});assert.equal(result.sharePercent,null);assert.equal(result.identifiedTotal,null);assert(!result.coverage.complete);if(raw[1]==='suppressed')assert.equal(result.state,'suppressed');}
 });
 const result={schemaVersion:1,version:'1.9.6',test:'check-supply-market-share',testedAt:new Date().toISOString(),passed:checks.every(c=>c.passed),checks,scope:'Production model with actual native country/province/district and source reporting-UUID inventories; labelled synthetic ratio/coverage cases. No point-count, sales-share or physical-device validation claim.',sourceHashes:Object.fromEntries(['prototype/map-analysis.js','prototype/workspace-map.js','prototype/map-hover.js','reference/lds-0.9.7/location-intelligence-0.9.7.json'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]))};
 const output=path.resolve(root,'../deliverables/yolk-v1.9.6/supply-market-share-regression-results.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');for(const t of checks)console.log((t.passed?'PASS ':'FAIL ')+t.name+(t.error?'\n'+t.error:''));console.log(JSON.stringify({passed:result.passed,checks:checks.length,receipt:output}));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
