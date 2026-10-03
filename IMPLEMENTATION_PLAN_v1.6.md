---
document_id: yolk.implementation.three_industries
version: 1.6-preview.1
date: 2026-10-03
machine_tasks: contracts/implementation-tasks.v1.6.json
product: CityMETER_Yolk_Product_Statement_v1.6.md
entrypoint: prototype/index.html
status: prototype_exists_production_work_remaining
---

# แผนพัฒนา Yolk — เริ่มจากของเดิม ทำทีละงานที่ตรวจได้

พรีวิวเป็น HTML/CSS/JavaScript ที่ทำงานจริงกับ snapshot สาธารณะ ไม่ใช่ backend production ให้ต่อยอด UI และ model ที่มี แล้วเชื่อมระบบ CityMETER เดิม งานนี้รองรับเพียง Fuel, Grocery และ Non-bank

อ่าน [Product statement](CityMETER_Yolk_Product_Statement_v1.6.md) → [Criteria guide](docs/CRITERIA_GUIDE.md) → [machine tasks](contracts/implementation-tasks.v1.6.json) ก่อนเริ่ม ไม่ใช้เอกสาร v1.2–v1.5 หรือ DS 0.9.4 เป็น authority ของรุ่นนี้ ยกเว้นสูตร Fuel เดิมที่ระบุว่ารักษาไว้

## โครงที่มีอยู่แล้ว

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `prototype/index.html`, `app.js` | shell, routes, render และ interaction เดิม |
| `prototype/bootstrap.js` | โหลด context/profile/supply ของธุรกิจที่เลือก ก่อนเปิด UI |
| `prototype/industry-workspace.js` | adapter ธุรกิจ/แบรนด์/scope, draft แยกบริบท, POI และ geometry |
| `prototype/metrics.js`, `model.js` | metric catalogue, percentile, Tier, patterns, filter และ rank |
| `contracts/industry-profiles.json` | profile ที่ runtime ใช้; ต้องตรวจเทียบกับ proposal/presets |
| `contracts/criteria-proposal.v1.6.json` | ความหมาย metrics, สูตร, cohort, ข้อจำกัด และกติกาตั้งต้นครบ |
| `prototype/data/real/*` | snapshot ที่ normalize สำหรับเดโม ไม่มี live sync |
| `landscape.js`, `location-map.js`, `supply-ui.js`, `branch-photos.js` | market evidence, map, CRUD และ photo drafts เดิม |
| `theme.js`, `icons.js`, `prototype/assets/*` | ธีม ฟอนต์ โลโก้ ไอคอนและภาพตัวอย่างตาม role |

ชื่อ path ของบริการ production ด้านล่างเป็น **module ที่ต้อง map เข้ากับ stack จริงใน Task 00** ไม่อ้างว่ามี API/database/queue แล้ว

## ขั้นตอนพัฒนาและจุดรับงาน

### 00 — สำรวจ CityMETER จริง แล้วกำหนดขอบเขต integration

ตรวจ auth, tenant, datastore, spatial service, media, notifications และ deployment ที่มี ระบุว่า module ไหน reuse ได้ พร้อมคำสั่ง build/test จริงของทีม เก็บแผนผังใน `docs/PRODUCTION_STACK.md` ห้ามสร้าง stack คู่ขนานโดยไม่ดูของเดิม

**รับงานเมื่อ:** มี path จริง, owner, migration strategy, environment/secrets names และ test commands ที่รันได้ ไม่มี credentials ในเอกสาร

### 01 — วาง schema และ scope ที่ไม่ปะปน

สร้าง `Workspace`, `Membership`, `IndustryProfile`, `Entity`, `CriteriaRevision`, `SourceRelease`, `Area`, `MetricObservation`, `SupplyObservation`, `BranchOverlay`, `LocationTarget`, `Event`, `Outbox` และ `Media` ใช้ ID จากต้นทางกับ explicit alias/crosswalk แยกกัน

