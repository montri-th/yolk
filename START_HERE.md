---
document_id: yolk.start_here
product_version: "1.3"
handoff_patch: "1.3.1"
entrypoint: prototype/index.html
product_contract: contracts/product.v1.3.json
task_manifest: contracts/implementation-tasks.v1.3.json
asset_manifest: contracts/assets.v1.3.json
release_manifest: contracts/release.v1.3.1.json
status: ready_with_open_manual_gate
---

# เริ่มที่นี่ — CityMETER: Yolk

[ดาวน์โหลด handoff ZIP 1.3.1](https://github.com/montri-th/yolk/releases/download/v1.3.1/CityMETER-Yolk-v1.3.1-handoff.zip) · [SHA-256](https://github.com/montri-th/yolk/releases/download/v1.3.1/CityMETER-Yolk-v1.3.1-handoff.zip.sha256)

**Product v1.3 · Handoff 1.3.1** ส่งต่อพรีวิวที่ทดลองได้, assets ตาม DS และข้อกำหนดสำหรับสร้างระบบจริง โดยแยกชัดว่าส่วนใดทำแล้วและส่วนใดยังต้องพัฒนา

[เปิด web preview](https://montri-th.github.io/yolk/) · [repository](https://github.com/montri-th/yolk)

## อ่านตามงานของคุณ

| ต้องการ | เปิดไฟล์ |
|---|---|
| เข้าใจปัญหา ผู้ใช้ และขอบเขตผลิตภัณฑ์ | [Product statement](CityMETER_Yolk_Product_Statement_v1.3.md) |
| เริ่มพัฒนาทีละขั้น | [Implementation plan — 15 งาน](IMPLEMENTATION_PLAN_v1.3.md) |
| เลือก asset และต่อกับ DS ให้ถูก | [Asset index](ASSET_INDEX_v1.3.md) + [DS integration](DS_ASSET_INTEGRATION.md) |
| สั่ง coding agent | [AGENTS.md](AGENTS.md) + [task manifest](contracts/implementation-tasks.v1.3.json) |
| ตรวจสิ่งที่ส่งมอบ/ข้อจำกัด | [Handoff](HANDOFF.md) + [release manifest](contracts/release.v1.3.1.json) |

### ทดลองในเครื่อง

รันจาก repository root แล้วเปิด `http://127.0.0.1:8849/prototype/` ใช้ port อื่นได้ถ้า port นี้ไม่ว่าง

```sh
python3 -m http.server 8849 --bind 127.0.0.1
```

ลองหน้า `#market`, `#criteria`, `#supply`, `#feed`, `#place/demo-area-001` สลับ TH/EN และ light/dark/system ในแอป ไม่มีขั้น install packages สำหรับ static preview นี้

### ตรวจชุดส่งมอบ

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
```

ชุดตรวจนี้ตรวจ source, contracts และ controller ผ่าน VM/mock ไม่ได้ยืนยัน layout หรือการใช้งานบนอุปกรณ์จริง Browser visual/device QA ยัง **open** ตาม [บันทึก QA](evidence/experience-qa-v1.3.json)

## สำหรับเครื่อง

| Contract | หน้าที่ |
|---|---|
| [product.v1.3.json](contracts/product.v1.3.json) | scope, roles, product behavior |
| [criteria.v1.3.json](contracts/criteria.v1.3.json) | Demand/Supply, missing rules, ranking |
| [implementation-tasks.v1.3.json](contracts/implementation-tasks.v1.3.json) | DAG, paths, acceptance, tests, prompts, command status |
| [experience.v1.3.json](contracts/experience.v1.3.json) | theme, map context, branch photos |
| [assets.v1.3.json](contracts/assets.v1.3.json) | รายการ runtime assets และ hash |
| [ds-assets.v1.3.json](contracts/ds-assets.v1.3.json) | DS 0.9.4 pin และบทบาท asset |
| [icons.v1.3.json](contracts/icons.v1.3.json) | icon subset เพิ่มเฉพาะ Yolk และ licence |
| [release.v1.3.1.json](contracts/release.v1.3.1.json) | runtime identity/fingerprint และสถานะตรวจ |

เริ่ม task00 ด้วยระบบเดิมของ CityMETER ก่อน Path/คำสั่ง production ในแผนเป็นสิ่งที่จะสร้าง ไม่ใช่ backend ที่มีอยู่แล้ว พรีวิวสาธารณะใช้ข้อมูลจำลอง; ข้อมูลจริงต้องผ่าน private SourceRelease และ crosswalk ที่ตรวจแล้ว

รอบ 1.3.1 เอา motif ออกจาก runtime/assets ใช้ logo ตรงบนพื้น light โดยไม่มีกรอบหรือแผ่นรอง และ governed text identity บน dark เพิ่ม DS-style icons คู่ข้อความที่จุดตัดสินใจ โดยไม่แก้สูตรคำนวณ v1.3

## Rebuild the handoff

After changing runtime files, update the release fingerprint and affected asset contracts, then rebuild and verify:

```sh
python3 scripts/build-handoff.py --output /tmp/yolk-handoff
python3 scripts/verify-handoff.py --zip /tmp/yolk-handoff/CityMETER-Yolk-v1.3.1-handoff.zip
```

The ZIP contains source, assets, licences, docs, contracts and verification scripts under one root. Its `.zip.sha256` checksum is written alongside it. Private source data and user-uploaded photos are excluded.
