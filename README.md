# CityMETER: Yolk · 1.8.0 · LDS 0.9.7

**หาไข่แดง ขยายตลาด — Find the yolk. Grow your market.**

หา Demand ที่เข้มข้น เทียบสาขาเราและคู่แข่ง แล้วเล็งพื้นที่ที่ควรศึกษาต่อ บนแผนที่เดียว Demo รองรับ Fuel, Grocery และ Non-bank

[Web preview](https://montri-th.github.io/yolk/) · [Product + implementation ฉบับเต็ม](CityMETER_Yolk_Full_Product_and_Implementation_v1.8.0.md) · [เริ่มพัฒนา](START_HERE.md) · [Handoff](HANDOFF.md) · [Assets](ASSET_INDEX_v1.8.0.md)

รุ่น 1.8.0 ใช้สามขั้นตอน: **หาไข่แดง → ดูช่องว่างสาขา → เล็งทำเล** ระดับไข่แดงเข้ม/ไข่แดง/ไข่ขาวสื่อ Demand สูงมาก/สูง/ค่อนข้างสูง ส่วนโล่และดาบแยกสาขาเรา/คู่แข่ง ตัวเลขและแท่งเปรียบเทียบใช้หน่วยเดียวกัน

Supply และน้ำหนักช่วยจัดอันดับพื้นที่ที่ผ่าน Demand การปรับสองส่วนนี้ไม่เพิ่มหรือลดจำนวนไข่แดง ไม่มีการเลือก 8 รูปแบบหรือดาวใน active flow สูตร Demand, source snapshots และ national cohort 7,954 reporting UUIDs คงเดิม อ่าน [experience contract](contracts/criteria-experience.v1.8.0.json)

Demo เป็น browser-local simulation: ยังไม่มี shared backend/server RBAC/email/LINE/private production media ไม่รับรอง traffic จริง capacity market share หรือยอดขายจากผลคัด

ใช้ exact LDS 0.9.7 base + Location Intelligence Profile, official unframed Landometer logo, verified square brand graphics และ Material Symbols extension ไม่มี motif/colored selected rail/logo frame

ผลตรวจรุ่นนี้และสถานะเผยแพร่อ่าน [release contract](contracts/release.v1.8.0.json) Local QA, native browser, provider และ live-byte evidence แยกกัน ผล hash ไม่แทนการตรวจ UI หรือ physical device

## ผลตรวจปัจจุบัน

Local QA ผ่าน 21 suites / 354 checks และ bounded native browser 11 checks มีภาพจริง 5 ภาพ ไม่ใช่ full language/theme matrix, physical-device หรือ backend pass Provider/live-byte proof ยังรอ external attestation อ่าน [release contract](contracts/release.v1.8.0.json) และ [native receipt](evidence/browser-v1.8.0/native-browser-review.json)
