/* Yolk 1.9 factor edits are atomic. Saved legacy criteria are never converted here. */
(function (global) {
 'use strict';
 const VERSION='1.9.0',LIMIT=3,t=(th,en)=>tr(th,en),esc=value=>escapeHTML(value),icon=name=>global.YolkIcons?.icon(name)||'';
 const clone=value=>structuredClone(value),isNew=c=>c?.criteriaModeVersion===VERSION;
 const metricsIn=f=>[...new Set((Array.isArray(f?.tierPaths)?f.tierPaths:[]).flatMap(p=>(Array.isArray(p?.all)?p.all:[]).map(x=>x?.metric)))];
 const readyMetric=id=>typeof METRIC_INDEX!=='undefined'&&METRIC_INDEX[id]?.ready===true;
 const result=(ok,reason=null,extra={})=>({ok,reason,...extra});
 function factorErrors(factors){
  if(!Array.isArray(factors)||!factors.length)return ['demandFactors'];
  const found=new Set(),pathIds=new Set(),errors=[],active=factors.filter(f=>f?.enabled===true).length;
  if(active>LIMIT)errors.push('demandFactorLimit');if(!active)errors.push('demandFactorRequired');
  for(const f of factors){
   if(!f||typeof f!=='object'){errors.push('demandFactors');continue;}
   if(typeof f.id!=='string'||!f.id||found.has(f.id)||typeof f.enabled!=='boolean')errors.push('demandFactors');found.add(f.id);
   if(!Array.isArray(f.tierPaths)||!f.tierPaths.length){errors.push('demandFactorPaths');continue;}
   const ids=metricsIn(f);
   if(!ids.length||ids.length>LIMIT)errors.push('demandMetricLimit');
   if(ids.some(id=>!readyMetric(id)))errors.push('demandMetricUnavailable');
   if(!Array.isArray(f.metricIds)||new Set(f.metricIds).size!==f.metricIds.length||f.metricIds.length!==ids.length||ids.some(id=>!f.metricIds.includes(id)))errors.push('demandFactorMetricSync');
   for(const p of f.tierPaths){
    if(!p||typeof p!=='object'){errors.push('demandFactorPaths');continue;}
    if(typeof p.id!=='string'||!p.id||pathIds.has(p.id)||![1,2,3].includes(p.tier))errors.push('demandFactorPaths');pathIds.add(p.id);
    if(!Array.isArray(p.all)||!p.all.length||p.all.length>LIMIT){errors.push('demandJointLimit');continue;}
    if(new Set(p.all.map(x=>x?.metric)).size!==p.all.length)errors.push('demandDuplicateMetric');
    if(p.all.some(x=>!x||x.op!=='gte_percentile'||x.positive_presence!==true||!Number.isFinite(x.percentile)||x.percentile<1||x.percentile>100))errors.push('demandFactorThreshold');
   }
  }
  return [...new Set(errors)];
 }
 function compile(factors){const invalid=factorErrors(factors);if(invalid.length)throw new RangeError('Demand factors: '+invalid.join(', '));return factors.filter(f=>f.enabled).flatMap(f=>f.tierPaths.map(p=>({...clone(p),factorId:f.id})));}
 const pathSignature=p=>JSON.stringify({id:p?.id,tier:p?.tier,factorId:p?.factorId,all:Array.isArray(p?.all)?p.all.map(x=>({metric:x?.metric,op:x?.op,percentile:x?.percentile,positive_presence:x?.positive_presence})):null});
 function errors(c){
  if(!isNew(c))return [];const invalid=factorErrors(c.demandFactors);if(invalid.length)return invalid;const expected=compile(c.demandFactors);
  if(!Array.isArray(c.paths)||c.paths.length!==expected.length||c.paths.some((p,i)=>pathSignature(p)!==pathSignature(expected[i])))invalid.push('demandFactorPathSync');
  if(c.extraMetrics?.length)invalid.push('demandFactorExtraMetrics');if(c.cohortMode!=='national')invalid.push('demandFactorCohort');
  if(c.buildingEnabled!==expected.some(p=>!p.id.startsWith('workplace'))||c.activityEnabled!==expected.some(p=>p.id.startsWith('workplace')))invalid.push('demandFactorGroupSync');
  return [...new Set(invalid)];
 }
 function rebuild(c){c.paths=compile(c.demandFactors);c.buildingEnabled=c.paths.some(p=>!p.id.startsWith('workplace'));c.activityEnabled=c.paths.some(p=>p.id.startsWith('workplace'));return c;}
 function seed(base,profile){if(!profile?.criteriaOverrides||profile.criteriaOverrides.criteriaModeVersion!==VERSION||!Array.isArray(profile.factorPresets))return base;const c={...base,...clone(profile.criteriaOverrides),demandFactors:clone(profile.factorPresets)};rebuild(c);const invalid=errors(c);if(invalid.length)throw new RangeError('Demand preset: '+invalid.join(', '));return c;}
 // Keep exact-number edits, including incomplete input. Validation blocks applying it.
 function remember(c=draft){if(!isNew(c)||!Array.isArray(c.demandFactors))return false;for(const f of c.demandFactors){const current=(c.paths||[]).filter(p=>p.factorId===f.id);if(f.enabled&&current.length){f.tierPaths=clone(current).map(p=>{delete p.factorId;return p;});f.metricIds=metricsIn(f);}}return true;}
 function replaceMetric(c,pathIndex,conditionIndex,metricId){
  if(!isNew(c))return result(false,'legacy');const p=c.paths?.[pathIndex],oldMetric=p?.all?.[conditionIndex]?.metric,f=c.demandFactors?.find(f=>f.id===p?.factorId);
  if(!f||!oldMetric||!readyMetric(metricId))return result(false,'unavailable');if(oldMetric===metricId)return result(true,null,{changed:false,factorId:f.id});
  const candidate=clone(c);remember(candidate);const changed=candidate.demandFactors.find(x=>x.id===f.id);
  if(metricsIn(changed).includes(metricId))return result(false,'duplicate_metric');
  for(const path of changed.tierPaths)for(const condition of path.all)if(condition.metric===oldMetric)condition.metric=metricId;changed.metricIds=metricsIn(changed);
  try{rebuild(candidate);}catch{return result(false,'invalid');}if(errors(candidate).length)return result(false,'invalid');Object.assign(c,candidate);return result(true,null,{changed:true,factorId:f.id,oldMetric,metricId});
 }
 function setEnabled(c,factorId,enabled){
  if(!isNew(c))return result(false,'legacy');if(typeof enabled!=='boolean')return result(false,'invalid');const f=c.demandFactors?.find(f=>f.id===factorId);if(!f)return result(false,'unavailable');if(f.enabled===enabled)return result(true,null,{changed:false});
  const count=c.demandFactors.filter(f=>f.enabled).length;if(enabled&&count>=LIMIT)return result(false,'factor_limit');if(!enabled&&count===1)return result(false,'factor_required');
  const candidate=clone(c);remember(candidate);candidate.demandFactors.find(f=>f.id===factorId).enabled=enabled;try{rebuild(candidate);}catch{return result(false,'invalid');}if(errors(candidate).length)return result(false,'invalid');Object.assign(c,candidate);return result(true,null,{changed:true});
 }
 function message(reason){const messages={duplicate_metric:['กลุ่มนี้ใช้ตัววัดนี้แล้ว เลือกตัววัดอื่น','This factor already uses that metric. Choose another.'],factor_limit:['ใช้ได้ไม่เกิน 3 กลุ่ม ปิดกลุ่มเดิมก่อนเลือกเพิ่ม','Use up to 3 factors. Turn one off before adding another.'],factor_required:['ต้องใช้ Demand อย่างน้อย 1 กลุ่ม','Keep at least one Demand factor.'],unavailable:['เลือกตัววัดที่มีข้อมูลพร้อมใช้','Choose an available metric.'],invalid:['ตรวจตัววัดและเกณฑ์ก่อนเปลี่ยนกลุ่ม','Check metrics and thresholds before changing factors.'],legacy:['เกณฑ์เดิมคงไว้ กดลอง preset ใหม่เมื่อต้องการ','Legacy criteria are retained. Try the new preset when ready.']};return t(...(messages[reason]||messages.invalid));}
 function controls(){
  if(!isNew(draft)||!Array.isArray(draft.demandFactors))return null;const factors=draft.demandFactors,enabled=factors.filter(f=>f.enabled).length;
  return `<section class="section demand-section"><h2>${t('เลือกปัจจัย Demand','Choose Demand factors')}</h2><p class="factor-limit">${t('เลือก 1–3 กลุ่ม แต่ละกลุ่มใช้ตัววัดได้ไม่เกิน 3 อย่าง ผ่านกลุ่มไหนให้ระดับที่ดีที่สุด','Choose 1–3 factors, with up to 3 metrics each. Use the best confirmed tier across factors.')}</p>${factors.map(f=>{const ids=metricsIn(f),paths=draft.paths.map((p,i)=>({p,i})).filter(({p})=>p.factorId===f.id);return `<section class="demand-factor"><label><input type="checkbox" data-demand-factor="${esc(f.id)}" ${f.enabled?'checked':''} ${!f.enabled&&enabled>=LIMIT?'disabled':''}><span>${esc(t(f.label?.th||f.id,f.label?.en||f.id))}</span></label><div class="factor-metrics">${ids.map(id=>`<span>${esc(t(METRIC_INDEX[id]?.th||id,METRIC_INDEX[id]?.en||id))}</span>`).join('')}</div><p>${t('เทียบ Percentile ทั้งประเทศ ฐานไม่เปลี่ยนเมื่อซูมหรือกรองจังหวัด','Percentiles use the nationwide cohort, unchanged by zoom or province filters.')}</p>${f.enabled?`<details><summary>${icon('tune')}${t('ปรับตัววัดและเกณฑ์','Adjust metrics and thresholds')}</summary><p class="footline">${t('เปลี่ยนตัววัดครั้งเดียว ใช้กับทุก Tier ในกลุ่มนี้ เกณฑ์ตัวเลขคงเดิม','A metric change applies across this factor’s tiers. Thresholds stay unchanged.')}</p><div class="factor-metric-pickers">${ids.map(id=>{const first=paths.find(({p})=>p.all.some(x=>x.metric===id)),j=first.p.all.findIndex(x=>x.metric===id);return metricPicker(id,`data-path-index="${first.i}" data-condition-index="${j}" data-demand-factor-metric="${esc(f.id)}"`);}).join('')}</div>${paths.map(({p,i})=>`<fieldset class="path-rule"><legend>Tier ${p.tier} · ${p.all.length===1?t('ตัววัดเดียว','One metric'):t('ทุกข้อผ่าน (AND)','All conditions pass (AND)')}</legend>${p.all.map((x,j)=>`<div class="path-condition"><span>${esc(t(METRIC_INDEX[x.metric]?.th||x.metric,METRIC_INDEX[x.metric]?.en||x.metric))}</span><div class="factor-threshold"><label for="factor-${i}-${j}">${t('เริ่มผ่านที่','Passes at')} P<span data-factor-threshold-label="${i}-${j}">${x.percentile}</span></label><input id="factor-${i}-${j}" type="number" min="1" max="100" value="${x.percentile}" data-path-percentile data-factor-number data-path-index="${i}" data-condition-index="${j}" aria-label="${esc(t('Percentile ขั้นต่ำ','Minimum percentile')+' · '+t(METRIC_INDEX[x.metric]?.th||x.metric,METRIC_INDEX[x.metric]?.en||x.metric))}"><input type="range" min="1" max="100" step="1" value="${x.percentile}" data-factor-range data-path-index="${i}" data-condition-index="${j}" aria-label="${esc(t('เลื่อนเกณฑ์ Percentile','Adjust percentile threshold')+' · '+t(METRIC_INDEX[x.metric]?.th||x.metric,METRIC_INDEX[x.metric]?.en||x.metric))}"></div></div>`).join('')}</fieldset>`).join('')}<p class="footline">${t('Tier เดียวกันมีหลายเงื่อนไข ใช้ OR: ผ่านทางใดทางหนึ่งก็ได้ ตัววัดหลายหน่วยจากแหล่งเดียวกันไม่ใช่หลักฐานอิสระ','Alternative paths at the same tier use OR. Units derived from the same source are correlated, not independent evidence.')}</p></details>`:''}</section>`;}).join('')}<p class="factor-limit">${enabled} / 3 · ${t('กลุ่มที่ใช้','active factors')}</p></section>`;
 }
 global.YolkDemandFactors=Object.freeze({version:VERSION,isNew,errors,compile,seed,controls,remember,replaceMetric,setEnabled,message});
 document.addEventListener('change',event=>{const input=event.target;if(!input.matches('[data-demand-factor]')||!isNew(draft))return;const change=setEnabled(draft,input.dataset.demandFactor,input.checked);if(!change.ok){input.checked=!!draft.demandFactors.find(f=>f.id===input.dataset.demandFactor)?.enabled;notify(message(change.reason));return;}if(!change.changed)return;stashContext();render();document.querySelector(`[data-demand-factor="${CSS.escape(input.dataset.demandFactor)}"]`)?.focus();});
 document.addEventListener('input',event=>{const input=event.target;if(!isNew(draft)||(!input.hasAttribute('data-factor-range')&&!input.hasAttribute('data-factor-number')))return;const i=+input.dataset.pathIndex,j=+input.dataset.conditionIndex,condition=draft.paths?.[i]?.all?.[j];if(!condition)return;condition.percentile=input.value===''?NaN:Number(input.value);remember(draft);const number=document.getElementById(`factor-${i}-${j}`),range=document.querySelector(`[data-factor-range][data-path-index="${i}"][data-condition-index="${j}"]`);if(input.hasAttribute('data-factor-range')&&number)number.value=input.value;if(input.hasAttribute('data-factor-number')&&range&&Number.isFinite(condition.percentile))range.value=input.value;const label=document.querySelector(`[data-factor-threshold-label="${i}-${j}"]`);if(label)label.textContent=input.value===''?'—':input.value;if(input.hasAttribute('data-factor-range'))queueImpact();});
})(window);
