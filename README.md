# CityMETER: Yolk · v1.7.4 · LDS 0.9.7

**รุ่น 1.7.4 ยังรอ current QA และหลักฐานเผยแพร่** ปรับเส้นขอบแผนที่และอธิบาย Supply cutoff: ขาวสำหรับขอบปกติ เหลือง Yolk เมื่อชี้ขอบเขตที่กดได้ พร้อมแยกไข่แดงจาก Demand กับทำเลผ่านเกณฑ์รวม สูตร สีข้อมูล และข้อมูลต้นทางคงเดิม

**Find the yolk. Grow your market. / หาไข่แดงให้เจอ ขยายตลาดให้ตรงจุด**

[เว็บพรีวิว](https://montri-th.github.io/yolk/) · [เริ่มที่นี่](START_HERE.md) · [Product statement](CityMETER_Yolk_Product_Statement_v1.7.4.md) · [Implementation plan](IMPLEMENTATION_PLAN_v1.7.4.md)

Yolk ช่วยทีมขยายสาขาเห็น Demand, Supply และทำเลที่ควรศึกษาต่อบนแผนที่เดียว พรีวิวรองรับ Fuel, Grocery และ Non-bank ใช้ CityMETER snapshot 7,954 reporting UUIDs / 25 metrics มี preset และแบบร่างแยกตามแบรนด์/format

รุ่น 1.7.3 เพิ่ม **รอตรวจอะไร?** กดจำนวนบนการ์ดทั้งแปดเพื่อดูช่วง Supply เกณฑ์ สาเหตุ และหลักฐานที่ต้องเติม รายละเอียดทำเลมีปุ่มดูงานตรวจ และเล็งทำเลจากรายการ Demand ได้ การตรวจ snapshot/modelไม่เท่ากับ field verification ไม่มีการ bulk approve หรือแก้ source totals

**สีไข่ดาว:** Tier1 gradient เหลืองทอง→ส้มจาก native DS samples; Tier2 เหลืองโลโก้; Tier3 ไข่ขาว เป็นชุดสีหมวด Tier ที่เจ้าของเลือก ส่วน choroplethเชิงปริมาณอื่นใช้ native LUT 41สีตามตัววัด/ตัวหาร พร้อม national same-grain cutoffsที่ระบุใน [current extension](contracts/location-review.v1.7.3.json) สีข้อมูลเหมือนกันสองธีม Selectedfineภายในโปร่งใสให้อ่าน basemap

แผนที่เดิมอยู่ทุกหน้า ประเทศกดจังหวัดแต่แสดงสีอำเภอ จังหวัด/อำเภอแสดงสีแขวงหรืออปท. Hoverเน้นขอบเขตที่กดได้ CountrySupplyใช้ directnativeDistrict928ยอด ไม่ sum finecrosswalk และไม่ใช้ยอดอำเภอแก้การผูกทำเลที่ยังไม่ทราบ

## สำหรับ dev

อ่าน [START_HERE](START_HERE.md), [HANDOFF](HANDOFF.md), [คู่มือแผนที่และ cutoff](docs/MAP_BOUNDARIES_v1.7.4.md), [Review guide](docs/LOCATION_REVIEW_v1.7.3.md) และ [DS integration](DS_ASSET_INTEGRATION.md) ก่อนเริ่ม เกณฑ์/โมเดล v1.7 และ map-analysis v1.7.2 เป็น retained baseline; review/Tier จาก 1.7.3 คงไว้ ส่วน [extension 1.7.4](contracts/map-boundary-appearance.v1.7.4.json) มี priority ด้านเส้นขอบและความชัดเจนของ cutoff/counters

    python3 -m http.server 8854 --bind 127.0.0.1

เปิด /prototype/ ผ่าน HTTP Release owner รับ final QA ก่อนใช้ sealer/verifier ของ 1.7.4 ตาม release contract Public artifact อยู่ prototype/ ข้อมูล private acquisition/logs/customer/workbook ไม่อยู่ใน public repo

## ขอบเขตพรีวิวและผลตรวจ

CRUD รูป บทบาท feed และ notifications เป็น browser-local simulation ยังไม่มี shared backend, server RBAC หรือส่ง email/LINE จริง รูปสูงสุด5รูปเป็น mockup; satellite2021 ผลคัดไม่ยืนยันยอดขาย ผู้กู้ เขตกฎหมาย หรือความเหมาะสมที่ดินรายแปลง

ผล current source audit, automated/nativebrowser checks และสถานะprovider/livebyteอยู่ใน [release contract](contracts/release.v1.7.4.json) ไม่ใช้ receipt รุ่นเก่าแทน current QA ตรวจเครื่องจริงและ full language/theme matrix เฉพาะเมื่อมีหลักฐาน Shareimageยังเป็น approved1.7familyเดิม

## Final interaction refinements - 1.7.3

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Historical1.7.3 automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Those1.7.3 prepublication statements are retainedhistory;1.7.4 QA/provider/live-byte evidence is pending.

## Active 1.7.4 appearance and Supply clarity - release pending

Read [current appearance contract](contracts/map-boundary-appearance.v1.7.4.json), [boundary guide](docs/MAP_BOUNDARIES_v1.7.4.md) and [implementation plan](IMPLEMENTATION_PLAN_v1.7.4.md). All ordinary and selected fine-area outlines are white #FFFFFF; clickable hover outlines are Yolk yellow #FFBC1F / 2 px in both themes. Widths: province 1.2; country district 0.45; closer district 1.05; chosen parent district 1.1; ordinary fine 0.45; selected fine 0.8 px. Selected fine stays fill=false, replacing the previous blue selection stroke.

At location level, show only the chosen parent district as unfilled, noninteractive context, excluded from counts and ranking. Existing renderer order: fine fills, visible unfilled districts, provinces, selected fine, then broader transparent navigation hits. No new panes. Retain gradient definitions, fills/LUT41, formulas/cohort and persistent camera. Missing source extents are white dashed unfilled outlines with distinct labels, never choropleths.

Current 1.7.4 QA and publication are pending. The retained 1.7.3 product behavior/data and receipts are baseline/history, not current release passes. Use [release contract](contracts/release.v1.7.4.json). Current manifests, sealing, provider and live-byte evidence remain the release owner's work.

## Supply cutoff clarity - 1.7.4

A Supply slider sets the point that starts High: observed count/rate >= cutoff is High, and < cutoff is Low. Moving right raises that point; it does not increase actual branches, the denominator or Demand. The same rate 0.5 is High at cutoff 0.3 and Low at cutoff 0.8, in the same displayed unit. Preserve interval bounds and possible patterns; no inversion or preset-threshold reseeding while dragging.

Show Demand Yolks separately from all-criteria matches. The raw Demand count uses the current context and draft: `s.nextRows.filter(a => a.demand === true && areaMatchesNavigation(a)).length`, before maxDemandTier, preferred patterns and Supply gates. Its scope is the selected administrative area, not viewport/camera visibility. Unknown Demand is not counted as High or zero. Supply-only changes retain this count and Demand/Tier membership. Final matches still use all existing gates; arbitrary pattern selections have no guaranteed monotonic result.

The [Supply semantics receipt](evidence/supply-cutoff-semantics-v1.7.4.json) covers 37 current default contexts / 444 probes. It supports model semantics, not browser/touch usability, arbitrary strategies or final release verification. Current release QA/provider/live-byte gates remain pending.
