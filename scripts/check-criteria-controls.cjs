/* DOM contract checks. Actual mouse/touch, layout and browser range behavior need browser QA. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class TestEvent {
  constructor(type, options = {}) { this.type = type; this.bubbles = !!options.bubbles; this.target = null; }
}

class TestNode {
  constructor(tag, document) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.children = []; this.parentNode = null;
    this.attributes = {}; this.dataset = {}; this.listeners = new Map(); this.className = ''; this.id = '';
    this.type = ''; this.min = ''; this.max = ''; this.step = ''; this.disabled = false; this.hidden = false; this._value = '';
    this.textContent = '';
    this.classList = {
      add: name => { if (!this.className.split(/\s+/).includes(name)) this.className = (this.className + ' ' + name).trim(); },
      toggle: (name, enabled) => { const names = this.className.split(/\s+/).filter(x => x && x !== name); if (enabled) names.push(name); this.className = names.join(' '); }
    };
  }
  get value() { return this._value || (this.type === 'range' ? '50' : ''); }
  set value(value) {
    let text = String(value);
    if (this.type === 'number' && text !== '' && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) text = '';
    if (this.type === 'range') {
      const min = this.min === '' ? 0 : Number(this.min), max = this.max === '' ? 100 : Number(this.max), step = Number(this.step) || 1;
      let number = Number(text); if (!Number.isFinite(number)) number = (min + max) / 2;
      number = Math.max(min, Math.min(max, number));
      text = String(Math.max(min, Math.min(max, min + Math.round((number - min) / step) * step)));
    }
    this._value = text;
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    else if (['id', 'type', 'min', 'max', 'step'].includes(name)) this[name] = String(value);
    else if (name === 'disabled') this.disabled = true;
  }
  getAttribute(name) {
    if (['id', 'type', 'min', 'max', 'step'].includes(name)) return this[name] || null;
    if (name === 'disabled') return this.disabled ? '' : null;
    return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null;
  }
  hasAttribute(name) { return this.getAttribute(name) !== null; }
  get labels() { return this.ownerDocument.querySelectorAll('label').filter(label => label.getAttribute('for') === this.id); }
  append(...nodes) {
    for (const node of nodes) { if (node.parentNode) node.parentNode.children.splice(node.parentNode.children.indexOf(node), 1); node.parentNode = this; this.children.push(node); }
  }
  insertAdjacentElement(where, node) {
    assert.equal(where, 'beforebegin'); const parent = this.parentNode; const index = parent.children.indexOf(this);
    if (node.parentNode) node.parentNode.children.splice(node.parentNode.children.indexOf(node), 1);
    parent.children.splice(index, 0, node); node.parentNode = parent;
  }
  matches(selector) {
    return selector.split(',').some(part => {
      const exclusions = [...part.matchAll(/:not\(([^)]+)\)/g)].map(match => match[1]);
      if (exclusions.some(exclusion => this.matches(exclusion))) return false;
      const text = part.replace(/:not\([^)]+\)/g, '').trim(); const tag = text.match(/^[a-z]+/i);
      if (tag && this.tagName !== tag[0].toUpperCase()) return false;
      const classes = [...text.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
      if (classes.some(name => !this.className.split(/\s+/).includes(name))) return false;
      return [...text.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)].every(([, name, value]) => this.hasAttribute(name) && (value === undefined || this.getAttribute(name) === value));
    });
  }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  closest(selector) { let node = this; while (node) { if (node.matches(selector)) return node; node = node.parentNode; } return null; }
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(callback); }
  dispatchEvent(event) {
    if (!event.target) event.target = this;
    for (const callback of this.listeners.get(event.type) || []) callback(event);
    if (event.bubbles && this.parentNode) this.parentNode.dispatchEvent(event);
    return true;
  }
}

const document = new TestNode('document', null); document.ownerDocument = document;
document.documentElement = { lang: 'en' }; document.createElement = tag => new TestNode(tag, document);
const window = { Event: TestEvent };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../prototype/criteria-controls.js'), 'utf8'), { document, window, WeakMap, Number, Array, String }, { filename: 'criteria-controls.js' });
const api = window.YolkCriteriaControls;
function node(tag, attrs = {}) { const result = document.createElement(tag); for (const [key, value] of Object.entries(attrs)) result.setAttribute(key, value); return result; }
function field(parent, id, name, attrs, value) {
  const holder = node('div'); holder.className = 'field'; const label = node('label', { for: id }); label.textContent = name;
  const input = node('input', { id, type: 'number', min: '1', max: '100', ...attrs }); input.value = value;
  holder.append(label, input); parent.append(holder); return input;
}
const form = node('form'); document.append(form);
const percentile = field(form, 'c-buildingP1', 'Primary Tier 1 threshold', { 'data-criterion': 'buildingP1' }, '99');
const pathPercentile = field(form, 'path-0-0-percentile', 'Population percentile', { 'data-path-percentile': '', 'data-path-index': '0', 'data-condition-index': '0' }, '75');
const supply = field(form, 'own-many', 'Our branches are high from', { 'data-criterion': 'ownMany' }, '3');
const group = node('div'); group.className = 'signal-group'; form.append(group);
for (let i = 0; i < 6; i++) group.append(node('select', { 'data-picker-metric': '', 'data-core-group': 'activity' }));
const hits = field(group, 'c-activityT1', 'Supporting Tier 1 hit count', { 'data-criterion': 'activityT1', max: '25' }, '5');
const weights = node('fieldset'); weights.disabled = true; form.append(weights);
const weight = field(weights, 'weight-demand', 'Demand priority', { 'data-weight-scope': 'rankingWeights', 'data-weight-key': 'demand', min: '0' }, '70');
const wrapper = input => input.closest('.criteria-number-control');
const slider = input => wrapper(input).querySelectorAll('input[type="range"]')[0];
const reading = input => wrapper(input).querySelectorAll('.criteria-number-reading')[0];
const inputEvent = input => input.dispatchEvent(new TestEvent('input', { bubbles: true }));
const checks = []; function check(name, run) { run(); checks.push(name); }

check('Mount pairs every supported exact-number field and preserves original nodes/labels', () => {
  const result = api.mount(form); assert.equal(result.mounted, 5); assert.equal(result.count, 5);
  for (const input of [percentile, pathPercentile, supply, hits, weight]) { assert.equal(wrapper(input).querySelectorAll('input[type="number"]')[0], input); assert.equal(input.labels.length, 1); assert(slider(input).getAttribute('aria-label').includes(input.labels[0].textContent)); }
});
check('Factor-owned percentile fields keep their own sliders without a duplicate generic bridge', () => {
  const factor = field(form, 'factor-population-percentile', 'Factor population percentile', { 'data-path-percentile': '', 'data-factor-number': '' }, '80');
  const result = api.mount(form);
  assert.equal(result.mounted, 0); assert.equal(result.count, 5);
  assert.equal(wrapper(factor), null); assert.equal(factor.value, '80');
});
check('Repeated mount/sync preserves focused nodes and installs one event bridge', () => {
  document.activeElement = slider(percentile); const before = document.activeElement;
  for (let i = 0; i < 5; i++) { assert.equal(api.mount(form).mounted, 0); assert.equal(api.sync(form).count, 5); }
  assert.equal(document.activeElement, before); assert.equal(form.querySelectorAll('.criteria-number-control').length, 5);
  assert.equal(slider(percentile).listeners.get('input').length, 1);
});
const routed = { input: 0, change: 0, values: {} };
document.addEventListener('input', event => { if (event.target.type === 'number') { routed.input++; const value = event.target.value === '' ? NaN : Number(event.target.value); routed.values[event.target.id] = value; } });
document.addEventListener('change', event => { if (event.target.type === 'number') routed.change++; });
check('Dragging emits one bubbling original-number input to the existing handler', () => {
  slider(percentile).value = '88'; inputEvent(slider(percentile));
  assert.equal(percentile.value, '88'); assert.equal(routed.input, 1); assert.equal(routed.values[percentile.id], 88); assert.equal(reading(percentile).textContent, 'P88');
});
check('Range change forwards one change without repeating the input mutation', () => {
  slider(percentile).dispatchEvent(new TestEvent('change', { bubbles: true })); assert.equal(routed.change, 1); assert.equal(routed.input, 1);
});
check('Exact decimal typing stays exact while the integer slider is only an approximate handle', () => {
  percentile.value = '99.7'; inputEvent(percentile); api.sync(form);
  assert.equal(percentile.value, '99.7'); assert.equal(routed.values[percentile.id], 99.7); assert.equal(reading(percentile).textContent, 'P99.7'); assert.equal(slider(percentile).getAttribute('aria-valuetext'), 'P99.7');
});
check('Empty typing stays empty/NaN, never silently becomes zero, and can recover by dragging', () => {
  pathPercentile.value = ''; inputEvent(pathPercentile); api.sync(form);
  assert.equal(pathPercentile.value, ''); assert(Number.isNaN(routed.values[pathPercentile.id])); assert.equal(reading(pathPercentile).textContent, '—'); assert.equal(slider(pathPercentile).getAttribute('aria-invalid'), 'true');
  slider(pathPercentile).value = '50'; inputEvent(slider(pathPercentile)); assert.equal(pathPercentile.value, '50'); assert.equal(slider(pathPercentile).getAttribute('aria-invalid'), 'false');
});
check('Disabled fieldsets and explicit disabled inputs propagate to slider without coercing values', () => {
  assert.equal(slider(weight).disabled, true); weights.disabled = false; api.sync(form); assert.equal(slider(weight).disabled, false);
  weight.disabled = true; api.sync(form); assert.equal(slider(weight).disabled, true); assert.equal(weight.value, '70'); weight.disabled = false;
});
check('Supporting hit slider uses actual six metric controls, preserving existing exact-input bounds', () => {
  assert.equal(slider(hits).max, '6'); assert.equal(hits.max, '25');
  hits.value = '25'; inputEvent(hits); assert.equal(hits.value, '25'); assert.equal(slider(hits).value, '6'); assert.equal(slider(hits).getAttribute('aria-invalid'), 'true'); assert.equal(wrapper(hits).querySelectorAll('.criteria-range-note')[0].hidden, false);
  hits.value = '5'; inputEvent(hits);
});
check('Supply count and weight slider endpoints keep zero weight valid', () => {
  assert.equal(slider(supply).min, '1'); assert.equal(slider(supply).max, '100'); assert.equal(slider(weight).min, '0');
  slider(weight).value = '0'; inputEvent(slider(weight)); assert.equal(weight.value, '0'); assert.equal(reading(weight).textContent, 'Weight 0'); assert.equal(slider(weight).getAttribute('aria-invalid'), 'false');
});
check('Language sync updates readable captions/ARIA without rebuilding controls', () => {
  const old = slider(hits); document.documentElement.lang = 'th'; api.sync(form);
  assert.equal(slider(hits), old); assert.equal(reading(hits).textContent, '5 ข้อ'); assert.equal(reading(supply).textContent, '3 รายการ'); assert(slider(hits).getAttribute('aria-label').includes('ลากปรับค่า'));
});
check('Supply gap-reference direction is explicit, described to assistive users and absent from unrelated sliders', () => {
  const direction=wrapper(supply).querySelectorAll('.criteria-supply-direction')[0];
  assert.equal(direction.hidden,false);assert.equal(direction.id,'own-many-direction');
  assert(supply.getAttribute('aria-describedby').split(/\s+/).includes(direction.id));
  assert(slider(supply).getAttribute('aria-describedby').split(/\s+/).includes(direction.id));
  assert(direction.children[0].textContent.includes('จุดเทียบต่ำ'));assert(direction.children[1].textContent.includes('จุดเทียบสูง'));
  for(const input of [percentile,pathPercentile,hits,weight])assert.equal(wrapper(input).querySelectorAll('.criteria-supply-direction')[0].hidden,true);
  const before={input:routed.input,change:routed.change,value:supply.value};document.documentElement.lang='en';api.sync(form);
  assert.equal(wrapper(supply).querySelectorAll('.criteria-supply-direction')[0],direction);
  assert.equal(direction.children[0].textContent,'← Lower reference');assert.equal(direction.children[1].textContent,'Higher reference →');
  assert.equal(routed.input,before.input);assert.equal(routed.change,before.change);assert.equal(supply.value,before.value);
});
check('Mount accepts a single exact input and does not dispatch artificial changes', () => {
  const before = { input: routed.input, change: routed.change }; const result = api.mount(percentile);
  assert.equal(result.count, 1); assert.equal(result.mounted, 0); assert.equal(routed.input, before.input); assert.equal(routed.change, before.change);
});
check('Relative supply slider carries decimal precision and explicit denominator unit', () => {
  document.documentElement.lang='en';
  const rate=field(form,'own-rate','Our branch rate',{ 'data-criterion':'ownRateHigh','data-supply-rate':'','data-rate-unit':'branches per 100,000 m²','data-range-step':'0.001',min:'0.001',max:'1',step:'any'},'0.02345678');
  api.mount(rate);assert.equal(slider(rate).step,'0.001');assert.equal(rate.value,'0.02345678');assert.equal(rate.getAttribute('inputmode'),'decimal');
  assert(slider(rate).getAttribute('aria-valuetext').includes('branches per 100,000 m²'));
  const direction=wrapper(rate).querySelectorAll('.criteria-supply-direction')[0];assert.equal(direction.hidden,false);assert.equal(direction.children[0].textContent,'← Lower reference');assert(slider(rate).getAttribute('aria-describedby').includes(direction.id));
  slider(rate).value='0.064';inputEvent(slider(rate));assert.equal(rate.value,'0.064');assert.equal(routed.values['own-rate'],.064);
  rate.value='';inputEvent(rate);assert.equal(reading(rate).textContent,'—');assert.equal(slider(rate).getAttribute('aria-invalid'),'true');
});

console.log(JSON.stringify({ passed: checks.length, checks, limits: 'DOM contract tests only. Native drag/touch, focus behavior under real rendering and theme/layout are covered separately by browser QA.' }, null, 2));
