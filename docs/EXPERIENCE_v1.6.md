---
document_id: yolk.experience.three_industries
version: 1.6.1
date: 2026-10-04
criteria_workspace: CRITERIA_WORKSPACE_v1.6.1.md
---

# UI เดิมของ Yolk · ข้อมูลจริง 3 ธุรกิจ

ภาพด้านล่างเป็นหลักฐานของ preview ฐาน v1.6 ก่อนปรับหน้าเกณฑ์ใน v1.6.1 ดูภาษา/ธีม/viewport และขอบเขตตรวจเดิมใน [QA receipt](../evidence/QA.md) ใช้ [เกณฑ์และสูตร](CRITERIA_GUIDE.md) ควบคู่กับภาพ; สีหรือชื่อ pattern ไม่ใช่ผลสอบเทียบธุรกิจ เอกสารนี้ไม่ใช้ภาพเก่ารับรองการตรวจ layout ใหม่

## ภาพรวมประเทศ: หาไข่แดงก่อน แล้วเลือกกลยุทธ์

บริบทด้านบนเลือกธุรกิจ แบรนด์ และ Supply scope หน้าหลักแยกจำนวนไข่แดงจาก Demand, พื้นที่ที่ตรงเกณฑ์ทีม และรายการรอตรวจ พื้นที่ทุกจังหวัดมองเห็นได้ในทั้งสองธีม ไม่ใช้พื้นขาวจั๊วะหรือสีจังหวัดกลืนกับพื้นหลัง

![Grocery · 7-Eleven · แผนที่และพื้นที่ที่คัดผ่าน](../evidence/browser-three-industry/desktop-th-light-market.png)

แผนที่ใช้ national signal percentile จากพื้นที่ที่เกี่ยวข้องในมุมมองนี้ ส่วนรายชื่อใช้สูตร ranking ที่ทีมเลือก ค่าเหล่านี้ต่างกันและมี label บอก การเลือกจังหวัดไม่เปลี่ยน percentile ฐานประเทศ

## มือถือ: ย่อส่วนเลือกบริบท เก็บพื้นที่ให้เนื้อหา

Navbar เดิมอยู่ครบ ส่วนภาษา ธีม และบทบาททีมอยู่ในเมนู ส่วนธุรกิจ/แบรนด์อยู่ใน disclosure ที่เปิดเมื่อต้องเปลี่ยน โลโก้วางตรงบนเมนู ไม่มีกรอบ; ธีมมืดใช้ wordmark สี foundation text-primary ตาม DS

![Mobile · ภาษาไทย · ธีมมืด](../evidence/browser-three-industry/mobile-th-dark-market-viewport-final.png)

## เกณฑ์ v1.6.1: ลากค่าแล้วดูแผนที่ควบคู่กัน

บน desktop แผนที่ใหญ่และตัวปรับค่าอยู่ในพื้นที่ทำงานเดียวกัน ตัวปรับค่าเลื่อนอ่านแยกจากแผนที่ ใช้แท็บ Demand / Supply / รูปแบบ / น้ำหนัก จึงทดลองเกณฑ์ได้โดยยังเห็นผลบนพื้นที่ บนมือถือคงแผนที่ย่อขณะเลื่อนปรับค่า และเปิดรายชื่อทำเลได้

ค่าตัวเลขมีแถบเลื่อนคู่ช่องกรอก ช่วยลองหลายค่าได้เร็วและกรอกค่าที่แน่นอนได้ ผลเทียบ draft กับเกณฑ์ทีมแบ่งเป็น **ผ่านเกณฑ์ / เข้าใหม่ / หลุดเกณฑ์ / รอตรวจ / อันดับ** กดจังหวัดเพื่อดูรายชื่อทำเลที่เปลี่ยน กดรายชื่อเพื่ออ่านผล draft; ปุ่มเปิด detail ระบุชัดว่า detail ใช้เกณฑ์ทีมที่บันทึกแล้ว

สีจังหวัดสรุป Demand signal เด่นสุดในกลุ่มที่แสดง ส่วน badge สรุปจำนวนทำเล การเปลี่ยนน้ำหนักจึงใช้ ↕ และอันดับก่อน → หลังเป็นหลัก สีเดิมอาจไม่เปลี่ยนเมื่อจำนวนหรืออันดับเปลี่ยน ไม่มีการวาด polygon แขวง/อปท. แทนข้อมูลที่ขาด

การลากปรับเป็น private draft ระบบรวมงานแสดงผลช่วงสั้น ๆ และ flush เมื่อปล่อยหรือยืนยันค่า ก่อน Apply ไม่สร้างข้อความใน feed ข้อกำหนดรับงานและ production scaling อยู่ใน [Criteria workspace](CRITERIA_WORKSPACE_v1.6.1.md)

## ภาพอ้างอิงหน้าเกณฑ์ฐาน v1.6

