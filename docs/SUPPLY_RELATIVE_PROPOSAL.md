---
document_id: yolk.supply.relative.guide
version: 1.7.0
status: implemented_static_preview_browser_and_production_gates_separate
date: 2026-10-04
implementation_status: model_and_ui_implemented_static_preview
runtime_module: ../prototype/relative-supply.js
runtime_check: ../scripts/check-relative-supply.cjs
criteria_baseline: ../contracts/criteria-proposal.v1.6.json
product_contract: ../contracts/product.v1.7.json
---

# สาขาเทียบขนาดตลาด

**สาขาเทียบขนาดตลาด** เป็นโหมดเริ่มต้นของบริบทใหม่ เก็บ **จำนวนสาขา** เป็นทางเลือก และรักษาเกณฑ์ count ที่เคยบันทึกไว้จนผู้ใช้เลือกเปลี่ยนเอง Model/UI ใช้ module [relative-supply.js](../prototype/relative-supply.js) แล้ว การรับ browser และการเผยแพร่ต้องมีหลักฐานรุ่นนี้แยกจาก model checks ชื่อไฟล์เดิมคงไว้เพื่อไม่ให้ลิงก์ส่งต่อขาด

ตัวอย่างสูตร: พื้นที่ 20,000 คนที่มี 2 สาขา มี 1 สาขาต่อหมื่นคน ส่วนพื้นที่ 100,000 คนที่มี 3 สาขา มี 0.3 สาขาต่อหมื่นคน ตัวหลังมีรายการสาขาต่อประชากรน้อยกว่า แม้จำนวนสาขามากกว่า อัตราไม่ได้วัดกำลังบริการหรือความต้องการซื้อจริง

## แยกสองคำถาม

- **Demand เข้มข้นหรือยัง?** ใช้สัญญาณและเกณฑ์ Yolk เดิม ตอบว่าทำเลน่าศึกษาต่อหรือไม่
- **Supply หนาแน่นเมื่อเทียบตลาดหรือยัง?** ใช้จำนวนสาขาหารค่าปริมาณของตลาด ตอบว่าเรา/คู่แข่งมีสาขามากหรือน้อยเมื่อเทียบขนาดพื้นที่ที่ให้บริการ

คะแนน Percentile และคะแนน Demand 0–100 เป็นคะแนนเปรียบเทียบ ไม่ใช่จำนวนลูกค้าหรือขนาดตลาด ห้ามใช้เป็นตัวหารนี้โดยตรง ห้ามรวมคะแนนหลายสัญญาณแล้วเรียกว่าเป็นลูกค้าจริง

## เริ่มให้เรียบง่าย

หนึ่ง preset ใช้ตัวหารหนึ่งตัว ผู้ใช้เห็นโหมด เกณฑ์เรา และเกณฑ์คู่แข่ง พร้อมค่าจริงและหน่วย การเปลี่ยนตัวหารอยู่ใน “ตัวเลือกเพิ่มเติม” สัญญาณสำหรับคัด Demand ยังใช้หลายตัวได้ตามเดิม

| ธุรกิจ | ตัวหารเริ่มต้นที่อนุมัติ | หน่วยแสดง | เหตุผลและข้อจำกัด |
|---|---|---|---|
| ปั๊มน้ำมัน | GFA รวม `gfa` | สาขา / 100,000 ตร.ม. GFA | ค่าประมาณจากโมเดลอาคาร เป็นบริบทกิจกรรม ไม่ใช่พื้นที่ดิน จำนวนรถ การเติมน้ำมัน หรือ traffic ทางหลวง |
| Grocery | ประชากร `population` | สาขา / 10,000 คน | อ่านง่ายสำหรับตลาดผู้อยู่อาศัย; format ใหญ่และร้านชุมชนต้องแยก supply scope และตรวจ catchment ต่างกัน |
| Non-bank | ประชากร `population` | สาขา / 10,000 คน | ใช้ตัวหารเริ่มต้นที่อ่านง่ายเดียวกันกับ Grocery; Demand ของ Non-bank ยังคงเกณฑ์อายุ/บริบทของ profile ไม่บอกความต้องการสินเชื่อ คุณสมบัติผู้กู้ หรือผลิตภัณฑ์/ใบอนุญาตของสาขา |

เลือกตัวหารได้ 6 metric ที่มีใน CityMETER: `gfa` (หน่วย 100,000 ตร.ม.), `population`, `working_age_15_64`, `adult_population_20_64`, `factory_workers` (แต่ละตัวหน่วย 10,000 คน) และ `hotel_rooms` (หน่วย 1,000 ห้อง) ใช้ตัวหารเดียวร่วมกันสำหรับเรา/คู่แข่ง การมี metric ไม่พิสูจน์ว่าทำนายผลธุรกิจได้ดี “มาก/น้อย” เป็นพารามิเตอร์ที่ปรับตามแบรนด์/format ได้

## สูตรและสถานะที่ต้องรักษา

ให้ `D` เป็นปริมาณตลาดที่มีข้อมูลใน UUID เดียวกับยอดสาขา และ `U` เป็นหน่วยแสดง เช่น 10,000 คน

