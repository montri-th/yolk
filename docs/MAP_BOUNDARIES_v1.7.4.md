---
document_id: yolk.map_boundary_appearance
version: 1.7.4
date: 2026-10-04
status: release_pending_current_QA
machine_contract: contracts/map-boundary-appearance.v1.7.4.json
---

# อ่านขอบเขตแผนที่และผลจาก Supply cutoff

เส้นขอบเป็นตัวช่วยอ่านพื้นที่ สี fill เป็นข้อมูล รุ่น 1.7.4 แยกสองหน้าที่นี้ชัดขึ้น: **เส้นขอบธรรมดาใช้ขาว, hover ใช้เหลือง Yolk** โดยไม่เปลี่ยนสีไข่ดาวและ native quantitative LUT 41 สี

| บทบาท | สีทั้งสองธีม | Stroke px | ภายใน |
|---|---|---:|---|
| จังหวัด | #FFFFFF | 1.2 | ไม่เพิ่ม selection fill |
| อำเภอในภาพประเทศ | #FFFFFF | 0.45 | คง choropleth fill เดิม |
| อำเภอเมื่อเจาะใกล้ | #FFFFFF | 1.05 | เป็นเส้นบริบทเมื่อไม่ได้ใช้เป็น choropleth |
| อำเภอที่เลือกเป็น parent context | #FFFFFF | 1.1 | unfilled / noninteractive |
| ทำเลทั่วไป | #FFFFFF | 0.45 | คง choropleth fill เดิม |
| ทำเลที่เลือก | #FFFFFF | 0.8 | fill=false |
| ขอบเขตที่คลิกได้เมื่อ hover | #FFBC1F | 2 | unfilled |
| กรอบพิกัดเมื่อไม่มี polygon | #FFFFFF | dashed | unfilled และติด label ว่าไม่ใช่ choropleth |

ภาพประเทศยังคลิกจังหวัดแม้ลงสีระดับอำเภอ ภาพจังหวัดยังคลิกอำเภอแม้ลงสีระดับแขวง/อปท. กรอบ hover ใช้ geometry ของขอบเขตที่คลิกจริง ไม่ใช้ขอบสีของพื้นที่เล็กแทน target ที่ใหญ่กว่า

เมื่ออยู่ใน location แสดงอำเภอที่เลือกเป็นบริบทเพียงหนึ่งอำเภอ ไม่นำทำเลข้างเคียงมาลงสีเพิ่ม เส้นบริบทกดไม่ได้ ไม่เพิ่ม counts/ranking และไม่รับรองสังกัดทางกฎหมายจาก display crosswalk

ลำดับการวาดใน renderer เดิม: fine fills → visible unfilled districts → provinces → selected fine → broader transparent navigation hits ไม่มี pane ใหม่ และไม่ย้ายหรือเปลี่ยน gradient defs ของ Tier 1

สีขาว #FFFFFF อ้าง Foundation surface.raised.light และสีเหลือง #FFBC1F อ้าง energy.yellow ของ LDS 0.9.7 เป็น scoped appearance ที่เจ้าของเลือก ใช้เหมือนกันทั้ง light/dark ป้าย ชื่อพื้นที่ breadcrumb และ keyboard focus ยังคงมีบทบาทแยกจาก stroke เพื่อให้ดูออกว่ากำลังเลือกอะไร

บน basemap สีอ่อน เส้นขอบขาวที่ไม่มี fill มี halo สีกลางบาง 0.35 px รองขอบ ใช้ --yl-border-strong ซึ่งอ้าง DS border.emphasis ตามธีม ใช้เฉพาะ SVG path ที่ fill="none", stroke="#FFFFFF" และ stroke-opacity="1" ไม่ใส่ filter กับพื้นที่ที่มีสีข้อมูลหรือทั้ง pane จึงไม่เปลี่ยน LUT สี Tier หรือสร้างตัววัดใหม่

## เลื่อนขวา คือเพิ่มจุดเริ่มเรียกว่า “มาก”

Supply HIGH ใช้ค่าจริง ≥ cutoff และ LOW ใช้ค่าจริง < cutoff ในโหมดเทียบตลาด ค่าจริง = จำนวนสาขา / ตัวหารตลาดที่เป็นบวก × หน่วยที่แสดง ตัวอย่าง 0.5 สาขาต่อหน่วยตลาด: cutoff 0.3 เป็น “มาก” แต่ cutoff 0.8 เป็น “น้อย” ข้อมูลจริงไม่เปลี่ยน

ช่วง slider และ step อิง role threshold ใน supplyCalibration (fallback เกณฑ์ทีม) ไม่อิงค่าที่กำลังลาก จึงคงที่เมื่อเปลี่ยนภาษา/หน้า ช่องกรอกตัวเลขยังรับค่าที่อยู่นอกช่วง slider โดยไม่ clip พร้อม warning เดิม ป้าย accessible ของ cached broad navigation targets อัปเดตตามภาษาปัจจุบัน ไม่เปลี่ยน geometry

เมื่อ Supply เปลี่ยนจาก HIGH เป็น LOW รูปแบบทำเลอาจเปลี่ยนตาม เช่น Crowded → FOMO เมื่อฝั่งเราลงเป็น LOW หรือ Crowded → Our Farm เมื่อคู่แข่งลงเป็น LOW ถ้า preset เลือกรูปแบบใหม่ไว้ ทำเลนั้นจึงเข้าเกณฑ์รวมได้มากขึ้น ผู้ใช้ที่เลือกรูปแบบอื่นอาจเห็นจำนวนลดหรือคงเดิม ห้ามอธิบายว่าขวาคือเพิ่มสาขาหรือเพิ่ม Demand

แผนที่และหน้าเกณฑ์แยก **ไข่แดงจาก Demand** กับ **ทำเลผ่านเกณฑ์ทั้งหมด** ไข่แดงคือ demand===true ในขอบเขตที่เลือกของแบบร่างปัจจุบัน ก่อน Tier ที่เลือก, Supply และรูปแบบทำเล ไม่นับ Demand ที่ยังสรุปไม่ได้ ไม่ขึ้นกับ viewport และไม่เปลี่ยนเมื่อปรับเฉพาะ Supply ผลคัดรวมยังใช้ gates เดิมทั้งหมด

กรณี Supply เป็นช่วงข้อมูล ให้คง possiblePatterns และ review: HIGH เมื่อ lower ≥ cutoff, LOW เมื่อ upper < cutoff หากคร่อมเกณฑ์ยังสรุปไม่ได้ การเลื่อนเกณฑ์ไม่ใช่หลักฐานเพิ่มหรือการตรวจผ่าน

ตรวจ semantics จาก [37 default contexts / 444 probes](../evidence/supply-cutoff-semantics-v1.7.4.json) ไม่แทนการตรวจ browser/touch และไม่รับประกัน monotonic สำหรับการเลือกแปดรูปแบบแบบอื่น

อ่าน [Product statement](../CityMETER_Yolk_Product_Statement_v1.7.4.md) และ [Implementation plan](../IMPLEMENTATION_PLAN_v1.7.4.md) รุ่นนี้ยังรอ current QA / provider / live-byte evidence ไม่ใช้ผลรุ่นก่อนแทนผลตรวจใหม่
