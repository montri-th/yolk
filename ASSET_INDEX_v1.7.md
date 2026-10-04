# Assets สำหรับ Yolk 1.7.0

เริ่มจาก [รายการพร้อมขนาดและ SHA-256](contracts/assets.v1.7.json) และ [DS integration](DS_ASSET_INTEGRATION.md) ชุด 1.6 เป็นประวัติของรุ่นนั้น ไม่ใช่รายการปัจจุบัน

| ส่วน | ตำแหน่ง / วิธีใช้ |
|---|---|
| LDS 0.9.7 | `prototype/vendor/lds-0.9.7/` — ฟอนต์ สี และ Location profile ตรง release; authority ฉบับเต็มใน `reference/lds-0.9.7/` |
| Landometer | `prototype/assets/landometer-logo-horizontal-v12-889.png` — วางตรงบนพื้น ไม่มีกรอบหรือแผ่นรอง |
| Yolk | native `egg_alt` ใน product icon extension — ใช้แทน o ตามรูปทรงเดิม ไม่ดัดแปลงโลโก้ Landometer |
| ตราแบรนด์ | `prototype/assets/brands/` + [manifest](prototype/data/brand-logos.v1.7.json) — แสดงเฉพาะ graphic ที่ `verifiedSquareGraphic=true`, ชื่ออยู่ข้างๆ เสมอ ใช้ original bytes/variant ตามธีม ห้ามตัด wordmark ให้เป็นตราสี่เหลี่ยม |
| Browser / แชร์ | `prototype/assets/identity/icon-portfolio-*`, `site.webmanifest`, `yolk-share-v1.7.png` |
| แผนที่ | `prototype/vendor/leaflet-1.9.4/`, district polygons, `hierarchy-index.json` และ fine polygons 77 จังหวัดใน `prototype/data/real/` |
| รูปสาขา | `prototype/assets/demo-photos/` — mockup 5 รูป ไม่ใช่รูปสาขาจริง |

UI ใช้กล่องโลโก้ 44×44 px แบบ contain คงสัดส่วนต้นฉบับ ไม่มี crop/stretch/recolor/กรอบใหม่ ตราหน้าร้านที่มีตัวอักษรเป็นส่วนหนึ่งของ graphic ใช้ได้ ตรวจไฟล์และความชัดทั้งสองธีม เมื่อไม่มีต้นฉบับเหมาะสมใช้ไอคอนกลางกับชื่อแทน

สีแผนที่ `li.demand`: Tier 3 **#F1F5E5**, Tier 2 **#60C9AD**, Tier 1 **#25659A** เหมือนกันสองธีม เมื่อเลือกทำเล ภายในโปร่งใส ใช้เส้นขอบ/ข้อความและ O/C/U แทนการลงสีทึบ

โหลดแผนที่ฐานจากผู้ให้บริการที่ระบุใน [map contract](contracts/workspace-map.v1.7.json) พร้อม attribution; ไม่รวม tile cache ใน handoff และไม่อ้างภาพดาวเทียมปี 2021 เป็นภาพสด
