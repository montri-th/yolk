---
document_id: yolk.implementation_plan.map_boundary_appearance
version: 1.7.4
date: 2026-10-04
status: release_pending_current_QA
machine_tasks: contracts/map-boundary-appearance.v1.7.4.json#/tasks
product_authority: contracts/product.v1.7.json
retained_implementation: IMPLEMENTATION_PLAN_v1.7.3.md
---

# ปรับแผนที่และเกณฑ์ Supply ให้เข้าใจง่าย — คงโมเดล Yolk เดิม

งานนี้ปรับสี ความหนา และลำดับเส้นขอบ พร้อมอธิบาย Supply cutoff และแยกจำนวนไข่แดงจากจำนวนทำเลผ่านเกณฑ์รวม ไม่เพิ่มแหล่งข้อมูลหรือเปลี่ยนโมเดลตัดสินใจ อ่าน [Product statement](CityMETER_Yolk_Product_Statement_v1.7.4.md), [คู่มือแผนที่และ cutoff](docs/MAP_BOUNDARIES_v1.7.4.md) และ [machine contract](contracts/map-boundary-appearance.v1.7.4.json) ก่อนแก้ runtime

## ลำดับงาน

| Task | ทำอะไร | ตรวจรับ |
|---|---|---|
| BOUNDARY-00 | Freeze source/model และยืนยันตารางเส้นขอบ | สูตร cohort เกณฑ์ source totals และผล rank คงเดิม |
| BOUNDARY-01 | เปลี่ยน ordinary/selected/context outlines เป็นขาว และ hover เป็นเหลือง | ใช้ HEX/ความหนาตาม contract ทั้งสองธีม; อย่าเปลี่ยน fill/LUT/Tier |
| BOUNDARY-02 | จัดลำดับ layer และบริบทเมื่อเลือกทำเล | district → province → selected fine → transparent navigation hits; ไม่มี pane ใหม่; gradient defs คงอยู่ |
| CLARITY-00 | อธิบายทิศทาง Supply cutoff พร้อมหน่วย | ค่าสูงขึ้นทำให้ “มาก” ยากขึ้น; observed rate ≥ cutoff เป็น HIGH; ไม่กลับสูตรหรือ reseed preset |
| CLARITY-01 | แยก Demand Yolks กับ all-criteria matches | Demand count มาก่อน maxDemandTier/รูปแบบ/Supply ใน administrative scope ปัจจุบัน; ไม่ใช้ viewport bounds |
| BOUNDARY-03 | Regression และ native browser review | ตรวจ actual render หลายระดับ ทั้ง light/dark และ desktop/narrow; hover ตรงขอบเขตที่กดจริง; selected fill=false |
| BOUNDARY-04 | Final source freeze และส่ง release owner | Current receipts แยกจาก historical 1.7.3; publish claim หลัง provider/live-byte proof ผูก final SHA |

ทำ BOUNDARY-01 หลัง 00 และ 02 หลัง 01 ทำ CLARITY-00 หลัง freeze baseline แล้ว CLARITY-01 หลัง 00 ตรวจ BOUNDARY-03 เมื่อ runtime ของทั้งสองส่วนพร้อม และ 04 หลัง final QA งาน production CRUD/RBAC/outbox/media และโมเดลยังใช้ [แผน 1.7.3](IMPLEMENTATION_PLAN_v1.7.3.md) และ retained baseline ที่ระบุไว้

## วิธี implement

