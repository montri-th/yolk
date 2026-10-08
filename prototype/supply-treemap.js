/* Source-brand inventory, reused by the work panel and boundary hover. No POI aggregation. */
(function (global) {
 'use strict';
 const validCount=n=>Number.isSafeInteger(n)&&n>=0;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const renderContexts=new Map();
 const cues=['●','■','▲','◆','×','★','⬡','○','—','+'];
 /* Logo review binds exact registered originals to existing LDS soft categories.
    Hue collisions are intentional; names, native logos, counts and governed cues remain. */
 const brandSeries=Object.freeze(Object.fromEntries([
 [
  "cosmo",
  {
   "seriesIndex": 2,
   "basis": "Stable ID fallback: exact COSMO identity remains unresolved; no borrowed logo colour.",
   "assetSha256": null
  }
 ],
 [
  "pure",
  {
   "seriesIndex": 7,
   "basis": "Stable ID fallback: historical PURE versus current Purethai identity needs reconciliation.",
   "assetSha256": null
  }
 ],
 [
  "siam-gas",
  {
   "seriesIndex": 7,
   "basis": "Blue circular identity is primary; red flame is secondary.",
   "assetSha256": "7e78a21eb9979a5e44b2cd83fcae2e32ce8ce79a6b5e96f38c1412e9392eb82e"
  }
 ],
 [
  "susco",
  {
   "seriesIndex": 0,
   "basis": "Red outer identity ring is primary; blue droplet is secondary.",
   "assetSha256": "c04da81207298b938b0ca6815def2cecde8dd232ee17fd84f28bb8b6aa90531c"
  }
 ],
 [
  "unique-gas",
  {
   "seriesIndex": 5,
   "basis": "Cyan outer flame is primary; deep-blue U remains visible in the original logo.",
   "assetSha256": "bece24c9f162440f8bb936684c9a2a9f14fbb9a3939eb9c22819dc92ca20eb70"
  }
 ],
 [
  "world-gas",
  {
   "seriesIndex": 7,
   "basis": "Blue outer identity lettering/ring; green is a secondary ring colour.",
   "assetSha256": "3f2d14b03c56bd74fd5f64ec10c35eb909f79602b02c5adf2d2180204bac5762"
  }
 ],
 [
  "grocery-brand:TOOGDEE",
  {
   "seriesIndex": 0,
   "basis": "Red round badge.",
   "assetSha256": "c8bbae16fde7b6e88fbb72926f72ae436d0b10622e0e2d6b2f10f5901fab725c"
  }
 ],
 [
  "grocery-brand:CJ_MORE",
  {
   "seriesIndex": 2,
   "basis": "Yellow native badge field; green MORE strip and red/blue letters are secondary.",
   "assetSha256": "5721f8ed58c750b9704bb6c3f301ec40830db1c7f5f454e0fc81c65259431ff7"
  }
 ],
 [
  "grocery-brand:LAWSON108",
  {
   "seriesIndex": 7,
   "basis": "Blue shield and 108 wordmark in the owner-supplied original.",
   "assetSha256": "0bcdc9944f0543ae6a04627892080615d510b1db46347b140e4c7890347a587b"
  }
 ],
 [
  "grocery-brand:VILLA_MARKET",
  {
   "seriesIndex": 7,
   "basis": "Deep-blue wordmark and VL identity in the owner-supplied original; red is secondary.",
   "assetSha256": "c29c85f0b251ddf12f57a59d283cab05a055ddeb35ccfa61b77458d0aa4eac8a"
  }
 ],
 [
  "grocery-brand:MAXVALU",
  {
   "seriesIndex": 0,
   "basis": "Rose-red native MaxValu badge field.",
   "assetSha256": "ad52ebb00a7f96482b44fdbe95fc6f264c0e33ad5fe6a863287b1d1314c1f1a7"
  }
 ],
 [
  "grocery-brand:FOODLAND",
  {
   "seriesIndex": 0,
   "basis": "Red Foodland wordmark; deep-blue supporting text is secondary.",
   "assetSha256": "60845cb0703e30f61a3e1a6d4fa72a568725760b86c21c7d6598c730bca35205"
  }
 ],
 [
  "grocery-brand:GOURMET_MARKET",
  {
   "seriesIndex": 0,
   "basis": "Burgundy-red circular badge; gold lettering is secondary.",
   "assetSha256": "42e85df78c3d4082cbd2f040bcd538d69554f323b29cbac75de56b721172d497"
  }
 ],
 [
  "grocery-brand:GO_WHOLESALE",
  {
   "seriesIndex": 0,
   "basis": "Red native square badge field.",
   "assetSha256": "1a9228b14421ea61265054cacd212bda88c38e78106f325a5b45df1c54cb07fb"
  }
 ],
 [
  "grocery-brand:DONKI",
  {
   "seriesIndex": 7,
   "basis": "Blue native Donpen badge field; yellow bill is secondary.",
   "assetSha256": "7cbee15a7bff4c1ce08b72b18e7c40685a9104c66291292495f8544fab6dcd9c"
  }
 ],
 [
  "grocery-brand:RIMPING",
  {
   "seriesIndex": 8,
   "basis": "Monochrome original: neutral approved category, no inferred brand hue.",
   "assetSha256": "fd9b37c27b8ba2fb8ccac75f057b0e7350bf4193077749762f5312c06f4e7695"
  }
 ],
 [
  "grocery-brand:FUJI",
  {
   "seriesIndex": 0,
   "basis": "Red native Fuji Super badge field.",
   "assetSha256": "8de7171d3351e9174f1c74f25b8376e1b418128172af3e62b6112051e7c7b026"
  }
 ],
 [
  "bangchak",
  {
   "seriesIndex": 9,
   "basis": "Green leaf identity; orange upper segment is secondary.",
   "assetSha256": "554c2f65ef51964e84b6cabc37827855b25cb6b99f9c05adf552bbfc3eb17d94"
  }
 ],
 [
  "ptt",
  {
   "seriesIndex": 5,
   "basis": "Cyan outer flame is primary; deep-blue and red inner flame remain original.",
   "assetSha256": "1ba7c6ebfaf3fc774c0fb327c3ca1409b78d7bfe3a4310df02abef8c38c9a741"
  }
 ],
 [
  "shell",
  {
   "seriesIndex": 2,
   "basis": "Yellow pecten shell interior; red outline is secondary.",
   "assetSha256": "55bbd2451ebd8327271311ef92e65c766854602ced336d7d9677acc84607a8e7"
  }
 ],
 [
  "caltex",
  {
   "seriesIndex": 0,
   "basis": "Red star badge is primary; deep teal is secondary.",
   "assetSha256": "b85bc225fc93e10182211c9f04da5bf43a8a795dfcb6ba91066f93cbfbda95ef"
  }
 ],
 [
  "grocery-brand:SEVEN_ELEVEN",
  {
   "seriesIndex": 0,
   "basis": "Red 7 is the principal identifying numeral; orange and green remain original.",
   "assetSha256": "704286f27b063dcd83f934a20211615b4f63f5072d31e58edee18ec28e48bfda"
  }
 ],
 [
  "grocery-brand:TOPS",
  {
   "seriesIndex": 1,
   "basis": "Orange-red owner-supplied Tops wordmark, nearest warm orange lane.",
   "assetSha256": "dccbc2bbd05952420a2e782ef1dc2ae7ce6c5d8fffb70eb2772055df7e213458"
  }
 ],
 [
  "grocery-brand:LOTUSS",
  {
   "seriesIndex": 6,
   "basis": "Teal native badge field; yellow pointer is secondary.",
   "assetSha256": "a0dab79cec31c6636d3b64e204c6895fe2c720eca6f0f35a6feaa8220785687c"
  }
 ],
 [
  "grocery-brand:MAKRO",
  {
   "seriesIndex": 0,
   "basis": "Red Makro m identity.",
   "assetSha256": "cd7598334e124e7c5d0d63095628ef68065ef51e0560f04fc5a154f2b79543e0"
  }
 ],
 [
  "legal:0107557000195",
  {
   "seriesIndex": 5,
   "basis": "Cyan Muangthai Capital round badge.",
   "assetSha256": "dcb1fafe99bf30a65bfee6d0149e0df6a51d002c7091c83a5229742b43db3c13"
  }
 ],
 [
  "legal:0105559126747",
  {
   "seriesIndex": 2,
   "basis": "Gold central Srisawad badge; blue outer edges are secondary.",
   "assetSha256": "fc0168d628bad7638254199ad70be9677a04b61b6e692bada15f07f431e3b3aa"
  }
 ],
 [
  "legal:0105564161598",
  {
   "seriesIndex": 2,
   "basis": "Yellow primary Ngern Chaiyo/AutoX wordmark; blue is secondary.",
   "assetSha256": "88b0c4c1bff765346ca19728cc84f65f396ed9835e5bd05eb4d0529d2badda82"
  }
 ],
 [
  "legal:0107563000355",
  {
   "seriesIndex": 0,
   "basis": "Red Ngern Tid Lor identity; blue segment is secondary.",
   "assetSha256": "bc61d8b17ce2abfddeb4b90e90e566fbddf10b83f2d6e58c9000bdf4c5582423"
  }
 ],
 [
  "legal:0107559000290",
  {
   "seriesIndex": 7,
   "basis": "Deep-blue Saksiam round identity.",
   "assetSha256": "9f7f0b1d6483c33a130173658eb5af199dae381bcffba380f1fdc6dd6203dfac"
  }
 ],
 [
  "legal:0107566000542",
  {
   "seriesIndex": 0,
   "basis": "Warm pink Ngern Turbo wordmark; deep-blue first line is secondary.",
   "assetSha256": "0cd582a66c0dc9ce403fa102bebc4c5d3ad90937141f5428d99d4e549b79ba3b"
  }
 ],
 [
  "legal:0107564000120",
  {
   "seriesIndex": 9,
   "basis": "Deep-green Heng Leasing wordmark and identity.",
   "assetSha256": "f0d2343cb89399b4ca68293a147bdaed2a92bf2de73712cc800a3c228c616a2f"
  }
 ],
 [
  "legal:0505560008015",
  {
   "seriesIndex": 0,
   "basis": "Red Nim Leasing tiger identity.",
   "assetSha256": "b3b0106d7ead5de652235517c21a3a2ef8e81e843195f73166682f30f9436502"
  }
 ],
 [
  "pt",
  {
   "seriesIndex": 3,
   "basis": "Lime-green outer PT identity ring; red lettering and deeper green are secondary.",
   "assetSha256": "b2c25e8e53186da95c400f7c7a2019c71a85b72a874036251cea819525970757"
  }
 ],
 [
  "grocery-brand:BIG_C",
  {
   "seriesIndex": 3,
   "basis": "Lime-green native badge field; red C is secondary.",
   "assetSha256": "f76f25886c649dfa3b87fd4b26ab8495dc417acaccf7e164f33b3a605e21208c"
  }
 ],
 [
  "legal:0107538000690",
  {
   "seriesIndex": 8,
   "basis": "Exact Krungsri Auto original is monochrome: neutral approved category, no inferred group-brand yellow.",
   "assetSha256": "8d4e21f521c2fd5b12213a1670c4d9f203cb980aa59b86a5d6cc664e232f738e"
  }
 ],
 [
  "legal:0105528033194",
  {
   "seriesIndex": 0,
   "basis": "Red official UOB five-bar symbol.",
   "assetSha256": "fc77b3048c4ec868be11f0a37e9ff201102c3556cb3610c16b749792b80c44f7"
  }
 ]
].map(([id,binding])=>[id,Object.freeze(binding)])));
 const lang=options=>options?.lang==='en'?'en':options?.lang==='th'?'th':global.document?.documentElement?.lang==='en'?'en':'th';
 const text=(locale,th,en)=>locale==='en'?en:th;
 const number=(value,locale,digits=0)=>new Intl.NumberFormat(locale==='en'?'en-US':'th-TH',{maximumFractionDigits:digits}).format(value);
 function seriesIndex(id){
  if(Object.hasOwn(brandSeries,id))return brandSeries[id].seriesIndex;
  let hash=2166136261;for(const c of String(id)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0)%10;
 }
 function normalize(summary){
  const input=summary||{},sourceRows=Array.isArray(input.rows)?input.rows:Array.isArray(input.brands)?input.brands:[],rows=[],seen=new Set();let invalid=false;
  for(const r of sourceRows){const id=String(r.brandId??'');if(!id||seen.has(id)||!validCount(r.count)||!['own','competitor'].includes(r.party)){invalid=true;continue;}seen.add(id);rows.push({brandId:id,name:String(r.name??r.brandName??id),count:r.count,party:r.party,seriesIndex:seriesIndex(id)});}
  const own=input.own??input.ownCount,competitor=input.competitor??input.competitorCount,total=input.identifiedTotal,observedTotal=rows.reduce((sum,r)=>sum+r.count,0),observedOwn=rows.filter(r=>r.party==='own').reduce((sum,r)=>sum+r.count,0),observedCompetitor=rows.filter(r=>r.party==='competitor').reduce((sum,r)=>sum+r.count,0);
  const state=['known','review','missing','suppressed','zero_total','not_applicable','loading'].includes(input.state)?input.state:'missing';
  const exact=state==='known'&&!invalid&&input.coverage?.complete!==false&&validCount(own)&&validCount(competitor)&&validCount(total)&&total===own+competitor&&observedTotal===total&&observedOwn===own&&observedCompetitor===competitor;
  const zero=(state==='known'||state==='zero_total')&&!invalid&&validCount(total)&&total===0&&observedTotal===0;
  return {...input,rows,own:validCount(own)?own:null,competitor:validCount(competitor)?competitor:null,identifiedTotal:validCount(total)?total:null,unknown:validCount(input.unknown??input.unknownCount)?(input.unknown??input.unknownCount):null,unclassified:validCount(input.unclassified)?input.unclassified:null,observedTotal,exact,state:zero?'zero_total':state==='known'&&!exact?'review':state,sharePercent:exact&&total>0?own/total*100:null};
 }
 /* Balanced binary treemap: each rectangle's area is exactly its source-count fraction. */
 function layout(source,width=100,height=70){
  const rows=source.filter(r=>validCount(r.count)&&r.count>0).map(r=>({...r})).sort((a,b)=>b.count-a.count||a.brandId.localeCompare(b.brandId)),out=[];
  function partition(items,x,y,w,h){
   if(items.length===1){out.push({...items[0],x,y,width:w,height:h});return;}
   const total=items.reduce((sum,r)=>sum+r.count,0);let sum=0,split=1,best=Infinity;
   for(let i=1;i<items.length;i++){sum+=items[i-1].count;const delta=Math.abs(total/2-sum);if(delta<best){best=delta;split=i;}}
   const left=items.slice(0,split),right=items.slice(split),ratio=left.reduce((sum,r)=>sum+r.count,0)/total;
   if(w>=h){partition(left,x,y,w*ratio,h);partition(right,x+w*ratio,y,w*(1-ratio),h);}else{partition(left,x,y,w,h*ratio);partition(right,x,y+h*ratio,w,h*(1-ratio));}
  }
  if(rows.length&&width>0&&height>0)partition(rows,0,0,width,height);return out;
 }
 function chartRows(rows,max=10){
  const positive=rows.filter(r=>r.count>0).sort((a,b)=>b.count-a.count||a.brandId.localeCompare(b.brandId));
  if(positive.length<=max)return positive;
  const own=positive.filter(r=>r.party==='own'),competitors=positive.filter(r=>r.party!=='own'),keep=own.concat(competitors.slice(0,Math.max(0,max-1-own.length))),kept=new Set(keep.map(r=>r.brandId)),members=positive.filter(r=>!kept.has(r.brandId));
  if(!members.length)return keep;
  return keep.concat({brandId:'yolk:other-identified',name:'',count:members.reduce((sum,r)=>sum+r.count,0),party:'competitor',seriesIndex:8,members});
 }
 function logo(id){
  const entry=(global.YOLK_RUNTIME?.brandLogos?.entries||[]).find(r=>r.brandId===id&&r.verifiedSquareGraphic===true);
  if(!entry||!/^assets\/brands\/[a-zA-Z0-9_.-]+$/.test(entry.localPath||''))return '';
  const support=entry.themeSupport||'both',variant=theme=>entry.variants?.[theme]||(support==='both'||support===theme+'Only'?entry:null);
  return ['light','dark'].map(theme=>{const asset=variant(theme);return asset&&/^assets\/brands\/[a-zA-Z0-9_.-]+$/.test(asset.localPath||'')?`<img class="supply-treemap-logo supply-treemap-logo-${theme}" src="${esc(asset.localPath)}?v=${esc((asset.sha256||'').slice(0,12))}" alt="" loading="lazy" decoding="async">`:'';}).join('');
 }
 function stateLabel(state,locale){return text(locale,...({loading:['กำลังอ่านยอดสาขา','Loading source counts'],missing:['ยอดสาขายังไม่พร้อม','Source counts unavailable'],suppressed:['งดแสดงยอดสาขา','Counts withheld'],not_applicable:['ข้อมูลไม่ครอบคลุมรูปแบบนี้','Outside this business scope'],zero_total:['ไม่พบสาขาที่ทราบแบรนด์ในยอดต้นทาง','No identified branches in the source'],review:['ยอดที่ทราบจากต้นทาง · ยังมีข้อมูลรอตรวจ','Observed source counts · some evidence needs review']}[state]||['ยอดต้นทางที่ทราบแบรนด์','Identified source branch counts']));}
 function render(summary,options={}){
  const s=normalize(summary),locale=lang(options),compact=!!options.compact,id=String(options.id||'supply-brand-breakdown').replace(/[^a-zA-Z0-9_-]/g,'-'),title=text(locale,'สาขาในพื้นที่นี้','Branches in this area'),basis=text(locale,'ส่วนแบ่งสาขาที่ทราบแบรนด์','Identified branch share'),scope=String(s.geographyLabel??s.scope?.label??s.scope?.name??''),status=stateLabel(s.state,locale),unavailable=['loading','missing','suppressed','not_applicable'].includes(s.state);
  const header=compact?'':`<header class="supply-treemap-header"><h3 id="${id}-title" tabindex="-1">${esc(title)}</h3>${scope?`<p>${esc(scope)}</p>`:''}</header>`;
  if(unavailable)return `<section class="supply-treemap-section ${compact?'is-compact':''}" data-treemap-id="${id}" data-supply-breakdown-state="${esc(s.state)}" ${compact?`aria-label="${esc(title)}"`:`aria-labelledby="${id}-title"`}>${header}<p class="supply-treemap-state" role="status">${esc(status)}</p></section>`;
  const sorted=s.rows.slice().sort((a,b)=>b.count-a.count||a.brandId.localeCompare(b.brandId)),plotted=chartRows(sorted,compact?5:10).map(r=>r.members?{...r,name:text(locale,'คู่แข่งอื่นที่ทราบแบรนด์','Other identified competitors')}:r),cells=layout(plotted),totalLabel=compact?text(locale,'รวมสาขา','Total branches'):text(locale,'รวมที่ทราบแบรนด์','Identified total'),summaryHTML=`<div class="supply-treemap-totals"><div><span>${esc(totalLabel)}</span><strong>${s.identifiedTotal===null?'—':number(s.identifiedTotal,locale)}</strong>${!compact?`<small>${text(locale,'สาขา','branches')}</small>`:''}</div><div><span>${compact?text(locale,'สาขาเรา (%)','Our share (%)'):text(locale,'ส่วนแบ่งสาขาเรา','Our branch share')}</span><strong>${s.sharePercent===null?'—':number(s.sharePercent,locale,1)+'%'}</strong>${!compact?`<small>${s.state==='zero_total'?text(locale,'ฐานรวมเป็นศูนย์','Total is zero'):s.exact?text(locale,'เรา ÷ (เรา + คู่แข่ง)','Own ÷ (own + competitors)'):text(locale,'รอตรวจฐานเปรียบเทียบ','Comparison basis needs review')}</small>`:''}</div></div>`;
  const tree=cells.length?`<div class="supply-treemap-chart" aria-hidden="true">${cells.map(cell=>{const slot=String(cell.seriesIndex+1).padStart(2,'0'),tiny=cell.width<12||cell.height<12,narrow=compact||cell.width<28||cell.height<25,hasLogo=!tiny&&!narrow&&cell.width>=30&&cell.height>=32,own=cell.party==='own',share=s.exact&&s.identifiedTotal>0?number(cell.count/s.identifiedTotal*100,locale,1)+'%':'';return `<div class="supply-treemap-cell ${tiny?'is-tiny':''} ${narrow?'is-narrow':''} ${own?'is-own':''}" data-brand-id="${esc(cell.brandId)}" data-series="${slot}" style="left:${cell.x}%;top:${cell.y/70*100}%;width:${cell.width}%;height:${cell.height/70*100}%" title="${esc(cell.name)}${cell.members?' · '+esc(cell.members.slice(0,5).map(r=>r.name+': '+number(r.count,locale)).join(', '))+(cell.members.length>5?'…':''):''} · ${number(cell.count,locale)} ${text(locale,'สาขา','branches')}${share?' · '+share:''}">${hasLogo?logo(cell.brandId):''}<span class="supply-treemap-cell-name">${own?'<b class="supply-treemap-own-cue">'+text(locale,'เรา','Own')+'</b> ':''}${esc(cell.name)}</span><span class="supply-treemap-cell-count">${number(cell.count,locale)}${!narrow&&share?' · '+share:''}</span></div>`;}).join('')}</div>`:`<p class="supply-treemap-state">${esc(status)}</p>`;
  const limit=Math.max(40,Math.floor(Number(options.limit)||40)),ordered=sorted.filter(r=>r.party==='own').concat(sorted.filter(r=>r.party!=='own')),visibleRows=compact?plotted:ordered.slice(0,limit);
  if(!compact){renderContexts.set(id,{summary,options:{...options,limit}});if(renderContexts.size>6)renderContexts.delete(renderContexts.keys().next().value);}
  const grouped=plotted.find(r=>r.members),groupNote=grouped&&!compact?`<p class="supply-treemap-basis">${text(locale,'กลุ่มคู่แข่งอื่นรวม ', 'Other identified competitors groups ')}${number(grouped.members.length,locale)} ${text(locale,'แบรนด์ · ดูยอดแต่ละแบรนด์ด้านล่าง','brands · individual counts listed below')}</p>`:'';
  const list=`<div class="supply-treemap-list" role="list" aria-label="${esc(text(locale,'ยอดสาขารายแบรนด์','Branch counts by brand'))}">${visibleRows.map(row=>{const slot=String(row.seriesIndex+1).padStart(2,'0'),own=row.party==='own',share=s.exact&&s.identifiedTotal>0?number(row.count/s.identifiedTotal*100,locale,1)+'%':'';return `<div class="supply-treemap-row ${own?'is-own':''}" role="listitem" data-brand-id="${esc(row.brandId)}"><span class="supply-treemap-series" data-series="${slot}" aria-hidden="true"><span class="supply-treemap-cue">${cues[row.seriesIndex]}</span></span><span class="supply-treemap-brand" title="${esc(row.name)}">${esc(row.name)}${own?` <b class="supply-treemap-own-caption">${compact?text(locale,'เรา','Own'):text(locale,'สาขาเรา','Our stores')}</b>`:''}</span><span class="supply-treemap-row-count">${number(row.count,locale)}${compact?(share?' · '+share:''):` <small>${text(locale,'สาขา','branches')}</small>${share?`<span>${share}</span>`:''}`}</span></div>`;}).join('')}</div>`;
  const more=!compact&&ordered.length>limit?`<button type="button" class="btn secondary supply-treemap-more" data-supply-treemap-more="${id}">${text(locale,'แสดงอีก ', 'Show ')}${number(Math.min(40,ordered.length-limit),locale)} ${text(locale,'แบรนด์','more brands')} · ${number(limit,locale)}/${number(ordered.length,locale)}</button>`:'';
  const extras=[s.unknown===null?text(locale,'ยอดไม่ทราบแบรนด์ยังไม่พร้อม','Unknown-brand count unavailable'):s.unknown>0?text(locale,'ไม่ทราบแบรนด์ ', 'Unknown brand ')+number(s.unknown,locale)+text(locale,' สาขา · ไม่รวมในฐาน',' branches · excluded from denominator'):'',s.unclassified===null?'':s.unclassified>0?text(locale,'ขอบเขตบริการรอตรวจ ', 'Business-scope membership unresolved ')+number(s.unclassified,locale)+text(locale,' รายการ',' records'):''].filter(Boolean);
  return `<section class="supply-treemap-section ${compact?'is-compact':''}" data-treemap-id="${id}" data-supply-breakdown-state="${esc(s.state)}" ${compact?`aria-label="${esc(title)}"`:`aria-labelledby="${id}-title"`}>${header}${summaryHTML}${tree}${!compact||!s.exact?`<p class="supply-treemap-basis">${esc(compact?text(locale,'ยอดที่ทราบ · ฐานรอตรวจ','Observed counts · basis under review'):s.exact?basis:status)}</p>`:''}${groupNote}${list}${more}${extras.length?`<p class="supply-treemap-coverage">${compact?[s.unknown===null?text(locale,'ยอดไม่ทราบแบรนด์: —','Unknown-brand count: —'):s.unknown>0?number(s.unknown,locale)+text(locale,' สาขาไม่ทราบแบรนด์ · ไม่รวม',' unknown-brand branches · excluded'):'',s.unclassified>0?number(s.unclassified,locale)+text(locale,' รายการรอตรวจบริการ',' scope-unresolved records'):''].filter(Boolean).map(esc).join('<br>'):extras.map(esc).join('<br>')}</p>`:''}<p class="supply-treemap-foot">${compact?text(locale,'CityMETER · ส่วนแบ่งสาขา ไม่ใช่ยอดขาย','CityMETER · branch share, not sales share'):text(locale,'จำนวนสาขาจาก CityMETER ตามรูปแบบที่เลือก ไม่ใช่ส่วนแบ่งยอดขาย','CityMETER branch counts for the selected format; not sales market share.')}</p></section>`;
 }
 global.document?.addEventListener?.('click',event=>{const button=event.target.closest?.('[data-supply-treemap-more]'),id=button?.dataset?.supplyTreemapMore,context=renderContexts.get(id);if(!context)return;const host=button.closest('.supply-treemap-section');if(!host)return;host.outerHTML=render(context.summary,{...context.options,limit:context.options.limit+40});const focus=global.document.querySelector?.('[data-supply-treemap-more="'+id+'"]')||global.document.querySelector?.('#'+id+'-title');focus?.focus?.();});
 global.YolkSupplyTreemap=Object.freeze({render,normalize,layout,chartRows,seriesIndex,brandSeries});
})(window);
