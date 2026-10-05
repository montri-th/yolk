---
version: 1.7.5
status: release_pending_current_QA
contract: contracts/branch-context.v1.7.5.json
baseline: 1.7.4
---

# ข้อมูลสาขาที่รู้แล้ว ควรช่วยกรอกให้ — Yolk 1.7.5

เมื่อทีมเปิดสาขา หรือกรอกพิกัด ระบบควรนำข้อมูลที่มีอยู่มาช่วยกรอกจังหวัดและทำเล พร้อมแสดงตัวเลือกที่เกี่ยวข้อง ผู้ใช้ไม่ต้องหาใหม่จากรายการทั่วประเทศ แต่ยังเลือกแก้เองได้ โดยไม่เสียชื่อ โน้ต รูป หรือสิ่งที่กำลังทำอยู่

ขอบเขตนี้ครอบคลุม branch editor, ค่าเริ่มต้นจากแผนที่/ตัวกรอง, แบรนด์และประเภทสาขา, dropdown ที่พึ่งพากัน, รูปแบบร่าง และรายการ Supply ที่กรองตามพื้นที่ คงสาม industries เดิม รวมถึงสูตร Demand/Supply, national cohort, LDS 0.9.7, สีแผนที่และ camera behavior เดิม

**สถานะ:** เป็น contract ของ candidate 1.7.5 ซึ่งยังรอตรวจ QA และ release ไม่ใช่คำรับรองว่า backend, สิทธิ์ทีม หรือการตรวจสถานีจริงพร้อมใช้งานแล้ว

## 1 · ใช้ข้อมูลเดิมก่อน แล้วค่อยเสนอจากพิกัด

ลำดับการใช้ข้อมูลใน editor:

1. ข้อมูลที่ผู้ใช้แก้เองใน draft ปัจจุบัน รวมถึงตัวเลือกที่กดใช้แล้ว
2. ข้อมูลที่บันทึกไว้ใน branch overlay และ source record โดยแยกที่มาของสองส่วน
3. จังหวัด/UUID พื้นที่ที่ต้นทางระบุและใช้ได้
4. ข้อเสนอจากพิกัดที่อยู่ภายใน source polygon เพียงพื้นที่เดียวอย่างชัดเจน
5. บริบทแผนที่และตัวกรองปัจจุบัน **สำหรับสาขาใหม่เท่านั้น**

แสดงค่าเริ่มต้นที่รู้จริงก่อน ไม่เติมกรุงเทพฯ หรือ `Y.selected` เก่ามาแทนช่องว่างของ existing record ข้อมูลจากพิกัดช่วยกรอก draft ได้ แต่ไม่เขียนทับ source ไม่ยืนยันขอบเขตกฎหมาย ไม่ยืนยันว่าเป็นสาขาเดียวกัน และไม่ยืนยันว่ายังเปิดให้บริการ

หากค่าที่บันทึกไว้/ผู้ใช้เลือกเองขัดกับข้อเสนอ ให้แสดงสองชุดและปุ่ม **“ใช้พื้นที่จากพิกัด” / “Use coordinate suggestion”** การเปลี่ยนต้องมาจากการกดปุ่มของผู้ใช้ ไม่แทนค่าทันทีเมื่อโหลด geometry เสร็จ

## 2 · เมื่อกรอกหรือเปลี่ยนพิกัด

- อ่าน latitude/longitude เป็นคู่ รักษาทศนิยมเดิม ช่องว่าง ค่าที่ไม่ครบ หรือค่าผิดรูปแบบไม่ถูกแปลงเป็น 0; คู่ตัวเลข 0/0 ที่ถูกต้องยังเป็นคู่พิกัด แต่หากอยู่นอกข้อมูลไทยจะไม่มีข้อเสนอพื้นที่
- ใช้ source polygons ของจังหวัด อำเภอ และ fine locations ที่มีอยู่ โหลด fine files ตามจังหวัดจาก `hierarchy-index.json` และ cache ผล ใช้ bounding boxes เพื่อคัด candidates ได้ แต่ห้ามใช้กรอบหรือพื้นที่ใกล้ที่สุดเป็นคำตอบ
- แยก `inside`, `boundary`, `outside` สำหรับ Polygon/MultiPolygon รวม holes ไม่จับจุดบนเส้นขอบเป็น strict interior
- เติมจังหวัด/ทำเลอัตโนมัติเฉพาะข้อเสนอที่เป็น **unique strict interior** และช่องนั้นยังว่างหรือเป็นค่าเริ่มต้นที่ระบบเติมไว้ หากจังหวัดที่บันทึกไว้ขัดกัน ให้ใช้ flow เปรียบเทียบ/กดใช้ข้อเสนอ
- จุดบนขอบเขต อยู่ในหลาย polygons หรือไม่มีข้อมูล ให้แสดง candidates/เหตุผลและให้เลือกเอง ไม่เลือกพื้นที่แรกตามลำดับไฟล์ ไม่เติมพื้นที่เดาสุ่ม
- แสดงว่าค่าเป็น **“เสนอจากพิกัด” / “Suggested from coordinates”** พร้อม source geometry reference แยกจาก UUID ที่ต้นทางยืนยันไว้ ไม่เรียกข้อเสนอนี้ว่า “ตรวจผ่าน”

