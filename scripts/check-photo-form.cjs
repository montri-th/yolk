/* VM integration of actual app submit handler + actual photo/model modules. No browser/DOM rendering. */
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const project=path.resolve(__dirname,'..'),prototype=path.join(project,'prototype');
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture(){
 const elements=new Map(),handlers={},photoRows=new Map(),stored=new Map(),calls=[],notices=[];
 let failModel=false;
 const el=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){}},setAttribute(){},showModal(){},close(){},focus(){},scrollIntoView(){}});return elements.get(key)};
 const database={createObjectStore(){},transaction(){const tx={};tx.objectStore=()=>({get:key=>req('get',key),put:r=>req('put',r),delete:key=>req('delete',key)});function req(op,v){const r={};setTimeout(()=>{if(op==='put')photoRows.set(v.id,plain(v));if(op==='delete')photoRows.delete(v);r.result=op==='get'?photoRows.get(v):v;r.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0);},0);return r;}return tx;}};
 const indexedDB={open(){const r={};setTimeout(()=>{r.result=database;r.onsuccess?.()},0);return r;}};
 const ctx=vm.createContext({document:{documentElement:{lang:'th',dataset:{},style:{}},title:'',querySelector:k=>k==='[data-location-map]'?null:el(k),querySelectorAll(){return []},addEventListener:(type,fn)=>handlers[type]=fn},location:{hash:'#market'},localStorage:{getItem:k=>stored.get(k)||null,setItem(k,v){if(failModel&&k==='citymeter-yolk-public-demo-v1')throw new Error('QuotaExceededError');stored.set(k,v)}},indexedDB,structuredClone,crypto:crypto.webcrypto,clearTimeout(){},setTimeout,addEventListener(){},scrollTo(){},console,FormData:class{constructor(f){this.v=f.values}[Symbol.iterator](){return Object.entries(this.v)[Symbol.iterator]()}},MouseEvent:class{}});ctx.window=ctx;
 for(const file of ['theme.js','data/thailand-provinces.js','data/demo-data.js','metrics.js','model.js','landscape.js','leaderboard.js','supply-ui.js','data/demo-map-context.js','location-map.js','branch-photos.js','app.js'])vm.runInContext(fs.readFileSync(path.join(prototype,file),'utf8'),ctx,{filename:file});
 const run=s=>vm.runInContext(s,ctx);ctx.testNotify=s=>notices.push(s);ctx.testRender=()=>calls.push(['render']);run('notify=testNotify;render=testRender');
 const api=ctx.YolkBranchPhotos;
 for(const method of ['commit','rollbackCommit','finalizeCommit']){const original=api[method];api[method]=(...args)=>{calls.push([method,...args]);return original(...args)}}
 function form(branch=plain(run('Y.pois[0]'))){const fresh=!branch,id=fresh?'new':branch.id,submit={disabled:false},values=fresh?{name:'Integration photo branch',brand:'BANGCHAK',relation:'own',status:'pending',area:run('AREAS[0].id'),lat:'',lng:'',note:'Test entry'}:Object.fromEntries(['name','brand','relation','status','area','lat','lng','note'].map(k=>[k,branch[k]===null||branch[k]===undefined?'':String(branch[k])]));return {id:'poi-form',dataset:{id,revision:fresh?'0':String(branch.revision)},values,querySelector:()=>submit,button:submit};}
 async function remove(id,photoId='mock-shop'){
   api.render(id,{editable:true,lang:'th'});await api.create(id);
   const node={dataset:{branchPhotos:id},isConnected:true,innerHTML:'',events:{},addEventListener(k,fn){this.events[k]=fn;}};
   api.bind({querySelectorAll:()=>[node]},{editable:true,canEdit:()=>run('canEdit()')});
   await node.events.click({target:{closest:()=>({dataset:{photoAction:'remove',photoId},disabled:false})}});
 }
 async function submit(form){await handlers.submit({target:form,preventDefault(){calls.push(['preventDefault'])}});}
 return {ctx,run,api,el,stored,photoRows,calls,notices,form,remove,submit,setModelQuotaFailure:v=>failModel=v};
}
let checks=0;const check=(ok,label)=>{assert(ok,label);checks++;};const has=(f,name)=>f.calls.some(c=>c[0]===name);const success=f=>f.notices.some(s=>s.includes('บันทึกแล้ว')||s.startsWith('Saved'));
(async()=>{
 const f=fixture(),form=f.form(),id=form.dataset.id,oldRevision=f.run('Y.pois[0].revision');await f.remove(id);await f.submit(form);
 check(has(f,'commit')&&has(f,'finalizeCommit')&&!has(f,'rollbackCommit'),'successful photo save commits and finalizes');
 check(f.run('Y.events.length')===1,'photo-only save creates exactly one event');
 const event=plain(f.run('Y.events[0]'));
 check(event.type==='supply.updated'&&event.changes.length===1&&event.changes[0].field==='photos','photo-only event classified correctly');
 check(event.changes[0].before.length===5&&event.changes[0].after.length===4,'event includes seeded before list and edited after list');
 check(f.run('Y.pois[0].photos.length')===4&&f.run('Y.pois[0].revision')===oldRevision+1,'branch metadata and revision updated');
 check(!JSON.stringify(event).includes('data:image')&&!JSON.stringify(event).includes('"src"'),'feed excludes image content');
 check(success(f)&&form.button.disabled===false&&form.dataset.saving==='false','successful save reports success and releases controls');
 check(!f.api.read(id).dirty,'photo draft clean after save');
 check(f.run("displayValue(Y.events[0].changes[0].after,'photos')").includes('ด้านหน้าสาขา')&&!f.run("displayValue(Y.events[0].changes[0].after,'photos')").includes('[object Object]'),'Thai photo field shows human title');
 f.run("Y.lang='en'");check(f.run("displayValue(Y.events[0].changes[0].after,'photos')").includes('Frontage'),'English photo field shows human title');
 const f2=fixture(),vform=f2.form();await f2.remove(vform.dataset.id);f2.run("Y.actor='v0'");await f2.submit(vform);check(!has(f2,'commit')&&f2.run('Y.events.length')===0&&!success(f2),'viewer cannot submit photo changes');
 for(const state of [{ready:false,busy:false},{ready:true,busy:true}]){const g=fixture(),gf=g.form();await g.remove(gf.dataset.id);const read=g.api.read;g.api.read=id=>({...read(id),...state});await g.submit(gf);check(!has(g,'commit')&&g.run('Y.events.length')===0&&g.el('#form-error').textContent.includes('รอเตรียมรูป'),'not-ready/busy blocks branch save');}
 const q=fixture(),qform=q.form(),before=plain(q.run('Y.pois[0]'));await q.remove(qform.dataset.id);q.setModelQuotaFailure(true);await q.submit(qform);
 check(has(q,'commit')&&has(q,'rollbackCommit')&&!has(q,'finalizeCommit'),'model quota failure rolls back photo commit');
 check(JSON.stringify(plain(q.run('Y.pois[0]')))===JSON.stringify(before)&&q.run('Y.events.length')===0,'quota failure restores branch and event state');
 check(q.api.read(qform.dataset.id).dirty&&q.api.read(qform.dataset.id).count===4&&q.api.read(qform.dataset.id).savedPhotos.length===5,'quota failure retains edited draft and original baseline');
 check(!success(q)&&q.el('#form-error').textContent.length>0&&qform.button.disabled===false,'quota failure has error and no success');
 q.setModelQuotaFailure(false);await q.submit(qform);check(q.run('Y.events.length')===1&&success(q)&&!q.api.read(qform.dataset.id).dirty,'retry after quota produces one successful event');
 const n=fixture(),nf=n.form(null);n.photoRows.set('new',{id:'new',photos:[{id:'mock-frontage',src:'assets/demo-photos/frontage.jpg',kind:'mockup',title:['ด้านหน้าสาขา','Frontage'],cover:true,addedAt:null}],savedPhotos:[],dirty:true,savedAt:null});await n.api.create('new',{seedMockups:false});const count=n.run('Y.pois.length');await n.submit(nf);const np=plain(n.run('Y.pois[Y.pois.length-1]'));
 check(n.run('Y.pois.length')===count+1&&np.id.startsWith('poi-')&&np.photos.length===1,'new branch includes photo metadata');
 check(n.calls.find(c=>c[0]==='commit')[1]==='new'&&n.calls.find(c=>c[0]==='commit')[2]===np.id&&!n.photoRows.has('new')&&n.photoRows.has(np.id),'new draft migrates to generated branch ID');
 check(n.run('Y.events[0].type')==='supply.created'&&n.run('Y.events.length')===1,'new branch has one creation event');
 const no=fixture(),nof=no.form();await no.api.create(nof.dataset.id);nof.values.note+=' changed';await no.submit(nof);check(!has(no,'commit')&&no.run('Y.events.length')===1&&success(no),'unchanged seeded photos need no photo write for text edit');
 const race=fixture(),rf=race.form();await race.remove(rf.dataset.id);const realCommit=race.api.commit;race.api.commit=async(...args)=>{const result=await realCommit(...args);race.run("Y.actor='v0'");return result;};await race.submit(rf);check(has(race,'rollbackCommit')&&race.run('Y.events.length')===0&&!success(race)&&race.api.read(rf.dataset.id).dirty,'actor change during async commit cancels and restores draft');
 const nq=fixture(),nqf=nq.form(null);nq.photoRows.set('new',{id:'new',photos:[{id:'mock-frontage',src:'assets/demo-photos/frontage.jpg',kind:'mockup',title:['ด้านหน้าสาขา','Frontage'],cover:true,addedAt:null}],savedPhotos:[],dirty:true,savedAt:null});await nq.api.create('new',{seedMockups:false});const nqCount=nq.run('Y.pois.length');nq.setModelQuotaFailure(true);await nq.submit(nqf);const attempted=nq.calls.find(c=>c[0]==='commit')[2];check(nq.run('Y.pois.length')===nqCount&&nq.api.read('new').dirty&&nq.photoRows.has('new')&&!nq.photoRows.has(attempted)&&!success(nq),'new branch quota failure moves draft back without orphan branch');
 const double=fixture(),df=double.form();await double.remove(df.dataset.id);await Promise.all([double.submit(df),double.submit(df)]);check(double.run('Y.events.length')===1&&double.calls.filter(c=>c[0]==='commit').length===1,'double submit produces one photo commit and event');
 const empty=fixture(),ef=empty.form(null);await empty.api.create('new',{seedMockups:false});await empty.submit(ef);const emptyBranch=plain(empty.run('Y.pois[Y.pois.length-1]'));empty.ctx.location.hash='#poi/'+emptyBranch.id;const emptyEditor=empty.run('poiEditor()');check(emptyBranch.sourceDataset==='workspace'&&!has(empty,'commit')&&empty.api.read(emptyBranch.id).count===0&&!emptyEditor.includes('branch-photo-card'),'workspace branch saved without photos stays empty when editor opens');
 const seeded=fixture(),sample=plain(seeded.run('Y.pois[0]'));seeded.ctx.location.hash='#poi/'+sample.id;const seededEditor=seeded.run('poiEditor()');check(seeded.api.read(sample.id).count===5&&seededEditor.includes('branch-photo-card'),'synthetic sample branch editor gets five mockups');
 console.log(JSON.stringify({passed:checks,scope:'Actual async app submit + model + photo module in Node VM; local stores mocked; no browser or image decode'}));
})().catch(error=>{console.error(error.stack);process.exitCode=1});
