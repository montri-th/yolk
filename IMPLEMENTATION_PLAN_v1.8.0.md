# Implementation plan · Yolk 1.8.0

แผนเต็มจากศูนย์อยู่ใน [เอกสารไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.8.0.md) มี Product statement, สูตร/registry, data/API, T00–T19, fixtures และ 10 JSON blocks ไฟล์นี้เป็นแผนเริ่มงานแบบย่อ ไม่ใช่ authority สูตรแยกอีกชุด

**หลักที่ห้ามปนกัน:** Demand/Tier กำหนดพื้นที่ผ่าน → Supply/weights จัดอันดับ → Shortlist เก็บงาน ไม่มี active pattern filter หรือ star priority

| ลำดับ | งาน | ตรวจรับหลัก |
|---|---|---|
| T00 | ตรวจ stack/source/assets ที่ CityMETER มีจริง | pin sources/DS/hash และบอกสิ่งที่ต้อง reuse |
| T01–T02 | App shell, tenant, auth, schema, 10 seats | server RBAC; 1 admin/3 editors/6 viewers |
| T03–T05 | Import adapters, safe metric AST, national benchmarks | exact UUID; missing≠0; fixed national cohort |
| T06 | Demand engine + industry/brand/format presets | 3 industries, same-tier logic, no inferred demand |
| T07–T08 | Supply bounds/rates + Demand-only membership/ranking | changing Supply/weights preserves eligible IDs |
| T09–T10 | Calculation API/worker + persistent map | latest result only; camera stable; finer fills/broader clicks |
| T11–T12 | 2 criteria panels + advanced settings + Apply | live draft; explicit revision/diff; no per-slider notifications |
| T13–T15 | Targets, branch CRUD/5 photos, location evidence | source-first hints; private media; corrections governed |
| T16–T17 | Feed/outbox/share/leaderboard + source refresh | one event per successful save; dedupe; history immutable |
| T18–T19 | Production QA, release, handoff | current evidence; source SHA/provider/live bytes separately |

ทำ vertical slice ทีละชุด อย่าให้ coding agent สร้างทุกหน้า/API พร้อมกัน ก่อนเริ่มแต่ละ task ระบุ input, allowed files, output, invariants และ fixtures จากเอกสารเต็ม

## Runtime ที่ต้องศึกษา

- `prototype/model.js`: Demand และ eligibility; `decision-ui.js`: ranking / summaries
- `prototype/simple-criteria.js/.css`: เกณฑ์หลักสองส่วน พร้อม advanced controls
- `prototype/relative-supply.js`: single raw denominator และ reference ที่แยก role
- `prototype/supply-compare.js`: ตัวเลข/แท่งคู่หน่วยเดียวกัน ใช้ local scale ที่ระบุชัด
- `prototype/workspace-map.js`: Leaflet host เดียว, drilldown/layers, role icons และ branded POI
- `prototype/branch-context.js`: form context/inference/manual priority/async guards
- `contracts/criteria-experience.v1.8.0.json`: active override; analytical baseline เดิมคงไว้ตาม START_HERE

## Fixtures ที่ต้องผ่านก่อนส่งงาน

1. เปลี่ยน Supply mode/denominator/reference หรือ ranking weights แล้ว Demand/Tier/eligible ID set คงเดิม
2. เลือก maxTier 1→2→3 แล้วชุดพื้นที่ขยายหรือเท่าเดิม Unknown ไม่ผ่าน
3. Restore legacy patterns/demandMode แล้วไม่กลับเป็น hidden filter และไม่สร้าง team revision เอง
4. Known zero, missing, interval และ invalid denominator แสดงต่างกัน
5. Role symbol บอกฝ่าย ตัวเลขบอกปริมาณ Actual POI ใช้ brand graphic + name + role badge
6. Route/theme/language/context changes ไม่ย้าย camera และ stale async response ไม่เขียนทับใหม่
7. RBAC/revision/media/outbox ของ production ต้องตรวจ server; static actor selector ไม่ใช่หลักฐาน

ผลตรวจ actual commands, UI snapshots และ remaining gates บันทึกใน receipts รุ่นนี้ อ่าน [release state](contracts/release.v1.8.0.json) ไม่เรียก fixtures ที่ยังเป็นข้อกำหนดว่า implementation ผ่านแล้ว

## ผลตรวจปัจจุบัน

Local QA ผ่าน 21 suites / 354 checks และ bounded native browser 11 checks มีภาพจริง 5 ภาพ ไม่ใช่ full language/theme matrix, physical-device หรือ backend pass Provider/live-byte proof ยังรอ external attestation อ่าน [release contract](contracts/release.v1.8.0.json) และ [native receipt](evidence/browser-v1.8.0/native-browser-review.json)
