/* Execute the actual app submit handler and real model/photo modules across async context changes. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const createHarness=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname);
const plain=x=>JSON.parse(JSON.stringify(x)),app=fs.readFileSync(path.join(root,'prototype/app.js'),'utf8');
const submitSource=app.slice(app.indexOf("document.addEventListener('submit',"),app.indexOf("\nwindow.addEventListener('hashchange'"));
assert(submitSource.startsWith("document.addEventListener('submit',"),'Actual app submit handler extraction failed');
const checks=[];
async function fixture(fresh=false){
 const h=createHarness(),run=h.evaluate,rows=new Map(),calls=[],errors=[],notices=[];
 const db={createObjectStore(){},transaction(){const tx={};tx.objectStore=()=>({get:k=>request('get',k),put:r=>request('put',r),delete:k=>request('delete',k)});function request(op,v){const req={};setTimeout(()=>{if(op==='put')rows.set(v.id,plain(v));if(op==='delete')rows.delete(v);req.result=op==='get'?rows.get(v):v;req.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0)},0);return req}return tx}};
 const indexedDB={open(){const req={};setTimeout(()=>{req.result=db;req.onsuccess?.()},0);return req}};
 h.sandbox.setTimeout=setTimeout;h.sandbox.window.indexedDB=indexedDB;
 h.sandbox.FormData=class{constructor(f){this.data=f.values}[Symbol.iterator](){return Object.entries(this.data)[Symbol.iterator]()}};
 const errorElement={set textContent(v){errors.push(v)},get textContent(){return errors.at(-1)||''}};
 h.sandbox.$=()=>errorElement;h.sandbox.notify=s=>notices.push(s);h.sandbox.committed=()=>{calls.push('committed');run('stashContext();refreshPointRelations()')};
 vm.runInContext(fs.readFileSync(path.join(root,'prototype/branch-photos.js'),'utf8'),h.sandbox,{filename:'branch-photos.js'});
 const api=h.sandbox.window.YolkBranchPhotos;h.sandbox.YolkBranchPhotos=api;
 run(`Y.actor='admin';Y.events=[];Y.pois=[];Y.localOverlays=[]`);
 const actorId=run("PEOPLE.find(p=>p.role==='admin').id");h.sandbox.actorId=actorId;run('Y.actor=actorId');
 const areaId=run('AREAS[0].id'),brand=run('ownBrandName()'),id=fresh?'new':'context-test-branch';
 const record={id,name:'Async save fixture',brand,brandId:run('Y.ownBrandId'),relation:'own',status:'pending',area:areaId,province:'10',lat:null,lng:null,note:'Baseline',revision:1,archived:false,localOverlay:true,industryId:'fuel',sourceDataset:'workspace'};
 h.sandbox.fixtureRecord=record;if(!fresh)run('Y.pois=[structuredClone(fixtureRecord)]');
 h.sandbox.location.hash='#poi/'+id;
 const photo={id:'mock-frontage',src:'assets/demo-photos/frontage.jpg',kind:'mockup',title:['รูปทดสอบ','Test photo'],cover:true,addedAt:null};
 rows.set(id,{id,photos:[photo],savedPhotos:[],dirty:true,savedAt:null});await api.create(id,{seedMockups:false});
 for(const key of ['rollbackCommit','finalizeCommit']){const original=api[key];api[key]=(...args)=>{calls.push(key);return original(...args)}}
 let release,entered;const gate=new Promise(resolve=>release=resolve),started=new Promise(resolve=>entered=resolve),originalCommit=api.commit;
 api.commit=async(...args)=>{calls.push('commit');const result=await originalCommit(...args);entered();await gate;return result};
 vm.runInContext(submitSource,h.sandbox,{filename:'actual-app-submit-handler.js'});
 const form={id:'poi-form',dataset:{id,revision:fresh?'0':'1'},values:{name:record.name,brand,relation:'own',status:'pending',area:areaId,lat:'',lng:'',note:'Changed note'},querySelector:()=>({disabled:false})};
 const handler=h.documentListeners.get('submit').at(-1),submit=()=>handler({target:form,preventDefault(){}});
 return {h,run,api,rows,calls,errors,notices,form,id,release,started,submit};
}
async function check(name,test){try{await test();checks.push({name,passed:true})}catch(error){checks.push({name,passed:false,error:String(error.stack||error)})}}
(async()=>{
 for(const [kind,fresh]of [['brand',false],['industry',false],['brand',true],['industry',true],['actor',false],['route',false],['same-context-new-request',false]]){
  await check(`${fresh?'New':'Existing'} branch save aborts cleanly after ${kind} changes during photo commit`,async()=>{
   const f=await fixture(fresh),pending=f.submit();await f.started;
   if(kind==='brand')await f.h.select('fuel','ptt','all_fuel');
   if(kind==='industry')await f.h.select('grocery','grocery-brand:SEVEN_ELEVEN','C_STORE');
   if(kind==='actor')f.run("Y.actor=PEOPLE.find(p=>p.role==='viewer').id");
   if(kind==='route')f.h.sandbox.location.hash='#market';
   if(kind==='same-context-new-request')await f.h.select('fuel','bangchak','all_fuel');
   const before=plain(f.run('({pois:Y.pois,events:Y.events,overlays:Y.localOverlays,industry:Y.industry,ownBrandId:Y.ownBrandId})'));
   f.release();await pending;
   assert.deepEqual(plain(f.run('({pois:Y.pois,events:Y.events,overlays:Y.localOverlays,industry:Y.industry,ownBrandId:Y.ownBrandId})')),before,'Current context must remain untouched');
   assert(f.calls.includes('rollbackCommit'),'Actual photo commit must roll back');assert(!f.calls.includes('finalizeCommit'));assert(!f.calls.includes('committed'));
   assert(f.api.read(f.id).dirty,'Edited photo draft must remain recoverable');assert.equal(f.api.read(f.id).count,1);assert.equal(f.api.read(f.id).savedPhotos.length,0);
   assert(f.errors.length||f.notices.length,'User receives an error or notification');
  });
 }
 for(const fresh of [false,true])await check(`${fresh?'New':'Existing'} branch save succeeds once when context remains stable`,async()=>{
  const f=await fixture(fresh),pending=f.submit();await f.started;f.release();await pending;
  assert.equal(f.run('Y.events.length'),1);assert.equal(f.run('Y.events[0].meta.industry'),'fuel');assert.equal(f.run('Y.events[0].meta.ownBrandId'),'bangchak');
  assert(f.calls.includes('finalizeCommit'));assert(f.calls.includes('committed'));assert(!f.calls.includes('rollbackCommit'));assert.equal(f.run('Y.pois[0].note'),'Changed note');
  assert.equal(f.run('Y.pois[0].photos.length'),1);assert.equal(f.run('Y.pois[0].revision'),fresh?1:2);assert.equal(f.run('Y.events[0].type'),fresh?'supply.created':'supply.updated');
 });
 const result={schemaVersion:1,test:'check-save-context',testedAt:new Date().toISOString(),passed:checks.every(c=>c.passed),checks,scope:'Actual extracted app async submit handler with real model, brand/context and photo modules; DOM and IndexedDB transaction transport mocked. No browser image decoding.'};
 const output=path.resolve(root,'../deliverables/yolk-brand-research-1.7/save-context-regression-results.json');fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.error?'\n'+c.error:''));console.log(JSON.stringify({passed:result.passed,checks:checks.length,receipt:output}));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
