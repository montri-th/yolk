/* Map contract and stub-controller checks. No browser engine or visual renderer.
 * Run: node scripts/check-map-runtime.cjs [prototype-directory]
 */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const prototypeRoot=path.resolve(process.argv[2]||path.join(__dirname,'..','prototype'));
const totals={};

{

const root=prototypeRoot+'/';
const context={window:{}};vm.createContext(context);
for(const name of ['data/demo-map-context.js','location-map.js'])vm.runInContext(fs.readFileSync(root+name,'utf8'),context);
const api=context.window.YolkLocationMap;
const data=JSON.parse(fs.readFileSync(root+'data/demo-data.json','utf8'));
const inside=(point,ring)=>{let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>point[1])!==(yj>point[1])&&point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi)yes=!yes;}return yes;};
let assertions=0;const check=(v,msg)=>{assert(v,msg);assertions++};
for(const area of data.areas){
 const map=api.context(area,data.pois,'th');check(api.polygonValid(map.boundary),'valid synthetic polygon '+area.id);
 check(map.synthetic&&map.boundaryStatus==='synthetic','no true boundary claim');
 for(const poi of map.pois)check(inside([poi.lng,poi.lat],map.boundary.geometry.coordinates[0]),'synthetic pin within demo polygon');
 const output=api.render(area,data.pois,'th');check(output.includes('ขอบเขตและจุดทั้งหมดเป็นภาพจำลอง'),'explicit demo label');
 check(output.includes('data-map-style="satellite"'),'satellite choice');
}
const unknown={id:'unapproved',extent3857:[11187414.8,1517362.66,11193414.8,1523362.66]};
const noPolygon=api.context(unknown,[{id:'1',area:'unapproved',name:'A',lat:13.6,lng:100.5},{id:'2',area:'unapproved',name:'Missing',lat:null,lng:null}],'en');
check(noPolygon.boundary===null,'viewport extent must never become a polygon');check(noPolygon.pois.length===1,'missing-coordinate exclusion');check(noPolygon.missingCoordinateCount===1,'missing-coordinate disclosure');check(noPolygon.fitBounds.length===2,'extent viewport supported');
check(api.extentBounds([0,0,0,0])===null,'invalid extent');check(!api.polygonValid({type:'Polygon',coordinates:[[[0,0],[0,1],[1,1]]]}),'unclosed ring rejected');
check(!api.polygonValid({type:'Polygon',coordinates:[[[0,0],[0,91],[1,1],[0,0]]]}),'bad coordinate rejected');
const realStub={id:'real',mapContext:{boundary:api.context(data.areas[0],[],'en').boundary,boundaryStatus:'source',sourceLabel:'CityMETER <script>',pois:[{id:'p',name:'<img src=x onerror=1>',category:'factory',lat:13.7,lng:100.5}]}};
const safe=api.render(realStub,[],'en');check(safe.includes('&lt;script&gt;'),'source escaping');check(safe.includes('&lt;img src=x onerror=1&gt;'),'POI name escaping');check(safe.includes('not a certified statutory boundary'),'source boundary limits');check(!safe.includes('Verified boundary'),'source is not verified');
context.window.YOLK_MAP_CONTEXT={real:realStub.mapContext};check(api.context({id:'real'},[],'th').boundary!==null,'global context adapter');
const hash=require('crypto').createHash('sha256').update(fs.readFileSync(root+'vendor/leaflet-1.9.4/leaflet.js')).digest('base64');check(hash==='20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=','Leaflet official published SRI');
totals.contractAssertions=assertions; totals.syntheticAreas=data.areas.length;

}
{

const base=prototypeRoot+'/';
const handlers={};let checks=0;const check=(v,m)=>{assert(v,m);checks++};
function element(extra={}){return Object.assign({dataset:{},hidden:false,textContent:'',disabled:false,handlers:{},classList:{toggle(){}},setAttribute(k,v){this[k]=v},addEventListener(k,v){this.handlers[k]=v},removeEventListener(k){delete this.handlers[k]},focus(){this.focused=true},closest(){return this},hasAttribute(k){return k in this},matches(k){return k==='[data-map-layer]'},querySelector(){},querySelectorAll(){return []}},extra)}
const styleButtons=['simplified','satellite','detailed'].map(s=>element({dataset:{mapStyle:s}}));
const canvas=element(),loading=element(),networkText=element(),retry=element(),surface=element(),note=element(),count=element();
const network=element({hidden:true,querySelector:s=>s==='span'?networkText:retry});
const listItems=['own','competitor','factory','hotel','hospital','school'].map(s=>element({dataset:{mapListItem:s}}));
const root=element({contains:()=>true,querySelector:s=>({'.yl-map-canvas':canvas,'[data-map-loading]':loading,'[data-map-network]':network,'.yl-map-surface':surface,'[data-map-basemap-note]':note,'[data-map-visible-count]':count}[s]),querySelectorAll:s=>s==='[data-map-style]'?styleButtons:s==='[data-map-list-item]'?listItems:[]});
let map,tiles=[],observerCallback,observerDisconnected=false,lastBoundaryStyle,mapAccent='#224466';
const L={map:()=>map={layers:new Set(),zoom:13,attributionControl:{setPrefix(){}},removeLayer(l){this.layers.delete(l)},addLayer(l){this.layers.add(l)},fitBounds(){this.fitted=true},setView(p,z){this.view=p;this.zoom=z},getZoom(){return this.zoom},getContainer(){return canvas},remove(){this.removed=true},invalidateSize(){}},control:{zoom:()=>({addTo(){}}),scale:()=>({addTo(){}})},geoJSON:()=>({addTo(m){m.addLayer(this);return this},getBounds:()=>({isValid:()=>true}),bindTooltip(){},setStyle(s){lastBoundaryStyle=s}}),layerGroup:()=>({addTo(m){m.addLayer(this);return this}}),divIcon:o=>o,marker:(p,o)=>({point:p,addTo(){return this},bindPopup(){},on(){},openPopup(){this.opened=true}}),latLngBounds:p=>p,tileLayer:(url,options)=>{const t={url,options,events:{},on(e,h){this.events[e]=h;return this},off(){this.events={}},addTo(m){m.addLayer(this);return this}};tiles.push(t);return t;}};
const win={MutationObserver:class{constructor(fn){observerCallback=fn}observe(){}disconnect(){observerDisconnected=true}},L,addEventListener:(k,v)=>handlers[k]=v,removeEventListener:k=>delete handlers[k],navigator:{onLine:true},matchMedia:()=>({matches:true})};
const ctx={window:win,document:{querySelector:()=>root,documentElement:{dataset:{theme:'light'}}},MutationObserver:win.MutationObserver,getComputedStyle:()=>({getPropertyValue:()=> mapAccent}),setTimeout:()=>1,clearTimeout(){}};vm.createContext(ctx);
for(const file of ['data/demo-map-context.js','location-map.js'])vm.runInContext(fs.readFileSync(base+file,'utf8'),ctx);
const area={id:'demo-test',province:'10',synthetic:true},pois=[{id:'p1',area:'demo-test',relation:'own',name:'Demo',synthetic:true},{id:'p2',area:'demo-test',relation:'competitor',name:'Demo 2',synthetic:true}];
const api=win.YolkLocationMap;api.mount(area,pois,'en');
check(map.fitted,'fits boundary');check(loading.hidden,'loading dismissed');check(tiles[0].url.includes('openstreetmap.org'),'default real street tiles');check(styleButtons[0]['aria-pressed']==='true','default choice state');
root.handlers.click({target:styleButtons[1]});check(surface.dataset.basemap==='satellite','satellite selection');check(tiles[1].url.includes('wmts.terrascope.be'),'real ESA satellite tiles');check(note.textContent.includes('2021'),'imagery vintage');check(tiles[1].options.maxNativeZoom===14,'native scale');check(tiles[1].options.attribution.includes('Contains modified Copernicus'),'satellite attribution');
tiles[1].events.tileerror();tiles[1].events.load();check(!network.hidden,'error surfaced');check(!retry.hidden,'retry available');
root.handlers.click({target:styleButtons[2]});check(surface.dataset.basemap==='detailed','detailed selection');check(network.hidden,'old error cleared');check(styleButtons[2]['aria-pressed']==='true','pressed follows choice');
root.handlers.change({target:element({dataset:{mapLayer:'own'},checked:false})});check(listItems[0].hidden,'list follows layer toggle');check(Number(count.textContent)===5,'visible pin count');
handlers.offline();check(networkText.textContent.includes('offline'),'offline status');
mapAccent='#aaffdd';ctx.document.documentElement.dataset.theme='dark';observerCallback();check(lastBoundaryStyle.color==='#aaffdd','boundary updates on theme change');
const oldmap=map;api.mount(area,pois,'th');check(oldmap.removed,'re-mount destroys previous map');check(typeof handlers.offline==='function','new handlers attached');
api.destroy();check(map.removed,'destroy map');check(Object.keys(handlers).length===0,'cleanup global handlers');check(observerDisconnected,'cleanup theme observer');check(!root.handlers.click&&!root.handlers.change,'cleanup UI handlers');
totals.lifecycleAssertions=checks;

}
{

const elements=new Map(),events={},calls=[];
const el=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){}},setAttribute(){},showModal(){},close(){},focus(){this.focused=true},scrollIntoView(){}});return elements.get(key)};
const ctx=vm.createContext({document:{documentElement:{lang:'th'},title:'',querySelector:s=>['#poi-form','#target-form'].includes(s)?null:el(s),querySelectorAll:()=>[],addEventListener:(k,v)=>events[k]=v},location:{hash:'#market'},localStorage:{getItem(){return null},setItem(){}},structuredClone,crypto:require('crypto').webcrypto,clearTimeout(){},setTimeout(){return 0},addEventListener(){},scrollTo(){},console,YolkTheme:{renderControl:()=>''},renderThemeControl:()=>'',YolkBranchPhotos:{bind(){},render(){return ''}},FormData:class{},MouseEvent:class{}});ctx.window=ctx;
for(const f of ['data/thailand-provinces.js','data/demo-data.js','metrics.js','model.js','landscape.js','leaderboard.js','supply-ui.js','data/demo-map-context.js','location-map.js','decision-ui.js'])vm.runInContext(fs.readFileSync(path.join(prototypeRoot,f),'utf8'),ctx,{filename:f});
const genuineRender=ctx.YolkLocationMap.render;ctx.YolkLocationMap={render:(a,p,l)=>{calls.push({action:'render',id:a.id,lang:l});return genuineRender(a,p,l)},mount:(a,p,l)=>calls.push({action:'mount',id:a.id,lang:l}),destroy:()=>calls.push({action:'destroy'})};
vm.runInContext(fs.readFileSync(path.join(prototypeRoot,'app.js'),'utf8'),ctx,{filename:'app.js'});
let checks=0;const check=(v,m)=>{assert(v,m);checks++};const run=s=>vm.runInContext(s,ctx);
ctx.location.hash='#place/demo-area-001';run('render()');check(calls.slice(-3).map(c=>c.action).join(',')==='destroy,render,mount','route destroys before rerender/mount');check(el('#content').innerHTML.includes('ขอบเขตทำเลและจุดสำคัญ'),'TH map in page');
const action=element=>({target:{closest:()=>element}});events.click(action({dataset:{action:'language'},disabled:false}));
check(run('Y.lang')==='en','language event changes language');check(calls.at(-1).lang==='en','map remounted English');check(el('#content').innerHTML.includes('Location boundary &amp;')||el('#content').innerHTML.includes('Location boundary & key places'),'English map in page');
events.change({target:{id:'actor-select',value:'v0',dataset:{}}});check(run('canEdit()')===false,'viewer permissions');check(calls.at(-1).action==='mount','viewer retains read-only map');check(/data-action="target"[^>]*disabled/.test(el('#content').innerHTML),'viewer cannot change shortlist');
events.change({target:{id:'actor-select',value:'p',dataset:{}}});check(run('canEdit()')===true,'editor permissions');check(calls.at(-1).action==='mount','editor map remount');
ctx.location.hash='#team';run('render()');check(calls.at(-1).action==='destroy','leaving detail destroys map');
const html=fs.readFileSync(path.join(prototypeRoot,'index.html'),'utf8');const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
check(scripts.indexOf('vendor/leaflet-1.9.4/leaflet.js')<scripts.indexOf('location-map.js'),'Leaflet loaded before map');check(scripts.indexOf('data/demo-map-context.js')<scripts.indexOf('location-map.js'),'demo adapter before map');check(scripts.indexOf('location-map.js')<scripts.indexOf('app.js'),'map loaded before app');check(html.indexOf('vendor/leaflet-1.9.4/leaflet.css')<html.indexOf('location-map.css'),'map styles override vendor styles');
totals.appIntegrationAssertions=checks;

}
console.log(JSON.stringify({status:"passed",...totals,browserVisualQA:"not performed"},null,2));
