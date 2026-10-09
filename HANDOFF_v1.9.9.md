# Handoff · Yolk 1.9.9

[เริ่มที่นี่](START_HERE.md) · [Full brief + plan](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.9.md) · [Fix report](docs/RED_TEAM_RESOLUTION_v1.9.9.md)

## การรับงาน

1. แตก ZIP แล้วอ่าน START_HERE.md และ current machine blueprint
2. รัน `python3 scripts/verify-pages-v1.9.9.py` ตรวจ sealed artifact
3. รัน `python3 scripts/check-evidence-closure.py` ตรวจ raw regression logs และ SHA ที่อยู่ภายในชุดเดียวกัน
4. รัน suites ใน `.github/workflows/pages.yml` ก่อนแก้ runtime; ใช้ local static server เพื่อดู prototype
5. เริ่ม production T00 เพื่อ map stack จริง ก่อนเลือก framework/backend

## แยกสถานะให้ถูก

- `contracts/release.v1.9.9.json` เป็นสถานะ source seal ณ เวลาก่อนเผยแพร่
- `release-evidence/RELEASE_ATTESTATION_v1.9.9.json` ภายใน ZIP ผูก source SHA, provider run และ live bytes หลังเผยแพร่
- [GitHub Release v1.9.9](https://github.com/montri-th/yolk/releases/tag/v1.9.9) เป็น publication index พร้อม ZIP และ checksum ปัจจุบัน
- QA ระบุ browser/viewport ที่ตรวจจริง; ไม่ยืนยันทุกอุปกรณ์หรือ production backend

ประวัติรุ่นเก่ายังคงเดิม ไม่ย้ายผลทดสอบเก่ามาเป็นการผ่านของรุ่นนี้ Current logs ทุก suite อยู่ใน evidence/automated-v1.9.9/ และอ้างจาก repository root