```text
own_rate        = own_count × U / D
competitor_rate = competitor_count × U / D

high = rate >= threshold
low  = rate < threshold
```

สาขาเราและคู่แข่งใช้ตัวหารเดียวกันใน preset นั้น แต่มี threshold แยกกันได้ สำหรับยอดสาขาที่เป็นช่วง ให้หารทั้ง lower/upper ด้วย `D`: มากเมื่อ lower ถึงเกณฑ์; น้อยเมื่อ upper ต่ำกว่าเกณฑ์; คร่อมเกณฑ์ให้เป็น “รอตรวจ” ห้ามใช้ค่ากลางแล้วสร้างความแน่ใจขึ้นมา

ถ้า `D` ขาด ไม่เป็นจำนวนที่ใช้ได้ หรือ `D <= 0` ให้เป็น “ยังประเมินไม่ได้” แม้ยอดสาขาเป็นศูนย์ เมื่อ `D > 0` และยอดศูนย์ที่ยืนยันได้จึงเป็นอัตราศูนย์ เกณฑ์ `ownRateHigh` / `competitorRateHigh` ต้องเป็น positive finite number ไม่บวก epsilon ลับเพื่อบังคับให้หารได้ การเพิ่ม minimum-market-size guard เป็นงานต่อยอด ไม่ใช่ความสามารถที่อ้างว่ามีแล้ว

การเปลี่ยนหน่วยแสดงต้องเปลี่ยน threshold ในสัดส่วนเดียวกัน ผลคัดกรองต้องไม่เปลี่ยน ห้ามคำนวณ Percentile ใหม่ตามจังหวัดที่ซูมหรือใช้เฉพาะทำเลที่ shortlist เป็นฐานตั้งต้น

## ตั้ง default จากอะไร

`YolkRelativeSupply.seedCriteria(c, metricId?)` ทำงานหลังโหลด Supply ของธุรกิจ/แบรนด์/scope ที่เลือกแล้ว ใช้ฐาน 7,954 UUID เดิม แยกตัวอย่างของเราและคู่แข่ง:

1. รับเฉพาะ count ที่ยืนยันแน่นอน ตัวหาร valid และเป็นบวก และ rate > 0 ไม่ใช้แถวที่ count เป็นช่วง หรือจำนวนรายการรอตรวจ (`unverified_count`) มีค่า nonzero/unknown
2. ถ้าฝั่งนั้นมี **N ≥ 5** ใช้ median ของ positive exact rates แยกกันเป็น `ownRateHigh` / `competitorRateHigh` วิธี `median_national_known_positive_exact_rates`
3. ถ้า **N < 5** ใช้ fallback **1 สาขาต่อหน่วยที่เลือก** พร้อมวิธี `hypothesis_insufficient_sample` เป็นค่าเพื่อทดลอง ไม่ใช่ median หรือความมั่นใจจากข้อมูล
4. เก็บ N, method, threshold, metric/unit, industry/brand/scope และเวลาตั้งค่าใน `supplyCalibration` ให้ UI แสดง sample/fallback และค่าที่ผู้ใช้ปรับเองอย่างชัดเจน

ศูนย์ที่ยืนยันยังใช้คัดพื้นที่ได้ แต่ไม่เข้า positive-rate sample สำหรับตั้ง median ความกำกวมและ residual ยังรักษาไว้เป็นช่วง ไม่เติมยอดหรือ normalize unknown ทิ้ง ค่า default เป็นสมมติฐานสำรวจ ไม่ใช่ capacity, saturation หรือ cutoff ที่แบรนด์รับรอง

อัตราเป็นความหนาแน่นของรายการสาขา ไม่ใช่กำลังบริการจริง สาขาขนาดใหญ่/เล็ก ปั๊มบนคนละฝั่งถนน และสาขานอกเขตที่ให้บริการลูกค้าในเขต อาจเปรียบเทียบจำนวนตรง ๆ ไม่ได้ ขั้นถัดไปจึงเพิ่ม capacity และ travel catchment เมื่อมีข้อมูล ไม่ใส่สูตรที่ดูแม่นกว่าหลักฐานตั้งแต่ต้น

## UI และการบันทึก

สองโหมด: **สาขาเทียบขนาดตลาด** / **จำนวนสาขา** มี slider คู่ช่องกรอก เกณฑ์เรา/คู่แข่งแยกกัน แสดงตัวหาร หน่วย และ method/N/fallback เปิดตัวเลือกเพิ่มเติมเพื่อเปลี่ยนตัวหาร แผนที่ยังอยู่ที่เดิมและแสดงผลแบบร่างก่อน Apply

เปลี่ยนตัวหารแล้วใช้ `seedCriteria` ตั้งร่าง threshold ที่หน่วยใหม่ พร้อมเทียบผลก่อน Apply ไม่ย้ายตัวเลขเก่าข้ามหน่วยเงียบ ๆ บริบทเก่าที่ไม่มี `supplyMode` อ่านเป็น `count`; saved criteria/draft ไม่ถูก migrate เอง บริบทใหม่เริ่ม relative หลัง Supply ที่เลือกพร้อมแล้ว Private draft/เปลี่ยนมุมมองไม่สร้างกิจกรรมทีม; Apply ที่สำเร็จสร้าง revision/event เดียว

