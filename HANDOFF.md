---
version: 1.7.4
date: 2026-10-04
status: release_pending_current_QA
start: START_HERE.md
product_contract: contracts/product.v1.7.json
feature_extension: contracts/map-boundary-appearance.v1.7.4.json
asset_manifest: contracts/assets.v1.7.4.json
release_manifest: contracts/release.v1.7.4.json
---

# ส่งต่อ dev — Yolk · v1.7.4

**ต่อจากแผนที่และโมเดลเดิม เพิ่มความชัดเจนให้การคัดทำเล** ไม่เริ่ม UIใหม่ รองรับ Fuel / Grocery / Non-bank เท่านั้น ใช้ native DS 0.9.7 assetsและ current contracts

| งาน | ไฟล์หลัก |
|---|---|
| เข้าใจผลิตภัณฑ์และขั้นตอน | [Product statement](CityMETER_Yolk_Product_Statement_v1.7.4.md), [Implementation plan](IMPLEMENTATION_PLAN_v1.7.4.md) |
| Current map/cutoff tasks | [appearance + clarity contract](contracts/map-boundary-appearance.v1.7.4.json), [คู่มือ](docs/MAP_BOUNDARIES_v1.7.4.md) |
| Review semantics/checklist | [คู่มือ](docs/LOCATION_REVIEW_v1.7.3.md), [machine extension/tasks](contracts/location-review.v1.7.3.json) |
| Runtime review | prototype/location-review.js/.css |
| Tierappearance | prototype/yolk-tier-style.js/.css; owner category recipe, not atmosphere/numericgradient |
| Raw metric41LUT | prototype/map-analysis.js; exact native samples, declared nationalcuts |
| Map/criteria/UIbase | contracts/workspace-map.v1.7.json, contracts/map-analysis.v1.7.2.json, contracts/criteria-proposal.v1.6.json |
| DSassets | [DS integration](DS_ASSET_INTEGRATION.md), [asset index](ASSET_INDEX_v1.7.md), reference/lds-0.9.7 |
| Evidence/release | contracts/release.v1.7.4.json; current cutoff receipt แยกจาก historical review/QA 1.7.3 |

## กติกาที่ห้ามเปลี่ยนเงียบ ๆ

- Fixednationalcohort7,954 UUIDs /25metrics; BKKใช้180แขวง ต่างจังหวัด7,774อปท. Same-grain percentilesไม่ขึ้นกับviewport
- Reviewmodalเป็น read-only snapshot / model explanation ไม่ใช่การอนุมัติหรือยืนยันoperation Source correctionต้อง exactUUID/evidence/crosswalk/reconciliation
- possiblePatternsหนึ่งค่า = รูปแบบชัด; ทุกค่าถูกเลือก = เข้าstrategyได้แม้ชื่อยังไม่ชัด; บางค่าถูกเลือก = strategyreview DemandunknownและPOIverificationแยกกัน
- UNKNOWN≠unbranded; แก้activeflagของPOIไม่แก้ source aggregate; native D 928ไม่ถูกใช้แจกfine residual
- OnepersistentLeafletmap; largerhover/clicktargets; selectedfinefill=false; scopedforms/draftsและstalecontextguardsคงเดิม
- Tiercategoryใช้ownerfried-eggrecipeทั้งสองธีม Raw metricsใช้41native LUTสีเต็มopacity ตัวหาร/units/period/zero/reviewต้องมีlabel

## รับงานและเผยแพร่

1. อ่าน AGENTS/START_HERE และเลือก BOUNDARY หรือ CLARITY task เดียวตาม dependency ใน current contract
2. คง source / formula / criteria ทุก invariant และรัน checks ที่เกี่ยวข้องกับ final bytes
3. ดู actual render Thai/English desktop/narrow ตาม theme ที่ตรวจจริง ไม่ใช้ hash แทน visual review
4. Release owner freeze bytes หลัง final QA และยืนยัน exact approved paths ใน selection ของ 1.7.4
5. ใช้ sealer/verifier 1.7.4 รักษา historical manifests/receipts ไม่รวม raw/private files ใน public artifact
6. เผยแพร่เมื่อ authorized เก็บ terminal provider result ผูก source SHA และ live HTTP/MIME/hash proof ก่อน claim

