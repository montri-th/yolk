# Handoff · Yolk 1.9.11


**ผลตรวจปัจจุบันก่อนเผยแพร่:** 44 suites / 747 reported cases ผ่าน; 10 bounded native observations พร้อมภาพจริง20ภาพ รวม fixtureกิจกรรมที่ระบุเป็นข้อมูลสมมติ ตรวจ Thai/Englishและบางสถานะlight/darkในChromeที่320/390/1440px ยังไม่ใช่การรับรองทุกแบรนด์/อุปกรณ์/backend ดู [QA](evidence/qa-v1.9.11.json) การเผยแพร่และ ZIP ยืนยันแยกใน GitHub Release attestation หลัง provider/live ผ่าน

[เริ่มที่นี่](START_HERE.md) · [Full brief + plan](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.11.md) · [รายงานสี่จุดที่เพิ่ม](docs/MAP_EXPLORATION_v1.9.11.md) · [Permalink 37 แบรนด์](docs/BRAND_DEMO_LINKS.md)

## ขอบเขตของ patch

1. โลโก้จุดสาขา: 500 จุดเมื่อ map host กว้างอย่างน้อย 600 CSS px / 250 จุดเมื่อแคบกว่า ทุก drilldown; เกินนั้นใช้ Canvas แสดงพิกัดที่เข้า filter ทั้งหมด ไม่ cap inventory
2. Brand permalink: ผู้รับใหม่เปิด “โอกาสขยาย” ด้วย preset/default scope ที่ผูก source registry เดิม; saved target-brand criteria/draft มาก่อน preset และการเปิดลิงก์ไม่เขียนงานหรือสร้าง team event
3. Activity: ฟิลด์อยู่เหนือค่าเดิม/ใหม่ในแนวตั้ง ข้อความยาวมี preview + disclosure อ่านค่าครบ และรหัสยาวอยู่ในรายละเอียด ไม่บีบ note เป็นคอลัมน์แคบ
4. วิธี 05: แยก Demand ที่คัด eligibility ออกจากกิจกรรมเสริมที่จัดคิวสำรวจ พร้อมป้าย dataset ที่ใช้ร่วมกันและข้อจำกัด source/period/profile

## การรับงาน

1. แตก ZIP แล้วอ่าน START_HERE.md และ machine blueprint ปัจจุบัน
2. เปิด [catalog](prototype/brands.html), [JSON](prototype/data/brand-demo-links.json) และ [รายงาน permalink](docs/BRAND_DEMO_PERMALINK_IMPLEMENTATION.md); ใช้ alias เดิมเพื่อไม่ทำลิงก์ฝ่ายขายขาด
3. อ่าน [คำอธิบาย Demand/กิจกรรมเสริม](docs/COMPLEMENTARY_DEMAND_CLARITY_v1.9.11.md) ก่อนเปลี่ยนคำหรือเพิ่ม dataset; ไม่เพิ่มคะแนน/ลูกค้าจริงจาก UI copy
4. รัน suites ใน `.github/workflows/pages.yml` รวม permalink, responsive Activity, complementary clarity และ POI หลัง threshold ใหม่; ดู rendered ไทย/อังกฤษ แผงแคบและ desktop ทั้งสองธีม
5. หลัง final QA และ seal รัน `python3 scripts/verify-pages-v1.9.11.py` ตรวจ artifact และ `python3 scripts/check-evidence-closure.py` ตรวจ raw logs/SHA ภายในชุดเดียวกัน; ตรวจ ZIP ที่ส่งจริงอีกครั้ง
6. เริ่ม production T00 เพื่อ map stack/source จริง ก่อนเลือก framework/backend และพัฒนา shared auth/RBAC/outbox/private media

## แยกสถานะให้ถูก

**สถานะเอกสาร ณ รอบ implementation:** current integrated QA, native review, final ZIP closure และ publication 1.9.11 ยังต้องปิดจากหลักฐานจริง รายงานเฉพาะโมดูลไม่รับรอง release ทั้งหมด

- `contracts/release.v1.9.11.json` เป็นสถานะ source seal ก่อนเผยแพร่ อ่าน status/runtime hashes จริง ไม่อนุมานจากชื่อไฟล์
- `evidence/automated-v1.9.11.json`, `evidence/qa-v1.9.11.json` และ native receipt ต้องสร้างจากรอบปัจจุบัน ไม่คัด PASS/count/time/hash จากรุ่นเก่า
- เมื่อเผยแพร่แล้ว `release-evidence/RELEASE_ATTESTATION_v1.9.11.json` ใน ZIP ผูก source SHA, provider terminal result และ live bytes ที่ตรวจจริง
- [GitHub Release v1.9.11](https://github.com/montri-th/yolk/releases/tag/v1.9.11) เป็น publication index หลัง release พร้อม ZIP/checksum; ลิงก์นี้ก่อน provider/live attestation ไม่ยืนยันเผยแพร่แล้ว
- QA ระบุ browser/viewport/journey ที่ตรวจจริง; ไม่รับรองทุกอุปกรณ์หรือ production backend

ประวัติรุ่นเก่ายังคงเดิม Raw logs ปัจจุบันต้องอยู่ใน `evidence/automated-v1.9.11/` และอ้างจาก repository root ให้เปิดอ่านได้ภายใน ZIP เดียวกัน