แยก Demand, Supply, รูปแบบทำเลที่สนใจ และน้ำหนัก สูตร หน่วย field ต้นทาง รอบข้อมูล และ coverage เปิดดูได้ในแต่ละตัววัด ก่อน Apply เห็นจำนวนพื้นที่เพิ่ม/หายและอันดับเปลี่ยน การสลับแบรนด์เก็บค่าที่เลือกแยกกัน

![เลือก dataset/metric และดูสูตรก่อนปรับเกณฑ์](../evidence/browser-three-industry/criteria-dataset-metric-viewport.png)

[ดูหน้าเกณฑ์เต็ม · EN/dark](../evidence/browser-three-industry/desktop-en-dark-criteria.png)

[ดูรายละเอียดสูตรและ coverage ของสำนักงาน](../evidence/browser-three-industry/desktop-th-office-formula.png)

ภาพสำนักงานเป็นตัวอย่างการเปิดดู coverage ของ metric ที่มีข้อมูลน้อย ไม่ได้เปิดใช้สำนักงานใน preset ทั่วประเทศ การเปลี่ยนค่าบนหน้าจอไม่ยืนยันว่ากลุ่มข้อมูลนั้นเหมาะกับทุกธุรกิจ

## Supply: ยอดรวมกับ POI เป็นคนละชั้นหลักฐาน

รายการแสดงภายใน format/license scope ที่เลือก และแบ่งเครือข่ายเรา ผู้ให้บริการอื่น และรอตรวจ ชื่อ/พิกัดมาจากต้นทางเมื่อมีจริง ทีมแก้ไขผ่าน overlay; การเพิ่ม POI ไม่ทำให้ source aggregate เปลี่ยนทันที

![Supply editor เดิม · ข้อมูล Grocery](../evidence/browser-three-industry/desktop-th-light-supply.png)

5 รูปที่ใช้ทดลอง editor เป็น mockup จากสถานีสมมติ แยกจากรูปสาขาที่ตรวจจริงและจากข้อมูล Grocery/Non-bank

## Non-bank: ระบุขอบเขตข้อมูลก่อนสรุปตลาด

ทำเลใช้บริบทประชากรอายุ 20–64 และความหนาแน่น Supply แสดงยอดที่ต้นทางผูกพื้นที่ได้ และจำนวนที่ยังต้องตรวจแยกกัน แผนที่เลือกผู้ให้บริการใน license scope เดียวกับเกณฑ์; ใบอนุญาตบริษัทไม่ได้ยืนยันบริการของทุกจุด

![Non-bank · ขอบเขตทำเลจริงและจุดใน scope ที่เลือก](../evidence/browser-three-industry/nonbank-detail-map-viewport.png)

ขอบเขตในภาพนี้เป็นหนึ่งใน direct source polygons ที่มีจริง พื้นที่อื่นที่มีเพียง extent จะบอกว่าไม่มี polygon ข้อมูลเขตที่เห็นไม่ได้เป็นการรับรอง statutory boundary หรือจำนวนผู้กู้

## ทำงานร่วมกัน

เล็งทำเล เก็บหลักฐาน มอบหมายงาน และติดตาม feed/leaderboard ตาม action ที่บันทึกสำเร็จ ใน preview จำลองผ่าน browser storage; การเชื่อมสมาชิกพร้อมกันและการส่ง notification จริงอยู่ใน [implementation plan](../IMPLEMENTATION_PLAN_v1.6.md)

![Activity และ leaderboard](../evidence/browser-three-industry/desktop-en-dark-feed.png)

ภาพ snapshot เป็นส่วนหนึ่งของหลักฐานการตรวจ ไม่มีการแก้ภาพเพื่อซ่อนข้อจำกัด รายละเอียด viewport/font/overflow อยู่ใน render matrix; ไม่เท่ากับทดสอบบนเครื่องมือถือทุกชนิด

## ภาพหน้าจอ criteria workspace1.6.1 ที่ตรวจจริง

![Desktop: ลาก Supply แล้วเห็นทำเลเข้าใหม่บนแผนที่](../evidence/criteria-workspace-v1.6.1/desktop-th-dark-added.jpg)

![Desktop: น้ำหนักเปลี่ยนอันดับ โดยไม่เปลี่ยนชุดทำเล](../evidence/criteria-workspace-v1.6.1/desktop-en-dark-ranking.jpg)

![มือถือ: แผนที่อยู่ต่อขณะปรับ Supply](../evidence/criteria-workspace-v1.6.1/mobile-th-dark-supply.jpg)

ผลและข้อจำกัดของการตรวจอยู่ใน [browser receipt](../evidence/criteria-workspace-v1.6.1/browser-qa.json) ภาพนี้เป็น Chrome viewport ไม่ใช่การรับรองอุปกรณ์จริง