1. **คงแผนที่และข้อมูลเดิม:** one Leaflet instance, fixed fine cohort 7,954 UUIDs / 25 metrics, native district 928 และ spatial crosswalk เดิม การเปลี่ยนเส้นขอบไม่คำนวณเกณฑ์ใหม่
2. **ใช้ตาราง style ตามระดับ:** province 1.2 px; district ในภาพประเทศ 0.45 px; district เมื่อเจาะใกล้ 1.05 px; chosen parent district 1.1 px; fine 0.45 px; selected fine 0.8 px ทุกเส้นขาว #FFFFFF Hover ใช้ #FFBC1F / 2 px ทั้งสองธีม
3. **Selected fine ต้องโปร่งใส:** fill=false; selected boundary ขาว 0.8 px ชื่อทำเล breadcrumb และข้อความสถานะคงการสื่อว่ากำลังเลือกอะไร อย่าคืนเส้น selected สีน้ำเงินจากรุ่นก่อน
4. **คงบริบทอำเภอเดียว:** ใน location view แสดงเฉพาะอำเภอที่เลือกเป็น outline บริบท unfilled/noninteractive ไม่นำพื้นที่ข้างเคียงเข้ามาเป็น candidate หรือบวก counts/ranking และไม่อ้าง display crosswalk เป็นสังกัดทางกฎหมาย
5. **เรียง layer ภายใน renderer เดิม:** หลัง fine fills ให้ bringToFront visible unfilled districts ตามด้วย provinces แล้ว selected fine; broader transparent navigation hits อยู่ท้ายสุด ไม่สร้าง pane/renderer ใหม่ที่ทำให้ paint server ของ Tier 1 หาย
6. **คง truth states:** ถ้าไม่มี polygon ใช้ source extent ขาว dashed พร้อม label ว่าเป็นกรอบพิกัดและไม่ใช่ choropleth ไม่ใช้ extent แทนขอบเขตจริง หรือสีขาวแทน missing/zero
7. **คงมุมมองและ interaction:** sync/menu/criteria preview ไม่ fit ใหม่; explicit navigation/home/fit ใช้ minZoom 3 และ actual-footer padding เดิม Hover ไม่ทาสีภายใน ไม่แก้เกณฑ์/source/team event Keyboard focus ยังต้องเห็น
8. **ตรวจจริงก่อนส่งต่อ:** ดู white hierarchy และ yellow hover บน Tier fills กับ basemap ทั้ง light/dark ตรวจ selected fine, missing extent, larger click target และ POI popup บน desktop/narrow รัน retained map/hover/analysis regressions ที่เกี่ยวข้องกับ current bytes

**รองขอบเมื่อพื้นแผนที่อ่อน:** ใช้ neutral drop-shadow halo 0.35 px จาก --yl-border-strong / DS border.emphasis ตามธีม เฉพาะ SVG path ที่ fill="none", stroke="#FFFFFF", stroke-opacity="1" นี่เป็น edge backing ของเส้นขาว ไม่ใช่การเปลี่ยนสีข้อมูล ห้าม apply filter กับ filled analytical paths หรือทั้ง pane และอย่าแก้สี LUT/gradient เพื่อเพิ่ม contrast

## วิธีอธิบาย Supply และแยกจำนวน

1. **คงสูตรเดิม:** count mode ใช้ N; relative mode ใช้ rate = N / positive denominator × displayed normalization unit แยกสาขาเราและคู่แข่ง ใช้ HIGH เมื่อค่าจริง ≥ cutoff และ LOW เมื่อ < cutoff ถ้าข้อมูลเป็นช่วง ให้ HIGH เมื่อ lower bound ≥ cutoff, LOW เมื่อ upper bound < cutoff กรณีอื่นยังเป็นช่วงที่ต้องตรวจ ไม่ยืนยันเพิ่มด้วยการเลื่อนเกณฑ์
2. **อธิบาย slider:** ค่าขวาสูงขึ้นหมายถึงต้องมีสาขามากขึ้นจึงเรียกว่า “มาก” ไม่ใช่เพิ่มความหนาแน่นจริง ตัวอย่าง rate 0.5: cutoff 0.3 เป็น HIGH / cutoff 0.8 เป็น LOW โดยใช้หน่วยเดียวกัน ห้าม invert สูตรหรือ reseed thresholds ระหว่างเลื่อน
3. **คงผลจากรูปแบบ:** ปั๊มน้ำมันเลือก Pioneer/FOMO/Our Farm ดังนั้น Crowded อาจเปลี่ยนเป็น FOMO เมื่อ own cutoff สูงขึ้น, Our Farm เมื่อ competitor cutoff สูงขึ้น หรือ Pioneer เมื่อทั้งสองฝั่งเปลี่ยนเป็น LOW ห้ามรับประกันจำนวนผ่านจะเพิ่มเสมอเมื่อผู้ใช้เลือกรูปแบบอื่น
4. **คำนวณ Demand Yolks แยก:** ใช้ `s.nextRows.filter(a => a.demand === true && areaMatchesNavigation(a)).length` จาก context/แบบร่างปัจจุบัน ก่อน maxDemandTier, preferred patterns และ Supply gates นี่คือ administrative scope ที่เลือก ไม่ใช่พื้นที่ที่ปรากฏใน viewport ไม่นับ unknown Demand เป็น zero/high
5. **แสดงผลให้แยกความหมาย:** ใช้ป้าย “ไข่แดงจาก Demand / Demand Yolks” สำหรับจำนวนนี้ และ “ทำเลผ่านเกณฑ์ทั้งหมด / All-criteria matches” สำหรับ existing eligible count แสดงทั้งคู่ใน criteria/map โดยไม่เปลี่ยน rank หรือ eligibility สูตรเดิม Supply-only change ต้องคง Demand count/Tier membership/national cutoffs
6. **ผูกหลักฐานตามขอบเขต:** [receipt ของ cutoff](evidence/supply-cutoff-semantics-v1.7.4.json) ตรวจ 37 default contexts / 444 probes จากโมเดลปัจจุบัน เป็นหลักฐาน semantics ไม่ใช่ browser/touch pass หรือหลักประกัน monotonic สำหรับทุกการเลือก pattern ตรวจป้าย slider และ counters ที่แสดงจริงอีกครั้งบน desktop/narrow ไทย/อังกฤษ

