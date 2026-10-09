# Yolk 1.9.11 · ส่ง Demo ตรงแบรนด์ อ่านกิจกรรมได้ง่ายขึ้น


**ผลตรวจปัจจุบันก่อนเผยแพร่:** 44 suites / 747 reported cases ผ่าน; 10 bounded native observations พร้อมภาพจริง20ภาพ รวม fixtureกิจกรรมที่ระบุเป็นข้อมูลสมมติ ตรวจ Thai/Englishและบางสถานะlight/darkในChromeที่320/390/1440px ยังไม่ใช่การรับรองทุกแบรนด์/อุปกรณ์/backend ดู [QA](../evidence/qa-v1.9.11.json) การเผยแพร่และ ZIP ยืนยันแยกใน GitHub Release attestation หลัง provider/live ผ่าน

รายงานวันที่ 9 ตุลาคม 2026 สำหรับ Product, Design และ Dev/Interns ใช้คู่กับ [Product statement + implementation ฉบับเต็ม](../CityMETER_Yolk_Full_Product_and_Implementation_v1.9.11.md), [สัญญาแผนที่](../contracts/map-exploration.v1.9.11.json) และ [เริ่มที่นี่](../START_HERE.md)

รอบนี้เพิ่มสี่เรื่อง: โลโก้แสดงได้มากขึ้นทุก drilldown, permalink สำหรับ prospect ทั้ง 37 แบรนด์, Activity อ่านข้อความยาวได้โดยไม่บีบเป็นคอลัมน์ และคำอธิบายว่า Demand กับกิจกรรมเสริมใช้ข้อมูลเดิมคนละบทบาท

**สถานะ ณ รอบ implementation:** final integrated QA, current native acceptance, ZIP closure และ publication 1.9.11 ยังต้องยืนยันจาก receipts จริง การผ่านเฉพาะโมดูลหรือการมี URL ไม่ยืนยันว่า release ผ่านทั้งหมดแล้ว ผล hover/Satellite/zero-null และจำนวนทดสอบในรายงาน 1.9.10 เป็นหลักฐานรุ่นก่อน ดูแยกใน [รายงานเดิม](MAP_EXPLORATION_v1.9.10.md)

## 1. โลโก้ทุกจุด เมื่อพิกัดในมุมมองไม่เกินเกณฑ์

ใช้จำนวน **พิกัดที่ถูกต้อง ผ่าน filter และอยู่ในมุมมองปัจจุบัน** ไม่ผูกกับ zoom หรือระดับ drilldown

| ความกว้าง map host จริง | จำนวนสูงสุดที่แสดงโลโก้ทุกจุด |
|---|---:|
| ตั้งแต่ 600 CSS px | 500 |
| น้อยกว่า 600 CSS px | 250 |

เกณฑ์แคบ 250 เป็นค่าล่าสุดของรอบนี้ ใช้ความกว้างพื้นที่แผนที่ ไม่เดาจากชนิดอุปกรณ์ หาก artwork มีอยู่ แสดง original logo โดยไม่ crop/recolor/backing plate หากไม่มี ใช้ fallback ที่มีชื่อแบรนด์เดิม ไม่สร้างตราใหม่

เกินเกณฑ์ใช้ Canvas แสดงพิกัดที่ผ่าน filter ทุกจุด ไม่มี arbitrary cap หรือ cluster อัตโนมัติ จุดซ้อนยังค้น/กรองและเลือกอ่านรายสาขาได้ Native Supply totals มาจาก vector ต้นทางที่ grain ตรงกัน ไม่ใช้จำนวนพิกัดใน viewport แทนยอดสาขา เกณฑ์ใหม่นี้เป็น presentation budget ไม่ใช่ SLA ว่าทุกเครื่องจะลื่นเท่ากัน ต้องวัดและตรวจ rendered รอบปัจจุบัน

## 2. Permalink เฉพาะแบรนด์สำหรับฝ่ายขาย

ตัวอย่าง Tops: `https://montri-th.github.io/yolk/?brand=tops#market` ไม่มีเลขรุ่นใน URL ผู้รับใหม่เปิด “โอกาสขยาย” ด้วย Grocery → Tops → SUPERMARKET และ preset จาก registry เดิม รูปแบบที่สำคัญของแบรนด์เป็นค่าตั้งต้น โดยยังเลือก format อื่นที่รองรับต่อได้

