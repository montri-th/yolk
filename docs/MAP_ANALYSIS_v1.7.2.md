---
document_id: yolk.map_analysis_and_pattern_counts
version: 1.7.2
date: 2026-10-04
status: ready_with_open_manual_gate
machine_contract: ../contracts/map-analysis.v1.7.2.json
baseline: product/workspace-map v1.7 + responsiveness v1.7.1
---

# Demand และ Supply — เห็นตลาดคนละมุม บนแผนที่เดียว

รุ่นนี้เพิ่ม **Demand · หาไข่แดง** และมุมมอง Supply **จำนวน / ต่อพื้นที่ / ต่อฐานตลาด** พร้อมจำนวนทำเลบนการ์ดทั้งแปด ช่วยสำรวจก่อนคัด โดยไม่เปลี่ยนโมเดล fine-area v1.7 หรือเกณฑ์ทีม [Machine contract](../contracts/map-analysis.v1.7.2.json) คือ extension ของ product/map เดิม ไม่ใช่ authority สูตรชุดใหม่

## แยก grain ให้ถูก

| งาน | หน่วยข้อมูล | สิ่งที่ห้ามสรุปแทน |
|---|---|---|
| โมเดลคัดทำเลและ pattern counts | 7,954 fine UUIDs | ไม่เปลี่ยนเป็นโมเดล 928 อำเภอ |
| ประเทศ: Demand Tier | Tier ยืนยันดีที่สุดของ fine areas ที่เชื่อมกับอำเภอ | ไม่ใช่ Tier ที่คำนวณใหม่ทั้งอำเภอ |
| ประเทศ: raw Demand metric | ค่าสูงสุดที่ทราบของ fine areas; label maximum | ไม่เรียกว่าผลรวม/ค่าเฉลี่ยของอำเภอ |
| ประเทศ: Supply | native district counts และ direct district denominator | ไม่ sum fine crosswalk โดยเฉพาะ 45 multi-district links |
| จังหวัด/อำเภอ: Supply | fine-source adapter และ bounds เดิม | ไม่เอา residual/bounds ของ fine ไปใส่ native district |

## API และ state ที่มีจริง

```js
const state = { kind: 'supply', metric: 'market', relation: 'total' };
const one = YolkMapAnalysis.value(row, state, criteria);
const view = YolkMapAnalysis.prepare(rows, state, criteria, {
  cohortId: 'national_928_native_district',
  cohortRows: allNativeDistrictRows,
  metricCatalog
});
// view.records: Map(id -> result), legend, cutoffs, cohort, metadata
```

`kind` เป็น `demand|supply`; Demand metric คือ `tier` หรือ metric ID ใน catalog; Supply เริ่ม `metric=market`, `relation=total` (O+C ต่อฐานตลาดตามเกณฑ์ทีม) ตัววัดเลือกเป็น `count|area|market`; relation คือ `own|competitor|total` (“total” หมายถึง identified total ใน scope)

Result คง `{lo, hi, value, state, evidenceState, exact, zero, upperOpen, denominatorValue, sourceState}` พร้อม metadata ค่า `value` มีเมื่อ exact เท่านั้น Review แสดงช่วงหรือขอบบนยังไม่ทราบและใช้ neutral cue ไม่ลงสีตาม lower bound เหมือนค่าที่วัดแน่นอน Missing/invalid/nonpositive denominator ใช้ dash พร้อมเหตุผล

`YolkAnalysisUI.state(route)`, `set(key,value)`, `demandPage()`, `supplySummary()` และ `districtRows(data)` ต่อ personal view กับหน้าที่มีอยู่ `formatted()`, `unit()`, `metricLabel()` จัดข้อความไทย/อังกฤษ การเปลี่ยน view ไม่ Apply เกณฑ์ ไม่เขียน source หรือ event

## ข้อมูลอำเภอที่เพิ่ม

ไฟล์ public compact:

- `prototype/data/real/district-context.json`
- `prototype/data/real/fuel-district-supply.json`
- `prototype/data/real/grocery-district-supply.json`
- `prototype/data/real/nonbank-district-supply.json`
- `prototype/data/real/district-source-provenance.json`

