# CityMETER: Yolk · v1.7.3 · LDS 0.9.7

**Find the yolk. Grow your market. / หาไข่แดงให้เจอ ขยายตลาดให้ตรงจุด**

[เว็บพรีวิว](https://montri-th.github.io/yolk/) · [เริ่มที่นี่](START_HERE.md) · [Product statement](CityMETER_Yolk_Product_Statement_v1.7.3.md) · [Implementation plan](IMPLEMENTATION_PLAN_v1.7.3.md)

Yolk ช่วยทีมขยายสาขาเห็น Demand, Supply และทำเลที่ควรศึกษาต่อบนแผนที่เดียว พรีวิวรองรับ Fuel, Grocery และ Non-bank ใช้ CityMETER snapshot 7,954 reporting UUIDs / 25 metrics มี preset และแบบร่างแยกตามแบรนด์/format

รุ่น 1.7.3 เพิ่ม **รอตรวจอะไร?** กดจำนวนบนการ์ดทั้งแปดเพื่อดูช่วง Supply เกณฑ์ สาเหตุ และหลักฐานที่ต้องเติม รายละเอียดทำเลมีปุ่มดูงานตรวจ และเล็งทำเลจากรายการ Demand ได้ การตรวจ snapshot/modelไม่เท่ากับ field verification ไม่มีการ bulk approve หรือแก้ source totals

**สีไข่ดาว:** Tier1 gradient เหลืองทอง→ส้มจาก native DS samples; Tier2 เหลืองโลโก้; Tier3 ไข่ขาว เป็นชุดสีหมวด Tier ที่เจ้าของเลือก ส่วน choroplethเชิงปริมาณอื่นใช้ native LUT 41สีตามตัววัด/ตัวหาร พร้อม national same-grain cutoffsที่ระบุใน [current extension](contracts/location-review.v1.7.3.json) สีข้อมูลเหมือนกันสองธีม Selectedfineภายในโปร่งใสให้อ่าน basemap

แผนที่เดิมอยู่ทุกหน้า ประเทศกดจังหวัดแต่แสดงสีอำเภอ จังหวัด/อำเภอแสดงสีแขวงหรืออปท. Hoverเน้นขอบเขตที่กดได้ CountrySupplyใช้ directnativeDistrict928ยอด ไม่ sum finecrosswalk และไม่ใช้ยอดอำเภอแก้การผูกทำเลที่ยังไม่ทราบ

## สำหรับ dev

อ่าน [START_HERE](START_HERE.md), [HANDOFF](HANDOFF.md), [Review guide](docs/LOCATION_REVIEW_v1.7.3.md), [DS integration](DS_ASSET_INTEGRATION.md) และ machinecontracts ก่อนเริ่ม งานเกณฑ์/โมเดล v1.7 และ map-analysis v1.7.2 เป็น retained baseline; current extension 1.7.3มี priorityเฉพาะส่วนที่ระบุ

    python3 -m http.server 8854 --bind 127.0.0.1

เปิด /prototype/ ผ่านHTTP Rootรับ final QAก่อน seal-pages-v1.7.3.py --after-final-qa และ verify-pages-v1.7.3.py Public artifactอยู่ prototype/ ข้อมูล private acquisition/logs/customer/workbookไม่อยู่ใน public repo

## ขอบเขตพรีวิวและผลตรวจ

CRUD รูป บทบาท feed และ notifications เป็น browser-local simulation ยังไม่มี shared backend, server RBAC หรือส่ง email/LINE จริง รูปสูงสุด5รูปเป็น mockup; satellite2021 ผลคัดไม่ยืนยันยอดขาย ผู้กู้ เขตกฎหมาย หรือความเหมาะสมที่ดินรายแปลง

ผล current source audit, automated/nativebrowser checks และสถานะprovider/livebyteอยู่ใน [release contract](contracts/release.v1.7.3.json) ไม่ใช้ receipt รุ่นเก่าแทน current QA ตรวจเครื่องจริงและ full language/theme matrix เฉพาะเมื่อมีหลักฐาน Shareimageยังเป็น approved1.7familyเดิม

## Final interaction refinements - 1.7.3

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Current automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Provider/live-byte evidence remains pending.
