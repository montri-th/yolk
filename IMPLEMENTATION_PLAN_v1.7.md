---
document_id: yolk.implementation.three_industries
version: 1.7.1
date: 2026-10-04
machine_tasks: contracts/implementation-tasks.v1.6.json
product: CityMETER_Yolk_Product_Statement_v1.7.md
entrypoint: prototype/index.html
status: prototype_exists_production_work_remaining
product_contract: contracts/product.v1.7.json
experience_contract: contracts/workspace-map.v1.7.json
brand_contract: contracts/brand-experience.v1.7.json
---

# แผนพัฒนา Yolk — เริ่มจากของเดิม ทำทีละงานที่ตรวจได้

พรีวิวเป็น HTML/CSS/JavaScript ที่ทำงานจริงกับ snapshot สาธารณะ ไม่ใช่ backend production ให้ต่อยอด UI และ model ที่มี แล้วเชื่อมระบบ CityMETER เดิม งานนี้รองรับเพียง Fuel, Grocery และ Non-bank

อ่าน [Product statement](CityMETER_Yolk_Product_Statement_v1.7.md) → [product contract v1.7](contracts/product.v1.7.json) → [Criteria guide](docs/CRITERIA_GUIDE.md) → [machine tasks v1.6 ที่รักษาไว้](contracts/implementation-tasks.v1.6.json) ก่อนเริ่ม งานแผนที่ปัจจุบันใช้ [workspace-map contract](contracts/workspace-map.v1.7.json) สูตร/criteria/model และ national cohort v1.6 เป็น baseline ส่วน brand-family overrides อยู่ใน registry v1.7 เอกสารและ tests เก่าเป็นประวัติตามรุ่นที่ระบุ

## งานเพิ่มในรุ่น 1.7 — identity และ preset รายแบรนด์

1. โหลด `prototype/data/brand-presets.v1.7.json` และ `brand-logos.v1.7.json` ก่อน render; ปฏิเสธ registry ที่อ้าง ID หรือ metric นอก catalogue
2. ใช้ source brand ID เป็น join key และ tenant + brand + scope + profile version เป็น criteria context ไม่ใช้ชื่อหรือโลโก้รวมบริษัทเข้ากลุ่มเอง
3. เมื่อเปิดแบรนด์ครั้งแรก เลือก format หลักที่ระบุใน registry แล้ว seed ค่า industry baseline + family overrides หากมีค่าหรือ draft เดิม ให้เรียกกลับมาโดยไม่แทนทับ
4. จำ format ล่าสุดแยกตามแบรนด์ เปลี่ยน brand แล้วไม่ใช้ format จาก brand ก่อนหน้า รายการ format ต้องมีอยู่จริงใน source inventory
5. ให้ปุ่มลอง preset เปลี่ยน draft เท่านั้น ประเมินด้วย evaluator เดิม แล้วใช้ Apply transaction เดิมเพื่อบันทึกหนึ่ง criteria event ตรวจ version conflict และ rollback เหมือนเดิม
6. แสดงโลโก้ต้นฉบับพร้อมชื่อใน native dialog; official light/dark variants เปลี่ยนตามธีม มี search, Escape, focus return และ target อย่างน้อย 44px ชื่อที่ยังยืนยัน mark ไม่ได้ใช้ไอคอนกลาง
7. เปลี่ยนความหมายที่ผู้ใช้เห็นเป็น O/Our stores กับ C/Competitors โดยรักษา serialized keys เดิม ใช้ `egg_alt` จากชุด Material Symbols เดิมแทน o พร้อม fallback ตัวอักษรเมื่อฟอนต์โหลดไม่สำเร็จ
8. รัน `node scripts/check-brand-presets.cjs` และ regression ที่มีอยู่ ตรวจไทย/อังกฤษ จอแคบ/desktop สองธีม ตรวจ logo bytes + MIME + dimensions ตาม manifest แล้วค่อย seal/deploy/ตรวจเว็บจริง

