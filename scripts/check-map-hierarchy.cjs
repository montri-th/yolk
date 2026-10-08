/* Current controller and exact source geometry; native border visibility is separate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const prefix=fs.readFileSync(path.join(__dirname,'check-workspace-map.cjs'),'utf8').split('(async()=>{')[0];
const env=Function('require','__dirname',prefix+'\nreturn {h,run,api,maps,document,boundaryPaths,provincePaths,districtPaths,finePaths,hitPaths,camera,tick};')(require,__dirname);
const {h,run,api,maps,document,boundaryPaths,provincePaths,districtPaths,finePaths,hitPaths,camera,tick}=env;
const checks=[],index=JSON.parse(fs.readFileSync(path.join(root,'prototype/data/real/hierarchy-index.json'),'utf8'));
const halo=p=>p.element.getAttribute('data-workspace-boundary-halo')==='parent';
const paintSignature=()=>JSON.stringify(maps[0].renderOrder.filter(p=>p.style.fill).map(p=>({id:p.feature?.properties?.areaId||p.feature?.properties?.id||p.feature?.properties?.code,fill:p.style.fillColor,opacity:p.style.fillOpacity})).sort((a,b)=>String(a.id).localeCompare(String(b.id))));
async function check(name,action){try{await action();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:String(error.stack||error)});}}
async function navigate(nav){api.navigate(nav,{fit:false,notify:false});await tick();await tick();api.sync();}
/* Resolve the real filter cascade for the simple SVG selectors used here. This
 * models CSS specificity and emitted stylesheet order, rather than assuming a
 * later file defeats the legacy white-stroke rule. Unsupported syntax fails. */
