# Implementation plan · CityMETER: Yolk v1.9.6

เริ่มจาก [Product + plan จากศูนย์ไฟล์เดียว](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.6.md) และ [machine blueprint](contracts/full-product.v1.9.6.json). Production T00–T24 คงครบ เพิ่ม [map-readability extension](contracts/map-readability.v1.9.6.json) และ [Supply count/share/treemap](contracts/supply-inventory.v1.9.6.json) ใน T01/T12/T23

1. ตรวจ baseline ของ white boundaries/Demand/Opportunity icons บน basemap และ data fills จริง
2. เพิ่ม neutral underlay ใต้ขอบสีขาว คง parent-child hierarchy และ yellow hover โดยไม่เปลี่ยน data paint
3. ใช้ approved Yolk fried-egg graphic: Demand หนึ่งฟอง / Opportunity สามฟอง; คง caption และไอคอนงานตำแหน่งทั่วไป
4. ใช้ direct country/province/district/fine vector เพื่อคืนจำนวนแบรนด์, O/C/U, coverage และ bounds; เพิ่มยอด O+C และสัดส่วน 100×O/(O+C), ไม่เฉลี่ย local shares หรือรวมหมุดแทนยอดพื้นที่
5. เพิ่ม share map ด้วย li.market_share 41 ช่วง fixed0–100; treemap ใช้ observed counts, panel≤10/hover≤5/list40+40 และ Other ที่ตรวจชื่อได้
6. ตรวจ source/format/licence, 0/100/undefined share, U และ intervals ด้วย check-supply-market-share.cjs / check-supply-treemap.cjs รวม suites ปัจจุบัน
7. ตรวจ route/map camera, POI, single hover, selection, mobile flow/Expand และ TH/EN ทั้งสอง theme เก็บ actual screenshot/runtime SHA แล้ว bind docs
8. Final QA → explicit public seal → exact source/provider/live-byte verification → handoff ตาม T24

Fresh expanded Supply QA/native ผ่านแบบจำกัดตาม current receipt; หนึ่ง hover ที่ตรวจไม่ใช่ทุกขอบเขต Publication/live ต้องมีหลักฐานแยก ดู [release contract](contracts/release.v1.9.6.json). เกณฑ์/profile/engine/Strategy 1.9.0, guide 1.9.3, mobile flow 1.9.5, original artwork และ LDS 0.9.7 คงเดิม
