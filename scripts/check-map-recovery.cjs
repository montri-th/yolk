/* Current controller with a deterministic public TileLayer/ResizeObserver fixture.
 * Native provider delivery and rendered layouts remain separate evidence. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const prefix=fs.readFileSync(path.join(__dirname,'check-workspace-map.cjs'),'utf8').split('(async()=>{')[0];
const env=Function('require','__dirname',prefix+'\nreturn {h,run,api,L,layer,Element,host,panel,controls,maps,resizeObservers,camera,finePaths,tick};')(require,__dirname);
const {h,run,api,L,layer,Element,host,panel,controls,maps,resizeObservers,camera,finePaths,tick}=env;
const frames=new Map();let frameID=0;h.sandbox.window.requestAnimationFrame=callback=>{const id=++frameID;frames.set(id,callback);return id;};h.sandbox.window.cancelAnimationFrame=id=>frames.delete(id);
const flush=()=>{const work=[...frames.values()];frames.clear();for(const callback of work)callback();};
const stateBox=new Element(),stateLabel=new Element(),retry=new Element(),retryLabel=new Element(),optionRetry=new Element();
stateBox.hidden=true;retry.setAttribute('data-workspace-basemap-retry','');optionRetry.setAttribute('data-workspace-basemap-retry','');
retry.closest=selector=>selector==='[data-workspace-basemap-status]'?stateBox:null;optionRetry.closest=()=>null;
retry.querySelector=selector=>selector==='[data-workspace-basemap-retry-label]'?retryLabel:null;
controls.set('[data-workspace-basemap-status]',stateBox);controls.set('[data-workspace-basemap-status-label]',stateLabel);
panel.querySelectorAll=selector=>selector==='[data-workspace-basemap-retry]'?[retry,optionRetry]:[];
const tileLayers=[];
L.tileLayer=(url,options)=>{
 const result=layer('tiles',options),add=result.addTo;
 result.url=url;result.redraws=0;result.starts=[];result.viewResetCalls=0;
 result.begin=function(){const tile={layer:this,index:this.starts.length,src:this.url.replace('{z}',String(this.providerZoom)).replace('{x}','948').replace('{y}','561')};this.starts.push(tile);this.handlers.loading?.();this.handlers.tileloadstart?.({tile});return tile;};
 // Layer creation selects integer provider zoom without changing the camera.
 // The redraw fixture deliberately exposes the reported Leaflet 1.9.4 fractional
 // zoom failure, so the current retry controller must not use that path.
 result.addTo=function(map){add.call(this,map);this.activeMap=map;const reset=()=>{assert(this.activeMap,'A retired layer must not receive map view-reset callbacks');this.viewResetCalls++;};map.on('viewreset zoom',reset);this.on('remove',()=>map.off('viewreset zoom',reset));this.providerZoom=Math.min(Math.round(map.getZoom()),options.maxNativeZoom);this.begin();return this;};
 result.redraw=function(){this.redraws++;this.providerZoom=this._map.getZoom();for(const tile of this.starts)this.handlers.tileunload?.({tile});this.begin();return this;};
 tileLayers.push(result);return result;
};
const originalMap=L.map;L.map=(element,options)=>{
 const map=originalMap(element,options),remove=map.removeLayer,on=map.on;map.options=options;map.retiredTiles=[];map.eventListeners=new Map();
 map.on=function(names,handler){on.call(this,names,handler);for(const name of names.split(/\s+/)){if(!this.eventListeners.has(name))this.eventListeners.set(name,new Set());this.eventListeners.get(name).add(handler);}return this;};
 map.off=function(names,handler){for(const name of names.split(/\s+/)){this.eventListeners.get(name)?.delete(handler);if(!this.eventListeners.get(name)?.size)this.eventListeners.delete(name);}return this;};
 map.fire=function(name){for(const handler of [...this.eventListeners.get(name)||[]])handler({type:name,target:this});return this;};
 // Leaflet Layer._layerAdd installs map-event cleanup as a once('remove')
 // listener. Public removeLayer fires that listener before nulling the map.
 map.removeLayer=function(layer){if(layer.kind==='tiles'){this.retiredTiles.push(layer);layer.handlers.remove?.();layer.activeMap=null;}return remove.call(this,layer);};return map;
};
const checks=[];
async function check(name,action){try{await action();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:String(error.stack||error)});}}
const settle=(layer,tile)=>{layer.handlers.tileload({tile});layer.handlers.load();};
const data=()=>run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))');
(async()=>{
 api.mount();await tick();await tick();flush();
 await check('Initial tile start is tracked before addTo, then real completion hides loading without inferring data availability',()=>{
  const current=tileLayers.at(-1),tile=current.starts[0];assert.equal(api.getState().basemap.pending,1);assert.equal(api.getState().basemap.state,'loading');assert.equal(stateBox.hidden,false);assert(stateLabel.textContent.includes('ข้อมูลพื้นที่ยังดูได้'));assert.equal(retry.hidden,true);
  settle(current,tile);assert.equal(api.getState().basemap.state,'ready');assert.equal(api.getState().basemap.loaded,1);assert.equal(stateBox.hidden,true);assert.equal(maps.length,1);
 });
 await check('Mixed loaded and failed tiles show a recoverable partial error; removed grid tiles no longer keep stale errors',()=>{
  const current=tileLayers.at(-1),failed=current.begin();current.handlers.tileerror({tile:failed});current.handlers.load();
  assert.equal(api.getState().basemap.state,'partial_error');assert.equal(api.getState().basemap.failed,1);assert.equal(retry.hidden,false);assert.equal(stateBox.hidden,false);assert(stateLabel.textContent.includes('บางส่วนโหลดไม่ได้'));
  current.handlers.tileunload({tile:failed});assert.equal(api.getState().basemap.failed,0);assert.equal(api.getState().basemap.state,'ready');assert.equal(stateBox.hidden,true);
 });
 await check('Explicit background retry recreates only the same provider/style layer and ignores all retired tile callbacks',()=>{
  const previous=tileLayers.at(-1),old=previous.starts[0],lateLoad=previous.handlers.tileload,lateError=previous.handlers.tileerror,lateStart=previous.handlers.tileloadstart,lateComplete=previous.handlers.load,before=camera(),source=data(),paths=[...maps[0].renderOrder],invalidations=maps[0].invalidations,count=tileLayers.length;
  assert.equal(api.retryBasemap(),true);const current=tileLayers.at(-1);assert.notEqual(current,previous);assert.equal(previous.redraws,0);assert.equal(tileLayers.length,count+1);assert.equal(maps[0].invalidations,invalidations);assert.equal(current.url,previous.url);assert.deepEqual(current.options,previous.options);assert(maps[0].retiredTiles.includes(previous));assert(!maps[0].layers.includes(previous));assert(maps[0].layers.includes(current));assert.equal(maps[0].layers.filter(layer=>layer.kind==='tiles').length,1);assert.deepEqual(Object.keys(previous.handlers),[]);
  assert.equal(api.getState().basemap.pending,1);assert.equal(api.getState().basemap.loaded,0);lateLoad({tile:old});lateError({tile:old});lateStart({tile:old});lateComplete();assert.equal(api.getState().basemap.failed,0);assert.equal(api.getState().basemap.loaded,0);assert.equal(api.getState().basemap.pending,1);
  settle(current,current.starts[0]);assert.equal(api.getState().basemap.state,'ready');assert.deepEqual(camera(),before);assert.equal(data(),source);assert.deepEqual(maps[0].renderOrder,paths);
 });
 await check('Fractional camera zoom survives same-style retry while provider tile requests remain integer for every basemap',()=>{
  const source=data(),paths=[...maps[0].renderOrder];
  for(const [style,zoom] of [['simplified',10.25],['detailed',10.75],['satellite',14.75]]){
   maps[0].center=[15.5,102.5];maps[0].zoom=zoom;api.setBasemap(style);const previous=tileLayers.at(-1),before=camera(),count=tileLayers.length;settle(previous,previous.starts[0]);
   assert.equal(api.retryBasemap(),true);const current=tileLayers.at(-1),providerZoom=Math.min(Math.round(zoom),style==='satellite'?14:19);assert.equal(tileLayers.length,count+1);assert.notEqual(current,previous);assert.equal(current.url,previous.url);assert.deepEqual(current.options,previous.options);assert.equal(current.providerZoom,providerZoom);assert(Number.isInteger(current.providerZoom));assert.equal(current.starts[0].src,previous.starts[0].src);assert(!current.starts[0].src.includes(String(zoom)));assert.equal(previous.redraws,0);assert.equal(api.getState().basemap.style,style);assert.equal(api.getState().basemap.pending,1);assert.deepEqual(camera(),before);assert.equal(maps[0].layers.filter(layer=>layer.kind==='tiles').length,1);
   settle(current,current.starts[0]);assert.equal(api.getState().basemap.state,'ready');assert.equal(api.getState().basemap.loaded,1);
  }
  assert.equal(data(),source);assert.deepEqual(maps[0].renderOrder,paths);assert.equal(maps.length,1);
 });
 await check('Retry and style replacement remove retired map listeners before clearing local handlers, so later resize/zoom is safe',()=>{
  const vendor=fs.readFileSync(path.join(root,'prototype/vendor/leaflet-1.9.4/leaflet.js'),'utf8');assert(vendor.includes('this.once("remove",function(){i.off(e,this)},this)'),'Bundled Leaflet owns map-listener cleanup on its remove event');assert(vendor.includes('t.fire("remove")),t._map=t._mapToAdd=null'),'Bundled public removal fires cleanup before clearing the layer map');
  const map=maps[0],source=data(),paths=[...map.renderOrder],before=camera();
  for(const style of [null,'detailed',null,'simplified',null,'satellite',null]){
   const previous=tileLayers.at(-1),oldCalls=previous.viewResetCalls;if(style)api.setBasemap(style);else api.retryBasemap();const current=tileLayers.at(-1);assert.notEqual(current,previous);assert.equal(map.eventListeners.get('viewreset')?.size,1);assert.equal(map.eventListeners.get('zoom')?.size,1);assert.equal(previous.activeMap,null);assert.deepEqual(Object.keys(previous.handlers),[]);
   map.invalidateSize({pan:false,animate:false});assert.doesNotThrow(()=>{map.fire('viewreset');map.fire('zoom');});assert.equal(previous.viewResetCalls,oldCalls);assert.equal(current.viewResetCalls,2);assert.equal(map.layers.filter(layer=>layer.kind==='tiles').length,1);settle(current,current.starts[0]);assert.equal(api.getState().basemap.state,'ready');
  }
  assert.deepEqual(camera(),before);assert.equal(data(),source);assert.deepEqual(map.renderOrder,paths);assert.equal(maps.length,1);
 });
 await check('Style switching rejects late events from the retired layer, preserving the view and current imagery state',()=>{
  const previous=tileLayers.at(-1),lateError=previous.handlers.tileerror,lateLoad=previous.handlers.tileload,old=previous.starts.at(-1),before=camera(),source=data();
  api.setBasemap('satellite');const current=tileLayers.at(-1);assert(current.url.includes('TIME=2021-01-01'));lateError({tile:old});lateLoad({tile:old});assert.equal(api.getState().basemap.pending,1);assert.equal(api.getState().basemap.failed,0);assert.equal(api.getState().basemap.loaded,0);
  settle(current,current.starts[0]);assert.equal(api.getState().basemap.state,'ready');assert.equal(api.getState().basemap.style,'satellite');assert.deepEqual(camera(),before);assert.equal(data(),source);assert.equal(maps.length,1);
 });
 await check('Retry is a deliberate accessible action, bilingual and independent from the common data-source warning',()=>{
  const current=tileLayers.at(-1),tile=current.begin();current.handlers.tileerror({tile});current.handlers.load();run('Y.lang="en"');api.sync();assert(stateLabel.textContent.includes('area data remain usable'));assert.equal(retryLabel.textContent,'Reload background');assert(retry.getAttribute('aria-label').includes('keeping this view'));
  const before=camera(),count=tileLayers.length;panel.listeners.click({target:{closest:()=>retry}});const renewed=tileLayers.at(-1);assert.equal(tileLayers.length,count+1);assert.notEqual(renewed,current);assert.equal(current.redraws,0);assert.equal(api.getState().basemap.failed,0);assert.deepEqual(camera(),before);settle(renewed,renewed.starts[0]);run('Y.lang="th"');api.sync();
 });
 await check('Expansion and collapse preserve a manually chosen camera even when the observer sees a major width change before the frame',()=>{
  const observer=resizeObservers[0];assert(observer.elements.includes(host)&&observer.elements.includes(panel));maps[0].center=[15.5,102.5];maps[0].zoom=7.25;const before=camera(),source=data(),initialWidth=host.clientWidth;
  api.setMapExpanded(true);host.clientWidth=initialWidth+440;observer.callback();flush();observer.callback();assert.equal(api.getState().mapExpanded,true);assert.equal(panel.dataset.workspaceMapExpanded,'true');assert.equal(controls.get('[data-workspace-map-expand]').getAttribute('aria-pressed'),'true');assert.deepEqual(camera(),before);
  api.setMapExpanded(false);host.clientWidth=initialWidth;observer.callback();flush();observer.callback();assert.deepEqual(camera(),before);assert.equal(data(),source);assert.equal(api.getState().mapExpanded,false);assert.equal(maps.length,1);
 });
 await check('Real bundled Leaflet clamps distant pan targets to Thailand at fractional zoom without excluding source geometry',()=>{
  const vm=require('node:vm'),document={documentElement:{style:{}},createElement(){return {style:{},getContext(){return {}},setAttribute(){},appendChild(){},addEventListener(){},removeEventListener(){}}},addEventListener(){}};
  const native={document,navigator:{userAgent:'node',platform:'node'},screen:{deviceXDPI:1,logicalXDPI:1},setTimeout,clearTimeout};native.window=native;
  vm.runInNewContext(fs.readFileSync(path.join(root,'prototype/vendor/leaflet-1.9.4/leaflet.js'),'utf8'),native);const RealL=native.L,options=maps[0].options,guard=RealL.latLngBounds(options.maxBounds),proto=RealL.Map.prototype;
  assert.equal(RealL.version,'1.9.4');assert.equal(options.maxBoundsViscosity,1);assert.equal(options.minZoom,3);assert(tileLayers.every(tile=>tile.options.noWrap===true),'Every active provider must reject horizontal world copies');
  const map={getSize:()=>RealL.point(780,540),project:(point,zoom)=>RealL.CRS.EPSG3857.latLngToPoint(RealL.latLng(point),zoom),unproject:(point,zoom)=>RealL.CRS.EPSG3857.pointToLatLng(point,zoom),_getBoundsOffset:proto._getBoundsOffset,_rebound:proto._rebound};
  for(const zoom of [3,5.25,10.25,15.75])for(const target of [[24,55],[-40,150],[70,-120]]){const bounded=proto._limitCenter.call(map,RealL.latLng(target),zoom,guard);assert(guard.contains(bounded),'Remote camera target must return to the Thailand context at '+zoom);}
  const local=RealL.latLng(13.7,100.5),unchanged=proto._limitCenter.call(map,local,10.25,guard);assert.equal(unchanged,local,'An in-bounds manual camera must stay exact');
  const source=JSON.parse(fs.readFileSync(path.join(root,'prototype/data/real/province-boundaries.geojson'),'utf8'));const checkCoordinates=coordinates=>{if(typeof coordinates[0]==='number'){assert(guard.contains([coordinates[1],coordinates[0]]),'Guard must contain every actual Thai source coordinate');return;}coordinates.forEach(checkCoordinates);};source.features.forEach(f=>checkCoordinates(f.geometry.coordinates));
 });
 await check('Whole-Thailand zoom-out floor follows actual host projection, allows full-country fit, and clamps only out-of-envelope cameras',()=>{
  const vm=require('node:vm'),document={documentElement:{style:{}},createElement(){return {style:{},getContext(){return {}},setAttribute(){},appendChild(){},addEventListener(){},removeEventListener(){}}},addEventListener(){}};
  const native={document,navigator:{userAgent:'node',platform:'node'},screen:{deviceXDPI:1,logicalXDPI:1},setTimeout,clearTimeout};native.window=native;vm.runInNewContext(fs.readFileSync(path.join(root,'prototype/vendor/leaflet-1.9.4/leaflet.js'),'utf8'),native);
  const RealL=native.L,proto=RealL.Map.prototype;RealL.Browser.any3d=true;
  const map={options:{crs:RealL.CRS.EPSG3857,minZoom:3,maxZoom:19,zoomSnap:.25},_loaded:true,_zoom:9,center:RealL.latLng(13.2,101),cameraCalls:0,project:proto.project,getScaleZoom:proto.getScaleZoom,getMinZoom:proto.getMinZoom,getMaxZoom:proto.getMaxZoom,setMinZoom:proto.setMinZoom,setZoom:proto.setZoom,getZoom(){return this._zoom;},getCenter(){return this.center;},fire(){return this;},setView(center,zoom,options){this.cameraCalls++;this.center=center;this._zoom=proto._limitZoom.call(this,zoom);this.lastZoomOptions=options;return this;}};
  const code=fs.readFileSync(path.join(root,'prototype/workspace-map.js'),'utf8'),start=code.indexOf(' function countryContextZoomFloor('),end=code.indexOf(' function fitNavigation(',start),context={S:{map},THAILAND_VIEW_BOUNDS:[[4.5,96.3],[21.5,106.7]]};assert(start>=0&&end>start);vm.createContext(context);vm.runInContext(code.slice(start,end),context);
  const guard=RealL.latLngBounds(context.THAILAND_VIEW_BOUNDS),northWest=map.project(guard.getNorthWest(),0),southEast=map.project(guard.getSouthEast(),0),projectionSize=southEast.subtract(northWest),floors=[];
  for(const [width,height]of [[320,260],[390,420],[780,640],[1272,612],[1612,740]]){const calls=map.cameraCalls,floor=context.applyMapZoomFloor(width,height),fitZoom=map.getScaleZoom(Math.min((width-36)/projectionSize.x,(height-36)/projectionSize.y),0);floors.push(floor);assert.equal(floor*4,Math.round(floor*4));assert(floor<=fitZoom,'Full Thai context must remain visible at floor');assert(fitZoom-floor>=.25-1e-12&&fitZoom-floor<.5+1e-12,'Floor allows only a quarter-to-half zoom of extra country context');assert(projectionSize.x*Math.pow(2,floor)<=width-36);assert(projectionSize.y*Math.pow(2,floor)<=height-36);assert.equal(map.getZoom(),9);assert.equal(map.cameraCalls,calls);assert.equal(map.getMinZoom(),floor);map.setZoom(1,{animate:false});assert.equal(map.getZoom(),floor,'Explicit zoom-out cannot escape the country floor');map._zoom=9;}
  assert(floors.every(floor=>floor>3),'Normal reviewed hosts must prevent a world-scale zoom3');
  context.applyMapZoomFloor(1612,740);const largeFloor=map.getMinZoom();context.applyMapZoomFloor(390,420);assert(map.getMinZoom()<largeFloor,'Shrinking host must lower floor without feedback from old minZoom');assert.equal(map.getZoom(),9);
  map._zoom=3;const center=map.center,before=map.cameraCalls,floor=context.applyMapZoomFloor(780,640);assert.equal(map.getZoom(),floor);assert.equal(map.center,center);assert.equal(map.cameraCalls,before+1);assert.equal(map.lastZoomOptions.zoom.animate,false);assert.equal(context.countryContextZoomFloor(36,20),3,'Tiny host keeps the historical safe fallback');
 });
 await check('Real TileLayer view initialization keeps a rounded provider grid and the exact fractional camera transform',()=>{
  const vm=require('node:vm'),document={documentElement:{style:{}},createElement(){return {style:{},getContext(){return {}},setAttribute(){},appendChild(){},addEventListener(){},removeEventListener(){}}},addEventListener(){}};
  const native={document,navigator:{userAgent:'node',platform:'node'},screen:{deviceXDPI:1,logicalXDPI:1},setTimeout,clearTimeout};native.window=native;vm.runInNewContext(fs.readFileSync(path.join(root,'prototype/vendor/leaflet-1.9.4/leaflet.js'),'utf8'),native);
  for(const [zoom,maximum]of [[5.25,19],[10.75,19],[14.75,14]]){const tile=native.L.tileLayer('https://example.invalid/{z}/{x}/{y}.png',{minZoom:3,maxZoom:19,maxNativeZoom:maximum});let transformed,updated;tile._map={};tile._levels={};tile._updateLevels=()=>{};tile._resetGrid=()=>{};tile._update=center=>{updated=center;};tile._pruneTiles=()=>{};tile._setZoomTransforms=(center,cameraZoom)=>{transformed={center,zoom:cameraZoom};};const center=native.L.latLng(13.7,100.5);tile._setView(center,zoom,false,false);assert.equal(tile._tileZoom,Math.min(Math.round(zoom),maximum));assert(Number.isInteger(tile._tileZoom));assert.equal(transformed.zoom,zoom);assert.equal(transformed.center,center);assert.equal(updated,center);}
 });
 await check('Settled host resize reconstructs only the imagery grid once, preserves camera/paths/source, and ignores repeated same-size callbacks',()=>{
  const map=maps[0],observer=resizeObservers[0],width=host.clientWidth,height=host.clientHeight,before=camera(),source=data(),paths=[...map.renderOrder],previous=tileLayers.at(-1),count=tileLayers.length;
  host.clientWidth=width+80;host.clientHeight=height+70;observer.callback();observer.callback();assert.equal(tileLayers.length,count,'Wait for final rendered host dimensions');flush();const current=tileLayers.at(-1);assert.equal(tileLayers.length,count+1);assert.notEqual(current,previous);assert.equal(previous.redraws,0);assert(Number.isInteger(current.providerZoom));assert.equal(map.layers.filter(layer=>layer.kind==='tiles').length,1);assert.deepEqual(map.renderOrder,paths);assert.equal(data(),source);assert.equal(map.views,before.views);assert.deepEqual(map.center,before.center);assert.equal(map.zoom,before.zoom);
  const settledCount=tileLayers.length;observer.callback();flush();assert.equal(tileLayers.length,settledCount,'Repeated observer delivery must not repeatedly reload');host.clientWidth=width;host.clientHeight=height;observer.callback();flush();
 });
 await check('Resize waits across changing dimensions, and an explicit style replacement cancels stale pending work',()=>{
  const observer=resizeObservers[0],width=host.clientWidth,height=host.clientHeight,count=tileLayers.length,before=camera();host.clientHeight=height+40;observer.callback();host.clientHeight=height+90;flush();assert.equal(tileLayers.length,count,'A changing host needs another settled frame');flush();assert.equal(tileLayers.length,count+1);assert.deepEqual(camera(),before);
  host.clientHeight=height+120;observer.callback();api.setBasemap('detailed');const selected=tileLayers.at(-1),selectedCount=tileLayers.length;flush();assert.equal(tileLayers.length,selectedCount);assert.equal(tileLayers.at(-1),selected);assert.equal(api.getState().basemap.style,'detailed');host.clientWidth=width;host.clientHeight=height;observer.callback();flush();
 });
 await check('Escape closes options before collapsing the map and restores focus to the relevant labelled control',()=>{
  const expand=controls.get('[data-workspace-map-expand]'),options=controls.get('[data-workspace-controls-toggle]');api.setMapExpanded(true);flush();panel.listeners.click({target:{closest:()=>options}});assert.equal(api.getState().controlsOpen,true);
  panel.listeners.keydown({key:'Escape',preventDefault(){}});assert.equal(api.getState().controlsOpen,false);assert.equal(api.getState().mapExpanded,true);assert(options.focused);
  panel.listeners.keydown({key:'Escape',preventDefault(){}});flush();assert.equal(api.getState().mapExpanded,false);assert(expand.focused);assert.equal(expand.getAttribute('aria-label'),'ขยายแผนที่');run('Y.lang="en"');api.sync();assert.equal(expand.getAttribute('aria-label'),'Expand map');run('Y.lang="th"');api.sync();
 });
 await check('Explicit scope fit uses actual map-host edges without subtracting the external legend; fractional zoom is allowed',()=>{
  const before=data();api.home();assert.equal(maps[0].options.zoomSnap,.25);assert.equal(maps[0].options.zoomDelta,.5);assert.deepEqual(Array.from(maps[0].fitOptions.paddingTopLeft),[18,18]);assert.deepEqual(Array.from(maps[0].fitOptions.paddingBottomRight),[18,18]);assert.equal(maps[0].fitOptions.animate,false);assert.equal(data(),before);
 });
 await check('Canonical Opportunities keeps fine-area selection in the same workflow with no forced detail-route callback',async()=>{
  const index=JSON.parse(fs.readFileSync(path.join(root,'prototype/data/real/hierarchy-index.json'),'utf8')),id=run('AREAS.find(a=>a.province==="10").id'),district=index.areas[id].districtIds[0];let forced=0;api.mount({onArea:()=>forced++});
  for(const route of ['market','strategy']){h.sandbox.testOpportunityRoute=route;run('Y.route=testOpportunityRoute;draft=structuredClone(Y.criteria)');api.navigate({level:'district',provinceCode:'10',districtId:district},{fit:false,notify:false});await tick();await tick();const path=finePaths().find(p=>p.feature.properties.areaId===id);assert(path);path.handlers.click();assert.equal(api.getNavigation().level,'location');assert.equal(run('Y.route'),route);assert.equal(forced,0);assert(finePaths().every(p=>p.style.fill===false));}
 });
 const report={schemaVersion:1,testedAt:new Date().toISOString(),version:'1.9.7',test:'check-map-recovery',passed:checks.every(c=>c.passed),checks,scope:'Current controller/source geometry with deterministic public TileLayer/ResizeObserver events, plus actual bundled Leaflet bounds and TileLayer initialization methods. Provider delivery, rendered gap coverage and screenshots remain native-browser evidence.'};
 const out=path.join(root,'../deliverables/yolk-v1.9.3/map-recovery-regression-results.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.error?'\n'+c.error:''));console.log(JSON.stringify({passed:report.passed,checks:checks.length,report:out}));if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
