# Developer handoff · CityMETER: Yolk 1.9.3 · local review complete

เริ่มจาก [Product statement + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.3.md) และ [machine blueprint](contracts/full-product.v1.9.3.json). ทำ T00–T24 ทีละงานตาม dependencies ไม่เริ่มจากการเปลี่ยน framework โดยยังไม่รู้ stack ของ CityMETER

## รุ่นนี้ทำอะไร

หน้า **โอกาสขยาย / Expansion opportunities** รวมภาพประเทศและ Strategy ให้เลือกแบรนด์แล้วเห็นคิวทำเลชวนสำรวจ เปิดเหตุผลและเล็งพร้อมงานแรก Demand/Supply เป็นหน้าตรวจสมมติฐานแยก แต่คงแผนที่เดียว มี 8 Strategy เลือกไม่เกิน 3 และ guide อ่านจากภาพ/ตัวอย่างสมมติได้

แผนที่ใหญ่ขึ้น มี controls สั้นและปุ่มขยาย/ย่อ เส้นย่อยขาว 0.30 px, parent หนากว่าเล็กน้อยพร้อม halo กลางบางเฉพาะ choropleth parent โหมดจุดสาขาคงเส้นเงียบ Light ใช้ foundation surface อ่อนตาม LDS สีข้อมูลและเกณฑ์ไม่เปลี่ยน

## Authority

| ส่วน | อ่านที่นี่ |
|---|---|
| Product + tasks T00–T24 | [Full document](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.3.md) / [JSON](contracts/full-product.v1.9.3.json) |
| First page / map / guide interaction | [Experience](contracts/expansion-experience.v1.9.3.json) |
| 8 Strategy narrative | [Bilingual registry](prototype/data/strategy-guide.v1.9.3.json) |
| Presets / evidence | [Profiles](prototype/data/brand-strategy-profiles.v1.9.0.json) / [research](docs/BRAND_RESEARCH_v1.9.0.md) |
| Strategy rules | [Retained engine contract](contracts/opportunity-strategies.v1.9.0.json) |
| Assets | [DS integration](DS_ASSET_INTEGRATION.md) / [Asset index](ASSET_INDEX_v1.9.3.md) |
| Release truth | [Release](contracts/release.v1.9.3.json) / [handoff](contracts/handoff.v1.9.3.json) |

## ห้ามเปลี่ยนโดยเงียบ

เกณฑ์/profile/engine/strategy ใช้ 1.9.0, interaction ใช้ 1.9.1 และ brand identity ใช้ 1.9.2 ฐาน 7,954 UUIDs, 25 metrics, 37 profiles, units/source periods/national benchmark คงเดิม Strategy เป็นคิวสำรวจหลัง Demand ไม่ใช่คะแนนยอดขาย Guide เป็น read-only ตัวอย่าง/ภาพไม่ใช่ผลจริง

#strategy เดิมเป็น alias ของ #market รักษา context, camera, criteria/drafts และ Strategy ที่เลือก ปุ่มขยาย/ย่อไม่สร้าง map ใหม่หรือ team event Basemap loading/error/retry แยกจากข้อมูลวิเคราะห์และไม่เปลี่ยนผลคำนวณ

## ก่อนส่งต่อและ publish

Current local QA รุ่น 1.9.3 ผ่านแบบจำกัด: 32 suites / 537 reported cases, 22 native checks และภาพจริง 17 ภาพ Provider/live/ZIP ยังรอหลักฐานแยก ตรวจข้อความไทย/อังกฤษจริงทั้งจอแคบและ desktop ใน light/dark รวม guide, alias, expanded map, hover, tile retry และ save failure ผลเก่าเป็นประวัติ ไม่ใช่ current pass

Static preview ยังเก็บงานใน browser การทำงานร่วมทีมต้องมี shared backend, server RBAC, revision locks, event/outbox, private media และ notification channels ตาม full plan การตรวจ local ไม่ยืนยัน production backend หรืออุปกรณ์จริง
