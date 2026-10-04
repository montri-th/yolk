---
version: 1.7.4
date: 2026-10-04
status: release_pending_current_QA
entrypoint: prototype/index.html
product_contract: contracts/product.v1.7.json
feature_extension: contracts/map-boundary-appearance.v1.7.4.json
map_analysis_baseline: contracts/map-analysis.v1.7.2.json
design_system: LDS 0.9.7
---

# เริ่มที่นี่ — CityMETER: Yolk · v1.7.4

หาไข่แดง เทียบ Supply แล้วเล็งทำเลบนแผนที่เดียว รุ่น 1.7.4 คงสูตรและ cohort เดิม ปรับเส้นขอบขาว/hover เหลือง อธิบายจุดเริ่มเรียก Supply ว่า “มาก” และแยกจำนวนไข่แดงจากผลคัดรวม ส่วน review สีไข่ดาวและ native LUT 41 คงจากรุ่นก่อน

| ต้องการ | เปิด |
|---|---|
| เข้าใจผลิตภัณฑ์ | [Product statement](CityMETER_Yolk_Product_Statement_v1.7.4.md) |
| เริ่มพัฒนา | [Implementation plan](IMPLEMENTATION_PLAN_v1.7.4.md) + [current machine tasks](contracts/map-boundary-appearance.v1.7.4.json) |
| อ่านแผนที่และ Supply cutoff | [คู่มือ 1.7.4](docs/MAP_BOUNDARIES_v1.7.4.md) |
| เข้าใจทำเลรอตรวจ | [เหตุ ผล audit และ checklist](docs/LOCATION_REVIEW_v1.7.3.md) |
| เข้าใจ Demand/Supply map | [retained analysis guide](docs/MAP_ANALYSIS_v1.7.2.md) + current appearance override ใน [1.7.3 contract](contracts/location-review.v1.7.3.json) |
| ดูสูตรและ preset | [Criteria](docs/CRITERIA_GUIDE.md), [Supply-relative](docs/SUPPLY_RELATIVE_PROPOSAL.md), [Brand presets](docs/BRAND_PRESETS_v1.7.md) |
| ต่อ DS และ identity | [DS integration](DS_ASSET_INTEGRATION.md), [asset index](ASSET_INDEX_v1.7.md) |
| รับงาน/เผยแพร่ | [Handoff](HANDOFF.md), [release status](contracts/release.v1.7.4.json) |

## ทดลอง

    python3 -m http.server 8854 --bind 127.0.0.1

เปิด /prototype/ ผ่าน HTTP เลือกธุรกิจ/แบรนด์ → Demand → Supply → เกณฑ์ ทดลองแบบร่างก่อน Apply กดจำนวนรอตรวจบนการ์ดเพื่อดูเหตุ หรือเปิดรายละเอียดทำเล → ดูหลักฐานและสิ่งที่ต้องตรวจ เล็งทำเลได้จากรายการ Demand

แผนที่เดียวค้างทุกหน้า Hover เน้นกรอบที่กดได้ ประเทศกดจังหวัดแต่ลงสีอำเภอ จังหวัดลงสีแขวง/อปท. เลือกทำเลแล้วภายในโปร่งใส POI ใช้ O/C/U พร้อมชื่อแบรนด์และ research links

## Authority และหลักฐาน

Product/map/brand v1.7 + criteria/production tasks v1.6 เป็นฐาน; map-analysis1.7.2 เพิ่มมุมมอง; location-review1.7.3 override เฉพาะเหตุ review และ appearance/classification การแสดงสีที่ระบุ สูตรคัด Demand ไม่เปลี่ยน LDS0.9.7 fullbase + LocationProfile เป็น authorityด้านรูปแบบโดยมี categorical Tier exception ที่เจ้าของเลือก

Extension 1.7.4 ปรับ appearance ของเส้นขอบและอธิบายสูตร cutoff/counters ที่มีอยู่ ไม่เปลี่ยนโมเดลหรือ reseed preset ระหว่างเลื่อน Supply ผล cutoff audit ของ 37 default contexts / 444 probes แยกจาก current release/native QA

Source audit ตรวจสาม preset จาก snapshot เดิม ไม่แก้ต้นทางหรือยืนยัน operation การตรวจ UI/model/hash และ provider / live bytes เป็นหลักฐานคนละชั้น ดู current receipts ใน release contract เครื่องจริง/shared backend/server RBAC/email / LINE ยังไม่ใช่สิ่งที่ static preview ยืนยันได้

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
