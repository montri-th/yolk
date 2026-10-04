/* Observed CityMETER context and source-reported inventory. Team edits are local overlays. */
const tr=(th,en)=>Y.lang==='en'?en:th;
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P=window.YOLK_PROVINCES, DATA=window.YOLK_DEMO_DATA;
const PEOPLE=[{id:'m',th:'มณี',en:'Manee',role:'admin'},{id:'p',th:'แพร',en:'Prae',role:'editor'},{id:'n',th:'นนท์',en:'Nont',role:'editor'},{id:'a',th:'อิง',en:'Ing',role:'editor'},...['Ben','Dao','Fern','Krit','May','Pim'].map((n,i)=>({id:'v'+i,th:['เบน','ดาว','เฟิร์น','กฤต','เมย์','พิม'][i],en:n,role:'viewer'}))];
const PRESETS={bangchak:{th:'บางจาก · สถานีบริการน้ำมัน',en:'Bangchak · Fuel stations'}};
const patternNames=['Crowded','FOMO','Our Farm','Pioneer','Quiet','Their War','Our Island','Winter War'];
const normalizeMetricValue=v=>Number.isFinite(v)&&v>=0?v:null;
const AREAS=DATA.areas.map(a=>({...a,geoType:a.geoType==='khwaeng'?'khwaeng':'local_authority',metrics:Object.fromEntries(Object.entries({...a.metrics,population:a.population,population_per_km2:Number.isFinite(a.population)&&a.areaKm2>0?a.population/a.areaKm2:null}).map(([id,v])=>[id,normalizeMetricValue(v)]))}));
const AREA_INDEX=new Map(AREAS.map(a=>[a.id,a]));
const DISTRIBUTIONS=Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,AREAS.map(a=>a.metrics[m.id]).filter(v=>Number.isFinite(v)&&v>=0).sort((a,b)=>a-b)]));
function lowerBound(arr,x){let l=0,h=arr.length;while(l<h){let m=(l+h)>>1;if(arr[m]<x)l=m+1;else h=m}return l}
function upperBound(arr,x){let l=0,h=arr.length;while(l<h){let m=(l+h)>>1;if(arr[m]<=x)l=m+1;else h=m}return l}
function rankValue(v,arr){if(!Number.isFinite(v)||!arr?.length)return null;if(arr.length===1)return 50;let l=lowerBound(arr,v),e=upperBound(arr,v)-l;return 100*(l+.5*Math.max(0,e-1))/(arr.length-1)}
const COHORT_DISTRIBUTIONS=Object.fromEntries(['khwaeng','local_authority'].map(group=>[group,Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,AREAS.filter(a=>a.geoType===group).map(a=>a.metrics[m.id]).filter(v=>Number.isFinite(v)&&v>=0).sort((a,b)=>a-b)]))]));
function distributionFor(id,a,c){return c?.cohortMode==='same_grain'&&a?COHORT_DISTRIBUTIONS[a.geoType]?.[id]:DISTRIBUTIONS[id]}
function cutoff(id,p,a=null,c=null){let arr=distributionFor(id,a,c);if(!arr?.length)return null;let n=(arr.length-1)*p/100,k=Math.floor(n);return arr[k]+(arr[Math.min(k+1,arr.length-1)]-arr[k])*(n-k)}
AREAS.forEach(a=>a.percentiles=Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,rankValue(a.metrics[m.id],DISTRIBUTIONS[m.id])])));
const DEFAULT_CRITERIA={geographyProfile:'bkk_khwaeng_upcountry_lao',profile:'bangchak',buildingP1:99,buildingP2:95,activityP:95,activityT1:5,activityT2:3,activityT3:1,buildingEnabled:true,activityEnabled:true,extraMetrics:[],extraP:95,demandMode:'high',maxDemandTier:3,supplyMode:'count',ownMany:3,competitorMany:3,patterns:['Pioneer','FOMO','Our Farm'],rankingMode:'weighted',rankingWeights:{demand:70,ownGap:20,competitorGap:10},demandGroupWeights:{building:50,activity:50,extra:50},metricWeights:Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,1])),version:1};
// Migration changes no criteria version and emits no action: previous workspaces retain their ranked order.
function normalizeCriteria(raw,options={existing:true}){
 const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 return {...structuredClone(DEFAULT_CRITERIA),...source,
  rankingMode:source.rankingMode??(options.existing?'legacy':'weighted'),
  supplyMode:source.supplyMode??'count',
  rankingWeights:{...DEFAULT_CRITERIA.rankingWeights,...source.rankingWeights},
  demandGroupWeights:{...DEFAULT_CRITERIA.demandGroupWeights,...source.demandGroupWeights},
  metricWeights:{...DEFAULT_CRITERIA.metricWeights,...source.metricWeights},
  extraMetrics:Array.isArray(source.extraMetrics)?[...source.extraMetrics]:[],
  patterns:Array.isArray(source.patterns)?[...source.patterns]:[...DEFAULT_CRITERIA.patterns]};
}
function primaryIds(c){return c.paths?[...new Set(c.paths.filter(p=>!p.id.startsWith('workplace')).flatMap(p=>p.all.map(x=>x.metric)))]:(c.buildingMetricIds||BUILDING_IDS)}
function activityIds(c){return c.paths?[...new Set(c.paths.filter(p=>p.id.startsWith('workplace')).flatMap(p=>p.all.map(x=>x.metric)))]:(c.activityMetricIds||ACTIVITY_IDS)}
function enabledMetricIds(c){return [...new Set([...(c.buildingEnabled?primaryIds(c):[]),...(c.activityEnabled?activityIds(c):[]),...c.extraMetrics])]}
function enabledDemandGroups(c){return [{id:'building',ids:c.buildingEnabled?primaryIds(c):[]},{id:'activity',ids:c.activityEnabled?activityIds(c):[]},{id:'extra',ids:c.extraMetrics}].filter(g=>g.ids.length)}

