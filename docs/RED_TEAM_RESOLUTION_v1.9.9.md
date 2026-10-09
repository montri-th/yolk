# Yolk 1.9.9 — ผลแก้ไขจาก Red team

ฉบับตรวจในเครื่อง 9 ต.ค. 2026 · อ้างอิงรายงานตรวจรุ่น 1.9.8 จาก source commit `ee6eb51a16360458288f549c9d98ee22e8b0b2da`

แก้สาเหตุใน implementation/เอกสารแล้ว **16 ข้อ**, ลดความเสี่ยงแต่ยังปิดไม่ได้ **2 ข้อ**, และยังเปิดไว้ **1 ข้อ** จากทั้งหมด 19 ข้อ โดยคง priority เดิมของรายงาน: P1 5 ข้อ, P2 13 ข้อ, P3 1 ข้อ

คำว่า **แก้ implementation แล้ว** หมายถึงมีโค้ดหรือขั้นตอนแก้พร้อมหลักฐานเฉพาะขอบเขตที่ระบุในตาราง ไม่ได้หมายถึงผ่าน final release, ทุกอุปกรณ์ หรือ production backend แล้ว ผลรวมใหม่ **40 suites / 663 reported cases ผ่าน พร้อม native review 11 กรณี**; final ZIP closure และหลักฐานเผยแพร่จริงแยกไว้ใน GitHub Release ไม่ใช้ผลรุ่นเก่ามาแทน

[Machine contract ที่ตรงกับเอกสารนี้](../contracts/red-team-remediation.v1.9.9.json) · [เริ่มอ่านผลิตภัณฑ์ปัจจุบัน](../START_HERE.md) · [วิธีรับงานและตรวจไฟล์](../HANDOFF_v1.9.9.md)

## สิ่งที่ผู้ใช้จะเห็นต่างไป

- บันทึก shortlist แล้วมีเหตุผลและเกณฑ์ที่ใช้จริงติดไปด้วย เกณฑ์แบบร่างไม่เปลี่ยนกลับเป็นเกณฑ์ทีมกลางทางเมื่อเปิดรายละเอียด
- งานที่ยืนยันแล้วไม่ถูกอีกแท็บเขียนทับเงียบ ๆ บันทึกล้มเหลวไม่แจ้งสำเร็จ และร่างฟอร์มกลับมาได้เมื่อเปลี่ยนหน้าหรือกลับมาแก้ต่อ
- หน้าโอกาสขยายแยกทำเลชวนสำรวจ, ทำเลที่ต้องเพิ่มหลักฐาน และทำเลที่ยังไม่มีสัญญาณตรงวิธีที่เลือก ผู้ใช้เห็นข้อจำกัดของ preset ที่ยังสอบเทียบไม่ได้
- ปิด tooltip ด้วย Escape ได้ ค้นสาขาในจุดซ้อนจำนวนมากได้ และลองโหลดข้อมูลแผนที่ที่ล้มเหลวใหม่ได้โดยไม่เริ่มงานจากศูนย์

## ตรวจครบทั้ง 19 ข้อ