การพิมพ์หรือ lookup ไม่สร้าง Event ไม่เปลี่ยน Supply aggregates และไม่ fit/zoom แผนที่เอง จุด D บนแผนที่ยังเป็น draft ที่ไม่นับ Supply

## 3 · ค่าเริ่มต้นและ dropdown ต้องไปด้วยกัน

| บริบท | พฤติกรรม |
|---|---|
| เพิ่มสาขาขณะเลือกทำเลบนแผนที่ | เติม UUID ทำเลและจังหวัดที่เลือกจริง ไม่สร้างพิกัดแทนผู้ใช้ |
| เพิ่มสาขาในจังหวัด/อำเภอ | เติมจังหวัดและจำกัดตัวเลือกพื้นที่ตามบริบทที่มี ห้ามเลือก fine location แรกให้เอง |
| เพิ่มสาขาจากภาพประเทศ | เว้นพื้นที่ว่าง หากไม่มีตัวกรองที่ใช้ได้ ไม่ยืมทำเลเก่าหรือบังคับ กทม. |
| เปิด existing record | ใช้ข้อมูล record ก่อน ไม่เอาแผนที่หรือตัวกรองที่ไม่เกี่ยวกันมาเติมช่องที่ยังไม่ทราบ |
| เปลี่ยนจังหวัดเอง | ปรับ options ของทำเลและ label เป็น “แขวง” ใน กทม. / “อปท.” ต่างจังหวัด หากทำเลเดิมไม่สอดคล้อง ให้เว้นตัวเลือกและแจ้งให้เลือกใหม่ โดยคงค่าเดิมไว้ในประวัติ/draft context |
| เปลี่ยนทำเลเอง | ใช้จังหวัดของ UUID นั้นเป็นค่าที่สอดคล้องกัน บันทึก effective province ร่วมกับ area; เก็บ original source administrative metadata แยกไว้ |
| เปลี่ยน district filter | จำกัดรายการด้วย source crosswalk ที่มี พื้นที่ที่สัมพันธ์หลายอำเภอยังมี identity เดิม ไม่เพิ่มยอดนับ |
| ภาษา/theme เปลี่ยนหรือหน้า render ใหม่ | คง values, manual/autofill state, expected revision, focus/cursor และ draft รูป ตัวเลือกต้องแสดงค่าที่คงไว้ได้ |

ตัวเลือกที่จำกัดจากพิกัดต้องมีทางกลับไปเลือกพื้นที่อื่นอย่างชัดเจน การตั้ง filter เพื่อช่วยหาไม่ใช่การบังคับให้ข้อเสนอเป็นคำตอบ ช่องชื่อสาขาและโน้ตไม่ถูกเขียนทับจาก default หรือ POI ใกล้เคียง

## 4 · แบรนด์และประเภทสาขา

ใช้ brand registry ของ Supply ที่โหลดแล้ว พร้อม aliases และ canonical IDs ไม่พึ่งเฉพาะ `Y.pois` ดังนั้นแม้ point inventory ยังโหลดไม่เสร็จ ก็เลือกแบรนด์ที่ระบบรู้จักได้

- เมื่อเพิ่มจากตัวกรอง **สาขาเรา** ให้เติม canonical own brand และ O; สถานะยังเป็น pending
- เมื่อมี brand filter ที่ระบุ identity ได้ ใช้เป็นค่าเริ่มต้นของสาขาใหม่ตามบริบท แต่ไม่เขียนทับแบรนด์ของ existing record
- ชื่อ/alias ที่ตรงกับ registry ให้ normalize เป็น ID เดียวกัน ไม่ fuzzy-match หรือจับชื่อใกล้เคียงเป็นแบรนด์จริง หาก label เปลี่ยนชัดเจน ห้ามยึด brand ID เก่าที่ไม่ตรงกัน
- แบรนด์ที่ระบุได้ใช้ relationship ตาม selected own identity และ scope; Non-bank ต้องคง unknown licence/product scope เป็น U ตาม source policy ไม่เปลี่ยนเป็น C เพื่อให้กรอกครบ
- การเลือก “สาขาเรา” อย่างชัดเจนช่วยเติม selected own brand; การเปลี่ยนแบรนด์ต้องทำให้ relation สอดคล้องกัน ไม่ปล่อยค่าที่จะถูก `refreshPointRelations()` เปลี่ยนทันทีหลังบันทึก
- UNKNOWN ไม่เท่ากับ unbranded และการรู้แบรนด์ไม่เท่ากับยืนยันการเปิดให้บริการ

ค่าที่ผู้ใช้แก้แล้วต้องคงอยู่ การเปลี่ยน default จาก industry/brand/scope เป็นค่าเริ่มต้นของ context ใหม่ ไม่เปลี่ยน record ที่กำลังดูเป็นแบรนด์ใหม่โดยอัตโนมัติ

