---
version: 1.7.3
date: 2026-10-04
status: local_bounded_QA_pass_release_pending
start: START_HERE.md
product_contract: contracts/product.v1.7.json
feature_extension: contracts/location-review.v1.7.3.json
asset_manifest: contracts/assets.v1.7.3.json
release_manifest: contracts/release.v1.7.3.json
---

# ส่งต่อ dev — Yolk · v1.7.3

**ต่อจากแผนที่และโมเดลเดิม เพิ่มความชัดเจนให้การคัดทำเล** ไม่เริ่ม UIใหม่ รองรับ Fuel / Grocery / Non-bank เท่านั้น ใช้ native DS 0.9.7 assetsและ current contracts

| งาน | ไฟล์หลัก |
|---|---|
| เข้าใจผลิตภัณฑ์และขั้นตอน | [Product statement](CityMETER_Yolk_Product_Statement_v1.7.3.md), [Implementation plan](IMPLEMENTATION_PLAN_v1.7.3.md) |
| Review semantics/checklist | [คู่มือ](docs/LOCATION_REVIEW_v1.7.3.md), [machine extension/tasks](contracts/location-review.v1.7.3.json) |
| Runtime review | prototype/location-review.js/.css |
| Tierappearance | prototype/yolk-tier-style.js/.css; owner category recipe, not atmosphere/numericgradient |
| Raw metric41LUT | prototype/map-analysis.js; exact native samples, declared nationalcuts |
| Map/criteria/UIbase | contracts/workspace-map.v1.7.json, contracts/map-analysis.v1.7.2.json, contracts/criteria-proposal.v1.6.json |
| DSassets | [DS integration](DS_ASSET_INTEGRATION.md), [asset index](ASSET_INDEX_v1.7.md), reference/lds-0.9.7 |
| Evidence/release | contracts/release.v1.7.3.json, evidence/location-review-v1.7.3.json, evidence/release-checks-v1.7.3.json |

## กติกาที่ห้ามเปลี่ยนเงียบ ๆ

- Fixednationalcohort7,954 UUIDs /25metrics; BKKใช้180แขวง ต่างจังหวัด7,774อปท. Same-grain percentilesไม่ขึ้นกับviewport
- Reviewmodalเป็น read-only snapshot / model explanation ไม่ใช่การอนุมัติหรือยืนยันoperation Source correctionต้อง exactUUID/evidence/crosswalk/reconciliation
- possiblePatternsหนึ่งค่า = รูปแบบชัด; ทุกค่าถูกเลือก = เข้าstrategyได้แม้ชื่อยังไม่ชัด; บางค่าถูกเลือก = strategyreview DemandunknownและPOIverificationแยกกัน
- UNKNOWN≠unbranded; แก้activeflagของPOIไม่แก้ source aggregate; native D 928ไม่ถูกใช้แจกfine residual
- OnepersistentLeafletmap; largerhover/clicktargets; selectedfinefill=false; scopedforms/draftsและstalecontextguardsคงเดิม
- Tiercategoryใช้ownerfried-eggrecipeทั้งสองธีม Raw metricsใช้41native LUTสีเต็มopacity ตัวหาร/units/period/zero/reviewต้องมีlabel

## รับงานและเผยแพร่

1. อ่าน AGENTS/START_HERE และเลือก REVIEWtaskเดียวตามdependency
2. คงsource / formula / criteria ทุก invariant รัน retained regressionsพร้อม tests ใหม่ทั้งสาม
3. ดู actual render Thai/English desktop/narrowตามthemeที่ระบุจริง ไม่ใช้hashแทนvisualreview
4. Root freeze bytes หลัง final QA เพิ่มexact approved pathsใน public-copy-selection.v1.7.3.json
5. Sealและverify1.7.3เท่านั้น Preservehistoricalmanifests/receipts ไม่มีraw / private filesในpublic artifact
6. Publishเมื่อauthorized เก็บ terminalproviderresultผูกsourceSHAและliveHTTP/MIME/hashproofก่อนclaim

Static previewยังเป็น browser-local ไม่มีshared backend/server RBAC/email / LINE รูปเป็นmockupและexternalprovidersไม่รับรองผล ใช้ [Productionbaseline](contracts/implementation-tasks.v1.6.json) ต่อ API/datastore/RBAC/outbox/media ตาม stack CityMETERจริง

## Final interaction refinements - 1.7.3

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Current automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Provider/live-byte evidence remains pending.
