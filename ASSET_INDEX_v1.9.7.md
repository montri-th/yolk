# Asset index · Yolk 1.9.7

ใช้ asset จริงจาก LDS 0.9.7 ตาม [DS integration](DS_ASSET_INTEGRATION.md). รุ่น 1.9.7 ปรับ brand-related treemap colors, map envelope/resize/paired controls และ comma-separated numbers; mobile flow 1.9.5/desktop map-space 1.9.4 คงเดิม หน้าโอกาสขยายและ guide ทั้ง 8 วิธีคงรุ่น 1.9.3 ส่วนสาม brand graphics และ Supply chip fonts ที่แก้ใน 1.9.2 คงไว้ โลโก้ Landometer, verified fonts, original LUT bytes และ retained interaction ไม่เปลี่ยน

| ส่วน | ไฟล์และกติกา |
|---|---|
| Full LDS base | `reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md` |
| Location Intelligence Profile | `reference/lds-0.9.7/Location-Intelligence-Profile-for-LDS-v0.9.7.md` |
| ฟอนต์, tokens, สเกลสี | `prototype/vendor/lds-0.9.7/`; ใช้ไฟล์และ LUT ต้นฉบับ |
| โลโก้ Landometer | `prototype/assets/landometer-logo-horizontal-v12-889.png`; ไม่มีกรอบ คงสัดส่วน |
| ชื่อผลิตภัณฑ์ Yolk | `prototype/icons.js`; Y + egg_alt O + lk เป็น product mark เดิม |
| ไอคอน | `prototype/assets/material-symbols-rounded-yolk-300-v1.8.0.woff2` และ `contracts/icons.v1.8.0.json`; ใช้ subset เดิม 39 glyphs |
| โลโก้แบรนด์ในช่อง compact | `prototype/assets/brands/` และ `prototype/data/brand-logos.v1.7.json`; คง artwork จริง มีชื่อกำกับ |
| Favicon และภาพแชร์ | `prototype/assets/identity/`; ภาพ `yolk-share-v1.7.png` เดิม 1200×630 |
| ภาพสาขาใน demo | `prototype/assets/demo-photos/`; ระบุเป็น mockup ไม่ใช่ภาพสาขาจริง |
| Metric และพิกัดต้นทาง | `prototype/data/real/`; public compact projections และ provenance ไม่รวม raw acquisition ส่วนตัว |
| Brand/segment profiles | `prototype/data/brand-strategy-profiles.v1.9.0.json`; source IDs, ข้อเสนอแบรนด์, ข้อจำกัด และ preset ที่ปรับได้ |
| Demand factors | `prototype/demand-factors.js`; ไม่เกิน 3 กลุ่ม และไม่เกิน 3 ตัววัดต่อเงื่อนไขร่วม |
| Strategy guide | `prototype/data/strategy-guide.v1.9.3.json`; 8 วิธีไทย/อังกฤษ ตัวอย่างสมมติและภาพอธิบายแนวคิด ไม่เปลี่ยนผลคำนวณ |
| Strategy engine / UI | `prototype/opportunity-engine.js`, `prototype/strategy-ui.js`, `prototype/strategy-ui.css` |
| Supply: สีพื้นที่ / จุดสาขา | `prototype/workspace-map.js/.css`; กลุ่มพิกัดเป็นการจัดภาพบนหน้าจอ ไม่ใช่หลักฐานของย่านที่ดึงลูกค้า |
| Supply: count/share/treemap | `prototype/supply-treemap.js/.css`, `prototype/map-analysis.js`; [Supply inventory contract](contracts/supply-inventory.v1.9.7.json) กำหนด direct vector, ratios, coverage และ bounds |
| ข้อตกลง Strategy | `contracts/opportunity-strategies.v1.9.0.json` |
| Blueprint สำหรับ dev | `contracts/full-product.v1.9.7.json` และเอกสารเต็มรุ่น 1.9.7 |

LDS base SHA-256: `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96`

Location Intelligence Profile SHA-256: `5d4856041709735d3a04d4a510a88b551df86c211fdcab8a0707e8fe7c9efc3b`

Material Symbols Rounded product extension: 39 glyphs, 6,820 bytes, SHA-256 `2998791392b42334dbff07b513d28b794462db6392885dfb0fd0968e90919187`. แกน FILL=0, wght=300, GRAD=0, opsz=24. เป็นส่วนขยายของผลิตภัณฑ์ที่มี provenance/license ไม่ใช่การเปลี่ยนไฟล์ canonical ของ DS

## การสื่อความหมาย

โล่แสดงสาขาเรา ดาบแสดงคู่แข่ง และไอคอนตรวจสอบแสดงรายการรอตรวจ จำนวนและหน่วยเป็นสิ่งบอกขนาด Supply; ไอคอนไม่ใช่หลักฐานของยอดขาย ความจุ หรือกำลังแข่งขัน

