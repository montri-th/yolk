# CityMETER: Yolk · v1.7.2 · LDS 0.9.7

**Find the yolk. Grow your market. / หาไข่แดงให้เจอ ขยายตลาดให้ตรงจุด**

[เว็บพรีวิว](https://montri-th.github.io/yolk/) · [เริ่มที่นี่](START_HERE.md) · [Product statement](CityMETER_Yolk_Product_Statement_v1.7.2.md) · [Implementation plan](IMPLEMENTATION_PLAN_v1.7.2.md)

รุ่น 1.7.2 เพิ่ม **Demand · หาไข่แดง** และแผนที่ Supply **จำนวน / ต่อพื้นที่ / ต่อฐานตลาด** เริ่มที่ O+C รวมผู้ให้บริการที่ระบุได้ต่อฐานตลาด แล้วเลือกดูสาขาเรา คู่แข่ง หรือรวมได้ การ์ดทำเลทั้งแปดแสดง “ทำเลเข้าเกณฑ์ / ทำเลรอตรวจ” ก่อนเลือกกลยุทธ์ Source และ 217 automated checks ผ่านแล้ว พร้อม native Chrome review แบบจำกัดขอบเขต; provider/live-byte proof ยังรอ release owner ดู [คู่มือแผนที่](docs/MAP_ANALYSIS_v1.7.2.md), [machine extension](contracts/map-analysis.v1.7.2.json) และ [release status](contracts/release.v1.7.2.json)

รองรับ Fuel, Grocery และ Non-bank บน CityMETER snapshot เดิม **7,954 reporting UUIDs / 25 metrics** เกณฑ์และ draft แยกตามแบรนด์และ format โมเดล v1.7, percentile ฐานประเทศ, relative Supply และ brand presets คงเดิม หน้า Demand แสดง Tier ที่ยืนยันได้ก่อนกรองด้วย Supply, preferred patterns และ Tier สูงสุด ส่วน shortlist ยังคงใช้เกณฑ์ที่ทีมเลือก

**แผนที่เดียวอยู่กับงานทุกหน้า** สำรวจประเทศ→จังหวัด→อำเภอ→ทำเล Country Supply ใช้ข้อมูล 928 อำเภอและตัวหารของอำเภอโดยตรง ไม่บวก fine crosswalk ที่มี 45 ทำเลสัมพันธ์กับหลายอำเภอ จังหวัดและอำเภอเจาะ fine areas เดิม เลือกทำเลแล้วภายในโปร่งใสให้อ่าน basemap คง hover, navigation, popup และ Google research links รุ่น 1.7.1 ยอดรวมครบไม่ได้แปลว่า POI ทุกจุดมีพิกัดหรือยังเปิดบริการ

สีข้อมูลใช้ native DS 0.9.7 พร้อมหน่วย ตัวหาร และ legend คง HEX ทั้ง light/dark Demand Tier เป็น proxy; raw Demand ในภาพประเทศระบุค่าสูงสุดของ fine areas ไม่ใช่ยอดรวมอำเภอ Review intervals ใช้พื้นกลาง; missing/invalid ไม่เติมศูนย์ ไม่มี motif, logo frame, decorative bracket หรือ selected left rail สี

**Static preview:** CRUD รูป บทบาท feed และ notifications เป็น browser-local simulation ยังไม่มี shared backend, server RBAC หรือส่ง email/LINE จริง รูปห้ารูปเป็น mockup; satellite ปี 2021 ผลคัดใช้ศึกษาต่อ ไม่รับรองยอดขาย ผู้กู้ เขตกฎหมาย หรือความเหมาะสมรายแปลง

## สำหรับ dev

อ่าน [START_HERE](START_HERE.md), [HANDOFF](HANDOFF.md), [เกณฑ์](docs/CRITERIA_GUIDE.md), [Brand presets](docs/BRAND_PRESETS_v1.7.md), [DS integration](DS_ASSET_INTEGRATION.md) และ [Supply-relative](docs/SUPPLY_RELATIVE_PROPOSAL.md)

```sh
python3 -m http.server 8854 --bind 127.0.0.1
```

เปิด `/prototype/` ผ่าน HTTP ต้องรับ final QA ก่อนรัน `seal-pages-v1.7.2.py --after-final-qa` และ `verify-pages-v1.7.2.py` Product/map/brand authority ยังคง v1.7; criteria/industry/tasks v1.6 เป็น retained baseline และ map-analysis v1.7.2 เป็น extension Public artifact อยู่ `prototype/` พร้อม runtime contract copies ใต้ `/yolk/`

Public repo เก็บ compact adapters, approved assets/licences, contracts และ bounded receipts ไม่เก็บ raw acquisition, private workbook หรือข้อมูลลูกค้า Historical release manifests/receipts คงตามรุ่น Share image เป็น approved 1.7 family เดิม Source checks ไม่แทน native/browser/device review หรือ provider/live-byte verification

ผล browser รุ่นนี้: ไทย/dark และอังกฤษ/light ที่ 1,440×900 และ 390×844 พร้อม 10 ภาพใน [browser receipt](evidence/browser-v1.7.2/native-browser-review.json) ไม่อ้าง full language/theme matrix หรือการทดสอบเครื่องมือถือจริง
