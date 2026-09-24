/* CityMETER: Yolk — read-only market-landscape presentation. No model or workspace mutation. */
(function (global) {
  'use strict';
  const defaults = [
    {id:'gfa',th:'พื้นที่อาคารรวม',en:'Gross floor area',unitTh:'ตร.ม.',unitEn:'m²',group:'building'},
    {id:'gfa_per_person',th:'พื้นที่อาคารต่อคน',en:'Floor area per person',unitTh:'ตร.ม./คน',unitEn:'m²/person',group:'building'},
    {id:'gfa_per_km2',th:'พื้นที่อาคารต่อพื้นที่',en:'Floor area per km²',unitTh:'ตร.ม./ตร.กม.',unitEn:'m²/km²',group:'building'},
    {id:'factory_count',th:'จำนวนโรงงาน',en:'Factories',unitTh:'แห่ง',unitEn:'factories',group:'activity'},
    {id:'factory_count_per_km2',th:'โรงงานต่อพื้นที่',en:'Factories per km²',unitTh:'แห่ง/ตร.กม.',unitEn:'factories/km²',group:'activity'},
    {id:'factory_workers',th:'แรงงานโรงงาน',en:'Factory workers',unitTh:'คน',unitEn:'people',group:'activity'},
    {id:'factory_workers_per_km2',th:'แรงงานโรงงานต่อพื้นที่',en:'Factory workers per km²',unitTh:'คน/ตร.กม.',unitEn:'people/km²',group:'activity'},
    {id:'hotel_rooms',th:'ห้องพักโรงแรม',en:'Hotel rooms',unitTh:'ห้อง',unitEn:'rooms',group:'activity'},
    {id:'hotel_rooms_per_km2',th:'ห้องพักโรงแรมต่อพื้นที่',en:'Hotel rooms per km²',unitTh:'ห้อง/ตร.กม.',unitEn:'rooms/km²',group:'activity'}
  ];
  const text = (th,en) => typeof tr === 'function' ? tr(th,en) : th;
  const esc = value => typeof escapeHTML === 'function' ? escapeHTML(value) : String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = (value,digits=0) => typeof num === 'function' ? num(value,digits) : Number(value).toLocaleString('en',{maximumFractionDigits:digits});
  const validNumber = value => typeof value === 'number' && Number.isFinite(value);
  const count = value => validNumber(value) && value >= 0 ? value : null;
  const patterns = [
    {name:'Crowded',d:true,c:true,b:true},{name:'FOMO',d:true,c:true,b:false},
    {name:'Our Farm',d:true,c:false,b:true},{name:'Pioneer',d:true,c:false,b:false},
    {name:'Winter War',d:false,c:true,b:true},{name:'Their War',d:false,c:true,b:false},
    {name:'Our Island',d:false,c:false,b:true},{name:'Quiet',d:false,c:false,b:false}
  ];
  function metricList() {
    const registry = typeof METRICS !== 'undefined' ? METRICS : null;
    return defaults.map((fallback,i) => {
      const found = Array.isArray(registry) ? registry.find(item => (Array.isArray(item)?item[0]:item?.id) === fallback.id) : registry?.[fallback.id];
      if (Array.isArray(found)) return {...fallback,id:found[0],th:found[1]||fallback.th,en:found[2]||fallback.en,unitTh:found[3]||fallback.unitTh,unitEn:found[4]||fallback.unitEn,group:found[5]||fallback.group,index:i};
      return {...fallback,...(found||{}),index:i};
    });
  }
  function metricValue(area,metric) {
    if (!Array.isArray(area.metrics)) return area.metrics?.[metric.id];
    const index = typeof METRIC_INDEX !== 'undefined' && Number.isInteger(METRIC_INDEX?.[metric.id]) ? METRIC_INDEX[metric.id] : metric.index;
    return area.metrics[index];
  }
  function tierLabel(tier) {
    if (Number.isInteger(tier) && tier>=1 && tier<=3) return 'Tier '+tier;
    if (tier===0) return text('ยังไม่ผ่านเกณฑ์','Below the threshold');
    return text('ยังสรุป Tier ไม่ได้','Tier not confirmed');
  }
  function supplyPanel(area) {
    const values = [count(area.supply?.own),count(area.supply?.competitor),count(area.supply?.unverified)];
    const complete = values.every(value=>value!==null);
    const total = complete ? values.reduce((sum,value)=>sum+value,0) : null;
    const labels = [text('บางจาก','Bangchak'),text('คู่แข่ง','Competitors'),text('ยังไม่ทราบแบรนด์','Unclassified brand')];
    const kinds = ['own','rival','unknown'];
    const stats = values.map((value,i)=>`<div class="yl-supply-stat yl-${kinds[i]}"><dt><span class="yl-key" aria-hidden="true"></span>${labels[i]}</dt><dd>${value===null?text('ยังไม่มีข้อมูล','No data'):number(value)} <small>${value===null?'':text('สถานี','stations')}</small></dd></div>`).join('');
    const bar = complete && total>0 ? `<div class="yl-supply-bar" aria-hidden="true">${values.map((value,i)=>value>0?`<span class="yl-${kinds[i]}" style="width:${100*value/total}%"></span>`:'').join('')}</div>` : `<div class="yl-no-bar">${complete?text('ข้อมูลชุดนี้รายงาน 0 สถานีในพื้นที่','This snapshot reports 0 stations in this area'):text('ข้อมูลยังไม่ครบ จึงยังไม่แบ่งสัดส่วน','Incomplete counts; proportions are not shown')}</div>`;
    const observed = text('ข้อมูลจำลอง','Synthetic demo');
    const records = typeof Y !== 'undefined' && Array.isArray(Y.pois) ? Y.pois.filter(p=>String(p.area)===String(area.id)&&!p.archived&&p.status!=='closed') : [];
    const grouped = new Map();
    for (const poi of records) {
      const raw = typeof poi.brand==='string' ? poi.brand.trim() : '';
      const key = !raw || /^(unknown|null|undefined)$/i.test(raw) ? '__unknown__' : raw;
      const item = grouped.get(key)||{brand:key,count:0};item.count++;grouped.set(key,item);
    }
    const brands = [...grouped.values()].sort((a,b)=>b.count-a.count||a.brand.localeCompare(b.brand));
    const highest = brands.length ? brands[0].count : 0;
    const brandMarkup = brands.length ? `<ul class="yl-brand-list">${brands.map(item=>`<li><div class="yl-brand-label"><span>${item.brand==='__unknown__'?text('ยังไม่ทราบแบรนด์','Unknown brand'):/^unbranded$/i.test(item.brand)?text('ระบุว่าไม่ติดแบรนด์','Listed as unbranded'):esc(item.brand)}</span><strong>${number(item.count)} <small>${text('รายการ','records')}</small></strong></div><div class="yl-brand-track" aria-hidden="true"><span style="width:${item.count/highest*100}%"></span></div></li>`).join('')}</ul>` : `<p class="yl-empty">${text('ยังไม่มีรายการ POI ที่ดึงมาแสดงในทำเลนี้ ไม่ได้แปลว่าไม่มีสถานี','No retrieved POI records for this location. This does not mean there are no stations.')}</p>`;
    const sourceLayers = [...new Set(records.map(p=>p.sourceDataset).filter(Boolean))].map(esc).join(' + ');
    return `<section class="yl-panel yl-supply" aria-labelledby="yl-supply-title"><div class="yl-section-heading"><h2 id="yl-supply-title">${text('Supply ในทำเลนี้','Supply in this location')}</h2><p>${text('จำนวนสถานีตามข้อมูลที่ใช้คัดกรอง','Station counts used by the screening model')}</p></div><dl class="yl-supply-stats">${stats}</dl>${bar}<p class="yl-note">${text('รวม','Total')} ${total===null?text('ยังสรุปไม่ได้','not confirmed'):number(total)+' '+text('สถานี','stations')} · ${text('เป็นจำนวนสถานี ไม่ใช่ส่วนแบ่งยอดขาย','Counts of stations, not sales market share')}</p><p class="yl-source">${text('ข้อมูล Supply จำลอง:','Synthetic supply:')} ${observed}</p><details class="yl-poi-detail"><summary>${text('ดูแบรนด์จากรายการ POI ใน workspace','Brands in workspace POI records')} <span>${number(records.length)}</span></summary><p class="yl-note"><strong>${text('รายการ POI จำลองและที่ทีมเพิ่ม','Synthetic POI records and team additions')}</strong> · ${text('นับรายการแยกตามแบรนด์ ยังไม่ใช่จำนวนสถานีจริงที่ไม่ซ้ำ','Record counts by brand; not deduplicated physical-station counts')}</p>${brandMarkup}<dl class="yl-reconciliation"><div><dt>${text('สถานีในข้อมูลจำลอง','Stations in synthetic baseline')}</dt><dd>${total===null?text('ยังสรุปไม่ได้','Not confirmed'):number(total)}</dd></div><div><dt>${text('รายการ POI ที่แสดงได้','Available POI records')}</dt><dd>${number(records.length)}</dd></div></dl><p class="yl-note">${text('จำนวน POI รายสาขาเป็นเพียงตัวอย่าง ไม่ใช่รายการครบทุกสาขาตามยอดรวมจำลอง การแก้ POI ยังไม่เปลี่ยนยอด Supply จนกว่าจะกระทบยอด','Individual POIs are only samples, not a complete list behind synthetic totals. Editing a POI does not change analytical supply until reconciliation.')}</p>${sourceLayers?`<p class="yl-source">${text('แหล่งของรายการที่แสดง','Sources of displayed records')}: ${sourceLayers}</p>`:''}</details></section>`;
  }
  function demandMetric(area,metric) {
    const raw = metricValue(area,metric);
    const stateInfo = area.metricStates?.[metric.id];
    const state = typeof stateInfo==='string' ? stateInfo : stateInfo?.state;
    const hiddenByState = ['no_data','out_of_scope','suppressed','not_yet'].includes(state);
    const available = validNumber(raw) && !hiddenByState;
    const value = available ? `${number(raw,metric.id.includes('per_')?2:0)} ${esc(text(metric.unitTh,metric.unitEn))}` : state==='suppressed'?text('ปิดค่าตามข้อกำหนด','Value suppressed'):state==='out_of_scope'?text('อยู่นอกขอบเขตข้อมูล','Outside data scope'):state==='not_yet'?text('ยังไม่ถึงรอบข้อมูล','Not yet available'):text('ยังไม่มีข้อมูล','No data');
    const p = area.percentiles?.[metric.id];
    const percentileKnown = available && validNumber(p) && p>=0 && p<=100;
    const percentile = percentileKnown?'P'+number(p,1):text('ยังเทียบ P ไม่ได้','Percentile unavailable');
    const passes = percentileKnown && p>=95;
    const groupClass = metric.id.startsWith('gfa')?'building':metric.group==='activity'?'activity':'extra';
    const reason = !available && typeof stateInfo==='object' ? stateInfo?.reason : null;
    return `<li class="yl-metric yl-${groupClass}"><div class="yl-metric-title"><span>${esc(text(metric.th,metric.en))}</span><strong>${value}</strong></div><div class="yl-metric-plot"><div class="yl-metric-track ${percentileKnown?'':'yl-missing-track'}" aria-hidden="true">${percentileKnown?`<span style="width:${p}%"></span>`:''}<i class="yl-p95-marker"></i></div><div class="yl-metric-caption"><span class="${passes?'yl-passes':''}">${percentile}${passes?' · '+text('P95 ขึ้นไป','P95 or above'):''}${available&&raw===0?' · '+text('ค่าที่รายงานเป็น 0','reported zero'):''}</span>${reason?`<span>${esc(reason)}</span>`:''}</div></div></li>`;
  }
  function demandPanel(area) {
    const all = metricList();
    const criteria = typeof Y !== 'undefined' ? Y.criteria||{} : {};
    const extraIds = Array.isArray(criteria.extraMetrics) ? criteria.extraMetrics : [];
    const registry = typeof METRICS !== 'undefined' ? METRICS : [];
    const extras = extraIds.filter(id=>!all.some(m=>m.id===id)).map(id=>{
      const found = Array.isArray(registry) ? registry.find(m=>(Array.isArray(m)?m[0]:m?.id)===id) : registry?.[id];
      return Array.isArray(found)?{id:found[0],th:found[1],en:found[2],unitTh:found[3],unitEn:found[4],group:found[5]}:found;
    }).filter(m=>m&&m.ready!==false);
    const groups = [{name:text('อาคาร','Built space'),tier:area.buildingTier,enabled:criteria.buildingEnabled!==false,items:all.slice(0,3)},{name:text('กิจกรรม','Activity'),tier:area.activityTier,enabled:criteria.activityEnabled!==false,items:all.slice(3)}];
    if (extras.length) groups.push({name:text('สัญญาณเพิ่มเติมที่ทีมเลือก','Additional signals selected by the team'),extra:true,enabled:true,items:extras});
    const buildingP1 = validNumber(criteria.buildingP1)?'P'+number(criteria.buildingP1):text('เกณฑ์ที่ทีมกำหนด','the team threshold');
    return `<section class="yl-panel yl-demand" aria-labelledby="yl-demand-title"><div class="yl-section-heading"><h2 id="yl-demand-title">${text('Demand เด่นตรงไหน','Where demand stands out')}</h2><p>${text(`เปรียบเทียบ ${number(all.length+extras.length)} สัญญาณกับพื้นที่ทั่วประเทศ`,`Comparing ${number(all.length+extras.length)} signals with the national benchmark`)}</p></div><div class="yl-axis" aria-hidden="true"><span>P0</span><span>P50</span><strong>P95</strong><span>P100</span></div>${groups.map(group=>`<div class="yl-demand-group"><div class="yl-group-heading"><h3>${group.name}</h3><span class="yl-tier">${!group.enabled?text('ไม่ใช้คัดกรอง','Excluded from screening'):group.extra?text('ใช้คัดกรองที่ ','Screening at ')+'P'+number(criteria.extraP):tierLabel(group.tier)}</span></div>${!group.enabled?`<p class="yl-note">${text('แสดงเป็นข้อมูลประกอบเท่านั้น กลุ่มนี้ไม่มีผลต่อ Demand หรืออันดับตามเกณฑ์ปัจจุบัน','Shown for context only. This group does not contribute to demand or ranking under the current criteria.')}</p>`:''}<ul class="yl-metrics">${group.items.map(metric=>demandMetric(area,metric)).join('')}</ul></div>`).join('')}<p class="yl-note">${text('เส้นประคือ P95 แต่ละสัญญาณเทียบกับข้อมูลที่มีค่าของสัญญาณนั้นทั่วประเทศ ความยาวแท่งคือ Percentile ไม่ใช่ปริมาณลูกค้าหรือยอดขาย และค่าที่หายไม่ถูกแทนด้วยศูนย์','The dashed line marks P95. Each signal uses available national observations for that metric. Bar length shows percentile, not customer volume or sales. Missing values are never replaced with zero.')}</p><p class="yl-note">${text(`P95 เป็นเส้นอ้างอิงร่วมของภาพนี้ ผล Tier ใช้เกณฑ์ปัจจุบันของทีม อาคาร Tier 1 ใช้ ${buildingP1} เมื่อเปิดใช้สัญญาณอาคาร`,`P95 is a common visual reference. Tier results follow current team criteria; building Tier 1 uses ${buildingP1} when the building signal is enabled.`)}</p></section>`;
  }
  function patternPanel(area) {
    const active = patterns.some(p=>p.name===area.pattern)?area.pattern:null;
    const ownThreshold = typeof Y !== 'undefined' ? Y.criteria?.ownMany : null;
    const rivalThreshold = typeof Y !== 'undefined' ? Y.criteria?.competitorMany : null;
    const possible = Array.isArray(area.possiblePatterns) ? [...new Set(area.possiblePatterns)].filter(name=>patterns.some(p=>p.name===name)) : [];
    const reasons = [];
    if (!active) {
      if (area.demand===null || area.demand===undefined) reasons.push(text('ข้อมูล Demand ยังไม่พอสรุปว่าสูงหรือต่ำ','Demand evidence does not yet confirm high or low demand'));
      if (![area.supply?.own,area.supply?.competitor,area.supply?.unverified].every(validNumber)) reasons.push(text('จำนวน Supply ยังไม่ครบ','Supply counts are incomplete'));
      else if (area.supply.unverified>0) reasons.push(text('แบรนด์ที่ยังไม่ทราบอาจเปลี่ยนระดับ Supply ของบางจากหรือคู่แข่ง','Unclassified brands may change the high/low supply level for Bangchak or competitors'));
      if (!reasons.length) reasons.push(text('ข้อมูลที่มีและเกณฑ์ปัจจุบันยังไม่ยืนยันรูปแบบเดียว','The current evidence and criteria do not confirm a single pattern'));
    }
    return `<section class="yl-panel yl-patterns" aria-labelledby="yl-pattern-title"><div class="yl-section-heading"><h2 id="yl-pattern-title">${text('ทำเลนี้อยู่ตลาดแบบไหน','Which market pattern fits?')}</h2><p>${active?esc(active):text('ยังสรุปรูปแบบไม่ได้จากข้อมูลที่มี','The available evidence does not confirm one pattern')}</p></div>${!active?`<p class="yl-note">${reasons.map(esc).join(' / ')}.</p>${possible.length?`<p class="yl-note">${text('รูปแบบที่ยังเป็นไปได้ตามการคำนวณ','Patterns still possible under the current model')}: <strong>${possible.map(esc).join(' / ')}</strong></p>`:''}`:''}${[true,false].map(high=>`<div class="yl-pattern-band"><h3>${high?text('Demand สูง','High demand'):text('Demand ต่ำ','Low demand')}</h3><ul class="yl-pattern-grid">${patterns.filter(p=>p.d===high).map(p=>`<li class="yl-pattern-cell ${active===p.name?'yl-pattern-current':''}" ${active===p.name?'aria-current="true"':''}><div><strong>${p.name}</strong>${active===p.name?`<span class="yl-current-label">${text('ทำเลนี้','This location')}</span>`:''}</div><dl><div><dt>${text('คู่แข่ง','Rivals')}</dt><dd>${p.c?text('มาก','High'):text('น้อย','Low')}</dd></div><div><dt>${text('บางจาก','Bangchak')}</dt><dd>${p.b?text('มาก','High'):text('น้อย','Low')}</dd></div></dl></li>`).join('')}</ul></div>`).join('')}<p class="yl-note">${validNumber(ownThreshold)&&validNumber(rivalThreshold)?text(`Supply “มาก” เริ่มที่บางจาก ${number(ownThreshold)} สถานี และคู่แข่ง ${number(rivalThreshold)} สถานี` ,`High supply starts at ${number(ownThreshold)} Bangchak stations and ${number(rivalThreshold)} competitor stations`):text('คำว่า มาก/น้อย ใช้เกณฑ์ปัจจุบันของทีม','High/low supply follows the current team criteria')}. ${text('รูปแบบตลาดช่วยตั้งคำถามเพื่อศึกษาต่อ ไม่ใช่การรับรองยอดขายหรือความเหมาะสมของที่ดิน','The pattern guides further investigation. It does not certify sales or parcel suitability.')}</p></section>`;
  }
  function renderMarketLandscape(area) {
    if (!area || typeof area!=='object') return `<section class="yl-panel"><p>${text('ยังไม่มีข้อมูลทำเลสำหรับแสดงภาพตลาด','No location evidence is available for the market landscape.')}</p></section>`;
    return `<div class="yl-landscape">${supplyPanel(area)}${demandPanel(area)}${patternPanel(area)}</div>`;
  }
  global.renderMarketLandscape = renderMarketLandscape;
})(typeof window!=='undefined'?window:globalThis);
