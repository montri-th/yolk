/* Preferred-card counts use the real national model; DOM adapter is not browser QA. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
let fixture=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
fixture=fixture.replace("'model.js', 'brand-experience.js'", "'model.js', 'relative-supply.js', 'brand-experience.js'");
fixture=fixture.replace("if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands;", "if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands; if(file==='relative-supply.js')sandbox.YolkRelativeSupply=window.YolkRelativeSupply;");
const make=Function('require','__dirname',fixture+'\nreturn harness;')(require,__dirname),h=make(),run=h.evaluate;
const app=fs.readFileSync(path.join(repo,'prototype/app.js'),'utf8');
const numDeclaration=app.split('\n').find(line=>line.startsWith('const num='));
assert(numDeclaration,'actual number-format helper not found');
vm.runInContext(numDeclaration,h.sandbox);
vm.runInContext(fs.readFileSync(path.join(repo,'prototype/decision-ui.js'),'utf8'),h.sandbox,{filename:'decision-ui.js'});
h.sandbox.YolkDecisions=h.sandbox.window.YolkDecisions;
const api=h.sandbox.YolkDecisions,plain=value=>JSON.parse(JSON.stringify(value));
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS',name);}
const totals=counts=>Object.values(counts).reduce((n,c)=>n+c.confirmed,0);
const criteria=()=>plain(run('draft'));
(async()=>{
 await h.select('fuel','bangchak');run('draft=structuredClone(Y.criteria)');
 const original=criteria();
 await check('each card matches a single-pattern model evaluation over the same national cohort',()=>{
  const counts=plain(api.patternCounts());assert(counts.valid);assert.equal(counts.total,7954);
  for(const name of run('patternNames')){h.sandbox.cardName=name;const expected=plain(run('(()=>{const rows=evaluate({...draft,patterns:[cardName]});return {confirmed:rows.filter(a=>a.eligible).length,review:rows.filter(a=>a.reviewCandidate).length}})()'));assert.deepEqual(counts.counts[name],expected,name);}
 });
 await check('unchecked cards retain their counts, including when no pattern is currently checked',()=>{
  const baseline=plain(api.patternCounts()).counts;run('draft.patterns=[]');assert(criteria().patterns.length===0);assert.deepEqual(plain(api.patternCounts()).counts,baseline);run('draft.patterns=["Quiet"]');assert.deepEqual(plain(api.patternCounts()).counts,baseline);h.sandbox.originalCriteria=original;run('draft=structuredClone(originalCriteria)');
 });
 await check('Demand high excludes all four low-demand patterns; all-demand mode includes them',()=>{
  const high=plain(api.patternCounts());for(const n of ['Quiet','Their War','Our Island','Winter War'])assert.deepEqual(high.counts[n],{confirmed:0,review:0});run('draft.demandMode="all"');const all=plain(api.patternCounts());assert(totals(all.counts)>totals(high.counts));assert(Object.values(all.counts).some(c=>c.confirmed>0));run('draft.demandMode="high"');
 });
 await check('Tier gate is respected for all-demand and high-demand modes without changing low-demand membership',()=>{
  for(const mode of ['high','all']){h.sandbox.tierMode=mode;run('draft.demandMode=tierMode;draft.maxDemandTier=3');const relaxed=plain(api.patternCounts());run('draft.maxDemandTier=1');const strict=plain(api.patternCounts());assert(totals(strict.counts)<=totals(relaxed.counts));for(const n of ['Quiet','Their War','Our Island','Winter War'])assert.deepEqual(strict.counts[n],relaxed.counts[n]);}
  run('draft=structuredClone(originalCriteria)');
 });
 await check('Supply changes refresh counts from the model instead of keeping a previous snapshot',()=>{
  const before=plain(api.patternCounts());run('draft.supplyMode="count";draft.ownMany=100;draft.competitorMany=100');const after=plain(api.patternCounts());assert.notDeepEqual(after.counts,before.counts);assert.equal(after.total,before.total);run('draft=structuredClone(originalCriteria)');
 });
 await check('all eight counts use one cached model read, not a separate evaluation for each card',()=>{
  const evaluateOriginal=run('evaluate');let calls=0;h.sandbox.evaluate=c=>{calls++;return evaluateOriginal(c);};api.patternCounts();assert.equal(calls,1);h.sandbox.evaluate=evaluateOriginal;
 });
 await check('unknown Demand is omitted while multi-pattern Supply uncertainty is retained on each possible card',()=>{
  const rows=plain(run('evaluate(draft)'));for(const row of rows){row.demand=false;row.tierEligible=false;row.possiblePatterns=['Quiet'];}
  rows[0]={...rows[0],demand:true,tierEligible:true,possiblePatterns:['Pioneer','FOMO']};
  rows[1]={...rows[1],demand:true,tierEligible:true,possiblePatterns:['Our Farm']};
  rows[2]={...rows[2],demand:null,tierEligible:false,possiblePatterns:[]};
  const result=plain(api.patternCounts(criteria(),rows));assert.equal(result.counts.Pioneer.confirmed,0);assert.equal(result.counts.Pioneer.review,1);assert.equal(result.counts.FOMO.review,1);assert.equal(result.counts['Our Farm'].confirmed,1);assert.equal(result.unknownDemand,1);assert.equal(result.demandGateCount,2);assert(result.reviewCountsOverlap);
 });
 await check('missing/zero market denominator remains review, never a confirmed absence or forced card',()=>{
  const rows=plain(run('evaluate(draft)'));for(const row of rows){row.demand=false;row.tierEligible=false;row.possiblePatterns=['Quiet'];}
  rows[0]={...rows[0],demand:true,tierEligible:true,supplyThresholds:{valid:false,state:'missing_denominator'},possiblePatterns:['Crowded','FOMO','Our Farm','Pioneer'],pattern:null};
  const result=plain(api.patternCounts(criteria(),rows));for(const n of ['Crowded','FOMO','Our Farm','Pioneer'])assert.deepEqual(result.counts[n],{confirmed:0,review:1});
 });
 await check('province/viewport slices and duplicate or alien UUIDs cannot masquerade as the national cohort',()=>{
  const rows=plain(run('evaluate(draft)'));assert.equal(api.patternCounts(criteria(),rows.slice(0,100)).reason,'national_rows_required');const duplicate=rows.slice();duplicate[1]=duplicate[0];assert.equal(api.patternCounts(criteria(),duplicate).reason,'duplicate_reporting_uuid');const alien=rows.slice();alien[0]={...alien[0],id:'not-a-reporting-uuid'};assert.equal(api.patternCounts(criteria(),alien).reason,'national_rows_required');
 });
 await check('invalid numeric criteria and loading/error states display unavailable instead of zero',()=>{
  run('draft.buildingP2=NaN');let result=api.patternCounts();assert.equal(result.valid,false);assert(api.patternCountView('FOMO',result).includes('>—</strong>'));run('draft=structuredClone(originalCriteria);Y.loading=true');assert.equal(api.patternCounts().reason,'loading');run('Y.loading=false;Y.loadError="test provider failure"');assert.equal(api.patternCounts().reason,'load_error');run('Y.loadError=null');
 });
 await check('live sync updates all 16 counters through the existing updateImpact hook in both languages',()=>{
  const cards=run('patternNames').map(name=>({dataset:{patternCount:name},values:{confirmed:{textContent:''},review:{textContent:''}},querySelector(selector){return this.values[selector.includes('confirmed')?'confirmed':'review'];}}));
  const dom={querySelectorAll(selector){return selector==='[data-pattern-count]'?cards:[];}};
  const result=api.syncPatternCounts(dom);for(const card of cards){assert.equal(card.dataset.countState,'ready');assert.equal(card.values.confirmed.textContent,run('num('+result.counts[card.dataset.patternCount].confirmed+')'));}
  for(const lang of ['th','en']){h.sandbox.languageUnderTest=lang;run('Y.lang=languageUnderTest');const html=api.preferred();assert.equal((html.match(/data-pattern-confirmed=/g)||[]).length,8);assert.equal((html.match(/data-pattern-review=/g)||[]).length,8);assert(html.includes(lang==='th'?'ทำเลเข้าเกณฑ์':'confirmed locations'));assert(html.includes(lang==='th'?'รอตรวจอาจซ้ำกันหลายรูปแบบ':'Review locations can appear in several types'));}
 });
 await check('counts do not alter criteria, eligibility, ranking, events, source values or national cutoffs',()=>{
  const before=run('JSON.stringify({criteria:Y.criteria,draft,rows:evaluate(draft),events:Y.events,areas:AREAS,cutoffs:METRICS.filter(m=>m.ready).map(m=>[m.id,cutoff(m.id,95)])})');api.patternCounts();api.preferred();api.syncPatternCounts({querySelectorAll:()=>[]});const after=run('JSON.stringify({criteria:Y.criteria,draft,rows:evaluate(draft),events:Y.events,areas:AREAS,cutoffs:METRICS.filter(m=>m.ready).map(m=>[m.id,cutoff(m.id,95)])})');assert.equal(after,before);
 });
 for(const [industry,brand]of [['grocery','grocery-brand:SEVEN_ELEVEN'],['nonbank','legal:0107557000195']]){
  await check(`${industry} counts retain the same 7,954-area national universe and source uncertainty`,async()=>{await h.select(industry,brand);run('draft=structuredClone(Y.criteria)');const result=plain(api.patternCounts());assert.equal(result.total,7954);assert(result.valid);for(const count of Object.values(result.counts)){assert(Number.isInteger(count.confirmed));assert(Number.isInteger(count.review));assert(count.confirmed>=0&&count.review>=0);}});
 }
 console.log(`PATTERN COUNTS REGRESSION: ${passed} PASS`);
})().catch(error=>{console.error(error);process.exitCode=1});
