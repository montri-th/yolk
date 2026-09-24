# CityMETER: Yolk

**Find the yolk. Grow your market. / หาไข่แดง ขยายตลาด**

[เปิด web preview](https://montri-th.github.io/yolk/?v=1.4.0) · [เริ่มอ่านที่นี่](START_HERE.md)

[ดาวน์โหลด handoff ZIP 1.4.0](https://github.com/montri-th/yolk/releases/download/v1.4.0/CityMETER-Yolk-v1.4.0-handoff.zip) · [SHA-256](https://github.com/montri-th/yolk/releases/download/v1.4.0/CityMETER-Yolk-v1.4.0-handoff.zip.sha256)

**Product v1.4 · Handoff 1.4.0** — พรีวิวสำหรับทีมขยายสาขา เปรียบเทียบ Demand กับ Supply คัดทำเลที่สนใจ แล้วเก็บเหตุผลและงานของทีมไว้ร่วมกัน รองรับไทย/อังกฤษ มือถือ และ light/dark/system

รุ่นนี้แยก **คัดทำเล** กับ **จัดอันดับ** ให้ชัด: เลือก Tier และรูปแบบทำเลทั้ง 8 แบบเพื่อคัด แล้วปรับน้ำหนัก Demand / ช่องว่างสาขาเรา / ช่องว่างคู่แข่งเพื่อเรียงลำดับ พร้อมคำอธิบายแต่ละแบบ ปุ่มดูรายละเอียดที่เห็นว่ากดได้ โลโก้ Landometer ทุกธีม favicon และภาพปกแชร์

| สำหรับ | เอกสารล่าสุด |
|---|---|
| Product / ทีมธุรกิจ | [Product statement v1.4](CityMETER_Yolk_Product_Statement_v1.4.md) |
| Dev / coding agent | [Implementation plan — 15 งาน](IMPLEMENTATION_PLAN_v1.4.md) + [task JSON](contracts/implementation-tasks.v1.4.json) |
| Design / frontend | [Asset index](ASSET_INDEX_v1.4.md) + [DS integration](DS_ASSET_INTEGRATION.md) |
| ตรวจรุ่นและข้อจำกัด | [Handoff](HANDOFF.md) + [release manifest](contracts/release.v1.4.0.json) |

เกณฑ์เดิมที่บันทึกไว้คงการเรียงแบบเดิมจนทีมเลือกใช้ weighted ranking แล้วกดใช้กับทีม เกณฑ์ใหม่เริ่มที่น้ำหนัก 70:20:10 และรับ Tier 1–3 ทุกค่าเป็นข้อเสนอให้ปรับตามธุรกิจ คะแนนเป็นสัญญาณสำหรับศึกษาต่อ ไม่ใช่ยอดขายคาดการณ์

**ข้อมูลบนเว็บสาธารณะเป็นข้อมูลจำลอง** CRUD สมาชิก feed และการแจ้งเตือนจำลองใน browser ไม่มี production auth, shared database หรือการส่ง email/LINE จริง รูปเพิ่มเก็บเฉพาะ IndexedDB แผนที่ใช้บริการภายนอก ภาพ satellite เป็นปี 2021 ความละเอียด 10 ม.

## ทดลองในเครื่อง

รันจาก repository root แล้วเปิด `http://127.0.0.1:8849/prototype/` เปลี่ยน port ได้ถ้าถูกใช้อยู่

```sh
python3 -m http.server 8849 --bind 127.0.0.1
```

คำสั่งตรวจที่มีจริงอยู่ใน [START_HERE](START_HERE.md) ส่วน backend paths/commands ในแผนเป็นงานที่จะสร้าง โดยเริ่มจากระบบเดิมของ CityMETER ก่อน

## Machine contracts

[Product](contracts/product.v1.4.json) · [Criteria](contracts/criteria.v1.4.json) · [Tasks](contracts/implementation-tasks.v1.4.json) · [Assets](contracts/assets.v1.4.json) · [DS](contracts/ds-assets.v1.4.json) · [Web identity](contracts/web-identity.v1.4.json) · [Icons](contracts/icons.v1.3.json) · [Experience baseline](contracts/experience.v1.3.json) · [Release](contracts/release.v1.4.0.json)

สถานะ **`ready_with_open_manual_gate`** ตรวจ source/controller และไฟล์เผยแพร่ได้ แต่ browser visual/device QA ยังเปิดอยู่ การ deploy ไม่ยืนยันว่า backend ข้อมูลจริง หรือการแสดงภาพในแอปแชร์พร้อมใช้งานแล้ว เอกสาร v1.3 คงไว้เป็นประวัติ ให้ใช้ v1.4 เป็นข้อกำหนดปัจจุบัน
