# Asset index · Yolk 1.8.0

ใช้ไฟล์จริงจาก DS ตาม [integration](DS_ASSET_INTEGRATION.md) และ current sealed asset manifest ไม่สร้าง artwork/font/color ขึ้นแทน

| ส่วน | ตำแหน่ง / กติกา |
|---|---|
| Full LDS base | `reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md` |
| Location Intelligence Profile | `reference/lds-0.9.7/Location-Intelligence-Profile-for-LDS-v0.9.7.md` |
| Runtime fonts/tokens/LUT | `prototype/vendor/lds-0.9.7/` |
| Landometer official logo | `prototype/assets/landometer-logo-horizontal-v12-889.png`; unframed, original proportions |
| Yolk product mark | Existing `icons.js` Y + egg_alt O + lk; product mark, not a redraw of Landometer |
| Role icons | `prototype/assets/material-symbols-rounded-yolk-300-v1.8.0.woff2` and `contracts/icons.v1.8.0.json` |
| Brand square graphics | `prototype/assets/brands/` + `prototype/data/brand-logos.v1.7.json`; verifiedSquareGraphic, original bytes, name caption |
| Browser/social identity | `prototype/assets/identity/` favicon/manifest; retained approved `yolk-share-v1.7.png` |
| POI photos | `prototype/assets/demo-photos/`; mockups, not actual branch photos |
| Map/source adapters | `prototype/data/real/` compact public sources and provenance, no private acquisition logs |
| New experience modules | `prototype/simple-criteria.js/.css`, `supply-compare.js`, `supply-symbols.css` |

LDS base SHA256 `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96`; profile SHA256 `5d4856041709735d3a04d4a510a88b551df86c211fdcab8a0707e8fe7c9efc3b`

Material Symbols Rounded icon extension: 39 glyphs, 6,820 bytes, SHA256 `2998791392b42334dbff07b513d28b794462db6392885dfb0fd0968e90919187` New glyphs shield/arrow_forward supplement the retained37. Source/license/provenance belong to icons contract; extension is product-owned and is not declared a newly canonical LDS subset

โล่ = สาขาเรา, ดาบ = คู่แข่ง, neutral unresolved icon = รอตรวจ Icons use shared helper and approved categorical role tokens. Symbol identifies party; same-unit number/bar identifies quantity. Bars have a stated **local scale** within each location, not comparable length across all cards

Tier1 exact density.area LUT20–40 gradient, Tier2 #FFBC1F, Tier3 #F1F4EF same themes. Other quantitative maps use all41 exact LDS LUT entries. Selected fine interior stays unfilled; white boundaries/yellow hover preserve basemap. No opacity recoloring, logo frames or motifs

Do not package basemap tiles or signed/private media. Preserve attribution and provider data-age wording. Asset hash verification, rendered review and release proof are separate gates; current outcomes are in `contracts/release.v1.8.0.json`

## ผลตรวจปัจจุบัน

Local QA ผ่าน 21 suites / 354 checks และ bounded native browser 11 checks มีภาพจริง 5 ภาพ ไม่ใช่ full language/theme matrix, physical-device หรือ backend pass Provider/live-byte proof ยังรอ external attestation อ่าน [release contract](contracts/release.v1.8.0.json) และ [native receipt](evidence/browser-v1.8.0/native-browser-review.json)
