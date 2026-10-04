---
version: 1.7.3
date: 2026-10-04
status: local_bounded_QA_pass_release_pending
design_system: LDS 0.9.7
feature_extension: contracts/location-review.v1.7.3.json
---

# ทำเลรอตรวจ — เห็นเหตุผล แล้วตรวจให้ตรงจุด

“รอตรวจ” บนการ์ดทั้งแปดรูปแบบ หมายถึง **ข้อมูลยังจัดรูปแบบทำเลได้ไม่แน่ชัด** ไม่มีปุ่มอนุมัติที่ทำให้ข้อมูลจริงขึ้น ต้องเติมหลักฐานในจุดที่ทำให้ช่วงผลคร่อมเกณฑ์

## ตรวจให้แล้วอะไรบ้าง

ตรวจจาก snapshot รุ่น 1.7.2 source SHA 86c60238480fb4044d72f1f6e82baec7279db497 วันที่ 2026-10-04 ครบ 7,954 reporting UUIDs ต่ออุตสาหกรรม ทำซ้ำ Demand, Supply ต่อฐานตลาด และ possible patterns ภายใต้ preset เริ่มต้นปัจจุบัน ไม่ได้แก้ต้นทางหรือยืนยันการเปิดบริการจริง

| Preset ที่ตรวจ | Demand สูง | รูปแบบเดียว | หลายรูปแบบ | เข้า strategy ที่เลือก | รอตรวจ strategy | Demand ยังไม่ครบ |
|---|---:|---:|---:|---:|---:|---:|
| บางจาก · GFA | 1,067 | 925 | 142 | 987 | 64 | 2,308 |
| 7-Eleven · ประชากร | 2,859 | 2,808 | 51 | 1,779 | 30 | 1,930 |
| MTC · ประชากร | 2,298 | 657 | 1,641 | 28 | 1,194 | 124 |

จำนวนในตารางเป็นคนละมุม ห้ามนำทุกคอลัมน์มาบวกกัน “เข้า strategy” รวมกรณีที่ยังมีหลายรูปแบบ แต่ทุกแบบอยู่ในชุดที่ทีมเลือก “รอตรวจ strategy” คือบางรูปแบบอยู่ในชุดที่เลือกและบางรูปแบบอยู่นอกชุด ส่วนจำนวนรอตรวจบนการ์ดแต่ละรูปแบบอาจซ้อนกัน

ค่าจะเปลี่ยนเมื่อแบรนด์ format ตัวหาร หรือเกณฑ์เปลี่ยน ตารางนี้เป็นผล audit ของสาม preset ที่ระบุ ไม่ใช่ผลตรวจทุกแบรนด์หรือข้อมูล live ดู [public audit receipt](../evidence/location-review-v1.7.3.json)

## เหตุที่รูปแบบยังไม่ชัด

| ปัญหา | พบใน preset audit | ต้องเติมอะไร |
|---|---:|---|
| ต้นทางยังไม่ระบุแบรนด์ | บางจาก 139 ทำเล | แบรนด์และตำแหน่งของรายการ UNKNOWN แล้วกระทบยอดเข้าพื้นที่ที่ถูกต้อง |
| ตัวหาร GFA ขาด | บางจาก 7 ทำเล | GFA ตาม UUID และช่วงเวลาที่ตรงกัน ห้ามใส่ศูนย์แทนข้อมูลขาด |
| หมวดร้านกับยอดรวมยังไม่ตรง | Grocery 36 ทำเล | รายการและหมวดที่ต้นทางยืนยัน แก้เฉพาะ UUID ที่เกิดส่วนต่าง |
| ประชากรที่ใช้เป็นตัวหารขาด | Grocery 17 ทำเล | ประชากรตาม reporting boundary และช่วงเวลาเดียวกัน |
| สำนักงานยังไม่ผูกเข้าทำเล | MTC 1,641 ทำเล | พิกัด/ขอบเขตที่ตรวจแล้วและการกระทบยอดระดับทำเลกับจังหวัด |
| ขอบเขตใบอนุญาตยังไม่ชัด | MTC 8 ทำเล | นิติบุคคลและสถานะใบอนุญาตจากแหล่งทางการพร้อมวันที่อ้างอิง |

เหตุอาจซ้อนกัน: บางจาก 4 ทำเลมีทั้งแบรนด์ไม่ทราบและ GFA ขาด; Grocery 2 ทำเลมีทั้งปัญหาหมวดและประชากร; MTC 8 ทำเลเรื่องใบอนุญาตซ้อนกับการผูกสำนักงาน ไม่บวกจำนวนเหตุเป็นจำนวนทำเลทั้งหมด

