# Developer handoff · Yolk 1.7.5

เริ่มจาก [เอกสารฉบับเต็มไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.7.5.md) Product, criteria, data/API contracts, ordered tasks, fixtures และ production gates อยู่ในไฟล์เดียว

Runtime: prototype/index.html → bootstrap.js → content-addressed modules. UI เดิมและ Leaflet instance คงไว้ สูตรตาม retained baselines ใน START_HERE.md

New module: prototype/branch-context.js. Coordinate candidates จาก YolkWorkspaceMap.resolvePoint ใช้ 77 province / 928 district / 7,954 fine display polygons. ค่าร่างที่ unique interior ช่วยกรอกได้; source UUID/aggregate และ operation verification ไม่เปลี่ยนตาม inference ไม่มี nearest-name/bbox assignment

[Branch workflow contract](contracts/branch-context.v1.7.5.json) · [Human guide](docs/BRANCH_CONTEXT_v1.7.5.md) · [DS assets](DS_ASSET_INTEGRATION.md) · [Asset index](ASSET_INDEX_v1.7.md)

Run focused check-branch-context.cjs, check-cold-branch.cjs และ check-save-context.cjs รวม retained workflow suites ใน .github/workflows/pages.yml. ทดสอบฟอร์ม manual overrides, missing coordinates, delayed lookups, context/language/theme rerenders และ photo drafts โดยไม่เปลี่ยน source snapshots

Release state: [contract](contracts/release.v1.7.5.json) · [QA receipt](evidence/release-checks-v1.7.5.json). Public selection คือ contracts/public-copy-selection.v1.7.5.json; manifests/hash receipts ต้องผูก final bytes อย่านำ receipt เก่ามาเรียก current QA

Production dev: validate resolver inputs server-side, source version/provenance + ambiguity, revision/RBAC, one event/outbox transaction on explicit save; infer hints read-only. Scope photo draft storage server-side; previews/typing do not notify team. Public demo has no actual invitations/delivery/private-media service
