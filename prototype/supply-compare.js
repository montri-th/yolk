/* Comparable paired bars, no capacity or sales inference. Bounds are evidence. */
(function(global){
 'use strict';
 const t=(th,en)=>tr(th,en),icon=n=>global.YolkIcons?.icon(n)||'',esc=s=>escapeHTML(s);
 function values(area,c){
  const sp=area.supply||{},relative=c.supplyMode==='relative',threshold=relative?global.YolkRelativeSupply?.countThresholds(area,c):{valid:true,unit:1,denominator:1};
  const unit=relative?global.YolkRelativeSupply?.unitLabel(c.supplyDenominatorId,Y.lang):t('สาขา','branches');
  const factor=threshold?.valid?threshold.unit/threshold.denominator:null;
  const rows=['own','competitor'].map(role=>{
   const lo=Number.isFinite(sp[role+'Lower'])?sp[role+'Lower']:sp[role],hi=Number.isFinite(sp[role+'Upper'])?sp[role+'Upper']:sp[role];
   const u=sp.unverified;
   if(factor===null||!Number.isFinite(lo)||!Number.isFinite(hi)||!Number.isFinite(u)||lo<0||hi<lo||u<0)return {role,state:'unresolved',lo:null,hi:null};
   return {role,state:hi+u===lo?'exact':'bounded',lo:lo*factor,hi:(hi+u)*factor};
  });
  return {unit,rows};
 }
 function panel(area,c=Y.criteria,compact=false){
  const result=values(area,c),extent=Math.max(0,...result.rows.flatMap(r=>[r.lo||0,r.hi||0])),scale=extent>0?extent:1,fmt=n=>num(n,c.supplyMode==='relative'?3:0);
  return `<section class="supply-compare ${compact?'supply-compare-compact':''}" aria-label="${t('เทียบสาขาในทำเลเดียวกัน','Branch comparison within one location')}">${compact?'':`<h3>${t('สาขาเราเทียบคู่แข่ง','Our stores and competitors')}</h3><p>${esc(result.unit)} · ${t('สองฝั่งใช้หน่วยและสเกลเดียวกัน','Both sides use the same unit and scale')}</p>`}${result.rows.map(r=>`<div class="supply-pair supply-pair-${r.role}"><span class="supply-pair-label">${icon(r.role==='own'?'shield':'swords')}<span>${t(r.role==='own'?'สาขาเรา':'คู่แข่ง',r.role==='own'?'Our stores':'Competitors')}</span></span><strong>${r.state==='unresolved'?'—':fmt(r.lo)+(r.state==='bounded'?'–'+fmt(r.hi):'')}</strong><div class="supply-pair-track" aria-hidden="true">${r.state==='unresolved'?'<span class="supply-pair-missing"></span>':`<span class="supply-pair-bar" style="width:${100*r.lo/scale}%"></span>${r.state==='bounded'?`<span class="supply-pair-uncertainty" style="left:${100*r.lo/scale}%;width:${100*(r.hi-r.lo)/scale}%"></span>`:''}`}</div></div>`).join('')}${`<small>${esc(result.unit)} · ${t('สเกลทำเลนี้','Local scale')} 0–${fmt(scale)}</small>`}${compact?'':`<p class="footline">${result.rows.some(r=>r.state!=='exact')?t('เส้นลายคือช่วงที่ยังไม่แน่ ขีด — คือยังเทียบไม่ได้; ศูนย์ที่วัดได้จะแสดง 0','Hatched bars show bounds; — means unavailable. Observed zero is shown as 0.')+' ':''}${t(c.supplyMode==='relative'?'โล่และดาบแยกสาขาเราและคู่แข่ง แท่งแสดงสาขาต่อฐานตลาด ไม่ใช่กำลังให้บริการหรือส่วนแบ่งยอดขาย':'โล่และดาบแยกสาขาเราและคู่แข่ง แท่งแสดงจำนวนสาขา ไม่ใช่กำลังให้บริการหรือส่วนแบ่งยอดขาย',c.supplyMode==='relative'?'Shield and swords identify each network. Bars show branches per market base, not capacity or sales share.':'Shield and swords identify each network. Bars show branch counts, not capacity or sales share.')}</p>`}</section>`;
 }
 global.YolkSupplyCompare=Object.freeze({values,panel});
})(window);
