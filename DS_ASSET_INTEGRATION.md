# Asset integration — LDS 0.9.7 + Yolk เดิม

รุ่นนี้ย้าย DS โดยคง UI โลโก้และไอคอน Yolk เดิมตามคำขอ ผู้พัฒนาต้องเชื่อม assets ที่ระบุใน [machine manifest](contracts/ds-assets.v1.6.json) ไม่วาดโลโก้ใหม่หรือใช้สี/ฟอนต์ที่เดาเอง

| บทบาท | ไฟล์/กติกา |
|---|---|
| ฐานเต็ม | `reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md` SHA d3085cbc…432d96 |
| Location profile | `reference/lds-0.9.7/Location-Intelligence-Profile-for-LDS-v0.9.7.md` SHA5d485604…c9efc3b |
| Foundation + analytical colours | `prototype/vendor/lds-0.9.7/color-srgb-10.production.css` และ Location projection |
| ฟอนต์ | `prototype/vendor/lds-0.9.7/fonts.css` + WOFF2/ใบอนุญาต; ใช้ตาม heading/body/mono roles |
| โลโก้ UI | source asset ที่อนุมัติไว้เดิม `assets/landometer-logo-horizontal-v12-889.png`; วางตรงบน sidebar/menu ไม่มี frame/card/backing plate; ธีมมืดเติม wordmark ผ่าน native alpha ด้วย foundation text-primary (`var(--ink)`) ตาม LOGO-01 โดยไม่แตะสัญลักษณ์สี |
| ไอคอน | Material Symbols Rounded FILL0/wght300/GRAD0/opsz; ส่วนต่อขยาย Yolk37glyph เดิม SHA c5b7e050…1aedd พร้อม licence ไม่เรียกว่าชุด canonical ใหม่ |
| Pattern mapping | Crowded=groups, FOMO=flag, Our Farm=potted_plant, Pioneer=explore, Quiet=bedtime, Their War=swords, Our Island=beach_access, Winter War=ac_unit |
| Yolk | egg_alt + ชื่อ “ไข่แดง” และข้อความอธิบาย; icon/สีไม่รับรองผลธุรกิจ |
| Choropleth | heat3class ตาม DS: #FFF6CF / #F5B323 / #C72D10 ช่วง <P95 / P95–<99 / P99–100 สีข้อมูลเดียวกันสองธีม |
| Metric chart | family5class ใน `assets/yolk-analytical.css` แยกจาก legend แผนที่ |
| Browser identity | `assets/identity/icon-portfolio-*`, `site.webmanifest`; ภาพแชร์ 1.6 ใช้ composition เดิม พร้อมฟอนต์/สี DS 0.9.7 และชี้ URLสาธารณะจริง |
| Branch photos | 5 mockups เดิมพร้อมmanifest/ที่มา ไม่ใช่รูปสาขาจริง |

ตรวจ full DS packageแล้ว **9,768/9,768 ผ่าน** เป็น package/source/schema/colour projection checks ไม่ใช่การรับรองว่า UI ทุกจุด conform หรือทีม/บัญชีอื่นเปิดใช้แล้ว สถานะ releaseคือ owner-approved unsigned distribution

คำขอผู้ใช้เหนือกฎตกแต่ง: ไม่มี motif, decorative brackets, coloured selected left rails หรือโลโก้ใส่กรอบ ใช้แค่ text weight/background/spacing สำหรับการเลือก แต่คง keyboard focus และ borders ที่มีความหมาย

ดู [Handoff](HANDOFF.md) สำหรับผลตรวจของ artifact จริง เส้นทาง sourceภายนอกในmanifestคือprovenance ไม่ใช่dependencyสำหรับเปิดพรีวิว
