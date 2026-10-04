---
version: 1.7.3
date: 2026-10-04
status: local_bounded_QA_pass_release_pending
design_system: LDS 0.9.7
feature_extension: contracts/location-review.v1.7.3.json
---

# พัฒนา Yolk ทีละงาน — อธิบายหลักฐานให้ชัด แล้วคัดทำเลต่อ

เริ่มจาก [Product statement](CityMETER_Yolk_Product_Statement_v1.7.3.md), [คู่มือตรวจทำเล](docs/LOCATION_REVIEW_v1.7.3.md) และ [machine extension](contracts/location-review.v1.7.3.json) อ่าน AGENTS/START_HERE ก่อนแก้ไฟล์ รุ่นนี้ต่อจาก map-analysis v1.7.2; สูตรและ cohort v1.7 คงเดิม

## งานตามลำดับ

| Task | ทำอะไร | ตรวจรับ |
|---|---|---|
| REVIEW-00 | Freeze source/context/criteria และ audit ครบ UUID | ระบุ hash ช่วงข้อมูล grain แบรนด์ format revision; ไม่แก้ source เพื่อให้ผลผ่าน |
| REVIEW-01 | Pure report ของเหตุและช่วงข้อมูล | แยก Demand unknown, pattern ambiguous, strategy review และ POI verification; threshold มากใช้ ≥ และน้อยใช้ upper < threshold |
| REVIEW-02 | ต่อ modal และ entry points | กด review count → รายชื่อ → เหตุ → ทำเล; detail แสดงปุ่มที่เห็นว่ากดได้; ไม่เปลี่ยน map viewport/context โดยไม่สั่ง |
| REVIEW-03 | แสดงผล audit และ checklist | ให้ผู้ใช้รู้ว่า snapshot/model ตรวจแล้ว ส่วนใดต้องใช้หลักฐานเพิ่ม; ห้าม bulk approve โดยไม่มี evidence |
| REVIEW-04 | สี Tier แบบไข่ดาวและ native quantitative LUT 41 สี | Tier เป็น category recipe ที่เจ้าของเลือก; raw metrics ยังใช้ native scale/unit; selected fine fill=false |
| REVIEW-05 | เล็งทำเลจาก Demand และคง workflow ทีม | Shortlist action ตาม role ที่อนุญาต; scoped context; view/inspection ไม่สร้าง team event |
| REVIEW-06 | Model regressions + native browser review | บันทึกคำสั่ง/ผลจริง; ตรวจ Thai/English desktop/narrow, light/dark ตามขอบเขตที่ทำจริง |
| REVIEW-07 | Seal/verify/publish | Freeze source หลัง QA, allowlist ชัด, provider success + live-byte proof ก่อนอ้างเผยแพร่ |

งาน 01 และ audit ใน 03 ทำหลัง 00; 02 และ 04 ทำคู่กันได้; 05 คง APIs เดิม; 06 รอ runtime พร้อม; 07 รอ final QA

## ขั้นตอน implement

1. **คงโมเดลเดิม:** ใช้ evaluator กับ fixed national 7,954 reporting UUIDs / 25 metrics Preserve possiblePatterns และ intervals อย่าหาเลขเดียวแทนช่วงที่ยังไม่แน่
2. **สร้าง pure report:** รับ evaluated row และ criteria context คืน reason IDs, metric IDs ที่ขาด, ช่วง Supply สองฝ่าย และเกณฑ์จำนวนที่เทียบได้ หน่วยอัตราต้องแปลงกลับด้วยตัวหารจริง ไม่ใช้ percentile เป็นตัวหาร
3. **แยก state:** patternConfirmed = possiblePatterns มีหนึ่งค่า; strategyConfirmed คือทุก possible pattern อยู่ใน preferred set; strategyReview คือบางค่าอยู่ใน set ส่วน POI operating status เป็น field-verification state อีกชุด
4. **ต่อ UI แบบ read-only:** modal ใช้ dialog label, close, keyboard, 44px targets และพื้นตาม theme Report/list/detail ต้อง escaped text; invalid draft ไม่เปิดผลเก่า อย่าสร้าง event เมื่อผู้ใช้ดูเหตุ
5. **บันทึก audit อย่างซื่อสัตย์:** ระบุ preset/hash/date และจำนวนตรวจได้ ไม่เก็บ raw/private acquisition ใน public artifact; source corrections และ field verified เป็น 0 ถ้าไม่มีหลักฐานใหม่
6. **ต่อสีจาก helper เดียว:** โหลด yolk-tier-style ก่อน map-analysis/workspace-map; ensureDefs(map) หลัง SVG renderer mount; SVG ใช้ paint(tier), legend ใช้ css(tier) ตรวจ Tier1 gradient จริง ไม่ใช่ fallback สีเดียว Selected fine คง fill=false ใช้ label/outline แทน
7. **ใช้ native LUT 41 สีสำหรับ raw choropleths:** รับ lut ตาม scaleId ที่ตรง metric/denominatorและระดับข้อมูล ใช้ 40 cutoffs P(i×100/41), i=1…40 จาก fixed national exact comparable cohort ที่รวม known zero ได้ 41 classes; known zero อยู่ class 0 และมี cue แยก; ties อาจทำให้บางช่วงว่าง; แสดง zero/missing/review แยก ไม่ทำ theme inversion หรือสร้างสีจากหัวท้ายเอง ไม่เปลี่ยน fine Demand screening cutoffs
8. **เพิ่ม shortlist ที่จุดตัดสินใจ:** รายการ Demand เปิดทำเลหรือเล็งได้ เลือก action ไม่เปลี่ยน draft ของอีกแบรนด์ Apply criteria ค่อยสร้างหนึ่ง workspace event; personal map filters ไม่สร้าง event
9. **Production evidence correction:** endpoint ต้องรับ exact UUID, source record IDs, before/after, source URL/date, evidence state, reviewer และ expectedRevision ตรวจสิทธิ์ server-side กระทบยอด transactionally แล้วสร้าง event/outbox คำนวณเฉพาะ dependency ที่เปลี่ยน ห้าม branch active flag เขียน aggregate โดยตรง
10. **ตรวจและส่งต่อ:** รัน retained regressions + tests ใหม่ ดู UI จริงและ hover/selection สอง grain ตรวจ network failures/unknown states แล้วจึง freeze/seal/publish

