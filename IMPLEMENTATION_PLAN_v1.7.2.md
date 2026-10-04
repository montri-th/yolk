---
document_id: yolk.implementation_plan.map_analysis
version: 1.7.2
date: 2026-10-04
status: ready_with_open_manual_gate
machine_tasks: contracts/map-analysis.v1.7.2.json#/tasks
product_authority: contracts/product.v1.7.json
retained_production_tasks: contracts/implementation-tasks.v1.6.json
---

# พัฒนา Yolk ทีละงาน — แยกดูตลาด แล้วคัดทำเล

เริ่มจาก UI/stack เดิมและโมเดล v1.7 รุ่น 1.7.2 เพิ่มมุมมองวิเคราะห์ส่วนตัวและข้อมูลอำเภอจากต้นทาง คง national fine cohort, ranking, ขอบเขตเกณฑ์ทีม และความหมายของข้อมูลที่ยังไม่แน่นอน การเพิ่มมุมมองไม่ใช่การเปลี่ยนสูตรคัด

อ่าน [Product statement](CityMETER_Yolk_Product_Statement_v1.7.2.md), [human guide](docs/MAP_ANALYSIS_v1.7.2.md) และ [machine tasks](contracts/map-analysis.v1.7.2.json) ควบคู่ AGENTS/START_HERE ก่อนแก้ Production foundation 00–11, CRUD/RBAC/media/outbox และ metric engine ยังคง [แผนv1.7](IMPLEMENTATION_PLAN_v1.7.md) / [tasks baselinev1.6](contracts/implementation-tasks.v1.6.json)

## งานเพิ่มรุ่นนี้ — ทำตาม dependency

| Task | งาน | ตรวจรับก่อนส่งต่อ |
|---|---|---|
| **ANALYSIS-00** | Freeze baseline source/criteria/brand/context และ 7,954fine/25metrics | View change ไม่เปลี่ยน evaluator/source totals หรือ saved drafts |
| **ANALYSIS-01** | รับ direct native D928/P77 + direct denominator/provenance | UUID ตรง hierarchy, ทุก dimension D→P→country reconcile, zero/missing แยก, ไม่มี private raw/logs |
| **ANALYSIS-02** | Pure value/prepare adapter + units/intervals/bins/scales | N, N/km², N/market×unit ตรง; same-grain national cuts; review ไม่ทาสีเหมือน exact |
| **ANALYSIS-03** | `#demand`: pure Tier + raw metrics | ไม่กรอง maxTier/preferred/Supply; country raw เป็น maximum fine ที่ติด label |
| **ANALYSIS-04** | `#supply`: role×count/area/market, CRUD เดิม | Native D ประเทศไม่ sum crosswalk; filter personal; map/hover/basemap/selected outline/popup คงเดิม |
| **ANALYSIS-05** | Counts บน 8 pattern cards ก่อน checkbox selection | “ทำเลเข้าเกณฑ์” ยืนยัน 1 pattern; “ทำเลรอตรวจ” อาจซ้อนหลาย pattern; Demand/Tier gates retained; invalid dash |
| **ANALYSIS-06** | Regression + bounded native UI | 179 baseline + 3 new commands มี receipt จริง; native UI ระบุคู่ภาษา/ธีมและ viewport ที่ตรวจจริง; source/model/view semantics preserved |
| **ANALYSIS-07** | Seal / verify / publish โดย root | Explicit public allowlist, private acquisition absent, terminal deployment/live bytesก่อน publication claim |

งาน03/04 ทำหลัง02; งาน05ทำคู่กับ01/02ได้หลัง00; งาน06รอ03/04/05 และงาน07รอ06 อย่า seal ระหว่าง source/data/QA ยังแก้

## วิธี implement ที่ dev ต่อได้ตรงกัน

1. **โหลดข้อมูลแยก grain:** Five compact files ใน `prototype/data/real/` สำหรับ district context, three Supply adapters และ public provenance Fine loaders เดิมอยู่ต่อ Data source/catalog ระบุ UUID, units, state, URL/date/hash อย่า derive district count จาก 45 multi-parent fine links
2. **คำนวณแบบ pure:** `YolkMapAnalysis.value(row,state,criteria)` คืน exact value หรือ interval/state; `prepare(...,{cohortId,cohortRows,metricCatalog})` จัด classes/legend จาก cohort ระดับเดียวกัน Mode/filter ไม่เขียน criteria, assignment หรือ event
3. **คง distinction ของตัววัด:** Raw Demand country maximum ไม่ใช่ native district aggregate Supply native D ใช้ counts และ denominators Dโดยตรง; ห้ามใส่ fine Non-bank residual/Grocery bounds ลง D
4. **ต่อ UI กับ mapเดิม:** `YolkAnalysisUI` จัด state/controls/pages/districtRows; map controllerเป็นเจ้าของ Leaflet instance/navigation Retain RAF, stable POI ID, source polygon hover, transparent selected interior และ context guards รุ่น1.7.1
5. **ต่อ pattern counts:** `YolkDecisions.patternCounts(criteria,fullNationalRows)` ใช้ Demand/Tier gatesก่อนpreferred-checkbox Count review แยกและแสดง overlapping cue Loading/invalidแสดงdash ไม่มี silent0
6. **อ่าน source states ก่อน render:** Missing/nonpositive denominator ไม่หาร Review intervalsไม่ใช้lowpaint UnknownDemandไม่ qualify Labelsบอก numerator,denominator,normalization,unit,grain,period/coverage และ scale reuse
7. **รับงานด้วย output:** Diff ordered source/evaluator rows ของ contextsเดียวกันก่อน/หลัง เกณฑ์และ source fine hashesควรตรง baseline ยืนยัน count/rank semantics แล้วดู browserจริง Layout/hash/adapterchecksไม่ใช้แทนกัน

