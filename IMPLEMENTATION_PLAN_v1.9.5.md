# Implementation plan · CityMETER: Yolk v1.9.5

เริ่มจาก [Product + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.5.md) และ [machine blueprint](contracts/full-product.v1.9.5.json). Production T00–T24 คงครบ เพิ่ม [mobile-flow extension](contracts/mobile-flow.v1.9.5.json) ใน T01/T12/T23

1. วัดตำแหน่ง map/work pane และ scroll ปัจจุบันบน narrow/tablet
2. ให้แผนที่อยู่ใน normal document flow เมื่อเลื่อนหน้าจึงถึงข้อมูลและ controls ต่อได้
3. คง map instance/camera/context/drafts, controls และ desktop layout 1.9.4
4. ตรวจ scroll, route, expand/compact, focus, tiles/retry/resize และข้อความ TH/EN ทั้งสอง theme
5. เก็บ current suites/native measurements/screenshots/hash แล้ว bind docs
6. Final QA → explicit public seal → source/provider/live-byte verification → handoff ตาม T24

Current QA/native ผ่านแบบจำกัดตาม receipt ปัจจุบัน; publication/live bytes รอหลักฐานแยก ดู [release contract](contracts/release.v1.9.5.json). เกณฑ์/profile/engine/Strategy 1.9.0, guide/หน้าแรก 1.9.3, artwork 1.9.2-owner2 และ DS 0.9.7 คงเดิม
