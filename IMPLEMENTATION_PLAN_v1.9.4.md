# Implementation plan · CityMETER: Yolk v1.9.4

เริ่มจาก [Product statement + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.4.md) และ [machine blueprint](contracts/full-product.v1.9.4.json). งาน T00–T24 ของ production คงครบ และเพิ่ม [map-space extension](contracts/map-space.v1.9.4.json) ใน T01/T12/T23

1. วัดพื้นที่ basemap จริงก่อนแก้ shell
2. ทำ navigation ที่กระชับ และ controls/disclosure ที่ยังอ่านและกดง่าย
3. คงแผนที่เดียว กล้อง ขอบเขต draft/form และ source/criteria ทุกค่า
4. ตรวจ mouse/touch/keyboard ภาษาไทย/อังกฤษทั้งสอง theme
5. วัดพื้นที่ canvas หลังแก้ เก็บ current screenshots และ receipts
6. หลัง final QA จึง seal/publish/live-byte verify และส่ง handoff ตาม T24

คู่มือ 8 วิธี/หน้าโอกาสขยายใช้ 1.9.3, เกณฑ์/profile/engine/Strategy ใช้ 1.9.0, interaction1.9.1 และ brand identity1.9.2 Current QA ผ่านแบบจำกัดตาม receipt ปัจจุบัน; ผลเดิมเป็นประวัติ ดู [release contract](contracts/release.v1.9.4.json)
