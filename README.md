# CityMETER: Yolk · 1.9.3 · local review complete · LDS 0.9.7

**หาไข่แดง ขยายตลาด — Find the yolk. Grow your market.**

เลือกแบรนด์แล้วเห็น **โอกาสขยาย**: คิวทำเลชวนสำรวจจาก preset ที่ข้อมูลรองรับ เปิดเหตุผล สิ่งที่ยังไม่รู้และงานแรก แล้วเล็งพร้อมผู้รับผิดชอบบนแผนที่เดียว รองรับ Fuel, Grocery และ Non-bank

[Web preview](https://montri-th.github.io/yolk/) · [Product + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.3.md) · [Start here](START_HERE.md) · [Handoff](HANDOFF_v1.9.3.md) · [Assets](ASSET_INDEX_v1.9.3.md) · [Release state](contracts/release.v1.9.3.json)

## ใช้งาน

1. **เห็นโอกาส:** ใช้ preset หรือเกณฑ์เดิมของแบรนด์ เลือกไม่เกิน 3 จาก 8 Strategy ในหน้าเดียว เปิดภาพและตัวอย่างเพื่อเข้าใจแต่ละวิธี
2. **เข้าใจเหตุผล:** ดูทำเลชวนสำรวจ เปิดหน้า Demand หรือ Supply เมื่อต้องตรวจสมมติฐาน แผนที่ กล้องและ draft เดิมยังอยู่
3. **เล็งและลงมือ:** บันทึก snapshot ผู้รับผิดชอบและงานแรก แล้วเพิ่มหลักฐานจากภาคสนามก่อนลงทุน

ฐาน 7,954 reporting UUIDs, 25 metrics, 37 profiles และ national benchmark คงเดิม Strategy เป็นคิวสำรวจ ไม่ใช่คะแนนยอดขายหรือหลักฐาน unmet demand การเปลี่ยน Supply, น้ำหนักหรือ Strategy ไม่เปลี่ยน Demand/Tier/eligible IDs เกณฑ์/profile/engine ใช้ 1.9.0, interaction ใช้ 1.9.1 และ identity ใช้ 1.9.2

## รุ่น 1.9.3

รวมภาพรวมประเทศกับ Strategy เป็น **โอกาสขยาย / Expansion opportunities** ส่วน Demand/Supply แยกไว้ มีแผนที่ใหญ่ขึ้น ปุ่มขยาย/ย่อ controls สั้น และเส้นขอบขาวที่แยก parent/child ได้ชัดขึ้น Light ใช้ foundation surface อ่อนตาม LDS Guide ทั้ง 8 วิธีมีไอคอน ภาพอธิบายและตัวอย่างสมมติ #strategy เดิมเป็น alias ของหน้าเดียว

อ่าน [Experience guide](docs/EXPANSION_OPPORTUNITIES_v1.9.3.md), [machine contract](contracts/expansion-experience.v1.9.3.json) และ [Strategy narrative](prototype/data/strategy-guide.v1.9.3.json)

Current local QA ผ่านแบบจำกัด: 32 suites / 537 reported cases, 22 native checks และภาพจริง 17 ภาพ Publication/provider/live-byte evidence ยังรอแยก ผลรุ่นก่อนเป็นประวัติ Demo ยังเก็บงานใน browser การทำงานร่วมทีมต้องพัฒนา shared backend, server RBAC, outbox, email/LINE และ private media ตาม [full plan](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.3.md)