## Acceptance ที่ต้องรักษา

- Formula, default presets, fine national cohort และ source totalsไม่เปลี่ยนเพราะเปลี่ยนสีหรือเปิด modal
- การจัดรูปแบบอาจชัดได้โดย Supply interval ไม่จำเป็นต้องเป็นจำนวน exact หากทั้งช่วงอยู่ฝั่งเดียวของ threshold
- การลด/เพิ่ม threshold เป็นการเปลี่ยนเกณฑ์ ไม่ใช่ source verification ต้องแยก log
- Native district totalsไม่ปิด fine-area assignment residuals; ไม่แจกยอดคงเหลือซ้ำทุกทำเล
- UNKNOWN providerไม่ถูกอ้างเป็น unbranded; license evidenceไม่กลายเป็น branch product confirmation
- Country→province→district→fine hierarchy, larger click/hover target, persistent map, POI identity และ selected transparency คงเดิม
- Raw metricsใช้41 native LUTสีเต็ม opacity; missing/reviewไม่ใช้สี low/zero และ Tier gradientไม่ถูกใช้แทน quantitative scale

## คำสั่งตรวจ

Retained 14 commands ดู [แผน map-analysis](IMPLEMENTATION_PLAN_v1.7.2.md#คำสั่งและ-release-hooks) ต้องรันใหม่กับ bytes รุ่นนี้ เพิ่ม:

    node scripts/check-location-review.cjs
    node scripts/check-yolk-tier.cjs
    node scripts/check-map-lut41.cjs

หลัง release owner รับ final QA และ freeze bytes แล้ว:

    python3 scripts/seal-pages-v1.7.3.py --after-final-qa
    python3 scripts/verify-pages-v1.7.3.py

ผล current QA ดู [release receipt](evidence/release-checks-v1.7.3.json), [browser receipt](evidence/browser-v1.7.3/native-browser-review.json) และ [release status](contracts/release.v1.7.3.json) ห้ามนำผลรุ่นเก่ามาอ้างว่าเป็น pass ของรุ่นนี้ เครื่องจริง/shared backend/notification delivery เป็น open gates จนมีหลักฐาน

## Prompt สำหรับทำงานทีละชิ้น

~~~text
อ่าน AGENTS.md, START_HERE.md, contracts/location-review.v1.7.3.json และ baseline ที่ระบุ
ทำ Task REVIEW-[id] เพียงงานเดียว รายงาน dependency ก่อนแก้
คง source totals, national cohort, possiblePatterns และ scoped criteria/drafts
ถ้าข้อมูลขาดให้คืน state ไม่ใส่ศูนย์ ไม่กด bulk verified
ใช้ DS assets/native LUT และ tier helper ตาม contract
รัน checks ที่เกี่ยวข้อง ดู rendered Thai/English ที่ viewport ที่เปลี่ยน
ส่ง files changed, commands/results, evidence scope, acceptance และ open gates
อย่า seal หรือ publish จน root รับ final QA และมี authorization ใน session
~~~

## Final interaction refinements - 1.7.3

Supply cards must fit the fixed action panel without horizontal scrolling or clipped text. In workspace-layout.css keep supply-table min-width:0 and width:100%; cells allow min-width:0 and overflow-wrap:anywhere. Long branch/brand names wrap; do not hide overflow to mask a layout failure. Verify actual rendered card width against the action-panel client width on desktop and mobile. Final post-release layout/provider/live-byte proof remains separate from local prepublication receipts; no test-count or version change is implied.

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Current automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Provider/live-byte evidence remains pending.