criteria scope = `workspace + industry + ownEntity + format/product + profileVersion` แต่ละ scope มี pointer ไป revision ล่าสุดที่ยอมรับแล้ว และ private draft ผูก user/revision การเปลี่ยนแบรนด์ต้องไม่ reset หรือย้าย draft ของอีกแบรนด์

**รับงานเมื่อ:** test สลับแบรนด์ A/B แล้วยังได้ค่าตนเอง การย้าย profile version ไม่เปลี่ยนเกณฑ์ที่บันทึกเองโดยเงียบ ๆ

### 02 — นำเข้าข้อมูลแบบมีที่มาและ version

ต่อ source adapter CityMETER สำหรับ base/population/building/factory/hotel/office/fiscal และ supply ทั้ง 3 ธุรกิจ เก็บ URL/field, retrievedAt, sourcePeriod, hash และ schema version ของแต่ละ release ข้อมูลต้นทาง immutable

join aggregate ด้วย exact reporting UUID ไม่ใช้ชื่อ ตำบล หรือ bbox เดาว่าเป็น อปท. ตรวจการซ้ำ grain, geometry vintage และ coverage ก่อนใช้ ไม่มีข้อมูลให้ unknown; explicit reported zero จึงเป็น zero แยก suppressed/not-applicable/invalid

**รับงานเมื่อ:** area 7,954 IDs; geography 180/7,774; direct source counts/coverage reconcile ตาม QA โดยไม่เติมแถวที่ขาด ไม่ใช้ภาพ boundary แทน crosswalk

### 03 — สร้าง metric registry และ evaluator ที่ปลอดภัย

แต่ละ metric ต้องมี `datasetId`, source field/period, formula AST/template, unit, denominator, area grain, evidence state และ valid-value policy สูตรเริ่มจาก count, age-band sum, per-area และ per-person ใช้ whitelist ไม่ใช้ `eval` หรือ query ที่ผู้ใช้ส่งมาโดยตรง

```text
areaKm2 = base.areaSqm / 1_000_000
population = sum(ms) + sum(fs)
adult20_64 = sum(ms[20:65]) + sum(fs[20:65])
gfaPerPerson = buildingGFA / population
density(metric) = metric / areaKm2
if any input missing or denominator <= 0: UNKNOWN
```

**รับงานเมื่อ:** unit/denominator ถูก; index อายุถูก; GFA ไม่ถูกใช้เป็น land area; invalid/nonfinite ไม่เข้าฐาน percentile; formula picker แสดงที่มาและสูตรก่อนใช้

### 04 — สร้าง nationwide benchmark และเก็บ cohort version

ใช้ UUID ทั้งประเทศชุดเดียว 7,954 แห่ง แต่แต่ละ metric คำนวณเฉพาะค่าที่ valid จริง เก็บ validN, missingN, observedZeroN, cutoff และ cohort hash พร้อม source release ใช้ `PERCENTILE.INC` บน raw values ไม่ปัดก่อนคัด

```text
sorted = known valid metric values from fixed national cohort
r = (n - 1) * percentile / 100
cutoff = sorted[floor(r)] + (r - floor(r)) *
         (sorted[ceil(r)] - sorted[floor(r)])
```

midrank สำหรับ display/ranking แยกจาก cutoff และเกณฑ์ raw-value comparison ถ้า cohort เล็กหรือไม่มี variation ให้แสดงว่าแยกพื้นที่ได้จำกัด ไม่มี silent rebaseline ตามจังหวัด/แบรนด์ Fuel literal-zero policy เดิมคงไว้ ส่วน Grocery/Non-bank เปิด positive guard ตาม preset

**รับงานเมื่อ:** filtering จังหวัด/แบรนด์ไม่เปลี่ยน cutoff; ties/P100/zero/missing test ผ่าน; cohort diagnostics ไม่สลับฐานเริ่มต้น

### 05 — ทำ Demand engine และ preset 3 ธุรกิจ

implement จาก `runtime-parameter-presets.json` และ `criteria-proposal.v1.6.json` ไม่ hardcode ชื่อแบรนด์ในสูตร Fuel ใช้ all/any และ threshold-hit-count; Grocery/Non-bank ใช้ paths แบบ AND ภายใน OR ระหว่าง paths

