/* Show the source boundary of the actual drill-down target, independent of fill grain.
 * const hover = YolkMapHover.create({map, L, token:()=>YOLK_HOVER_TOKEN,
 *   dock:OUTSIDE_MAP_ELEMENT, inspectionHost:OPTIONAL_OUTSIDE_MAP_PANEL,
 *   onInspect:targetOrNull=>renderHostInspector(targetOrNull)});
 * const unbind = hover.bind(layer, event=>({level:'province'|'district'|'location',
 *   id, feature:EXACT_SOURCE_FEATURE, label:'Click to explore …', title, detail}));
 * hover.show(target,event.latlng); hover.clear(); hover.destroy();
 * Dock content is text only. Full charts belong to the host's work panel, never
 * over the Leaflet canvas. Caller owns target lookup/click/navigation.
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
    let active = null, outline = null, destroyed = false, inspection = null;
    const bindings = new Set(), surfaces = new Map();
    let dockContent = null, currentDock = null, dismissedKey = null, leaveTimer = null, surfaceHovered = false, focusedKey = null;
    function cancelLeave() { if (leaveTimer != null) root.clearTimeout?.(leaveTimer); leaveTimer = null; }
    function deferredClear(key) { cancelLeave(); const finish=()=>{leaveTimer=null;if(!surfaceHovered && focusedKey!==key)clear(key);}; if(root.setTimeout)leaveTimer=root.setTimeout(finish,160);else finish(); }
    function outsideMap(option) {
      const element = typeof option === 'function' ? option() : option;
      if (!element) return null;
      const container = map.getContainer?.();
      if (element === container || container?.contains?.(element)) throw new TypeError('YolkMapHover presentation must be outside the Leaflet map');
      return element;
    }
    function attachSurface(element) {
      if (!element?.addEventListener || surfaces.has(element)) return;
      const enter=()=>{surfaceHovered=true;cancelLeave();},leave=()=>{surfaceHovered=false;if(active)deferredClear(active.key);};
      element.addEventListener('mouseenter',enter);element.addEventListener('mouseleave',leave);
      surfaces.set(element,{enter,leave});
    }
    function present(target) {
      const dock=outsideMap(options.dock),inspector=outsideMap(options.inspectionHost);
      if(currentDock&&currentDock!==dock){currentDock.hidden=true;currentDock.innerHTML='';}
      currentDock=dock;
      const liveSurfaces=new Set([dock,inspector].filter(Boolean));
      for(const [element,handlers]of surfaces)if(!liveSurfaces.has(element)){element.removeEventListener?.('mouseenter',handlers.enter);element.removeEventListener?.('mouseleave',handlers.leave);surfaces.delete(element);}
      attachSurface(dock);attachSurface(inspector);
      const title=String(target?.title || target?.label || ''),detail=String(target?.detail || ''),lang=String(target?.lang || root.document?.documentElement?.lang || '');
      const content=target?`<strong class="workspace-hover-title">${esc(title)}</strong>${detail?`<span class="workspace-hover-detail">${esc(detail)}</span>`:''}`:'';
      if (dock) {
        dock.classList?.add?.('workspace-map-hover-dock');
        dock.setAttribute?.('data-workspace-hover-dock','');
        dock.setAttribute?.('aria-live','off');
        if (dockContent!==content || dock.innerHTML!==content) dock.innerHTML=content;
        dock.hidden=!target;
      }
      dockContent=content;
      // A mousemove cannot continually rebuild the full work-panel treemap.
      const changed=target? !inspection || inspection.key!==targetKey(target) || inspection.feature!==target.feature || inspection.title!==title || inspection.detail!==detail || inspection.lang!==lang || inspection.brandBreakdown!==target.brandBreakdown : !!inspection;
      inspection=target?{...target,key:targetKey(target),title,detail,lang}:null;
      if(changed&&typeof options.onInspect==='function') { try { options.onInspect(inspection); } catch (_) { /* A work-panel failure cannot steal map navigation. */ } }
    }
    outsideMap(options.dock);outsideMap(options.inspectionHost);
    const colour = () => String(typeof options.token === 'function' ? options.token() || '' : options.token || '').trim();
    function remove(layer) {
      if (layer?.remove) layer.remove(); else if (layer && map.removeLayer) map.removeLayer(layer);
    }
    function clear(expected) {
      if (expected && active?.key !== (typeof expected === 'string' ? expected : targetKey(expected))) return false;
      cancelLeave();surfaceHovered=false;dismissedKey=null;remove(outline);outline=null;active=null;present(null);
      return true;
    }
    function dismiss() { if(!active)return false;const key=active.key;clear();dismissedKey=key;return true; }
    function escape(event) { if(event.key==='Escape' && dismiss()){event.preventDefault?.();event.stopPropagation?.();} }
    root.document?.addEventListener?.('keydown',escape,true);
    function show(target, latlng) {
      if (destroyed) return false;
      const key = targetKey(target), color = colour();
      if (!key || !usableFeature(target.feature) || !String(target.label || '').trim() || !color) { clear(); return false; }
      if(key===dismissedKey)return false;dismissedKey=null;cancelLeave();
      const label = String(target.label);
      if (!active || active.key !== key || active.feature !== target.feature) {
        // The only hover layer is the exact, noninteractive source outline.
        remove(outline); outline = null; active = null;
        try {
          outline = L.geoJSON(target.feature, {interactive:false, bubblingMouseEvents:false, ...(options.pane ? {pane:options.pane} : {}), style:{color, weight:2, opacity:1, fill:false, dashArray:null, interactive:false, lineCap:'round', lineJoin:'round'}}).addTo(map);
          outline.bringToFront?.();
          active = {key, level:target.level, id:target.id, feature:target.feature, label, color};
        } catch (_) { clear(); return false; }
      } else if (active.color !== color) { outline.setStyle?.({color}); active.color = color; }
      active.label = label;
      present(target);
      return true;
    }
    function bind(layer, getTarget) {
      if (destroyed || !layer?.on || typeof getTarget !== 'function') return () => {};
      let lastTarget = null, element = null, bindingFocusKey = null;
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
      const blur = () => {const key=bindingFocusKey||targetKey(lastTarget);if(focusedKey===bindingFocusKey)focusedKey=null;bindingFocusKey=null;if(key)clear(key);if(key===dismissedKey)dismissedKey=null;lastTarget=null;};
      const focus = event => {enter({...event, type:'focus'});bindingFocusKey=targetKey(lastTarget);focusedKey=bindingFocusKey;};
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
    function destroy() { if (destroyed) return; for (const unbind of [...bindings]) unbind(); clear();for(const [element,handlers]of surfaces){element.removeEventListener?.('mouseenter',handlers.enter);element.removeEventListener?.('mouseleave',handlers.leave);}surfaces.clear();root.document?.removeEventListener?.('keydown',escape,true);destroyed=true; }
    return Object.freeze({show,clear,dismiss,bind,destroy,getState:()=>({active:!!active,level:active?.level || null,id:active?.id ?? null,label:active?.label || '',key:active?.key || '',bindingCount:bindings.size,inspection})});
  }
  root.YolkMapHover = Object.freeze({create,usableFeature,version:'1.9.1'});
})(typeof window !== 'undefined' ? window : globalThis);
