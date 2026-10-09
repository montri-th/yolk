/* Actual read-only explanation with current model/profile/source data. Native layout is separate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const prefix=read('scripts/check-strategy-ui.cjs').split('\n(async () => {')[0];
const harness=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname);
const plain=v=>JSON.parse(JSON.stringify(v)),hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const context=JSON.parse(read('prototype/data/real/area-context.json')),checks=[];
async function check(name,fn){try{await fn();checks.push({name,passed:true});console.log('PASS',name);}catch(error){checks.push({name,passed:false,error:String(error.stack||error)});console.error('FAIL',name,error.message);}}
(async()=>{
 const h=harness(),run=h.evaluate;
 await check('Explanations resolve every brand/scope activity set from the real profile exactly as the assessor does',async()=>{
  const supported=['factory_count','factory_workers','hotel_rooms'];
  for(const b of h.runtime.strategyProfiles.brands){
   for(const scope of Object.keys(b.perScopeProfiles)){
    await h.select(b.industryId,b.brandId,scope);
    const effective={...b,...b.perScopeProfiles[scope]},anchors=Array.isArray(effective.complementaryAnchors)?[...new Set(effective.complementaryAnchors.flatMap(a=>a.metricIds||[]).filter(id=>supported.includes(id)))]:null;
    const expected=effective.complementaryMetricIds??effective.opportunity?.complementaryMetricIds??anchors??['factory_workers','hotel_rooms'];
    assert.deepEqual(plain(h.ui.complementarySources().map(s=>s.id)),[...new Set(expected)].filter(id=>supported.includes(id)),b.brandId+'/'+scope);
   }
  }
 });
 await check('Source dates are actual factory ACTIVE April2025 and explicitly unknown hotel effective date',async()=>{
  await h.select('fuel','bangchak','all_fuel');
  for(const lang of ['th','en']){
   run('Y.lang="'+lang+'"');
   const sources=h.ui.complementarySources(),html=h.ui.complementaryExplanation();
   assert.equal(sources.length,3);
   for(const item of sources){const m=context.metrics.find(m=>m.id===item.id);assert(m);assert.equal(item.dataset,m.dataset_id);assert.equal(item.period,m.display[lang==='th'?'periodTH':'periodEN']);assert(html.includes(item.period));}
   assert(context.metrics.find(m=>m.id==='hotel_rooms').source_period===null);
   assert(html.includes('data-complementary-metric="hotel_rooms"'));
  }
 });
 await check('A distinct Demand metric from the same factory source is visibly correlated; unrelated sources are not labeled shared',async()=>{
  await h.select('grocery','grocery-brand:SEVEN_ELEVEN','C_STORE');run('Y.lang="en"');
  const c=plain(h.ui.criteria()),shared={...c,buildingEnabled:false,activityEnabled:false,extraMetrics:['factory_workers_per_km2']},unshared={...c,buildingEnabled:false,activityEnabled:false,extraMetrics:['population']};
  assert.equal(h.ui.complementarySources(shared).find(s=>s.id==='factory_workers').shared,true);
  assert.equal(h.ui.complementarySources(shared).find(s=>s.id==='hotel_rooms').shared,false);
  assert(h.ui.complementaryExplanation({c:shared}).includes('not two independent pieces of evidence'));
  assert(h.ui.complementaryExplanation({c:shared}).includes('Shares its source with Demand'));
  assert(!h.ui.complementarySources(unshared).some(s=>s.shared));
  assert(h.ui.complementaryExplanation({c:unshared}).includes('Adding this source to Demand would use it for screening'));
 });
 await check('Nonbank profile renders no activity source or fabricated complementary candidate',async()=>{
  await h.select('nonbank','legal:0107557000195','vehicle_title');run('Y.route="market";Y.lang="en";draft=structuredClone(Y.criteria)');h.ui.setSelected(['complementary_location']);
  assert.deepEqual(plain(h.ui.complementarySources()),[]);
  const html=h.ui.complementaryExplanation();assert(html.includes('no supported activity metric'));assert(html.includes('Population alone does not establish'));
  assert(!html.includes('data-complementary-metric="adult_population_20_64"'));
  assert.equal(h.ui.currentView().opportunityViewCount,0);
 });
 for(const [industry,brand,scope]of [['fuel','bangchak','all_fuel'],['grocery','grocery-brand:SEVEN_ELEVEN','C_STORE'],['nonbank','legal:0107557000195','vehicle_title']]){
  await h.select(industry,brand,scope);run('Y.route="market";draft=structuredClone(Y.criteria)');h.ui.setSelected(['complementary_location']);
  await check(industry+': opening TH/EN role details preserves criteria, source values, Demand IDs/tiers, ordering, local/team state',()=>{
   const rows=run('evaluate(draft)'),before=hash({rows,criteria:run('Y.criteria'),draft:run('draft'),events:run('Y.events'),targets:run('Y.targets'),writes:[...h.writes],view:h.ui.currentView(rows),strategies:h.ui.selectedIds()});
   for(const lang of ['th','en']){
    run('Y.lang="'+lang+'"');const html=h.ui.complementaryExplanation({expanded:true}),page=h.ui.page();
    assert(html.includes('data-complementary-explanation open'));assert(page.includes('data-complementary-explanation'));
    assert(html.includes(lang==='en'?'never adds Yolks or changes tiers':'ไม่เพิ่มไข่แดงหรือเปลี่ยน Tier'));
    assert(html.includes(lang==='en'?'not measured customers':'ไม่ใช่จำนวนลูกค้าจริง'));
    assert(html.includes(lang==='en'?'Hospital/school anchors belong to the next phase':'โรงพยาบาล/โรงเรียนอยู่เฟสถัดไป'));
    assert(!html.includes('[object Object]'));assert(html.includes('data-guide-id="complementary_location"'));
   }
   assert.equal(hash({rows:run('evaluate(draft)'),criteria:run('Y.criteria'),draft:run('draft'),events:run('Y.events'),targets:run('Y.targets'),writes:[...h.writes],view:h.ui.currentView(rows),strategies:h.ui.selectedIds()}),before);
  });
 }
 await check('Selected activity cues use largest passing midrank without a duplicate-metric score',()=>{
  const c={maxDemandTier:3,supplyMode:'count',ownMany:1,competitorMany:1},row={id:'hypothetical',demand:true,eligible:true,qualifyingTier:2,metrics:{factory_count:4,factory_workers:600,hotel_rooms:400},percentiles:{factory_count:99,factory_workers:97,hotel_rooms:98}};
  const one=h.api.assess(row,c,{},null,{strategyIds:['complementary_location'],anchorMetricIds:['factory_count']}).assessments[0];
  const many=h.api.assess(row,c,{},null,{strategyIds:['complementary_location'],anchorMetricIds:['factory_count','factory_workers','hotel_rooms']}).assessments[0];
  assert.equal(one.status,'candidate_to_check');assert.equal(many.status,'candidate_to_check');assert.deepEqual(plain(one.sortTuple),[99]);assert.deepEqual(plain(many.sortTuple),[99]);
  assert(many.missingEvidence.some(e=>e.code==='verified_anchor_and_purchase_flow'));
 });
 const failed=checks.filter(c=>!c.passed);console.log(JSON.stringify({suite:'complementary-clarity',checks:checks.length,passed:checks.length-failed.length,failures:failed,evidence:'Actual read-only UI helpers and strategy engine with all37 brand/scope profiles, source periods and model snapshots in VM. Native widths, touch, physical devices and outcomes remain separate.'},null,2));if(failed.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
