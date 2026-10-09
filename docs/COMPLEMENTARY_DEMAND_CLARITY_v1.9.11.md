# Demand กับกิจกรรมเสริม — ใช้ข้อมูลเดิมคนละบทบาท

เริ่มจาก **Demand คัดพื้นที่ → Supply ดูการแข่งขัน → Strategy เลือกสิ่งที่ควรสำรวจต่อ** วิธี 05 “เกาะกิจกรรมที่ส่งลูกค้าให้กัน” ใช้เบาะแสกิจกรรมในพื้นที่ที่ผ่าน Demand แล้ว ชื่อวิธีเป็นสมมติฐานที่ต้องตรวจ ไม่ใช่หลักฐานว่ากิจกรรมนั้นส่งลูกค้าให้สาขาจริง

## คำตอบสำหรับผู้ใช้

| บทบาท | คำถาม | เมื่อเลือกข้อมูลโรงงานหรือโรงแรม | ผลที่เปลี่ยนได้ |
| --- | --- | --- | --- |
| Demand | พื้นที่นี้มีบริบทตลาดที่สูงพอตามเกณฑ์หรือไม่? | ใช้เป็นเงื่อนไขคัดพื้นที่ผ่าน factor/paths ที่เปิดใช้ | รายชื่อที่ผ่าน Demand และระดับไข่ดาวอาจเปลี่ยน |
| Strategy 05 | ในพื้นที่ที่ผ่าน Demand ควรตรวจแหล่งกิจกรรมไหนเพื่อหาโอกาสใช้บริการ? | ใช้บริบทกิจกรรมที่โปรไฟล์รองรับสร้างคิวสำรวจ | ชุด/ลำดับคิวสำรวจเปลี่ยนได้ แต่ไม่เพิ่มไข่แดงและไม่เปลี่ยน Demand/Tier |

ข้อมูลชุดเดียวกันใช้ได้ทั้งสองบทบาท แต่ยังเป็นแหล่งข้อมูลเดิม ไม่ใช่หลักฐานอิสระสองชิ้น ถ้า Demand อิงโรงงานอยู่แล้ว คิว Strategy 05 อาจได้ทำเลซ้ำ ประโยชน์ขั้นถัดไปคือระบุสิ่งที่จะตรวจ เช่น โรงงานจริง ประตูออก ช่วงเลิกงาน ทางเข้าไปยังร้าน และการซื้อที่เกิดขึ้น

ภายในวิธี 05 ระบบใช้ **midrank สูงสุดของตัววัดกิจกรรมที่ผ่าน** ไม่บวกแต้มจากจำนวนตัววัด โรงงาน/คนงาน/ความหนาแน่นจากทะเบียนเดียวกันสัมพันธ์กัน จำนวน Strategy ที่ตรงในลำดับคิวรวมเป็นตัวจัดงานสำรวจ ไม่ใช่จำนวนหลักฐานอิสระหรือเปอร์เซ็นต์ความมั่นใจว่าร้านจะขายดี

## ข้อมูลที่ใช้จริงใน P0

แหล่ง runtime คือ `prototype/data/real/area-context.json` ตาราง metric เดียวกับ Demand ดึง snapshot 3 ตุลาคม 2026; 7,954 reporting UUIDs: 180 แขวงกรุงเทพฯ และ 7,774 พื้นที่ อปท. ตาม CityMETER นอกกรุงเทพฯ จำนวนจังหวัด/อำเภอที่ใช้แสดงแผนที่ไม่เปลี่ยน grain ของเบาะแสกิจกรรม

| Dataset / metric | ฟิลด์ต้นทาง | ช่วงข้อมูล | ขอบเขตและความหมาย | ใช้ได้ / 7,954 |
| --- | --- | --- | --- | ---: |
| `factory` / `factory_count` | `factory.active.totalFactory` | เม.ย. 2025, `ACTIVE` ตามต้นทาง | จำนวนรายการโรงงานในกลุ่ม ACTIVE ไม่ยืนยันกำลังผลิตปัจจุบันรายแห่ง | 5,822 |
| `factory` / `factory_workers` | `factory.active.totalWorker` | เม.ย. 2025, `ACTIVE` ตามต้นทาง | คนงานที่รายงาน ไม่ใช่ผู้เข้างานรายวัน ผู้ผ่านร้าน หรือผู้ซื้อ | 5,822 |
| `hotel` / `hotel_rooms` | `hotel.roomCount` | ต้นทางไม่ระบุวันที่มีผล | ความจุห้องพักในรายการ ไม่ใช่ผู้เข้าพัก อัตราเข้าพัก หรือนักท่องเที่ยวจริง | 7,506 |

ค่าหายไม่ใช่ศูนย์: โรงงาน/คนงานไม่มีค่าใช้ได้ 2,132 พื้นที่; ห้องพักไม่มีค่าใช้ได้ 448 พื้นที่ วันที่ดึง snapshot ไม่แทนวันที่มีผลของข้อมูลโรงแรม

โปรไฟล์ที่ runtime ใช้ปัจจุบัน:

