---
document_id: yolk.brand_presets.guide
version: 1.7.0
date: 2026-10-04
status: implemented_static_preview_hypotheses_not_outcome_calibrated
machine_contract: ../contracts/brand-experience.v1.7.json
registry: ../prototype/data/brand-presets.v1.7.json
design_system: LDS 0.9.7
---

# เลือกแบรนด์ แล้วเริ่มมองหาไข่แดง

Yolk เตรียมเกณฑ์เริ่มต้นให้ตามธุรกิจ แบรนด์ และรูปแบบสาขา เพื่อให้ทีมเห็นพื้นที่น่าศึกษาทันที จากนั้นปรับข้อมูล ตัววัด ค่าตัด รูปแบบตลาด และน้ำหนักได้เอง พร้อมดูผลบนแผนที่ก่อนบันทึกใช้กับทีม

**เกณฑ์เหล่านี้เป็นสมมติฐานของ Yolk ที่ปรับได้** เว็บทางการช่วยอธิบายบทบาทธุรกิจและรูปแบบสาขา แต่ไม่ได้ให้ค่า Percentile หรือน้ำหนักที่บริษัทใช้จริง ผลคัดกรองจึงเป็นรายการสำหรับศึกษาต่อ ยังไม่ใช่ยอดลูกค้า ยอดขาย หรือคำรับรองว่าคุ้มลงทุน

## ค่าที่ผู้ใช้บันทึกไว้ต้องมาก่อน

1. ครั้งแรกที่เลือกแบรนด์ เปิดรูปแบบหลักตามตารางด้านล่าง แล้วสร้างเกณฑ์จาก preset
2. ถ้าเคยใช้แบรนด์นั้นแล้ว กลับไปยังรูปแบบที่เลือกล่าสุด พร้อมเกณฑ์ แบบร่าง และรายการเล็งไว้ของบริบทนั้น
3. ปรับค่า หรือกด “ลองเกณฑ์นี้” เพื่อดูผลแบบร่างบนแผนที่ ยังไม่เปลี่ยนเกณฑ์ทีม
4. กด **บันทึกใช้กับทีม / Apply** จึงสร้างเกณฑ์รุ่นใหม่และกิจกรรมหนึ่งรายการ มีผู้แก้ เวลา และค่าก่อน–หลัง

การเปลี่ยนแบรนด์ รูปแบบ ภาษา ธีม การเลื่อนแผนที่ และการลอง preset ไม่สร้างกิจกรรมทีม การอัปเดต preset รุ่นใหม่ไม่ทับเกณฑ์หรือแบบร่างที่มีอยู่

บริบทแยกตาม `workspace + industry + ownEntity + supplyScope + industryProfileVersion` ส่วนหมายเลข revision ของเกณฑ์อยู่ภายในบริบท ใน preview ใช้ browser storage; shared backend, RBAC และการแจ้งเตือนจริงเป็นงาน production ที่ต้องพัฒนาต่อ

## แบรนด์และรูปแบบที่เปิดครั้งแรก

Grocery ใช้ **รูปแบบสำคัญตามบทบาทของแบรนด์** ร่วมกับรูปแบบที่พบใน CityMETER ไม่เลือกจากจำนวนสาขามากที่สุดเพียงอย่างเดียว เช่น Tops เริ่มที่ Supermarket แม้รายการ C_STORE จะมากกว่า; Lotus's และ Big C เริ่มที่ Hypermarket แล้วผู้ใช้เปลี่ยนไปยังรูปแบบอื่นที่มีข้อมูลได้

จำนวนรายการต้นทางเป็นข้อมูลประกอบ **ไม่ใช่ส่วนแบ่งตลาด ยอดขาย หรือจำนวนสาขาที่ยืนยันว่าเปิดอยู่ปัจจุบัน** ตัวอย่างจาก snapshot: Lotus's มี C_STORE 1,866 / Hypermarket 226 / Supermarket 195; Big C มี C_STORE 1,524 / Hypermarket 151 / Supermarket 57 / Wholesale 12; Tops มี C_STORE 553 / Supermarket 172 รายการ เหตุผลและจำนวนของทุกแบรนด์อยู่ใน `brands[].defaultScopeBasis` ของ registry