**รับงานเมื่อ:** เลือกแบรนด์แล้ว format, preset, Supply identity และแผนที่ตรงกัน; ค่าเดิมไม่หาย; การลองไม่สร้าง event; Apply สร้าง event เดียว; missing/ช่วงรอตรวจยังอ่านได้ มีรายละเอียดและ machine contract ใน [คู่มือแบรนด์](docs/BRAND_PRESETS_v1.7.md)

## โครงที่มีอยู่แล้ว

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `prototype/index.html`, `app.js` | shell, routes, render และ interaction เดิม |
| `prototype/bootstrap.js` | โหลด context/profile/supply ของธุรกิจที่เลือก ก่อนเปิด UI |
| `prototype/industry-workspace.js` | adapter ธุรกิจ/แบรนด์/scope, draft แยกบริบท, POI และ geometry |
| `prototype/metrics.js`, `model.js` | metric catalogue, percentile, Tier, patterns, filter และ rank |
| `prototype/relative-supply.js` | YolkRelativeSupply API, ตัวหาร 6 metric, rate/count-equivalent thresholds และ national median/fallback seed |
| `contracts/industry-profiles.json` | profile ที่ runtime ใช้; ต้องตรวจเทียบกับ proposal/presets |
| `contracts/criteria-proposal.v1.6.json` | ความหมาย metrics, สูตร, cohort, ข้อจำกัด และกติกาตั้งต้นครบ |
| `prototype/data/real/*` | snapshot ที่ normalize สำหรับเดโม ไม่มี live sync |
| `landscape.js`, `location-map.js`, `supply-ui.js`, `branch-photos.js` | market evidence, map, CRUD และ photo drafts เดิม |
| `theme.js`, `icons.js`, `prototype/assets/*` | ธีม ฟอนต์ โลโก้ ไอคอนและภาพตัวอย่างตาม role |
| `prototype/workspace-map.js`, `workspace-map.css`, `workspace-layout.css` | แผนที่เดียวทุก route, layers/geometry/POI, persistent viewport และ responsive layout |
| `prototype/criteria-controls.js`, `criteria-controls.css` | แถบเลื่อนคู่ช่องกรอกค่า เชื่อมกลับ interaction เดิมโดยไม่เปลี่ยนสูตร |
| `contracts/workspace-map.v1.7.json`, `docs/PERSISTENT_MAP_v1.7.md` | สัญญาแผนที่ปัจจุบันและ acceptance แยกจากสูตร v1.6 |
| `prototype/data/brand-presets.v1.7.json`, `brand-logos.v1.7.json` | preset/format รายแบรนด์และต้นฉบับ logo พร้อม provenance/theme variants |

`criteria-map.js` ยังมี adapter สำหรับตัวควบคุมบางส่วน แต่ไม่ใช่ owner ของแผนที่หลัก อย่าสร้าง Leaflet instance เพิ่มใน route renderer ตาม layout เก่า

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

**รับงานเมื่อ:** baseline v1.6 ตรง independent model ของ baseline นั้น ส่วน brand-family overrides v1.7 ต้องเทียบ evaluator ตาม source/context/criteria hash ที่ใช้จริง ไม่ยึดจำนวนผล baseline เป็นจำนวนที่ทุกแบรนด์ต้องได้ Missing ไม่ promote Tier; ปิด metric/group แล้วไม่มีผลหลงเหลือ

### 06 — ทำ Supply adapter ให้ตรงธุรกิจและ uncertainty

Fuel แยกแบรนด์เรา/อื่น/brand-only unknown; Grocery แยก brand+format+pharmacy; Non-bank ใช้ legalCompany+active license union เป็น potential scope แยก company-license จากบริการระดับ point

Non-bank เก็บ own/other assigned counts กับจังหวัด/บริษัท residual เป็น upper possibility ของแต่ละพื้นที่ ไม่กระจาย residual เป็นยอดจริงทุกพื้นที่ ไม่ใช้ unknownBrand allocation ของ Fuel กับ office ที่ไม่ทราบพื้นที่/function/product