- Fuel: `factory_count`, `factory_workers`, `hotel_rooms` — ไม่เกิน 3 ตัว
- Grocery ทุก format ที่รองรับ: `factory_workers`, `hotel_rooms` — 2 ตัว
- Non-bank: โปรไฟล์มีบริบทประชากร แต่ **ประชากรอย่างเดียวไม่ใช่ complementary activity** จึงไม่มีตัววัดที่รองรับในวิธี 05 และคิวนี้รอหลักฐานเพิ่ม

รายชื่อข้างต้นมาจาก `complementaryAnchors` ของโปรไฟล์แบรนด์/ขอบเขตจริง เป็นสมมติฐานของ Yolk ไม่ใช่กฎที่แบรนด์รับรองหรือผลวิจัย consumer perception ไม่มีการเพิ่ม metric หรือตั้งค่า numeric preset ใหม่ใน patch นี้

## กฎที่ engine ใช้อยู่และคงเดิม

1. ประเมิน Demand ก่อน: `eligible === true`, `demand === true`, `qualifyingTier` อยู่ใน 1–3 และไม่เกิน `maxDemandTier`
2. อ่าน activity IDs จาก profile ของแบรนด์และ scope; จำกัดไม่เกิน 3 ตัวใน whitelist ที่มีข้อมูล
3. ใช้ค่าที่ทราบและเป็นบวก พร้อม midrank ใน cohort ที่ผู้ใช้เลือก ฐาน default ระดับประเทศ; same-grain เป็นทางเลือกที่ต้องเลือกชัดเจน
4. จุดเทียบปัจจุบันของวิธี 05 คือ midrank 95; นี่เป็นกฎเบาะแสกิจกรรมหลัง Demand ไม่ใช่การเพิ่มเงื่อนไข PERCENTILE.INC ใหม่ใน Demand
5. ถ้ามีกิจกรรมผ่าน ให้สถานะ `candidate_to_check`; ใช้ midrank สูงสุดเรียงภายในวิธีนี้
6. ถ้าข้อมูลครบแต่ไม่ถึงจุดเทียบ แสดง `not_supported_by_current_evidence`; ถ้าไม่ครบ/โปรไฟล์ไม่มีตัววัด แสดง `evidence_incomplete` ห้ามเติมค่าศูนย์หรือสัญญาณสมมติ
7. แม้ได้ candidate ก็ยังคง missing evidence ของตำแหน่งกิจกรรม ทางเข้าออก และการซื้อจริง พร้อมงานแรกให้สำรวจ

ค่าข้อมูล เกณฑ์ Demand, Tier, rank เดิม, preset, engine 1.9.0 และ registry 1.9.0 คงเดิม รายละเอียดการอ่านใน guide registry 1.9.3 คง bytes เดิม ส่วนคำอธิบายใหม่เป็น presentation ของ 1.9.11

## UX ที่ปรับ

1. Card วิธี 05: “ผ่าน Demand ก่อน → ดูกิจกรรม → ตรวจทางส่งลูกค้า” พร้อมปุ่ม **ต่างจาก Demand อย่างไร?**
2. เมื่อเลือกวิธี 05: แสดง disclosure ชื่อ **05 · ต่างจาก Demand อย่างไร?** ใต้ตัวเลือกวิธีขยาย เปิดดูได้โดยไม่เปลี่ยนเกณฑ์/Strategy/กล้อง/ข้อมูลทีม
3. ภายใน disclosure: บทบาทสองฝั่ง, metric ของแบรนด์/scope ปัจจุบัน, ช่วงข้อมูลจริง และป้าย **ใช้ข้อมูลต้นทางร่วมกับ Demand** เมื่อ Demand เปิดใช้ตัววัดจาก dataset เดียวกัน แม้เป็น metric คนละหน่วย
4. ถ้าโปรไฟล์ไม่รองรับ activity: อธิบายตรงๆ ว่าวิธีนี้ต้องเพิ่มหลักฐาน ไม่แสดง population เป็นแหล่งกิจกรรมที่ส่งลูกค้า
5. Guide วิธี 05: เปิดคำอธิบายบทบาทและข้อมูลโปรไฟล์ปัจจุบันไว้ พร้อมภาพ/ตัวอย่างสมมติและงานตรวจหน้างานเดิม
6. Location detail: มีคำอธิบายเดียวกันในเหตุผลของวิธี 05
7. แผงแคบใช้เนื้อหาแนวตั้ง; แผงกว้างตั้งแต่ 600 CSS px เปรียบเทียบสองฝั่ง โดยขนาดขึ้นกับแผงจริง ไม่เดาจากความกว้างอุปกรณ์

ไม่แสดง metric ID ยาวเป็นข้อความหลักของ UX ใช้ label ไทย/อังกฤษจาก metric catalogue และเก็บ ID ใน data attributes สำหรับการตรวจ/งานต่อ ระบบไม่ใช้คำอธิบายนี้เป็นคะแนนหรือสิทธิ์ใหม่

## สิ่งที่ยังไม่มี