### Fuel — 11 แบรนด์

ทั้งหมดเริ่มด้วย `all_fuel` และ `fuel-common` นับสถานีตามบัญชีต้นทาง ยังไม่ได้ยืนยันชนิดเชื้อเพลิงหรือผลิตภัณฑ์ในแต่ละสาขา การเลือกแบรนด์เปลี่ยนว่าใครเป็นสาขาเราและใครเป็นคู่แข่ง ส่วน Demand ใช้สูตรเดียวกัน เพราะข้อมูลที่มีไม่พอรองรับค่าตัดเฉพาะแบรนด์อย่างน่าเชื่อถือ

| แบรนด์ | Exact ID |
|---|---|
| PTT Station | `ptt` |
| เชลล์ | `shell` |
| บางจาก | `bangchak` |
| คาลเท็กซ์ | `caltex` |
| COSMO | `cosmo` |
| PT | `pt` |
| PURE | `pure` |
| สยามแก๊ส | `siam-gas` |
| ซัสโก้ | `susco` |
| ยูนิคแก๊ส | `unique-gas` |
| เวิลด์แก๊ส | `world-gas` |

COSMO ยังยืนยันตัวตนจากแหล่งทางการไม่ได้; PURE ใน snapshot ยังไม่ควรถูกแทนด้วยแบรนด์ Caltex-Purethai ปัจจุบันโดยอัตโนมัติ สยามแก๊ส/ยูนิคแก๊สมีธุรกิจ LPG แต่ข้อมูลชุดนี้ยังไม่รองรับการตีความว่าทุกจุดเป็นสถานี LPG สำหรับรถยนต์

### Grocery — 16 แบรนด์

| แบรนด์ | Exact ID หลัง `grocery-brand:` | รูปแบบเริ่มต้น | Preset family |
|---|---|---|---|
| เซเว่น อีเลฟเว่น | `SEVEN_ELEVEN` | C_STORE | `grocery-convenience` |
| ถูกดี มีมาตรฐาน | `TOOGDEE` | C_STORE | `grocery-community` |
| Lotus's | `LOTUSS` | HYPERMARKET | `grocery-hypermarket` |
| ซีเจ มอร์ | `CJ_MORE` | C_STORE | `grocery-community` |
| บิ๊กซี | `BIG_C` | HYPERMARKET | `grocery-hypermarket` |
| ท็อปส์ | `TOPS` | SUPERMARKET | `grocery-visitor-context` |
| แม็คโคร | `MAKRO` | WHOLESALE | `grocery-wholesale` |
| ลอว์สัน 108 | `LAWSON108` | C_STORE | `grocery-convenience` |
| วิลล่า มาร์เก็ต | `VILLA_MARKET` | SUPERMARKET | `grocery-supermarket` |
| แม็กซ์แวลู | `MAXVALU` | SUPERMARKET | `grocery-supermarket` |
| ฟู้ดแลนด์ | `FOODLAND` | SUPERMARKET | `grocery-supermarket` |
| กูร์เมต์ มาร์เก็ต | `GOURMET_MARKET` | SUPERMARKET | `grocery-supermarket` |
| โก โฮลเซลล์ | `GO_WHOLESALE` | WHOLESALE | `grocery-wholesale` |
| ดอง ดอง ดองกิ | `DONKI` | SUPERMARKET | `grocery-supermarket` |
| ริมปิง | `RIMPING` | SUPERMARKET | `grocery-supermarket` |
| ยูเอฟเอ็ม ฟูจิ ซูเปอร์ | `FUJI` | SUPERMARKET | `grocery-supermarket` |

