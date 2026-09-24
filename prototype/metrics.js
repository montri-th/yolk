/* Availability is explicit. Unconnected signals cannot change the analytical result. */
const METRICS = [
 {id:'gfa',th:'พื้นที่อาคารรวม (GFA)',en:'Gross floor area',unitTh:'ตร.ม.',unitEn:'m²',dataset:'building',group:'building',ready:true},
 {id:'gfa_per_person',th:'GFA ต่อประชากร',en:'GFA per resident',unitTh:'ตร.ม./คน',unitEn:'m²/person',dataset:'building / population',group:'building',ready:true},
 {id:'gfa_per_km2',th:'GFA ต่อพื้นที่',en:'GFA per area',unitTh:'ตร.ม./ตร.กม.',unitEn:'m²/km²',dataset:'building',group:'building',ready:true},
 {id:'factory_count',th:'จำนวนโรงงาน',en:'Factories',unitTh:'แห่ง',unitEn:'factories',dataset:'factory',group:'activity',ready:true},
 {id:'factory_count_per_km2',th:'จำนวนโรงงานต่อพื้นที่',en:'Factory density',unitTh:'แห่ง/ตร.กม.',unitEn:'factories/km²',dataset:'factory',group:'activity',ready:true},
 {id:'factory_workers',th:'แรงงานโรงงาน',en:'Factory workers',unitTh:'คน',unitEn:'people',dataset:'factory',group:'activity',ready:true},
 {id:'factory_workers_per_km2',th:'แรงงานโรงงานต่อพื้นที่',en:'Factory worker density',unitTh:'คน/ตร.กม.',unitEn:'people/km²',dataset:'factory',group:'activity',ready:true},
 {id:'hotel_rooms',th:'ห้องพักโรงแรม',en:'Hotel rooms',unitTh:'ห้อง',unitEn:'rooms',dataset:'hotel',group:'activity',ready:true},
 {id:'hotel_rooms_per_km2',th:'ห้องพักโรงแรมต่อพื้นที่',en:'Hotel room density',unitTh:'ห้อง/ตร.กม.',unitEn:'rooms/km²',dataset:'hotel',group:'activity',ready:true},
 {id:'population',th:'ประชากรตามฐานข้อมูลพื้นที่',en:'Area population proxy',unitTh:'คน',unitEn:'people',dataset:'population',group:'extra',ready:true},
 {id:'population_per_km2',th:'ประชากรต่อพื้นที่',en:'Population density',unitTh:'คน/ตร.กม.',unitEn:'people/km²',dataset:'population',group:'extra',ready:true},
 {id:'school_count',th:'จำนวนโรงเรียน',en:'Schools',unitTh:'แห่ง',unitEn:'schools',dataset:'school',group:'education',ready:false,reason:'crosswalk'},
 {id:'school_students',th:'จำนวนนักเรียน',en:'School students',unitTh:'คน',unitEn:'students',dataset:'school',group:'education',ready:false,reason:'crosswalk'},
 {id:'large_school_count',th:'โรงเรียนขนาดใหญ่',en:'Large schools',unitTh:'แห่ง',unitEn:'schools',dataset:'school',group:'education',ready:false,reason:'size'},
 {id:'large_hospital_count',th:'โรงพยาบาลขนาดใหญ่',en:'Large hospitals',unitTh:'แห่ง',unitEn:'hospitals',dataset:'healthcare · connector pending',group:'health',ready:false,reason:'health'},
 {id:'hospital_beds',th:'จำนวนเตียงโรงพยาบาล',en:'Hospital beds',unitTh:'เตียง',unitEn:'beds',dataset:'healthcare · connector pending',group:'health',ready:false,reason:'health'},
 {id:'apartment_count',th:'อาคารที่พักเช่า',en:'Rental apartment buildings',unitTh:'แห่ง',unitEn:'buildings',dataset:'apartment',group:'living',ready:false,reason:'crosswalk'},
 {id:'shopping_gla',th:'พื้นที่เช่าศูนย์การค้า',en:'Shopping centre GLA',unitTh:'ตร.ม.',unitEn:'m²',dataset:'shoppingCenter',group:'retail',ready:false,reason:'crosswalk'},
 {id:'school_density',th:'โรงเรียนต่อพื้นที่',en:'School density',unitTh:'แห่ง/ตร.กม.',unitEn:'schools/km²',dataset:'school',group:'education',ready:false,reason:'crosswalk'},
 {id:'government_workers',th:'บุคลากรภาครัฐ',en:'Government personnel',unitTh:'คน',unitEn:'people',dataset:'government',group:'activity_other',ready:false,reason:'crosswalk'},
 {id:'traffic_volume',th:'ปริมาณรถผ่าน',en:'Passing vehicle volume',unitTh:'คัน/วัน',unitEn:'vehicles/day',dataset:'traffic · timestamp required',group:'mobility',ready:false,reason:'traffic'},
 {id:'business_branches',th:'สาขากิจการจดทะเบียน',en:'Registered business branches',unitTh:'แห่ง',unitEn:'branches',dataset:'businessDynamics',group:'business',ready:false,reason:'crosswalk'}
];
const METRIC_INDEX = Object.fromEntries(METRICS.map(m=>[m.id,m]));
const BUILDING_IDS = METRICS.filter(m=>m.group==='building').map(m=>m.id);
const ACTIVITY_IDS = METRICS.filter(m=>m.group==='activity').map(m=>m.id);
const CORE_IDS = [...BUILDING_IDS,...ACTIVITY_IDS];