## Machine contract — fields และ API ที่ยืนยันแล้ว

```json
{
  "schemaVersion": "yolk.supply-relative/1.7",
  "version": "1.7.0",
  "status": "implemented_static_preview_browser_and_production_gates_separate",
  "runtimeModule": "prototype/relative-supply.js",
  "globalAPI": "YolkRelativeSupply",
  "runtimeCheck": "node scripts/check-relative-supply.cjs",
  "modes": ["relative", "count"],
  "newContextDefault": "relative",
  "legacyMissingMode": "count",
  "preserveSavedCriteriaAndDraft": true,
  "fields": {
    "supplyMode": "count|relative",
    "supplyDenominatorId": "metricId from denominatorUnits",
    "ownRateHigh": "positive finite number",
    "competitorRateHigh": "positive finite number",
    "supplyCalibration": {
      "schemaVersion": 1,
      "metricId": "selected denominator metric",
      "unit": "positive catalog unit",
      "industryId": "selected industry",
      "brandId": "exact selected source brand ID",
      "scope": "selected supply scope",
      "nationalUniverse": 7954,
      "minimumSampleN": 5,
      "positiveExactOnly": true,
      "intervalRowsExcluded": true,
      "nonzeroOrUnknownUnverifiedExcluded": true,
      "own": {"n": "integer", "method": "calibration method", "threshold": "positive number"},
      "competitor": {"n": "integer", "method": "calibration method", "threshold": "positive number"},
      "excludedRows": {"missingOrNonpositiveDenominator": "integer", "uncertainCounts": "integer"},
      "seededAt": "ISO timestamp"
    }
  },
  "denominatorUnits": {
    "gfa": 100000,
    "population": 10000,
    "working_age_15_64": 10000,
    "adult_population_20_64": 10000,
    "factory_workers": 10000,
    "hotel_rooms": 1000
  },
  "industryDefaults": {"fuel": "gfa", "grocery": "population", "nonbank": "population"},
  "formula": "roleRate = count / denominator * unit",
  "modelThreshold": "roleRateHigh * denominator / unit",
  "api": {
    "seedCriteria": "seedCriteria(c, metricId?)",
    "countThresholds": "countThresholds(area, c)"
  },
  "calibration": {
    "cohort": "fixed national reporting UUIDs; selected brand/scope",
    "sample": "positive exact observed count rates; no interval-bearing row; U known zero",
    "minimumNPerRole": 5,
    "method": "median_national_known_positive_exact_rates",
    "fallback": 1,
    "fallbackMethod": "hypothesis_insufficient_sample"
  },
  "missingOrNonpositiveDenominator": "unknown",
  "countBounds": "preserve interval and joint-allocation classification",
  "usePercentileOrRankAsDenominator": false,
  "countMode": {"ownHigh": "ownMany", "competitorHigh": "competitorMany"},
  "commit": "explicit Apply only; one criteria revision/event",
  "personalViewAndDraft": "no team mutation"
}
```

## Dev: ทำตามลำดับและตรวจรับ

1. อ่าน active product/map/brand contracts และ evaluator เดิม คง criteria/model v1.6 เป็น baseline; เพิ่ม serialized fields ข้างต้น ไม่เปลี่ยน national cohort
2. ต่อ `seedCriteria` หลัง context Supply พร้อมแล้ว Seed เฉพาะบริบทใหม่หรือการเลือกเปลี่ยนตัวหารเป็น draft; เกณฑ์ที่บันทึกเองมีสิทธิ์เหนือ seed
3. ใช้ `countThresholds(area,c)` แปลง rate threshold เป็น count-equivalent ก่อนเข้า uncertainty/classification เดิม ห้ามปัด count threshold ให้เป็นจำนวนเต็มหรือทิ้ง residual
4. ต่อโหมด ตัวหาร slider/exact input และ calibration disclosure แสดงตัวอย่างหน่วยจริง ตรวจ invalid/zero/missing และการเปลี่ยนหน่วย/แบรนด์
5. ให้ screening/patterns/map/list ใช้ผลเดียวกัน Tier ของ Demand และ weights ยังคงแยกจาก Supply mode การปรับ weights อย่างเดียวไม่เปลี่ยน membership
6. ตรวจ direct rate กับ count-equivalent ให้ตรงกัน, lower/upper คร่อม threshold, N=4/5, U unknown, median/fallback, saved-count persistence, brand isolation, draft/no-event/Apply-one-event และจริงบน TH/EN mobile/desktop ก่อน seal/deploy

สูตรและ default นี้ช่วยคัดไปสำรวจ ยังไม่รับรองยอดขาย ความต้องการสินเชื่อ หรือ capacity สาขา การเพิ่มผลธุรกิจและ catchment เพื่อปรับ preset ต้องมี version และ validation แยกต่อไป