## ผลcurrent checks

14 scripts ของรุ่นนี้ผ่าน 217 checks: baseline 179 ข้อที่รันใหม่, map analysis 14 ข้อ, pattern counts 14 ข้อ และ integration 10 ข้อ การเทียบข้อมูลอำเภอ/จังหวัดกับต้นทางผ่าน 6 checks / 56,507 comparisons จาก public reads 391 ครั้งที่สำเร็จครบ ดู [ผลตรวจรุ่นนี้](evidence/release-checks-v1.7.2.json) และ [ผลตรวจต้นทาง](evidence/district-source-checks-v1.7.2.json) Native Chrome ผ่านแบบจำกัดขอบเขต: ไทย/dark และอังกฤษ/light ที่ 1,440×900 และ 390×844 ตาม [browser receipt รุ่นนี้](evidence/browser-v1.7.2/native-browser-review.json) ไม่ใช่ full language/theme matrix หรือเครื่องมือถือจริง Provider/live-byte proof ยังรอ release owner

Supply เริ่มที่ O+C รวมผู้ให้บริการที่ระบุได้ต่อฐานตลาดตามเกณฑ์ทีมที่ Apply แล้ว Demand ระดับประเทศใช้ Tier ยืนยันที่ดีที่สุดของ fine areas; raw signal แสดงค่าสูงสุดที่ทราบของ fine areas พร้อม label แผนที่ใช้ `minZoom=4` และเผื่อพื้นที่ให้ปุ่มเมื่อสั่ง fit โดยตรงบนมือถือ การอัปเดตตามปกติไม่สั่ง fit กลับ

## คำสั่งและ release hooks

Baseline 11 commands รวม 179 checks ต้องรันใหม่กับ source รุ่นนี้ ผลรุ่นเก่าไม่ใช้แทนการตรวจรับ:

```sh
node scripts/check-three-industry.cjs
node scripts/check-brand-presets.cjs
node scripts/check-workspace-map.cjs
node scripts/check-photo-runtime.cjs
node scripts/check-criteria-controls.cjs
node scripts/check-save-context.cjs
node scripts/check-relative-supply.cjs
node scripts/check-poi-popup.cjs
node scripts/check-map-hover.cjs
node scripts/check-map-responsiveness.cjs
node scripts/check-cold-branch.cjs
node scripts/check-map-analysis.cjs
node scripts/check-pattern-counts.cjs
node scripts/check-analysis-integration.cjs
```

หลัง release owner รับ final QA และ freeze bytes แล้ว:

```sh
python3 scripts/seal-pages-v1.7.2.py --after-final-qa
python3 scripts/verify-pages-v1.7.2.py
```

Seal จัด runtime cache hashes, contract copies ของ root/site และ manifest รุ่นใหม่ ขั้นนี้ไม่เผยแพร่เอง Manifest และ receipts ของรุ่นเก่าคงไว้เป็นประวัติ Workflow deploy เฉพาะ `prototype/` Share image ใช้ภาพที่อนุมัติของตระกูล 1.7 เดิม Release owner เพิ่มผล deployment และการตรวจ bytes บนเว็บหลังเผยแพร่

## Production foundation ที่ยังต้องทำ

Static preview ยังไม่ใช่หลักฐานว่า shared backend หรือการส่งแจ้งเตือนทำงานจริง เริ่ม Task 00 ด้วยการ map กับ CityMETER stack แล้วต่อ schema/context/revision locks, ingestion, safe metric registry, fixed benchmarks, server RBAC สำหรับ 10 seats, shared CRUD ทำเล/สาขา, private media สูงสุด 5 รูป และ event/transactional outbox ที่ป้องกันแจ้งซ้ำ แยก personal views จากการแก้ข้อมูลทีม การแชร์ email/LINE ต้องตรวจสิทธิ์และมี provider receipt เมื่อส่งจริง

Demand profiles และ weights เป็นสมมติฐาน ต้อง backtest และตรวจพื้นที่ก่อนอ้างผลยอดขายหรือสินเชื่อ ใช้ Locale Insight เป็น contextual prior เท่านั้น ไม่แทน official population, statutory boundary, risk หรือพฤติกรรมที่สังเกตจริง แสดงรอบข้อมูลและ coverage ในผลที่ผู้ใช้ตัดสินใจ

## Prompt สำหรับ coding agent

```text
ทำหนึ่ง ANALYSIS task จาก contracts/map-analysis.v1.7.2.json
อ่าน AGENTS/START_HERE/product/workspace-map/brand v1.7 + responsiveness v1.7.1
รักษา fine 7,954 / 25 metrics และ v1.7 evaluator/criteria/saved context/source uncertainty
Demand view ใช้ confirmed tier ก่อน Supply/preferred/maxTier; raw country ต้อง label maximum fine
Supply country ใช้ native 928 D และ direct denominator; ไม่ sum 45 crosswalk links หรือใส่ fine corrections
Analysis filters เป็น personal state; ไม่มี criteria/event/source mutation
คงหนึ่ง Leaflet map, hover/basemap/transparent fine/stable popup/context guards
Pattern counts เป็น national ก่อน checkbox; เก็บ Demand/Tier gate และ overlapping review
ใช้ native DS 0.9.7 classes/units/legend; unknown/invalid แสดง dash ไม่เติม zero
รายงานไฟล์/คำสั่ง/ผลจริง/receipt/scope; ห้าม seal/publish ก่อน final root QA
```
