# CityMETER: Yolk 1.9.10 — เริ่มที่นี่

**เลือกแบรนด์ → โอกาสขยาย → ดูเหตุผล → เล็งทำเลพร้อมแผนสำรวจ**

รุ่นนี้ปรับ hover ให้อยู่นอกแผนที่ แสดงโลโก้เมื่อจุดน้อย คืนตัวเลือก Satellite พร้อมระบุแหล่ง และแยกศูนย์/ไม่มีข้อมูลตาม DS โดยคงข้อมูล CityMETER และเกณฑ์ Demand เดิม สถานะการตรวจและการเผยแพร่ดูจากหลักฐานแยกด้านล่าง

1. [Product statement + implementation จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.10.md) — อ่านส่วน human ก่อน; JSON ท้ายไฟล์ตรงกับ machine blueprint
2. [Machine blueprint](contracts/full-product.v1.9.10.json) — T00–T24, schema, API, acceptance และ coding prompts
3. [สี่จุดที่ปรับปรุง](docs/MAP_EXPLORATION_v1.9.10.md) · [สิ่งที่แก้จาก red-team](docs/RED_TEAM_RESOLUTION_v1.9.10.md) และ [contract](contracts/red-team-remediation.v1.9.10.json)
4. [Implementation plan](IMPLEMENTATION_PLAN_v1.9.10.md) · [DS และ assets](DS_ASSET_INTEGRATION.md) · [brand research](docs/BRAND_RESEARCH_v1.9.0.md)
5. [Release seal](contracts/release.v1.9.10.json) · [QA ปัจจุบัน](evidence/qa-v1.9.10.json) · [Handoff](HANDOFF_v1.9.10.md)
6. [Release พร้อม provider/live attestation และ ZIP](https://github.com/montri-th/yolk/releases/tag/v1.9.10) — เป็นแหล่ง publication state หลัง seal; ไม่ใช้สถานะ local แทนหลักฐานเว็บจริง

## ขอบเขตที่ต้องรักษา

- 3 industries / 37 selectable brands; Non-bank ให้เลือก 10 รายแรก พร้อม peer inventory ตาม source
- Demand คัดทำเล; Supply และ Strategy ช่วยจัดลำดับและวางแผนสำรวจ ไม่ยืนยันยอดขายหรือผลธุรกิจ
- P0 ใช้ข้อมูลที่มี; anchor/offerings, routes/future และ private calibration อยู่เฟสถัดไป
- Preview บันทึกใน browser; production shared backend/auth/RBAC/outbox/media ยังต้องพัฒนา
- Mobile viewport ไม่เท่ากับการตรวจ iPhone/Android จริง

## เอกสารเก่า

[1.9.8 full brief](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.8.md) และ receipts เก็บเพื่อ trace เท่านั้น คำว่า current/pending ในเอกสารเก่าหมายถึงเวลาที่ออกเอกสารนั้น ใช้ current index นี้ตัดสินลำดับอำนาจ
