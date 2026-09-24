# CityMETER: Yolk

[ดาวน์โหลด handoff ZIP 1.3.1](https://github.com/montri-th/yolk/releases/download/v1.3.1/CityMETER-Yolk-v1.3.1-handoff.zip) · [SHA-256](https://github.com/montri-th/yolk/releases/download/v1.3.1/CityMETER-Yolk-v1.3.1-handoff.zip.sha256)

**Find the yolk. Grow your market. / หาไข่แดง ขยายตลาด**

[Open web preview](https://montri-th.github.io/yolk/) · [เริ่มอ่านที่นี่ / Start here](START_HERE.md)

**Product v1.3 · Developer handoff1.3.1** — พรีวิว HTML/CSS/JavaScript แบบ mobile-first รองรับไทย/อังกฤษและ light/dark/system สำหรับทีมขยายสาขาที่ต้องการเทียบ Demand กับ Supply แล้วเก็บทำเลที่สนใจและหลักฐานร่วมกัน

| สำหรับ | เอกสารล่าสุด |
|---|---|
| Product / ทีมธุรกิจ | [Product statement v1.3](CityMETER_Yolk_Product_Statement_v1.3.md) |
| Dev / coding agent | [Implementation plan — 15 tasks](IMPLEMENTATION_PLAN_v1.3.md) + [task JSON](contracts/implementation-tasks.v1.3.json) |
| Design / frontend | [Asset index](ASSET_INDEX_v1.3.md) + [DS integration](DS_ASSET_INTEGRATION.md) |
| ตรวจรุ่นและข้อจำกัด | [Handoff](HANDOFF.md) + [release manifest](contracts/release.v1.3.1.json) |

พรีวิวมี Market landscape, เกณฑ์ Demand/Supply, shortlist, Supply editor, feed/leaderboard, แผนที่ทำเล3แบบ และรูปสาขาสูงสุด5รูป รุ่น handoff1.3.1 เอา motif ออก ใช้ logo โดยไม่มีกรอบ/แผ่นรอง และเพิ่ม icons ที่ช่วยอธิบายปุ่มสำคัญตาม DS

**ข้อมูลบนเว็บสาธารณะเป็นข้อมูลจำลอง** การแก้ข้อมูล สิทธิ์สมาชิก และการแจ้งเตือนเป็นการจำลองใน browser ไม่มี production auth, shared database, การส่ง email/LINE หรือข้อมูลลูกค้าจริง รูปที่เพิ่มเก็บเฉพาะ IndexedDB ในเครื่อง Basemap ใช้บริการภายนอก; satellite เป็นภาพปี2021 ความละเอียด10m

## Run locally

รันจาก repository root แล้วเปิด `http://127.0.0.1:8849/prototype/` (เปลี่ยน port ได้หากถูกใช้อยู่):

```sh
python3 -m http.server 8849 --bind 127.0.0.1
```

รายการคำสั่งตรวจที่รันได้จริงอยู่ใน [START_HERE.md](START_HERE.md) ส่วน backend paths/commands ใน implementation plan เป็นงานที่จะสร้างและควรต่อกับระบบเดิมของ CityMETER ก่อน

## Contracts and release state

Machine entrypoints: [product](contracts/product.v1.3.json), [criteria](contracts/criteria.v1.3.json), [tasks](contracts/implementation-tasks.v1.3.json), [experience](contracts/experience.v1.3.json), [runtime assets](contracts/assets.v1.3.json), [DS assets](contracts/ds-assets.v1.3.json), [icons](contracts/icons.v1.3.json), [release](contracts/release.v1.3.1.json).

สถานะคือ **`ready_with_open_manual_gate`** Source/controller checks สนับสนุนการส่งมอบพรีวิว แต่ browser visual/responsive และอุปกรณ์จริงยังต้องตรวจ การเผยแพร่สำเร็จไม่ได้หมายความว่า production backend หรือคุณภาพข้อมูลจริงพร้อมแล้ว

เอกสารชื่อ v1.2 เดิมเก็บเป็นทางเข้ามายัง v1.3 เพื่อไม่ให้ลิงก์เดิมเสีย Production ต้องผ่าน approved private SourceRelease, geography/crosswalk, tenant permissions และ QA ตามแผน ข้อมูลจริงไม่อยู่ใน public repo นี้
