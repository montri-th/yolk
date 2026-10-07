/* Actual Strategy UI + real CityMETER VM/source checks. This is not a visual or production-backend test. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fileHash = name => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex');
const checks = [], observations = {};
async function check(name, fn) {
  try { await fn(); checks.push({name, passed: true}); console.log('PASS', name); }
  catch (error) { checks.push({name, passed: false, error: String(error.stack || error)}); console.error('FAIL', name, error.message); }
}
function harness(savedWrites = new Map()) {
  // Reuse source adapters, model and identity seeds rather than reconstructing their arithmetic.
  let fixture = read('scripts/check-brand-presets.cjs').split('(async () => {')[0];
  fixture = fixture.replace('const runtime = {', 'const runtime = { strategyProfiles: structuredClone(readJSON("data/brand-strategy-profiles.v1.9.0.json")), metadata: structuredClone(context.metadata),');
  fixture = fixture.replace("'model.js', 'brand-experience.js'", "'model.js', 'relative-supply.js', 'brand-experience.js', 'demand-factors.js'");
  fixture = fixture.replace("if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands;", "if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands; if (file === 'relative-supply.js') sandbox.YolkRelativeSupply = window.YolkRelativeSupply;");
  const make = Function('require', '__dirname', fixture + '\nreturn harness;')(require, __dirname);
  const h = make(savedWrites), global = h.sandbox.window;
  h.runtime.sourceHashes = Object.fromEntries(['area-context', 'fuel-supply', 'grocery-supply', 'nonbank-supply'].map(id => [id, fileHash('prototype/data/real/' + id + '.json')]));
  h.sandbox.document.querySelector = () => null;
  h.sandbox.testScopeIds = null;
  h.sandbox.committedCount = 0;
  h.sandbox.committed = () => {h.sandbox.committedCount++;};
  // The navigation integration has its own browser/Leaflet suite. Here the actual UI receives a scoped predicate.
  h.sandbox.inMapArea = area => !h.sandbox.testScopeIds || h.sandbox.testScopeIds.has(area.id);
  const numLine = read('prototype/app.js').split('\n').find(line => line.startsWith('const num='));
  vm.runInContext(numLine, h.sandbox);
  for (const name of ['decision-ui.js', 'opportunity-engine.js', 'strategy-ui.js']) {
    vm.runInContext(read('prototype/' + name), h.sandbox, {filename: name});
    if (name === 'decision-ui.js') h.sandbox.YolkDecisions = global.YolkDecisions;
  }
  return {...h, ui: global.YolkStrategyUI, api: global.YolkOpportunity, icons: global.YolkIcons};
}
function selectStrategyChange(h, id, checked) {
  const input = {checked, dataset: {strategyId: id}, matches: selector => selector === '[data-strategy-id]'};
  h.documentListeners.get('change').at(-1)({target: input});
  return input;
}
function clickStrategy(h, action, id, disabled = false) {
  const button = {disabled, dataset: {strategyAction: action, id}};
  h.documentListeners.get('click').at(-1)({target: {closest: () => button}});
}
function renderedCards(html) {
  return [...html.matchAll(/<label class="strategy-choice[\s\S]*?<\/label>/g)].map(match => match[0]);
}
function countText(html, caption) {
  const match = [...html.matchAll(/<div><strong>([^<]*)<\/strong><span>([^<]*)<\/span><\/div>/g)].find(match => match[2] === caption);
  assert(match, 'Missing readable counter: ' + caption);
  return Number(match[1].replace(/,/g, ''));
}

(async () => {
  const h = harness(), run = h.evaluate;
  await h.select('grocery', 'grocery-brand:SEVEN_ELEVEN');
  run('Y.route="strategy";Y.lang="en";draft=structuredClone(Y.criteria)');

  await check('Actual eight strategy cards emit eight meaningful allowed DS glyphs and readable labels', () => {
    const cards = renderedCards(h.ui.page()), ids = plain(h.api.strategies().map(s => s.id));
    const expected = ['explore', 'groups', 'swords', 'store', 'layers', 'arrow_forward', 'shield', 'flag'];
    assert.equal(cards.length, 8);
    cards.forEach((card, index) => {
      assert(card.includes('data-strategy-id="' + ids[index] + '"'));
      assert(card.includes('data-yolk-glyph="' + expected[index] + '"'));
      assert(h.icons.glyphs.includes(expected[index]));
      assert(card.includes(h.api.strategies()[index].name.en));
    });
    assert.equal(new Set(expected).size, 8);
    assert(!cards.some(card => card.includes('data-test-icon')));
  });

  await check('All profile choices map to current brands/scopes, operator claims and reachable source IDs', () => {
    const registry = h.runtime.strategyProfiles, sources = new Map(registry.sources.map(s => [s.id, s]));
    assert.equal(registry.version, '1.9.0');
    assert.equal(registry.brands.length, 37);
    for (const b of registry.brands) {
      assert(b.positioning.operatorClaim.th && b.positioning.operatorClaim.en);
      assert.equal(b.positioning.consumerPerceptionStatus, 'not_measured');
      assert(b.sourceIds.every(id => sources.has(id)));
      assert(b.defaultStrategyIds.length >= 1 && b.defaultStrategyIds.length <= 3);
      for (const p of Object.values(b.perScopeProfiles)) {
        assert(p.defaultStrategyIds.length >= 1 && p.defaultStrategyIds.length <= 3);
        assert(p.factorPresets.filter(f => f.enabled).length <= 3);
      }
    }
    const html = h.ui.brandPanel();
    assert(html.includes('operator positioning') || html.includes('Operator positioning'));
    assert(html.includes('not measured consumer perception'));
    assert(html.includes('rel="noopener noreferrer"'));
    for (const id of h.ui.profile().sourceIds) assert(html.includes(sources.get(id).url.replace(/&/g, '&amp;')));
  });

  await check('Strategy preferences initialize from the current brand/format profile, not another brand', () => {
    assert.deepEqual(plain(h.ui.selectedIds()), plain(h.ui.scopeProfile().defaultStrategyIds));
    assert.equal(h.ui.profile().brandId, run('Y.ownBrandId'));
    assert.equal(h.ui.scopeProfile().scopeId, run('Y.supplyScope'));
  });

  await check('Selection rejects zero, four, duplicate and unknown strategies without changing saved criteria', () => {
    const before = run('JSON.stringify({criteria:Y.criteria,draft,events:Y.events})');
    const selected = plain(h.ui.selectedIds());
    for (const ids of [[], ['network_infill', 'network_infill'], ['mystery'], h.api.strategies().slice(0, 4).map(s => s.id)]) {
      assert.equal(h.ui.setSelected(ids), false); assert.deepEqual(plain(h.ui.selectedIds()), selected);
    }
    assert.equal(run('JSON.stringify({criteria:Y.criteria,draft,events:Y.events})'), before);
  });

  await check('A fourth checkbox is disabled; attempting it restores the checkbox and preserves the personal view', () => {
    h.ui.setSelected(['underserved_market', 'competitive_entry', 'network_infill']);
    assert.equal(renderedCards(h.ui.page()).filter(card => /<input[^>]* disabled/.test(card)).length, 5);
    const input = selectStrategyChange(h, 'segment_gap', true);
    assert.equal(input.checked, false);
    assert.deepEqual(plain(h.ui.selectedIds()), ['underserved_market', 'competitive_entry', 'network_infill']);
  });

  await check('Strategy change events update only local preferences and rerender without adding team activity', () => {
    const events = run('Y.events.length'), before = run('JSON.stringify(Y.criteria)'), renders = h.renderCount();
    selectStrategyChange(h, 'network_infill', false);
    assert.deepEqual(plain(h.ui.selectedIds()), ['underserved_market', 'competitive_entry']);
    assert.equal(run('Y.events.length'), events);
    assert.equal(run('JSON.stringify(Y.criteria)'), before);
    assert.equal(h.renderCount(), renders + 1);
    assert([...h.writes].some(([key, value]) => key.startsWith('yolk-strategies:') && JSON.parse(value).length === 2));
  });

  await check('Strategy preferences survive browser reload and remain isolated between Grocery formats', async () => {
    h.ui.setSelected(['network_infill']);
    run('stashContext()');
    const reloaded = harness(h.writes); reloaded.evaluate('Y.route="strategy";Y.lang="en"');
    assert.deepEqual(plain(reloaded.ui.selectedIds()), ['network_infill']);
    await h.select('grocery', 'grocery-brand:LOTUSS', 'HYPERMARKET');
    assert.deepEqual(plain(h.ui.selectedIds()), plain(h.ui.scopeProfile().defaultStrategyIds));
    h.ui.setSelected(['segment_gap']);
    await h.select('grocery', 'grocery-brand:LOTUSS', 'SUPERMARKET');
    assert.deepEqual(plain(h.ui.selectedIds()), plain(h.ui.scopeProfile().defaultStrategyIds));
    await h.select('grocery', 'grocery-brand:LOTUSS', 'HYPERMARKET');
    assert.deepEqual(plain(h.ui.selectedIds()), ['segment_gap']);
    await h.select('grocery', 'grocery-brand:SEVEN_ELEVEN');
    assert.deepEqual(plain(h.ui.selectedIds()), ['network_infill']);
  });

  for (const [industry, brand] of [['fuel', 'bangchak'], ['grocery', 'grocery-brand:SEVEN_ELEVEN'], ['nonbank', 'legal:0107557000195']]) {
    await h.select(industry, brand); run('Y.route="strategy";draft=structuredClone(Y.criteria)');
    h.ui.setSelected(['underserved_market', 'competitive_entry', 'network_infill']);
    const baseline = run('JSON.stringify({rows:evaluate(draft),criteria:Y.criteria,draft,events:Y.events})');
    const rows = run('evaluate(draft)'), current = h.ui.currentView(rows);
    observations[industry] = {nationalRows: rows.length, demandEligible: current.demandEligibleCount, candidates: current.opportunityViewCount, incomplete: current.evidenceIncompleteCount};
    await check(industry + ': all strategy views preserve national Demand membership, tiers, source and team revisions', () => {
      const ids = rows.filter(a => a.eligible).map(a => a.id);
      for (const strategy of h.api.strategies()) {
        h.ui.setSelected([strategy.id]); const view = h.ui.currentView(rows);
        assert.equal(view.demandEligibleCount, ids.length);
        assert(view.rows.every(item => ids.includes(item.row.id)));
        assert.equal(run('JSON.stringify({rows:evaluate(draft),criteria:Y.criteria,draft,events:Y.events})'), baseline);
      }
      h.ui.setSelected(['underserved_market', 'competitive_entry', 'network_infill']);
    });
    await check(industry + ': map projection filters candidates without repainting or mutating original Demand tiers', () => {
      const before = hash(rows), projected = h.ui.mapRows(rows), ids = new Set(h.ui.currentView(rows).rows.map(item => item.row.id));
      assert.equal(hash(rows), before);
      assert.equal(projected.length, 7954);
      projected.forEach((a, i) => {
        assert.equal(a.strategyCandidate, ids.has(a.id)); assert.equal(a.eligible, ids.has(a.id));
        assert.equal(a.qualifyingTier, rows[i].qualifyingTier); assert.equal(a.demand, rows[i].demand);
      });
    });
    await check(industry + ': actual page counters, strategy-card counts and result cards agree within an administrative scope', () => {
      const scoped = rows.filter(a => a.province === '10'); h.sandbox.testScopeIds = new Set(scoped.map(a => a.id));
      run('Y.lang="en"'); const html = h.ui.page(), view = h.ui.currentView(rows);
      assert.equal(countText(html, 'Demand-qualified in this scope'), scoped.filter(a => a.eligible).length);
      const candidateCount = view.rows.filter(item => h.sandbox.testScopeIds.has(item.row.id)).length;
      assert.equal(countText(html, 'Strategy research candidates'), candidateCount);
      assert(h.ui.mapSummary().includes(' · ' + new Intl.NumberFormat('en-GB').format(candidateCount) + ' areas to investigate'));
      for (const card of renderedCards(html).filter(card => card.includes('areas to investigate in this scope'))) {
        const id = /data-strategy-id="([^"]+)"/.exec(card)[1];
        const expected = h.api.view(scoped, h.ui.criteria(), {industryId: industry, ownBrandId: brand, supplyScope: run('Y.supplyScope')}, h.ui.profile(), {strategyIds: [id]}).opportunityViewCount;
        assert(card.includes('<small>' + new Intl.NumberFormat('en-GB').format(expected) + ' areas to investigate in this scope</small>'));
      }
      const renderedIds = [...html.matchAll(/data-strategy-action="save" data-id="([^"]+)"/g)].map(m => m[1]);
      assert(renderedIds.length <= 6); assert(renderedIds.every(id => h.sandbox.testScopeIds.has(id)));
      h.sandbox.testScopeIds = null;
    });
  }

  await h.select('grocery', 'grocery-brand:SEVEN_ELEVEN');
  run('Y.route="strategy";Y.lang="en";draft=structuredClone(Y.criteria)');
  h.ui.setSelected(['segment_gap', 'cluster_participation', 'future_entry']);
  await check('Evidence-only strategies show a survey guide and empty candidate state, never a fabricated match', () => {
    const view = h.ui.currentView(), html = h.ui.page();
    assert.equal(view.opportunityViewCount, 0);
    assert(html.includes('No supported candidate for this view yet'));
    assert(html.includes('Survey guide · additional data needed'));
    assert(html.includes('future-market watchlist and never adds to current Yolks'));
    assert(!html.includes('data-strategy-action="save"'));
  });

  h.ui.setSelected(['underserved_market', 'competitive_entry', 'network_infill']);
  const candidate = h.ui.currentView().rows[0]?.row;
  assert(candidate, 'The sourced Grocery starter must produce a research candidate');
  h.sandbox.testAreaId = candidate.id;
  await check('Shortlist snapshot captures exact criteria, scope, actual source hashes, evidence states and first tasks', () => {
    const plan = plain(h.ui.snapshot(candidate.id));
    assert.equal(plan.reportingAreaId, candidate.id);
    assert.equal(plan.notInvestmentApproval, true);
    assert.equal(plan.context.industryId, 'grocery'); assert.equal(plan.context.supplyScope, 'C_STORE');
    assert.equal(plan.context.profileVersion, '1.9.0');
    assert.equal(plan.engineVersion, h.api.version);
    assert.equal(plan.strategyContractVersion, '1.9.0');
    assert.equal(plan.profileId, h.ui.profile().id || h.ui.profile().brandId);
    assert.equal(h.ui.profile().brandId, 'grocery-brand:SEVEN_ELEVEN');
    assert.equal(plan.profileVersion, '1.9.0');
    for (const [part, id] of [['context', 'area-context'], ['supply', 'grocery-supply']]) {
      assert.equal(plan.context.sourceRelease[part].sha256, fileHash('prototype/data/real/' + id + '.json'));
      assert.deepEqual(plan.context.sourceRelease[part].metadata, plain(part === 'context' ? h.runtime.metadata : h.runtime.supplyCache.get('grocery').metadata));
    }
    assert.deepEqual(plan.criteria, plain(h.ui.criteria())); assert.equal(plan.criteriaStatus, 'team_revision');
    assert(plan.assessments.every(a => a.nextAction.title.en && a.nextAction.requiredEvidence.length && a.missingEvidence.length));
    assert(!plan.assessments.some(a => a.status === 'confirmed_opening_opportunity'));
    assert(Number.isFinite(Date.parse(plan.assessedAt)));
  });

  await check('Snapshots deeply freeze the captured criteria and strategy selection against later draft edits', () => {
    const plan = h.ui.snapshot(candidate.id), before = hash(plan.criteria), ids = plain(plan.strategyIds), percentile = run('draft.paths[0].all[0].percentile');
    run('draft.paths[0].all[0].percentile=42;window.YolkDemandFactors.remember(draft)'); h.ui.setSelected(['network_infill']);
    assert.equal(hash(plan.criteria), before); assert.deepEqual(plain(plan.strategyIds), ids);
    const draftPlan = h.ui.snapshot(candidate.id); assert.equal(draftPlan.criteriaStatus, 'private_draft');
    h.sandbox.testPercentile = percentile; run('draft.paths[0].all[0].percentile=testPercentile;window.YolkDemandFactors.remember(draft)');
    assert.deepEqual(plain(run('criteriaErrors(draft)')), [], 'Restoring the draft must leave the same compiled factor paths');
    h.ui.setSelected(ids);
  });

  await check('Actual shortlist save records one owner, evidence snapshot, contextual event and nine peer recipients', () => {
    run('Y.actor="m";delete Y.targets[testAreaId]'); const events = run('Y.events.length'), committed = h.sandbox.committedCount;
    clickStrategy(h, 'save', candidate.id);
    const target = plain(run('Y.targets[testAreaId]')), event = plain(run('Y.events[0]'));
    assert.equal(target.owner, 'm'); assert.equal(target.status, 'study'); assert.equal(target.archived, false);
    assert.equal(target.strategyAssessment.reportingAreaId, candidate.id);
    assert.equal(run('Y.events.length'), events + 1); assert.equal(event.type, 'place.created'); assert.equal(event.actor, 'm');
    assert.equal(event.entity_id, candidate.id); assert.equal(event.changes[0].field, 'strategyAssessment');
    assert.deepEqual(event.meta.strategyIds, plain(h.ui.selectedIds())); assert.equal(event.recipients.length, 9);
    assert.equal(h.sandbox.committedCount, committed + 1);
  });

  await check('Refreshing a survey plan preserves existing owner, status and notes and logs the before/after assessment', () => {
    run('Y.targets[testAreaId].owner="p";Y.targets[testAreaId].status="survey";Y.targets[testAreaId].note="Check the road crossing"');
    const previous = plain(run('Y.targets[testAreaId].strategyAssessment')); h.ui.setSelected(['network_infill']);
    clickStrategy(h, 'save', candidate.id); const target = plain(run('Y.targets[testAreaId]')), event = plain(run('Y.events[0]'));
    assert.equal(target.owner, 'p'); assert.equal(target.status, 'survey'); assert.equal(target.note, 'Check the road crossing');
    assert.equal(event.type, 'place.updated'); assert.deepEqual(event.changes[0].before, previous);
    assert.deepEqual(event.changes[0].after.strategyIds, ['network_infill']);
  });

  await check('Viewer cannot save a survey plan; accessible actions visibly disable editing', () => {
    run('Y.actor="v0"'); const before = run('JSON.stringify({targets:Y.targets,events:Y.events})');
    clickStrategy(h, 'save', candidate.id); assert.equal(run('JSON.stringify({targets:Y.targets,events:Y.events})'), before);
    const html = h.ui.page(); assert(/data-strategy-action="save" data-id="[^"]+" disabled/.test(html));
    run('Y.actor="m"');
  });

  await check('A local persistence failure rolls back the saved target and action event', () => {
    const before = run('JSON.stringify({target:Y.targets[testAreaId],events:Y.events})');
    const original = h.sandbox.localStorage.setItem;
    h.sandbox.localStorage.setItem = () => {throw new Error('Injected storage quota failure');};
    clickStrategy(h, 'save', candidate.id);
    h.sandbox.localStorage.setItem = original;
    assert.equal(run('JSON.stringify({target:Y.targets[testAreaId],events:Y.events})'), before);
  });

  await check('Saved plan detail presents tasks, uncertainty and snapshot revision in Thai and English', () => {
    const row = run('evaluate(Y.criteria).find(a=>a.id===testAreaId)');
    for (const lang of ['th', 'en']) {
      h.sandbox.testLang = lang; run('Y.lang=testLang;Y.route="place"'); const html = h.ui.detail(row);
      assert(html.includes(lang === 'en' ? 'First field task' : 'งานแรก'));
      assert(html.includes(lang === 'en' ? 'Still unknown' : 'ยังไม่รู้'));
      assert(html.includes(lang === 'en' ? 'Plan captured at' : 'แผนที่บันทึกไว้เมื่อ'));
      assert(!html.includes('[object Object]'));
    }
  });

  const failed = checks.filter(c => !c.passed);
  console.log(JSON.stringify({suite: 'strategy-ui', checks: checks.length, passed: checks.length - failed.length, observations, failures: failed,
    evidence: 'Actual Strategy UI handlers/markup + real nationwide CityMETER model and source snapshots in VM. Scoped predicate supplied by harness; Leaflet rendering, font rendering, backend authorization and business outcomes are separate checks.'}, null, 2));
  if (failed.length) process.exitCode = 1;
})().catch(error => {console.error(error); process.exitCode = 1;});