const STORAGE_KEY='citymeter-yolk-three-industries-workspace-v1';let saved={};try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{}
const defaultArea=DATA.metadata.poiSampleAreaIds[0]||AREAS[0].id;
const Y={industry:saved.industry||'fuel',ownBrandId:saved.ownBrandId||'bangchak',supplyScope:saved.supplyScope||'all_fuel',contexts:saved.contexts||{},brandScopes:saved.brandScopes||{},loading:false,sourcePois:[],lang:saved.lang||'th',actor:saved.actor||'m',criteria:normalizeCriteria(saved.criteria,{existing:!!saved.criteria}),pois:saved.pois||[],targets:saved.targets||{},events:saved.events||[],read:saved.read||{},province:'',selected:defaultArea,poiTab:'all',brandFilter:'',poiQuery:'',page:0,listQuery:'',marketPage:0,route:'market',leaderPeriod:'30',leaderCategory:'all'};
let draft=structuredClone(Y.criteria),draftBase=Y.criteria.version;
const actor=()=>PEOPLE.find(p=>p.id===Y.actor);
const person=id=>{let p=PEOPLE.find(p=>p.id===id);return p?(Y.lang==='en'?p.en:p.th):id};
const provinceName=code=>{let p=P.find(p=>p.code===code);return p?(Y.lang==='en'?p.name_en:p.name_th):code||tr('ไม่ระบุจังหวัด','Province unknown')};
const areaName=id=>{let a=AREA_INDEX.get(id);return a?(Y.lang==='en'&&a.en?a.en:a.th):(id||tr('ยังไม่ผูกพื้นที่','Area not linked'))};
const branchName=p=>p.name||tr('ต้นทางไม่ระบุชื่อสาขา','Source has no branch name');
const canEdit=()=>actor().role!=='viewer';
Y.localOverlays=(saved.pois||[]).filter(p=>p.localOverlay);
function syncLocalOverlays(){const overlays=new Map((Y.localOverlays||[]).map(p=>[p.id,p]));for(const p of Y.pois.filter(p=>p.localOverlay))overlays.set(p.id,p);Y.localOverlays=[...overlays.values()];}
function save(){syncLocalOverlays();try{localStorage.setItem(STORAGE_KEY,JSON.stringify({lang:Y.lang,actor:Y.actor,industry:Y.industry,ownBrandId:Y.ownBrandId,supplyScope:Y.supplyScope,contexts:Y.contexts,brandScopes:Y.brandScopes,criteria:Y.criteria,pois:Y.localOverlays,targets:Y.targets,events:Y.events,read:Y.read}));return true}catch{notify(tr('บันทึกในเครื่องไม่สำเร็จ กรุณาตรวจพื้นที่จัดเก็บ','Could not save locally. Check browser storage.'));return false}}
function emitEvent(type,entity,id,changes,meta={}){if(!changes.length)return null;let e={id:crypto.randomUUID(),type,entity,entity_id:id,actor:Y.actor,at:new Date().toISOString(),changes,meta:{workspace:'expansion-demo',industry:Y.industry,ownBrandId:Y.ownBrandId,supplyScope:Y.supplyScope,ownBrandName:typeof ownBrandName==='function'?ownBrandName():Y.ownBrandId,industryName:{th:INDUSTRIES.find(i=>i.id===Y.industry)?.th,en:INDUSTRIES.find(i=>i.id===Y.industry)?.en},profileVersion:Y.criteria.profile,...meta},recipients:PEOPLE.filter(p=>p.id!==Y.actor).map(p=>p.id)};Y.events.unshift(e);if(!save()){Y.events.shift();return null}return e}
function supplyCountText(sp,key){const lower=sp[key+'Lower'],upper=sp[key+'Upper'];return Number.isFinite(lower)&&Number.isFinite(upper)&&lower!==upper?lower+'–'+upper:(sp[key]??'—');}
function supplyIndex(){return new Map(AREAS.map(a=>[a.id,{...a.supply}]))}
function marketPattern(d,c,b){return d?(c?(b?'Crowded':'FOMO'):(b?'Our Farm':'Pioneer')):(c?(b?'Winter War':'Their War'):(b?'Our Island':'Quiet'))}
function passes(a,id,p,c=Y.criteria,positive=false){let v=a.metrics[id],boundary=cutoff(id,p,a,c),arr=distributionFor(id,a,c);if(!Number.isFinite(v)||v<0||!Number.isFinite(boundary)||((c.industry||'fuel')!=='fuel'&&arr.length<(c.minimumCohortN||30)))return null;return (!positive||v>0)&&v>=boundary}
function tierBounds(low,possible){return {confirmed:low,possible,exact:low===possible?low:null,high:low>0?true:possible>0?null:false}}
function buildingTier(a,c){if(c.paths)return pathTier(a,c,'primary');if(!c.buildingEnabled)return tierBounds(0,0);let p1=primaryIds(c).map(id=>passes(a,id,c.buildingP1,c,!!c.positivePresence)),p2=primaryIds(c).map(id=>passes(a,id,c.buildingP2,c,!!c.positivePresence));let compute=optimistic=>{let yes=x=>x===true||(optimistic&&x===null);return p1.every(yes)?1:p2.every(yes)?2:p2.some(yes)?3:0};return tierBounds(compute(false),compute(true))}
function activityTier(a,c){if(c.paths){const result=pathTier(a,c,'activity');return {...result,known:result.confirmedPaths.length,unknown:result.pathStates.filter(p=>p.state===null).length}}if(!c.activityEnabled)return {...tierBounds(0,0),known:0,unknown:0};let v=activityIds(c).map(id=>passes(a,id,c.activityP,c,!!c.positivePresence)),known=v.filter(x=>x===true).length,unknown=v.filter(x=>x===null).length;let tier=n=>n>=c.activityT1?1:n>=c.activityT2?2:n>=c.activityT3?3:0;return {...tierBounds(tier(known),tier(known+unknown)),known,unknown}}
function pathTier(a,c,group){
 const enabled=group==='primary'?c.buildingEnabled:c.activityEnabled;
 const paths=enabled?c.paths.filter(p=>group==='activity'?p.id.startsWith('workplace'):!p.id.startsWith('workplace')):[];
 const pathStates=paths.map(path=>{const states=path.all.map(condition=>passes(a,condition.metric,condition.percentile,a?c:null,condition.positive_presence!==false));const state=states.includes(false)?false:states.includes(null)?null:true;return {...path,state,strength:state===true?Math.min(...path.all.map(x=>rankValue(a.metrics[x.metric],distributionFor(x.metric,a,c)))):null}});
 const confirmedPaths=pathStates.filter(p=>p.state===true),possiblePaths=pathStates.filter(p=>p.state!==false);
 const confirmed=confirmedPaths.length?Math.min(...confirmedPaths.map(p=>p.tier)):0,possible=possiblePaths.length?Math.min(...possiblePaths.map(p=>p.tier)):0;
 return {...tierBounds(confirmed,possible),confirmedPaths,pathStates};
}
function criteriaErrors(c){
 let errors=[];
 if(!c.buildingEnabled&&!c.activityEnabled&&!c.extraMetrics.length)errors.push('signal');
 if(![c.buildingP1,c.buildingP2,c.activityP,c.extraP].every(n=>Number.isFinite(n)&&n>=1&&n<=100)||c.buildingP1<c.buildingP2)errors.push('percentile');
 if(![c.activityT1,c.activityT2,c.activityT3].every(n=>Number.isInteger(n)&&n>=1&&n<=25)||c.activityT1<c.activityT2||c.activityT2<c.activityT3)errors.push('tier');
 if(![1,2,3].includes(c.maxDemandTier))errors.push('maxDemandTier');
 if(!['count','relative'].includes(c.supplyMode??'count'))errors.push('supplyMode');
 if(c.supplyMode==='relative'){if(!window.YolkRelativeSupply)errors.push('relativeSupplyUnavailable');if(!window.YolkRelativeSupply?.catalog.some(m=>m.id===c.supplyDenominatorId)||![c.ownRateHigh,c.competitorRateHigh].every(n=>Number.isFinite(n)&&n>0))errors.push('relativeSupply');}else if(![c.ownMany,c.competitorMany].every(n=>Number.isInteger(n)&&n>=1&&n<=100))errors.push('supply');
 if(c.extraMetrics.some(id=>!METRIC_INDEX[id]?.ready||enabledMetricIds({...c,extraMetrics:[]}).includes(id))||new Set(c.extraMetrics).size!==c.extraMetrics.length)errors.push('unavailable');
 if(!['high','all'].includes(c.demandMode))errors.push('demandMode');
 if(!Array.isArray(c.patterns)||!c.patterns.length||c.patterns.some(p=>!patternNames.includes(p))||new Set(c.patterns).size!==c.patterns.length)errors.push('patterns');
 if(!['weighted','legacy','context'].includes(c.rankingMode))errors.push('rankingMode');
 if(c.paths&&(!c.paths.length||c.paths.some(p=>![1,2,3].includes(p.tier)||!p.all.length||p.all.some(x=>!METRIC_INDEX[x.metric]?.ready||!Number.isFinite(x.percentile)||x.percentile<1||x.percentile>100))))errors.push('paths');
 const validWeight=n=>Number.isFinite(n)&&n>=0&&n<=100;
 for(const [name,keys] of [['rankingWeights',['demand','ownGap','competitorGap']],['demandGroupWeights',['building','activity','extra']],['metricWeights',METRICS.filter(m=>m.ready).map(m=>m.id)]]){
  if(!c[name]||keys.some(k=>!validWeight(c[name][k]))||Object.keys(c[name]||{}).some(k=>!keys.includes(k)))errors.push(name);
 }
 if(!errors.includes('rankingWeights')&&Object.values(c.rankingWeights).reduce((s,n)=>s+n,0)<=0)errors.push('rankingWeights');
 if(!errors.includes('demandGroupWeights')&&!errors.includes('metricWeights')){
  const groups=enabledDemandGroups(c).filter(g=>c.demandGroupWeights[g.id]>0);
  if(c.rankingWeights?.demand>0&&!groups.length)errors.push('demandGroupWeights');
  if(groups.some(g=>g.ids.every(id=>c.metricWeights[id]===0)))errors.push('metricWeights');
 }
 return [...new Set(errors)];
}
// National midranks are pinned at load. Missing values keep their weight and contribute [0,100].
function weightedDemand(a,c){
 let groups=enabledDemandGroups(c).filter(g=>c.demandGroupWeights[g.id]>0),total=groups.reduce((sum,g)=>sum+c.demandGroupWeights[g.id],0),lower=0,upper=0,coverage=0;
 for(const g of groups){let active=g.ids.filter(id=>c.metricWeights[id]>0),metricTotal=active.reduce((sum,id)=>sum+c.metricWeights[id],0),groupShare=c.demandGroupWeights[g.id]/total;
  for(const id of active){let share=groupShare*c.metricWeights[id]/metricTotal,p=a.percentiles[id];if(Number.isFinite(p)){lower+=share*p;upper+=share*p;coverage+=share}else upper+=share*100}
 }
 return {lower,upper,coverage};
}
function supplyGap(count,threshold){return 100/(1+count/threshold)}
function validSupply(sp){return [sp.own,sp.competitor,sp.unverified].every(n=>Number.isInteger(n)&&n>=0)}
function supplyThresholds(a,c){return window.YolkRelativeSupply?window.YolkRelativeSupply.countThresholds(a,c):c.supplyMode==='relative'?{valid:false,mode:'relative',own:null,competitor:null}:{valid:true,mode:'count',denominator:null,unit:null,own:c.ownMany,competitor:c.competitorMany};}
function validSupplyBounds(sp){return ['ownLower','ownUpper','competitorLower','competitorUpper'].every(key=>Number.isFinite(sp[key])&&sp[key]>=0)&&sp.ownUpper>=sp.ownLower&&sp.competitorUpper>=sp.competitorLower;}
function weightedEvaluation(a,c){
 const demand=weightedDemand(a,c),sp=a.supply,thresholds=supplyThresholds(a,c),w=c.rankingWeights,total=w.demand+w.ownGap+w.competitorGap;
 let supplyLower=Infinity,supplyUpper=-Infinity,ownLow=100,ownHigh=0,competitorLow=100,competitorHigh=0,supplyKnown=false;
 if(thresholds.valid&&validSupplyBounds(sp)){ownLow=supplyGap(sp.ownUpper,thresholds.own);ownHigh=supplyGap(sp.ownLower,thresholds.own);competitorLow=supplyGap(sp.competitorUpper,thresholds.competitor);competitorHigh=supplyGap(sp.competitorLower,thresholds.competitor);supplyLower=w.ownGap*ownLow+w.competitorGap*competitorLow;supplyUpper=w.ownGap*ownHigh+w.competitorGap*competitorHigh;supplyKnown=sp.ownLower===sp.ownUpper&&sp.competitorLower===sp.competitorUpper;}else if(thresholds.valid&&validSupply(sp)){
  // Evaluate joint allocations: independent endpoint combinations can describe an impossible U allocation.
  for(let k=0;k<=sp.unverified;k++){let own=supplyGap(sp.own+k,thresholds.own),competitor=supplyGap(sp.competitor+sp.unverified-k,thresholds.competitor),value=w.ownGap*own+w.competitorGap*competitor;
   supplyLower=Math.min(supplyLower,value);supplyUpper=Math.max(supplyUpper,value);ownLow=Math.min(ownLow,own);ownHigh=Math.max(ownHigh,own);competitorLow=Math.min(competitorLow,competitor);competitorHigh=Math.max(competitorHigh,competitor);
  }
  supplyKnown=sp.unverified===0;
 }else{supplyLower=0;supplyUpper=100*(w.ownGap+w.competitorGap);ownLow=competitorLow=0;ownHigh=competitorHigh=100}
 return {rankScore:(w.demand*demand.lower+supplyLower)/total,rankUpper:(w.demand*demand.upper+supplyUpper)/total,rankCoverage:(w.demand*demand.coverage+(supplyKnown?w.ownGap+w.competitorGap:0))/total,demandWeightedScore:demand.lower,demandWeightedUpper:demand.upper,demandWeightedCoverage:demand.coverage,rankingComponents:{demand,ownGap:{lower:ownLow,upper:ownHigh},competitorGap:{lower:competitorLow,upper:competitorHigh}}};
}
function confirmedTier(a){return a.qualifyingTier||9}
function stableAreaTie(a,b){return (Number.isFinite(a.sourceRank)?a.sourceRank:Infinity)-(Number.isFinite(b.sourceRank)?b.sourceRank:Infinity)||a.id.localeCompare(b.id)}
function legacyComparator(a,b){return Number(b.eligible)-Number(a.eligible)||(a.demand===true?0:a.demand===null?1:2)-(b.demand===true?0:b.demand===null?1:2)||b.stars-a.stars||Math.min(a.buildingConfirmed||9,a.activityConfirmed||9)-Math.min(b.buildingConfirmed||9,b.activityConfirmed||9)||b.passingSignalCount-a.passingSignalCount||b.supply.competitor-a.supply.competitor||a.supply.own-b.supply.own||stableAreaTie(a,b)}
function weightedComparator(a,b){return Number(b.eligible)-Number(a.eligible)||b.rankScore-a.rankScore||confirmedTier(a)-confirmedTier(b)||stableAreaTie(a,b)}
function computeEvaluation(c=Y.criteria){
 if(criteriaErrors(c).length)return [];
 let ids=enabledMetricIds(c);
 return AREAS.map(a=>{
  let b=buildingTier(a,c),ac=activityTier(a,c),extra=c.extraMetrics.map(id=>passes(a,id,c.extraP,c,c.industry!=='fuel')),extraHigh=extra.some(x=>x===true)?true:extra.some(x=>x===null)?null:false;
  let states=[b.high,ac.high,extraHigh],high=states.includes(true)?true:states.includes(null)?null:false,sp={...a.supply},thresholds=supplyThresholds(a,c),possible=new Set();
  if(high!==null&&thresholds.valid&&validSupplyBounds(sp)){const levels=(lower,upper,t)=>lower>=t?[true]:upper<t?[false]:[false,true];for(const ownHigh of levels(sp.ownLower,sp.ownUpper,thresholds.own))for(const otherHigh of levels(sp.competitorLower,sp.competitorUpper,thresholds.competitor))possible.add(marketPattern(high,otherHigh,ownHigh));}else if(high!==null&&thresholds.valid&&validSupply(sp)){for(let k=0;k<=sp.unverified;k++)possible.add(marketPattern(high,sp.competitor+sp.unverified-k>=thresholds.competitor,sp.own+k>=thresholds.own))}else if(high!==null){for(const ownHigh of [false,true])for(const otherHigh of [false,true])possible.add(marketPattern(high,otherHigh,ownHigh));}
  let pattern=possible.size===1?[...possible][0]:null,valid=ids.map(id=>a.percentiles[id]).filter(Number.isFinite),score=valid.length?Math.max(...valid):null,coverage=ids.length?valid.length/ids.length:0,stars=({'Pioneer':3,'FOMO':2,'Our Farm':1})[pattern]||0;
  let enabledPasses=ids.filter(id=>passes(a,id,primaryIds(c).includes(id)?c.buildingP2:activityIds(c).includes(id)?c.activityP:c.extraP,c,c.industry!=='fuel')===true).length,pass9=CORE_IDS.filter(id=>passes(a,id,id.startsWith('gfa')?c.buildingP2:c.activityP,c,!!c.positivePresence)===true).length;
  const qualifying=[b.confirmed,ac.confirmed,extraHigh===true?3:0].filter(t=>t>0),qualifyingTier=qualifying.length?Math.min(...qualifying):null,tierEligible=qualifyingTier!==null&&qualifyingTier<=c.maxDemandTier;
  // Tier limits only high-demand candidates. In all-demand mode, confirmed low-demand patterns remain inspectable.
  const demandEligible=c.demandMode==='all'?(high===false||(high===true&&tierEligible)):high===true&&tierEligible;
  return {...a,score,upper:score,coverage,demand:high,pattern,possiblePatterns:[...possible],supply:sp,supplyThresholds:thresholds,stars,buildingTier:b.exact,activityTier:ac.exact,buildingConfirmed:b.confirmed,activityConfirmed:ac.confirmed,buildingBounds:b,activityBounds:ac,knownActivityPasses:ac.known,activityUnknown:ac.unknown,passes9:pass9,passingSignalCount:enabledPasses,qualifyingTier,tierEligible,...weightedEvaluation(a,c),fieldStudyCandidate:high===true&&tierEligible,contextOpportunity:high===true,measuredDemand:'unknown',pathStates:[...(b.pathStates||[]),...(ac.pathStates||[])],pathStrength:c.paths?Math.max(0,...[...(b.confirmedPaths||[]),...(ac.confirmedPaths||[])].filter(p=>p.tier===qualifyingTier).map(p=>p.strength)):null,guaranteedStrategyMatch:demandEligible&&possible.size>0&&[...possible].every(p=>c.patterns.includes(p)),reviewCandidate:demandEligible&&possible.size>0&&[...possible].some(p=>c.patterns.includes(p))&&![...possible].every(p=>c.patterns.includes(p)),eligible:demandEligible&&possible.size>0&&[...possible].every(p=>c.patterns.includes(p))};
 }).sort(c.rankingMode==='weighted'?weightedComparator:c.rankingMode==='context'?contextComparator:legacyComparator);
}

