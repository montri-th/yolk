/* Persisted action and interruption tests. DOM fixture checks are not native visual QA. */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
function check(name, test) {try {test(); checks.push({name, passed: true}); console.log('PASS', name);} catch (error) {checks.push({name, passed: false, error: String(error.stack || error)}); console.error('FAIL', name, error.message);}}
function fixture({reduced = false, mobile = false, storedPreference = null} = {}) {
  const listeners = new Map(), windowListeners = new Map(), mediaListeners = [], timers = new Map(), animations = [];
  const personalStorage = new Map(); if (storedPreference !== null) personalStorage.set('citymeter-yolk-personal-reduce-motion-v1', String(storedPreference));
  let timer = 0, focused = null;
  class Element {
    constructor(tag = 'span', box = {left: 32, top: 400, width: 80, height: 44}) {this.tagName = tag; this.box = box; this.dataset = {}; this.attributes = {}; this.children = []; this.style = {}; this.listeners = new Map(); this.isConnected = false; this.hidden = false; this.textContent = ''; this.innerHTML = '';}
    setAttribute(name, value) {this.attributes[name] = String(value);}
    getAttribute(name) {return this.attributes[name] ?? null;}
    append(node) {node.parent = this; node.isConnected = true; this.children.push(node);}
    remove() {if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); this.isConnected = false;}
    getBoundingClientRect() {return {...this.box, right: this.box.left + this.box.width, bottom: this.box.top + this.box.height};}
    addEventListener(name, callback) {this.listeners.set(name, callback);}
    contains(node) {return this === node || this.children.some(child => child.contains(node));}
    querySelector(selector) {if (selector === '[data-shortlist-count]') return this.children.find(c => c.dataset.shortlistCount !== undefined) || null; if (selector === '[data-shortlist-delta]') return this.children.find(c => c.dataset.shortlistDelta !== undefined) || null; return null;}
    focus() {focused = this;}
    animate(frames, options) {
      let resolve, reject; const finished = new Promise((r, j) => {resolve = r; reject = j;});
      const record = {frames, options, finished, cancel() {record.cancelled = true; reject(new Error('cancelled'));}, finish: resolve};
      animations.push(record); return record;
    }
  }
  const body = new Element('body'); body.isConnected = true;
  const desktop = new Element('a', {left: 30, top: 510, width: mobile ? 0 : 210, height: 44});
  const bottom = new Element('a', {left: 218, top: 770, width: mobile ? 76 : 0, height: 56});
  const source = new Element('button', {left: 1060, top: 610, width: 230, height: 44}); source.dataset = {action: 'target', id: 'place-1'};
  const replacement = new Element('button'); replacement.dataset = {...source.dataset};
  const strong = new Element('strong'); strong.textContent = '100';
  const motionInput = new Element('input'); motionInput.checked = false; motionInput.matches = selector => selector === '[data-reduce-motion]';
  [desktop, bottom].forEach(el => {const badge = new Element(); badge.dataset.shortlistCount = '0'; el.append(badge); body.append(el);});
  const activeIcon = new Element('span'); body.append(activeIcon);
  const allNodes = () => {const nodes = []; const visit = node => {nodes.push(node); node.children.forEach(visit);}; visit(body); return nodes;};
  const doc = {body, documentElement: new Element('html'), hidden: false, get activeElement() {return focused;}, createElement: tag => new Element(tag),
    addEventListener(name, callback) {if (!listeners.has(name)) listeners.set(name, []); listeners.get(name).push(callback);},
    querySelector(selector) {return selector === '[data-simple-count] strong' ? strong : null;},
    querySelectorAll(selector) {
      if (selector.includes('#sidebar a[href="#targets"]')) return [desktop, bottom];
      if (selector.includes('aria-current="page"')) return [activeIcon];
      if (selector === '[data-action="target"], [data-strategy-action="save"]') return [replacement];
      if (selector === '[data-guidance-flight]') return allNodes().filter(n => n.dataset.guidanceFlight);
      if (selector === '[data-shortlist-delta]') return allNodes().filter(n => n.dataset.shortlistDelta !== undefined);
      if (selector === '[data-reduce-motion]') return [motionInput];
      return [];
    }
  };
  const media = {matches: reduced, addEventListener: (_, listener) => mediaListeners.push(listener)};
  const window = {document: doc, innerWidth: mobile ? 390 : 1440, innerHeight: mobile ? 844 : 1000, matchMedia: () => media,
    localStorage: {getItem: key => personalStorage.get(key) ?? null, setItem: (key, value) => personalStorage.set(key, value)},
    setTimeout(callback, ms) {const id = ++timer; timers.set(id, {callback, ms}); return id;}, clearTimeout: id => timers.delete(id),
    addEventListener(name, callback) {windowListeners.set(name, callback);},
    YolkIcons: {icon: glyph => '<span class="yl-icon" data-yolk-glyph="' + glyph + '"></span>', captionControls() {}}
  };
  const sandbox = vm.createContext({window, Intl, Promise, Set, Object});
  vm.runInContext(read('prototype/action-guidance.js'), sandbox);
  return {api: window.YolkActionGuidance, doc, window, sandbox, media, listeners, windowListeners, mediaListeners, timers, animations, body, desktop, bottom, source, replacement, strong, motionInput, personalStorage,
    focusSource() {focused = source;}, nodes: allNodes, flush(ms) {for (const [id, entry] of [...timers]) if (entry.ms <= ms) {timers.delete(id); entry.callback();}}};
}
const receipt = (id = 'e1', type = 'place.created') => ({id, type, entity: 'place'});
function saved(f, options = {}) {return f.api.shortlistSaved({event: receipt(), beforeCount: 0, afterCount: 1, source: f.api.capture(f.source), name: 'บางนา', lang: 'th', ...options});}