| ID / Priority | สถานะ | สิ่งที่เปลี่ยน | หลักฐานตรวจซ้ำ |
|---|---|---|---|
| SR-01 · P1 | แก้ implementation แล้ว | บันทึกผ่าน Web Lock เดียวกัน อ่านค่าล่าสุดและเทียบ revision ก่อน merge แต่ละ context; ร่างไม่เขียนทับงานยืนยัน | [`check-workspace-transactions.cjs`](../scripts/check-workspace-transactions.cjs) |
| SR-02 · P1 | แก้ implementation แล้ว | เขียน entity, context และ event ครั้งเดียว แจ้งสำเร็จหลังเขียนสำเร็จเท่านั้น | [`check-workspace-transactions.cjs`](../scripts/check-workspace-transactions.cjs) · [`check-action-guidance.cjs`](../scripts/check-action-guidance.cjs) |
| SR-05 · P1 | แก้ implementation แล้ว | หลังรอรูป resolve สาขาปัจจุบันใหม่ ตรวจ revision/context/actor/route แล้ว commit; conflict เก็บร่างรูปไว้ | [`check-save-context.cjs`](../scripts/check-save-context.cjs) · [`check-workspace-transactions.cjs`](../scripts/check-workspace-transactions.cjs) |
| ANA-01 · P1 | แก้ implementation แล้ว | ทุกทางเพิ่ม/คืน shortlist ใช้ immutable decision snapshot ร่วมกัน ก่อน atomic commit; ลบออกคงหลักฐานเดิม | [`check-decision-evidence.cjs`](../scripts/check-decision-evidence.cjs) · [`check-strategy-ui.cjs`](../scripts/check-strategy-ui.cjs) · [`check-workspace-transactions.cjs`](../scripts/check-workspace-transactions.cjs) |
| UX-01 · P1 | แก้ implementation แล้ว | เก็บร่างแยก context+route; กลับหน้าเดิมกู้ค่าได้ ทิ้งร่างโดยชัดแจ้ง; skip link focus เนื้อหาโดยไม่เปลี่ยน route | [`check-form-drafts.cjs`](../scripts/check-form-drafts.cjs) · [`check-workspace-transactions.cjs`](../scripts/check-workspace-transactions.cjs) |
| ANA-02 · P2 | แก้ implementation แล้ว | รายละเอียดและแผนที่ใช้เกณฑ์ที่ผู้ใช้เปิดมาจริง พร้อมแจ้งแบบร่างและปุ่มกลับเกณฑ์ทีม | [`check-decision-evidence.cjs`](../scripts/check-decision-evidence.cjs) · [`check-map-redteam.cjs`](../scripts/check-map-redteam.cjs) |
| SR-03 · P2 | แก้ implementation แล้ว | ตรวจ schema ก่อนใช้ cache กักต้นฉบับดิบไว้กู้คืน แสดงข้อความและปุ่ม export; เก็บส่วนข้อมูลที่ยังใช้ได้ | [`check-workspace-transactions.cjs`](../scripts/check-workspace-transactions.cjs) |
| SR-04 · P2 | แก้ implementation แล้ว | popup แยกสถานะ source record, team-verified และ archived พร้อมข้อจำกัดของพิกัด/ขอบเขต | [`check-poi-popup.cjs`](../scripts/check-poi-popup.cjs) |
| SR-06 · P2 | แก้ implementation แล้ว | เพิ่ม retry แหล่งข้อมูลที่ล้มเหลวโดยไม่ reload ทั้งหน้า ป้องกัน retry ซ้ำและผลเก่าเปลี่ยน context ใหม่ | [`check-map-redteam.cjs`](../scripts/check-map-redteam.cjs) |
| DR-02 · P2 | แก้ implementation แล้ว | Escape ปิด tooltip และระงับการเปิดซ้ำจนออกจากขอบเขต hover เดิม; เลื่อนไปอ่านข้อความ tooltip ได้ | [`check-map-hover.cjs`](../scripts/check-map-hover.cjs) |
| DR-06 · P2 | แก้ implementation แล้ว | รายการจุดซ้อนค้นชื่อ/รหัสและกรองแบรนด์ได้ มีปุ่มซูม โดยไม่ลดจำนวนหรือย้ายพิกัด | [`check-unclustered-poi.cjs`](../scripts/check-unclustered-poi.cjs) |
| ANA-03 · P2 | แก้ implementation แล้ว | ระบุชัดว่าน้ำหนักเรียงหน้า Demand ส่วนโอกาสขยายเรียงตาม Strategy พร้อมลิงก์ไปดู Demand | [`check-decision-evidence.cjs`](../scripts/check-decision-evidence.cjs) · [`check-strategy-ui.cjs`](../scripts/check-strategy-ui.cjs) |
| ANA-04 · P2 | แก้ implementation แล้ว | ข้อมูล Supply ไม่พร้อม/suppressed/invalid และ unknown bounds ไม่ให้คะแนนช่องว่างแบบแน่นอน | [`check-decision-evidence.cjs`](../scripts/check-decision-evidence.cjs) · [`check-relative-supply.cjs`](../scripts/check-relative-supply.cjs) |
| ANA-05 · P2 | แก้ implementation แล้ว | ตรึง source/profile/license/bounds และ semantic runtime พร้อม canonical criteria SHA, manifest SHA และ evidence SHA | [`check-decision-evidence.cjs`](../scripts/check-decision-evidence.cjs) |
| ANA-06 · P2 | ลดความเสี่ยงแล้ว ยังมีส่วนค้าง | แสดงคิวข้อมูลไม่พอ/ยังไม่พบสัญญาณ พร้อม sample n และคำว่า Supply reference ยังเป็นสมมติฐาน | [`check-decision-evidence.cjs`](../scripts/check-decision-evidence.cjs) · [`check-relative-supply.cjs`](../scripts/check-relative-supply.cjs) |
| DR-03 · P2 | แก้ implementation แล้ว | เพิ่มตัวตรวจ evidence closure บังคับ raw log และ test source ทุกไฟล์อยู่ใน artifact พร้อม SHA และตรวจ extracted ZIP ได้ | [`check-evidence-closure.py`](../scripts/check-evidence-closure.py) |
| DR-04 · P2 | แก้ implementation แล้ว | ตั้ง current index/handoff ชี้ 1.9.9 และแยก source seal จาก post-publication attestation; social metadata ระบุ release ปัจจุบัน | [`verify-pages-v1.9.9.py`](../scripts/verify-pages-v1.9.9.py) |
| DR-05 · P2 | ยังเปิดอยู่ | ยังไม่อ้างว่าตรวจอุปกรณ์และ assistive technology ครบ; รักษา gate แยกจาก VM/desktop viewport | ยังไม่มี acceptance matrix ของอุปกรณ์จริง |
| DR-07 · P3 | ลดความเสี่ยงแล้ว ยังมีส่วนค้าง | แยก decision snapshot เป็นโมดูล มี current index และ machine contract; คง regression ก่อนเปลี่ยนโครงสร้างใหญ่ | [`check-decision-evidence.cjs`](../scripts/check-decision-evidence.cjs) |

