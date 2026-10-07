# Developer handoff · CityMETER: Yolk 1.9.1

เริ่มจาก [Product statement + implementation ฉบับเต็มไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.1.md) แล้วทำ T00 เพื่อ map stack จริงของ CityMETER ก่อนเขียนบริการ production

## ชุดส่งต่อ

| ส่วน | ไฟล์ |
|---|---|
| Product + full plan จากศูนย์ | [เอกสารเต็ม 1.9.1](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.1.md) |
| งาน T00–T24 และ machine blueprint | [แผนย่อ](IMPLEMENTATION_PLAN_v1.9.1.md), [full-product.v1.9.1.json](contracts/full-product.v1.9.1.json) |
| Interaction patch | [คู่มือ](docs/MAP_CLARITY_AND_ACTION_GUIDANCE_v1.9.1.md), [machine contract](contracts/interaction-guidance.v1.9.1.json) |
| เกณฑ์ / Strategy / brand registry เดิม | [Strategy contract 1.9.0](contracts/opportunity-strategies.v1.9.0.json), [brand research](docs/BRAND_RESEARCH_v1.9.0.md), [runtime registry](prototype/data/brand-strategy-profiles.v1.9.0.json) |
| DS / identity / fonts / icons / scales | [Asset index](ASSET_INDEX_v1.9.1.md), [DS integration](DS_ASSET_INTEGRATION.md), `prototype/`, `reference/lds-0.9.7/` |
| Release / package / checksums | [Release state](contracts/release.v1.9.1.json), [handoff contract](contracts/handoff.v1.9.1.json), sealed public manifest และ `SHA256SUMS.txt` หลัง final QA |

## UX ที่ปรับ

- Hover พื้นที่มี tooltip เดียว แสดงชื่อขอบเขตที่จะคลิกและค่าหลักพร้อมหน่วย
- Supply โหมดจุดสาขาลดเส้นขอบย่อยที่รบกวน เหลือบริบทที่เกี่ยวข้อง ภายในโปร่งและมีกรอบ hover เหลือง
- เล็งทำเลสำเร็จเห็นปลายทาง Shortlist และจำนวนที่เพิ่มจริง การเพิ่มซ้ำ/บันทึกล้มเหลวไม่แสดง +1
- Motion ใช้ feedback สั้นเท่านั้น ไม่บังงานหรือย้าย focus Reduce motion แสดงจำนวน/ข้อความสุดท้ายทันที

เกณฑ์ Demand, Supply, profiles และ Strategy engine ยังคง **1.9.0** การเปลี่ยนเวอร์ชัน UI ไม่ทำให้ preset, source counts, Tier หรือ eligible IDs เปลี่ยน

## ข้อมูลและ assets ที่ต้องคง

7,954 reporting UUIDs / 25 metrics / 3 industries / 37 selectable identities, national benchmark, raw formulas และ provenance เดิม Exact LDS 0.9.7 + Location Intelligence Profile + 41 LUT samples, white ordinary boundaries, yellow hover และ transparent selected fine interior

ใช้ original unframed logo และ square brand graphics พร้อมชื่อ ไม่ animate identity/evidence/map, ไม่มี motif, bracket หรือ selected colored left rail ไม่รวม raw acquisition, signed media, basemap tile cache หรือ private customer data ใน public handoff

## Production และการตรวจรับ

Preview เป็น browser-local simulation Shared datastore/auth/server RBAC/outbox/email/LINE/private media ยังเป็น production tasks คง 1 Admin / 3 Editors / 6 Viewers และ source-first branch context

รัน retained suites และ `check-map-clarity.cjs`, `check-action-guidance.cjs` ตรวจ actual Thai/English, narrow/desktop, light/dark รวม single tooltip, POI readability, shortlist save/duplicate/failure และ reduced motion ผล current QA อยู่ใน receipt รุ่น 1.9.1 ที่ตรวจรวมแล้ว

สถานะ QA/provider/live-byte ดู [release contract](contracts/release.v1.9.1.json) อย่าถือ VM/hash pass ว่าเป็น native browser, physical device, full accessibility หรือ shared backend pass Seal ด้วย scripts รุ่น 1.9.1 หลัง final QA เท่านั้น แล้วผูก deployment และ live bytes กับ final source SHA

เอกสาร/receipts รุ่น 1.9.0 และเก่ากว่าเก็บเป็นประวัติ ไม่แก้ย้อนและไม่ยกผลเดิมมาเป็นการตรวจผ่านของรุ่นนี้

Current local QA: 28 suites / 497 checks และ bounded native review 22 ข้อ ภาพจริง 6 ภาพ ดู [QA 1.9.1](evidence/qa-v1.9.1.json). Package LDS ตรวจใหม่ผ่าน 9,768 ข้อ/65 warnings เป็น package-only ไม่รับรอง artifact/account/team ทั้งหมด Provider/live-byte evidence แยก และ physical device/screen reader/full matrix ยังไม่ตรวจ
