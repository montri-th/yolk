# โอกาสขยาย · Expansion opportunities · 1.9.3

เปิดแล้วเห็น **ทำเลชวนสำรวจของแบรนด์** ใช้ preset หรือเกณฑ์ที่บันทึกไว้ อ่านเหตุผลก่อนเล็งบนแผนที่เดียว

## ทางใช้งาน

1. เลือกธุรกิจ แบรนด์ และ format/scope ที่ข้อมูลรองรับ
2. หน้าโอกาสขยายแสดงคิวจาก Demand ที่ผ่านและเบาะแส Supply/Strategy ไม่ต้องกรอกข้อมูลเพิ่มเพื่อเริ่มต้น
3. เปิดภาพและตัวอย่างเพื่อเข้าใจ 8 วิธี ถ้าจะเปลี่ยนมุมมองค่อยเปิดตัวเลือกและเลือกไม่เกิน 3
4. เปิดการ์ดดูเหตุผลแรก รวมทั้ง พบแล้ว / ยังไม่รู้ / งานแรก แล้วเล็งพร้อมผู้รับผิดชอบและ snapshot
5. ใช้ Demand/Supply แยกเมื่ออยากตรวจสมมติฐาน แผนที่ กล้องและ draft เดิมยังอยู่

ตัวเลือก Strategy แบบย่ออยู่ใต้ 2 จำนวนและขอบเขต ก่อนผล **เริ่มดูทำเลเหล่านี้ / Start with these places** หน้าแรกแสดง 2 จำนวนหลัก: **Demand ที่ผ่าน** และ **ทำเลชวนสำรวจในขอบเขตนี้** จำนวน Shortlist อยู่ในเมนู ข้อมูลไม่ครบ/unsupported แยกไว้ในรายละเอียดหรือ empty state ไม่รวมเป็น “โอกาสขายดี” และไม่สร้าง score แทนหลักฐานที่ขาด

## เข้าใจ 8 วิธีจากภาพ

ไอคอนที่เห็นทุกวันเปิด guide ได้ ในแต่ละวิธีมีภาพอธิบายหนึ่งแนวคิด คำอธิบายสั้น วิธีใช้ 3 ขั้น ตัวอย่างสมมติ ข้อมูลที่มี/ยังขาด และข้อแลกเปลี่ยน ตัวอย่างอยู่ใน Fuel/Grocery/Non-bank ไม่ใช่ผลจริงของทำเลหรือแบรนด์

Guide อ่านจาก [bilingual registry](../prototype/data/strategy-guide.v1.9.3.json) เป็น read-only เปิดอ่านไม่เลือก Strategy แทนผู้ใช้ ไม่ปรับเกณฑ์ ไม่เลื่อนกล้องหรือสร้าง team event Dialog มีปุ่มปิด Escape และคืน focus ที่จุดเปิด

## แผนที่และ controls

Desktop เห็นแผนที่ใหญ่ข้างงาน Mobile มีขยาย/ย่อ ค่าเริ่มต้น mobile ใช้ `clamp(360px, 58svh, 560px)` ส่วน Supply ใช้ `clamp(480px, 74svh, 680px)` เพื่อเหลือ canvas ให้จุดสาขา ขนาด expanded ยังมีลำดับสูงกว่าและต้องวัด canvas จริง ไม่อนุมานจาก host Controls สำคัญอยู่ toolbar สั้น ตัวเลือกเพิ่มค่อยเปิด มีพื้นที่แตะอย่างน้อย 44 px ปุ่มขยาย/ย่อใช้ map เดิมและคงกล้องแม้ host เปลี่ยนความกว้าง ขณะขยายซ่อน bottom navigation ชั่วคราวไม่ให้ทับ attribution/legend ย่อแล้วคืนเมนู Escape ปิด options ก่อน แล้วค่อยย่อและคืน focus

Choropleth ใช้เส้นย่อยขาว 0.30 px ส่วน parent คง 1.2/1.05/1.1 px และ selected fine 0.8 px เฉพาะ parent ที่ไม่ fill มี halo กลาง 0.65 px จาก `--ldm-foundation-surface-canvas-dark #11191D` ไม่ filter สีข้อมูล POI หรือ selected fine จุดสาขาคง quiet hierarchy และ hover เหลือง Yolk พร้อม tooltip เจ้าของเดียว

Light canvas ใช้ `surface.soft.light #E5E9E6`, panel ใช้ `surface.alt.light #EEF1EE` ตาม LDS Supply โดยรวมใช้ไอคอนร้านค้า เราใช้โล่ คู่แข่งใช้ดาบ Brand PNG, fonts, LUT และ tier colors คงเดิม Link ใช้ accent/focus ชัดและขีดเส้นใต้เฉพาะข้อความ

## Compatibility และพื้นหลังแผนที่

Canonical route คือ #market ส่วน #strategy เดิมเป็น alias ของหน้าเดียว ไม่บังคับเขียน hash ใหม่ รักษา context, camera, Strategy ที่เลือกและ criteria/drafts ไม่มี implicit Apply หรือ team event

Basemap มีสถานะโหลด / โหลดได้บางส่วน / ผิดพลาดแยกจาก source/calculation error ปุ่ม **โหลดพื้นหลังใหม่ / Reload background** สร้าง tile layer สไตล์เดิมใหม่ผ่าน `setBasemap(S.basemap)` บน map เดิม คงผลวิเคราะห์และกล้อง ไม่มี auto-retry จำนวน tiles ค้างช่วยวินิจฉัยเท่านั้น ไม่ยืนยันสาเหตุ provider หรือ availability ทั้งโลก ผล native retry ผ่านในลำดับที่บันทึกไว้ ไม่รับรอง provider availability ทุกเวลา

[Machine extension](../contracts/expansion-experience.v1.9.3.json) · [Full plan](../CityMETER_Yolk_Full_Product_and_Implementation_v1.9.3.md) · [Release state](../contracts/release.v1.9.3.json)

Current QA, อุปกรณ์จริง full language/theme matrix, backend, provider และ live bytes เป็นหลักฐานคนละส่วน Current local pass ดู [integrated QA](../evidence/qa-v1.9.3.json) และ [native receipt](../evidence/browser-v1.9.3/native-browser-review.json): 32 suites / 537 reported cases, 22 bounded native checks และภาพจริง 17 ภาพ ผล 1.9.2 เป็นประวัติ Publication/live bytes ยังรอหลักฐานแยก

Native review พบ retry เดิมที่ fractional zoom 10.25 ส่ง tile URL ไม่ถูกต้อง จึงแก้ที่เส้นทาง retry ของ app ไม่ใช้กล่าวโทษ provider วิธีใหม่สร้าง tile layer สไตล์เดิม ลำดับ fresh native สุดท้ายผ่าน 2 retries, resize/zoom และ console errors 0 รายการ ดู receipt ปัจจุบัน
