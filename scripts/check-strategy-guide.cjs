/* Actual read-only guide controller with source registries/model and a small native-dialog adapter.
 * This checks state, asynchronous recovery and semantics; native rendering/speech remain separate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const prefix=read('scripts/check-strategy-ui.cjs').split('\n(async () => {')[0];
const harness=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname);
const registry=JSON.parse(read('prototype/data/strategy-guide.v1.9.3.json'));
const contract=JSON.parse(read('contracts/opportunity-strategies.v1.9.0.json'));
const source=read('prototype/strategy-guide.js'),css=read('prototype/strategy-guide.css');
const plain=v=>JSON.parse(JSON.stringify(v)),hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const checks=[];async function check(name,fn){try{await fn();checks.push({name,passed:true});console.log('PASS',name)}catch(e){checks.push({name,passed:false,error:String(e.stack||e)});console.error('FAIL',name,e.message)}}
function fixture(){
 const h=harness(),listeners=new Map(),els=new Map(),requests=[],state={captionCalls:0,fetchGuide:null};
 let doc;
 function control(attrs={}){return {attrs,dataset:Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v])),isConnected:true,focusCalls:0,hasAttribute:k=>k in attrs,getAttribute:k=>attrs[k],focus(options){this.focusCalls++;this.focusOptions=options;doc.activeElement=this},closest(){return this}}}
 const outside=control({'data-guide-index':'','aria-label':'Open guide'});
 function makeDialog(){
  const d={open:false,scrollTop:0,attrs:{},listeners:new Map(),buttons:[],setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this.listeners.set(k,fn)},querySelector(selector){const key=/^\[([^\]]+)\]/.exec(selector)?.[1];return this.buttons.find(b=>b.hasAttribute(key))||null},querySelectorAll(){return []},showModal(){this.open=true;this.buttons[0]?.focus()},close(){if(!this.open)return;this.open=false;this.listeners.get('close')?.()},closeNative(){this.close()}};
  Object.defineProperty(d,'innerHTML',{get(){return this.html||''},set(html){for(const b of this.buttons){b.isConnected=false;if(doc.activeElement===b)doc.activeElement=doc.body}this.html=html;this.buttons=[...html.matchAll(/<button\b([^>]*)>/g)].map(m=>{const attrs=Object.fromEntries([...m[1].matchAll(/([a-zA-Z][\w-]*)(?:="([^"]*)")?/g)].map(x=>[x[1],x[2]||'']));return control(attrs)});}});
  return d;
 }
 doc={body:{appendChild(d){d.isConnected=true;els.set(d.id,d)}},activeElement:outside,getElementById:id=>els.get(id)||null,createElement(tag){assert.equal(tag,'dialog');return makeDialog()},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn)}};
 h.sandbox.document=doc;h.sandbox.window.document=doc;
 const previousFetch=h.sandbox.fetch;
 h.sandbox.fetch=async file=>{if(!String(file).startsWith('data/strategy-guide.'))return previousFetch(file);requests.push(String(file));return state.fetchGuide?state.fetchGuide(file):{ok:true,json:async()=>structuredClone(registry)}};
 h.sandbox.window.YolkIcons={...h.icons,captionControls(){state.captionCalls++}};
 vm.runInContext(source,h.sandbox,{filename:'actual-strategy-guide.js'});
 const api=h.sandbox.window.YolkStrategyGuide;
 function click(button){const ev={target:{closest:()=>button},preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};for(const fn of listeners.get('click')||[])fn(ev);return ev}
 const getDialog=()=>els.get('strategy-guide-dialog');
 const snapshot=()=>hash({criteria:h.evaluate('Y.criteria'),draft:h.evaluate('draft'),events:h.evaluate('Y.events'),targets:h.evaluate('Y.targets'),selections:plain(h.ui.selectedIds()),rows:h.evaluate('evaluate(draft)'),writes:[...h.writes]});
 return {h,api,doc,requests,state,control,outside,click,getDialog,snapshot};
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
(async()=>{
 await check('Guide has the eight exact current strategy IDs, phase boundaries and complete bilingual explanatory fields',()=>{
  assert.equal(registry.version,'1.9.3');assert.equal(registry.readOnly,true);assert.equal(registry.examplePolicy.allExamplesHypothetical,true);
  const expected=(contract.strategies||[]).map(s=>s.id);assert.equal(expected.length,8);assert.deepEqual(registry.strategies.map(s=>s.id),expected);assert.equal(new Set(expected).size,8);
  for(const s of registry.strategies){for(const key of ['name','shortLabel','oneSentence','why','tradeoff','question'])for(const locale of ['th','en'])assert(s[key]?.[locale]?.trim(),s.id+'/'+key+'/'+locale);for(const key of ['howToUse','availableP0Evidence','neededEvidence']){assert(s[key].length);assert(s[key].every(v=>v.th?.trim()&&v.en?.trim()))}assert(['P0','P1','P2'].includes(s.phase));for(const key of ['scenario','action','caveat'])assert(s.illustrativeExample[key].th&&s.illustrativeExample[key].en)}
 });
 await check('Every guide and opportunity illustration icon actually resolves from the unchanged approved runtime subset',()=>{
  const f=fixture(),used=[...source.matchAll(/icon\('([^']+)'\)/g)].map(m=>m[1]);used.push(...registry.strategies.map(s=>s.icon));
  for(const m of source.matchAll(/(?:own|competitor|candidate|anchor|future):'([^']+)'/g))used.push(m[1]);
  for(const name of used)assert(f.h.icons.icon(name),name+' must have a real approved glyph');
  assert(!/\.guide-node-candidate[^}]*font-weight\s*:\s*(?!300)[0-9]+/.test(css),'Candidate meaning must not alter icon weight');
 });
 await check('Guide is lazy and index exposes eight named direct buttons with a hypothetical-example boundary',async()=>{
  const f=fixture();assert.equal(f.requests.length,0);await f.api.open(null,f.outside);const d=f.getDialog();assert(d.open);assert.equal(d.attrs['aria-labelledby'],'strategy-guide-title');assert.equal(f.requests.length,1);assert(f.requests[0].includes('?v=1.9.3'));assert.equal(d.buttons.filter(b=>b.hasAttribute('data-guide-id')).length,8);assert(d.innerHTML.includes('ตัวอย่างเป็นสถานการณ์สมมติ'));assert.equal(f.doc.activeElement,d.querySelector('[data-guide-close]'));assert(f.state.captionCalls>0);
 });
 await check('All eight TH/EN details contain illustration alternatives, clear evidence/next actions and circular named navigation',async()=>{
  const f=fixture();for(const lang of ['th','en']){f.h.evaluate('Y.lang="'+lang+'"');for(let i=0;i<8;i++){const s=registry.strategies[i];await f.api.open(s.id,f.outside);const html=f.getDialog().innerHTML;assert(html.includes('id="strategy-guide-title"'));assert(html.includes(s.name[lang]));assert(html.includes('role="img" aria-label="'));assert(html.includes(lang==='th'?'ไม่ใช่ข้อมูลทำเลจริง':'not real location data'));assert(html.includes(s.illustrativeExample.caveat[lang]));assert(html.includes(lang==='th'?'ยังต้องตรวจเพิ่ม':'Evidence still needed'));assert(html.includes('data-guide-id="'+registry.strategies[(i+7)%8].id+'"'));assert(html.includes('data-guide-id="'+registry.strategies[(i+1)%8].id+'"'));}}assert.equal(f.requests.length,1,'A loaded guide is cached, not fetched per card');
 });
 await check('Opening and navigating the guide preserves every industry context, personal strategy choice, ordered results and team/local state',async()=>{
  const f=fixture();for(const [industry,brand,scope]of [['fuel','bangchak','all_fuel'],['grocery','grocery-brand:LOTUSS','SUPERMARKET'],['nonbank','legal:0107557000195','vehicle_title']]){await f.h.select(industry,brand,scope);f.h.evaluate('Y.route="market"');f.h.ui.setSelected(['future_entry']);const before=f.snapshot();await f.api.open('future_entry',f.outside);const next=f.getDialog().buttons.find(b=>b.hasAttribute('data-guide-id'));f.click(next);assert.equal(f.snapshot(),before);f.getDialog().closeNative();assert.equal(f.snapshot(),before)}
 });
 await check('Native-dialog close restores the connected external opener without scrolling or changing the route',async()=>{
  const f=fixture();await f.api.open('competitive_entry',f.outside);f.getDialog().closeNative();assert.equal(f.doc.activeElement,f.outside);assert.equal(f.outside.focusCalls,1);assert.equal(f.outside.focusOptions.preventScroll,true);
 });
 await check('Closing during a pending fetch prevents stale content/focus restoration after response resolves',async()=>{
  const f=fixture(),wait=deferred();f.state.fetchGuide=()=>wait.promise;const opening=f.api.open('network_infill',f.outside),d=f.getDialog();d.closeNative();const closedHTML=d.innerHTML;wait.resolve({ok:true,json:async()=>registry});await opening;assert.equal(d.open,false);assert.equal(d.innerHTML,closedHTML);assert.equal(f.doc.activeElement,f.outside);assert.equal(f.outside.focusCalls,1);
 });
 await check('Two overlapping requests share one fetch and only the latest requested strategy may paint',async()=>{
  const f=fixture(),wait=deferred();f.state.fetchGuide=()=>wait.promise;const second=f.control({'data-guide-id':'future_entry'}),firstOpen=f.api.open('network_infill',f.outside),secondOpen=f.api.open('future_entry',second);wait.resolve({ok:true,json:async()=>registry});await Promise.all([firstOpen,secondOpen]);assert.equal(f.requests.length,1);assert(f.getDialog().innerHTML.includes(registry.strategies[7].name.th));assert.equal(f.doc.activeElement,f.getDialog().querySelector('[data-guide-close]'));f.getDialog().closeNative();assert.equal(f.doc.activeElement,f.outside,'An in-modal reload must retain the external opener');
 });
 await check('Failed load exposes a focused operable recovery; retry succeeds and close returns to the original external opener',async()=>{
  const f=fixture();f.state.fetchGuide=async()=>({ok:false});await f.api.open('route_capture',f.outside);const d=f.getDialog();assert(d.open);assert(d.innerHTML.includes('ลองใหม่'));assert.equal(f.doc.activeElement,d.querySelector('[data-guide-close]'));f.state.fetchGuide=null;const retry=d.buttons.find(b=>b.hasAttribute('data-guide-index')&&!b.attrs['data-guide-close']&&b!==d.buttons[0]);assert(retry);f.click(retry);await new Promise(resolve=>setImmediate(resolve));assert.equal(f.requests.length,2);assert(d.innerHTML.includes('รู้จัก 8 Strategy'));d.closeNative();assert.equal(f.doc.activeElement,f.outside);
 });
 await check('Rejected transport and incomplete guide recover without publishing stale content or mutating state',async()=>{
  for(const response of [()=>Promise.reject(new Error('offline')),async()=>({ok:true,json:async()=>({...registry,strategies:registry.strategies.slice(0,7)})})]){const f=fixture(),before=f.snapshot();f.state.fetchGuide=response;await f.api.open('underserved_market',f.outside);assert(f.getDialog().innerHTML.includes('คู่มือยังโหลดไม่สำเร็จ'));assert.equal(f.snapshot(),before);assert.equal(f.doc.activeElement,f.getDialog().querySelector('[data-guide-close]'))}
 });
 await check('Clicking a candidate strategy tag opens explanatory detail without selecting a different strategy or route',async()=>{
  const f=fixture();f.h.evaluate('Y.route="market";Y.lang="en"');const before=f.snapshot(),button=f.control({'data-guide-id':'competitive_entry','aria-label':'Read more: Competitive entry'});const ev=f.click(button);await new Promise(resolve=>setImmediate(resolve));assert(ev.prevented&&ev.stopped);assert(f.getDialog().innerHTML.includes(registry.strategies[2].name.en));assert.equal(f.snapshot(),before);
 });
 const result={schemaVersion:1,test:'check-strategy-guide',version:'1.9.3',testedAt:new Date().toISOString(),passed:checks.every(c=>c.passed),checks,scope:'Actual read-only guide loader/controller, source registries, approved glyph resolution, asynchronous recovery and model/context preservation through a native-dialog-shaped adapter. Native Escape behavior, text geometry, touch, visual diagrams and screen-reader speech remain separate.'};
 const out=path.resolve(root,'../deliverables/yolk-v1.9.3/evidence/strategy-guide-results.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:result.passed,checks:checks.length,receipt:out}));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
