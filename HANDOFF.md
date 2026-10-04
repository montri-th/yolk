---
document_id: yolk.handoff.three_industries
version: 1.7.1
date: 2026-10-04
status: source_backed_static_preview
start: START_HERE.md
product_contract: contracts/product.v1.7.json
experience_contract: contracts/workspace-map.v1.7.json
criteria_baseline: contracts/criteria-proposal.v1.6.json
asset_manifest: contracts/assets.v1.7.json
brand_logo_manifest: prototype/data/brand-logos.v1.7.json
release_manifest: contracts/release.v1.7.1.json
---

# ส่งต่อ dev — Yolk · v1.7.1 · LDS 0.9.7

**เลือกแบรนด์ ลองเกณฑ์ และทำงานข้างแผนที่เดียวกันทุกหน้า** รุ่นนี้รองรับ Fuel, Grocery และ Non-bank ใช้ snapshot CityMETER จริง 7,954 พื้นที่ มีเกณฑ์และ draft แยกตามแบรนด์/ขอบเขต ข้อมูล Sheets ต้นทางคงเดิม

เริ่มจาก [START_HERE](START_HERE.md) → [Product statement](CityMETER_Yolk_Product_Statement_v1.7.md) → [Criteria guide](docs/CRITERIA_GUIDE.md) → [Implementation plan](IMPLEMENTATION_PLAN_v1.7.md) งานโมเดลใช้ [machine tasks v1.6 ที่รักษาไว้](contracts/implementation-tasks.v1.6.json); งานแผนที่ใช้ [workspace-map contract v1.7](contracts/workspace-map.v1.7.json)

## ทดลอง workflow

รัน `python3 -m http.server 8854 --bind 127.0.0.1` ที่ root แล้วเปิด `http://127.0.0.1:8854/prototype/` ผ่าน HTTP เพื่อโหลด JSON และฟอนต์

1. เลือกธุรกิจ แบรนด์ และ format หลัก เปิด preset ที่เข้าคู่กัน หรือค่าที่เคยบันทึกไว้ การสลับแบรนด์ไม่แทนทับงานอีกบริบท
2. สำรวจประเทศ→จังหวัด→อำเภอ→ทำเล ประเทศใช้สีตามอำเภอ จังหวัด/อำเภอใช้สีทำเลละเอียด เลือกทำเลแล้วจึงเห็น O/C/U สลับเมนูได้โดยไม่ซูมกลับทุกครั้งที่ render
3. ในหน้าเกณฑ์ ลากแถบเลื่อนหรือกรอกค่าละเอียด ดูผ่านเกณฑ์ เกณฑ์ทีม เข้าใหม่ หลุดเกณฑ์ รอตรวจ และอันดับเปลี่ยน กด Apply จึงบันทึกเกณฑ์ทีม
4. เปิดทำเลหรือสาขาเพื่อซูมไปข้อมูลที่เลือก ดู Demand, Supply, ที่มา และงานต่อ รูปสาขาสูงสุด 5 รูปเป็น local drafts
5. ทดลอง TH/EN, light/dark/system, feed/leaderboard และบทบาท 10 คน ตรวจว่าการ render ฟอร์มเดิมไม่ทำให้ข้อความหาย

**ขอบเขตเดโม:** การแก้ข้อมูล บทบาท กิจกรรม และ notification เป็น browser-local simulation ยังไม่มี shared backend, server RBAC, ส่ง email/LINE จริง หรือ live Sheets sync โครง AND/OR เริ่มตาม preset; generic rule builder และสูตรใหม่เป็นงานต่อยอด

## Authority ของผลิตภัณฑ์และโมเดล

| ส่วน | ใช้ไฟล์ |
|---|---|
| Product รุ่นปัจจุบัน | [product.v1.7.json](contracts/product.v1.7.json) |
| แผนที่เดียวทุกเมนู | [คู่มือ](docs/PERSISTENT_MAP_v1.7.md) + [workspace-map.v1.7.json](contracts/workspace-map.v1.7.json) |
| Brand/format และเกณฑ์ตั้งต้น | [Brand presets](docs/BRAND_PRESETS_v1.7.md) + [registry](prototype/data/brand-presets.v1.7.json) + [brand contract](contracts/brand-experience.v1.7.json) |
| สูตรและความหมายที่รักษาไว้ | [criteria-proposal.v1.6.json](contracts/criteria-proposal.v1.6.json), [parameter presets](contracts/runtime-parameter-presets.json), [industry profiles](contracts/industry-profiles.json) |
| งาน production พื้นฐาน | [implementation-tasks.v1.6.json](contracts/implementation-tasks.v1.6.json) + [แผน human-readable v1.7](IMPLEMENTATION_PLAN_v1.7.md) |
| Assets | [DS integration](DS_ASSET_INTEGRATION.md), [asset index 1.7](ASSET_INDEX_v1.7.md), [current asset manifest](contracts/assets.v1.7.json), [official logo manifest](prototype/data/brand-logos.v1.7.json) |