**คงช่วงควบคุมขณะทดลอง:** `rateControl` กำหนด range endpoints/step จาก threshold ของ role ใน `supplyCalibration` โดย fallback ไปที่ team criteria ไม่ใช้ draft thumb value เป็นฐาน ช่วงจึงคงที่เมื่อ rerender เปลี่ยนภาษา หรือเปลี่ยน route ช่องกรอกตัวเลขรับค่าที่อยู่นอกช่วง slider โดยไม่ clip ค่าจริงและคง warning เดิม การตั้งช่วงนี้ไม่แก้สูตร cutoff, draft หรือ preset เมื่อเปลี่ยนภาษา ให้ refresh accessible labels ของ broad navigation hit layers ที่ cache ไว้ด้วย โดยคง geometry และ map instance

## Acceptance

- Parent stroke หนักกว่าลูกที่มองพร้อมกัน: province 1.2 > closer district 1.05/1.1 > selected fine 0.8 > ordinary fine 0.45
- Country district 0.45 เป็น choropleth subdivision; province outline 1.2 และ province click/hover target คงเดิม
- Hover clickable source boundary เหลือง 2 px; fine selected ภายในโปร่งใสและขอบขาว ไม่ใช้ opaque selection fill
- Raw quantitative LUT 41 สีและ egg-tier recipe คง byte/value/order; existing SVG gradient definition ยัง render ได้
- Context outline เป็นเพียงการแสดงผล: ไม่กดได้ ไม่นับ ไม่จัดอันดับ และไม่เปลี่ยน source membership
- Source totals, Demand cutoffs, possiblePatterns, supply bounds, weights และ scoped drafts ไม่เปลี่ยนเพราะ style
- Supply slider เปลี่ยน cutoff เท่านั้น ค่าต้นทาง rate, denominator และ Demand membership คงเดิม; rate = cutoff เป็น HIGH
- Demand Yolks ก่อน maxDemandTier/รูปแบบ/Supply อยู่ใน administrative scope ปัจจุบัน ไม่ใช้ viewport bounds; all-criteria matches แยกป้ายและจำนวน
- คำอธิบายไม่รับประกันว่า matches จะเพิ่มเสมอเมื่อเลื่อนขวา เพราะผลขึ้นกับ preferred patterns
- Slider range/step ไม่ยืดตาม draft thumb ระหว่าง rerender; exact-number input ไม่ตัดค่าที่อยู่นอกช่วง และมี warning เดิม
- หลังสลับภาษา cached broad navigation targets มี accessible labels ภาษาปัจจุบัน โดย geometry/camera/สูตรคงเดิม
- Current QA/provider/live bytes เป็นหลักฐานแยก การตรวจรุ่น 1.7.3 ไม่ใช่ pass ของ 1.7.4 เครื่องจริงและ shared backend ยังไม่อ้างว่าทดสอบแล้ว

## Prompt สำหรับ dev

~~~text
อ่าน AGENTS.md, START_HERE.md และ contracts/map-boundary-appearance.v1.7.4.json
ทำ BOUNDARY-[id] หรือ CLARITY-[id] เพียงงานเดียว คงสูตร/source/cohort/map instance
ใช้ exact white/yellow และ stroke schedule ที่ยืนยันแล้ว
คง selected fill=false, raw LUT41, egg tier gradient defs และ keyboard focus
อย่าใช้ context outline เป็น input ใน counts/ranking
Supply HIGH ใช้ค่าจริง >= cutoff; อย่า invert/reseed ขณะเลื่อน
Demand count ใช้ draft demand===true ใน administrative scope ก่อน Tier/รูปแบบ/Supply
แยก Demand Yolks กับ all-criteria matches ไม่สัญญาว่าจำนวนจะเพิ่มเสมอ
รัน checks ที่เกี่ยวข้องกับ bytes ปัจจุบัน และดู actual rendered light/dark desktop/narrow
ส่ง files changed, acceptance, command results, bounded visual evidence และ open gates
อย่า seal/stage/publish ก่อน release owner รับ final QA และ session authorization
~~~

สถานะรุ่นนี้ยังเป็น release pending ตาม [release contract](contracts/release.v1.7.4.json) Root เป็นผู้จัดการ current receipt, manifest, sealing และการเผยแพร่หลังตรวจรับ