**รับงานเมื่อ:** assigned0 ไม่กลายเป็น guaranteedLESS หาก residual ทำให้มากได้; own/other comparator sets ไม่ทับกัน; multiplelicenses union IDs ไม่เพิ่มจำนวนซ้ำ; source totals ไม่เปลี่ยนจาก CRUD draft

### 07 — แยก classify, filter และ rank

mapping 8patterns คงเดิม เก็บ `possiblePatterns` กับ `patternKnown` แยกกัน Preferred patterns ถ้าครอบคลุมทุกความเป็นไปได้ → filter ยืนยันได้; ครอบคลุมบางแบบ → reviewcandidate; ไม่ครอบคลุมเลย → excluded Demandunknown ไม่เป็น Yolk

Fuel weighted70/20/10 คงเดิม Grocery/Non-bank เริ่ม context-order ก่อน ให้ user เลือก weighted และปรับ top/group/metricweights ได้ Missingweight คงไว้เป็นช่วง[0,100]ไม่ normalize ทิ้ง Supply bounds ต้องใช้ joint allocation ที่ใช้ได้จริง

**รับงานเมื่อ:** weights เปลี่ยน rank แต่ไม่เปลี่ยน membership; deterministicties; exactpatternunknown แต่ guaranteedpreferencemembership ทำงาน; reviewcandidate ไม่ปนรายชื่อ confirmed

### 08 — แผนที่เดียวทุกเมนู: ทำ 6 ขั้นที่ตรวจได้

อ่าน [workspace-map contract](contracts/workspace-map.v1.7.json), [คู่มือ](docs/PERSISTENT_MAP_v1.7.md) และ API จริงใน `prototype/workspace-map.js` ก่อนทำงาน คงสูตรและ criteria scope เดิม ไม่ออกแบบ engine ใหม่เพื่อให้แผนที่ดูมีผลมากขึ้น

