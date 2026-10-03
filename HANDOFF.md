---
document_id: yolk.handoff.three_industries
version: 1.6.0
date: 2026-10-03
status: approved_public_static_preview
start: START_HERE.md
asset_manifest: contracts/assets.v1.6.json
release_manifest: contracts/release.v1.6.0.json
---

# ส่งต่อ dev — Yolk · 3 ธุรกิจ · LDS 0.9.7

**ใช้ UI เดิม เพิ่มเกณฑ์ที่เลือก dataset/metric ได้ และเก็บค่ารายแบรนด์แยกกัน** รุ่นนี้รองรับ Fuel, Grocery และ Non-bank เท่านั้น ใช้ snapshot จริงจาก CityMETER คัดพื้นที่ทั่วประเทศ 7,954 หน่วย Sheets ต้นทางคงเดิม; รุ่นนี้เผยแพร่เป็น public static preview ตามคำขอเจ้าของ

เริ่มจาก [START_HERE](START_HERE.md) → [Product statement](CityMETER_Yolk_Product_Statement_v1.6.md) → [Criteria guide](docs/CRITERIA_GUIDE.md) → [Implementation plan](IMPLEMENTATION_PLAN_v1.6.md) แต่ละงานมี dependencies, acceptance และ prompt ใน [machine tasks](contracts/implementation-tasks.v1.6.json)

## ทดลองได้แล้ว

รัน `python3 -m http.server 8854 --bind 127.0.0.1` ที่ root ของชุดนี้ แล้วเปิด `http://127.0.0.1:8854/prototype/` ต้องเปิดผ่าน HTTP เพื่อโหลด JSON และฟอนต์

- เลือกธุรกิจ แบรนด์ และกลุ่ม Supply แล้วดูผลคัดพื้นที่จริง
- ในหน้าเกณฑ์ เลือก dataset → metric/สูตรที่รองรับ → ปรับ percentile หรือจำนวนข้อที่ต้องผ่าน ดูผลเปลี่ยนแปลงก่อนกดใช้กับทีม
- สลับแบรนด์แล้วกลับมา เกณฑ์และ draft ของแต่ละบริบทไม่ปะปนกัน
- ดูแผนที่ประเทศ ทำเลที่เล็งไว้ landscape รายทำเล Supply editor รูปสูงสุด 5 รูป feed/leaderboard และบทบาททีม 10 คน
- ใช้ TH/EN และ light/dark/system บน UI เดิม ส่วนเลือกบริบทบนมือถือย่อไว้ใน disclosure

โครง AND/OR ของ preset ยังเป็นโครงตั้งต้น การสร้างสูตรใหม่หรือเปลี่ยนทุก operator ผ่าน generic rule builder เป็นงานพัฒนาต่อ ไม่ใช่ความสามารถที่เสร็จแล้วใน preview นี้ การแก้ไขทั้งหมดเป็น browser-local simulation ยังไม่มี shared backend, production RBAC, notification/email/LINE delivery หรือ live Sheets sync

## หลักของการคำนวณ

ฐานเทียบคงที่ทั้งประเทศ: 180 แขวงใน กทม. และ 7,774 อปท. ต่างจังหวัด ใช้ valid values ของแต่ละ metric ใน UUID ชุดเดียวกัน ค่าขาดไม่ใช่ศูนย์ การกรองจังหวัดหรือแบรนด์ไม่สร้าง percentile ฐานใหม่

| Preset ตั้งต้น | ไข่แดงจาก Demand | ตรงเกณฑ์ทีม | รอตรวจเพิ่มเติม |
|---|---:|---:|---:|
| Fuel · บางจาก · all fuel | 1,067 | 915 | 79 |
| Grocery · 7-Eleven · C_STORE | 2,859 | 1,455 | 14 |
| Non-bank · เมืองไทย แคปปิตอล · active retail-license union | 2,298 | 37 | 1,378 |

ตัวเลขนี้เป็นผล snapshot/default ที่ตรวจได้ ไม่ใช่ยอดลูกค้าหรือคำแนะนำเปิดสาขา จำนวน “ตรงเกณฑ์ทีม” รวมผล Demand, Tier และ preferred patterns; “รอตรวจ” เป็นผลที่ข้อมูลยังยืนยัน membership ไม่ได้ แยกจากผลยืนยันเสมอ

Fuel คงสูตรอาคาร/กิจกรรมและน้ำหนัก 70/20/10 เดิม Grocery เริ่มจากประชากร/ความหนาแน่น หรือบริบทคนงานโรงงาน Non-bank เริ่มจากประชากรอายุ 20–64/ความหนาแน่น ซึ่งเป็นบริบทตลาดบริการ ไม่ใช่ความต้องการกู้ ความสามารถชำระหนี้ หรือ eligibility

Supply ใช้ direct UUID aggregates แยกจาก POI overlays Non-bank ยังมี 5,534 จาก 23,524 สำนักงานที่ไม่ผูกพื้นที่ละเอียด จึงคงช่วงความเป็นไปได้รายจังหวัด/บริษัท Grocery มี category-assignment discrepancy บางส่วนที่เก็บเป็นช่วงด้วย ไม่แทน residual ด้วยศูนย์หรือกระจายเป็นยอดจริงซ้ำทุกพื้นที่