function boundaryFilterCascade(attrs,reverse=false){
 const html=fs.readFileSync(path.join(root,'prototype/index.html'),'utf8');
 const files=[...html.matchAll(/<link\b[^>]*href="([^"?]+)(?:\?[^" ]*)?"[^>]*>/g)].map(m=>m[1]).filter(f=>['workspace-map.css','map-hover.css'].includes(f));
 assert.equal(files.length,2,'Use the actual emitted boundary stylesheet order');if(reverse)files.reverse();
 const lineage=[{tag:'section',classes:['workspace-map-panel'],attrs:{}},{tag:'div',classes:['leaflet-overlay-pane'],attrs:{}},{tag:'svg',classes:[],attrs:{}},{tag:'path',classes:[],attrs}];
 function matchPart(part,node){
  const tag=part.match(/^[a-z]+/i)?.[0];if(tag&&tag.toLowerCase()!==node.tag)return false;
  for(const m of part.matchAll(/\.([\w-]+)/g))if(!node.classes.includes(m[1]))return false;
  for(const m of part.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g))if(!(m[1] in node.attrs)||(m[2]!==undefined&&node.attrs[m[1]]!==m[2]))return false;
  assert.equal(part.replace(/^[a-z]+/i,'').replace(/\.[\w-]+/g,'').replace(/\[[\w-]+(?:="[^"]*")?\]/g,''),'','Unsupported selector must not silently pass the cascade fixture');return true;
 }
 function matches(selector){const parts=selector.trim().split(/\s+/);let at=lineage.length-1;if(!matchPart(parts.at(-1),lineage[at]))return false;for(let i=parts.length-2;i>=0;i--){while(--at>=0&&!matchPart(parts[i],lineage[at])){}if(at<0)return false;}return true;}
 let winning=null,order=0;
 for(const file of files){const css=fs.readFileSync(path.join(root,'prototype',file),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');for(const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){const filter=m[2].match(/(?:^|;)\s*filter\s*:\s*([^;]+)(?:;|$)/);if(!filter)continue;for(const selector of m[1].split(',')){order++;if(!matches(selector))continue;const score=[(selector.match(/#[\w-]+(?=[^\]]*(?:\[|$))/g)||[]).length,(selector.match(/\.[\w-]+|\[[^\]]+\]/g)||[]).length,(selector.match(/(?:^|\s)[a-z]+/gi)||[]).length];const rule={filter:filter[1].trim(),score,order};if(!winning||score.some((n,i)=>n!==winning.score[i]&&score.slice(0,i).every((v,j)=>v===winning.score[j])&&n>winning.score[i])||score.every((n,i)=>n===winning.score[i])&&order>winning.order)winning=rule;}}}
 return winning?.filter??null;
}
(async()=>{
 api.mount();await tick();await tick();run('Y.route="market";Y.loading=false;Y.loadError=null');
 const id=run('AREAS.find(a=>a.province==="10").id'),district=index.areas[id].districtIds[0];
 const source=run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))');
 await check('Country keeps ordinary thin white analytical strokes and province hierarchy without legacy shadow treatment',async()=>{
  await navigate({level:'country'});assert.equal(districtPaths().length,928);assert.equal(provincePaths().length,77);
  assert(districtPaths().every(p=>p.style.color==='#FFFFFF'&&p.style.weight===.30&&p.style.fillOpacity===1&&!halo(p)));
  assert(provincePaths().every(p=>p.style.color==='#FFFFFF'&&p.style.weight===1.2&&p.style.fill===false&&!halo(p)&&p.element.getAttribute('data-workspace-boundary-role')==='province'));
  assert(maps[0].renderOrder.filter(halo).every(p=>p.style.fill===false),'No analytical fill may receive boundary contrast treatment');
 });
 await check('Province and district views support white parent context above thinner original fine-area fills',async()=>{
  for(const nav of [{level:'province',provinceCode:'10'},{level:'district',provinceCode:'10',districtId:district}]){
   await navigate(nav);assert(finePaths().length>0);
   assert(finePaths().every(p=>p.style.weight===.30&&p.style.fillOpacity===1&&!halo(p)));
   assert(districtPaths().every(p=>p.style.fill===false&&p.style.weight>.30&&!halo(p)));
   assert(provincePaths().every(p=>p.style.fill===false&&p.style.weight>Math.max(...districtPaths().map(d=>d.style.weight))&&!halo(p)));
  }
 });
 await check('Theme, criteria and repeated sync preserve actual fills, source values, camera and a single target per scope',()=>{
  const before=camera(),paint=paintSignature(),paths=maps[0].renderOrder.length;
  for(const theme of ['dark','light']){document.documentElement.dataset.theme=theme;api.sync();assert.equal(paintSignature(),paint);assert.deepEqual(camera(),before);assert.equal(maps[0].renderOrder.length,paths);}
  run('Y.route="criteria";draft=structuredClone(Y.criteria)');api.sync();assert.deepEqual(camera(),before);const rows=new Map(api.snapshot().nextRows.map(a=>[a.id,a]));for(const p of finePaths()){const a=rows.get(p.feature.properties.areaId);assert.equal(p.style.fillColor,a.eligible&&a.demand===true?h.sandbox.window.YolkTierStyle.paint(a.qualifyingTier):'#E8EDE8');assert.equal(p.style.fillOpacity,1);}
  assert.equal(run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),source);
 });
 await check('Exact wider hover remains yellow, transparent and independent from neutral parent support',async()=>{
  await navigate({level:'country'});const before=camera(),paint=paintSignature(),hit=hitPaths().find(p=>p.feature.properties.code==='10');assert(hit);
  hit.handlers.mouseover({latlng:{lat:13.75,lng:100.5}});const hover=maps[0].renderOrder.at(-1);
  assert.equal(hover.feature,hit.feature);assert.equal(hover.style.color,'#FFBC1F');assert.equal(hover.style.fill,false);assert(!halo(hover));assert.equal(paintSignature(),paint);assert.deepEqual(camera(),before);hit.handlers.mouseout();
 });
 await check('Supply points retain the quiet hierarchy without halos or any restored child-outline mesh',async()=>{
  run('Y.route="supply";Y.pointState="ready"');api.setSupplyView('points');
  for(const nav of [{level:'country'},{level:'province',provinceCode:'10'},{level:'district',provinceCode:'10',districtId:district}]){
   await navigate(nav);assert(maps[0].renderOrder.every(p=>!halo(p)));
   if(nav.level==='country'){assert.equal(districtPaths().length,0);assert.equal(finePaths().length,0);}
   if(nav.level==='province'){assert.equal(finePaths().length,0);assert(districtPaths().every(p=>p.style.weight===.65&&p.style.fill===false));}
   if(nav.level==='district'){assert.equal(districtPaths().length,1);assert.equal(finePaths().length,0);}
  }
 });
 await check('Selected fine location remains an unfilled white outline without a contrast field or changed POIs',async()=>{
  const before=run('JSON.stringify(Y.pois)');await navigate({level:'location',provinceCode:'10',districtId:district,areaId:id});
  assert.equal(finePaths().length,1);assert(finePaths().every(p=>p.style.fill===false&&p.style.color==='#FFFFFF'&&p.style.weight===.8&&!halo(p)));assert(maps[0].renderOrder.every(p=>!halo(p)));assert.equal(run('JSON.stringify(Y.pois)'),before);
 });
 await check('Ordinary analytical paths have no remaining drop-shadow; contrast does not filter tiles, markers or data fields',()=>{
  const css=fs.readFileSync(path.join(root,'prototype/workspace-map.css'),'utf8');assert(!css.includes('drop-shadow'));
  assert(maps[0].renderOrder.every(p=>!halo(p)),'The historical parent-shadow selector must match no live path');
 });
 await check('Actual emitted stylesheet cascade leaves ordinary filled and unfilled white source paths unfiltered',()=>{
  const parent={'data-workspace-boundary-role':'province',fill:'none',stroke:'#FFFFFF','stroke-opacity':'1'},child={'data-workspace-boundary-role':'district',fill:'none',stroke:'#FFFFFF','stroke-opacity':'1'},data={fill:'#FFBC1F',stroke:'#FFFFFF','stroke-opacity':'1'};
  for(const reverse of [false,true])for(const attrs of [parent,child,data])assert.equal(boundaryFilterCascade(attrs,reverse),null);
 });
 const overlay=pane=>maps[0].renderOrder.filter(p=>p.options.pane===pane);
 await check('Stroke-only public panes place a neutral keyline under white boundaries and hover above both but below branch markers',()=>{
  for(const [name,zIndex]of [['workspaceBoundaryKeyline','410'],['workspaceBoundaryWhite','411'],['workspaceBoundaryHover','412']]){const pane=maps[0].getPane(name);assert(pane);assert.equal(pane.style.zIndex,zIndex);assert.equal(pane.style.pointerEvents,'none');}
  const css=fs.readFileSync(path.join(root,'prototype/workspace-map.css'),'utf8');assert(css.includes('.workspace-map-panel .workspace-boundary-keyline,.workspace-map-panel .workspace-boundary-white{pointer-events:none;filter:none}'));
  const tokens=fs.readFileSync(path.join(root,'prototype/vendor/lds-0.9.7/color-srgb-10.production.css'),'utf8');assert(tokens.includes('--ldm-map-marker-halo-dark: #101318;'));assert(+maps[0].getPane('workspaceBoundaryHover').style.zIndex<600);
 });
 await check('Country, province, district and selected location keylines reuse exact visible source geometry and ordinary white widths',async()=>{
  run('Y.route="supply"');api.setSupplyView('regions');
  for(const nav of [{level:'country'},{level:'province',provinceCode:'10'},{level:'district',provinceCode:'10',districtId:district},{level:'location',provinceCode:'10',districtId:district,areaId:id}]){
   await navigate(nav);const ordinary=boundaryPaths(),keylines=overlay('workspaceBoundaryKeyline'),white=overlay('workspaceBoundaryWhite');assert.equal(keylines.length,ordinary.length);assert.equal(white.length,ordinary.length);
   for(const p of ordinary){const k=keylines.find(x=>x.feature===p.feature),w=white.find(x=>x.feature===p.feature);assert(k&&w);assert.equal(w.style.color,'#FFFFFF');assert.equal(w.style.weight,p.style.weight);assert.equal(k.style.color,'#101318');assert(Math.abs(k.style.weight-p.style.weight-.80)<1e-10);assert.equal(k.style.dashArray,p.style.dashArray||null);assert.equal(w.style.dashArray,p.style.dashArray||null);for(const path of [k,w]){assert.equal(path.style.fill,false);assert.equal(path.style.fillOpacity,0);assert.equal(path.style.opacity,1);assert.equal(path.options.interactive,false);assert.equal(path.options.bubblingMouseEvents,false);assert.equal(path.element.getAttribute('aria-hidden'),'true');assert(!path.element.hasAttribute('role'));assert(!path.element.hasAttribute('tabindex'));}}
  }
 });
 await check('Theme, basemap and repeated sync keep keyline geometry cached, exact analytical fills and the current camera',async()=>{
  await navigate({level:'country'});const paths=overlay('workspaceBoundaryKeyline'),white=overlay('workspaceBoundaryWhite'),paint=paintSignature(),before=camera();
  for(const theme of ['light','dark'])for(const basemap of ['simplified','satellite','detailed']){document.documentElement.dataset.theme=theme;api.setBasemap(basemap);api.sync();assert.equal(paintSignature(),paint);assert.deepEqual(camera(),before);assert.equal(overlay('workspaceBoundaryKeyline').length,paths.length);assert(overlay('workspaceBoundaryKeyline').every(p=>paths.includes(p)&&p.style.color==='#101318'));assert(overlay('workspaceBoundaryWhite').every(p=>white.includes(p)));}
  const hit=hitPaths().find(p=>p.feature.properties.code==='10');hit.handlers.mouseover({latlng:{lat:13.75,lng:100.5}});const hover=maps[0].renderOrder.at(-1);assert.equal(hover.options.pane,'workspaceBoundaryHover');assert.equal(hover.style.color,'#FFBC1F');assert.equal(hover.style.fill,false);assert.equal(paintSignature(),paint);hit.handlers.mouseout();assert.equal(run('JSON.stringify(AREAS.map(a=>({id:a.id,metrics:a.metrics,supply:a.supply})))'),source);
 });
 await check('Point view supports only its existing quiet outline set and loading removes stale boundary pairs',async()=>{
  api.setSupplyView('points');
  for(const nav of [{level:'country'},{level:'province',provinceCode:'10'},{level:'district',provinceCode:'10',districtId:district}]){await navigate(nav);assert.equal(overlay('workspaceBoundaryKeyline').length,boundaryPaths().length);assert.equal(overlay('workspaceBoundaryWhite').length,boundaryPaths().length);assert.equal(finePaths().length,0);if(nav.level==='country')assert.equal(districtPaths().length,0);if(nav.level==='district')assert.equal(districtPaths().length,1);}
  const before=camera();run('Y.loading=true');api.sync();assert.equal(overlay('workspaceBoundaryKeyline').length,0);assert.equal(overlay('workspaceBoundaryWhite').length,0);run('Y.loading=false');api.sync();assert.equal(overlay('workspaceBoundaryKeyline').length,boundaryPaths().length);assert.deepEqual(camera(),before);
 });
 const report={schemaVersion:1,version:'1.9.3',test:'check-map-hierarchy',passed:checks.every(c=>c.passed),checks,scope:'Current real controller, source snapshots and SVG-shaped adapter; actual halo contrast, layout and basemap appearance require native review.'};
 const out=path.join(root,'../deliverables/yolk-v1.9.3/map-hierarchy-regression-results.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.passed?'':'\n'+c.error));console.log(JSON.stringify({passed:report.passed,checks:checks.length,report:out}));if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
