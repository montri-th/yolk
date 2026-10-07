# Implementation plan · CityMETER: Yolk v1.9.3

เริ่มจาก [Product statement + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.3.md) และ [machine blueprint](contracts/full-product.v1.9.3.json). ทำ T00–T24 ทีละงานตาม inputs, outputs, dependencies, acceptance และ codingPrompt

รุ่นนี้ใช้ **โอกาสขยาย / Expansion opportunities** เป็นทางเข้า: preset ของแบรนด์ → คิวทำเลชวนสำรวจ → เหตุผลและงานแรก → เล็งทำเล Demand/Supply แยกไว้ตรวจสมมติฐาน เลือกไม่เกิน 3 จาก 8 Strategy ภายในหน้าแรก มี guide ไทย/อังกฤษพร้อมภาพและตัวอย่างสมมติ

| Task | งานที่เพิ่มในรุ่นนี้ |
|---|---|
| T01 | แผนที่ responsive, soft foundation surfaces, controls สั้น และปุ่มขยาย/ย่อ |
| T10 | ใช้ผลประเมินเดิมสร้างคิวทำเล ไม่สร้างคะแนนธุรกิจใหม่ |
| T12 | เส้นขอบ parent/child, expanded map, tile loading/error/retry |
| T14 | รวมหน้าแรก รักษา legacy alias และทำ read-only guide ทั้ง 8 วิธี |
| T15 | เล็งจากการ์ดพร้อม snapshot, owner และ success-only feedback |
| T23 | ตรวจ source/native ของรุ่นนี้ รวมข้อความ ภาพ guide, focus, map และ failure |

เกณฑ์/profile/engine/Strategy ใช้ 1.9.0, interaction ใช้ 1.9.1 และ brand identity ใช้ 1.9.2 ผลรุ่นก่อนเป็นประวัติ Current local QA ผ่านแบบจำกัด: 32 suites / 537 reported cases และ 22 native checks Publication/live bytes ยัง pending ดู [release contract](contracts/release.v1.9.3.json)
