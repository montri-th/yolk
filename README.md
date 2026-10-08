# CityMETER: Yolk · 1.9.5 · current bounded local review complete · LDS 0.9.7

**หาไข่แดง ขยายตลาด — Find the yolk. Grow your market.**

เลือกแบรนด์แล้วเห็น **โอกาสขยาย**: คิวทำเลชวนสำรวจจาก preset ที่ข้อมูลรองรับ เปิดเหตุผล สิ่งที่ยังไม่รู้และงานแรก แล้วเล็งพร้อมผู้รับผิดชอบบนแผนที่เดียว รองรับ Fuel, Grocery และ Non-bank

[Web preview](https://montri-th.github.io/yolk/) · [Product + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.5.md) · [Start here](START_HERE.md) · [Handoff](HANDOFF_v1.9.5.md) · [Assets](ASSET_INDEX_v1.9.5.md) · [Release state](contracts/release.v1.9.5.json)

## ใช้งาน

1. **เห็นโอกาส:** ใช้ preset หรือเกณฑ์เดิมของแบรนด์ เลือกไม่เกิน 3 จาก 8 Strategy ในหน้าเดียว เปิดภาพและตัวอย่างเพื่อเข้าใจแต่ละวิธี
2. **เข้าใจเหตุผล:** ดูทำเลชวนสำรวจ เปิดหน้า Demand หรือ Supply เมื่อต้องตรวจสมมติฐาน แผนที่ กล้องและ draft เดิมยังอยู่
3. **เล็งและลงมือ:** บันทึก snapshot ผู้รับผิดชอบและงานแรก แล้วเพิ่มหลักฐานจากภาคสนามก่อนลงทุน

ฐาน 7,954 reporting UUIDs, 25 metrics, 37 profiles และ national benchmark คงเดิม Strategy เป็นคิวสำรวจ ไม่ใช่คะแนนยอดขายหรือหลักฐาน unmet demand การเปลี่ยน Supply, น้ำหนักหรือ Strategy ไม่เปลี่ยน Demand/Tier/eligible IDs เกณฑ์/profile/engine ใช้ 1.9.0, interaction ใช้ 1.9.1 และ identity ใช้ 1.9.2

## รุ่น 1.9.3

รวมภาพรวมประเทศกับ Strategy เป็น **โอกาสขยาย / Expansion opportunities** ส่วน Demand/Supply แยกไว้ มีแผนที่ใหญ่ขึ้น ปุ่มขยาย/ย่อ controls สั้น และเส้นขอบขาวที่แยก parent/child ได้ชัดขึ้น Light ใช้ foundation surface อ่อนตาม LDS Guide ทั้ง 8 วิธีมีไอคอน ภาพอธิบายและตัวอย่างสมมติ #strategy เดิมเป็น alias ของหน้าเดียว

อ่าน [Experience guide](docs/EXPANSION_OPPORTUNITIES_v1.9.3.md), [machine contract](contracts/expansion-experience.v1.9.3.json) และ [Strategy narrative](prototype/data/strategy-guide.v1.9.3.json)

Current bounded 1.9.5 local/native receipts passed; provider/live/publication remains separate. Prior 1.9.4 results are historical. The prior1.9.3 pass remains history. Browser-local preview does not implement shared backend/RBAC/outbox/email/LINE/private media.

## Map-space patch 1.9.4

[Map-space contract](contracts/map-space.v1.9.4.json) defines compact navigation and progressive map controls. Analytical/profile/source/artwork/guide bytes are unchanged. The 1.9.3 description and review counts above are retained history; current 1.9.4 QA/native/provider/live checks remain pending until actual receipts are bound.


## Mobile document flow 1.9.5

Read [mobile-flow contract](contracts/mobile-flow.v1.9.5.json). Narrow-screen page scroll must reveal the work panel after the map in normal document flow; keep the same map/camera/drafts and desktop map-space1.9.4. Fresh 1.9.5 QA/native/provider/live receipts are required; historical passes are not current acceptance.