Supply row fields คือ `[areaId, state, dimensionCounts, total, sourceKey, mapped]`; มี `provinceRows` 77 จังหวัดจากต้นทางโดยตรง ไม่ได้บวก fine areas `contextsById` ใช้ exact district UUID พร้อม `areaKm2`, population, GFA, adult 20–64, working-age 15–64, building count, metric states และ source keys

Source period: population **2026-08**; building **V4** / frontend label **2024-12**; พื้นที่จาก retained base snapshot **2026-10-03** Count effective date และ boundary vintage ยังไม่ทราบ SourceCatalog เปิดเฉพาะ URL/เวลาที่ดึง/hash; full acquisition, raw archives และ logs อยู่ private ไม่อยู่ใน public handoff

Native district totals bypass fine Non-bank residual 5,534 และ fine Grocery NMA/SNI reconciliation bounds เพราะเป็นหลักฐานคนละ grain ข้อมูลทุกอำเภอครบไม่ได้แปลว่าพิกัด POI ครบ หรือทุกสำนักงานทำผลิตภัณฑ์ที่เลือกจริง

## Demand อ่านก่อนกลยุทธ์

Default Tier ใช้ `demand===true` และ `qualifyingTier` 1/2/3 โดยไม่กรอง `maxDemandTier`, preferred patterns หรือ Supply หน้าเกณฑ์/shortlist ยังคงกติกาเลือกเดิมของทีม จึงไม่ควรใช้จำนวนในหน้า Demand แทน eligible shortlist

Country raw metric ต้องมี label **maximum known fine-location value** ทุกครั้ง สี/legend ระบุ metric, unit, field/formula, รอบและ coverage พื้นกลางในโหมด raw หมายถึงไม่มีข้อมูลหรือรอตรวจ ไม่ใช้คำว่า “ยังไม่ผ่าน Yolk” แทนค่าที่ขาด ไม่ใช้ชื่ออำเภอทำให้ผู้ใช้คิดว่าเป็น direct district total

## Supply และหน่วยสี

| metric | สูตร | สเกล DS |
|---|---|---|
| count | N | `count` |
| area | N / source areaKm2 | `density.area` |
| market: population | N / population × normalization | `density.capita` |
| market: GFA | N / GFA × normalization | `built` พร้อม unit และคำอธิบาย reuse |

GFA-rate เป็นอัตรา branch records ต่อ GFA ใช้ native built scale โดยระบุหน่วยจริง ไม่เรียกว่า capacity ตัวหารอื่นใช้ safe catalog และประกาศ reuse ให้ชัด ข้อมูลอาคาร modeled และประชากร context ไม่กลายเป็นลูกค้าที่วัดจริง

Continuous classes ใช้ P25/P50/P75/P95 ของ **ค่าที่ known/exact เทียบกันได้ใน grain เดียวกันทั่วประเทศ** ตาม industry/brand/format ปัจจุบัน Viewport ไม่ recalibrate ค่า Demand cutoffs สำหรับ fine model ยังคงฐานเดิมแยกจาก map bins เหล่านี้ Lower inclusive / upper exclusive; bin สุดท้าย open-ended Cutoffs ซ้ำอาจมี empty bins ที่อธิบายได้ Zero ใช้ class แรกพร้อม cue “ศูนย์ที่ทราบ”; review/no-data ใช้ neutral พร้อม label

Analytical colours ใช้ native LDS0.9.7 และ fill opacity1 เหมือนกันทั้ง light/dark Selected fine interior ยังคง unfilled เพื่ออ่าน basemap; ไม่ใช่ opacity สีข้อมูล Hover ยังคง token ของ UI ตามธีมและ source boundary ที่กดจริง

## จำนวนทำเลในการ์ดทั้งแปด

```js
const counts = YolkDecisions.patternCounts(criteria, fullNationalRows);
YolkDecisions.syncPatternCounts(document, criteria, fullNationalRows);
```

ใช้ national UUID ไม่ซ้ำ 7,954 ก่อน checkbox preferred selection แต่เก็บ Demand mode และ `maxDemandTier` gate ไว้ Exactly one distinct possible pattern → confirmed หรือ **“ทำเลเข้าเกณฑ์”** ของการ์ดนั้น; multiple possible patterns → review หรือ **“ทำเลรอตรวจ”** ของทุกการ์ดที่เป็นไปได้ Unknown Demand แยกออก Review cards ซ้อนกัน ห้ามรวมเป็น unique total

