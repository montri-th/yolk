/* Actual source-backed decision capture, analytical uncertainty and preset regression checks. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const fixture=read('scripts/check-strategy-ui.cjs').split('\n(async () => {')[0];
const make=Function('require','__dirname',fixture+'\nreturn harness;')(require,__dirname),checks=[],presets=[];
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
async function check(name,fn){try{await fn();checks.push({name,passed:true});console.log('PASS',name)}catch(e){checks.push({name,passed:false,error:String(e.stack||e)});console.error('FAIL',name,e.message)}}
(async()=>{
 const h=make(),run=h.evaluate,snapshot=h.sandbox.window.YolkDecisionSnapshot;
 await h.select('grocery','grocery-brand:SEVEN_ELEVEN');
 run('Y.lang="en";Y.route="market";Y.criteria.maxDemandTier=1;draft=structuredClone(Y.criteria);draft.maxDemandTier=3');
 const extra=run('evaluate(draft).find(a=>a.eligible&&!evaluate(Y.criteria).find(b=>b.id===a.id).eligible)');
 assert(extra,'The real-source private draft must include a Tier 2/3 location absent from the team selection');h.sandbox.testAreaId=extra.id;
 await check('ANA02: private draft survives area detail and capture without Apply',async()=>{
  const before=run('JSON.stringify(Y.criteria)');assert(snapshot.setDisplayContext(extra.id));run('Y.route="place";Y.selected=testAreaId');
  assert.equal(snapshot.displayCriteria().maxDemandTier,3);assert.equal(h.ui.criteria().maxDemandTier,3);
  const row=run('evaluate(window.YolkDecisionSnapshot.displayCriteria()).find(a=>a.id===testAreaId)');assert.equal(row.eligible,true);
  assert(snapshot.displayBanner().includes('draft'));assert(h.ui.detail(row).includes('Strategies to investigate here'));
  const plan=await snapshot.capture(extra.id);assert.equal(plan.criteria.maxDemandTier,3);assert.equal(plan.criteriaStatus,'private_draft');assert.equal(plan.demandAssessment.eligible,true);assert.equal(plan.demandAssessment.qualifyingTier,row.qualifyingTier);assert.equal(run('JSON.stringify(Y.criteria)'),before);
  snapshot.clearDisplayContext();assert.equal(snapshot.displayCriteria().maxDemandTier,1);assert.equal(snapshot.displayBanner(),'');
 });
 await check('ANA01: generic shortlist actual handler stores the same complete immutable decision schema',async()=>{
  run('Y.route="market"');snapshot.setDisplayContext(extra.id);run('Y.route="place";Y.selected=testAreaId');
  const handler=read('prototype/app.js').split('\n').find(l=>l.startsWith("document.addEventListener('click',async e=>"));assert(handler);vm.runInContext(handler,h.sandbox);
  const button={disabled:false,dataset:{action:'target',id:extra.id}};
  await h.documentListeners.get('click').at(-1)({target:{closest:()=>button}});
  const target=run('Y.targets[testAreaId]');assert(target);assert.equal(target.strategyAssessment.snapshotSchemaVersion,'yolk.decision-snapshot/1.0');assert.equal(target.strategyAssessment.criteria.maxDemandTier,3);
  assert.equal(target.strategyAssessment.criteriaStatus,'private_draft');assert.equal(target.strategyAssessment.criteriaHash,sha(snapshot.canonical(target.strategyAssessment.criteria)));
  const persisted=JSON.parse(h.writes.get(run('STORAGE_KEY')));assert.equal(persisted.targets[extra.id].strategyAssessment.evidenceHash,target.strategyAssessment.evidenceHash);
 });
 await check('ANA01: removing retains evidence; restoring captures the displayed criteria while retaining work fields',async()=>{
  const handler=h.documentListeners.get('click').at(-1),button={disabled:false,dataset:{action:'target',id:extra.id}},click=()=>handler({target:{closest:()=>button}});
  const initial=plain(run('Y.targets[testAreaId]'));await click();assert.equal(run('Y.targets[testAreaId].archived'),true);assert.equal(run('Y.targets[testAreaId].strategyAssessment.evidenceHash'),initial.strategyAssessment.evidenceHash);
  run('Y.route="market";draft.maxDemandTier=1');snapshot.setDisplayContext(extra.id);run('Y.route="place"');await click();
  const restored=run('Y.targets[testAreaId]');assert.equal(restored.archived,false);for(const field of ['owner','status','note'])assert.equal(restored[field],initial[field]);assert.equal(restored.strategyAssessment.criteria.maxDemandTier,1);assert.notEqual(restored.strategyAssessment.criteriaHash,initial.strategyAssessment.criteriaHash);
  assert.equal(restored.strategyAssessment.demandAssessment.eligible,false);assert.equal(run('Y.events[0].type'),'place.created');
 });
 await check('ANA05: canonical criteria hash is deterministic and rejects ambiguous numeric evidence',async()=>{
  assert.equal(snapshot.canonical({z:1,a:{d:2,c:3},skip:undefined}),' {"a":{"c":3,"d":2},"z":1}'.trim());
  assert.equal(await snapshot.digest('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(await snapshot.digest('หลักฐาน'),sha('หลักฐาน'));assert.notEqual(snapshot.canonical([1,2]),snapshot.canonical([2,1]));
  assert.throws(()=>snapshot.canonical({x:Infinity}));assert.throws(()=>snapshot.canonical({x:NaN}));
 });
 await check('ANA05: manifest binds raw bytes of every source/profile/license/bounds and semantic runtime',()=>{
  const m=h.runtime.evaluationManifest;assert.equal(m.schemaVersion,'yolk.evaluation-manifest/1.0');assert.equal(m.dependencies.length,9);
  for(const entry of [...m.dependencies,...m.app.runtimeFiles]){const bytes=fs.readFileSync(path.join(root,'prototype',entry.file));assert.equal(entry.sha256,sha(bytes),entry.file+' hash');assert.equal(entry.bytes,bytes.length,entry.file+' length')}
  for(const file of ['bootstrap.js','model.js','industry-workspace.js','opportunity-engine.js','decision-snapshot.js','strategy-ui.js','decision-ui.js'])assert(m.app.runtimeFiles.some(x=>x.file===file));
  assert.equal(new Set(m.dependencies.map(x=>x.id)).size,m.dependencies.length);
 });
 await h.select('nonbank','legal:0107557000195');run('Y.route="market";Y.lang="en"');
 const id=run('evaluate(draft).find(a=>a.eligible).id');
 await check('ANA05: Non-bank capture includes license and bounds dependency; snapshot is recursively frozen',async()=>{
  const plan=await snapshot.capture(id);assert.equal(plan.sourceManifest.dependencies.length,7);
  for(const x of ['nonbank-company-scopes','nonbank-assignment-bounds','brand-strategy-profiles','industry-profiles','brand-presets'])assert(plan.sourceManifest.dependencies.some(v=>v.id===x));
  assert(Object.isFrozen(plan));assert(Object.isFrozen(plan.criteria));assert(Object.isFrozen(plan.assessments));assert(Object.isFrozen(plan.sourceManifest.dependencies));
  const copy=plain(plan);delete copy.evidenceHash;assert.equal(plan.evidenceHash,sha(snapshot.canonical(copy)));assert.equal(plan.sourceManifestHash,sha(snapshot.canonical(plan.sourceManifest)));
  const before=plan.criteria.maxDemandTier;run('draft.maxDemandTier=draft.maxDemandTier===3?1:3');assert.equal(plan.criteria.maxDemandTier,before);run('draft=structuredClone(Y.criteria)');
 });
 await check('ANA05: missing or different-release manifest rejects capture without a partial snapshot',async()=>{
  const original=h.runtime.evaluationManifest;h.runtime.evaluationManifest={...original,app:{...original.app,release:'other'}};await assert.rejects(snapshot.capture(id),/manifest/);
  h.runtime.evaluationManifest={...original,dependencies:original.dependencies.filter(x=>x.id!=='nonbank-company-scopes')};await assert.rejects(snapshot.capture(id),/dependency/);h.runtime.evaluationManifest=original;
 });
 await check('ANA01/02: actor, route, revision and draft changes during hashing reject stale decision capture',async()=>{
  for(const mutation of ['Y.actor="v0"','Y.route="demand"','window.YOLK_RUNTIME.revision++','draft.maxDemandTier=draft.maxDemandTier===3?1:3']){
   run('Y.actor="m";Y.route="market";draft=structuredClone(Y.criteria)');const pending=snapshot.capture(id);run(mutation);await assert.rejects(pending,/context changed/);
  }run('Y.actor="m";Y.route="market";draft=structuredClone(Y.criteria)');
 });
 await check('ANA04: missing, suppressed, invalid and unknown bounds never become perfect known supply gaps',()=>{
  for(const state of [null,'missing','suppressed','invalid','source_loading']){
   h.sandbox.testSupply={own:0,competitor:0,unverified:0,ownLower:0,ownUpper:0,competitorLower:0,competitorUpper:0,boundsKnown:state===null?false:true,...(state?{state}:{})};
   const result=run('(()=>{const a=structuredClone(AREAS[0]),c=structuredClone(Y.criteria);a.supply=testSupply;c.supplyMode="count";c.rankingWeights={demand:0,ownGap:50,competitorGap:50};return weightedEvaluation(a,c)})()');
   assert.equal(result.rankScore,0);assert.equal(result.rankUpper,100);assert.equal(result.rankCoverage,0);assert.equal(h.api.supplyBounds({supply:h.sandbox.testSupply}).valid,false);
  }
 });
 await check('ANA04: known measured zero stays valid, but bounds plus unresolved records remain conservative',()=>{
  for(const u of [0,1]){h.sandbox.testU=u;const result=run('(()=>{const a=structuredClone(AREAS[0]),c=structuredClone(Y.criteria);a.supply={own:0,competitor:0,unverified:testU,ownLower:0,ownUpper:0,competitorLower:0,competitorUpper:0,boundsKnown:true};c.supplyMode="count";c.rankingWeights={demand:0,ownGap:50,competitorGap:50};return weightedEvaluation(a,c)})()');assert.equal(result.rankScore,u?0:100);assert.equal(result.rankUpper,100);assert.equal(result.rankCoverage,u?0:1)}
 });
 await check('ANA03: Demand weight scope and distinct Strategy ordering are explicit without altering Demand membership',()=>{
  const before=h.ui.currentView();const ids=before.rows.map(x=>x.row.id);run('draft.rankingMode="weighted";draft.rankingWeights={demand:0,ownGap:100,competitorGap:0}');const after=h.ui.currentView();
  assert.equal(before.demandEligibleCount,after.demandEligibleCount);assert.deepEqual(plain(after.rows.map(x=>x.row.id)),plain(ids));assert(h.ui.page().includes('Team weights order the Demand page'));assert(read('prototype/decision-ui.js').includes('Order the Demand page'));run('draft=structuredClone(Y.criteria)');
 });
 await check('ANA06: evidence queues and calibration hypotheses are visible in both languages',()=>{
  for(const lang of ['en','th']){h.sandbox.testLang=lang;run('Y.lang=testLang');const html=h.ui.page();for(const q of ['view-candidates','view-incomplete','view-unsupported'])assert(html.includes(q));assert(h.ui.calibrationNotice().includes('n=0'));assert(html.includes(lang==='en'?'Incomplete evidence does not mean an unsuitable location.':'ข้อมูลไม่พอไม่ได้แปลว่าทำเลไม่เหมาะ'))}
 });
 const sweep=make();
 for(const brand of sweep.runtime.strategyProfiles.brands){await sweep.select(brand.industryId,brand.brandId);sweep.evaluate('Y.route="market"');const result=sweep.evaluate('(()=>{const c=Y.criteria,rows=evaluate(c),v=window.YolkStrategyUI.currentView(rows);return {industry:Y.industry,brand:Y.ownBrandId,scope:Y.supplyScope,errors:criteriaErrors(c),demand:rows.filter(a=>a.eligible).length,candidates:v.opportunityViewCount,incomplete:v.evidenceIncompleteCount,unsupported:v.notSupportedCount,ownN:c.supplyCalibration.own.n,rivalN:c.supplyCalibration.competitor.n}})()');presets.push(plain(result));}
 await check('ANA06: all 37 real brand presets are valid and partition Demand into honest survey queues',()=>{
  assert.equal(presets.length,37);assert.equal(presets.filter(x=>x.industry==='nonbank').length,10);for(const p of presets){assert.deepEqual(p.errors,[],p.brand);assert.equal(p.demand,p.candidates+p.incomplete+p.unsupported,p.brand);assert(p.candidates>=0&&p.incomplete>=0&&p.unsupported>=0)}
  for(const p of presets.filter(x=>x.industry==='nonbank')){assert.equal(p.ownN,0);assert.equal(p.rivalN,0)}
 });
 const failures=checks.filter(x=>!x.passed);console.log(JSON.stringify({suite:'decision-evidence',checks:checks.length,passed:checks.length-failures.length,presets,failures,evidence:'Real source snapshots + actual capture, model, generic shortlist and strategy APIs in Node VM; native rendering and business calibration require separate evidence.'},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
