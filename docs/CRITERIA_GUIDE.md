# เกณฑ์ตั้งต้น Yolk: Fuel, Grocery และ Non-bank

> **สถานะฉบับนี้:** บันทึกเกณฑ์ Demand และผลตั้งต้นแบบนับสาขาของ 1.6 ใช้เป็น baseline ย้อนหลัง ใน 1.7 บริบทแบรนด์ที่เริ่มใหม่ใช้ **สาขาเทียบขนาดตลาด** เป็นหลัก: ปั๊มน้ำมันต่อ GFA 100,000 ตร.ม. และ Grocery/Non-bank ต่อประชากร 10,000 คน ส่วนเกณฑ์นับสาขาที่บันทึกไว้ยังคงเดิม ดู [คู่มือ Supply ปัจจุบัน](SUPPLY_RELATIVE_PROPOSAL.md), [brand presets](BRAND_PRESETS_v1.7.md) และ [implementation plan 1.7](../IMPLEMENTATION_PLAN_v1.7.md) ก่อนพัฒนาต่อ

ฉบับ 3 ตุลาคม 2026 สำหรับเดโมและงานสำรวจทำเล ใช้ข้อมูล CityMETER ที่ดึงจริงวันที่ 3 ตุลาคม 2026 ครบจักรวาลพื้นที่รายงาน 7,954 UUID: แขวงกรุงเทพฯ 180 แห่ง และ อปท.นอกกรุงเทพฯ 7,774 แห่ง รวมพัทยา **ข้อมูลมีจริง แต่เกณฑ์ Grocery/Non-bank ยังเป็นสมมติฐานสำหรับคัดคิวสำรวจ ไม่ใช่เกณฑ์ที่ยืนยันยอดขายหรือผลสินเชื่อแล้ว** Fuel คงค่าที่ผู้ใช้รับไว้ใน criteria v1.4

ไฟล์เครื่องหลักคือ [criteria-proposal.json](../contracts/criteria-proposal.v1.6.json) มี 25 metrics ที่เชื่อมข้อมูลจริง, `datasetId`, `sourceField`, `formulaAST`, หน่วย ตัวหาร grain/cohort ประเภทหลักฐาน และ source period; `runtimeParameterPresets` ให้ค่าเริ่มต้นรายอุตสาหกรรม ส่วน [context-diagnostics.json](../evidence/context-diagnostics.json) มี cutoff จริงจาก snapshot, จำนวนพื้นที่ผ่าน, sensitivity และตัวอย่างพื้นที่จากข้อมูลจริง ตัวอย่างเหล่านี้ไม่มีผลสำรวจหรือยอดธุรกิจที่แต่งขึ้น

## สิ่งที่ผลลัพธ์หมายถึง

แยก 4 ค่าเสมอ: **Tier** คือความแรง/ความเข้มข้นของ proxy ตาม profile; **Supply pattern** คือมาก/น้อยตามโหมดที่เลือก—อัตราสาขาต่อขนาดตลาด หรือจำนวนสาขา; **evidence coverage** คือข้อมูลที่มีและข้อจำกัด; **rank** คือการเรียงพื้นที่ที่ผ่านแล้ว Tier ไม่ใช่ความมั่นใจเป็นเปอร์เซ็นต์ และสัญญาณ count/density ที่สัมพันธ์กันไม่ใช่หลักฐานอิสระหลายชิ้น

Yolk ในชุดนี้หมายถึง “ผ่านเกณฑ์บริบท Demand proxy ที่ระบุไว้” ต้องแสดงชื่อแกนให้เห็น: Fuel = สิ่งปลูกสร้าง/กิจกรรม, Grocery = ประชากรทะเบียน/คนงานที่รายงาน, Non-bank = บริบทตลาดบริการจากประชากรทะเบียนอายุ 20–64 ปี **ความต้องการลูกค้าที่วัดจริงยังไม่ทราบทั้งสามอุตสาหกรรม** โดยเฉพาะ Non-bank ไม่ได้วัดความต้องการกู้ คุณสมบัติผู้กู้ ความเดือดร้อนด้านหนี้ หรือความสามารถชำระหนี้

## ค่าเริ่มต้นที่ทดลองและปรับได้