มีครบ **11 Fuel / 16 Grocery / 10 Non-bank** และทุกลิงก์ผูก identity ที่มี positive native source inventory ใน default scope ไม่สร้างบริษัท/ยอดศูนย์เพื่อให้ลิงก์ครบ ชื่อ Non-bank ผูกนิติบุคคลใน source ไม่รับรองว่าทุกชื่อเป็น trade brand ที่ตรวจแล้ว

- [Catalog ค้นหา ทดลอง และคัดลอก](../prototype/brands.html) · [Catalog เว็บหลังเผยแพร่](https://montri-th.github.io/yolk/brands.html)
- [Permalink ครบ 37 แบรนด์พร้อม default scope/coverage](BRAND_DEMO_LINKS.md) · [Machine-readable catalog](../prototype/data/brand-demo-links.json)
- [Implementation report + acceptance instructions](BRAND_DEMO_PERMALINK_IMPLEMENTATION.md)

ปุ่ม **คัดลอก Demo แบรนด์นี้** อยู่ในตัวเลือกแบรนด์ URL ส่งเฉพาะ brand alias และภาษา พร้อมหน้าโอกาสขยาย ไม่ส่ง draft, shortlist, filter ของลูกค้า, team data หรือ signed URL

การเปิดลิงก์เป็นมุมมองส่วนตัว ไม่เขียน workspace หรือสร้าง team event หากผู้รับเคยมีเกณฑ์/ร่าง/shortlist ของแบรนด์และ default scope นั้น ใช้ค่าที่บันทึกไว้ก่อน พร้อมคำแจ้งและปุ่ม **ลองเกณฑ์ตั้งต้น** ซึ่งสร้าง draft ให้ตรวจผลก่อนยืนยัน ไม่ overwrite เกณฑ์ทีมเงียบ ๆ งานของ context เดิม สาขา overlays ร่างฟอร์มและ events ยังคงอยู่

รองรับ `&lang=en` / `&lang=th` และหก route หลัก: market, demand, supply, criteria, targets, feed รับ source ID ที่ percent-encoded ได้ แต่ลิงก์ที่คัดลอกใช้ alias อ่านง่าย Unknown/malformed/duplicate parameters หรือ industry/scope ที่ขัดกับ brand แสดงคำแจ้งที่ไม่สะท้อน input อันตราย แล้วเปิดบริบทที่พร้อมใช้งานพร้อมหน้าโอกาสขยาย ไม่ทำ external redirect

## 3. Activity รองรับบันทึกยาว

แทนค่าก่อน–หลังสองคอลัมน์ที่บีบ “Note” เป็นแถบแคบ เปลี่ยนเป็น event card ที่มีป้ายฟิลด์อยู่เหนือ **เดิม / ใหม่** และวางค่าในแนวตั้งตามพื้นที่แผงจริง ทั้งแผงด้านข้างบน desktop และหน้าจอมือถือ

ข้อความยาวเกิน 180 code points หรือมีหลายบรรทัดแสดงตัวอย่างค่าใหม่ พร้อม disclosure **อ่านข้อความและค่าก่อน–หลัง** เปิดแล้วอ่านค่าครบ ข้อความต้นฉบับ/บรรทัดใหม่ยังอยู่ ไม่ตัด audit evidence หรือแก้บันทึกเพียงเพื่อให้พอดีหน้าจอ ผู้ใช้เลือก/copy ข้อความเต็มได้

ชื่อสาขาที่อ่านรู้เรื่องเป็น caption หลัก รหัส entity/event ยาวอยู่ใน **รหัสรายการ** อ่านได้เมื่อจำเป็น Actor/action/time แยกบรรทัดและมีพื้นที่ที่ยืดหยุ่น ข้อความหลัก wrap ตามคำ ส่วนรหัสใช้ wrap เมื่อจำเป็น; ไม่แสดงลูกศรเป็นคอลัมน์ที่แย่งพื้นที่ note

ส่วนนี้อ่าน events เดิม ไม่มี source data write หรือ event ใหม่จากการเปิด disclosure Keyboard focus ยังเห็นชัดและใช้ native details จึงไม่ต้องทำ motion พิเศษเพื่ออ่านข้อความ

## 4. “เกาะกิจกรรมที่ส่งลูกค้าให้กัน” ต่างจาก Demand อย่างไร

ชื่อวิธี 05 เป็นสมมติฐานที่ต้องสำรวจ ไม่ใช่หลักฐานว่ามีลูกค้าส่งต่อให้สาขาจริง

| บทบาท | คำถาม | ผลที่เปลี่ยน |
|---|---|---|
| Demand | พื้นที่มีบริบทตลาดสูงพอตามเงื่อนไขที่เลือกหรือไม่? | เปลี่ยนผู้ผ่าน eligibility และระดับไข่ดาวได้เมื่อเปลี่ยนเกณฑ์ |
| Strategy 05 | จากพื้นที่ที่ผ่าน Demand ควรตรวจแหล่งกิจกรรมไหนและทางใช้บริการอย่างไร? | เปลี่ยนชุด/ลำดับคิวสำรวจ ไม่เพิ่ม Demand ไม่เปลี่ยน Tier |

P0 ใช้ข้อมูลพื้นที่ `area-context.json` ที่มีอยู่: โรงงาน ACTIVE, คนงานที่รายงาน และความจุห้องพัก ตาม brand/scope profile Fuel มีโรงงาน/คนงาน/ห้องพัก; Grocery มีคนงาน/ห้องพัก; Non-bank ยังไม่มี complementary activity ที่รองรับ ประชากรอย่างเดียวไม่ถูกเรียกแหล่งกิจกรรมส่งลูกค้า

| Source | ความหมายจริง | ช่วงข้อมูล |
|---|---|---|
| `factory_count` | จำนวนโรงงานในกลุ่ม ACTIVE ตาม source | เม.ย. 2025 |
| `factory_workers` | คนงานที่รายงาน ไม่ใช่ผู้เข้างาน/ผู้ซื้อรายวัน | เม.ย. 2025 |
| `hotel_rooms` | ความจุห้องพัก ไม่ใช่ผู้เข้าพัก/อัตราเข้าพัก | ต้นทางไม่ระบุวันที่มีผล |

เมื่อ Demand ใช้ dataset เดียวกัน มีป้าย **ใช้ข้อมูลต้นทางร่วมกับ Demand** แม้เป็น metric คนละหน่วย ผู้ใช้จึงรู้ว่าไม่ใช่หลักฐานอิสระสองชิ้น ไม่มีการบวกคะแนนเพราะข้อมูลชุดเดียวกันปรากฏสองครั้ง ภายในวิธี 05 engine เดิมใช้ midrank สูงสุดของกิจกรรมที่ผ่าน; จำนวน Strategy ที่ตรงเป็นตัวจัดงานสำรวจ ไม่ใช่ confidence ว่าร้านจะขายดี

คำอธิบายเปิดได้จาก card วิธี 05, disclosure ใต้ตัวเลือก, guide และเหตุผลใน location detail ใช้ข้อความสั้นก่อน แล้วอ่านข้อมูล/ช่วง/ข้อจำกัดเพิ่มเติมได้ ดู [รายงานบทบาทและ field-level source coverage](COMPLEMENTARY_DEMAND_CLARITY_v1.9.11.md)

โรงพยาบาล/โรงเรียน, ตำแหน่ง anchor จริง, crosswalk, ระยะ/ประตู/ทางเดิน, offering รายสาขาและ customer transfer ที่ตรวจแล้วเป็น **P1**; routes/future เป็น P2; transaction/customer calibration ที่มีสิทธิ์เป็น P3 ไม่ใช้ค่า aggregate ปัจจุบันยืนยันว่าอยู่ใกล้ anchor หรือขายดี

## Behavior เดิมที่ยังรักษา

- Hover พื้นที่เป็น compact dock 34 px นอก Leaflet canvas; treemap เต็มอยู่ใน Supply side panel; กรอบเหลืองเน้น parent ที่คลิกได้และ Escape ล้าง hover โดยไม่ย้ายกล้อง
- หนึ่ง map instance; mobile เลื่อนลงอ่านรายละเอียดได้; Expand/Compact และ camera envelope ประเทศไทยยังคงเดิม
- Satellite จริงคือ ESA WorldCover Sentinel-2 natural colour ปี 2021, 10 m พร้อม attribution; ช่อง provider ไม่มีภาพมี OSM road underlay และคำอธิบาย ส่วน Google Maps Satellite เป็น external alternative ภาพ Google hybrid แบบฝังเดิมยังต้อง authorized API integration
- ศูนย์ที่ทราบค่าใช้ exact lowest LUT + solid DS outline +0; null/no-data ใช้ hatch และ label; 0/0 share ไม่เป็น 0%; analytical HEX/ทิศข้อมูลเดิมทั้งสองธีม
- Source counts, coordinates, original artwork, cohort, numerical presets และ Demand eligible IDs ไม่เปลี่ยนจาก presentation patch นี้

ดู behavior และ **หลักฐานเฉพาะ 1.9.10** ใน [รายงานเก่า](MAP_EXPLORATION_v1.9.10.md) ห้ามคัดจำนวน 41 suites/680 cases, native9checks, receipt SHA หรือเวลาเดิมมาอ้างว่าปัจจุบันผ่าน

## ขั้นตอนตรวจรวมก่อนส่ง Dev/Interns

1. อ่าน START_HERE และ authority ปัจจุบัน; run `check-brand-demo-links.cjs`, `check-activity-ui.cjs`, `check-complementary-clarity.cjs`, `check-unclustered-poi.cjs` พร้อม workflow regression เดิม
2. Native ตรวจ logo ที่รอบ threshold 500/501 และ 250/251, resize map host ผ่าน 600 CSS px, filter/zoom/drilldown และทุก valid ID/overlap โดยไม่ใช้หมุดแทน source total
3. เปิด fresh/warm permalink ทั้งสาม industry; ตรวจ saved criteria/draft/targets/forms/overlays/events ไม่เปลี่ยน แสดง notice ถูกต้อง; copy URL/clipboard fallback/catalog Thai-English ที่ 320/390/desktop
4. ใช้ note ไทย/อังกฤษหลายย่อหน้า รหัสยาวและค่าที่ไม่มีข้อมูลใน Activity/Inbox/branch/place context อ่าน full before/after ด้วย pointer และ keyboard และตรวจ no horizontal overflow บนแผงแคบจริง
5. เลือกวิธี 05 ของ Fuel/Grocery/Non-bank ตรวจ source/profile/period ที่ตรงกับเกณฑ์ใช้อยู่ และ shared-data cue; เปิด guide/detail โดยไม่เปลี่ยน eligibility, camera, criteria หรือ events
6. เก็บ current raw logs และ native screenshots/journeys ที่ตรวจจริงใน [QA receipt](../evidence/qa-v1.9.11.json); physical iOS/Android/full screenreader matrix ยังคงเป็น gate ต่างหาก
7. หลัง freeze/seal ตรวจ raw-log closure และ ZIP จริง; provider terminal success/live HTTP-MIME-bytes-SHA/public release เป็น acceptance อีกชุด ไม่อนุมานจาก local tests

## Machine-readable summary ของรายงานนี้

```json
{
  "schemaVersion": "yolk.owner-refinement-report/1.9.11",
  "version": "1.9.11",
  "status": "implementation_ready_current_integrated_native_zip_publication_pending",
  "logoThresholds": {"mapHostAtLeast600CssPx": 500, "mapHostBelow600CssPx": 250, "countBasis": "visible_filtered_valid_coordinates", "minimumZoom": null, "inventoryCap": false},
  "brandPermalinks": {"count": 37, "industryCounts": {"fuel": 11, "grocery": 16, "nonbank": 10}, "defaultRoute": "market", "catalog": "prototype/brands.html", "machineCatalog": "prototype/data/brand-demo-links.json", "fullListing": "docs/BRAND_DEMO_LINKS.md", "savedTargetWorkWins": true, "openingWritesWorkspace": false, "openingEmitsEvent": false},
  "activity": {"layout": "stacked_before_after_field_cards", "longTextPreviewCodePoints": 180, "multilineUsesDisclosure": true, "fullImmutableValuesRetained": true, "longIdentifiersDisclosed": true, "readOnly": true},
  "complementary": {"demandRole": "screens_eligibility", "strategyRole": "survey_queue_after_demand", "currentMetrics": ["factory_count", "factory_workers", "hotel_rooms"], "nonbankActivitySupported": false, "sharedSourceIsIndependentEvidence": false, "anchorProximityOrCustomerTransferProven": false, "additionalAnchorPhase": "P1"},
  "priorAcceptance": {"version": "1.9.10", "report": "docs/MAP_EXPLORATION_v1.9.10.md", "countsTimestampsHashesNotCurrentAcceptance": true},
  "currentReceipts": ["evidence/automated-v1.9.11.json", "evidence/qa-v1.9.11.json", "evidence/browser-v1.9.11/native-browser-review.json"],
  "publicationEvidence": "release-evidence/RELEASE_ATTESTATION_v1.9.11.json after provider/live verification",
  "productionBackendOrPhysicalDeviceCertification": false
}
```
