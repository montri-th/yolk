/* Reusable branch popup. Public search context only; external links run on user activation.
 * Integration: YolkPoiPopup.render(p, {lang, industry, area, ownBrandId, ownBrandName}).
 * area: visible label string, or {nameTh/nameEn, provinceNameTh/provinceNameEn}.
 * Preserve the map's existing data-workspace-open-poi click handler. Leaflet maxWidth:360.
 * Google Maps URL: https://developers.google.com/maps/documentation/urls/get-started
 * AI Mode entry: https://support.google.com/websearch/answer/16011537
 * google.com/ai currently redirects to /search?udm=50&aep=11. q is a best-effort
 * prefilled query, not a supported third-party API; retain plain Search fallback.
 */
(function (root) {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const text = (lang, th, en) => lang === 'en' ? en : th;
  const icon = name => root.YolkIcons?.icon(name) || '';
  const clean = (value, max = 100) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  function language(options) { return options.lang === 'en' ? 'en' : options.lang === 'th' ? 'th' : root.document?.documentElement?.lang?.startsWith('en') ? 'en' : 'th'; }
  function label(value, lang) {
    if (value && typeof value === 'object') return value[lang] || value[lang === 'en' ? 'th' : 'en'] || '';
    return value || '';
  }
  function brandName(p, lang) {
    const record = root.YolkBrands?.record?.(p.brandId) || (root.YOLK_RUNTIME?.brandPresets?.brands || []).find(b => b.brandId === p.brandId);
    return clean(label(record?.name, lang) || p.brand || text(lang, 'ยังไม่ทราบแบรนด์', 'Brand not identified'));
  }
  function branchName(p, lang) { return clean(label(p.name, lang) || (lang === 'en' ? p.name_en || p.name_th : p.name_th || p.name_en) || text(lang, 'รายการสาขา', 'Branch record')); }
  function areaLabel(area, lang) {
    if (typeof area === 'string') return clean(area, 100);
    if (!area || typeof area !== 'object') return '';
    const name = area[lang === 'en' ? 'nameEn' : 'nameTh'] || label(area.name, lang);
    const province = area[lang === 'en' ? 'provinceNameEn' : 'provinceNameTh'];
    return clean([name, province].filter(Boolean).join(' · '), 100);
  }
  function relationship(p, lang) {
    const key = p.relation === 'own' ? 'own' : p.relation === 'competitor' ? 'competitor' : 'unverified';
    // O/C/U remain source-friendly codes; visible symbols express party, never quantity.
    return {key, symbol:{own:'O', competitor:'C', unverified:'U'}[key], glyph:{own:'shield',competitor:'swords',unverified:'fact_check'}[key], name:text(lang, ...({own:['สาขาเรา','Our store'], competitor:['คู่แข่ง','Competitor'], unverified:['รอตรวจสอบ','To verify']}[key]))};
  }
  function validPoint(p) { return typeof p.lat === 'number' && typeof p.lng === 'number' && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180; }
  function publicContext(p, options = {}) {
    const lang = language(options), industry = options.industry || p.industryId || p.sourceDataset;
    const own = clean(options.ownBrandName || label(root.YolkBrands?.record?.(options.ownBrandId)?.name, lang), 70);
    return {lang, industry:['fuel','grocery','nonbank'].includes(industry) ? industry : 'other', brand:brandName(p, lang), branch:branchName(p, lang), area:areaLabel(options.area, lang), own, point:validPoint(p) ? `${p.lat}, ${p.lng}` : ''};
  }
  function prompt(p, options = {}) {
    const c = publicContext(p, options), subject = [c.brand, c.branch, c.area, c.point].filter(Boolean).join(' · ');
    const question = {
      fuel: ['ช่วยตรวจสถานีและบริเวณนี้: ฝั่งถนน ทางเข้าออก จุดกลับรถ และสถานีอื่นใกล้เคียงเป็นอย่างไร', 'Check this station and its surroundings: road side, access, U-turns and nearby fuel stations'],
      grocery: ['ช่วยตรวจร้านและบริเวณนี้: รูปแบบร้าน เวลาเปิด ชุมชน แหล่งงาน และร้านอื่นใกล้เคียงมีอะไรบ้าง', 'Check this store and its surroundings: store format, opening hours, homes, workplaces and nearby grocery stores'],
      nonbank: ['ช่วยตรวจสาขาและบริเวณนี้: บริการ สถานะเปิด ตลาด แหล่งงาน และสาขาผู้ให้บริการอื่นใกล้เคียงมีอะไรบ้าง', 'Check this branch and its surroundings: services, opening status, markets, workplaces and nearby financial-service branches'],
      other: ['ช่วยตรวจแบรนด์ สถานะเปิด ทางเข้าถึง และกิจการใกล้เคียงของจุดนี้', 'Check this place’s brand, opening status, access and nearby businesses']
    }[c.industry];
    const purpose = c.own ? text(c.lang, ` เพื่อเตรียมสำรวจโอกาสขยายสาขาของ ${c.own}`, ` to prepare an expansion-site visit for ${c.own}`) : text(c.lang, ' เพื่อเตรียมสำรวจทำเลขยายสาขา', ' to prepare an expansion-site visit');
    return `${text(c.lang, ...question)}: ${subject}${purpose}. ${text(c.lang, 'อ้างแหล่งข้อมูลพร้อมวันที่ และแยกสิ่งที่ต้องตรวจหน้างาน ไม่เดายอดขายหรือจำนวนลูกค้า', 'Cite dated sources and separate items needing a site visit. Do not infer sales or customer counts.')}`;
  }
  function links(p, options = {}) {
    const question = prompt(p, options), lang = language(options);
    const query = new URLSearchParams({q:question, hl:lang});
    const ai = new URLSearchParams(query); ai.set('udm', '50'); ai.set('aep', '11');
    const maps = validPoint(p) ? new URLSearchParams({api:'1', map_action:'pano', viewpoint:`${p.lat},${p.lng}`}) : null;
    return Object.freeze({prompt:question, streetView:maps ? `https://www.google.com/maps/@?${maps}` : null, aiMode:`https://www.google.com/search?${ai}`, search:`https://www.google.com/search?${query}`});
  }
  function compactMark(p) {
    return (root.YOLK_RUNTIME?.brandLogos?.entries || []).find(b => b.brandId === p.brandId && b.verifiedSquareGraphic === true && /^assets\/brands\/[a-zA-Z0-9_.-]+$/.test(b.localPath || ''));
  }
  function mark(p) {
    const entry = compactMark(p);
    if (!entry?.localPath) return `<span class="yolk-poi-mark-fallback" aria-hidden="true">${icon('store')}</span>`;
    const assetFor = theme => entry.variants?.[theme] || (entry.themeSupport === 'both' || entry.themeSupport === theme + 'Only' ? entry : null);
    const safeAsset = asset => asset && /^assets\/brands\/[a-zA-Z0-9_.-]+$/.test(asset.localPath || '');
    return `<span class="yolk-poi-mark" aria-hidden="true">${['light','dark'].map(theme => {
      const asset = assetFor(theme);
      return safeAsset(asset) ? `<img class="yolk-poi-mark-${theme}" src="${esc(asset.localPath)}?v=${esc((asset.sha256 || '').slice(0,12))}" width="44" height="44" alt="" decoding="async">` : `<span class="yolk-poi-mark-${theme} yolk-poi-mark-fallback">${icon('store')}</span>`;
    }).join('')}</span>`;
  }
  function marker(p = {}, options = {}) {
    const lang=language(options), relation=relationship(p,lang), branded=!!compactMark(p);
    const cue=icon(relation.glyph);
    return `<span class="yolk-supply-pin yolk-supply-pin-${relation.key}${branded?' yolk-supply-pin-branded':''}" aria-hidden="true" data-supply-party="${relation.key}">${branded?mark(p):`<span class="yolk-supply-pin-symbol">${cue}</span>`}${branded?`<span class="yolk-supply-pin-badge">${cue}</span>`:''}</span>`;
  }
  function verification(p, lang) {
    if (p.status === 'verified') return text(lang, 'ทีมตรวจแล้ว', 'Team verified');
    if (p.status === 'closed') return text(lang, 'บันทึกว่าปิด · ตรวจล่าสุดอีกครั้ง', 'Recorded closed · recheck current status');
    if (p.status === 'pending' || p.relation === 'unverified') return text(lang, 'รอตรวจข้อมูลและสถานะเปิด', 'Identity or operation needs checking');
    return p.sourceRecord ? text(lang, 'รายการต้นทาง · ยังไม่สำรวจหน้างาน', 'Source record · not field checked') : text(lang, 'ทีมบันทึก · รอตรวจข้อมูล', 'Team record · not yet verified');
  }
  function render(p = {}, options = {}) {
    const lang = language(options), relation = relationship(p, lang), urls = links(p, {...options, lang}), area = areaLabel(options.area, lang);
    const action = (url, glyph, title, cls = '') => `<a class="yolk-poi-action ${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${icon(glyph)}<span>${title}</span>${icon('open_in_new')}</a>`;
    return `<section class="yolk-poi-popup" aria-label="${esc(text(lang, 'ข้อมูลจุดสาขา', 'Branch pin details'))}">
      <div class="yolk-poi-heading">${mark(p)}<div><strong class="yolk-poi-brand">${esc(brandName(p, lang))}</strong><span class="yolk-poi-branch">${esc(branchName(p, lang))}</span></div></div>
      <div class="yolk-poi-relationship"><span class="yolk-poi-relation-symbol yolk-poi-relation-${relation.key}" aria-hidden="true">${icon(relation.glyph)}</span><span>${esc(relation.name)}</span>${area ? `<span class="yolk-poi-area">${esc(area)}</span>` : ''}</div>
      <p class="yolk-poi-verification">${icon('fact_check')}${esc(verification(p, lang))}${p.observedAt && /^\d{4}-\d{2}-\d{2}$/.test(p.observedAt) ? ` · ${esc(p.observedAt)}` : ''}</p>
      <div class="yolk-poi-actions">${urls.streetView ? action(urls.streetView, 'explore', 'Street View') : `<span class="yolk-poi-unavailable">${text(lang, 'ยังไม่มีพิกัดสำหรับ Street View', 'Street View needs usable coordinates')}</span>`}${action(urls.aiMode, 'search', 'Google AI Mode')}</div>
      <button type="button" class="yolk-poi-open" data-workspace-open-poi="${esc(p.id || '')}">${icon('edit')}<span>${text(lang, 'ดูข้อมูลสาขา', 'View branch')}</span>${icon('arrow_back')}</button>
      <details class="yolk-poi-question"><summary>${icon('help')}${text(lang, 'คำถามสำหรับสำรวจทำเล', 'Question for your site study')}</summary><p>${esc(urls.prompt)}</p><p>${text(lang, 'หาก AI Mode เปิดไม่ได้ ใช้คำถามเดียวกันใน','If AI Mode is unavailable, use the same question in')} <a href="${esc(urls.search)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Google Search ${icon('open_in_new')}</a></p></details>
    </section>`;
  }
  root.YolkPoiPopup = Object.freeze({render, marker, mark, prompt, links, publicContext, relationship, validPoint, version:'1.8.0'});
})(typeof window !== 'undefined' ? window : globalThis);
