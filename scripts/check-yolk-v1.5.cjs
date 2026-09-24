/* Yolk semantics, map view independence and synthetic-name migration in a VM.
   These checks exercise code and templates, not browser or map rendering. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../prototype'));
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name)}
function fixture(){
 const elements=new Map(),handlers={},writes=[];
 const element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},showModal(){},close(){},focus(){doc.activeElement=this},scrollIntoView(){}});return elements.get(key)};
 const doc={documentElement:{lang:'th',dataset:{},style:{}},activeElement:null,title:'',querySelector:k=>['[data-location-map]','#poi-form','#target-form','#branch-province'].includes(k)?null:element(k),querySelectorAll:()=>[],addEventListener:(type,fn)=>(handlers[type]??=[]).push(fn)};
 const context=vm.createContext({document:doc,location:{hash:'#market'},localStorage:{getItem:()=>null,setItem:(k,v)=>writes.push([k,v])},structuredClone,crypto:crypto.webcrypto,clearTimeout(){},setTimeout(){return 0},addEventListener(){},scrollTo(){},console,FormData:class{constructor(f){this.v=f.values||{}}[Symbol.iterator](){return Object.entries(this.v)[Symbol.iterator]()}},MouseEvent:class{}});context.window=context;
 for(const file of ['theme.js','icons.js','data/thailand-provinces.js','data/demo-data.js','metrics.js','model.js','landscape.js','leaderboard.js','supply-ui.js','data/demo-map-context.js','location-map.js','branch-photos.js','decision-ui.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 const run=s=>vm.runInContext(s,context),plain=s=>JSON.parse(run(`JSON.stringify(${s})`));
 const scope=value=>{for(const f of handlers.change||[])f({target:{name:'map-scope',value,dataset:{},matches:()=>false},preventDefault(){}})};
 return{context,run,plain,scope,writes,element};
}
const ui=fixture(),run=ui.run,plain=ui.plain;
const codes=plain('P.map(p=>p.code)');
check('national map retains all 77 administrative outlines',()=>{assert.equal(codes.length,77);assert.equal(new Set(codes).size,77);assert.equal(plain('mapStats(evaluate()).map(p=>p.code)').join(','),codes.join(','))});
const rows=[];function add(i,id,demand,eligible,score,coverage=1){rows.push({id,province:codes[i],demand,eligible,score,coverage})}
add(0,'accepted-yolk',true,true,97);add(0,'excluded-yolk',true,false,100);add(0,'low-but-eligible',false,true,100);add(0,'unresolved',null,false,100);
add(1,'low-only',false,true,100);add(2,'unknown-only',null,false,100);add(3,'low-and-unknown',false,false,100);add(3,'unknown-next-to-low',null,false,100);
add(4,'excluded-only',true,false,99);add(5,'excluded-next-to-unknown',true,false,99);add(5,'unknown-next-to-excluded',null,false,100);
add(6,'below-national-95',true,true,94);add(7,'accepted-with-other-missing',true,true,99,0.7);add(7,'uncertain-neighbor',null,false,100);
ui.context.fixtureRows=rows;
run('delete Y.mapScope');let preferred=plain('mapStats(fixtureRows)');
check('default map scope includes confirmed high Demand that also passes team criteria',()=>{
 assert.deepEqual(preferred[0].visibleYolks.map(x=>x.id),['accepted-yolk']);assert.equal(preferred[0].best,97);
 assert.deepEqual(preferred[0].eligible.map(x=>x.id),['accepted-yolk','low-but-eligible']);
 assert.equal(preferred[4].best,null);assert.equal(preferred[4].visibleYolks.length,0);
});
check('low Demand never receives Yolk fill even when it is eligible or scores 100',()=>{assert.equal(preferred[1].best,null);assert.equal(preferred[1].missing,false);assert.equal(preferred[1].eligible.length,1)});
check('uncertainty is shown only when no visible Yolk is confirmed in that province',()=>{
 for(const i of [2,3,5])assert.equal(preferred[i].missing,true);
 for(const i of [0,1,4,6,7,8])assert.equal(preferred[i].missing,false);
 assert.equal(preferred[7].best,99,'missing neighboring or unrelated evidence cannot erase a confirmed Yolk');
});
run("Y.mapScope='all'");let all=plain('mapStats(fixtureRows)');
check('all scope adds excluded confirmed Yolks without admitting false or unresolved Demand',()=>{
 assert.deepEqual(all[0].visibleYolks.map(x=>x.id),['accepted-yolk','excluded-yolk']);assert.equal(all[0].best,100);
 assert.equal(all[4].best,99);assert.equal(all[5].best,99);assert.equal(all[5].missing,false);
 for(const i of [1,2,3])assert.equal(all[i].best,null);
 assert.equal(all.length,77);
});
for(const lang of ['th','en'])check(`${lang} province labels distinguish visible Yolks from team eligibility`,()=>{
 run(`Y.lang='${lang}';Y.mapScope='preferred'`);const html=run('choropleth(mapStats(fixtureRows))');
 assert.equal((html.match(/class="province /g)||[]).length,77);
 assert.equal((html.match(/data-code=/g)||[]).length,77);
 assert.equal((html.match(/role="button"/g)||[]).length,77);
 assert(html.includes(lang==='th'?'ไข่แดงในมุมมองนี้':'Yolks in this view'));
 assert(html.includes(lang==='th'?'ทำเลผ่านเกณฑ์ทีม':'locations match team criteria'));
 const fill=code=>html.match(new RegExp('<path class="province [^>]*fill="([^"]+)"[^>]*data-code="'+code+'"'))?.[1];
 assert.equal(fill(codes[0]),'var(--yl-yolk-map-2)');assert.equal(fill(codes[6]),'var(--yl-yolk-map-1)');assert.equal(fill(codes[7]),'var(--yl-yolk-map-3)');
 assert.equal(fill(codes[1]),'var(--no-result)');assert.equal(fill(codes[2]),'url(#unknown-hatch)');
});
const list=html=>html.slice(html.indexOf('<div class="ranking-list">'),html.indexOf('<div class="pagination">'));
run("Y.lang='en';delete Y.mapScope;Y.province='';Y.marketPage=0");
const before={evaluation:run('JSON.stringify(evaluate())'),criteria:run('JSON.stringify(Y.criteria)'),events:run('JSON.stringify(Y.events)'),targets:run('JSON.stringify(Y.targets)'),html:run('market()'),writes:ui.writes.length};
check('default map radio agrees with preferred scope semantics',()=>{assert(/name="map-scope" value="preferred" checked/.test(before.html));assert(!/name="map-scope" value="all" checked/.test(before.html))});
ui.scope('all');
check('changing map scope is view-only: no rank, membership, criteria, target or activity changes',()=>{
 assert.equal(run('Y.mapScope'),'all');assert.equal(run('JSON.stringify(evaluate())'),before.evaluation);
 assert.equal(run('JSON.stringify(Y.criteria)'),before.criteria);assert.equal(run('JSON.stringify(Y.events)'),before.events);assert.equal(run('JSON.stringify(Y.targets)'),before.targets);
 assert.equal(ui.writes.length,before.writes);assert.equal(list(run('market()')),list(before.html));
});
check('invalid scope falls back to preferred and does not persist a workspace change',()=>{ui.scope('invalid');assert.equal(run('Y.mapScope'),'preferred');assert.equal(ui.writes.length,before.writes);assert.equal(run('JSON.stringify(Y.events)'),before.events)});
for(const lang of ['th','en']){
 run(`Y.lang='${lang}'`);
 check(`${lang} Yolk badge requires literal true and keeps a readable label`,()=>{
 const high=run('yolkBadge({demand:true})');assert(high.includes('class="yolk-badge"'));assert(high.includes('data-yolk-glyph="egg_alt"'));assert(high.includes(lang==='th'?'Yolk · ไข่แดง':'Yolk · High demand'));
 for(const value of ['false','null','undefined','1',"'true'"])assert(!run(`yolkBadge({demand:${value}})`).includes('class="yolk-badge"'));
 assert(run('yolkBadge({demand:null})').includes(lang==='th'?'ยังไม่ชัด':'unresolved'));
 });
 check(`${lang} local map marks only confirmed high Demand and keeps plain-language context`,()=>{
 for(const value of ['true','false','null']){const html=run(`YolkLocationMap.render({id:'fixture-place',demand:${value}},[],'${lang}')`);assert.equal(/class="yl-location-map is-yolk"/.test(html),value==='true');if(value==='true')assert(html.includes(lang==='th'?'ไข่แดงที่ Demand สูง':'Yolk · High demand'))}
 });
 check(`${lang} map legend explains gold, uncertainty and unchanged list scope`,()=>{
 run("Y.mapScope='all'");const html=run('market()');assert(html.includes('class="yolk-map-legend"'));assert(html.includes('class="no-result-swatch"'));assert(html.includes('class="missing-swatch"'));
 assert(html.includes(lang==='th'?'สีทอง = พบไข่แดง':'Gold = Yolk found'));assert(html.includes(lang==='th'?'ผ่านเกณฑ์ Demand':'Meets Demand threshold'));
 assert(html.includes(lang==='th'?'รายการด้านขวายังใช้เกณฑ์ทีม':'The ranked list still follows team criteria.'));
 assert(html.includes(lang==='th'?'ไม่ใช่คะแนนทั้งจังหวัดหรือจำนวนลูกค้า':'not a province score or customer count'));
 });
}
check('gold map ramp and badge styling have separate light/dark roles, not legacy heat fill',()=>{
 const css=fs.readFileSync(path.join(root,'yolk-focus.css'),'utf8');assert(css.includes(':root[data-theme="dark"]'));
 for(const level of [1,2,3])assert.equal((css.match(new RegExp('--yl-yolk-map-'+level+':','g'))||[]).length,2);
 assert(css.includes('.yolk-badge'));assert(css.includes('.yolk-map-legend'));assert(css.includes('.is-yolk'));
 assert(!run('choropleth(mapStats(evaluate()))').includes('--yolk-heat-'));
});
check('all 308 synthetic locations use the neutral TH/EN name without changing underlying data',()=>{
 const data=plain('YOLK_DEMO_DATA');assert.equal(data.areas.length,308);
 for(const [i,a]of data.areas.entries()){assert.equal(a.th,`ทำเลจำลอง ${i+1}`);assert.equal(a.en,`Demo location ${i+1}`);delete a.th;delete a.en;}
 const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
 // Pinned v1.4 data projection, omitting only each area's two display-name fields.
 assert.equal(crypto.createHash('sha256').update(canonical(data)).digest('hex'),'d63e35eb957728793fc05adec9f9b0b7fc1fe657195d94e9b18e22ef666e81db');
});
console.log(`${checks} Yolk semantics/view/data checks passed. No visual, geometry, traffic or investment claims.`);
