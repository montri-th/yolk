/* CityMETER: Yolk — location map, v1.3.
 * OSM street tiles; ESA WorldCover 2021 Sentinel-2 annual composite via Terrascope.
 * No satellite imagery or remote tiles are bundled. No prefetch/offline tile download.
 * Only approved GeoJSON represents a verified boundary. extent3857 is fit-only.
 */
(function(global){
  'use strict';
  let instance=null, sequence=0;
  const categories={
    own:{th:'สาขาเรา',en:'Our branches',symbol:'B'},
    competitor:{th:'คู่แข่ง',en:'Competitors',symbol:'C'},
    unverified:{th:'รอตรวจสอบ',en:'To verify',symbol:'?'},
    factory:{th:'โรงงาน',en:'Factories',symbol:'F'},
    hotel:{th:'โรงแรม',en:'Hotels',symbol:'H'},
    hospital:{th:'โรงพยาบาล',en:'Hospitals',symbol:'+'},
    school:{th:'โรงเรียน',en:'Schools',symbol:'S'},
    other:{th:'จุดสำคัญอื่น',en:'Other places',symbol:'•'}
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const txt=(lang,th,en)=>lang==='en'?en:th;
  const uiIcon=name=>global.YolkIcons?.icon(name)||'';
  const numeric=v=>typeof v==='number'&&Number.isFinite(v);
  const safePoint=p=>numeric(p?.lat)&&numeric(p?.lng)&&Math.abs(p.lat)<=85&&Math.abs(p.lng)<=180;
  const label=(key,lang)=>categories[key]?.[lang==='en'?'en':'th']||categories.other[lang==='en'?'en':'th'];
  function polygonValid(feature){
    const g=feature?.type==='Feature'?feature.geometry:feature;
    if(!g||!['Polygon','MultiPolygon'].includes(g.type))return false;
    const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;
    return Array.isArray(polys)&&polys.length>0&&polys.every(rings=>Array.isArray(rings)&&rings.length>0&&rings.every(ring=>Array.isArray(ring)&&ring.length>=4&&ring.every(p=>Array.isArray(p)&&numeric(p[0])&&numeric(p[1])&&Math.abs(p[0])<=180&&Math.abs(p[1])<=85)&&ring[0][0]===ring[ring.length-1][0]&&ring[0][1]===ring[ring.length-1][1]));
  }
  function extentBounds(extent){
    if(!Array.isArray(extent)||extent.length!==4||!extent.every(numeric)||extent[0]>=extent[2]||extent[1]>=extent[3])return null;
    const ll=(x,y)=>[Math.atan(Math.sinh(y/6378137))*180/Math.PI,x/6378137*180/Math.PI];
    const bounds=[ll(extent[0],extent[1]),ll(extent[2],extent[3])];
    return bounds.flat().every(Number.isFinite)&&bounds.every(p=>Math.abs(p[0])<=85&&Math.abs(p[1])<=180)?bounds:null;
  }
  function context(area,pois,lang){
    const supplied=area?.mapContext || global.YOLK_MAP_CONTEXT?.[area?.id];
    if(supplied){
      const status=['verified','source','draft','synthetic'].includes(supplied.boundaryStatus)?supplied.boundaryStatus:'draft';
      const boundary=polygonValid(supplied.boundary)?supplied.boundary:null;
      const records=(Array.isArray(supplied.pois)?supplied.pois:pois||[]).filter(p=>!p.archived&&p.status!=='closed'&&(p.area==null||String(p.area)===String(area.id)));
      return {...supplied,boundary,boundaryStatus:boundary?status:'missing',pois:records.filter(safePoint).map(p=>({...p,category:categories[p.category]?p.category:p.relation==='own'?'own':p.relation==='competitor'?'competitor':'unverified'})),missingCoordinateCount:records.filter(p=>!safePoint(p)).length,fitBounds:extentBounds(area.extent3857)};
    }
    if(area?.synthetic===true&&global.YolkDemoMapContext)return global.YolkDemoMapContext.scene(area,pois,lang);
    const records=(pois||[]).filter(p=>String(p.area)===String(area?.id)&&!p.archived&&p.status!=='closed');
    return {boundary:null,boundaryStatus:'missing',pois:records.filter(safePoint).map(p=>({...p,category:categories[p.category]?p.category:p.relation==='own'?'own':p.relation==='competitor'?'competitor':'unverified'})),missingCoordinateCount:records.filter(p=>!safePoint(p)).length,fitBounds:extentBounds(area?.extent3857),sourceLabel:txt(lang,'พิกัดจากรายการใน workspace','Coordinates from workspace records')};
  }
  function render(area,pois,lang='th'){
    const c=context(area,pois,lang), synthetic=c.synthetic||c.boundaryStatus==='synthetic';
    const available=Object.keys(categories).filter(k=>c.pois.some(p=>p.category===k));
    const note=synthetic?txt(lang,'ขอบเขตและจุดทั้งหมดเป็นภาพจำลอง แผนที่พื้นหลังเป็นข้อมูลจริง','The boundary and all pins are illustrative. The basemap shows real geography.'):
      c.boundaryStatus==='missing'?txt(lang,'ยังไม่มีขอบเขตที่ตรวจสอบแล้ว แสดงเฉพาะจุดที่มีพิกัด','No verified boundary yet. Only records with coordinates are shown.'):
      c.boundaryStatus==='draft'?txt(lang,'ขอบเขตฉบับร่าง · รอทีมตรวจสอบ','Draft boundary · pending team review'):c.boundaryStatus==='source'?txt(lang,'ขอบเขตจาก CityMETER · ใช้วิเคราะห์ทำเล ไม่ใช่เอกสารรับรองเขตทางกฎหมาย','CityMETER boundary for location analysis; not a certified statutory boundary.'):txt(lang,'ขอบเขตที่ผ่านการตรวจสอบ · ดูแหล่งข้อมูลด้านล่าง','Verified boundary · source shown below');
    return `<section class="yl-location-map ${area.demand===true?'is-yolk':''}" aria-labelledby="yl-map-title" data-location-map>
      <div class="yl-map-heading"><div><h2 id="yl-map-title">${area.demand===true?(global.YolkIcons?.yolkIcon()||''):''}${txt(lang,'ขอบเขตทำเลและจุดสำคัญ','Location boundary & key places')}</h2><p>${area.demand===true?txt(lang,'Yolk · ไข่แดงที่ Demand สูง ดูสาขาและจุดสำคัญในพื้นที่','Yolk · High demand. Explore branches and key places within the boundary.'):txt(lang,'ดูสาขาและจุดที่มีข้อมูลในทำเล','Explore available branches and places in this location')}</p></div><span class="yl-map-badge">${synthetic?txt(lang,'ฉากสาธิต','Demo scene'):txt(lang,'แผนที่ทำเล','Location map')}</span></div>
      <div class="yl-map-controls"><div class="yl-basemaps" role="group" aria-label="${txt(lang,'แผนที่พื้นหลัง','Basemap')}">
        <button type="button" class="yl-basemap active" data-map-style="simplified" aria-pressed="true">${uiIcon('map')}${txt(lang,'เรียบง่าย','Simplified')}</button>
        <button type="button" class="yl-basemap" data-map-style="satellite" aria-pressed="false">${uiIcon('satellite_alt')}${txt(lang,'ดาวเทียม','Satellite')}</button>
        <button type="button" class="yl-basemap" data-map-style="detailed" aria-pressed="false">${uiIcon('layers')}${txt(lang,'รายละเอียด','Detailed')}</button>
      </div><button type="button" class="yl-map-fit" data-map-fit>${uiIcon('location_on')}${txt(lang,'ดูทั้งทำเล','Fit location')}</button></div>
      <div class="yl-map-surface" data-basemap="simplified"><div class="yl-map-canvas" id="yl-location-map" role="region" aria-label="${txt(lang,'แผนที่โต้ตอบ เลื่อนและซูมได้','Interactive map: pan and zoom')}"></div><div class="yl-map-loading" data-map-loading>${txt(lang,'กำลังเตรียมแผนที่…','Preparing map…')}</div></div>
      <div class="yl-map-network" role="status" aria-live="polite" data-map-network hidden><span></span><button type="button" data-map-retry>${txt(lang,'ลองอีกครั้ง','Retry')}</button></div>
      <div class="yl-map-underlay"><div class="yl-map-layers" role="group" aria-label="${txt(lang,'ชั้นข้อมูล','Map layers')}">${c.boundary?`<label><input type="checkbox" data-map-layer="boundary" checked><span class="yl-boundary-key" aria-hidden="true"></span>${txt(lang,'ขอบเขต','Boundary')}</label>`:''}${available.map(k=>`<label><input type="checkbox" data-map-layer="${k}" checked><span class="yl-map-key yl-key-${k}" aria-hidden="true">${esc(categories[k].symbol)}</span>${esc(label(k,lang))} <b>${c.pois.filter(p=>p.category===k).length}</b></label>`).join('')}</div>
      <p class="yl-map-basemap-note" data-map-basemap-note>${txt(lang,'เรียบง่าย: ลดสีแผนที่ถนน เพื่อให้เห็นจุดและขอบเขตชัด','Simplified: subdued street-map colours keep pins and boundaries clear.')}</p>
      <p class="yl-map-disclosure">${esc(note)}</p>
      ${synthetic?`<p class="yl-map-secondary-note">${txt(lang,'จุดบนแผนที่ใช้สาธิตการใช้งาน ไม่ได้นำไปคำนวณ Supply','Map pins demonstrate the interface and are excluded from Supply calculations.')}</p>`:`<p class="yl-map-secondary-note">${txt(lang,'แสดงเฉพาะรายการที่มีพิกัดในชุดข้อมูลนี้ ยังไม่ใช่รายการครบทุกสาขาหรือทุกกิจกรรม','Only available coordinate records are shown. This is not a complete inventory of branches or activities.')}</p>`}
      ${c.sourceLabel?`<p class="yl-map-secondary-note">${txt(lang,'แหล่งขอบเขตและจุด: ','Boundary & pin source: ')}${esc(c.sourceLabel)}${c.observedAt?' · '+esc(c.observedAt):''}</p>`:''}
      ${c.missingCoordinateCount?`<p class="yl-map-secondary-note">${c.missingCoordinateCount} ${txt(lang,'รายการยังไม่มีพิกัด จึงไม่แสดงบนแผนที่','records have no coordinates and are not mapped.')}</p>`:''}
      <details class="yl-map-poi-details"><summary>${txt(lang,'จุดที่แสดงบนแผนที่','Places on this map')} <span data-map-visible-count>${c.pois.length}</span></summary><ul class="yl-map-poi-list">${c.pois.map((p,i)=>`<li data-map-list-item="${esc(p.category)}"><button type="button" data-map-poi="${i}"><span class="yl-map-key yl-key-${esc(p.category)}" aria-hidden="true">${esc(categories[p.category]?.symbol||'•')}</span><span><strong>${esc(p.name||p.name_th||p.name_en||label(p.category,lang))}</strong><small>${esc(label(p.category,lang))}${p.brand?' · '+esc(p.brand):''}</small></span><span class="yl-map-list-arrow" aria-hidden="true">↗</span></button></li>`).join('')}</ul>${!c.pois.length?`<p>${txt(lang,'ยังไม่มีรายการที่มีพิกัดในทำเลนี้','No coordinate records for this location yet.')}</p>`:''}</details>
      </div></section>`;
  }
  function destroy(){
    if(!instance)return;
    instance.cleanup.forEach(fn=>fn());
    if(instance.map)instance.map.remove();
    instance=null;
  }
  function mount(area,pois,lang='th'){
    destroy();
    const root=document.querySelector('[data-location-map]');if(!root)return null;
    const c=context(area,pois,lang),canvas=root.querySelector('.yl-map-canvas'),loading=root.querySelector('[data-map-loading]');
    if(!global.L){loading.textContent=txt(lang,'เปิดแผนที่ไม่ได้ รายการจุดด้านล่างยังดูได้','Map unavailable. The place list remains available.');root.querySelectorAll('.yl-basemap,[data-map-fit],[data-map-layer]').forEach(b=>b.disabled=true);return null;}
    const L=global.L,id=++sequence,cleanup=[],groups={},markers=[],selected=new Set(Object.keys(categories));
    const map=L.map(canvas,{zoomControl:false,scrollWheelZoom:false,minZoom:6,maxZoom:19,preferCanvas:false,attributionControl:true});
    instance={map,cleanup,id};
    L.control.zoom({position:'bottomright',zoomInTitle:txt(lang,'ขยาย','Zoom in'),zoomOutTitle:txt(lang,'ย่อ','Zoom out')}).addTo(map);
    L.control.scale({position:'bottomleft',imperial:false,maxWidth:110}).addTo(map);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    const el=map.getContainer();el.setAttribute('tabindex','0');
    const legendColor=key=>getComputedStyle(root).getPropertyValue('--yl-map-'+key).trim()||'#244590';
    let boundary=null;
    if(c.boundary){
      boundary=L.geoJSON(c.boundary,{style:{color:legendColor('boundary'),fillColor:legendColor('boundary'),fillOpacity:.12,opacity:1,weight:3,dashArray:['verified','source'].includes(c.boundaryStatus)?null:'8 5'}}).addTo(map);
      boundary.bindTooltip(txt(lang,c.boundaryStatus==='synthetic'?'ขอบเขตจำลอง':c.boundaryStatus==='draft'?'ขอบเขตฉบับร่าง':c.boundaryStatus==='source'?'ขอบเขตจาก CityMETER':'ขอบเขตที่ตรวจสอบแล้ว',c.boundaryStatus==='synthetic'?'Illustrative boundary':c.boundaryStatus==='draft'?'Draft boundary':c.boundaryStatus==='source'?'CityMETER boundary':'Verified boundary'),{sticky:true});
    }
    Object.keys(categories).forEach(k=>groups[k]=L.layerGroup().addTo(map));
    c.pois.forEach((p,i)=>{
      const key=categories[p.category]?p.category:'other';
      const title=p.name||p.name_th||p.name_en||label(key,lang);
      const icon=L.divIcon({className:'yl-poi-marker',html:`<span class="yl-map-pin yl-key-${key}" aria-hidden="true">${esc(categories[key].symbol)}</span>`,iconSize:[38,38],iconAnchor:[19,19],popupAnchor:[0,-18]});
      const marker=L.marker([p.lat,p.lng],{icon,keyboard:true,title,alt:title}).addTo(groups[key]);
      const origin=p.synthetic||c.synthetic?txt(lang,'จุดจำลอง','Illustrative pin'):p.sourceDataset||txt(lang,'ข้อมูล workspace','Workspace record');
      marker.bindPopup(`<div class="yl-map-popup"><span class="yl-map-popup-kind">${esc(label(key,lang))}</span><strong>${esc(title)}</strong>${p.brand?`<p>${esc(p.brand)}</p>`:''}<small>${esc(origin)}</small></div>`,{maxWidth:280,minWidth:180});
      marker.on('click',()=>{root.querySelectorAll('[data-map-poi]').forEach(b=>b.classList.toggle('selected',b.dataset.mapPoi===String(i)));});
      markers.push(marker);
    });
    const fit=()=>{
      if(boundary?.getBounds().isValid())map.fitBounds(boundary.getBounds(),{padding:[32,32],maxZoom:14,animate:false});
      else if(c.fitBounds)map.fitBounds(c.fitBounds,{padding:[32,32],maxZoom:14,animate:false});
      else if(markers.length)map.fitBounds(L.latLngBounds(c.pois.map(p=>[p.lat,p.lng])),{padding:[50,50],maxZoom:14,animate:false});
      else map.setView(Array.isArray(c.center)?c.center:[13.75,100.5],11);
    };
    fit();loading.hidden=true;
    let activeLayer=null,activeStyle='simplified',tileErrors=0,tileLoads=0,slowTimer;
    const network=root.querySelector('[data-map-network]'),networkText=network.querySelector('span'),surface=root.querySelector('.yl-map-surface');
    const setStatus=(message,retry=false)=>{network.hidden=!message;networkText.textContent=message||'';network.querySelector('button').hidden=!retry;};
    const slow=()=>{clearTimeout(slowTimer);slowTimer=setTimeout(()=>{if(instance?.id===id&&!tileLoads)setStatus(txt(lang,'แผนที่พื้นหลังยังโหลดไม่สำเร็จ ขอบเขตและจุดยังใช้งานได้','Basemap is not loading yet. Boundaries and pins remain usable.'),true);},9000);};
    const attributionOSM='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>';
    const satelliteURL='https://wmts.terrascope.be/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=esa-worldcover-s2rgbnir-10m-2021-v2_tcc&STYLE=default&TILEMATRIXSET=EPSG%3A3857&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}&FORMAT=image%2Fpng&TIME=2021-01-01';
    const satelliteCredit='&copy; <a href="https://esa-worldcover.org/en/data-access" target="_blank" rel="noopener">ESA WorldCover project 2021</a> / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium · <a href="https://docs.terrascope.be/Developers/WebServices/OGC/WMTSv2.html" target="_blank" rel="noopener">Terrascope</a>';
    const setBasemap=style=>{
      if(!['simplified','satellite','detailed'].includes(style))return;
      clearTimeout(slowTimer);tileErrors=0;tileLoads=0;activeStyle=style;setStatus('');
      if(activeLayer){activeLayer.off();map.removeLayer(activeLayer);}
      surface.dataset.basemap=style;
      root.querySelectorAll('[data-map-style]').forEach(button=>{const on=button.dataset.mapStyle===style;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on));});
      root.querySelector('[data-map-basemap-note]').textContent=style==='satellite'?txt(lang,'ภาพดาวเทียม Sentinel-2 ปี 2021 · ความละเอียด 10 ม. ใช้ดูบริบทพื้นที่','Sentinel-2 satellite composite, 2021 · 10 m resolution for area context.'):
        style==='detailed'?txt(lang,'แผนที่ถนนและชื่อสถานที่จาก OpenStreetMap','Streets and place labels from OpenStreetMap.'):
        txt(lang,'เรียบง่าย: ลดสีแผนที่ถนน เพื่อให้เห็นจุดและขอบเขตชัด','Simplified: subdued street-map colours keep pins and boundaries clear.');
      activeLayer=L.tileLayer(style==='satellite'?satelliteURL:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:style==='satellite'?satelliteCredit:attributionOSM,
        minZoom:6,maxZoom:19,maxNativeZoom:style==='satellite'?14:19,
        noWrap:true,updateWhenIdle:true,keepBuffer:1,className:'yl-basemap-tiles',referrerPolicy:'strict-origin-when-cross-origin'
      });
      activeLayer.on('loading',()=>{tileErrors=0;tileLoads=0;slow();});
      activeLayer.on('tileerror',()=>tileErrors++);
      activeLayer.on('tileload',()=>tileLoads++);
      activeLayer.on('load',()=>{
        clearTimeout(slowTimer);
        if(tileErrors)setStatus(tileLoads?txt(lang,'แผนที่บางส่วนโหลดไม่ได้ ลองโหลดใหม่ได้','Some map tiles did not load. You can retry.'):
          txt(lang,'โหลดแผนที่พื้นหลังไม่ได้ ขอบเขตและจุดยังดูได้ ลองอีกครั้งหรือเปลี่ยนแผนที่','Basemap unavailable. Boundaries and pins remain visible. Retry or switch basemap.'),true);
        else setStatus('');
      });
      activeLayer.addTo(map);slow();
      if(global.navigator?.onLine===false)setStatus(txt(lang,'ออฟไลน์อยู่ แผนที่พื้นหลังอาจแสดงไม่ครบ','You are offline. The basemap may be incomplete.'),true);
    };
    const onClick=event=>{
      const button=event.target.closest('button');if(!button||!root.contains(button))return;
      if(button.dataset.mapStyle)setBasemap(button.dataset.mapStyle);
      else if(button.hasAttribute('data-map-fit'))fit();
      else if(button.hasAttribute('data-map-retry'))setBasemap(activeStyle);
      else if(button.hasAttribute('data-map-poi')){
        const i=Number(button.dataset.mapPoi),p=c.pois[i],marker=markers[i];
        if(p&&marker){map.setView([p.lat,p.lng],Math.max(map.getZoom(),15),{animate:!global.matchMedia?.('(prefers-reduced-motion: reduce)').matches});marker.openPopup();canvas.focus({preventScroll:true});}
      }
    };
    const onChange=event=>{
      const input=event.target;if(!input.matches('[data-map-layer]'))return;
      const k=input.dataset.mapLayer,layer=k==='boundary'?boundary:groups[k];
      if(layer){if(input.checked)map.addLayer(layer);else map.removeLayer(layer);}
      if(k!=='boundary'){
        if(input.checked)selected.add(k);else selected.delete(k);
        root.querySelectorAll('[data-map-list-item]').forEach(row=>row.hidden=!selected.has(row.dataset.mapListItem));
        root.querySelector('[data-map-visible-count]').textContent=c.pois.filter(p=>selected.has(p.category)).length;
      }
    };
    root.addEventListener('click',onClick);root.addEventListener('change',onChange);
    cleanup.push(()=>root.removeEventListener('click',onClick),()=>root.removeEventListener('change',onChange),()=>clearTimeout(slowTimer),()=>activeLayer?.off());
    const offline=()=>setStatus(txt(lang,'ออฟไลน์อยู่ แผนที่พื้นหลังอาจแสดงไม่ครบ','You are offline. The basemap may be incomplete.'),true);
    const online=()=>{if(network.hidden===false)setStatus(txt(lang,'เชื่อมต่อแล้ว กด “ลองอีกครั้ง” เพื่อโหลดแผนที่','Connected. Choose Retry to load the map.'),true);};
    global.addEventListener('offline',offline);global.addEventListener('online',online);
    cleanup.push(()=>global.removeEventListener('offline',offline),()=>global.removeEventListener('online',online));
    if(global.ResizeObserver){const observer=new ResizeObserver(()=>map.invalidateSize({pan:false}));observer.observe(canvas);cleanup.push(()=>observer.disconnect());}
    if(global.MutationObserver){const observer=new MutationObserver(()=>{if(boundary)boundary.setStyle({color:legendColor('boundary'),fillColor:legendColor('boundary')});});observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});cleanup.push(()=>observer.disconnect());}
    setBasemap('simplified');
    return map;
  }
  global.YolkLocationMap={render,mount,destroy,context,polygonValid,extentBounds};
  global.renderLocationMap=render;global.mountLocationMap=mount;global.destroyLocationMap=destroy;
})(window);
