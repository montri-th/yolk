# CityMETER: Yolk 1.9.11 — เริ่มที่นี่


**ผลตรวจปัจจุบันก่อนเผยแพร่:** 44 suites / 747 reported cases ผ่าน; 10 bounded native observations พร้อมภาพจริง20ภาพ รวม fixtureกิจกรรมที่ระบุเป็นข้อมูลสมมติ ตรวจ Thai/Englishและบางสถานะlight/darkในChromeที่320/390/1440px ยังไม่ใช่การรับรองทุกแบรนด์/อุปกรณ์/backend ดู [QA](evidence/qa-v1.9.11.json) การเผยแพร่และ ZIP ยืนยันแยกใน GitHub Release attestation หลัง provider/live ผ่าน

**เลือกแบรนด์ → โอกาสขยาย → ดูเหตุผล → เล็งทำเลพร้อมแผนสำรวจ**

รุ่นนี้เพิ่มโลโก้ตามจำนวนพิกัดที่มองเห็นเป็น **500 จุดเมื่อแผนที่กว้างอย่างน้อย 600 CSS px / 250 จุดเมื่อแคบกว่า** เพิ่ม permalink เฉพาะแบรนด์ 37 ราย ปรับข้อความยาวใน Activity และแยกคำอธิบาย “Demand คัดพื้นที่” ออกจาก “กิจกรรมเสริมเลือกสิ่งที่ควรสำรวจ” โดยคงข้อมูล CityMETER, numeric presets, Demand/Tier และงานที่เคยบันทึก

**สถานะ ณ รอบ implementation:** current integrated QA, native acceptance, ZIP closure และ publication ยังต้องอ่านและยืนยันจาก receipts 1.9.11 แยกกัน หลักฐาน 1.9.10/ก่อนหน้าเป็นประวัติ ไม่ใช่การผ่านของรุ่นนี้

1. [Product statement + implementation จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.11.md) — human narrative และ JSON ตรงกับ machine blueprint
2. [Machine blueprint](contracts/full-product.v1.9.11.json) — T00–T24, schema, API, acceptance และ coding prompts
3. [สี่จุดที่เพิ่มใน 1.9.11](docs/MAP_EXPLORATION_v1.9.11.md) · [การแก้เดิมจาก Red team และการตรวจรอบใหม่](docs/RED_TEAM_RESOLUTION_v1.9.11.md)
4. [Permalink ครบ 37 แบรนด์](docs/BRAND_DEMO_LINKS.md) · [รายงาน implementation + native review ที่ต้องทำ](docs/BRAND_DEMO_PERMALINK_IMPLEMENTATION.md) · [Catalog ทดลองและคัดลอกลิงก์](prototype/brands.html) · [Machine catalog](prototype/data/brand-demo-links.json)
5. [Demand กับกิจกรรมเสริมใช้ข้อมูลเดียวกันคนละบทบาท](docs/COMPLEMENTARY_DEMAND_CLARITY_v1.9.11.md) · [Implementation plan](IMPLEMENTATION_PLAN_v1.9.11.md)
6. [DS และ assets](DS_ASSET_INTEGRATION.md) · [brand research](docs/BRAND_RESEARCH_v1.9.0.md) · [Release seal](contracts/release.v1.9.11.json) · [QA receipt ที่ต้องตรวจ status จริง](evidence/qa-v1.9.11.json) · [Handoff](HANDOFF_v1.9.11.md)
7. [Release + provider/live attestation และ ZIP หลังเผยแพร่](https://github.com/montri-th/yolk/releases/tag/v1.9.11) — publication state ต้องมาจากหลักฐานนี้ ไม่ใช้ local implementation แทน

## ส่ง Demo ให้ prospect

ใช้ [หน้า catalog](https://montri-th.github.io/yolk/brands.html) หรือปุ่ม **คัดลอก Demo แบรนด์นี้** ในตัวเลือกแบรนด์ ตัวอย่าง Tops: `https://montri-th.github.io/yolk/?brand=tops#market` ไม่ต้องมีเลขรุ่น

ผู้รับใหม่เริ่มด้วย industry/format สำคัญและ preset เดิมของแบรนด์ หากเบราว์เซอร์นั้นมีเกณฑ์หรือร่างของแบรนด์/format นี้อยู่แล้ว คงงานนั้นพร้อมคำแจ้งและปุ่มลอง preset เป็นร่าง ไม่เขียนทับเงียบ ๆ การเปิดลิงก์ไม่สร้าง team event ไม่ลบ shortlist/สาขา และไม่ส่งข้อมูลส่วนตัวใน URL

## ขอบเขตที่ต้องรักษา

- 3 industries / 37 selectable brands; Non-bank ให้เลือก 10 รายแรกตาม source พร้อม peer inventory ที่เกี่ยวข้อง ไม่อ้างว่า legal-company name เป็น trade brand ทุกกรณี
- Demand คัด eligibility; Supply และ Strategy ช่วยตรวจการแข่งขัน/จัดคิวสำรวจ ไม่ยืนยันยอดขาย ลูกค้าจริง หรือผลธุรกิจ
- Strategy 05 ใช้โรงงาน/คนงาน/ห้องพักตาม profile ที่มีข้อมูล; โรงพยาบาล/โรงเรียนและ proximity จริงเป็น P1 หากใช้ dataset เดียวกับ Demand ต้องเปิดเผยว่าเป็นหลักฐานชุดเดิม ไม่ใช่สองหลักฐานอิสระ
- Preview บันทึกใน browser; production shared backend/auth/RBAC/outbox/private media ยังต้องพัฒนา
- Threshold โลโก้เป็นวิธีวาด ไม่ใช่จำนวน POI สูงสุด; จุดหนาแน่นยังแสดงทุก valid coordinate ผ่าน Canvas และเลือกจุดซ้อนได้
- Mobile viewport บน desktop ไม่เท่ากับการตรวจ iPhone/Android หรือ screen reader จริง

## ประวัติและ behavior ที่ยังคงอยู่

[รายงาน 1.9.10](docs/MAP_EXPLORATION_v1.9.10.md) เก็บ hover นอก canvas, Satellite ESA ปี 2021 และการแยก zero/null พร้อมผลตรวจรุ่นนั้นไว้เป็นประวัติ behavior เหล่านี้ยังคงอยู่ แต่ current release ต้องมี regression/receipt ใหม่ [Full brief 1.9.10](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.10.md) และรุ่นก่อนเป็น trace เท่านั้น