1. **Mount ครั้งเดียวใน shell:** วาง `#workspace-map-panel` / `#workspace-map` ภายนอก `#content` ที่ route renderer เปลี่ยน เรียก `YolkWorkspaceMap.mount({onNavigate, onArea, onPoi})` แบบ idempotent ให้ reuse Leaflet instance เดิม `onProvince` เป็น legacy fallback เมื่อไม่มี `onNavigate` Desktop ให้แผนที่เป็นพื้นที่หลักและแผงงานเลื่อนแยก; mobile ให้แผนที่ sticky เหนือข้อมูล `invalidateSize({pan:false})` ใช้เมื่อ layout เปลี่ยน ไม่สร้าง instance ใหม่
2. **Sync ผลโดยไม่ refit:** เรียก `sync()` หลัง render/เปลี่ยนชั้นข้อมูล/เปลี่ยนธีม ใช้ `snapshot()` ของ evaluator เดิมเทียบ team/draft ตาม ID ชุด eligible/baseline/added/removed/review/rank แยกกัน หน้าเกณฑ์ใช้ draft ที่ valid; หน้าอื่นใช้ applied criteria `pending()` บอกสถานะระหว่างรอและ `setLayer()` เปลี่ยนมุมมองเท่านั้น คง center/zoom และ fixed cohort ให้สีพื้นที่เป็น Tier ยืนยันดีที่สุดของ eligible Yolk ในกลุ่มที่แสดง ด้วย native `li.demand` **T3 #F1F5E5 / T2 #60C9AD / T1 #25659A** ทั้งสองธีม ไม่ใช้ maximum percentile หรือ rank score
3. **Drill/focus เมื่อผู้ใช้เลือกเท่านั้น:** ใช้ `navigate(path,{fit:true,notify:true})` โดย `path.level` เป็น `country`, `province`, `district` หรือ `location`; ฟิลด์ที่เกี่ยวข้องคือ `provinceCode`, `districtId`, `districtName`, `areaId` ตัวอย่างที่รันได้คือ `navigate({level:'province',provinceCode:'10'},{fit:true,notify:true})` ใช้ `back()`, `getNavigation()`, `areaMatchesNavigation(areaOrId)` และ `navigationLabel()` ตาม controller จริง ต่อ `onNavigate(path)` ครั้งเดียว ไม่เรียก legacy `onProvince` ซ้ำ Country choropleth ใช้อำเภอ; province/district ใช้ fine areas; location จึงใช้ O/C/U ที่ผ่าน `poiMatchesNavigation(p)` เปิด detail ใหม่ใช้ `focusArea(id)` / `focusPoi(id)`; `home()` คืนประเทศ; `setBasemap(id)` เปลี่ยน tile โดยไม่ refit Crosswalk สำหรับมุมมองพื้นที่ใช้ source IDs หรือ verified spatial intersection ที่มี provenance/version รองรับ multi-district ไม่ parse รหัสเทศบาลหรือเดาจากชื่อ/bbox/centroid ไม่ใช้เป็นการรับรองเขตปกครอง แสดง polygon เมื่อมี หรือ extent เส้นประไม่เติมสี คง coverage รายระดับ
4. **Guard ค่าผิด ข้อมูลค้าง และผลเก่า:** ตรวจ `criteriaErrors(draft)` ก่อน sync ผลใหม่ ช่องว่าง/NaN ไม่เป็น 0 คงผลล่าสุดที่ valid พร้อมสถานะ; ปิด Apply จน valid ตรวจ loading/error ของ industry, province geometry, fine geometry, points และ tiles แยกกัน ข้อมูลแบรนด์ใหม่โหลดไม่สำเร็จต้องซ่อนผลเก่า Async focus จับ ticket+contextKey+route ก่อน await และยกเลิกเมื่อเปลี่ยนบริบท/งาน/ลากแผนที่/เลือกใหม่
5. **Buffer ฟอร์มและตัวปรับค่า:** ใช้ range คู่ exact input พร้อมหน่วย/ขอบเขตและ validator เดิม รวมผลระหว่าง `input` ประมาณ 120 ms แล้ว flush เมื่อ `change` โดยไม่ render ทั้งฟอร์มทุก tick ใช้ `workingForm()` / `restoreWorkingForm()` ใน `app.js` เก็บค่าฟอร์มเดิม, province select, focus และ cursor เฉพาะ route hash/context เดิม ไม่ส่งร่างให้อีกสาขา/แบรนด์ รูปใช้ photo-module draft แยก ไม่ reconstruct file input ก่อน Apply ไม่มี event; commit ตรวจ revision แล้วเพิ่ม event เดียว
6. **QA ให้ตรง artifact จริง:** รัน `node scripts/check-workspace-map.cjs`, `check-brand-presets.cjs`, `check-three-industry.cjs`, `check-criteria-controls.cjs` และ `check-photo-runtime.cjs` ตามขอบเขต ตรวจ browser จริง TH/EN light/dark ที่ mobile/desktop ทุก route: คงแผนที่/zoom, drill และกลับระดับ, popup ใกล้ขอบ, keyboard/touch, ฟอร์มค้าง, slider/exact equality, invalid draft, context switch และ provider failure แนบ receipt ของ commit ที่รับ ไม่ใช้ model/DOM checks แทน visual review

**รับงานเมื่อ:** instance ไม่ถูกทำลายเมื่อเปลี่ยนเมนู; ordinary sync ไม่ refit; ภาพเปลี่ยนตรง eligible ID sets; weights เปลี่ยนอันดับแต่ไม่เปลี่ยน membership; Tier/neutral/review ไม่ปะปน; ขอบเขต/crosswalk มี provenance และ coverage; pending/error ไม่กลายเป็น 0 หรือข้อมูลเก่าของแบรนด์ใหม่; ฟอร์มค้างไม่หาย; map gestures/preview ไม่สร้าง mutation/event; Apply สร้าง event เดียว