check('Counts derive from non-archived saved targets, never increments kept in UI state', () => {const f = fixture(); assert.equal(f.api.count({one: {}, two: {archived: true}, nil: null}), 1); assert.equal(f.api.count({}), 0);});
check('Both languages have readable exact count markup and a workspace scope label', () => {const f = fixture(); assert(f.api.countMarkup({one: {}}, 'th').includes('1 ทำเลที่เล็งไว้ใน workspace')); assert(f.api.countMarkup({one: {}}, 'en').includes('1 shortlisted locations in workspace')); assert(f.api.countMarkup({}, 'en').includes('data-shortlist-count="0"'));});
check('Successful add links confirmation to Shortlist and shows exactly one +1 in visible desktop destination', () => {const f = fixture(); assert(saved(f)); const badge = f.desktop.querySelector('[data-shortlist-delta]'); assert.equal(badge.textContent, '+1'); assert.equal(f.bottom.querySelector('[data-shortlist-delta]'), null); const note = f.body.children.find(n => n.id === 'action-guidance'); assert.equal(note.hidden, false); assert(note.innerHTML.includes('href="#targets"')); assert(note.innerHTML.includes('ทั้งหมด 1 ทำเล'));});
check('Mobile source-to-destination cue uses bottom navigation, never hidden desktop sidebar', () => {const f = fixture({mobile: true}); saved(f); assert.equal(f.bottom.querySelector('[data-shortlist-delta]').textContent, '+1'); assert.equal(f.desktop.querySelector('[data-shortlist-delta]'), null);});
check('No success receipt or malformed delta produces no success notice, count cue or motion', () => {const f = fixture(); for (const options of [{event: null}, {event: {id: 'bad', type: 'supply.updated', entity: 'supply'}}, {afterCount: 2}, {afterCount: NaN}]) assert.equal(saved(f, options), false); assert.equal(f.animations.length, 0); assert(!f.body.children.some(n => n.id === 'action-guidance'));});
check('Duplicate event receipt never replays +1 or motion', () => {const f = fixture(); assert(saved(f)); const animationCount = f.animations.length; assert.equal(saved(f), false); assert.equal(f.animations.length, animationCount);});
check('Updating an already shortlisted survey plan confirms saved state without +1 or flight', () => {const f = fixture(); assert(saved(f, {event: receipt('update', 'place.updated'), beforeCount: 1, afterCount: 1, plan: true})); assert.equal(f.desktop.querySelector('[data-shortlist-delta]'), null); assert(!f.nodes().some(n => n.dataset.guidanceFlight)); assert(f.body.children.find(n => n.id === 'action-guidance').innerHTML.includes('บันทึกแผนสำรวจแล้ว'));});
check('Removal gives −1 and final text without an add flight', () => {const f = fixture(); saved(f, {event: receipt('remove', 'place.removed'), beforeCount: 1, afterCount: 0}); assert.equal(f.desktop.querySelector('[data-shortlist-delta]').textContent, '−1'); assert(!f.nodes().some(n => n.dataset.guidanceFlight));});
check('Rapid distinct saves replace transient badge instead of accumulating duplicate badges', () => {const f = fixture(); saved(f); saved(f, {event: receipt('e2'), beforeCount: 1, afterCount: 2}); assert.equal(f.desktop.children.filter(n => n.dataset.shortlistDelta !== undefined).length, 1); assert(f.body.children.find(n => n.id === 'action-guidance').innerHTML.includes('ทั้งหมด 2 ทำเล'));});
check('Keyboard saves restore the corresponding control after render without moving focus to navigation', () => {const f = fixture(); f.focusSource(); const captured = f.api.capture(f.source); saved(f, {source: captured}); assert.equal(f.doc.activeElement, f.replacement);});
check('Reduced motion exposes complete final count, +1 and linked message without spatial animation', () => {const f = fixture({reduced: true}); const live = f.body.children.find(n => n.id === 'action-guidance-announcement'); assert(live, 'Empty live region exists before the first action'); assert.equal(live.textContent, ''); saved(f); assert.equal(f.animations.length, 0); assert(!f.nodes().some(n => n.dataset.guidanceFlight)); assert.equal(f.desktop.querySelector('[data-shortlist-delta]').textContent, '+1'); assert.equal(live.attributes['aria-live'], 'polite'); assert(live.textContent.includes('ทั้งหมด 1 ทำเล'));});
check('Changing reduced-motion preference cancels flight immediately and retains visible final notice', () => {const f = fixture(); saved(f); assert(f.nodes().some(n => n.dataset.guidanceFlight)); f.media.matches = true; f.mediaListeners[0](); assert(!f.nodes().some(n => n.dataset.guidanceFlight)); assert.equal(f.body.children.find(n => n.id === 'action-guidance').hidden, false);});
check('Personal motion control has clear bilingual copy and a stable label in existing header settings', () => {const f = fixture(); assert(f.api.reduceControl('th').includes('ลดการเคลื่อนไหว')); assert(f.api.reduceControl('en').includes('Reduce motion')); assert(f.api.reduceControl('en').includes('System preference also applies')); assert(read('prototype/app.js').includes('YolkActionGuidance?.reduceControl(Y.lang)')); assert.equal((read('prototype/app.js').match(/YolkActionGuidance\?\.isReduced\(\)\|\|window\.matchMedia/g)||[]).length,2); assert(read('prototype/action-guidance.css').includes('min-height:52px'));});
check('Personal checkbox immediately cancels guidance flight and persists only its own preference key', () => {const f = fixture(); saved(f); assert(f.nodes().some(n => n.dataset.guidanceFlight)); f.motionInput.checked = true; f.listeners.get('change')[0]({target: f.motionInput}); assert.equal(f.api.isReduced(), true); assert(!f.nodes().some(n => n.dataset.guidanceFlight)); assert.equal(f.personalStorage.size, 1); assert.equal(f.personalStorage.get('citymeter-yolk-personal-reduce-motion-v1'), 'true'); assert.equal(f.doc.documentElement.attributes['data-yolk-reduced-motion'], 'true');});
check('Reloaded personal preference exposes static saved state without spatial motion, and remains reversible', () => {const f = fixture({storedPreference: true}); assert(f.api.isReduced()); assert.equal(f.motionInput.checked, true); saved(f); assert.equal(f.animations.length, 0); assert.equal(f.api.setReduced(false), false); assert.equal(f.personalStorage.get('citymeter-yolk-personal-reduce-motion-v1'), 'false'); assert.equal(f.motionInput.checked, false);});
check('Operating-system reduced motion wins even when the personal checkbox is turned off', () => {const f = fixture({reduced: true, storedPreference: true}); assert.equal(f.api.setReduced(false), true); saved(f); assert.equal(f.animations.length, 0); assert.equal(f.doc.documentElement.attributes['data-yolk-reduced-motion'], 'true');});
check('Hidden-page interruption clears finite effects and timers without touching saved data', () => {const f = fixture(); saved(f); f.doc.hidden = true; f.listeners.get('visibilitychange')[0](); assert.equal(f.timers.size, 0); assert(!f.nodes().some(n => n.dataset.guidanceFlight || n.dataset.shortlistDelta)); assert.equal(f.body.children.find(n => n.id === 'action-guidance').hidden, true);});
check('Repeated script load registers lifecycle listeners only once', () => {const f = fixture(); const api = f.api; vm.runInContext(read('prototype/action-guidance.js'), f.sandbox); assert.equal(f.window.YolkActionGuidance, api); assert.equal(f.listeners.get('visibilitychange').length, 1); assert.equal(f.mediaListeners.length, 1);});
check('Navigation same-route redraws stay static; an actual route change receives finite active-icon feedback only', () => {const f = fixture(); f.api.rendered({route: 'demand', contextKey: 'fuel'}); f.api.rendered({route: 'demand', contextKey: 'fuel'}); assert.equal(f.animations.length, 0); f.api.rendered({route: 'supply', contextKey: 'fuel'}); assert.equal(f.animations.length, 1); assert.equal(f.animations[0].options.duration, 120);});
check('Criteria feedback occurs only when a settled displayed result count changes in the same context', () => {const f = fixture(); f.api.rendered({route: 'criteria', contextKey: 'fuel'}); assert.equal(f.api.impactChanged({route: 'criteria', contextKey: 'fuel'}), false); f.strong.textContent = '95'; assert.equal(f.api.impactChanged({route: 'criteria', contextKey: 'fuel'}), true); assert.equal(f.api.impactChanged({route: 'criteria', contextKey: 'fuel'}), false); f.strong.textContent = '93'; assert.equal(f.api.impactChanged({route: 'criteria', contextKey: 'other'}), false); assert.equal(f.animations.length, 1);});
check('Criteria save confirmation requires the actual criteria event and offers a relevant next view', () => {const f = fixture(); assert.equal(f.api.criteriaSaved({event: null, version: 2}), false); assert(f.api.criteriaSaved({event: {id: 'c1', type: 'criteria.updated'}, version: 2, lang: 'en'})); const note = f.body.children.find(n => n.id === 'action-guidance'); assert(note.innerHTML.includes('Team criteria v2 saved')); assert(note.innerHTML.includes('href="#demand"')); assert.equal(f.api.criteriaSaved({event: {id: 'c1', type: 'criteria.updated'}, version: 2}), false);});
check('Action timing resolves exact LDS feedback and state tokens; no reveal, observer or ambient loop', () => {const f = fixture(); saved(f); assert.equal(f.api.timing.feedbackMs, 120); assert.equal(f.api.timing.feedbackDistancePx, 2); assert.equal(f.api.timing.stateMs, 200); assert.equal(f.api.timing.stateEasing, 'cubic-bezier(.2,0,0,1)'); assert(f.animations.every(a => a.options.iterations === 1)); const css = read('prototype/action-guidance.css'); assert(!/animation-iteration-count\s*:\s*infinite|opacity\s*:\s*0\b|visibility\s*:\s*hidden/.test(css)); assert(!read('prototype/action-guidance.js').includes('IntersectionObserver'));});