## เรื่องที่ยังปิดไม่ได้

**ANA-06 — Non-bank ยังไม่ได้สอบเทียบจากข้อมูลที่เพียงพอ**

การเปิดเผย sample size และคิวข้อมูลไม่พอแก้ความเข้าใจผิดได้ แต่ไม่ได้ทำให้ข้อมูลพร้อมขึ้นเอง Exact calibration samples ของ Non-bank ทั้ง 10 แบรนด์ยังเป็นศูนย์ใน snapshot นี้ จึงคงค่าเริ่มต้นเป็นสมมติฐานที่ปรับได้ ต้องหาหลักฐานสาขา/ขอบเขตที่ตรวจแล้วและผลธุรกิจที่เหมาะสมก่อนอ้างว่าค่าสอดคล้องกับแบรนด์จริง ไม่เติมยอดขายหรือ customer flow สมมติลงในระบบ

**DR-05 — อุปกรณ์จริงและการเข้าถึงยังเป็น gate เปิดอยู่**

ต้องมีบันทึกทดสอบ physical iOS Safari, Android Chrome, keyboard/screen reader, high zoom/reflow และ reduced motion โดยระบุรุ่นอุปกรณ์/browser, ภาษา, theme, สิ่งที่ทำ และผลจริง การย่อ viewport ใน desktop หรือการผ่าน DOM adapter ไม่แทนหลักฐานนี้ ก่อน production ต้องผ่าน matrix ที่ทีมตกลงและแนบ receipt

**DR-07 — โครงสร้างเดิมยังต้องค่อย ๆ จัดระเบียบ**

แยก decision snapshot เป็นโมดูลแล้ว และมี current index กับ machine contract ช่วยกำกับทางเดินของ intern แต่ไม่ได้ refactor source เดิมทั้งระบบ full brief รวมเป็นเอกสารปัจจุบันชุดเดียวแล้ว ส่วนโค้ดบรรทัดยาว/ชั้นความรับผิดชอบเดิมยังต้องทยอยแยกเป็นงานขนาดเล็กโดยรักษา regression เดิม

## หลักฐานที่ต้องใช้ก่อนปิด release

