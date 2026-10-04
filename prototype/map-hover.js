/* Show the source boundary of the actual drill-down target, independent of fill grain.
 * const hover = YolkMapHover.create({map, L, token:()=>DS_ACTIVE_TOKEN});
 * const unbind = hover.bind(layer, event=>({level:'province'|'district'|'location',
 *   id, feature:EXACT_SOURCE_FEATURE, label:'Click to explore …'}));
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
    const bindings = new Set();
    const colour = () => String(typeof options.token === 'function' ? options.token() || '' : options.token || '').trim();
    function remove(layer) { if (layer?.remove) layer.remove(); else if (layer && map.removeLayer) map.removeLayer(layer); }
    function clear(expected) {
      if (expected && active?.key !== (typeof expected === 'string' ? expected : targetKey(expected))) return false;
      remove(outline); remove(tooltip); outline = null; tooltip = null; active = null;
      return true;
    }
    function show(target, latlng) {
      if (destroyed) return false;
      const key = targetKey(target), color = colour();
      if (!key || !usableFeature(target.feature) || !String(target.label || '').trim() || !color) { clear(); return false; }
      const label = String(target.label);
      if (!active || active.key !== key || active.feature !== target.feature) {
        clear();
        try {
          outline = L.geoJSON(target.feature, {interactive:false, bubblingMouseEvents:false, ...(options.pane ? {pane:options.pane} : {}), style:{color, weight:3, opacity:1, fill:false, dashArray:null, interactive:false, lineCap:'round', lineJoin:'round'}}).addTo(map);
          outline.bringToFront?.();
          active = {key, level:target.level, id:target.id, feature:target.feature, label, color};
        } catch (_) { clear(); return false; }
      } else if (active.color !== color) { outline.setStyle?.({color}); active.color = color; }
      active.label = label;
      if (latlng && L.tooltip) {
        if (!tooltip) tooltip = L.tooltip({direction:'auto', offset:[12,0], opacity:1, interactive:false, className:'workspace-map-hover-tooltip'}).setLatLng(latlng).setContent(esc(label)).addTo(map);
        else { tooltip.setLatLng(latlng); tooltip.setContent(esc(label)); }
      } else if (tooltip) { remove(tooltip); tooltip = null; }
      return true;
    }
    function bind(layer, getTarget) {
      if (destroyed || !layer?.on || typeof getTarget !== 'function') return () => {};
      let lastTarget = null, element = null;
      const enter = event => {
        let target;
        try { target = getTarget(event); } catch (_) { clear(lastTarget); return; }
        if (!target) { clear(lastTarget); return; }
        lastTarget = target; show(target,event?.latlng);
      };
      const leave = () => { if (lastTarget) clear(lastTarget); lastTarget = null; };
      const focus = event => enter({...event, type:'focus'});
      const attachFocus = () => {
        const next = layer.getElement?.();
        if (next === element) return;
        if (element?.removeEventListener) { element.removeEventListener('focus',focus); element.removeEventListener('blur',leave); }
        element = next || null;
        if (element?.addEventListener) { element.addEventListener('focus',focus); element.addEventListener('blur',leave); }
      };
      layer.on('mouseover',enter); layer.on('mousemove',enter); layer.on('mouseout',leave); layer.on('add',attachFocus); attachFocus();
      const unbind = () => {
        layer.off?.('mouseover',enter); layer.off?.('mousemove',enter); layer.off?.('mouseout',leave); layer.off?.('add',attachFocus);
        if (element?.removeEventListener) { element.removeEventListener('focus',focus); element.removeEventListener('blur',leave); }
        leave(); bindings.delete(unbind);
      };
      bindings.add(unbind); return unbind;
    }
    function destroy() { if (destroyed) return; for (const unbind of [...bindings]) unbind(); clear(); destroyed = true; }
    return Object.freeze({show,clear,bind,destroy,getState:()=>({active:!!active,level:active?.level || null,id:active?.id ?? null,label:active?.label || '',key:active?.key || '',bindingCount:bindings.size})});
  }
  root.YolkMapHover = Object.freeze({create,usableFeature,version:'1.7.1'});
})(typeof window !== 'undefined' ? window : globalThis);
