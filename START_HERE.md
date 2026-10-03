---
document_id: yolk.start_here.three_industries
version: 1.6.0
entrypoint: prototype/index.html
product_contract: contracts/product.v1.6.json
criteria_contract: contracts/criteria-proposal.v1.6.json
task_manifest: contracts/implementation-tasks.v1.6.json
design_system: LDS 0.9.7
status: approved_public_static_preview
---

# เริ่มที่นี่ — CityMETER: Yolk · 3 ธุรกิจ

UI เดิมของ Yolk + LDS 0.9.7 + snapshot จริง 7,954 พื้นที่ เลือก Fuel, Grocery หรือ Non-bank มี preset ที่อธิบายได้และเกณฑ์แยกรายแบรนด์

| ต้องการ | เปิด |
|---|---|
| ทดลองใช้ | [Public preview](https://montri-th.github.io/yolk/) |
| เข้าใจผลิตภัณฑ์ | [Product statement v1.6](CityMETER_Yolk_Product_Statement_v1.6.md) |
| ดูสูตร preset และข้อจำกัด | [Criteria guide](docs/CRITERIA_GUIDE.md) + [machine criteria](contracts/criteria-proposal.v1.6.json) |
| เริ่มพัฒนา | [Implementation plan](IMPLEMENTATION_PLAN_v1.6.md) + [machine tasks](contracts/implementation-tasks.v1.6.json) |
| ตรวจที่มาข้อมูล | [Source summary](evidence/data/SUMMARY.md) + [catalogue](evidence/data/source-catalogue.json) |
| ต่อ DS และ assets | [Asset integration](DS_ASSET_INTEGRATION.md) |
| ตรวจชุดส่งมอบ | [Handoff](HANDOFF.md) |

## ทดลองในเครื่อง

รันจาก root ของ handoff แล้วเปิด `/prototype/`:

```sh
python3 -m http.server 8854 --bind 127.0.0.1
```

1. เลือกธุรกิจและแบรนด์ ดูแผนที่ประเทศกับทำเลที่คัดผ่าน แยกพื้นที่ที่ยังรอตรวจออกจากผลยืนยัน
2. เปิดเกณฑ์ เลือก dataset → metric/สูตร → ปรับค่าตัด ดูผลก่อนใช้กับทีม
3. สลับแบรนด์และกลับมา ค่าของแต่ละบริบทคงแยกกัน สลับภาษา/ธีมโดยไม่แก้เกณฑ์
4. เปิดทำเล ดูสัญญาณ Demand, Supply, ที่มา ขอบเขต/POI ที่มีจริง และงานสำรวจต่อ
5. ทดลองสาขา รูป และกิจกรรม การแก้ไขอยู่ใน local browser storage ไม่ส่ง notification จริงหรือ sync Sheets

ใช้ percentiles ของฐานทั่วประเทศเดียวกัน การกรองจังหวัดเปลี่ยนมุมมองเท่านั้น สูตรใช้ valid values ไม่เติม missing เป็นศูนย์ Yolk เป็นบริบท Demand ที่คัดผ่าน ไม่ใช่ยอดซื้อหรือผู้กู้ที่วัดจริง

## Authority ของรุ่นนี้

อ่าน `AGENTS.md`, product/criteria/presets v1.6 และ DS 0.9.7 ใน `reference/lds-0.9.7/` เป็นหลัก เอกสาร v1.2–v1.5, release manifests และ scripts รุ่นเก่าที่เก็บไว้เป็นประวัติ ไม่ใช่หลักฐานตรวจรุ่นนี้ สูตร Fuel ที่รับไว้เดิมยังเป็น baseline ตามข้อกำหนดใหม่ที่ระบุชัด

รุ่น 1.6.0 เผยแพร่เป็น static preview บน GitHub Pages ตามคำขอเจ้าของ ระบบเก็บการแก้ไขใน browser ของผู้ใช้แต่ละคน ไม่มี shared backend หรือ live Sheets sync ดู [หลักฐานและข้อจำกัด](evidence/QA.md) และ [release contract](contracts/release.v1.6.0.json)