function targetHarness({fail = false, viewer = false, targets = {}} = {}) {
  const app = read('prototype/app.js'), match = app.match(/case 'target':\{([\s\S]*?)\}case 'reset-draft'/);
  assert(match, 'Actual target action must remain testable as a bounded transaction');
  const cues = [], state = {targets: structuredClone(targets), actor: 'admin', lang: 'en'}, f = fixture(); let renders = 0, commits = 0;
  const guidance = {...f.api, shortlistSaved: value => {cues.push(value); return true;}};
  const sandbox = vm.createContext({Y: state, id: 'place-1', b: f.source, window: {YolkActionGuidance: guidance}, canEdit: () => !viewer, emitEvent: (type, entity) => fail ? null : receipt('actual', type), render: () => renders++, committed: () => commits++, areaName: () => 'Actual area'});
  vm.runInContext('(function(){' + match[1].replace(/break$/, 'return') + '})()', sandbox);
  return {state, cues, renders, commits};
}
check('Actual central shortlist action rolls back failed storage and emits no success guidance', () => {const old = {owner: 'a', status: 'survey', archived: true}; const f = targetHarness({fail: true, targets: {'place-1': old}}); assert.deepEqual(f.state.targets['place-1'], old); assert.equal(f.cues.length, 0); assert.equal(f.renders, 0); assert.equal(f.commits, 0); const fresh = targetHarness({fail: true}); assert.equal(fresh.state.targets['place-1'], undefined);});
check('Actual central action restores an archived target as one successful addition; viewers cannot mutate', () => {const f = targetHarness({targets: {'place-1': {archived: true}}}); assert.equal(f.state.targets['place-1'].archived, false); assert.equal(f.cues[0].beforeCount, 0); assert.equal(f.cues[0].afterCount, 1); assert.equal(f.commits, 1); const viewer = targetHarness({viewer: true}); assert.equal(viewer.cues.length, 0); assert.equal(Object.keys(viewer.state.targets).length, 0);});
check('Runtime wiring covers Demand/detail/list toggles, Strategy saves, sidebar/mobile count and settled criteria', () => {const app = read('prototype/app.js'), strategy = read('prototype/strategy-ui.js'), html = read('prototype/index.html'); assert.equal((app.match(/countMarkup\(Y\.targets,Y\.lang\)/g) || []).length, 2); assert(app.includes('YolkActionGuidance?.shortlistSaved')); assert(app.includes('YolkActionGuidance?.impactChanged')); assert(app.includes('YolkActionGuidance?.criteriaSaved')); assert(strategy.includes('YolkActionGuidance?.shortlistSaved')); assert(strategy.includes("old&&!old.archived?'place.updated':'place.created'")); assert(html.indexOf('action-guidance.js') < html.indexOf('bootstrap.js')); assert(html.includes('action-guidance.css'));});
check('Actual Strategy save calls guidance once for creation and update, and never on persistence failure', () => {
  const helperSource = read('scripts/check-strategy-ui.cjs').split('\n(async () => {\n')[0];
  const {harness, clickStrategy} = Function('require', '__dirname', helperSource + '\nreturn {harness,clickStrategy};')(require, __dirname);
  const h = harness(), captures = [];
  h.sandbox.window.YolkActionGuidance = {count: targets => Object.values(targets).filter(t => !t.archived).length, capture: () => ({rect: null}), shortlistSaved: receipt => captures.push(receipt)};
  h.evaluate('Y.route="strategy"');
  const id = h.evaluate('evaluate().find(a=>a.eligible).id');
  h.sandbox.testMotionId = id; h.evaluate('delete Y.targets[testMotionId]');
  clickStrategy(h, 'save', id); assert.equal(captures.length, 1); assert.equal(captures[0].afterCount - captures[0].beforeCount, 1); assert.equal(captures[0].event.type, 'place.created');
  clickStrategy(h, 'save', id); assert.equal(captures.length, 2); assert.equal(captures[1].afterCount, captures[1].beforeCount); assert.equal(captures[1].event.type, 'place.updated');
  h.sandbox.localStorage.setItem = () => {throw new Error('storage quota');};
  const before = h.evaluate('JSON.stringify(Y.targets[testMotionId])'); clickStrategy(h, 'save', id);
  assert.equal(captures.length, 2); assert.equal(h.evaluate('JSON.stringify(Y.targets[testMotionId])'), before);
});

const result = {schema: 'yolk-action-guidance-tests/1', version: '1.9.1', checkedAt: new Date().toISOString(), kind: 'vm_dom_transaction_checks_not_native_visual_qa', checks, totals: {passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length}};
console.log(JSON.stringify(result, null, 2)); if (result.totals.failed) process.exitCode = 1;
