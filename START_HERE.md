---
document_id: yolk.start_here.three_industries
version: 1.7.1
date: 2026-10-04
entrypoint: prototype/index.html
product_contract: contracts/product.v1.7.json
experience_contract: contracts/workspace-map.v1.7.json
criteria_contract: contracts/criteria-proposal.v1.6.json
task_manifest: contracts/implementation-tasks.v1.6.json
design_system: LDS 0.9.7
status: source_backed_static_preview
---

# เริ่มที่นี่ — CityMETER: Yolk · v1.7.1

เลือก Fuel, Grocery หรือ Non-bank แล้วคัดไข่แดงจากข้อมูล CityMETER 7,954 พื้นที่ ใช้เกณฑ์ที่ปรับได้แยกรายแบรนด์ และแผนที่เดียวตลอดงาน

| ต้องการ | เปิด |
|---|---|
| ทดลองใช้ | [Public preview](https://montri-th.github.io/yolk/) |
| เข้าใจผลิตภัณฑ์ | [Product statement v1.7.1](CityMETER_Yolk_Product_Statement_v1.7.md) + [product contract](contracts/product.v1.7.json) |
| ดูสูตรและข้อจำกัด | [Criteria guide](docs/CRITERIA_GUIDE.md) + [criteria baseline v1.6](contracts/criteria-proposal.v1.6.json) |
| เข้าใจ Supply ต่อขนาดตลาด | [Supply guide + embedded JSON contract](docs/SUPPLY_RELATIVE_PROPOSAL.md) |
| เข้าใจ preset รายแบรนด์ | [Brand presets](docs/BRAND_PRESETS_v1.7.md) + [brand contract](contracts/brand-experience.v1.7.json) |
| ต่อแผนที่ทุกหน้า | [Persistent map](docs/PERSISTENT_MAP_v1.7.md) + [workspace-map contract](contracts/workspace-map.v1.7.json) |
| เริ่มพัฒนา | [Implementation plan](IMPLEMENTATION_PLAN_v1.7.md) + [retained machine tasks](contracts/implementation-tasks.v1.6.json) |
| ตรวจที่มาข้อมูล | [Source summary](evidence/data/SUMMARY.md) + [catalogue](evidence/data/source-catalogue.json) + [boundary provenance](prototype/data/real/boundary-provenance.v1.7.json) |
| ต่อ DS และ assets | [Asset integration](DS_ASSET_INTEGRATION.md) + [official logo manifest](prototype/data/brand-logos.v1.7.json) |
| ตรวจชุดส่งมอบและ release | [Handoff](HANDOFF.md) + [release contract](contracts/release.v1.7.1.json) |

## ทดลองในเครื่อง

รันจาก root ของ handoff แล้วเปิด `/prototype/`:

```sh
python3 -m http.server 8854 --bind 127.0.0.1
```

1. เลือกธุรกิจและแบรนด์ ดู format หลักและเกณฑ์เริ่มต้น หรือค่าที่เคยบันทึกไว้
2. สำรวจประเทศ→จังหวัด→อำเภอ→ทำเลตามขอบเขต/crosswalk ที่ตรวจแล้ว: ประเทศใช้สีอำเภอ จังหวัด/อำเภอใช้สีทำเลละเอียด เลื่อน/ซูมแล้วสลับเมนู แผนที่ยังเป็น instance เดิม; ใช้ breadcrumb/กลับระดับ/ดูทั้งประเทศเมื่อต้องการ
3. เปิดเกณฑ์ ลากแถบเลื่อนหรือกรอกค่า เลือกมุมมองผ่านเกณฑ์/เกณฑ์ทีม/เข้าใหม่/หลุดเกณฑ์/รอตรวจ/อันดับเปลี่ยน ตรวจผลก่อนกดใช้กับทีม
4. เลือกทำเลละเอียดแล้วดู O/C/U เปิดทำเลหรือสาขาเพื่อซูมไปข้อมูลที่เลือก ดู Polygon ที่มีจริงหรือ extent เส้นประซึ่งใช้จัดมุมมองเท่านั้น หมุดใช้พิกัดและการผูกพื้นที่ที่ตรวจได้ ไม่สร้างจากยอดรวม
5. สลับแบรนด์แล้วกลับมา เกณฑ์และ draft ไม่ปะปน เปลี่ยนภาษา/ธีมโดยไม่แก้เกณฑ์ ทดลองรูปและกิจกรรมได้ใน local browser storage

สีเป็น **Tier ยืนยันดีที่สุดของไข่แดงที่ผ่านในกลุ่มที่แสดง** อำเภอสรุปจากทำเลที่มี parent crosswalk ตรวจแล้ว ไม่ประเมิน Demand ใหม่ทั้งอำเภอ Tier 1/2/3 ใช้ native `li.demand` class 3/2/1 ตามลำดับ ข้อมูลรอตรวจและไม่มีผลยืนยันแสดงแยกกัน ค่าที่ผิดทำให้แผนที่พักคำนวณและคงผลล่าสุดที่ใช้ได้ ไม่แสดงเป็น 0 ทำเล

ขอบเขตต้นทางมี 928 อำเภอและ 7,954 ทำเลใน 77 ไฟล์จังหวัด; 45 ทำเลสัมพันธ์กับหลายอำเภอ Crosswalk สำหรับมุมมองพื้นที่ไม่ใช่การรับรองเขตปกครอง ตรวจ source manifest, topology/model checks และ browser receipt แยกกันก่อนรับงาน

Percentiles ใช้ฐานทั่วประเทศเดียวกัน การกรองเปลี่ยนเฉพาะมุมมอง ไม่เติม missing เป็นศูนย์ Yolk เป็น Demand proxy ที่คัดผ่าน ไม่ใช่ยอดซื้อหรือผู้กู้ที่วัดจริง

เมื่อเลือกทำเล พื้นในขอบเขตโปร่งใสเพื่ออ่าน basemap ใช้เส้นขอบ ชื่อ และสถานะประกอบ จุดที่ยังไม่ผูกพื้นที่อาจแสดงตามพิกัดใน source polygon แบบ view-only ไม่เปลี่ยน aggregate/การผูก UUID การบันทึกสาขาหลังรอประมวลผลรูปต้องยืนยัน route/context เดิมก่อน commit

## Authority และข้อจำกัด

อ่าน `AGENTS.md`, product/workspace-map/brand contracts v1.7 และ LDS 0.9.7 เป็น authority ของผลิตภัณฑ์รุ่นนี้ Criteria proposal, runtime parameter presets, industry profiles และ machine tasks v1.6 เป็น baseline คำนวณที่รักษาไว้ Family overrides อ่านจาก registry v1.7 เอกสาร experience/release เก่าใช้เป็นประวัติและหลักฐานเฉพาะรุ่นที่ระบุ

พรีวิวเป็น static web ที่เก็บการแก้ไขใน browser ของผู้ใช้แต่ละคน ยังไม่มี shared backend, live Sheets sync, server RBAC หรือ notification/email/LINE delivery จริง การตรวจ source/DOM ไม่แทน browser review และการทดสอบเครื่องจริง ดูข้อจำกัดและคำสั่งรับงานใน [HANDOFF](HANDOFF.md)

## Current patch: 1.7.1

Start with [responsiveness and POI actions](docs/RESPONSIVENESS_v1.7.1.md) for this patch. It preserves the 1.7 model and data, fixes redundant map work and stale state, and adds brand-aware popup research actions. Check [machine acceptance](contracts/responsiveness.v1.7.1.json) and the current release receipt for what was actually verified.
