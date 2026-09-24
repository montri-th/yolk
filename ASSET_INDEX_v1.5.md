---
document_id: yolk.asset_index
product_version: "1.5"
handoff_patch: "1.5.0"
runtime_assets: contracts/assets.v1.5.json
ds_assets: contracts/ds-assets.v1.5.json
icon_extension: contracts/icons.v1.5.json
release: contracts/release.v1.5.0.json
motifs_enabled: false
---

# Asset index — Yolk v1.5 / handoff 1.5.0

ใช้ [runtime asset manifest](contracts/assets.v1.5.json) เพื่อตรวจไฟล์ทั้งหมด และ [DS manifest](contracts/ds-assets.v1.5.json) เพื่อรู้ว่าไฟล์ใดมาจาก **Landometer DS 0.9.4** ไฟล์ canonical ต้องคง bytes/hash เดิม ส่วน product adapters และ icon subset มี provenance แยก ห้ามถือว่าทุกไฟล์ใน `prototype/assets/` เป็น canonical DS

## แผนที่ไฟล์สำหรับ dev

| กลุ่ม | ไฟล์/ที่อยู่ | วิธีใช้ |
|---|---|---|
| Runtime entry | [prototype/index.html](prototype/index.html) | จุดอ้างอิง load order และ relative URLs |
| สี canonical DS | [color-srgb-07.production.css](prototype/assets/color-srgb-07.production.css) | โหลดก่อน product styles; ใช้ semantic tokens |
| ฟอนต์ | [fonts.css](prototype/assets/fonts.css) และ WOFF2 ที่ระบุใน DS manifest | Loader เป็น Yolk adapter; font bytes และ licence ต้องไปด้วยกัน |
| Analytical scales | [yolk-analytical.css](prototype/assets/yolk-analytical.css) | Product adapter ใช้สีทอง DS สำหรับ Yolk ที่ยืนยัน Demand สูง; 3 ระดับ map percentile แยกจาก priority score |
| Logo ทุกธีม | [landometer-logo-horizontal-v12-889.png](prototype/assets/landometer-logo-horizontal-v12-889.png) | ภาพโปร่งใสตาม receipt วางตรงบน desktop sidebar / mobile menu; คง bytes และสัดส่วนทุกธีม |
| Web identity | [identity.css](prototype/identity.css), [identity contract](contracts/web-identity.v1.5.json) | Logo จริงทุกธีม ไม่มีกรอบหรือแผ่นรอง; shell ใช้ token ตามธีม ไม่บังคับพื้น beige ขนาดใหญ่ใน dark mode |
| Favicon / app icons | [identity assets](prototype/assets/identity/site.webmanifest) | ไฟล์ portfolio icon ของ LDS 0.9.4 คง bytes เดิม ดู hash และขนาดใน identity contract |
| ภาพปกแชร์ | [yolk-share-v1.4.png](prototype/assets/identity/yolk-share-v1.4.png) | Product image 1200×630 พร้อม logo/tagline; ใช้ไฟล์เดิม v1.4 เพราะตัวตนผลิตภัณฑ์เดิม ไม่ใช่ภาพ runtime เก่า; public metadata ไม่รวมข้อมูล workspace |
| Decision icons | [icons.js](prototype/icons.js), [icons.css](prototype/icons.css), [icon contract](contracts/icons.v1.5.json) | Material Symbols Rounded subset เพิ่มเฉพาะผลิตภัณฑ์; text labels ยังต้องอยู่ |
| Yolk / percentile / map display | [yolk-focus.css](prototype/yolk-focus.css), [decision-ui.js](prototype/decision-ui.js) | สีทองและ label ไข่แดง, แถบ percentile พร้อมรายละเอียด; เป็น product adapters ไม่แก้สูตรเกณฑ์ |
| Theme/readability | [theme.js](prototype/theme.js), [experience.css](prototype/experience.css) | Controller ก่อน body paint; experience.css เป็น product theme adapter ท้ายชุด styles |
| Country overview | [province geometry](prototype/data/thailand-provinces.json), [source/licence](evidence/geography-source.md) | จังหวัดเป็น display/drill-down layer ไม่ใช่ขอบเขต อปท. ปัจจุบัน |
| Location map | [location-map.js](prototype/location-map.js), [location-map.css](prototype/location-map.css), [demo context](prototype/data/demo-map-context.js) | Public boundary/POI เป็นฉากจำลอง; geometry จริงต้องผ่าน adapter/coverage gate |
| Map library | [Leaflet 1.9.4](prototype/vendor/leaflet-1.9.4/leaflet.js), [licence](prototype/vendor/leaflet-1.9.4/LICENSE) | Vendor files/relative image paths ต้องครบ |
| Branch photos | [mockup manifest](prototype/assets/demo-photos/manifest.json), [mockup README](prototype/assets/demo-photos/README.md) | 5 ภาพจำลองที่สร้างด้วย AI มีป้าย “ภาพจำลอง” เสมอ |
| Photo workflow | [branch-photos.js](prototype/branch-photos.js), [branch-photos.css](prototype/branch-photos.css) | Preview เก็บรูปใน IndexedDB; production ต้องมี private media service |
| Demo data | [demo-data.json](prototype/data/demo-data.json) | Synthetic fixtures เท่านั้น ไม่ใช่ข้อมูลปฏิบัติการของลูกค้า |

