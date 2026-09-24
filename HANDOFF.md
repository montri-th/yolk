---
document_id: yolk.handoff
product_version: "1.3"
handoff_patch: "1.3.1"
status: ready_with_open_manual_gate
start: START_HERE.md
asset_manifest: contracts/assets.v1.3.json
release_manifest: contracts/release.v1.3.1.json
---

# CityMETER: Yolk — Developer handoff1.3.1

[ดาวน์โหลด handoff ZIP 1.3.1](https://github.com/montri-th/yolk/releases/download/v1.3.1/CityMETER-Yolk-v1.3.1-handoff.zip) · [SHA-256](https://github.com/montri-th/yolk/releases/download/v1.3.1/CityMETER-Yolk-v1.3.1-handoff.zip.sha256)

## สิ่งที่ส่งมอบ

ชุดนี้มี web preview แบบหลายไฟล์, assets และ licences ที่ต้องใช้, Product statement, แผนพัฒนา15งาน และ machine contracts สำหรับ dev/coding agent **Product feature version เป็น1.3** ส่วน handoff patch1.3.1 รวมการแก้ identity: ไม่มีกรอบ/แผ่นรอง logo, เอา motif ออกจาก runtime/assets และเพิ่ม decision icons ที่พินแยก

เริ่มจาก [START_HERE](START_HERE.md) → [Product statement](CityMETER_Yolk_Product_Statement_v1.3.md) → [Implementation plan](IMPLEMENTATION_PLAN_v1.3.md) → [task JSON](contracts/implementation-tasks.v1.3.json) Runtime commit/hash และสถานะเผยแพร่ให้ยึด [release manifest](contracts/release.v1.3.1.json) ไม่เดาจากชื่อ zip หรือข้อความรุ่นในหน้าเว็บ

## ทดลองอะไรได้

เปิด [web preview](https://montri-th.github.io/yolk/) หรือรัน `python3 -m http.server 8849 --bind 127.0.0.1` ที่ root แล้วเปิด `/prototype/` ลอง TH/EN, light/dark/system, country→location detail, criteria preview/apply, Supply editor/photo drafts, shortlist และ feed/leaderboard

พรีวิวใช้ข้อมูลทำเล/POI จำลองทั้งหมด การแก้ไขและสมาชิกเป็น local simulation ไม่มี server authentication, multiuser database, production notification delivery หรือ source import จริง ภาพสาขาตัวอย่างเป็น AI mockup และภาพที่เลือกเพิ่มเก็บเฉพาะ browser origin ผ่าน IndexedDB

แผนที่แสดงฉาก boundary/POI จำลองบน basemap จริง จุดฉากไม่เข้าคำนวณ Supply Simplified/Detailed ใช้ OpenStreetMap; Satellite ใช้ ESA WorldCover Sentinel-2 ปี2021 ความละเอียด10m ผ่าน Terrascope ต้องคง attribution และ vintage note ข้อมูลจังหวัดใช้เป็น display layer ตาม [source/licence](evidence/geography-source.md) ไม่ใช่การรับรองขอบเขต อปท. ปัจจุบัน

## Asset และ source contract

- [Asset index](ASSET_INDEX_v1.3.md), [runtime asset manifest](contracts/assets.v1.3.json), [DS manifest](contracts/ds-assets.v1.3.json) และ [DS integration](DS_ASSET_INTEGRATION.md) ระบุไฟล์ บทบาทและ hash ที่ต้องเชื่อมจริง
- สี/ฟอนต์ canonical LDS0.9.4 คง bytes เดิม Product CSS/JS และ [icon extension](contracts/icons.v1.3.json) มี provenance แยก ไม่อ้างว่าแก้ canonical DS
- Light logo เป็นภาพโปร่งใสเดิมวางตรงบนพื้นเดิม ไม่มี card/frame/plate Dark ใช้ governed live-text identity ไม่ recolour/crop logo ไม่มี motif ที่ต้องนำกลับไปติดตั้ง
- Full-resolution source logo ไม่รวมใน runtime; เก็บ lineage ใน [projection receipt](evidence/logo-web-projection-v12.json) และ DS receipt
- Production ต้องใช้ private SourceRelease ที่อนุมัติแล้ว, geometry/crosswalk/coverage ตรวจแล้ว และ server-side permissions ขอบเขตต้องเป็น Polygon/MultiPolygon จริง; bbox จัดกล้องอย่างเดียว `source` ไม่เท่ากับ `verified`

## Verification

**สถานะ `ready_with_open_manual_gate`** Source/VM/controller และไฟล์เผยแพร่ตรวจได้ด้วย scripts ใน [START_HERE](START_HERE.md) ส่วน browser visual/device QA ยังเปิดอยู่จาก automatic approval review ที่บล็อกขั้นตอนเดิมไว้ ผล hash หรือ Node VM ไม่ทดแทนการดูหน้าจอจริง

ต้องตรวจต่อบน actual build: TH/EN, light/dark/system, 320/390/768/1440px, 200% text zoom, keyboard/touch, map network errors, photo orientation/storage recovery และ font/logo/icon rendering แนบหลักฐานก่อนเปลี่ยน gate เป็น passed ไม่สร้าง screenshot หรือผลตรวจขึ้นเอง

GitHub Pages deploy `prototype/` จาก main ตาม workflow หลัง automated checks ผ่าน คง `noindex` สำหรับ illustrative preview ดู [release manifest](contracts/release.v1.3.1.json) สำหรับ identity ของ runtime และ [QA record](evidence/experience-qa-v1.3.json) สำหรับขอบเขตหลักฐานเดิม

## เริ่มพัฒนาจริง

Task00 สำรวจระบบเดิม CityMETER และสร้าง path/command mapping, contracts, CI และ permission foundation ก่อน จากนั้น task01–02 ทำ private data gate และ geography งานที่เป็นอิสระใน [DAG](contracts/implementation-tasks.v1.3.json) จึงค่อยทำขนาน ทุกงานต้องส่ง changed files, tests, acceptance evidence และสิ่งที่ยังเปิดอยู่

Public CI ใช้ synthetic fixtures; backend commands ที่เสนอในแผนยังต้องสร้าง ไม่ publish ข้อมูลจริงเข้าชุดนี้ และไม่ตีความคะแนน/ดาวว่าเป็นยอดขายหรือความเป็นไปได้ของแปลงที่ดิน การคัดพื้นที่/corridor มาก่อนการศึกษารายแปลง ส่วน transaction/member calibration เป็น private track ภายหลัง
