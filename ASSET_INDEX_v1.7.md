# Assets สำหรับ Yolk 1.7.3

เริ่มจาก รายการ `contracts/assets.v1.7.3.json` จะสร้างหลัง final QA/seal และ [DS integration](DS_ASSET_INTEGRATION.md) ชุด 1.6 และ1.7.1 เป็นประวัติของรุ่นนั้น ไม่ใช่รายการปัจจุบัน

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

สีหมวด Tier ที่เจ้าของเลือก: Tier 3 **#F1F4EF**, Tier 2 **#FFBC1F**, Tier 1 **gradient จาก native density.area LUT20–40** เหมือนกันสองธีม เมื่อเลือกทำเล ภายในโปร่งใส ใช้เส้นขอบ/ข้อความและ O/C/U แทนการลงสีทึบ

โหลดแผนที่ฐานจากผู้ให้บริการที่ระบุใน [map contract](contracts/workspace-map.v1.7.json) พร้อม attribution; ไม่รวม tile cache ใน handoff และไม่อ้างภาพดาวเทียมปี 2021 เป็นภาพสด

## ประวัติส่วนเพิ่มใน 1.7.2

Analysismodules `prototype/map-analysis.js`, `analysis-ui.js/.css` และfivecompactnativeDistrictfilesใน`prototype/data/real/` ใช้publicprovenanceURL/date/hash; ไม่มีrawacquisition/logs Native5classes count/density.area/density.capita/builtพร้อมหน่วย/denominatorและreuseตรงextension ไม่เปลี่ยนDSassets Socialimage `yolk-share-v1.7.png` ยังคงapproved1.7familyเดิม ไม่มีการอ้างrenderใหม่รุ่น1.7.2 อ่าน [map-analysis contract](contracts/map-analysis.v1.7.2.json)

## เพิ่มใน 1.7.3

Reviewmodule location-review.js/.css, categoricaltierhelper yolk-tier-style.js/.css และ native41LUTrawmaps ตาม contracts/location-review.v1.7.3.json สูตร/sourcecohortไม่เปลี่ยน โหลดCSSใหม่หลังyolk-focus.css และhelperJSก่อนmap-analysis/workspace-map Gradientเป็นownercategoryappearance ไม่ใช่atmosphereหรือค่าที่ต่างกันภายในpolygon อ่าน [reviewguide](docs/LOCATION_REVIEW_v1.7.3.md) และ currentmanifestหลังfinalsealเท่านั้น

## Final interaction refinements - 1.7.3

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Current automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Provider/live-byte evidence remains pending.