### Logo และ icon ที่ต้องรักษา

- ทุกธีม: ใช้ภาพ logo เดิมโดยตรงบน sidebar จอใหญ่หรือในเมนูมือถือ **ไม่มีกรอบ card badge หรือแผ่นรองเฉพาะโลโก้** ไม่ crop/recolour/filter ภาพ พื้น shell และเนื้อหาเปลี่ยนตามธีม ตรวจ contrast ด้วยภาพจริง; ถ้าต้องใช้ reverse variant ต้องได้ asset อนุมัติก่อน
- Favicon ใช้ portfolio icon ที่อนุมัติใน LDS 0.9.4 แบบไม่แก้ bytes ภาพแชร์เป็น Yolk product asset ที่มี receipt ของตัวเอง ไม่อ้างว่าเป็น canonical corporate social mark ใหม่ ดู [web identity contract](contracts/web-identity.v1.5.json)
- **ไม่มี motif ในแอปหรือชุด runtime assets ของรุ่นนี้** Receipt เก่าอาจกล่าวถึง motif เพื่อเก็บประวัติ แต่ไม่ใช่รายการที่ต้องนำกลับมา ship
- Icon ส่วนขยายใช้ Material Symbols Rounded: FILL0 / wght300 / GRAD0 / opsz24 พินไฟล์/font/licence/hash แยกใน [icons.v1.5.json](contracts/icons.v1.5.json) เป็น Yolk extension ไม่ใช่การแก้ canonical DS package
- ใช้ icon คู่ข้อความกับเกณฑ์ เล็งทำเล ตรวจข้อมูล ชั้นแผนที่ บันทึก และรูปสาขา เพิ่ม mapping คงที่สำหรับ8รูปแบบและ `egg_alt` สำหรับ Yolk; Glyph เป็น `aria-hidden`; text/accessible name อธิบาย action ได้แม้ font โหลดไม่ได้ ไอคอนไม่รับรองว่า data verified

## แผนที่และรูปไม่ใช่ DS assets

Simplified และ Detailed ใช้ OpenStreetMap ชุดเดียวกัน โดย Simplified ลดสีด้วย CSS Satellite ใช้ ESA WorldCover Sentinel-2 annual composite **ปี2021 ความละเอียด10m** ผ่าน Terrascope สำหรับบริบทพื้นที่ มี attribution และ vintage note เสมอ ไม่มี tile/satellite imagery รวมใน package และไม่ prefetch/download offline โดยอัตโนมัติ

ภาพสาขา5มุมคือ frontage, entrance, pumps, shop และ forecourt เป็น mockup ไม่ใช่รูปสถานีจริง Public map overlay เป็น synthetic และไม่เข้าคำนวณ Supply Basemap เป็นภูมิศาสตร์จริงจึงต้องแยกคำอธิบายสองส่วนนี้ให้เห็น

## วิธีต่อ assets ในระบบจริง

1. อ่าน [DS integration](DS_ASSET_INTEGRATION.md), [asset JSON](contracts/assets.v1.5.json) และ [DS JSON](contracts/ds-assets.v1.5.json) ก่อนเลือกไฟล์
2. คง relative layout หรือ remap URL ทั้ง graph ร่วมกัน อย่า copy HTML อย่างเดียวหรืออ้างไฟล์จากเครื่อง dev
3. ตรวจ SHA-256/licences และบทบาท asset ก่อน build/หลัง build แยก canonical DS, product adapters, vendor, demo media และ fixture data
4. อ่าน [release manifest](contracts/release.v1.5.0.json) เพื่อจับคู่ runtime version กับ handoff ไม่อ้าง `latest` ที่เปลี่ยนได้
5. ตรวจ font loading, logo surface, icon fallback, TH/EN และ responsive ใน browser จริง Gate นี้ยัง open; hash ผ่านไม่รับรองการแสดงผล

```sh
python3 scripts/verify-public-release.py
node scripts/check-brand-identity.cjs
node scripts/check-icons.cjs
node scripts/check-web-identity.cjs
```

Full-resolution source logo ไม่ได้รวมใน runtime ใช้ [projection receipt](evidence/logo-web-projection-v12.json) และ [DS receipt](evidence/ds-runtime-assets-receipt.json) สำหรับ provenance ห้ามแทนไฟล์ด้วยภาพที่ redraw หรือ crop มาเอง
