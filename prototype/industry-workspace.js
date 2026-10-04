/* Dataset/identity context and local overlays. Observed source totals never follow CRUD edits. */
const INDUSTRIES=[{id:'fuel',th:'สถานีบริการน้ำมัน',en:'Fuel stations'},{id:'grocery',th:'ร้านค้าของกินของใช้',en:'Grocery'},{id:'nonbank',th:'บริการการเงิน Non-bank',en:'Non-bank'}];
const PROFILE_BY_ID=Object.fromEntries(window.YOLK_RUNTIME.profiles.map(p=>[p.industry_id,p]));
const CITYMETER_DATASETS={fuel:'gasStation',grocery:'grocery',nonbank:'nonBank'};
function ownBrandName(){const brand=window.YOLK_RUNTIME.supplyCache.get(Y.industry)?.brands.find(b=>b.id===Y.ownBrandId);return brand?.name||tr('เครือข่ายที่เลือก','Selected network')}
function industryName(){let i=INDUSTRIES.find(i=>i.id===Y.industry);return tr(i.th,i.en)}
function criteriaContextKey(){return ['expansion-demo',Y.industry,Y.ownBrandId,Y.supplyScope,PROFILE_BY_ID[Y.industry].version].join('|')}
function presetCriteria(industry){
 const profile=PROFILE_BY_ID[industry],c=normalizeCriteria(null,{existing:false});
 c.industry=industry;c.profile=profile.version;c.cohortMode='national';c.minimumCohortN=30;c.positivePresence=false;c.version=1;
 if(industry!=='fuel'){
  c.paths=structuredClone(profile.paths);c.buildingEnabled=true;c.activityEnabled=industry==='grocery';c.ownMany=profile.default_supply?.own_high_gte??2;c.competitorMany=profile.default_supply?.other_high_gte??2;
  c.patterns=[...profile.runtimePreset.preferredPatterns];c.rankingMode='context';c.rankingWeights={...profile.runtimePreset.initialWeightedParameters.rankingWeights};c.demandGroupWeights={building:industry==='nonbank'?100:50,activity:50,extra:50};
 }
 c.metricWeights=Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,1]));return c;
}
function stashContext(){Y.contexts[criteriaContextKey()]={criteria:structuredClone(Y.criteria),draft:structuredClone(draft),draftBase,targets:structuredClone(Y.targets)};return save()}
function loadCriteriaContext(){const savedState=Y.contexts[criteriaContextKey()],state=savedState?.criteria?.industry===Y.industry&&savedState.criteria.profile===PROFILE_BY_ID[Y.industry].version?savedState:null;Y.criteria=normalizeCriteria(state?.criteria||presetCriteria(Y.industry),{existing:!!state?.criteria});Y.criteria.industry=Y.industry;draft=structuredClone(state?.draft||Y.criteria);draftBase=state?.draftBase||Y.criteria.version;Y.targets=structuredClone(state?.targets||{});}
function rawOwnId(){return Y.industry==='fuel'?Y.ownBrandId.toUpperCase().replaceAll('-','_'):Y.ownBrandId.split(':').slice(1).join(':')}
function selectedScopeIncludes(brandId){
 if(Y.industry!=='nonbank'||Y.supplyScope==='office_context')return true;
 const licenses=window.YOLK_RUNTIME.companyScopes?.[brandId]?.licenses;if(!licenses)return null;
 const types=Y.supplyScope==='potential_retail_branch_service'?['nano','ploan','ploan_car','pico','pico_plus']:[{vehicle_title:'ploan_car',personal:'ploan',nano:'nano',pico:'pico',pico_plus:'pico_plus'}[Y.supplyScope]];
 if(licenses.some(([kind,status])=>types.includes(kind)&&status==='active'))return true;
 return licenses.some(([kind,status])=>types.includes(kind)&&['unknown','not_found',null].includes(status))?null:false;
}
function ownScopeAvailable(){if(Y.industry==='nonbank')return selectedScopeIncludes(rawOwnId());if(Y.industry==='grocery')return window.YOLK_RUNTIME.supplyCache.get(Y.industry)?.rows.some(row=>Object.hasOwn(row[2]||{},Y.supplyScope+':'+rawOwnId()));return true;}
function calculateSupply(row,area=null){
 if(!row||row[1]!=='source_row_present'||!row[2])return {own:null,competitor:null,unverified:null,state:'missing'};
 const ownKey=rawOwnId(),counts=row[2];let own=0,competitor=0,unverified=0;
 if(Y.industry==='nonbank'){const province=window.YOLK_RUNTIME.assignmentBounds?.[area?.province]||{};let ownLower=counts[ownKey]||0,ownUpper=ownLower+(province[ownKey]||0),otherLower=0,otherUpper=0,unknownLicense=0;for(const id of new Set([...Object.keys(counts),...Object.keys(province)])){if(id===ownKey)continue;const member=selectedScopeIncludes(id),assigned=counts[id]||0,residual=province[id]||0;if(member===true){otherLower+=assigned;otherUpper+=assigned+residual}else if(member===null){otherUpper+=assigned+residual;unknownLicense+=assigned}}return {own:ownLower,competitor:otherLower,unverified:0,state:'source_inventory_with_assignment_bounds',ownLower,ownUpper,competitorLower:otherLower,competitorUpper:otherUpper,unknownLicense,assignedTotal:row[3],sourceKey:row[4],mapped:row[5],boundsKnown:!!window.YOLK_RUNTIME.assignmentBounds};}
 for(const [key,value]of Object.entries(counts)){
  if(!Number.isInteger(value)||value<0)return {own:null,competitor:null,unverified:null,state:'invalid'};
  let entity=key;
  if(Y.industry==='grocery'){const split=key.indexOf(':');if(key.slice(0,split)!==Y.supplyScope||key.startsWith('PHARMACY:'))continue;entity=key.slice(split+1);}
  if(Y.industry==='nonbank'){const within=selectedScopeIncludes(key);if(within===false)continue;if(within===null&&Y.supplyScope!=='office_context'){unverified+=value;continue}}
  if(entity==='UNKNOWN')unverified+=value;else if(entity===ownKey)own+=value;else competitor+=value;
 }
 // Nonbank function/product uncertainty is not allocated as Fuel's brand-only U.
 if(Y.industry==='nonbank'&&Y.supplyScope!=='office_context'&&unverified>0)return {own,competitor,unverified:null,state:'potential_company_scope_review',unclassifiedProduct:unverified};
 if(Y.industry==='grocery'&&Y.supplyScope==='C_STORE'&&['30','84'].includes(area?.province)){const deficit=area.province==='84'?'SEVEN_ELEVEN':'TOOGDEE',isOwn=ownKey===deficit,delta=area.province==='84'?1:-1;return {own,competitor,unverified,state:'source_inventory_with_reconciliation_bounds',ownLower:Math.max(0,own+(isOwn?Math.min(0,delta):0)),ownUpper:own+(isOwn?Math.max(0,delta):0),competitorLower:Math.max(0,competitor+(!isOwn?Math.min(0,delta):0)),competitorUpper:competitor+(!isOwn?Math.max(0,delta):0),reconciliationReview:true,sourceKey:row[4],assignedTotal:row[3]};}
 return {own,competitor,unverified,state:'reported_assigned_inventory',sourceKey:row[4],assignedTotal:row[3],mapped:row[5]};
}
function applyIndustryData(){
 const dataset=window.YOLK_RUNTIME.supplyCache.get(Y.industry),rows=new Map(dataset.rows.map(r=>[r[0],r])),scopeAvailable=ownScopeAvailable();
 AREAS.forEach(a=>{a.supply=calculateSupply(rows.get(a.id),a);if(scopeAvailable!==true){a.supply.own=null;a.supply.ownScopeUnavailable=true;delete a.supply.ownLower;delete a.supply.ownUpper;}a.percentiles=Object.fromEntries(METRICS.filter(m=>m.ready).map(m=>[m.id,rankValue(a.metrics[m.id],distributionFor(m.id,a,Y.criteria))]));});
 window.YOLK_RUNTIME.revision++;evaluationCache.clear();refreshPointRelations();
}
function pointInSelectedScope(p){if(Y.industry==='grocery')return p.storeType?p.storeType===Y.supplyScope:!p.supplyScope||p.supplyScope===Y.supplyScope;if(Y.industry==='nonbank'&&Y.supplyScope!=='office_context')return p.brandId?selectedScopeIncludes(p.brandId.replace(/^legal:/,''))!==false:true;return true;}
function pointRelation(p){if(p.brandId)return p.brandId===Y.ownBrandId?'own':Y.industry==='nonbank'&&Y.supplyScope!=='office_context'&&selectedScopeIncludes(p.brandId.replace(/^legal:/,''))!==true?'unverified':'competitor';return p.sourceRecord||p.relation==='own'?'unverified':p.relation||'unverified';}
function refreshPointRelations(){
 syncLocalOverlays();const points=window.YOLK_RUNTIME.pointCache.get(Y.industry)||[],overlays=Y.localOverlays.filter(p=>p.industryId===Y.industry&&pointInSelectedScope(p));
 const override=new Map(overlays.map(p=>[p.id,p]));
 Y.sourcePois=points.filter(pointInSelectedScope).map(p=>({...p,relation:pointRelation(p)}));
 const sourceIds=new Set(Y.sourcePois.map(p=>p.id));Y.pois=[...Y.sourcePois.map(p=>override.get(p.id)||p),...overlays.filter(p=>!sourceIds.has(p.id))].map(p=>({...p,relation:pointRelation(p)}));
 const byArea=new Map();for(const p of Y.pois){if(!p.area||p.archived||p.status==='closed')continue;if(!byArea.has(p.area))byArea.set(p.area,[]);byArea.get(p.area).push({...p,category:p.relation})}for(const area of AREAS)area.mapContext.pois=byArea.get(area.id)||[];
}
let industryRequest=0;
async function fetchRuntime(name){let response=await fetch('data/real/'+name,{cache:'no-store'});if(!response.ok)throw new Error(name+' HTTP '+response.status);return response.json()}
async function selectIndustryContext(industry,brand=null,scope=null){
 if(!Y.loading)stashContext();const ticket=++industryRequest;Y.loading=true;Y.loadError=null;Y.pointError=null;Y.industry=industry;const profile=PROFILE_BY_ID[industry];Y.ownBrandId=brand||profile.defaultOwnBrandId;Y.supplyScope=scope||profile.defaultScope;Y.pointState='not_loaded';Y.province='';Y.poiArea='';Y.brandFilter='';Y.marketPage=0;Y.page=0;
 if(typeof render==='function')render();
 try{
  if(!window.YOLK_RUNTIME.supplyCache.has(industry)){const data=await fetchRuntime(industry+'-supply.json');window.YOLK_RUNTIME.supplyCache.set(industry,data)}
  if(industry==='nonbank'){if(!window.YOLK_RUNTIME.companyScopes)window.YOLK_RUNTIME.companyScopes=await fetchRuntime('nonbank-company-scopes.json');if(!window.YOLK_RUNTIME.assignmentBounds)window.YOLK_RUNTIME.assignmentBounds=await fetchRuntime('nonbank-assignment-bounds.json');}
  if(ticket!==industryRequest)return;
  const data=window.YOLK_RUNTIME.supplyCache.get(industry);if(!data.brands.some(b=>b.id===Y.ownBrandId))Y.ownBrandId=profile.defaultOwnBrandId;
  loadCriteriaContext();applyIndustryData();Y.pointState=window.YOLK_RUNTIME.pointCache.has(industry)?'ready':'not_loaded';Y.loading=false;save();if(typeof render==='function')render();
 }catch(error){if(ticket!==industryRequest)return;Y.loading=false;Y.loadError=String(error.message);if(typeof render==='function')render()}
}
function currentCriteriaEvents(){return Y.events.filter(e=>e.entity==='criteria'&&e.entity_id===criteriaContextKey())}
async function eventContextRoute(event){
 if(!event)return null;const meta=event.meta||{};
 if(meta.industry&&PROFILE_BY_ID[meta.industry]){
  await selectIndustryContext(meta.industry,meta.ownBrandId||null,meta.supplyScope||null);
  if(Y.loading||Y.loadError||Y.industry!==meta.industry||(meta.ownBrandId&&Y.ownBrandId!==meta.ownBrandId)||(meta.supplyScope&&Y.supplyScope!==meta.supplyScope))return null;
 }
 const contextTicket=industryRequest;
 if(event.entity==='supply'){
  await ensureSourcePoints();
  if(contextTicket!==industryRequest||Y.loading||Y.loadError)return null;
  if(!Y.pois.some(p=>p.id===event.entity_id)){notify(tr('เปิดบริบทแล้ว แต่ยังไม่มีรายการสาขานี้ในข้อมูลที่โหลดได้','The context is restored, but this branch record is unavailable in the loaded data.'));return null;}
 }
 return event.entity==='criteria'?'criteria':event.entity==='supply'?'poi/'+event.entity_id:'place/'+event.entity_id;
}
const sourcePointRequests=new Map();
function ensureSourcePoints(){
 const industry=Y.industry;if(window.YOLK_RUNTIME.pointCache.has(industry)){Y.pointState='ready';return Promise.resolve()}
 Y.pointState='loading';if(sourcePointRequests.has(industry))return sourcePointRequests.get(industry);
 const request=(async()=>{
 try{
  const [data,membership]=await Promise.all([fetchRuntime(industry+'-points.json'),industry==='nonbank'?fetchRuntime('nonbank-bkk-membership.json'):Promise.resolve({})]);const brandIndex=new Map(data.brands.map(b=>[b.id,b]));
  const points=data.records.map(row=>{const p=Object.fromEntries(data.fields.map((f,i)=>[f,row[i]])),scope=data.scopeCatalog[p.scopeRef]||{},candidate=scope.subdistrict_id;const member=membership[p.id.replace(/^nonbank:/,'')];const area=member?.areaId&&AREA_INDEX.has(member.areaId)?member.areaId:scope.province_code==='10'&&AREA_INDEX.has(candidate)?candidate:null;return {id:p.id,name:p.name,brandId:p.brandId,brand:brandIndex.get(p.brandId)?.name||'',relation:'unverified',area,province:scope.province_code||null,lat:p.lat,lng:p.lng,storeType:p.storeType,status:'source',sourceRecord:true,sourceDataset:industry,sourceUrl:member?.sourceUrl||data.sourceCatalog[p.sourceRef],observedAt:data.metadata.retrievedAt||'2026-10-03',coordinateQuality:p.coordinateQuality,adminScope:scope,industryId:industry,note:'',revision:1,archived:false,sourceCohort:p.sourceCohort}}).filter(p=>industry!=='grocery'||p.storeType!=='PHARMACY');
  window.YOLK_RUNTIME.pointCache.set(industry,points);if(Y.industry!==industry)return;Y.pointState='ready';refreshPointRelations();if(typeof render==='function')render();
 }catch(error){if(Y.industry===industry){Y.pointState='error';Y.pointError=String(error.message);if(typeof render==='function')render()}}
 finally{sourcePointRequests.delete(industry)}
 })();sourcePointRequests.set(industry,request);return request;
}
function contextControls(){const data=window.YOLK_RUNTIME.supplyCache.get(Y.industry);const scopes=Y.industry==='grocery'?[['C_STORE','C_STORE · ร้านสะดวกซื้อ / mini-format','C_STORE · convenience / mini-format'],['SUPERMARKET','ซูเปอร์มาร์เก็ต','Supermarket'],['HYPERMARKET','ไฮเปอร์มาร์เก็ต','Hypermarket'],['WHOLESALE','ค้าส่ง','Wholesale']]:Y.industry==='nonbank'?[['potential_retail_branch_service','ครอบครัวใบอนุญาต retail ที่ active (potential)','Active retail-license family (potential)'],['office_context','บัญชีสำนักงานทุกประเภท','All source-office context'],['vehicle_title','ผู้มีใบอนุญาตสินเชื่อทะเบียนรถ (potential)','Vehicle-title license holders (potential)'],['personal','ผู้มีใบอนุญาตสินเชื่อส่วนบุคคล (potential)','Personal-loan license holders (potential)'],['nano','ผู้มีใบอนุญาต Nano (potential)','Nano license holders (potential)'],['pico','ผู้มีใบอนุญาต Pico (potential)','Pico license holders (potential)'],['pico_plus','ผู้มีใบอนุญาต Pico Plus (potential)','Pico Plus license holders (potential)']]:[['all_fuel','สถานีในบัญชีต้นทางทั้งหมด','All source fuel inventory']];return `<details class="workspace-context-disclosure" ${(window.innerWidth>=700&&Y.route!=='criteria')||Y.contextExpanded?'open':''}><summary>${uiIcon('store')}<span class="context-summary-text"><strong>${escapeHTML(ownBrandName())} · ${industryName()}</strong><small>${tr('เปลี่ยนธุรกิจ / แบรนด์','Change industry / brand')}</small></span>${uiIcon('expand_more')}</summary><section class="workspace-context" aria-label="${tr('ธุรกิจและเครือข่ายของทีม','Business and team network')}"><div class="field"><label for="industry-select">${uiIcon('store')}${tr('ธุรกิจ','Industry')}</label><select id="industry-select">${INDUSTRIES.map(i=>`<option value="${i.id}" ${Y.industry===i.id?'selected':''}>${tr(i.th,i.en)}</option>`).join('')}</select></div><div class="field"><label for="own-brand-select">${uiIcon('groups')}${tr(Y.industry==='nonbank'?'นิติบุคคลของเรา':'แบรนด์ของเรา',Y.industry==='nonbank'?'Our legal company':'Our brand')}</label><select id="own-brand-select" ${Y.loading?'disabled':''}>${(data?.brands||[]).filter(b=>b.id!=='unknown').map(b=>`<option value="${escapeHTML(b.id)}" ${Y.ownBrandId===b.id?'selected':''}>${escapeHTML(b.name)}</option>`).join('')}</select></div><div class="field"><label for="supply-scope-select">${uiIcon('fact_check')}${tr('ขอบเขต Supply','Supply scope')}</label><select id="supply-scope-select" ${Y.loading?'disabled':''}>${scopes.map(([id,th,en])=>`<option value="${id}" ${Y.supplyScope===id?'selected':''}>${tr(th,en)}</option>`).join('')}</select></div><p class="context-note">${tr('ค่าของแต่ละแบรนด์ / ขอบเขตแยกกัน · Snapshot 3 ต.ค. 2026 · เลือกข้อมูลและสูตรในเกณฑ์','Each brand and scope has separate settings · Snapshot 3 Oct 2026 · Choose datasets and formulas under Criteria')}</p>${ownScopeAvailable()!==true?`<p class="context-note" role="status">${tr('ยังไม่มีข้อมูลแบรนด์นี้ในขอบเขต Supply ที่เลือก จึงไม่ตีความเป็นสาขาเรา 0; ตรวจขอบเขตหรือเลือกกลุ่มที่เปรียบเทียบได้','This brand has no confirmed source membership in the selected supply scope. It is not interpreted as zero own branches; review the scope or select comparable records.')}</p>`:''}</section></details>`}
function sourceSummary(){return `<details class="source-summary"><summary>${uiIcon('fact_check')}${tr('ที่มาข้อมูลและข้อจำกัด','Sources and limits')}</summary><p>${tr('บริบทพื้นที่ CityMETER 7,954 UUID ที่รายงาน: กทม. 180 แขวง + ต่างจังหวัด 7,774 อปท. ไม่ยืนยันขอบเขตกฎหมายหรือผลธุรกิจ · ข้อมูลประชากร/คนงานเป็นบริบทต้นทาง; GFA เป็นค่าประมาณจากแบบจำลอง','CityMETER reported context: 7,954 UUID units, 180 Bangkok khwaeng and 7,774 upcountry LAOs. This is not independent legal-boundary or business-outcome validation. Population/workers are source context; GFA is modeled.')}</p><p>${tr('Demand สูงหมายถึง proxy ผ่านสมมติฐานที่ปรับได้ ไม่ใช่ลูกค้า ยอดซื้อ หรือผู้กู้ที่วัดจริง · Zero แยกจาก Missing','High Demand means a proxy passes an adjustable hypothesis, not measured visits, purchases or borrowers. Zero remains distinct from missing.')}</p><p>${tr('Supply เป็นยอดรวมที่ต้นทางผูกกับ UUID โดยตรง รายการ POI/พิกัดเป็นอีกชุดหลักฐาน แสดงตาม format/ใบอนุญาตที่เลือก; ไม่กระทบยอดเอง ไม่ยืนยันเปิดบริการหรือผลิตภัณฑ์','Supply uses direct source reporting-UUID aggregates. POIs/coordinates are separate evidence and shown within the selected format/license scope; neither automatic reconciliation nor current operation/product verification is implied.')}</p>${Y.industry==='grocery'?`<p>${tr('C_STORE รวม convenience / mini-format ที่ต้นทางจัดไว้ จึงเป็นผู้ให้บริการที่เป็นไปได้; Pure PHARMACY ไม่อยู่ในกลุ่ม Grocery · รายละเอียด 27,457 vs source 27,458 ขาดหนึ่งจุด Ko Tao · แยกช่วงตรวจทาน category ต้นทาง: สุราษฎร์ธานี SevenEleven −1 / นครราชสีมา Toogdee +1 ไม่กระจายเติมจุดจริง','C_STORE contains source convenience/mini-formats and means potential providers. Pure PHARMACY is excluded. Grocery detail coverage is 27,457 of 27,458 source records, with one missing Ko Tao point. Category reconciliation remains separate: Surat Thani SevenEleven −1 / Nakhon Ratchasima Toogdee +1. Bounds represent source uncertainty, not invented point allocation.')}</p>`:''}${Y.industry==='nonbank'?`<p>${tr('มี 17,990 สำนักงานผูกกับพื้นที่จาก 23,524 รายการทั่วประเทศ; 5,534 ยังไม่ผูกพื้นที่ · 0 ในพื้นที่คือยอดรายการที่ผูกได้ ไม่ยืนยันว่าไม่มีสำนักงาน · ใบอนุญาตระดับบริษัทไม่ยืนยันบริการที่สาขา; พฤติกรรมกู้จริงยังไม่ทราบ','17,990 of 23,524 office records are assigned to reporting areas; 5,534 remain unassigned. Local zero means zero assigned records, not absence. Company licenses do not confirm branch products. Actual borrowing behavior remains unknown.')}</p>`:''}<p><a href="https://landometer.com/v3/citymeter?d=${CITYMETER_DATASETS[Y.industry]}" target="_blank" rel="noopener">${tr('เปิดข้อมูลใน CityMETER','View the CityMETER dataset')}</a> · ${tr('ข้อมูล snapshot ไม่มี live sync ในต้นแบบ','Snapshot data; no live sync in this prototype')}</p></details>`}
// Restore only a valid three-industry context. The original/live workspace storage is separate.
if(!PROFILE_BY_ID[Y.industry])Y.industry='fuel';
if(!window.YOLK_RUNTIME.supplyCache.get(Y.industry)?.brands.some(b=>b.id===Y.ownBrandId))Y.ownBrandId=PROFILE_BY_ID[Y.industry].defaultOwnBrandId;
loadCriteriaContext();applyIndustryData();

async function ensureSourceGeometry(){if(window.YOLK_RUNTIME.geometryState)return;window.YOLK_RUNTIME.geometryState='loading';try{const geometries=await fetchRuntime('source-geometries.json');for(const [id,feature]of Object.entries(geometries)){const area=AREA_INDEX.get(id);if(!area)continue;area.mapContext.boundary=feature;area.mapContext.boundaryStatus='source';area.mapContext.sourceLabel=feature.properties.source_url;area.mapContext.observedAt='2026-10-03';area.geometryStatus='direct_source_polygon'}window.YOLK_RUNTIME.geometryState='ready';if(Y.route==='place')render()}catch(error){window.YOLK_RUNTIME.geometryState='error'}}

document.addEventListener('toggle',event=>{if(event.target.matches?.('.workspace-context-disclosure')&&window.innerWidth<700)Y.contextExpanded=event.target.open;},true);
window.matchMedia('(max-width:699px)').addEventListener('change',()=>{Y.contextExpanded=false;if(typeof render==='function')render();});
