# Assets ที่ dev ต้องต่อ — Yolk v1.6-preview.1

ใช้ [machine manifest](contracts/assets.v1.6.json) สำหรับ path/hash และ [DS manifest](contracts/ds-assets.v1.6.json) สำหรับ lineage ของแต่ละไฟล์ ห้ามแทนโลโก้ ฟอนต์ หรือสีข้อมูลด้วยสิ่งที่เดาเอง

| กลุ่ม | ที่อยู่ | บทบาท |
|---|---|---|
| DS 0.9.7 | `prototype/vendor/lds-0.9.7/` | verified foundation/data tokens, fonts และ licence |
| ฐาน human + machine | `reference/lds-0.9.7/` | full standalone base, matching Location Profile และ canonical JSON |
| โลโก้เดิม | `prototype/assets/landometer-logo-horizontal-v12-889.png` | ภาพโปร่งใส 889×244; direct placement ไม่มี frame |
| Dark wordmark | `prototype/industry-workspace.css` | exact native alpha + clipped wordmark เติม `var(--ink)`; สีสัญลักษณ์เดิมไม่เปลี่ยน |
| Icons เดิม | `prototype/assets/material-symbols-rounded-yolk-300-v1.5.woff2` + Apache licence | preserved 37-glyph product extension; `icons.js/css` กำหนด semantics/aria |
| Favicon/share | `prototype/assets/identity/` | favicon/apple-touch/manifest และ share raster1.6 พร้อม public metadata URL |
| แผนที่ | `prototype/vendor/leaflet-1.9.4/` + `data/thailand-provinces.*` | map library/licence, province source attribution และ current direct polygon adapters |
| ภาพ mockup | `prototype/assets/demo-photos/` | 5 AI-generated station examples พร้อม labels/hash; ไม่ใช่ภาพสาขาจริง |
| Source snapshot | `prototype/data/real/` | runtime projections ของข้อมูลจริง; ตัวแก้ไขแยก local overlay |
| Normalized evidence | `evidence/data/` | สรุป source/formula/coverage/reconciliation/geometry provenance; full normalized archive อยู่ใน local handoff |

ฟอนต์ heading/body/mono ใช้ไฟล์ตาม DS role จาก `vendor/lds-0.9.7/fonts.css` ส่วน Material Symbols product extension คงไว้ตาม UI ที่อนุมัติ ไม่อ้างว่าเป็น canonical glyph set ใหม่ ภาพโลโก้ full resolution ใน vendor มีไว้เป็น verified source; runtime ใช้ derivative เดิมตาม manifest

สี/หน่วย/ตัวหาร/legend ต้องตรง metric ที่แสดง Zero, no-data, suppressed และ not-yet ต้องต่างกัน Analytical HEX ไม่เปลี่ยนเมื่อสลับธีม CSS ที่รองรับ theme เป็น foundation UI เท่านั้น

ภาพแชร์1.6 renderจากHTML ด้วยโลโก้/ฟอนต์เดิมและสี LDS0.9.7 ตรวจ asset URL/hash เมื่อเผยแพร่ แต่การส่งภาพถูกต้องไม่ได้ยืนยันว่า social platform ทุกแห่งล้าง cache แล้ว
