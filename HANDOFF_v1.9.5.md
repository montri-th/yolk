# Developer handoff · CityMETER: Yolk 1.9.5 · candidate

[Full product + step-by-step plan](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.5.md) · [machine blueprint](contracts/full-product.v1.9.5.json) · [mobile-flow contract](contracts/mobile-flow.v1.9.5.json) · [release](contracts/release.v1.9.5.json)

มือถือเลื่อนหน้าจากแผนที่ไปยังส่วนทำงานด้านล่างได้ตามปกติ Desktop คง map-space 1.9.4 แผนที่เดียว กล้อง criteria/drafts และ source/analytics/assets คงเดิม ปุ่มขยาย/ย่อยังเป็น personal display state ไม่ Apply หรือสร้าง team event

Production plan T00–T24 คงครบ เริ่ม T00 เพื่อสำรวจ stack จริงก่อนเลือก framework/datastore Preview เป็น browser-local; shared auth/RBAC/outbox/private media เป็นงาน production แยก

Current QA/native ผ่านแบบจำกัดตาม receipt ปัจจุบัน; publication/live bytes รอหลักฐานแยก ต้องใช้ receipt รุ่นนี้ ชุด handoff ใช้ explicit public paths ไม่มี raw acquisition/private customer/basemap tile cache
