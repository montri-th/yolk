---
document_id: yolk.start_here
product_version: "1.4"
handoff_patch: "1.4.0"
entrypoint: prototype/index.html
product_contract: contracts/product.v1.4.json
task_manifest: contracts/implementation-tasks.v1.4.json
asset_manifest: contracts/assets.v1.4.json
release_manifest: contracts/release.v1.4.0.json
status: ready_with_open_manual_gate
---

# เริ่มที่นี่ — CityMETER: Yolk v1.4

[ดาวน์โหลด handoff ZIP 1.4.0](https://github.com/montri-th/yolk/releases/download/v1.4.0/CityMETER-Yolk-v1.4.0-handoff.zip) · [SHA-256](https://github.com/montri-th/yolk/releases/download/v1.4.0/CityMETER-Yolk-v1.4.0-handoff.zip.sha256)

ชุดส่งมอบนี้มีพรีวิวที่ทดลองได้ assets ที่ใช้จริง และแผนสร้างระบบ production โดยแยกความสามารถจำลองออกจากงานที่ยังต้องพัฒนา

| ต้องการ | เปิดไฟล์ |
|---|---|
| เข้าใจปัญหา ผู้ใช้ และพฤติกรรมผลิตภัณฑ์ | [Product statement](CityMETER_Yolk_Product_Statement_v1.4.md) |
| เข้าใจ Tier, รูปแบบทำเล และน้ำหนัก | [Product statement: อันดับและตัวอย่าง](CityMETER_Yolk_Product_Statement_v1.4.md) + [criteria contract](contracts/criteria.v1.4.json) |
| เริ่มทำงานทีละขั้น | [Implementation plan — 15 งาน](IMPLEMENTATION_PLAN_v1.4.md) |
| สั่ง coding agent | [AGENTS.md](AGENTS.md) + [task manifest](contracts/implementation-tasks.v1.4.json) |
| ต่อ asset ตาม DS | [Asset index](ASSET_INDEX_v1.4.md) + [DS integration](DS_ASSET_INTEGRATION.md) |
| ตรวจสิ่งส่งมอบและข้อจำกัด | [Handoff](HANDOFF.md) + [release manifest](contracts/release.v1.4.0.json) |

## ทดลองพรีวิว

[เปิดเว็บสาธารณะ](https://montri-th.github.io/yolk/?v=1.4.0) หรือรันจาก root แล้วเปิด `http://127.0.0.1:8849/prototype/`

```sh
python3 -m http.server 8849 --bind 127.0.0.1
```

ลอง `#market` → กด **ดูรายละเอียด** → `#criteria` เลือก Tier และรูปแบบทำเล สังเกตจำนวนที่ผ่าน จากนั้นปรับน้ำหนัก สังเกตอันดับที่เปลี่ยนโดยจำนวนผ่านคงเดิม กดใช้กับทีมแล้วดู log ลอง `#supply`, `#feed` และสลับ TH/EN กับ light/dark/system

หน้าเกณฑ์มี 4 หมวด: **Demand / Supply / รูปแบบทำเลที่สนใจ / น้ำหนักจัดอันดับ** Workspace ใหม่ใช้ weighted ranking ส่วนเกณฑ์เก่าคง legacy จนผู้ใช้เลือกเปลี่ยนอย่างชัดเจน ไม่มีการเปลี่ยน shortlist เดิมเอง

## ตรวจชุดส่งมอบ

```sh
python3 scripts/verify-public-release.py
python3 scripts/verify-handoff.py
node scripts/check-public-runtime.cjs
node scripts/check-theme-runtime.cjs
node scripts/check-map-runtime.cjs
node scripts/check-photo-runtime.cjs
node scripts/check-photo-form.cjs
node scripts/check-brand-identity.cjs
node scripts/check-icons.cjs
node scripts/check-ranking-v1.4.cjs
node scripts/check-decisions-v1.4.cjs
node scripts/check-web-identity.cjs
```

คำสั่งเหล่านี้ตรวจ source/contracts/controller และ hash ไม่มีคำสั่งใดปิด browser/device QA โดยตัวเอง ดูสถานะจริงใน release manifest อย่าอ้างว่าดู layout หรือ share preview ในแอปจริงแล้วหากยังไม่ได้ตรวจ

## สัญญาสำหรับเครื่อง

| Contract | หน้าที่ |
|---|---|
| [product.v1.4.json](contracts/product.v1.4.json) | scope, roles, requirements และพฤติกรรมผู้ใช้ |
| [criteria.v1.4.json](contracts/criteria.v1.4.json) | tiers, filtering, ranking weights, missing bounds และ migration |
| [implementation-tasks.v1.4.json](contracts/implementation-tasks.v1.4.json) | DAG, inputs/outputs, acceptance, test IDs และ prompts |
| [assets.v1.4.json](contracts/assets.v1.4.json) | runtime assets และ hashes |
| [ds-assets.v1.4.json](contracts/ds-assets.v1.4.json) | DS 0.9.4 ที่พินไว้และบทบาทไฟล์ |
| [web-identity.v1.4.json](contracts/web-identity.v1.4.json) | โลโก้ favicon ภาพแชร์ และ metadata |
| [icons.v1.3.json](contracts/icons.v1.3.json) | ชุด icon ของ Yolk ที่ยังใช้เดิมและ licence |
| [experience.v1.3.json](contracts/experience.v1.3.json) | baseline ธีม แผนที่ และรูปสาขาที่ไม่ได้เปลี่ยนในรุ่นนี้ |
| [release.v1.4.0.json](contracts/release.v1.4.0.json) | runtime fingerprint และสถานะตรวจของรุ่นนี้ |

เริ่ม task 00 ด้วยระบบ CityMETER เดิมก่อน Path และคำสั่ง production ในแผนเป็นสิ่งที่จะสร้าง ไม่ใช่ backend ที่มีอยู่แล้ว Public fixtures เป็นข้อมูลจำลอง ข้อมูลจริงต้องมี private SourceRelease และ crosswalk ที่ตรวจแล้ว

## สร้าง handoff ใหม่

เมื่อ runtime เปลี่ยน ให้ปรับ release fingerprint และ asset contracts ที่เกี่ยวข้อง ก่อนรัน:

```sh
python3 scripts/build-handoff.py --output /tmp/yolk-handoff
python3 scripts/verify-handoff.py --zip /tmp/yolk-handoff/CityMETER-Yolk-v1.4.0-handoff.zip
```

ZIP รวม source, assets, licences, docs, contracts และ scripts ใน root เดียว พร้อม `.zip.sha256` แยกข้างไฟล์ ไม่รวมข้อมูลลูกค้าจริง รูปที่ผู้ใช้เพิ่ม หรือ credentials