- P1: POI โรงพยาบาล/โรงเรียนที่ตรวจแล้ว, ตำแหน่งโรงงาน/โรงแรมจริงและ crosswalk, ประตู/เวลา/ทางเดินเข้าถึง, offering รายสาขา, field evidence ของการมาใช้บริการร่วมกัน
- P2: directed routes และพฤติกรรมผ่าน/แวะ/ซื้อที่ตรวจแล้ว
- P3: ข้อมูลลูกค้า/ธุรกรรมส่วนตัวที่มีสิทธิ์และ calibration ผลธุรกิจ

ค่าระดับพื้นที่ปัจจุบันห้ามตีความว่า “ร้านอยู่ใกล้โรงงาน”, “โรงพยาบาลส่งลูกค้า”, “นักท่องเที่ยวมาใช้บริการ” หรือ “ยอดขายเพิ่ม” โดยยังไม่มีหลักฐานที่ตรงคำกล่าวนั้น

## Step-by-step สำหรับงานต่อ

1. อ่าน `opportunity-strategies.v1.9.0.json` และ metric catalogue ของ `area-context.json`; อย่าแทนช่วงข้อมูลโรงแรม null ด้วยวันที่ดึง snapshot
2. อ่าน brand/scope profile ด้วย registry เดียวกับ assessor
3. ใช้ `YolkStrategyUI.complementarySources(criteria)` เพื่ออ่านชื่อ/ช่วง/แหล่งที่ใช้ร่วมกับ Demand; helper read-only
4. ใช้ `YolkStrategyUI.complementaryExplanation({expanded, c:criteria})` เป็น presentation เดียวบน opportunity/guide/detail
5. รัน `node scripts/check-complementary-clarity.cjs`, `check-strategy-ui.cjs`, `check-strategy-guide.cjs`, และ retained engine/model suites
6. ตรวจหน้า rendered ไทย/อังกฤษ แผงแคบ/desktop ทั้งสองธีม โดยเฉพาะ source dates, เนื้อหา Non-bank, keyboard/Escape และการเลื่อน guide
7. เมื่อเพิ่ม P1 ต้องมี adapter/provenance/crosswalk และ acceptance ใหม่ก่อนเพิ่ม proximity rule; ห้ามทำ source inference ใน UI

Automated/VM ตรวจ semantics และ invariants ไม่แทน native browser, iPhone/Android จริง, screen-reader speech หรือหลักฐานว่ากิจกรรมส่งลูกค้า Native evidence และ release attestation ต้องบันทึกเป็นชุดปัจจุบันแยกต่างหาก

```json
{
  "schemaVersion": "yolk.complementary-demand-explanation/1.9.11",
  "presentationVersion": "1.9.11",
  "engineVersion": "1.9.0",
  "profileRegistryVersion": "1.9.0",
  "guideRegistryVersion": "1.9.3",
  "sourceFile": "prototype/data/real/area-context.json",
  "snapshotRetrievedDate": "2026-10-03",
  "reportingGrains": ["SUBDISTRICT_BKK", "MUNICIPALITY_NON_BKK"],
  "nationalUniverse": 7954,
  "sources": [
    {"datasetId":"factory","metricId":"factory_count","field":"factory.active.totalFactory","sourcePeriod":"2025-04 ACTIVE","validAreas":5822,"missingAreas":2132,"measuresCustomers":false},
    {"datasetId":"factory","metricId":"factory_workers","field":"factory.active.totalWorker","sourcePeriod":"2025-04 ACTIVE","validAreas":5822,"missingAreas":2132,"measuresCustomers":false},
    {"datasetId":"hotel","metricId":"hotel_rooms","field":"hotel.roomCount","sourcePeriod":null,"validAreas":7506,"missingAreas":448,"measuresCustomers":false}
  ],
  "profileActivityIds": {
    "fuel": ["factory_count", "factory_workers", "hotel_rooms"],
    "grocery": ["factory_workers", "hotel_rooms"],
    "nonbank": []
  },
  "roles": {
    "demand": "screen_using_active_factor_paths",
    "complementary_location": "select_survey_queue_after_confirmed_demand"
  },
  "complementaryReference": 95,
  "referenceKind": "selected_cohort_midrank",
  "complementaryOrder": "maximum_passing_activity_midrank",
  "maximumActivityMetrics": 3,
  "sharedSourceDetection": "active_Demand_datasetId_equals_activity_datasetId",
  "independentEvidenceWhenReused": false,
  "anchorProximityProven": false,
  "customerTransferProven": false,
  "hospitalSchoolAnchorPhase": "P1",
  "readOnly": true,
  "mustPreserve": ["source_values", "source_periods", "profile_numeric_presets", "Demand_IDs", "Demand_tiers", "criteria", "camera", "team_events", "local_saved_records"],
  "nativeHooks": ["[data-complementary-explanation]", "[data-complementary-metric]", ".strategy-role-comparison"],
  "automatedTest": "scripts/check-complementary-clarity.cjs",
  "nativeReviewStatus": "requires_separate_current_evidence"
}
```
