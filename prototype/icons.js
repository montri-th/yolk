/* Yolk product icon subset. DS ICON-01 style; canonical DS font bytes are unchanged. */
(function (global) {
  'use strict';
  const glyphs = Object.freeze(["ac_unit", "add", "add_photo_alternate", "arrow_back", "beach_access", "bedtime", "bookmark_add", "bookmark_added", "close", "contrast", "dark_mode", "delete", "edit", "egg_alt", "explore", "fact_check", "flag", "groups", "help", "history", "layers", "light_mode", "local_gas_station", "location_on", "map", "menu", "notifications", "open_in_new", "photo", "potted_plant", "satellite_alt", "save", "search", "share", "store", "swords", "tune"]);
  const allowed = new Set(glyphs);
  function icon(name) {
    return allowed.has(name) ? '<span class="yl-icon" aria-hidden="true" data-yolk-glyph="'+name+'">'+name+'</span>' : '';
  }
  const patternGlyphs = Object.freeze({'Crowded':'groups','FOMO':'flag','Our Farm':'potted_plant','Pioneer':'explore','Quiet':'bedtime','Their War':'swords','Our Island':'beach_access','Winter War':'ac_unit'});
  function patternIcon(name) { return Object.prototype.hasOwnProperty.call(patternGlyphs,name) ? icon(patternGlyphs[name]) : ''; }
  function yolkIcon() { return icon('egg_alt'); }
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
  global.YolkIcons = Object.freeze({ icon: icon, decorate: decorate, load: load, glyphs: glyphs, patternGlyphs: patternGlyphs, patternIcon: patternIcon, yolkIcon: yolkIcon });
  // Failed fonts leave readable labels; no raw ligature names or fallback emoji appear.
  load();
})(typeof window !== 'undefined' ? window : globalThis);