ใช้ three-valued logic: AND มี false → false, ทุกข้อ true → true, นอกนั้น unknown; OR มี true → true, ทุกข้อ false → false, นอกนั้น unknown Tier ที่ยืนยันคือค่าดีที่สุดของ path ที่ true เท่านั้น เก็บ `possibleBetterTier` แยกเมื่อ missing อาจทำให้ผลแรงขึ้นได้

**รับงานเมื่อ:** จำนวน proxy-high ใน default snapshot ตรง independent model: Fuel 1,067 / Grocery 2,859 / Non-bank 2,298 ก่อน supply strategy filter; missing ไม่ promoteTier; ปิด metric/group แล้วไม่มีผลหลงเหลือ

### 06 — ทำ Supply adapter ให้ตรงธุรกิจและ uncertainty

Fuel แยกแบรนด์เรา/อื่น/brand-only unknown; Grocery แยก brand+format+pharmacy; Non-bank ใช้ legalCompany+active license union เป็น potential scope แยก company-license จากบริการระดับ point

Non-bank เก็บ own/other assigned counts กับจังหวัด/บริษัท residual เป็น upper possibility ของแต่ละพื้นที่ ไม่กระจาย residual เป็นยอดจริงทุกพื้นที่ ไม่ใช้ unknownBrand allocation ของ Fuel กับ office ที่ไม่ทราบพื้นที่/function/product

**รับงานเมื่อ:** assigned0 ไม่กลายเป็น guaranteedLESS หาก residual ทำให้มากได้; own/other comparator sets ไม่ทับกัน; multiplelicenses union IDs ไม่เพิ่มจำนวนซ้ำ; source totals ไม่เปลี่ยนจาก CRUD draft

### 07 — แยก classify, filter และ rank

mapping 8patterns คงเดิม เก็บ `possiblePatterns` กับ `patternKnown` แยกกัน Preferred patterns ถ้าครอบคลุมทุกความเป็นไปได้ → filter ยืนยันได้; ครอบคลุมบางแบบ → reviewcandidate; ไม่ครอบคลุมเลย → excluded Demandunknown ไม่เป็น Yolk

Fuel weighted70/20/10 คงเดิม Grocery/Non-bank เริ่ม context-order ก่อน ให้ user เลือก weighted และปรับ top/group/metricweights ได้ Missingweight คงไว้เป็นช่วง[0,100]ไม่ normalize ทิ้ง Supply bounds ต้องใช้ joint allocation ที่ใช้ได้จริง

**รับงานเมื่อ:** weights เปลี่ยน rank แต่ไม่เปลี่ยน membership; deterministicties; exactpatternunknown แต่ guaranteedpreferencemembership ทำงาน; reviewcandidate ไม่ปนรายชื่อ confirmed

### 08 — ต่อหน้าเกณฑ์และ preview diff

รักษา 4 หมวด Demand / Supply / รูปแบบทำเลที่สนใจ / การจัดอันดับ Metric picker เริ่มที่ dataset แล้วแสดง metric, formula, unit, coverage, period Parameter defaults มาจาก profile user เปลี่ยน percentiles/count/minimum/groupoperator/weights ได้ใน scope ตนเอง

draft แสดงเพิ่ม/หาย/ยังต้องตรวจและอันดับก่อนกดใช้กับทีม validate ก่อน commit ส่ง`baseRevision`เพื่อป้องกัน editor คนอื่นแก้ทับ

**รับงานเมื่อ:** badformula หรือ zero-weight ทั้งหมดบันทึกไม่ได้; TH/EN อ่านสูตรเดียวกัน; reload/theme/brand ไม่ทำ draft หาย; conflicts ให้ merge/retry อย่างชัดเจน

### 09 — ต่อ map, detail และ CRUD เดิม

