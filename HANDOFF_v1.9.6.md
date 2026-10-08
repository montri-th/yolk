# Developer handoff · CityMETER: Yolk 1.9.6 · candidate

[Full product + step-by-step plan](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.6.md) · [machine blueprint](contracts/full-product.v1.9.6.json) · [map-readability contract](contracts/map-readability.v1.9.6.json) · [release](contracts/release.v1.9.6.json)

เพิ่ม neutral underlay ใต้เส้นขอบสีขาวเดิม และใช้ไข่ดาวหนึ่งฟองสำหรับ Demand และสามฟองสำหรับโอกาสขยาย คง hierarchy/yellow hover/data fill, map/camera/criteria/drafts, profiles และ mobile flow 1.9.5 ไม่มี artwork/font ใหม่ เพิ่ม [Supply count/share/treemap](contracts/supply-inventory.v1.9.6.json) แบบ read-only จาก direct source vectors; สัดส่วนสาขาเราไม่ใช่ส่วนแบ่งยอดขาย U และ intervals แยกชัด

Production T00–T24 คงครบ เริ่ม T00 เพื่อสำรวจ stack จริงก่อนเลือก framework/datastore Preview เป็น browser-local; shared auth/RBAC/outbox/private media เป็น production tasks แยก

Fresh expanded Supply QA/native ผ่านแบบจำกัดตาม current receipt; หนึ่ง hover ที่ตรวจไม่ใช่ทุกขอบเขต Publication/live รอหลักฐานแยก ชุด handoff ใช้ explicit public paths ไม่มี raw acquisition/private customer/basemap tile cache Package parity, rendered review, provider และ live bytes เป็นหลักฐานคนละส่วน
