# Start here · Yolk 1.9.3 · local review complete

**เลือกแบรนด์ → โอกาสขยาย → เหตุผล → เล็งพร้อมแผนสำรวจ**

1. อ่าน [Product statement + implementation จากศูนย์](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.3.md) และ [full machine blueprint](contracts/full-product.v1.9.3.json)
2. ทำ T00 เพื่อสำรวจ stack จริงก่อนเลือก framework/datastore แล้วทำ T00–T24 ทีละงานตาม dependencies, inputs, outputs, acceptance และ codingPrompt
3. อ่าน [AGENTS](AGENTS.md), [expansion experience](contracts/expansion-experience.v1.9.3.json) และ [คู่มือ](docs/EXPANSION_OPPORTUNITIES_v1.9.3.md) สำหรับหน้าแรก alias, map และ layout
4. ใช้ [brand research](docs/BRAND_RESEARCH_v1.9.0.md) และ [runtime profiles](prototype/data/brand-strategy-profiles.v1.9.0.json) เป็น authority ของ preset เกณฑ์/draft ที่บันทึกไว้มาก่อน starter preset
5. อ่าน [8 Strategy rules](contracts/opportunity-strategies.v1.9.0.json) และ [bilingual guide](prototype/data/strategy-guide.v1.9.3.json) จำกัดเลือก 3 ใช้ engine เดิมแยก candidate/incomplete/unsupported เปิด guide ไม่เปลี่ยนเกณฑ์
6. ใช้ [DS integration](DS_ASSET_INTEGRATION.md) และ [asset index](ASSET_INDEX_v1.9.3.md) ใช้ LDS 0.9.7, fonts, graphics, icons และ LUT ต้นฉบับ ไม่มี motif กรอบโลโก้หรือ selected left rail
7. ทำ persistent map: Demand/Supply แยก จุดสาขาเลือกได้ทุก drilldown ขยาย/ย่อคงกล้อง เส้น parent/child ไม่เปลี่ยนสีข้อมูล
8. CRUD, source-first hints, snapshots, feed และ notifications ใช้ invariants เดิม แยก browser-local preview จาก production backend
9. ตรวจข้อความไทย/อังกฤษจริงทั้งจอแคบและ desktop ใน light/dark รวมคิวทำเล guide, alias, controls, expanded map, hover, tiles และ save failure ก่อน seal ใช้ receipt รุ่นนี้เท่านั้น
10. ดู [handoff](HANDOFF_v1.9.3.md) และ [release state](contracts/release.v1.9.3.json) Current local QA ผ่านแบบจำกัด ดู receipt ปัจจุบัน Provider/live/ZIP ยัง pending อุปกรณ์จริง full matrix และ backend ไม่ถูกยืนยันจาก hash หรือ VM tests

P0 ใช้ CityMETER ที่เชื่อมแล้วสำหรับ Demand/Supply และเบาะแส Strategy 01/03/05/07 ส่วน anchors, offerings, physical clusters, route capture, future milestones และ performance อยู่เฟสเพิ่มหลักฐาน ไม่สร้างค่าแทนข้อมูลที่ขาด
