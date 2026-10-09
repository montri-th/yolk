/* Current Yolk workflow: Demand screens; Supply and weights rank. Historical pattern helpers are diagnostics only. */
(function(global){
 'use strict';
 const patterns=[
  {name:'Crowded',d:true,c:true,b:true,th:'Demand สูง และมีสาขาทั้งสองฝั่งมาก',en:'High demand, with many branches on both sides.'},
  {name:'FOMO',d:true,c:true,b:false,th:'Demand สูง คู่แข่งมีสาขามาก แต่เครือข่ายเรายังน้อย',en:'High demand and many competitors; few of our stores.'},
  {name:'Our Farm',d:true,c:false,b:true,th:'Demand สูง เครือข่ายเรามีฐานสาขา คู่แข่งยังน้อย',en:'High demand, many of our stores and few competitors.'},
  {name:'Pioneer',d:true,c:false,b:false,th:'Demand สูง แต่สาขาทั้งสองฝั่งยังน้อย',en:'High demand, with few branches on either side.'},
  {name:'Quiet',d:false,c:false,b:false,th:'สัญญาณ Demand และสาขาทั้งสองฝั่งยังน้อย',en:'Lower proxy demand and few branches on either side.'},
  {name:'Their War',d:false,c:true,b:false,th:'คู่แข่งมีสาขามาก แต่ Demand ที่วัดยังต่ำ',en:'Many competitors despite lower proxy demand; few of our stores.'},
  {name:'Our Island',d:false,c:false,b:true,th:'เครือข่ายเรามีสาขามาก คู่แข่งน้อย แต่ Demand ที่วัดยังต่ำ',en:'Many of our stores, few competitors and lower proxy demand.'},
  {name:'Winter War',d:false,c:true,b:true,th:'สาขาทั้งสองฝั่งมาก แต่ Demand ที่วัดยังต่ำ',en:'Many branches on both sides despite lower proxy demand.'}
 ];
 const icon=n=>global.YolkIcons?.icon(n)||'';
 function percentileText(p){
  if(!Number.isFinite(p)||p<0||p>100)return tr('ยังเทียบไม่ได้','Comparison unavailable');
  return p>=99?tr('กลุ่มสูงสุด 1%','Top 1%'):p>=95?tr('กลุ่มสูงสุด 5%','Top 5%'):p>=90?tr('กลุ่มสูงสุด 10%','Top 10%'):p>=50?tr('ครึ่งบน','Upper half'):tr('ต่ำกว่ากึ่งกลาง','Below the midpoint');
 }
 function percentileView(p){
  if(!Number.isFinite(p)||p<0||p>100)return `<span class="percentile-unavailable">${percentileText(p)}</span>`;
  let band=p>=99?'top-1':p>=95?'top-5':p>=90?'top-10':'context';
  return `<div class="percentile-reading percentile-${band}"><strong class="percentile-band">${percentileText(p)}</strong><span class="percentile-benchmark">${tr('เทียบพื้นที่ที่มีข้อมูลทั่วประเทศ','Among observed areas nationwide')}</span><span class="percentile-mini-track" aria-hidden="true"><i style="width:${p}%"></i></span><details class="percentile-exact"><summary>${tr('ดูค่า Percentile','View percentile')}</summary><span>${tr('ค่า Percentile','Percentile')}: <b>P${num(p,1)}</b></span></details></div>`;
 }
 function pattern(name){return patterns.find(p=>p.name===name)}
 const patternCountCache=new WeakMap();
 // Use full national evaluation rows, never displayedRows()/province/viewport rows.
 // Checkbox preference is irrelevant to a card's potential membership. Demand/Tier
 // gates remain identical to model.js. A review row may appear on several cards.
 function patternCounts(c=draft,fullNationalRows){
  const empty=()=>Object.fromEntries(patterns.map(p=>[p.name,{confirmed:0,review:0}]));
  const names=patterns.map(p=>p.name),screen={...c,patterns:names};
  if(Y.loading||Y.loadError||criteriaErrors(screen).length)return {valid:false,total:AREAS.length,counts:empty(),reason:Y.loading?'loading':Y.loadError?'load_error':'invalid_criteria'};
  let rows=fullNationalRows;
  if(!rows)rows=evaluate(criteriaErrors(c).length?screen:c);
  if(!Array.isArray(rows)||rows.length!==AREAS.length)return {valid:false,total:AREAS.length,counts:empty(),reason:'national_rows_required'};
  const key=c.demandMode+'|'+c.maxDemandTier,cached=patternCountCache.get(rows);
  if(cached?.key===key)return cached.result;
  const counts=empty(),seen=new Set();let demandGateCount=0,unknownDemand=0;
  for(const a of rows){
   if(!AREA_INDEX.has(a.id))return {valid:false,total:AREAS.length,counts:empty(),reason:'national_rows_required'};
   if(seen.has(a.id))return {valid:false,total:AREAS.length,counts:empty(),reason:'duplicate_reporting_uuid'};
   seen.add(a.id);
   if(a.demand===null){unknownDemand++;continue;}
   const demandPass=a.demand===false?c.demandMode==='all':a.demand===true&&a.tierEligible===true;
   if(!demandPass)continue;
   demandGateCount++;
   const possible=[...new Set(a.possiblePatterns||[])].filter(name=>Object.prototype.hasOwnProperty.call(counts,name));
   if(possible.length===1)counts[possible[0]].confirmed++;
   else if(possible.length>1)for(const name of possible)counts[name].review++;
  }
  const result={valid:true,total:AREAS.length,counts,demandGateCount,unknownDemand,basis:'fixed_national_reporting_uuid',reviewCountsOverlap:true};
  patternCountCache.set(rows,{key,result});return result;
 }
 function patternCountView(name,result){const row=result.counts[name],read=key=>result.valid?num(row[key]):'—';return `<span class="pattern-counts" data-pattern-count="${name}" aria-label="${escapeHTML(name+' · '+tr('จำนวนทำเลทั่วประเทศ','National location counts'))}"><span class="pattern-count-confirmed"><strong data-pattern-confirmed="${name}">${read('confirmed')}</strong><span>${tr('ทำเลเข้าเกณฑ์','confirmed locations')}</span></span><button type="button" class="pattern-count-review" data-pattern-review-open="${name}"><strong data-pattern-review="${name}">${read('review')}</strong><span>${tr('ทำเลรอตรวจ','locations to review')}</span><span class="review-count-action">${icon('fact_check')}${tr('ดูสิ่งที่ต้องตรวจ','See what to check')}</span></button></span>`}
 function syncPatternCounts(root=document,c=draft,rows){
  const cards=root.querySelectorAll('[data-pattern-count]');if(!cards.length)return null;
  const result=patternCounts(c,rows);
  for(const card of cards){const row=result.counts[card.dataset.patternCount];if(!row)continue;for(const kind of ['confirmed','review']){const el=card.querySelector('[data-pattern-'+kind+']');if(el)el.textContent=result.valid?num(row[kind]):'—';}card.dataset.countState=result.valid?'ready':result.reason;}
  return result;
 }
 function supplyNote(area,c=Y.criteria){return c.supplyMode==='relative'?tr('Supply “มาก” ใช้อัตราสาขาเทียบฐานตลาด','High supply uses branches relative to the market-size denominator')+' · '+(global.YolkRelativeSupply?.unitLabel(c.supplyDenominatorId,Y.lang)||'')+' · '+tr('เรา','Own')+' ≥ '+num(c.ownRateHigh,4)+' · '+tr('คู่แข่ง','Competitors')+' ≥ '+num(c.competitorRateHigh,4):tr('Supply “มาก” เริ่มที่เครือข่ายเรา','High supply starts at')+' '+c.ownMany+' '+tr('สาขา และคู่แข่ง','own branches and')+' '+c.competitorMany+' '+tr('สาขา','competitor branches')}
 function relativeSummary(area,c=Y.criteria){
  if(global.YolkSupplyCompare?.panel)return global.YolkSupplyCompare.panel(area,c);
  if(c.supplyMode!=='relative')return '';
  const t=global.YolkRelativeSupply?.countThresholds(area,c),m=global.YolkRelativeSupply?.catalog.find(x=>x.id===c.supplyDenominatorId),unit=global.YolkRelativeSupply?.unitLabel(c.supplyDenominatorId,Y.lang)||'';
  if(!t?.valid)return `<section class="yl-rate-summary"><strong>${icon('help')}${tr('อัตรา Supply ยังสรุปไม่ได้','Supply rate unresolved')}</strong><p>${tr('ฐานตลาดที่เลือกไม่มีข้อมูลหรือเป็นศูนย์ จึงยังไม่จัด Supply ว่ามากหรือน้อย','The selected denominator is missing or zero; high/low supply cannot be classified.')}</p></section>`;
  const rate=role=>{const s=area.supply||{},base=s[role],lo=Number.isFinite(s[role+'Lower'])?s[role+'Lower']:base,hi=Number.isFinite(s[role+'Upper'])?s[role+'Upper']:base;if(!Number.isFinite(lo)||!Number.isFinite(hi)||!Number.isFinite(s.unverified))return '—';const low=lo*t.unit/t.denominator,high=(hi+s.unverified)*t.unit/t.denominator;return num(low,3)+(high-low>.0005?'–'+num(high,3):'')};
  return `<section class="yl-rate-summary"><p><strong>${tr('สาขาเทียบขนาดตลาด','Branches relative to market size')}</strong></p><small>${escapeHTML(unit)}</small><dl>${[['own',ownBrandName(),c.ownRateHigh],['competitor',tr('คู่แข่ง','Competitors'),c.competitorRateHigh]].map(([role,label,threshold])=>`<div><dt>${escapeHTML(label)}</dt><dd>${rate(role)}</dd><small>${tr('เริ่มมากที่','High from')} ${num(threshold,4)}</small></div>`).join('')}</dl><p class="footline">${escapeHTML(m?(Y.lang==='en'?m.nameEn:m.nameTh):c.supplyDenominatorId)}: ${num(t.denominator)} · ${tr('ช่วงอัตราสะท้อนรายการที่ยังไม่แน่; ฐานตลาดเป็น proxy ไม่ใช่ลูกค้าจริง','Rate intervals retain uncertain records; market size is a proxy, not measured customers.')}</p></section>`;
 }
 function levels(p,c=Y.criteria,thresholds=false){
  const hint=(high,role)=>thresholds?`<small>${high?'≥':'<'} ${c.supplyMode==='relative'?num(c[role+'RateHigh'],4)+' '+tr('ต่อหน่วยตลาด','per market unit'):c[role==='own'?'ownMany':'competitorMany']+' '+tr('สาขา','branches')}</small>`:'';
  return `<dl class="pattern-levels"><div><dt>Demand</dt><dd class="${p.d?'level-high':'level-low'}">${p.d?tr('สูง','High'):tr('ต่ำ','Low')}</dd></div><div><dt>${tr('คู่แข่ง','Competitors')}</dt><dd class="${p.c?'level-high':'level-low'}">${p.c?tr('มาก','High'):tr('น้อย','Low')}${hint(p.c,'competitor')}</dd></div><div><dt>${escapeHTML(ownBrandName())}</dt><dd class="${p.b?'level-high':'level-low'}">${p.b?tr('มาก','High'):tr('น้อย','Low')}${hint(p.b,'own')}</dd></div></dl>`;
 }
 function tierText(a){
  if(a.demand===false)return tr('ยังไม่ถึงเกณฑ์ไข่แดง','Below Yolk threshold');
  const labels={1:['ไข่แดงเข้ม · Demand สูงมาก','Deep yolk · very high demand'],2:['ไข่แดง · Demand สูง','Yolk · high demand'],3:['ไข่ขาว · Demand ค่อนข้างสูง','Egg white · elevated demand']};
  return labels[a.qualifyingTier]?tr(...labels[a.qualifyingTier]):tr('Demand ยังสรุปไม่ได้','Demand unresolved');
 }
 function rankText(a,c=Y.criteria){if(c.rankingMode==='context')return Number.isFinite(a.pathStrength)?'P'+num(a.pathStrength,1):'—';if(c.rankingMode!=='weighted')return Number.isFinite(a.passingSignalCount)?num(a.passingSignalCount):'—';if(!Number.isFinite(a.rankScore))return '—';return num(a.rankScore,1)+(a.rankUpper-a.rankScore>.05?'–'+num(a.rankUpper,1):'')}
 function rankLabel(c=Y.criteria){return c.rankingMode==='context'?tr('ความเข้มเส้นทางที่ผ่าน (P)','Confirmed path strength (P)'):c.rankingMode==='weighted'?tr('คะแนนตามน้ำหนัก / 100','Weighted score / 100'):tr('จำนวนสัญญาณที่ผ่าน','Qualifying signals')}
 function preferred(){return `<section class="section demand-tier-explainer"><div class="block-title"><h2>${tr('อ่านสีไข่ดาว','Read the fried egg')}</h2>${global.YolkIcons?.demandIcon()||''}</div><p>${tr('ไข่แดงเข้ม = Demand สูงมาก · ไข่แดง = สูง · ไข่ขาว = ค่อนข้างสูง ทุกระดับบอกสัญญาณ Demand ที่ผ่านเกณฑ์ ไม่ใช่ยอดขาย','Deep yolk = very high demand. Yolk = high. Egg white = elevated demand. Each level represents qualifying Demand signals, not sales.')}</p><p class="rule-caption">${tr('ใช้ระดับที่ดีที่สุดจากกลุ่มสัญญาณที่ยืนยันได้ ข้อมูลที่ขาดไม่เลื่อนทำเลขึ้นระดับที่ดีกว่า','Use the best confirmed signal tier. Missing evidence cannot promote a location.')}</p></section>`}
 function weightField(scope,key,label,value){let id='weight-'+scope+'-'+key;return `<div class="weight-row"><label for="${id}">${label}</label><input id="${id}" type="number" min="0" max="100" step="1" inputmode="numeric" data-weight-scope="${scope}" data-weight-key="${key}" value="${value}"><span class="weight-share" data-weight-share="${scope}:${key}"></span></div>`}
 function ranking(){let groups=[{key:'building',label:tr('กลุ่มหลัก','Primary group'),ids:primaryIds(draft),enabled:draft.buildingEnabled},{key:'activity',label:tr('กลุ่มสนับสนุน','Supporting group'),ids:activityIds(draft),enabled:draft.activityEnabled},{key:'extra',label:tr('ปัจจัยเพิ่มเติม','Additional signals'),ids:draft.extraMetrics,enabled:!!draft.extraMetrics.length}];return `<section class="section ranking-section" id="ranking-weights"><div class="block-title"><h2>${tr('จัดลำดับในหน้า Demand','Order the Demand page')}</h2>${icon('tune')}</div><p>${tr('น้ำหนักนี้ใช้เรียงหน้า Demand ส่วนหน้าโอกาสขยายเรียงตาม Strategy จำนวนไข่แดงไม่เปลี่ยน','These weights order Demand. Expansion opportunities use Strategy order. Yolk membership stays unchanged.')}</p><div class="field"><label for="ranking-mode">${tr('วิธีเรียงทำเล','Ranking method')}</label><select id="ranking-mode"><option value="context" ${draft.rankingMode==='context'?'selected':''}>${tr('Tier → เส้นทางสัญญาณที่ยืนยันได้','Tier → confirmed path strength')}</option><option value="weighted" ${draft.rankingMode==='weighted'?'selected':''}>${tr('คะแนนตามน้ำหนักที่ทีมเลือก','Weighted priorities')}</option><option value="legacy" ${draft.rankingMode==='legacy'?'selected':''}>${tr('ระดับ Demand → จำนวนสัญญาณ','Demand tier → signal count')}</option></select></div>${draft.rankingMode==='legacy'?`<p class="notice">${tr('กำลังเรียงตามระดับ Demand และจำนวนสัญญาณ เลือก “คะแนนตามน้ำหนักที่ทีมเลือก” เพื่อใช้ช่องว่างสาขาช่วยจัดลำดับ','Ranking by Demand tier and signal count. Choose “Weighted priorities” to include branch gaps.')}</p>`:''}<fieldset ${draft.rankingMode!=='weighted'?'disabled':''}><legend>${tr('น้ำหนักหลัก','Overall priorities')}</legend><div class="weight-inputs">${weightField('rankingWeights','demand',tr('Demand ในพื้นที่','Local demand'),draft.rankingWeights.demand)}${weightField('rankingWeights','ownGap',tr('โอกาสเพิ่มสาขาเครือข่ายเรา','Gap in our branch network'),draft.rankingWeights.ownGap)}${weightField('rankingWeights','competitorGap',tr('พื้นที่ที่คู่แข่งยังน้อย','Gap in competitor supply'),draft.rankingWeights.competitorGap)}</div><p class="rule-caption">${tr('ปรับได้ 0–100 ระบบเทียบสัดส่วนให้รวม 100% โดยอัตโนมัติ น้ำหนัก 0 = ไม่ใช้ปัจจัยนั้นจัดอันดับ โดยไม่เปลี่ยนการคัด Demand','Use 0–100; values are normalized to 100%. Zero excludes a ranking factor without changing Demand screening.')}</p><details class="weight-details"><summary>${icon('tune')}${tr('ปรับน้ำหนักภายใน Demand','Fine-tune demand weights')}</summary><p>${tr('กำหนดน้ำหนักแต่ละกลุ่ม แล้วปรับรายตัววัดภายในกลุ่ม กลุ่มที่ปิดใน Demand จะไม่เข้าคะแนน','Set group weights, then metric weights within each group. Groups disabled in Demand do not enter the score.')}</p>${groups.filter(g=>g.enabled).map(g=>`<div class="weight-group"><h3>${g.label}</h3>${weightField('demandGroupWeights',g.key,tr('น้ำหนักกลุ่ม','Group weight'),draft.demandGroupWeights[g.key])}<div class="metric-weight-list">${g.ids.map(id=>weightField('metricWeights',id,tr(METRIC_INDEX[id].th,METRIC_INDEX[id].en),draft.metricWeights[id])).join('')}</div></div>`).join('')}</details></fieldset><p class="footline">${tr('Demand เทียบข้อมูลทั้งประเทศ สาขาที่น้อยเมื่อเทียบจุดอ้างอิงได้คะแนนช่องว่างสูงกว่า ถ้าข้อมูลไม่ครบ แสดงช่วงคะแนนและเรียงจากขอบล่าง ไม่ถือว่าข้อมูลที่ขาดคือศูนย์','Demand uses the national benchmark. Lower branch rates relative to the reference receive higher gap scores. Incomplete evidence yields a score range ranked by its lower bound; missing data is never zero.')}</p><p class="footline">${tr('น้ำหนักเป็นสมมติฐานที่ทีมเลือก ไม่ใช่ผลสอบเทียบยอดขาย; Fuel คง 70/20/10 เดิม ธุรกิจใหม่ตั้งคะแนนเสริม Demand 100 และช่องว่าง 0','Weights are team hypotheses, not sales calibration. Fuel retains 70/20/10. New profiles start optional weighted scoring with Demand 100 and gaps 0.')}</p></section>`}
 function detail(a,c=global.YolkDecisionSnapshot?.displayCriteria()||Y.criteria){return `<section class="section decision-summary"><div><span class="eyebrow">${tr('Demand และช่องว่างสาขา','Demand and branch gaps')}</span><h2>${global.YolkIcons?.demandIcon()||''}${tierText(a)}</h2><p>${a.eligible?tr('ผ่านเกณฑ์ Demand ที่กำลังดู เทียบช่องว่างสาขาเพื่อศึกษาต่อ','Meets the displayed Demand criteria. Compare branch gaps before further study.'):a.demand===null?tr('ข้อมูล Demand ยังไม่พอ ต้องตรวจสัญญาณที่ขาดก่อน','Demand evidence is incomplete. Check the missing signals first.'):a.demand===true?tr('ผ่าน Demand แต่ไม่อยู่ในระดับที่เลือก','Demand qualifies, but this tier is outside the selected range.'):tr('ยังไม่ผ่านเกณฑ์ Demand ที่ใช้','Does not meet the current Demand threshold.')}</p>${relativeSummary(a,c)}</div><div class="decision-score"><strong>${rankText(a,c)}</strong><span>${rankLabel(c)}</span><b>${tierText(a)}</b><small>${tr('Supply และน้ำหนักใช้จัดลำดับ ไม่ตัดทำเลออกจากกลุ่มไข่แดง','Supply and weights rank locations; they do not remove qualifying Yolks.')}</small>${c.rankingMode==='weighted'?`<p>${tr('คะแนนสำหรับเลือกคิวศึกษาต่อ ไม่ใช่ยอดขายคาดการณ์','A research priority score, not a sales forecast.')}</p>`:''}<a class="btn" href="#criteria">${icon('tune')}${tr('ดูเกณฑ์ที่ใช้','View current criteria')}</a></div></section>`}
 function sync(root=document){let c=draft;syncPatternCounts(root,c);root.querySelectorAll('[data-weight-share]').forEach(el=>{let [scope,key]=el.dataset.weightShare.split(':'),keys=[];if(scope==='rankingWeights')keys=['demand','ownGap','competitorGap'];else if(scope==='demandGroupWeights')keys=[...(c.buildingEnabled?['building']:[]),...(c.activityEnabled?['activity']:[]),...(c.extraMetrics.length?['extra']:[])];else keys=primaryIds(c).includes(key)?primaryIds(c):activityIds(c).includes(key)?activityIds(c):c.extraMetrics;let total=keys.reduce((s,k)=>s+(Number.isFinite(c[scope][k])?c[scope][k]:0),0);el.textContent=total>0&&Number.isFinite(c[scope][key])?num(c[scope][key]/total*100,1)+'%':'—'});}
 global.YolkDecisions={patternCounts,patternCountView,syncPatternCounts,supplyNote,relativeSummary,percentileText,percentileView,patterns,pattern,levels,preferred,ranking,detail,tierText,rankText,rankLabel,sync};
})(window);