Tier 1 ใช้ gradient จาก density.area LUT20–40 ต้นฉบับ; Tier 2 ใช้สีเหลือง Yolk `#FFBC1F`; Tier 3 ใช้ไข่ขาว `#F1F4EF`. สเกลเชิงปริมาณอื่นใช้ LUT41 เดิมครบทุกค่าและทิศเดียวกันทั้ง light/dark

Strategy map ใช้สี Demand ของพื้นที่ที่เป็น **ทำเลควรสำรวจ** ส่วนพื้นที่อื่นภายในโปร่งใส ไม่เพิ่มสเกล “โอกาสขายดี” ที่ยังไม่มีข้อมูลรองรับ. จำนวน Demand ที่ผ่านและจำนวน Strategy candidates แยกกัน

Selected fine area และมุมมองจุดสาขาภายในโปร่งใส ใช้เส้นขาวตามลำดับขอบเขตและกรอบ hover เหลือง Yolk. ไม่มี motif, กรอบโลโก้, bracket หรือแถบสีตกแต่งด้านซ้าย

## การตรวจและ handoff

เริ่มจาก [เอกสารเต็ม](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.7.md), [release contract](contracts/release.v1.9.7.json) และ [handoff contract](contracts/handoff.v1.9.7.json). ตัวเลข QA ในสัญญารุ่นนี้ต้องมาจาก receipt ปัจจุบันเท่านั้น ไม่ยกผลรุ่นก่อนมาเป็นผลตรวจ 1.9.7

`contracts/assets.v1.9.7.json`, public manifest และ checksum สร้างหลัง final QA เท่านั้น ชุดสำหรับ dev ใช้ allowlist ที่ระบุ path ชัดเจน ห้ามบรรจุ basemap tiles, signed/private media, raw archives หรือข้อมูลลูกค้าส่วนตัว

Package hashes, rendered review, provider deployment และ live byte verification เป็นหลักฐานคนละส่วน สถานะ publication/backend/physical devices ในสัญญาต้องตรงกับสิ่งที่ตรวจจริง

## Interaction 1.9.1

ใช้ [interaction contract](contracts/interaction-guidance.v1.9.1.json) สำหรับ single-owner tooltip, quiet point boundaries และ functional action cue. Motion ใช้ surrogate แบบ pointer-inert/aria-hidden ไม่ขยับ identity, ข้อมูล, geometry หรือ basemap และมี final-state fallback เมื่อ reduced motion/interruption

## Brand artwork + Supply chips1.9.2

Exact original artwork, paths, hashes และ bindings ระบุใน [new extension](contracts/brand-identity-ui.v1.9.2.json) หลัง assets นิ่งแล้ว ใช้ icon font เฉพาะ glyph และ caption font ตาม LDS; no new identity artwork or hidden numerical changes

### ไฟล์ภาพแบรนด์ที่เพิ่มจริง

ไฟล์ต้นฉบับทั้งสามไม่ใช่ภาพ square: square เป็นเพียงช่องวางโลโก้ ใช้ contain คงสัดส่วนและ wordmark ตามภาพที่เจ้าของส่ง

| แบรนด์ | Original PNG | ขนาด | Bytes | SHA-256 |
|---|---|---:|---:|---|
| Villa Market | [grocery-grocery-brand-VILLA_MARKET-owner-c29c85f0b2.png](prototype/assets/brands/grocery-grocery-brand-VILLA_MARKET-owner-c29c85f0b2.png) | 3840×1920 | 340,418 | `c29c85f0b251ddf12f57a59d283cab05a055ddeb35ccfa61b77458d0aa4eac8a` |
| Lawson108 | [grocery-grocery-brand-LAWSON108-owner-0bcdc9944f.png](prototype/assets/brands/grocery-grocery-brand-LAWSON108-owner-0bcdc9944f.png) | 227×300 | 45,024 | `0bcdc9944f0543ae6a04627892080615d510b1db46347b140e4c7890347a587b` |
| Tops | [grocery-grocery-brand-TOPS-owner-dccbc2bbd0.png](prototype/assets/brands/grocery-grocery-brand-TOPS-owner-dccbc2bbd0.png) | 800×316 | 49,990 | `dccbc2bbd05952420a2e782ef1dc2ae7ce6c5d8fffb70eb2772055df7e213458` |

Registry คือ `prototype/data/brand-logos.v1.7.json` โหลดโดย `prototype/bootstrap.js` ด้วย revision `1.9.2-owner2` ดู [owner artwork receipt](evidence/owner-supplied-brand-artwork.v1.9.2.json). ไม่มี crop, redraw, recolor หรือ backing field ใหม่; byte pass ไม่แทน native review

## Theme fallback ที่ใช้จริง

