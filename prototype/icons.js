/* Yolk product icon subset. DS ICON-01 style; canonical DS font bytes are unchanged. */
(function (global) {
  'use strict';
  const glyphs = Object.freeze(['add','add_photo_alternate','arrow_back','bookmark_add','bookmark_added','close','contrast','dark_mode','delete','edit','fact_check','groups','help','history','layers','light_mode','local_gas_station','location_on','map','menu','notifications','open_in_new','photo','satellite_alt','save','search','share','store','tune']);
  const allowed = new Set(glyphs);
  function icon(name) {
    return allowed.has(name) ? '<span class="yl-icon" aria-hidden="true" data-yolk-glyph="'+name+'">'+name+'</span>' : '';
  }
  // Optional explicit enhancement only. Existing labels, children and handlers remain intact.
  function decorate(root) {
    root = root || global.document;
    if (!root || !root.querySelectorAll) return 0;
    let count = 0;
    root.querySelectorAll('[data-yolk-icon]').forEach(function (el) {
      const name = el.getAttribute('data-yolk-icon');
      if (!allowed.has(name) || el.querySelector('.yl-icon')) return;
      el.insertAdjacentHTML('afterbegin', icon(name));
      count++;
    });
    return count;
  }
  function load() {
    const doc = global.document;
    if (!doc || !doc.fonts || !doc.fonts.load || !doc.documentElement) return Promise.resolve(false);
    return doc.fonts.load('300 24px "Yolk Material Symbols"', 'map save tune').then(function (faces) {
      const ready = faces.length > 0;
      doc.documentElement.classList.toggle('yolk-icons-ready', ready);
      return ready;
    }).catch(function () {
      doc.documentElement.classList.remove('yolk-icons-ready');
      return false;
    });
  }
  global.YolkIcons = Object.freeze({ icon: icon, decorate: decorate, load: load, glyphs: glyphs });
  // Failed fonts leave readable labels; no raw ligature names or fallback emoji appear.
  load();
})(typeof window !== 'undefined' ? window : globalThis);
