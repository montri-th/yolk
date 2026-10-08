# CityMETER: Yolk · 1.9.6 · current bounded local review complete · LDS 0.9.7

**หาไข่แดง ขยายตลาด — Find the yolk. Grow your market.**

เลือกแบรนด์แล้วเห็น **โอกาสขยาย**: คิวทำเลชวนสำรวจจาก preset ที่ข้อมูลรองรับ เปิดเหตุผล สิ่งที่ยังไม่รู้และงานแรก แล้วเล็งพร้อมผู้รับผิดชอบบนแผนที่เดียว รองรับ Fuel, Grocery และ Non-bank

[Web preview](https://montri-th.github.io/yolk/) · [Product + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.6.md) · [Start here](START_HERE.md) · [Handoff](HANDOFF_v1.9.6.md) · [Assets](ASSET_INDEX_v1.9.6.md) · [Release state](contracts/release.v1.9.6.json)

## ใช้งาน

1. **เห็นโอกาส:** ใช้ preset หรือเกณฑ์เดิมของแบรนด์ เลือกไม่เกิน 3 จาก 8 Strategy ในหน้าเดียว เปิดภาพและตัวอย่างเพื่อเข้าใจแต่ละวิธี
2. **เข้าใจเหตุผล:** ดูทำเลชวนสำรวจ เปิดหน้า Demand หรือ Supply เมื่อต้องตรวจสมมติฐาน แผนที่ กล้องและ draft เดิมยังอยู่
3. **เล็งและลงมือ:** บันทึก snapshot ผู้รับผิดชอบและงานแรก แล้วเพิ่มหลักฐานจากภาคสนามก่อนลงทุน

ฐาน 7,954 reporting UUIDs, 25 metrics, 37 profiles และ national benchmark คงเดิม Strategy เป็นคิวสำรวจ ไม่ใช่คะแนนยอดขายหรือหลักฐาน unmet demand การเปลี่ยน Supply, น้ำหนักหรือ Strategy ไม่เปลี่ยน Demand/Tier/eligible IDs เกณฑ์/profile/engine ใช้ 1.9.0, interaction ใช้ 1.9.1 และ identity ใช้ 1.9.2

## รุ่น 1.9.6

เพิ่มเส้นรองใต้ขอบสีขาว, Demand หนึ่งฟอง / โอกาสขยายสามฟอง และ [Supply count/share/treemap](contracts/supply-inventory.v1.9.6.json): ยอดเรา+คู่แข่งที่ระบุแบรนด์ได้ สัดส่วนสาขาเรา และภาพจำนวนแต่ละแบรนด์ อ่านพร้อม U/coverage/bounds สัดส่วนนี้ไม่ใช่ส่วนแบ่งยอดขาย เกณฑ์/ranking/source counts/profiles/original artwork คงเดิม [Map extension](contracts/map-readability.v1.9.6.json)

คง [mobile flow1.9.5](contracts/mobile-flow.v1.9.5.json), [desktop map-space1.9.4](contracts/map-space.v1.9.4.json), [หน้าโอกาสขยาย/guide1.9.3](contracts/expansion-experience.v1.9.3.json). Fresh expanded Supply QA/native ผ่านแบบจำกัดตาม current receipt; หนึ่ง hover ไม่ใช่ทุกขอบเขต Provider/live ต้องมีหลักฐานแยก Preview เป็น browser-local; production shared backend/RBAC/outbox/private media เป็นงานแยก
