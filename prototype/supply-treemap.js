/* Source-brand inventory, reused by the work panel and boundary hover. No POI aggregation. */
(function (global) {
 'use strict';
 const validCount=n=>Number.isSafeInteger(n)&&n>=0;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const renderContexts=new Map();
 const cues=['●','■','▲','◆','×','★','⬡','○','—','+'];
 const lang=options=>options?.lang==='en'?'en':options?.lang==='th'?'th':global.document?.documentElement?.lang==='en'?'en':'th';
 const text=(locale,th,en)=>locale==='en'?en:th;
 const number=(value,locale,digits=0)=>new Intl.NumberFormat(locale==='en'?'en-US':'th-TH',{maximumFractionDigits:digits}).format(value);
 function seriesIndex(id,provided){
  if(Number.isInteger(provided)&&provided>=0&&provided<10)return provided;
  let hash=2166136261;for(const c of String(id)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0)%10;
 }
 function normalize(summary){
  const input=summary||{},sourceRows=Array.isArray(input.rows)?input.rows:Array.isArray(input.brands)?input.brands:[],rows=[],seen=new Set();let invalid=false;
  for(const r of sourceRows){const id=String(r.brandId??'');if(!id||seen.has(id)||!validCount(r.count)||!['own','competitor'].includes(r.party)){invalid=true;continue;}seen.add(id);rows.push({brandId:id,name:String(r.name??r.brandName??id),count:r.count,party:r.party,seriesIndex:seriesIndex(id,r.seriesIndex)});}
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
  return keep.concat({brandId:'yolk:other-identified',name:'',count:members.reduce((sum,r)=>sum+r.count,0),party:'competitor',seriesIndex:9,members});
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
  const tree=cells.length?`<div class="supply-treemap-chart" aria-hidden="true">${cells.map(cell=>{const slot=String(cell.seriesIndex+1).padStart(2,'0'),tiny=cell.width<12||cell.height<12,narrow=compact||cell.width<28||cell.height<25,hasLogo=!tiny&&!narrow&&cell.width>=30&&cell.height>=32,own=cell.party==='own',share=s.exact&&s.identifiedTotal>0?number(cell.count/s.identifiedTotal*100,locale,1)+'%':'';return `<div class="supply-treemap-cell ${tiny?'is-tiny':''} ${narrow?'is-narrow':''} ${own?'is-own':''}" data-series="${slot}" style="left:${cell.x}%;top:${cell.y/70*100}%;width:${cell.width}%;height:${cell.height/70*100}%" title="${esc(cell.name)}${cell.members?' · '+esc(cell.members.slice(0,5).map(r=>r.name+': '+r.count).join(', '))+(cell.members.length>5?'…':''):''} · ${number(cell.count,locale)} ${text(locale,'สาขา','branches')}${share?' · '+share:''}">${hasLogo?logo(cell.brandId):''}<span class="supply-treemap-cell-name">${own?'<b class="supply-treemap-own-cue">'+text(locale,'เรา','Own')+'</b> ':''}${esc(cell.name)}</span><span class="supply-treemap-cell-count">${number(cell.count,locale)}${!narrow&&share?' · '+share:''}</span></div>`;}).join('')}</div>`:`<p class="supply-treemap-state">${esc(status)}</p>`;
  const limit=Math.max(40,Math.floor(Number(options.limit)||40)),ordered=sorted.filter(r=>r.party==='own').concat(sorted.filter(r=>r.party!=='own')),visibleRows=compact?plotted:ordered.slice(0,limit);
  if(!compact){renderContexts.set(id,{summary,options:{...options,limit}});if(renderContexts.size>6)renderContexts.delete(renderContexts.keys().next().value);}
  const grouped=plotted.find(r=>r.members),groupNote=grouped&&!compact?`<p class="supply-treemap-basis">${text(locale,'กลุ่มคู่แข่งอื่นรวม ', 'Other identified competitors groups ')}${number(grouped.members.length,locale)} ${text(locale,'แบรนด์ · ดูยอดแต่ละแบรนด์ด้านล่าง','brands · individual counts listed below')}</p>`:'';
  const list=`<div class="supply-treemap-list" role="list" aria-label="${esc(text(locale,'ยอดสาขารายแบรนด์','Branch counts by brand'))}">${visibleRows.map(row=>{const slot=String(row.seriesIndex+1).padStart(2,'0'),own=row.party==='own',share=s.exact&&s.identifiedTotal>0?number(row.count/s.identifiedTotal*100,locale,1)+'%':'';return `<div class="supply-treemap-row ${own?'is-own':''}" role="listitem"><span class="supply-treemap-series" data-series="${slot}" aria-hidden="true">${cues[row.seriesIndex]}</span><span class="supply-treemap-brand" title="${esc(row.name)}">${esc(row.name)}${own?` <b class="supply-treemap-own-caption">${compact?text(locale,'เรา','Own'):text(locale,'สาขาเรา','Our stores')}</b>`:''}</span><span class="supply-treemap-row-count">${number(row.count,locale)}${compact?(share?' · '+share:''):` <small>${text(locale,'สาขา','branches')}</small>${share?`<span>${share}</span>`:''}`}</span></div>`;}).join('')}</div>`;
  const more=!compact&&ordered.length>limit?`<button type="button" class="btn secondary supply-treemap-more" data-supply-treemap-more="${id}">${text(locale,'แสดงอีก ', 'Show ')}${number(Math.min(40,ordered.length-limit),locale)} ${text(locale,'แบรนด์','more brands')} · ${number(limit,locale)}/${number(ordered.length,locale)}</button>`:'';
  const extras=[s.unknown===null?text(locale,'ยอดไม่ทราบแบรนด์ยังไม่พร้อม','Unknown-brand count unavailable'):s.unknown>0?text(locale,'ไม่ทราบแบรนด์ ', 'Unknown brand ')+number(s.unknown,locale)+text(locale,' สาขา · ไม่รวมในฐาน',' branches · excluded from denominator'):'',s.unclassified===null?'':s.unclassified>0?text(locale,'ขอบเขตบริการรอตรวจ ', 'Business-scope membership unresolved ')+number(s.unclassified,locale)+text(locale,' รายการ',' records'):''].filter(Boolean);
  return `<section class="supply-treemap-section ${compact?'is-compact':''}" data-treemap-id="${id}" data-supply-breakdown-state="${esc(s.state)}" ${compact?`aria-label="${esc(title)}"`:`aria-labelledby="${id}-title"`}>${header}${summaryHTML}${tree}${!compact||!s.exact?`<p class="supply-treemap-basis">${esc(compact?text(locale,'ยอดที่ทราบ · ฐานรอตรวจ','Observed counts · basis under review'):s.exact?basis:status)}</p>`:''}${groupNote}${list}${more}${extras.length?`<p class="supply-treemap-coverage">${compact?[s.unknown===null?text(locale,'ยอดไม่ทราบแบรนด์: —','Unknown-brand count: —'):s.unknown>0?number(s.unknown,locale)+text(locale,' สาขาไม่ทราบแบรนด์ · ไม่รวม',' unknown-brand branches · excluded'):'',s.unclassified>0?number(s.unclassified,locale)+text(locale,' รายการรอตรวจบริการ',' scope-unresolved records'):''].filter(Boolean).map(esc).join('<br>'):extras.map(esc).join('<br>')}</p>`:''}<p class="supply-treemap-foot">${compact?text(locale,'CityMETER · ส่วนแบ่งสาขา ไม่ใช่ยอดขาย','CityMETER · branch share, not sales share'):text(locale,'จำนวนสาขาจาก CityMETER ตามรูปแบบที่เลือก ไม่ใช่ส่วนแบ่งยอดขาย','CityMETER branch counts for the selected format; not sales market share.')}</p></section>`;
 }
 global.document?.addEventListener?.('click',event=>{const button=event.target.closest?.('[data-supply-treemap-more]'),id=button?.dataset?.supplyTreemapMore,context=renderContexts.get(id);if(!context)return;const host=button.closest('.supply-treemap-section');if(!host)return;host.outerHTML=render(context.summary,{...context.options,limit:context.options.limit+40});const focus=global.document.querySelector?.('[data-supply-treemap-more="'+id+'"]')||global.document.querySelector?.('#'+id+'-title');focus?.focus?.();});
 global.YolkSupplyTreemap=Object.freeze({render,normalize,layout,chartRows,seriesIndex});
})(window);
