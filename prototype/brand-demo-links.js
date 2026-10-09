/* Stable prospect demo links select a personal display context; saved work wins. */
(function(root){
 'use strict';
 const catalog=root.YOLK_BRAND_DEMO_CATALOG||{brands:[],supportedRoutes:['market','demand','supply','criteria','targets','feed'],publicBase:'https://montri-th.github.io/yolk/'},entries=new Map(catalog.brands.map(b=>[b.slug,b])),identities=new Map(catalog.brands.map(b=>[b.brandId,b]));
 let startup=null,status=null,copyTicket=0;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=(th,en)=>typeof tr==='function'?tr(th,en):th;
 function record(id){return entries.get(id)||identities.get(id)||null;}
 function resolve(input){
  let url;try{url=new URL(String(input),catalog.publicBase)}catch{return {requested:true,valid:false,reason:'malformed_url'}};
  const params=url.searchParams;if(!params.has('brand'))return {requested:false,valid:false};
  const invalid=reason=>({requested:true,valid:false,reason,route:'market'});
  if(params.getAll('brand').length!==1||['lang','industry','scope'].some(key=>params.getAll(key).length>1))return invalid('duplicate_parameter');
  const raw=url.search.replace(/^\?/,'').split('&').find(pair=>pair.split('=')[0]==='brand');
  try{if(raw)decodeURIComponent(raw.slice(raw.indexOf('=')+1).replace(/\+/g,' '))}catch{return invalid('malformed_encoding')};
  const brand=record(params.get('brand'));if(!brand)return invalid('unknown_brand');
  if(params.has('industry')&&params.get('industry')!==brand.industryId)return invalid('industry_mismatch');
  if(params.has('scope')&&params.get('scope')!==brand.defaultScope)return invalid('scope_mismatch');
  const lang=params.get('lang');if(lang!==null&&!['th','en'].includes(lang))return invalid('unsupported_language');
  const requestedRoute=url.hash.slice(1)||'market',route=catalog.supportedRoutes.includes(requestedRoute)?requestedRoute:'market';
  return {requested:true,valid:true,brand,route,lang,routeFallback:requestedRoute!==route};
 }
 function initial(input){startup=resolve(input);status=startup.requested?{...startup,savedWorkRetained:false}:null;return startup;}
 function selectedIndustry(fallback){return startup?.valid?startup.brand.industryId:fallback;}
 function initializeContext(state,runtime,saved){
  if(!startup?.requested)return false;
  if(!startup.valid){if(root.location)root.history?.replaceState?.(root.history.state,'',root.location.pathname+root.location.search+'#market');return false;}
  const b=startup.brand,source=runtime.supplyCache.get(b.industryId),profile=runtime.brandPresets?.brands.find(row=>row.brandId===b.brandId&&row.industryId===b.industryId);
  if(!source?.brands.some(row=>row.id===b.brandId)||profile?.defaultScope!==b.defaultScope){status={requested:true,valid:false,reason:'source_unavailable'};const loadedIndustry=runtime.supplyCache.has(state.industry)?state.industry:[...runtime.supplyCache.keys()][0],fallback=runtime.profiles.find(p=>p.industry_id===loadedIndustry);if(fallback){const available=runtime.supplyCache.get(loadedIndustry)?.brands||[],fallbackId=available.some(row=>row.id===fallback.defaultOwnBrandId)?fallback.defaultOwnBrandId:available.find(row=>identities.get(row.id)?.industryId===loadedIndustry)?.id;if(fallbackId){state.industry=loadedIndustry;state.ownBrandId=fallbackId;state.supplyScope=runtime.brandPresets.brands.find(row=>row.brandId===fallbackId)?.defaultScope||fallback.defaultScope;}}if(root.location)root.history?.replaceState?.(root.history.state,'',root.location.pathname+root.location.search+'#market');return false;}
  const targetKey=['expansion-demo',b.industryId,b.brandId,b.defaultScope,runtime.profiles.find(p=>p.industry_id===b.industryId)?.version].join('|');
  const context=saved?.contexts?.[targetKey];
  const legacyMatches=!!saved?.criteria&&saved.industry===b.industryId&&saved.ownBrandId===b.brandId&&saved.supplyScope===b.defaultScope;
  status={...startup,savedWorkRetained:!!context?.criteria||legacyMatches,targetKey};
  state.industry=b.industryId;state.ownBrandId=b.brandId;state.supplyScope=b.defaultScope;if(startup.lang)state.lang=startup.lang;
  const route='#'+startup.route;if(root.location&&root.location.hash!==route)root.history?.replaceState?.(root.history.state,'',root.location.pathname+root.location.search+route);
  return true;
 }
 function urlFor(id,{route='market',lang=null}={}){const b=record(id);if(!b)return null;const url=new URL(catalog.publicBase);url.searchParams.set('brand',b.slug);if(['th','en'].includes(lang))url.searchParams.set('lang',lang);url.hash=catalog.supportedRoutes.includes(route)?route:'market';return url.href;}
 function notice(){
  if(!status?.requested)return '';
  if(!status.valid)return `<p class="brand-demo-notice" role="status">${esc(text('แบรนด์ในลิงก์นี้ไม่พร้อมใช้งาน เปิดบริบทที่พร้อมใช้งานให้แทน','This brand link is unavailable. An available validated context is shown instead.'))} <a href="brands.html">${esc(text('ดู Demo ทุกแบรนด์','See every brand demo'))}</a></p>`;
  if(typeof Y==='undefined'||Y.ownBrandId!==status.brand.brandId||Y.industry!==status.brand.industryId||Y.supplyScope!==status.brand.defaultScope)return '';
  const message=status.savedWorkRetained?text('เปิด Demo แบรนด์นี้แล้ว · ใช้เกณฑ์และร่างที่คุณเคยบันทึกไว้','Brand demo opened · Your saved criteria and draft are retained'):text('Demo จากเกณฑ์ตั้งต้นของแบรนด์ · ตัวเลขเป็นสมมติฐานที่ปรับได้','Demo starts from this brand preset · Numbers are adjustable hypotheses');
  return `<p class="brand-demo-notice" role="status">${esc(message)}${status.savedWorkRetained?` <button type="button" class="quiet-link" data-brand-action="try-preset" ${typeof canEdit==='function'&&!canEdit()?'disabled':''}>${esc(text('ลองเกณฑ์ตั้งต้น','Try starter preset'))}</button>`:''}${status.routeFallback?' · '+esc(text('เปิดหน้าโอกาสขยายแทนหน้าที่ไม่รองรับ','Opened Opportunities because the requested page is unsupported')):''}</p>`;
 }
 function controls(id){const b=record(id);if(!b)return '';return `<div class="brand-demo-actions"><button type="button" class="quiet-link" data-brand-demo-copy="${esc(b.brandId)}">${root.YolkIcons?.icon?.('link')||''}<span>${esc(text('คัดลอก Demo แบรนด์นี้','Copy this brand demo'))}</span></button><a href="brands.html">${esc(text('ทุกแบรนด์','All brands'))}</a></div>`;}
 function showCopyFallback(url){
  let dialog=root.document.getElementById('brand-link-dialog');if(!dialog){dialog=root.document.createElement('dialog');dialog.id='brand-link-dialog';dialog.className='brand-link-dialog';root.document.body.append(dialog);}
  dialog.innerHTML=`<form method="dialog"><h2>${esc(text('ลิงก์ Demo แบรนด์','Brand demo link'))}</h2><label for="brand-link-value">${esc(text('เลือกและคัดลอกลิงก์นี้','Select and copy this link'))}</label><input id="brand-link-value" readonly value="${esc(url)}"><button class="btn secondary">${esc(text('ปิด','Close'))}</button></form>`;dialog.showModal();const input=dialog.querySelector('input');input.focus();input.select();
 }
 async function copy(id,{button=null,catalogPage=false}={}){
  const lang=typeof Y!=='undefined'?Y.lang:root.document?.documentElement?.lang,url=urlFor(id,{lang}),ticket=++copyTicket,context=catalogPage?null:typeof criteriaContextKey==='function'?criteriaContextKey():null;
  if(!url)return false;
  const current=()=>ticket===copyTicket&&(catalogPage||context===(typeof criteriaContextKey==='function'?criteriaContextKey():null));
  try{if(!root.navigator?.clipboard?.writeText)throw Error('clipboard unavailable');await root.navigator.clipboard.writeText(url);if(current()){if(typeof notify==='function')notify(text('คัดลอกลิงก์ Demo แล้ว · ผู้รับเปิดด้วยแบรนด์นี้','Demo link copied · Recipients start with this brand'));else if(root.document?.getElementById('brand-catalog-status'))root.document.getElementById('brand-catalog-status').textContent=(lang==='en'?'Link copied':'คัดลอกลิงก์แล้ว');}return true;}
  catch{if(current())showCopyFallback(url);return false;}
 }
 root.document?.addEventListener?.('click',event=>{const button=event.target.closest?.('[data-brand-demo-copy]');if(!button||button.disabled)return;event.preventDefault();copy(button.dataset.brandDemoCopy,{button,catalogPage:button.hasAttribute('data-brand-catalog-copy')});});
 root.YolkBrandLinks=Object.freeze({catalog,record,resolve,initial,selectedIndustry,initializeContext,urlFor,notice,controls,copy,status:()=>status});
})(window);
