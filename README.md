# CityMETER: Yolk · v1.7.0 · LDS 0.9.7

Updated 2026-10-04. **Find the yolk. Grow your market. / หาไข่แดงให้เจอ ขยายตลาดให้ตรงจุด**

[เปิดเว็บ](https://montri-th.github.io/yolk/) · [เริ่มอ่านที่นี่](START_HERE.md) · [Product statement](CityMETER_Yolk_Product_Statement_v1.7.md) · [Implementation plan](IMPLEMENTATION_PLAN_v1.7.md)

**แผนที่เดียว อยู่กับงานทุกหน้า** ดูภาพรวม ปรับเกณฑ์ เล็งทำเล และจัดการสาขาในแผงข้อมูลข้างแผนที่ มุมมองที่เลื่อนหรือซูมไว้คงอยู่ระหว่างเปลี่ยนเมนูและปรับค่า อ่าน [คู่มือแผนที่](docs/PERSISTENT_MAP_v1.7.md) และ [machine contract](contracts/workspace-map.v1.7.json)

เลือกได้ 3 ธุรกิจ: Fuel, Grocery และ Non-bank ใช้ CityMETER snapshot จริง 7,954 reporting UUIDs และ 25 metrics พร้อมสูตร หน่วย field ต้นทาง รอบข้อมูลและ coverage เลือกแบรนด์พร้อม format หลักและ preset ที่มีเหตุผล เกณฑ์และ draft ที่บันทึกไว้แยกตามบริบทและมีสิทธิ์เหนือ preset ใหม่ ใช้โลโก้จริงจากแหล่งทางการหรือชื่อพร้อมไอคอนกลางเมื่อยังยืนยัน mark ไม่ได้

สำรวจ **ประเทศ → จังหวัด → อำเภอ → ทำเล** ภาพประเทศใช้สีตามอำเภอ; ในจังหวัด/อำเภอใช้สีตามทำเลละเอียด; เลือกทำเลแล้วจึงดู O/C/U มีขอบเขตต้นทาง 928 อำเภอและ 7,954 ทำเลใน 77 ไฟล์จังหวัด Crosswalk ใช้ polygon ต้นทางเพื่อจัดมุมมอง รองรับทำเลที่สัมพันธ์กับหลายอำเภอ และไม่ใช้รับรองเขตทางกฎหมาย

เมื่อเลือกทำเลแล้ว พื้นในขอบเขตโปร่งใสให้เห็น basemap เน้นเส้นขอบ ชื่อ และสถานะ Tier ส่วน choropleth ประเทศ/จังหวัด/อำเภอคงสีข้อมูลเต็มตาม DS จุดที่ยังไม่ผูก UUID อาจแสดงจากพิกัดใน polygon ต้นทางเพื่อดูบริบทเท่านั้น ไม่เปลี่ยนยอด Supply หรือการผูกเขตปกครอง

Demand ใช้ percentile ฐานประเทศเดียวกัน ไม่เปลี่ยนฐานเมื่อเลือกจังหวัด แบรนด์ หรือกรอบแผนที่ สีแสดง **Tier ที่เด่นที่สุดของไข่แดงที่ผ่านยืนยันในกลุ่มนั้น** ด้วย native `li.demand` 3 classes เหมือนกันทั้งสองธีม แยกข้อมูลรอตรวจและพื้นที่ที่ยังไม่มีผลยืนยัน ผลเป็นสมมติฐานสำหรับศึกษาต่อ ไม่ใช่ยอดลูกค้า ยอดขาย ผู้กู้ หรือคำอนุมัติเปิดสาขา

**Static public preview:** CRUD, photos, roles, feed และ notifications เป็น browser-local simulation ไม่มี shared production backend, server auth/RBAC หรือการส่ง email/LINE จริง Source aggregates แยกจาก POI overlays; รูปตัวอย่าง 5 รูปเป็น mockup; satellite เป็นภาพปี 2021

[Supply ต่อขนาดตลาด](docs/SUPPLY_RELATIVE_PROPOSAL.md) ใช้นิยามที่อนุมัติสำหรับบริบทใหม่: Fuel ต่อ GFA 100,000 ตร.ม.; Grocery/Non-bank ต่อประชากร 10,000 คน โหมด count ยังเลือกได้และค่าที่เคยบันทึกไม่ถูกแทนทับ ตรวจ runtime/release status ในคู่มือก่อนอ้างว่า UI ผ่านการรับงานแล้ว

## สำหรับ dev

[เกณฑ์และสูตร](docs/CRITERIA_GUIDE.md) · [Brand presets](docs/BRAND_PRESETS_v1.7.md) · [Persistent map](docs/PERSISTENT_MAP_v1.7.md) · [Boundary provenance](prototype/data/real/boundary-provenance.v1.7.json) · [Asset integration](DS_ASSET_INTEGRATION.md) · [Handoff](HANDOFF.md)

```sh
python3 scripts/verify-pages-v1.7.py
node scripts/check-three-industry.cjs
node scripts/check-brand-presets.cjs
node scripts/check-workspace-map.cjs
node scripts/check-criteria-controls.cjs
node scripts/check-relative-supply.cjs
node scripts/check-photo-runtime.cjs
python3 -m http.server 8854 --bind 127.0.0.1
```

เปิด http://127.0.0.1:8854/prototype/ เมื่อทดสอบในเครื่อง Pages ใช้ `prototype/` เป็น artifact และมีสำเนา runtime contracts ภายใน Product authority คือ [product.v1.7.json](contracts/product.v1.7.json); criteria/model/machine tasks v1.6 เป็น baseline ที่รักษาไว้ ไม่ใช่การย้อนรุ่น UI

Non-bank เลือก 10 รายแรกตามจำนวนรายการต้นทาง ส่วน comparator inventory ยังคงบริษัททั้งหมดตาม licence scope ที่เลือก ดู [brand contract](contracts/brand-experience.v1.7.json) และ [logo manifest](prototype/data/brand-logos.v1.7.json) สำหรับ source, bytes, theme variants และ named fallbacks

Public repo มี runtime projections, assets/licences, contracts และหลักฐานสรุป ไม่บรรจุ raw HTTP snapshots, full acquisition archive, private workbook links หรือ private customer records [หลักฐานเดิม](evidence/QA.md) เป็น baseline ตามรุ่นที่ระบุ การรับรุ่นนี้ต้องมีผล checks/browser review ของรุ่นนี้และ [Pages provider/live-byte evidence](contracts/release.v1.7.0.json) เพิ่มจากการตรวจ source
