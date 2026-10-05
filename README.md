# CityMETER: Yolk · 1.7.5 · LDS 0.9.7

Find the yolk. Grow your market.

Yolk ช่วยทีมขยายสาขาค้นหาพื้นที่ที่ Demand เข้มข้น เทียบ Supply แล้วบันทึกทำเลและหลักฐานร่วมกัน Demo รองรับ Fuel, Grocery และ Non-bank ข้อมูลและการเปลี่ยนแปลงของทีมเก็บในเบราว์เซอร์นี้ ยังไม่มี shared backend หรือการส่งแจ้งเตือนจริง

[Web preview](https://montri-th.github.io/yolk/) · [Full product + implementation](CityMETER_Yolk_Full_Product_and_Implementation_v1.7.5.md) · [เริ่มพัฒนา](START_HERE.md) · [Handoff](HANDOFF.md)

รุ่น 1.7.5 เติมจังหวัดและทำเลจากพิกัดที่พบในขอบเขตต้นทางหนึ่งพื้นที่ รักษาสิ่งที่ผู้ใช้แก้เอง เสนอทางเลือกเมื่อข้อมูลขัดกัน จำกัด dropdown ตามบริบท และแยกร่างรูปสาขาใหม่ตามธุรกิจ/แบรนด์ ดู [Branch context](docs/BRANCH_CONTEXT_v1.7.5.md)

สูตรและ national cohort 7,954 reporting UUIDs คงเดิม การเทียบพิกัดช่วยกรอกฟอร์มและแสดงรายการ ไม่ยืนยันเขตทางกฎหมาย การเปิดสาขา หรือเปลี่ยนยอด Supply อัตโนมัติ

ใช้ LDS 0.9.7 base + Location Intelligence Profile จาก reference/lds-0.9.7 ตาม [DS integration](DS_ASSET_INTEGRATION.md) ไม่มี motif, logo frame หรือ selected coloured rail

ดูผลทดสอบและข้อจำกัดปัจจุบันที่ [release contract](contracts/release.v1.7.5.json) และ [local QA](evidence/release-checks-v1.7.5.json) Provider/live-byte receipt แยกจาก local QA และ physical-device/backend gates
