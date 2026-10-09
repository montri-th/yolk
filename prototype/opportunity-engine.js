/* Strategy survey queues follow Demand evaluation. No source, criteria or rank mutation. */
(function(global){
 'use strict';
 const VERSION='1.9.0';
 const names=[
  ['underserved_market','เติมช่องว่างตลาด','Underserved market','store','P0','มองสาขาน้อยเมื่อเทียบฐานตลาด แล้วตรวจว่ามีบริการตกหล่นหรือไม่','Find low branch provision relative to the market base, then check for omitted providers.'],
  ['segment_gap','เติมช่องว่างของกลุ่มลูกค้า','Segment gap','groups','P1','ตรวจสินค้า ราคา และเวลาที่กลุ่มลูกค้าต้องการ แต่ร้านเดิมยังไม่ตอบ','Investigate an unmet offering, price or opening-time need for a customer group.'],
  ['competitive_entry','ชิงลูกค้าจากคู่แข่ง','Competitive entry','swords','P0','เริ่มสำรวจตลาดที่มีคู่แข่ง และทดสอบเหตุผลที่ลูกค้าจะเลือกเรา','Study an existing competitive market and test why customers would choose us.'],
  ['cluster_participation','เข้าร่วมย่านที่ดึงลูกค้า','Cluster participation','layers','P1','ตรวจกลุ่มร้านที่อยู่ใกล้กันและการมาเลือกซื้อร่วมกัน','Check physically clustered stores and shared or comparison-shopping visits.'],
  ['complementary_location','เกาะกิจกรรมที่ส่งลูกค้าให้กัน','Complementary location','location_on','P0','ใช้กิจกรรมโรงงานหรือโรงแรมเป็นเบาะแส แล้วตรวจจุดและเวลาที่ลูกค้าออกมา','Use factory or hotel activity as an area clue, then verify exits and customer occasions.'],
  ['route_capture','รับลูกค้าบนเส้นทาง','Route capture','explore','P2','ตรวจเส้นทาง ทิศทาง และความสะดวกในการแวะจริง','Verify routes, travel direction and the practical ability to stop.'],
  ['network_infill','เติมเครือข่ายของเรา','Network infill','shield','P0','เริ่มจากสาขาเราที่น้อยเมื่อเทียบฐานตลาด แล้วตรวจพื้นที่บริการและผลต่อร้านเดิม','Start with low own provision relative to the market base, then check coverage and displacement.'],
  ['future_entry','เปิดก่อนเพื่อได้พื้นที่ก่อน','Future entry','flag','P2','ติดตามโครงการอนาคตและต้นทุนการรอ แยกจากไข่แดงปัจจุบัน','Track future projects and holding costs separately from current Yolks.']
 ];
 const factorLabels={
  underserved_market:[['Demand ผ่าน','Qualifying Demand'],['Supply รวมในขอบเขตเดียวกัน','Combined supply in the same source scope'],['ฐานเทียบตลาด','Market-base reference']],
  segment_gap:[['กลุ่มลูกค้า','Customer group'],['สิ่งที่ร้านเสนอ','Store offering'],['โอกาสซื้อและเวลา','Purchase occasion and time']],
  competitive_entry:[['Demand ผ่าน','Qualifying Demand'],['คู่แข่งที่พบ','Observed competitors'],['เหตุผลที่ลูกค้าจะเลือกเรา','Reason customers would choose us']],
  cluster_participation:[['จุดร้านที่อยู่ใกล้กัน','Nearby store coordinates'],['การมาเลือกซื้อร่วมกัน','Shared shopping visits'],['ต้นทุนทำเล','Location costs']],
  complementary_location:[['Demand ผ่าน','Qualifying Demand'],['กิจกรรมต้นทาง','Source activity'],['ทางออกและเวลาซื้อ','Exits and purchase times']],
  route_capture:[['เส้นทางและทิศทาง','Routes and direction'],['เข้าออกได้จริง','Practical access'],['การแวะซื้อ','Stopping and buying']],
  network_infill:[['Demand ผ่าน','Qualifying Demand'],['สาขาเราเทียบฐานตลาด','Own stores relative to market base'],['พื้นที่บริการและผลต่อร้านเดิม','Coverage and displacement']],
  future_entry:[['ความคืบหน้าโครงการ','Project milestones'],['โอกาสได้พื้นที่','Site availability'],['ต้นทุนรอและจุดหยุด','Holding costs and stopping triggers']]
 };
 const pair=(th,en)=>({th,en});
 const META=names.map(([id,th,en,icon,dataPhase,summaryTh,summaryEn],index)=>Object.freeze({id,number:index+1,th,en,name:pair(th,en),summary:pair(summaryTh,summaryEn),icon,dataPhase,p0CandidateSupported:['underserved_market','competitive_entry','complementary_location','network_infill'].includes(id),factors:factorLabels[id].map(([th,en])=>pair(th,en))}));
 const INDEX=new Map(META.map(s=>[s.id,s]));
 const ALIASES={underserved:'underserved_market',complementary:'complementary_location'};
 const DEFAULTS=['underserved_market','competitive_entry','network_infill'];
 const ANCHORS=['factory_count','factory_workers','hotel_rooms'];
 const num=n=>Number.isFinite(n)&&n>=0;
 const positive=n=>Number.isFinite(n)&&n>0;
 const canonical=id=>ALIASES[id]||id;
 function selected(profile,opts){
  const incoming=Object.prototype.hasOwnProperty.call(opts,'strategyIds')?opts.strategyIds:profile?.defaultStrategyIds||DEFAULTS;
  if(!Array.isArray(incoming))throw new TypeError('strategyIds must be an array');
  const ids=[...new Set(incoming.map(canonical))];
  if(ids.length>3)throw new RangeError('Choose no more than three strategies');
  if(ids.some(id=>!INDEX.has(id)))throw new RangeError('Unknown opportunity strategy');
  return ids;
 }
 function currentYolk(row,criteria){return row?.eligible===true&&row.demand===true&&[1,2,3].includes(row.qualifyingTier)&&row.qualifyingTier<=(criteria?.maxDemandTier??3);}
 function scope(context,criteria){return {industryId:context.industryId||criteria?.industry||null,ownBrandId:context.ownBrandId||null,supplyScope:context.supplyScope||null,reportingGrain:context.reportingGrain||null,criteriaRevision:criteria?.version??null};}
 function missing(code,th,en,phase='P1'){return {code,...pair(th,en),phase};}
 function metricInfo(id,context){
  const catalogue=context.metricCatalog||global.YOLK_RUNTIME?.metricCatalog||[];
  return catalogue.find(m=>m.id===id)||{};
 }
 function metricEvidence(row,id,context,criteria){
  const m=metricInfo(id,context),value=row.metrics?.[id];
  return {id:'metric:'+row.id+':'+id,datasetId:m.dataset_id||m.dataset||({factory_count:'factory',factory_workers:'factory',hotel_rooms:'hotel'}[id])||id,sourceFile:'data/real/area-context.json',areaId:row.id,metricId:id,value:num(value)?value:null,unit:m.unit||m.unitEn||null,sourcePeriod:m.source_period??m.display?.sourcePeriod??null,sourceField:m.raw_source_field||m.display?.sourceQualifiedField||m.formula||id,evidenceState:row.metricStates?.[id]?.state||(num(value)?value===0?'observed_zero':'reported_value':'no_data'),scope:scope(context,criteria),limitations:pair('ค่าบริบทของพื้นที่ ไม่ใช่ลูกค้าหรือยอดซื้อจริง','Area context, not measured customers or purchases')};
 }
 function supplyEvidence(row,role,bounds,context,criteria){
  return {id:'supply:'+row.id+':'+role,datasetId:context.industryId||criteria?.industry||null,sourceFile:'data/real/'+(context.industryId||criteria?.industry||'industry')+'-supply.json',areaId:row.id,metricId:role+'_branches',lower:bounds?.lo??null,upper:bounds?.hi??null,value:bounds&&bounds.lo===bounds.hi?bounds.lo:null,unit:'branches',sourcePeriod:context.supplyPeriod??null,sourceField:'reporting_uuid counts in selected source scope',evidenceState:bounds?bounds.lo===bounds.hi?bounds.lo===0?'observed_zero':'reported_value':'bounded':'no_data',scope:scope(context,criteria),limitations:pair('รายการสาขาในขอบเขตต้นทาง ไม่ยืนยันเวลาเปิด สินค้า กำลังบริการ หรือส่วนแบ่งยอดขาย','Inventory in the source scope does not establish opening times, offerings, capacity or sales share')};
 }
 function supplyBounds(row){
  const sp=row.supply||{},u=sp.unverified;
  if(['missing','invalid','suppressed','not_yet','not_applicable','source_loading'].includes(sp.state))return {valid:false,state:sp.state,own:null,competitor:null,total:null};
  if(sp.boundsKnown===false)return {valid:false,state:'assignment_bounds_unavailable',own:null,competitor:null,total:null};
  if(!num(u))return {valid:false,state:'unresolved_inventory',own:null,competitor:null,total:null};
  const bound=role=>{const lo=sp[role+'Lower']??sp[role],hi=sp[role+'Upper']??sp[role];return Number.isInteger(lo)&&lo>=0&&Number.isInteger(hi)&&hi>=lo&&Number.isInteger(u)?{lo,hi:hi+u}:null;};
  const own=sp.ownScopeUnavailable?null:bound('own'),competitor=bound('competitor');
  // U is one joint allocation. Never add U twice to combined supply.
  const total=own&&competitor?{lo:own.lo+competitor.lo,hi:own.hi+competitor.hi-u}:null;
  return {valid:!!(own&&competitor),state:own&&competitor?'known_or_bounded':'unresolved_inventory',own,competitor,total};
 }
 function thresholds(row,criteria){
  if(criteria?.supplyMode==='relative'){
   const id=criteria.supplyDenominatorId,units={gfa:100000,population:10000,working_age_15_64:10000,adult_population_20_64:10000,factory_workers:10000,hotel_rooms:1000},unit=units[id],d=row.metrics?.[id];
   if(!unit||!positive(d)||!positive(criteria.ownRateHigh)||!positive(criteria.competitorRateHigh))return {valid:false,state:d==null?'missing_denominator':'invalid_parameters_or_denominator',mode:'relative',metricId:id,unit:unit??null,denominator:num(d)?d:null};
   const own=criteria.ownRateHigh*(d/unit),competitor=criteria.competitorRateHigh*(d/unit);
   return {valid:positive(own)&&positive(competitor),state:positive(own)&&positive(competitor)?'known_positive_denominator':'invalid_count_equivalent',mode:'relative',metricId:id,denominator:d,unit,own,competitor};
  }
  return {valid:positive(criteria?.ownMany)&&positive(criteria?.competitorMany),mode:'count',metricId:null,denominator:null,unit:1,own:criteria?.ownMany??null,competitor:criteria?.competitorMany??null,state:'count'};
 }
 function action(strategyId){
  const actions={
   underserved_market:['สำรวจร้านตกหล่น เวลาเปิด และการเข้าถึงร้านเดิม','Survey omitted stores, opening hours and access to existing providers',['provider_inventory','opening_hours','store_access']],
   segment_gap:['ถามกลุ่มลูกค้าและตรวจสินค้า ราคา เวลาเปิดของร้านเดิม','Ask the target group and check existing offerings, prices and opening hours',['customer_occasions','store_offering','opening_hours']],
   competitive_entry:['เปรียบเทียบสิ่งที่เราเสนอ และถามเหตุผลที่ลูกค้าจะเปลี่ยนร้าน','Compare our offering and ask why customers would switch',['brand_advantage','customer_switching','store_access']],
   cluster_participation:['สำรวจร้านที่อยู่ใกล้กันและตรวจการมาเลือกซื้อร่วมกัน','Survey nearby stores and validate shared or comparison-shopping visits',['verified_store_positions','shared_visits','location_costs']],
   complementary_location:['สำรวจทางออกกิจกรรม เวลาคนออกมา และการซื้อที่เกิดขึ้น','Observe anchor exits, times and actual purchase occasions',['verified_anchor_positions','exit_dayparts','purchase_occasions']],
   route_capture:['ตรวจทิศทาง ทางเลี้ยว และนับการผ่าน แวะ ซื้อแยกกัน','Check direction and turns; separately count passing, stopping and buying',['network_direction','access_constraints','pass_stop_buy']],
   network_infill:['ตรวจเวลาเดินทางและยอดที่อาจย้ายมาจากสาขาเราเดิม','Check travel times and purchases potentially displaced from our existing stores',['travel_time_coverage','own_capacity','own_displacement']],
   future_entry:['ยืนยันความคืบหน้าโครงการ ต้นทุนรอ และเงื่อนไขหยุดติดตาม','Verify project milestones, holding costs and stopping conditions',['future_project_milestones','site_option','holding_costs']]
  },a=actions[strategyId];
  return {title:pair(a[0],a[1]),requiredEvidence:a[2],owner:null,status:'open',phase:INDEX.get(strategyId).dataPhase==='P2'?'P2':'P1'};
 }
 function assess(row,criteria,context={},profile=null,opts={}){
  if(profile?.perScopeProfiles?.[context.supplyScope])profile={...profile,...profile.perScopeProfiles[context.supplyScope]};
  const ids=selected(profile,opts),bounds=supplyBounds(row),reference=thresholds(row,criteria),eligible=currentYolk(row,criteria),contextScope=scope(context,criteria);
  const assessmentFor=id=>{
   const meta=INDEX.get(id),result={strategyId:id,status:'evidence_incomplete',reasons:[],evidenceRefs:[],missingEvidence:[],nextAction:action(id),observed:{},sortTuple:[0],dataPhase:meta.dataPhase};
   if(!eligible){result.status=row.demand==null?'demand_evidence_incomplete':'not_current_yolk';result.reasons.push(pair('เริ่มคิวกลยุทธ์จากทำเลที่ผ่าน Demand ก่อน','Current-market strategy queues start with qualifying Demand'));result.missingEvidence.push(missing('qualifying_current_demand','ยังไม่มี Demand ที่ผ่านเกณฑ์ปัจจุบัน','No qualifying current Demand','P0'));return result;}
   result.evidenceRefs.push({id:'demand:'+row.id,areaId:row.id,metricId:'demand_proxy_tier',value:row.qualifyingTier,unit:'ordinal tier',evidenceState:'confirmed_proxy',scope:contextScope,sourceFile:'data/real/area-context.json',sourcePeriod:context.sourcePeriod??null,limitations:pair('ผ่าน proxy ตามเกณฑ์ ไม่ใช่ยอดซื้อที่วัดจริง','Qualifies under proxy criteria, not measured purchases')});
   if(['segment_gap','cluster_participation','route_capture','future_entry'].includes(id)){
    const missingById={segment_gap:[['branch_offering','ยังไม่มีสินค้า ราคา และเวลาเปิดรายสาขา','Branch offerings, prices and opening hours are unavailable'],['customer_segment_occasions','ยังไม่มีหลักฐานกลุ่มลูกค้าและโอกาสซื้อจริง','Customer segment and actual purchase-occasion evidence is unavailable']],cluster_participation:[['physical_cluster_and_visits','จำนวนต่อเขตไม่ยืนยันคลัสเตอร์ร้านหรือการมาเลือกซื้อร่วมกัน','Administrative counts do not establish a physical store cluster or shared visits']],route_capture:[['directed_routes_and_stops','ยังไม่มีเส้นทางตามทิศทางและการผ่าน แวะ ซื้อที่ตรวจแล้ว','Verified directed routes and passing/stopping/buying evidence are unavailable']],future_entry:[['future_milestones','ต้องมีความคืบหน้าโครงการและต้นทุนรอที่ตรวจแล้ว','Verified future project milestones and holding costs are required']]};
    result.missingEvidence=missingById[id].map(([code,th,en])=>missing(code,th,en,meta.dataPhase));result.reasons.push(pair('ข้อมูลปัจจุบันยังไม่พอระบุทำเลสำหรับวิธีนี้','Current data cannot yet identify qualifying locations for this method'));return result;
   }
   if(id==='complementary_location'){
    const profileAnchors=Array.isArray(profile?.complementaryAnchors)?[...new Set(profile.complementaryAnchors.flatMap(a=>a.metricIds||[]).filter(id=>ANCHORS.includes(id)))]:null;
    const requested=opts.anchorMetricIds??profile?.complementaryMetricIds??profile?.opportunity?.complementaryMetricIds??profileAnchors??['factory_workers','hotel_rooms'];
    if(!Array.isArray(requested))throw new TypeError('Activity metrics must be an array');
    const anchorIds=[...new Set(requested)];
    if(anchorIds.length>3||anchorIds.some(m=>!ANCHORS.includes(m)))throw new RangeError('Select at most three supported activity metrics');
    const p=opts.anchorPercentile??95;if(!Number.isFinite(p)||p<1||p>100)throw new RangeError('Activity midrank reference must be 1–100');
    if(!anchorIds.length){result.missingEvidence.push(missing('brand_relevant_activity','ยังไม่มีตัววัดกิจกรรมที่เกี่ยวข้องกับโปรไฟล์นี้และรองรับด้วยข้อมูลปัจจุบัน','No brand-relevant activity metric is supported by the current profile and data','P1'));result.reasons.push(pair('ข้อมูลฐานประชากรไม่ใช่หลักฐานกิจกรรมที่ส่งลูกค้าให้กัน','Population context is not evidence of a complementary customer-sending activity'));return result;}
    const candidates=anchorIds.map(metricId=>({metricId,value:row.metrics?.[metricId],percentile:row.percentiles?.[metricId]})),known=candidates.filter(a=>num(a.value)&&Number.isFinite(a.percentile)),passing=known.filter(a=>a.value>0&&a.percentile>=p);
    result.evidenceRefs.push(...candidates.map(a=>metricEvidence(row,a.metricId,context,criteria)));result.observed={activityReference:p,benchmark:criteria?.cohortMode==='same_grain'?'same_grain_midrank':'national_midrank',activitySignals:known.map(a=>({...a})),passingActivityIds:passing.map(a=>a.metricId)};
    result.missingEvidence.push(missing('verified_anchor_and_purchase_flow','ยังไม่รู้จุดกิจกรรม ทางเข้าออก และการซื้อจริง','Anchor positions, exits and actual purchase flows remain unknown'));
    if(passing.length){result.status='candidate_to_check';result.sortTuple=[Math.max(...passing.map(a=>a.percentile))];result.reasons.push(pair('พบกิจกรรมต้นทางเข้มข้นในพื้นที่ ชวนตรวจทางออกและโอกาสซื้อ','Concentrated source activity suggests checking exits and purchase occasions'));}
    else if(known.length===candidates.length){result.status='not_supported_by_current_evidence';result.reasons.push(pair('กิจกรรมที่เลือกยังไม่ถึงจุดเทียบ หรือเป็นศูนย์ที่รายงาน','Selected activity is below the reference or is a reported zero'));}
    else result.missingEvidence.push(missing('source_activity_value','ค่าหรืออันดับกิจกรรมบางส่วนยังไม่มี','Some activity values or midranks are unavailable','P0'));
    return result;
   }
   result.evidenceRefs.push(supplyEvidence(row,'own',bounds.own,context,criteria),supplyEvidence(row,'competitor',bounds.competitor,context,criteria));
   if(reference.mode==='relative')result.evidenceRefs.push(metricEvidence(row,reference.metricId,context,criteria));
   result.observed={mode:reference.mode,denominatorId:reference.metricId,denominator:reference.denominator,unit:reference.unit,own:bounds.own,competitor:bounds.competitor,total:bounds.total,ownCountEquivalentReference:reference.own??null,competitorCountEquivalentReference:reference.competitor??null,supplyScope:contextScope.supplyScope};
   result.missingEvidence.push(missing('verified_branch_offering','ต้องตรวจร้านตกหล่น เวลาเปิด สินค้า และการเปิดบริการปัจจุบัน','Check omitted providers, opening times, offerings and current operation'));
   if(context.submarketComparable===false){result.missingEvidence.push(missing('comparable_submarket','ข้อมูล Supply ยังไม่อยู่ใน submarket ที่เปรียบเทียบกันได้','Supply is not in a confirmed comparable submarket','P0'));return result;}
   if(id==='competitive_entry'){
    if(!bounds.competitor){result.missingEvidence.push(missing('competitor_inventory','ยังเทียบรายการคู่แข่งไม่ได้','Comparable competitor inventory is unavailable','P0'));return result;}
    result.missingEvidence.push(missing('customer_switching_and_advantage','ยังต้องพิสูจน์เหตุผลที่ลูกค้าจะเลือกเรา','A reason for customer switching to us still needs evidence'));
    if(!reference.valid)result.missingEvidence.push(missing('market_reference','เทียบความเข้มข้นคู่แข่งยังไม่ได้ ใช้ได้เพียงหลักฐานว่ามีรายการ','Competitor intensity cannot be compared; only inventory presence is available','P0'));
    if(bounds.competitor.lo>0){result.status='candidate_to_check';result.sortTuple=[reference.valid?bounds.competitor.lo/reference.competitor:0];result.reasons.push(pair('พบคู่แข่งในขอบเขต Supply ที่เลือก จัดเป็นคิวศึกษาการเข้าไปแข่ง','Competitors are present in the selected source scope: a queue to investigate competitive entry'));}
    else if(bounds.competitor.hi>0){result.missingEvidence.push(missing('uncertain_competitor_presence','รายการที่ยังไม่แน่อาจเป็นคู่แข่ง ต้องตรวจให้ชัด','Unresolved records may be competitors; presence needs verification','P0'));}
    else{result.status='not_supported_by_current_evidence';result.reasons.push(pair('ต้นทางรายงานคู่แข่งศูนย์ในขอบเขตนี้ จึงยังไม่มีฐานคัดวิธีชิงลูกค้า','The source reports zero competitors in this scope, so competitive-entry selection is not supported'));}
    return result;
   }
   if(!reference.valid){result.missingEvidence.push(missing('market_reference','ฐานตลาดหรือจุดเทียบยังใช้ไม่ได้ ห้ามหารด้วยศูนย์','Market base or comparison reference is unavailable; never divide by zero','P0'));return result;}
   const observed=id==='network_infill'?bounds.own:bounds.total,limit=id==='network_infill'?reference.own:reference.own+reference.competitor;
   result.observed.comparisonReference=limit;
   if(!observed){result.missingEvidence.push(missing('supply_inventory','รายการ Supply ยังไม่ครบพอเทียบ','Supply inventory cannot yet be compared','P0'));return result;}
   if(id==='network_infill')result.missingEvidence.push(missing('own_coverage_and_displacement','ยังไม่มีพื้นที่บริการ เวลาเดินทาง และผลต่อสาขาเดิม','Service coverage, travel times and own-store displacement remain unknown'));
   else result.missingEvidence.push(missing('actual_unmet_service','สาขาน้อยยังไม่พิสูจน์ว่าลูกค้าขาดบริการ','Low branch provision does not establish unmet customer service'));
   result.sortTuple=[1-observed.hi/limit];
   if(observed.hi<limit){result.status='candidate_to_check';result.reasons.push(pair(id==='network_infill'?'Supply เราอยู่ต่ำกว่าจุดเทียบ แม้รวมช่วงที่ยังไม่แน่':'Supply รวมอยู่ต่ำกว่าจุดเทียบ แม้รวมช่วงที่ยังไม่แน่',id==='network_infill'?'Own provision is below the reference even at its uncertainty upper bound':'Combined provision is below the reference even at its uncertainty upper bound'));}
   else if(observed.lo>=limit){result.status='not_supported_by_current_evidence';result.reasons.push(pair('Supply ไม่ต่ำกว่าจุดเทียบสำหรับวิธีนี้','Supply is not below this method’s reference'));}
   else result.missingEvidence.push(missing('supply_threshold_crossing','ช่วง Supply คร่อมจุดเทียบ ต้องตรวจรายการก่อนคัด','The Supply interval crosses the reference; verify inventory before selecting','P0'));
   return result;
  };
  const assessments=ids.map(assessmentFor),candidateStrategyIds=assessments.filter(a=>a.status==='candidate_to_check').map(a=>a.strategyId),evidenceIncompleteStrategyIds=assessments.filter(a=>a.status==='evidence_incomplete').map(a=>a.strategyId);
  return {engineVersion:VERSION,strategyContractVersion:VERSION,sourceRelease:context.sourceRelease??null,criteriaRevision:criteria?.version??null,profileId:profile?.id??profile?.brandId??null,profileVersion:profile?.profileVersion??profile?.version??context.profileVersion??null,areaId:row.id,currentDemandEligible:eligible,status:!eligible?(row.demand==null?'demand_evidence_incomplete':'not_current_yolk'):candidateStrategyIds.length?'candidate_to_check':evidenceIncompleteStrategyIds.length?'evidence_incomplete':'not_supported_by_current_evidence',scope:contextScope,selectedStrategyIds:ids,assessments,candidateStrategyIds,evidenceIncompleteStrategyIds,primaryStrategyId:candidateStrategyIds[0]||null};
 }
 function view(rows,criteria,context={},profile=null,opts={}){
  if(!Array.isArray(rows))throw new TypeError('rows must be evaluated reporting areas');
  if(profile?.perScopeProfiles?.[context.supplyScope])profile={...profile,...profile.perScopeProfiles[context.supplyScope]};
  const ids=selected(profile,opts),all=rows.map(row=>({row,assessment:assess(row,criteria,context,profile,{...opts,strategyIds:ids})})),current=all.filter(item=>item.assessment.currentDemandEligible),candidates=current.filter(item=>item.assessment.status==='candidate_to_check'),incomplete=current.filter(item=>item.assessment.status==='evidence_incomplete');
  const first=item=>item.assessment.assessments.find(s=>s.status==='candidate_to_check');
  candidates.sort((a,b)=>b.assessment.candidateStrategyIds.length-a.assessment.candidateStrategyIds.length||a.row.qualifyingTier-b.row.qualifyingTier||ids.indexOf(first(a).strategyId)-ids.indexOf(first(b).strategyId)||first(b).sortTuple[0]-first(a).sortTuple[0]||String(a.row.id).localeCompare(String(b.row.id)));
  return {engineVersion:VERSION,selectedStrategyIds:ids,demandEligibleCount:current.length,opportunityViewCount:candidates.length,evidenceIncompleteCount:incomplete.length,notSupportedCount:current.length-candidates.length-incomplete.length,counters:{demandEligibleCount:current.length,opportunityViewCount:candidates.length,evidenceIncompleteCount:incomplete.length},rows:candidates,candidates,incomplete,notSupported:current.filter(item=>item.assessment.status==='not_supported_by_current_evidence'),demandReview:all.filter(item=>item.assessment.status==='demand_evidence_incomplete'),sortDescription:pair('เรียงจำนวนวิธีที่มีเบาะแส → Tier → ลำดับวิธีที่เลือก → ค่าที่พบภายในวิธีเดียวกัน → UUID เป็นคิวสำรวจ ไม่ใช่คะแนนยอดขาย','Order by supported cue count → Demand tier → selected method order → observed comparison within that method → UUID. This is a survey queue, not a sales score.')};
 }
 global.YolkOpportunity=Object.freeze({version:VERSION,strategies:()=>META,assess,view,selectedStrategyIds:selected,supplyBounds,thresholds});
})(typeof window!=='undefined'?window:globalThis);
