# Implementation plan · CityMETER: Yolk v1.9.2

[Full product statement + implementation จากศูนย์](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.2.md) และ [machine blueprint](contracts/full-product.v1.9.2.json) ครบ T00–T24 ทำทีละ task ตาม dependencies ใช้ CityMETER stack จริงหลัง T00

รุ่นนี้เพิ่ม/เปลี่ยน Villa Market/Lawson108/Tops artwork ตามไฟล์ที่เจ้าของส่ง และแก้ Supply icon/caption font/layout เท่านั้น **เกณฑ์/profile/engine/Strategy1.9.0 และ interaction1.9.1 คงไว้** ไม่เปลี่ยน Demand/Tier/eligible IDs, source totals หรือ saved work

งานที่ปรับ: T01 isolating semantic icon font + responsive caption, T06 stable brand-ID/artwork binding, T23 current source/native typography and asset checks อ่าน [patch guide](docs/BRAND_IDENTITY_AND_SUPPLY_CHIPS_v1.9.2.md)

ระบบ production auth/RBAC/datastore/outbox/media/API ยังเป็นแผน ไม่ถือว่าเสร็จจาก static preview Current QA ต้องใช้ receipts1.9.2 หลังรวม source แล้ว ไม่ยกตัวเลข old pass มาใช้ Seal/publish หลัง final QA เท่านั้น
