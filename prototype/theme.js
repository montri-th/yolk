/* Yolk preference controller. Product settings; LDS atomic tokens stay immutable. */
(function (root) {
  'use strict';
  const STORAGE_KEY = 'citymeter-yolk-theme-v1';
  const choices = ['light', 'dark', 'system'];
  const media = typeof root.matchMedia === 'function' ? root.matchMedia('(prefers-color-scheme: dark)') : null;
  let preference = readPreference();
  function valid(value) { return choices.includes(value) ? value : 'system'; }
  function readPreference() {
    try { return valid(root.localStorage.getItem(STORAGE_KEY)); }
    catch (_) { return 'system'; }
  }
  function resolved() { return preference === 'system' ? (media && media.matches ? 'dark' : 'light') : preference; }
  function apply() {
    const theme = resolved();
    const html = root.document.documentElement;
    html.dataset.theme = theme;
    html.dataset.themePreference = preference;
    html.style.colorScheme = theme;
    root.document.querySelectorAll('[data-yolk-theme]').forEach(select => { select.value = preference; });
    // Browser chrome follows the selected shell surface, including OS theme changes.
    root.document.querySelectorAll('meta[name="theme-color"]').forEach(meta => { meta.content = theme === 'dark' ? '#11191D' : '#EEF1EE'; });
    if (typeof root.CustomEvent === 'function') root.document.dispatchEvent(new root.CustomEvent('yolk:themechange', { detail: { preference, theme } }));
    return theme;
  }
  function setPreference(value) {
    preference = valid(value);
    try { root.localStorage.setItem(STORAGE_KEY, preference); } catch (_) { /* Preference still works for this session. */ }
    return apply();
  }
  function renderControl(lang) {
    const th = lang !== 'en';
    const label = th ? 'ธีม' : 'Theme';
    const names = th ? ['สว่าง', 'มืด', 'ตามเครื่อง'] : ['Light', 'Dark', 'System'];
    return '<label class="theme-control"><span class="theme-label">' + (root.YolkIcons?.icon('contrast') || '') + label + '</span><select data-yolk-theme aria-label="' + label + '">' + choices.map((choice, index) => '<option value="' + choice + '"' + (choice === preference ? ' selected' : '') + '>' + names[index] + '</option>').join('') + '</select></label>';
  }
  root.document.addEventListener('change', event => {
    if (event.target && event.target.matches && event.target.matches('[data-yolk-theme]')) setPreference(event.target.value);
  });
  if (media) {
    const updateFromOS = () => { if (preference === 'system') apply(); };
    if (media.addEventListener) media.addEventListener('change', updateFromOS);
    else if (media.addListener) media.addListener(updateFromOS);
  }
  root.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY || event.key === null) { preference = readPreference(); apply(); }
  });
  // A native disclosure keeps the small-screen shell compact. Escape returns
  // focus to its summary; outside interaction and navigation close it.
  function closeHeaderSettings(returnFocus) {
    const menu = root.document.querySelector?.('[data-header-settings][open]');
    if (!menu) return;
    menu.open = false;
    if (returnFocus) menu.querySelector?.('summary')?.focus?.();
  }
  root.document.addEventListener('pointerdown', event => {
    const menu = root.document.querySelector?.('[data-header-settings][open]');
    if (menu && menu.contains && !menu.contains(event.target)) closeHeaderSettings(false);
  });
  root.document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeHeaderSettings(true);
  });
  root.addEventListener('hashchange', () => closeHeaderSettings(false));
  root.YolkTheme = Object.freeze({ renderControl, setPreference, apply, getPreference: () => preference, getResolved: resolved });
  root.renderThemeControl = renderControl;
  apply();
})(window);
