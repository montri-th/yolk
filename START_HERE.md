# Start here · Yolk 1.7.5

1. อ่าน [Product statement + step-by-step implementation ฉบับเต็ม](CityMETER_Yolk_Full_Product_and_Implementation_v1.7.5.md) ทั้ง prose และ JSON
2. อ่าน AGENTS.md และ [DS integration](DS_ASSET_INTEGRATION.md) ใช้ verified LDS 0.9.7 assets
3. เลือกงานหนึ่ง task ตาม full document โดย map stack จริงก่อน ไม่ติดตั้งสแต็กใหม่จากการคาดเดา
4. สำหรับการเพิ่ม/แก้สาขา อ่าน [context-aware CRUD](docs/BRANCH_CONTEXT_v1.7.5.md) + [contract](contracts/branch-context.v1.7.5.json) source-first, unique interior hints, manual choice wins, unresolved notes/photos permitted
5. รักษา baseline [product](contracts/product.v1.7.json), [persistent map](contracts/workspace-map.v1.7.json), [criteria](contracts/criteria-proposal.v1.6.json), [profiles](contracts/industry-profiles.json), [map analysis](contracts/map-analysis.v1.7.2.json), [review](contracts/location-review.v1.7.3.json), [boundaries/cutoff](contracts/map-boundary-appearance.v1.7.4.json)
6. เปิด prototype/ ผ่าน HTTP ตรวจ native TH/EN desktop/mobile light/dark แล้วรันทดสอบที่ตรงกับงาน สูตร/cohort/source unchanged ต้องมี regression evidence
7. อ่าน [Handoff](HANDOFF.md) และ [release state](contracts/release.v1.7.5.json) Seal settled source ด้วย scripts/seal-pages-v1.7.5.py --after-final-qa แล้ว verify-pages-v1.7.5.py ก่อน publish ตาม authorization

Prototype เป็น browser-local demo; shared APIs/datastore/auth/outbox/private media/email/LINE ยังเป็น production tasks ผล hash/model/DOM หรือ native viewport ไม่พิสูจน์ physical device หรือผลธุรกิจ