Static previewยังเป็น browser-local ไม่มีshared backend/server RBAC/email / LINE รูปเป็นmockupและexternalprovidersไม่รับรองผล ใช้ [Productionbaseline](contracts/implementation-tasks.v1.6.json) ต่อ API/datastore/RBAC/outbox/media ตาม stack CityMETERจริง

## Final interaction refinements - 1.7.3

Supply cards fit the fixed action panel. Long names wrap without horizontal scrolling or clipped text; do not use overflow:hidden to conceal overflow. Check this on the final served candidate. Local prepublication receipts are distinct from post-release layout/provider/live-byte proof; version 1.7.3 and the previously reported test counts remain unchanged.

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Historical1.7.3 automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Those1.7.3 prepublication statements are retainedhistory;1.7.4 QA/provider/live-byte evidence is pending.

## Active 1.7.4 appearance and Supply clarity - release pending

Read [current appearance contract](contracts/map-boundary-appearance.v1.7.4.json), [boundary guide](docs/MAP_BOUNDARIES_v1.7.4.md) and [implementation plan](IMPLEMENTATION_PLAN_v1.7.4.md). All ordinary and selected fine-area outlines are white #FFFFFF; clickable hover outlines are Yolk yellow #FFBC1F / 2 px in both themes. Widths: province 1.2; country district 0.45; closer district 1.05; chosen parent district 1.1; ordinary fine 0.45; selected fine 0.8 px. Selected fine stays fill=false, replacing the previous blue selection stroke.

At location level, show only the chosen parent district as unfilled, noninteractive context, excluded from counts and ranking. Existing renderer order: fine fills, visible unfilled districts, provinces, selected fine, then broader transparent navigation hits. No new panes. Retain gradient definitions, fills/LUT41, formulas/cohort and persistent camera. Missing source extents are white dashed unfilled outlines with distinct labels, never choropleths.

Current 1.7.4 QA and publication are pending. The retained 1.7.3 product behavior/data and receipts are baseline/history, not current release passes. Use [release contract](contracts/release.v1.7.4.json). Current manifests, sealing, provider and live-byte evidence remain the release owner's work.

White unfilled SVG paths may use a neutral 0.35 px drop-shadow edge halo from --yl-border-strong (theme DS border.emphasis). Restrict it to fill="none", stroke="#FFFFFF", stroke-opacity="1". Never filter filled analytical paths or the entire pane; this is boundary backing, not data recoloring or a new metric.

## Supply cutoff clarity - 1.7.4

A Supply slider sets the point that starts High: observed count/rate >= cutoff is High, and < cutoff is Low. Moving right raises that point; it does not increase actual branches, the denominator or Demand. The same rate 0.5 is High at cutoff 0.3 and Low at cutoff 0.8, in the same displayed unit. Preserve interval bounds and possible patterns; no inversion or preset-threshold reseeding while dragging.

Show Demand Yolks separately from all-criteria matches. The raw Demand count uses the current context and draft: `s.nextRows.filter(a => a.demand === true && areaMatchesNavigation(a)).length`, before maxDemandTier, preferred patterns and Supply gates. Its scope is the selected administrative area, not viewport/camera visibility. Unknown Demand is not counted as High or zero. Supply-only changes retain this count and Demand/Tier membership. Final matches still use all existing gates; arbitrary pattern selections have no guaranteed monotonic result.

The [Supply semantics receipt](evidence/supply-cutoff-semantics-v1.7.4.json) covers 37 current default contexts / 444 probes. It supports model semantics, not browser/touch usability, arbitrary strategies or final release verification. Current release QA/provider/live-byte gates remain pending.

Supply rate slider endpoints and steps use the role calibration threshold (fallback team criteria), not the current draft thumb value. Keep the scale stable across rerenders, language and route changes. Exact-number inputs retain values outside the slider range with the existing warning. Refresh cached broad navigation hit accessible labels on language change; preserve geometry, map instance, formulas, draft and preset.