function contextComparator(a,b){return Number(b.eligible)-Number(a.eligible)||confirmedTier(a)-confirmedTier(b)||(b.pathStrength??-1)-(a.pathStrength??-1)||a.id.localeCompare(b.id)}
const evaluationCache=new Map();
function evaluate(c=Y.criteria){if(criteriaErrors(c).length)return [];let key=Y.industry+'|'+Y.ownBrandId+'|'+Y.supplyScope+'|'+window.YOLK_RUNTIME.revision+'|'+JSON.stringify(c);if(evaluationCache.has(key)){const hit=evaluationCache.get(key);evaluationCache.delete(key);evaluationCache.set(key,hit);return hit;}let result=computeEvaluation(c);evaluationCache.set(key,result);if(evaluationCache.size>8)evaluationCache.delete(evaluationCache.keys().next().value);return result}
function diffCriteria(a,b){
 let keys=['buildingP1','buildingP2','activityP','activityT1','activityT2','activityT3','buildingEnabled','activityEnabled','extraMetrics','extraP','demandMode','maxDemandTier','supplyMode','supplyDenominatorId','ownRateHigh','competitorRateHigh','supplyCalibration','ownMany','competitorMany','patterns','rankingMode','paths','cohortMode','positivePresence','buildingMetricIds','activityMetricIds'];
 let changes=keys.filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(k=>({field:k,before:a[k],after:b[k]}));
 for(const group of ['rankingWeights','demandGroupWeights','metricWeights'])for(const key of new Set([...Object.keys(a[group]||{}),...Object.keys(b[group]||{})]))if(a[group]?.[key]!==b[group]?.[key])changes.push({field:group+'.'+key,before:a[group]?.[key],after:b[group]?.[key]});
 return changes;
}