Supply เปรียบเทียบเฉพาะรูปแบบที่เลือกและตัด PHARMACY ออก C_STORE รวม convenience / mini-format ที่ต้นทางจัดไว้ จึงเป็นกลุ่มผู้ให้บริการที่อาจเปรียบเทียบกันได้ ไม่ยืนยันว่าทุกร้านขายสินค้าหรือให้บริการเหมือนกัน ถ้าไม่มี source membership ของแบรนด์ในรูปแบบนั้น ให้แสดง “ยังไม่มีข้อมูลในขอบเขตนี้” ไม่ตีความเป็นสาขาเรา 0

### Non-bank — 10 นิติบุคคลที่มีรายการต้นทางมากที่สุด

| ชื่อแสดง | Exact ID หลัง `legal:` | Scope เริ่มต้น | Preset family |
|---|---|---|---|
| เมืองไทย แคปปิตอล | `0107557000195` | `potential_retail_branch_service` | `nonbank-community` |
| ศรีสวัสดิ์ พาวเวอร์ 2014 | `0105559126747` | `office_context` | `nonbank-community` |
| เงินไชโย · AutoX | `0105564161598` | `vehicle_title` | `nonbank-community` |
| เงินติดล้อ | `0107563000355` | `vehicle_title` | `nonbank-concentrated` |
| ศักดิ์สยาม | `0107559000290` | `vehicle_title` | `nonbank-community` |
| เงินเทอร์โบ | `0107566000542` | `vehicle_title` | `nonbank-community` |
| เฮงลิสซิ่ง | `0107564000120` | `potential_retail_branch_service` | `nonbank-community` |
| นิ่มลีสซิ่ง | `0505560008015` | `potential_retail_branch_service` | `nonbank-community` |
| กรุงศรี ออโต้ · อยุธยา แคปปิตอล ออโต้ ลีส | `0107538000690` | `vehicle_title` | `nonbank-concentrated` |
| ยูโอบี แคปปิตอล เซอร์วิสเซส | `0105528033194` | `personal` | `nonbank-concentrated` |

เลือกเครือข่ายเราได้ 10 ราย แต่ **คู่เปรียบเทียบยังใช้ทุกบริษัทใน scope** ไม่ตัดเหลือเพียง 10 ราย ใช้ exact legal ID ไม่รวมหลายบริษัทเพราะชื่อการค้าคล้ายกัน

Scope ผลิตภัณฑ์หมายถึงใบอนุญาต active ระดับบริษัทที่อาจให้บริการนั้น ไม่ยืนยันผลิตภัณฑ์ของทุกสำนักงาน ศรีสวัสดิ์ พาวเวอร์ 2014 เริ่มที่บัญชีสำนักงานทุกประเภท เพราะ snapshot ยังไม่มี active license ที่ยืนยัน scope ผลิตภัณฑ์ของนิติบุคคลนี้ เว็บไซต์กลุ่มไม่ใช่หลักฐานใบอนุญาตของบริษัทลูก

## 9 Preset families ใช้เกณฑ์อะไร

ทุกธุรกิจเทียบกับฐานประเทศเดียวกัน **7,954 reporting UUIDs: กทม. 180 แขวง + ต่างจังหวัด 7,774 อปท.** ใช้ PERCENTILE.INC ของค่าที่ทราบและใช้ได้ แผนที่กรองจังหวัดหรือเปลี่ยนแบรนด์ไม่คำนวณค่าตัดใหม่ ภายในแต่ละ path ใช้ AND; ระหว่าง path ใช้ OR และเลือก Tier ที่เข้มที่สุดซึ่งมีหลักฐานครบ

คำย่อในตาราง: **คน/หนาแน่น** = ประชากรทะเบียน/ประชากรต่อ ตร.กม.; **ห้อง/หนาแน่น** = ห้องพักโรงแรม/ห้องต่อ ตร.กม. ตัวเลข P เป็นตำแหน่งเมื่อเทียบกับพื้นที่ทั่วประเทศ ไม่ใช่เปอร์เซ็นต์ลูกค้า

