# Implementation plan · CityMETER: Yolk v1.9.1

อ่าน [Product statement + implementation ฉบับเต็มไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.1.md) พร้อม [machine blueprint](contracts/full-product.v1.9.1.json) แล้วทำ T00–T24 ทีละงานตาม dependencies ใช้ stack จริงหลัง T00

รุ่นนี้แก้ presentation และ feedback: tooltip พื้นที่ไม่ซ้อน ดูหมุดโดยไม่ติดเส้นขอบจำนวนมาก และเล็งทำเลแล้วเห็นปลายทางพร้อมจำนวนที่เพิ่มจริง สูตร/เกณฑ์/engine/brand profiles ยังเป็น 1.9.0 เดิม

งานที่ปรับเพิ่ม: **T12** single-owner hover + quiet POI boundaries, **T15** successful shortlist destination/count feedback + reduced motion, **T23** native and failure/interruption checks. อ่าน [interaction guide](docs/MAP_CLARITY_AND_ACTION_GUIDANCE_v1.9.1.md)

P0 ใช้ Demand + source-scope Supply + Strategy research queues 01/03/05/07; P1 anchors/offerings/site evidence; P2 routes/future milestones; P3 private operational calibration. Shared auth/RBAC/datastore/outbox/private media เป็นงาน production แยกจาก static preview

ทุก task คืน outputs, acceptance, tests และข้อที่ยังไม่ตรวจ ไม่มี source rewrite, hidden factors หรือ silent threshold migration Seal และ publish หลัง final QA เท่านั้น ดู [release state](contracts/release.v1.9.1.json)
