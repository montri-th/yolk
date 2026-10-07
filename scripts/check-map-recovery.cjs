/* Current controller with a deterministic public TileLayer/ResizeObserver fixture.
 * Native provider delivery and rendered layouts remain separate evidence. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const prefix=fs.readFileSync(path.join(__dirname,'check-workspace-map.cjs'),'utf8').split('(async()=>{')[0];
const env=Function('require','__dirname',prefix+'\nreturn {h,run,api,L,layer,Element,host,panel,controls,maps,resizeObservers,camera,finePaths,tick};')(require,__dirname);
const {h,run,api,L,layer,Element,host,panel,controls,maps,resizeObservers,camera,finePaths,tick}=env;
const frames=[];h.sandbox.window.requestAnimationFrame=callback=>{frames.push(callback);return frames.length};
const flush=()=>{const work=frames.splice(0);for(const callback of work)callback();};
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
 const report={schemaVersion:1,version:'1.9.3',test:'check-map-recovery',passed:checks.every(c=>c.passed),checks,scope:'Current controller and real source geometry with deterministic public TileLayer/ResizeObserver events. No assertion of provider delivery, physical rendering or screenshot root cause.'};
 const out=path.join(root,'../deliverables/yolk-v1.9.3/map-recovery-regression-results.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.error?'\n'+c.error:''));console.log(JSON.stringify({passed:report.passed,checks:checks.length,report:out}));if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
