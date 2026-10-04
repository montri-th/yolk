---
version: 1.7.3
date: 2026-10-04
status: local_bounded_QA_pass_release_pending
entrypoint: prototype/index.html
product_contract: contracts/product.v1.7.json
feature_extension: contracts/location-review.v1.7.3.json
map_analysis_baseline: contracts/map-analysis.v1.7.2.json
design_system: LDS 0.9.7
---

# เริ่มที่นี่ — CityMETER: Yolk · v1.7.3

หาไข่แดง เทียบ Supply แล้วเล็งทำเล ทีมเห็นเหตุที่ข้อมูลยังไม่ชัดและรู้ว่าต้องตรวจอะไรต่อบนแผนที่เดียว รุ่นนี้คงสูตรและ cohort เดิม เพิ่มคำอธิบาย review สี Tier แบบไข่ดาว และ native LUT41 สำหรับตัววัดเชิงปริมาณ

| ต้องการ | เปิด |
|---|---|
| เข้าใจผลิตภัณฑ์ | [Product statement](CityMETER_Yolk_Product_Statement_v1.7.3.md) |
| เริ่มพัฒนา | [Implementation plan](IMPLEMENTATION_PLAN_v1.7.3.md) + [machine tasks](contracts/location-review.v1.7.3.json) |
| เข้าใจทำเลรอตรวจ | [เหตุ ผล audit และ checklist](docs/LOCATION_REVIEW_v1.7.3.md) |
| เข้าใจ Demand/Supply map | [retained analysis guide](docs/MAP_ANALYSIS_v1.7.2.md) + current appearance override ใน [1.7.3 contract](contracts/location-review.v1.7.3.json) |
| ดูสูตรและ preset | [Criteria](docs/CRITERIA_GUIDE.md), [Supply-relative](docs/SUPPLY_RELATIVE_PROPOSAL.md), [Brand presets](docs/BRAND_PRESETS_v1.7.md) |
| ต่อ DS และ identity | [DS integration](DS_ASSET_INTEGRATION.md), [asset index](ASSET_INDEX_v1.7.md) |
| รับงาน/เผยแพร่ | [Handoff](HANDOFF.md), [release status](contracts/release.v1.7.3.json) |

## ทดลอง

    python3 -m http.server 8854 --bind 127.0.0.1

เปิด /prototype/ ผ่าน HTTP เลือกธุรกิจ/แบรนด์ → Demand → Supply → เกณฑ์ ทดลองแบบร่างก่อน Apply กดจำนวนรอตรวจบนการ์ดเพื่อดูเหตุ หรือเปิดรายละเอียดทำเล → ดูหลักฐานและสิ่งที่ต้องตรวจ เล็งทำเลได้จากรายการ Demand

แผนที่เดียวค้างทุกหน้า Hover เน้นกรอบที่กดได้ ประเทศกดจังหวัดแต่ลงสีอำเภอ จังหวัดลงสีแขวง/อปท. เลือกทำเลแล้วภายในโปร่งใส POI ใช้ O/C/U พร้อมชื่อแบรนด์และ research links

## Authority และหลักฐาน

Product/map/brand v1.7 + criteria/production tasks v1.6 เป็นฐาน; map-analysis1.7.2 เพิ่มมุมมอง; location-review1.7.3 override เฉพาะเหตุ review และ appearance/classification การแสดงสีที่ระบุ สูตรคัด Demand ไม่เปลี่ยน LDS0.9.7 fullbase + LocationProfile เป็น authorityด้านรูปแบบโดยมี categorical Tier exception ที่เจ้าของเลือก

Source audit ตรวจสาม preset จาก snapshot เดิม ไม่แก้ต้นทางหรือยืนยัน operation การตรวจ UI/model/hash และ provider / live bytes เป็นหลักฐานคนละชั้น ดู current receipts ใน release contract เครื่องจริง/shared backend/server RBAC/email / LINE ยังไม่ใช่สิ่งที่ static preview ยืนยันได้

## Final interaction refinements - 1.7.3

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Current automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Provider/live-byte evidence remains pending.
