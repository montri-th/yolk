# Start here · Yolk 1.8.0

1. อ่าน [Product statement + implementation ฉบับเต็มไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.8.0.md) ทั้ง prose และ JSON
2. อ่าน [AGENTS.md](AGENTS.md) และ [เกณฑ์/สัญลักษณ์ที่ใช้จริง](contracts/criteria-experience.v1.8.0.json): หาไข่แดง → ดูช่องว่าง → เล็งทำเล ไม่มี active 8-pattern filter
3. ตรวจ stack จริงของ CityMETER ก่อนเลือก framework/datastore แล้วทำ T00–T19 ทีละงานตาม dependencies ใน [แผนพัฒนา](IMPLEMENTATION_PLAN_v1.8.0.md)
4. ใช้ [DS integration](DS_ASSET_INTEGRATION.md) + [Asset index](ASSET_INDEX_v1.8.0.md) จาก LDS 0.9.7 และ icon extension ที่ตรวจไฟล์จริง ไม่สร้าง logo/font/color แทน
5. รักษา retained analytical/map/source contracts ที่เอกสารเต็มระบุ สูตรและ cohort ไม่เปลี่ยน แต่ active eligibility ใช้ Demand/Tier เท่านั้น Supply และ weights จัดอันดับ
6. Branch CRUD ยังใช้ [source-first context](contracts/branch-context.v1.7.5.json): manual/saved assignment มาก่อน hint และ inference ไม่เปลี่ยน aggregate Supply
7. เปิด `prototype/` ผ่าน HTTP ตรวจ actual TH/EN, mobile/desktop, light/dark แล้วรัน model/workflow/release checks รุ่นปัจจุบัน
8. อ่าน [Handoff](HANDOFF.md) และ [release state](contracts/release.v1.8.0.json) ก่อน seal/publish ผลรุ่นก่อนเป็นประวัติ ไม่ใช่ current QA

Static preview เก็บการทำงานในเบราว์เซอร์นี้ ยังไม่มี shared backend, server RBAC, email/LINE delivery หรือ private production media งานเหล่านั้นอยู่ใน production plan
