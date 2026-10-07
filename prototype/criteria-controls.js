/* Accessible sliders augment the existing exact-number controls. No model writes here. */
(function (global) {
  'use strict';

  const selector = 'input[type="number"][data-criterion], input[type="number"][data-path-percentile]:not([data-factor-number]), input[type="number"][data-weight-scope]';
  const instances = new WeakMap();

  function copy(th, en) {
    return document.documentElement.lang === 'en' ? en : th;
  }

  function inputs(root) {
    const values = Array.from(root.querySelectorAll(selector));
    if (root.matches && root.matches(selector)) values.unshift(root);
    return values;
  }

  function numericValue(input) {
    return input.value.trim() === '' ? NaN : Number(input.value);
  }

  function kind(input) {
    if (input.hasAttribute('data-path-percentile') || /^(buildingP1|buildingP2|activityP|extraP)$/.test(input.dataset.criterion || '')) return 'percentile';
    if (/^activityT[123]$/.test(input.dataset.criterion || '')) return 'hits';
    if (input.hasAttribute('data-weight-scope')) return 'weight';
    if (input.hasAttribute('data-supply-rate')) return 'rate';
    return 'supply';
  }

  function limits(input, type) {
    if (type === 'rate') return { min: Number(input.min) || 0.001, max: Number(input.max) || 10, step: Number(input.dataset.rangeStep) || 0.01 };
    if (type === 'percentile') return { min: 1, max: 100, step: 1 };
    if (type === 'weight') return { min: 0, max: 100, step: 1 };
    if (type === 'hits') {
      const group = input.closest('.signal-group');
      const count = group ? group.querySelectorAll('[data-picker-metric][data-core-group="activity"]').length : 0;
      return { min: 1, max: count || Number(input.max) || 25, step: 1 };
    }
    return { min: Number(input.min) || 1, max: Number(input.max) || 100, step: 1 };
  }

  function display(value, type, input) {
    if (!Number.isFinite(value)) return '—';
    const number = String(value);
    if (type === 'percentile') return 'P' + number;
    if (type === 'hits') return number + copy(' ข้อ', ' hits');
    if (type === 'supply') return number + copy(' รายการ', ' records');
    if (type === 'rate') return Number(value.toFixed(4)) + ' ' + (input?.dataset.rateUnit || copy('สาขา / หน่วยตลาด', 'branches / market unit'));
    return copy('น้ำหนัก ', 'Weight ') + number;
  }

  function accessibleLabel(input) {
    const labels = input.labels ? Array.from(input.labels) : [];
    const text = labels.map(label => label.textContent.trim()).filter(Boolean).join(' ');
    return (text || input.getAttribute('aria-label') || input.id || copy('ค่าตัวเลข', 'Numeric value')) + ' · ' + copy('ลากปรับค่า', 'Drag to adjust');
  }

  function supplyDirection(input) {
    return /^(ownMany|competitorMany|ownRateHigh|competitorRateHigh)$/.test(input.dataset.criterion || '');
  }

  function describe(control, id) {
    if (!id) return;
    const ids = new Set((control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(id);
    control.setAttribute('aria-describedby', Array.from(ids).join(' '));
  }

  function syncOne(input, state) {
    const type = kind(input);
    const bounds = limits(input, type);
    const value = numericValue(input);
    const disabled = input.disabled || !!input.closest('fieldset[disabled]');
    state.range.min = String(bounds.min);
    state.range.max = String(bounds.max);
    state.range.step = String(bounds.step);
    state.range.disabled = disabled;
    state.range.setAttribute('aria-label', accessibleLabel(input));
    state.range.setAttribute('aria-valuetext', display(value, type, input));
    state.range.setAttribute('aria-invalid', String(!Number.isFinite(value) || value < bounds.min || value > bounds.max));
    if (Number.isFinite(value)) state.range.value = String(Math.max(bounds.min, Math.min(bounds.max, value)));
    state.output.textContent = display(value, type, input);
    state.start.textContent = type === 'percentile' ? 'P' + bounds.min : String(bounds.min);
    state.end.textContent = type === 'percentile' ? 'P' + bounds.max : String(bounds.max);
    state.exact.textContent = copy('กรอกค่า', 'Exact value');
    state.direction.hidden = !supplyDirection(input);
    state.directionLeft.textContent = copy('← จุดเทียบต่ำ', '← Lower reference');
    state.directionRight.textContent = copy('จุดเทียบสูง →', 'Higher reference →');
    if (!state.direction.hidden) {
      describe(input, state.direction.id);
      describe(state.range, state.direction.id);
    }
    input.title = copy('กรอกค่าที่ต้องการได้โดยตรง', 'Enter an exact value');
    const outside = Number.isFinite(value) && (value < bounds.min || value > bounds.max);
    state.note.hidden = !outside;
    state.note.textContent = copy('ค่าที่กรอกอยู่นอกช่วงแถบเลื่อน ', 'Entered value is outside slider range ') + bounds.min + '–' + bounds.max;
    state.wrapper.classList.toggle('is-disabled', disabled);
  }

  function enhance(input) {
    const existing = instances.get(input);
    if (existing) {
      syncOne(input, existing);
      return false;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'criteria-number-control';
    wrapper.dataset.controlKind = kind(input);
    const head = document.createElement('div');
    head.className = 'criteria-number-head';
    const output = document.createElement('strong');
    output.className = 'criteria-number-reading';
    output.setAttribute('aria-hidden', 'true');
    const exact = document.createElement('span');
    exact.className = 'criteria-exact-caption';
    exact.setAttribute('aria-hidden', 'true');
    const numberBox = document.createElement('div');
    numberBox.className = 'criteria-exact-value';
    const range = document.createElement('input');
    range.type = 'range';
    range.className = 'criteria-range';
    range.id = input.id ? input.id + '-slider' : '';
    range.setAttribute('data-criteria-slider', input.dataset.criterion || input.dataset.weightKey || 'path-percentile');
    const ends = document.createElement('div');
    ends.className = 'criteria-range-ends';
    ends.setAttribute('aria-hidden', 'true');
    const start = document.createElement('span');
    const end = document.createElement('span');
    const note = document.createElement('small');
    note.className = 'criteria-range-note';
    note.hidden = true;
    const direction = document.createElement('div');
    direction.className = 'criteria-supply-direction';
    direction.id = input.id ? input.id + '-direction' : '';
    direction.hidden = true;
    const directionLeft = document.createElement('span');
    const directionRight = document.createElement('span');
    direction.append(directionLeft, directionRight);
    input.insertAdjacentElement('beforebegin', wrapper);
    numberBox.append(exact, input);
    head.append(output, numberBox);
    ends.append(start, end);
    wrapper.append(head, range, ends, direction, note);
    input.classList.add('criteria-exact-input');
    input.setAttribute('inputmode', ['hits', 'supply'].includes(kind(input)) ? 'numeric' : 'decimal');
    const state = { wrapper, range, output, exact, start, end, note, direction, directionLeft, directionRight };
    instances.set(input, state);
    range.addEventListener('input', () => {
      input.value = range.value;
      syncOne(input, state);
      input.dispatchEvent(new global.Event('input', { bubbles: true }));
    });
    range.addEventListener('change', () => {
      input.dispatchEvent(new global.Event('change', { bubbles: true }));
    });
    input.addEventListener('input', () => syncOne(input, state));
    input.addEventListener('change', () => syncOne(input, state));
    syncOne(input, state);
    return true;
  }

  function mount(root = document) {
    let mounted = 0;
    const targets = inputs(root);
    for (const input of targets) if (enhance(input)) mounted++;
    return { mounted, count: targets.length };
  }

  function sync(root = document) {
    let count = 0;
    for (const input of inputs(root)) {
      const state = instances.get(input);
      if (state) {
        syncOne(input, state);
        count++;
      }
    }
    return { count };
  }

  global.YolkCriteriaControls = { mount, sync };
})(window);
