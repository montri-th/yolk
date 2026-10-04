/* Criteria map contract checks: membership changes, rank changes and evidence states. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const nodes = new Map();
const listeners = new Map();
const missingSelectors = new Set();
function node(selector) {
  if (!nodes.has(selector)) {
    const classes = new Set();
    nodes.set(selector, {
    innerHTML: '', textContent: '', hidden: false, value: '', attributes: {}, style: {},
    classList: {
      toggle(name) { if (classes.has(name)) { classes.delete(name); return false; } classes.add(name); return true; },
      contains(name) { return classes.has(name); }
    },
    getBoundingClientRect() { return {width: 640, height: 900, top: 120}; },
    getBBox() { return {x: 30, y: 0, width: 20, height: 20}; },
    setAttribute(key, value) { this.attributes[key] = String(value); },
    removeAttribute(key) { delete this.attributes[key]; }
    });
  }
  return nodes.get(selector);
}
const provinces = [
  {code: '10', path: 'M0 0H20V20H0Z', centroid: [10, 10]},
  {code: '20', path: 'M30 0H50V20H30Z', centroid: [40, 10]},
  {code: '30', path: 'M60 0H80V20H60Z', centroid: [70, 10]}
];
let teamRows = [], draftRows = [], errors = [], contextKey = 'test|fuel|own|all|1';
const team = {version: 1};
const draft = {version: 1};
const context = vm.createContext({
  window: {addEventListener() {}},
  document: {
    querySelector: selector => missingSelectors.has(selector) ? null : node(selector),
    querySelectorAll() { return []; },
    addEventListener(kind, handler) { listeners.set(kind, [...(listeners.get(kind) || []), handler]); }
  },
  Y: {lang: 'en', criteria: team}, draft,
  AREAS: [],
  YolkDecisions: {tierText: a => a.qualifyingTier ? 'Tier ' + a.qualifyingTier : 'Tier unresolved'},
  supplyCountText: (supply, field) => String(supply[field]),
  evaluate: criteria => criteria === team ? teamRows : draftRows,
  criteriaErrors: () => errors,
  criteriaContextKey: () => contextKey,
  P: provinces,
  tr: (_th, en) => en,
  num: value => String(value),
  areaName: id => 'Area ' + id,
  provinceName: id => 'Province ' + id,
  escapeHTML: value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[x]))
});
vm.runInContext(fs.readFileSync(path.join(root, 'prototype/criteria-map.js'), 'utf8'), context, {filename: 'criteria-map.js'});
const map = context.window.YolkCriteriaMap;
const checks = [];
const ids = rows => Array.from(rows, a => a.id);
const area = (id, override = {}) => ({id, province: '10', eligible: true, reviewCandidate: false, demand: true, pattern: 'Pioneer', possiblePatterns: ['Pioneer'], qualifyingTier: 1, score: 99, supply: {own: 2, competitor: 3, unverified: 0}, ...override});
function check(name, run) { run(); checks.push(name); }
function clickLayer(name) {
  const target = {dataset: {criteriaLayer: name}, closest() { return this; }};
  for (const handler of listeners.get('click') || []) handler({target});
}
function clickArea(id) {
  context.AREAS = draftRows;
  const target = {dataset: {criteriaArea: id}, closest() { return this; }};
  for (const handler of listeners.get('click') || []) handler({target});
}
function changeProvince(code) {
  const target = node('#criteria-province-select');
  target.id = 'criteria-province-select';
  target.value = code;
  for (const handler of listeners.get('change') || []) handler({target});
}

check('Added and removed are identity differences, not a net count', () => {
  const s = map.snapshot([area('a'), area('b')], [area('b'), area('c')]);
  assert.equal(s.old.length, s.next.length);
  assert.deepEqual(ids(s.added), ['c']);
  assert.deepEqual(ids(s.removed), ['a']);
});
check('Weights-only reordered results retain membership and report changed existing ranks', () => {
  const s = map.snapshot([area('a'), area('b'), area('c')], [area('c'), area('b'), area('a')]);
  assert.equal(s.added.length, 0);
  assert.equal(s.removed.length, 0);
  assert.deepEqual(ids(s.moved), ['c', 'a']);
  assert.equal(s.ranks.get('c'), 3);
});
check('A newly inserted leading location moves old ranks without treating them as new', () => {
  const s = map.snapshot([area('a'), area('b')], [area('c'), area('a'), area('b')]);
  assert.deepEqual(ids(s.added), ['c']);
  assert.deepEqual(ids(s.moved), ['a', 'b']);
  assert.equal(s.removed.length, 0);
});
check('Review candidates remain separate from confirmed membership', () => {
  const review = area('r', {eligible: false, reviewCandidate: true, pattern: null, possiblePatterns: ['Pioneer', 'Our Farm']});
  const s = map.snapshot([], [review]);
  assert.equal(s.next.length, 0);
  assert.equal(s.added.length, 0);
  assert.deepEqual(ids(s.review), ['r']);
});
check('Confirmed low-demand patterns remain eligible without becoming Yolks', () => {
  const low = area('quiet', {demand: false, pattern: 'Quiet', possiblePatterns: ['Quiet'], qualifyingTier: null});
  const s = map.snapshot([], [low]);
  assert.deepEqual(ids(s.next), ['quiet']);
  assert.deepEqual(ids(s.added), ['quiet']);
  assert.equal(s.next[0].demand, false);
});
check('Guaranteed selected-group membership survives an unresolved exact pattern', () => {
  const unresolved = area('u', {pattern: null, possiblePatterns: ['Pioneer', 'FOMO']});
  const s = map.snapshot([], [unresolved]);
  assert.deepEqual(ids(s.next), ['u']);
  assert.equal(s.next[0].pattern, null);
  assert.deepEqual(Array.from(s.next[0].possiblePatterns), ['Pioneer', 'FOMO']);
});
check('Unknown demand is not included unless upstream evaluation confirms membership', () => {
  const unknown = area('unknown', {eligible: false, demand: null, pattern: null, possiblePatterns: []});
  const s = map.snapshot([], [unknown]);
  assert.equal(s.next.length, 0);
  assert.equal(s.added.length, 0);
  assert.equal(s.review.length, 0);
  assert.equal(s.nextRows[0].demand, null);
});
check('An eligible result becoming review is removed once and queued for review', () => {
  const s = map.snapshot([area('a')], [area('a', {eligible: false, reviewCandidate: true, pattern: null})]);
  assert.deepEqual(ids(s.removed), ['a']);
  assert.deepEqual(ids(s.review), ['a']);
  assert.equal(s.next.length, 0);
});
check('Snapshot never reorders or mutates supplied result rows', () => {
  const before = [area('a'), area('b')], after = [area('b'), area('a')];
  const originals = JSON.stringify([before, after]);
  map.snapshot(before, after);
  assert.equal(JSON.stringify([before, after]), originals);
});
check('Province results include eligible low Demand while keeping its polygon outside warm Yolk classes', () => {
  teamRows = [];
  draftRows = [area('quiet', {province: '20', demand: false, pattern: 'Quiet', qualifyingTier: null})];
  map.sync();
  assert(node('#draft-map-stats').innerHTML.includes('0 → 1'));
  assert(node('#draft-results-list').innerHTML.includes('Area quiet'));
  const pathForLow = node('#draft-map-paths').innerHTML.match(/<path[^>]+data-criteria-province="20"[^>]*>/)?.[0];
  assert(pathForLow);
  assert(!pathForLow.includes('var(--yl-yolk-map-'));
});
check('Review map hatches pending evidence and does not increase confirmed counts', () => {
  teamRows = [];
  draftRows = [area('review', {province: '30', eligible: false, reviewCandidate: true, pattern: null})];
  clickLayer('review');
  assert(node('#draft-map-stats').innerHTML.includes('0 → 0'));
  assert(node('#draft-map-paths').innerHTML.includes('fill="url(#draft-missing)"'));
  assert(node('#draft-results-list').innerHTML.includes('Area review'));
});
check('Rank map isolates moved existing locations instead of repainting all qualifying locations', () => {
  teamRows = [area('a'), area('b'), area('c')];
  draftRows = [area('c'), area('b'), area('a')];
  clickLayer('rank');
  const list = node('#draft-results-list').innerHTML;
  assert(list.includes('Area a'));
  assert(list.includes('Area c'));
  assert(!list.includes('Area b'));
  assert(node('#draft-map-stats').innerHTML.includes('3 → 3'));
  assert(list.includes('3 → 1'));
  assert(list.includes('1 → 3'));
  assert(!node('#draft-map-paths').innerHTML.includes('var(--yl-yolk-map-'));
  assert(node('#draft-map-legend').innerHTML.includes('team → draft rank'));
});
check('Invalid numeric settings pause the map instead of reporting zero matches', () => {
  errors = ['invalid_percentile'];
  map.sync();
  assert.equal(node('#draft-map-paths').innerHTML, '');
  assert.equal(node('#draft-map-badges').innerHTML, '');
  assert.equal(node('#draft-results-list').innerHTML, '');
  assert(node('#draft-map-stats').innerHTML.includes('role="alert"'));
  assert(!node('#draft-map-stats').innerHTML.includes('0 → 0'));
  errors = [];
});
check('Province selection stays safe while invalid settings leave no rendered path', () => {
  errors = ['invalid_percentile'];
  map.sync();
  const selector = '[data-criteria-province="20"]';
  missingSelectors.add(selector);
  try {
    assert.doesNotThrow(() => changeProvince('20'));
    assert.equal(node('#criteria-province-select').value, '20');
    assert.equal(node('#draft-map-paths').innerHTML, '');
    assert.equal(node('#draft-results-list').innerHTML, '');
    assert(node('#draft-map-stats').innerHTML.includes('role="alert"'));
  } finally {
    missingSelectors.delete(selector);
    errors = [];
  }
});
check('Selected draft inspector and province filter stay synchronized, then clear for invalid criteria', () => {
  teamRows = [];
  draftRows = [area('inspected', {province: '20'})];
  clickLayer('eligible');
  clickArea('inspected');
  const inspector = node('#draft-area-inspector');
  assert.equal(node('#criteria-province-select').value, '20');
  assert.equal(inspector.hidden, false);
  assert(inspector.innerHTML.includes('Area inspected'));
  assert(inspector.innerHTML.includes('Qualifies under draft'));
  errors = ['invalid_percentile'];
  map.sync();
  assert.equal(inspector.hidden, true);
  assert.equal(inspector.innerHTML, '');
  assert.equal(node('#criteria-province-select').value, '20');
  errors = [];
  draftRows = [area('inspected', {province: '20', eligible: false, reviewCandidate: true, pattern: null})];
  map.sync();
  assert.equal(inspector.hidden, false);
  assert(inspector.innerHTML.includes('Needs evidence review'));
  assert(!inspector.innerHTML.includes('Qualifies under draft'));
});
check('Province select narrows the location list but retains nationwide comparison totals and criteria', () => {
  teamRows = [];
  draftRows = [area('province-a'), area('province-b', {province: '20'})];
  clickLayer('eligible');
  const criteriaBefore = JSON.stringify([team, draft]);
  changeProvince('20');
  assert(node('#draft-results-list').innerHTML.includes('Area province-b'));
  assert(!node('#draft-results-list').innerHTML.includes('Area province-a'));
  assert(node('#draft-map-stats').innerHTML.includes('0 → 2'));
  assert.equal(node('#criteria-province-select').value, '20');
  assert.notEqual(node('#criteria-map-svg').attributes.viewBox, '0 0 640 900');
  changeProvince('');
  assert(node('#draft-results-list').innerHTML.includes('Area province-a'));
  assert(node('#draft-results-list').innerHTML.includes('Area province-b'));
  assert.equal(node('#criteria-map-svg').attributes.viewBox, '0 0 640 900');
  assert.equal(JSON.stringify([team, draft]), criteriaBefore);
});
check('Mobile results toggle exposes and collapses the panel without changing criteria', () => {
  const target = node('.draft-mobile-results');
  target.dataset = {criteriaMap: 'results'};
  target.closest = selector => selector === '.draft-map-stage' ? node('.draft-map-stage') : target;
  const criteriaBefore = JSON.stringify([team, draft]);
  for (const handler of listeners.get('click') || []) handler({target});
  assert.equal(target.attributes['aria-expanded'], 'true');
  assert(node('.draft-map-stage').classList.contains('is-results-open'));
  for (const handler of listeners.get('click') || []) handler({target});
  assert.equal(target.attributes['aria-expanded'], 'false');
  assert(!node('.draft-map-stage').classList.contains('is-results-open'));
  assert.equal(JSON.stringify([team, draft]), criteriaBefore);
});
check('Switching brand/context resets result layer without emitting shared actions', () => {
  draftRows = [area('new-context')];
  contextKey = 'test|grocery|other|C_STORE|1';
  map.sync();
  assert(node('#draft-results-list').innerHTML.includes('Area new-context'));
  assert(!node('#draft-map-paths').innerHTML.includes('fill="url(#draft-missing)"'));
  assert.equal(node('#criteria-province-select').value, '');
  assert.equal(node('#draft-area-inspector').hidden, true);
  assert.equal(node('#draft-area-inspector').innerHTML, '');
});

console.log(JSON.stringify({passed: checks.length, checks, scope: 'Pure snapshot and DOM-stub map contracts; browser layout, pointer behavior and live deployment are separate checks.'}, null, 2));
