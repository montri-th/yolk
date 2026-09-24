---
document_id: yolk.handoff
product_version: "1.5"
handoff_patch: "1.5.0"
status: ready_with_open_manual_gate
start: START_HERE.md
asset_manifest: contracts/assets.v1.5.json
release_manifest: contracts/release.v1.5.0.json
---

# CityMETER: Yolk — Developer handoff1.5.0

[ดาวน์โหลด handoff ZIP 1.5.0](https://github.com/montri-th/yolk/releases/download/v1.5.0/CityMETER-Yolk-v1.5.0-handoff.zip) · [SHA-256](https://github.com/montri-th/yolk/releases/download/v1.5.0/CityMETER-Yolk-v1.5.0-handoff.zip.sha256)

## สิ่งที่ส่งมอบ

ชุดนี้มี web preview แบบหลายไฟล์, assets และ licences ที่ต้องใช้, Product statement, แผนพัฒนา15งาน และ machine contracts สำหรับ dev/coding agent **Product version เป็น 1.5** และ handoff เป็น 1.5.0 รุ่นนี้ย่อ navigation มือถือและเปลี่ยน chrome ตามธีม เพิ่ม icon ประจำ 8 รูปแบบ แสดง percentile ด้วยกลุ่มบนประเทศและแถบ 0–100 พร้อมรายละเอียด และตั้งความหมาย Yolk/ไข่แดงให้ตรงกับ confirmed-high Demand ทั้ง UI/Map ใช้ชื่อ “ทำเลจำลอง” โดยไม่เปลี่ยน boundary type/IDs/joins สูตร Tier และน้ำหนักยังใช้ v1.4

เริ่มจาก [START_HERE](START_HERE.md) → [Product statement](CityMETER_Yolk_Product_Statement_v1.5.md) → [Implementation plan](IMPLEMENTATION_PLAN_v1.5.md) → [task JSON](contracts/implementation-tasks.v1.5.json) Runtime commit/hash และสถานะเผยแพร่ให้ยึด [release manifest](contracts/release.v1.5.0.json) ไม่เดาจากชื่อ zip หรือข้อความรุ่นในหน้าเว็บ

## ทดลองอะไรได้

เปิด [web preview](https://montri-th.github.io/yolk/) หรือรัน `python3 -m http.server 8849 --bind 127.0.0.1` ที่ root แล้วเปิด `/prototype/` ลอง TH/EN, light/dark/system, country→location detail, criteria preview/apply (Tier, รูปแบบทำเล และน้ำหนัก), Supply editor/photo drafts, shortlist และ feed/leaderboard

พรีวิวใช้ข้อมูลทำเล/POI จำลองทั้งหมด การแก้ไขและสมาชิกเป็น local simulation ไม่มี server authentication, multiuser database, production notification delivery หรือ source import จริง ภาพสาขาตัวอย่างเป็น AI mockup และภาพที่เลือกเพิ่มเก็บเฉพาะ browser origin ผ่าน IndexedDB

แผนที่แสดงฉาก boundary/POI จำลองบน basemap จริง จุดฉากไม่เข้าคำนวณ Supply Simplified/Detailed ใช้ OpenStreetMap; Satellite ใช้ ESA WorldCover Sentinel-2 ปี2021 ความละเอียด10m ผ่าน Terrascope ต้องคง attribution และ vintage note ข้อมูลจังหวัดใช้เป็น display layer ตาม [source/licence](evidence/geography-source.md) ไม่ใช่การรับรองขอบเขต อปท. ปัจจุบัน

## Asset และ source contract

- [Asset index](ASSET_INDEX_v1.5.md), [runtime asset manifest](contracts/assets.v1.5.json), [DS manifest](contracts/ds-assets.v1.5.json) และ [DS integration](DS_ASSET_INTEGRATION.md) ระบุไฟล์ บทบาทและ hash ที่ต้องเชื่อมจริง
- สี/ฟอนต์ canonical LDS0.9.4 คง bytes เดิม Product CSS/JS และ [icon extension](contracts/icons.v1.5.json) มี provenance แยก ไม่อ้างว่าแก้ canonical DS
- Logo ใช้ภาพโปร่งใสเดิมในทุกธีม วางตรงบน sidebar จอใหญ่และในเมนูมือถือ พื้น chrome ใช้สีตามธีม ไม่มี card/frame/plate หรือแถบ beige บังคับในธีมมืด ไม่ recolour/crop/invert ภาพ ดู [web identity](contracts/web-identity.v1.5.json) สำหรับ favicon และภาพแชร์ ไม่มี motif ที่ต้องนำกลับไปติดตั้ง
- Full-resolution source logo ไม่รวมใน runtime; เก็บ lineage ใน [projection receipt](evidence/logo-web-projection-v12.json) และ DS receipt
- Production ต้องใช้ private SourceRelease ที่อนุมัติแล้ว, geometry/crosswalk/coverage ตรวจแล้ว และ server-side permissions ขอบเขตต้องเป็น Polygon/MultiPolygon จริง; bbox จัดกล้องอย่างเดียว `source` ไม่เท่ากับ `verified`

## เกณฑ์และการอัปเกรด

เกณฑ์ตั้งต้นอาคาร/กิจกรรมและ Supply เดิมยังอยู่ `maxDemandTier=3` รับ Tier 1–3 ผู้ใช้เลือกให้เข้มขึ้นได้ รายการที่ผ่านจึงเรียงด้วยน้ำหนัก 70:20:10 สำหรับ Demand / ช่องว่างสาขาเรา / ช่องว่างคู่แข่ง น้ำหนักไม่เปลี่ยนจำนวนผ่าน ดาวไม่บังคับ weighted order ข้อมูลขาดคงน้ำหนักเป็นช่วงคะแนนและไม่ถูกนับเป็นศูนย์ที่ยืนยันแล้ว

เกณฑ์เก่าที่ไม่ระบุ rankingMode จะใช้ legacy ต่อไป การเลือก weighted แล้วกดใช้กับทีมจึงสร้างการเปลี่ยนสูตรที่มองเห็นในประวัติ shortlist และข้อมูลที่ทีมบันทึกไม่ถูกลบ ดูสูตรและชื่อฟิลด์จริงใน [criteria contract](contracts/criteria.v1.4.json)

## Verification

**สถานะ `ready_with_open_manual_gate`** Source/VM/controller และไฟล์เผยแพร่ตรวจได้ด้วย scripts ใน [START_HERE](START_HERE.md) ส่วน browser visual/device QA ยังเปิดอยู่จาก automatic approval review ที่บล็อกขั้นตอนเดิมไว้ ผล hash หรือ Node VM ไม่ทดแทนการดูหน้าจอจริง

ต้องตรวจต่อบน actual build: TH/EN, light/dark/system, 320/390/768/1440px, 200% text zoom, keyboard/touch, map network errors, photo orientation/storage recovery และ font/logo/icon rendering, mobile menu/safe-area, percentile disclosure และ map-scope semantics แนบหลักฐานก่อนเปลี่ยน gate เป็น passed ไม่สร้าง screenshot หรือผลตรวจขึ้นเอง

GitHub Pages deploy `prototype/` จาก main ตาม workflow หลัง automated checks ผ่าน คง `noindex` สำหรับ illustrative preview ดู [release manifest](contracts/release.v1.5.0.json) สำหรับ identity ของ runtime และ [QA record](evidence/qa-v1.5.json) สำหรับขอบเขตหลักฐานเดิม

## เริ่มพัฒนาจริง

Task00 สำรวจระบบเดิม CityMETER และสร้าง path/command mapping, contracts, CI และ permission foundation ก่อน จากนั้น task01–02 ทำ private data gate และ geography งานที่เป็นอิสระใน [DAG](contracts/implementation-tasks.v1.5.json) จึงค่อยทำขนาน ทุกงานต้องส่ง changed files, tests, acceptance evidence และสิ่งที่ยังเปิดอยู่

Public CI ใช้ synthetic fixtures; backend commands ที่เสนอในแผนยังต้องสร้าง ไม่ publish ข้อมูลจริงเข้าชุดนี้ และไม่ตีความคะแนน/ดาวว่าเป็นยอดขายหรือความเป็นไปได้ของแปลงที่ดิน การคัดพื้นที่/corridor มาก่อนการศึกษารายแปลง ส่วน transaction/member calibration เป็น private track ภายหลัง