| อุตสาหกรรม/เส้นทาง | Tier 1 | Tier 2 | Tier 3 | การรวม |
|---|---|---|---|---|
| Fuel: GFA 3 ค่า | GFA, GFA/คน, GFA/ตร.กม. ทุกค่า ≥ P99 | ทุกค่า ≥ P95 | อย่างน้อย 1 ค่า ≥ P95 | Building **OR** Activity |
| Fuel: Activity 6 ค่า | ≥ P95 อย่างน้อย 5 ค่า | 3–4 ค่า | 1–2 ค่า | Count/density โรงงาน, คนงาน และห้องโรงแรม |
| Grocery: ประชากรทะเบียน | จำนวน ≥ P75 **AND** density ≥ P90 | จำนวน ≥ P50 **AND** density ≥ P75 | จำนวน ≥ P75 | Population **OR** Reported workplace |
| Grocery: คนงานโรงงานที่รายงาน | จำนวน ≥ P90 **AND** density ≥ P90 | จำนวน ≥ P75 **AND** density ≥ P75 | จำนวน ≥ P75 | ตรวจเวลาทำงาน กะ ทางออก และ frontage ก่อนตีความเป็นโอกาสร้าน |
| Non-bank: ประชากรทะเบียนอายุ 20–64 | จำนวน ≥ P75 **AND** density ≥ P90 | จำนวน ≥ P50 **AND** density ≥ P75 | จำนวน ≥ P75 | บริบทตลาดบริการ; การกู้จริงยัง UNKNOWN |

เลือก Tier ที่ดีที่สุดซึ่งมีข้อมูลยืนยันว่าผ่านจริง Tier 3 แบบจำนวนมากช่วยไม่ทิ้ง อปท.ขนาดใหญ่ที่คนกระจายตัว แต่ต้องตามไปหาชุมชนและทางเข้าจริง ไม่อ้างว่า density สูง ถ้าข้อมูลบางเส้นทางไม่ครบ เส้นทางที่ผ่านด้วยข้อมูลครบยังยืนยัน proxy-high ได้; missing อาจทำให้ไม่ทราบว่าได้ Tier ที่แรงกว่านั้นหรือไม่ ห้ามใช้ missing เลื่อน Tier

P50/P75/P90 เป็นค่าเริ่มต้นเพื่อคัดบริบทปานกลางถึงกลุ่มบนอย่างอ่านได้ ไม่ได้มาจาก cutoff บริษัทหรือการเรียนรู้ยอดขาย แม้ Grocery และ Non-bank ใช้รูปแบบ volume+concentration คล้ายกัน แต่ใช้ numerator/ความหมายคนละแบบ และปรับแยกกันได้ ค่าจริงต้องคำนวณใหม่เมื่อเปลี่ยน source release

**ทุกอุตสาหกรรมใช้ percentile จากจักรวาลพื้นที่ทั้งประเทศเดียวกัน 7,954 UUID** ตามกติกาที่ผู้ใช้รับไว้ โดยแต่ละ metric ใช้ค่าที่ valid จริงและไม่เติม missing เป็น 0 การกรองจังหวัดหรือเลือกแบรนด์ไม่เปลี่ยน cutoff ความต่างระหว่าง grain แขวง/อปท.เป็นข้อจำกัดที่ต้องแสดง; diagnostics ของสอง grain มีไว้ตรวจ sensitivity เท่านั้น ไม่เปลี่ยน initial preset การเลือก cohort อื่นในอนาคตต้องเป็นการเปลี่ยนที่ผู้ใช้เลือกและมี criteria/cohort version ใหม่

## Dataset และสูตรต้องดูได้ในหน้าเกณฑ์

| Dataset | สูตรหลัก | บทบาท/ข้อจำกัด |
|---|---|---|
| Population | `sum(ms)+sum(fs)`; อายุ 20–64 = `sum(ms[20:65])+sum(fs[20:65])`; density = จำนวน ÷ `base.areaSqm/1e6` | ประชากรที่ต้นทางรายงาน/ทะเบียน ไม่ใช่ผู้อาศัยจริง คนทำงาน ผู้ซื้อหรือผู้กู้; cohort อายุไม่ใช่กฎคุณสมบัติสินเชื่อ |
| Building | V4 `area`; GFA/คน = GFA ÷ population; density = GFA ÷ area km² | GFA จากโมเดล ไม่มี residential/daytime/occupied breakdown ที่ยืนยันแล้ว จึงปิดใน Grocery/Non-bank default |
| Factory/ACTIVE | `totalFactory`, `totalWorker`; density ÷ area km² | 5,822 พื้นที่มีข้อมูล 2,132 พื้นที่ยังไม่ทราบ คนงานไม่ใช่ attendance หรือจำนวนผู้เข้าร้าน |
| Hotel | `roomCount`, `hotelCount`; density ÷ area km² | 7,506 พื้นที่มีข้อมูล 448 ยังไม่ทราบ ห้องเป็น inventory ไม่ใช่ occupancy/นักท่องเที่ยว; แสดงแยกใน Grocery และปิดใน default |
| Office | `officeCount` V3 | ตัวเลือกบริบทที่ต้องแสดง coverage; snapshot ปัจจุบันมีเพียง 45 positive rows ในกรุงเทพฯ อีก 7,909 พื้นที่ missing; ปิดใน nationwide presets และห้ามเติมศูนย์เอง |
| Fiscal | `(selfCollected+stateAllocated)*1,000,000`; แยก grants; ตัวหารรายปีตรง source | บริบทการคลังท้องถิ่น ไม่ใช่รายได้/กำลังซื้อครัวเรือนหรือความต้องการกู้ ปิดใน Grocery/Non-bank demand defaults |

