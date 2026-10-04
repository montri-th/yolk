/* Full native LDS LUT consumption; source/model tests do not substitute for browser QA. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'..'),prototype=path.join(repo,'prototype');
let fixture=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
fixture=fixture.replace("'model.js', 'brand-experience.js'", "'model.js', 'relative-supply.js', 'brand-experience.js'");
fixture=fixture.replace("if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands;", "if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands; if(file==='relative-supply.js')sandbox.YolkRelativeSupply=window.YolkRelativeSupply;");
const make=Function('require','__dirname',fixture+'\nreturn harness;')(require,__dirname),h=make(),run=h.evaluate;
h.sandbox.window.document=h.sandbox.document;
for(const file of ['yolk-tier-style.js','map-analysis.js','analysis-ui.js'])vm.runInContext(fs.readFileSync(path.join(prototype,file),'utf8'),h.sandbox,{filename:file});
const A=h.sandbox.window.YolkMapAnalysis,T=h.sandbox.window.YolkTierStyle,UI=h.sandbox.window.YolkAnalysisUI;
const plain=x=>JSON.parse(JSON.stringify(x)),read=name=>JSON.parse(fs.readFileSync(path.join(prototype,'data/real',name),'utf8'));
const source=JSON.parse(fs.readFileSync(path.join(repo,'reference/lds-0.9.7/color-srgb-10.scales.json'),'utf8'));
const hashes=files=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,file))).digest('hex')]));
const criteria={industry:'fuel',supplyDenominatorId:'gfa'},supplyState=(metric='count',relation='own')=>({kind:'supply',metric,relation});
const fixtureRow=(id,value,extra={})=>({id,areaKm2:1,metrics:{gfa:100000,population:10000},supply:{own:value,competitor:0,unverified:0,state:'reported_assigned_inventory'},...extra});
const checks=[];
async function check(name,test){const at=Date.now();try{await test();checks.push({name,passed:true,elapsedMs:Date.now()-at})}catch(e){checks.push({name,passed:false,error:String(e.stack||e),elapsedMs:Date.now()-at})}}
(async()=>{
 for(const scaleId of ['count','density.area','density.capita','built','price'])for(const theme of ['light','dark'])await check(scaleId+' '+theme+' exactly consumes all41native LUT entries',()=>{
  const native=source.scales.find(s=>s.scaleId===scaleId&&s.theme===theme);assert(native);assert.equal(native.lut.length,41);assert.deepEqual(plain(A.palettes[scaleId]),native.lut);assert.notEqual(A.palettes[scaleId].length,5);assert(Object.isFrozen(A.palettes[scaleId]));
 });
 await check('Native source hashes, base release and 41-sample traceability are explicit',()=>{
  assert.equal(A.scaleSource.lutSampleCount,41);assert.equal(A.scaleSource.colorSetId,'color-srgb-10');assert.equal(A.scaleSource.fillOpacity,1);
  assert.equal(A.scaleSource.lutSourceSha256,hashes(['reference/lds-0.9.7/color-srgb-10.scales.json'])['reference/lds-0.9.7/color-srgb-10.scales.json']);
  assert.equal(A.scaleSource.baseDocumentSha256,hashes(['reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md'])['reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md']);
  assert.equal(A.scaleSource.themePolicy,'identical-light-values-on-both-themes');
 });
 const national=Array.from({length:41},(_,i)=>fixtureRow('synthetic-native-'+i,i)),opts={cohortId:'labelled_synthetic_native_41',cohortRows:national};
 const prepared=A.prepare(national,supplyState(),criteria,opts);
 await check('40national quantile boundaries P(i*100/41) produce41indices with all native colours represented on distinct data',()=>{
  assert.equal(A.percentilePoints.length,40);assert.equal(prepared.cutoffs.length,40);assert.equal(prepared.palette.length,41);assert.equal(prepared.legend.length,41);
  for(let i=0;i<40;i++){assert(Math.abs(A.percentilePoints[i]-(i+1)*100/41)<1e-12);assert(Math.abs(prepared.cutoffs[i]-40*(i+1)/41)<1e-12);}
  for(let i=0;i<41;i++){const r=prepared.records.get(national[i].id);assert.equal(r.classIndex,i);assert.equal(r.color,A.palettes.count[i]);assert.equal(r.fillOpacity,1);}
  assert.equal(new Set([...prepared.records.values()].map(r=>r.classIndex)).size,41);assert.equal(prepared.metadata.classCount,41);assert.equal(prepared.metadata.quantileBoundaryCount,40);
 });
 await check('Legend communicates units, thresholds, end-bin and native LUT order without interpolation',()=>{
  for(let i=0;i<41;i++){const entry=prepared.legend[i];assert.equal(entry.color,A.palettes.count[i]);assert.equal(entry.classIndex,i);assert.equal(entry.unitEn,'branch records');assert(entry.labelTh&&entry.labelEn);assert.equal(entry.fillOpacity,1);assert.equal(entry.percentileLower,i===0?0:A.percentilePoints[i-1]);assert.equal(entry.percentileUpper,i===40?100:A.percentilePoints[i]);}
  assert.equal(prepared.legend[40].upper,null);assert.equal(prepared.legend[40].lower,prepared.cutoffs[39]);assert.equal(prepared.legend[40].upperInclusive,false);assert(prepared.metadata.outlierPolicy.includes('P97.560976'));assert.equal(prepared.legend[0].zeroCue,'observed_zero');
 });
 await check('Viewport subsets keep the same national41class boundaries, colours and values',()=>{
  const subset=A.prepare([national[7],national[29]],supplyState(),criteria,opts);assert.deepEqual(plain(subset.cutoffs),plain(prepared.cutoffs));assert.equal(subset.cohort.total,41);assert.equal(subset.cohort.viewportRecalibration,false);for(const r of subset.records.values())assert.equal(r.color,prepared.records.get(r.id).color);
 });
 await check('Interval, absent, suppressed and unknown role values remain uncoloured and outside comparable quantiles',()=>{
  const review=fixtureRow('review',10);review.supply.unverified=4;const missing=fixtureRow('missing',null);const scoped=[...national,review,missing];const m=A.prepare(scoped,supplyState(),criteria,{cohortId:'synthetic_43',cohortRows:scoped});assert.deepEqual(plain(m.cutoffs),plain(prepared.cutoffs));assert.equal(m.cohort.exact,41);assert.equal(m.cohort.review,1);assert.equal(m.cohort.missing,1);
  for(const id of ['review','missing']){assert.equal(m.records.get(id).color,null);assert.equal(m.records.get(id).classIndex,null);assert.equal(m.records.get(id).value,null);}
  const suppressed={...national[1],metricStates:{gfa:{state:'suppressed'}}},raw=A.prepare([suppressed],{kind:'demand',metric:'gfa'},criteria,{cohortId:'synthetic_suppressed',cohortRows:[suppressed]});assert.equal(raw.records.get(suppressed.id).color,null);assert.equal(raw.records.get(suppressed.id).evidenceState,'suppressed');
 });
 await check('Observed zero keeps class0 when repeated zero cutoffs would otherwise promote it',()=>{
  const rows=[...Array.from({length:80},(_,i)=>fixtureRow('zero-'+i,0)),fixtureRow('positive',1)],m=A.prepare(rows,supplyState(),criteria,{cohortId:'synthetic_zero_heavy',cohortRows:rows});assert(m.cutoffs.some(x=>x===0));for(const r of m.records.values())if(r.zero){assert.equal(r.classIndex,0);assert.equal(r.evidenceState,'observed_zero');assert.equal(r.color,A.palettes.count[0]);}
  assert.equal(m.legend[0].zeroOnly,true);assert.equal(m.legend[0].empty,false);assert.equal(m.legend[0].labelEn,'0 · includes known zero');assert(m.legend.slice(1).some(e=>e.empty));
 });
 await check('Allzero and tiedpositive datasets retain correct values, explicit zero cues and disclosed empty classes',()=>{
  const zeros=[fixtureRow('a',0),fixtureRow('b',0)],z=A.prepare(zeros,supplyState(),criteria,{cohortId:'synthetic_all_zero',cohortRows:zeros});assert.equal(z.cutoffs.length,40);assert(z.cutoffs.every(v=>v===0));assert([...z.records.values()].every(r=>r.classIndex===0&&r.zero));assert.equal(z.legend[40].labelEn,'> 0');
  const tied=[fixtureRow('x',5),fixtureRow('y',5)],m=A.prepare(tied,supplyState(),criteria,{cohortId:'synthetic_tied_positive',cohortRows:tied});assert(m.cutoffs.every(v=>v===5));assert([...m.records.values()].every(r=>r.classIndex===40&&r.percentile===50));assert.equal(m.legend.filter(e=>e.empty).length,39);
 });
 await check('Raw metric cutoff equality is lowerinclusive and upperexclusive in all40boundaries',()=>{
  const rawRows=national.map((r,i)=>({...r,metrics:{gfa:i}})),rawOpts={cohortId:'synthetic_raw_gfa',cohortRows:rawRows},m=A.prepare(rawRows,{kind:'demand',metric:'gfa'},criteria,rawOpts);
  for(let i=0;i<40;i++){const boundary={...fixtureRow('cut-'+i,0),metrics:{gfa:m.cutoffs[i]}},actual=A.prepare([boundary],{kind:'demand',metric:'gfa'},criteria,rawOpts).records.get(boundary.id);assert.equal(actual.classIndex,i+1);}
 });
 await check('Tier1/2/3 use three ownercategories with gradient paint, yellow, eggwhite and explicit labels',()=>{
  const rows=[1,2,3].map(t=>({...fixtureRow('tier-'+t,0),demand:true,qualifyingTier:t})),m=A.prepare(rows,{kind:'demand',metric:'tier'},criteria,{cohortId:'synthetic_tiers',cohortRows:rows});assert.equal(m.legend.length,3);assert.equal(m.metadata.scaleId,'yolk.owner-fried-egg-tiers.v1.7.3');assert.equal(m.metadata.classCount,3);assert.equal(m.metadata.quantileBoundaryCount,0);assert.deepEqual(plain(m.cutoffs),[]);assert.deepEqual(plain(m.percentilePoints),[]);
  for(const t of [1,2,3]){const r=m.records.get('tier-'+t);assert.equal(r.paint,T.paint(t));assert.equal(r.css,T.css(t));assert.equal(r.color,T.color(t));assert.equal(r.labelTh,T.definition(t).labelTh);assert.equal(r.labelEn,T.definition(t).labelEn);}
  assert(m.records.get('tier-1').paint.startsWith('url(#'));assert(m.legend.find(e=>e.tier===1).css.startsWith('linear-gradient('));assert.equal(m.legend.find(e=>e.tier===2).color,'#FFBC1F');assert.equal(m.legend.find(e=>e.tier===3).color,'#F1F4EF');
 });
 for(const [industry,brand]of [['fuel','bangchak'],['grocery','grocery-brand:SEVEN_ELEVEN'],['nonbank','legal:0107557000195']])await check(industry+' actualfine/nativeDistrict views use fixed same-grain41LUTs without altering source or thresholds',async()=>{
  await h.select(industry,brand);const c=run('Y.criteria'),fine=run('evaluate()'),before=run('JSON.stringify({rows:AREAS,criteria:Y.criteria,cutoff:METRICS.filter(m=>m.ready).map(m=>[m.id,cutoff(m.id,95)])})');
  for(const s of [supplyState('count','total'),supplyState('area','total'),supplyState('market','total'),{kind:'demand',metric:'population'},{kind:'demand',metric:'gfa'}]){const a=A.prepare(fine,s,c);assert.equal(a.legend.length,41);assert.equal(a.cutoffs.length,40);assert.equal(a.cohort.total,7954);for(const r of a.records.values())if(r.color!==null){assert(r.exact);assert(r.classIndex>=0&&r.classIndex<=40);assert.equal(r.color,A.palettes[r.scaleId][r.classIndex]);}}
  const native=UI.districtRows(read(industry+'-district-supply.json')),s=supplyState('count','total'),a=A.prepare(native,s,c,{cohortId:'national_native_928',cohortRows:native}),subset=A.prepare(native.slice(0,30),s,c,{cohortId:'national_native_928',cohortRows:native});assert.equal(a.cohort.total,928);assert.deepEqual(plain(a.cutoffs),plain(subset.cutoffs));assert.equal(a.legend.length,41);
  const after=run('JSON.stringify({rows:AREAS,criteria:Y.criteria,cutoff:METRICS.filter(m=>m.ready).map(m=>[m.id,cutoff(m.id,95)])})');assert.equal(after,before);
 });
 const report={schemaVersion:1,test:'check-map-lut41',checkedAt:new Date().toISOString(),passed:checks.every(x=>x.passed),checks,classification:{classes:41,boundaries:40,percentiles:'P(i*100/41),i1..40',cohort:'fixednational/samegrain/knownexactvaluesincludingzero',zero:'explicitclass0',interval:'nevercolourasexact',tierException:'ownerfriedeggcategories1..3'},sourceHashes:hashes(['prototype/map-analysis.js','prototype/yolk-tier-style.js','reference/lds-0.9.7/color-srgb-10.scales.json','reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md']),limit:'Model and byte checks only; native browser rendering, theme contrast and physical devices are separate evidence.'};
 const output=path.resolve(repo,'../deliverables/yolk-v1.7.3-review/map-lut41-regression-results.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.error?'\n'+c.error:''));console.log(JSON.stringify({passed:report.passed,checks:checks.length,receipt:output}));if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
