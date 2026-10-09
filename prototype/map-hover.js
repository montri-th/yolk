/* Show the source boundary of the actual drill-down target, independent of fill grain.
 * const hover = YolkMapHover.create({map, L, token:()=>YOLK_HOVER_TOKEN});
 * const unbind = hover.bind(layer, event=>({level:'province'|'district'|'location',
 *   id, feature:EXACT_SOURCE_FEATURE, label:'Click to explore …', title, detail}));
 * hover.show(target,event.latlng); hover.clear(); hover.destroy();
 * Caller owns target lookup/click/navigation. No inferred parent, centroid or extent.
 * Clear on navigation/context changes; rebinding is needed only for a new Leaflet layer.
 */
(function (root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  function usableFeature(feature) {
    const geometry = feature?.type === 'Feature' ? feature.geometry : null;
    if (!geometry || !['Polygon','MultiPolygon'].includes(geometry.type) || !Array.isArray(geometry.coordinates)) return false;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    return polygons.length > 0 && polygons.every(polygon => Array.isArray(polygon) && polygon.length > 0 && polygon.every(ring => {
      if (!Array.isArray(ring) || ring.length < 4) return false;
      const first = ring[0], last = ring[ring.length - 1];
      return Array.isArray(first) && Array.isArray(last) && first.length >= 2 && last.length >= 2 && Number.isFinite(first[0]) && Number.isFinite(first[1]) && Math.abs(first[0]) <= 180 && Math.abs(first[1]) <= 90 && first[0] === last[0] && first[1] === last[1];
    }));
  }
  function targetKey(target) { return target && ['province','district','location'].includes(target.level) && target.id != null ? `${target.level}:${target.id}` : null; }
  function create(options = {}) {
    const map = options.map, L = options.L || root.L;
    if (!map || !L?.geoJSON) throw new TypeError('YolkMapHover requires the existing Leaflet map and L');
    let active = null, outline = null, tooltip = null, destroyed = false;
    const bindings = new Set(), brandContent = new WeakMap();
    let tooltipContent = null, dismissedKey = null, leaveTimer = null, tooltipHovered = false, focusedKey = null;
    const tooltipElements = new WeakSet();
    function cancelLeave() { if (leaveTimer != null) root.clearTimeout?.(leaveTimer); leaveTimer = null; }
    function deferredClear(key) { cancelLeave(); const finish=()=>{leaveTimer=null;if(!tooltipHovered && focusedKey!==key)clear(key);}; if(root.setTimeout)leaveTimer=root.setTimeout(finish,160);else finish(); }
    function bindTooltipPointer() { const element=tooltip?.getElement?.();if(!element?.addEventListener || tooltipElements.has(element))return;tooltipElements.add(element);L.DomEvent?.disableClickPropagation?.(element);L.DomEvent?.disableScrollPropagation?.(element);element.addEventListener('mouseenter',()=>{tooltipHovered=true;cancelLeave();});element.addEventListener('mouseleave',()=>{tooltipHovered=false;if(active)deferredClear(active.key);}); }
    const colour = () => String(typeof options.token === 'function' ? options.token() || '' : options.token || '').trim();
    function remove(layer, immediate = false) {
      const element = immediate ? layer?.getElement?.() : null;
      if (layer?.remove) layer.remove(); else if (layer && map.removeLayer) map.removeLayer(layer);
      // Leaflet can retain a closed tooltip for its fade-out. Its content must not
      // coexist with the next scope tooltip during pointer/keyboard transitions.
      if (element?.remove) element.remove();
    }
    function clear(expected) {
      if (expected && active?.key !== (typeof expected === 'string' ? expected : targetKey(expected))) return false;
      cancelLeave();tooltipHovered=false;remove(outline); remove(tooltip,true); outline = null; tooltip = null; tooltipContent = null; active = null;
      return true;
    }
    function dismiss() { if(!active)return false;const key=active.key;clear();dismissedKey=key;return true; }
    function escape(event) { if(event.key==='Escape' && dismiss()){event.preventDefault?.();event.stopPropagation?.();} }
    root.document?.addEventListener?.('keydown',escape,true);
    function fitTooltip(latlng) {
      const container=map.getContainer?.(),element=tooltip?.getElement?.();
      if(!container?.getBoundingClientRect||!element?.getBoundingClientRect||!map.latLngToContainerPoint||!map.containerPointToLatLng)return;
      const frame=container.getBoundingClientRect(),box=element.getBoundingClientRect(),top=frame.top+8,bottom=frame.bottom-8;
      if(!Number.isFinite(frame.top)||!Number.isFinite(frame.bottom)||!Number.isFinite(box.top)||!Number.isFinite(box.bottom)||bottom<=top)return;
      // Leaflet centres its tooltip around the geographic anchor. Move that
      // presentation anchor inward; the source target, camera and data stay fixed.
      const delta=box.top<top?top-box.top:box.bottom>bottom?bottom-box.bottom:0;
      if(!delta)return;
      const point=map.latLngToContainerPoint(latlng),scale=container.clientHeight>0?(frame.bottom-frame.top)/container.clientHeight:1;
      if(!Number.isFinite(point?.x)||!Number.isFinite(point?.y)||!Number.isFinite(scale)||scale<=0)return;
      tooltip.setLatLng(map.containerPointToLatLng([point.x,point.y+delta/scale]));
    }
    function show(target, latlng) {
      if (destroyed) return false;
      const key = targetKey(target), color = colour();
      if (!key || !usableFeature(target.feature) || !String(target.label || '').trim() || !color) { clear(); return false; }
      if(key===dismissedKey)return false;dismissedKey=null;cancelLeave();
      const label = String(target.label), title = String(target.title || label), detail = String(target.detail || '');
      const locale=target.lang||root.document?.documentElement?.lang;let brandHTML='';
      if(target.brandBreakdown&&root.YolkSupplyTreemap?.render){const cached=brandContent.get(target.brandBreakdown);if(cached?.lang===locale)brandHTML=cached.html;else {brandHTML=root.YolkSupplyTreemap.render(target.brandBreakdown,{compact:true,lang:locale,id:'supply-hover-brand-breakdown'});brandContent.set(target.brandBreakdown,{lang:locale,html:brandHTML});}}
      const content = brandHTML ? `<strong class="workspace-hover-title">${esc(title)}</strong><span class="workspace-hover-detail">${esc(detail)}</span>${brandHTML}` : detail ? `<strong class="workspace-hover-title">${esc(title)}</strong><span class="workspace-hover-detail">${esc(detail)}</span>` : esc(label);
      if (!active || active.key !== key || active.feature !== target.feature) {
        // Keep the single tooltip instance while only replacing its exact outline.
        remove(outline); outline = null; active = null;
        try {
          outline = L.geoJSON(target.feature, {interactive:false, bubblingMouseEvents:false, ...(options.pane ? {pane:options.pane} : {}), style:{color, weight:2, opacity:1, fill:false, dashArray:null, interactive:false, lineCap:'round', lineJoin:'round'}}).addTo(map);
          outline.bringToFront?.();
          active = {key, level:target.level, id:target.id, feature:target.feature, label, color};
        } catch (_) { clear(); return false; }
      } else if (active.color !== color) { outline.setStyle?.({color}); active.color = color; }
      active.label = label;
      if (latlng && L.tooltip) {
        if (!tooltip) {tooltip = L.tooltip({direction:'auto', offset:[12,0], opacity:1, interactive:true, className:'workspace-map-hover-tooltip'}).setLatLng(latlng).setContent(content).addTo(map);tooltipContent=content;}
        else {tooltip.setLatLng(latlng);if(tooltipContent!==content){tooltip.setContent(content);tooltipContent=content;}}
        bindTooltipPointer();fitTooltip(latlng);
      } else if (tooltip) { remove(tooltip,true); tooltip = null; tooltipContent = null; }
      return true;
    }
    function bind(layer, getTarget) {
      if (destroyed || !layer?.on || typeof getTarget !== 'function') return () => {};
      let lastTarget = null, element = null;
      const enter = event => {
        let target;
        try { target = getTarget(event); } catch (_) { clear(lastTarget); return; }
        if (!target) { clear(lastTarget); return; }
        lastTarget = target;
        layer.getElement?.()?.setAttribute?.('aria-label',String(target.label || ''));
        const anchor = event?.latlng || (event?.type === 'focus' ? layer.getBounds?.()?.getCenter?.() : null);
        show(target,anchor);
      };
      const leave = () => {const key=targetKey(lastTarget);if(key===dismissedKey)dismissedKey=null;if(key)deferredClear(key);lastTarget=null;};
      const blur = () => {const key=focusedKey||targetKey(lastTarget);focusedKey=null;if(key)clear(key);if(key===dismissedKey)dismissedKey=null;lastTarget=null;};
      const focus = event => {enter({...event, type:'focus'});focusedKey=targetKey(lastTarget);};
      const attachFocus = () => {
        const next = layer.getElement?.();
        if (next === element) return;
        if (element?.removeEventListener) { element.removeEventListener('focus',focus); element.removeEventListener('blur',blur); }
        element = next || null;
        if (element?.addEventListener) { element.addEventListener('focus',focus); element.addEventListener('blur',blur); }
      };
      layer.on('mouseover',enter); layer.on('mousemove',enter); layer.on('mouseout',leave); layer.on('add',attachFocus); attachFocus();
      const unbind = () => {
        layer.off?.('mouseover',enter); layer.off?.('mousemove',enter); layer.off?.('mouseout',leave); layer.off?.('add',attachFocus);
        if (element?.removeEventListener) { element.removeEventListener('focus',focus); element.removeEventListener('blur',blur); }
        blur(); bindings.delete(unbind);
      };
      bindings.add(unbind); return unbind;
    }
    function destroy() { if (destroyed) return; for (const unbind of [...bindings]) unbind(); clear();root.document?.removeEventListener?.('keydown',escape,true); destroyed = true; }
    return Object.freeze({show,clear,dismiss,bind,destroy,getState:()=>({active:!!active,level:active?.level || null,id:active?.id ?? null,label:active?.label || '',key:active?.key || '',bindingCount:bindings.size})});
  }
  root.YolkMapHover = Object.freeze({create,usableFeature,version:'1.9.1'});
})(typeof window !== 'undefined' ? window : globalThis);
