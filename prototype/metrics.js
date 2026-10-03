/* Actual CityMETER dataset catalogue. Adapter aliases retain the accepted Fuel contract IDs. */
const METRICS=window.YOLK_RUNTIME.metricCatalog;
const METRIC_INDEX=Object.fromEntries(METRICS.map(m=>[m.id,m]));
const BUILDING_IDS=["gfa","gfa_per_person","gfa_per_km2"];
const ACTIVITY_IDS=["factory_count","factory_count_per_km2","factory_workers","factory_workers_per_km2","hotel_rooms","hotel_rooms_per_km2"];
const CORE_IDS=[...BUILDING_IDS,...ACTIVITY_IDS];
