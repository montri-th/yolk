/* Analytical map values and direct source brand composition. No child-grain aggregation, criteria mutation or viewport cohort. */
(function(global){
 'use strict';
 // Exact native LDS 0.9.7 projections; checked against the pinned reference bytes.
 const palettes=Object.freeze({
  "count":Object.freeze(["#F4F0E7","#EEEDE5","#E8EBE3","#E3E8E1","#DDE5DF","#D7E3DD","#D1E0DB","#CBDDD9","#C5DAD7","#C0D8D6","#BAD5D4","#B4D2D2","#AED0D0","#A8CDCE","#A2CACC","#9CC8CA","#96C5C8","#90C2C6","#8ABFC4","#83BDC2","#7DBAC0","#78B3BC","#73ADB8","#6EA7B4","#69A0B0","#649AAC","#5F93A8","#5A8DA4","#5587A0","#50809C","#4C7A98","#477494","#436E90","#3E688C","#3A6288","#355C84","#315680","#2D507C","#294A78","#254474","#213E70"]),
  "density.area":Object.freeze(["#FFF1D9","#FEEED2","#FDEACA","#FCE7C3","#FAE3BC","#F9E0B5","#F8DCAD","#F7D9A6","#F6D59E","#F4D297","#F3CF8F","#F2CB87","#F1C87F","#EFC477","#EEC06F","#EDBD66","#EBB95D","#EAB653","#E9B249","#E7AF3D","#E6AB30","#E5A72E","#E5A42D","#E4A02B","#E49D2A","#E39928","#E29526","#E29225","#E18E23","#E08A21","#DF8720","#DF831E","#DE7F1C","#DD7B1A","#DC7818","#DB7417","#DA7015","#D96C13","#D86811","#D7640E","#D6600C"]),
  "density.capita":Object.freeze(["#FFF0ED","#FFECE7","#FEE8E1","#FEE4DB","#FEE0D5","#FDDCCF","#FDD8CA","#FCD4C4","#FCD0BE","#FBCCB8","#FBC8B2","#FAC4AC","#F9C0A6","#F9BCA0","#F8B89A","#F7B494","#F6B08E","#F6AC88","#F5A882","#F4A47C","#F3A076","#F09B75","#ED9575","#EB9074","#E88B73","#E58572","#E28072","#DF7A71","#DC7570","#D96F6F","#D66A6E","#D3646D","#D05F6C","#CD596B","#CA536A","#C74D69","#C44768","#C14167","#BD3A65","#BA3364","#B72B63"]),
  "built":Object.freeze(["#FFF5D8","#FFF2D5","#FEEFD1","#FEECCE","#FDEACA","#FDE7C7","#FCE4C3","#FBE1C0","#FBDEBC","#FADBB9","#FAD8B5","#F9D6B2","#F9D3AF","#F8D0AB","#F7CDA8","#F7CAA4","#F6C7A1","#F5C59D","#F4C29A","#F4BF96","#F3BC93","#F0BB8E","#EEB989","#EBB884","#E8B77F","#E6B57A","#E3B475","#E0B370","#DEB16A","#DBB065","#D9AE5F","#D6AD59","#D3AC53","#D1AA4D","#CEA946","#CCA73F","#C9A638","#C7A42F","#C4A325","#C2A118","#BFA000"]),
  "li.market_share":Object.freeze(["#F0F4F9","#ECF1F5","#E7EEF0","#E3EBEC","#DFE8E8","#DAE6E4","#D6E3E0","#D2E0DB","#CEDDD7","#C9DAD3","#C5D7CF","#C1D4CB","#BDD2C7","#B8CFC2","#B4CCBE","#B0C9BA","#ACC6B6","#A8C3B2","#A3C1AE","#9FBEAA","#9BBBA6","#97B9A9","#93B7AC","#8FB5AF","#8BB3B2","#87B1B4","#83AFB7","#7FADBA","#7BABBC","#78A9BF","#74A6C1","#70A4C4","#6CA2C6","#68A0C9","#649DCB","#609BCD","#5B99CF","#5796D2","#5394D4","#4F92D6","#4B8FD8"]),
  "price":Object.freeze(["#F4F4DD","#EEF2DC","#E8EFDA","#E2EDD9","#DCEBD8","#D6E8D6","#D0E6D5","#C9E3D4","#C3E1D2","#BDDFD1","#B7DCD0","#B0DACE","#AAD7CD","#A4D5CC","#9DD3CA","#97D0C9","#90CEC8","#89CBC6","#82C9C5","#7BC6C3","#74C4C2","#70BFBC","#6CBBB7","#68B6B1","#63B2AC","#5FADA6","#5BA9A1","#57A59B","#53A096","#4F9C91","#4B978B","#479386","#438F81","#3F8B7C","#3B8676","#368271","#327E6C","#2E7A67","#2A7562","#25715D","#216D58"])
 });
 const scaleSource=Object.freeze({dsVersion:'0.9.7',releaseRef:'v0.9.7-owner.1',colorSetId:'color-srgb-10',themePolicy:'identical-light-values-on-both-themes',fillOpacity:1,baseDocumentSha256:'d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96',profileSha256:'5d4856041709735d3a04d4a510a88b551df86c211fdcab8a0707e8fe7c9efc3b',lutSource:'reference/lds-0.9.7/color-srgb-10.scales.json',lutSourceSha256:'dc804436c080b5be9125417cacb258b898a679c31f1481973a61f8e8cca4e305',lutSampleCount:41,consumption:'exact native 41-sample LUT; no interpolation, recolouring or inversion'});
 // Forty fixed national boundaries produce all41 native LUT classes.
 const percentilePoints=Object.freeze(Array.from({length:40},(_,i)=>(i+1)*100/41));
 const tierScaleId='yolk.owner-fried-egg-tiers.v1.7.3';
 const normalState=s=>({kind:s?.kind==='supply'?'supply':'demand',metric:s?.metric||(s?.kind==='supply'?'count':'tier'),relation:s?.metric==='share'?'own':['own','competitor','total'].includes(s?.relation)?s.relation:'own'});
 const validCount=n=>Number.isInteger(n)&&n>=0;
 const finiteValue=n=>Number.isFinite(n)&&n>=0;
 const catalog=()=>typeof METRIC_INDEX==='undefined'?{}:METRIC_INDEX;
 const denominator=id=>global.YolkRelativeSupply?.catalog?.find(item=>item.id===id)||null;
 const roles={own:['สาขาเรา','Our stores'],competitor:['สาขาคู่แข่ง','Competitor stores'],total:['สาขาที่ระบุผู้ให้บริการได้ (เรา + คู่แข่ง)','Identified providers (own + competitors)']};
 function metricScale(m){
  const d=m?.display?.denominator;
  if(d==='land_area_km2'||m?.id?.endsWith('_per_km2'))return 'density.area';
  if(d==='direct_population_count'||d==='fiscal.population'||m?.id?.endsWith('_per_person'))return 'density.capita';
  if(m?.id==='gfa')return 'built';
  if(m?.unitEn?.includes('THB')||m?.id?.startsWith('fiscal_'))return 'price';
  return 'count';
 }
 function metadata(state,criteria){
  const s=normalState(state),base={...s,numeratorUnitTh:'รายการสาขา',numeratorUnitEn:'branch records',denominatorId:null,denominatorUnit:null,denominatorUnitTh:null,denominatorUnitEn:null,normalization:1,scaleReuse:false,unitTh:'รายการสาขา',unitEn:'branch records',scaleId:'count',sourcePeriod:null};
  if(s.kind==='demand'&&s.metric==='tier')return {...base,metricLabelTh:'ระดับไข่แดงจาก Demand ที่ยืนยันว่าผ่าน',metricLabelEn:'Confirmed Demand-proxy tier',unitTh:'Tier (ความแรงของเกณฑ์คัด)',unitEn:'Tier (screening strength)',numeratorUnitTh:null,numeratorUnitEn:null,scaleId:tierScaleId,colorEncoding:'ordinal-category',categoryRecipe:global.YolkTierStyle?.source||null,meaningTh:'ไม่จำกัดด้วยรูปแบบทำเลที่เลือกหรือ Tier สูงสุด และไม่ใช่ยอดซื้อที่วัดจริง',meaningEn:'Independent of preferred patterns and maximum tier; not measured purchases'};
  if(s.kind==='demand'){
   const m=catalog()[s.metric],d=m?.display||{},scaleId=metricScale(m);
   return {...base,metricLabelTh:m?.th||s.metric,metricLabelEn:m?.en||s.metric,unitTh:m?.unitTh||'',unitEn:m?.unitEn||'',numeratorUnitTh:null,numeratorUnitEn:null,denominatorId:d.denominator||null,scaleId,sourcePeriod:d.sourcePeriod??null,metricDefinition:m||null,meaningTh:d.meaningTH||'บริบทต้นทาง ไม่ใช่ยอดซื้อที่วัดจริง',meaningEn:d.meaningEN||'Source context, not measured purchases'};
  }
  if(s.metric==='share')return {...base,metricLabelTh:'สัดส่วนสาขาเราในแบรนด์ที่ทราบ',metricLabelEn:'Our share of identified branch inventory',unitTh:'% ของสาขาที่ทราบแบรนด์',unitEn:'% of identified branch inventory',numeratorUnitTh:'สาขาเรา',numeratorUnitEn:'our branches',denominatorId:'identified_branch_inventory',denominatorUnit:'branch records',denominatorUnitTh:'สาขาเรา + คู่แข่งที่ทราบแบรนด์',denominatorUnitEn:'our + identified competitor branches',normalization:100,scaleId:'li.market_share',scaleReuse:true,identifiedOnly:true,meaningTh:'สาขาเรา ÷ (สาขาเรา + คู่แข่งที่ทราบแบรนด์) × 100 ไม่รวม U ไม่ใช่ส่วนแบ่งยอดขาย; ข้อมูลขอบเขตหรือใบอนุญาตไม่ชัดจะแสดงช่วงรอตรวจ',meaningEn:'Own / (own + identified competitors) × 100, excluding U; an outlet-inventory proxy, not sales market share. Assignment or scope uncertainty remains a review interval.'};
  const label=roles[s.relation],excluded=s.relation==='total';
  const meaning={meaningTh:excluded?'รวมเฉพาะเราและคู่แข่งที่ระบุผู้ให้บริการได้ ไม่รวม U ที่ยังไม่ทราบผู้ให้บริการ ไม่ยืนยันการเปิดบริการ':'แสดงช่วงความเป็นไปได้เมื่อ U หรือการผูกพื้นที่ยังไม่ชัด ไม่ยืนยันการเปิดบริการ',meaningEn:excluded?'Own plus identified competitors, excluding unidentified U; operations unverified':'Bounds retain unknown providers and assignment uncertainty; operations unverified',identifiedOnly:excluded};
  if(s.metric==='area')return {...base,...meaning,metricLabelTh:label[0]+' ต่อพื้นที่',metricLabelEn:label[1]+' per land area',unitTh:'รายการสาขา/ตร.กม.',unitEn:'branch records/km²',denominatorId:'areaKm2',denominatorUnit:'km²',denominatorUnitTh:'ตร.กม.',denominatorUnitEn:'km²',scaleId:'density.area'};
  if(s.metric==='market'){
   const item=denominator(criteria?.supplyDenominatorId),person=item?.denominatorUnitEn==='persons',built=item?.id==='gfa';
   return {...base,...meaning,metricLabelTh:label[0]+' เทียบ '+(item?.nameTh||'ตัวหารตลาด'),metricLabelEn:label[1]+' relative to '+(item?.nameEn||'market denominator'),unitTh:item?`รายการสาขาต่อ ${item.unit.toLocaleString('th-TH')} ${item.denominatorUnitTh}`:'ตัวหารไม่พร้อม',unitEn:item?`branch records per ${item.unit.toLocaleString('en-US')} ${item.denominatorUnitEn}`:'Denominator unavailable',denominatorId:criteria?.supplyDenominatorId??null,denominatorUnit:item?.denominatorUnitEn??null,denominatorUnitTh:item?.denominatorUnitTh??null,denominatorUnitEn:item?.denominatorUnitEn??null,normalization:item?.unit??null,scaleId:person?'density.capita':built?'built':'count',scaleReuse:!!item&&!person,sourcePeriod:catalog()[item?.id]?.display?.sourcePeriod??null,denominatorDefinition:catalog()[item?.id]||null};
  }
  return {...base,...meaning,metricLabelTh:'จำนวน'+label[0],metricLabelEn:label[1]+' count'};
 }
 function result(meta,row,patch){return {...meta,id:row?.id??null,lo:null,hi:null,value:null,state:'missing',evidenceState:'missing',exact:false,zero:false,upperOpen:false,percentile:null,denominatorValue:null,unverified:null,sourceState:row?.supply?.state??null,...patch};}
 function supplyInterval(sp,relation){
  if(!sp||['missing','no_data','invalid','suppressed','withheld','not_applicable','out_of_scope','not_yet','source_row_missing'].includes(sp.state))return {state:'missing',reason:sp?.state||'missing_supply',evidenceState:sp?.state||'missing'};
  if(relation==='own'&&sp.ownScopeUnavailable)return {state:'missing',reason:'own_scope_unavailable',evidenceState:'not_applicable'};
  function roleBounds(role){
   if(role==='own'&&sp.ownScopeUnavailable)return null;
   const lo=sp[role+'Lower'],hi=sp[role+'Upper'];
   if(lo!==undefined||hi!==undefined){if(!validCount(lo)||!validCount(hi)||hi<lo)return null;return {lo,hi,bounded:true};}
   return validCount(sp[role])?{lo:sp[role],hi:sp[role],bounded:false}:null;
  }
  if(relation==='total'){
   const own=roleBounds('own'),competitor=roleBounds('competitor');if(!own||!competitor)return {state:'missing',reason:'identified_supply_incomplete'};
   const lo=own.lo+competitor.lo,hi=own.hi+competitor.hi;
   if(!Number.isSafeInteger(lo)||!Number.isSafeInteger(hi))return {state:'missing',reason:'invalid_supply_sum'};
   if(sp.boundsKnown===false)return {lo,hi:null,state:'review',upperOpen:true,reason:'assignment_bound_missing'};
   return {lo,hi,state:lo===hi?'known':'review',reason:lo===hi?'identified_source_sum':'identified_supply_bounds'};
  }
  const bounds=roleBounds(relation);if(!bounds)return {state:'missing',reason:'role_supply_missing_or_invalid'};
  const u=sp.unverified;
  if(sp.boundsKnown===false)return {lo:bounds.lo,hi:null,state:'review',upperOpen:true,reason:'assignment_bound_missing'};
  if(!validCount(u))return {lo:bounds.lo,hi:null,state:'review',upperOpen:true,reason:'unverified_supply_unknown'};
  const hi=bounds.hi+u;if(!Number.isSafeInteger(hi))return {state:'missing',reason:'invalid_supply_sum'};
  return {lo:bounds.lo,hi,state:bounds.lo===hi?'known':'review',reason:u>0?'unverified_provider_allocation':bounds.lo===hi?'source_role_count':'source_assignment_or_reconciliation_bounds'};
 }
 // Identified outlet share never allocates U to either network. Scope/assignment
 // intervals retain conservative ratio bounds; an exact empty denominator is undefined.
 function shareInterval(sp){
  if(!sp||['missing','no_data','invalid','suppressed','withheld','not_applicable','out_of_scope','not_yet','source_row_missing'].includes(sp.state))return {state:'missing',reason:sp?.state||'missing_supply',evidenceState:sp?.state||'missing'};
  if(sp.ownScopeUnavailable)return {state:'missing',reason:'own_scope_unavailable',evidenceState:'not_applicable'};
  const bound=role=>{const bounded=sp[role+'Lower']!==undefined||sp[role+'Upper']!==undefined,lo=bounded?sp[role+'Lower']:sp[role],hi=bounded?sp[role+'Upper']:sp[role];return validCount(lo)&&validCount(hi)&&hi>=lo?{lo,hi}:null;};
  const own=bound('own'),competitor=bound('competitor');if(!own||!competitor)return {state:'missing',reason:'identified_supply_incomplete'};
  if(sp.boundsKnown===false)return {state:'review',lo:0,hi:100,reason:'assignment_bound_missing',denominatorValue:null};
  const maximum=own.hi+competitor.hi;if(!Number.isSafeInteger(maximum))return {state:'missing',reason:'invalid_supply_sum'};
  if(maximum===0)return {state:'missing',reason:'zero_identified_denominator',evidenceState:'undefined_ratio',denominatorValue:0};
  const exact=own.lo===own.hi&&competitor.lo===competitor.hi;
  if(exact){const total=own.lo+competitor.lo,n=100*own.lo/total;return {state:'known',lo:n,hi:n,value:n,exact:true,zero:n===0,denominatorValue:total,reason:'identified_outlet_share'};}
  const lowTotal=own.lo+competitor.hi,highTotal=own.hi+competitor.lo;
  return {state:'review',lo:lowTotal>0?100*own.lo/lowTotal:0,hi:highTotal>0?100*own.hi/highTotal:own.hi===0?0:100,denominatorValue:null,reason:'identified_share_bounds'};
 }
 const sourceIndexes=new WeakMap();
 function sourceIndex(data){if(!data||typeof data!=='object')return null;if(!sourceIndexes.has(data))sourceIndexes.set(data,{rows:new Map((data.rows||[]).map(r=>[r[0],r])),provinces:new Map((data.provinceRows||[]).map(r=>[r[0],r])),provinceIds:new Map(Object.entries(data.provinceContextsById||{}).map(([id,ctx])=>[String(ctx.provinceCode??ctx.code),id]))});return sourceIndexes.get(data);}
 function rawBrandId(id,industry){return industry==='fuel'?String(id||'').toUpperCase().replaceAll('-','_'):String(id||'').split(':').slice(1).join(':')||String(id||'');}
 function brandId(raw,industry){return industry==='fuel'?raw.toLowerCase().replaceAll('_','-'):industry==='grocery'?'grocery-brand:'+raw:'legal:'+raw;}
 function brandBreakdown(scope={},options={}){
  const level=scope.level==='fine'?'location':scope.level||'country',industry=options.industryId,native=options.nativeData,fine=options.fineData,index=sourceIndex(level==='location'?fine:native),ownKey=rawBrandId(options.ownBrandId,industry),scopeId=options.supplyScope||'',grain={country:'COUNTRY',province:'PROVINCE',district:'DISTRICT',location:'SOURCE_REPORTING_UUID'}[level]||null;
  const summary={state:'missing',status:'missing',scope:{...scope,level},geography:{...scope,level},grain,industryId:industry,supplyScope:scopeId,ownBrandId:options.ownBrandId,sourceRows:0,rows:[],own:null,competitor:null,identifiedTotal:null,unknown:null,unclassified:null,sharePercent:null,shareLower:null,shareUpper:null,coverage:{complete:false,basis:'identified_branch_inventory',allProvidersComplete:false,unknownExcluded:true,sourceState:null,assignmentOrReconciliationReview:false},reason:'source_unavailable',sourceMetadata:(level==='location'?fine:native)?.metadata||null};
  if(!grain||!['fuel','grocery','nonbank'].includes(industry)||!ownKey)return {...summary,reason:'unsupported_context'};
  let raw,context={};
  if(level==='country'&&native?.countryDimensionCounts&&native.metadata?.coverage?.missing===0)raw=['country','source_row_present',native.countryDimensionCounts,native.countryTotal,'native_country_dimension_counts'];
  else if(level==='province'){const id=index?.provinceIds.get(String(scope.provinceCode));raw=index?.provinces.get(id);context=native?.provinceContextsById?.[id]||{};}
  else if(level==='district'){raw=index?.rows.get(scope.districtId);context=native?.contextsById?.[scope.districtId]||{};}
  else if(level==='location'){raw=index?.rows.get(scope.areaId);context={provinceCode:scope.provinceCode};}
  if(!raw)return summary;
  summary.sourceRows=1;summary.coverage.sourceState=raw[1];summary.sourceKey=raw[4];summary.sourceRowId=raw[0];summary.sourceContext=context;
  if(raw[1]!=='source_row_present'||!raw[2]||Array.isArray(raw[2]))return {...summary,state:raw[1]==='suppressed'||raw[1]==='withheld'?'suppressed':'missing',status:raw[1]||'missing',reason:raw[1]||'missing_dimensions'};
  const brands=new Map((fine?.brands||options.brands||[]).map(b=>[b.rawId||rawBrandId(b.id,industry),b]));
  let own=0,competitor=0,unknown=0,unclassified=0,excluded=0;
  for(const [dimension,count]of Object.entries(raw[2])){
   if(!Number.isSafeInteger(count)||count<0)return {...summary,reason:'invalid_dimension_count'};
   let key=dimension;
   if(industry==='grocery'){const split=dimension.indexOf(':');if(split<0||dimension.slice(0,split)!==scopeId){excluded+=count;continue;}key=dimension.slice(split+1);}
   if(key==='UNKNOWN'){unknown+=count;continue;}
   const membership=industry==='nonbank'&&scopeId!=='office_context'?options.scopeIncludes?.(key)??null:true;
   if(membership===false){excluded+=count;continue;}
   if(membership===null){unclassified+=count;continue;}
   const party=key===ownKey?'own':'competitor',brand=brands.get(key);
   if(party==='own')own+=count;else competitor+=count;
   if(count>0)summary.rows.push({brandId:brand?.id||brandId(key,industry),name:brand?.name||key,count,party,sharePercent:null});
  }
  if(![own,competitor,unknown,unclassified,excluded,own+competitor].every(Number.isSafeInteger))return {...summary,rows:[],reason:'invalid_dimension_sum'};
  summary.rows.sort((a,b)=>b.count-a.count||a.brandId.localeCompare(b.brandId));
  let supply={own,competitor,unverified:unknown,ownLower:own,ownUpper:own,competitorLower:competitor,competitorUpper:competitor+unclassified,state:'direct_source_inventory',boundsKnown:true};
  if(level==='location'){
   const supplied=options.fineRows?.get?.(scope.areaId)||options.fineRows?.find?.(a=>a.id===scope.areaId);
   if(supplied?.supply)supply={...supply,...supplied.supply};
   else if(options.supplyForRow)supply=options.supplyForRow(raw,{province:scope.provinceCode});
   else if(industry==='nonbank'||industry==='grocery'&&scopeId==='C_STORE'&&['30','84'].includes(String(scope.provinceCode)))supply.boundsKnown=false;
  }else if(level==='district'&&native.assignmentBoundsById?.[raw[0]]){
   for(const [key,n]of Object.entries(native.assignmentBoundsById[raw[0]])){if(!Number.isSafeInteger(n)||n<0){supply.boundsKnown=false;continue;}if(key===ownKey)supply.ownUpper+=n;else if(options.scopeIncludes?.(key)!==false)supply.competitorUpper+=n;}
  }
  if(options.ownScopeAvailable!==undefined&&options.ownScopeAvailable!==true||industry==='nonbank'&&scopeId!=='office_context'&&options.scopeIncludes?.(ownKey)!==true)supply.ownScopeUnavailable=true;
  const ratio=shareInterval(supply),countRange=supplyInterval(supply,'total');
  const review=ratio.state==='review',exactCounts=countRange.state==='known';
  summary.own=own;summary.competitor=competitor;summary.identifiedTotal=own+competitor;summary.unknown=unknown;summary.unclassified=unclassified;summary.excluded=excluded;summary.sourceTotal=raw[3];summary.supply=supply;summary.contextMetrics=context.metrics||{};
  summary.state=ratio.evidenceState==='not_applicable'?'not_applicable':ratio.state==='missing'&&ratio.reason==='zero_identified_denominator'&&exactCounts?'known':ratio.state;summary.status=ratio.reason==='zero_identified_denominator'?'empty':summary.state;summary.reason=ratio.reason;summary.sharePercent=ratio.exact?ratio.value:null;summary.shareLower=ratio.lo??null;summary.shareUpper=ratio.hi??null;
  summary.coverage={...summary.coverage,complete:exactCounts&&!review&&!supply.ownScopeUnavailable,allProvidersComplete:unknown===0&&unclassified===0&&exactCounts,assignmentOrReconciliationReview:review,unclassifiedScopeCount:unclassified};
  if(summary.coverage.complete&&summary.identifiedTotal>0)for(const r of summary.rows)r.sharePercent=100*r.count/summary.identifiedTotal;
  return summary;
 }
 function percentile(v,sorted){
  if(!finiteValue(v)||!sorted?.length)return null;if(sorted.length===1)return 50;
  let lo=0,hi=sorted.length;while(lo<hi){const mid=(lo+hi)>>1;if(sorted[mid]<v)lo=mid+1;else hi=mid;}const lower=lo;
  lo=0;hi=sorted.length;while(lo<hi){const mid=(lo+hi)>>1;if(sorted[mid]<=v)lo=mid+1;else hi=mid;}
  return 100*(lower+.5*Math.max(0,lo-lower-1))/(sorted.length-1);
 }
 function rowValue(row,s,criteria,meta){
  if(s.kind==='demand'&&s.metric==='tier'){
   if(row?.demand===true&&[1,2,3].includes(row.qualifyingTier))return result(meta,row,{lo:row.qualifyingTier,hi:row.qualifyingTier,value:row.qualifyingTier,state:'known',evidenceState:'proxy',exact:true,reason:'confirmed_demand_tier'});
   return result(meta,row,{state:row?.demand===false?'known':'review',evidenceState:row?.demand===false?'not_qualified':'unverified',reason:row?.demand===false?'no_confirmed_demand_tier':'demand_tier_unconfirmed'});
  }
  if(s.kind==='demand'){
   const metric=catalog()[s.metric],info=row?.metricStates?.[s.metric],sourceState=typeof info==='string'?info:info?.state,n=row?.metrics?.[s.metric];
   if(!metric?.ready)return result(meta,row,{reason:'unsupported_metric',sourceState:sourceState||null});
   if(sourceState&&(['missing','no_data','suppressed','withheld','not_applicable','not-applicable','out_of_scope','not_yet','invalid','source_row_missing','selected_period_missing'].includes(sourceState)||sourceState.startsWith('missing_')))return result(meta,row,{reason:sourceState,evidenceState:sourceState,sourceState});
   if(!finiteValue(n))return result(meta,row,{reason:sourceState||'missing_metric',evidenceState:sourceState||'missing',sourceState:sourceState||null});
   let nationalPercentile=null;
   if(typeof AREA_INDEX!=='undefined'&&AREA_INDEX.has(row?.id)&&typeof DISTRIBUTIONS!=='undefined')nationalPercentile=percentile(n,DISTRIBUTIONS[s.metric]);
   return result(meta,row,{lo:n,hi:n,value:n,state:'known',evidenceState:n===0?'observed_zero':metric.measurement||'source_context',exact:true,zero:n===0,percentile:nationalPercentile,sourceState:sourceState||null,reason:n===0?'observed_zero':'source_metric'});
  }
  if(s.metric==='share'){const ratio=shareInterval(row?.supply),u=row?.supply?.unverified;return result(meta,row,{...ratio,unverified:validCount(u)?u:null,evidenceState:ratio.state==='review'?'unverified':ratio.evidenceState||ratio.state,sourceState:row?.supply?.state??null});}
  if(!['count','area','market'].includes(s.metric))return result(meta,row,{reason:'unsupported_supply_metric'});
  const counts=supplyInterval(row?.supply,s.relation),u=row?.supply?.unverified;
  let r=result(meta,row,{...counts,unverified:validCount(u)?u:null,evidenceState:counts.state==='review'?'unverified':counts.evidenceState||counts.state});
  if(counts.state==='missing')return r;
  if(s.metric!=='count'){
   const item=s.metric==='market'?denominator(criteria?.supplyDenominatorId):null;
   if(s.metric==='market'&&!item)return {...r,state:'missing',evidenceState:'missing',lo:null,hi:null,reason:'unsupported_denominator'};
   const d=s.metric==='area'?row?.areaKm2:row?.metrics?.[item.id],denominatorInfo=s.metric==='market'?row?.metricStates?.[item.id]:null,denominatorState=typeof denominatorInfo==='string'?denominatorInfo:denominatorInfo?.state;
   const unavailableDenominator=['missing','no_data','suppressed','withheld','not_applicable','not-applicable','out_of_scope','not_yet','invalid','selected_period_missing','source_row_missing'].includes(denominatorState)||denominatorState?.startsWith('missing_');
   if(!Number.isFinite(d)||d<=0||unavailableDenominator)return {...r,state:'missing',evidenceState:denominatorState||'missing',lo:null,hi:null,denominatorValue:unavailableDenominator?null:Number.isFinite(d)?d:null,reason:denominatorState||(!Number.isFinite(d)?'missing_denominator':'nonpositive_denominator')};
   r={...r,lo:(r.lo/d)*meta.normalization,hi:r.hi===null?null:(r.hi/d)*meta.normalization,denominatorValue:d};
   if(!finiteValue(r.lo)||(r.hi!==null&&!finiteValue(r.hi)))return {...r,lo:null,hi:null,state:'missing',evidenceState:'invalid',reason:'invalid_rate'};
  }
  const exact=r.state==='known'&&r.hi!==null&&r.lo===r.hi;
  return {...r,exact,value:exact?r.lo:null,zero:exact&&r.lo===0,evidenceState:exact&&r.lo===0?'observed_zero':r.evidenceState};
 }
 function value(row,state,criteria){const s=normalState(state);return rowValue(row,s,criteria,metadata(s,criteria));}
 function quantile(sorted,p){if(!sorted.length)return null;const n=(sorted.length-1)*p/100,k=Math.floor(n);return sorted[k]+(sorted[Math.min(k+1,sorted.length-1)]-sorted[k])*(n-k);}
 const format=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:5}).format(n);
 function prepare(rows,state,criteria,options={}){
  const s=normalState(state),meta=metadata(s,criteria),input=Array.isArray(rows)?rows:[],records=new Map(input.map(row=>[row.id,rowValue(row,s,criteria,meta)]));
  const fine=typeof AREAS==='undefined'?[]:AREAS,fineIds=typeof AREA_INDEX==='undefined'?new Set(fine.map(a=>a.id)):AREA_INDEX,allFine=input.every(row=>fineIds.has(row.id));
  const national=Array.isArray(options.cohortRows)?options.cohortRows:allFine?(input.length===fine.length?input:fine):[];
  const cohortId=options.cohortId||(allFine?'national_7954':'national_cohort_unavailable');
  const values=national===input?[...records.values()]:national.map(row=>rowValue(row,s,criteria,meta)),known=values.filter(r=>r.exact&&finiteValue(r.value)).map(r=>r.value).sort((a,b)=>a-b);
  const tier=s.kind==='demand'&&s.metric==='tier',share=s.kind==='supply'&&s.metric==='share',cuts=tier?[]:share?percentilePoints.slice():percentilePoints.map(p=>quantile(known,p));
  const palette=tier?[3,2,1].map(t=>global.YolkTierStyle?.color(t)||null):palettes[meta.scaleId],available=tier?!!global.YolkTierStyle:share?true:(known.length>0&&national.length>0);
  for(const r of records.values()){
   let index=null;
   if(r.exact&&available){if(tier)index=3-r.value;else index=share?Math.min(40,Math.floor(r.value*41/100)):r.zero?0:cuts.reduce((n,cut)=>n+(r.value>=cut?1:0),0);}
   r.classIndex=index;r.color=index===null?null:palette[index];r.fillOpacity=index===null?null:1;
   if(tier&&index!==null){r.paint=global.YolkTierStyle.paint(r.value);r.css=global.YolkTierStyle.css(r.value);r.labelTh=global.YolkTierStyle.label?.(r.value,'th')||global.YolkTierStyle.definition(r.value)?.labelTh||'Tier '+r.value;r.labelEn=global.YolkTierStyle.label?.(r.value,'en')||global.YolkTierStyle.definition(r.value)?.labelEn||'Tier '+r.value;}
   if(!tier&&!share&&r.exact&&available)r.percentile=percentile(r.value,known);
   r.classificationState=index!==null?'classified':r.state==='review'?'review':r.exact&&!available?'missing_national_cohort':r.evidenceState;
  }
  const legend=tier?[3,2,1].map((n,i)=>({classIndex:i,color:palette[i],paint:global.YolkTierStyle?.paint(n)||null,css:global.YolkTierStyle?.css(n)||null,tier:n,labelTh:global.YolkTierStyle?.label?.(n,'th')||global.YolkTierStyle?.definition(n)?.labelTh||'Tier '+n,labelEn:global.YolkTierStyle?.label?.(n,'en')||global.YolkTierStyle?.definition(n)?.labelEn||'Tier '+n,unitTh:meta.unitTh,unitEn:meta.unitEn,fillOpacity:1})):
   palette.map((color,i)=>{const last=i===palette.length-1,lower=i===0?0:cuts[i-1],upper=last?(share?100:null):cuts[i],zeroOnly=available&&i===0&&upper===0,excludeZero=i>0&&lower===0,range=available?(zeroOnly?'0':last?(share?'≥ '+format(lower)+' – ≤ 100':excludeZero?'> 0':'≥ '+format(lower)):(excludeZero?'> 0':'≥ '+format(lower))+' – < '+format(upper)):'—';return {classIndex:i,color,lower,upper,lowerInclusive:!excludeZero,upperInclusive:share&&last,zeroIncluded:i===0,zeroOnly,zeroCue:i===0?'observed_zero':null,empty:available&&!last&&lower===upper&&!zeroOnly,labelTh:range+(i===0?' · รวมค่าศูนย์ที่ทราบ':''),labelEn:range+(i===0?' · includes known zero':''),unitTh:meta.unitTh,unitEn:meta.unitEn,percentileLower:share?null:i===0?0:percentilePoints[i-1],percentileUpper:share?null:last?100:percentilePoints[i],fillOpacity:1};});
  return {records,palette,legend,cutoffs:cuts,percentilePoints:tier||share?[]:percentilePoints.slice(),cohort:{id:cohortId,total:national.length,exact:known.length,review:values.filter(r=>r.state==='review').length,missing:values.filter(r=>r.state==='missing').length,zero:values.filter(r=>r.zero).length,state:available?'available':'missing',scope:share?'fixed_percent_domain':'fixed_national_same_geographic_grain',viewportRecalibration:false},metadata:{...meta,...scaleSource,...(share?{lutSource:'reference/lds-0.9.7/location-intelligence-0.9.7.json',lutSourceSha256:'2940c5aac3eef1242e501492b5315048c6b5f138496e8139cc116bfbba945e57',scaleVersion:'e18af290eee81d42e63269c261628f0fa108fcd48e5cbff02b407af95a712e51',domain:[0,100]}:{}),classCount:tier?3:41,lutSampleCount:tier?null:41,quantileBoundaryCount:tier||share?0:40,classificationMethod:tier?'confirmed_proxy_tier_owner_categories':share?'fixed_0_100_percent_41_equal_width_classes':'national_exact_comparable_41_quantile_classes',quantileFormula:tier||share?null:'P(i*100/41), i=1…40; linear empirical quantiles of all known exact comparable national values including zero',intervalPolicy:share?'41 equal-width percentage bins; lower inclusive, upper exclusive except 100 inclusive in final bin; known zero class0':'lower inclusive, upper exclusive; tied cuts can create empty bins; final end-bin; observed zero always class0 with an explicit cue',uncertainColorPolicy:'neutral; expose range, never colour an interval as exact',outlierPolicy:tier?'not applicable to named categories':share?'bounded percentage domain 0–100; no quantile clipping':'declared end-bin at or above national P(4000/41) ≈ P97.560976',sourceTruth:'Source-reported inventory and demand proxies; no measured purchases, legal boundary or operating-status certification'}};
 }

 // EVID-05 presentation is separate from numerical classification. A failed
 // Demand cutoff is a known category, never a measured zero or missing count.
 // These neutral tokens are copied exactly from the pinned standalone base;
 // analytical LUT fills and owner tier paints above are never transformed.
 const evidenceTokens=Object.freeze({
  light:Object.freeze({zero:'#7D877F',noData:'#D5DAD6',border:'#7D877F',soft:'#E5E9E6',metadata:'#5C6A61',pendingFill:'#F3EEDB',pendingInk:'#5C6A61'}),
  dark:Object.freeze({zero:'#93A398',noData:'#404844',border:'#7C8A84',soft:'#2B3534',metadata:'#A6B5B1',pendingFill:'#2C2A22',pendingInk:'#D8CFB2'})
 });
 const evidenceKinds=Object.freeze({
  value:Object.freeze({key:'value',labelTh:'ค่าตามต้นทาง',labelEn:'Source value',glyph:'',pattern:null}),
  known_zero:Object.freeze({key:'known_zero',labelTh:'0 · ศูนย์ตามต้นทาง',labelEn:'0 · Source-reported zero',glyph:'0',pattern:null}),
  below_criteria:Object.freeze({key:'below_criteria',labelTh:'ต่ำกว่าเกณฑ์ไข่แดง',labelEn:'Below Yolk criteria',glyph:'',pattern:null}),
  no_data:Object.freeze({key:'no_data',labelTh:'ไม่มีข้อมูล',labelEn:'No data',glyph:'—',pattern:'135deg hatch'}),
  review:Object.freeze({key:'review',labelTh:'ข้อมูลรอตรวจ',labelEn:'Evidence needs review',glyph:'?',pattern:'dotted outline'}),
  suppressed:Object.freeze({key:'suppressed',labelTh:'ปิดค่า',labelEn:'Suppressed',glyph:'',pattern:'dashed outline'}),
  out_of_scope:Object.freeze({key:'out_of_scope',labelTh:'นอกขอบเขตข้อมูล',labelEn:'Out of scope',glyph:'',pattern:null}),
  not_yet:Object.freeze({key:'not_yet',labelTh:'ยังไม่ถึงรอบข้อมูล',labelEn:'Not yet available',glyph:'…',pattern:'dotted outline'}),
  undefined_ratio:Object.freeze({key:'undefined_ratio',labelTh:'ฐานเป็น 0 · คำนวณ % ไม่ได้',labelEn:'Base is 0 · percentage undefined',glyph:'—',pattern:'135deg hatch'}),
  unclassified:Object.freeze({key:'unclassified',labelTh:'ค่าสีเทียบประเทศยังไม่พร้อม',labelEn:'National colour comparison unavailable',glyph:'—',pattern:'dashed outline'})
 });
 function evidenceCue(record,state){
  const source=record?.evidenceState||record?.sourceState||record?.reason||'',reason=record?.reason||'',s=normalState(state||record);
  let key='no_data';
  if(['suppressed','withheld'].includes(source))key='suppressed';
  else if(['out_of_scope','not_applicable','not-applicable'].includes(source)||reason==='own_scope_unavailable')key='out_of_scope';
  else if(['not_yet','not-yet'].includes(source))key='not_yet';
  else if(reason==='zero_identified_denominator')key='undefined_ratio';
  else if(s.kind==='demand'&&s.metric==='tier'&&(source==='not_qualified'||reason==='no_confirmed_demand_tier'))key='below_criteria';
  else if(record?.state==='review')key='review';
  else if(record?.exact===true&&Number.isFinite(record.value))key=record.value===0&&record.zero===true?'known_zero':record.classificationState==='missing_national_cohort'?'unclassified':'value';
  return evidenceKinds[key];
 }
 function styleForEvidence(record,state,options={}){
  const cue=evidenceCue(record,state),theme=options.theme==='dark'?'dark':'light',tokens=evidenceTokens[theme],allowed=options.allowFill!==false,baseWeight=Number.isFinite(options.baseWeight)?options.baseWeight:0.3;
  const style={color:tokens.border,weight:baseWeight,opacity:1,fill:allowed,fillOpacity:1,fillColor:record?.paint||record?.color||tokens.soft,dashArray:null};
  if(cue.key==='known_zero'){style.color=tokens.zero;style.weight=2;}
  else if(['no_data','undefined_ratio'].includes(cue.key)){style.fillColor='url(#yolk-map-no-data-'+theme+')';style.weight=Math.max(baseWeight,0.85);}
  else if(cue.key==='suppressed'){style.fillColor=tokens.soft;style.weight=Math.max(baseWeight,1);style.dashArray='6 4';}
  else if(cue.key==='not_yet'){style.fillColor=tokens.pendingFill;style.color=tokens.pendingInk;style.weight=Math.max(baseWeight,1.2);style.dashArray='1 4';style.lineCap='round';}
  else if(cue.key==='review'){style.fillColor=tokens.soft;style.weight=Math.max(baseWeight,1.2);style.dashArray='1 4';style.lineCap='round';}
  else if(['below_criteria','out_of_scope','unclassified'].includes(cue.key)){style.fill=false;if(cue.key==='unclassified')style.dashArray='6 4';}
  return style;
 }
 function ensureEvidencePatterns(container){
  if(!container?.querySelectorAll||!global.document?.createElementNS)return 0;
  const ns='http://www.w3.org/2000/svg';let added=0;
  for(const svg of container.querySelectorAll('svg.leaflet-zoom-animated')){
   let defs=svg.querySelector('defs[data-yolk-evidence-patterns]');if(defs)continue;
   defs=global.document.createElementNS(ns,'defs');defs.setAttribute('data-yolk-evidence-patterns','EVID-05');
   for(const theme of ['light','dark']){
    const tokens=evidenceTokens[theme],pattern=global.document.createElementNS(ns,'pattern');
    for(const [name,value]of Object.entries({id:'yolk-map-no-data-'+theme,width:8,height:8,patternUnits:'userSpaceOnUse',patternTransform:'rotate(135)'}))pattern.setAttribute(name,String(value));
    const rect=global.document.createElementNS(ns,'rect');for(const [name,value]of Object.entries({width:8,height:8,fill:tokens.noData}))rect.setAttribute(name,String(value));pattern.appendChild(rect);
    const line=global.document.createElementNS(ns,'path');for(const [name,value]of Object.entries({d:'M 0 0 L 0 8',stroke:tokens.border,'stroke-width':1.5}))line.setAttribute(name,String(value));pattern.appendChild(line);defs.appendChild(pattern);
   }
   svg.insertBefore(defs,svg.firstChild);added++;
  }
  return added;
 }
 function evidenceLegend(prepared,options={}){
  const tier=prepared?.metadata?.kind==='demand'&&prepared?.metadata?.metric==='tier',keys=new Set([...prepared?.records?.values?.()||[]].map(r=>evidenceCue(r,prepared?.metadata).key));
  if(tier)keys.add('below_criteria');else keys.add('known_zero');keys.delete('value');
  const order=['known_zero','below_criteria','no_data','review','suppressed','out_of_scope','not_yet','undefined_ratio','unclassified'],escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  return order.filter(key=>keys.has(key)).map(key=>{const cue=evidenceKinds[key];return '<span class="yolk-evidence-legend" data-evidence-cue="'+key+'"><i class="yolk-evidence-swatch yolk-evidence-'+key+'" aria-hidden="true"'+(key==='known_zero'&&prepared?.palette?.[0]?' style="background:'+escape(prepared.palette[0])+'"':'')+'></i><span>'+escape(options.lang==='en'?cue.labelEn:cue.labelTh)+'</span></span>';}).join('');
 }

 global.YolkMapAnalysis=Object.freeze({value,prepare,metadata,brandBreakdown,palettes,scaleSource,percentilePoints,percentile,evidenceCue,styleForEvidence,ensureEvidencePatterns,evidenceLegend,evidenceTokens});
})(window);
