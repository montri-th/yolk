---
document_id: yolk.start_here.three_industries
version: 1.7.2
date: 2026-10-04
entrypoint: prototype/index.html
product_contract: contracts/product.v1.7.json
feature_extension: contracts/map-analysis.v1.7.2.json
criteria_contract: contracts/criteria-proposal.v1.6.json
task_manifest: contracts/map-analysis.v1.7.2.json#/tasks
design_system: LDS 0.9.7
status: ready_with_open_manual_gate
---

# เริ่มที่นี่ — CityMETER: Yolk · v1.7.2

เลือกFuel/Grocery/Non-bankและแบรนด์ ดูDemandก่อน แล้วเทียบSupplyและคัดรูปแบบทำเล ใช้แผนที่เดียว เกณฑ์เดิมของแบรนด์ และฐาน7,954fineUUIDsที่ไม่เปลี่ยนตามviewport

| ต้องการ | เปิด |
|---|---|
| เข้าใจผลิตภัณฑ์ | [Product statement](CityMETER_Yolk_Product_Statement_v1.7.2.md) + [retained product contract](contracts/product.v1.7.json) |
| เข้าใจมุมมองDemand/Supplyและ8patterncounts | [Map analysis guide](docs/MAP_ANALYSIS_v1.7.2.md) + [machine extension/tasks](contracts/map-analysis.v1.7.2.json) |
| เริ่มพัฒนา | [Implementation plan](IMPLEMENTATION_PLAN_v1.7.2.md) + [retained production tasks](contracts/implementation-tasks.v1.6.json) |
| ดูสูตรและpreset | [Criteria guide](docs/CRITERIA_GUIDE.md), [Supply-relative](docs/SUPPLY_RELATIVE_PROPOSAL.md), [Brand presets](docs/BRAND_PRESETS_v1.7.md) |
| คงแผนที่/hover/popup/forms | [Persistent map](docs/PERSISTENT_MAP_v1.7.md), [Responsiveness](docs/RESPONSIVENESS_v1.7.1.md) |
| ตรวจsource/geometry | [Source summary](evidence/data/SUMMARY.md), [boundary provenance](prototype/data/real/boundary-provenance.v1.7.json), [native district public provenance](prototype/data/real/district-source-provenance.json) |
| ต่อDS/identity | [Asset integration](DS_ASSET_INTEGRATION.md), [asset index](ASSET_INDEX_v1.7.md) |
| รับงาน/เผยแพร่ | [Handoff](HANDOFF.md), [pending release](contracts/release.v1.7.2.json) |

## ทดลองในเครื่อง

```sh
python3 -m http.server 8854 --bind 127.0.0.1
```

เปิด `/prototype/` ผ่านHTTP แล้ว:

1. เลือกindustry/brand/format Presetที่เหมาะกับบริบทหรือsavedcriteriaจะกลับมา ไม่ทับงานอีกแบรนด์
2. เปิด **Demand** ดูconfirmedTierทั้งหมดก่อนSupply/preferred/maxTier หรือเลือกrawmetric ประเทศติดlabelmaximumknownfinevalue ไม่ใช่districtaggregate
3. เปิด **Supply** เริ่มO+Cidentifiedtotalต่อฐานตลาด แล้วเลือกเรา/คู่แข่ง/identifiedtotalและจำนวน/ต่อkm²/ต่อฐานตลาด Countryใช้directnativeD928ไม่sumfinecrosswalk BranchCRUDยังอยู่ในหน้านี้
4. เปิด **เกณฑ์** ดูการ์ดทั้ง 8: “ทำเลเข้าเกณฑ์ / ทำเลรอตรวจ” ทั้งประเทศ ก่อนเลือก checkbox แต่เก็บ Demand/Tier gates ที่เลือก จำนวนรอตรวจอาจซ้อนกัน; invalid/loading แสดง dash
5. เลื่อนซูม สลับเมนู ภาษา ธีมและbasemap Mapinstanceเดิม Hoverแสดงsourceboundaryที่กดจริง Selectedfineโปร่งใส Popupแสดงrecord/brandจริง
6. ลองdraftเกณฑ์ก่อนApply Applyหนึ่งครั้งจึงสร้างcriteriarevision/team event Personalmapcontrolsไม่มีteam event

## Authority และขอบเขตหลักฐาน

AGENTS + product/map/brandv1.7 + responsivenessv1.7.1 เป็นbase; map-analysisv1.7.2เพิ่มมุมมองและcounts Criteria/industry/productiontasksv1.6ยังเป็นbaseline ไม่มีmigrationสูตร/cohortเงียบๆ LDS0.9.7fullbase+LocationProfileเป็นauthorityด้านรูปแบบ

รุ่น 1.7.2 ผ่าน 217 automated checks, source checks และ native Chrome แบบจำกัดขอบเขต หลักฐาน source, browser, เครื่องจริง, Google providers และ bytes บนเว็บแยกกัน Receipts รุ่นเก่าไม่แทน current QA Raw acquisition/logs/private provenance เก็บใน private; public source catalog มี URL/date/hash เท่านั้น Snapshot/CRUD/feed เป็น browser-local ยังไม่มี shared backend, server RBAC หรือส่ง email/LINE จริง

Receipts รุ่นนี้: [217 automated checks](evidence/release-checks-v1.7.2.json), [native district source checks](evidence/district-source-checks-v1.7.2.json) และ [browser receipt](evidence/browser-v1.7.2/native-browser-review.json) ประเทศใช้ Demand best confirmed fine tier หรือ raw maximum fine ที่มี label; Supply ใช้ direct district count/rate แผนที่ minZoom 4 และ padding เมื่อสั่ง fit โดยตรงผ่าน bounded review ไทย/dark และอังกฤษ/light ที่ 1,440×900 และ 390×844 การตรวจเครื่องจริง/provider และการยืนยันเผยแพร่ยังเป็นหลักฐานแยก