| Family | Tier 1 | Tier 2 | Tier 3 | Supply เริ่ม “มาก” เรา/คู่แข่ง |
|---|---|---|---|---|
| `fuel-common` | อาคารทั้ง 3 ≥ P99 หรือกิจกรรม ≥ P95 อย่างน้อย 5/6 ข้อ | อาคารทั้ง 3 ≥ P95 หรือกิจกรรมอย่างน้อย 3/6 ข้อ | อาคารอย่างน้อย 1/3 ≥ P95 หรือกิจกรรมอย่างน้อย 1/6 ข้อ | 3/3 |
| `grocery-convenience` | คน ≥ P75 AND หนาแน่น ≥ P90; หรือคนงานและความหนาแน่น ≥ P90 ทั้งคู่ | คน ≥ P50 AND หนาแน่น ≥ P75; หรือคนงานและความหนาแน่น ≥ P75 ทั้งคู่ | คน ≥ P75 หรือคนงาน ≥ P75 | 2/2 |
| `grocery-community` | คน ≥ P75 AND หนาแน่น ≥ P90 | คน ≥ P50 AND หนาแน่น ≥ P75 | คน ≥ P75 | 2/2 |
| `grocery-supermarket` | คนและหนาแน่น ≥ P90 ทั้งคู่ | คนและหนาแน่น ≥ P75 ทั้งคู่ | คน ≥ P90 | 1/1 |
| `grocery-visitor-context` | สูตร Supermarket หรือห้องและหนาแน่น ≥ P95 ทั้งคู่ | สูตร Supermarket หรือห้องและหนาแน่น ≥ P90 ทั้งคู่ | คน ≥ P90 หรือห้อง ≥ P90 | 1/1 |
| `grocery-hypermarket` | คน ≥ P95 | คน ≥ P90 | คน ≥ P75 | 1/1 |
| `grocery-wholesale` | คน ≥ P95 หรือห้อง ≥ P95 | คน ≥ P90 หรือห้อง ≥ P90 | คน ≥ P75 หรือห้อง ≥ P75 | 1/1 |
| `nonbank-community` | ประชากร 20–64 ปี ≥ P75 AND หนาแน่น ≥ P90 | ประชากร 20–64 ปี ≥ P50 AND หนาแน่น ≥ P75 | ประชากร 20–64 ปี ≥ P75 | 2/2 |
| `nonbank-concentrated` | เหมือน Community | เหมือน Community | คำนวณ Tier 3 ได้ แต่ไม่เลือกเป็น candidate ตั้งต้น (`maxDemandTier=2`) | 2/2 |

Fuel วัดอาคารด้วย GFA (ตร.ม.), GFA/คน และ GFA/ตร.กม. กิจกรรม 6 ข้อคือจำนวนโรงงาน, โรงงาน/ตร.กม., คนงาน, คนงาน/ตร.กม., ห้องพัก และห้องพัก/ตร.กม. ตัววัดที่ใช้ตัวตั้งเดียวกันสัมพันธ์กัน การผ่านหลายข้อไม่ใช่หลักฐานอิสระหลายชิ้น

ค่าตั้งต้นที่รับไว้แล้วของบางจาก, 7Eleven และ MTC ใช้ family override ว่าง `{}` เพื่อคงสูตรเดิม Fuel เลือก Pioneer/FOMO/Our Farm และน้ำหนัก Demand/ช่องว่างเรา/ช่องว่างคู่แข่ง 70/20/10 ส่วน Grocery และ Non-bank เริ่ม Pioneer/FOMO เรียงตามความเข้มของบริบท (`rankingMode=context`); เมื่อเลือก weighted mode ค่าตั้งต้นเป็น 100/0/0 ปรับน้ำหนักได้ แต่ **น้ำหนักเปลี่ยนลำดับ ไม่เปลี่ยนการคัดผ่าน**

สูตรจริงและ AST อ่านจาก [brand registry](../prototype/data/brand-presets.v1.7.json) `families[].criteriaOverrides` ร่วมกับ [industry profiles](../contracts/industry-profiles.json) และ [runtime parameter presets](../contracts/runtime-parameter-presets.json) ห้ามใช้ข้อความในตารางแทน evaluator หรือเปิด arbitrary `eval`

