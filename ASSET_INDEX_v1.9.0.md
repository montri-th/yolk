# Asset index · Yolk 1.9.0

ใช้ asset จริงจาก LDS 0.9.7 ตาม [DS integration](DS_ASSET_INTEGRATION.md). Runtime และเอกสารรุ่นนี้เพิ่มการเลือก Strategy หลังคัด Demand ไม่เปลี่ยนโลโก้ ฟอนต์ สเกลสี หรือสร้าง artwork ของ Landometer ขึ้นใหม่

| ส่วน | ไฟล์และกติกา |
|---|---|
| Full LDS base | `reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md` |
| Location Intelligence Profile | `reference/lds-0.9.7/Location-Intelligence-Profile-for-LDS-v0.9.7.md` |
| ฟอนต์, tokens, สเกลสี | `prototype/vendor/lds-0.9.7/`; ใช้ไฟล์และ LUT ต้นฉบับ |
| โลโก้ Landometer | `prototype/assets/landometer-logo-horizontal-v12-889.png`; ไม่มีกรอบ คงสัดส่วน |
| ชื่อผลิตภัณฑ์ Yolk | `prototype/icons.js`; Y + egg_alt O + lk เป็น product mark เดิม |
| ไอคอน | `prototype/assets/material-symbols-rounded-yolk-300-v1.8.0.woff2` และ `contracts/icons.v1.8.0.json`; ใช้ subset เดิม 39 glyphs |
| โลโก้แบรนด์แบบ square | `prototype/assets/brands/` และ `prototype/data/brand-logos.v1.7.json`; คง artwork จริง มีชื่อกำกับ |
| Favicon และภาพแชร์ | `prototype/assets/identity/`; ภาพ `yolk-share-v1.7.png` เดิม 1200×630 |
| ภาพสาขาใน demo | `prototype/assets/demo-photos/`; ระบุเป็น mockup ไม่ใช่ภาพสาขาจริง |
| Metric และพิกัดต้นทาง | `prototype/data/real/`; public compact projections และ provenance ไม่รวม raw acquisition ส่วนตัว |
| Brand/segment profiles | `prototype/data/brand-strategy-profiles.v1.9.0.json`; source IDs, ข้อเสนอแบรนด์, ข้อจำกัด และ preset ที่ปรับได้ |
| Demand factors | `prototype/demand-factors.js`; ไม่เกิน 3 กลุ่ม และไม่เกิน 3 ตัววัดต่อเงื่อนไขร่วม |
| Strategy engine / UI | `prototype/opportunity-engine.js`, `prototype/strategy-ui.js`, `prototype/strategy-ui.css` |
| Supply: สีพื้นที่ / จุดสาขา | `prototype/workspace-map.js/.css`; กลุ่มพิกัดเป็นการจัดภาพบนหน้าจอ ไม่ใช่หลักฐานของย่านที่ดึงลูกค้า |
| ข้อตกลง Strategy | `contracts/opportunity-strategies.v1.9.0.json` |
| Blueprint สำหรับ dev | `contracts/full-product.v1.9.0.json` และเอกสารเต็มรุ่น 1.9.0 |

LDS base SHA-256: `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96`

Location Intelligence Profile SHA-256: `5d4856041709735d3a04d4a510a88b551df86c211fdcab8a0707e8fe7c9efc3b`

Material Symbols Rounded product extension: 39 glyphs, 6,820 bytes, SHA-256 `2998791392b42334dbff07b513d28b794462db6392885dfb0fd0968e90919187`. แกน FILL=0, wght=300, GRAD=0, opsz=24. เป็นส่วนขยายของผลิตภัณฑ์ที่มี provenance/license ไม่ใช่การเปลี่ยนไฟล์ canonical ของ DS

## การสื่อความหมาย

โล่แสดงสาขาเรา ดาบแสดงคู่แข่ง และไอคอนตรวจสอบแสดงรายการรอตรวจ จำนวนและหน่วยเป็นสิ่งบอกขนาด Supply; ไอคอนไม่ใช่หลักฐานของยอดขาย ความจุ หรือกำลังแข่งขัน

Tier 1 ใช้ gradient จาก density.area LUT20–40 ต้นฉบับ; Tier 2 ใช้สีเหลือง Yolk `#FFBC1F`; Tier 3 ใช้ไข่ขาว `#F1F4EF`. สเกลเชิงปริมาณอื่นใช้ LUT41 เดิมครบทุกค่าและทิศเดียวกันทั้ง light/dark

Strategy map ใช้สี Demand ของพื้นที่ที่เป็น **ทำเลควรสำรวจ** ส่วนพื้นที่อื่นภายในโปร่งใส ไม่เพิ่มสเกล “โอกาสขายดี” ที่ยังไม่มีข้อมูลรองรับ. จำนวน Demand ที่ผ่านและจำนวน Strategy candidates แยกกัน

Selected fine area และมุมมองจุดสาขาภายในโปร่งใส ใช้เส้นขาวตามลำดับขอบเขตและกรอบ hover เหลือง Yolk. ไม่มี motif, กรอบโลโก้, bracket หรือแถบสีตกแต่งด้านซ้าย

## การตรวจและ handoff

เริ่มจาก [เอกสารเต็ม](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.0.md), [release contract](contracts/release.v1.9.0.json) และ [handoff contract](contracts/handoff.v1.9.0.json). ตัวเลข QA ในสัญญารุ่นนี้ต้องมาจาก receipt ปัจจุบันเท่านั้น ไม่ยกผลของ 1.8.0 มาเป็นผลตรวจ 1.9.0

`contracts/assets.v1.9.0.json`, public manifest และ checksum สร้างหลัง final QA เท่านั้น ชุดสำหรับ dev ใช้ allowlist ที่ระบุ path ชัดเจน ห้ามบรรจุ basemap tiles, signed/private media, raw archives หรือข้อมูลลูกค้าส่วนตัว

Package hashes, rendered review, provider deployment และ live byte verification เป็นหลักฐานคนละส่วน สถานะ publication/backend/physical devices ในสัญญาต้องตรงกับสิ่งที่ตรวจจริง