## 5 · บันทึกข้อมูลที่ยังผูกพื้นที่ไม่ได้

Existing record ที่ยังไม่ทราบทำเลสามารถบันทึกโน้ต หลักฐาน และรูปได้ ไม่บังคับเลือก UUID ที่เดาเพื่อให้ผ่าน form สาขาใหม่ต้องมี **ชื่อ + (คู่พิกัดที่ใช้ได้ หรือ UUID ทำเลที่ใช้ได้)** หากกรอกพิกัดบางส่วน/ค่าผิด ให้แจ้งแก้คู่พิกัด ไม่แปลงเป็นช่องว่างโดยเงียบ ๆ

ค่าที่เสนอจาก geometry เป็นข้อมูลของ draft/overlay พร้อม provenance เท่านั้น Source record และ source-reported aggregate totals คงเดิมจนมี governed review/reconciliation; pending/active/operation status ไม่เปลี่ยนเพราะเติมพื้นที่สำเร็จ

รูปของสาขาใหม่ใช้ temporary draft key ที่แยกตาม `criteriaContextKey()` โดยยังรักษา branch record identity และ route ของ `#poi/new` ให้ถูกต้อง เปลี่ยน context แล้วไม่พารูปไปเข้าคนละ brand/industry เมื่อกลับมายัง context เดิม draft ยังเรียกคืนได้ หลังบันทึกจึงย้ายไป generated branch ID ตาม photo transaction/rollback เดิม

## 6 · Supply list และแผนที่ใช้บริบทเดียวกัน

ที่ province/district/fine level ให้รายการและ map pins ใช้ effective saved assignment ก่อน หาก source ยังไม่ผูก fine UUID ให้ใช้ coordinate candidates ช่วย **การแสดงและกรองเท่านั้น** โดยติดป้ายว่าพื้นที่มาจากพิกัด

Coordinate view matching ห้ามเขียน `p.area`, `p.province`, original `adminScope` หรือ SourceObservation และห้ามเปลี่ยน native district/fine aggregate counts ส่วนกรณี boundary/multiple ต้องคงความกำกวม ไม่เลือกพื้นที่หนึ่งเพื่อสร้างยอด Supply แน่นอน

Source UUID ที่ขัดกับพิกัดแสดงข้อจำกัดให้ตรวจ ไม่ย้าย source assignment จากการเปิดรายการ การแก้ effective area/province ของ team overlay เกิดเมื่อผู้ใช้บันทึก และต้องมี diff ใน feed ตาม flow เดิม

## 7 · ผล async ต้องกลับมาที่ form ที่ถูกต้อง

แต่ละ lookup จับ form/record ID, expected revision, `criteriaContextKey()`, context request, route, coordinate signature และ edit generation ก่อนรอผล ใช้ผลต่อเมื่อทั้งหมดตรงและ form ยังเชื่อมกับหน้าอยู่ การเปลี่ยนพิกัด manual selection, record, context, route หรือ revision ทำให้ผลเก่าใช้ไม่ได้

Mount ตัวช่วยหลัง restore values จาก `workingForm()` เก็บ manual/autofill provenance ไปกับ snapshot เพื่อให้การเปลี่ยนภาษา/theme หรือ source completion ไม่กลับไปเติม default ทับค่าของผู้ใช้ ผลโหลดช้าและ geometry error ต้องมีสถานะให้อ่าน ไม่ล้างชื่อ โน้ต รูป หรือค่าที่เลือกไว้

## 8 · Fixtures และตรวจรับ

Source-coordinate fixture ที่ต้องรักษา: **lat 15.597502 / lng 103.808856 → จังหวัด 45 ร้อยเอ็ด → อำเภอ 4511 สุวรรณภูมิ → UUID `8f69c8f1-b275-4616-8ab5-8c641881e93f` เทศบาลตำบลสุวรรณภูมิ** District UUID คือ `a52c56b4-46e2-477f-bde9-99bb328394a1` นี่เป็น expected candidate จาก geometry snapshot ไม่ใช่การยืนยันตัวตนสาขาหรือขอบเขตกฎหมายใหม่

ตรวจทั้ง pure fixtures และ actual editor/list integration: unique match, shared edge/vertex, holes, MultiPolygon, overlaps, missing/invalid pairs, manual conflict/apply, dependent dropdowns, cold registry aliases, notes/photos ขณะ area unresolved, per-context photo drafts, deferred lookup races และ source/aggregate immutability ดู render จริงใน TH/EN และ light/dark ทั้ง desktop/narrow รวม keyboard focus, long labels, error และ loading states

ใช้ `scripts/check-branch-context.cjs` ร่วมกับ retained cold-branch, save-context, photo และ workspace-map checks รายงาน counts/commands และ source SHA ที่ตรวจจริง หลักฐาน VM หรือ viewport ไม่แทน physical-device/backend QA และ contract นี้ไม่อ้างว่าทดสอบหรือเผยแพร่แล้ว
