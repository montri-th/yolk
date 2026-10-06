/* Demand selects the set; Supply and priorities order it. Read-only presentation. */
(function(global){
 'use strict';
 const t=(th,en)=>tr(th,en),esc=s=>escapeHTML(s),icon=n=>global.YolkIcons?.icon(n)||'';
 const tiers=[['ไข่แดงเข้ม','Deep yolk','Demand สูงมาก','Very high demand'],['ไข่แดง','Yolk','Demand สูง','High demand'],['ไข่ขาว','Egg white','Demand ค่อนข้างสูง','Elevated demand']];
 function tierLabel(n){const row=tiers[n-1];return row?t(row[0],row[1]):t('ยังสรุปไม่ได้','Unresolved');}
 function demand(advanced){
  const ids=enabledMetricIds(draft),labels=ids.map(id=>METRIC_INDEX[id]).filter(Boolean);
  return `<section class="section simple-demand"><h2>${global.YolkIcons?.yolkIcon()||''}${t('1. หาไข่แดง','1. Find Yolks')}</h2><p class="lead">${t('เลือกความเข้มของตลาดที่อยากศึกษา เริ่มจากเกณฑ์ของแบรนด์ แล้วค่อยปรับให้ตรงโจทย์','Choose the demand levels to explore. Start with your brand preset and adjust when needed.')}</p><fieldset class="demand-level-options"><legend>${t('รวมทำเลระดับไหนบ้าง','Which levels should we include?')}</legend>${tiers.map((row,i)=>`<label class="demand-level-option"><input type="radio" name="yolk-level" value="${i+1}" ${draft.maxDemandTier===i+1?'checked':''}><span class="yolk-tier-swatch" data-yolk-tier="${i+1}" aria-hidden="true"></span><span><strong>${t(i===0?'ไข่แดงเข้มเท่านั้น':i===1?'ไข่แดงเข้ม + ไข่แดง':'ไข่แดงเข้ม + ไข่แดง + ไข่ขาว',i===0?'Deep yolks only':i===1?'Deep yolks + Yolks':'All three Demand levels')}</strong><small>${t(row[2],row[3])}${i>0?' '+t('ขึ้นไป','or higher'):''}</small></span></label>`).join('')}</fieldset><div class="simple-demand-count" role="status" aria-live="polite" data-simple-count></div><div class="simple-signal-digest"><h3>${icon('layers')}${t('ใช้สัญญาณอะไรหาไข่แดง','Signals behind these Yolks')}</h3><p>${esc(ownBrandName())} · ${t('เกณฑ์ตั้งต้นปรับได้','Adjustable starting criteria')}</p><ul>${labels.map(m=>`<li>${esc(t(m.th,m.en))}</li>`).join('')}</ul></div><details class="simple-advanced"><summary>${icon('tune')}${t('ปรับสัญญาณและสูตรอย่างละเอียด','Advanced signals and formulas')}</summary>${advanced}</details><p class="footline">${t('เทียบกับพื้นที่ที่มีข้อมูลทั่วประเทศ ไม่มีข้อมูลไม่ใช่ศูนย์ และ Demand นี้เป็นสัญญาณคัดทำเล ยังไม่ใช่ยอดซื้อจริง','Compared with observed areas nationwide. Missing is not zero. Demand is a screening signal, not measured purchases.')}</p></section>`;
 }
 function sync(){
  const counts=document.querySelector('[data-simple-count]');if(!counts)return;
  if(criteriaErrors(draft).length){counts.textContent=t('ตรวจค่าที่กำลังปรับก่อนแสดงผล','Check the settings to see results');return;}
  const rows=evaluate(draft).filter(inMapArea),all=rows.filter(a=>a.demand===true),chosen=rows.filter(a=>a.eligible);
  counts.innerHTML=`<strong>${num(chosen.length)}</strong><span>${t('ทำเลในระดับที่เลือก','locations in selected levels')}<small>${t('จากทำเล Demand สูงทั้งหมด ','Of all high-Demand locations: ')}${num(all.length)} · ${t('Supply ไม่เปลี่ยนจำนวนนี้','Supply does not change this count')}</small></span>`;
 }
 global.YolkSimpleCriteria=Object.freeze({demand,sync,tierLabel,tiers});
 document.addEventListener('change',e=>{if(e.target.name!=='yolk-level')return;draft.maxDemandTier=+e.target.value;updateImpact();});
})(window);
