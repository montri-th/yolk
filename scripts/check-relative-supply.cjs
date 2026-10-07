/* Actual-runtime regression for Supply / one explicit extensive context denominator. */
'use strict';
const fs = require('fs'), path = require('path'), assert = require('node:assert/strict');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '..'), prototype = path.join(repo, 'prototype');
const readJSON = file => JSON.parse(fs.readFileSync(path.join(prototype, file), 'utf8'));
const plain = value => JSON.parse(JSON.stringify(value));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const near = (actual, expected, label = '') => assert(Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(expected)), label + ': ' + actual + ' != ' + expected);

// Reuse the real 7,954-area/source-inventory fixture, but load the new browser module
// in the same order as the application. No copied implementation formulas are executed.
let fixtureSource = fs.readFileSync(path.join(__dirname, 'check-brand-presets.cjs'), 'utf8').split('(async () => {')[0];
if (!fixtureSource.includes("'relative-supply.js'")) fixtureSource = fixtureSource.replace("'model.js', 'brand-experience.js'", "'model.js', 'relative-supply.js', 'brand-experience.js'");
fixtureSource = fixtureSource.replace("if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands;", "if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands; if (file === 'relative-supply.js') sandbox.YolkRelativeSupply = window.YolkRelativeSupply;");
const createHarness = Function('require', '__dirname', fixtureSource + '\nreturn harness;')(require, __dirname);
const checks = [], observations = {}, started = Date.now();
async function check(name, callback) {
  const start = Date.now();
  try { await callback(); checks.push({name, passed: true, elapsedMs: Date.now() - start}); }
  catch (error) { checks.push({name, passed: false, elapsedMs: Date.now() - start, error: String(error.stack || error)}); }
}

function fixtureCriteria(h, overrides = {}) {
  h.sandbox.relativeOverrides = overrides;
  return plain(h.evaluate('normalizeCriteria({...Y.criteria,supplyMode:"relative",supplyDenominatorId:"population",ownRateHigh:1,competitorRateHigh:1,buildingEnabled:true,activityEnabled:false,extraMetrics:[],paths:[{id:"population-test",tier:1,all:[{metric:"population",percentile:1,positive_presence:true}]}],patterns:[...patternNames],rankingMode:"weighted",rankingWeights:{demand:0,ownGap:50,competitorGap:50},...relativeOverrides},{existing:false})'));
}
function fixtureArea(h, overrides = {}) {
  const area = plain(h.evaluate('AREAS[0]'));
  return {...area, ...overrides, metrics: {...area.metrics, population:20000, ...(overrides.metrics || {})},
    percentiles: {...area.percentiles, population:100, ...(overrides.percentiles || {})},
    supply: {own:2,competitor:0,unverified:0,...(overrides.supply || {})}};
}
function threshold(h, area, criteria) {
  h.sandbox.relativeArea = area; h.sandbox.relativeCriteria = criteria;
  return plain(h.evaluate('YolkRelativeSupply.countThresholds(relativeArea,relativeCriteria)'));
}
function weighted(h, area, criteria) {
  h.sandbox.relativeArea = area; h.sandbox.relativeCriteria = criteria;
  return plain(h.evaluate('weightedEvaluation(relativeArea,relativeCriteria)'));
}
function evaluatedFixture(h, area, criteria) {
  h.sandbox.relativeArea = area; h.sandbox.relativeCriteria = criteria;
  return plain(h.evaluate('(()=>{const a=AREAS[0],old={metrics:a.metrics,percentiles:a.percentiles,supply:a.supply};Object.assign(a,{metrics:relativeArea.metrics,percentiles:relativeArea.percentiles,supply:relativeArea.supply});try{return computeEvaluation(relativeCriteria).find(row=>row.id===a.id)}finally{Object.assign(a,old)}})()'));
}

