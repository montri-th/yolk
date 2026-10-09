# Implementation plan · 1.9.10

[Full product + implementation](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.10.md) is the complete human + machine authority. [Current remediation](docs/RED_TEAM_RESOLUTION_v1.9.10.md) records demo fixes. Production tasks remain planned until server evidence exists.

| Task | Work | Depends on | Phase |
|---|---|---|---|
| T00 | ตรวจ stack และ source ที่ทีมใช้จริง | — | P0 |
| T01 | ตั้ง shell ตาม LDS และ responsive map layout | T00 | P0 |
| T02 | สร้าง workspace, auth, seats และ schema | T00, T01 | P0 |
| T03 | นำเข้า snapshot และ geometry | T00, T02 | P0 |
| T04 | ทำ metric registry และ safe formula evaluator | T03 | P0 |
| T05 | ตรึง benchmark ทั่วประเทศ | T04 | P0 |
| T06 | ทำ Industry→Segment→Brand→Scope profiles | T00, T04, T05 | P0 |
| T07 | คำนวณ Demand ด้วย factor paths จำกัด 3 | T04, T05, T06 | P0 |
| T08 | ทำ Supply adapters และตัวหาร | T03, T06, T07 | P0 |
| T09 | แยก eligibility จาก ranking | T07, T08 | P0 |
| T10 | เพิ่ม 8 Strategy เป็นชั้นคิวสำรวจ | T07, T08, T09 | P0 |
| T11 | ทำ calculation API/worker และ cancellation | T02, T05, T07, T08, T09, T10 | P0 |
| T12 | ทำ persistent maps และ POIทุกdrilldown | T01, T03, T11 | P0 |
| T13 | ทำ criteria drafts และ Apply แบบตรวจ diff | T02, T07, T08, T09, T11, T12 | P0 |
| T14 | ทำหน้าโอกาสขยาย: preset → เหตุผล → เล็งทำเล | T06, T10, T11, T12, T13 | P0 |
| T15 | ทำ Target CRUD และ snapshotแผนสำรวจ | T02, T10, T13, T14 | P0 |
| T16 | ทำ Branch CRUD รูป5รูปและ source-first autofill | T02, T03, T12, T15 | P0 |
| T17 | ทำ Location detail และ governed review | T10, T12, T15, T16 | P0 |
| T18 | ทำ Feed Outbox Share และ leaderboard | T02, T13, T15, T16, T17 | P0 |
| T19 | ทำ source refresh และ accepted adoption | T03, T05, T11, T13, T17, T18 | P0 |
| T20 | P1 เพิ่ม anchors offerings และจุดเช่าจริง | T03, T15, T16, T17 | P1 |
| T21 | P2 เพิ่ม routes และ future watchlist | T12, T15, T20 | P2 |
| T22 | P3 เพิ่มข้อมูลผลธุรกิจเพื่อ calibration | T02, T15, T17, T19 | P3 |
| T23 | ตรวจรับ end-to-end และ production | T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19 | P0 |
| T24 | Seal publish และส่ง handoff | T23 | P0 |