อ่าน [boundary provenance](prototype/data/real/boundary-provenance.v1.7.json) สำหรับ raw repair, simplify และ valid-unsimplified fallback ขอบเขตที่เตรียมแสดงผลไม่ใช้แทน metric หรือตัวหาร `base.areaSqm` เดิม และไม่เป็นการรับรองเขตทางกฎหมาย Fine geometry โหลด lazy ตามจังหวัด (รวม 30.38 MB, ไฟล์ใหญ่สุด 1.18 MB); district 6.70 MB และ index 3.78 MB ไม่ preload fine ทุกไฟล์

**ต่อ production เมื่อข้อมูลโตขึ้น:** map Task 00 ให้ spatial API และ worker/บริการคำนวณที่มีจริง ทุกคำขอแนบ requestId, context, source release, cohort และ criteria hash รับเฉพาะผลล่าสุดที่ตรงบริบท Cache ตาม release/revision; ไม่คำนวณ percentile ใหม่ตามกรอบแผนที่ เพิ่ม clustering/server viewport queries โดยคงจำนวนและพิกัดที่ตรวจได้ ทั้ง API, worker, cross-reload map preferences และ shared state เป็นงานต่อยอด ไม่ใช่ข้อพิสูจน์จาก static preview

Native MVT เป็นทางเลือกต่อยอดเมื่อผ่าน coverage gate ปัจจุบันยังใช้ local GeoJSON; tile zoom 0 ไม่ใช่หลักฐานว่าข้อมูลครบทั้งประเทศ

### 09 — ต่อ map, detail และ CRUD เดิม

ใช้ [source display geometry/provenance](prototype/data/real/boundary-provenance.v1.7.json) ตามระดับประเทศ→จังหวัด→อำเภอ→ทำเลที่ source/crosswalk ตรวจได้ พร้อม legend ที่ตรง ordinal Tier แยก no-confirmed-match กับข้อมูลรอตรวจ หากข้อมูล geometry โหลดไม่สำเร็จ ให้แสดงข้อจำกัดและรายการที่ใช้ได้ ไม่สร้าง polygon เอง Detail ใช้ source polygon เมื่อมี หรือ source extent เส้นประไม่เติมสีที่ระบุว่า fit-only แสดง POI เฉพาะพิกัดที่ใช้ได้ ไม่ใช้ตำแหน่งในกรอบภาพรับรอง point-in-polygon

Location/BranchCRUD, customfields, owner/status, photosmax5 ต้องผ่าน servervalidation/revisionlock ก่อนกระทบยอดให้ snapshot/overlay แยกกัน 5 รูปใน demo คือ mockup ไม่ใช่รูปสาขาจริง

