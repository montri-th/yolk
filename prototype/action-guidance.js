/* Action feedback only: actual saves, visible final state, no entry/reveal motion. */
(function (global) {
  'use strict';
  if (global.YolkActionGuidance) return;
  const doc = global.document;
  const timing = Object.freeze({feedbackMs: 120, feedbackDistancePx: 2, stateMs: 200, stateEasing: 'cubic-bezier(.2,0,0,1)'});
  const motionQuery = global.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduceKey = 'citymeter-yolk-personal-reduce-motion-v1';
  let reduceLocally = false;
  try {reduceLocally = global.localStorage?.getItem(reduceKey) === 'true';} catch {}
  const seen = new Set(), running = new Set(), timers = new Set();
  let notice = null, announcement = null, noticeTimer = 0, routeKey = '', countKey = '', impactValue = null;
  const text = (lang, th, en) => lang === 'en' ? en : th;
  const number = (n, lang) => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'th-TH').format(n);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const count = targets => Object.values(targets || {}).filter(target => target && !target.archived).length;
  const isReduced = () => reduceLocally || !!motionQuery?.matches;
  const canMove = () => !isReduced() && !doc.hidden;
  const later = (callback, ms) => {const id = global.setTimeout(() => {timers.delete(id); callback();}, ms); timers.add(id); return id;};
  function visible(element) {
    if (!element?.getBoundingClientRect) return false;
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < global.innerHeight && box.right > 0 && box.left < global.innerWidth;
  }
  function destination() {
    return [...doc.querySelectorAll('#sidebar a[href="#targets"], #mobile-nav a[href="#targets"]')].find(visible) || null;
  }
  function animate(element, frames, options = {}, cleanup) {
    if (!element || !canMove() || typeof element.animate !== 'function') {cleanup?.(); return null;}
    try {
      const animation = element.animate(frames, {duration: timing.stateMs, easing: timing.stateEasing, iterations: 1, ...options});
      const run = {animation, cleanup}; running.add(run);
      Promise.resolve(animation.finished).catch(() => {}).finally(() => {running.delete(run); cleanup?.();});
      return animation;
    } catch {cleanup?.(); return null;}
  }
  function feedback(element) {
    return animate(element, [{transform: 'translateY(0)'}, {transform: 'translateY(-2px)', offset: .5}, {transform: 'translateY(0)'}], {duration: timing.feedbackMs});
  }
  function cancelMotion() {
    for (const run of running) {try {run.animation.cancel();} catch {} run.cleanup?.();}
    running.clear(); doc.querySelectorAll('[data-guidance-flight]').forEach(node => node.remove());
  }
  function capture(element) {
    const box = element?.getBoundingClientRect?.();
    return {
      rect: box ? {left: box.left, top: box.top, width: box.width, height: box.height, right: box.right, bottom: box.bottom} : null,
      focused: doc.activeElement === element,
      action: element?.dataset?.action || null,
      strategyAction: element?.dataset?.strategyAction || null,
      id: element?.dataset?.id || null
    };
  }
  function restoreFocus(source) {
    if (!source?.focused) return;
    const controls = doc.querySelectorAll('[data-action="target"], [data-strategy-action="save"]');
    const replacement = [...controls].find(node => node.dataset.id === source.id && (node.dataset.action || null) === source.action && (node.dataset.strategyAction || null) === source.strategyAction);
    replacement?.focus?.({preventScroll: true});
  }
  function countMarkup(targets, lang = 'th') {
    const total = count(targets), caption = text(lang, total + ' ทำเลที่เล็งไว้ใน workspace', total + ' shortlisted locations in workspace');
    return '<span class="nav-shortlist-count" data-shortlist-count="' + total + '" aria-label="' + esc(caption) + '">' + number(total, lang) + '</span>';
  }
  function reduceControl(lang = 'th') {
    return '<label class="personal-motion-control"><input id="yolk-reduce-motion" type="checkbox" data-reduce-motion ' + (reduceLocally ? 'checked' : '') + '><span><strong>' + text(lang, 'ลดการเคลื่อนไหว', 'Reduce motion') + '</strong><small data-reduce-motion-note>' + text(lang, 'ตั้งค่าส่วนตัว · เคารพการตั้งค่าของเครื่องด้วย', 'Personal setting · System preference also applies') + '</small></span></label>';
  }
  function syncReduceControls() {
    doc.documentElement?.setAttribute?.('data-yolk-reduced-motion', String(isReduced()));
    doc.querySelectorAll('[data-reduce-motion]').forEach(input => {input.checked = reduceLocally;});
  }
  function setReduced(value) {
    reduceLocally = !!value;
    try {global.localStorage?.setItem(reduceKey, String(reduceLocally));} catch {}
    if (isReduced()) cancelMotion();
    syncReduceControls(); return isReduced();
  }
  function ensureNotice() {
    if (notice?.isConnected) return notice;
    notice = doc.createElement('div'); notice.id = 'action-guidance'; notice.className = 'action-guidance'; notice.hidden = true;
    notice.setAttribute('role', 'group');
    notice.addEventListener('focusin', () => {global.clearTimeout(noticeTimer); timers.delete(noticeTimer);});
    notice.addEventListener('mouseenter', () => {global.clearTimeout(noticeTimer); timers.delete(noticeTimer);});
    notice.addEventListener('focusout', () => scheduleNoticeHide());
    notice.addEventListener('mouseleave', () => scheduleNoticeHide());
    doc.body.append(notice); return notice;
  }
  function ensureAnnouncement() {
    if (announcement?.isConnected) return announcement;
    announcement = doc.createElement('div'); announcement.id = 'action-guidance-announcement'; announcement.className = 'action-guidance-announcement';
    announcement.setAttribute('role', 'status'); announcement.setAttribute('aria-live', 'polite'); announcement.setAttribute('aria-atomic', 'true');
    doc.body.append(announcement); return announcement;
  }
  function scheduleNoticeHide() {
    global.clearTimeout(noticeTimer); timers.delete(noticeTimer);
    noticeTimer = later(() => {if (notice && !notice.contains(doc.activeElement)) notice.hidden = true;}, 7000);
  }
  function showNotice(message, lang, link = '#targets', linkCaption) {
    const node = ensureNotice();
    node.setAttribute('aria-label', text(lang, 'บันทึกสำเร็จ', 'Action saved'));
    node.innerHTML = '<span class="action-guidance-message">' + (global.YolkIcons?.icon('bookmark_added') || '') + '<span>' + esc(message) + '</span></span><a class="action-guidance-next" href="' + esc(link) + '">' + esc(linkCaption || text(lang, 'ดูรายการเล็งไว้', 'View shortlist')) + (global.YolkIcons?.icon('arrow_forward') || '') + '</a>';
    node.hidden = false; scheduleNoticeHide();
    ensureAnnouncement().textContent = message;
    global.YolkIcons?.captionControls?.(node);
    animate(node, [{transform: 'translateY(2px)'}, {transform: 'translateY(0)'}]);
  }
  function deltaAt(link, delta) {
    if (!link || !delta) return;
    const old = link.querySelector('[data-shortlist-delta]'); old?.remove();
    const badge = doc.createElement('span'); badge.className = 'shortlist-action-delta'; badge.dataset.shortlistDelta = String(delta);
    badge.textContent = delta > 0 ? '+' + delta : '−' + Math.abs(delta); badge.setAttribute('aria-hidden', 'true');
    link.append(badge); feedback(link.querySelector('[data-shortlist-count]'));
    later(() => badge.remove(), 2400);
  }
  function fly(source, link) {
    const box = source?.rect;
    if (!box || !link || !canMove() || box.width <= 0 || box.height <= 0 || box.bottom <= 0 || box.top >= global.innerHeight) return;
    const end = (link.querySelector('[data-shortlist-count]') || link).getBoundingClientRect();
    const token = doc.createElement('span'); token.className = 'guidance-flight'; token.dataset.guidanceFlight = 'shortlist'; token.setAttribute('aria-hidden', 'true');
    token.innerHTML = global.YolkIcons?.icon('bookmark_added') || '+';
    const x = Math.max(16, Math.min(global.innerWidth - 16, box.left + box.width / 2)), y = Math.max(16, Math.min(global.innerHeight - 16, box.top + box.height / 2));
    token.style.left = x + 'px'; token.style.top = y + 'px'; doc.body.append(token);
    const dx = end.left + end.width / 2 - x, dy = end.top + end.height / 2 - y;
    animate(token, [{transform: 'translate(-50%,-50%) scale(1)'}, {transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(.8)'}], {}, () => token.remove());
  }
  function shortlistSaved({event, source, beforeCount, afterCount, name = '', lang = 'th', plan = false} = {}) {
    // This receipt must come from a successful persisted place event, never a optimistic UI click.
    if (!event?.id || event.entity !== 'place' || !['place.created', 'place.updated', 'place.removed'].includes(event.type) || seen.has(event.id)) return false;
    if (!Number.isInteger(beforeCount) || !Number.isInteger(afterCount) || beforeCount < 0 || afterCount < 0 || Math.abs(afterCount - beforeCount) > 1) return false;
    seen.add(event.id); if (seen.size > 256) seen.delete(seen.values().next().value);
    const delta = afterCount - beforeCount, link = destination();
    restoreFocus(source); deltaAt(link, delta);
    if (delta > 0) fly(source, link);
    const named = name ? name + ' · ' : '';
    const message = named + (delta > 0 ? text(lang, 'เพิ่มในรายการเล็งไว้แล้ว', 'Added to shortlist') : delta < 0 ? text(lang, 'นำออกจากรายการเล็งไว้แล้ว', 'Removed from shortlist') : text(lang, plan ? 'บันทึกแผนสำรวจแล้ว' : 'อัปเดตทำเลแล้ว', plan ? 'Survey plan saved' : 'Location updated')) + ' · ' + text(lang, 'ทั้งหมด ' + number(afterCount, lang) + ' ทำเล', number(afterCount, lang) + ' locations total');
    showNotice(message, lang); return true;
  }
  function rendered({route, contextKey = ''} = {}) {
    syncReduceControls();
    const key = contextKey + '|' + route;
    if (routeKey && routeKey !== key) {
      cancelMotion();
      feedback([...doc.querySelectorAll('#sidebar a[aria-current="page"] .yl-icon, #mobile-nav a[aria-current="page"] .yl-icon')].find(visible));
    }
    routeKey = key; countKey = key;
    impactValue = doc.querySelector('[data-simple-count] strong')?.textContent || null;
  }
  function impactChanged({route, contextKey = ''} = {}) {
    if (countKey !== contextKey + '|' + route || route !== 'criteria') return false;
    const node = doc.querySelector('[data-simple-count] strong'), value = node?.textContent || null;
    if (value === impactValue) return false;
    const wasKnown = impactValue !== null; impactValue = value;
    if (wasKnown && value !== null) feedback(node);
    return wasKnown && value !== null;
  }
  function criteriaSaved({event, version, lang = 'th'} = {}) {
    if (!event?.id || event.type !== 'criteria.updated' || seen.has(event.id)) return false;
    seen.add(event.id);
    showNotice(text(lang, 'ใช้เกณฑ์ทีม v' + version + ' แล้ว · ดูผลบนแผนที่ได้เลย', 'Team criteria v' + version + ' saved · Explore the map results'), lang, '#demand', text(lang, 'ดูไข่แดง', 'Explore Yolks'));
    return true;
  }
  function dispose() {
    cancelMotion(); for (const timer of timers) global.clearTimeout(timer); timers.clear();
    doc.querySelectorAll('[data-shortlist-delta]').forEach(node => node.remove());
    if (notice) notice.hidden = true;
  }
  doc.addEventListener('visibilitychange', () => {if (doc.hidden) dispose();});
  doc.addEventListener('change', event => {if (event.target?.matches?.('[data-reduce-motion]')) setReduced(event.target.checked);});
  global.addEventListener('pagehide', dispose);
  motionQuery?.addEventListener?.('change', () => {if (isReduced()) cancelMotion(); syncReduceControls();});
  // Establish an empty live region before the first save so assistive technology hears its update.
  ensureAnnouncement();
  syncReduceControls();
  global.YolkActionGuidance = Object.freeze({count, countMarkup, capture, shortlistSaved, criteriaSaved, rendered, impactChanged, reduceControl, setReduced, isReduced, cancelMotion, dispose, timing});
})(window);
