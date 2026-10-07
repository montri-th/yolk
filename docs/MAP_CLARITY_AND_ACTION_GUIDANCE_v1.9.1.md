# Map clarity + Action guidance · Yolk 1.9.1

รุ่นนี้ทำให้ผู้ใช้รู้ว่า **ชี้อยู่ที่ไหน ดูหมุดอะไร และสิ่งที่บันทึกไปอยู่ที่ไหน** สูตร เกณฑ์ แหล่งข้อมูล และโปรไฟล์ยังใช้ 1.9.0 เดิม

## 1. Hover บอกพื้นที่และค่าหลักเพียงครั้งเดียว

| ขอบเขตที่เปิด | ขอบเขตที่จะคลิก / ชื่อใน tooltip |
|---|---|
| ประเทศ | จังหวัด |
| จังหวัด | อำเภอ |
| อำเภอ | แขวง / อปท. |
| ทำเล | ทำเลที่เลือก |

เจ้าของ hover คือขอบเขตที่จะคลิก แม้สีข้อมูลจะลงบนพื้นที่ย่อยกว่า paint layer ไม่สร้าง tooltip กล่องที่สอง ให้เห็นชื่อ ระดับพื้นที่ ค่าหลัก และหน่วยในกล่องเดียว เปลี่ยนชื่อเมื่อชี้พื้นที่ใหม่ ใช้กล่องเดียวต่อเนื่องเมื่อเปลี่ยนพื้นที่ และล้างทันทีเมื่อออกจากพื้นที่/เปลี่ยน context หรือ mode ไม่ทิ้ง DOM ที่กำลัง fade-out ให้ซ้อนกัน

Demand แสดง Tier ที่ดีที่สุดของ fine area ที่ทราบ พร้อมแยก review/missing ไม่อ้างว่าเป็นประชากรหรือ traffic ส่วน Supply แบบสีพื้นที่แสดงค่าสูงสุดที่ทราบของ metric/role พร้อมหน่วย: ทั้งประเทศใช้ native district ภายในจังหวัด เมื่อดูจังหวัด/อำเภอใช้ fine area และระบุว่า **ไม่ใช่ยอดรวม parent** โหมด POI แสดงจำนวนพิกัดที่ผ่าน filter อยู่ภายในขอบเขต hover อย่างแม่นยำ ไม่ใช่จำนวนใน viewport หรือยอดบัญชีสาขาครบประเทศ รอโหลดและ missing แยกจาก exact zero

Keyboard focus ใช้ tooltip เดียวกันที่กึ่งกลาง bounds ของขอบเขต ไม่สร้าง live region ซ้ำ Analytical paint ซ่อนจาก accessibility tree ไม่เป็นปุ่มหรือ Tab stop อีกชุด มีเฉพาะ navigation hit ที่เปิดขอบเขตจริง กล่องกว้าง 280 px บน desktop / 240 px บนมือถือ และไม่เกิน viewport ลบ 40 px จึงอ่านชื่อและค่าทั้งแถวได้ Actual screen-reader/มือถือจริงยังต้องตรวจแยก

ชื่อและค่าของ fine display geometry ไม่ใช้อนุมาน legal administrative membership หรือ sum ย้อนทับ native district source

## 2. Branch points ให้หมุดเป็นพระเอก

Choropleth ยังเป็นค่าเริ่มต้น เมื่อเลือก Branch points ทุกระดับให้ภายในโปร่ง ลดเส้นขอบย่อยที่ไม่ได้ช่วยการคลิก เหลือบริบท parent ที่จำเป็น เส้น selected และกรอบ hover เหลือง ไม่มีการลบพิกัด เปลี่ยนเกณฑ์ หรือเปลี่ยนยอด native Supply

เส้นในโหมดจุด: ประเทศเห็นจังหวัด 1.2 px; จังหวัดเห็นอำเภอ 0.65 px และจังหวัด 1.2 px; อำเภอเห็น parent 1.1 px แต่ไม่ขีด fine mesh; ทำเลเห็น selected outline 0.8 px ภายในโปร่ง Hit geometry ยังคลิกได้ทุกระดับ Hover เหลือง Yolk 2 px กติกานี้ใช้เฉพาะ point mode และไม่เปลี่ยน choropleth ปกติ

กลุ่มหมุดตาม screen grid เป็นวิธีจัดภาพ ไม่ใช่ physical market cluster กลุ่มยังเก็บสมาชิก/role totals ครบ การเปลี่ยน mode หรือ filter คงกล้องเดิม คลิกกลุ่มจึงค่อยซูมตามการกระทำของผู้ใช้

