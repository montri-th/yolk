/* Local-only branch photo drafts. No network upload; photos never enter analytical supply. */
(function (global) {
  'use strict';
  const VERSION = 1, MAX = 5, MAX_BYTES = 10 * 1024 * 1024, MAX_OUTPUT = 420 * 1024;
  const STORE = 'branches', DB_NAME = 'citymeter-yolk-branch-photos-v1';
  const states = new Map(), loads = new Map(), pending = new Map(), commitSnapshots = new Map();
  let database;
  const labels = {
    frontage: ['ด้านหน้าสาขา', 'Frontage'], entrance: ['ทางเข้า–ออก', 'Entrance & exit'],
    pumps: ['หัวจ่ายและหลังคา', 'Pumps & canopy'], shop: ['ร้านค้า', 'Shop'], forecourt: ['ลานจอดและทางวิ่ง', 'Forecourt']
  };
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tr = (s, th, en) => s.lang === 'en' ? en : th;
  const clone = v => JSON.parse(JSON.stringify(v));
  function examples() { return Object.entries(labels).map(([id, title], i) => ({id:'mock-'+id, src:'assets/demo-photos/'+id+'.jpg', kind:'mockup', title, cover:i===0, addedAt:null})); }
  function get(id, opts = {}) {
    id = String(id || 'new');
    if (!states.has(id)) {
      const photos = opts.seedMockups === false || id === 'new' ? [] : examples();
      states.set(id, {id, lang:opts.lang || 'th', editable:opts.editable !== false, photos, savedPhotos:clone(photos), dirty:false, busy:false, error:'', savedAt:null, ready:false, seedMockups:opts.seedMockups !== false});
    }
    const s = states.get(id);
    if (opts.lang) s.lang = opts.lang;
    if (typeof opts.editable === 'boolean') s.editable = opts.editable;
    return s;
  }
  function db() {
    if (!database) database = new Promise((resolve, reject) => {
      if (!global.indexedDB) return reject(new Error('Storage unavailable'));
      const request = global.indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, {keyPath:'id'});
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Storage unavailable'));
      request.onblocked = () => reject(new Error('Storage blocked'));
    });
    return database;
  }
  async function storage(method, value) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const transaction = d.transaction(STORE, method === 'get' ? 'readonly' : 'readwrite');
      const request = transaction.objectStore(STORE)[method](value);
      let result;
      request.onsuccess = () => { result = request.result; };
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = transaction.onabort = () => reject(transaction.error || request.error || new Error('Storage unavailable'));
    });
  }
  function safePhoto(p) {
    return p && typeof p.id === 'string' && typeof p.src === 'string' &&
      (/^assets\/demo-photos\/(frontage|entrance|pumps|shop|forecourt)\.jpg$/.test(p.src) || /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.src)) && p.src.length < MAX_OUTPUT * 1.4 + 128;
  }
  async function create(id, opts = {}) {
    const s = get(id, opts);
    if (!loads.has(s.id)) loads.set(s.id, (async () => {
      try {
        const record = await storage('get', s.id);
        if (record && Array.isArray(record.photos) && record.photos.length <= MAX && record.photos.every(safePhoto)) {
          s.photos = record.photos; s.savedPhotos = (record.savedPhotos || record.photos).filter(safePhoto).slice(0, MAX);
          s.dirty = !!record.dirty; s.savedAt = record.savedAt || null;
        }
      } catch (_) { s.error = tr(s,'เบราว์เซอร์เก็บรูปไม่ได้ รูปที่เพิ่มจะอยู่จนกว่าจะปิดหน้านี้','Storage unavailable. Added photos last only until this page closes.'); }
      s.ready = true; return s;
    })());
    await loads.get(s.id); return read(s.id);
  }
  function read(id) {
    const s = get(id);
    return {branchId:s.id, count:s.photos.length, dirty:s.dirty, busy:s.busy, ready:s.ready, savedAt:s.savedAt,
      photos:s.photos.map(({id,kind,title,cover,addedAt})=>({id,kind,title:clone(title || ['', '']),cover,addedAt})),
      savedPhotos:s.savedPhotos.map(({id,kind,title,cover,addedAt})=>({id,kind,title:clone(title || ['', '']),cover,addedAt}))};
  }
  async function persist(s) {
    const record = {id:s.id, photos:clone(s.photos), savedPhotos:clone(s.savedPhotos), dirty:s.dirty, savedAt:s.savedAt};
    const previous = pending.get(s.id) || Promise.resolve();
    const write = previous.catch(()=>{}).then(()=>storage('put',record));
    pending.set(s.id,write);
    try { await write; return true; }
    catch (_) { s.error = tr(s,'เก็บร่างรูปไม่ได้ พื้นที่เบราว์เซอร์อาจเต็ม กรุณาลบรูปบางส่วนแล้วลองอีกครั้ง','Could not save photo draft. Browser storage may be full; remove a photo and try again.'); return false; }
  }
  function inner(s) {
    const can = s.editable && !s.busy && s.ready;
    const cover = s.photos.find(p=>p.cover) || s.photos[0];
    const title = p => Array.isArray(p.title) ? p.title[s.lang === 'en' ? 1 : 0] : p.title || tr(s,'รูปสาขา','Branch photo');
    return `<div class="branch-photos-head"><div><h2>${tr(s,'รูปสาขา','Branch photos')}</h2><p>${tr(s,'เห็นสาขาชัดขึ้น ก่อนออกสำรวจ','See the site before your visit.')}</p></div><span class="photo-count">${s.photos.length} / ${MAX}</span></div>
      ${s.photos.some(p=>p.kind==='mockup')?`<p class="photo-disclosure">${tr(s,'ภาพตัวอย่างสร้างด้วย AI ไม่ใช่ภาพสถานีจริง','AI-generated examples, not real station photographs.')}</p>`:''}
      <div class="branch-photo-grid">${s.photos.map(p=>`<article class="branch-photo-card ${p===cover?'is-cover':''}"><div class="branch-photo-image"><img src="${esc(p.src)}" alt="${esc(title(p))}${p.kind==='mockup'?tr(s,' — ภาพจำลอง',' — mockup'):''}" loading="lazy" decoding="async"><span class="photo-kind">${p.kind==='mockup'?tr(s,'ภาพจำลอง','Mockup'):tr(s,'รูปในเครื่อง','Local photo')}</span>${p===cover?`<span class="photo-cover">${tr(s,'รูปปก','Cover')}</span>`:''}</div><div class="branch-photo-caption"><strong>${esc(title(p))}</strong>${s.editable?`<div class="branch-photo-actions"><button type="button" data-photo-action="cover" data-photo-id="${esc(p.id)}" ${!can||p===cover?'disabled':''}>${p===cover?tr(s,'รูปปกแล้ว','Cover photo'):tr(s,'ใช้เป็นปก','Set cover')}</button><button type="button" data-photo-action="remove" data-photo-id="${esc(p.id)}" aria-label="${esc(tr(s,'ลบรูป ','Remove ')+title(p))}" ${!can?'disabled':''}>${tr(s,'ลบ','Remove')}</button></div>`:''}</div></article>`).join('')}
      ${s.photos.length<MAX&&s.editable?`<label class="photo-add ${!can?'is-disabled':''}"><span class="photo-add-icon" aria-hidden="true">＋</span><strong>${tr(s,'เพิ่มรูป','Add photo')}</strong><span>JPG · PNG · WebP</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple ${!can?'disabled':''} aria-label="${tr(s,'เลือกรูปสาขา สูงสุด 5 รูป','Choose branch photos, maximum 5')}"></label>`:''}</div>
      ${!s.photos.length&&!s.editable?`<p class="photo-empty">${tr(s,'ยังไม่มีรูปสาขา','No branch photos yet.')}</p>`:''}
      <div class="photo-storage-note"><span role="status">${s.busy?tr(s,'กำลังเตรียมรูป…','Preparing photos…'):!s.ready?tr(s,'กำลังอ่านรูป…','Loading photos…'):s.dirty?tr(s,'มีร่างรูป • กดบันทึกสาขาเพื่อยืนยัน','Photo draft • Save the branch to confirm'):tr(s,'รูปเก็บในเบราว์เซอร์นี้เท่านั้น','Photos stay in this browser only.')}</span>${s.editable&&s.dirty?`<button type="button" data-photo-action="reset" ${!can?'disabled':''}>${tr(s,'ย้อนร่างรูป','Undo photo changes')}</button>`:''}</div>
      ${s.editable?`<p class="photo-file-note">${tr(s,'สูงสุด 5 รูป • รูปละไม่เกิน 10 MB • ระบบย่อรูปก่อนเก็บ ไม่อัปโหลดออกจากเครื่อง','Up to 5 photos • 10 MB per file • Resized before local storage. Nothing is uploaded.')}</p>`:''}
      <p class="photo-error" role="alert">${esc(s.error)}</p>`;
  }
  function render(id, opts = {}) {
    const s = get(id, opts);
    return `<section class="branch-photos" data-branch-photos="${esc(s.id)}" aria-label="${tr(s,'รูปสาขา','Branch photos')}">${inner(s)}</section>`;
  }
  function refresh(root, s) { if (root?.isConnected !== false) root.innerHTML = inner(s); }
  async function validate(file) {
    if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('type');
    if (file.size > MAX_BYTES || file.size < 12) throw new Error('size');
    const h = new Uint8Array(await file.slice(0,12).arrayBuffer());
    const jpeg=h[0]===255&&h[1]===216&&h[2]===255;
    const png=h[0]===137&&h[1]===80&&h[2]===78&&h[3]===71;
    const webp=String.fromCharCode(...h.slice(0,4))==='RIFF'&&String.fromCharCode(...h.slice(8,12))==='WEBP';
    if (!(jpeg&&file.type==='image/jpeg'||png&&file.type==='image/png'||webp&&file.type==='image/webp')) throw new Error('type');
    return true;
  }
  async function prepare(file) {
    await validate(file);
    const url=URL.createObjectURL(file), img=new Image();
    try {
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('decode'));img.src=url;});
      const w=img.naturalWidth,h=img.naturalHeight;
      if(w<120||h<120||w*h>24000000||w>16000||h>16000)throw new Error('dimensions');
      const ratio=Math.min(1,1280/Math.max(w,h)), canvas=document.createElement('canvas');
      canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
      const ctx=canvas.getContext('2d'); if(!ctx)throw new Error('decode');
      ctx.fillStyle='#f0eee4';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
      let quality=.84,src=canvas.toDataURL('image/jpeg',quality);
      while(src.length>MAX_OUTPUT*4/3 && quality>.44){quality-=.1;src=canvas.toDataURL('image/jpeg',quality);}
      if(src.length>MAX_OUTPUT*4/3)throw new Error('size');
      return {id:'local-'+(global.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),src,kind:'local',title:[file.name.slice(0,80),file.name.slice(0,80)],cover:false,addedAt:new Date().toISOString()};
    } finally { URL.revokeObjectURL(url); }
  }
  function message(s,code){return ({type:tr(s,'ใช้ไฟล์ JPG, PNG หรือ WebP เท่านั้น','Choose a JPG, PNG or WebP image.'),size:tr(s,'รูปใหญ่เกินไป ใช้ไฟล์ไม่เกิน 10 MB','Photo is too large. Choose a file up to 10 MB.'),dimensions:tr(s,'ขนาดรูปต้องอย่างน้อย 120 × 120 และไม่เกิน 24 ล้านพิกเซล','Images must be at least 120 × 120 and no more than 24 megapixels.'),decode:tr(s,'เปิดรูปนี้ไม่ได้ ลองใช้ไฟล์อื่น','This image could not be opened. Try another file.')})[code]||tr(s,'เพิ่มรูปไม่สำเร็จ กรุณาลองอีกครั้ง','Could not add the photo. Try again.');}
  function bind(container=document, opts={}) {
    container.querySelectorAll('[data-branch-photos]').forEach(root=>{
      if(root.dataset.photoBound)return;root.dataset.photoBound='true';
      const s=get(root.dataset.branchPhotos,opts), allowed=()=>s.editable&&(typeof opts.canEdit!=='function'||opts.canEdit());
      create(s.id,opts).then(()=>refresh(root,s));
      root.addEventListener('click',async event=>{
        const b=event.target.closest('[data-photo-action]');if(!b||b.disabled||!allowed()||s.busy)return;
        const action=b.dataset.photoAction,p=s.photos.find(x=>x.id===b.dataset.photoId);
        s.error='';
        if(action==='reset'){await reset(s.id);refresh(root,s);opts.onChange?.({action:'reset',...read(s.id)});return;}
        if(action==='remove'&&p){s.photos=s.photos.filter(x=>x.id!==p.id);if(p.cover&&s.photos[0])s.photos[0].cover=true;}
        else if(action==='cover'&&p)s.photos.forEach(x=>x.cover=x===p);else return;
        s.dirty=true;s.busy=true;refresh(root,s);await persist(s);s.busy=false;refresh(root,s);opts.onChange?.({action,...read(s.id)});
      });
      root.addEventListener('change',async event=>{
        const input=event.target.closest('input[type=file]');if(!input||!allowed()||s.busy)return;
        const files=Array.from(input.files||[]);if(!files.length)return;
        if(files.length+s.photos.length>MAX){s.error=tr(s,'เพิ่มได้สูงสุด 5 รูป ลบรูปเดิมหรือเลือกให้น้อยลง','Maximum 5 photos. Remove one or choose fewer files.');refresh(root,s);return;}
        s.busy=true;s.error='';refresh(root,s);
        try{const added=[];for(const file of files)added.push(await prepare(file));if(!allowed())return;if(!s.photos.length)added[0].cover=true;s.photos.push(...added);s.dirty=true;await persist(s);opts.onChange?.({action:'add',...read(s.id)});}
        catch(error){s.error=message(s,error.message);}
        finally{s.busy=false;refresh(root,s);}
      });
    });
  }
  async function reset(id){const s=get(id);await create(id);if(s.busy)throw new Error('Photos are still processing');s.busy=true;s.photos=clone(s.savedPhotos);s.dirty=false;s.error='';await persist(s);s.busy=false;return read(id);}
  async function commit(id, nextId=id) {
    const s=get(id);await create(id);if(s.busy)throw new Error('Photos are still processing');
    const dirty=s.dirty,oldId=s.id,previousSaved=s.savedPhotos,previousSavedAt=s.savedAt;
    if(!dirty && String(nextId)===oldId)return {changed:false,...read(s.id)};
    await (pending.get(oldId)||Promise.resolve()).catch(()=>{});
    s.savedPhotos=clone(s.photos);s.dirty=false;s.savedAt=new Date().toISOString();s.id=String(nextId);
    if(!await persist(s)){s.id=oldId;s.dirty=dirty;s.savedPhotos=previousSaved;s.savedAt=previousSavedAt;throw new Error(s.error);}
    commitSnapshots.set(s.id,{state:s,oldId,savedPhotos:previousSaved,savedAt:previousSavedAt,dirty});
    if(oldId!==s.id){states.delete(oldId);loads.delete(oldId);states.set(s.id,s);loads.set(s.id,Promise.resolve(s));await storage('delete',oldId).catch(()=>{});}
    return {changed:dirty,...read(s.id)};
  }
  async function rollbackCommit(committedId) {
    committedId=String(committedId);
    const snapshot=commitSnapshots.get(committedId);
    if(!snapshot)return {restoredId:committedId,rolledBack:false,...read(committedId)};
    const s=snapshot.state;
    s.id=snapshot.oldId;s.savedPhotos=clone(snapshot.savedPhotos);s.savedAt=snapshot.savedAt;s.dirty=snapshot.dirty;s.error='';
    states.delete(committedId);loads.delete(committedId);states.set(s.id,s);loads.set(s.id,Promise.resolve(s));
    if(!await persist(s)){const error=new Error(s.error);error.restoredId=s.id;throw error;}
    if(committedId!==s.id){
      try{await storage('delete',committedId);}
      catch(_){s.error=tr(s,'คืนร่างรูปแล้ว แต่ล้างสำเนาชั่วคราวไม่สำเร็จ','Photo draft restored, but temporary copy cleanup failed.');const error=new Error(s.error);error.restoredId=s.id;throw error;}
    }
    commitSnapshots.delete(committedId);
    return {restoredId:s.id,rolledBack:true,...read(s.id)};
  }
  function finalizeCommit(id){commitSnapshots.delete(String(id));}
  global.YolkBranchPhotos={version:VERSION,MAX_PHOTOS:MAX,create,render,bind,read,reset,commit,rollbackCommit,finalizeCommit,validateFile:validate};
})(window);
