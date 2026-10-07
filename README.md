# CityMETER: Yolk · 1.9.1 · LDS 0.9.7

**หาไข่แดง ขยายตลาด — Find the yolk. Grow your market.**

คัดพื้นที่ Demand เข้มข้น เทียบสาขาและการแข่งขัน แล้วเลือกวิธีขยายตลาดพร้อมแผนสำรวจ บนแผนที่เดียว รองรับ Fuel, Grocery และ Non-bank

[Web preview](https://montri-th.github.io/yolk/) · [Product + implementation ฉบับเต็มไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.1.md) · [เริ่มพัฒนา](START_HERE.md) · [Handoff](HANDOFF.md) · [Assets](ASSET_INDEX_v1.9.1.md)

## ทำงานอย่างไร

1. **หาไข่แดง:** เลือกธุรกิจ แบรนด์ และรูปแบบ ได้เกณฑ์ตั้งต้นจากข้อมูล CityMETER จริง ปรับได้ไม่เกิน 3 ปัจจัยร่วมกันในแต่ละจุด สีไข่แดงเข้ม/ไข่แดง/ไข่ขาวบอก Demand สูงมาก/สูง/ค่อนข้างสูง
2. **ดู Supply และการแข่งขัน:** เทียบโล่ของเราและดาบของคู่แข่งในตลาดที่เกี่ยวข้อง ดูจำนวนหรือสาขาเทียบฐานตลาด เปลี่ยนจาก choropleth เป็นจุดสาขาได้ทุกระดับ
3. **เลือก Strategy:** เลือก 1–3 วิธีขยายตลาด อ่าน “พบแล้ว / ยังไม่รู้ / งานแรก” แล้วเล็งทำเลพร้อมผู้รับผิดชอบและ snapshot ของเกณฑ์/ข้อมูลรุ่นที่ใช้

8 Strategy เป็นวิธีสร้างคิวสำรวจชุดใหม่ แยกจาก 8 รูปแบบ Demand/Competitor/Own เดิม P0 มีเบาะแสสำหรับวิธี 01/03/05/07 ส่วนวิธีอื่นระบุข้อมูลที่ต้องเพิ่ม การคัดผ่านยังไม่ใช่การอนุมัติเปิดสาขาหรือการรับประกันยอดขาย อ่าน [Strategy experience](docs/STRATEGY_EXPERIENCE_v1.9.0.md)

## ข้อมูลและ preset

ฐานทั่วประเทศมี **7,954 reporting UUIDs และ 25 metrics** กทม. ใช้แขวง ต่างจังหวัดใช้ อปท. การซูมหรือกรองจังหวัดไม่เปลี่ยน national benchmark โปรไฟล์ 37 แบรนด์/นิติบุคคลมีที่มาและข้อจำกัดใน [brand research](docs/BRAND_RESEARCH_v1.9.0.md) และ [runtime registry](prototype/data/brand-strategy-profiles.v1.9.0.json)

รุ่น 1.9.0 ปรับ initial Demand paths ให้จำกัดไม่เกิน 3 ปัจจัยและเหมาะกับแต่ละ profile รวมถึง Fuel ที่เปลี่ยนจาก activity vote เดิม ค่าใหม่เป็นสมมติฐานของ Yolk แสดง diff ก่อนใช้ และไม่เขียนทับเกณฑ์หรือแบบร่างที่เคยบันทึก Supply, weights และ Strategy เปลี่ยนลำดับหรือมุมมองได้ แต่ไม่เปลี่ยนชุดพื้นที่ผ่าน Demand ภายใต้เกณฑ์เดิม

ใช้ exact LDS 0.9.7 base + Location Intelligence Profile, official unframed Landometer logo, square brand graphics และ Material Symbols extension ไม่มี motif, selected left rail หรือกรอบตกแต่งโลโก้

## สถานะ preview และการตรวจรับ

Demo เป็น browser-local simulation ยังไม่มี shared backend/server RBAC/email/LINE/private production media ข้อมูลบริบทและบัญชีสาขาไม่ยืนยัน traffic, การเปิดจริง, capacity, market share หรือยอดขาย ส่วน brand positioning ที่อ้างจากผู้ประกอบการไม่ใช่ผลสำรวจการรับรู้ของลูกค้า

อ่านผลตรวจและสถานะเผยแพร่ปัจจุบันที่ [release contract 1.9.1](contracts/release.v1.9.1.json) แยก local QA, native browser, provider และ live-byte evidence การพัฒนาใน checkout ไม่ใช่หลักฐานว่าเว็บสาธารณะเปลี่ยนแล้ว และ hash checks ไม่แทนการตรวจ UI หรืออุปกรณ์จริง

ผลรุ่น 1.9.0 และเก่ากว่าเก็บเป็นประวัติใน contracts/evidence ของรุ่นนั้น ไม่ใช่ผลตรวจผ่านของ 1.9.1 เริ่มพัฒนาจากศูนย์ได้ที่ [เอกสารเต็ม](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.1.md) พร้อม [machine blueprint](contracts/full-product.v1.9.1.json)

รุ่น 1.9.1 ปรับ tooltip ให้มีเพียงอันเดียว ลดเส้นรบกวนเมื่อดูจุดสาขา และแสดงปลายทาง/จำนวนเมื่อเล็งทำเล อ่าน [ข้อตกลง interaction](docs/MAP_CLARITY_AND_ACTION_GUIDANCE_v1.9.1.md). สูตรและโปรไฟล์ยังใช้ 1.9.0 เดิม ผลตรวจรุ่นใหม่ต้องดู receipt 1.9.1 ไม่ยกผลเก่ามาใช้แทน

Current local QA: 28 suites / 497 checks และ bounded native review 22 ข้อ ภาพจริง 6 ภาพ ดู [QA 1.9.1](evidence/qa-v1.9.1.json). Package LDS ตรวจใหม่ผ่าน 9,768 ข้อ/65 warnings เป็น package-only ไม่รับรอง artifact/account/team ทั้งหมด Provider/live-byte evidence แยก และ physical device/screen reader/full matrix ยังไม่ตรวจ