ข้อมูลอำเภอโดยตรงช่วยตรวจภาพรวมได้: Supply O+C ต่อฐานตลาดทราบแน่ 928 อำเภอใน Fuel/Grocery; Non-bank 903 อำเภอทราบแน่ และ 25 อำเภอมีช่วงจากขอบเขตใบอนุญาต แต่ยอดอำเภอไม่ระบุว่ารายการที่เหลืออยู่ใน อปท. ใด จึงไม่ใช้ยืนยันทำเลละเอียดแทนกัน

## วิธีตรวจทีละทำเล

1. **ระบุบริบท:** UUID, แขวง/อปท., แบรนด์, format, เกณฑ์ revision และช่วงข้อมูล
2. **เปิดเหตุ:** กดจำนวนรอตรวจบนการ์ด หรือเปิดรายละเอียดทำเล → ดูหลักฐานและสิ่งที่ต้องตรวจ
3. **ดูช่วงกับเกณฑ์:** ตัวอย่าง Supply เรา 0–2 สาขา เกณฑ์เริ่มมากที่ 1 สาขา ยังเป็นได้ทั้งน้อยและมาก ต้องตรวจรายการที่ทำให้ช่วงนี้คร่อมเกณฑ์
4. **เติมหลักฐานเฉพาะเหตุ:** แบรนด์ พิกัด boundary/crosswalk ตัวหาร หมวดร้าน หรือขอบเขตใบอนุญาต พร้อม URL วันที่ และผู้ตรวจ
5. **กระทบยอด:** ทุก record ลง reporting UUID ที่ถูกต้อง ผลรวมไม่ซ้ำ แยกพื้นที่ข้ามอำเภอจากข้อมูลสังกัดทางการ และตรวจยอดพื้นที่→จังหวัด→ประเทศตาม grain ของต้นทาง
6. **คำนวณใหม่:** ถ้าเหลือ pattern เดียว รูปแบบยืนยันได้; ถ้าทุก possible pattern อยู่ในชุดที่เลือก เข้า strategy ได้แม้รูปแบบยังไม่ชัด; ถ้ายังคร่อมให้คงรอตรวจ; ถ้าข้อมูลยังขาดให้คง unknown
7. **บันทึกผล:** Production ต้องสร้าง revision/event จาก evidence correction ที่ตรวจแล้ว พรีวิวนี้แสดงเหตุและคำแนะนำจาก snapshot ไม่อ้างว่าแก้ต้นทางสำเร็จ

### ตรวจผ่านไม่ได้แปลว่าเป็นทำเลที่ต้องเปิด

การตรวจคือทำให้คำตอบชัดขึ้น อาจได้ว่าเป็น Quiet หรือมี Supply มากเกินเกณฑ์ ซึ่งช่วยประหยัดเวลาสำรวจ ข้อมูลที่ยังไม่ทราบแบรนด์ **ไม่เท่ากับ unbranded** รายการ UNKNOWN ไม่ถูกเปลี่ยนเป็นเป้าหมาย acquire โดยไม่มีหลักฐาน

สถานะสาขารอทีมยืนยันเป็นอีกงานหนึ่ง ตรวจแบรนด์ พิกัด และการเปิดบริการราย POI การเปลี่ยน active/verified ใน branch editor ไม่แก้ aggregate ต้นทางหรือ pattern ทั้งพื้นที่โดยอัตโนมัติ และใบอนุญาตบริษัทไม่ยืนยันว่าทุกสำนักงานให้บริการสินเชื่อทุกประเภท

## สำหรับ dev

Runtime read-only report: YolkLocationReview.report(row, criteria) คืน reasons, missing metric IDs, own/competitor bounds, thresholds, role high/low/crosses/unknown, possible patterns และผล strategy ใช้ snapshot evaluator เดิม ไม่เขียน data/criteria/event

อ่าน [machine contract](../contracts/location-review.v1.7.3.json) และ [step-by-step plan](../IMPLEMENTATION_PLAN_v1.7.3.md) คำว่า “ยืนยัน” ในหน้าตรวจต้องหมายถึงรูปแบบภายใต้ข้อมูลและเกณฑ์ที่ระบุ ไม่ใช่การตรวจภาคสนามหรือการรับรองข้อมูลราชการ

## Final interaction refinements - 1.7.3

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Current automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](../evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Provider/live-byte evidence remains pending.
