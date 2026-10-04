# CityMETER: Yolk · v1.6.1 · LDS 0.9.7

**Find the yolk. Grow your market. / หาไข่แดงให้เจอ ขยายตลาดให้ตรงจุด**

[เปิดเว็บ](https://montri-th.github.io/yolk/) · [เริ่มอ่านที่นี่](START_HERE.md) · [Product statement](CityMETER_Yolk_Product_Statement_v1.6.md) · [Implementation plan](IMPLEMENTATION_PLAN_v1.6.md)

รุ่น1.6.1 เพิ่มแผนที่ควบคู่เกณฑ์ตลอดการปรับค่า พร้อมแถบเลื่อน ช่องกรอกละเอียด และโหมดขยายพื้นที่ทำงาน ดู [UX contract](docs/CRITERIA_WORKSPACE_v1.6.1.md)

คง UI โลโก้ และ icons เดิมของ Yolk ปรับเป็น LDS 0.9.7 เลือกได้ 3 ธุรกิจ: Fuel, Grocery และ Non-bank ใช้ CityMETER snapshot จริง 7,954 reporting UUIDs และ 25 metric พร้อมสูตร หน่วย field ต้นทาง รอบข้อมูลและ coverage แต่ละแบรนด์มี preset เริ่มต้นและปรับเกณฑ์แยกกัน

Demand ใช้ percentile ฐานประเทศเดียวกัน ไม่เปลี่ยนฐานเมื่อเลือกจังหวัด/แบรนด์ แยกไข่แดงจาก Demand ออกจากทำเลที่ตรงเกณฑ์ทีม และเก็บข้อมูลที่ยังยืนยันไม่ได้ไว้รอตรวจ ผลเป็นสมมติฐานสำหรับศึกษาต่อ ไม่ใช่ยอดลูกค้า ยอดขาย ผู้กู้ หรือคำแนะนำอนุมัติเปิดสาขา

**Static public preview:** CRUD, photos, roles, feed และ notifications เป็น browser-local simulation ไม่มี shared production backend, auth/RBAC ฝั่ง server หรือส่ง email/LINE จริง Source aggregates แยกจาก POI overlays; รูปตัวอย่าง 5 รูปเป็น mockup แผนที่ satellite เป็นปี 2021

## สำหรับ dev

[เกณฑ์และสูตร](docs/CRITERIA_GUIDE.md) · [Experience +ภาพ](docs/EXPERIENCE_v1.6.md) · [Asset integration](DS_ASSET_INTEGRATION.md) · [Handoff](HANDOFF.md) · [ผลตรวจ](evidence/QA.md)

```sh
python3 scripts/verify-pages-v1.6.py
node scripts/check-three-industry.cjs
node scripts/check-photo-runtime.cjs
node scripts/check-criteria-map.cjs
node scripts/check-criteria-controls.cjs
python3 -m http.server 8854 --bind 127.0.0.1
```

เปิด http://127.0.0.1:8854/prototype/ เมื่อทดสอบในเครื่อง Pages ใช้ prototype/ เป็น artifact และมีสำเนา runtime contracts ภายใน ใช้เอกสาร/contract v1.6 และ LDS 0.9.7 เป็น authority; เอกสารและ tests v1.2–v1.5 คงไว้เป็นประวัติ สูตร Fuel ที่ตกลงไว้เดิมยังคงเดิม

Public repo มี runtime projections, assets/licences, product/implementation contracts และหลักฐานสรุป ไม่บรรจุ raw HTTP snapshots, full normalized acquisition archive, private workbook links หรือ private customer records การเผยแพร่สำเร็จต้องมี Pages provider result และ live-byte checks เพิ่มจาก source checks
