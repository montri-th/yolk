const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'../prototype/branch-photos.js'),'utf8');
function runtime(fail=false){
 const rows=new Map();
 const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 const d={createObjectStore(){},transaction(){const tx={};tx.objectStore=()=>({get:key=>request('get',key),put:r=>request('put',r),delete:key=>request('delete',key)});function request(op,v){const r={};setTimeout(()=>{if(fail){r.error=new Error('quota');tx.onerror?.();return;}if(op==='put')rows.set(v.id,clone(v));if(op==='delete')rows.delete(v);r.result=op==='get'?clone(rows.get(v)):v;r.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0);},0);return r;}return tx;}};
 const indexedDB={open(){const r={};setTimeout(()=>{if(fail){r.error=new Error('blocked');r.onerror?.();return;}r.result=d;r.onsuccess?.()},0);return r;}};
 const context={window:{indexedDB},setTimeout,Uint8Array,console,URL,Image:function(){}};vm.createContext(context);vm.runInContext(source,context);return {api:context.window.YolkBranchPhotos,rows,setFail:value=>{fail=value;}};
}
const plain=x=>JSON.parse(JSON.stringify(x));
function root(id){return {dataset:{branchPhotos:id},isConnected:true,innerHTML:'',events:{},addEventListener(k,f){this.events[k]=f;}};}
function click(r,action,id){return r.events.click({target:{closest:()=>({dataset:{photoAction:action,photoId:id},disabled:false})}});}
function file(type,bytes,size=bytes.length){return {type,size,slice(){return {arrayBuffer:async()=>Uint8Array.from(bytes).buffer}}};}
(async()=>{
 const {api,rows}=runtime();let count=0;
 const check=(ok,label)=>{assert(ok,label);count++;};
 api.render('demo',{lang:'th',editable:true});await api.create('demo');
 check(api.read('demo').count===5,'5 demo photos');check(api.read('demo').photos.filter(x=>x.cover).length===1,'one cover');
 const r=root('demo');api.bind({querySelectorAll:()=>[r]},{editable:true,canEdit:()=>true});await api.create('demo');
 await r.events.change({target:{closest:()=>({files:[{name:'sixth'}]})}});check(api.read('demo').count===5&&r.innerHTML.includes('สูงสุด 5 รูป'),'max5 blocked before processing');
 await click(r,'remove','mock-shop');check(api.read('demo').count===4&&api.read('demo').dirty,'remove creates draft');
 check(api.read('demo').savedPhotos.length===5,'savedPhotos preserves baseline');
 api.render('demo',{lang:'en',editable:true});check(api.read('demo').count===4,'language rerender preserves draft');
 check(rows.get('demo').photos.length===4&&rows.get('demo').dirty,'draft persisted');
 await click(r,'cover','mock-pumps');check(api.read('demo').photos.find(x=>x.cover).id==='mock-pumps','cover updated');
 const committed=await api.commit('demo');check(committed.changed&&!committed.dirty,'commit dirty state');check(!JSON.stringify(committed).includes('src'),'metadata excludes binary URLs');
 await click(r,'remove','mock-pumps');await api.reset('demo');check(api.read('demo').count===4&&api.read('demo').photos.find(x=>x.cover).id==='mock-pumps','undo to saved cover');
 const viewer=root('demo');api.render('demo',{editable:false});api.bind({querySelectorAll:()=>[viewer]},{editable:false,canEdit:()=>false});await api.create('demo');await click(viewer,'remove','mock-pumps');check(api.read('demo').count===4,'viewer cannot remove');
 check(!api.render('demo',{editable:false}).includes('data-photo-action'),'viewer has no controls');
 api.render('new',{seedMockups:false});await api.create('new');check(api.read('new').count===0,'new branch empty');await api.commit('new','created');check(api.read('created').count===0&&!rows.has('new'),'new ID migration');
 const jpg=file('image/jpeg',[255,216,255,224,0,0,0,0,0,0,0,0]);await api.validateFile(jpg);check(true,'JPEG signature accepted');
 for(const f of [file('image/svg+xml',Array(20).fill(0)),file('image/png',Array(20).fill(0)),file('image/jpeg',[255,216,255,...Array(9).fill(0)],11*1024*1024)]){await assert.rejects(api.validateFile(f));count++;}
 api.render('demo',{editable:true});const edit=root('demo');api.bind({querySelectorAll:()=>[edit]},{editable:true,canEdit:()=>true});await api.create('demo');
 const savedBaseline=plain(api.read('demo').savedPhotos);await click(edit,'remove','mock-pumps');await api.commit('demo');
 const rolled=await api.rollbackCommit('demo');check(rolled.rolledBack&&rolled.restoredId==='demo'&&rolled.dirty,'failed-save rollback restores dirty');check(JSON.stringify(rolled.savedPhotos)===JSON.stringify(savedBaseline),'failed-save rollback keeps saved seed baseline');
 api.render('new', {seedMockups:false});await api.create('new');await api.commit('new','new-created');const movedBack=await api.rollbackCommit('new-created');check(movedBack.restoredId==='new'&&!rows.has('new-created')&&rows.has('new'),'rollback new ID');
 await api.commit('demo');api.finalizeCommit('demo');check((await api.rollbackCommit('demo')).rolledBack===false,'successful save finalizes rollback snapshot');
 const separate=runtime();separate.rows.set('new',{...plain(rows.get('demo')),id:'new',dirty:true});await separate.api.create('new',{seedMockups:false});const countDraft=separate.api.read('new').count;await separate.api.commit('new','retry-id');const backNew=await separate.api.rollbackCommit('retry-id');check(backNew.dirty&&backNew.count===countDraft&&backNew.restoredId==='new','dirty new photo draft survives ID rollback');
 await separate.api.commit('new','quota-id');separate.setFail(true);await assert.rejects(separate.api.rollbackCommit('quota-id'));count++;check(separate.api.read('new').dirty,'failed rollback persistence keeps in-memory draft dirty');separate.setFail(false);check((await separate.api.rollbackCommit('quota-id')).restoredId==='new','rollback can retry after quota failure');
 const unavailable=runtime(true).api;unavailable.render('demo');await unavailable.create('demo');check((await unavailable.commit('demo')).changed===false,'unchanged seed saves without IDB');
 console.log(JSON.stringify({passed:count,scope:'Node state/permission/storage/file-header checks; browser image decode and visual QA not exercised'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