Selected fine view ใช้ `fill=false` เน้นเส้นขอบ/label/status ให้เห็น basemap; country/province/district analytical fills คง exact HEX/full opacity จุด unassigned ที่พิกัดผ่าน actual source-polygon predicate เป็น view-only ห้ามเขียน area UUID หรือแก้ aggregate จากการแสดงผล เมื่อ save รอ photo processing ให้จับ contextKey/route/recordId/revision และตรวจซ้ำหลัง await ยกเลิกผล stale โดยไม่ mutate/rollback POIs ของบริบทใหม่

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
อ่าน AGENTS.md, contracts/product.v1.7.json, criteria-proposal.v1.6.json และ runtime-parameter-presets.json
reuse existing modules ที่ Task00 map ไว้ ห้าม redesign UI หรือเพิ่ม industry
implement pure demand evaluator + presets พร้อม three-valued logic
test threshold boundary, missing, ties, disabled groups และ national benchmark invariance
รายงาน files changed, commands/results, source/version และ acceptance ที่ผ่าน/ยังไม่ผ่าน
หยุดก่อน publish หรือส่งข้อมูลออกภายนอกถ้า task ไม่ได้ authorize
```

machine tasks ระบุ dependencies, inputs, outputs, acceptance, test IDs และ prompt ใช้ reference ที่มีจริง ไม่ทำเครื่องหมาย productionwork ว่าเสร็จเพราะ staticprototype ทดลองได้

สำหรับงานแผนที่ ใช้ prompt ที่มีขอบเขตเล็กกว่านี้:

```text
ทำขั้น 08.2–08.4 ตาม contracts/workspace-map.v1.7.json
อ่าน prototype/workspace-map.js, workspace-map.css, workspace-layout.css,
criteria-controls.js, app.js และ evaluator ใน model.js
คง analytical profiles v1.6, source grain, national cohort และ scope ของ draft เดิม
ใช้ instance เดิม เชื่อมผลล่าสุดเข้ากับ map/list โดย ordinary sync ไม่ refit
คง ordinal li.demand Tier และแยก neutral/review; drill ใช้ source codes/crosswalk จริง
ทดสอบ ID-set diff, weights-only rank, invalid input, stale focus และ context switch
รายงาน tests ที่รันจริงกับ rendered states ที่ยังต้องตรวจ ห้ามอ้าง production API/worker มีแล้ว
```


### งานเพิ่มที่อนุมัติในรุ่นนี้: Supply ต่อขนาดตลาด

อ่าน [Supply-relative definition](docs/SUPPLY_RELATIVE_PROPOSAL.md) และ model contract ที่เชื่อมไว้ นิยามอนุมัติแล้ว: Fuel สาขา/GFA 100,000 ตร.ม.; Grocery/Non-bank สาขา/ประชากร 10,000 คน มีตัวหารเดียวต่อ preset ที่ปรับได้ ไม่ใช้ Demand percentile/rank score เกณฑ์มากของเรา/คู่แข่งแยกกันจาก national median ของ positive rates ที่มี observed exact counts ไม่รวม uncertainty bounds มี minimum sample และ fallback ที่เปิดเผย

Model/UI รุ่นนี้ใช้ `prototype/relative-supply.js` และ `window.YolkRelativeSupply` แล้ว รัน `node scripts/check-relative-supply.cjs` พร้อม regression/model/browser checks บริบทใหม่เริ่ม relative; บริบทที่เคยบันทึก count คงเดิม โหมด count เป็นทางเลือก การเปลี่ยนโหมดเป็น draft และ Apply ตาม scope เดิม ไม่ migrate เกณฑ์ทีมโดยเงียบ ๆ Static model/UI ไม่ใช่ shared backend และไม่แทน browser/release evidence

### ขอบเขตการส่งงาน

ส่ง changes, source/contract versions, commands/results, browser evidence และ acceptance ที่ยังเปิด ไม่ทำเครื่องหมาย production backend หรือ geometry ครบทุกระดับว่าเสร็จเพราะ local preview เปิดได้ งาน deploy ต้องตรวจ provider และ live artifact แยกจาก source checks

## งานเพิ่มในรุ่น 1.7.1 — ความลื่นของแผนที่และ popup

ทำตาม [ขั้นตอน RESP-00 ถึง RESP-05](docs/RESPONSIVENESS_v1.7.1.md) และ [เกณฑ์รับงานสำหรับ dev](contracts/responsiveness.v1.7.1.json) แยกการเลื่อนแผนที่ออกจากการคำนวณเกณฑ์ เก็บ marker เดิมด้วย ID ประกอบสาขาต้นทางกับบันทึกทีมให้ครบ และทิ้งผลโหลดที่มาช้าหลังผู้ใช้เปลี่ยนงานแล้ว

ใช้ popup module ร่วมกับ brand ID และบัญชีโลโก้ที่ตรวจแล้ว รัน regression ใหม่พร้อมชุด model/map/photo/save-context เดิม ตรวจ popup ที่เรนเดอร์จริงทั้งไทย/อังกฤษ สว่าง/มืด และจอแคบ/desktop ก่อนเผยแพร่
