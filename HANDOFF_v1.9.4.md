# Developer handoff · CityMETER: Yolk 1.9.4 · candidate

[Full product + step-by-step plan](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.4.md) · [machine blueprint](contracts/full-product.v1.9.4.json) · [map-space contract](contracts/map-space.v1.9.4.json) · [release](contracts/release.v1.9.4.json)

รุ่นนี้เพิ่มพื้นที่แผนที่ด้วย layout กระชับ ไม่เปลี่ยนสูตร เกณฑ์ profiles, source counts, Tier/LUT41, artwork หรือ guide 8 วิธี production plan T00–T24 คงครบ เริ่ม T00 เพื่อสำรวจ stack จริงก่อนเลือก framework/datastore

Map/sidebar expansion เป็น personal display state คง map instance/context/camera/drafts และ form/photo drafts ไม่ Apply เกณฑ์หรือสร้าง team event controls ต้องอ่านและใช้งานได้ด้วย mouse/touch/keyboard ไทย/อังกฤษทั้งสอง theme

Current QA/native ผ่านแบบจำกัดตาม receipt ปัจจุบัน ส่วน publication/live bytes รอหลักฐานแยก ผล1.9.3เป็น baseline ประวัติเท่านั้น ชุด handoff ใช้ explicit public paths ไม่รวม raw acquisition/private customer/tile cache data Shared backend/auth/RBAC/outbox/media ยังเป็น production tasks
