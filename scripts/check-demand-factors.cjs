/* Source/VM validation using all actual brand/scope bindings and the national area snapshot. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),prototype=path.join(root,'prototype');
const readJSON=name=>JSON.parse(fs.readFileSync(path.join(prototype,name),'utf8'));
const registry=readJSON('data/brand-strategy-profiles.v1.9.0.json'),source=readJSON('data/real/area-context.json');
const readJS=name=>fs.readFileSync(path.join(prototype,name),'utf8'),plain=value=>JSON.parse(JSON.stringify(value));
let checks=0;const check=(name,body)=>{body();checks++;};
const listeners=new Map(),writes=[],notifications=[];
const document={addEventListener(name,handler){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(handler);},getElementById(){return null;},querySelector(){return null;}};

// This must load before any model/app translation or escaping globals exist.
const early=vm.createContext({document:{addEventListener(){}},structuredClone});early.window=early;
vm.runInContext(readJS('demand-factors.js'),early,{filename:'demand-factors.js'});
check('early script registration has no eager app-global dependency',()=>assert.equal(early.YolkDemandFactors.version,'1.9.0'));

const populationIndex=source.metrics.findIndex(m=>m.id==='population');
const areas=source.rows.map((row,index)=>({id:row[0],th:row[1],en:row[1],province:row[2],geoType:row[3]==='SUBDISTRICT'?'khwaeng':'local_authority',areaKm2:row[4],sourceRank:index,population:row[8][populationIndex],metrics:Object.fromEntries(source.metrics.map((m,i)=>[m.id,row[8][i]])),supply:{own:null,competitor:null,unverified:null}}));
const ctx=vm.createContext({document,console,structuredClone,CSS:{escape:value=>value},crypto:{randomUUID:()=> 'test-event'},
 localStorage:{getItem(){return null;},setItem(key,value){writes.push([key,value]);}},notify(message){notifications.push(message);},render(){},stashContext(){},queueImpact(){},metricPicker(id,attrs){return `<select data-test-picker="${id}" ${attrs}></select>`;},addEventListener(){}});
ctx.window=ctx;ctx.YOLK_PROVINCES=[];ctx.YOLK_RUNTIME={metricCatalog:structuredClone(source.metrics),revision:0};
ctx.YOLK_DEMO_DATA={metadata:{thresholds:{},poiSampleAreaIds:[areas[0].id]},areas,pois:[]};
for(const file of ['metrics.js','model.js','demand-factors.js','relative-supply.js'])vm.runInContext(readJS(file),ctx,{filename:file});
const api=ctx.YolkDemandFactors,run=code=>vm.runInContext(code,ctx),base=industry=>{const c=run('normalizeCriteria(null,{existing:false})');c.industry=industry;return c;};
const brand=registry.brands.find(b=>b.brandId==='bangchak'),profile=brand.perScopeProfiles[brand.defaultScope];
const seed=()=>api.seed(base('fuel'),profile);

check('legacy configuration is untouched and renders the original control fallback',()=>{
 const legacy=base('fuel'),before=JSON.stringify(legacy);
 assert.equal(api.seed(legacy,{}),legacy);assert.equal(api.isNew(legacy),false);assert.deepEqual(plain(api.errors(legacy)),[]);
 assert.equal(api.remember(legacy),false);assert.equal(api.replaceMetric(legacy,0,0,'population').reason,'legacy');assert.equal(api.setEnabled(legacy,'built_form',false).reason,'legacy');assert.equal(JSON.stringify(legacy),before);
 ctx.sample=legacy;run('draft=sample');assert.equal(api.controls(),null);assert.equal(writes.length,0);
});

const bindings=[];let totalEligible=0;
check('all 103 actual scope presets compile, validate and evaluate over the fixed national universe',()=>{
 for(const b of registry.brands)for(const [scope,p]of Object.entries(b.perScopeProfiles)){
  const c=api.seed(base(b.industryId),p),key=b.brandId+'|'+scope;
  assert.equal(api.isNew(c),true,key);assert.deepEqual(plain(api.errors(c)),[],key);
  assert(c.demandFactors.filter(f=>f.enabled).length<=3,key);
  assert(c.demandFactors.every(f=>new Set(f.tierPaths.flatMap(p=>p.all.map(x=>x.metric))).size<=3),key);
  assert(c.paths.every(p=>p.all.length<=3&&p.factorId),key);
  ctx.sample=c;const calibrated=run('YolkRelativeSupply.seedCriteria(sample,sample.supplyDenominatorId)');ctx.sample=calibrated;
  assert.deepEqual(plain(run('criteriaErrors(sample)')),[],key);
  const rows=run('computeEvaluation(sample)');assert.equal(rows.length,source.rows.length,key);
  assert(rows.every(r=>r.measuredDemand==='unknown'),key);
  const eligible=rows.filter(r=>r.eligible).length;assert(eligible>0,key+' must provide initial exploratory results');totalEligible+=eligible;
  bindings.push({brandId:b.brandId,scope,eligible});
 }
 assert.equal(bindings.length,103);assert.equal(registry.brands.length,37);
});

check('a metric replacement applies across all paths in its factor and preserves every threshold',()=>{
 const c=seed(),beforeOther=JSON.stringify(c.demandFactors.slice(1)),oldCount=c.paths.flatMap(p=>p.all).filter(x=>x.metric==='gfa').length;
 const thresholds=c.paths.map(p=>p.all.map(x=>x.percentile));assert(oldCount>1);
 const change=api.replaceMetric(c,0,0,'population');assert.equal(change.ok,true);assert.equal(change.changed,true);
 assert.equal(c.paths.flatMap(p=>p.all).filter(x=>x.metric==='gfa').length,0);
 assert.equal(c.paths.flatMap(p=>p.all).filter(x=>x.metric==='population').length,oldCount);
 assert.deepEqual(plain(c.paths.map(p=>p.all.map(x=>x.percentile))),plain(thresholds));
 assert.equal(JSON.stringify(c.demandFactors.slice(1)),beforeOther);assert.deepEqual(plain(api.errors(c)),[]);
 assert.equal(c.demandFactors[0].metricIds.length,3);
});

check('duplicate and unavailable metrics reject atomically without dropping any prior choice',()=>{
 const c=seed(),before=JSON.stringify(c);
 assert.equal(api.replaceMetric(c,0,0,'gfa_per_person').reason,'duplicate_metric');assert.equal(JSON.stringify(c),before);
 assert.equal(api.replaceMetric(c,0,0,'not_a_metric').reason,'unavailable');assert.equal(JSON.stringify(c),before);
 assert.equal(api.replaceMetric(c,900,0,'population').ok,false);assert.equal(JSON.stringify(c),before);
});

check('fourth factor and last-factor removal reject atomically; valid swaps preserve thresholds',()=>{
 const c=seed(),fourth=structuredClone(c.demandFactors[0]);fourth.id='extra_context';fourth.enabled=false;fourth.tierPaths.forEach(p=>p.id='extra_'+p.id);c.demandFactors.push(fourth);
 const before=JSON.stringify(c);assert.equal(api.setEnabled(c,'extra_context',true).reason,'factor_limit');assert.equal(JSON.stringify(c),before);
 const built=JSON.stringify(c.demandFactors[0].tierPaths);assert.equal(api.setEnabled(c,'built_form',false).ok,true);
 assert.equal(api.setEnabled(c,'extra_context',true).ok,true);assert.equal(c.demandFactors.filter(f=>f.enabled).length,3);
 assert.equal(api.setEnabled(c,'hospitality',false).ok,true);assert.equal(api.setEnabled(c,'workplace',false).ok,true);
 const last=JSON.stringify(c);assert.equal(api.setEnabled(c,'extra_context',false).reason,'factor_required');assert.equal(JSON.stringify(c),last);
 assert.equal(api.setEnabled(c,'built_form',true).ok,true);assert.equal(JSON.stringify(c.demandFactors[0].tierPaths),built);
 assert.deepEqual(plain(api.errors(c)),[]);
});

check('limits and metadata are validated across both factor templates and compiled paths',()=>{
 for(const [mutate,error]of [
  [c=>{c.demandFactors[0].tierPaths[0].all.push({metric:'population',op:'gte_percentile',percentile:90,positive_presence:true});c.demandFactors[0].metricIds.push('population');},'demandMetricLimit'],
  [c=>{c.demandFactors[0].tierPaths[0].all.push(structuredClone(c.demandFactors[0].tierPaths[0].all[0]));},'demandJointLimit'],
  [c=>{c.paths[0].all[0].metric='population';},'demandFactorPathSync'],
  [c=>{c.cohortMode='same_grain';},'demandFactorCohort'],
  [c=>{c.extraMetrics=['population'];},'demandFactorExtraMetrics'],
  [c=>{c.demandFactors[0].tierPaths[0].all[0].positive_presence=false;},'demandFactorThreshold'],
  [c=>{c.demandFactors[0].tierPaths[0].all[0].percentile=NaN;},'demandFactorThreshold'],
  [c=>{c.demandFactors[0].tierPaths[0]=null;},'demandFactorPaths']
 ]){const c=seed();mutate(c);assert(api.errors(c).includes(error),error);c.supplyMode='count';ctx.invalid=c;assert(run('criteriaErrors(invalid)').includes(error),'model must reject '+error);}
 const c=seed();c.demandFactors.forEach(f=>f.enabled=false);assert.throws(()=>api.compile(c.demandFactors),error=>error.name==='RangeError');
});

check('threshold input synchronizes the template before a factor is disabled and enabled again',()=>{
 const c=seed();ctx.sample=c;run('draft=sample');
 const input={value:'88',dataset:{pathIndex:'0',conditionIndex:'0'},hasAttribute:name=>name==='data-factor-number'};
 for(const handler of listeners.get('input')||[])handler({target:input});
 assert.equal(c.paths[0].all[0].percentile,88);assert.equal(c.demandFactors[0].tierPaths[0].all[0].percentile,88);
 assert.equal(api.setEnabled(c,'built_form',false).ok,true);assert.equal(api.setEnabled(c,'built_form',true).ok,true);assert.equal(c.paths[0].all[0].percentile,88);
 input.value='';for(const handler of listeners.get('input')||[])handler({target:input});assert(Number.isNaN(c.paths[0].all[0].percentile));assert(api.errors(c).includes('demandFactorThreshold'));
});

check('legacy four-condition paths still validate without an implicit 1.9 migration',()=>{
 const c=base('fuel');c.paths=[{id:'legacy_four',tier:1,all:['gfa','gfa_per_person','gfa_per_km2','population'].map(metric=>({metric,percentile:95,positive_presence:true}))}];
 c.activityEnabled=false;ctx.legacy=c;const before=JSON.stringify(c);assert.deepEqual(plain(run('criteriaErrors(legacy)')),[]);assert.equal(JSON.stringify(c),before);assert.equal(c.criteriaModeVersion,undefined);assert.equal(c.demandFactors,undefined);
});

check('each metric picker appears once per factor in Thai and English',()=>{
 const c=seed();ctx.sample=c;run('draft=sample');
 for(const lang of ['th','en']){ctx.testLanguage=lang;run('Y.lang=testLanguage');const html=api.controls();assert.equal((html.match(/data-test-picker=/g)||[]).length,8);assert(!html.includes('undefined'));assert(html.includes(lang==='th'?'ใช้กับทุก Tier':'applies across this factor'));}
});

check('raising all active thresholds cannot add a confirmed Demand location; zeros and missing remain distinct',()=>{
 const low=seed(),high=seed();for(const c of [low,high]){for(const f of c.demandFactors)for(const p of f.tierPaths)for(const x of p.all)x.percentile=c===low?75:99;c.paths=api.compile(c.demandFactors);c.supplyMode='count';}
 ctx.low=low;ctx.high=high;const a=new Set(run('computeEvaluation(low).filter(r=>r.eligible).map(r=>r.id)'));assert(run('computeEvaluation(high).filter(r=>r.eligible).map(r=>r.id)').every(id=>a.has(id)));
 const sample=seed();sample.supplyMode='count';sample.paths=sample.paths.filter(p=>p.factorId==='built_form');sample.demandFactors.forEach(f=>f.enabled=f.id==='built_form');sample.activityEnabled=false;
 ctx.sample=sample;run('for(const p of sample.paths)for(const x of p.all)x.percentile=1;YolkDemandFactors.remember(sample)');
 const metricIds=sample.demandFactors[0].metricIds;
 ctx.fakeZero={metrics:Object.fromEntries(metricIds.map(id=>[id,0]))};ctx.fakeMissing={metrics:Object.fromEntries(metricIds.map(id=>[id,null]))};
 assert.equal(run("pathTier(fakeZero,sample,'primary').high"),false);assert.equal(run("pathTier(fakeMissing,sample,'primary').high"),null);
});

// Exercise the real button handler, rather than calling the calibration helper
// on its behalf. This catches a relative preset with null rate references.
(async()=>{
 ctx.YOLK_RUNTIME.brandPresets=readJSON('data/brand-presets.v1.7.json');
 ctx.YOLK_RUNTIME.strategyProfiles=registry;
 ctx.presetCriteria=industry=>base(industry);
 vm.runInContext(readJS('brand-experience.js'),ctx,{filename:'brand-experience.js'});
 const button={disabled:false,dataset:{brandAction:'try-preset'}};
 const tried=[];
 for(const id of ['bangchak','grocery-brand:SEVEN_ELEVEN','legal:0107557000195']){
  const b=registry.brands.find(b=>b.brandId===id);ctx.testBrand=b;
  run('Y.industry=testBrand.industryId;Y.ownBrandId=testBrand.brandId;Y.supplyScope=testBrand.defaultScope;Y.criteria=normalizeCriteria(null,{existing:false});Y.criteria.version=7;draft=structuredClone(Y.criteria)');
  const saved=run('JSON.stringify(Y.criteria)');
  const initial=ctx.YolkBrands.seed(base(b.industryId),b.industryId,b.brandId,b.defaultScope);
  assert.equal(initial.supplyMode,'relative');assert(!Number.isFinite(initial.ownRateHigh));assert(!Number.isFinite(initial.competitorRateHigh));
  for(const handler of listeners.get('click')||[])await handler({target:{closest:()=>button}});
  const value=run('draft');assert.equal(value.supplyMode,'relative');
  assert(Number.isFinite(value.ownRateHigh)&&value.ownRateHigh>0,id);assert(Number.isFinite(value.competitorRateHigh)&&value.competitorRateHigh>0,id);
  assert.deepEqual(plain(run('criteriaErrors(draft)')),[],id);assert.equal(value.supplyCalibration.nationalUniverse,7954,id);
  assert.equal(run('JSON.stringify(Y.criteria)'),saved,'Try preset is draft only');assert.equal(value.version,7);assert.equal(run('draftBase'),7);
  const rows=run('evaluate(draft)');assert.equal(rows.length,7954,id);assert(rows.some(row=>row.eligible),id);
  tried.push({brandId:id,eligible:rows.filter(row=>row.eligible).length});
 }
 checks++;
 console.log(JSON.stringify({suite:'demand-factors-v1.9.0',checks,passed:checks,brands:registry.brands.length,scopeBindings:bindings.length,nationalAreas:source.rows.length,totalEligibleAcrossContexts:totalEligible,realTryPresetContexts:tried,evidence:'Source/VM checks; not rendered browser QA'}));
})().catch(error=>{console.error(error);process.exitCode=1;});
