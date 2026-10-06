/* Current product model regression. Real national source snapshots; no browser QA claim. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
let fixture=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
fixture=fixture.replace("'model.js', 'brand-experience.js'", "'model.js', 'relative-supply.js', 'brand-experience.js'");
fixture=fixture.replace("if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands;", "if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands; if(file==='relative-supply.js')sandbox.YolkRelativeSupply=window.YolkRelativeSupply;");
const make=Function('require','__dirname',fixture+'\nreturn harness;')(require,__dirname),h=make(),run=h.evaluate;
const plain=value=>JSON.parse(JSON.stringify(value)),checks=[],observations={};
const signature=rows=>rows.filter(a=>a.eligible).map(a=>a.id).sort().join('|');
const demandSignature=rows=>rows.map(a=>[a.id,a.demand,a.qualifyingTier,a.tierEligible]).sort((a,b)=>a[0].localeCompare(b[0]));
async function check(name,fn){await fn();checks.push({name,passed:true});console.log('PASS',name);}
(async()=>{
 const expectedHigh={fuel:1067,grocery:2859,nonbank:2298};
 for(const [industry,brand]of [['fuel','bangchak'],['grocery','grocery-brand:SEVEN_ELEVEN'],['nonbank','legal:0107557000195']]){
  await h.select(industry,brand);run('draft=structuredClone(Y.criteria)');
  const baseline=plain(run('evaluate(draft)')),saved=plain(run('draft')),baselineSource=run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply,percentiles:a.percentiles})))');
  observations[industry]={nationalRows:baseline.length,high:baseline.filter(a=>a.demand===true).length,eligible:baseline.filter(a=>a.eligible).length,demandReview:baseline.filter(a=>a.reviewCandidate).length};
  await check(industry+': current membership is only confirmed Demand and selected maximum Tier',()=>{
   assert.equal(baseline.length,7954);assert.equal(observations[industry].high,expectedHigh[industry]);
   for(const a of baseline)assert.equal(a.eligible,a.demand===true&&a.qualifyingTier!==null&&a.qualifyingTier<=saved.maxDemandTier);
   assert.equal(observations[industry].eligible,expectedHigh[industry]);
  });
  await check(industry+': old saved pattern arrays and all-demand mode cannot silently filter or admit sites',()=>{
   for(const patterns of [[],['Quiet'],['Crowded'],['Pioneer'],null,['not-a-pattern']]){
    h.sandbox.testPatterns=patterns;const rows=plain(run('evaluate({...draft,patterns:testPatterns,demandMode:"all"})'));
    assert.equal(signature(rows),signature(baseline));assert.deepEqual(demandSignature(rows),demandSignature(baseline));
   }
  });
  await check(industry+': count/relative Supply cutoffs, denominator and ranking weights preserve Yolk membership',()=>{
   const variations=[{supplyMode:'count',ownMany:1,competitorMany:1},{supplyMode:'count',ownMany:100,competitorMany:100},{supplyMode:'relative',supplyDenominatorId:'population',ownRateHigh:0.001,competitorRateHigh:1},{supplyMode:'relative',supplyDenominatorId:'gfa',ownRateHigh:1,competitorRateHigh:0.001},{rankingMode:'weighted',rankingWeights:{demand:1,ownGap:99,competitorGap:0}},{rankingMode:'weighted',rankingWeights:{demand:1,ownGap:0,competitorGap:99}}];
   for(const overrides of variations){h.sandbox.testOverrides=overrides;const rows=plain(run('evaluate({...draft,...testOverrides})'));assert.equal(signature(rows),signature(baseline));assert.deepEqual(demandSignature(rows),demandSignature(baseline));}
  });
  await check(industry+': stricter Demand Tier narrows membership while raw Demand remains constant',()=>{
   const tiers=[1,2,3].map(t=>{h.sandbox.testTier=t;return plain(run('evaluate({...draft,maxDemandTier:testTier})'));});
   assert(tiers[0].filter(a=>a.eligible).length<=tiers[1].filter(a=>a.eligible).length);assert(tiers[1].filter(a=>a.eligible).length<=tiers[2].filter(a=>a.eligible).length);
   for(const rows of tiers){assert.equal(rows.filter(a=>a.demand===true).length,expectedHigh[industry]);for(const a of rows)assert.equal(a.qualifyingTier,baseline.find(x=>x.id===a.id).qualifyingTier);}
  });
  await check(industry+': unresolved Supply is evidence, not a Demand rejection or a zero observation',()=>{
   const a=baseline.find(a=>a.eligible),row=run('AREA_INDEX.get('+JSON.stringify(a.id)+')');
   const previous=plain(row.supply);row.supply={own:null,competitor:null,unverified:null};
   try{const changed=plain(run('computeEvaluation(draft).find(a=>a.id==='+JSON.stringify(a.id)+')'));assert(changed.eligible);assert.equal(changed.reviewCandidate,false);assert.equal(changed.supply.own,null);assert.equal(changed.possiblePatterns.length,4);assert(changed.rankUpper>=changed.rankScore);assert(changed.rankCoverage<=1);}finally{row.supply=previous;}
  });
  await check(industry+': evaluation and diagnostics do not alter source snapshots, national cutoffs or events',()=>{
   assert.equal(run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply,percentiles:a.percentiles})))'),baselineSource);assert.equal(run('Y.events.length'),0);
  });
 }
 await h.select('fuel','bangchak');run('draft=structuredClone(Y.criteria)');
 await check('Unknown Demand never qualifies, and review does not turn it into an observed zero',()=>{
  const a=run('AREAS[0]'),before=plain(a.metrics);a.metrics=Object.fromEntries(Object.keys(a.metrics).map(k=>[k,null]));
  try{const row=plain(run('computeEvaluation(draft).find(a=>a.id===AREAS[0].id)'));assert.equal(row.demand,null);assert.equal(row.qualifyingTier,null);assert.equal(row.eligible,false);assert.equal(row.reviewCandidate,true);}finally{a.metrics=before;}
 });
 await check('Historical pattern fixtures require an explicit option and cannot share the current evaluation cache',()=>{
  const old=plain(run('computeEvaluation({...draft,patterns:["Quiet"],demandMode:"all"},{legacyPatternFiltering:true})'));
  assert(old.some(a=>a.eligible&&a.demand===false));assert(old.every(a=>!a.eligible||a.possiblePatterns.every(p=>p==='Quiet')));
  const modern=plain(run('evaluate({...draft,patterns:["Quiet"],demandMode:"all"})'));assert(modern.some(a=>a.eligible&&a.demand===true));assert(modern.every(a=>!a.eligible||a.demand===true));
  assert.equal(run('criteriaErrors({...draft,patterns:[]}).includes("patterns")'),false);assert.equal(run('criteriaErrors({...draft,patterns:[]},{legacyPatternFiltering:true}).includes("patterns")'),true);
 });
 await check('Saved legacy ranking no longer uses pattern stars or Supply as invisible tie priorities',()=>{
  const rows=plain(run('evaluate({...draft,rankingMode:"legacy"})'));
  const expected=[...rows].sort((a,b)=>Number(b.eligible)-Number(a.eligible)||(a.qualifyingTier||9)-(b.qualifyingTier||9)||b.passingSignalCount-a.passingSignalCount||(a.sourceRank??Infinity)-(b.sourceRank??Infinity)||a.id.localeCompare(b.id));
  assert.deepEqual(rows.map(a=>a.id),expected.map(a=>a.id));
 });
 await check('Current detail and level explainer do not render 8-pattern controls or classifications',()=>{
  const line=fs.readFileSync(path.join(repo,'prototype/app.js'),'utf8').split('\n').find(x=>x.startsWith('const num='));vm.runInContext(line,h.sandbox);
  vm.runInContext(fs.readFileSync(path.join(repo,'prototype/decision-ui.js'),'utf8'),h.sandbox);const api=h.sandbox.window.YolkDecisions;
  for(const lang of ['th','en']){h.sandbox.testLanguage=lang;run('Y.lang=testLanguage');const html=api.preferred();assert(!html.includes('data-pattern='));assert(!html.includes('max-demand-tier'));assert(html.includes(lang==='th'?'ไข่แดงเข้ม':'Deep yolk'));const detail=api.detail(plain(run('evaluate().find(a=>a.eligible)')));assert(!detail.includes('FOMO'));assert(!detail.includes('Crowded'));assert(detail.includes(lang==='th'?'ไม่ตัดทำเลออกจากกลุ่มไข่แดง':'do not remove qualifying Yolks'));}
 });
 console.log(JSON.stringify({suite:'simple-criteria',checks:checks.length,passed:checks.length,observations,evidence:'national source/VM model and markup checks; browser review separate'},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
