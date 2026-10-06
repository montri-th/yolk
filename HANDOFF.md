# Developer handoff · CityMETER: Yolk 1.8.0

เริ่มจาก [Product statement + implementation ฉบับเต็มไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.8.0.md) แล้วทำ T00 เพื่อเชื่อมกับ stack จริงของ CityMETER ไม่สร้างบริการขนานโดยคาดเดา

## ชุดส่งต่อ

| ส่วน | ไฟล์ |
|---|---|
| Product + full from-scratch blueprint | `CityMETER_Yolk_Full_Product_and_Implementation_v1.8.0.md` |
| Quick task sequence | `IMPLEMENTATION_PLAN_v1.8.0.md` / `START_HERE.md` |
| Active experience contract | `contracts/criteria-experience.v1.8.0.json` |
| All 10 machine blocks | `contracts/full-product.v1.8.0.json` (same blueprint snapshot) |
| DS/identity/font/icon/data assets | `ASSET_INDEX_v1.8.0.md`, `DS_ASSET_INTEGRATION.md`, `prototype/`, `reference/lds-0.9.7/` |
| Runtime asset/provenance hashes | Current sealed manifests, including `contracts/icons.v1.8.0.json` |
| QA/browser/release state | `contracts/release.v1.8.0.json` and its current receipt paths |

## What changed

Flow หลัก: หาไข่แดง → ดูช่องว่างสาขา → เล็งทำเล เกณฑ์มี 2 tabs และ advanced controls ยังครบ ชุดพื้นที่ผ่านใช้ Demand/Tier เท่านั้น Supply/weights จัดอันดับ ไม่มี hidden pattern gate หรือ star priority เก็บ legacy fields/history เพื่อ migration ไม่ emit team event ตอนโหลด

ไข่แดงเข้ม/ไข่แดง/ไข่ขาว = Demand สูงมาก/สูง/ค่อนข้างสูง โล่/ดาบ = สาขาเรา/คู่แข่ง เปรียบเทียบด้วยตัวเลขและแท่งหน่วยเดียวกัน **local scale** ของแต่ละคู่ไม่ใช่ shared scale ข้ามทุกทำเล และไม่ใช่ capacity/market share Actual POI ยังคง square brand graphic + name + party badge

## Preserved contracts

Fixed cohort 7,954 UUIDs, 25 metrics, 3 industries, source/preset formulas, geometry provenance, exact LDS 0.9.7/41 LUTs, transparent selected fine interior, white hierarchy outlines/yellow hover, persistent camera และ branch-context 1.7.5 คงไว้

จาก 1.7.5 → 1.8.0 **active eligibility เปลี่ยน** เพราะหยุดใช้ pattern/demandMode gate ผลจำนวน candidates อาจต่างแม้ raw Demand เหมือนเดิม ต้องอ้าง `engineVersion` ไม่อธิบายว่า Demand เพิ่มจากการปรับ Supply

## Production boundaries

Preview เป็น browser-local simulation API/datastore/auth/server RBAC/private media/outbox/email/LINE เป็น production tasks ดู full blueprint ห้ามนำ source correction หรือ coordinate hint ไปเปลี่ยน aggregate Supply อัตโนมัติ

เก็บ manual/saved assignment มาก่อน hint Unique strict-interior source polygon ช่วยกรอก draft ได้ แต่ไม่รับรอง legal membership/operation ภาพ5รูปต้องprivate/scoped/revision-guarded Shared mutationหนึ่งครั้งสร้าง event/outboxหนึ่งtransaction

## Acceptance and release

Run current model/workflow suites รวม active membership/weights/legacy migration และ role graphic checks ตรวจ actual Thai/English light/dark mobile/desktop แล้ว seal หลัง source นิ่ง Provider/live-byte attestations ผูก final source SHA แยกจาก local QA รูป snapshot บอก viewport/context; ยังไม่ใช่ physical-device/backend certification

[Current release state](contracts/release.v1.8.0.json) คือ authority สถานะปัจจุบัน Old receipts และ pending statements ใน historical docs เป็นประวัติของรุ่นนั้น

## ผลตรวจปัจจุบัน

Local QA ผ่าน 21 suites / 354 checks และ bounded native browser 11 checks มีภาพจริง 5 ภาพ ไม่ใช่ full language/theme matrix, physical-device หรือ backend pass Provider/live-byte proof ยังรอ external attestation อ่าน [release contract](contracts/release.v1.8.0.json) และ [native receipt](evidence/browser-v1.8.0/native-browser-review.json)
