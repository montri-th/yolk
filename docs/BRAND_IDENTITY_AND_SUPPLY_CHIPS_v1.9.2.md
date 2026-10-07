# Brand identity + Supply controls · Yolk1.9.2

แก้สองจุด: **จำแบรนด์ได้ถูก และอ่านว่า Supply แสดงใครได้ทันที** ข้อมูลและเกณฑ์ไม่เปลี่ยน

## Brand artwork

Villa Market, Lawson108 และ Tops ใช้ภาพที่เจ้าของส่งในคำขอปัจจุบันกับ brand ID เดิม ไม่สร้างแบรนด์ใหม่หรือปรับ preset ตามรูป ไฟล์เดิมรักษา artwork/สัดส่วน/สี วางด้วย contain ในพื้นที่ compact square และมีชื่อกำกับ ไม่มี crop/redraw/recolor/frame/backing plate

ไฟล์และ bindings มี exact path/MIME/bytes/dimensions/SHA ใน [asset receipt](../evidence/owner-supplied-brand-artwork.v1.9.2.json) และแหล่งที่เป็น owner-supplied artwork แยกจากข้อมูล offering/brand positioning ที่วิจัยไว้เดิม ยังไม่ถือ owner-supplied image เป็น new external verification หรือสิทธิ์เปิดใช้งานทั่วบัญชี

## Supply role controls

โล่ = เรา, ดาบ = คู่แข่ง, กลุ่มรวม = เรา+คู่แข่งที่ระบุได้, ไอคอนตรวจ = รอตรวจ แต่ละปุ่มมี caption อ่านได้ ไอคอน aria-hidden และ accessible name มาจาก caption

Font ของ glyph เป็น `Yolk Material Symbols` ซึ่งเป็น verified Material Symbols Rounded subset เดิม Font ของ caption ใช้ LDS body/Thai/English ตามบทบาท CSS ของ body/strong/b ห้ามล้าง icon font ใน container ใช้ glyph 22 px ที่ไม่ shrink และ gap 8 px Caption อยู่ช่องของตัวเอง ตัวเลขอยู่ `.supply-tab-count[data-yolk-counter]` ใช้ JetBrains Mono ตัวกรองทั้ง 5 (ทั้งหมด/เรา/คู่แข่ง/รอตรวจ/คลัง) ขึ้นบรรทัดใหม่ตามพื้นที่ของ map workspace เมื่อจอแคบ ไม่ทำให้ทั้งหน้า overflow ส่วน compound analysis total มีหนึ่ง caption ไม่สร้าง glyph/text ซ้อนกัน

Hover ขีดเส้นใต้ caption เท่านั้น Keyboard focus ยังเห็นชัด ตัวเลข metric, roles, counts, benchmark และกล้องเดิมไม่เปลี่ยน

## งานและการตรวจ

ทำ T01 (shell/control styles), T06 (stable brand binding), T23 (current regressions/native QA) ตาม full plan ตรวจ TH/EN light/dark แคบ/desktop:สาม artwork, glyph loadedจริง, no raw ligature words, captionไม่ชน และไม่มี horizontal overflow

Machine contract: [brand-identity-ui.v1.9.2.json](../contracts/brand-identity-ui.v1.9.2.json) CurrentQA 29 suites/506 checks และ bounded native 12 ข้อผ่านแล้ว ดู [QA](../evidence/qa-v1.9.2.json). Provider/live-byte proof ต้องมีหลักฐานแยก Physical device/screen reader/full matrix แยกจาก bounded review

Caption enhancer เป็น idempotent และข้าม glyph/counter ไม่ wrap ข้อความซ้ำ Font loading สำเร็จก่อนจึงโชว์ glyph ถ้า font หายหรือโหลดล้มเหลว ซ่อน raw ligature word แต่ caption/selection state ยังคงใช้ได้ ไม่มี invented glyph fallback

New regression: `node scripts/check-icon-controls.cjs` เป็น actual renderer/cascade/font readiness fixture Native shaping/geometry/theme ต้องตรวจแยก

ต้นฉบับเป็น Villa Market 3840×1920, Lawson108 227×300 และ Tops 800×316. Square หมายถึงช่องวาง ไม่ใช่การ crop ภาพให้เป็นสี่เหลี่ยม Registry และ hash อยู่ใน receipt โหลดโดย `prototype/bootstrap.js`; current native review ผ่านแบบจำกัดตาม [receipt](../evidence/browser-v1.9.2/native-browser-review.json)

## Theme fallback ที่ใช้จริง

Villa Market ใช้ PNG ต้นฉบับใน light theme ส่วน dark ใช้ไอคอนร้านค้ากลางพร้อมชื่อ Villa Market ที่อ่านชัด เพราะภาพสีม่วงเดิมอ่านไม่ชัดบนพื้นเข้ม การแสดงต้นฉบับบน dark ไม่ผ่านและไม่ถูกอ้างว่า PASS ไม่เพิ่มกรอบหรือพื้นรองโลโก้ ไม่เปลี่ยนสี/crop และไม่กลับไปใช้เครื่องหมายรถเข็นเก่า Lawson108 และ Tops ใช้ PNG ต้นฉบับทั้งสอง theme การตรวจ fallback ปัจจุบันผ่านแบบจำกัดตาม native receipt รุ่นนี้