## ข้อมูลบอกได้แค่ไหน

- ประชากรทะเบียนเป็นบริบทคนในพื้นที่; คนงานเป็นจำนวนที่แหล่งโรงงานรายงาน; GFA เป็นค่าประมาณจากแบบจำลอง; ห้องพักเป็นความจุ ไม่ใช่ผู้เข้าพักหรือคนเดินผ่าน ปีข้อมูลโรงแรมยังไม่ทราบ
- โรงงานมากไม่ได้แปลว่าร้านมีลูกค้ามากทุกเวลา ต้องตรวจทางเข้า กะงาน และเส้นทางจริง; Hypermarket/Wholesale ต้องตรวจตลาดข้ามเขต ถนน ที่ดิน ที่จอดรถ และฐานร้านค้า/ผู้ประกอบการเพิ่มเติม
- ประชากร 20–64 ปีคำนวณ `sum(ms[20:65]) + sum(fs[20:65])` เป็นประชากรทะเบียนวัยนั้น ไม่ใช่จำนวนแรงงาน ผู้กู้ หรือความสามารถชำระหนี้
- ค่า 0 ที่ต้นทางวัด/ยืนยันได้คงเป็น 0; missing, suppressed, not-applicable และ unverified ไม่แปลงเป็น 0 การหารต้องมีตัวหาร > 0 ทางเดินเกณฑ์ใหม่ใช้ positive-presence guard; สูตร Fuel เดิมคง literal-zero semantics ตามที่รับไว้
- ถ้า Demand ขาดข้อมูลจนตัดสินไม่ได้ แสดง unknown; path ที่ทราบและผ่านอาจยืนยัน proxy สูงได้ แม้ path อื่นยังขาด แต่ข้อมูลที่ขาดห้ามเลื่อน Tier ให้สูงขึ้น
- Supply เป็นยอดที่ต้นทางผูก reporting UUID รายการ POI และพิกัดเป็นหลักฐานอีกชุด การแก้ POI ใน preview ไม่แก้ยอด snapshot อัตโนมัติ รายการที่ยังผูกพื้นที่ไม่ได้ใช้ขอบเขตค่าที่เป็นไปได้ ไม่แจกเป็นสถานีจริงให้ทุกทำเล
- ถ้า `possiblePatterns` ทุกแบบอยู่ในกลุ่มที่ทีมเลือก → ผ่านเกณฑ์กลยุทธ์; ถ้าผ่านเพียงบางแบบ → รอตรวจ ยังไม่ยืนยัน shortlist **Yolk คือ proxy Demand สูง** ส่วนผ่านเกณฑ์ทีมและเล็งไว้เป็นคนละสถานะ

## แหล่งทางการที่ใช้วางแนวทาง

อ่านวันที่ต้นฉบับและวันที่เข้าถึงใน `sourceRefs` ของ registry (ค้นคว้า 4 ต.ค. 2026) แหล่งต่อไปนี้รองรับบทบาทธุรกิจและรูปแบบร้าน ไม่รับรองสูตรตัวเลขของ Yolk