## แผนที่และภาพ

แผนที่ประเทศใช้ province geometry เดิมที่มี source/licence ขอบเขตรายทำเลมี **18 source polygons** ที่ตรวจที่มาได้ พื้นที่อื่นมี fit extent เท่านั้น ระบบต้องบอกว่ายังไม่มี polygon ไม่วาด bbox ให้ดูเป็น boundary จริง Point coordinates ไม่ถูกเดาว่าอยู่ใน อปท. จากตำบลหรือชื่อพื้นที่

Simplified/Detailed ใช้ OpenStreetMap; Satellite ใช้ ESA WorldCover Sentinel-2 ปี 2021 ผ่าน Terrascope ต้องคง attribution/vintage และต้องมีเครือข่ายสำหรับ basemap ภาพสาขา 5 ภาพที่มากับชุดนี้เป็น AI mockup ของสถานีสมมติ ไม่ใช่รูปบางจากหรือรูปกิจการจริงของ Grocery/Non-bank ภาพที่เลือกเพิ่มเก็บเป็น local draft

ดู [ภาพและบันทึก UI](docs/EXPERIENCE_v1.6.md) กับ [browser receipt](evidence/QA.md) สำหรับสิ่งที่ตรวจบนหน้าจอจริง ห้ามอ้างว่า viewport emulation เป็นการทดสอบเครื่อง iPhone/Safari จริง

## DS และ assets

ต่อไฟล์ตาม [Asset index](ASSET_INDEX_v1.6.md), [DS integration](DS_ASSET_INTEGRATION.md) และ [asset manifest](contracts/assets.v1.6.json) ฐานเต็ม LDS 0.9.7 + Location Intelligence Profile รวมไว้ครบ โลโก้/ตำแหน่งและ Material Rounded product extension ของ Yolk เดิมมี provenance แยก ไม่มี motif, logo frame, decorative bracket หรือ selected coloured left rail

ในธีมมืด wordmark ใช้ alpha ของภาพเดิมเติมสี foundation text-primary ตาม LOGO-01 โดยคงสัญลักษณ์สีและสัดส่วน ไม่ invert หรือใส่แผ่นรอง Heat 3-class บนแผนที่ใช้ `#FFF6CF / #F5B323 / #C72D10` เหมือนกันสองธีม และแยกจาก metric-chart 5-class

## หลักฐานตรวจและข้อจำกัด

| การตรวจ | ผลและขอบเขต |
|---|---|
| Source/runtime integration | 26 checks ผ่าน; 2.44 ล้าน comparisons ครอบคลุม 7,954×25 metric values/states, Supply scopes/bounds, geometry และ percentile decisions |
| Core runtime | 30 checks ผ่าน รวม preset, draft isolation, late-fetch/cold-point races, unknown Supply, weighted intervals และสูตร/coverage 25 metric สองภาษา |
| Branch photos | 28 checks ผ่าน ครอบคลุม local photo state, permissions, storage และ file headers |
| Independent model | Criteria 21 checks และ Supply 20 checks ผ่าน; future integration protocols ใน receipt ยังเป็นแผนทดสอบ |
| DS package | 9,768/9,768 ผ่าน เป็น package/schema/colour/source checks; คำเตือนต้นทางอยู่ใน receipt ไม่ใช่ full-artifact certification |
| Browser/UI | ดู viewport, route, language/theme, screenshots และข้อจำกัดที่ตรวจจริงใน browser receipt |
| Package integrity | hash/relative-link/runtime-dependency checks จาก public source verifier; full local ZIP ตรวจแยกแล้วก่อน publication |

Production ยังต้องเชื่อม SourceRelease ที่อนุมัติ, datastore/API ของ CityMETER, server RBAC, revision locking, media, outbox/notification และ calibration จาก business outcomes การเก็บข้อมูลทีมเพิ่มต้องทำเป็น overlay ก่อน reconcile ไม่แก้ source totals โดยตรง

## ตรวจ public source และ Pages artifact

```sh
python3 scripts/verify-pages-v1.6.py
node scripts/check-three-industry.cjs
node scripts/check-photo-runtime.cjs
python3 -m http.server 8854 --bind 127.0.0.1
```

เปิด [เว็บเผยแพร่](https://montri-th.github.io/yolk/) หรือ /prototype/ เมื่อรันในเครื่อง ตัว Pages artifact อยู่ที่ prototype/ และมี runtime contracts สองไฟล์ใน contracts/ ใต้ artifact ให้รักษาสำเนาตรงกับ root contracts ทุกครั้งที่ release

Public source รวม runtime projections, assets/licences, product/implementation contracts และหลักฐานสรุป ไม่รวม raw HTTP gzip archive, full normalized source inputs หรือ browser logs ของเครื่องทำงาน Full local handoff 1.6-preview.1 เป็น snapshot ก่อนเผยแพร่; source นี้มี deployment paths, public reference links และ metadata รุ่น 1.6.0 ที่ปรับสำหรับ Pages ดู [public manifest](contracts/pages-public-manifest.v1.6.0.json) สำหรับ exact published file hashes

ห้ามเรียกการเปิด public preview ว่า shared production backend หรือการทดสอบเครื่องมือถือจริง การแก้ไขจากผู้ใช้แต่ละคนยังอยู่ใน browser ของคนนั้น