1. **Automated integration:** รัน workflow ปัจจุบันทั้งหมด เก็บ raw log ทุก suite และ SHA ของไฟล์ทดสอบใน [receipt ปัจจุบัน](../evidence/automated-v1.9.9.json) การมีไฟล์นี้ยังไม่แปลว่าผ่าน ต้องตรวจ `status`, `exitCode` และ log จริงก่อน
2. **Native review:** ใช้ [native receipt ปัจจุบัน](../evidence/browser-v1.9.9/native-browser-review.json) บอกเฉพาะ browser/viewport/journey ที่ตรวจจริง แยกสิ่งที่ยังไม่ได้ทดสอบ ไม่ขยายเป็นคำรับรองทุกมือถือ
3. **Decision manifest:** หลัง source/version เปลี่ยนครั้งสุดท้าย สร้าง [evaluation manifest](../prototype/data/evaluation-manifest.json) ใหม่แล้วตรวจ raw hashes จึง seal release ได้
4. **ZIP ที่ส่งจริง:** รัน [evidence closure validator](../scripts/check-evidence-closure.py) กับ ZIP ไฟล์สุดท้ายให้เปิด log และ test source ทุกไฟล์ที่ receipt อ้างได้ภายในชุดเดียวกัน การมี validator ยังไม่ใช่ผลตรวจ ZIP
5. **เผยแพร่จริง:** แยกสถานะ [source seal](../contracts/release.v1.9.9.json) ออกจาก `release-evidence/RELEASE_ATTESTATION_v1.9.9.json` ที่อยู่ในชุดส่งมอบหลัง publish และต้องผูก source commit, provider run, live bytes และ ZIP ที่แจกจริง

```sh
python3 scripts/build-evaluation-manifest.py --release 1.9.9
# รัน suites ตาม .github/workflows/pages.yml แล้วสร้าง receipt จากผลจริง
python3 scripts/check-evidence-closure.py
python3 scripts/check-evidence-closure.py --zip <final-handoff.zip>
```

DR-03 และ DR-04 จัดว่าแก้ที่ implementation/กระบวนการแล้ว ผลในเครื่องข้อ 1–3 ผ่านแล้ว; acceptance ของ ZIP และเว็บจริงต้องมีข้อ 4–5 ไม่ใช้เอกสารนี้ยืนยันการเผยแพร่ล่วงหน้า Release owner ต้องอัปเดตสถานะใน machine contract จาก receipt ที่ผ่านจริงก่อนส่งมอบ

## สิ่งที่คงไว้และขอบเขตของข้อสรุป

Demand ยังเป็นผู้คัด eligibility เพียงด้านเดียว; Supply และ Strategy ไม่สร้าง Demand ขึ้นมาใหม่ ไม่เปลี่ยน source counts, numerical brand presets หรือ cohort เดิม Missing/unknown ไม่ถูกเปลี่ยนเป็นศูนย์ และส่วนแบ่งที่แสดงยังเป็นสัดส่วนจำนวนสาขาที่ทราบแบรนด์ ไม่ใช่ส่วนแบ่งยอดขาย

Decision snapshot เก็บ criteria เต็ม, สถานะผล ณ เวลาเลือก, Strategy, actor/context และ hashes ของข้อมูล/โปรไฟล์/ใบอนุญาต/bounds/runtime ที่ใช้ จึงตรวจย้อนกลับได้ รายการเก่าที่ไม่มีหลักฐานนี้ยังเป็นรายการเก่า ไม่มีการแต่งเหตุผลย้อนหลังให้เอง

ต้นแบบยังเก็บงานในเบราว์เซอร์ การป้องกันข้อมูลชนกันด้วย Web Locks ไม่ใช่ authentication หรือ collaboration ของ server งาน production ยังต้องมี tenant-aware RBAC, server transactions/revisions/outbox, shared persistence และ private media ตาม implementation plan โดยเฉพาะ

## หลักฐานรอบปิดงานในเครื่อง

ทดสอบรวมใหม่ 40 suites / 663 reported cases ผ่าน; ตรวจใช้งานจริงใน Chrome 11 กรณี พร้อมภาพ 8 ภาพ ครอบคลุมตัวอย่างไทย/อังกฤษ ธีมสว่าง/มืด และหน้าจอ 320/390/1440px หลักฐานอยู่ใน [QA](../evidence/qa-v1.9.9.json) พร้อม raw logs ภายในชุดส่งมอบ นี่ไม่ใช่ผลตรวจอุปกรณ์จริงทุกแบบ

Full brief รุ่นนี้รวม narrative กับ machine block ปัจจุบันเพียงชุดเดียวแล้ว งานแยก source เดิมเป็นโมดูลย่อยยังเป็นข้อจำกัด DR-07 ส่วนการเผยแพร่และ ZIP ฉบับสุดท้ายดู [GitHub Release v1.9.9](https://github.com/montri-th/yolk/releases/tag/v1.9.9) ซึ่งแยกหลักฐาน provider และ live bytes จาก source seal