metric picker แสดง formula template และหน่วยก่อนใช้ Engine รองรับ AND/OR และ positive guard ตาม preset ส่วน UI รุ่นนี้ปรับ dataset/metric, percentile, จำนวนข้อที่ต้องผ่านของ Fuel, กลุ่มที่เปิดใช้, Supply และ weights ได้ การเปลี่ยนทุก operator, absolute minimum หรือสร้าง formula ใหม่เป็นงานพัฒนาต่อ ห้ามรันสูตร JavaScript อิสระ ค่า denominator ≤ 0 หรือข้อมูลขาดเป็น UNKNOWN; measured zero, catalog zero ที่พิสูจน์แล้ว, missing, suppressed และ not-applicable ต้องแยกกัน ไม่มี default การใช้เพศ/เด็ก/Locale Insight เพื่อกำหนดสินเชื่อหรืออ้างพฤติกรรม

## รูปแบบร้าน ผลิตภัณฑ์ และ Supply

Grocery เริ่มที่ **convenience / 7-Eleven** (`grocery-brand:SEVEN_ELEVEN`) แยก format จากแบรนด์: convenience, mini-supermarket, supermarket, hypermarket และ wholesale มี mission ต่างกัน CP AXTRA แยก supermarket/mini-supermarket และ wholesale หลายรูปแบบตามบริบทชุมชน/ผู้ประกอบการ; จึงรองรับเป็น format profiles ภายในอุตสาหกรรมเดียว [คำอธิบายรูปแบบร้านจากผู้ดำเนินการ](https://www.cpaxtra.com/en/about-us/store-model) [กลยุทธ์ปี 2026](https://www.cpaxtra.com/en/investor-relations/overview)

`C_STORE` ใช้คัด source-scope เบื้องต้นได้ แต่ไม่ได้พิสูจน์ว่าทุกจุดเป็น convenience รูปแบบเดียวกัน C_STORE ที่ยังไม่ review เป็น “potential nearby providers” ส่วน direct peers ต้องยืนยัน format/mission/channel; supermarket, hypermarket, wholesale และ Pure Pharmacy ไม่ปนใน convenience direct peers ไม่ใช้ `saleAreaSqm` หรือ `est_traffic_per_day` ที่ต้นทางกำหนดตามประเภทเป็น footfall/พื้นที่ขายที่วัดจริง [CP ALL 2025 MD&A ระบุธุรกิจ convenience และ offline/online channels](https://market.sec.or.th/public/idisc/Download?FILEID=dat/news/202602/0737NWS250220261736173740E.pdf)

Non-bank เริ่มบริษัท **เมืองไทย แคปปิตอล** (`legal:0107557000195`) แยก legal company, license, source office, HQ, mapped office และจุดที่ยืนยัน product/function แล้ว บริษัทที่มี license เป็นเพียง potential product provider จนกว่าจะตรวจบริการระดับจุด; title loan, personal loan, nano, hire purchase/leasing, pico/pico-plus ต้องเลือกแยกและ union office IDs เมื่อมีหลายผลิตภัณฑ์ [ขอบเขตธุรกิจตาม BOT](https://www.bot.or.th/th/our-roles/financial-institutions/Thailand-financial-institutions-and-financial-service-providers/financial-business-under-the-BOT-supervision.html)

การใช้ population volume/concentration เป็นบริบทการขยายบริการมีเหตุผลรองรับ: MTC ระบุ area potential, population density, กลุ่มลูกค้า ผลของสาขาใกล้เคียง และ payback/ROI ในกระบวนการเปิดสาขา แต่ไม่ได้ให้ cutoff แบบ Yolk หรือยืนยันว่าประชากรพื้นที่ใดต้องกู้ [MTC: Cost-Effectiveness of Branch Expansion, ผลปี 2025](https://sustainability.muangthaicap.com/en/risk.html) จุดบริการและช่องทางดิจิทัลอาจทำงานร่วมกัน จึงต้องสำรวจ access/hours/channel [Tidlor: ผลปี 2025](https://www.tidlorinvestor.com/en/updates/press-releases/347/tidlor-posts-record-2025-net-profit-of-4963-million-baht-up-174-yoy-delivers-quality-growth-in-insurance-brokerage-and-lending-with-npl-at-15)

คงชื่อและ mapping 8 patterns เดิม: **Crowded, FOMO, Our Farm, Pioneer, Quiet, Their War, Our Island, Winter War** และคง MORE/LESS ตาม threshold จำนวน Fuel = 3/3 ที่รับไว้; Grocery/Non-bank เสนอ **2/2 เป็นสมมติฐาน editable** เพื่อแยกเครือข่ายที่มีจุดซ้ำในพื้นที่จาก 0/1 จุด ข้อมูล C_STORE ล่าสุดพบ 2 เท่ากับ median ของพื้นที่ที่มี Seven-Eleven และ P75 ของพื้นที่ที่มีแบรนด์อื่น; MTC พบ 2 เท่ากับ P75 ของพื้นที่ที่มีสำนักงานเรา แต่ยังไม่ใช่ cutoff ความอิ่มตัวหรือ capacity ที่บริษัทรับรอง ต้องบอกค่าและขอบเขตใน UI ไม่เปลี่ยนความหมายเป็นมี/ไม่มีอย่างเงียบ ๆ

Non-bank comparator เริ่มต้นคือ **บริษัทที่ต้นทางระบุ license รายย่อย active อย่างน้อยหนึ่งรายการใน nano/ploan/ploan_car/pico/pico_plus** รวมเป็น union แล้วเทียบ MTC กับบริษัทอื่นในกลุ่มนี้ พบ 1,219 บริษัทใน directory; อีก 6 บริษัทมีสถานะ license not-found/unknown ที่ต้อง review แยกหรือรวมใน upper context เท่านั้น ไม่เรียกทั้งฐานว่า lender peers และไม่ถือว่ารายที่ยังตรวจไม่พบเป็น nonlender โดยอัตโนมัติ บริษัทมี license เป็น potential provider แต่ function/product ระดับสำนักงานยังไม่ยืนยัน ฐาน holding/FX/fund/HQ อื่นเป็น diagnostic แยก เมื่อเลือก product ให้แยก potential company-license peers จาก confirmed point-product peers ถ้าตำแหน่ง/function/product ยังไม่พอ ให้แสดง possible patterns/review; proxy-Yolk ที่มีหลักฐานบริบทผ่านยังดูและจัดคิวสำรวจได้

Supply มาจาก aggregate UUID ของพื้นที่เดียวกัน ไม่ฉาย POI ตำบลไปเป็น อปท.ด้วยชื่อหรือ bbox ยอด Grocery aggregate ทุกพื้นที่รวม 27,608 แถวเท่าต้นทาง (รวม Pure 150; default Grocery ไม่รวม pharmacy) แต่ category ไม่ตรงทั้งหมด: Seven-Eleven สุราษฎร์ธานี −1 และ Toogdee นครราชสีมา +1 หักล้างในยอดรวม ต้องเก็บ discrepancy และไม่สร้างแถวเติม แต่ Non-bank ระดับพื้นที่รวมสำนักงาน 17,990 แถว เทียบต้นทาง 23,524: อีก 5,534 ยังไม่จัดพื้นที่ละเอียด; mapped 17,752 รวมตรงต้นทาง MTC จัดพื้นที่ได้ 6,462 จาก 8,738 **local zero หมายถึงไม่มีแถวที่ต้นทางจัดมาในพื้นที่นั้น ไม่ได้พิสูจน์ว่าไม่มีสำนักงานจริง/คู่แข่ง** ใช้ residual รายจังหวัด/บริษัทที่อยู่ใน comparator เป็น per-area upper possibilities ไม่จัด residual ทุกแถวลงทุกพื้นที่พร้อมกัน ความไม่ทราบตำแหน่งหรือผลิตภัณฑ์ไม่ใช่ U แบบ Fuel ซึ่งไม่ทราบเพียงแบรนด์

## การจัดอันดับและการปรับรายแบรนด์

Fuel คง weighted ranking v1.4 (70/20/10) พร้อม interval ของ missing และกฎเดิม Grocery/Non-bank แนะนำเริ่มด้วยลำดับที่อ่านง่าย: **Tier ที่ยืนยันแล้ว → percentile ของค่าที่อ่อนที่สุดในเส้นทางที่ผ่าน → UUID** เลือกเส้นทางที่แรงที่สุดเมื่อ Tier เท่ากัน ไม่บวกคะแนนเพราะ supply บางโดยถือว่าเป็น unmet demand

เริ่ม strategy สำหรับ Grocery/Non-bank ที่ **Pioneer และ FOMO** เพื่อสำรวจพื้นที่ที่จุดเราอยู่ต่ำกว่า threshold ทั้งเมื่อมีและไม่มีเครือข่ายอื่นมาก Our Farm เปิดเลือกได้พร้อมตรวจ cannibalisation/ขนาดเครือข่ายเดิม; ไม่สรุป Crowded ว่าอิ่มตัวหรือทำเลไม่ดี ทุก pattern ยังเป็น checkbox ที่ปรับได้ ส่วน **All Yolk** แสดงทุกพื้นที่ที่ผ่าน Demand proxy โดยไม่ใช้ strategy filter หากทุก possible patterns อยู่ในชุดที่เลือก สามารถยืนยัน strategy match ภายในขอบเขต inventory ได้แม้ชื่อ pattern ยังไม่แน่นอน ถ้ามีเพียงบาง possibility ที่ตรง ให้เป็น review candidate

หาก UI ใช้ weighted mode ค่าเริ่มต้นสำหรับสองอุตสาหกรรมใหม่เสนอ Demand/context 100, own-gap 0, other-gap 0; metrics ภายในกลุ่มน้ำหนักเท่ากัน และ Grocery population/workplace เท่ากัน ค่านี้เป็นนิยามโปร่งใสสำหรับลองจัดอันดับ ไม่ใช่น้ำหนักที่ผ่าน calibration ผู้ใช้ปรับได้และ missing ต้องคงน้ำหนักเต็มพร้อม lower/upper bounds การเปลี่ยนน้ำหนักไม่เปลี่ยนจำนวนผ่าน Tier หรือ pattern

บันทึก criteria ด้วย `workspace + industry + own entity + format + product + criteria version` แต่ละแบรนด์ปรับ dataset/metric/สูตรที่รองรับ, percentile, จำนวนข้อที่ต้องผ่านของ Fuel, Supply และน้ำหนักแยกกันได้ โครง AND/OR เริ่มตาม preset; generic formula/operator builder เป็นงานพัฒนาต่อ การสลับแบรนด์ต้องคืนเกณฑ์ของแบรนด์นั้นและไม่ลบของแบรนด์ก่อนหน้า Draft preview ก่อน **Apply** แล้ว commit หนึ่ง event พร้อม diff/ผู้แก้/เวลา/source/cohort versions; Fuel ที่ทีมรับไว้ไม่ถูก overwrite จาก preset ใหม่

## ผลคำนวณและงานถัดไป

Demand-only diagnostics จาก snapshot ปัจจุบันและ **national cutoff เดียวกัน** (ยังไม่ใช้ Supply/pattern gate): Fuel 1,067 พื้นที่ proxy-high, 2,308 unknown; Grocery 2,859 proxy-high, 1,930 unknown; Non-bank 2,298 service-context proxy-high, 124 unknown จำนวนนี้ไม่ได้หมายถึงสาขาที่ควรเปิด ดู Tier 1/2 ก่อนและใช้ Tier 3 เป็นคิวค้นหาจุดรวมตัวในพื้นที่ใหญ่

ผล **baseline แบบนับสาขาของ 1.6** เมื่อใช้ strategy เริ่มต้นและความไม่แน่นอนของ source inventory: Fuel มี 915 confirmed strategy matches และ 79 review possibilities; Grocery 1,455 confirmed และ 14 review; Non-bank 37 confirmed และ 1,378 review ตัวเลขนี้ไม่ใช่ค่าเริ่มต้น relative Supply ของ 1.7 การจัดพื้นที่ Non-bank ไม่ครบทำให้ชื่อ pattern จำนวนมากยังไม่แน่นอน แต่ยังมี proxy-high และคิวตรวจที่ใช้ได้ ค่า raw-assigned patterns ไม่ใช่ pattern ที่ยืนยันแล้ว ดู [supply-pattern-diagnostics.json](../evidence/supply-pattern-diagnostics.json) สำหรับ baseline counts แยกและ bounds ที่ใช้

ค่า cutoff จริงแยก grain อยู่ใน `context-diagnostics.json` เปลี่ยน cutoffs ±5 percentile points ทำให้สมาชิกเปลี่ยนอย่างมีนัยสำคัญ จึงต้องแสดงว่าเป็น hypothesis ตัวเลขที่แสดงอาจปัดเพื่ออ่าน แต่ filtering ใช้ค่าจริงไม่ปัด

Fuel literal `>= cutoff` เดิมทำให้ศูนย์อาจผ่านเมื่อ cutoff เป็นศูนย์ ต้องเตือนกรณีนี้และมีตัวเลือก refinement `value>0 AND >=cutoff` แบบ version/event ใหม่ ไม่แก้ที่รับไว้เงียบ ๆ การทดสอบกับ core defaults snapshot นี้ไม่พบสมาชิก/Tier เปลี่ยนจาก positive guard กรณี historical closed office catalog ที่ตรวจไว้วันที่ 23 ก.ย.มี catalog zeros จน P95=0 เป็นตัวอย่างความเสี่ยงนี้ ไม่ใช่ cutoff ของ snapshot ใหม่: ปัจจุบัน 45 valid rows ให้ P95=20.8 และที่เหลือ missing ต้องแสดง scope/version ให้ตรง

ทดสอบภาคสนามให้มีพื้นที่ Tier 1/2/3, ต่ำกว่าเกณฑ์ และ unknown ใน grain/format/product ที่เทียบกันได้ ตรวจผู้อาศัย/กิจกรรมที่เกิดจริง ทางเข้า เวลาเปิด รูปแบบร้าน/function/product ค่าเช่า/ต้นทุน และ own-network overlap ก่อนตัดสิน site. ใช้ผลของสาขา/ธุรกรรม/aggregate inquiries ที่นิยามแล้วเพื่อปรับ cutoff ภายหลัง ประเมินนอกช่วงเวลาและพื้นที่ที่ใช้ตั้งเกณฑ์ ไม่ดูเฉพาะผู้ชนะใน shortlist

Bangchak แยก retail station network, industrial channels และ non-oil services ใน disclosure; urban GFA จึงไม่แทน highway through-traffic พื้นที่ที่ไม่ผ่าน urban proxy ยังเป็น corridor-review task ได้เมื่อมีรถผ่าน ทิศทาง เข้าออก frontage และจุดบริการที่ยืนยันแล้ว ไม่แต่ง highway threshold [Bangchak: ผลปี 2025](https://www.bangchak.co.th/en/newsroom/bangchak-news/1832/bangchak-group-reports-2025-financial-performance-continued-synergy-realization-expanding-global-reach-strengthening-long-term-growth)

source period ยังต่างกัน: ประชากร ส.ค.2026; Factory เม.ย.2025; Building V4/label ธ.ค.2024; Office V3/label พ.ค.2025; Hotel ไม่เผย effective date การดึงวันนี้ไม่ได้ทำให้ observations ทุกชุดเป็นวันนี้ ประชากร อปท.ที่ CityMETER รายงานยังไม่ได้ตรวจการสร้างข้อมูลจาก official source อย่างอิสระ และยอดจังหวัดส่วนใหญ่ไม่ reconcile กับยอดพื้นที่ ห้ามกระจาย residual หรือ scale ให้ตรงเอง Locale Insight ใช้ประกอบคำถามภาคสนามเท่านั้น ไม่ใช้แทนประชากร official, boundary, behavior หรือ eligibility

ผล [independent criteria checks](../evidence/independent-criteria-check.json) และ [Supply checks](../evidence/independent-supply-check.json) ตรวจ model invariants พร้อมระบุ integration protocols ที่ยังต้องทำ ส่วน [core runtime checks](../evidence/three-industry-core-checks.json) และ [browser QA](../evidence/QA.md) เป็นหลักฐานตรวจการเชื่อมเดโมจริง ดู [implementation plan](../IMPLEMENTATION_PLAN_v1.6.md) สำหรับระบบ production; preview ยังไม่ใช่ sales calibration, live Sheets sync หรือ shared backend