Base LDS 0.9.7 และ Location Intelligence Profile ใน `reference/lds-0.9.7/` เป็น authority ด้านรูปแบบ เอกสาร criteria-workspace/release และภาพ v1.6 เป็นประวัติหรือ baseline เฉพาะรุ่นที่ระบุ ไม่ใช่หลักฐานรับแผนที่รุ่นนี้

## ความหมายข้อมูลและผลคัด

ฐานประเทศมี 7,954 reporting UUIDs: กทม. 180 แขวง / ต่างจังหวัด 7,774 อปท. แต่ละ metric คำนวณ percentile จาก valid values ในฐานเดิม ไม่ rebase ตามจังหวัด แบรนด์ หรือ viewport ไม่เติม missing เป็นศูนย์

ค่า default รายแบรนด์มาจาก registry v1.7 รวม industry baseline และ family overrides จำนวนผลคัดขึ้นกับ context, scope, source release และ criteria revision จึงต้องอ่านจากผล evaluator ของรอบนั้น ไม่ใช้ตัวเลข baseline v1.6 เป็นจำนวนปัจจุบัน

Fuel อาคาร/กิจกรรมของบางจากและน้ำหนัก 70/20/10 ที่ตกลงไว้ยังเป็น baseline Grocery ใช้บริบทประชากร/คนงาน/รูปแบบร้าน; Non-bank ใช้ประชากรและบริบทบริการตาม profile เป็น Demand proxy สำหรับสำรวจ ไม่ยืนยันผู้ซื้อ ผู้กู้ ความสามารถชำระหนี้ หรือสิทธิ์รับบริการ

Supply aggregates ผูก UUID โดยตรง แยกจาก POI และ team overlays Non-bank ยังมีสำนักงานที่ไม่ผูกพื้นที่ละเอียด; Grocery มี category-assignment discrepancy ใช้ residual/bounds ตาม source evidence ไม่แทน unknown ด้วย 0 หรือกระจายยอดเดียวซ้ำทุกพื้นที่ เก็บ possiblePatterns และ review แยกจาก confirmed membership

## แผนที่ สี และหมุด

ภาพประเทศใช้ choropleth ตามอำเภอ จังหวัด/อำเภอใช้ choropleth ตามทำเลละเอียด สีเป็น **Tier ยืนยันดีที่สุดของไข่แดงที่ผ่านใน layer นั้น** ไม่ใช่ percentile หรือคะแนน rank ของ polygon อำเภอสรุปเฉพาะทำเลที่มี parent crosswalk ตรวจแล้ว ไม่คำนวณ Demand ใหม่ทั้งอำเภอ ใช้ native `li.demand` 3 classes: **Tier 3 = #F1F5E5 / Tier 2 = #60C9AD / Tier 1 = #25659A** คง exact HEX และ fill opacity 1 ทั้งสองธีม ไม่มีผลยืนยันใช้พื้นกลาง; ข้อมูลรอตรวจมีข้อความ/เส้นประ/จำนวนแยก ไม่สรุปว่าไม่มี Demand

Source projection มี 928 อำเภอและ 7,954 ทำเลละเอียดใน 77 ไฟล์จังหวัด ตรวจ coverage/hash จาก [hierarchy index](prototype/data/real/hierarchy-index.json) ได้ Crosswalk มี 7,909 ทำเลสัมพันธ์กับอำเภอเดียวและ45 ทำเลสัมพันธ์กับหลายอำเภอ ใช้การทับซ้อน polygon ต้นทาง ≥0.5% ของพื้นที่ทำเล เป็นอัตราส่วน planar EPSG:4326 สำหรับจัดมุมมอง ไม่ใช่ surveyed area หรือการรับรองเขตปกครอง ยอดประเทศนับ UUID ไม่ซ้ำ ไม่บวก8,001 relation edges เป็นจำนวนทำเล กทม. ใช้แขวง ต่างจังหวัดใช้ อปท./เทศบาล; ตำบล optional ต้องมี crosswalk เพิ่ม ไม่ถือว่า อปท. เท่ากับตำบล รอบขอบเขตและสถานะกฎหมายไม่ได้ตรวจยืนยันอิสระ