Villa Market ใช้ PNG ต้นฉบับใน light theme ส่วน dark ใช้ไอคอนร้านค้ากลางพร้อมชื่อ Villa Market ที่อ่านชัด เพราะภาพสีม่วงเดิมอ่านไม่ชัดบนพื้นเข้ม การแสดงต้นฉบับบน dark ไม่ผ่านและไม่ถูกอ้างว่า PASS ไม่เพิ่มกรอบหรือพื้นรองโลโก้ ไม่เปลี่ยนสี/crop และไม่กลับไปใช้เครื่องหมายรถเข็นเก่า Lawson108 และ Tops ใช้ PNG ต้นฉบับทั้งสอง theme การตรวจ fallback ผ่านแบบจำกัดตาม native receipt รุ่น 1.9.2 ที่คงไว้ ไม่ใช่การเพิ่ม coverage ทุกแบรนด์ใน 1.9.3

## Expansion experience 1.9.3

ใช้ [experience contract](contracts/expansion-experience.v1.9.3.json) และ [คู่มือ](docs/EXPANSION_OPPORTUNITIES_v1.9.3.md). Source data, DS fonts/icons/artwork/LUT คงเดิม Guide ใช้ glyph subset เดิมและ narrative registry ที่อ่านได้ทั้งคนและเครื่อง Brand evidence รุ่น 1.9.2 เป็น reference ของ identity ไม่ใช่การตรวจ UX รุ่น 1.9.3

ค่าปัจจุบันใช้ [map-readability1.9.6](contracts/map-readability.v1.9.6.json): คง white widths เดิมและ hierarchy โดย neutral stroke-only keyline `--ldm-map-marker-halo-dark #101318` กว้างกว่า foreground 0.80 px จับคู่เฉพาะ source outlines ที่มองเห็น ทั้ง choropleth และเส้นบริบท POI/ทำเลที่เลือก ไม่มี child mesh/fill/filter เพิ่ม เลิก parent-only halo/drop-shadow1.9.3. Light canvas ใช้ `surface.soft.light #E5E9E6`; panel ใช้ `surface.alt.light #EEF1EE` ข้อมูลสีบนแผนที่คงค่าเดิมทั้งหมด

Current bounded1.9.7 QA/native passed; retained 1.9.6 evidence remains historical only

Retained [LDS package receipt](evidence/lds-package-verification.v1.9.3.json) คงเป็น package-only reference ไม่ใช่ current1.9.7 artifact หรือ account/team certificate

## Mobile document flow 1.9.5

[Mobile-flow contract](contracts/mobile-flow.v1.9.5.json) เพิ่มข้อกำหนดเฉพาะ layout จอแคบ ไม่มี asset ใหม่หรือ analytical-color migration. Current 1.9.7 QA/native/publication/live pending

Fresh [package-only projection](evidence/lds-package-verification.v1.9.7.json): 9,768 passes, 0 failures, 65 advisory warnings. Not rendered artifact/account/team certification. Original DS/identity/LUT bytes remain unchanged.

## Supply inventory display 1.9.6

Our branch share ใช้ LUT ต้นฉบับ `li.market_share` 41 ค่า fixed0–100% จาก `reference/lds-0.9.7/location-intelligence-0.9.7.json` SHA-256 `2940c5aac3eef1242e501492b5315048c6b5f138496e8139cc116bfbba945e57`; scaleVersion `e18af290eee81d42e63269c261628f0fa108fcd48e5cbff02b407af95a712e51`. เป็น outlet-inventory proxy ที่ตั้งชื่อใหม่ ไม่อ้าง sales share ใช้สีต้นฉบับเดียวกันทั้ง light/dark; ไม่ percentile-stretch share

Treemap ใช้ exact approved categorical DS swatches near verified original logo primary colors, stable identity mapping ตาม current visual-refinement contract, separator≥1px และชื่อ/จำนวนที่อ่านได้ ใช้ observed counts เท่านั้น เก็บ Other พร้อมรายชื่อ ไม่ plot residual/upper bounds รูปแบรนด์เดิมคงสัดส่วนและ bytes; ไม่มีการสร้างรูปใหม่

Current bounded1.9.7 treemap/refinement QA/native passed; actual current native snapshots and suites required before release

## Map readability + Demand/Opportunity identity 1.9.6

[Current contract](contracts/map-readability.v1.9.6.json) เพิ่ม neutral boundary underlay และ semantic wrapper ของ approved egg_alt graphic เดิม ไม่มี crop/recolor/redraw/font ใหม่; คง caption/data fill/analytics. Retained boundary/egg behavior1.9.6; current1.9.7 QA/native/publication/live pending

## Visual refinement 1.9.7

[Current contract](contracts/visual-refinement.v1.9.7.json) binds exact brand swatches, near-Thailand display envelope, settled-host resize, four labeled icon buttons/two pairs, and comma grouping. No logo recolor/new artwork/source/criteria migration. Current runtime values and bounded1.9.7 QA/native bound to receipts.