const fieldNames={buildingP1:['อาคาร Tier 1: Percentile','Building Tier 1: percentile'],buildingP2:['อาคาร Tier 2/3: Percentile','Building Tier 2/3: percentile'],activityP:['กิจกรรม: Percentile','Activity percentile'],activityT1:['กิจกรรม Tier 1: จำนวนข้อ','Activity Tier 1: hits'],activityT2:['กิจกรรม Tier 2: จำนวนข้อ','Activity Tier 2: hits'],activityT3:['กิจกรรม Tier 3: จำนวนข้อ','Activity Tier 3: hits'],buildingEnabled:['ใช้สัญญาณอาคาร','Building signal enabled'],activityEnabled:['ใช้สัญญาณกิจกรรม','Activity signal enabled'],extraMetrics:['ปัจจัย Demand เพิ่มเติม','Additional demand signals'],extraP:['ปัจจัยเพิ่มเติม: Percentile','Additional signals: percentile'],demandMode:['ระดับ Demand ที่คัดไว้','Demand screening mode'],ownMany:['สาขาเราเริ่มมากที่','Own supply is high at'],competitorMany:['คู่แข่งเริ่มมากที่','Competitor supply is high at'],patterns:['รูปแบบที่คัดเลือก','Selected patterns'],name:['ชื่อสาขา','Branch name'],brand:['แบรนด์','Brand'],relation:['ประเภทสาขา','Branch relationship'],status:['สถานะ','Status'],area:['ทำเล','Location'],note:['บันทึก','Note'],owner:['ผู้รับผิดชอบ','Owner'],lat:['ละติจูด','Latitude'],lng:['ลองจิจูด','Longitude'],archived:['เก็บเข้าคลัง','Archived'],photos:['รูปสาขา','Branch photos'],target:['เล็งทำเล','Shortlisted']};
Object.assign(fieldNames,{supplyMode:['วิธีประเมิน Supply','Supply measurement mode'],supplyDenominatorId:['ตัวหารอัตราสาขา','Branch-rate denominator'],ownRateHigh:['อัตราสาขาเราเริ่มมากที่','Own branch rate is high at'],competitorRateHigh:['อัตราคู่แข่งเริ่มมากที่','Competitor branch rate is high at'],supplyCalibration:['ที่มาค่าเริ่มต้นของอัตราสาขา','Branch-rate seed calibration'],maxDemandTier:['คัด Demand ถึง Tier','Demand tiers to include'],rankingMode:['วิธีเรียงทำเล','Ranking method'],'rankingWeights.demand':['น้ำหนัก: Demand','Weight: demand'],'rankingWeights.ownGap':['น้ำหนัก: ช่องว่างสาขาเรา','Weight: own branch gap'],'rankingWeights.competitorGap':['น้ำหนัก: ช่องว่างคู่แข่ง','Weight: competitor gap'],'demandGroupWeights.building':['น้ำหนักกลุ่ม: อาคาร','Group weight: buildings'],'demandGroupWeights.activity':['น้ำหนักกลุ่ม: กิจกรรม','Group weight: activity'],'demandGroupWeights.extra':['น้ำหนักกลุ่ม: ปัจจัยเสริม','Group weight: extra signals']});
for(const m of METRICS.filter(m=>m.ready))fieldNames['metricWeights.'+m.id]=['น้ำหนัก: '+m.th,'Weight: '+m.en];
Object.assign(fieldNames,{paths:['เส้นทาง Demand และสูตร','Demand paths and formulas'],buildingMetricIds:['ตัววัดกลุ่มหลัก','Primary metrics'],activityMetricIds:['ตัววัดกลุ่มสนับสนุน','Supporting metrics'],cohortMode:['ฐานเทียบ Percentile','Percentile benchmark'],positivePresence:['กำหนดค่าสัญญาณมากกว่า 0','Positive-presence guard']});
const valLabels={context:['Tier → ความเข้มของเส้นทางสัญญาณ','Tier → confirmed path strength'],weighted:['เรียงตามน้ำหนัก','Weighted ranking'],legacy:['เรียงตามเกณฑ์เดิม','Previous ranking'],high:['Demand สูงเท่านั้น','High demand only'],all:['ทุกระดับ Demand','All demand levels'],own:['สาขาเรา','Own network branch'],competitor:['คู่แข่ง','Competitor'],unverified:['รอตรวจสอบ','Unverified'],pending:['รอตรวจสอบ','Pending verification'],source:['ตามข้อมูลต้นทาง','Source record'],active:['ทีมยืนยันเปิดอยู่','Team-confirmed open'],closed:['ทีมบันทึกว่าปิดแล้ว','Team-recorded closed'],survey:['รอลงพื้นที่','To survey'],study:['กำลังศึกษา','In review'],hold:['ติดตาม','Watching'],rejected:['ไม่ไปต่อ','Not pursuing']};
function displayValue(v,k){if(v===null||v===undefined||v==='')return tr('ยังไม่มี','Not set');if(k==='supplyDenominatorId')return METRIC_INDEX[v]?tr(METRIC_INDEX[v].th,METRIC_INDEX[v].en):String(v);if(k==='supplyMode')return v==='relative'?tr('อัตราสาขาต่อหน่วยฐาน','Branches per denominator unit'):tr('จำนวนสาขา','Branch counts');if(k==='supplyCalibration'&&typeof v==='object')return (METRIC_INDEX[v.metricId]?tr(METRIC_INDEX[v.metricId].th,METRIC_INDEX[v.metricId].en):v.metricId)+' · '+tr('เรา n=','Own n=')+(v.own?.n??'—')+' / '+tr('คู่แข่ง n=','Competitor n=')+(v.competitor?.n??'—')+' · '+tr('ค่าเริ่มต้นปรับได้','Adjustable seed');if(k==='paths')return v.map(p=>'Tier '+p.tier+': '+p.all.map(x=>tr(METRIC_INDEX[x.metric].th,METRIC_INDEX[x.metric].en)+' ≥ P'+x.percentile).join(' AND ')).join(' · ');if(['buildingMetricIds','activityMetricIds'].includes(k))return v.map(id=>tr(METRIC_INDEX[id].th,METRIC_INDEX[id].en)).join(' / ');if(k==='extraMetrics')return v.length?v.map(id=>tr(METRIC_INDEX[id].th,METRIC_INDEX[id].en)).join(' / '):tr('ไม่เพิ่ม','None');if(k==='photos'&&Array.isArray(v))return v.length?v.map(x=>typeof x==='object'?(Array.isArray(x.title)?x.title[Y.lang==='en'?1:0]:x.title||x.id)+(x.cover?' ('+tr('รูปปก','cover')+')':''):String(x)).join(' · '):tr('ยังไม่มีรูป','No photos');if(Array.isArray(v))return v.join(' / ');if(k==='area')return areaName(v);if(k==='owner')return person(v);if(typeof v==='boolean')return v?tr('ใช่','Yes'):tr('ไม่','No');return ['relation','status','demandMode','rankingMode'].includes(k)&&Object.hasOwn(valLabels,v)?tr(...valLabels[v]):String(v)}
function eventTitle(e){let titles={'criteria.updated':['ปรับเกณฑ์ของแบรนด์และขอบเขตนี้','updated criteria for this brand and scope'],'supply.created':['เพิ่มสาขา','added a branch'],'supply.updated':['แก้ไขข้อมูลสาขา','updated a branch'],'supply.archived':['เก็บสาขาเข้าคลัง','archived a branch'],'supply.restored':['คืนสาขาจากคลัง','restored a branch'],'supply.verified':['ตรวจยืนยันสาขา','verified a branch'],'place.created':['เล็งทำเลเพิ่ม','shortlisted a location'],'place.removed':['นำทำเลออกจากรายการ','removed a shortlisted location'],'place.updated':['อัปเดตงานของทำเล','updated location work'],'place.note_updated':['บันทึกข้อมูลทำเล','added a location note']};return titles[e.type]?tr(...titles[e.type]):e.type}
function eventTime(at){return new Intl.DateTimeFormat(Y.lang==='en'?'en-GB':'th-TH',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Bangkok'}).format(new Date(at))}
const unreadCount=()=>Y.events.filter(e=>e.recipients.includes(Y.actor)&&!(Y.read[Y.actor]||[]).includes(e.id)).length;
function eventCategory(e){return e.type==='supply.verified'?'verification':e.entity==='supply'?'branches':e.entity==='place'?'locations':e.entity==='criteria'?'criteria':null}
function leaderboard(period=Y.leaderPeriod,category=Y.leaderCategory,now=Date.now()){let floor=period==='all'?0:now-Number(period)*86400000,seen=new Set();let events=Y.events.filter(e=>{let t=Date.parse(e.at),cat=eventCategory(e);if(seen.has(e.id)||e.meta.sample||!e.changes.length||!Number.isFinite(t)||t<floor||t>now||!cat||!PEOPLE.some(p=>p.id===e.actor))return false;seen.add(e.id);return category==='all'||cat===category});let rows=PEOPLE.map(p=>{let es=events.filter(e=>e.actor===p.id);return {id:p.id,total:es.length,entities:new Set(es.map(e=>e.entity+':'+e.entity_id)).size,last:es[0]?.at||null,counts:Object.fromEntries(['branches','verification','locations','criteria'].map(k=>[k,es.filter(e=>eventCategory(e)===k).length]))}}).sort((a,b)=>b.total-a.total||a.id.localeCompare(b.id));return {rows,events,total:events.length}}
window.addEventListener('storage',e=>{if(e.key!==STORAGE_KEY||!e.newValue)return;let incoming;try{incoming=JSON.parse(e.newValue)}catch{return}if(incoming.industry!==Y.industry||incoming.ownBrandId!==Y.ownBrandId||incoming.supplyScope!==Y.supplyScope)return;for(let k of ['criteria','pois','targets','events','read'])if(Object.hasOwn(incoming,k))Y[k]=k==='criteria'?normalizeCriteria(incoming[k],{existing:true}):incoming[k];render();notify(tr('ข้อมูลทีมอัปเดตจากอีกแท็บแล้ว','Workspace data updated from another tab'))});