[Boundary provenance](prototype/data/real/boundary-provenance.v1.7.json) ระบุ source URL, count/hash และการเตรียม display projection: raw topology ที่ไม่ valid 6 อำเภอ / 47 แขวง / 3,770 อปท. ใช้ `make_valid`, เก็บ polygon และทิ้งเส้นที่ยุบพื้นที่ศูนย์; simplify tolerance 0.0006° อำเภอ / 0.00015° ทำเล พร้อมกลับใช้ valid unsimplified components หาก simplify ผิดรูป ชุดแสดงผล 8,882 polygons ผ่าน validity check ไม่มี bbox แทน polygon ต้นฉบับคง immutable และไม่เปลี่ยน metric/ตัวหารพื้นที่ของโมเดล การตรวจนี้ไม่ใช่การรับรองเขตกฎหมายหรือ browser QA

Map host `#workspace-map` อยู่ภายนอก `#content` ใช้ Leaflet instance เดิม `mount()` ทำซ้ำได้, `sync()` อัปเดต overlay โดยไม่ refit; `navigate(path)`, `back()`, `home()`, `focusArea()` และ `focusPoi()` เป็น explicit view actions อ่าน hierarchy จาก `getNavigation()` และ callback `onNavigate` ตาม controller จริง มุมมองคงอยู่ระหว่างใช้งานในหน้าที่โหลดนี้ ยังไม่บันทึก pan/zoom ข้าม reload

Polygon/MultiPolygon แสดงเมื่อมี source/verified geometry เท่านั้น Extent จากต้นทางเป็นเส้นประไม่เติมสี ใช้จัดมุมมอง ไม่ใช่ขอบเขตทางกฎหมายหรือหลักฐานผูก POI เลือกทำเลละเอียดแล้วจึงแสดงหมุดที่มีพิกัดต้นฉบับและความสัมพันธ์กับพื้นที่ที่ตรวจได้ **O = สาขาเรา / C = คู่แข่ง / U = รอตรวจ** จุดที่มองเห็นไม่ได้รับรองว่าเปิดบริการหรืออยู่ใน Polygon ตามกฎหมาย ยอดรวมไม่ถูกสร้างเป็นหมุด

Selected fine view ไม่เติมสีในขอบเขต (`fill=false`) จึงอ่าน basemap ได้ เน้นเส้นขอบ/ชื่อ/สถานะ Tier โดย country/province/district choropleths ยังใช้ exact full-opacity data fills จุดที่ไม่มี area UUID แสดงได้เมื่อพิกัดจริงผ่าน source-polygon view predicate แต่ไม่เปลี่ยน area assignment หรือยอด aggregate การ save สาขาจับ context/route/record/revision ก่อนรอรูปและตรวจซ้ำหลัง await ผลเก่าต้องไม่แก้หรือ rollback POIs ของบริบทปัจจุบัน

แผนที่แสดงสูงสุด 1,000 หมุดและ 350 ทำเลต่อมุมมอง พร้อมจำนวนที่แสดงเทียบรายการในกรอบ เป็นเพดาน render ไม่ใช่ inventory ทั้งหมด ข้อมูลธุรกิจโหลดไม่สำเร็จต้องซ่อนผลแบรนด์ก่อนหน้า; ค่าตัวเลขผิดพักการคำนวณพร้อมสถานะ; POI/tile โหลดไม่ได้ไม่ตีความเป็นศูนย์

Simplified/Detailed ใช้ OpenStreetMap; Satellite ใช้ ESA WorldCover/Copernicus Sentinel-2 ปี 2021, 10 m ผ่าน Terrascope ต้องคง attribution และระบุว่าซูมเหนือ native 14 ไม่เพิ่มรายละเอียดต้นทาง การปรับภาพพื้นหลังใช้เฉพาะ tile pane ไม่เปลี่ยนสีข้อมูล

## DS และไฟล์แบรนด์

