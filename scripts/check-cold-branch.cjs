/* Execute production branch rendering/form preservation against a cold source inventory.
 * The DOM/FormData adapter is deliberately small; this is not browser or device QA. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prototype=path.join(root,'prototype');
const prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const createHarness=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname);
const app=fs.readFileSync(path.join(prototype,'app.js'),'utf8');
const formStart=app.indexOf("let renderedRoute=''");
const formEnd=app.indexOf('\nfunction render(',formStart);
assert(formStart>=0&&formEnd>formStart,'Actual app form-preservation extraction failed');
const formSource=app.slice(formStart,formEnd);
assert(formSource.includes('function workingForm(')&&formSource.includes('function restoreWorkingForm('));
const plain=value=>JSON.parse(JSON.stringify(value));
const checks=[],started=Date.now();
async function check(name,test){const start=Date.now();try{await test();checks.push({name,passed:true,elapsedMs:Date.now()-start})}catch(error){checks.push({name,passed:false,error:String(error.stack||error),elapsedMs:Date.now()-start})}}

function fixture(){
 const h=createHarness(),nodes=new Map(),focusCalls=[];
 h.sandbox.$=selector=>nodes.get(selector)||null;
 h.sandbox.feed=()=>'';
 h.sandbox.YolkBranchPhotos={render:id=>'<div data-photo-fixture="'+id+'"></div>'};
 h.sandbox.FormData=class{
  constructor(form){this.entries=Object.entries(form.elements).filter(([,el])=>el.type!=='file').map(([name,el])=>[name,el.value]);}
  [Symbol.iterator](){return this.entries[Symbol.iterator]()}
 };
 vm.runInContext(fs.readFileSync(path.join(prototype,'branch-context.js'),'utf8'),h.sandbox,{filename:'actual-branch-context.js'});
 vm.runInContext(fs.readFileSync(path.join(prototype,'supply-ui.js'),'utf8'),h.sandbox,{filename:'actual-supply-ui.js'});
 vm.runInContext(formSource,h.sandbox,{filename:'actual-app-form-preservation.js'});
 const run=h.evaluate;
 function establishRenderedContext(){run('renderedHash=location.hash;renderedContext=criteriaContextKey()')}
 function mountForm(id,revision,values,province='10'){
  nodes.clear();focusCalls.length=0;
  const elements=Object.fromEntries(Object.entries(values).map(([name,value])=>[name,{value,type:'text'}]));
  const form={id:'poi-form',dataset:{id,revision:String(revision),photoDraftId:h.sandbox.window.YolkBranchContext.photoDraftId({id})},elements};
  nodes.set('#poi-form',form);
  nodes.set('#branch-province',{value:province});
  nodes.set('#branch-area',{innerHTML:'original area options'});
  const active=elements.note;
  if(active){Object.assign(active,{id:'branch-note',selectionStart:2,selectionEnd:7,focus(options){focusCalls.push({id:this.id,options})},setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end}});nodes.set('#branch-note',active)}
  h.sandbox.document.activeElement=active||null;
  establishRenderedContext();
  return {form,active};
 }
 function restore(snapshot){h.sandbox.formSnapshot=snapshot;run('restoreWorkingForm(formSnapshot)')}
 return {h,run,nodes,focusCalls,mountForm,restore,establishRenderedContext};
}

(async()=>{
 const f=fixture(),{h,run}=f;
 await h.select('grocery','grocery-brand:SEVEN_ELEVEN','C_STORE');
 const points=JSON.parse(fs.readFileSync(path.join(prototype,'data/real/grocery-points.json'),'utf8'));
 const first=Object.fromEntries(points.fields.map((field,i)=>[field,points.records[0][i]]));
 h.sandbox.location.hash='#poi/'+first.id;
 run('Y.pois=[];Y.pointState="not_loaded"');

 await check('Cold existing-ID route shows loading and cannot become a blank new branch form',()=>{
  for(const language of ['th','en']){
   h.sandbox.testLanguage=language;run('Y.lang=testLanguage');
   const html=run('poiEditor()');
   assert(html.includes('role="status"'));
   assert(!html.includes('id="poi-form"'));
   assert(!html.includes('data-id="new"'));
   assert(html.includes(language==='th'?'กำลังอ่านข้อมูลสาขา':'Loading this branch'));
  }
  f.establishRenderedContext();assert.equal(run('workingForm()'),null);
 });

 await check('In-flight source inventory keeps the requested branch in a loading state',async()=>{
  const pending=run('ensureSourcePoints()');
  assert.equal(run('Y.pointState'),'loading');
  assert(!run('poiEditor()').includes('id="poi-form"'));
  await pending;
  assert.equal(run('Y.pointState'),'ready');
 });

 let loaded;
 await check('Source completion renders the requested real record identity, brand, name and coordinates',()=>{
  h.sandbox.requestedId=first.id;loaded=plain(run('Y.pois.find(p=>p.id===requestedId)'));
  assert(loaded?.sourceRecord);
  assert.equal(loaded.id,first.id);assert.equal(loaded.name,first.name);assert.equal(loaded.brandId,first.brandId);
  assert.equal(loaded.lat,first.lat);assert.equal(loaded.lng,first.lng);
  const html=run('poiEditor()');
  for(const [key,value]of [['data-id',first.id],['data-revision',1]])assert(html.includes(key+'="'+value+'"'));
  for(const value of [loaded.name,loaded.brand,String(loaded.lat),String(loaded.lng)].filter(Boolean)){
   h.sandbox.expectedText=value;assert(html.includes(run('escapeHTML(expectedText)')));
  }
  assert(!html.includes('data-id="new"'));
  assert.equal(h.requests.filter(name=>name==='data/real/grocery-points.json').length,1);
 });

 await check('An absent ready record and a failed inventory remain status states, not editable new records',()=>{
  h.sandbox.location.hash='#poi/no-such-branch';
  for(const [state,message]of [['ready','absent from the selected inventory'],['error','failed to load']]){
   h.sandbox.testPointState=state;run('Y.lang="en";Y.pointState=testPointState');
   const html=run('poiEditor()');assert(html.includes(message));assert(!html.includes('id="poi-form"'));
  }
 });

 await check('Only explicit #poi/new creates the new-branch form when the inventory is cold',()=>{
  h.sandbox.location.hash='#poi/new';run('Y.pointState="not_loaded";Y.pois=[]');
  const html=run('poiEditor()');assert(html.includes('id="poi-form"'));assert(html.includes('data-id="new"'));assert(html.includes('data-revision="0"'));assert(html.includes('data-photo-draft-id="new:'+run('escapeHTML(criteriaContextKey())')+'"'));
  assert(html.includes('name="province"'));assert(!/<select[^>]*id="branch-area"[^>]*\brequired\b/.test(html),'Unresolved source membership must remain editable');
 });

 const area=plain(run('AREAS.find(a=>a.province==="10")'));
 const userValues={name:'ชื่อที่ทีมกำลังตรวจ',brand:loaded.brand,relation:'competitor',status:'pending',province:'10',area:area.id,lat:String(loaded.lat),lng:String(loaded.lng),note:'User draft, cursor stays here'};
 h.sandbox.location.hash='#poi/'+loaded.id;
 let snapshot;
 await check('Working form captures branch identity, expected revision, edits and text selection',()=>{
  f.mountForm(loaded.id,1,userValues);snapshot=plain(run('workingForm()'));
  assert.equal(snapshot.id,'poi-form');assert.equal(snapshot.recordId,loaded.id);assert.equal(snapshot.recordRevision,'1');
  assert.deepEqual(snapshot.values,userValues);assert.equal(snapshot.province,'10');assert.equal(snapshot.focus,'branch-note');assert.deepEqual(snapshot.selection,[2,7]);
 });

 await check('Same-record rerender restores user edits, area, focus and cursor while retaining the expected revision',()=>{
  const replacement={...userValues,name:'Fresh source value',note:'Fresh source note'};
  const {form,active}=f.mountForm(loaded.id,2,replacement);f.restore(snapshot);
  assert.deepEqual(Object.fromEntries(Object.entries(form.elements).map(([name,el])=>[name,el.value])),userValues);
  assert.equal(form.dataset.revision,'1','An intervening source revision must remain detectable by the save conflict guard');
  assert(f.nodes.get('#branch-area').innerHTML.includes('value="'+area.id+'" selected'));
  assert.equal(active.selectionStart,2);assert.equal(active.selectionEnd,7);assert.deepEqual(plain(f.focusCalls),[{id:'branch-note',options:{preventScroll:true}}]);
 });

 await check('Snapshot from the former blank new form cannot overwrite a newly loaded existing record',()=>{
  const {form}=f.mountForm(loaded.id,1,{...userValues,name:loaded.name,note:'Real source note'});
  const before=plain({dataset:form.dataset,values:Object.fromEntries(Object.entries(form.elements).map(([name,el])=>[name,el.value]))});
  f.restore({...snapshot,recordId:'new',recordRevision:'0',values:{...snapshot.values,name:'',brand:'',lat:'',lng:''}});
  assert.deepEqual(plain({dataset:form.dataset,values:Object.fromEntries(Object.entries(form.elements).map(([name,el])=>[name,el.value]))}),before);
  assert.equal(f.focusCalls.length,0);
 });

 await check('Snapshot from another branch cannot restore values, expected revision or focus',()=>{
  const {form}=f.mountForm('different-source-record',9,{...userValues,note:'Another branch draft'});
  const before=plain({dataset:form.dataset,values:Object.fromEntries(Object.entries(form.elements).map(([name,el])=>[name,el.value]))});f.restore(snapshot);
  assert.deepEqual(plain({dataset:form.dataset,values:Object.fromEntries(Object.entries(form.elements).map(([name,el])=>[name,el.value]))}),before);
  assert.equal(f.focusCalls.length,0);
 });

 await check('Leaving a route journals its old form while another branch/context cannot read it; back restores the original draft',()=>{
  f.mountForm(loaded.id,1,userValues);const originContext=run('criteriaContextKey()'),originBrand=run('Y.ownBrandId'),originHash=h.sandbox.location.hash;
  const confirmed=run('JSON.stringify({criteria:Y.criteria,targets:Y.targets,events:Y.events})');
  // Hash changes before render: capture the leaving form under renderedContext/renderedHash.
  h.sandbox.location.hash='#supply';const leaving=plain(run('rememberWorkingDraft()'));
  assert.equal(leaving.context,originContext);assert.equal(leaving.hash,originHash);assert.deepEqual(leaving.values,userValues);assert.equal(run('readWorkingDraft()'),null);
  h.sandbox.location.hash='#poi/different-source-record';assert.equal(run('readWorkingDraft()'),null);
  h.sandbox.location.hash=originHash;run('Y.ownBrandId="grocery-brand:CJ_MORE"');assert.equal(run('readWorkingDraft()'),null);
  h.sandbox.originBrand=originBrand;run('Y.ownBrandId=originBrand');const restored=plain(run('readWorkingDraft()'));
  assert.deepEqual(restored.values,userValues);assert.equal(restored.recordId,loaded.id);assert.equal(restored.recordRevision,'1');
  assert.equal(run('JSON.stringify({criteria:Y.criteria,targets:Y.targets,events:Y.events})'),confirmed);
 });

 await check('Restore leaves file inputs alone and safely ignores an absent form',()=>{
  const {form}=f.mountForm(loaded.id,1,userValues);form.elements.photo={type:'file',value:'Browser-owned file selection'};
  f.restore({...snapshot,values:{...snapshot.values,photo:'Must not replace file selection'}});assert.equal(form.elements.photo.value,'Browser-owned file selection');
  f.nodes.clear();f.restore(snapshot);assert.equal(run('workingForm()'),null);
 });

 await check('Source assignment suggestions and manual choices survive same-record form replacement',()=>{
  const {form}=f.mountForm(loaded.id,1,userValues);const api=h.sandbox.window.YolkBranchContext;
  const state={manualProvince:true,manualArea:true,autoProvince:false,autoArea:false,candidates:[{id:area.id,province:'10',classification:'inside'}],result:{state:'unique',provinceCandidates:[{code:'10',classification:'inside'}],areaCandidates:[{id:area.id,province:'10',classification:'inside'}],sourceFiles:['test-display-boundary']}};
  api.restore(form,state);const saved=plain(run('workingForm()'));assert.deepEqual(saved.branchContext,state);
  const replacement=f.mountForm(loaded.id,1,userValues).form;f.restore(saved);assert.deepEqual(plain(api.snapshot(replacement)),state);
 });

 const result={schemaVersion:1,test:'check-cold-branch',testedAt:new Date().toISOString(),passed:checks.every(c=>c.passed),elapsedMs:Date.now()-started,checks,
  scope:'Actual production poiEditor, ensureSourcePoints, workingForm and restoreWorkingForm; real source-record fixture and model/context modules. DOM/FormData and transport adapters only. Does not claim browser timing, pixel layout or physical-device QA.',
  sourceHashes:Object.fromEntries(['prototype/app.js','prototype/supply-ui.js','prototype/branch-context.js','prototype/industry-workspace.js','prototype/model.js','prototype/data/real/grocery-points.json'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]))};
 const output=path.resolve(root,'../deliverables/yolk-v1.9.0/cold-branch-regression-results.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 for(const c of checks)console.log((c.passed?'PASS ':'FAIL ')+c.name+(c.error?'\n'+c.error:''));
 console.log(JSON.stringify({passed:result.passed,checks:checks.length,receipt:output}));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