ประเทศใช้ provincegeometry จริงและ legend ที่ตรง metric แสดง no-data/ไม่มีทำเลผ่านต่างกัน Detail ใช้ actual sourcepolygon ที่มี provenance, POI เฉพาะที่ผูกได้, bboxfit-only และ coverage เมื่อยังไม่มี boundary อย่าวาดกรอบให้เหมือนพื้นที่จริง

Location/BranchCRUD, customfields, owner/status, photosmax5 ต้องผ่าน servervalidation/revisionlock ก่อนกระทบยอดให้ snapshot/overlay แยกกัน 5 รูปใน demo คือ mockup ไม่ใช่รูปสาขาจริง

**รับงานเมื่อ:** mobile320/390 และ desktop1440 ทั้ง TH/EN/light/dark เห็น layout จริง; logo ไม่ครอบกรอบ; icon ไม่แสดง ligature ดิบ; contrast/legend คง dataHEX; basemap มี attribution; unsafeuploads ถูกปฏิเสธ

### 10 — ต่อ RBAC, events, notifications และ shared work

server บังคับ 10seats=1Admin/3Editors/6Viewers ทุก mutation ที่สำเร็จเขียน event+outbox ใน transaction เดียวพร้อม actor/time/diff/entity/revision ไม่มี privatePII notification dedupe ตาม eventId; permissioncheck ก่อน email/LINEshare

feed ผูก page/entity และ globalactivity leaderboard นับ action สำเร็จตามชนิด/ช่วงเวลา ไม่ให้ spam คลิกสร้างคะแนน privateview/theme/language/draft ไม่มี teamevent

**รับงานเมื่อ:** viewer แก้ไม่ได้ทุก API, tenantleaktests ผ่าน, committedaction มี event ครั้งเดียว, retry ไม่แจ้งซ้ำ, sharedlink ไม่ข้าม permission

### 11 — วัดผลและปรับ preset ด้วยหลักฐาน

เริ่มวัดเวลาจนได้ shortlist, %ทำเลที่ทีมตรวจแล้ว, coverage ที่ดีขึ้น, การรับ/ปฏิเสธทำเลพร้อมเหตุผล เมื่อมี businessoutcomes จึงเทียบ preset กับ baseline บนพื้นที่/เวลาที่แยกไว้ ไม่ใช้ traininginputs ประเมินตัวเอง

แยกผลจริงของ Grocery ตาม format/mission, Non-bank ตาม product/channel และ Fuel urban/corridor เพิ่ม profileversion อย่างมี migration ไม่มี threshold ที่ชนะทุกแบรนด์จาก publicdata เพียงอย่างเดียว

**รับงานเมื่อ:** calibrationdataset และ holdoutversion ชัดเจน; metrics ไม่อ้าง sales/loanprediction ก่อนมี validation; releaseevidence ระบุสิ่งที่ตรวจจริงและงานที่ยังเปิด

## สั่ง coding agent ให้ทำได้มีประสิทธิภาพ

ใช้หนึ่ง task ต่อหนึ่งงานที่รับได้ ห้ามเริ่มจากเขียนระบบทั้งหมดใน prompt เดียว ตัวอย่าง:

```text
ทำ Task 05 จาก contracts/implementation-tasks.v1.6.json
อ่าน AGENTS.md, product.v1.6.json, criteria-proposal.v1.6.json และ runtime-parameter-presets.json
reuse existing modules ที่ Task00 map ไว้ ห้าม redesign UI หรือเพิ่ม industry
implement pure demand evaluator + presets พร้อม three-valued logic
test threshold boundary, missing, ties, disabled groups และ national benchmark invariance
รายงาน files changed, commands/results, source/version และ acceptance ที่ผ่าน/ยังไม่ผ่าน
หยุดก่อน publish หรือส่งข้อมูลออกภายนอกถ้า task ไม่ได้ authorize
```

machine tasks ระบุ dependencies, inputs, outputs, acceptance, test IDs และ prompt ใช้ reference ที่มีจริง ไม่ทำเครื่องหมาย productionwork ว่าเสร็จเพราะ staticprototype ทดลองได้
