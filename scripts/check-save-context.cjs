/* Execute the actual app submit handler and real model/photo modules across async context changes. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const createHarness=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname);
const plain=x=>JSON.parse(JSON.stringify(x)),app=fs.readFileSync(path.join(root,'prototype/app.js'),'utf8');
const submitSource=app.slice(app.indexOf("document.addEventListener('submit',"),app.indexOf("\nwindow.addEventListener('hashchange'"));
assert(submitSource.startsWith("document.addEventListener('submit',"),'Actual app submit handler extraction failed');
const checks=[];
async function fixture(fresh=false,options={}){
 const h=createHarness(),run=h.evaluate,rows=new Map(),calls=[],errors=[],notices=[];
 const db={createObjectStore(){},transaction(){const tx={};tx.objectStore=()=>({get:k=>request('get',k),put:r=>request('put',r),delete:k=>request('delete',k)});function request(op,v){const req={};setTimeout(()=>{if(op==='put')rows.set(v.id,plain(v));if(op==='delete')rows.delete(v);req.result=op==='get'?rows.get(v):v;req.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0)},0);return req}return tx}};
 const indexedDB={open(){const req={};setTimeout(()=>{req.result=db;req.onsuccess?.()},0);return req}};
 h.sandbox.setTimeout=setTimeout;h.sandbox.window.indexedDB=indexedDB;
 h.sandbox.FormData=class{constructor(f){this.data=f.values}[Symbol.iterator](){return Object.entries(this.data)[Symbol.iterator]()}};
 const errorElement={set textContent(v){errors.push(v)},get textContent(){return errors.at(-1)||''}};
 h.sandbox.$=()=>errorElement;h.sandbox.notify=s=>notices.push(s);h.sandbox.committed=()=>{calls.push('committed');run('stashContext();refreshPointRelations()')};
 vm.runInContext(fs.readFileSync(path.join(root,'prototype/branch-context.js'),'utf8'),h.sandbox,{filename:'branch-context.js'});
 vm.runInContext(fs.readFileSync(path.join(root,'prototype/branch-photos.js'),'utf8'),h.sandbox,{filename:'branch-photos.js'});
 const api=h.sandbox.window.YolkBranchPhotos;h.sandbox.YolkBranchPhotos=api;
 run(`Y.actor='admin';Y.events=[];Y.pois=[];Y.localOverlays=[]`);
 const actorId=run("PEOPLE.find(p=>p.role==='admin').id");h.sandbox.actorId=actorId;run('Y.actor=actorId');
 const areaId=run('AREAS[0].id'),brand=run('ownBrandName()'),id=fresh?'new':'context-test-branch';
 const record={id,name:'Async save fixture',brand,brandId:run('Y.ownBrandId'),relation:'own',status:'pending',area:areaId,province:'10',lat:null,lng:null,note:'Baseline',revision:1,archived:false,localOverlay:true,industryId:'fuel',sourceDataset:'workspace',...(options.record||{})};
 h.sandbox.fixtureRecord=record;if(!fresh)run('Y.pois=[structuredClone(fixtureRecord)]');
 h.sandbox.location.hash='#poi/'+id;
 const photo={id:'mock-frontage',src:'assets/demo-photos/frontage.jpg',kind:'mockup',title:['รูปทดสอบ','Test photo'],cover:true,addedAt:null};
 const photoDraftId=h.sandbox.window.YolkBranchContext.photoDraftId(record),dirty=options.dirtyPhotos!==false;
 rows.set(photoDraftId,{id:photoDraftId,photos:dirty?[photo]:[],savedPhotos:[],dirty,savedAt:null});await api.create(photoDraftId,{seedMockups:false});
 for(const key of ['rollbackCommit','finalizeCommit']){const original=api[key];api[key]=(...args)=>{calls.push(key);return original(...args)}}
 let release,entered;const gate=new Promise(resolve=>release=resolve),started=new Promise(resolve=>entered=resolve),originalCommit=api.commit;
 api.commit=async(...args)=>{calls.push('commit');const result=await originalCommit(...args);entered();await gate;return result};
 vm.runInContext(submitSource,h.sandbox,{filename:'actual-app-submit-handler.js'});
 const values={name:record.name||'',brand:record.brand||'',relation:record.relation,status:record.status,province:record.province||'',area:record.area||'',lat:record.lat===null?'':String(record.lat),lng:record.lng===null?'':String(record.lng),note:'Changed note',...(options.values||{})};
 const elements=Object.fromEntries(Object.entries(values).map(([name,value])=>[name,{name,value}]));
 const form={id:'poi-form',isConnected:true,dataset:{id,revision:fresh?'0':'1',photoDraftId},values,elements,querySelector:selector=>selector==='#form-error'?errorElement:{disabled:false}};
 const handler=h.documentListeners.get('submit').at(-1),submit=()=>handler({target:form,preventDefault(){}});
 return {h,run,api,rows,calls,errors,notices,form,id,photoDraftId,release,started,submit};
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
   assert(f.api.read(f.photoDraftId).dirty,'Edited photo draft must remain recoverable');assert.equal(f.api.read(f.photoDraftId).count,1);assert.equal(f.api.read(f.photoDraftId).savedPhotos.length,0);
   assert(f.errors.length||f.notices.length,'User receives an error or notification');
  });
 }
 for(const fresh of [false,true])await check(`${fresh?'New':'Existing'} branch save succeeds once when context remains stable`,async()=>{
  const f=await fixture(fresh),pending=f.submit();await f.started;f.release();await pending;
  assert.equal(f.run('Y.events.length'),1);assert.equal(f.run('Y.events[0].meta.industry'),'fuel');assert.equal(f.run('Y.events[0].meta.ownBrandId'),'bangchak');
  assert(f.calls.includes('finalizeCommit'));assert(f.calls.includes('committed'));assert(!f.calls.includes('rollbackCommit'));assert.equal(f.run('Y.pois[0].note'),'Changed note');
  assert.equal(f.run('Y.pois[0].photos.length'),1);assert.equal(f.run('Y.pois[0].revision'),fresh?1:2);assert.equal(f.run('Y.events[0].type'),fresh?'supply.created':'supply.updated');
 });
 await check('An unassigned source record can save a note without inventing administrative membership',async()=>{
  const f=await fixture(false,{dirtyPhotos:false,record:{name:null,brand:'PTT',brandId:'ptt',relation:'competitor',status:'source',area:null,province:null,lat:15.597502,lng:103.808856,sourceRecord:true,sourceDataset:'fuel',adminScope:{province_code:null},localOverlay:false}});
  const aggregates=f.run('JSON.stringify(AREAS.map(a=>a.supply))');await f.submit();
  assert.equal(f.errors.length,0);assert.equal(f.run('Y.events.length'),1);assert.equal(f.run('Y.pois[0].area'),null);assert.equal(f.run('Y.pois[0].province'),null);assert.equal(f.run('Y.pois[0].status'),'source');assert.equal(f.run('Y.pois[0].sourceRecord'),true);assert.equal(f.run('Y.pois[0].note'),'Changed note');assert.equal(f.run('Y.pois[0].name'),null);assert.equal(f.run('Y.pois[0].lat'),15.597502);assert.equal(f.run('Y.pois[0].lng'),103.808856);assert.equal(f.run('JSON.stringify(AREAS.map(a=>a.supply))'),aggregates);assert(!f.calls.includes('commit'));assert(!f.calls.includes('rollbackCommit'));
 });
 await check('Saving a real area UUID derives its province rather than retaining a contradictory selector',async()=>{
  const f=await fixture(false,{dirtyPhotos:false,values:{area:'8f69c8f1-b275-4616-8ab5-8c641881e93f',province:'10'}});const aggregates=f.run('JSON.stringify(AREAS.map(a=>a.supply))');await f.submit();
  assert.equal(f.errors.length,0);assert.equal(f.run('Y.pois[0].area'),'8f69c8f1-b275-4616-8ab5-8c641881e93f');assert.equal(f.run('Y.pois[0].province'),'45');assert.equal(f.run('Y.pois[0].assignmentSuggestion.method'),'team_entered');assert.equal(f.run('Y.pois[0].assignmentSuggestion.legalBoundaryIndependentlyVerified'),false);assert.equal(f.run('JSON.stringify(AREAS.map(a=>a.supply))'),aggregates);assert(f.run('Y.events[0].changes.some(c=>c.field==="province"&&c.after==="45")'));
 });
 await check('A recognized alias submits with its canonical own identity and keeps the known brand ID',async()=>{
  const f=await fixture(false,{dirtyPhotos:false,values:{brand:'บางจาก'}});await f.submit();assert.equal(f.errors.length,0);assert.equal(f.run('Y.pois[0].brand'),'Bangchak');assert.equal(f.run('Y.pois[0].brandId'),'bangchak');assert.equal(f.run('Y.pois[0].relation'),'own');assert.equal(f.run('Y.events.length'),1);
 });
 await check('A canonical brand alias cannot bypass the duplicate branch guard',async()=>{
  const f=await fixture(true,{dirtyPhotos:false,values:{brand:'บางจาก'}});
  f.run('Y.pois=[{...fixtureRecord,id:"existing-canonical-duplicate",brand:"Bangchak",brandId:"bangchak"}]');
  await f.submit();assert(f.errors.length||f.notices.length,'A duplicate alias needs a visible validation message');assert.equal(f.run('Y.pois.length'),1);assert.equal(f.run('Y.events.length'),0);assert(!f.calls.includes('committed'));
 });
 await check('New photo drafts are scoped to brand/context, not the shared literal new record ID',async()=>{
  const f=await fixture(true);assert.equal(f.photoDraftId,'new:'+f.run('criteriaContextKey()'));assert.notEqual(f.photoDraftId,'new');
  assert.equal(f.api.read(f.photoDraftId).count,1);const pending=f.submit();await f.started;f.release();await pending;assert.equal(f.run('Y.pois[0].photos.length'),1);assert.equal(f.run('Y.events.length'),1);assert(f.calls.includes('finalizeCommit'));assert(!f.calls.includes('rollbackCommit'));
 });
 const result={schemaVersion:1,test:'check-save-context',testedAt:new Date().toISOString(),passed:checks.every(c=>c.passed),checks,scope:'Actual extracted app async submit handler with real model, brand/context and photo modules; DOM and IndexedDB transaction transport mocked. No browser image decoding.'};
 const output=path.resolve(root,'../deliverables/yolk-v1.9.0/save-context-regression-results.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.error?'\n'+c.error:''));console.log(JSON.stringify({passed:result.passed,checks:checks.length,receipt:output}));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
