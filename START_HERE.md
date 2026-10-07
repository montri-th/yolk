# Start here · Yolk 1.9.0

**หาไข่แดง → ดู Supply และการแข่งขัน → เลือก Strategy → เล็งพร้อมแผนสำรวจ**

1. อ่าน [Product statement + implementation ฉบับเต็มไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.0.md) เพื่อเข้าใจ product, data, UX และงาน T00–T24 พร้อม machine blueprint ท้ายไฟล์
2. อ่าน [AGENTS.md](AGENTS.md), [full product contract](contracts/full-product.v1.9.0.json), [8 Strategy](contracts/opportunity-strategies.v1.9.0.json) และ [Strategy experience](docs/STRATEGY_EXPERIENCE_v1.9.0.md) ก่อนเปลี่ยน behavior
3. ตรวจ stack จริงของ CityMETER ก่อนเลือก framework/datastore แล้วทำทีละงานตาม dependencies ใน [แผนพัฒนา](IMPLEMENTATION_PLAN_v1.9.0.md) แต่ละงานมี inputs, outputs, acceptance และ tests
4. ใช้ [brand research](docs/BRAND_RESEARCH_v1.9.0.md) และ [runtime registry](prototype/data/brand-strategy-profiles.v1.9.0.json) เป็นแหล่ง preset เดียวกัน รองรับ Fuel, Grocery และ Non-bank รวม 37 โปรไฟล์ ไม่คัดลอกค่าตั้งต้นลง component อีกชุด
5. ใช้ [DS integration](DS_ASSET_INTEGRATION.md) + [Asset index](ASSET_INDEX_v1.9.0.md) จาก LDS 0.9.7 และ icon extension ที่ตรวจไฟล์จริง ไม่สร้าง logo/font/color แทน
6. Demand เป็นผู้คัดไข่แดง; Supply, weights และ Strategy ไม่เปลี่ยน Demand/Tier/eligible IDs จำกัดปัจจัยร่วมกันไม่เกิน 3 ในแต่ละจุด ดู [factor/strategy rules](contracts/full-product.v1.9.0.json)
7. ใช้แผนที่เดียวทุกเมนู และอ่าน [Supply POI modes](docs/SUPPLY_POI_MODES_v1.9.0.md): choropleth เป็นค่าเริ่มต้น เลือกจุดสาขาได้ทุกระดับ กลุ่มจุดบนหน้าจอไม่ใช่หลักฐาน physical cluster
8. Branch CRUD ใช้ [source-first context](contracts/branch-context.v1.7.5.json) ที่ยังคงไว้: manual/saved assignment มาก่อน hint และ inference ไม่เปลี่ยนยอด Supply ต้นทาง
9. เปิด `prototype/` ผ่าน HTTP ตรวจข้อความจริง TH/EN, mobile/desktop และ light/dark แล้วรัน current suites ตาม release contract ผล VM/hash ไม่แทนการตรวจ browser
10. อ่าน [Handoff](HANDOFF.md), [handoff contract](contracts/handoff.v1.9.0.json) และ [release state](contracts/release.v1.9.0.json) ก่อน seal/publish ให้แยก local QA, native browser, provider และ live bytes ผลรุ่นก่อนเป็นประวัติ

P0 ใช้ข้อมูล CityMETER ที่เชื่อมแล้วเพื่อคัด Demand และสร้างคิวสำรวจ Strategy 01/03/05/07 ส่วน offering รายสาขา โรงพยาบาล/โรงเรียน คลัสเตอร์จริง เส้นทาง และผลธุรกิจอยู่ในเฟสเพิ่มหลักฐาน ไม่สร้างผลเทียมแทนข้อมูลที่ขาด

Static preview เก็บงานใน browser นี้ ยังไม่มี shared backend, server RBAC, email/LINE delivery หรือ private production media งานเหล่านั้นอยู่ใน production plan สถานะตรวจรับและเผยแพร่ปัจจุบันให้ดู receipt รุ่น 1.9.0 เท่านั้น
