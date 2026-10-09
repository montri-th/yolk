/* View criteria, not a new source aggregate. Missing/zero denominators remain unknown. */
(function(global){
 'use strict';
 const allowed=[['gfa',100000,'ตร.ม.','m²'],['population',10000,'คน','persons'],['working_age_15_64',10000,'คน','persons'],['adult_population_20_64',10000,'คน','persons'],['factory_workers',10000,'คน','persons'],['hotel_rooms',1000,'ห้อง','rooms']];
 const catalog=allowed.filter(([id])=>METRIC_INDEX[id]?.ready).map(([id,unit,denominatorUnitTh,denominatorUnitEn])=>Object.freeze({id,unit,nameTh:METRIC_INDEX[id].th,nameEn:METRIC_INDEX[id].en,denominatorUnitTh,denominatorUnitEn}));
 const byId=new Map(catalog.map(item=>[item.id,item]));
 function unitLabel(metricId,lang='th'){const item=byId.get(metricId);if(!item)return lang==='en'?'Unknown denominator':'ตัวหารยังไม่ทราบ';const units=item.unit.toLocaleString(lang==='en'?'en-US':'th-TH');return lang==='en'?`branches per ${units} ${item.denominatorUnitEn} · ${item.nameEn}`:`สาขาต่อ ${units} ${item.denominatorUnitTh} · ${item.nameTh}`;}
 function defaultMetric(c){return (c?.industry||Y.industry)==='fuel'?'gfa':'population';}
 function countThresholds(area,c){
  if(c?.supplyMode!=='relative')return {valid:Number.isFinite(c?.ownMany)&&c.ownMany>0&&Number.isFinite(c?.competitorMany)&&c.competitorMany>0,mode:'count',metricId:null,denominator:null,unit:null,own:c?.ownMany,competitor:c?.competitorMany,state:'count'};
  const item=byId.get(c.supplyDenominatorId),raw=area?.metrics?.[item?.id],denominator=Number.isFinite(raw)?raw:null,base={valid:false,mode:'relative',metricId:c.supplyDenominatorId,denominator,unit:item?.unit??null,own:null,competitor:null,ownRateHigh:c.ownRateHigh,competitorRateHigh:c.competitorRateHigh};
  if(!item||![c.ownRateHigh,c.competitorRateHigh].every(n=>Number.isFinite(n)&&n>0))return {...base,state:'invalid_parameters'};
  if(denominator===null)return {...base,state:'missing_denominator'};
  if(denominator<=0)return {...base,state:'nonpositive_denominator'};
  const own=c.ownRateHigh*(denominator/item.unit),competitor=c.competitorRateHigh*(denominator/item.unit);
  if(![own,competitor].every(n=>Number.isFinite(n)&&n>0))return {...base,state:'invalid_count_equivalent'};
  return {...base,valid:true,own,competitor,state:'known_positive_denominator'};
 }
 const median=values=>{const sorted=[...values].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;};
 function seedCriteria(c,metricId){
  const next=structuredClone(c),item=byId.get(metricId||defaultMetric(c));if(!item)throw Error('Relative Supply requires an available extensive metric');
  const rates={own:[],competitor:[]},excludedRows={missingOrNonpositiveDenominator:0,uncertainCounts:0};
  for(const area of AREAS){const d=area.metrics[item.id],sp=area.supply;if(!Number.isFinite(d)||d<=0){excludedRows.missingOrNonpositiveDenominator++;continue;}
   const hasBounds=['ownLower','ownUpper','competitorLower','competitorUpper'].some(key=>sp?.[key]!==undefined);
   if(hasBounds||!sp||sp.boundsKnown===false||['missing','invalid','suppressed','not_yet','not_applicable','source_loading'].includes(sp.state)||sp.ownScopeUnavailable||sp.unverified!==0||![sp.own,sp.competitor].every(n=>Number.isInteger(n)&&n>=0)){excludedRows.uncertainCounts++;continue;}
   for(const role of ['own','competitor'])if(sp[role]>0){const rate=(sp[role]/d)*item.unit;if(Number.isFinite(rate)&&rate>0){rates[role].push(rate);}}
  }
  const calibrated=role=>({n:rates[role].length,method:rates[role].length>=5?'median_national_known_positive_exact_rates':'hypothesis_insufficient_sample',threshold:rates[role].length>=5?median(rates[role]):1});
  const own=calibrated('own'),competitor=calibrated('competitor');
  next.supplyMode='relative';next.supplyDenominatorId=item.id;next.ownRateHigh=own.threshold;next.competitorRateHigh=competitor.threshold;
  next.supplyCalibration={schemaVersion:1,metricId:item.id,unit:item.unit,industryId:c.industry||Y.industry,brandId:Y.ownBrandId,scope:Y.supplyScope,nationalUniverse:AREAS.length,minimumSampleN:5,positiveExactOnly:true,intervalRowsExcluded:true,nonzeroOrUnknownUnverifiedExcluded:true,own,competitor,excludedRows,seededAt:new Date().toISOString(),meaning:'Adjustable screening calibration, not measured customer demand or branch capacity'};
  return next;
 }
 global.YolkRelativeSupply=Object.freeze({catalog:Object.freeze(catalog),unitLabel,defaultMetric,countThresholds,seedCriteria});
})(window);