ใช้ฟอนต์ โลโก้ ไอคอน และ tokens ตาม [DS integration](DS_ASSET_INTEGRATION.md) ไม่มี motif, logo frame, decorative bracket หรือ selected coloured left rail LOGO-01 อนุญาตปรับสี wordmark Landometer โดยคงรูปทรงและสัดส่วน ไม่ครอบคลุมการเปลี่ยนสีสัญลักษณ์หรือโลโก้แบรนด์ภายนอก

External brand logos ใช้ bytes ต้นฉบับจากแหล่งทางการ พร้อม source URL, MIME, SHA-256, dimensions และ theme support ใน [manifest](prototype/data/brand-logos.v1.7.json) หากมี official light/dark variants ให้สลับไฟล์; ถ้ายังยืนยันไม่ได้ให้ใช้ชื่อ/ไอคอนกลางที่ระบุไว้ ไม่ recolor หรือสร้าง mark ใหม่ Non-bank selector จำกัด 10 รายแรก; comparator inventory ยังใช้บริษัททั้งหมดใน licence scope ที่เลือก

## Supply-relative mode ที่อนุมัติในรุ่นนี้

[Supply-relative mode](docs/SUPPLY_RELATIVE_PROPOSAL.md) อยู่ใน static model/UI แล้ว: Fuel สาขาต่อ GFA 100,000 ตร.ม.; Grocery/Non-bank สาขาต่อประชากร 10,000 คน ปรับตัวหารได้ เกณฑ์มากของเรา/คู่แข่งแยกจาก median ของ positive national observed exact-count rates ไม่ใช้ Demand percentile/rank score ไม่รวม uncertainty bounds มี sample/fallback ที่เปิดเผย API คือ `YolkRelativeSupply` ใน `prototype/relative-supply.js` บริบทใหม่เริ่ม relative แต่ saved count contexts คงเดิมจนผู้ใช้ Apply โหมด count ยังเป็นทางเลือก Model tests ไม่แทน browser/release evidence

## ตรวจและ release

```sh
python3 scripts/verify-pages-v1.7.py
node scripts/check-three-industry.cjs
node scripts/check-brand-presets.cjs
node scripts/check-workspace-map.cjs
node scripts/check-criteria-controls.cjs
node scripts/check-relative-supply.cjs
node scripts/check-photo-runtime.cjs
node scripts/check-save-context.cjs
python3 -m http.server 8854 --bind 127.0.0.1
```

Model/DOM-adapter tests ตรวจกติกาและ integration บางส่วน ไม่พิสูจน์ pan/touch จริง ขนาดข้อความ popup ใกล้ขอบภาพ หรือความพร้อมของ tile provider ต้องตรวจ browser จริง ไทย/อังกฤษ จอแคบ/desktop light/dark รวมฟอร์มค้าง, invalid draft, context switch และ network error บันทึกสิ่งที่ตรวจจริง ไม่อ้าง viewport emulation ว่าเป็นการทดสอบเครื่องจริง

[QA baseline](evidence/QA.md) และ [ภาพ v1.6](docs/EXPERIENCE_v1.6.md) เก็บผลเดิมตามรุ่น ไม่ใช้แทนหลักฐานรับ v1.7 รุ่นนี้ต้องมี source checks, browser receipt, [public file hashes](contracts/pages-public-manifest.v1.7.1.json), [Pages provider และ live-byte evidence](contracts/release.v1.7.1.json) ที่ตรง commit เดียวกัน

Pages artifact อยู่ใน `prototype/` สำเนา runtime contracts ต้องตรง root และ URL ต้องอยู่ใต้ `/yolk/` Public repo ไม่บรรจุ raw acquisition archive, private workbook links หรือ private customer records

Production ยังต้องเชื่อม CityMETER auth/datastore/spatial API, SourceRelease, tenant/RBAC, revision locks, private media, shared events/outbox, notifications และ calibration จากผลธุรกิจ เก็บ team updates เป็น overlay ก่อน reconcile; ไม่แก้ source totals โดยตรง

## 1.7.1 patch

[Responsiveness and popup handoff](docs/RESPONSIVENESS_v1.7.1.md) includes source files, acceptance and production steps; [machine contract](contracts/responsiveness.v1.7.1.json) is the bounded coding brief. New modules: `prototype/poi-popup.js`, `prototype/poi-popup.css`. New checks: `scripts/check-poi-popup.cjs`, `scripts/check-map-responsiveness.cjs`. Original brand assets, source metrics and demand/supply model stay in their existing contracts.