## 3. เล็งทำเลแล้วเห็นผลและปลายทาง

หลัง transaction บันทึกสำเร็จเท่านั้น:

1. จำนวน Shortlist เปลี่ยนจาก active targets จริงใน context นี้ทันที
2. แสดงข้อความสำเร็จพร้อมชื่อทำเลและลิงก์ Shortlist ใช้ข้อความ TH/EN และ persistent polite live status ที่มีตั้งแต่ init อ่านหนึ่งครั้งหลัง receipt สำเร็จ กล่องยืนยันมีลิงก์และเป็น role=group
3. ถ้าเมนู Shortlist อยู่ในจอ ใช้ bookmark surrogate แบบ aria-hidden/pointer-inert เชื่อมปุ่มกับเมนู สั้น 200 ms, easing `cubic-bezier(.2,0,0,1)` ไม่ขยับ identity หรือข้อมูลจริง
4. Count/nav feedback 120 ms เคลื่อนเพียง 2 px และเล่นครั้งเดียวตาม receipt ไม่ replay เพราะ rerender ป้าย delta อยู่ 2.4 วินาที กล่องยืนยันที่มีลิงก์อยู่ 7 วินาทีและพัก timer เมื่อ hover/focus

**+1** เฉพาะเพิ่มใหม่หรือคืนรายการเข้าจาก archive, **−1** เมื่อเอาออกจาก active shortlist การอัปเดตแผนของทำเลที่มีอยู่ไม่เพิ่มจำนวน กดซ้ำไม่สร้าง target/event ซ้ำ Viewer แก้ไม่ได้ Save failure rollback และไม่แสดงผลสำเร็จ

Focus คงปุ่มต้นทาง ไม่พาเปลี่ยนหน้า ไม่ scroll เอง Motion ไม่เป็นเงื่อนไขของความสำเร็จ ถ้าเมนูปลายทางหายหรืออยู่นอกจอ ให้ข้อความ/จำนวน/ลิงก์ทำหน้าที่ตรง ๆ

## 4. Reduced motion และการขัดจังหวะ

`prefers-reduced-motion: reduce` **หรือ** checkbox **ลดการเคลื่อนไหว / Reduce motion** ในเมนูตั้งค่า แสดง final count/status/link ทันที Checkbox เป็นค่าของเครื่องนี้ เก็บต่างหาก ไม่สร้าง workspace event/revision การเปิด checkbox หยุด flight ทันที app smooth scroll และ retained location-map focus เคารพค่าร่วมนี้ ไม่มี flight/pulse เชิงพื้นที่ หน้า hidden หรือ pagehide ยกเลิก effects/timers แต่คงผลบันทึกจริง มี transient cue ได้พร้อมกันสูงสุดหนึ่งรายการ

Animation ช่วย feedback ไม่สร้างความหมายแทนข้อความ ไม่ reveal-hide ข้อมูลสำคัญ ไม่ทำ layout shift ไม่เปลี่ยน evidence หรือ focus order ไม่วนซ้ำและไม่มี motif

## สำหรับ dev

Runtime patch: `prototype/action-guidance.js/.css` และ `prototype/workspace-map.js/.css` ใช้ [interaction contract](../contracts/interaction-guidance.v1.9.1.json) ร่วมกับ [full blueprint](../contracts/full-product.v1.9.1.json)

เริ่มงาน T12 (map hover/point layers), T15 (target receipt + count/action feedback), T23 (integration/native/failure/reduced motion checks) หลัง dependencies ใน full plan ทำงานทีละ task และรายงาน outputs/AC/tests ที่ตรวจจริง

New regression commands: `node scripts/check-map-clarity.cjs` และ `node scripts/check-action-guidance.cjs` ผล VM/DOM ไม่แทน actual browser, screen reader หรือมือถือจริง Current automated 28 suites / 497 checks และ bounded native 22 ข้อผ่านแล้ว ดู [QA](../evidence/qa-v1.9.1.json) actual pointer hover ทุกขอบเขต, OS reduced-motion จริง, screen reader, physical device และ full matrix ยังไม่ตรวจ Provider/live-byte proof แยกจาก local QA

การ Apply เกณฑ์ที่บันทึกแล้วมีคำแนะนำไปหน้า Demand ส่วนการคำนวณเสร็จมี count feedback 120 ms ตามการเปลี่ยนจริง ไม่จำลองเพิ่มผลลัพธ์ ลด motion เป็น personal setting ไม่สร้าง team revision/event