การเลือก checkbox เปลี่ยน strategy membership แต่ไม่ควรเปลี่ยน pre-selection counts การเปลี่ยน Supply/Demand/Tier thresholds อาจเปลี่ยน counts ได้ การเปลี่ยน weight/province/viewport ไม่เปลี่ยน นับไม่ได้เพราะ loading/error/invalid/duplicate/incomplete national rows ให้ “—” แทน0

## Mobile country fit

แผนที่ใช้ `minZoom=4` เพื่อให้แสดงประเทศบนจอแคบได้ การสั่ง fit ประเทศหรือขอบเขตโดยตรงใช้ `paddingTopLeft=[18,18]` และ `paddingBottomRight=[18,18]` บน desktop หรือ `[18,50]` เมื่อความกว้างน้อยกว่า 1,100 px เพื่อเผื่อพื้นที่ให้ปุ่มบนแผนที่ การอัปเดตตามปกติ เปลี่ยนตัววัด/เครือข่าย หรือ resize ไม่สั่ง fit กลับเอง Adapter checks ผ่านแล้ว ส่วนผลบน browser รุ่นนี้บันทึกแยกจาก source checks

## รับงานแบบแยกหลักฐาน

1. ตรวจ direct district ID/coverage/reconciliation และ positive source denominator; provenance/periods ตรง emitted data
2. ตรวจ pure value helpers, intervals/zero/missing, national same-grain bins และ native DS classes
3. ตรวจ Demand map ไม่ถูก Supply/preference/maxTier บัง และ raw country maximum มี label
4. ตรวจ Supply controls ยังมี CRUD เดิม ไม่ Apply เกณฑ์หรือสร้าง event; map/hover/basemap/popup/selected outline คงเดิม
5. ตรวจ pattern counts ก่อน selection, overlapping review, national uniqueness และ invalid dash
6. รัน 179 baseline checks + `check-map-analysis`, `check-pattern-counts`, `check-analysis-integration`; บันทึกผลจริงตามรุ่น
7. ตรวจ Chrome จริงในคู่ภาษา/ธีมและ viewport ที่ระบุไว้ โดยเฉพาะ long legends, menu, switches และ empty/review states บันทึก coverage ที่ทำจริง; full matrix, เครื่องจริง และ provider เป็น gate แยก
8. Root seal หลัง final QA แล้วตรวจ manifest/runtime hashes/live bytesก่อนบอกว่าเผยแพร่

**ผลตรวจ source และ automated รุ่นนี้:** 14 scripts ผ่าน 217 checks: baseline 179 ข้อที่รันใหม่, map analysis 14 ข้อ, pattern counts 14 ข้อ และ integration 10 ข้อ ตรวจข้อมูลอำเภอ 928 แห่งและจังหวัด 77 แห่งจาก public reads 391 ครั้งที่สำเร็จครบ การเทียบต้นทางอิสระผ่าน 6 checks / 56,507 comparisons และไฟล์ fine model/source/preset ที่คงไว้ 11 ไฟล์มี bytes ตรงกับรุ่น 1.7.1

อ่าน [ผลตรวจรุ่นนี้](../evidence/release-checks-v1.7.2.json) และ [ผลตรวจต้นทาง](../evidence/district-source-checks-v1.7.2.json) Native Chrome รุ่นนี้ผ่านแบบจำกัดขอบเขต: ไทย/dark และอังกฤษ/light ที่ 1,440×900 และ 390×844 พร้อม 10 ภาพ ตาม [browser receipt รุ่นนี้](../evidence/browser-v1.7.2/native-browser-review.json) ตรวจการเปลี่ยนมุมมองและตัววัด การเจาะทำเล ขอบเขตโปร่งใส country fit และ counts ทั้งแปดบนจอแคบ ไม่ใช่การตรวจทุกคู่ภาษา/ธีมหรือเครื่องจริง การตรวจ source ไม่รับรอง DS ทั้งระบบ ยอดขายหรือผู้ขอกู้ที่วัดจริง หรือบริการของ Google การยืนยันเผยแพร่ต้องตรวจผล deployment และ bytes บนเว็บแยกต่างหาก
