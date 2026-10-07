/* Yolk v1.7: brand seeds are hypotheses; source inventory and saved work stay authoritative. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), prototype = path.join(root, 'prototype');
const readJSON = name => JSON.parse(fs.readFileSync(path.join(prototype, name), 'utf8'));
const context = readJSON('data/real/area-context.json');
const profiles = JSON.parse(fs.readFileSync(path.join(root, 'contracts/industry-profiles.json'), 'utf8')).profiles;
const registry = readJSON('data/brand-presets.v1.7.json');
const logoPath = path.join(prototype, 'data/brand-logos.v1.7.json');
const logos = fs.existsSync(logoPath) ? JSON.parse(fs.readFileSync(logoPath, 'utf8')) : {entries: []};
const sourceSupply = Object.fromEntries(['fuel', 'grocery', 'nonbank'].map(id => [id, readJSON('data/real/' + id + '-supply.json')]));
const sourceScopes = readJSON('data/real/nonbank-company-scopes.json');
const sourceBounds = readJSON('data/real/nonbank-assignment-bounds.json');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const expectedIds = {
  fuel: ['ptt', 'shell', 'bangchak', 'caltex', 'cosmo', 'pt', 'pure', 'siam-gas', 'susco', 'unique-gas', 'world-gas'],
  grocery: ['SEVEN_ELEVEN', 'TOOGDEE', 'LOTUSS', 'CJ_MORE', 'BIG_C', 'TOPS', 'MAKRO', 'LAWSON108', 'VILLA_MARKET', 'MAXVALU', 'FOODLAND', 'GOURMET_MARKET', 'GO_WHOLESALE', 'DONKI', 'RIMPING', 'FUJI'].map(id => 'grocery-brand:' + id),
  nonbank: ['0107557000195', '0105559126747', '0105564161598', '0107563000355', '0107559000290', '0107566000542', '0107564000120', '0505560008015', '0107538000690', '0105528033194'].map(id => 'legal:' + id)
};

function harness(savedWrites = new Map()) {
  const writes = new Map(savedWrites), documentListeners = new Map(), requests = [];
  let renderCount = 0;
  const metricPosition = context.metrics.findIndex(m => m.id === 'population');
  const areas = context.rows.map((row, index) => ({
    id: row[0], th: row[1], en: row[1], province: row[2], geoType: row[3] === 'SUBDISTRICT' ? 'khwaeng' : 'local_authority',
    areaKm2: row[4], extent3857: row[6], sourceRank: index,
    metrics: Object.fromEntries(context.metrics.map((metric, i) => [metric.id, row[8][i]])),
    population: row[8][metricPosition], supply: {own: null, competitor: null, unverified: null},
    mapContext: {boundaryStatus: 'missing', extent3857: row[6], pois: []}
  }));
  const runtime = {
    metricCatalog: structuredClone(context.metrics), profiles: structuredClone(profiles),
    brandPresets: structuredClone(registry), brandLogos: structuredClone(logos),
    supplyCache: new Map(Object.entries(structuredClone(sourceSupply))), pointCache: new Map(),
    companyScopes: structuredClone(sourceScopes), assignmentBounds: structuredClone(sourceBounds), revision: 0
  };
  const window = {
    YOLK_RUNTIME: runtime, YOLK_PROVINCES: [],
    YOLK_DEMO_DATA: {metadata: {thresholds: {}, poiSampleAreaIds: [areas[0].id]}, areas, pois: []},
    addEventListener() {}, matchMedia: () => ({addEventListener() {}}), innerWidth: 1440
  };
  const sandbox = vm.createContext({
    console, structuredClone, crypto, window,
    localStorage: {getItem: key => writes.get(key) || null, setItem: (key, value) => writes.set(key, value)},
    location: {hash: '#market'},
    document: {addEventListener: (name, handler) => {
      if (!documentListeners.has(name)) documentListeners.set(name, []);
      documentListeners.get(name).push(handler);
    }, getElementById: () => null},
    uiIcon: name => '<i data-test-icon="' + name + '"></i>', notify() {},
    render() {renderCount++;},
    fetch: async name => {
      requests.push(name);
      // These are local test responses. License data and all supply datasets are already cached.
      const pointMatch = /^data\/real\/(fuel|grocery|nonbank)-points\.json$/.exec(name);
      if (pointMatch) {
        const data = readJSON(name);
        return {ok: true, json: async () => ({...data, records: data.records.slice(0, 3)})};
      }
      if (name === 'data/real/nonbank-bkk-membership.json') return {ok: true, json: async () => readJSON(name)};
      throw new Error('Unexpected fetch: ' + name);
    }
  });
  for (const file of ['icons.js', 'metrics.js', 'model.js', 'brand-experience.js', 'industry-workspace.js', 'location-map.js']) {
    vm.runInContext(fs.readFileSync(path.join(prototype, file), 'utf8'), sandbox, {filename: file});
    // A browser's global object is window; this VM deliberately has a separate, small window stub.
    if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands;
  }
  const evaluate = code => vm.runInContext(code, sandbox);
  const select = (industry, brand, scope) => {
    sandbox.testSelection = {industry, brand, scope};
    return evaluate('selectIndustryContext(testSelection.industry,testSelection.brand,testSelection.scope)');
  };
  return {sandbox, runtime, writes, requests, documentListeners, evaluate, select, renderCount: () => renderCount};
}

const checks = [], observations = {}, start = Date.now();
async function check(name, test) {
  const at = Date.now();
  try {await test(); checks.push({name, passed: true, elapsedMs: Date.now() - at});}
  catch (error) {checks.push({name, passed: false, error: String(error.stack || error), elapsedMs: Date.now() - at});}
}

(async () => {
  const h = harness(), run = h.evaluate;
  const supplyHashes = Object.fromEntries(Object.entries(sourceSupply).map(([id, data]) => [id, digest(data)]));
  const scopeHash = digest(h.runtime.companyScopes);
  const nationalBefore = plain(run('Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,[75,90,95,99].map(p=>cutoff(m.id,p))]))'));

  await check('Registry and selectors expose exactly 11 Fuel, 16 Grocery and the ordered first 10 Non-bank IDs', () => {
    assert.equal(registry.brands.length, 37);
    assert.equal(new Set(registry.brands.map(b => b.brandId)).size, 37);
    for (const industry of ['fuel', 'grocery', 'nonbank']) {
      assert.deepEqual(registry.brands.filter(b => b.industryId === industry).map(b => b.brandId), expectedIds[industry]);
      assert.deepEqual(plain(h.sandbox.window.YolkBrands.visibleBrands(industry, h.runtime.supplyCache.get(industry).brands)).map(b => b.id), expectedIds[industry]);
    }
    assert.deepEqual(sourceSupply.nonbank.brands.slice(0, 10).map(b => b.id), expectedIds.nonbank);
    assert(sourceSupply.nonbank.brands.slice(0, 9).every((b, i) => b.sourceRowCount >= sourceSupply.nonbank.brands[i + 1].sourceRowCount));
    assert.equal(h.runtime.supplyCache.get('nonbank').brands.length, 1233);
  });

  await check('Every family and every supported brand/scope seed is valid and references actual CityMETER metrics', () => {
    const sourceIds = new Set(registry.sourceRefs.map(source => source.id));
    const actualMetrics = new Set(context.metrics.map(metric => metric.id));
    for (const family of registry.families) {
      h.sandbox.testFamily = family;
      const errors = plain(run('criteriaErrors(normalizeCriteria({...presetCriteria(testFamily.industryId),...structuredClone(testFamily.criteriaOverrides)},{existing:false}))'));
      assert.deepEqual(errors, [], family.id + ': ' + errors.join(','));
      assert((family.sourceIds || []).every(id => sourceIds.has(id)), family.id + ': missing source reference');
    }
    for (const brand of registry.brands) {
      assert(h.runtime.supplyCache.get(brand.industryId).brands.some(row => row.id === brand.brandId));
      assert(Object.hasOwn(brand.perScopeFamily, brand.defaultScope), brand.brandId + ': default has no family');
      for (const [scope, familyId] of Object.entries(brand.perScopeFamily)) {
        const family = registry.families.find(f => f.id === familyId);
        assert.equal(family?.industryId, brand.industryId, brand.brandId + '/' + scope);
        h.sandbox.testBrand = brand; h.sandbox.testScope = scope;
        const criteria = plain(run('YolkBrands.seed(presetCriteria(testBrand.industryId),testBrand.industryId,testBrand.brandId,testScope)'));
        h.sandbox.testCriteria = criteria;
        assert.deepEqual(plain(run('criteriaErrors(testCriteria)')), [], brand.brandId + '/' + scope);
        assert.equal(criteria.cohortMode, 'national');
        assert(plain(run('enabledMetricIds(testCriteria)')).every(id => actualMetrics.has(id)));
        if (brand.industryId === 'grocery') {
          const key = scope + ':' + brand.brandId.split(':')[1];
          assert(sourceSupply.grocery.rows.some(row => Object.hasOwn(row[2] || {}, key)), brand.brandId + ': unsupported source format ' + scope);
        }
      }
    }
    observations.familyCount = registry.families.length;
  });

  await check('First selection applies each brand default/family without recording a team change event', async () => {
    for (const brand of registry.brands) {
      await h.select(brand.industryId, brand.brandId);
      assert.equal(run('Y.loadError'), null, brand.brandId);
      assert.equal(run('Y.ownBrandId'), brand.brandId);
      assert.equal(run('Y.supplyScope'), brand.defaultScope, brand.brandId);
      assert.equal(run('Y.criteria.seedPresetId'), brand.defaultFamilyId, brand.brandId);
      assert.equal(run('Y.criteria.seedVersion'), registry.version);
      assert.equal(run('Y.criteria.version'), 1);
      assert.equal(run('Y.criteria.cohortMode'), 'national');
      assert.equal(run('Y.events.length'), 0);
      assert.equal(run('ownScopeAvailable()'), true, brand.brandId + ': own default is unsupported');
    }
    assert(h.renderCount() >= 74, 'Async selection must render pending and ready states');
    assert.deepEqual(h.requests, [], 'Selecting cached context must not fetch license data or POIs');
  });

  await check('Legacy registry fallback keeps accepted numeric defaults when current strategy profiles are absent', () => {
    for (const industry of ['fuel', 'grocery', 'nonbank']) {
      h.sandbox.testIndustry = industry;
      const criteria = plain(run('(()=>{const p=PROFILE_BY_ID[testIndustry];return YolkBrands.seed(presetCriteria(testIndustry),testIndustry,p.defaultOwnBrandId,p.defaultScope)})()'));
      assert.equal(criteria.strategyProfileVersion, null, 'Absent current profiles must be explicit, not invented');
      delete criteria.seedPresetId; delete criteria.seedVersion; delete criteria.strategyProfileVersion;
      assert.deepEqual(criteria, plain(run('presetCriteria(testIndustry)')));
    }
    assert.deepEqual(registry.families.find(f => f.id === 'nonbank-community').criteriaOverrides, {});
    assert.equal(registry.brands.find(b => b.brandId === 'grocery-brand:LOTUSS').defaultScope, 'HYPERMARKET');
    assert.equal(registry.brands.find(b => b.brandId === 'grocery-brand:BIG_C').defaultScope, 'HYPERMARKET');
    assert.equal(registry.brands.find(b => b.brandId === 'grocery-brand:TOPS').defaultScope, 'SUPERMARKET');
  });

  await check('Saved custom criteria, draft, versions, weights and targets survive brand visits and browser reload', async () => {
    await h.select('nonbank', 'legal:0107557000195');
    run('Y.criteria.version=17;Y.criteria.rankingMode="weighted";Y.criteria.rankingWeights={demand:51,ownGap:37,competitorGap:12};Y.criteria.metricWeights.adult_population_20_64=83;Y.criteria.ownMany=7;Y.criteria.paths[0].all[0].percentile=81;draft=structuredClone(Y.criteria);draft.metricWeights.adult_population_20_64=27;draft.paths[0].all[0].percentile=78;draft.competitorMany=9;draftBase=17;Y.targets={[AREAS[0].id]:{status:"shortlisted",note:"Preserve this work"}};stashContext()');
    const expected = plain(run('({criteria:Y.criteria,draft,draftBase,targets:Y.targets})'));
    assert.deepEqual(plain(run('criteriaErrors(Y.criteria)')), []);
    assert.deepEqual(plain(run('criteriaErrors(draft)')), []);
    await h.select('grocery', 'grocery-brand:LOTUSS');
    await h.select('fuel', 'ptt');
    await h.select('nonbank', 'legal:0107557000195');
    assert.deepEqual(plain(run('({criteria:Y.criteria,draft,draftBase,targets:Y.targets})')), expected);
    assert.equal(run('Y.events.length'), 0);
    run('stashContext()');
    const reloaded = harness(h.writes);
    assert.deepEqual(plain(reloaded.evaluate('({criteria:Y.criteria,draft,draftBase,targets:Y.targets})')), expected);
    assert.equal(reloaded.evaluate('Y.events.length'), 0);
  });

  await check('Explicit Grocery format is remembered per brand; a new brand uses its own default', async () => {
    await h.select('grocery', 'grocery-brand:LOTUSS', 'SUPERMARKET');
    run('Y.criteria.version=8;Y.criteria.ownMany=6;draft=structuredClone(Y.criteria);draft.competitorMany=7;draftBase=8;stashContext()');
    const expected = plain(run('({criteria:Y.criteria,draft,draftBase})'));
    await h.select('grocery', 'grocery-brand:CJ_MORE');
    assert.equal(run('Y.supplyScope'), 'C_STORE');
    assert.equal(run('Y.criteria.seedPresetId'), 'grocery-community');
    await h.select('grocery', 'grocery-brand:BIG_C');
    assert.equal(run('Y.supplyScope'), 'HYPERMARKET', 'Lotus Supermarket must not become Big C default');
    await h.select('grocery', 'grocery-brand:LOTUSS');
    assert.equal(run('Y.supplyScope'), 'SUPERMARKET');
    assert.deepEqual(plain(run('({criteria:Y.criteria,draft,draftBase})')), expected);
    await h.select('grocery', 'grocery-brand:LOTUSS', 'HYPERMARKET');
    assert.equal(run('Y.criteria.seedPresetId'), 'grocery-hypermarket');
    assert.equal(run('Y.criteria.ownMany'), 1, 'Previously edited Supermarket criteria must not enter Hypermarket context');
    await h.select('grocery', 'grocery-brand:LOTUSS', 'SUPERMARKET');
    assert.deepEqual(plain(run('({criteria:Y.criteria,draft,draftBase})')), expected);
  });

  await check('National cutoff distributions remain fixed across all brand seeds, formats and province filters', async () => {
    run('Y.province="10"');
    const after = plain(run('Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,[75,90,95,99].map(p=>cutoff(m.id,p))]))'));
    assert.deepEqual(after, nationalBefore);
    assert.equal(run('AREAS.length'), 7954);
    assert.equal(run('METRICS.length'), 25);
    assert(run('Object.values(DISTRIBUTIONS).every(values=>values.every(v=>Number.isFinite(v)&&v>=0))'));
    observations.nationalCutoffs = after;
  });

  await check('Missing demand, unavailable own format and unresolved licenses stay unknown rather than zero', async () => {
    await h.select('nonbank', 'legal:0107557000195');
    assert.equal(run('(()=>{const a=structuredClone(AREAS[0]);a.metrics.adult_population_20_64=null;a.metrics.adult_population_20_64_per_km2=null;return pathTier(a,Y.criteria,"primary").high})()'), null);
    assert.equal(run('normalizeMetricValue(null)'), null);
    assert.equal(run('normalizeMetricValue(-1)'), null);
    assert.equal(run('normalizeMetricValue(0)'), 0);
    assert.equal(run('selectedScopeIncludes("unresolved-test-company")'), null);
    const bound = plain(run('calculateSupply([AREAS[0].id,"source_row_present",{"unresolved-test-company":3},3,"test"],AREAS[0])'));
    assert.equal(bound.competitorLower, 0);
    assert(bound.competitorUpper >= 3);
    assert.equal(bound.unknownLicense, 3);
    await h.select('grocery', 'grocery-brand:MAKRO', 'C_STORE');
    assert.equal(run('ownScopeAvailable()'), false);
    assert(run('AREAS.every(a=>a.supply.own===null&&a.supply.ownScopeUnavailable)'));
  });

  await check('Srisawad group logo and office context do not upgrade the selected legal company licenses', async () => {
    await h.select('nonbank', 'legal:0105559126747');
    assert.equal(run('Y.supplyScope'), 'office_context');
    assert.equal(run('selectedScopeIncludes("0105559126747")'), true);
    assert(run('AREAS.some(a=>a.supply.own>0)'));
    await h.select('nonbank', 'legal:0105559126747', 'potential_retail_branch_service');
    assert.equal(run('selectedScopeIncludes("0105559126747")'), false);
    assert.equal(run('ownScopeAvailable()'), false);
    assert(run('AREAS.every(a=>a.supply.own===null&&a.supply.ownScopeUnavailable)'));
    assert.equal(digest(h.runtime.companyScopes), scopeHash);
    assert(h.runtime.companyScopes['0105559126747'].licenses.every(([, status]) => status !== 'active'));
  });

  await check('Own selector restriction leaves the full 1,233-company comparator inventory intact', async () => {
    await h.select('nonbank', 'legal:0105559126747', 'office_context');
    assert.equal(h.runtime.supplyCache.get('nonbank').brands.length, 1233);
    const peersBeyondSelector = sourceSupply.nonbank.brands.slice(10);
    assert.equal(peersBeyondSelector.length, 1223);
    const beyondIds = new Set(peersBeyondSelector.map(b => b.id.replace(/^legal:/, '')));
    const row = sourceSupply.nonbank.rows.find(row => row[1] === 'source_row_present' && Object.keys(row[2] || {}).some(id => beyondIds.has(id) && row[2][id] > 0));
    assert(row, 'The fixture needs a comparator beyond the first ten');
    h.sandbox.testSupplyRow = row;
    const actual = plain(run('calculateSupply(testSupplyRow,AREA_INDEX.get(testSupplyRow[0]))'));
    assert.equal(actual.competitorLower, Object.entries(row[2]).filter(([id]) => id !== '0105559126747').reduce((sum, [, count]) => sum + count, 0));
    assert(Object.entries(row[2]).some(([id, count]) => beyondIds.has(id) && count > 0));
    for (const industry of ['fuel', 'grocery', 'nonbank']) assert.equal(digest(h.runtime.supplyCache.get(industry)), supplyHashes[industry]);
  });

  await check('Point loading uses a local response stub and canonical relation changes with selected own identity', async () => {
    await h.select('grocery', 'grocery-brand:SEVEN_ELEVEN');
    await run('ensureSourcePoints()');
    assert.equal(run('Y.pointState'), 'ready');
    assert(run('Y.pois.every(p=>p.sourceRecord&&p.industryId==="grocery")'));
    assert.equal(run('pointRelation({brandId:"grocery-brand:SEVEN_ELEVEN"})'), 'own');
    assert.equal(run('pointRelation({brandId:"grocery-brand:CJ_MORE"})'), 'competitor');
    await h.select('grocery', 'grocery-brand:CJ_MORE');
    assert.equal(run('pointRelation({brandId:"grocery-brand:SEVEN_ELEVEN",relation:"own",localOverlay:true})'), 'competitor');
    assert.equal(run('pointRelation({brandId:"grocery-brand:CJ_MORE",relation:"competitor"})'), 'own');
    assert.deepEqual(h.requests, ['data/real/grocery-points.json']);
    assert.equal(digest(h.runtime.supplyCache.get('grocery')), supplyHashes.grocery);
  });

  await check('Actual map render pairs DS shield/swords with own/competitor captions in both languages', () => {
    const area = {id: 'qa-map', demand: true, mapContext: {boundaryStatus: 'missing', pois: [
      {id: 'own', area: 'qa-map', name: 'Our branch', relation: 'own', lat: 13.75, lng: 100.5},
      {id: 'peer', area: 'qa-map', name: 'Peer branch', relation: 'competitor', lat: 13.76, lng: 100.51}
    ]}};
    for (const language of ['th', 'en']) {
      const html = h.sandbox.window.YolkLocationMap.render(area, [], language);
      const ownCue = 'yl-map-key yl-key-own" aria-hidden="true">' + h.sandbox.window.YolkIcons.icon('shield');
      const peerCue = 'yl-map-key yl-key-competitor" aria-hidden="true">' + h.sandbox.window.YolkIcons.icon('swords');
      assert(html.includes(ownCue));
      assert(html.includes(peerCue));
      assert(!html.includes('yl-map-key yl-key-own" aria-hidden="true">O</span>'));
      assert(!html.includes('yl-map-key yl-key-competitor" aria-hidden="true">C</span>'));
      assert(html.includes(language === 'en' ? 'Our stores' : 'สาขาเรา'));
      assert(html.includes(language === 'en' ? 'Competitors' : 'คู่แข่ง'));
    }
  });

  await check('Optional local logo registry uses exact known IDs and its bundled bytes match recorded hashes', () => {
    if (!fs.existsSync(logoPath)) {observations.logoRegistry = 'not_present_optional'; return;}
    assert.equal(logos.entries.length, 37);
    assert.equal(new Set(logos.entries.map(l => l.brandId)).size, 37);
    for (const entry of logos.entries) {
      assert(registry.brands.some(b => b.brandId === entry.brandId), entry.brandId);
      const html = h.sandbox.window.YolkBrands.logo(entry.brandId);
      if (entry.verifiedSquareGraphic !== true) {
        assert(!html.includes('<img'), entry.brandId + ': unresolved compact graphic must use named neutral fallback');
        continue;
      }
      assert(entry.localPath, entry.brandId + ': verified graphic needs a bundled original');
      const asset = path.resolve(prototype, entry.localPath);
      assert(asset.startsWith(prototype + path.sep), 'Asset escaped prototype directory');
      assert(fs.existsSync(asset), entry.brandId + ': missing local asset');
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex'), entry.sha256, entry.brandId);
      assert(html.includes(entry.localPath) && html.includes(entry.sha256.slice(0, 12)));
    }
    observations.logoRegistry = {entries: logos.entries.length, verifiedCompactGraphics: logos.entries.filter(l => l.verifiedSquareGraphic === true).length, namedFallbacks: logos.entries.filter(l => l.verifiedSquareGraphic !== true).length};
  });

  const report = {
    schemaVersion: 1, test: 'check-brand-presets', testedAt: new Date().toISOString(), version: registry.version,
    passed: checks.every(result => result.passed), elapsedMs: Date.now() - start,
    runtime: {node: process.version, areaCount: context.rows.length, metricCount: context.metrics.length, selectorCount: registry.brands.length, nonbankComparatorCompanies: sourceSupply.nonbank.brands.length},
    scope: 'Local VM regression using actual model, industry-workspace, brand-experience, map render and source snapshots; DOM layout and browser theme readability are outside this test.',
    inputHashes: {brandPresets: digest(registry), brandLogos: digest(logos), sourceSupply: supplyHashes, companyScopes: scopeHash},
    checks, observations
  };
  const destination = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(root, '../deliverables/yolk-v1.9.0/brand-preset-regression-results.json');
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
  for (const result of checks) console.log((result.passed ? 'PASS ' : 'FAIL ') + result.name + (result.passed ? '' : '\n' + result.error));
  console.log(JSON.stringify({passed: report.passed, checks: checks.length, elapsedMs: report.elapsedMs, report: destination}));
  if (!report.passed) process.exitCode = 1;
})().catch(error => {console.error(error); process.exitCode = 1;});