// Checks follow below; each calls the production module/model/context handler.
(async () => {
  const h = createHarness(), run = h.evaluate, api = h.sandbox.window.YolkRelativeSupply;
  assert(api && typeof api.seedCriteria === 'function' && typeof api.countThresholds === 'function', 'Relative Supply production API must be loaded');
  const registry = readJSON('data/brand-presets.v1.7.json');
  const initialDataHashes = Object.fromEntries(['fuel','grocery','nonbank'].map(id => [id,hash(h.runtime.supplyCache.get(id))]));
  const nationalCuts = plain(run('Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,[1,50,75,90,95,99].map(p=>cutoff(m.id,p))]))'));

  await check('Two branches / 20,000 people = 1 per 10,000; three / 100,000 = 0.3, with coherent pattern and gap ordering', () => {
    const c = fixtureCriteria(h), small = fixtureArea(h), large = fixtureArea(h,{metrics:{population:100000},supply:{own:3}});
    const smallT = threshold(h,small,c), largeT = threshold(h,large,c);
    assert.equal(smallT.valid,true); assert.equal(largeT.valid,true); assert.equal(smallT.unit,10000);
    near(small.supply.own * smallT.unit / smallT.denominator,1);
    near(large.supply.own * largeT.unit / largeT.denominator,.3);
    near(smallT.own,2); near(largeT.own,10);
    assert.equal(evaluatedFixture(h,small,c).pattern,'Our Farm');
    assert.equal(evaluatedFixture(h,large,c).pattern,'Pioneer');
    const smallRank = weighted(h,small,c), largeRank = weighted(h,large,c);
    assert(largeRank.rankingComponents.ownGap.lower > smallRank.rankingComponents.ownGap.lower);
    near(smallRank.rankingComponents.ownGap.lower,50);
    near(largeRank.rankingComponents.ownGap.lower,100/1.3);
    observations.relativeExample = {small:{count:2,denominator:20000,rate:1},large:{count:3,denominator:100000,rate:.3},unit:10000};
  });

  await check('Source-explicit zero branch counts are usable; absent/zero/nonfinite/negative denominators remain unknown', () => {
    const c = fixtureCriteria(h), zero = fixtureArea(h,{supply:{own:0,competitor:0}});
    assert.equal(threshold(h,zero,c).valid,true);
    assert.equal(evaluatedFixture(h,zero,c).pattern,'Pioneer');
    near(weighted(h,zero,c).rankingComponents.ownGap.lower,100);
    for (const value of [null,undefined,0,-1,NaN,Infinity]) {
      const missing = fixtureArea(h,{metrics:{population:value}}), result = threshold(h,missing,c);
      assert.equal(result.valid,false,String(value));
      const ranking = weighted(h,missing,c);
      assert(Number.isFinite(ranking.rankScore)); assert(Number.isFinite(ranking.rankUpper));
      near(ranking.rankingComponents.ownGap.lower,0); near(ranking.rankingComponents.ownGap.upper,100);
      near(ranking.rankCoverage,0);
    }
    const independentlyHigh = {...c,paths:[{id:'building-independent',tier:1,all:[{metric:'gfa',percentile:1,positive_presence:true}]}]};
    const unknownDenominator = fixtureArea(h,{metrics:{population:null,gfa:1e12},supply:{own:0,competitor:0}});
    const unknownPattern = evaluatedFixture(h,unknownDenominator,independentlyHigh);
    assert.equal(unknownPattern.demand,true);
    assert.equal(unknownPattern.pattern,null);
    assert.deepEqual([...unknownPattern.possiblePatterns].sort(),['Crowded','FOMO','Our Farm','Pioneer']);
    const missingSupply = fixtureArea(h,{supply:{own:null,competitor:null,unverified:null}});
    assert.equal(evaluatedFixture(h,missingSupply,c).pattern,null);
    near(weighted(h,missingSupply,c).rankCoverage,0);
  });

  await check('Equivalent denominator/rate unit conversion leaves count thresholds, classifications and rankings invariant', () => {
    const c = fixtureCriteria(h), a = fixtureArea(h), beforeT = threshold(h,a,c), before = weighted(h,a,c);
    // Expressing a denominator in a unit ten times smaller multiplies its number
    // by ten and divides the threshold rate by ten. The branch-count boundary is unchanged.
    const scaled = fixtureArea(h,{metrics:{population:a.metrics.population*10}});
    const scaledC = {...c,ownRateHigh:c.ownRateHigh/10,competitorRateHigh:c.competitorRateHigh/10};
    const afterT = threshold(h,scaled,scaledC), after = weighted(h,scaled,scaledC);
    near(afterT.own,beforeT.own); near(afterT.competitor,beforeT.competitor);
    near(after.rankScore,before.rankScore); near(after.rankUpper,before.rankUpper);
    assert.equal(evaluatedFixture(h,scaled,scaledC).pattern,evaluatedFixture(h,a,c).pattern);
  });

  await check('Legacy count mode and absent-mode migration retain exact count thresholds and uncertainty behavior', () => {
    const c = fixtureCriteria(h,{supplyMode:'count',ownMany:3,competitorMany:3});
    const a = fixtureArea(h,{metrics:{population:null},supply:{own:2,competitor:4}}), t = threshold(h,a,c);
    assert.equal(t.valid,true); near(t.own,3); near(t.competitor,3);
    near(weighted(h,a,c).rankingComponents.ownGap.lower,60);
    near(weighted(h,a,c).rankingComponents.competitorGap.lower,100/(1+4/3));
    h.sandbox.migrationCriteria = {...c}; delete h.sandbox.migrationCriteria.supplyMode;
    const migrated = plain(run('normalizeCriteria(migrationCriteria,{existing:true})'));
    assert.equal(migrated.supplyMode,'count'); assert.equal(migrated.version,c.version);
    assert.deepEqual(threshold(h,a,migrated),t);
  });

  await check('Fuel unknown-brand U stays jointly allocated: impossible Pioneer/Crowded states and independent ranking bounds are excluded', () => {
    const c = fixtureCriteria(h), a = fixtureArea(h,{supply:{own:0,competitor:0,unverified:3}}), result = evaluatedFixture(h,a,c);
    assert.deepEqual([...result.possiblePatterns].sort(),['FOMO','Our Farm']);
    assert.equal(result.pattern,null);
    const rank = weighted(h,a,c);
    // Exactly three U branches: allocations (0,3), (1,2), (2,1), (3,0).
    near(rank.rankScore,100*(1/1.5+1/2)/2);
    near(rank.rankUpper,70);
    assert(rank.rankScore > 40,'Independent low/low bounds would wrongly imply six U branches');
    near(rank.rankCoverage,0);
  });

  await check('Assignment/reconciliation lower–upper intervals survive normalization and remain uncertain in patterns/ranking', () => {
    const c = fixtureCriteria(h), a = fixtureArea(h,{supply:{own:0,competitor:1,unverified:0,ownLower:0,ownUpper:3,competitorLower:1,competitorUpper:4}});
    const before = plain(a.supply), result = evaluatedFixture(h,a,c), ranking = weighted(h,a,c);
    assert.deepEqual(result.supply,before);
    assert.deepEqual([...result.possiblePatterns].sort(),['Crowded','FOMO','Our Farm','Pioneer']);
    assert.equal(result.pattern,null);
    near(ranking.rankingComponents.ownGap.lower,40); near(ranking.rankingComponents.ownGap.upper,100);
    near(ranking.rankingComponents.competitorGap.lower,100/3); near(ranking.rankingComponents.competitorGap.upper,100/1.5);
    near(ranking.rankCoverage,0);
  });

  await check('Changing ranking weights cannot alter Supply high/low classification or the eligible UUID set', () => {
    const c = fixtureCriteria(h,{patterns:['Pioneer','FOMO']}), a = fixtureArea(h,{supply:{own:3,competitor:0},metrics:{population:100000}});
    const before = evaluatedFixture(h,a,c), after = evaluatedFixture(h,a,{...c,rankingWeights:{demand:100,ownGap:0,competitorGap:0}});
    assert.equal(after.pattern,before.pattern); assert.deepEqual(after.possiblePatterns,before.possiblePatterns); assert.equal(after.eligible,before.eligible);
  });

  await check('Calibration is the unrounded median of positive exact national rates, never a quota or the filtered province', async () => {
    await h.select('grocery','grocery-brand:SEVEN_ELEVEN');
    const before = plain(run('Y.criteria')), seeded = plain(api.seedCriteria(before,'population'));
    const areaRows = plain(run('AREAS'));
    const catalog = api.catalog.find(x => x.id === 'population');
    assert(catalog && catalog.unit===10000);
    for (const role of ['own','competitor']) {
      const values = areaRows.filter(a => a.metrics.population>0 && Number.isFinite(a.metrics.population)
        && a.supply.unverified===0 && !Object.hasOwn(a.supply,'ownLower') && !Object.hasOwn(a.supply,'ownUpper')
        && !Object.hasOwn(a.supply,'competitorLower') && !Object.hasOwn(a.supply,'competitorUpper')
        && Number.isInteger(a.supply[role]) && a.supply[role]>0)
        .map(a => a.supply[role]*catalog.unit/a.metrics.population).sort((a,b)=>a-b);
      const expected = values.length>=5 ? (values[Math.floor((values.length-1)/2)]+values[Math.ceil((values.length-1)/2)])/2 : 1;
      assert.equal(seeded.supplyCalibration[role].n,values.length,role);
      near(seeded[role==='own'?'ownRateHigh':'competitorRateHigh'],expected,role);
      near(seeded.supplyCalibration[role].threshold,expected,role);
    }
    run('Y.province="10"');
    const inProvince = plain(api.seedCriteria(before,'population'));
    assert.deepEqual(inProvince.supplyCalibration.own,seeded.supplyCalibration.own);
    assert.deepEqual(inProvince.supplyCalibration.competitor,seeded.supplyCalibration.competitor);
    assert.equal(seeded.supplyCalibration.nationalUniverse,7954);
    observations.calibrationExample = seeded.supplyCalibration;
  });

  await check('Fewer than five positive exact observations use an explicit insufficient-sample hypothesis of one branch/unit', () => {
    run('globalThis.relativeSupplyBackup=AREAS.map(a=>a.supply);AREAS.forEach((a,i)=>a.supply={own:i<4?1:0,competitor:i<4?2:0,unverified:0})');
    try {
      const seeded = plain(api.seedCriteria(plain(run('Y.criteria')),'population'));
      assert.equal(seeded.supplyCalibration.own.n,4); assert.equal(seeded.supplyCalibration.competitor.n,4);
      assert.equal(seeded.supplyCalibration.own.method,'hypothesis_insufficient_sample');
      assert.equal(seeded.supplyCalibration.competitor.method,'hypothesis_insufficient_sample');
      near(seeded.ownRateHigh,1); near(seeded.competitorRateHigh,1);
    } finally {run('AREAS.forEach((a,i)=>a.supply=relativeSupplyBackup[i]);delete globalThis.relativeSupplyBackup');}
  });

  await check('The denominator whitelist excludes densities, percentiles, fiscal revenue and arbitrary/unknown IDs', () => {
    assert.equal(api.catalog.length,6);
    assert(api.catalog.every(x => Number.isFinite(x.unit)&&x.unit>0));
    const ids = new Set(api.catalog.map(x=>x.id));
    for (const forbidden of ['population_per_km2','gfa_per_person','gfa_per_km2','factory_count_per_km2','fiscal_total_thb','P95','invented-metric']) {
      assert(!ids.has(forbidden));
      const c = fixtureCriteria(h,{supplyDenominatorId:forbidden}); h.sandbox.relativeCriteria = c;
      assert(plain(run('criteriaErrors(relativeCriteria)')).length>0,forbidden);
      assert.equal(threshold(h,fixtureArea(h),c).valid,false,forbidden);
    }
    for (const rate of [0,-1,NaN,Infinity]) {
      const c = fixtureCriteria(h,{ownRateHigh:rate}); h.sandbox.relativeCriteria = c;
      assert(plain(run('criteriaErrors(relativeCriteria)')).length>0,String(rate));
    }
  });

  await check('Denominator changes/reseeding are a private draft: committed criteria, events, source inventory and national cuts stay unchanged', () => {
    const before = plain(run('({criteria:Y.criteria,events:Y.events})'));
    const supplied = plain(run('Y.criteria'));
    const fresh = plain(api.seedCriteria(supplied,'gfa'));
    assert.equal(fresh.supplyMode,'relative'); assert.equal(fresh.supplyDenominatorId,'gfa');
    assert.deepEqual(supplied,before.criteria,'seedCriteria must not mutate its argument');
    h.sandbox.newDraft = fresh; run('draft=structuredClone(newDraft)');
    assert.deepEqual(plain(run('({criteria:Y.criteria,events:Y.events})')),before);
    const changes = plain(run('diffCriteria(Y.criteria,draft)'));
    assert(changes.some(x => x.field==='supplyDenominatorId'));
    for (const id of ['fuel','grocery','nonbank']) assert.equal(hash(h.runtime.supplyCache.get(id)),initialDataHashes[id]);
    assert.deepEqual(plain(run('Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,[1,50,75,90,95,99].map(p=>cutoff(m.id,p))]))')),nationalCuts);
    run('draft=structuredClone(Y.criteria);draftBase=Y.criteria.version');
  });

  await check('New contexts start in relative mode after their own inventory loads; saved count criteria/draft/version survive visits and reload', async () => {
    const fresh = createHarness(), r = fresh.evaluate;
    await fresh.select('fuel','bangchak');
    assert.equal(r('Y.criteria.supplyMode'),'relative'); assert.equal(r('Y.criteria.supplyDenominatorId'),'gfa');
    r('Y.criteria.supplyMode="count";Y.criteria.ownMany=7;Y.criteria.competitorMany=9;Y.criteria.version=23;draft=structuredClone(Y.criteria);draft.ownMany=8;draftBase=23;stashContext()');
    const expected = plain(r('({criteria:Y.criteria,draft,draftBase})'));
    await fresh.select('grocery','grocery-brand:TOPS');
    assert.equal(r('Y.criteria.supplyMode'),'relative'); assert.equal(r('Y.criteria.supplyDenominatorId'),'population');
    assert.equal(r('Y.criteria.supplyCalibration.brandId'),'grocery-brand:TOPS');
    assert.equal(r('Y.criteria.supplyCalibration.scope'),'SUPERMARKET');
    await fresh.select('nonbank','legal:0107557000195');
    assert.equal(r('Y.criteria.supplyMode'),'relative'); assert.equal(r('Y.criteria.supplyDenominatorId'),'population');
    await fresh.select('fuel','bangchak');
    assert.deepEqual(plain(r('({criteria:Y.criteria,draft,draftBase})')),expected);
    assert.equal(r('Y.events.length'),0); r('stashContext()');
    const reloaded = createHarness(fresh.writes);
    assert.deepEqual(plain(reloaded.evaluate('({criteria:Y.criteria,draft,draftBase})')),expected);
    const key = 'citymeter-yolk-three-industries-workspace-v1';
    const legacySaved = JSON.parse(fresh.writes.get(key));
    legacySaved.contexts = {}; legacySaved.criteria.version=31; legacySaved.criteria.ownMany=11;
    for (const field of ['supplyMode','supplyDenominatorId','ownRateHigh','competitorRateHigh','supplyCalibration']) delete legacySaved.criteria[field];
    const legacy = createHarness(new Map([[key,JSON.stringify(legacySaved)]]));
    assert.equal(legacy.evaluate('Y.criteria.supplyMode'),'count');
    assert.equal(legacy.evaluate('Y.criteria.version'),31);
    assert.equal(legacy.evaluate('Y.criteria.ownMany'),11);
    assert.equal(legacy.evaluate('Y.events.length'),0);
  });

  await check('All 37 real brand/default-scope contexts produce valid seeds and finite or explicitly missing Supply thresholds across 7,954 UUIDs', async () => {
    const fresh = createHarness(), r = fresh.evaluate, summary = [];
    for (const brand of registry.brands) {
      await fresh.select(brand.industryId,brand.brandId,brand.defaultScope);
      assert.equal(r('Y.loadError'),null,brand.brandId);
      assert.deepEqual(plain(r('criteriaErrors(Y.criteria)')),[],brand.brandId);
      assert.equal(r('Y.criteria.supplyMode'),'relative',brand.brandId);
      assert.equal(r('Y.criteria.supplyCalibration.brandId'),brand.brandId);
      assert.equal(r('Y.criteria.supplyCalibration.scope'),brand.defaultScope);
      const result = plain(r('(()=>{const rows=AREAS.map(a=>YolkRelativeSupply.countThresholds(a,Y.criteria));return {total:rows.length,valid:rows.filter(t=>t.valid).length,invalid:rows.filter(t=>!t.valid).length,bad:rows.filter(t=>t.valid&&(!Number.isFinite(t.own)||t.own<=0||!Number.isFinite(t.competitor)||t.competitor<=0)).length}})()'));
      assert.equal(result.total,7954); assert.equal(result.bad,0,brand.brandId);
      const ranked = plain(r('evaluate(Y.criteria).map(a=>({id:a.id,pattern:a.pattern,possible:a.possiblePatterns,score:a.rankScore,upper:a.rankUpper,coverage:a.rankCoverage}))'));
      assert.equal(ranked.length,7954);
      assert(ranked.every(a=>Number.isFinite(a.score)&&Number.isFinite(a.upper)&&a.score<=a.upper+1e-9&&a.score>=0&&a.upper<=100+1e-9),brand.brandId);
      assert(ranked.every(a=>a.pattern===null||a.possible.length===1&&a.possible[0]===a.pattern),brand.brandId);
      assert.equal(r('Y.events.length'),0);
      summary.push({industry:brand.industryId,brand:brand.brandId,scope:brand.defaultScope,...result,calibration:plain(r('Y.criteria.supplyCalibration'))});
    }
    observations.brandContexts = summary;
    assert.deepEqual(plain(r('Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,[1,50,75,90,95,99].map(p=>cutoff(m.id,p))]))')),nationalCuts);
  });

  await check('Every supported alternate brand format/scope uses its own real inventory and family with valid relative thresholds', async () => {
    const fresh = createHarness(), r = fresh.evaluate, summary = [];
    for (const brand of registry.brands) for (const scope of Object.keys(brand.perScopeFamily).filter(scope=>scope!==brand.defaultScope)) {
      await fresh.select(brand.industryId,brand.brandId,scope);
      assert.equal(r('Y.loadError'),null,brand.brandId+'/'+scope);
      assert.deepEqual(plain(r('criteriaErrors(Y.criteria)')),[],brand.brandId+'/'+scope);
      assert.equal(r('Y.criteria.supplyMode'),'relative');
      assert.equal(r('Y.criteria.seedPresetId'),brand.perScopeFamily[scope]);
      assert.equal(r('Y.criteria.supplyCalibration.scope'),scope);
      assert.equal(r('Y.criteria.supplyCalibration.brandId'),brand.brandId);
      const result = plain(r('(()=>{const t=AREAS.map(a=>YolkRelativeSupply.countThresholds(a,Y.criteria));return {total:t.length,valid:t.filter(x=>x.valid).length,invalid:t.filter(x=>!x.valid).length,bad:t.filter(x=>x.valid&&(!Number.isFinite(x.own)||x.own<=0||!Number.isFinite(x.competitor)||x.competitor<=0)).length}})()'));
      assert.equal(result.total,7954); assert.equal(result.bad,0); assert.equal(r('Y.events.length'),0);
      summary.push({brand:brand.brandId,scope,family:brand.perScopeFamily[scope],...result});
    }
    observations.alternateScopes=summary;
    assert.deepEqual(plain(r('Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,[1,50,75,90,95,99].map(p=>cutoff(m.id,p))]))')),nationalCuts);
  });

  const result = {version:'1.7',builtAt:new Date().toISOString(),source:'actual production relative-supply.js/model.js/industry-workspace.js with national source inventory',passed:checks.every(c=>c.passed),checkCount:checks.length,elapsedMs:Date.now()-started,checks,observations};
  const receipt = path.join(repo,'..','deliverables','yolk-v1.9.0','relative-supply-regression-results.json');
  fs.mkdirSync(path.dirname(receipt),{recursive:true}); fs.writeFileSync(receipt,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,checks:checks.map(({name,passed,error})=>({name,passed,...(error?{error}: {})})),elapsedMs:result.elapsedMs,receipt},null,2));
  process.exitCode = result.passed ? 0 : 1;
})().catch(error=>{console.error(error.stack||error);process.exitCode=1});