- [Bangchak: การพัฒนาผลิตภัณฑ์และบริการ](https://sustainability.bangchak.co.th/en/governance-and-economic/sustainable-product-and-service-development), [OR: Business highlights](https://investor.pttor.com/en/financial-info/business-highlights), [PTG: การขยายธุรกิจ](https://sustainability.ptgenergy.co.th/en/economic/business-expansion-transformation) — เครือข่ายสถานีและบริการประกอบเป็นบริบทสำคัญ แต่ยังแทน traffic จริงไม่ได้
- [CP ALL: Customer relationship management](https://www.cpall.co.th/en/sustain/social-dimension/customer-relationship-management), [CP AXTRA: Store models](https://www.cpaxtra.com/en/about-us/store-model), [Big C: About](https://corporate.bigc.co.th/about?lang=en) — ร้านขนาดเล็ก ซูเปอร์มาร์เก็ต ไฮเปอร์มาร์เก็ต และค้าส่งมีบทบาทต่างกัน
- [Tops: สาขา Market Place เทพรักษ์](https://corporate.tops.co.th/news/tops-under-central-retail-launches-new-branch-at-market-place-theprak-a-prime-phahonyothin-watcharapol-location-targeting-affluent-communities-and-strategic-malls-in-its-drive-to-become-thai/) — ใช้บริบทชุมชนและศูนย์จับจ่ายประกอบการเลือกทำเล; Yolk ยังไม่ได้วัดกำลังซื้อของชุมชนนั้น
- [MTC: Risk management](https://sustainability.muangthaicap.com/th/Sustainability/risk.html), [Tidlor: Nature of business](https://www.tidlorinvestor.com/th/corporate-information/nature-of-business) — พื้นที่ ประชากร และเครือข่ายมีประโยชน์ต่อการวางสาขา; ข้อมูลใบอนุญาตต้องแยกจากบริการของสาขา

## ตัวอย่างผลคำนวณเริ่มต้น

ประเมินด้วย evaluator และ source snapshot จริง ณ 4 ต.ค. 2026, registry 1.7.0, ฐาน 7,954 ทำเล โดยใช้ Supply แบบนับจำนวนซึ่งเป็น baseline เดิม ตารางนี้ตรวจการทำงานของเกณฑ์ ไม่ใช่ผลตั้งต้นของโหมด Supply เทียบขนาดตลาดที่เพิ่มในรุ่นนี้ และไม่ใช่หลักฐานประสิทธิภาพการขาย ผลของโหมดหลักคำนวณใหม่ตามบริบทและตัวหารที่เลือก ดู [เกณฑ์ Supply เทียบขนาดตลาด](SUPPLY_RELATIVE_PROPOSAL.md)

| บริบทแรก | proxy Demand สูง | ผ่านกลุ่มกลยุทธ์ที่เลือก | รอตรวจ Supply |
|---|---:|---:|---:|
| บางจาก · All fuel | 1,067 | 915 | 79 |
| 7Eleven · C_STORE | 2,859 | 1,455 | 14 |
| Lotus's · Hypermarket | 1,958 | 1,797 | 0 |
| Big C · Hypermarket | 1,958 | 1,850 | 0 |
| Tops · Supermarket | 1,410 | 1,287 | 0 |
| Makro · Wholesale | 2,981 | 2,832 | 0 |
| MTC · Active retail family | 2,298 | 37 | 1,378 |
| Tidlor · Vehicle-title | 2,298 | 99 | 738 |

Tidlor คำนวณ proxy สูงได้ 2,298 ทำเล แต่ preset เลือกเฉพาะ Tier 1–2 จึงเหลือ 1,086 ก่อนกรอง Supply ค่า “รอตรวจ 0” หมายถึง evaluator ไม่พบความกำกวมในขอบเขต snapshot ที่ใช้ ไม่ยืนยันว่าฐานข้อมูลครบหรือไม่มีความเสี่ยงภาคสนาม

## ภาพจำและโลโก้

หมุด **O = Our stores / สาขาเรา**, **C = Competitors / คู่แข่ง** ส่วนคำว่า Yolk ใช้ icon `egg_alt` เดิมที่ bundle ไว้แทนตัว o พร้อมชื่อสำหรับ screen reader การเปลี่ยนตัวอักษรที่แสดงไม่เปลี่ยน legal ID, source field หรือความหมายสูตรเดิม

โลโก้ในตัวเลือกแบรนด์ใช้ graphic หรือป้ายสาขาขนาดกะทัดรัดจากไฟล์ทางการที่ตรวจภาพแล้ว วางในพื้นที่สี่เหลี่ยม 44px โดยคงสัดส่วนและมีชื่อแบรนด์อ่านได้อยู่ข้างกัน ใช้เฉพาะรายการที่ `verifiedSquareGraphic=true`; ตัวอักษรที่เป็นส่วนหนึ่งของป้ายทางการคงไว้ได้ แต่ไม่ใช้ lockup แนวนอนยาว ไม่ตัดภาพหรือสร้างสัญลักษณ์ใหม่เอง URL/hash/theme variant และข้อจำกัดความคมชัดอยู่ใน [logo manifest](../prototype/data/brand-logos.v1.7.json) ถ้ายืนยันไม่ได้หรือไม่เหมาะกับธีม ใช้ชื่อและไอคอนกลาง ห้ามสร้างโลโก้แทน ค้นชื่อคล้ายแล้วสวมตัวตน ยืด เปลี่ยนสี หรือเพิ่มกรอบ/แผ่นรองโลโก้ โลโก้ Landometer และ icon bundle คงเชื่อมกับ LDS 0.9.7 ตาม [DS asset integration](../DS_ASSET_INTEGRATION.md)

## งานสำหรับ dev: ทำทีละขั้น

| ขั้น | ทำอะไรและอ่านไฟล์ไหน | เกณฑ์รับงาน |
|---|---|---|
| 1 | อ่าน contract นี้, registry, profiles และ metric catalogue | resolve 37 Exact IDs, 9 families, scope และ sourceRefs ได้ครบ; Bangchak/7Eleven/MTC override ยังเป็น `{}` |
| 2 | ต่อ brand picker และ `YolkBrands.seed()` ใน `prototype/brand-experience.js` | unseen context ได้ preset ที่ normalize ผ่าน; ห้ามแก้ preset กลางหรือ saved state |
| 3 | ต่อ scope/context ใน `prototype/industry-workspace.js` | ครั้งแรก Tops→Supermarket, Lotus/BigC→Hypermarket; กลับมาคงรูปแบบล่าสุด เกณฑ์ แบบร่าง และ shortlist |
| 4 | ต่อ evaluator ใน `prototype/model.js` ด้วย AST และข้อมูล exact UUID | all/OR/Tier, valid zero/unknown, denominator และ fixed cohort ตรง contract; unavailable own scope ไม่เป็น 0 |
| 5 | ต่อการแก้แบบร่างและ Apply ใน `prototype/app.js` | ลองค่าเห็นผลบนแผนที่ ไม่มี event; Apply ที่มี diff สร้าง revision/event ครั้งเดียว; conflict ไม่ทับงาน |
| 6 | ใช้ icon และ asset จาก `prototype/icons.js` + logo manifest | O/C ถูกทั้งหมุดและคำอธิบาย; egg_alt อ่านชื่อ Yolk ได้; โลโก้ถูกตัวตน อ่านได้ทั้งธีม หรือใช้ fallback |
| 7 | ตรวจ UX จริง ไทย/อังกฤษ ทั้ง mobile/desktop และ light/dark | แผนที่อยู่ให้เห็นระหว่างปรับค่า; picker/modal/slider ใช้ keyboard/touch ได้; ไม่ล้นหรือทับข้อความ |
| 8 | รัน regression และตรวจผลเริ่มต้นทุกแบรนด์ | `scripts/check-brand-presets.cjs`, `scripts/check-three-industry.cjs`, `scripts/check-photo-runtime.cjs` ผ่าน; ไม่ใช้ยอดคัดผ่านเป็นเป้าหมายปรับสูตร |

ก่อนเป็น production ให้เพิ่ม context persistence และ optimistic locking ฝั่ง server, บังคับสิทธิ์ 1 Admin / 3 Editors / 6 Viewers และ event/outbox transaction เดียวกัน ทดสอบว่า tenant/brand/scope แยกกันจริง การตรวจ snapshot หรือ static preview ยังไม่พิสูจน์การ sync หรือส่ง notification จริง

Machine handoff: [brand-experience.v1.7.json](../contracts/brand-experience.v1.7.json) ระบุ state precedence, AST pointers, bindings, assertions และผลคำนวณตัวอย่าง ใช้คู่กับ registry ไม่คัดสูตรไปสร้าง authority อีกชุด
