# CityMETER: Yolk — Product statement + Implementation plan 1.9.9

เอกสารเดียวสำหรับ PO, dev และ interns: ส่วนแรกอธิบายงานและข้อจำกัด ส่วนท้ายเป็น machine blueprint ฉบับเดียวกับ `contracts/full-product.v1.9.9.json` ไม่ต้องประกอบ JSON จากรุ่นเก่า

## 1. ผลิตภัณฑ์นี้ช่วยอะไร

**หาไข่แดง ขยายตลาด** — ช่วยทีมขยายสาขาเลือกทำเลที่ควรสำรวจจากข้อมูล CityMETER ทั่วประเทศ เริ่มด้วย preset ของแบรนด์ เห็นเหตุผลและข้อมูลที่ยังขาด แล้วบันทึกทำเลพร้อมผู้รับผิดชอบและแผนตรวจหน้างาน

ขั้นตอนหลักคือ **คัด Demand สูง → เปรียบเทียบ Supply/การแข่งขัน → เลือก Strategy → ดูเหตุผล → เล็งทำเล** หน้าแรก “โอกาสขยาย” รวมภาพรวมกับ Strategy ไว้ด้วยกัน; Demand และ Supply เป็นหน้าสำหรับตรวจเหตุผลต่อ

Demo รองรับ Fuel, Grocery และ Non-bank เท่านั้น มี 37 แบรนด์ให้เลือก รวม Non-bank 10 รายแรก พร้อม peer inventory ตาม source ไม่เพิ่ม industry โดยแต่งข้อมูล ไม่มีคำรับรองยอดขาย ความสำเร็จ หรือลูกค้าจริงจาก proxy เพียงตัวเดียว

## 2. คำที่ต้องเข้าใจตรงกัน

| สิ่งที่เห็น | ความหมาย | สิ่งที่ห้ามสรุปแทน |
|---|---|---|
| ไข่แดงเข้ม / ไข่แดง / ไข่ขาว | Demand proxy สูงมาก / สูง / ค่อนข้างสูง ตามเงื่อนไขของ preset | ลูกค้าจะซื้อจริงหรือกำไรแน่นอน |
| Supply O / C / U | สาขาเรา / คู่แข่งที่ระบุได้ / ไม่ทราบหรือรอตรวจ | ศักยภาพให้บริการ หรือส่วนแบ่งยอดขาย |
| Branch share | 100 × O / (O+C); U แยก; 0/0 ไม่คำนวณ | Sales market share |
| Strategy candidate | ทำเลมีเบาะแสที่ควรตรวจต่อ | ทำเลผ่านการลงทุนแล้ว |
| Incomplete / unsupported | หลักฐานไม่พอ / strategy ยังไม่มี adapter | ศูนย์สาขา หรือทำเลไม่น่าสนใจ |
| Preset | สมมติฐานตั้งต้นของ Yolk ตามข้อมูลแบรนด์ | กฎที่แบรนด์รับรอง หรือผล calibration แล้ว |

## 3. ข้อมูลและสูตร

ใช้ 7,954 reporting UUIDs, 25 metrics: Bangkok khwaeng และ upcountry LAO พร้อม native district vectors 928 อำเภอ UUID/ขอบเขตแสดงผลและหน่วยข้อมูลไม่ใช่สิ่งเดียวกัน ห้ามรวมค่า native Supply จาก POI หรือ ambiguous crosswalk

Demand มีได้สูงสุด 3 factor families, family ละ 3 metrics, path ละ 3 เงื่อนไข AND; OR ระหว่าง paths Tier ที่ผ่านดีที่สุดเป็น qualifyingTier สูตร eligibility คือ `demand === true && qualifyingTier >= 1 && qualifyingTier <= maxDemandTier` ไม่ให้ Supply, strategy หรือน้ำหนักเพิ่มสมาชิก Demand

Supply ใช้ตัวหาร extensive ที่เป็นบวกหนึ่งตัวต่อ preset เปลี่ยนได้พร้อมหน่วยชัดเจน เก็บ measured zero, missing, suppressed, unknown brand และ assignment bounds แยกกัน กรณี boundsKnown=false ห้ามสร้าง gap score แบบ exact แม้ endpoints จะเท่ากัน

น้ำหนักใช้จัดอันดับในหน้า Demand; หน้าโอกาสขยายใช้เบาะแส Strategy/Tier ตาม contract ไม่เปลี่ยนสูตรเงียบ ๆ Country/province/district/fine counts ใช้ direct-source ที่ grain ตรงกัน

Locale Insight ใช้เป็น contextual prior สำหรับวางแผน/สำรวจ/จัดลำดับเท่านั้น ต้องมี crosswalk ก่อน aggregate ไม่ใช้เป็น official population, eligibility, statutory boundary, risk หรือพฤติกรรมจริง

## 4. Brand profiles และ 8 strategies

เลือก industry → brand → format สำคัญของแบรนด์เป็นค่าเริ่มต้น; saved criteria/draft มาก่อน preset ใหม่ การลอง preset ใหม่สร้าง private draft พร้อม diff ไม่ยกระดับเป็นเกณฑ์ทีมโดยอัตโนมัติ เลือก strategy พร้อมกันไม่เกิน 3

| Strategy | งานที่ช่วยชี้ | ขอบเขตหลักฐาน |
|---|---|---|
| Underserved market | ตรวจพื้นที่ Demand สูงเทียบสาขาใน scope | P0 เมื่อ supply/denominator มีความหมาย |
| Segment gap | หา segment ที่ยังไม่ตอบโจทย์ | P1 ต้องมี offering/segment จริง |
| Competitive entry | ตรวจความเข้มข้นการแข่งขัน | P0 เป็นเบาะแส ไม่ใช่โอกาสชนะ |
| Cluster participation | ประเมินประโยชน์ของการอยู่ร่วมกลุ่ม | P1 ต้องมี cluster ทางกายภาพ/occasion |
| Complementary location | หา context ที่ช่วยเกื้อหนุนธุรกิจ | P0 area context; P1 proximity โรงพยาบาล/โรงเรียน/anchors |
| Route capture | ตรวจการเข้าถึงและเส้นทาง | P2 route/traffic/access evidence |
| Network infill | ตรวจช่องว่างเครือข่ายเรา | P0 ตาม scope ที่รองรับ; ต้องสำรวจ cannibalization |
| Future entry | เฝ้าดูจังหวะเปิดตลาด | P2 milestone/permission evidence |

อ่าน [brand research](docs/BRAND_RESEARCH_v1.9.0.md), [registry](prototype/data/brand-strategy-profiles.v1.9.0.json) และ [คู่มือพร้อมภาพตัวอย่างสมมติ](prototype/data/strategy-guide.v1.9.3.json) Operator claim ไม่ใช่ measured consumer perception; company license ไม่ยืนยัน offering ของแต่ละ office

## 5. UX และ design contracts

- หนึ่ง Leaflet instance ตลอด flow; เก็บกล้องเมื่อปรับเกณฑ์/เปลี่ยนเมนู การ fit/zoom เกิดจาก navigation ที่ชัดเจนหรือรักษาขอบเขตใกล้ประเทศไทย
- Country สีระดับอำเภอ คลิก/hover ระดับจังหวัด; province สี fine คลิกอำเภอ; district สี fine คลิก fine; selected fine ด้านในโปร่งใส
- Supply default สีพื้นที่; เลือก Branch points ได้ทุกระดับ แสดงพิกัดที่ผ่าน filter ทุกจุดโดยไม่ group เป็นค่าเริ่มต้น Canvas ช่วยลดจำนวน DOM; grouping เป็นตัวเลือกเท่านั้น
- จุดทับกันต้องค้นหา/กรอง/ดูรายละเอียดได้ ไม่ย้ายพิกัดจริงหรือใช้จำนวนหมุดแทน native totals
- Desktop ให้แผนที่เป็นพื้นที่หลัก Mobile scroll ใน document flow เพื่ออ่านรายละเอียดด้านล่างได้
- Demand icon ใช้ไข่ดาว Yolk หนึ่งใบ; Opportunity สามใบ; Supply menu ใช้ร้านค้า; shield/swords เป็น role ภายใน Supply พร้อม caption
- LDS0.9.7 และ Location Profile ตาม [DS integration](DS_ASSET_INTEGRATION.md) ใช้ assets/LUT exact เดิมทั้งสองธีม Tier1 gradient density.area LUT20–40, Tier2 #FFBC1F, Tier3 #F1F4EF; อื่น ๆ 41 stops ตามความหมาย
- เส้นขอบขาวพร้อม neutral underlay, parent หนากว่า child พอแยกได้, hover สี Yolk yellow; no decorative brackets/colored selected left rail
- ภาษาไทย/อังกฤษกระชับ มี focus, keyboard, reduced-motion; ข้อมูลสำคัญไม่พึ่งสีอย่างเดียว

## 6. การบันทึกและหลักฐานการตัดสินใจ

บันทึก entity, context และ event เป็น snapshot เดียวหลังผ่าน conflict check; ใช้ lock สำหรับ writer หลายแท็บ ไม่ยืนยันสำเร็จก่อน durable write สำเร็จ เมื่อ storage หรือ photo ล้มเหลวต้องคง draft และไม่สร้าง success/event ปลอม Browser-local safeguard ไม่แทน server transaction

ทุกปุ่มเล็งทำเลเก็บเกณฑ์และ context ที่ผู้ใช้เห็น พร้อม canonical criteria hash, source dependency hashes, engine/profile/release binding, draft/team state, findings/missing evidence, next task, owner และเวลา หากไม่ได้เลือก strategy ให้บอก not_assessed ไม่แต่งผล

แบบร่างต้องไม่หายเมื่อสลับหน้า/back/forward/เปลี่ยนธีม ข้ามไปเนื้อหาเปลี่ยน focus ไม่เปลี่ยน route ผล private draft ที่เปิดรายละเอียดต้องใช้ context เดิมจนผู้ใช้เลือกกลับเกณฑ์ทีม ไม่ Apply เงียบ ๆ

ตรวจ branch revision/context/form ticket หลังทุก await ที่เกี่ยวกับภาพหรือพิกัด; re-resolve entity ปัจจุบันก่อน commit ไม่ใช้ captured object ที่อีกแท็บแทนไปแล้ว สถานะ active หมายถึงทีมยืนยันว่าเปิด ไม่ได้พิสูจน์ไปสำรวจหน้างาน

## 7. สถาปัตยกรรมและ production boundary

Preview เป็น static public adapter + browser-local workspace/IndexedDB; production ต้องใช้ stack จริงของ CityMETER (เริ่ม T00) พร้อม tenant-aware auth/RBAC, versioned source adapters, spatial query, transactional entity/event/outbox, idempotent notification และ private media server

แยก adapter, analytical engine, evaluation manifest, workspace transaction, draft store, map controller และ renderer DTO/schema/API ที่เสนอครบใน JSON ท้ายไฟล์ เป็น implementation plan ไม่ใช่ API ที่เปิดใช้งานแล้ว Standard enterprise seats 1 Admin / 3 Editors / 6 Viewers

```mermaid
flowchart LR
  A[CityMETER source + provenance] --> B[Demand eligibility]
  B --> C[Supply and uncertainty]
  C --> D[Strategy evidence queue]
  D --> E[Displayed evaluation context]
  E --> F[Immutable shortlist snapshot]
  F --> G[Field validation and team evidence]
```

## 8. วิธีทำงานทีละขั้นสำหรับ intern

เริ่มเพียง task ที่ dependencies ผ่านแล้ว อ่าน inputs ตรวจ source/หน่วย/สถานะ เขียน bounded module ทำ acceptance และ tests ของ task ก่อนส่ง diff พร้อมสิ่งที่ยังไม่ยืนยัน ห้ามเปลี่ยนข้อมูล/threshold เพื่อทำให้ demo ดูดี หรืออ้าง backend เสร็จจากหน้า static

### T00 · ตรวจ stack และ source ที่ทีมใช้จริง

Phase: P0 · Dependencies: ไม่มี · PLANNED_PRODUCTION

**Inputs**

1. This full document
2. Current CityMETER source/auth/spatial/media/queue repositories
3. DS integration

**Outputs**

1. Stack map
2. rights/source inventory
3. exact runtime-to-production field map

**Steps**

1. Identify existing ownership, auth/tenant identifiers and storage boundaries.
2. Inventory source fields, periods, coverage, UUID grain, rights and missing states.
3. Map current runtime globals to typed services; retain immutable snapshots.

**Acceptance**

1. No new framework/datastore chosen before stack mapping.
2. 25 metrics and fixed 7954 UUIDs accounted for; hospital/school adapters explicitly pending.

**Verify**

1. Source hash/catalog validation
2. Review source/permission registry

**Coding prompt:** Implement only T00: ตรวจ stack และ source ที่ทีมใช้จริง. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T01 · ตั้ง shell ตาม LDS และ responsive map layout

Phase: P0 · Dependencies: T00 · PLANNED_PRODUCTION

**Inputs**

1. Verified LDS0.9.7 base/profile
2. Current routes and UI assets
3. expansion-experience.v1.9.3.json
4. contracts/map-space.v1.9.4.json
5. contracts/mobile-flow.v1.9.5.json
6. contracts/map-readability.v1.9.6.json
7. contracts/supply-inventory.v1.9.9.json
8. contracts/visual-refinement.v1.9.9.json
9. contracts/branch-points.v1.9.9.json

**Outputs**

1. Accessible TH/EN light/dark shell
2. One persistent map host
3. Compact map toolbar, responsive explicit expanded mode and soft foundation surfaces

**Steps**

1. Use existing fonts/logos/icons with verified role/hash.
2. Build mobile-first content panels; desktop map remains large and visible.
3. Keep visible keyboard focus, captions and theme surfaces; no motifs/logo frames/left rails.
4. Isolate semantic icon font from caption/body/strong rules; use fixed nonshrinking icon box and a single readable caption per Supply role control.
5. Use fixed22px nonshrinking semantic glyphs,8px gaps, a single DS caption and an explicit JetBrains counter span. Wrap the five filters within available persistent-map workspace width without horizontal page overflow; preserve keyboard focus/caption-only hover underline.
6. Use approved softer foundation canvas/panel tokens in light theme; keep analytical colors unchanged.
7. Build one compact toolbar with progressive options and an explicit mobile Expand/Compact control, minimum44px touch targets.
8. Use generic store for overall Supply and retain shield/swords only for their own/competitor roles; define readable accent link/focus states.
9. For widths <=1099px, apply the retained mobile-flow1.9.5 normal document-flow map panel clamp(420px,80svh,800px), page-scroll gestures until explicit Expand, and unchanged expanded height/desktop layout. Distinguish host height from actual canvas and review actual narrow content.

**Acceptance**

1. No map recreation on route change.
2. Rendered real Thai/English headings fit 390/1440px in both themes.
3. No raw icon ligature text, overlapping icons/captions or horizontal page overflow.
4. Expanded/compact layout does not recreate the map, apply criteria or emit team events.
5. Real TH/EN control text remains readable and touch-accessible with map occupying useful screen space.
6. Supply optional point view retains enough visible map canvas after its controls/footer; actual narrow native measurements are required.
7. Apply current map-space extension without changing retained calculations; record actual rendered map dimensions and accessible disclosure behavior.
8. At narrow widths, ordinary page scroll reaches the work panel after the map without a sticky map trapping the viewport; preserve map/context/drafts and desktop behavior.
9. Use neutral boundary contrast underlays and approved one-egg Demand / three-egg Opportunity mnemonic graphics without changing data fill, hierarchy, criteria or map/mobile behavior; review actual rendered states.
10. Honor current visual-refinement contract without changing analytical/source/storage semantics.
11. Honor all-points default and explicit optional screen grouping; preserve native totals/coordinates and document measured performance separately.

**Verify**

1. Font/logo network checks
2. Native visual review and keyboard navigation
3. check-icon-controls.cjs
4. Native computed glyph/caption/counter faces and no overlap at390/1440

**Coding prompt:** Implement only T01: ตั้ง shell ตาม LDS และ responsive map layout. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T02 · สร้าง workspace, auth, seats และ schema

Phase: P0 · Dependencies: T00, T01 · PLANNED_PRODUCTION

**Inputs**

1. Existing auth/datastore
2. Proposed entities/indexes/RBAC

**Outputs**

1. Tenant-scoped database schema
2. Server-enforced role/seat checks

**Steps**

1. Define full context tuple and tenant indexes.
2. Enforce 1 admin + 3 editors + 6 viewers, preserve last admin.
3. Authorize every API, storage read and share path; actor selectors are preview only.

**Acceptance**

1. Cross-tenant IDs are inaccessible.
2. Viewer can preview privately but cannot mutate shared criteria/records.

**Verify**

1. Two-tenant attack fixtures
2. Seat concurrent writes
3. RBAC service/API tests

**Coding prompt:** Implement only T02: สร้าง workspace, auth, seats และ schema. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T03 · นำเข้า snapshot และ geometry

Phase: P0 · Dependencies: T00, T02 · PLANNED_PRODUCTION

**Inputs**

1. Immutable source files
2. Source hashes/periods/rights
3. Display geometry/crosswalk

**Outputs**

1. SourceRelease/Area/MetricObservation/SupplyObservation stores
2. Explicit many-to-many display crosswalk

**Steps**

1. Import rows by exact source UUID, preserving raw states.
2. Keep native928district inventory independent from fine-area totals.
3. Keep source area denominator separate from simplified display geometry.
4. Validate geometry and state missing geometry as unfilled extent, not a fabricated polygon.

**Acceptance**

1. No name-only joins or allocation of residuals.
2. 45 multi-district display links do not duplicate national/province fine UUID counts.

**Verify**

1. Hash and row uniqueness
2. Geometry/crosswalk counts
3. Native-vs-fine reconciliation fixtures

**Coding prompt:** Implement only T03: นำเข้า snapshot และ geometry. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T04 · ทำ metric registry และ safe formula evaluator

Phase: P0 · Dependencies: T03 · PLANNED_PRODUCTION

**Inputs**

1. 25 metric definitions/formula AST
2. Allowed source fields

**Outputs**

1. Typed registry
2. Safe arithmetic evaluator with provenance

**Steps**

1. Implement only allowlisted fields/operations, selectors and age slices.
2. Require positive extensive denominators; preserve no_data/zero/not_applicable/suppressed.
3. Attach unit/source period/measurement and lineage to each result.

**Acceptance**

1. No eval, arbitrary JS or request-provided SQL.
2. GFA per person uses population dataset; fiscal per person uses fiscal.population.

**Verify**

1. AST allowlist/injection rejection
2. Zero/missing denominator
3. Age20:65 slice endpoints

**Coding prompt:** Implement only T04: ทำ metric registry และ safe formula evaluator. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T05 · ตรึง benchmark ทั่วประเทศ

Phase: P0 · Dependencies: T04 · PLANNED_PRODUCTION

**Inputs**

1. Fixed7954UUID source release
2. Known values per metric

**Outputs**

1. Immutable national distributions
2. Benchmark release/hash/cohort

**Steps**

1. Build each metric distribution from valid comparable values including observed zero.
2. Use declared INC percentile cutoff; maintain rank-midrank as a distinct display statistic.
3. Do not recalculate benchmark by selected province, brand or map viewport.

**Acceptance**

1. Zoom/brand/province filters leave benchmark hashes/cutoffs unchanged.
2. Missing observations do not enter denominator or become zero.

**Verify**

1. INC/ties fixtures
2. Known-zero fixture
3. Cohort isolation

**Coding prompt:** Implement only T05: ตรึง benchmark ทั่วประเทศ. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T06 · ทำ Industry→Segment→Brand→Scope profiles

Phase: P0 · Dependencies: T00, T04, T05 · PLANNED_PRODUCTION

**Inputs**

1. 37-brand researched registry
2. 9 preset families
3. Current source format/license scopes

**Outputs**

1. Versioned IndustryProfile/SegmentProfile/BrandProfile registry
2. Per-scope starter criteria

**Steps**

1. Separate official offering/positioning, Yolk inference and unresolved consumer perception.
2. Bind grocery important/source-supported default format, preserving alternatives.
3. Keep only10selectableNonbankcompanies but compare the full compatible source inventory.
4. Treat COSMO/current identity, PURE rebrand and legal-company/office capability as explicit verification topics.
5. Seed only unseen context or explicit Try preset; saved draft/revision wins.
6. Bind owner-provided VillaMarket/Lawson108/Tops artwork to existing brand IDs and preserve exact original bytes/hash/MIME/dimensions; no format/preset/profile changes.

**Acceptance**

1. No company/group marketing auto-merges distinct IDs.
2. Numeric presets are labeled Yolk hypotheses, not operator-endorsed thresholds.
3. Brand name remains adjacent to original compact artwork; identity and source-scope counts do not change.

**Verify**

1. 37 bindings/9 families validation
2. Official source links and profile status
3. Context restore and brand switch tests

**Coding prompt:** Implement only T06: ทำ Industry→Segment→Brand→Scope profiles. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T07 · คำนวณ Demand ด้วย factor paths จำกัด 3

Phase: P0 · Dependencies: T04, T05, T06 · PLANNED_PRODUCTION

**Inputs**

1. Brand per-scope factorPresets/criteriaOverrides
2. National benchmark

**Outputs**

1. Pure Demand/Tier engine
2. Maximum-three factor validators

**Steps**

1. Allow at most3enabledfactor families and at most3distinct metrics within each.
2. AND within path; OR across alternative paths; choose best confirmed tier.
3. Require known positive value when positive_presence is enabled.
4. Retain interval/unknown possibility separately from confirmed result.
5. Declare new fuel path hypothesis explicitly; do not equate it with historical6-activity5/3/1 votes.

**Acceptance**

1. eligible = demand===true AND Tier1..3 AND tier<=maxDemandTier.
2. Unknown does not qualify; disabled factors do not affect result; a fourth factor/metric is rejected server-side.

**Verify**

1. Pure fixture per family
2. No-data path logic
3. Max3 enforcement
4. Saved historical criteria migration

**Coding prompt:** Implement only T07: คำนวณ Demand ด้วย factor paths จำกัด 3. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T08 · ทำ Supply adapters และตัวหาร

Phase: P0 · Dependencies: T03, T06, T07 · PLANNED_PRODUCTION

**Inputs**

1. Native/fine source inventory
2. Selected source scope
3. Raw extensive denominator

**Outputs**

1. Own/competitor/unresolved bounds
2. Count/rate comparisons and exploratory references

**Steps**

1. Filter grocery by source format; Nonbank by declared company-license scope.
2. Preserve unknown brand, unknown operations and Nonbank assignment intervals.
3. Relative mode divides count by one selected positive raw market base; default fuelGFA100000m², Grocery/Nonbankpopulation10000persons.
4. Seed per-role national positive exact medians with N>=5; exclude intervals/nonzero-or-unknown U.
5. If boundsKnown=false, no upper-bound certainty is assumed.

**Acceptance**

1. Missing denominator or assignment bounds remain unresolved.
2. Do not classify registered adult population as borrowers or all fuel stations as identical fuel offerings.

**Verify**

1. Joint-U/interval tests
2. Scope identity/licence fixtures
3. Relative median exclusion
4. Count/rate units

**Coding prompt:** Implement only T08: ทำ Supply adapters และตัวหาร. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T09 · แยก eligibility จาก ranking

Phase: P0 · Dependencies: T07, T08 · PLANNED_PRODUCTION

**Inputs**

1. Demand results
2. Supply gap references
3. At most3weights

**Outputs**

1. Stable context and weighted comparators
2. Rank bounds and coverage

**Steps**

1. Context ordering uses Demand tier/path strength; weighted ordering uses Demand/ownGap/competitorGap.
2. Use nonnegative weights, positive weight sum and retained gap100/(1+N/T).
3. Compute conservative bounds for valid joint uncertainty allocations.
4. Keep historical pattern fields inert and preserve history.

**Acceptance**

1. Supply modes/references/weights change order only, never Demand/Tier/eligible IDs.
2. No negative-weight hack for competitive-entry or cluster strategy.

**Verify**

1. Membership invariants
2. Allzero weights rejection
3. Joint allocation admissibility
4. Deterministic ties

**Coding prompt:** Implement only T09: แยก eligibility จาก ranking. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T10 · เพิ่ม 8 Strategy เป็นชั้นคิวสำรวจ

Phase: P0 · Dependencies: T07, T08, T09 · PLANNED_PRODUCTION

**Inputs**

1. opportunity-strategies.v1.9.0.json
2. Evaluated rows
3. Brand/scope profile

**Outputs**

1. Pure OpportunityEngine
2. Separate candidate/incomplete/unsupported queues

**Steps**

1. Call assess/view after Demand evaluation.
2. Limit selected strategies to3; current market candidates require confirmed eligible Demand.
3. Implement supported cue rules1/3/5/7 with bounds and relevant actual area metrics.
4. Show2/4/6/8missing-data guides without artificial scores.
5. Return reasons/evidenceRefs/missingEvidence/nextAction and source/criteria/profile versions.
6. Feed the first-page candidate-to-check queue through the same assessor/view comparator; do not calculate a new sales/opportunity score.

**Acceptance**

1. Every candidate has an explicit first field task.
2. Future areas cannot enter current Yolk counts.
3. Population alone is not a Complementary anchor.

**Verify**

1. check-opportunity-strategies.cjs
2. Real national membership invariants
3. KhanHamworkers49339 example

**Coding prompt:** Implement only T10: เพิ่ม 8 Strategy เป็นชั้นคิวสำรวจ. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T11 · ทำ calculation API/worker และ cancellation

Phase: P0 · Dependencies: T02, T05, T07, T08, T09, T10 · PLANNED_PRODUCTION

**Inputs**

1. Request/response envelopes
2. Pure engines

**Outputs**

1. Calculation endpoints
2. Content-addressed cache
3. Latest-request guard

**Steps**

1. Send full context/source/benchmark/profile/criteria hash/requestId.
2. Compute in worker/service appropriate to real stack; reject stale context/route tickets.
3. Return added/removed IDs separately even when net count is unchanged.
4. Return validation state, not stale results, for invalid input.

**Acceptance**

1. Race brand/route/source changes cannot publish old result.
2. Preview does not create shared events.

**Verify**

1. Deferred reversed responses
2. Same-countdifferentIDs
3. Cache version invalidation

**Coding prompt:** Implement only T11: ทำ calculation API/worker และ cancellation. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T12 · ทำ persistent maps และ POIทุกdrilldown

Phase: P0 · Dependencies: T01, T03, T11 · PLANNED_PRODUCTION

**Inputs**

1. Map semantics/DS scales
2. Native district and fine geometry
3. Source coordinate adapters
4. Expansion map hierarchy/layout/tile-recovery contract
5. contracts/map-space.v1.9.4.json
6. contracts/mobile-flow.v1.9.5.json
7. contracts/map-readability.v1.9.6.json
8. contracts/supply-inventory.v1.9.9.json
9. contracts/visual-refinement.v1.9.9.json
10. contracts/branch-points.v1.9.9.json

**Outputs**

1. One map controller
2. Demand/Supply/Strategy layers
3. Supply optional point mode
4. Direct source-vector identified totals/share and reusable brand-count treemap panel/hover

**Steps**

1. Country paintdistrict/clickprovince; provincepaintfine/clickdistrict; districtpaintfine/clickfine.
2. Supplydefaultsregions; pointview optional country/province/district/fine withsamecamera.
3. Render every filtered valid coordinate by default without clustering/truncation; optional screen grouping preserves every record and is enabled explicitly in Map Options.
4. Keep selectedfine/point interiors transparent, relativewhiteboundary hierarchy and yellowclickablehover.
5. Reuse exact41LUTcolors; retain egg-tier recipe separately.
6. Make one escaped name/value/unit hover tooltip owned by clickable scope. Current Supply count/share and supported market context use the direct hovered native parent vector or fine reporting UUID vector, never maximum or averaged child metrics. Keep POI filtered in-boundary coordinate counts distinct from source totals. Clamp the compact treemap tooltip to the visible map with8px inset; keyboard focus opens the same tooltip.
7. Apply quiet point-only stroke schedule: country provinces1.2px; province districts0.65px; district chosen parent1.1px with transparent fine hit targets; fine selection0.8px. Retain yellow2px hover and all geometry/data.
8. Preserve existing white parent/child widths and pair every currently visible ordinary source outline with the neutral #101318 stroke-only underlay at foreground width +0.80px. Apply current panes410/411 and yellow hover412; retire parent-only halo/generic drop-shadow and never fill, filter or transform analytical paint. Quiet POI adds no child mesh. Read current map-readability1.9.6 values.
9. Invalidate after explicit expanded/compact host sizing; preserve same map/camera/navigation and open popup anchor for height-only changes.
10. Implement and verify readable tile loading/partial failure/retry status separately from analytical/source status; remain explicit if the runtime/provider evidence is still pending.
11. Retry recreates only the existing same-style public tile layer via setBasemap(S.basemap), retaining Leaflet map/camera/source/criteria/provider. Never GridLayer.redraw at fractional map zoom: native10.25 review emitted an invalid tile URL; verify integer tile zoom requests and actual recovery.
12. Retire the previous tile layer through public map.removeLayer(previous) before previous.off(). Leaflet once(remove) must perform map-event cleanup first; check repeated retry/style replacement and later zoom/resize for one active listener/layer without retired callbacks.
13. Read the pinned source dimensions/scope adapters and test exact0/100/undefined ratios and unknown coverage first.
14. Implement the pure direct-vector count/share API with source rows, bounds and explicit flags; preserve existing screening/ranking.
15. Add fixed0..10041-LUT share alongside existing count/rate maps; totalcount uses relationtotal.
16. Reuse one treemap renderer in panel and the single boundary-hover owner, with compact/full limits and named list disclosure.
17. Bind exact verified DS brand-color mapping, near-Thailand display envelope, settled-host tile invalidation, four controls in two compact pairs, and comma-grouped visible quantities; retain raw numerics and camera/context.
18. Default Branch points to all filtered valid coordinates with efficient Canvas, preserved detailed logo/popup access and duplicate discovery; bind exact frozen source and current measured evidence.

**Acceptance**

1. Camera changes only explicit navigation/focus/fit/clusterclick.
2. Screen bins are not physical market-cluster evidence.
3. Source coordinates and native supply counts never conflated.
4. No duplicate paint/navigation tooltips.
5. POI view remains readable at all four administrative scopes.
6. Parent hierarchy is visible without dense child mesh; POI quiet policy stays unchanged.
7. Basemap failure never changes source metrics, eligible IDs or saved evidence; retry must have actual evidence before claiming success.
8. A fractional map zoom followed by retry emits provider-valid integer tile zoom requests, preserves camera/criteria, and has bounded native recovery evidence.
9. Apply current map-space extension without changing retained calculations; record actual rendered map dimensions and accessible disclosure behavior.
10. At narrow widths, ordinary page scroll reaches the work panel after the map without a sticky map trapping the viewport; preserve map/context/drafts and desktop behavior.
11. Use neutral boundary contrast underlays and approved one-egg Demand / three-egg Opportunity mnemonic graphics without changing data fill, hierarchy, criteria or map/mobile behavior; review actual rendered states.
12. Native parent vectors supply parent totals/distribution; no LAO crosswalk or POI-marker rollup.
13. Unknown U and unresolved licence evidence never silently become own/competitor exact counts.
14. O+C count0 stays known while0/0 share remains undefined; valid0/100 ratios retain percentage domain.
15. Exact fixed-domain41 share LUT matches pinned LDS bytes in both themes; no percentile stretch/opacity or color transformation.
16. Every plotted rectangle equals observed count fraction; Other preserves total and own remains inspectable.
17. Honor current visual-refinement contract without changing analytical/source/storage semantics.
18. Honor all-points default and explicit optional screen grouping; preserve native totals/coordinates and document measured performance separately.

**Verify**

1. check-workspace-map.cjs
2. check-supply-poi-modes.cjs
3. Paint/click boundaries
4. Real light/dark narrow/desktop
5. check-map-clarity.cjs
6. Native hover name/value and point-boundary review
7. check-map-hierarchy.cjs
8. Native expanded/compact controls, actual boundary hierarchy and tile failure/retry review
9. check-map-recovery.cjs
10. scripts/check-supply-market-share.cjs
11. scripts/check-supply-treemap.cjs

**Coding prompt:** Implement only T12: ทำ persistent maps และ POIทุกdrilldown. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T13 · ทำ criteria drafts และ Apply แบบตรวจ diff

Phase: P0 · Dependencies: T02, T07, T08, T09, T11, T12 · PLANNED_PRODUCTION

**Inputs**

1. Scoped CriteriaRevision
2. Factor controls and defaults

**Outputs**

1. Private draft editor
2. Revision/event/outbox Apply transaction

**Steps**

1. Separate Demand, Supply and ranking controls; all numeric thresholds have slider+exact input.
2. Validate max3choices at UIandserver.
3. Apply withbaseRevision/idempotencykey and full diff; reject stale409whilepreservingdraft.
4. Try preset seeds private draft only; migration creates no team revision on load.

**Acceptance**

1. No-op and retries emit at mostone event; fourthfactor/strategy rejected.
2. Saved criteria are not overwritten by registry update.

**Verify**

1. Concurrent editors/no-op/retry
2. Draft context isolation
3. Range+number/focus retention

**Coding prompt:** Implement only T13: ทำ criteria drafts และ Apply แบบตรวจ diff. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T14 · ทำหน้าโอกาสขยาย: preset → เหตุผล → เล็งทำเล

Phase: P0 · Dependencies: T06, T10, T11, T12, T13 · PLANNED_PRODUCTION

**Inputs**

1. Brand profiles
2. Opportunity outputs
3. Source/criteria versions
4. expansion-experience.v1.9.3.json
5. prototype/data/strategy-guide.v1.9.3.json

**Outputs**

1. One canonical Expansion opportunities first page
2. Eight strategies within that page, maximum3selected
3. Two visible primary counters: confirmed Demand and places to investigate; separate navbar shortlist count and evidence states in disclosure
4. Candidate reasons and first field task before save
5. Read-only bilingual eight-strategy guide with hypothetical explanatory diagrams

**Steps**

1. Reuse the selected brand/scope researched preset or saved criteria/draft to show the evidence-limited candidate queue immediately.
2. Merge country overview and Strategy into canonical#market without a second map or new analytical score.
3. Show1–3selectedstrategies within this page; expose the same eight strategies with clear capability/missing-evidence states.
4. Keep Demand and Supply as dedicated supporting pages and preserve the same map/camera while inspecting them.
5. Map legacy#strategy to#market while preserving context, selected strategies, camera, team criteria and private drafts; no remount, implicit Apply or event.
6. Show location reason, actual value/unit/period, missing evidence, first field task and shortlist action.
7. Keep Demand tier paint only on candidates; transparent nonmatch is not low Demand. Explain zero results and current scope.
8. Show two first-page counters: confirmed Demand and candidate-to-check in the selected scope. Retain the shortlist count in navigation.
9. Show concise first reason per candidate; disclose complete reasons, missing evidence and first field task progressively.
10. Build a read-only guide from the bilingual registry, with a clean eight-icon overview and detail dialog. Diagrams are illustrative and examples hypothetical.
11. Expose each strategy guide from main-page cards/tags and the lazy inline chooser; do not change selection or criteria when opening a guide.
12. Close on Escape/explicit control and restore focus to the opener; protect focus order, scrolling and long TH/EN paragraphs at narrow widths.

**Acceptance**

1. Demand count, strategy candidate count and shortlisted count remain distinct.
2. Keyboard/touch choices work and max3states are explained.
3. An unseen brand context reaches a meaningful evidence-limited view without mandatory user data; missing evidence is explicit, not fabricated.
4. Old strategy links preserve current map/context/draft and do not create a duplicate active page.
5. All eight guide IDs/icons/text and three-step examples match the registry and retained strategy semantics.
6. Every guide states P0 capability versus additional evidence, including unsupported strategies and separate future watchlist.
7. Guide open/read/close does not change criteria, Demand IDs, selected strategies, map camera, team events or saved work.

**Verify**

1. Projection doesnotmutatebaseIDs
2. Card counter consistency
3. TH/EN actual UI review
4. Fresh-context preset entry and saved-context precedence
5. Legacy hash alias/context/camera regression
6. Native first-page reasons/selection/save and empty-state review
7. Bilingual guide schema/ID/icon/hypothetical-policy consistency
8. Native eight-guide overview and detail/dialog keyboard/narrow/desktop review

**Coding prompt:** Implement only T14: Expansion opportunities and read-only eight-strategy guide. Read the full-product, expansion-experience and bilingual strategy-guide contracts plus the existing stack map. Reuse the retained assessor/presets and one map instance. Preserve saved context, drafts, eligibility, source totals and events. Build the current queue, collapsed maximum-three selector and accessible guide dialog from the registry; examples/diagrams are hypothetical. Opening a guide never changes selection or criteria. Verify alias, camera, guide focus/close and shortlist success/failure behavior. Report changed files, actual evidence and open gates; do not deploy or claim a production backend.

### T15 · ทำ Target CRUD และ snapshotแผนสำรวจ

Phase: P0 · Dependencies: T02, T10, T13, T14 · PLANNED_PRODUCTION

**Inputs**

1. ReportingUUID/fullcontext
2. Assessment result
3. Owner/status/custom fields
4. First-page candidate card and retained action-guidance contract

**Outputs**

1. Targets
2. Immutable StrategyAssessment snapshots
3. FieldActions/EvidenceRecords

**Steps**

1. Unique target percontext/area; retain archivedhistory.
2. Capture exactcriteria/source/benchmark/profile/engine/strategy versions and whetherprivateDraftoraccepted.
3. Save strategy evidence/missing data/next task withowner and actor/time.
4. Keep personalview selection outside sharedrevision untilexplicit targetsave.
5. After committed target state change derive count from actual active target records. New/unarchived +1 and removal -1; existing plan update no false +1. Dedupe receipt IDs and use the finite200ms pointer-inert surrogate only when endpoints are visible.
6. Preserve source focus and current map; duplicate/failure does not fly or increment.
7. Maintain persistent polite live region and linked7s confirmation; pause confirmation on focus/hover. Reduced motion/offscreen destination/hidden page/pagehide exposes final count/status without motion or delayed mutation.
8. Shortlist directly from the first-page candidate card with the exact current assessment; distinct active count and retained success/failure/+1 guidance remain authoritative.

**Acceptance**

1. Old assessment remains reproducible after threshold/source change.
2. Target status never means source verified or parcel approved.
3. New save increments once; duplicate/failure does not fabricate a +1.
4. Reduced-motion/failure/interruption final state remains usable.

**Verify**

1. CRUD/dedupe/archive/restore
2. Snapshot hash/version parity
3. Cross-brand isolation
4. check-action-guidance.cjs
5. Native new/duplicate save and reduced-motion review

**Coding prompt:** Implement only T15: ทำ Target CRUD และ snapshotแผนสำรวจ. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T16 · ทำ Branch CRUD รูป5รูปและ source-first autofill

Phase: P0 · Dependencies: T02, T03, T12, T15 · PLANNED_PRODUCTION

**Inputs**

1. Immutable source branch records
2. branch-context.v1.7.5.json
3. Private media policy

**Outputs**

1. Team overlays
2. Context-safe editor
3. Private media finalize

**Steps**

1. Source/manual/saved geography wins over coordinatehint; unique strict-interior suggestion can fill draft.
2. Filter dependent province/area options; expose ambiguous boundaries and conflicts.
3. Newrecord requires name plusvalidcoordinatesorvalidarea; unresolvedexisting permits notes/photos.
4. Capture context/route/form/revision/coordinate signatures across awaits; cancel stale lookup/photo completions.
5. Validate content/mime/size/dimensions/EXIF/cap<=5server-side.

**Acceptance**

1. LocalPOIedits never rewrite aggregateSupply.
2. Unknown/unbranded/closed/verified/assigned meanings remain separate.

**Verify**

1. check-branch-context.cjs
2. Photo-cap concurrency and rollback
3. Editor/popup parity
4. Tenant signed-media reads

**Coding prompt:** Implement only T16: ทำ Branch CRUD รูป5รูปและ source-first autofill. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T17 · ทำ Location detail และ governed review

Phase: P0 · Dependencies: T10, T12, T15, T16 · PLANNED_PRODUCTION

**Inputs**

1. Demand paths
2. Supply intervals
3. Strategy snapshots
4. Spatial source geometry

**Outputs**

1. Market landscape detail
2. Review reason/action workflow
3. New correction releases

**Steps**

1. Show relevant market values/tier/brand scope and mapped POIs without invented traffic.
2. Popup retains sourcebrandgraphic(originalcontain/aspect)or explicitnamedthemefallback/name and partyshield/swords, StreetView/GoogleAIMode contextual questions.
3. Review unknown Demand/geometry/category/license evidence; corrections requireexactsourceIDandcrosswalk.
4. Publish accepted correction as newsource release and recompute; donot overwriteoldsource.

**Acceptance**

1. No bulkapprove button turning missing data into Yolk.
2. Correction can remove an area; nativecounts do not resolve fine residuals.

**Verify**

1. Reason/evidence acceptance
2. UNKNOWNvsunbranded
3. Read-onlysource
4. Externalquestion context privacy

**Coding prompt:** Implement only T17: ทำ Location detail และ governed review. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T18 · ทำ Feed Outbox Share และ leaderboard

Phase: P0 · Dependencies: T02, T13, T15, T16, T17 · PLANNED_PRODUCTION

**Inputs**

1. Immutable accepted mutation events
2. Existing channel integrations

**Outputs**

1. Per-page/entity/global feeds
2. Retryable delivery adapters
3. Permissioned shares

**Steps**

1. Entity/revision/Event/Outbox commit atomically.
2. Recipients must be authorized; email/LINE need configured productionprovidersanduserauthorizeddelivery.
3. Dedupe delivery byeventId+recipient+channel; recordretry/deadletter.
4. Leaderboard counts real successful sharedactions, excludesmap/drafts/theme/sample/retry.

**Acceptance**

1. One action creates oneauditevent, no repeated notification on retry.
2. Link permissions checked at everyopen; viewer cannot widen access.

**Verify**

1. Outbox failure/retry
2. Share expiry/revoke
3. Actor/actioncount filters

**Coding prompt:** Implement only T18: ทำ Feed Outbox Share และ leaderboard. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T19 · ทำ source refresh และ accepted adoption

Phase: P0 · Dependencies: T03, T05, T11, T13, T17, T18 · PLANNED_PRODUCTION

**Inputs**

1. Versioned source release
2. Coverage/state diff

**Outputs**

1. Refresh pipeline
2. Preview/adoption diff
3. Reproducible historical runs

**Steps**

1. Stagevalidate newsource/rights/schema/hash.
2. Show changedcoverage/metrics/eligibleIDsandsupply intervalsbefore accepted adoption.
3. Do not silently reseed edited criteria or defaultbrandprofile.

**Acceptance**

1. Old result/assessment remains available.
2. Source updates trigger only approvedteam events, not browsing actions.

**Verify**

1. Historicalreplay
2. ChangedUUIDandcoverage
3. Manualpresetpreservation

**Coding prompt:** Implement only T19: ทำ source refresh และ accepted adoption. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T20 · P1 เพิ่ม anchors offerings และจุดเช่าจริง

Phase: P1 · Dependencies: T03, T15, T16, T17 · PLANNED_PRODUCTION

**Inputs**

1. Rights-approved hospital/school/other anchor sources
2. Fieldsurvey protocols

**Outputs**

1. Verified AnchorPOI and spatial crosswalk
2. Offering/hour/occasion evidence
3. CandidateSite entity

**Steps**

1. Audit CityMETER sourceavailability before externalacquisition.
2. Add actualanchorcoordinates/name/type/period/source/status; validate nearest/access relationships.
3. Survey branchformat/products/pricebands/hours and customeroccasionswithpurpose.
4. Store candidatelease sites separately fromoperatingbranches; support several sites perarea.
5. Test physicalclusters/visits/costs; screen markerbins alone do not qualify strategy4.

**Acceptance**

1. Hospitalnearpharmacy/schoolnearstationery remain hypotheses untilrelevantobservations.
2. CandidateSite doesnot increaseSupply counts.

**Verify**

1. Anchorcrosswalkandrights
2. Observedfieldstates
3. Cluster-versus-screenbins
4. Sitebranchseparation

**Coding prompt:** Implement only T20: P1 เพิ่ม anchors offerings และจุดเช่าจริง. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T21 · P2 เพิ่ม routes และ future watchlist

Phase: P2 · Dependencies: T12, T15, T20 · PLANNED_PRODUCTION

**Inputs**

1. Directednetwork/version
2. Fieldaccess/daypartdata
3. Verifiedfutureprojects

**Outputs**

1. Routecaptureresults
2. Separatefuturewatchlist

**Steps**

1. Modeldirection/turnrestrictions/access/mode/daypart.
2. Countpass/stop/buy separately; validate stoppingfeasibility.
3. Trackmilestones/open/occupied dates andholdingcosts/stoppingtriggers.
4. Futurewatchlist maycontain noncurrentDemandareas buthasseparatecounts.

**Acceptance**

1. Roadrankortrafficdoesnotprovemeasuredstorebuying.
2. Futureevidence doesnotpromote currentYolk eligibility.

**Verify**

1. Directedreachabilityfixtures
2. Roadside/turnbarriers
3. Noncurrentfutureentrycount

**Coding prompt:** Implement only T21: P2 เพิ่ม routes และ future watchlist. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T22 · P3 เพิ่มข้อมูลผลธุรกิจเพื่อ calibration

Phase: P3 · Dependencies: T02, T15, T17, T19 · PLANNED_PRODUCTION

**Inputs**

1. Privatebrand POS/branchperformance/cost/capacity
2. Purposeandpermission-reviewed customerdata

**Outputs**

1. Restricted operational connector
2. Holdout outcome models
3. Networkdisplacement estimates

**Steps**

1. Minimizepersonaldata; aggregate/spatiallyprotect customerlocationsanddayparts.
2. Separatetransferredsales fromnewnetworksales.
3. Useholdout/temporaltests andassumptionintervals; versioncalibratedprofile separately.
4. Retain humanreview andclearlimits fornonbank financialbehavior.

**Acceptance**

1. Noborrowingneed/creditworthiness inferredfrompublicpopulation alone.
2. Calibration doesnotclaimbusinesssuccesswithout observedvalidation.

**Verify**

1. Connectorpermission/delete
2. Holdoutleakage
3. Netincrementversuscannibalization

**Coding prompt:** Implement only T22: P3 เพิ่มข้อมูลผลธุรกิจเพื่อ calibration. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T23 · ตรวจรับ end-to-end และ production

Phase: P0 · Dependencies: T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19 · PLANNED_PRODUCTION

**Inputs**

1. Currentcontracts
2. RealTH/ENcontent
3. Two-tenantsfixtures
4. contracts/supply-inventory.v1.9.9.json
5. contracts/visual-refinement.v1.9.9.json
6. contracts/branch-points.v1.9.9.json

**Outputs**

1. CurrentQAreceipt
2. Nativevisualevidence
3. Remaininggates

**Steps**

1. Runmodel/workflowtests fromcurrentfiles.
2. Inspectallnewsections actualrenderedTH/EN at390and1440inlight/dark.
3. Exercisecontextswitch/loadsave races,RBAC,transactions,outboxprivateuploads.
4. Keep browser/nativeviewport/physicaldevice/backend outcomesseparate.
5. Review tooltip cardinality, scope/value labels, quiet POI boundaries, shortlist destination/count, reduced motion and interruption against the interaction extension.
6. Review current Supply icon/caption chips and all three supplied brand images in TH/EN/light/dark/narrow/desktop bounded states; record current source receipts.
7. Review actual new first-page queue, inline strategy controls, alias, supporting Demand/Supply pages, compact/expanded map and all link/icon/foundation states in TH/EN at narrow/desktop light/dark.
8. Record tile provider loading/error/retry evidence separately; preserve an explicit unverified gate if unavailable.
9. Do not promote old1.9.2 QA/browser counts to current1.9.6 results.
10. Review the eight explanatory diagrams/examples and accessible guide dialog in actual TH/EN at narrow/desktop; confirm no guide action changes calculations or saved state.
11. Review current O+C/share fixed-domain map and panel/one boundary-hover treemap in actual TH/EN narrow/desktop themes; report only actually reviewed states.

**Acceptance**

1. AllrequiredtaskAC passed; unresolvedgates named.
2. Noimportedoldreleasepassesclaimedcurrent.
3. Each verified brand has a stable exact approved DS categorical swatch chosen near its original artwork primary color; names/counts remain readable in both themes; no artwork mutation.
4. Near-Thailand envelope blocks unrelated distant panning/zooming without changing administrative scope or Demand membership.
5. Expand/Compact settles the existing host and refreshes visible tiles while preserving map instance, camera and unsaved work; sampled native tiles visibly load after repeated cycles.
6. Options/Expand and areas/points remain four usable, labeled, meaningful-icon buttons in one compact row at recorded narrow and desktop widths.
7. All visible numerical quantities consistently use comma grouping and preserve precision/units/no-data/bounds, while calculation/storage/input values stay numerical.
8. Actual TH/EN narrow/desktop and both themes are reviewed; per-state observed checks are not a physical-device/full-matrix certificate.
9. Supply opens in Region colours; Branch points defaults to every filtered valid source coordinate without screen clustering or an arbitrary marker cap.
10. Optional screen grouping lives in Map Options, preserves every member/count and never changes source coordinates or native administrative totals.
11. Country point rendering is efficient; detailed original logos, readable names, role cues and existing popup actions remain available where appropriate.
12. Coincident/overlapping records remain discoverable without moving their source coordinates.
13. Filter/context/theme/route/resize updates retain map instance, permitted camera, drafts and source semantics; stale draw or popup work cannot overwrite a newer context.
14. Actual core journeys and load/render/interaction timings are recorded with environment, dataset and limits; no zero-bug, all-device, all-network or backend guarantee.
15. Actual TH/EN, light/dark, desktop/narrow all/grouped points and popup content are reviewed; old screenshots and test counts are not current acceptance.

**Verify**

1. Suitesinventory+actualresults
2. Visualsnapshots
3. Security/failureflow tests
4. check-map-clarity.cjs
5. check-action-guidance.cjs
6. check-icon-controls.cjs
7. check-map-hierarchy.cjs
8. check-strategy-guide.cjs
9. Actual mobile Supply region/points canvas measurements and explicit expanded override
10. Current map-space native measurements and sidebar/header/footer controls
11. Current mobile-flow native scrolling/geometry evidence and unchanged desktop map-space behavior
12. Current boundary/icon native contrast evidence, retained quantitative paint and mobile-flow regression
13. scripts/check-supply-market-share.cjs
14. scripts/check-supply-treemap.cjs

**Coding prompt:** Implement only T23: ตรวจรับ end-to-end และ production. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

### T24 · Seal publish และส่ง handoff

Phase: P0 · Dependencies: T23 · PLANNED_PRODUCTION

**Inputs**

1. Approvedoutputscope
2. Exactsourcecommit
3. CurrentQAandpublicallowlist
4. contracts/branch-points.v1.9.9.json

**Outputs**

1. Publishedpreview
2. SinglefullMD
3. Machinecontracts/assets
4. VerifiedZIPandattestation

**Steps**

1. Sealonlyexplicitapprovedpaths afterfinalQA.
2. Verifyassetreferences/bytes andsourcehashes, pushauthorizedcommit, awaitterminalproviderresult.
3. VerifylivecriticalfilesHTTP/MIME/bytes/SHAatpublishedURL.
4. Packageexactsource plusseparateexternalpostpublishreceipts/checksum; no secrets/rawpersonaldata.

**Acceptance**

1. Releaseclaims pin exactsourceSHA/provider/livebytes.
2. ArtifactZIPdownloadhashverified; historicalmanifestsnot overwritten.
3. Honor all-points default and explicit optional screen grouping; preserve native totals/coordinates and document measured performance separately.

**Verify**

1. Currentsealer/verifier
2. ProviderterminalSHA
3. Live-byteverification
4. ZIP/APIassetdigest

**Coding prompt:** Implement only T24: Seal publish และส่ง handoff. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence.

## 9. Current release and verification

Current bounded local QA: 40 suites / 663 reported cases; 11 native browser observations. [QA](evidence/qa-v1.9.9.json) · [Fix report](docs/RED_TEAM_RESOLUTION_v1.9.9.md). Raw logs travel inside the handoff. Physical devices, full screen-reader/OS-motion acceptance and production backend remain separate.

Source seal and publication are separate: [release contract](contracts/release.v1.9.9.json) records pre-publication source acceptance; [GitHub Release](https://github.com/montri-th/yolk/releases/tag/v1.9.9) supplies provider/live attestation and ZIP after publication. Historical source documents remain linked evidence, not current acceptance.

## 10. Machine blueprint — exact standalone projection

```json
{
  "schemaVersion": "yolk.full-product-and-implementation/1.9.9",
  "version": "1.9.9",
  "date": "2026-10-09",
  "status": "locally_verified_static_preview_complete_production_plan_publication_pending",
  "humanDocument": "CityMETER_Yolk_Full_Product_and_Implementation_v1.9.9.md",
  "product": {
    "name": "CityMETER: Yolk",
    "tagline": {
      "en": "Find the yolk. Grow your market.",
      "th": "หาไข่แดง ขยายตลาด"
    },
    "statement": {
      "who": "Expansion, strategy, brand and field teams in multi-branch businesses. Initial supported industries: fuel, grocery and Nonbank.",
      "what": "Open an evidence-limited queue of expansion locations using the selected brand preset; inspect high proxy Demand, relevant source-scope Supply and selected strategies, then save an owned fieldwork plan.",
      "why": "Start from CityMETER national data and researched starter profiles; invest verified team data to improve decisions and reproducibility.",
      "which": "The same expansion job is currently done across Google Maps/Street View + Excel/Sheets + official locators + local field knowledge + LINE/email coordination. These competing workflows lack one shared versioned decision context.",
      "how": [
        "Choose industry / brand / important format or product scope",
        "Open Expansion opportunities with the existing starter or saved preset",
        "Inspect candidate reasons, missing evidence and first field task; choose at most3 strategies within this page",
        "Investigate dedicated Demand and Supply views when needed; preview parameter changes on the same map",
        "Shortlist with evidence, source/criteria/profile versions, next task and owner",
        "Validate actual sites before investment"
      ],
      "success": "Time to an explained shortlist and an owned field task; reproduction of decisions; fewer conclusions reversed after field evidence. Pilot baseline needed before numeric success promises."
    }
  },
  "scope": {
    "industries": [
      "fuel",
      "grocery",
      "nonbank"
    ],
    "selectableBrands": 37,
    "presetFamilies": 9,
    "nonbankSelectable": 10,
    "workspaceSeats": {
      "admin": 1,
      "editor": 3,
      "viewer": 6
    },
    "maximumJointChoices": {
      "enabledDemandFactorFamilies": 3,
      "distinctMetricsPerFactor": 3,
      "conditionsPerJointPath": 3,
      "selectedStrategies": 3,
      "rankingWeights": 3
    },
    "phases": [
      {
        "id": "P0",
        "dataReadiness": "existing_CityMETER",
        "scope": "Three-industry Demand paths, current source-scope Supply, strategy survey queues 1/3/5/7, unresolved guides 2/4/6/8, shortlist and evidence tasks",
        "productionDependency": "Shared workspace still requires auth/datastore/revision/outbox implementations; static browser-local preview does not prove these."
      },
      {
        "id": "P1",
        "dataReadiness": "additional_verified_anchor_and_field_evidence",
        "scope": "Hospital/school/other anchor POI adapters, rights and crosswalk; branch offerings/prices/hours/customer occasions; candidate-site records and physical-cluster studies",
        "productionDependency": "Evidence schema, field collection and governed source reconciliation."
      },
      {
        "id": "P2",
        "dataReadiness": "directed_network_and_future_evidence",
        "scope": "Routes/daypart/access/pass-stop-buy, verified future milestones and holding-cost watchlist separate from current Yolks",
        "productionDependency": "Versioned routing service and future project evidence."
      },
      {
        "id": "P3",
        "dataReadiness": "private_brand_operational_data",
        "scope": "Sales by branch/transaction, customer occasions, capacity/costs, own-network displacement, outcome calibration",
        "productionDependency": "Private connectors, minimization/permissions, restricted access, holdout validation."
      }
    ],
    "separateDeliveryAxis": "Data P0–P3 is not shared-backend implementation maturity. Browser-local preview never proves authenticated multi-user production."
  },
  "authority": {
    "currentSource": "CityMETER_Yolk_Full_Product_and_Implementation_v1.9.9.md",
    "baseDS": {
      "path": "reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md",
      "documentId": "lds-0.9.7-landometer-standalone-r1",
      "sha256": "d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96"
    },
    "locationProfile": {
      "path": "reference/lds-0.9.7/Location-Intelligence-Profile-for-LDS-v0.9.7.md",
      "documentId": "location-intelligence-profile-lds-0.9.7-r1",
      "sha256": "5d4856041709735d3a04d4a510a88b551df86c211fdcab8a0707e8fe7c9efc3b"
    },
    "retainedHistorical": "1.8.0 source contracts/formulas only where named. Old8patterns are inert, not eightnewstrategies. Legacy fuel6activityvotes are not equivalent to1.9factorpaths.",
    "assetIntegration": "DS_ASSET_INTEGRATION.md; actual release asset index and runtime hash manifest. Do not invent replacements.",
    "semanticBaseline": {
      "criteriaModeVersion": "1.9.0",
      "profileVersion": "1.9.0",
      "engineVersion": "1.9.0",
      "strategyContract": "contracts/opportunity-strategies.v1.9.0.json",
      "runtimeProfiles": "prototype/data/brand-strategy-profiles.v1.9.0.json",
      "meaning": "Retain source snapshots, eligibility, cohorts and brand profiles. Current red-team extension changes persistence, trace completeness, display context, retry and uncertainty handling; it is not a display-only patch."
    },
    "interactionExtension": "contracts/interaction-guidance.v1.9.1.json",
    "brandIdentityUIExtension": "contracts/brand-identity-ui.v1.9.2.json",
    "expansionExperienceExtension": "contracts/expansion-experience.v1.9.3.json",
    "strategyGuide": "prototype/data/strategy-guide.v1.9.3.json",
    "mapSpaceExtension": "contracts/map-space.v1.9.4.json",
    "mobileFlowExtension": "contracts/mobile-flow.v1.9.5.json",
    "mapReadabilityExtension": "contracts/map-readability.v1.9.6.json",
    "presentationPrecedence": {
      "currentBoundaryAndSemanticIcon": "experience.mapReadability / contracts/map-readability.v1.9.6.json",
      "narrowLayoutAndInteraction": "experience.mobileFlow / contracts/mobile-flow.v1.9.5.json",
      "desktopLayout": "experience.mapSpace / contracts/map-space.v1.9.4.json",
      "retainedProjectionBoundary": "experience.expansionExperience1.9.3 and older projections are historical component references. Their parent-only halo/drop-shadow,58svh/74svh sizing and former desktop pane values are superseded by the named current presentation contracts. Source/analysis/guide semantics are retained.",
      "currentTreemapAndMapControls": "experience.visualRefinement / contracts/visual-refinement.v1.9.9.json; supersedes only treemap color assignment, map camera envelope/resize controls and visible number formatting.",
      "currentCameraAndZoomConstraint": "experience.visualRefinement / contracts/visual-refinement.v1.9.9.json supersedes only unconditional camera identity outside current host-dependent near-Thailand zoom/center envelope; retains same map/context/drafts/scope.",
      "currentBranchPoints": "experience.branchPoints / contracts/branch-points.v1.9.9.json: all filtered valid positions by default; grouping only by explicit Map Options choice. Supersedes prior automatic screen groups/marker caps.",
      "redTeamRemediation": "v1.9.9 red-team extension supersedes prior save/trace/draft/recovery interactions; historical receipts are not current acceptance."
    },
    "supplyInventoryDisplayExtension": "contracts/supply-inventory.v1.9.9.json",
    "visualRefinementExtension": "contracts/visual-refinement.v1.9.9.json",
    "branchPointsExtension": "contracts/branch-points.v1.9.9.json",
    "redTeamExtension": "contracts/red-team-remediation.v1.9.9.json"
  },
  "source": {
    "fixedUniverse": 7954,
    "bkkKhwaeng": 180,
    "upcountryReportingLAO": 7774,
    "nativeDistricts": 928,
    "displayMultiDistrictLinks": 45,
    "uuidJoin": "Exact reporting UUID only; no name or extent allocation; display crosswalk is not statutory membership.",
    "areaDenominator": "Raw source areaSqm /1e6; never simplified display polygon area.",
    "metrics": [
      {
        "id": "population",
        "name": {
          "th": "ประชากรรวม",
          "en": "Total population"
        },
        "datasetId": "population",
        "unit": "persons",
        "formula": "sum(ms)+sum(fs)",
        "formulaAST": {
          "op": "add",
          "args": [
            {
              "op": "sum",
              "field": "ms"
            },
            {
              "op": "sum",
              "field": "fs"
            }
          ]
        },
        "sourceFields": [
          "population.ms",
          "population.fs"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "reported_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 2
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "population_per_km2",
        "name": {
          "th": "ความหนาแน่นประชากร",
          "en": "Population density"
        },
        "datasetId": "population",
        "unit": "persons/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "population_count"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "population.ms",
          "population.fs",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 2
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "working_age_15_64",
        "name": {
          "th": "ประชากรอายุ 15–64 ปี",
          "en": "Population aged 15–64"
        },
        "datasetId": "population",
        "unit": "persons",
        "formula": "sum(ms[15:65])+sum(fs[15:65])",
        "formulaAST": {
          "op": "add",
          "args": [
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "ms",
                "start": 15,
                "endExclusive": 65
              }
            },
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "fs",
                "start": 15,
                "endExclusive": 65
              }
            }
          ]
        },
        "sourceFields": [
          "population.ms",
          "population.fs"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 2
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "working_age_15_64_per_km2",
        "name": {
          "th": "ความหนาแน่นประชากรอายุ 15–64 ปี",
          "en": "Density of population aged 15–64"
        },
        "datasetId": "population",
        "unit": "persons/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "working_age_15_64"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "population.ms",
          "population.fs",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 2
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "adult_population_20_64",
        "name": {
          "th": "ประชากรอายุ 20–64 ปี",
          "en": "Population aged 20–64"
        },
        "datasetId": "population",
        "unit": "persons",
        "formula": "sum(ms[20:65])+sum(fs[20:65])",
        "formulaAST": {
          "op": "add",
          "args": [
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "ms",
                "start": 20,
                "endExclusive": 65
              }
            },
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "fs",
                "start": 20,
                "endExclusive": 65
              }
            }
          ]
        },
        "sourceFields": [
          "population.ms",
          "population.fs"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 2
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "adult_population_20_64_per_km2",
        "name": {
          "th": "ความหนาแน่นประชากรอายุ 20–64 ปี",
          "en": "Density of population aged 20–64"
        },
        "datasetId": "population",
        "unit": "persons/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "adult_population_20_64"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "population.ms",
          "population.fs",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 2
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "children_0_14",
        "name": {
          "th": "ประชากรอายุ 0–14 ปี",
          "en": "Population aged 0–14"
        },
        "datasetId": "population",
        "unit": "persons",
        "formula": "sum(ms[0:15])+sum(fs[0:15])",
        "formulaAST": {
          "op": "add",
          "args": [
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "ms",
                "start": 0,
                "endExclusive": 15
              }
            },
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "fs",
                "start": 0,
                "endExclusive": 15
              }
            }
          ]
        },
        "sourceFields": [
          "population.ms",
          "population.fs"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 2
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "population_65_plus",
        "name": {
          "th": "ประชากรอายุ 65 ปีขึ้นไป",
          "en": "Population aged 65 and over"
        },
        "datasetId": "population",
        "unit": "persons",
        "formula": "sum(ms[65:])+sum(fs[65:])",
        "formulaAST": {
          "op": "add",
          "args": [
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "ms",
                "start": 65
              }
            },
            {
              "op": "sum",
              "arg": {
                "op": "slice",
                "field": "fs",
                "start": 65
              }
            }
          ]
        },
        "sourceFields": [
          "population.ms",
          "population.fs"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          }
        ],
        "sourcePeriod": "2026-08",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7830,
          "nUnknown": 124,
          "nNotApplicable": 0,
          "nExplicitZero": 4
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "gfa",
        "name": {
          "th": "พื้นที่อาคารรวมประมาณ (GFA)",
          "en": "Estimated gross floor area (GFA)"
        },
        "datasetId": "building",
        "unit": "estimated m2 GFA",
        "formula": "area",
        "formulaAST": {
          "field": "area",
          "selector": {
            "v": "V4"
          }
        },
        "sourceFields": [
          "building.area"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "building.area",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].area",
              "value.municipalityDatas[area_uuid].rows[].area"
            ]
          }
        ],
        "sourcePeriod": "V4 / published UI label 2024-12",
        "measurement": "model_estimate",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7939,
          "nUnknown": 15,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "building_count",
        "name": {
          "th": "จำนวนรายการอาคารจากแบบจำลอง",
          "en": "Modeled building record count"
        },
        "datasetId": "building",
        "unit": "modeled building records",
        "formula": "count",
        "formulaAST": {
          "field": "count",
          "selector": {
            "v": "V4"
          }
        },
        "sourceFields": [
          "building.count"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "building.count",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].count",
              "value.municipalityDatas[area_uuid].rows[].count"
            ]
          }
        ],
        "sourcePeriod": "V4 / published UI label 2024-12",
        "measurement": "model_estimate",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7939,
          "nUnknown": 15,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "gfa_per_km2",
        "name": {
          "th": "ความหนาแน่นพื้นที่อาคารรวมประมาณ",
          "en": "Estimated GFA density"
        },
        "datasetId": "building",
        "unit": "estimated m2 GFA/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "building_gfa_m2"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "building.area",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "building.area",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].area",
              "value.municipalityDatas[area_uuid].rows[].area"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "V4 / published UI label 2024-12",
        "measurement": "derived_model_estimate",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7939,
          "nUnknown": 15,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "gfa_per_person",
        "name": {
          "th": "พื้นที่อาคารรวมประมาณต่อประชากร",
          "en": "Estimated GFA per person"
        },
        "datasetId": "building",
        "unit": "estimated m2 GFA/person",
        "formula": "building.area / (sum(population.ms)+sum(population.fs))",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "building_gfa_m2"
            },
            {
              "metric": "population_count"
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "building.area",
          "population.ms",
          "population.fs"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "building.area",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].area",
              "value.municipalityDatas[area_uuid].rows[].area"
            ]
          },
          {
            "qualifiedField": "population.ms",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].ms",
              "value.municipalityDatas[area_uuid].rows[].ms"
            ]
          },
          {
            "qualifiedField": "population.fs",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].fs",
              "value.municipalityDatas[area_uuid].rows[].fs"
            ]
          }
        ],
        "sourcePeriod": "V4 / published UI label 2024-12",
        "measurement": "derived_model_estimate",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7828,
          "nUnknown": 126,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": "population_count",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "factory_count",
        "name": {
          "th": "จำนวนโรงงานในทะเบียน ACTIVE",
          "en": "ACTIVE registry factory count"
        },
        "datasetId": "factory",
        "unit": "registered factory records",
        "formula": "totalFactory",
        "formulaAST": {
          "field": "totalFactory",
          "selector": {
            "y": 2025,
            "m": 4,
            "factory_status": "ACTIVE"
          }
        },
        "sourceFields": [
          "factory.active.totalFactory"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "factory.active.totalFactory",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].totalFactory",
              "value.municipalityDatas[area_uuid].rows[].totalFactory"
            ]
          }
        ],
        "sourcePeriod": "2025-04 ACTIVE",
        "measurement": "reported_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 5822,
          "nUnknown": 2132,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "factory_count_per_km2",
        "name": {
          "th": "ความหนาแน่นโรงงานในทะเบียน ACTIVE",
          "en": "ACTIVE registry factory density"
        },
        "datasetId": "factory",
        "unit": "factory records/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "factory_count"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "factory.active.totalFactory",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "factory.active.totalFactory",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].totalFactory",
              "value.municipalityDatas[area_uuid].rows[].totalFactory"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "2025-04 ACTIVE",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 5822,
          "nUnknown": 2132,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "factory_workers",
        "name": {
          "th": "คนงานโรงงานที่ต้นทางรายงาน",
          "en": "Source-reported factory workers"
        },
        "datasetId": "factory",
        "unit": "reported workers",
        "formula": "totalWorker",
        "formulaAST": {
          "field": "totalWorker",
          "selector": {
            "y": 2025,
            "m": 4,
            "factory_status": "ACTIVE"
          }
        },
        "sourceFields": [
          "factory.active.totalWorker"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "factory.active.totalWorker",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].totalWorker",
              "value.municipalityDatas[area_uuid].rows[].totalWorker"
            ]
          }
        ],
        "sourcePeriod": "2025-04 ACTIVE",
        "measurement": "reported_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 5822,
          "nUnknown": 2132,
          "nNotApplicable": 0,
          "nExplicitZero": 13
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "factory_workers_per_km2",
        "name": {
          "th": "ความหนาแน่นคนงานโรงงานที่รายงาน",
          "en": "Density of reported factory workers"
        },
        "datasetId": "factory",
        "unit": "reported workers/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "factory_workers"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "factory.active.totalWorker",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "factory.active.totalWorker",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].totalWorker",
              "value.municipalityDatas[area_uuid].rows[].totalWorker"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "2025-04 ACTIVE",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 5822,
          "nUnknown": 2132,
          "nNotApplicable": 0,
          "nExplicitZero": 13
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "hotel_count",
        "name": {
          "th": "จำนวนรายการโรงแรม",
          "en": "Hotel catalogue count"
        },
        "datasetId": "hotel",
        "unit": "catalog hotel records",
        "formula": "hotelCount",
        "formulaAST": {
          "field": "hotelCount"
        },
        "sourceFields": [
          "hotel.hotelCount"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "hotel.hotelCount",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].hotelCount",
              "value.municipalityDatas[area_uuid].rows[].hotelCount"
            ]
          }
        ],
        "sourcePeriod": null,
        "measurement": "reported_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7506,
          "nUnknown": 448,
          "nNotApplicable": 0,
          "nExplicitZero": 3494
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "hotel_rooms",
        "name": {
          "th": "จำนวนห้องพักในรายการโรงแรม",
          "en": "Rooms in hotel catalogue"
        },
        "datasetId": "hotel",
        "unit": "catalog rooms",
        "formula": "roomCount",
        "formulaAST": {
          "field": "roomCount"
        },
        "sourceFields": [
          "hotel.roomCount"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "hotel.roomCount",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].roomCount",
              "value.municipalityDatas[area_uuid].rows[].roomCount"
            ]
          }
        ],
        "sourcePeriod": null,
        "measurement": "reported_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7506,
          "nUnknown": 448,
          "nNotApplicable": 0,
          "nExplicitZero": 3494
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "hotel_rooms_per_km2",
        "name": {
          "th": "ความหนาแน่นห้องพักในรายการ",
          "en": "Catalogue room density"
        },
        "datasetId": "hotel",
        "unit": "catalog rooms/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "hotel_rooms"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "hotel.roomCount",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "hotel.roomCount",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].roomCount",
              "value.municipalityDatas[area_uuid].rows[].roomCount"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": null,
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7506,
          "nUnknown": 448,
          "nNotApplicable": 0,
          "nExplicitZero": 3494
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "office_count",
        "name": {
          "th": "จำนวนรายการอาคารสำนักงาน",
          "en": "Office building catalogue count"
        },
        "datasetId": "office",
        "unit": "catalog office buildings",
        "formula": "officeCount",
        "formulaAST": {
          "field": "officeCount",
          "selector": {
            "v": "V3"
          }
        },
        "sourceFields": [
          "office.officeCount"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "office.officeCount",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].officeCount",
              "value.municipalityDatas[area_uuid].rows[].officeCount"
            ]
          }
        ],
        "sourcePeriod": "V3 / published UI label 2025-05",
        "measurement": "reported_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 45,
          "nUnknown": 7909,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "office_count_per_km2",
        "name": {
          "th": "ความหนาแน่นรายการอาคารสำนักงาน",
          "en": "Office catalogue density"
        },
        "datasetId": "office",
        "unit": "catalog buildings/km2",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "office_count"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "office.officeCount",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "office.officeCount",
            "paths": [
              "value.subdistrictDatas[area_uuid].rows[].officeCount",
              "value.municipalityDatas[area_uuid].rows[].officeCount"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "V3 / published UI label 2025-05",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 45,
          "nUnknown": 7909,
          "nNotApplicable": 0,
          "nExplicitZero": 0
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "fiscal_total_thb",
        "name": {
          "th": "รายได้รวมของ อปท. ที่รายงาน",
          "en": "Reported total local authority revenue"
        },
        "datasetId": "fiscal",
        "unit": "THB/year",
        "formula": "total * 1000000",
        "formulaAST": {
          "op": "multiply",
          "args": [
            {
              "field": "total"
            },
            {
              "const": 1000000
            }
          ]
        },
        "sourceFields": [
          "municipality.income.total"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "municipality.income.total",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].total"
            ]
          }
        ],
        "sourcePeriod": "2024",
        "measurement": "reported_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7751,
          "nUnknown": 23,
          "nNotApplicable": 180,
          "nExplicitZero": 0
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "fiscal_ex_grants_thb",
        "name": {
          "th": "รายได้ อปท. ไม่รวมเงินอุดหนุน",
          "en": "Local authority revenue excluding grants"
        },
        "datasetId": "fiscal",
        "unit": "THB/year",
        "formula": "(selfCollected+stateAllocated)*1000000",
        "formulaAST": {
          "op": "multiply",
          "args": [
            {
              "op": "add",
              "args": [
                {
                  "field": "selfCollected"
                },
                {
                  "field": "stateAllocated"
                }
              ]
            },
            {
              "const": 1000000
            }
          ]
        },
        "sourceFields": [
          "municipality.income.selfCollected",
          "municipality.income.stateAllocated"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "municipality.income.selfCollected",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].selfCollected"
            ]
          },
          {
            "qualifiedField": "municipality.income.stateAllocated",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].stateAllocated"
            ]
          }
        ],
        "sourcePeriod": "2024",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7751,
          "nUnknown": 23,
          "nNotApplicable": 180,
          "nExplicitZero": 0
        },
        "denominator": null,
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "fiscal_ex_grants_per_km2",
        "name": {
          "th": "รายได้ อปท. ไม่รวมเงินอุดหนุนต่อพื้นที่",
          "en": "Local revenue excluding grants per area"
        },
        "datasetId": "fiscal",
        "unit": "THB/km2/year",
        "formula": "numerator / land_area_km2",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "fiscal_ex_grants_thb"
            },
            {
              "op": "divide",
              "args": [
                {
                  "field": "base.areaSqm"
                },
                {
                  "const": 1000000
                }
              ]
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "municipality.income.selfCollected",
          "municipality.income.stateAllocated",
          "base.areaSqm"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "municipality.income.selfCollected",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].selfCollected"
            ]
          },
          {
            "qualifiedField": "municipality.income.stateAllocated",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].stateAllocated"
            ]
          },
          {
            "qualifiedField": "base.areaSqm",
            "paths": [
              "value.subdistrictInfos[id=area_uuid].areaSqm",
              "value.municipalityInfos[id=area_uuid].areaSqm"
            ]
          }
        ],
        "sourcePeriod": "2024",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7751,
          "nUnknown": 23,
          "nNotApplicable": 180,
          "nExplicitZero": 0
        },
        "denominator": "base.areaSqm / 1000000",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      },
      {
        "id": "fiscal_ex_grants_per_person",
        "name": {
          "th": "รายได้ อปท. ไม่รวมเงินอุดหนุนต่อประชากรอ้างอิง",
          "en": "Local revenue excluding grants per reference person"
        },
        "datasetId": "fiscal",
        "unit": "THB/person/year",
        "formula": "(selfCollected+stateAllocated)*1000000 / fiscal.population",
        "formulaAST": {
          "op": "divide",
          "args": [
            {
              "metric": "fiscal_ex_grants_thb"
            },
            {
              "field": "fiscal.population"
            }
          ],
          "denominator_must_be_positive": true,
          "invalid_result": "unknown"
        },
        "sourceFields": [
          "municipality.income.selfCollected",
          "municipality.income.stateAllocated",
          "municipality.income.population"
        ],
        "sourceRowPaths": [
          {
            "qualifiedField": "municipality.income.selfCollected",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].selfCollected"
            ]
          },
          {
            "qualifiedField": "municipality.income.stateAllocated",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].stateAllocated"
            ]
          },
          {
            "qualifiedField": "municipality.income.population",
            "paths": [
              "value.municipalityDatas[area_uuid].rows[].population"
            ]
          }
        ],
        "sourcePeriod": "2024",
        "measurement": "derived_context",
        "coverage": {
          "cohortId": "national_7954",
          "nTotal": 7954,
          "nValid": 7717,
          "nUnknown": 57,
          "nNotApplicable": 180,
          "nExplicitZero": 0
        },
        "denominator": "fiscal.population",
        "missingPolicy": "null; absent is not zero; use exactly selected source period"
      }
    ],
    "refs": [
      {
        "path": "prototype/data/real/area-context.json",
        "sha256": "c0386d1314efd06cd3d67970d08c7cf182ac9e40be0875a7bd177cc91edb6528"
      },
      {
        "path": "prototype/data/real/fuel-supply.json",
        "sha256": "1cbe85c16bfe81f5ae577b9d3021e83bfd9efadda5d53064f0b5ce58f6574a4c"
      },
      {
        "path": "prototype/data/real/grocery-supply.json",
        "sha256": "1ba2b27cf247cbfb11214a3e3a007393b863e3a37aab0809f0a5e1ef813865ff"
      },
      {
        "path": "prototype/data/real/nonbank-supply.json",
        "sha256": "6474915e47611b97b931454ee33ff5a9126e9b45b458ee943036e5611d9c4c0b"
      },
      {
        "path": "prototype/data/real/fuel-points.json",
        "sha256": "94b4d6798f366546a17a88d8b8ab102d338c2c8a22709768296e86255338b923"
      },
      {
        "path": "prototype/data/real/grocery-points.json",
        "sha256": "093d00e10fcc320f79f85ddf1ff76c387634879cf8682aa42344bcfff0373cac"
      },
      {
        "path": "prototype/data/real/nonbank-points.json",
        "sha256": "a18e6ce7619ee9becfbe3e8ca018212811ac9f12bdf7a5f66c54bd3d4d785909"
      },
      {
        "path": "prototype/data/real/nonbank-company-scopes.json",
        "sha256": "e37d82157f8ec5e24dc6771f3c6d901fa6d1d15e1384f9b0dcd1837b3d912a7d"
      },
      {
        "path": "prototype/data/real/nonbank-assignment-bounds.json",
        "sha256": "8f66548ef51ed3791d36d84755c7ea94e4e95264dc780c332c7b25b2f6705905"
      }
    ],
    "coordinateRecords": {
      "fuel": 4363,
      "grocery": 27457,
      "groceryAggregateRows": 27458,
      "groceryPharmacyExcluded": 150,
      "nonbankOfficeRecords": 23524,
      "nonbankAssigned": 17990,
      "nonbankMapped": 17752,
      "nonbankAssignmentResidual": 5534,
      "nonbankAllUnmappedDifference": 5772
    },
    "truthLimit": "Source reported/modelled evidence; not live operation, verified legal boundary, visits, purchases, borrower counts or creditworthiness. LocaleInsight contextual prior only after explicit crosswalk."
  },
  "profiles": {
    "runtimeRegistry": "prototype/data/brand-strategy-profiles.v1.9.0.json",
    "baselineFamilyRegistry": "prototype/data/brand-presets.v1.7.json",
    "industryMetricRegistry": "contracts/industry-profiles.json",
    "profileHashAuthority": "Current release manifest emitted after final QA; never cache unstated source versions.",
    "hierarchy": [
      "industryId",
      "segmentId",
      "brandId",
      "supplyScope",
      "profileVersion"
    ],
    "brandProfileFields": [
      "offerings",
      "positioning.operatorClaim",
      "positioning.consumerPerceptionStatus",
      "sourceIds",
      "researchStatus",
      "perScopeProfiles",
      "defaultStrategyIds",
      "complementaryAnchors",
      "limitations"
    ],
    "numericPresetAuthority": "Adjustable Yolk hypotheses; operator research supports offering/mission, not numeric cutoff validity.",
    "savedWins": "Existing saved criteria/drafts win. Explicit Try preset writes private draft; Apply creates team revision.",
    "sameSubmarket": {
      "fuel": "Broad all_fuel category; LPG/fueltype/localservices not yet known per POI",
      "grocery": "Exact source format C_STORE/SUPERMARKET/HYPERMARKET/WHOLESALE; branch assortment and price segment not independently verified",
      "nonbank": "Company active-license-family proxy; legal office function/localproduct uncertain. Compare fullscope inventory, not top10picker only."
    },
    "researchLimits": [
      "Consumerbrandperceptionnotmeasured",
      "COSMO currentidentityunresolved",
      "PURE/Caltexrebrandnotautomaticallymerged",
      "Nonbanklegalgroup/displaybrandnevermergescompanieswithoutverifiedidentity"
    ]
  },
  "demand": {
    "schema": "factor-path-v1.9.0",
    "factorFields": [
      "id",
      "label",
      "enabled",
      "tierPaths"
    ],
    "pathFields": [
      "id",
      "factorId",
      "tier",
      "all"
    ],
    "conditionFields": [
      "metric",
      "op",
      "percentile",
      "positive_presence"
    ],
    "allowedConditionOp": "gte_percentile",
    "maxEnabledFactors": 3,
    "maxDistinctMetricsPerFactor": 3,
    "maxConditionsPerPath": 3,
    "withinPath": "AND",
    "acrossPaths": "OR",
    "confirmedTier": "Minimum numbered confirmed tier across enabled paths",
    "eligibility": "row.demand === true && row.qualifyingTier in [1,2,3] && row.qualifyingTier <= maxDemandTier",
    "maxDemandTierDefault": 3,
    "missing": "Unknown condition yields unknown path unless another condition makes it false; unresolved cannot create confirmed Demand.",
    "percentile": "In 1.9 factor mode, use INC cutoffs from fixed nationwide valid values including measured zero. National parity is mandatory; view and brand filters cannot rebuild the cohort. same_grain remains historical engine compatibility only and is not an available 1.9 factor-mode option.",
    "midrank": "Display/supporting strategy ranking separate from INC cutoff. Equal values/ties may place cutoff-qualified values below matching midrank.",
    "fuelMigration": "New built_form/workplace/hospitality max3factorhypothesis. Historical5/3/1of6activityvotecriteria retained as history/savedlegacy; explicitpreset adoption required.",
    "serverValidation": "Reject>3enabledfamilies,>3distinctmetricsperfactor,>3ANDconditions, unknownmetrics/ops, invalidpercentiles, zeroactivefactors orweighttotal. Do nottrust UI disabledcontrols."
  },
  "supply": {
    "scope": "Use existing source-format or active company-license family filters. These are comparable source submarkets, not verified price/consumer segments or branch product availability.",
    "sameSubmarketRequirement": "context.submarketComparable=false makes all supply-based queues evidence_incomplete",
    "countBounds": "own=[ownLower,ownUpper+U], competitor=[competitorLower,competitorUpper+U]. Fallback lower/upper=count. total=[ownLower+competitorLower, ownUpper+competitorUpper+U]; U added once. Known nonbank bounds remain bounds.",
    "missing": "Unknown U, invalid/negative/noninteger counts or ownScopeUnavailable never become zero",
    "relativeReference": "count_equivalent_own = ownRateHigh * raw_positive_denominator / normalization_unit; competitor similarly",
    "normalizationUnits": {
      "gfa": 100000,
      "population": 10000,
      "working_age_15_64": 10000,
      "adult_population_20_64": 10000,
      "factory_workers": 10000,
      "hotel_rooms": 1000
    },
    "thresholdCrossing": "Supply interval crossing a low-supply cutoff = evidence_incomplete",
    "referenceLimit": "Adjustable exploratory reference, not investment cutoff or measured capacity",
    "assignmentBoundsAvailability": "boundsKnown === false means unavailable upper bounds, never exact zero; all supply strategies incomplete"
  },
  "ranking": {
    "modes": [
      "context",
      "weighted"
    ],
    "context": "Demandeligible first, Tierascending, confirmedpathstrengthdescending, stableUUID. Supply doesnot change order incontextmode.",
    "gap": "100/(1+observed_count/count_equivalent_reference)",
    "weighted": "(Wd*DemandScore + Wo*OwnGap + Wc*CompetitorGap)/(Wd+Wo+Wc)",
    "weights": "At most3nonnegativeweights; positivesum; noeligibilitychange.",
    "uncertainty": "Missing, suppressed, boundsKnown=false, invalid values or ownScopeUnavailable never become exact gap contributions; renormalize only available components and expose coverage. Supply never changes Demand membership.",
    "strategyOrdering": {
      "type": "lexicographic_survey_queue",
      "fields": [
        "candidateStrategyIds.length DESC",
        "qualifyingTier ASC",
        "index_of_first_candidate_strategy_in_selected_order ASC",
        "first_candidate_observed_sort_value DESC within_same_strategy",
        "reporting_uuid ASC"
      ],
      "sortValues": {
        "underserved_market": "1-total_upper/(own_ref+competitor_ref)",
        "competitive_entry": "competitor_lower/competitor_ref; 0 if market comparison unavailable",
        "complementary_location": "largest passing selected-activity midrank",
        "network_infill": "1-own_upper/own_ref"
      },
      "noNegativeWeightHack": true,
      "mutatesExistingRank": false,
      "scoreNotProduced": true
    }
  },
  "opportunity": {
    "contract": "contracts/opportunity-strategies.v1.9.0.json",
    "runtime": "prototype/opportunity-engine.js",
    "ui": "prototype/strategy-ui.js",
    "ids": [
      "underserved_market",
      "segment_gap",
      "competitive_entry",
      "cluster_participation",
      "complementary_location",
      "route_capture",
      "network_infill",
      "future_entry"
    ],
    "statuses": [
      "candidate_to_check",
      "evidence_incomplete",
      "not_supported_by_current_evidence",
      "not_current_yolk",
      "demand_evidence_incomplete"
    ],
    "candidateMeaning": "Survey cue, never confirmed gap, measured customer demand, market share, winning probability, parcel feasibility or permit",
    "P0CandidateSupported": [
      "underserved_market",
      "competitive_entry",
      "complementary_location",
      "network_infill"
    ],
    "maxSelected": 3,
    "counterContract": {
      "primary": [
        "Demand eligible",
        "candidate to check"
      ],
      "secondary": [
        "incomplete evidence",
        "unsupported strategy"
      ],
      "scope": "selected administrative scope; one location counted once per status, not sum of selected strategies"
    },
    "assessmentTraceFields": [
      "criteria and canonical SHA",
      "displayed draft/team revision",
      "industry/brand/format/context",
      "source dependency manifest with exact SHA and release binding",
      "strategy profile/engine",
      "findings and missing evidence",
      "first task/owner/action time",
      "not_assessed when no strategy selected"
    ],
    "timestampActor": "Capture by server/session mutation, not clock in pureengine.",
    "sourcePeriods": "Use actual inventory effective period or null; retrievedAt is not effectivePeriod."
  },
  "experience": {
    "routes": [
      "market",
      "demand",
      "supply",
      "criteria",
      "targets",
      "place/:uuid",
      "poi/:id",
      "feed",
      "team",
      "inbox"
    ],
    "persistentMap": true,
    "camera": "Explicit navigation, focus, fit and cluster click move the camera. Meaningful viewport-width changes may refit the same geographic scope for responsive visibility. Route changes, criteria previews, mode changes and Strategy selection retain the camera; an open POI popup retains its anchor. Camera preservation applies within the current host-dependent near-Thailand zoom/center envelope. Clamp only an out-of-envelope camera after resize; same map/navigation/context/forms and data scope remain.",
    "geography": {
      "country": {
        "paint": "native district",
        "click": "province"
      },
      "province": {
        "paint": "fine reporting area",
        "click": "district"
      },
      "district": {
        "paint": "fine reporting area",
        "click": "fine area"
      },
      "fine": {
        "interior": "transparent",
        "details": "source POIs/evidence"
      }
    },
    "supplyMap": {
      "default": "regions",
      "optional": "points",
      "pointLevels": [
        "country",
        "province",
        "district",
        "fine"
      ],
      "gridCellPixels": 56,
      "truncateRecords": false,
      "screenGroupMeaning": "Rendering only, not physical clustering or attractiveness",
      "boundaryPolicy": "Quiet contextual parent outlines; omit unnecessary child outline networks at broad scopes, preserve yellow clickable hover and white selected outline.",
      "pointStrokeSchedule": {
        "country": {
          "province": 1.2,
          "districtVisible": false
        },
        "province": {
          "province": 1.2,
          "district": 0.65,
          "fineVisible": false
        },
        "district": {
          "chosenParentDistrict": 1.1,
          "fineVisible": false,
          "fineClickTargets": "transparent hit geometry retained"
        },
        "fine": {
          "selectedFine": 0.8,
          "fill": false
        },
        "hover": {
          "hex": "#FFBC1F",
          "width": 2
        }
      },
      "pointModeDefault": "all",
      "screenGroupingDefault": false,
      "gridCellMeaning": "Optional explicit screen grouping only",
      "allPointCap": null,
      "pointRenderingAuthority": "contracts/branch-points.v1.9.9.json"
    },
    "strategyMap": {
      "paint": "Candidateareas only, retainingDemandtiercolors",
      "nonmatch": "Transparent, not lowDemand",
      "broaderClickHits": "Preservedhierarchy",
      "selection": "Transparentselectedfine",
      "counts": "CurrentDemandeligibility and strategyviewcounts separate"
    },
    "mapAppearance": {
      "ordinaryOutline": "#FFFFFF",
      "parentRelativeThicker": true,
      "hoverOutline": "#FFBC1F",
      "hoverWidthPixels": 2,
      "selectedFineFill": false,
      "tier1": "Exact density.area LUT20–40 gradient #E6AB30→#D6600C",
      "tier2": "#FFBC1F",
      "tier3": "#F1F4EF",
      "nonTierAnalytical": "Exact original41LUTvalues selectedbyunit/denominator, sameboththemes, full analytical opacity; missing neutraldistinct",
      "pointModeOverrides": "Retain pointStrokeSchedule and quiet visible geometry unchanged; pair only visible ordinary outlines with current neutral keyline, including selected fine outline; no new fine child mesh or opaque interior.",
      "choroplethChildStrokePixels": 0.3,
      "choroplethParentStrokePixels": {
        "province": 1.2,
        "district": 1.05,
        "chosenDistrict": 1.1,
        "selectedFine": 0.8
      },
      "boundaryContrastAuthority": "contracts/map-readability.v1.9.6.json",
      "boundaryContrast": {
        "implementationStatus": "runtime_confirmed",
        "kind": "Stroke-only paired neutral keyline beneath existing ordinary white boundary outlines",
        "panes": {
          "analyticalPaint": 400,
          "neutralKeyline": 410,
          "whiteForeground": 411,
          "yellowHover": 412,
          "markers": 600
        },
        "contrastPanesPointerInert": true,
        "neutralToken": {
          "name": "--ldm-map-marker-halo-dark",
          "hex": "#101318",
          "sameAcrossThemes": true,
          "meaning": "UI contrast support, not a data color or magnitude"
        },
        "whiteWidthsPx": {
          "fineAndCountryDistrict": 0.3,
          "selectedFine": 0.8,
          "province": 1.2,
          "ordinaryDrilldownDistrict": 1.05,
          "selectedDistrict": 1.1,
          "quietPoiDistrict": 0.65
        },
        "underlayWidth": "Existing ordinary white foreground width + 0.80px",
        "keylineFill": false,
        "keylineFillOpacity": 0,
        "geometryAndVisibility": "Pairs mirror only the currently visible source outlines; no new child mesh in quiet POI view, no geometric join or new affiliation",
        "dashStates": "Retain existing missing/extent/zero-state dash meaning",
        "dataPaint": "Analytical fills, original colors, Tier gradient, LUT41, opacity and source geometry unchanged; no SVG filter on ordinary analytical paint",
        "hover": "Retain original Yolk yellow #FFBC1F hover outline above ordinary paired strokes",
        "retiredAppearanceSupport": [
          "Prior parent-only halo attribute",
          "Generic ordinary white-stroke SVG drop-shadow"
        ],
        "legacySelector": "Retained historical map-hover stylesheet selector matches no currently emitted ordinary path; generic neutral keyline is the sole active contrast support",
        "supersedes": "Appearance support in retained expansion-experience1.9.3 only; no source, analytical, layout, camera, tooltip or navigational semantics changed"
      }
    },
    "symbols": {
      "own": "shield",
      "competitor": "swords",
      "unknown": "fact_check",
      "yolk": "egg_alt",
      "actualPOI": "Verifiedsourcebrandgraphic(originalcontain/aspectincompactslot)or explicitnamedthemefallback+caption+partybadge"
    },
    "reviewCopy": "Found / Stillunknown / Firstfieldtask; share whatwasobserved and whatcouldchange decision.",
    "responsiveCameraRule": "Explicit Expand/Compact preserves map/navigation/context and permitted camera; current geographic floor/bounds may clamp only out-of-envelope zoom/center after host changes. Ordinary scope-fit/popup safeguards remain.",
    "interactionGuidance": {
      "schemaVersion": "yolk.interaction-guidance/1.9.1",
      "version": "1.9.1",
      "date": "2026-10-07",
      "status": "locally_verified_preview_production_plan",
      "extends": [
        "contracts/map-boundary-appearance.v1.7.4.json",
        "contracts/workspace-map.v1.7.json",
        "contracts/full-product.v1.9.0.json"
      ],
      "scope": "Presentation and functional feedback only; retain criteria/profile/engine/strategy version 1.9.0.",
      "invariants": {
        "demandMembershipUnchanged": true,
        "sourceCountsUnchanged": true,
        "fixedNationalCohort": 7954,
        "metricCount": 25,
        "ordinaryRouteCameraUnchanged": true,
        "noLogoOrEvidenceAnimation": true,
        "noMotifs": true
      },
      "hover": {
        "maxVisibleAreaTooltips": 1,
        "owner": "clickable_navigation_scope",
        "paintLayerTooltipAtBroaderScope": false,
        "countryScope": "province",
        "provinceScope": "district",
        "districtScope": "fine_reporting_area",
        "fineScope": "selected_fine",
        "content": [
          "escaped clickable scope type and human-readable name",
          "important view value and explicit unit",
          "aggregation or coordinate-coverage label",
          "pending/review/missing/interval state when applicable"
        ],
        "aggregation": {
          "countrySupplyRegion": "Direct native source vector of the hovered province in current count/share/market view; never maximum child values or summed ambiguous fine display links.",
          "provinceOrDistrictSupplyRegion": "Direct native hovered district vector at province level, or direct reporting UUID vector at district/location level; source share computed from compatible counts, never mean or maximum local shares.",
          "demandTier": "Best known confirmed fine Demand tier within scope, with unresolved evidence kept separate.",
          "supplyPoints": "Exact count of currently filtered coordinate records inside hovered source-display boundary, not the viewport count or full branch inventory.",
          "missing": "Pending and missing are distinct from known zero; intervals remain intervals.",
          "retiredChildMaximumPolicy": "The old1.9.1 max-known-child summaries are historical only; current source-supported Supply analysis and treemap hover use the compatible direct scope vector."
        },
        "lifecycle": [
          "replace current scope tooltip on new hover",
          "remove on pointer leave/navigation/mode/context change",
          "restore white outline on leave"
        ],
        "focusAndTouch": "Keyboard focus opens the same single tooltip at source bounds centre; touch selection retains detail. Actual screen-reader/physical-device certification remains unverified.",
        "tooltipTransition": "Reuse one Leaflet tooltip across target changes; final clear immediately detaches prior tooltip DOM after removal, preventing overlapping fade-out remnants.",
        "accessibleGeometry": "Only navigation hit geometries expose button/tabindex/area labels; analytical paint paths aria-hidden, without button role or tabindex. Keyboard focus uses the same name/value tooltip.",
        "tooltipPresentation": {
          "desktopWidthPx": 280,
          "mobileWidthPx": 240,
          "maxWidth": "viewport minus40px",
          "boxSizing": "border-box",
          "meaning": "Readable name/value rows; preserves source boundaries and map camera."
        }
      },
      "supplyPoints": {
        "defaultSupplyView": "regions",
        "optionalPointLevels": [
          "country",
          "province",
          "district",
          "fine"
        ],
        "fill": false,
        "boundaryPolicy": "Quiet contextual parent outlines; omit unnecessary child outline networks at broad scopes, preserve yellow clickable hover and white selected outline.",
        "geometryUnchanged": true,
        "coordinateCountNotNativeSupply": true,
        "screenBinsNotPhysicalClusters": true,
        "cameraOnModeChange": "retain",
        "strokeSchedulePx": {
          "country": {
            "province": 1.2,
            "districtVisible": false
          },
          "province": {
            "province": 1.2,
            "district": 0.65,
            "fineVisible": false
          },
          "district": {
            "chosenParentDistrict": 1.1,
            "fineVisible": false,
            "fineClickTargets": "transparent hit geometry retained"
          },
          "fine": {
            "selectedFine": 0.8,
            "fill": false
          },
          "hover": {
            "hex": "#FFBC1F",
            "width": 2
          }
        }
      },
      "actionGuidance": {
        "subject": "a separate pointer-inert shortlist-success cue; not the actual logo, area geometry, evidence or map layer",
        "userBenefit": "Show that a successful save went to Shortlist and increment its visible count by one.",
        "trigger": "successful committed target state change, receipt-deduped; +1 for new/unarchived active target, -1 for removal, no +1 for an existing plan update",
        "countAuthority": "actual current-context active shortlist records after successful save, never an animation counter",
        "duplicate": "No duplicate target/event or false +1; say already shortlisted.",
        "failure": "No success cue or +1; retain usable retry/error state.",
        "destination": [
          "desktop shortlist navigation",
          "mobile shortlist navigation or visible menu fallback"
        ],
        "motionDecision": "functional source-to-destination and finite success feedback, no decorative reveal",
        "focusPolicy": "Retain source control focus and do not auto-navigate or scroll the user.",
        "reducedMotion": "final-state-first: immediate real count/delta/plaintext/link; no spatial flight or moving pulse. Personal preference never emits team events.",
        "hiddenDestination": "Missing/offscreen source or destination skips surrogate and still exposes saved count/status/destination link.",
        "interruption": "Hidden document or pagehide cancels effects/timers and leaves real committed records/count; never performs a delayed mutation.",
        "accessibility": {
          "liveRegion": "Persistent empty role=status / aria-live=polite / aria-atomic=true created at initialization; update plaintext exactly once after successful receipt.",
          "visibleConfirmation": "role=group with linked destination; source focus retained.",
          "surrogate": "aria-hidden and pointer-inert",
          "physicalAT": "unverified"
        },
        "maximumConcurrentCues": 1,
        "durations": {
          "stateFeedbackMs": 200,
          "interactionFeedbackMs": 120,
          "interactionDistancePx": 2,
          "easing": "cubic-bezier(.2,0,0,1)",
          "deltaBadgeMs": 2400,
          "linkedConfirmationMs": 7000,
          "confirmationPause": "pointer hover or keyboard focus"
        },
        "runtime": {
          "js": "prototype/action-guidance.js",
          "css": "prototype/action-guidance.css",
          "loadingOrder": "module before bootstrap"
        },
        "personalPreference": {
          "controlId": "yolk-reduce-motion",
          "captions": {
            "th": "ลดการเคลื่อนไหว",
            "en": "Reduce motion"
          },
          "scope": "personal_local_setting",
          "localStorageKey": "citymeter-yolk-personal-reduce-motion-v1",
          "effectiveRule": "OS prefers-reduced-motion OR personal checkbox",
          "workspaceEvent": false,
          "teamRevision": false,
          "onEnable": "cancel in-flight spatial guidance immediately and expose final count/status",
          "respectsIn": "action guidance, settled result/nav feedback, app smooth scroll and retained location-map focus"
        }
      },
      "otherGuidance": {
        "loading": "Keep existing map visible with readable pending/error state; animation never substitutes status.",
        "navigation": "Finite selected-navigation icon feedback 120ms / 2px; no auto-navigation from save. Explicit navigation/focus/fit may move map under retained camera policy; no camera change for ordinary route sync.",
        "criteria": "A settled result count change has finite 120ms feedback, never rerender replay. Applying team criteria gives a next-step link to Demand; count is calculated, not animated into a false result.",
        "sourceAndDestination": "Only animate where it clarifies the action; no perpetual attention, identity animation or reveal-hidden primary content."
      },
      "verification": {
        "status": "PASS_BOUNDED_CURRENT_LOCAL_QA",
        "commands": [
          "node scripts/check-map-clarity.cjs",
          "node scripts/check-action-guidance.cjs"
        ],
        "nativeStates": [
          "hover boundary has one tooltip, correct name/value and yellow outline",
          "country/province/district/fine branch-point view remains readable",
          "new shortlist action shows destination and actual count +1",
          "duplicate/save failure does not show false success",
          "reduced-motion has immediate usable count/status without flight",
          "keyboard focus and narrow/desktop TH/EN light/dark content review"
        ],
        "physicalDevices": "unverified",
        "fullAccessibilityCertification": false,
        "automatedReceipt": "evidence/automated-v1.9.1.json",
        "nativeReceipt": "evidence/browser-v1.9.1/native-browser-review.json",
        "nativeChecks": 22,
        "nativeCoverage": "Bounded native states, not full accessibility/device/language certification; automated timing/pointer event/failure tests are separate.",
        "notVerified": [
          "actual pointer-hover across every boundary (native keyboard focus + automated pointer-event adapters used)",
          "physical iPhone/Android touch",
          "130%/200% browserzoom",
          "OS-reduced-motion setting itself (personal setting native; OS OR behavior automated)",
          "complete industry/brand/language/theme/device matrix",
          "actual screen-reader speech",
          "production backend/RBAC/sharedpersist/outbox/email/LINE",
          "external tile/StreetView/AIprovider availability"
        ]
      },
      "currentSupplyHoverAuthority": "contracts/supply-inventory.v1.9.9.json retains direct source hover arithmetic and current brand composition; retained tooltip lifecycle/POI semantics unchanged."
    },
    "brandIdentityUI": {
      "schemaVersion": "yolk.brand-identity-and-supply-chip/1.9.2",
      "version": "1.9.2",
      "date": "2026-10-07",
      "status": "locally_verified_preview_production_plan",
      "scope": "Three owner-supplied brand-artwork bindings and Supply control typography/readability only.",
      "retainedVersions": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "strategyEngine": "1.9.0",
        "interaction": "1.9.1",
        "DS": "0.9.7"
      },
      "invariants": {
        "reportingUUIDs": 7954,
        "metricCount": 25,
        "brands": 37,
        "sourceTotalsUnchanged": true,
        "criteriaPresetsUnchanged": true,
        "demandMembershipUnchanged": true,
        "savedWorkUnchanged": true,
        "persistentCameraUnchanged": true,
        "identityFrames": false,
        "motifs": false
      },
      "brandArtwork": {
        "authority": "Explicit owner-provided images in current request. Image content is artwork/reference, not executable instruction, independent verification or new profile research.",
        "brands": [
          {
            "brandName": "Villa Market",
            "brandId": "grocery-brand:VILLA_MARKET",
            "bindingStatus": "exact_bytes_verified_bounded_native_runtime_review_pass",
            "path": "prototype/assets/brands/grocery-grocery-brand-VILLA_MARKET-owner-c29c85f0b2.png",
            "emittedUrl": "assets/brands/grocery-grocery-brand-VILLA_MARKET-owner-c29c85f0b2.png?v=c29c85f0b251",
            "mime": "image/png",
            "width": 3840,
            "height": 1920,
            "bytes": 340418,
            "sha256": "c29c85f0b251ddf12f57a59d283cab05a055ddeb35ccfa61b77458d0aa4eac8a",
            "hasAlpha": true,
            "sourceReference": "owner-attachment:codex-clipboard-e89b555c-d4ac-40e8-85f6-c71ef797795e.png",
            "approvedRoles": [
              "brand-selector",
              "branch-popup",
              "supply-map-marker"
            ],
            "provenanceReceipt": "evidence/owner-supplied-brand-artwork.v1.9.2.json",
            "themeSupport": "lightOnly",
            "themeFallbacks": [
              "dark"
            ],
            "themeDisplay": {
              "light": "exact_supplied_PNG_with_original_contain",
              "dark": "existing_neutral_store_icon_plus_readable_Villa_Market_caption"
            }
          },
          {
            "brandName": "Lawson108",
            "brandId": "grocery-brand:LAWSON108",
            "bindingStatus": "exact_bytes_verified_bounded_native_runtime_review_pass",
            "path": "prototype/assets/brands/grocery-grocery-brand-LAWSON108-owner-0bcdc9944f.png",
            "emittedUrl": "assets/brands/grocery-grocery-brand-LAWSON108-owner-0bcdc9944f.png?v=0bcdc9944f05",
            "mime": "image/png",
            "width": 227,
            "height": 300,
            "bytes": 45024,
            "sha256": "0bcdc9944f0543ae6a04627892080615d510b1db46347b140e4c7890347a587b",
            "hasAlpha": true,
            "sourceReference": "owner-attachment:codex-clipboard-b5b7f112-0d88-4c6a-98c5-0bca3d48d5de.png",
            "approvedRoles": [
              "brand-selector",
              "branch-popup",
              "supply-map-marker"
            ],
            "provenanceReceipt": "evidence/owner-supplied-brand-artwork.v1.9.2.json",
            "themeSupport": "both",
            "themeFallbacks": [],
            "themeDisplay": {
              "light": "exact_supplied_PNG_with_original_contain",
              "dark": "exact_supplied_PNG_with_original_contain"
            }
          },
          {
            "brandName": "Tops",
            "brandId": "grocery-brand:TOPS",
            "bindingStatus": "exact_bytes_verified_bounded_native_runtime_review_pass",
            "path": "prototype/assets/brands/grocery-grocery-brand-TOPS-owner-dccbc2bbd0.png",
            "emittedUrl": "assets/brands/grocery-grocery-brand-TOPS-owner-dccbc2bbd0.png?v=dccbc2bbd059",
            "mime": "image/png",
            "width": 800,
            "height": 316,
            "bytes": 49990,
            "sha256": "dccbc2bbd05952420a2e782ef1dc2ae7ce6c5d8fffb70eb2772055df7e213458",
            "hasAlpha": true,
            "sourceReference": "owner-attachment:codex-clipboard-1ee92e1e-cd40-44f3-8d49-0f45743b2d3c.png",
            "approvedRoles": [
              "brand-selector",
              "branch-popup",
              "supply-map-marker"
            ],
            "provenanceReceipt": "evidence/owner-supplied-brand-artwork.v1.9.2.json",
            "themeSupport": "both",
            "themeFallbacks": [],
            "themeDisplay": {
              "light": "exact_supplied_PNG_with_original_contain",
              "dark": "exact_supplied_PNG_with_original_contain"
            }
          }
        ],
        "assetDelivery": "Original artwork bytes, exact paths/MIME/dimensions/SHA and current registry bindings settled before seal.",
        "rendering": "Use contain and original aspect ratio in a compact square placement with readable adjacent brand caption. Do not crop, stretch, trace, recolor or add backing plate/frame.",
        "meaning": "Replace or add the three existing brand graphics only; no new reporting brand ID, format, offering claim or brand perception result.",
        "themeReview": "Inspect actual owner-supplied artwork on approved light/dark surfaces. Use an explicit readable fallback if a theme cannot show the artwork clearly; no invented variant.",
        "registry": "prototype/data/brand-logos.v1.7.json",
        "registryUrl": "data/brand-logos.v1.7.json?v=1.9.2-owner2",
        "registrySha256": "f56763b33bfd07698335b9a86b54ec1e2c79698872cdfa2a634c234013dcc2bb",
        "runtimeLoader": "prototype/bootstrap.js",
        "provenanceReceipt": "evidence/owner-supplied-brand-artwork.v1.9.2.json",
        "sourceAspectRatio": "All three original files are non-square. Square describes the compact placement slot only; preserve original contain/aspect, including owner-provided native wordmarks.",
        "metadataReview": "Asset receipt records retained metadata and its sensitivity inspection; no user location, timestamp, device, author or private text metadata is published.",
        "villaDarkPolicy": {
          "light": "exact owner-supplied VL + wordmark PNG, unchanged contain/aspect",
          "dark": "existing neutral store-icon fallback plus readable Villa Market caption; explicitly not a substitute brand logo",
          "originalDarkReview": "FAIL_insufficient_legibility_on_charcoal_actual_native_review",
          "finalFallbackReview": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
          "backingSurface": false,
          "crop": false,
          "recolor": false,
          "restoreRetiredShoppingAppCart": false
        },
        "provenanceReceiptSha256": "bcea3015cd1eefaa9aff0c3c7f8c4960e3dbb0a7b72796bc8bdba04ad7f5f8fb"
      },
      "supplyChips": {
        "purpose": "Identify what Supply role is shown without raw icon text or squeezed captions.",
        "iconMeaning": {
          "own": "shield",
          "competitor": "swords",
          "identifiedTotal": "own + competitor semantic icons with a single caption",
          "unverified": "fact_check"
        },
        "fontOwnership": {
          "glyph": "Yolk Material Symbols, FILL0/wght300/GRAD0/opsz24, exact retained39-glyph WOFF2 bytes",
          "caption": "Bai Jamjuree/approved LDS interface font, inherited from control",
          "counter": "JetBrains Mono only on .supply-tab-count[data-yolk-counter]",
          "namespace": "Explicit .yl-icon[data-yolk-glyph] excludes body/strong/numeric inherited font collision"
        },
        "layout": {
          "display": "inline-flex",
          "align": "center",
          "gapPx": 8,
          "glyphPx": 22,
          "iconFlex": "nonshrinking1em",
          "caption": "one .control-caption, separate from glyph/count",
          "compoundAnalysisRole": "Separate icon container and one readable caption; no duplicated label",
          "narrowControlLayout": "Five filters wrap within the persistent map workspace available width; no page overflow. Actual390px review presents three rows; row count is content/width-dependent."
        },
        "accessibility": "Icons aria-hidden; readable caption supplies accessible name and selection state. Visible keyboard focus and caption-only hover underline retained.",
        "metrics": "Display/source/calculation unchanged; this is a presentation fix only.",
        "tabIds": [
          "all",
          "own",
          "competitor",
          "unverified",
          "archived"
        ],
        "tabGlyphs": [
          "store",
          "shield",
          "swords",
          "fact_check",
          "store"
        ],
        "captionEnhancement": {
          "idempotent": true,
          "skip": [
            ".yl-icon",
            "[data-yolk-counter]",
            "svg",
            "img"
          ]
        },
        "fontFallback": {
          "readyClass": "yolk-icons-ready",
          "beforeReadyOrFailure": "hide raw ligature text; keep readable caption and selected-state controls usable",
          "noInventedGlyph": true
        }
      },
      "verification": {
        "status": "PASS_BOUNDED_CURRENT_LOCAL_QA",
        "newRegression": "node scripts/check-icon-controls.cjs",
        "nativeStates": [
          "Supply role controls with own/competitor/total icons and captions",
          "Villa Market/Lawson108/Tops graphics alongside brand names",
          "actualTH/EN light/dark at narrow and desktop widths",
          "no raw ligature names, text/icon overlap or page overflow",
          "retained map/criteria/shortlist behavior"
        ],
        "physicalDevices": "unverified",
        "fullAccessibilityCertification": false,
        "boundedScope": "Actual Supply renderer, caption enhancement, retained icon font bytes, font readiness and scoped resting-state CSS cascade fixture; native shaping/geometry/theme review separate.",
        "automatedReceipt": "evidence/automated-v1.9.2.json",
        "nativeReceipt": "evidence/browser-v1.9.2/native-browser-review.json",
        "automatedSuites": 29,
        "automatedChecks": 506,
        "nativeChecks": 12,
        "nativeCoverage": "Bounded12currentnative states:4TH/ENlight/darkmobileSupplychip states;6brandselectorstates(3brands×2themes,Villaoriginalinlight/namedfallbackindark);1ENlightdesktopchips;1TopsactualPOIpopup+visiblemapmarker. OriginalVillaDarkfailedcompactcontrastfindingretained; finalfallbackpasses. No complete product/device/AT certification.",
        "notVerified": [
          "physical iPhone/Android touch",
          "130%/200% browser zoom",
          "actual screen-reader speech",
          "full industry/brand/language/theme/device matrix",
          "Lawson/Villa actual native POI popup (shared renderer covered automatically)",
          "native font failure (DOM adapter regression only)",
          "production backend/RBAC/sharedpersist/outbox/email/LINE",
          "external tile/StreetView/AIprovider availability"
        ]
      }
    },
    "routeAliases": {
      "strategy": "market"
    },
    "firstPage": "market",
    "expansionExperience": {
      "schemaVersion": "yolk.expansion-experience/1.9.3",
      "version": "1.9.3",
      "date": "2026-10-08",
      "status": "locally_verified_preview_publication_pending",
      "scope": "Merge the country overview and Strategy into one first page, with larger persistent map, compact controls and clearer white boundary hierarchy. No analytical migration.",
      "retainedVersions": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "strategyEngine": "1.9.0",
        "interaction": "1.9.1",
        "brandIdentityUI": "1.9.2",
        "DS": "0.9.7"
      },
      "invariants": {
        "reportingUUIDs": 7954,
        "metrics": 25,
        "selectableBrands": 37,
        "nationalBenchmarkUnchanged": true,
        "demandMembershipUnchanged": true,
        "supplyTotalsUnchanged": true,
        "savedCriteriaAndDraftsPreserved": true,
        "samePersistentMap": true,
        "noMotifsOrLogoFrames": true,
        "analyticalColorAndOpacityUnchanged": true
      },
      "firstPage": {
        "route": "#market",
        "name": {
          "th": "โอกาสขยาย",
          "en": "Expansion opportunities"
        },
        "defaultContext": "Use the selected industry/brand/important format with saved criteria/draft first; an unseen context uses its single researched starter preset. No new user data is required for an initial evidence-limited queue.",
        "internalPipeline": [
          "Evaluate confirmed high Demand under the selected criteria and national benchmark",
          "Compare relevant source-scope Supply with bounds/unknowns",
          "Assess selected profile-relevant strategies against the same Demand rows",
          "Project an evidence-limited candidate-to-check queue without mutating eligibility",
          "Open reasons/missing evidence/first field task and shortlist with owner"
        ],
        "strategySelection": {
          "catalog": "contracts/opportunity-strategies.v1.9.0.json",
          "available": 8,
          "maximumSelected": 3,
          "default": "Existing researched profile/scope defaults only; preserve saved personal choices and drafts.",
          "placement": "Collapsed inline chooser below the two primary counters/scope and before candidate results; render choices lazily when opened. Existing preferences remain per context, maximum three."
        },
        "queue": {
          "label": {
            "th": "ทำเลชวนสำรวจ",
            "en": "Places to investigate"
          },
          "candidateMeaning": "A source-supported cue for a field check, not measured unmet demand, revenue, market share, consumer perception or success probability.",
          "separateStates": [
            "candidate_to_check",
            "evidence_incomplete",
            "not_supported_by_current_evidence",
            "not_current_yolk",
            "demand_evidence_incomplete"
          ],
          "cardFields": [
            "location name and reporting scope",
            "Demand tier",
            "supported selected strategy reason",
            "observed value/unit/period/source",
            "missing evidence",
            "first field task",
            "shortlist action + current saved state"
          ],
          "sortAuthority": "Retained OpportunityEngine comparator; do not describe a different order or combine quantities across strategy units.",
          "noResults": "Explain whether no confirmed Demand, no current strategy cue, missing evidence or unavailable source; keep data states separate from measured zero.",
          "map": "Retain Demand tier colors on candidate areas; nonmatching or incomplete areas are transparent, not low Demand.",
          "primaryCounters": [
            "confirmed Demand eligible in selected scope",
            "candidate-to-check locations in selected scope"
          ],
          "secondaryCounters": {
            "shortlist": "Persistent navigation count, not repeated in the first-page main counter strip",
            "incomplete": "No primary visible incomplete count. Explain states in page evidence-limits disclosure and result details/empty state; never fabricate a combined opportunity count."
          },
          "cardDisclosure": "Show the first supported reason, View place and Shortlist actions. Full reasons, missing evidence and field tasks use progressive disclosure.",
          "emptyAction": "Link to the dedicated Demand investigation without changing criteria.",
          "resultsHeading": {
            "th": "เริ่มดูทำเลเหล่านี้",
            "en": "Start with these places"
          }
        },
        "supportPages": {
          "demand": "Dedicated Demand investigation and criteria-supported metrics",
          "supply": "Dedicated relevant Supply comparison with default choropleth and optional coordinate POIs at all drilldowns",
          "criteria": "Shared applied criteria and private draft preview",
          "targets": "Saved targets with assessment snapshots and owners",
          "feed": "Committed team activity"
        },
        "compatibilityAlias": {
          "from": "#strategy",
          "to": "#market",
          "status": "current_source_and_bounded_native_alias_pass_exact_state_bound_by_controller_regressions",
          "preserve": [
            "industry/brand/scope context",
            "team criteria and private drafts",
            "selected strategy set",
            "map instance/camera/navigation",
            "saved targets and evidence"
          ],
          "mustNot": [
            "reset preset/context",
            "remount map",
            "silently apply draft",
            "emit a team data-change event",
            "create a duplicate page or change source counts"
          ],
          "hashRewrite": "Render normalizes legacy strategy to market without forcing a hash rewrite."
        },
        "brandContext": "Shared team/private-draft banner; brand/profile details and evidence limits collapsed below results. No duplicate mandatory three-step landing block."
      },
      "mapLayout": {
        "desktop": {
          "normalHeight": "calc(100dvh - 72px)",
          "normalWorkPanelWidth": "380–440px",
          "expanded": "Full workspace width; hide only the work panel. Keep persistent map and viewport/context.",
          "status": "current_source_and_bounded_native_viewport_pass",
          "actualNativeMeasurements": {
            "status": "bounded_native_browser_measurement_pass",
            "viewportPx": [
              1440,
              900
            ],
            "opportunityCanvasPx": [
              742,
              626.703
            ]
          }
        },
        "toolbar": {
          "minimumHeightPx": {
            "desktop": 64,
            "mobile": 58
          },
          "statsRow": "Full-width row below compact primary controls.",
          "options": "Progressive disclosure at all widths; no duplicated long control bar.",
          "touchZoomEvidenceMinimumPx": 44
        },
        "mobile": {
          "defaultHeight": "clamp(360px, 58svh, 560px)",
          "expandControl": "Explicit Expand map / Compact control, personal display state; same map/camera.",
          "minimumTouchTargetPx": 44,
          "sameMapAndCamera": true,
          "scrollAndFocus": "Expanded map is personal view state. Escape closes open map options first, then collapses the expanded map, restores bottom navigation and focuses its toggle. Named current viewport dimensions/behavior passed bounded native review; physical devices/full matrix remain unverified.",
          "expandedHeight": "min(760px, 100svh - 88px - safe-area)",
          "footer": {
            "position": "Normal flex flow, not an overlay on canvas",
            "minimumHeightPx": 52,
            "maximumHeightPx": 148,
            "boundedWhenEvidenceOpen": true,
            "mapHostFlexMin": 0
          },
          "supplyDefaultHeight": {
            "selector": "[data-analysis-kind=\"supply\"]",
            "height": "clamp(480px, 74svh, 680px)",
            "appliesTo": "Supply region-colour and optional point modes",
            "precedence": "Explicit expanded mode overrides this route-specific default.",
            "status": "current_source_and_bounded_native_viewport_pass"
          },
          "actualCanvasMeasurements": {
            "status": "bounded_native_browser_measurement_pass",
            "viewportPx": [
              390,
              844
            ],
            "market": {
              "canvasHeightPx": 317.117,
              "panelHeightPx": 489.516
            },
            "supplyCountry": {
              "canvasHeightPx": 342.516,
              "panelHeightPx": 624.555
            },
            "supplyExpanded": {
              "canvasHeightPx": 473.961,
              "bottomNavigationHidden": true,
              "EscapeRestoresNavigation": true
            },
            "notPhysicalDeviceCertification": true
          },
          "expandedBottomNavigation": {
            "hiddenWhileExpanded": true,
            "restoreOn": [
              "Compact",
              "Escape collapse"
            ],
            "reason": "Avoid overlap with map attribution and legend; preserve a visible Compact control and keyboard escape path.",
            "personalOnly": true
          }
        },
        "resize": "Explicit Expand/Compact invalidates the existing map while preserving camera, including desktop width changes caused by that control. Ordinary responsive significant-width fitting remains governed by the retained rule; no recreation or criterion mutation."
      },
      "mapAppearance": {
        "ordinaryWhite": "#FFFFFF",
        "choroplethStrokePx": {
          "countryDistrictChild": 0.3,
          "ordinaryFineChild": 0.3,
          "provinceParent": 1.2,
          "districtParent": 1.05,
          "chosenParentDistrict": 1.1,
          "selectedFine": 0.8
        },
        "parentHalo": {
          "only": "existing unfilled choropleth parent outlines",
          "attribute": "data-workspace-boundary-halo=parent",
          "dropShadowPx": 0.65,
          "token": "--ldm-foundation-surface-canvas-dark",
          "hex": "#11191D",
          "neutral": true,
          "forbidden": [
            "POI view",
            "selected fine area",
            "filled analytical paint",
            "new hit geometry",
            "data-color/opacity transformation"
          ]
        },
        "hover": {
          "clickableScopeOutline": "#FFBC1F",
          "widthPx": 2,
          "singleTooltipOwner": "retained1.9.1"
        },
        "pointMode": "Retain the1.9.1 quiet POI stroke schedule; no extra child mesh or parent halo.",
        "data": "Retain exact41LUTs and egg Tier1/2/3 colors/direction/opacity in both themes; source/display/click geography stays unchanged."
      },
      "foundationAndIcons": {
        "lightSurfaces": {
          "canvas": {
            "token": "surface.soft.light",
            "hex": "#E5E9E6"
          },
          "paper": {
            "token": "surface.alt.light",
            "hex": "#EEF1EE"
          },
          "scope": "Exact LDS foundation UI values only. Analytical data LUT/tier colors are separate and unchanged.",
          "status": "sampled_native_actual_values_match_exact_DS_foundation_tokens"
        },
        "linkStates": "Sampled dark journey links#68C4E2 and light accent#176B82; caption-only underline and visible keyboard focus retained. Bounded actual review is distinct from a full element/state matrix.",
        "genericSupply": "Use the existing store icon for overall Supply/menu/step; shield remains own network and swords remains competitor meaning.",
        "identity": "Retain1.9.2 exact original artwork and explicit Villa light-original/dark-named fallback; no backing plate/motif/new glyph binaries."
      },
      "tileRecovery": {
        "implementationStatus": "current_source_and_bounded_native_retry_pass",
        "tracker": "Leaflet basemap tile events; loading / partial / error states, retained-grid counts are diagnostic only.",
        "retry": {
          "label": {
            "th": "โหลดพื้นหลังใหม่",
            "en": "Reload background"
          },
          "method": "Recreate only the current-style public tile layer through setBasemap(S.basemap); preserve the existing Leaflet map/camera/data/providers.",
          "explicitUserAction": true,
          "automaticRetry": false,
          "preserve": [
            "same map instance",
            "camera and navigation",
            "current criteria and source values",
            "saved work"
          ],
          "avoids": [
            "GridLayer.redraw()",
            "camera zoom rounding",
            "invalidateSize on retry",
            "analytical data or geometry redraw"
          ],
          "tileLayerLifecycle": {
            "activeLayers": 1,
            "lateRetiredLayerEventsIgnored": true,
            "retirementOrder": "Call public map.removeLayer(previous) before previous.off(); allow Leaflet once(remove) map-event cleanup to run, then clear the retired layer local handlers.",
            "nativeConsole": {
              "status": "bounded_fresh_native_zero_captured_errors",
              "cacheToken": "ce27743ff1c9",
              "errors": 0,
              "observedSequence": "Two retry cycles,390↔1440viewport resize and zoom in/out.",
              "boundary": "Only the named final fresh local browser sequence; no universal error-free or provider availability claim."
            }
          }
        },
        "boundariesRemainUsable": true,
        "mustNotClaim": [
          "provider root cause from local event counts",
          "global availability",
          "offline portability",
          "successful retry without actual event/native evidence"
        ],
        "noPackagedTileCaches": true,
        "nativeDiagnosis": {
          "observation": "Leaflet GridLayer.redraw at fractional map zoom10.25 emitted an invalid /10.25/x/y.png OSM tile request in native review.",
          "boundedCause": "Application retry path; not proof of provider availability or a global provider incident.",
          "response": "Replace redraw with the existing same-style tile-layer creation path so normal tile-zoom quantization applies.",
          "status": "fixed_source_and_bounded_native_recheck_pass"
        },
        "nativeSample": {
          "receipt": "evidence/browser-v1.9.3/native-browser-review.json",
          "integerURLRetry": "9/9sampled tiles loaded; status hidden after recovery; camera/breadcrumb/scale retained immediately",
          "afterFinalZoom": "15/15tiles loaded in named final browser sequence",
          "originalScreenshotLimitation": "Original missing-rectangle screenshot was not recreated identically; actual retry and listener-lifecycle faults were reproduced and corrected."
        }
      },
      "verification": {
        "status": "PASS_BOUNDED_CURRENT_LOCAL_QA",
        "knownNewRegression": [
          "node scripts/check-map-hierarchy.cjs",
          "node scripts/check-map-recovery.cjs"
        ],
        "additionalRegressionNames": [
          "node scripts/check-strategy-guide.cjs",
          "Current32suite inventory in evidence/automated-v1.9.3.json"
        ],
        "nativeRequired": [
          "TH/EN actual first-page labels/reasons/strategy selection at narrow and desktop widths",
          "light/dark foundation/link/icon states",
          "same map/camera while page/strategy/criteria and expanded controls change",
          "white parent/child hierarchy with halo only on eligible parent strokes",
          "POI quiet mode and transparent selected fine",
          "legacy#strategy alias preserving context/draft/camera",
          "shortlist new/duplicate/failure feedback",
          "basemap loading/error/retry where implemented",
          "Actual eight-guide overview/details/illustrations, hypothetical captions, Escape and focus restoration at narrow/desktop widths",
          "Guide opens without changing selected strategies, Demand IDs, criteria, map or events"
        ],
        "automatedSuites": 32,
        "automatedChecks": 537,
        "nativeChecks": 22,
        "physicalDevices": "unverified",
        "fullLanguageThemeMatrix": false,
        "localEvidence": {
          "status": "PASS_BOUNDED_CURRENT_LOCAL_QA",
          "receipt": "evidence/qa-v1.9.3.json",
          "receiptSha256": "93c4f585ddf58a6000684a6a27c7c026df0b63759375632e675f75b73bb93cd9",
          "automatedReceipt": "evidence/automated-v1.9.3.json",
          "automatedReceiptSha256": "9fa680f714f7683c4f7be39af9f3fc36478190abf40268011a67115c7afcef5b",
          "releaseChecksReceipt": "evidence/release-checks-v1.9.3.json",
          "releaseChecksReceiptSha256": "e67c3c625269499a848b03e57b8cb7d0559aae1d911a14974836f450f0ca0717",
          "nativeBrowserReceipt": "evidence/browser-v1.9.3/native-browser-review.json",
          "nativeBrowserReceiptSha256": "399818fd8609a9acc460a61e7960e47483e8abe2fce007ccf71e2a2cb5daf7cc",
          "automatedSuites": 32,
          "automatedChecks": 537,
          "checkCountMeaning": "Sum of reported passed test cases or exact PASS output lines; not individual assertion counts. Original full-run timestamp and unaffected output bytes are preserved. Hierarchy was rerun for its final CSS cascade fix; recovery, workspace map and hierarchy were rerun after same-style fractional-zoom retry; recovery and workspace map were rerun after the Leaflet removal-listener lifecycle fix.",
          "browserStatus": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
          "browserChecks": 22,
          "snapshots": [
            "evidence/browser-v1.9.3/desktop-dark-en-guide-future_entry.jpg",
            "evidence/browser-v1.9.3/desktop-dark-en-guide-segment_gap.jpg",
            "evidence/browser-v1.9.3/desktop-dark-en-supply-boundaries.jpg",
            "evidence/browser-v1.9.3/desktop-dark-en-supply-poi-popup.jpg",
            "evidence/browser-v1.9.3/desktop-light-guide-index.jpg",
            "evidence/browser-v1.9.3/desktop-light-guide-network.jpg",
            "evidence/browser-v1.9.3/desktop-light-opportunities.jpg",
            "evidence/browser-v1.9.3/mobile-dark-en-guide-future.jpg",
            "evidence/browser-v1.9.3/mobile-dark-guide-complementary.jpg",
            "evidence/browser-v1.9.3/mobile-dark-guide-index.jpg",
            "evidence/browser-v1.9.3/mobile-dark-map-expanded.jpg",
            "evidence/browser-v1.9.3/mobile-dark-market.jpg",
            "evidence/browser-v1.9.3/mobile-dark-supply-basemap-retry.jpg",
            "evidence/browser-v1.9.3/mobile-dark-supply-country.jpg",
            "evidence/browser-v1.9.3/mobile-dark-th-guide-future_entry.jpg",
            "evidence/browser-v1.9.3/mobile-dark-th-guide-segment_gap.jpg",
            "evidence/browser-v1.9.3/mobile-light-th-guide-example-evidence.jpg"
          ],
          "snapshotFiles": [
            {
              "path": "evidence/browser-v1.9.3/desktop-dark-en-guide-future_entry.jpg",
              "bytes": 103873,
              "sha256": "843f17dc41bd98ff6e276c84c4691d0250b0b6811d667199e9fe2b5d90831ad9",
              "viewport": {
                "width": 1440,
                "height": 900
              }
            },
            {
              "path": "evidence/browser-v1.9.3/desktop-dark-en-guide-segment_gap.jpg",
              "bytes": 102917,
              "sha256": "ef2532df4a5c275869e8b6efadae13449b8d8497173a35bc729fff2b2e829262",
              "viewport": {
                "width": 1440,
                "height": 900
              }
            },
            {
              "path": "evidence/browser-v1.9.3/desktop-dark-en-supply-boundaries.jpg",
              "bytes": 160898,
              "sha256": "f6641e77669a0e33926f730a6c745e8d8191c43dc2787b5414220dd5ee94f7ca",
              "viewport": {
                "width": 1440,
                "height": 900
              }
            },
            {
              "path": "evidence/browser-v1.9.3/desktop-dark-en-supply-poi-popup.jpg",
              "bytes": 146937,
              "sha256": "258449abbe67e12f094373252051c6301cfd877c9291c463789818a153af90e7",
              "viewport": {
                "width": 1440,
                "height": 900
              }
            },
            {
              "path": "evidence/browser-v1.9.3/desktop-light-guide-index.jpg",
              "bytes": 107621,
              "sha256": "a48a852c59329eb0aa3d6c0d6a85d68341ee53b46f73082a0507aa9fd9920a41",
              "viewport": {
                "width": 1440,
                "height": 900
              }
            },
            {
              "path": "evidence/browser-v1.9.3/desktop-light-guide-network.jpg",
              "bytes": 94785,
              "sha256": "d35405256e1f3f936057e35bc868d673d55d3a60223a85546ce2d3762940adb4",
              "viewport": {
                "width": 1440,
                "height": 900
              }
            },
            {
              "path": "evidence/browser-v1.9.3/desktop-light-opportunities.jpg",
              "bytes": 145962,
              "sha256": "4fbb417b187f3981d5ccee274335f40b4d582f4f184dc549bd4b65601d0f071f",
              "viewport": {
                "width": 1440,
                "height": 900
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-en-guide-future.jpg",
              "bytes": 45278,
              "sha256": "e6d90083f0ef74edd21ce11a78ee6926187aee54f2cacfebf9a302f09eadf99c",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-guide-complementary.jpg",
              "bytes": 47516,
              "sha256": "52ff2b96df679d7c2c46d8f9aa2ab24c3aac2bfb32646afa5efeba808a3c2824",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-guide-index.jpg",
              "bytes": 50688,
              "sha256": "7c2e2f9331e69516ec590a9a557f8865d93cc9cfc494219d2f4b1a99c7564a08",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-map-expanded.jpg",
              "bytes": 46258,
              "sha256": "95c3508337753e827312927b8953f0261ca721b381abc1ea00378f8f855487eb",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-market.jpg",
              "bytes": 48519,
              "sha256": "19395b26935c5b310b9f5ad326e6afea62334f6b7c89988ab22c6ecb434d9fb1",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-supply-basemap-retry.jpg",
              "bytes": 57464,
              "sha256": "6d94cfae94bd88126bd7dd84f8d9ab01ec082b82af1ffb6dc5c5ebded78f8857",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-supply-country.jpg",
              "bytes": 46816,
              "sha256": "71e06905c8df659063c046134ec87a52d19f6ee21c7fff75bb97be041e9c46fe",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-th-guide-future_entry.jpg",
              "bytes": 44313,
              "sha256": "a04836e561a2405bcbf59d3d216eca9b98d6cf0d5487039869f6abcd4c6c1f66",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-dark-th-guide-segment_gap.jpg",
              "bytes": 46762,
              "sha256": "08844005eec1e0c228545ea1bc4b9ffd5bfc1d4a5b22c9fa91adfa00665e7aaf",
              "viewport": {
                "width": 390,
                "height": 844
              }
            },
            {
              "path": "evidence/browser-v1.9.3/mobile-light-th-guide-example-evidence.jpg",
              "bytes": 48616,
              "sha256": "c49abbe7fbdf0d80c2441a55a46554a2af01584c89f90b352da9fee4d22a2648",
              "viewport": {
                "width": 390,
                "height": 844
              }
            }
          ],
          "physicalDevices": "unverified",
          "fullLanguageThemeMatrix": false,
          "productionBackend": "not_implemented_in_static_preview",
          "notVerified": [
            "physical iPhone/Android unverified",
            "complete brand-language-theme-device matrix unverified",
            "actual all-boundary pointer-hover and screen-reader speech unverified",
            "external tile/StreetView/Google AI availability not guaranteed",
            "shared backend/auth/outbox not implemented in static preview"
          ],
          "nativeScope": "Bounded local viewport/native interaction review and exact sampled DOM styles, plus explicitly named automated state guarantees. Original missing-rectangle screenshot not recreated identically; a fractional-tile retry bug and retired-layer listener bug were reproduced and fixed. Does not certify all brands, physical devices, Safari, providers or production collaboration.",
          "finalNativeRuntime": {
            "workspaceMapSha256": "ce27743ff1c991cfb828963cfc3f2ee6f9c11489b498326f45f8d0b80d1f228c",
            "workspaceMapCacheToken": "ce27743ff1c9",
            "freshConsoleErrors": 0
          }
        },
        "designSystemPackage": {
          "status": "CURRENT_PACKAGE_PARITY_PASS_ONLY",
          "version": "0.9.7",
          "releaseRef": "v0.9.7-owner.1",
          "receipt": "evidence/lds-package-verification.v1.9.3.json",
          "receiptSha256": "a396dd0d02244cb2b68fd3a0a8b725bafcb6b9fc43d0dddac68a253791e0cb86",
          "checks": 9768,
          "warnings": 65,
          "scope": "Package parity, theme-invariant Story and Location light values, inherited signed source, analytical math, CSS projection and standalone document/schema consistency only. No artifact or team-installation conformance claim.",
          "artifactAndAccountTeamCertification": false
        }
      },
      "strategyGuide": {
        "registry": "prototype/data/strategy-guide.v1.9.3.json",
        "availableIds": [
          "underserved_market",
          "segment_gap",
          "competitive_entry",
          "cluster_participation",
          "complementary_location",
          "route_capture",
          "network_infill",
          "future_entry"
        ],
        "readOnly": true,
        "entryPoints": [
          "Clean icon cards on Expansion opportunities main page",
          "Illustration & example control adjacent to strategy choices",
          "Strategy labels/cards open that strategy detail"
        ],
        "view": "Accessible reader dialog with overview and eight details; concise definition, explanatory SVG diagram, three steps, hypothetical example, available and missing evidence, tradeoff and next question.",
        "noSelectionMutation": true,
        "dismiss": "Escape and explicit close; focus returns to the invoking control.",
        "diagram": "Generated by strategy ID. All example arrangements are illustrative, not measured geometry, traffic or actual business results.",
        "requiredBindings": [
          "id",
          "name.th/en",
          "shortLabel.th/en",
          "icon",
          "oneSentence.th/en",
          "why.th/en",
          "howToUse[3].th/en",
          "illustrativeExample.industry/scenario/action/caveat.th/en",
          "availableP0Evidence",
          "neededEvidence",
          "phase",
          "tradeoff.th/en",
          "question.th/en"
        ],
        "iconNamespace": "Current verified YolkMaterialSymbols subset, consistent with strategy-ui glyph mapping; captions stay visible if font fails.",
        "futureDiagram": "Future-market illustration prompts Demand validation; it does not depict a future site as a confirmed current Yolk."
      }
    },
    "strategyGuide": {
      "authority": "prototype/data/strategy-guide.v1.9.3.json",
      "registryProjection": {
        "schemaVersion": "yolk.strategy-guide/1.9.3",
        "version": "1.9.3",
        "engineVersion": "1.9.0",
        "languages": [
          "th",
          "en"
        ],
        "sourceContracts": [
          "contracts/opportunity-strategies.v1.9.0.json",
          "prototype/data/brand-strategy-profiles.v1.9.0.json",
          "docs/BRAND_RESEARCH_v1.9.0.md"
        ],
        "readOnly": true,
        "examplePolicy": {
          "allExamplesHypothetical": true,
          "noRealLocationsBrandsResults": true,
          "diagramMeaning": "Explanatory illustration, not measured geometry, traffic, market share or actual business results.",
          "noEligibilityOrThresholdMutation": true
        },
        "strategies": [
          {
            "id": "underserved_market",
            "name": {
              "th": "เติมช่องว่างตลาด",
              "en": "Underserved market"
            },
            "shortLabel": {
              "th": "เติมช่องว่าง",
              "en": "Fill a gap"
            },
            "icon": "explore",
            "oneSentence": {
              "th": "Demand เข้มข้น แต่ผู้ให้บริการที่เทียบกันได้ยังน้อยตามจุดเทียบที่ตั้งไว้",
              "en": "Concentrated Demand, with relatively few comparable providers under your chosen reference."
            },
            "why": {
              "th": "ชวนตรวจว่าบริการที่มีอยู่ยังตอบพื้นที่นี้ไม่พอหรือไม่ มอง Supply รวมทั้งเราและคู่แข่ง ไม่ใช่ดูเฉพาะแบรนด์เรา",
              "en": "Investigate whether existing provision serves the area adequately. Compare the combined own and competitor network, not just our brand."
            },
            "howToUse": [
              {
                "th": "เริ่มจากไข่แดงที่ผ่านเกณฑ์ Demand",
                "en": "Start with a location that passes the Demand criteria."
              },
              {
                "th": "เทียบ Supply รวมกับฐานตลาด ดูช่วงค่าที่รวมรายการรอตรวจ",
                "en": "Compare total Supply with the market base, retaining unresolved-record bounds."
              },
              {
                "th": "ตรวจผู้ให้บริการที่ตกหล่น เวลาเปิดและการเข้าถึง ก่อนเล็งแปลง",
                "en": "Check omitted providers, opening hours and access before selecting a site."
              }
            ],
            "illustrativeExample": {
              "industry": "grocery",
              "scenario": {
                "th": "สมมติชุมชนมีประชากรเข้มข้น ร้านรูปแบบเดียวกันรวมแล้วต่ำกว่าจุดเทียบ",
                "en": "Suppose a densely populated community has comparable stores below the chosen provision reference."
              },
              "action": {
                "th": "ชวนทีมสำรวจว่าร้านที่มีอยู่รองรับช่วงเย็นได้พอหรือไม่",
                "en": "Investigate whether existing stores adequately serve evening shopping."
              },
              "caveat": {
                "th": "จำนวนร้านน้อยยังไม่ยืนยันว่าคนต้องการร้านเพิ่ม หรือว่าร้านเดิมรองรับไม่ไหว",
                "en": "Few stores do not establish unmet demand or insufficient existing capacity."
              }
            },
            "availableP0Evidence": [
              {
                "th": "Demand tier จาก CityMETER ที่ผ่านเกณฑ์",
                "en": "Confirmed CityMETER proxy Demand tier."
              },
              {
                "th": "ยอด Supply ใน scope เดียวกัน ช่วงค่าเรา/คู่แข่ง และตัวหารดิบ",
                "en": "Same-scope Supply totals, own/competitor bounds and a raw denominator."
              }
            ],
            "neededEvidence": [
              {
                "th": "ร้านที่ตกหล่น ความจุ เวลาเปิด ทางเข้า และความต้องการที่ยังไม่ได้รับบริการ",
                "en": "Omitted providers, capacity, hours, access and actual unmet service."
              }
            ],
            "phase": "P0",
            "tradeoff": {
              "th": "พื้นที่ Supply น้อยอาจมีข้อจำกัดที่ทำให้ธุรกิจเปิดยากด้วย ต้องตรวจสาเหตุ",
              "en": "Low provision can also reflect constraints that make operating difficult. Investigate the reason."
            },
            "question": {
              "th": "บริการไหนยังขาด และเราตอบได้จริงหรือไม่?",
              "en": "What service is missing, and can we provide it?"
            }
          },
          {
            "id": "segment_gap",
            "name": {
              "th": "เติมช่องว่างของกลุ่มลูกค้า",
              "en": "Segment gap"
            },
            "shortLabel": {
              "th": "ตอบโจทย์ที่ยังขาด",
              "en": "Serve an unmet occasion"
            },
            "icon": "groups",
            "oneSentence": {
              "th": "มีบริการอยู่แล้ว แต่ยังอาจขาดสินค้า ราคา หรือเวลาให้บริการที่ลูกค้ากลุ่มหนึ่งต้องการ",
              "en": "Providers exist, but a customer group may lack a suitable product, price or service time."
            },
            "why": {
              "th": "จำนวนสาขาเท่ากันไม่ได้แปลว่าตอบโจทย์เดียวกัน ต้องรู้ทั้งกลุ่มลูกค้าและ offering ของแต่ละสาขา",
              "en": "Equal branch counts do not imply equivalent service. Understand customer occasions and actual branch offerings."
            },
            "howToUse": [
              {
                "th": "เลือกไข่แดงและตั้งสมมติฐานกลุ่มลูกค้าที่อยากตอบ",
                "en": "Select a Yolk and state the customer occasion you want to serve."
              },
              {
                "th": "ตรวจสินค้า ราคา เวลาเปิด และบริการของสาขาที่เกี่ยวข้อง",
                "en": "Verify relevant branches’ products, pricing, hours and services."
              },
              {
                "th": "คุยกับลูกค้าเพื่อยืนยันโจทย์ที่ยังขาดก่อนเสนอทำเล",
                "en": "Validate the unmet occasion with customers before proposing a location."
              }
            ],
            "illustrativeExample": {
              "industry": "grocery",
              "scenario": {
                "th": "สมมติย่านมีร้านหลายแห่ง แต่ยังไม่พบร้านที่เปิดช่วงคนงานเลิกกะดึก",
                "en": "Suppose an area has many stores, but none identified as serving a late-shift shopping occasion."
              },
              "action": {
                "th": "ตรวจตารางกะ เวลาเปิด และการซื้อจริง เพื่อดูว่ารูปแบบร้านของเราเหมาะไหม",
                "en": "Check shift schedules, opening hours and actual purchases to assess format fit."
              },
              "caveat": {
                "th": "คนงานในทะเบียนไม่ยืนยันว่ามีกะดึกหรือซื้อของหลังเลิกงาน",
                "en": "Registry worker counts do not establish late shifts or after-work purchasing."
              }
            },
            "availableP0Evidence": [
              {
                "th": "Demand และรูปแบบ/กลุ่มใบอนุญาตในต้นทางใช้ตั้งคำถามเบื้องต้น",
                "en": "Demand and source formats or company license families provide initial context."
              }
            ],
            "neededEvidence": [
              {
                "th": "กลุ่มลูกค้าและโอกาสใช้บริการจริง รวมทั้ง offering/ราคา/เวลาเปิดรายสาขา",
                "en": "Observed customer groups and occasions, plus branch-level offerings, prices and hours."
              }
            ],
            "phase": "P1",
            "tradeoff": {
              "th": "ช่องว่างอาจเล็กหรือไม่คุ้มต้นทุน ต้องตรวจขนาดโจทย์ ไม่ตี format ต่างกันว่าเป็น segment gap ทันที",
              "en": "The unmet occasion may be small or costly to serve. Different source formats alone do not establish a segment gap."
            },
            "question": {
              "th": "ใครยังไม่ได้รับบริการที่ใช่ และเขาต้องการอะไรเมื่อไร?",
              "en": "Who lacks the right service, and what do they need when?"
            }
          },
          {
            "id": "competitive_entry",
            "name": {
              "th": "ชิงลูกค้าจากคู่แข่ง",
              "en": "Competitive entry"
            },
            "shortLabel": {
              "th": "แข่งด้วยข้อได้เปรียบ",
              "en": "Enter with an advantage"
            },
            "icon": "swords",
            "oneSentence": {
              "th": "Demand เข้มข้นและมีคู่แข่งอยู่แล้ว เล็งพื้นที่ที่เรามีเหตุผลว่าจะตอบโจทย์ได้ดีกว่า",
              "en": "Demand is concentrated and competitors are present. Investigate where we may offer a relevant advantage."
            },
            "why": {
              "th": "การมีคู่แข่งเป็นหลักฐานว่ามีผู้ให้บริการอยู่ ไม่ใช่หลักฐานยอดขายของเขา ต้องตอบให้ได้ว่าลูกค้าจะเลือกเราเพราะอะไร",
              "en": "Competitor presence shows provision, not their sales. Establish why customers might choose us."
            },
            "howToUse": [
              {
                "th": "เลือกไข่แดงที่พบคู่แข่งใน submarket ที่เทียบกันได้",
                "en": "Select a Yolk with competitors in a comparable source submarket."
              },
              {
                "th": "ตรวจคู่แข่งจริง แล้วระบุข้อได้เปรียบที่แบรนด์เราอาจเสนอ",
                "en": "Verify competitors and state the advantage our brand may offer."
              },
              {
                "th": "ทดสอบเหตุผลที่ลูกค้าจะเปลี่ยน และต้นทุนการแข่งก่อนเล็ง",
                "en": "Test switching reasons and competitive costs before shortlisting."
              }
            ],
            "illustrativeExample": {
              "industry": "fuel",
              "scenario": {
                "th": "สมมติไข่แดงแห่งหนึ่งมีสถานีคู่แข่งอยู่แล้ว และแบรนด์เรามีสมมติฐานว่าจะเข้าถึงง่ายกว่า",
                "en": "Suppose a Yolk has competing fuel stations and our brand hypothesizes more convenient access."
              },
              "action": {
                "th": "สำรวจฝั่งถนน จุดกลับรถและทางเข้าสถานี เพื่อทดสอบข้อได้เปรียบนั้น",
                "en": "Survey road side, U-turns and station entrances to test that advantage."
              },
              "caveat": {
                "th": "พิกัดและจำนวนสถานีไม่ยืนยันทางเข้า offering หรือยอดขายจริง",
                "en": "Coordinates and station counts do not verify access, offerings or actual sales."
              }
            },
            "availableP0Evidence": [
              {
                "th": "Demand tier และคู่แข่งที่ระบุได้ใน scope เดียวกัน",
                "en": "Confirmed Demand tier and identified comparable competitors."
              }
            ],
            "neededEvidence": [
              {
                "th": "บริการ/เวลาเปิดจริง ข้อได้เปรียบแบรนด์ และหลักฐานการเปลี่ยนผู้ให้บริการ",
                "en": "Actual services/hours, brand advantage and evidence of customer switching."
              }
            ],
            "phase": "P0",
            "tradeoff": {
              "th": "อาจต้องใช้ต้นทุนสูงเพื่อชนะ และรายได้ใหม่อาจแย่งสาขาเราเดิม",
              "en": "Winning may be costly, and new revenue may displace our existing stores."
            },
            "question": {
              "th": "ลูกค้าจะเลือกเราแทนคู่แข่งเพราะอะไร?",
              "en": "Why would customers choose us over competitors?"
            }
          },
          {
            "id": "cluster_participation",
            "name": {
              "th": "เข้าร่วมย่านที่ดึงลูกค้า",
              "en": "Cluster participation"
            },
            "shortLabel": {
              "th": "ร่วมย่านที่ลูกค้ามา",
              "en": "Join a destination"
            },
            "icon": "store",
            "oneSentence": {
              "th": "ร่วมย่านที่ลูกค้ามาเปรียบเทียบหรือใช้หลายบริการในทริปเดียว",
              "en": "Join a district where customers compare options or use several services on one trip."
            },
            "why": {
              "th": "สาขาอยู่ใกล้กันอาจช่วยดึงลูกค้าร่วมกัน แต่จำนวนสาขาใน อปท. เดียวกันหรือกลุ่มหมุดบนแผนที่ยังไม่พิสูจน์ย่านแบบนี้",
              "en": "Nearby businesses may jointly attract visits, but area totals or map marker groups do not prove a physical destination cluster."
            },
            "howToUse": [
              {
                "th": "ค้นหาย่านที่มีสาขาใกล้กันจริงและเดินทางเชื่อมกันได้",
                "en": "Identify verified nearby branches with practical connections."
              },
              {
                "th": "ตรวจว่าลูกค้ามาเปรียบเทียบหรือใช้หลายบริการจริง",
                "en": "Check whether customers actually compare options or combine visits."
              },
              {
                "th": "เทียบค่าเช่า การแข่งขัน และประโยชน์จากย่านก่อนเลือกจุด",
                "en": "Compare rents, competition and shared destination benefits before choosing a site."
              }
            ],
            "illustrativeExample": {
              "industry": "nonbank",
              "scenario": {
                "th": "สมมติถนนสายหนึ่งมีสำนักงานผู้ให้บริการหลายรายอยู่ใกล้กัน",
                "en": "Suppose several financial service offices operate close together on one street."
              },
              "action": {
                "th": "ตรวจบริการจริงและสัมภาษณ์ว่าลูกค้าเข้ามาเปรียบเทียบหลายรายหรือไม่",
                "en": "Verify actual services and investigate whether customers visit to compare providers."
              },
              "caveat": {
                "th": "ใบอนุญาตบริษัทและหมุดใกล้กันไม่ยืนยันบริการรายสาขาหรือการเปรียบเทียบของลูกค้า",
                "en": "Company licenses and nearby points do not establish branch services or comparison behavior."
              }
            },
            "availableP0Evidence": [
              {
                "th": "พิกัดต้นทางใช้หาเบาะแสสำหรับสำรวจ ไม่ใช่ผลวัด shared visits",
                "en": "Source coordinates can guide investigation, but do not measure shared visits."
              }
            ],
            "neededEvidence": [
              {
                "th": "ย่านจริง การเชื่อมต่อ การเดินทางร่วมกันของลูกค้า และต้นทุนทำเล",
                "en": "Verified physical cluster, connections, shared customer visits and location costs."
              }
            ],
            "phase": "P1",
            "tradeoff": {
              "th": "ได้ประโยชน์จากย่าน แต่ค่าเช่าและการแข่งขันอาจสูงตาม",
              "en": "Destination benefits may come with higher rent and stronger competition."
            },
            "question": {
              "th": "ย่านนี้ช่วยดึงลูกค้าร่วมกันจริง หรือแค่อยู่ใกล้กัน?",
              "en": "Does the district attract shared visits, or are businesses merely nearby?"
            }
          },
          {
            "id": "complementary_location",
            "name": {
              "th": "เกาะกิจกรรมที่ส่งลูกค้าให้กัน",
              "en": "Complementary location"
            },
            "shortLabel": {
              "th": "ต่อยอดกิจกรรมใกล้กัน",
              "en": "Connect to an activity"
            },
            "icon": "layers",
            "oneSentence": {
              "th": "มองกิจกรรมที่เกี่ยวข้องกับแบรนด์ แล้วตรวจว่ามีทางส่งลูกค้ามาหาเราหรือไม่",
              "en": "Find an activity relevant to the brand, then verify whether it can generate useful visits."
            },
            "why": {
              "th": "แหล่งงานหรือที่พักช่วยตั้งสมมติฐานโอกาสใช้บริการ แต่ต้องมีจุดเชื่อม ทางเข้า และช่วงเวลาที่เข้ากับธุรกิจ",
              "en": "Workplaces or accommodation suggest service occasions, but practical exits, access and timing must fit the business."
            },
            "howToUse": [
              {
                "th": "เลือกกิจกรรมที่ profile รองรับไม่เกิน 3 ตัว เช่น คนงานหรือห้องพัก",
                "en": "Choose at most three supported activity metrics, such as workers or hotel rooms."
              },
              {
                "th": "ใช้ข้อมูลระดับพื้นที่หาทำเลน่าตรวจ แล้วหาตำแหน่งกิจกรรมจริง",
                "en": "Use area activity cues to find candidates, then verify actual anchor positions."
              },
              {
                "th": "ตรวจทางออก เวลาใช้บริการ และการซื้อจริงก่อนเลือกจุดใกล้กิจกรรม",
                "en": "Check exits, service times and purchases before selecting a nearby site."
              }
            ],
            "illustrativeExample": {
              "industry": "grocery",
              "scenario": {
                "th": "สมมติไข่แดงมีคนงานโรงงานที่รายงานสูง และร้านเราเน้นของกินประจำวัน",
                "en": "Suppose a Yolk has high reported factory employment and our format serves everyday food shopping."
              },
              "action": {
                "th": "หาโรงงานจริง ตรวจประตูออกและช่วงเลิกงาน เพื่อเลือกจุดที่เข้าถึงได้",
                "en": "Verify factories, exits and shift-end times to identify accessible sites."
              },
              "caveat": {
                "th": "คนงานสูงไม่ยืนยันลูกค้าเข้าร้าน โรงพยาบาล/โรงเรียนยังต้องเพิ่ม POI ที่ตรวจแล้วใน P1",
                "en": "High employment does not establish store visits. Verified hospital/school POIs still require P1 adapters."
              }
            },
            "availableP0Evidence": [
              {
                "th": "factory_count / factory_workers / hotel_rooms ที่ profile รองรับและมีค่าใช้ได้",
                "en": "Usable profile-supported factory_count, factory_workers and hotel_rooms metrics."
              },
              {
                "th": "midrank ของกิจกรรมในฐานเทียบที่เลือก เป็นเบาะแสระดับพื้นที่",
                "en": "Activity midranks in the selected benchmark provide area-level cues."
              }
            ],
            "neededEvidence": [
              {
                "th": "ตำแหน่งกิจกรรมจริง ประตูออก ช่วงเวลาและกระแสการซื้อ; hospital/school adapters อยู่ P1",
                "en": "Verified anchor positions, exits, timing and purchasing flows; hospital/school adapters are P1."
              }
            ],
            "phase": "P0",
            "tradeoff": {
              "th": "พึ่งกิจกรรมหนึ่งมากเกินไป อาจได้รับผลเมื่อกะงาน ฤดูกาลหรือผู้ประกอบการเปลี่ยน",
              "en": "Dependence on one activity can expose the site to shift, seasonal or operator changes."
            },
            "question": {
              "th": "กิจกรรมไหนส่งคนมาถึงเรา และเขาต้องการบริการเมื่อไร?",
              "en": "Which activity can bring people to us, and when would they need our service?"
            }
          },
          {
            "id": "route_capture",
            "name": {
              "th": "รับลูกค้าบนเส้นทาง",
              "en": "Route capture"
            },
            "shortLabel": {
              "th": "รับลูกค้าระหว่างทาง",
              "en": "Serve a journey"
            },
            "icon": "arrow_forward",
            "oneSentence": {
              "th": "เลือกจุดที่คนผ่าน เข้าถึงได้ และมีเหตุให้หยุดใช้บริการ",
              "en": "Find a point people pass, can access and have reason to stop at."
            },
            "why": {
              "th": "รถผ่านมากไม่เท่ากับลูกค้าหยุด ต้องดูทิศทาง ฝั่งถนน ทางเข้า และโอกาสใช้บริการร่วมกัน",
              "en": "Passing traffic does not equal customers who stop. Consider direction, road side, access and service occasion together."
            },
            "howToUse": [
              {
                "th": "ระบุเส้นทางและทิศทางเดินทางที่เกี่ยวข้องกับแบรนด์",
                "en": "Identify journeys and travel directions relevant to the brand."
              },
              {
                "th": "ตรวจทางเข้า จุดกลับรถและข้อจำกัดการเลี้ยวจริง",
                "en": "Verify entrances, U-turns and actual turn restrictions."
              },
              {
                "th": "วัดการผ่าน หยุด และใช้บริการตามช่วงเวลาก่อนเลือกจุด",
                "en": "Measure passing, stopping and service use by daypart before selecting a site."
              }
            ],
            "illustrativeExample": {
              "industry": "fuel",
              "scenario": {
                "th": "สมมติถนนหลักตัดบายพาสของหัวเมือง และทีมอยากศึกษาจุดเติมน้ำมันระหว่างทาง",
                "en": "Suppose a main highway meets a city bypass and the team wants to study refueling on that journey."
              },
              "action": {
                "th": "สำรวจทิศทางรถ ทางเข้า-ออกและจุดกลับรถ พร้อมนับรถที่หยุดตามช่วงเวลา",
                "en": "Survey travel directions, access and U-turns, and observe stops by daypart."
              },
              "caveat": {
                "th": "OSM ช่วยอธิบายโครงข่าย ไม่ยืนยันปริมาณรถ การหยุดหรือการซื้อจริง",
                "en": "OSM can describe the network, but does not establish traffic volumes, stops or purchases."
              }
            },
            "availableP0Evidence": [
              {
                "th": "Demand และพิกัดสาขาใช้เป็นบริบท ยังไม่ใช่ผลคัด route capture",
                "en": "Demand and branch coordinates provide context, not a route-capture qualification."
              }
            ],
            "neededEvidence": [
              {
                "th": "โครงข่ายมีทิศทาง ฝั่งถนน ข้อจำกัดเข้า-ออก และหลักฐานผ่าน/หยุด/ซื้อ",
                "en": "Directed road network, road side, access restrictions and passing/stopping/purchasing evidence."
              }
            ],
            "phase": "P2",
            "tradeoff": {
              "th": "ผิดฝั่งหรือเข้ายากอาจเสียโอกาส แม้รถผ่านมาก",
              "en": "An inconvenient side or difficult access can undermine a site despite heavy traffic."
            },
            "question": {
              "th": "คนที่ผ่านเข้าได้ หยุดได้ และมีเหตุให้ใช้บริการไหม?",
              "en": "Can passing users enter, stop and find a reason to use our service?"
            }
          },
          {
            "id": "network_infill",
            "name": {
              "th": "เติมเครือข่ายของเรา",
              "en": "Network infill"
            },
            "shortLabel": {
              "th": "เติมช่องว่างของเรา",
              "en": "Fill our network"
            },
            "icon": "shield",
            "oneSentence": {
              "th": "Demand เข้มข้น แต่เครือข่ายของเรายังเบาบางตามจุดเทียบ แม้มีคู่แข่งอยู่ได้",
              "en": "Demand is concentrated, but our network is relatively sparse under the chosen reference, even if competitors are present."
            },
            "why": {
              "th": "ดูพื้นที่ที่แบรนด์เราอาจยังเข้าถึงไม่พอ ต่างจากเติมช่องว่างตลาดซึ่งมอง Supply รวมทุกแบรนด์",
              "en": "Investigate where our brand may lack reach. Unlike Underserved market, this compares our network rather than total provision."
            },
            "howToUse": [
              {
                "th": "เลือกไข่แดงแล้วเทียบ Supply เราต่อฐานตลาด",
                "en": "Select a Yolk and compare our Supply with the market base."
              },
              {
                "th": "ตรวจสาขาเราใกล้เคียง เวลาเดินทางและกำลังให้บริการ",
                "en": "Check nearby own stores, travel time and service capacity."
              },
              {
                "th": "ประเมินยอดเพิ่มสุทธิและการแย่งยอดสาขาเราเดิมก่อนเล็ง",
                "en": "Assess incremental business and displacement of existing own stores before shortlisting."
              }
            ],
            "illustrativeExample": {
              "industry": "nonbank",
              "scenario": {
                "th": "สมมติพื้นที่มีประชากรผู้ใหญ่อายุ 20–64 เข้มข้น แต่สำนักงานแบรนด์เรามีน้อย",
                "en": "Suppose an area has concentrated adult population aged 20–64, but few offices of our brand."
              },
              "action": {
                "th": "ตรวจสำนักงานที่มีอยู่และบริการจริง เพื่อดูการเข้าถึงที่เครือข่ายเราอาจยังขาด",
                "en": "Verify existing offices and actual services to investigate possible gaps in our network reach."
              },
              "caveat": {
                "th": "ประชากรผู้ใหญ่ไม่ใช่จำนวนผู้ต้องการกู้ ผู้มีสิทธิ์ หรือหลักฐานความสามารถชำระ",
                "en": "Adult population is not borrower demand, eligibility or repayment capacity."
              }
            },
            "availableP0Evidence": [
              {
                "th": "Demand tier, ช่วงค่า Supply เรา และตัวหารที่มีค่าดิบใช้ได้",
                "en": "Confirmed Demand tier, own-Supply bounds and a usable raw denominator."
              }
            ],
            "neededEvidence": [
              {
                "th": "เวลาเดินทาง ความจุสาขาเดิม การเข้าถึง และผลแย่งยอด; performance calibration อยู่ P3",
                "en": "Travel time, existing capacity, access and displacement; performance calibration is P3."
              }
            ],
            "phase": "P0",
            "tradeoff": {
              "th": "เข้าถึงพื้นที่ใหม่ได้ แต่ต้องไม่สร้างสาขาที่เพียงแบ่งยอดเดิม",
              "en": "New reach should not merely split business already served by our network."
            },
            "question": {
              "th": "สาขาใหม่นี้เพิ่มการเข้าถึง หรือแค่ย้ายยอดของเรา?",
              "en": "Would this store add reach or merely relocate our business?"
            }
          },
          {
            "id": "future_entry",
            "name": {
              "th": "เปิดก่อนเพื่อได้พื้นที่ก่อน",
              "en": "Future entry"
            },
            "shortLabel": {
              "th": "จับตาตลาดอนาคต",
              "en": "Watch a future market"
            },
            "icon": "flag",
            "oneSentence": {
              "th": "ติดตามพื้นที่ที่มีเหตุการณ์ในอนาคตชัดเจน แล้วตัดสินใจตาม milestone",
              "en": "Track locations with credible future milestones and decide when those milestones occur."
            },
            "why": {
              "th": "ตลาดอาจยังไม่พร้อมวันนี้ ต้องแยก watchlist อนาคตจากไข่แดงปัจจุบันและผูกการตัดสินใจกับหลักฐานเวลา",
              "en": "A market may not be ready today. Keep the future watchlist separate from current Yolks and tie decisions to dated evidence."
            },
            "howToUse": [
              {
                "th": "ยืนยันโครงการ วันสำคัญและความคืบหน้าจากแหล่งที่ตรวจได้",
                "en": "Verify projects, milestones and progress from traceable sources."
              },
              {
                "th": "บันทึกสิทธิ์ทำเล ต้นทุนรอและเงื่อนไขไปต่อหรือหยุด",
                "en": "Record site options, holding costs and go/stop conditions."
              },
              {
                "th": "ติดตาม milestone แล้วสำรวจ Demand ใหม่ก่อนตัดสินใจเปิด",
                "en": "Follow milestones and reassess Demand before an opening decision."
              }
            ],
            "illustrativeExample": {
              "industry": "grocery",
              "scenario": {
                "th": "สมมติมีโครงการที่อยู่อาศัยใหม่พร้อมกำหนดส่งมอบที่ตรวจสอบได้",
                "en": "Suppose a new housing project has a verifiable handover schedule."
              },
              "action": {
                "th": "ตั้ง watchlist และทบทวนเมื่อเริ่มส่งมอบหรือมีผู้อยู่อาศัยจริง",
                "en": "Create a watchlist and review when handover or actual occupancy begins."
              },
              "caveat": {
                "th": "จำนวนยูนิตตามแผนไม่ยืนยันผู้อยู่อาศัยหรือยอดซื้อ ไม่เลื่อนพื้นที่เป็นไข่แดงปัจจุบันเอง",
                "en": "Planned units do not establish occupancy or purchases, and do not promote an area to a current Yolk."
              }
            },
            "availableP0Evidence": [
              {
                "th": "ข้อมูลปัจจุบันเป็น baseline เท่านั้น ยังไม่มีผลคัด Future entry",
                "en": "Current data provides a baseline only; no Future-entry qualification is produced."
              }
            ],
            "neededEvidence": [
              {
                "th": "milestone ที่ตรวจแล้ว สิทธิ์ทำเล ต้นทุนรอและ trigger หยุด/ไปต่อ",
                "en": "Verified milestones, site options, holding costs and go/stop triggers."
              }
            ],
            "phase": "P2",
            "tradeoff": {
              "th": "อาจได้พื้นที่ก่อน แต่ต้องรับต้นทุนรอและความเสี่ยงโครงการเลื่อน",
              "en": "Early access to a site can mean holding costs and delayed-project exposure."
            },
            "question": {
              "th": "หลักฐานอะไรทำให้พร้อมเปิด และเมื่อไรควรหยุดรอ?",
              "en": "What evidence would make the site ready, and when should we stop waiting?"
            }
          }
        ]
      },
      "projectionMustEqualAuthority": true,
      "interaction": {
        "registry": "prototype/data/strategy-guide.v1.9.3.json",
        "availableIds": [
          "underserved_market",
          "segment_gap",
          "competitive_entry",
          "cluster_participation",
          "complementary_location",
          "route_capture",
          "network_infill",
          "future_entry"
        ],
        "readOnly": true,
        "entryPoints": [
          "Clean icon cards on Expansion opportunities main page",
          "Illustration & example control adjacent to strategy choices",
          "Strategy labels/cards open that strategy detail"
        ],
        "view": "Accessible reader dialog with overview and eight details; concise definition, explanatory SVG diagram, three steps, hypothetical example, available and missing evidence, tradeoff and next question.",
        "noSelectionMutation": true,
        "dismiss": "Escape and explicit close; focus returns to the invoking control.",
        "diagram": "Generated by strategy ID. All example arrangements are illustrative, not measured geometry, traffic or actual business results.",
        "requiredBindings": [
          "id",
          "name.th/en",
          "shortLabel.th/en",
          "icon",
          "oneSentence.th/en",
          "why.th/en",
          "howToUse[3].th/en",
          "illustrativeExample.industry/scenario/action/caveat.th/en",
          "availableP0Evidence",
          "neededEvidence",
          "phase",
          "tradeoff.th/en",
          "question.th/en"
        ],
        "iconNamespace": "Current verified YolkMaterialSymbols subset, consistent with strategy-ui glyph mapping; captions stay visible if font fails.",
        "futureDiagram": "Future-market illustration prompts Demand validation; it does not depict a future site as a confirmed current Yolk."
      }
    },
    "mapSpace": {
      "schemaVersion": "yolk.map_space/1.9.4",
      "version": "1.9.4",
      "date": "2026-10-08",
      "status": "final_runtime_values_current_QA_bound",
      "scope": "Bounded presentation patch for more visible map space; no criteria, sources, strategy, artwork or analytical-color migration.",
      "extends": [
        "contracts/expansion-experience.v1.9.3.json",
        "contracts/workspace-map.v1.7.json"
      ],
      "retainedVersions": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "strategyEngine": "1.9.0",
        "interaction": "1.9.1",
        "brandIdentityUI": "1.9.2",
        "strategyGuide": "1.9.3",
        "DS": "0.9.7"
      },
      "invariants": {
        "nationalBenchmarkUnchanged": true,
        "demandMembershipUnchanged": true,
        "supplyTotalsUnchanged": true,
        "savedCriteriaAndDraftsPreserved": true,
        "samePersistentMap": true,
        "analyticalColorAndOpacityUnchanged": true,
        "originalBrandAssetsUnchanged": true,
        "guideRegistryUnchanged": true,
        "personalDisplayOnly": true
      },
      "layout": {
        "desktopBreakpointMinPx": 1100,
        "sidebar": {
          "collapsedWidthPx": 96,
          "expandedWidthPx": 248,
          "expandedMode": "overlay; shell and map host width unchanged",
          "captions": "short visible caption plus full accessible label",
          "toggle": "explicit toggle and Escape focus restoration"
        },
        "workPane": {
          "desktopWidthPx": 340,
          "mobile": "below persistent map",
          "headingPolicy": "Page and criteria headings occupy the full340px pane column before action controls; actual sampled title width304px."
        },
        "globalHeader": {
          "desktopHeightPx": 72,
          "officialIdentity": {
            "desktopOnlyWidthPx": 148,
            "mobileHeaderDuplicate": false,
            "mobileIdentityLocation": "Existing settings menu; original logo and proportions retained."
          }
        },
        "mapHeader": {
          "desktopToolbarMinHeightPx": 64,
          "mobileToolbarMinHeightPx": 60,
          "navigationRowMinHeightPx": 44,
          "mobileSupplyModeExtraRowMinHeightPx": 44,
          "auxiliaryControls": "Map options disclosure retains caption, party toggles, views and basemap"
        },
        "mapFooter": {
          "minHeightPx": 44,
          "desktopMaxHeightPx": 200,
          "mobileMaxHeightPx": 180,
          "units": "dataset metric unit and denominator remain visible; quantitative legends naturally wrap",
          "evidence": "44px info disclosure retains source counts, notes and coverage",
          "evidenceIcon": {
            "glyph": "help",
            "retainedSubset": "contracts/icons.v1.8.0.json",
            "fallback": "?",
            "meaning": "Source, coverage and notes disclosure; not a new DS glyph"
          }
        },
        "mobile": {
          "panelHeight": "clamp(420px,80svh,800px)",
          "allRoutesSamePanelHeight": true,
          "expandedOverrideRetained": "min(760px,calc(100svh - 88px - env(safe-area-inset-bottom,0px)))"
        }
      },
      "acceptance": [
        "More actual basemap canvas at desktop and narrow widths, measured in native browser against retained1.9.3 reference.",
        "Readable semantic icons and captions with keyboard focus and 44px interaction targets.",
        "Expanding/compacting navigation or map does not recreate map, mutate source/criteria, lose unsaved forms or emit team events.",
        "Map controls and disclosures remain operable in TH/EN and both themes; no page overflow.",
        "Tile load/retry/resize lifecycle remains intact."
      ],
      "verification": {
        "automated": {
          "receipt": "evidence/automated-v1.9.4.json",
          "suites": 32,
          "reportedPassedCases": 539
        },
        "native": {
          "receipt": "evidence/browser-v1.9.4/native-browser-review.json",
          "boundedChecks": 20,
          "actualSnapshotFiles": 4
        },
        "publication": "not_performed_by_contract"
      },
      "nativeMeasurements": {
        "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
        "receipt": "evidence/browser-v1.9.4/native-browser-review.json",
        "receiptSha256": "3d403aa9d78e2cb18d81178130a08487db7ac851ae52159bf9b69bc69105e888",
        "measurements": {
          "desktopBefore1440x900": {
            "sidebarWidth": 256,
            "poiMapWidth": 742,
            "poiMapHeight": 498.2578125,
            "reference": "Published1.9.3 country POI view measured in this review"
          },
          "desktopAfter1440x900": {
            "sidebarWidth": 96,
            "workPaneWidth": 340,
            "poiMapWidth": 1002,
            "poiMapHeight": 669,
            "mapHeaderHeight": 112,
            "mapFooterHeight": 45,
            "mapHeaderMeasurement": "toolbar64px + context48px; excludes1px panel border"
          },
          "mobileAfter390x844": {
            "poiMapWidth": 389,
            "poiMapHeight": 461.1953125,
            "panelHeight": 675.1953125
          },
          "widthIncreasePercent": 35.04043126684635
        },
        "scope": "Bounded Chrome native viewport review for compact navigation, map chrome, layout, controls and Thai/English/theme readability; source calculations and full physical-device matrix are separate.",
        "meaning": "These are actual recorded Chrome viewport measurements, distinct from CSS minimum/target values; not physical-device or complete brand/theme/language certification."
      }
    },
    "mobileFlow": {
      "schemaVersion": "yolk.mobile_map_flow/1.9.5",
      "version": "1.9.5",
      "date": "2026-10-08",
      "status": "final_runtime_values_current_QA_bound",
      "scope": "Mobile/tablet map stays in normal document flow so page scrolling reveals the work panel. Desktop map-space and analytical behavior are retained.",
      "extends": [
        "contracts/map-space.v1.9.4.json",
        "contracts/expansion-experience.v1.9.3.json",
        "contracts/workspace-map.v1.7.json"
      ],
      "retainedVersions": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "strategyEngine": "1.9.0",
        "interaction": "1.9.1",
        "brandIdentityUI": "1.9.2",
        "artwork": "1.9.2-owner2",
        "strategyGuide": "1.9.3",
        "desktopMapSpace": "1.9.4",
        "DS": "0.9.7"
      },
      "invariants": {
        "normalDocumentFlowAtNarrowWidths": true,
        "workPaneReachableByPageScroll": true,
        "desktopLayoutUnchanged": true,
        "samePersistentMap": true,
        "routeAndCriteriaPreserveCamera": true,
        "savedCriteriaAndDraftsPreserved": true,
        "nationalBenchmarkUnchanged": true,
        "demandMembershipUnchanged": true,
        "supplyTotalsUnchanged": true,
        "analyticalColorAndOpacityUnchanged": true,
        "originalBrandAssetsUnchanged": true,
        "guideRegistryUnchanged": true,
        "personalDisplayOnly": true
      },
      "layout": {
        "narrowBreakpointMaxPx": 1099,
        "ordinaryMapPosition": "relative; normal document flow, no ordinary sticky map",
        "ordinaryPanelHeight": "clamp(420px,80svh,800px)",
        "pageScroll": "Map then work panel; ordinary swipe and browser pinch operate on the page",
        "gestureModes": {
          "ordinaryNarrow": {
            "mapDragging": false,
            "mapTouchZoom": false,
            "mapScrollWheelZoom": false,
            "mapDoubleClickZoom": false,
            "touchAction": "pan-y pinch-zoom",
            "directClickAndControls": "Existing tap/click, drilldown and explicit zoom controls remain available"
          },
          "expandedNarrow": {
            "mapDragging": true,
            "mapTouchZoom": true,
            "mapScrollWheelZoom": true,
            "mapDoubleClickZoom": true,
            "touchAction": "Map exploration enabled deliberately by Expand"
          },
          "restore": "Collapse/Escape returns page-scroll mode; widening to desktop restores each original public handler.enabled() snapshot; repeat sync is idempotent"
        },
        "visibleHint": {
          "th": "ปัดขึ้นดูรายละเอียด · ขยายเพื่อสำรวจแผนที่",
          "en": "Swipe up for details · Expand to explore"
        },
        "desktop": {
          "breakpointMinPx": 1100,
          "baseline": "contracts/map-space.v1.9.4.json",
          "layoutUnchanged": true,
          "handlers": "Original handler defaults restored; not forcibly set to one universal value"
        },
        "explicitExpand": {
          "height": "min(760px,calc(100svh - 88px - env(safe-area-inset-bottom,0px)))",
          "mobileNavigationHidden": true,
          "close": "Collapse button or Escape with focus restoration"
        },
        "routeAndScroll": {
          "ordinaryUpdates": "No forced scroll on same-route rerenders, theme/display/criteria updates or normal map synchronization",
          "newDetailRoute": "At <=1099px, a new #place/:id or #poi/:id queues one instant scroll to the newly rendered detail heading",
          "asyncGuards": "Wait for loading/heading; reject stale hash, brand context, or widening to desktop",
          "focusAndData": "Do not recreate map, move camera, discard drafts/photos, Apply criteria or emit a team event"
        },
        "legendAndEvidence": "Existing metric legend, unit, denominator and source/coverage disclosure remain available; hint adds readable lines",
        "poiPopupScroll": {
          "ordinaryNarrow": "Internal popup scroll remains available; at its edge allow overscroll/page chaining",
          "desktopOrExpanded": "Retain contained popup scrolling"
        },
        "accessibleMapLabel": {
          "ordinaryNarrow": "TH/EN label describes page scrolling and explicit Expand",
          "expandedOrDesktop": "TH/EN label describes interactive map exploration"
        }
      },
      "acceptance": [
        "Scroll normally from the map to all work-panel controls on narrow screens without first expanding or hiding the map.",
        "Keep the ordinary map host outside route content; scroll/route/criteria changes retain its instance, camera, context and drafts.",
        "Explicit map expansion/collapse remains a personal display action with a reachable close control and focus restoration.",
        "Check actual TH/EN, both themes, 320/390/tablet/desktop viewports, overflow, controls and tile resize lifecycle.",
        "Desktop dimensions and map-space behavior remain unchanged from 1.9.4."
      ],
      "verification": {
        "automated": {
          "receipt": "evidence/automated-v1.9.5.json",
          "suites": 32,
          "reportedPassedCases": 545
        },
        "native": {
          "receipt": "evidence/browser-v1.9.5/native-browser-review.json",
          "boundedChecks": 14,
          "actualSnapshotFiles": 4
        },
        "publication": "not_performed_by_contract"
      },
      "nativeMeasurements": {
        "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
        "receipt": "evidence/browser-v1.9.5/native-browser-review.json",
        "receiptSha256": "5113d43ffa698e2ead9901001ff86e2a20f0ee52d8a2b6a47aa0126bffd969b0",
        "measurements": {
          "pageScrollProof": {
            "viewport": {
              "width": 390,
              "height": 844
            },
            "normalFlowInitial": {
              "mapTop": 85.796875,
              "panelHeight": 675.1953125,
              "source": "Root-observed current frozen runtime before page scroll"
            },
            "normalFlowAfterScroll": {
              "contentTop": -12.5078125,
              "interaction": "page-scroll",
              "mapBottom": -12.5078125,
              "mapTop": -687.703125,
              "overflow": false,
              "position": "relative",
              "scrollY": 773.5
            },
            "detailEntry": {
              "heading": "ช่องนนทรี",
              "headingTop": 23.78125,
              "hostLabel": "แผนที่ทำเล ปัดขึ้นดูรายละเอียด หรือกดขยายเพื่อสำรวจ",
              "interaction": "page-scroll",
              "mapBottom": -125.5078125,
              "overflow": false,
              "position": "relative",
              "scrollY": 886.5
            },
            "popupEdgeChaining": {
              "mapBottom": -238.203125,
              "overscroll": "auto",
              "popupScroll": 25.5,
              "scrollY": 844
            }
          },
          "historicalPublishedBaseline": {
            "version": "1.9.4",
            "sourceSha": "3f94a154a43a61fd400f918e017ca5f677343892",
            "initial": {
              "scrollY": 0,
              "panelPosition": "sticky",
              "mapTop": 85.796875,
              "contentTop": 760.9921875
            },
            "afterNativeScroll": {
              "scrollY": 844,
              "panelPosition": "sticky",
              "mapTop": 0,
              "mapBottom": 675.1953125,
              "contentTop": -83.0078125
            },
            "receiptSha256": "97dc9072b38f76111483bcb89129eeb3bc63fe83a75661b7b81f738c8179e60c",
            "meaning": "Published current map remains over content after page scroll; measured native Chrome viewport, not physical phone."
          },
          "narrow320": {
            "mode": "page-scroll",
            "overflow": false,
            "position": "relative",
            "width": 320
          },
          "tablet768": {
            "mode": "page-scroll",
            "overflow": false,
            "position": "relative",
            "width": 768
          },
          "desktop1440x900": {
            "dragClass": true,
            "height": 900,
            "hostLabel": "แผนที่โต้ตอบ เลื่อนและซูมเพื่อสำรวจทำเล",
            "interaction": "explore",
            "overflow": false,
            "width": 1440
          }
        },
        "scope": "Bounded native Chrome desktop and mobile/tablet viewport checks: ordinary page scroll, expanded map interaction, detail entry, popup edge chaining, unsaved branch draft and readable TH/dark + EN/light states. Mouse/wheel/native viewport evidence is not physical iPhone/Android touch certification or the full brand/language/theme/device matrix.",
        "meaning": "Actual recorded current geometry and scroll observations are distinct from CSS declarations and historical 1.9.4 dimensions. Physical-device/full-matrix certification is not implied."
      }
    },
    "mapReadability": {
      "schemaVersion": "yolk.map_readability/1.9.6",
      "version": "1.9.6",
      "date": "2026-10-08",
      "status": "final_runtime_values_current_QA_bound",
      "scope": "Boundary contrast underlays plus approved egg mnemonics: Demand one fried egg and Expansion opportunities three reused fried eggs. No data paint/model/source/mobile-flow/original-artwork migration.",
      "extends": [
        "contracts/map-boundary-appearance.v1.7.4.json",
        "contracts/expansion-experience.v1.9.3.json",
        "contracts/map-space.v1.9.4.json",
        "contracts/mobile-flow.v1.9.5.json",
        "contracts/icons.v1.8.0.json"
      ],
      "retainedVersions": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "strategyEngine": "1.9.0",
        "interaction": "1.9.1",
        "brandIdentityUI": "1.9.2",
        "artwork": "1.9.2-owner2",
        "strategyGuide": "1.9.3",
        "desktopMapSpace": "1.9.4",
        "mobileFlow": "1.9.5",
        "DS": "0.9.7"
      },
      "invariants": {
        "nationalBenchmarkUnchanged": true,
        "demandMembershipUnchanged": true,
        "supplyTotalsUnchanged": true,
        "savedCriteriaAndDraftsPreserved": true,
        "samePersistentMap": true,
        "cameraAndNavigationUnchanged": true,
        "analyticalFillColorAndOpacityUnchanged": true,
        "originalBrandAssetsUnchanged": true,
        "guideRegistryUnchanged": true,
        "parentChildHierarchyPreserved": true,
        "whiteOutlineAndYellowHoverPreserved": true,
        "mobileDocumentFlowPreserved": true,
        "readableCaptionsPreserved": true,
        "personalDisplayOnly": true
      },
      "boundaryContrast": {
        "implementationStatus": "runtime_confirmed",
        "kind": "Stroke-only paired neutral keyline beneath existing ordinary white boundary outlines",
        "panes": {
          "analyticalPaint": 400,
          "neutralKeyline": 410,
          "whiteForeground": 411,
          "yellowHover": 412,
          "markers": 600
        },
        "contrastPanesPointerInert": true,
        "neutralToken": {
          "name": "--ldm-map-marker-halo-dark",
          "hex": "#101318",
          "sameAcrossThemes": true,
          "meaning": "UI contrast support, not a data color or magnitude"
        },
        "whiteWidthsPx": {
          "fineAndCountryDistrict": 0.3,
          "selectedFine": 0.8,
          "province": 1.2,
          "ordinaryDrilldownDistrict": 1.05,
          "selectedDistrict": 1.1,
          "quietPoiDistrict": 0.65
        },
        "underlayWidth": "Existing ordinary white foreground width + 0.80px",
        "keylineFill": false,
        "keylineFillOpacity": 0,
        "geometryAndVisibility": "Pairs mirror only the currently visible source outlines; no new child mesh in quiet POI view, no geometric join or new affiliation",
        "dashStates": "Retain existing missing/extent/zero-state dash meaning",
        "dataPaint": "Analytical fills, original colors, Tier gradient, LUT41, opacity and source geometry unchanged; no SVG filter on ordinary analytical paint",
        "hover": "Retain original Yolk yellow #FFBC1F hover outline above ordinary paired strokes",
        "retiredAppearanceSupport": [
          "Prior parent-only halo attribute",
          "Generic ordinary white-stroke SVG drop-shadow"
        ],
        "legacySelector": "Retained historical map-hover stylesheet selector matches no currently emitted ordinary path; generic neutral keyline is the sole active contrast support",
        "supersedes": "Appearance support in retained expansion-experience1.9.3 only; no source, analytical, layout, camera, tooltip or navigational semantics changed"
      },
      "demandIdentity": {
        "semantic": "Demand uses the approved Yolk fried-egg symbol, not the generic place pin",
        "renderer": "YolkIcons.demandIcon() reuses existing YolkIcons.yolkIcon()",
        "approvedGraphic": "egg_alt glyph used by the O in YolkIcons.yolkWordmark()",
        "retainedFont": {
          "path": "prototype/assets/material-symbols-rounded-yolk-300-v1.8.0.woff2",
          "bytes": 6820,
          "sha256": "2998791392b42334dbff07b513d28b794462db6392885dfb0fd0968e90919187"
        },
        "newArtworkOrFont": false,
        "readableCaptionRequired": true,
        "affectedSurfaces": [
          "Sidebar/compact/mobile Demand navigation",
          "Criteria Demand tab/jump/three-step flow and Yolk badges",
          "Demand analysis heading/map-analysis controls",
          "Simple criteria Demand heading",
          "Decision level explainer/location verdict",
          "Criteria-map preview heading",
          "Retained location-map Demand title",
          "Strategy empty-state Explore Demand link",
          "Persistent Demand map heading"
        ],
        "implementationStatus": "runtime_confirmed",
        "eggCount": 1,
        "semanticHook": "data-yolk-semantic=\"demand\"",
        "classHook": "yl-icon yolk-demand-icon",
        "accent": "Existing --yl-yolk-accent token per theme",
        "ariaHidden": true,
        "geography": "Keep location_on for genuine coordinate/place actions",
        "graphicPolicy": "Reuse yolkIcon()/egg_alt exactly; no font/shape/axes/filter/background change; Yolk wordmark remains original"
      },
      "acceptance": [
        "Ordinary white boundaries remain recognizable over bright and dark basemaps/choropleths without changing their data paint or parent-child hierarchy.",
        "Clickable hover remains Yolk yellow and relevant point-view boundaries stay quiet.",
        "Demand uses one approved reused fried egg; Expansion opportunities uses three approved reused eggs with readable captions. Their mnemonics never represent measured values; geographic/coordinate controls and the eight named Strategy icons retain their meanings.",
        "No hidden analytical change, map remount, camera move, source mutation, criteria Apply or team event.",
        "Check actual TH/EN and both themes at narrow and desktop sizes; keep 1.9.5 page scrolling/expanded interaction and bounded accessibility."
      ],
      "verification": {
        "automated": {
          "receipt": "evidence/automated-v1.9.6.json",
          "suites": 34,
          "reportedPassedCases": 589
        },
        "native": {
          "receipt": "evidence/browser-v1.9.6/native-browser-review.json",
          "boundedChecks": 10,
          "actualSnapshotFiles": 6
        },
        "publication": "not_performed_by_contract"
      },
      "nativeEvidence": {
        "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
        "receipt": "evidence/browser-v1.9.6/native-browser-review.json",
        "receiptSha256": "1ed291cef83d13d04e91c5d7ca28a2b5d028ee2bdc5fc20851509423f1b26815",
        "measurements": {
          "countryCount": {
            "basis": "รวมที่ทราบแบรนด์\n5,606\nสาขา\nส่วนแบ่งสาขาเรา\n27.8%\nเรา ÷ (เรา + คู่แข่ง)",
            "demandGlyph": "egg_alt",
            "keylineCount": 1005,
            "keylineSample": [
              {
                "fill": "none",
                "pointer": "none",
                "stroke": "#101318",
                "width": "2"
              },
              {
                "fill": "none",
                "pointer": "none",
                "stroke": "#101318",
                "width": "2"
              },
              {
                "fill": "none",
                "pointer": "none",
                "stroke": "#101318",
                "width": "2"
              }
            ],
            "legendCount": 41,
            "metric": "count",
            "opportunityGlyphs": 0,
            "overflow": 0,
            "relation": [
              "total"
            ],
            "unknown": "ไม่ทราบแบรนด์ 3,130 สาขา · ไม่รวมในฐาน"
          }
        },
        "renderedChecks": [
          {
            "id": "desktop-th-light-default-count-source-breakdown",
            "passed": true,
            "details": "Default count/total; Bangchak direct country identified5606/own1561=27.8%, unknown3130 separately excluded; source totals are not POI count.",
            "status": "PASS"
          },
          {
            "id": "desktop-light-boundary-and-one-three-egg-icons",
            "passed": true,
            "details": "1005 paired source paths; unchanged white hierarchy supported by fill-free #101318 keylines; Demand original one egg and Opportunity three distinct original eggs visibly reviewed.",
            "status": "PASS"
          },
          {
            "id": "supply-fixed-share-and-source-treemap",
            "passed": true,
            "observation": "Fixed 0/25/50/75/100% legend; Bangchak country own1,561 of5,606 identified=27.8%;3,130 unknown explicitly excluded. Native Prachinburi hover own14 of55=25.5%,14unknown excluded; exactlyone tooltip,5rectangle compact treemap with readable name/count/share. Tooltip top208,bottom699.781 fits map.",
            "status": "PASS"
          },
          {
            "id": "province-parent-and-theme-language",
            "passed": true,
            "observation": "Bangkok source parent identified591, own184=31.1%,82unknown. District Bang Kapi hover independently14identified/5own=35.7%,2unknown. Legend anchors unchanged across light/dark; boundary halo#101318; no horizontal overflow.",
            "status": "PASS"
          },
          {
            "id": "poi-context-source-count-separation",
            "passed": true,
            "observation": "Bangkok POI view retains direct source591identified/184own/31.1%; grouped pins remain coordinate records; fine child mesh removed; source treemap does not use marker count.",
            "status": "PASS"
          },
          {
            "id": "nonbank-scoped-review-all-operators",
            "passed": true,
            "observation": "Native Non-bank potential_retail_branch_service country treemap observed17,812known records, own8,738,1,210other legal brands in grouped disclosure. Exact percent withheld pending scope/license review;10own-brandchoices do not cap competitor denominator. Mainchart<=10cells, initially<=40brandrows, no overflow.",
            "status": "PASS"
          },
          {
            "id": "grocery-format-country-and-mobile-treemap",
            "passed": true,
            "observation": "Grocery C_STORE countryidentified26,337,7-Eleven16,488=62.6%; previouslyBangkok4,982/3,857=77.4%. Narrow390x844 ownlogo/count/share and competitor rows readable, overflow0. Maprelative normalflow; nativepagewheel reaches treemap belowmap.4nativeOSMtilescomplete256px.",
            "status": "PASS"
          },
          {
            "id": "mobile-demand-original-icons-normal-flow",
            "passed": true,
            "observation": "Native390x844 Demandglyphtext egg_alt uses Yolk MaterialSymbols; Opportunitywrapper3children. Maprelative675.195px panel scrolls out ofview, Demandcards and shortlistbuttons reachable, overflow0.",
            "status": "PASS"
          },
          {
            "id": "mobile-expand-collapse-restores-flow",
            "passed": true,
            "observation": "Expand to756px then collapse to675.195px, country navigation retained, maprelative, no overflow.",
            "status": "PASS"
          },
          {
            "id": "native-console-errors",
            "passed": true,
            "observation": "NativeChrome captured error-level logs empty in reviewed final-runtime local session.",
            "status": "PASS"
          }
        ],
        "scope": "Current frozen 1.9.6 bounded native review of paired map outlines, one-egg Demand/three-egg Opportunity, Supply count/share and source-brand treemaps in the recorded desktop/mobile/theme/language states. One actual boundary hover; physical devices/full matrix remain unverified.",
        "meaning": "Actual recorded current boundary/icon evidence, distinct from CSS declarations and package parity. Not physical-device/full-matrix or universal contrast/accessibility certification."
      },
      "opportunityIdentity": {
        "implementationStatus": "runtime_confirmed",
        "semantic": "Expansion opportunities uses three approved reused fried-egg marks; Demand uses one",
        "renderer": "YolkIcons.opportunityIcon()",
        "eggCount": 3,
        "layout": "Two eggs above, one below; outer 1em slot, three unchanged glyphs at uniform 0.64em; top-left, top-right, bottom at left18%",
        "semanticHook": "data-yolk-semantic=\"opportunity\"",
        "classHook": "yl-icon yolk-opportunity-icon",
        "accent": "Existing --yl-yolk-accent token per theme",
        "approvedGraphic": "Three unchanged yolkIcon()/egg_alt glyph instances from the same retained font as Demand",
        "newArtworkOrFont": false,
        "readableCaptionRequired": true,
        "ariaHidden": true,
        "affectedSurfaces": [
          "Canonical #market and retained #strategy sidebar/compact/mobile/menu navigation",
          "Three-step flow opportunity control",
          "Criteria Strategy tab/heading and Explore Strategies link",
          "Opportunity page heading, location Strategy heading and Choose Strategies link",
          "Persistent opportunity map heading"
        ],
        "retainedOtherIcons": "Eight named Strategy icons and geographic compass retain their existing meanings",
        "meaningBoundary": "Three eggs are a mnemonic for a queue of opportunities, not a data count, eligibility threshold, measured opportunity or new strategy-selection rule"
      }
    },
    "supplyInventoryDisplay": {
      "schemaVersion": "yolk.supply_inventory_display/1.9.9",
      "version": "1.9.9",
      "date": "2026-10-09",
      "status": "final_runtime_values_current_QA_bound",
      "scope": "Retained direct-source count/share and brand composition, with current v1.9.9 source bindings and fresh QA pending. All-point rendering never replaces native administrative inventory. Weighted Supply uncertainty and decision-flow corrections are separately declared; no global ranking-invariance claim is made.",
      "coreSemantics": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "engine": "1.9.0",
        "industryIds": [
          "fuel",
          "grocery",
          "nonbank"
        ],
        "sourceMetricCatalogSize": 25,
        "sourceReportingUUIDs": 7954,
        "newDerivedDisplayMetricsNotNewSourceDatasets": true
      },
      "invariants": {
        "demandTierAndEligibleIdsUnchanged": true,
        "sourceVectorsAndPOICoverageSeparate": true,
        "sameMapCameraAndNavigation": true,
        "noTeamEventOrSourceMutation": true,
        "unknownNotZeroOrCompetitor": true,
        "originalLogosFontsAndLUTsUnchanged": true,
        "parentClickChildPaintHierarchyPreserved": true,
        "singleBoundaryHoverOwner": true,
        "numericalSupplyPresetsUnchanged": true,
        "displayDoesNotMutateAnalyticalInputs": true
      },
      "metrics": {
        "identifiedTotal": {
          "viewMetric": "count",
          "relation": "total",
          "formula": "own + identified competitors",
          "unit": "source branch records",
          "unknownExcluded": true,
          "unclassifiedScopeEvidence": "Not silently classified; retain source count separately and comparison bounds/review",
          "intervalPolicy": "Retain current own/competitor count bounds. No midpoint or upper bound is presented as an exact measured count."
        },
        "ownBranchShare": {
          "viewMetric": "share",
          "relation": "own_fixed_for_this_metric",
          "labelMeaning": "Our share of identified source branch inventory; not sales market share, capacity, customers or verified operating branches",
          "formula": "100 * own / (own + identified competitors)",
          "formulaAST": {
            "op": "multiply",
            "args": [
              100,
              {
                "op": "divide",
                "numerator": {
                  "field": "own"
                },
                "denominator": {
                  "op": "add",
                  "args": [
                    {
                      "field": "own"
                    },
                    {
                      "field": "competitor"
                    }
                  ]
                }
              }
            ]
          },
          "unit": "% of identified branch inventory",
          "denominator": "Own + identified competitor branch records within the same selected industry/format/license scope, geography and source basis",
          "unknownExcluded": true,
          "exactZeroDenominator": "Count0 is known; share is null/undefined_ratio, not0%. The renderer uses an explicit empty-basis state.",
          "validZeroPercent": "Own0 and competitor>0 means a measured0% proxy",
          "validHundredPercent": "Own>0 and competitor0 means100% of the identified inventory only",
          "intervalLower": "100*ownLower/(ownLower+competitorUpper) when the denominator is positive",
          "intervalUpper": "100*ownUpper/(ownUpper+competitorLower) when the denominator is positive",
          "uncertainty": "Scope/licence/allocation/reconciliation uncertainty stays review; expose conservative bounds with zero-denominator edge handling and never paint as an exact ratio. boundsKnown=false retains review0..100, not a guessed point.",
          "aggregateRule": "Ratio from one compatible raw parent vector; never average local ratios, percentiles or sum ambiguous fine display links."
        }
      },
      "mapPalette": {
        "scaleId": "li.market_share",
        "semanticReuse": "Renamed outlet-inventory proxy allowed by Location Profile evidence boundary; do not inherit the sales-share claim",
        "source": "reference/lds-0.9.7/location-intelligence-0.9.7.json",
        "sourceSha256": "2940c5aac3eef1242e501492b5315048c6b5f138496e8139cc116bfbba945e57",
        "profileDocument": "reference/lds-0.9.7/Location-Intelligence-Profile-for-LDS-v0.9.7.md",
        "profileDocumentSha256": "5d4856041709735d3a04d4a510a88b551df86c211fdcab8a0707e8fe7c9efc3b",
        "scaleVersion": "e18af290eee81d42e63269c261628f0fa108fcd48e5cbff02b407af95a712e51",
        "anchors": [
          "#F0F4F9",
          "#9BBBA6",
          "#4B8FD8"
        ],
        "lut": [
          "#F0F4F9",
          "#ECF1F5",
          "#E7EEF0",
          "#E3EBEC",
          "#DFE8E8",
          "#DAE6E4",
          "#D6E3E0",
          "#D2E0DB",
          "#CEDDD7",
          "#C9DAD3",
          "#C5D7CF",
          "#C1D4CB",
          "#BDD2C7",
          "#B8CFC2",
          "#B4CCBE",
          "#B0C9BA",
          "#ACC6B6",
          "#A8C3B2",
          "#A3C1AE",
          "#9FBEAA",
          "#9BBBA6",
          "#97B9A9",
          "#93B7AC",
          "#8FB5AF",
          "#8BB3B2",
          "#87B1B4",
          "#83AFB7",
          "#7FADBA",
          "#7BABBC",
          "#78A9BF",
          "#74A6C1",
          "#70A4C4",
          "#6CA2C6",
          "#68A0C9",
          "#649DCB",
          "#609BCD",
          "#5B99CF",
          "#5796D2",
          "#5394D4",
          "#4F92D6",
          "#4B8FD8"
        ],
        "samples": 41,
        "domain": [
          0,
          100
        ],
        "classification": "41 equal-width percent bins",
        "classIndex": "min(40,floor(value*41/100)) for valid exact0..100 percentages",
        "intervalEdges": "Lower inclusive, upper exclusive;100 inclusive in the final bin",
        "themePolicy": "Same exact original light LUT/HEX/direction in both themes; full analytical opacity",
        "knownZeroCue": "Class0 with an explicit measured-zero cue; undefined/missing/review remain neutral",
        "existingCountScale": "Original count41 LUT and fixed national same-grain quantile boundaries retained",
        "countReference": "contracts/map-lut41.v1.7.3.json"
      },
      "sourceAPI": {
        "rendererAPI": "YolkMapAnalysis.brandBreakdown(scope,options)",
        "workspaceAPI": "YolkWorkspaceMap.supplyBreakdown()",
        "scopeFields": [
          "level",
          "provinceCode",
          "districtId",
          "areaId"
        ],
        "levelAliases": {
          "fine": "location"
        },
        "requiredOptions": [
          "nativeData",
          "fineData",
          "industryId",
          "ownBrandId",
          "supplyScope"
        ],
        "contextOptions": [
          "scopeIncludes",
          "ownScopeAvailable",
          "fineRows",
          "supplyForRow"
        ],
        "geographyAdapters": {
          "country": "nativeData.countryDimensionCounts only when native coverage.missing===0",
          "province": "Single nativeData.provinceRows vector selected by province code via provinceContextsById",
          "district": "Single nativeData.rows vector selected by exact native districtId",
          "location": "Single fineData.rows vector selected by exact reporting UUID; preserve runtime fine supply bounds"
        },
        "returns": {
          "rows": [
            "brandId",
            "name",
            "count",
            "party",
            "sharePercent"
          ],
          "totals": [
            "own",
            "competitor",
            "identifiedTotal",
            "unknown",
            "unclassified",
            "excluded",
            "sourceTotal"
          ],
          "ratio": [
            "sharePercent",
            "shareLower",
            "shareUpper"
          ],
          "evidence": [
            "state",
            "status",
            "reason",
            "coverage",
            "grain",
            "sourceRows",
            "sourceRowId",
            "sourceKey",
            "sourceMetadata",
            "sourceContext"
          ]
        },
        "indexing": "Source-object indexes/cache do not rewrite native geography, counts or affiliation"
      },
      "coverage": {
        "complete": "Identified comparison counts have exact compatible source/scope/assignment evidence; does not certify complete all-provider inventory or live operations",
        "allProvidersComplete": "Separate flag requiring no unknown or unclassified counts plus exact source comparison counts; not proof that the source has captured every operating branch",
        "unknown": "Unidentified U remains separate and is excluded from O+C and all share denominators",
        "unclassified": "Non-bank licence/scope evidence not yet resolved; keep separate and conservative comparison bounds",
        "excluded": "Exact known source dimensions outside selected format/license scope; not missing evidence",
        "missingPolicy": "Missing/failed/invalid/suppressed/out-of-scope/not-yet sources do not become0 or stale exact shares",
        "treemapInReview": "Observed source count rectangles may remain with visible incomplete/review caption; percentages withheld. No residual, upper-bound allocation or inferred branch is plotted."
      },
      "industryEvidence": {
        "fuel": {
          "dimension": "source brand key",
          "nativeAllInventory": 8736,
          "nativeUnknownU": 3130,
          "nativeIdentifiedBeforeNarrowerScope": 5606,
          "limit": "UNKNOWN is not unbranded or a competitor; merged source inventory does not certify current fuel types or operations"
        },
        "grocery": {
          "dimension": "format:trade-brand key; filter exact selected format first",
          "nativeAllCategoryInventory": 27608,
          "limit": "PHARMACY and other formats are excluded when out of selected scope; do not infer current format/offerings from brand identity. Preserve known reconciliation bounds."
        },
        "nonbank": {
          "dimension": "Exact legal-company ID and source-supported licence scope; office_context is direct office inventory",
          "nativeAllOfficeInventory": 23524,
          "legalCompanyDimensions": 1233,
          "limit": "Top10 selectable identities do not truncate competitors. Licence family is potential company scope, not branch-level offering; preserve assignment residual and licence uncertainty."
        },
        "sourceFiles": [
          "prototype/data/real/fuel-district-supply.json",
          "prototype/data/real/grocery-district-supply.json",
          "prototype/data/real/nonbank-district-supply.json",
          "prototype/data/real/fuel-supply.json",
          "prototype/data/real/grocery-supply.json",
          "prototype/data/real/nonbank-supply.json"
        ],
        "commonLimits": "Source inventory, source time and display geometry remain evidence-specific; coordinates and team POI edits never substitute for native area totals."
      },
      "treemap": {
        "runtimeFiles": [
          "prototype/supply-treemap.js",
          "prototype/supply-treemap.css"
        ],
        "renderer": "YolkSupplyTreemap",
        "areaMeaning": "Each rectangle area represents its observed source branch-count fraction; not sales/physical capacity or uncertain upper-bound share",
        "panelMaximumRectangles": 10,
        "panelGrouping": "Keep positive own row +8 largest identified competitors + Other when needed; Other is an exact sum with inspectable named members",
        "hoverMaximumRectangles": 5,
        "hoverGrouping": "Compact count composition with exact Other aggregation and own row retained when positive",
        "brandListInitialRows": 40,
        "brandListMoreStep": 40,
        "brandListCompleteness": "A readable nonspatial list explicitly reveals additional40-row batches; no silent record truncation",
        "identity": "Original verified brand graphic and readable name where supported; theme fallback is retained, never crop/recolor/frame",
        "palette": "Exact retained landometer-series-10-v8 separate light/dark categorical soft-fill/ink token values. Frozen source-logo-hue→family mapping in YolkSupplyTreemap.brandSeries; 37 identity rows/35 original artwork SHA bindings, explicit COSMO/PURE and unknown-ID hash fallback; monochrome and exact Other neutral09. No synthesized HEX or logo recolor.",
        "scopeOwner": "Panel follows current navigation; country hover uses province vector, province hover uses district vector, district hover uses fine reporting row. Child paint is not a parent total.",
        "accessibility": "Decorative rectangle layer aria-hidden; named numeric nonspatial list and disclosure remain accessible. Missing/empty/review/loading have explicit captions.",
        "interaction": "Read-only composition and More disclosure; no criterion Apply, source write, team event or forced navigation",
        "UIRuntimeStatus": "Frozen1.9.9 colors/number display with actual current bounded automated/native bindings. One actual hover is not all-boundary coverage.",
        "colorAuthority": "contracts/visual-refinement.v1.9.9.json",
        "colorMapping": {
          "path": "prototype/supply-treemap.js",
          "export": "YolkSupplyTreemap.brandSeries",
          "sha256": "7d6fe31998eeae1be4d3f2c7e14c35183395a78e85d976d35b53f9fb930f608c",
          "brandBindings": 37,
          "verifiedArtworkBindings": 35,
          "themePolicy": "Use exact original LDS separate light/dark categorical soft-fill/ink CSS token values (--ldm-series-NN-fill-light/dark); identity family stable across themes. These approved categorical theme tables are separate from unchanged quantitative/Story/Location data HEX."
        }
      },
      "implementationSteps": [
        "Read the pinned source dimensions/scope adapters and test exact0/100/undefined ratios and unknown coverage first.",
        "Implement the pure direct-vector count/share API with source rows, bounds and explicit flags. Preserve source inputs and numerical presets; honor v1.9.9 weighted unknown-supply handling rather than asserting unchanged rankings.",
        "Add fixed0..10041-LUT share alongside existing count/rate maps; totalcount uses relationtotal.",
        "Reuse one treemap renderer in panel and the single boundary-hover owner, with compact/full limits and named list disclosure.",
        "Test current raw-source/format/licence/geography/interval cases and all new renderer cases; inspect actual TH/EN narrow/desktop and theme contrast.",
        "Bind fresh current suites/native screenshots/runtime SHA, update the full document, then allow release owner to reseal/source/provider/live/package."
      ],
      "productionPlan": {
        "readOnlyAdapter": "Reproduce the same source/scope/preset/version keyed derived projection in the production analysis service; preserve tenant-authorized source access. The browser API is not proof of a shared server endpoint.",
        "outputContract": "Source metadata, direct grain/UUID, counts/ratios/bounds, coverage and named brand list must travel together. Cache by source hash/industry/own brand/scope/geography; reject stale context work.",
        "laterEvidence": "Sales share, capacity, traffic, customer capture and branch-level offerings need later verified evidence and independent metric names."
      },
      "acceptance": [
        "Native parent vectors supply parent totals/distribution; no LAO crosswalk or POI-marker rollup.",
        "Unknown U and unresolved licence evidence never silently become own/competitor exact counts.",
        "O+C count0 stays known while0/0 share remains undefined; valid0/100 ratios retain percentage domain.",
        "Exact fixed-domain41 share LUT matches pinned LDS bytes in both themes; no percentile stretch/opacity or color transformation.",
        "Every plotted rectangle equals observed count fraction; Other preserves total and own remains inspectable.",
        "Compact/full/list limits are explicit and actual labels remain readable; one actual hover is bounded evidence, not all-boundary coverage.",
        "The inventory display does not mutate Demand thresholds, numerical Supply presets, saved criteria, source vectors, map scope or team records. Weighted-model and captured-decision corrections may change evaluations and are governed separately."
      ],
      "verification": {
        "requiredSuites": [
          "scripts/check-supply-market-share.cjs",
          "scripts/check-supply-treemap.cjs"
        ],
        "relatedSuites": [
          "scripts/check-map-analysis.cjs",
          "scripts/check-map-hover.cjs",
          "scripts/check-map-clarity.cjs",
          "scripts/check-workspace-map.cjs"
        ],
        "integrated": {
          "status": "PASS",
          "receipt": "evidence/automated-v1.9.9.json",
          "receiptSha256": "752140f94bdcf4b7bffb9726ca22a5dc848204322f8356764e91eac49760b448",
          "suites": 40,
          "reportedPassedCases": 663,
          "requiredSuiteResults": [
            {
              "suite": "scripts/check-supply-market-share.cjs",
              "testedAt": "2026-10-09T02:26:56.180721+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "b50c020b75c4be4105b86e60220f9e2788fc0fb75f6a55b197b48900dde5861b",
              "outputSha256": "5b0f4a5493d2fd99338999c996642a3d01394a2a053c9dab09f108b21be2cc23",
              "passLines": 8,
              "checks": 8,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-supply-market-share.log"
            },
            {
              "suite": "scripts/check-supply-treemap.cjs",
              "testedAt": "2026-10-09T02:26:57.160341+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "32a6af61c64e8724dfa0cabbaaf11c39e2409b056f2b1ba541fd0709030b9e09",
              "outputSha256": "358f50ba133725a2d6bc4191a36686e44a1ae4856368621aa5fdeb11e8c718da",
              "passLines": 24,
              "checks": 24,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-supply-treemap.log"
            }
          ]
        },
        "native": {
          "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
          "receipt": "evidence/browser-v1.9.9/native-browser-review.json",
          "receiptSha256": "a40c879dc25a24d85f3f84f44ad3955c2cfa2cd2d605e3891abf9ee88720eaac",
          "review": {
            "passed": true,
            "checkIds": [
              "hover_escape",
              "dense_poi_search",
              "nonbank_points_performance"
            ]
          },
          "actualSnapshotFiles": 8,
          "scope": "Bounded actual local native review: main workflows across Fuel/Grocery/Nonbank, draft retention, two-tab cross-context writes, captured draft detail, dense-hit search/filter/exact POI, Escape hover, Expand tiles, evidence queues, TH/EN light/dark sampled states. Not full matrix/physical hardware/provider certification."
        },
        "publication": "not_performed_by_contract"
      },
      "nativeEvidence": {
        "review": {
          "passed": true,
          "checkIds": [
            "hover_escape",
            "dense_poi_search",
            "nonbank_points_performance"
          ]
        },
        "renderedChecks": [
          {
            "id": "hover_escape",
            "passed": true,
            "details": "Bangkok keyboard boundary tooltip shows 591 identified branches /31.1% own share; Escape removes tooltip (1→0), focus remains boundary and route #supply.",
            "status": "PASS"
          },
          {
            "id": "dense_poi_search",
            "passed": true,
            "details": "26,336 Grocery points; native keyboard hit opens6,852 screen-near records at current camera; Thai search รัชดา gives65, brand filter gives shown subset;12 rows maximum, query/focus retained. No source count changed.",
            "status": "PASS"
          },
          {
            "id": "nonbank_points_performance",
            "passed": true,
            "details": "Finalruntime nativeChrome1440×900:13564filteredcoordinates represented/painted individually,3sprites; recorded frame51.1ms;24/24basemaptiles complete; no horizontal overflow. Not FPS/wholeinteraction/deviceSLA.",
            "status": "PASS"
          }
        ],
        "reviewedRegistries": [
          {
            "path": "prototype/supply-treemap.js",
            "sha256": "7d6fe31998eeae1be4d3f2c7e14c35183395a78e85d976d35b53f9fb930f608c"
          }
        ],
        "scope": "Actual bounded source count/share/brand-color composition checks; no all-brand/all-boundary/physical-device or production certificate."
      },
      "semanticChangeBoundary": {
        "protected": "Demand definitions and eligibility thresholds, numerical industry/brand presets, source dataset bytes, original artwork and exact LDS values are retained.",
        "corrected": "The v1.9.9 weighted model handles missing/suppressed/invalid Supply and unknown-supply bounds explicitly. Captured decision criteria and incomplete/unsupported Strategy queues also change behavior; analytical outputs are not globally asserted unchanged.",
        "authority": "contracts/red-team-remediation.v1.9.9.json"
      },
      "runtimeSources": [
        {
          "path": "prototype/supply-treemap.js",
          "bytes": 22806,
          "sha256": "7d6fe31998eeae1be4d3f2c7e14c35183395a78e85d976d35b53f9fb930f608c"
        },
        {
          "path": "prototype/supply-treemap.css",
          "bytes": 8019,
          "sha256": "098a9af81f52fb1f3888f5d7c0ab66bf3f8bdc6d823a7851e295d8636996726e"
        },
        {
          "path": "prototype/map-hover.js",
          "bytes": 10421,
          "sha256": "cb1578b82452cd33007a32dd7394bf02d074484a35843a95b7199a23c5ab910f"
        }
      ]
    },
    "visualRefinement": {
      "schemaVersion": "yolk.visual_refinement/1.9.9",
      "version": "1.9.9",
      "date": "2026-10-09",
      "status": "final_runtime_values_current_QA_bound",
      "scope": "Retained v1.9.7 visual/display rules, exact DS mappings and renderer dimensions, with current runtime source binding and fresh v1.9.9 QA pending. Branch-point interactions are specified by contracts/branch-points.v1.9.9.json; analytical corrections are separately declared.",
      "extends": [
        "contracts/supply-inventory.v1.9.6.json",
        "contracts/map-readability.v1.9.6.json",
        "contracts/mobile-flow.v1.9.5.json",
        "contracts/map-space.v1.9.4.json",
        "contracts/icons.v1.8.0.json"
      ],
      "retainedVersions": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "engine": "1.9.0",
        "strategies": "1.9.0",
        "interaction": "1.9.1",
        "brandArtwork": "1.9.2-owner2",
        "strategyGuide": "1.9.3",
        "desktopMapSpace": "1.9.4",
        "mobileFlow": "1.9.5",
        "boundaryAndEggIdentity": "1.9.6",
        "DS": "0.9.7"
      },
      "invariants": {
        "nationalBenchmarkUnchanged": true,
        "demandTierAndEligibleIdsUnchanged": true,
        "sourceCountsAndCoverageUnchanged": true,
        "savedCriteriaAndDraftsPreserved": true,
        "samePersistentMap": true,
        "ordinaryRouteAndDisplayUpdatesPreserveCamera": true,
        "analyticalFillAndOpacityUnchanged": true,
        "originalBrandArtworkBytesUnchanged": true,
        "mobileDocumentFlowPreserved": true,
        "noSourceWriteOrTeamEvent": true,
        "readableCaptionAndFocusPreserved": true,
        "cameraWithinPermittedEnvelopePreserved": true,
        "geographicCameraConstraintExplicit": true,
        "numericalSupplyPresetsUnchanged": true,
        "displayDoesNotMutateAnalyticalInputs": true
      },
      "treemapBrandColors": {
        "status": "runtime_confirmed",
        "policy": "Use exact approved categorical DS hue families near each verified original logo primary color; stable identity mapping. Explicit stable hash fallback for absent/unresolved identity; neutral09 for monochrome and exact Other. Original artwork and quantitative color/size meanings stay unchanged.",
        "sourceContract": "contracts/supply-inventory.v1.9.9.json",
        "mappingRegistry": "prototype/supply-treemap.js",
        "originalLogoBytesUnchanged": true,
        "mappingNotOfficialBrandColorClaim": true,
        "exactDSValuesOnly": true,
        "themePolicy": "Use exact original LDS separate light/dark categorical soft-fill/ink CSS token values (--ldm-series-NN-fill-light/dark); identity family stable across themes. These approved categorical theme tables are separate from unchanged quantitative/Story/Location data HEX.",
        "mappingRegistrySha256": "7d6fe31998eeae1be4d3f2c7e14c35183395a78e85d976d35b53f9fb930f608c",
        "mappingExport": "YolkSupplyTreemap.brandSeries",
        "paletteId": "landometer-series-10-v8",
        "mappingMethod": "Source-backed manual review of original logo primary hue → closest suitable existing DS categorical family; basis and original asset SHA recorded per identity. No numerical nearest-color guarantee or official corporate-color claim.",
        "bindings": {
          "cosmo": {
            "seriesIndex": 2,
            "basis": "Stable ID fallback: exact COSMO identity remains unresolved; no borrowed logo colour.",
            "assetSha256": null
          },
          "pure": {
            "seriesIndex": 7,
            "basis": "Stable ID fallback: historical PURE versus current Purethai identity needs reconciliation.",
            "assetSha256": null
          },
          "siam-gas": {
            "seriesIndex": 7,
            "basis": "Blue circular identity is primary; red flame is secondary.",
            "assetSha256": "7e78a21eb9979a5e44b2cd83fcae2e32ce8ce79a6b5e96f38c1412e9392eb82e"
          },
          "susco": {
            "seriesIndex": 0,
            "basis": "Red outer identity ring is primary; blue droplet is secondary.",
            "assetSha256": "c04da81207298b938b0ca6815def2cecde8dd232ee17fd84f28bb8b6aa90531c"
          },
          "unique-gas": {
            "seriesIndex": 5,
            "basis": "Cyan outer flame is primary; deep-blue U remains visible in the original logo.",
            "assetSha256": "bece24c9f162440f8bb936684c9a2a9f14fbb9a3939eb9c22819dc92ca20eb70"
          },
          "world-gas": {
            "seriesIndex": 7,
            "basis": "Blue outer identity lettering/ring; green is a secondary ring colour.",
            "assetSha256": "3f2d14b03c56bd74fd5f64ec10c35eb909f79602b02c5adf2d2180204bac5762"
          },
          "grocery-brand:TOOGDEE": {
            "seriesIndex": 0,
            "basis": "Red round badge.",
            "assetSha256": "c8bbae16fde7b6e88fbb72926f72ae436d0b10622e0e2d6b2f10f5901fab725c"
          },
          "grocery-brand:CJ_MORE": {
            "seriesIndex": 2,
            "basis": "Yellow native badge field; green MORE strip and red/blue letters are secondary.",
            "assetSha256": "5721f8ed58c750b9704bb6c3f301ec40830db1c7f5f454e0fc81c65259431ff7"
          },
          "grocery-brand:LAWSON108": {
            "seriesIndex": 7,
            "basis": "Blue shield and 108 wordmark in the owner-supplied original.",
            "assetSha256": "0bcdc9944f0543ae6a04627892080615d510b1db46347b140e4c7890347a587b"
          },
          "grocery-brand:VILLA_MARKET": {
            "seriesIndex": 7,
            "basis": "Deep-blue wordmark and VL identity in the owner-supplied original; red is secondary.",
            "assetSha256": "c29c85f0b251ddf12f57a59d283cab05a055ddeb35ccfa61b77458d0aa4eac8a"
          },
          "grocery-brand:MAXVALU": {
            "seriesIndex": 0,
            "basis": "Rose-red native MaxValu badge field.",
            "assetSha256": "ad52ebb00a7f96482b44fdbe95fc6f264c0e33ad5fe6a863287b1d1314c1f1a7"
          },
          "grocery-brand:FOODLAND": {
            "seriesIndex": 0,
            "basis": "Red Foodland wordmark; deep-blue supporting text is secondary.",
            "assetSha256": "60845cb0703e30f61a3e1a6d4fa72a568725760b86c21c7d6598c730bca35205"
          },
          "grocery-brand:GOURMET_MARKET": {
            "seriesIndex": 0,
            "basis": "Burgundy-red circular badge; gold lettering is secondary.",
            "assetSha256": "42e85df78c3d4082cbd2f040bcd538d69554f323b29cbac75de56b721172d497"
          },
          "grocery-brand:GO_WHOLESALE": {
            "seriesIndex": 0,
            "basis": "Red native square badge field.",
            "assetSha256": "1a9228b14421ea61265054cacd212bda88c38e78106f325a5b45df1c54cb07fb"
          },
          "grocery-brand:DONKI": {
            "seriesIndex": 7,
            "basis": "Blue native Donpen badge field; yellow bill is secondary.",
            "assetSha256": "7cbee15a7bff4c1ce08b72b18e7c40685a9104c66291292495f8544fab6dcd9c"
          },
          "grocery-brand:RIMPING": {
            "seriesIndex": 8,
            "basis": "Monochrome original: neutral approved category, no inferred brand hue.",
            "assetSha256": "fd9b37c27b8ba2fb8ccac75f057b0e7350bf4193077749762f5312c06f4e7695"
          },
          "grocery-brand:FUJI": {
            "seriesIndex": 0,
            "basis": "Red native Fuji Super badge field.",
            "assetSha256": "8de7171d3351e9174f1c74f25b8376e1b418128172af3e62b6112051e7c7b026"
          },
          "bangchak": {
            "seriesIndex": 9,
            "basis": "Green leaf identity; orange upper segment is secondary.",
            "assetSha256": "554c2f65ef51964e84b6cabc37827855b25cb6b99f9c05adf552bbfc3eb17d94"
          },
          "ptt": {
            "seriesIndex": 5,
            "basis": "Cyan outer flame is primary; deep-blue and red inner flame remain original.",
            "assetSha256": "1ba7c6ebfaf3fc774c0fb327c3ca1409b78d7bfe3a4310df02abef8c38c9a741"
          },
          "shell": {
            "seriesIndex": 2,
            "basis": "Yellow pecten shell interior; red outline is secondary.",
            "assetSha256": "55bbd2451ebd8327271311ef92e65c766854602ced336d7d9677acc84607a8e7"
          },
          "caltex": {
            "seriesIndex": 0,
            "basis": "Red star badge is primary; deep teal is secondary.",
            "assetSha256": "b85bc225fc93e10182211c9f04da5bf43a8a795dfcb6ba91066f93cbfbda95ef"
          },
          "grocery-brand:SEVEN_ELEVEN": {
            "seriesIndex": 0,
            "basis": "Red 7 is the principal identifying numeral; orange and green remain original.",
            "assetSha256": "704286f27b063dcd83f934a20211615b4f63f5072d31e58edee18ec28e48bfda"
          },
          "grocery-brand:TOPS": {
            "seriesIndex": 1,
            "basis": "Orange-red owner-supplied Tops wordmark, nearest warm orange lane.",
            "assetSha256": "dccbc2bbd05952420a2e782ef1dc2ae7ce6c5d8fffb70eb2772055df7e213458"
          },
          "grocery-brand:LOTUSS": {
            "seriesIndex": 6,
            "basis": "Teal native badge field; yellow pointer is secondary.",
            "assetSha256": "a0dab79cec31c6636d3b64e204c6895fe2c720eca6f0f35a6feaa8220785687c"
          },
          "grocery-brand:MAKRO": {
            "seriesIndex": 0,
            "basis": "Red Makro m identity.",
            "assetSha256": "cd7598334e124e7c5d0d63095628ef68065ef51e0560f04fc5a154f2b79543e0"
          },
          "legal:0107557000195": {
            "seriesIndex": 5,
            "basis": "Cyan Muangthai Capital round badge.",
            "assetSha256": "dcb1fafe99bf30a65bfee6d0149e0df6a51d002c7091c83a5229742b43db3c13"
          },
          "legal:0105559126747": {
            "seriesIndex": 2,
            "basis": "Gold central Srisawad badge; blue outer edges are secondary.",
            "assetSha256": "fc0168d628bad7638254199ad70be9677a04b61b6e692bada15f07f431e3b3aa"
          },
          "legal:0105564161598": {
            "seriesIndex": 2,
            "basis": "Yellow primary Ngern Chaiyo/AutoX wordmark; blue is secondary.",
            "assetSha256": "88b0c4c1bff765346ca19728cc84f65f396ed9835e5bd05eb4d0529d2badda82"
          },
          "legal:0107563000355": {
            "seriesIndex": 0,
            "basis": "Red Ngern Tid Lor identity; blue segment is secondary.",
            "assetSha256": "bc61d8b17ce2abfddeb4b90e90e566fbddf10b83f2d6e58c9000bdf4c5582423"
          },
          "legal:0107559000290": {
            "seriesIndex": 7,
            "basis": "Deep-blue Saksiam round identity.",
            "assetSha256": "9f7f0b1d6483c33a130173658eb5af199dae381bcffba380f1fdc6dd6203dfac"
          },
          "legal:0107566000542": {
            "seriesIndex": 0,
            "basis": "Warm pink Ngern Turbo wordmark; deep-blue first line is secondary.",
            "assetSha256": "0cd582a66c0dc9ce403fa102bebc4c5d3ad90937141f5428d99d4e549b79ba3b"
          },
          "legal:0107564000120": {
            "seriesIndex": 9,
            "basis": "Deep-green Heng Leasing wordmark and identity.",
            "assetSha256": "f0d2343cb89399b4ca68293a147bdaed2a92bf2de73712cc800a3c228c616a2f"
          },
          "legal:0505560008015": {
            "seriesIndex": 0,
            "basis": "Red Nim Leasing tiger identity.",
            "assetSha256": "b3b0106d7ead5de652235517c21a3a2ef8e81e843195f73166682f30f9436502"
          },
          "pt": {
            "seriesIndex": 3,
            "basis": "Lime-green outer PT identity ring; red lettering and deeper green are secondary.",
            "assetSha256": "b2c25e8e53186da95c400f7c7a2019c71a85b72a874036251cea819525970757"
          },
          "grocery-brand:BIG_C": {
            "seriesIndex": 3,
            "basis": "Lime-green native badge field; red C is secondary.",
            "assetSha256": "f76f25886c649dfa3b87fd4b26ab8495dc417acaccf7e164f33b3a605e21208c"
          },
          "legal:0107538000690": {
            "seriesIndex": 8,
            "basis": "Exact Krungsri Auto original is monochrome: neutral approved category, no inferred group-brand yellow.",
            "assetSha256": "8d4e21f521c2fd5b12213a1670c4d9f203cb980aa59b86a5d6cc664e232f738e"
          },
          "legal:0105528033194": {
            "seriesIndex": 0,
            "basis": "Red official UOB five-bar symbol.",
            "assetSha256": "fc77b3048c4ec868be11f0a37e9ff201102c3556cb3610c16b749792b80c44f7"
          }
        },
        "brandBindings": 37,
        "verifiedArtworkBindings": 35,
        "fallbackBindings": [
          "cosmo",
          "pure"
        ],
        "fallbackPolicy": "COSMO/PURE identity unresolved: retain FNV-1a stable brand-ID categorical slot. Unknown/nonselectable source legal IDs use the same stable hash fallback; no identity inferred from brand text.",
        "monochromePolicy": "Rimping/Krungsri Auto monochrome originals use neutral category09 without inferred family/owner hue.",
        "otherPolicy": "Exact Other identified competitor sum uses neutral category09 with inspectable named membership.",
        "tokens": {
          "fill": "--ldm-series-NN-fill-light/dark",
          "ink": "Exact existing per-theme categorical ink roles",
          "smallDarkCategory10Labels": "Exact neutral light-canvas backdrop behind small labels/cue, preserving original category10 fill and original artwork"
        },
        "cuePolicy": "Original ten category shape cues retained; same hue may identify multiple brands, therefore labels/original artwork/counts remain necessary.",
        "evidenceLimit": "Original graphic byte binding and observed hue rationale, not an official brand-guideline endorsement or all-brand rendered accessibility certificate."
      },
      "mapCameraEnvelope": {
        "status": "runtime_confirmed",
        "meaning": "Constrain viewing near Thailand with a padded display envelope; navigation aid, not statutory national boundary or data scope. Preserve saved/context camera where inside envelope; clamp only out-of-envelope camera.",
        "boundsLatLng": [
          [
            4.5,
            96.3
          ],
          [
            21.5,
            106.7
          ]
        ],
        "administrativeTotalsFollowScopeNotViewport": true,
        "maximumBoundsViscosity": 1,
        "tileNoWrap": true,
        "zoomSnap": 0.25,
        "zoomDelta": 0.5,
        "implementation": "countryContextZoomFloor calculates whole-context fit from actual current host/projected corners without feedback from current minZoom. applyMapZoomFloor clamps zoom only if below floor, then sets the host-dependent map minZoom. Apply on initial map/actual host resize.",
        "cameraRule": "Preserve same map and camera when zoom/center are within current host-dependent near-Thailand envelope. Only an out-of-envelope camera may be clamped after resize; no unconditional country fit or analytical/data-scope mutation.",
        "minimumZoomPolicy": "Host-dependent whole-Thailand context zoom floor, computed independently of the current minZoom.",
        "absoluteBaseMinimumZoom": 3,
        "maximumZoom": 19,
        "minimumZoomFormula": {
          "projection": "Project context north-west/south-east corners at zoom0 via map.project",
          "hostPaddingPixels": 36,
          "scale": "min((hostWidth - 36)/(SE.x - NW.x), (hostHeight - 36)/(SE.y - NW.y))",
          "fitZoom": "map.getScaleZoom(scale, 0)",
          "floor": "max(3, min(19, floor(4 * (fitZoom - 0.25)) / 4))",
          "quantum": 0.25,
          "maximumContextZoomOutAllowance": 0.5,
          "allowanceScope": "Before absolute3..19 provider/base caps; round-down adds less than0.25 to0.25 initial margin.",
          "fallback": "3 for width or height <=36, unavailable projection/getScaleZoom, or nonfinite/nonpositive scale/zoom. Larger valid hosts use the dynamic floor."
        },
        "runtimeSource": {
          "path": "prototype/workspace-map.js",
          "bytes": 140151,
          "sha256": "ccc7ae424b1dfc26bcc51108e32333dd4d0ca4002517bd492a8c02a8eb20d6c3"
        }
      },
      "expandedBasemapResize": {
        "status": "runtime_confirmed",
        "policy": "Invalidate Leaflet after the map host has settled at its current size; retain the same map/camera/scope/criteria/forms. Existing integer-tile-zoom layer recreation remains the explicit provider retry path. Never infer provider availability from CSS or mocks.",
        "sequence": [
          "Observe actual host width/height via ResizeObserver and existing explicit Expand/Compact path",
          "Immediately invalidate map with pan:true,animate:false; preserve view for explicit expansion",
          "Coalesce imagery resize in requestAnimationFrame until host dimensions are stable for one frame",
          "Recheck same map/current tile layer and nonzero settled size; ignore canceled/outdated work",
          "Invalidate final size with preserveView:true,refreshBasemap:false, then recreate only current same-style TileLayer via setBasemap(S.basemap) at integer provider tile zoom"
        ],
        "tileProviderAvailability": "requires_actual_current_native_and_live_evidence",
        "cancellation": "Style change cancels queued old-layer work; zero-size/no-imagery hosts cannot initiate stale work.",
        "retainedCamera": "Permitted fractional camera zoom/center remain; clamp only out-of-envelope zoom/center. Leaflet TileLayer owns integer tile coordinates. No map remount or unconditional country fit for explicit expansion.",
        "diagnosis": "Retained settled-host reconstruction addresses imagery resize. Current native tile-completion evidence is pending; a source review or prior baseline cannot establish the external provider state or a proven root cause for every reported gap.",
        "providerRule": "Source adapter tests do not prove provider availability. Sampled actual native tile completion after repeated cycles is required.",
        "samePersistentMap": true,
        "cameraPreservedWithinEnvelope": true,
        "geographicConstraintMayClamp": true,
        "cameraConstraintException": "Host-dependent geographic floor/bounds may clamp only an out-of-envelope zoom/center after resize; preserve permitted fractional camera exactly."
      },
      "compactMapControls": {
        "status": "runtime_confirmed",
        "layout": "One compact .workspace-map-tools row with two pairs: Options/Expand and Region colours/Branch points. Supply count/share remains in supporting analysis controls.",
        "representationOptions": [
          "regions",
          "points"
        ],
        "wrapAtNarrowWidths": false,
        "icons": {
          "options": "tune",
          "expand": "open_in_new",
          "collapse": "close",
          "regions": "layers",
          "points": "location_on"
        },
        "noDecorativeBracketOrColoredLeftRail": true,
        "displayOptions": [
          "options",
          "expand"
        ],
        "captionTH": [
          "ตั้งค่า",
          "ขยาย",
          "สีพื้นที่",
          "จุดสาขา"
        ],
        "captionEN": [
          "Options",
          "Expand",
          "Region colours",
          "Branch points"
        ],
        "groupHooks": [
          ".workspace-map-display-tools",
          ".workspace-supply-view"
        ],
        "fontAuthority": "contracts/icons.v1.8.0.json; retained original glyph font/axes",
        "responsive": "Row stays together at narrow/desktop widths; actual label/control geometry remains a native acceptance gate."
      },
      "numberDisplay": {
        "status": "runtime_confirmed",
        "thousandsSeparator": ",",
        "grouping": true,
        "locales": [
          "th",
          "en"
        ],
        "policy": "Format finite displayed numerical quantities with comma grouping while preserving existing precision, units, sign, interval/missing states and raw numerical calculation values. No compact K/M abbreviation that conceals a requested exact count.",
        "boundaries": [
          "Source counts, ratios, percentages, labels, lists, legends, tooltips and read-only numerical summaries",
          "Editable raw numeric inputs, IDs, version/date codes, coordinates and formula/source syntax retain their parsing/identity meaning; do not introduce grouped input strings"
        ],
        "calculationOrStoredValuesChanged": false,
        "formatter": "formatDisplayNumber(value) in prototype/model.js using Intl.NumberFormat(th-TH/en-US,{maximumFractionDigits:20}); retained per-surface precision formatters use grouping too.",
        "rawInputPolicy": "criteria-controls readout/ARIA/grouped labels change only; raw range min/max/value and number input values remain unchanged including rate precision.",
        "sourceGuard": "contracts/red-team-remediation.v1.9.9.json",
        "surfaces": [
          "model supply bounds and calibration/history display",
          "app draft impact/counts/pending states",
          "Supply tabs/page quantities",
          "criteria-map badges/ranks",
          "location-review row indices",
          "retained location-map counts",
          "criteria-controls slider readout/ARIA/endpoints",
          "retained grouped analytical map/strategy/treemap formatters"
        ],
        "guardScope": "The number formatter preserves raw numeric values. This is not a display-only claim about model.js as a whole: weighted unknown-supply handling is explicitly corrected in v1.9.9."
      },
      "requiredSuites": [
        "scripts/check-map-recovery.cjs",
        "scripts/check-workspace-map.cjs",
        "scripts/check-supply-treemap.cjs",
        "scripts/check-supply-market-share.cjs",
        "scripts/check-map-responsiveness.cjs",
        "scripts/check-criteria-controls.cjs"
      ],
      "runtimeFiles": [
        "prototype/workspace-map.js",
        "prototype/workspace-map.css",
        "prototype/bootstrap.js",
        "prototype/industry-workspace.js",
        "prototype/model.js",
        "prototype/app.js",
        "prototype/supply-treemap.js",
        "prototype/supply-treemap.css"
      ],
      "acceptance": [
        "Each verified brand has a stable exact approved DS categorical swatch chosen near its original artwork primary color; names/counts remain readable in both themes; no artwork mutation.",
        "Near-Thailand envelope blocks unrelated distant panning/zooming without changing administrative scope or Demand membership.",
        "Expand/Compact waits for a settled host then recreates only same-style imagery at integer tile zoom, preserving map instance, permitted fractional camera and unsaved work; clamp only out-of-envelope zoom/center. Actual sampled native tiles load after repeated cycles.",
        "Options/Expand and Region colours/Branch points remain four labeled meaningful-icon buttons in one compact row/two pairs at recorded narrow/desktop widths. Count/share controls retain their supporting-analysis meanings.",
        "All visible numerical quantities consistently use comma grouping and preserve precision/units/no-data/bounds, while calculation/storage/input values stay numerical.",
        "Actual TH/EN narrow/desktop and both themes are reviewed; per-state observed checks are not a physical-device/full-matrix certificate."
      ],
      "verification": {
        "integrated": {
          "status": "PASS",
          "receipt": "evidence/automated-v1.9.9.json",
          "receiptSha256": "752140f94bdcf4b7bffb9726ca22a5dc848204322f8356764e91eac49760b448",
          "suites": 40,
          "reportedPassedCases": 663,
          "requiredSuiteResults": [
            {
              "suite": "scripts/check-criteria-controls.cjs",
              "testedAt": "2026-10-09T02:26:05.152457+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "9407a4e6e0596335ef9724f9acc1534a14b743d25b31a642f0d41d8a538a5ec5",
              "outputSha256": "396dfd91ef0e0a657a268ca27cab9cc6a589f0704874b72c334bc40d326025ef",
              "passLines": 0,
              "checks": 15,
              "countBasis": "reported_named_test_cases",
              "outputEvidence": "evidence/automated-v1.9.9/check-criteria-controls.log"
            },
            {
              "suite": "scripts/check-map-recovery.cjs",
              "testedAt": "2026-10-09T02:26:54.589579+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "48befad8b97a3541a1d9d66cd6a80361c68812f0d780d9467123804f742cab1d",
              "outputSha256": "567cf265118d8283568981b2965f885b942a7a063c762e4e9f2c4976878cadce",
              "passLines": 16,
              "checks": 16,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-map-recovery.log"
            },
            {
              "suite": "scripts/check-map-responsiveness.cjs",
              "testedAt": "2026-10-09T02:26:10.216516+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "23c4508b34b938accd94c808262f2164a1a364e4440199a6a62609a7c2cdb3f7",
              "outputSha256": "a11c3bd242728496213e13dbe6927e0f0f1faa64a2762ab35b5d531128590b22",
              "passLines": 20,
              "checks": 20,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-map-responsiveness.log"
            },
            {
              "suite": "scripts/check-supply-market-share.cjs",
              "testedAt": "2026-10-09T02:26:56.180721+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "b50c020b75c4be4105b86e60220f9e2788fc0fb75f6a55b197b48900dde5861b",
              "outputSha256": "5b0f4a5493d2fd99338999c996642a3d01394a2a053c9dab09f108b21be2cc23",
              "passLines": 8,
              "checks": 8,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-supply-market-share.log"
            },
            {
              "suite": "scripts/check-supply-treemap.cjs",
              "testedAt": "2026-10-09T02:26:57.160341+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "32a6af61c64e8724dfa0cabbaaf11c39e2409b056f2b1ba541fd0709030b9e09",
              "outputSha256": "358f50ba133725a2d6bc4191a36686e44a1ae4856368621aa5fdeb11e8c718da",
              "passLines": 24,
              "checks": 24,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-supply-treemap.log"
            },
            {
              "suite": "scripts/check-workspace-map.cjs",
              "testedAt": "2026-10-09T02:26:04.942632+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "d54f3995cb50361c9df68c2cd2d5fd0a3d1870aadb1d4cc754053c91edf75fb9",
              "outputSha256": "f1ab6c324ef3bf251bc77bb5f7cc8fcbe0ba985395f66edb6898b481f9a40e0c",
              "passLines": 28,
              "checks": 28,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-workspace-map.log"
            }
          ]
        },
        "native": {
          "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
          "receipt": "evidence/browser-v1.9.9/native-browser-review.json",
          "receiptSha256": "a40c879dc25a24d85f3f84f44ad3955c2cfa2cd2d605e3891abf9ee88720eaac",
          "review": {
            "passed": true,
            "checkIds": [
              "hover_escape",
              "expanded_tiles_and_light",
              "mobile_th_dark_review",
              "narrow_320_and_console"
            ]
          },
          "actualSnapshotFiles": 8,
          "scope": "Bounded actual local native review: main workflows across Fuel/Grocery/Nonbank, draft retention, two-tab cross-context writes, captured draft detail, dense-hit search/filter/exact POI, Escape hover, Expand tiles, evidence queues, TH/EN light/dark sampled states. Not full matrix/physical hardware/provider certification."
        },
        "publication": "not_performed_by_contract"
      },
      "nativeEvidence": {
        "review": {
          "passed": true,
          "checkIds": [
            "hover_escape",
            "expanded_tiles_and_light",
            "mobile_th_dark_review",
            "narrow_320_and_console"
          ]
        },
        "renderedChecks": [
          {
            "id": "hover_escape",
            "passed": true,
            "details": "Bangkok keyboard boundary tooltip shows 591 identified branches /31.1% own share; Escape removes tooltip (1→0), focus remains boundary and route #supply.",
            "status": "PASS"
          },
          {
            "id": "expanded_tiles_and_light",
            "passed": true,
            "details": "Expand at1440×900 after nearby zoom:18/18 tile images complete with nonzero natural width; no horizontal overflow, four controls in one row; light-theme branch glyphs/boundary underlay visible.",
            "status": "PASS"
          },
          {
            "id": "mobile_th_dark_review",
            "passed": true,
            "details": "Thai dark390×844 evidencequeue visuallyreviewed:clearcardheadings/icons/actions, scroll reaches lowercards; mapnotfixed. Physicaltouch nottested.",
            "status": "PASS"
          },
          {
            "id": "narrow_320_and_console",
            "passed": true,
            "details": "Finalruntime320×760 Thai evidencecards visuallyreviewed; documentwidth320,maprelative. Nativecapturedconsoleerrorlistempty inthissession; not universalzero-bug claim.",
            "status": "PASS"
          }
        ],
        "measurements": {},
        "runtimeFiles": [
          {
            "path": "prototype/app.js",
            "bytes": 85803,
            "sha256": "a9f717915c026bb41c923c938d8d4fb5e45edc894a4e9cc386ca470e697d2964"
          },
          {
            "path": "prototype/bootstrap.js",
            "bytes": 5821,
            "sha256": "fa599d3a7de4ef664900365bd6af23aba328e13daba59e478e3a6a9ad54d4ca0"
          },
          {
            "path": "prototype/industry-workspace.js",
            "bytes": 24279,
            "sha256": "cc1c763b983440355b3dcfa9792f28e5ea8947be57f6a2b5dbea112de9126920"
          },
          {
            "path": "prototype/model.js",
            "bytes": 47953,
            "sha256": "1ef1c44d7aa73e8769b1777cfdd053f2810d59827b1190c6decce5e5d1a07db5"
          },
          {
            "path": "prototype/supply-treemap.css",
            "bytes": 8019,
            "sha256": "098a9af81f52fb1f3888f5d7c0ab66bf3f8bdc6d823a7851e295d8636996726e"
          },
          {
            "path": "prototype/supply-treemap.js",
            "bytes": 22806,
            "sha256": "7d6fe31998eeae1be4d3f2c7e14c35183395a78e85d976d35b53f9fb930f608c"
          },
          {
            "path": "prototype/workspace-map.css",
            "bytes": 28452,
            "sha256": "5f95f3b7b15d44a667079bd294fb519e780718546ab9ce9ece148204d87e8df0"
          },
          {
            "path": "prototype/workspace-map.js",
            "bytes": 140151,
            "sha256": "ccc7ae424b1dfc26bcc51108e32333dd4d0ca4002517bd492a8c02a8eb20d6c3"
          }
        ],
        "reviewedRegistries": [
          {
            "path": "prototype/supply-treemap.js",
            "sha256": "7d6fe31998eeae1be4d3f2c7e14c35183395a78e85d976d35b53f9fb930f608c"
          }
        ],
        "scope": "Actual bounded current checks only; physical devices, all brands/boundaries, full language/theme matrix and production services are separate."
      },
      "semanticChangeBoundary": {
        "protected": "Demand definitions and eligibility thresholds, numerical industry/brand presets, source dataset bytes, original artwork and exact LDS values are retained.",
        "corrected": "The v1.9.9 weighted model handles missing/suppressed/invalid Supply and unknown-supply bounds explicitly. Captured decision criteria and incomplete/unsupported Strategy queues also change behavior; analytical outputs are not globally asserted unchanged.",
        "authority": "contracts/red-team-remediation.v1.9.9.json"
      },
      "runtimeSources": [
        {
          "path": "prototype/workspace-map.js",
          "bytes": 140151,
          "sha256": "ccc7ae424b1dfc26bcc51108e32333dd4d0ca4002517bd492a8c02a8eb20d6c3"
        },
        {
          "path": "prototype/workspace-map.css",
          "bytes": 28452,
          "sha256": "5f95f3b7b15d44a667079bd294fb519e780718546ab9ce9ece148204d87e8df0"
        },
        {
          "path": "prototype/bootstrap.js",
          "bytes": 5821,
          "sha256": "fa599d3a7de4ef664900365bd6af23aba328e13daba59e478e3a6a9ad54d4ca0"
        },
        {
          "path": "prototype/industry-workspace.js",
          "bytes": 24279,
          "sha256": "cc1c763b983440355b3dcfa9792f28e5ea8947be57f6a2b5dbea112de9126920"
        },
        {
          "path": "prototype/model.js",
          "bytes": 47953,
          "sha256": "1ef1c44d7aa73e8769b1777cfdd053f2810d59827b1190c6decce5e5d1a07db5"
        },
        {
          "path": "prototype/app.js",
          "bytes": 85803,
          "sha256": "a9f717915c026bb41c923c938d8d4fb5e45edc894a4e9cc386ca470e697d2964"
        },
        {
          "path": "prototype/supply-treemap.js",
          "bytes": 22806,
          "sha256": "7d6fe31998eeae1be4d3f2c7e14c35183395a78e85d976d35b53f9fb930f608c"
        },
        {
          "path": "prototype/supply-treemap.css",
          "bytes": 8019,
          "sha256": "098a9af81f52fb1f3888f5d7c0ab66bf3f8bdc6d823a7851e295d8636996726e"
        }
      ],
      "boundaryHover": {
        "status": "runtime_confirmed",
        "owner": "prototype/map-hover.js",
        "dismissal": "Escape dismisses the tooltip and outline while preserving keyboard focus and camera. The same stationary target stays dismissed until a fresh leave/re-enter or focus interaction.",
        "readability": "Interactive tooltip with 160ms pointer-transfer grace permits reading the treemap without duplicate tooltips. Focus/blur and cleanup cancel stale work.",
        "evidence": "Current native pointer/keyboard and narrow/desktop QA binding is pending."
      }
    },
    "branchPoints": {
      "schemaVersion": "yolk.branch_points/1.9.9",
      "version": "1.9.9",
      "date": "2026-10-09",
      "status": "final_runtime_values_current_QA_bound",
      "scope": "All filtered valid branch coordinates by default, optional screen grouping, searchable overlap selection, retryable map sources and bounded performance review. Point display retains original coordinates and source inventory; weighted-model and decision-flow corrections are separately declared.",
      "extends": [
        "contracts/visual-refinement.v1.9.7.json",
        "contracts/supply-inventory.v1.9.7.json",
        "contracts/mobile-flow.v1.9.5.json",
        "contracts/interaction-guidance.v1.9.1.json"
      ],
      "retainedVersions": {
        "criteria": "1.9.0",
        "profiles": "1.9.0",
        "engine": "1.9.0",
        "strategies": "1.9.0",
        "DS": "0.9.7"
      },
      "invariants": {
        "nationalBenchmarkUnchanged": true,
        "demandTierAndEligibleIdsUnchanged": true,
        "sourceCountsAndCoverageUnchanged": true,
        "nativeAdministrativeTotalsSeparateFromViewportPoints": true,
        "sourceCoordinatesUnchanged": true,
        "samePersistentMap": true,
        "permittedCameraAndNavigationPreserved": true,
        "savedCriteriaAndDraftsPreserved": true,
        "originalBrandArtworkBytesUnchanged": true,
        "mobileDocumentFlowPreserved": true,
        "noSourceWriteOrTeamEvent": true,
        "numericalSupplyPresetsUnchanged": true,
        "displayDoesNotMutateAnalyticalInputs": true
      },
      "defaultView": {
        "supply": "regions",
        "branchPoints": "all_filtered_valid_coordinates",
        "screenGrouping": false,
        "pointTruncation": false,
        "scope": "All applicable coordinate records after current administrative/brand/format/relation/source status filters; offscreen culling is rendering only, not inventory truncation."
      },
      "rendering": {
        "status": "runtime_confirmed",
        "implementation": "One DOM Canvas and three offscreen 12px role sprites at DPR clamped 1..2, keyed by DPR and exact theme paper/own/competitor/unverified tokens. Every original coordinate uses cached drawImage; per-point WeakMap projection cache tracks lat/lng/zoom, current filters/viewport culling and requestAnimationFrame redraw coalescing. Lazy native popup retains existing actions.",
        "canvasAtCountry": true,
        "detailedBrandLogosAndPopupActionsPreserved": true,
        "stableSourceCoordinates": true,
        "duplicateDiscovery": "20px screen-hit bins with 9px nearby selection. Exact/near-screen overlaps open a 12-row paged chooser ordered by nearest screen distance, with branch/name/ID search (200-character maximum), exact brand filter, no-match state and explicit nearby zoom. Every source member and exact ID remains available without coordinate spread, jitter or inventory truncation; maximum-zoom/coincident optional groups use the same chooser.",
        "stateDiagnostics": "Panel DOM point mode/renderer/represented and Canvas records/draw milliseconds/sprite count/frame count are source diagnostics; actual performance claims require current measured receipt.",
        "contextGuards": "Context/filter/loading/stale guards reset represented/display summaries to explicit zeros; popup source filter/language/revision is refreshed before actions.",
        "detailPolicy": "Detailed original DOM logo pins only when zoom >=13 and visible records <=120; all applicable records remain represented. This detail threshold is not an inventory/point truncation cap.",
        "popupPolicy": "Lazy native popup retains original artwork/name/role and Street View/Google AI/branch actions under current-context guards. Capture delegation supports search, brand, page/back/detail/View branch and explicit nearby zoom. Search changes only the result container, preserving the live search/select DOM, value and focus. Nearby zoom closes the popup and uses min(maxZoom, max(10, currentZoom + 2)); no automatic zoom on filtering.",
        "coordinateFilter": "Retain existing industry, administrative scope, party, source status and viewport predicates; viewport is visual only, native administrative vectors remain independent.",
        "popupPlacement": "Dedicated Leaflet workspaceBranchPoints pane 450 below markers 600/tooltip 650/popup 700. Each draw uses public containerPointToLayerPoint([0,0]) and DomUtil.setPosition to cancel pane translation. Native popup autoPan:false; maxHeight=max(140,min(360,hostHeight-72)); next animation frame fits 8px host margins using popup.options.offset and public popup.setLatLng(popup.getLatLng()). This repositions without replaying Leaflet stored HTML or losing live form state. Chooser list maxHeight 260px scrolls while page footer remains outside. UI box offset only: original coordinates and camera stay unchanged.",
        "statusMeaning": "active means Team confirmed open; verified means Team checked the record. Neither label by itself asserts a field visit or current operational certification."
      },
      "optionalGrouping": {
        "status": "runtime_confirmed",
        "controlLocation": "Map Options",
        "default": false,
        "meaning": "Optional screen-space display grouping only; preserve all members and party counts. Never infer physical clusters, market demand or attraction from screen groups.",
        "api": "setPointMode('groups')",
        "selection": "Map Options select with all as default; personal display state only",
        "gridCellPixels": 56,
        "memberConservation": true
      },
      "performance": {
        "status": "bounded_current_measured_evidence",
        "scope": "Fresh measurements and native core journeys must be bound to the current runtime and recorded browser, viewport, dataset and environment. Retained renderer values are implementation facts, not current performance acceptance.",
        "coreJourneys": [
          "Expansion opportunities and reasons/guide",
          "Demand and criteria draft/apply",
          "Supply regions/all points/grouped points/filter/popup",
          "Shortlist save/duplicate handling",
          "Theme/language/navigation",
          "Normal mobile page scroll and map Expand/Compact/retry"
        ],
        "benchmarks": [
          {
            "name": "Nonbank individual-point Canvas redraw",
            "durationMs": 51.1,
            "environment": "Native Chrome1440x900 localhost on usercomputer;13,564filteredrecords,3cachedsprites",
            "scope": "One DOM-reported final-runtime completed frame; not interactionlatency/FPS/network or universalSLA."
          },
          {
            "name": "Grocery individual-point Canvas redraw",
            "durationMs": 34.7,
            "environment": "Native Chrome1440x900 localhost;26,336filteredrecords,3sprites",
            "scope": "One observed frame during currentremediation chooser QA; not universalSLA."
          }
        ],
        "deviceAndBrowserLimits": "Physical devices, Safari, complete matrix, all providers and production backend remain separate unverified gates.",
        "loadPolicy": "Release-query-scoped public JSON cache; download runtime scripts concurrently but execute in declared dependency order. Verify actual load behavior/timings rather than promise network-independent speed.",
        "wholeSiteReview": {
          "passed": true,
          "checkIds": [
            "form_draft_and_skip",
            "cross_tab_context_preservation",
            "draft_detail",
            "nonbank_evidence_queue",
            "mobile_details_flow",
            "narrow_320_and_console"
          ]
        },
        "review": {
          "passed": true,
          "checkIds": [
            "nonbank_points_performance",
            "dense_poi_search"
          ]
        }
      },
      "runtimeFiles": [
        "prototype/workspace-map.js",
        "prototype/workspace-map.css",
        "prototype/bootstrap.js",
        "prototype/industry-workspace.js",
        "prototype/model.js",
        "prototype/app.js",
        "prototype/map-hover.js",
        "prototype/map-hover.css",
        "prototype/poi-popup.js"
      ],
      "runtimeSources": [
        {
          "path": "prototype/workspace-map.js",
          "bytes": 140151,
          "sha256": "ccc7ae424b1dfc26bcc51108e32333dd4d0ca4002517bd492a8c02a8eb20d6c3"
        },
        {
          "path": "prototype/workspace-map.css",
          "bytes": 28452,
          "sha256": "5f95f3b7b15d44a667079bd294fb519e780718546ab9ce9ece148204d87e8df0"
        },
        {
          "path": "prototype/bootstrap.js",
          "bytes": 5821,
          "sha256": "fa599d3a7de4ef664900365bd6af23aba328e13daba59e478e3a6a9ad54d4ca0"
        },
        {
          "path": "prototype/industry-workspace.js",
          "bytes": 24279,
          "sha256": "cc1c763b983440355b3dcfa9792f28e5ea8947be57f6a2b5dbea112de9126920"
        },
        {
          "path": "prototype/model.js",
          "bytes": 47953,
          "sha256": "1ef1c44d7aa73e8769b1777cfdd053f2810d59827b1190c6decce5e5d1a07db5"
        },
        {
          "path": "prototype/app.js",
          "bytes": 85803,
          "sha256": "a9f717915c026bb41c923c938d8d4fb5e45edc894a4e9cc386ca470e697d2964"
        },
        {
          "path": "prototype/map-hover.js",
          "bytes": 10421,
          "sha256": "cb1578b82452cd33007a32dd7394bf02d074484a35843a95b7199a23c5ab910f"
        },
        {
          "path": "prototype/map-hover.css",
          "bytes": 1964,
          "sha256": "7a2ff89b8e930859b8df82ba08a394c63f3e9df5d24ab83bbf680c6a99a626bf"
        },
        {
          "path": "prototype/poi-popup.js",
          "bytes": 11779,
          "sha256": "8d961c2851c7eb5305673ac89ea180dbc167292fba0f47d82f63083d1335e19e"
        }
      ],
      "requiredSuites": [
        "scripts/check-supply-poi-modes.cjs",
        "scripts/check-unclustered-poi.cjs",
        "scripts/check-workspace-map.cjs",
        "scripts/check-map-recovery.cjs",
        "scripts/check-map-responsiveness.cjs",
        "scripts/check-workspace-transactions.cjs",
        "scripts/check-bootstrap-loader.cjs",
        "scripts/check-map-redteam.cjs",
        "scripts/check-map-hover.cjs",
        "scripts/check-poi-popup.cjs"
      ],
      "acceptance": [
        "Supply opens in Region colours; Branch points defaults to every filtered valid source coordinate without screen clustering or an arbitrary marker cap.",
        "Optional screen grouping lives in Map Options, preserves every member/count and never changes source coordinates or native administrative totals.",
        "Country point rendering is efficient; detailed original logos, readable names, role cues and existing popup actions remain available where appropriate.",
        "Coincident/overlapping records remain discoverable by search, brand filter, nearest-screen ordering and exact source ID. Search focus/value survives geometry-only popup repositioning; explicit nearby zoom does not move source coordinates.",
        "Filter/context/theme/route/resize updates retain map instance, permitted camera, drafts and original coordinate/inventory values. Stale draw, source or popup work cannot overwrite a newer context; separate weighted-model corrections are declared.",
        "Actual core journeys and load/render/interaction timings are recorded with environment, dataset and limits; no zero-bug, all-device, all-network or backend guarantee.",
        "Actual TH/EN, light/dark, desktop/narrow all/grouped points and popup content are reviewed; old screenshots and test counts are not current acceptance.",
        "Release-query public JSON caching and concurrent script download preserve declared execution order, late-context guards and source-byte semantics.",
        "Failed browser-local writes remain the model transaction owner’s responsibility. Source failures expose an explicit retry without reloading the page; no unearned saved/verified/success state is shown.",
        "Actual native pointer clicks operate close/page/back/detail/View branch controls inside the visible popup; Canvas must remain below popupPane and popup content must fit or scroll within the actual host. Keyboard-only or Node click dispatch is not pointer/placement acceptance.",
        "Boundary hover can be dismissed by Escape without changing camera or focus; stationary pointer movement cannot immediately reopen the dismissed target, and pointer transfer to the tooltip permits reading its contents.",
        "A failed HTTP request, invalid JSON or invalid source shape can recover on explicit retry; pending requests are deduplicated and late results cannot repaint another industry."
      ],
      "verification": {
        "integrated": {
          "status": "PASS",
          "receipt": "evidence/automated-v1.9.9.json",
          "receiptSha256": "752140f94bdcf4b7bffb9726ca22a5dc848204322f8356764e91eac49760b448",
          "requiredSuiteResults": [
            {
              "suite": "scripts/check-bootstrap-loader.cjs",
              "testedAt": "2026-10-09T02:26:42.311829+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "e4ce7dd3e76d74f1f926dfb0c85acf7a7adb81d69c90e974ee00884114bac9df",
              "outputSha256": "175872f82f49f44616f0a1195f3535fc95bcffe17c6c82bf53755e38d15e9809",
              "passLines": 7,
              "checks": 7,
              "countBasis": "reported_named_test_cases",
              "outputEvidence": "evidence/automated-v1.9.9/check-bootstrap-loader.log"
            },
            {
              "suite": "scripts/check-map-hover.cjs",
              "testedAt": "2026-10-09T02:26:11.512313+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "e2656efebd732d73573b20e7bc0bb9ce4780c66353df0c52483a42581c3611da",
              "outputSha256": "9eed443e2816370950075b11f95140e3e9b5101f9409d03713283858731fbe4c",
              "passLines": 18,
              "checks": 18,
              "countBasis": "exact_PASS_output_lines",
              "outputEvidence": "evidence/automated-v1.9.9/check-map-hover.log"
            },
            {
              "suite": "scripts/check-map-recovery.cjs",
              "testedAt": "2026-10-09T02:26:54.589579+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "48befad8b97a3541a1d9d66cd6a80361c68812f0d780d9467123804f742cab1d",
              "outputSha256": "567cf265118d8283568981b2965f885b942a7a063c762e4e9f2c4976878cadce",
              "passLines": 16,
              "checks": 16,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-map-recovery.log"
            },
            {
              "suite": "scripts/check-map-redteam.cjs",
              "testedAt": "2026-10-09T02:26:39.253574+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "b95a55d6a34fbcd41e2c1d54aa7a02139b4909982e08d14f71d4523a12162e8e",
              "outputSha256": "a2d4d76013b95c7e18c0b3fbddcf2f54ccb522ab07a5021ad32d8d45aa35e532",
              "passLines": 7,
              "checks": 7,
              "countBasis": "reported_named_test_cases",
              "outputEvidence": "evidence/automated-v1.9.9/check-map-redteam.log"
            },
            {
              "suite": "scripts/check-map-responsiveness.cjs",
              "testedAt": "2026-10-09T02:26:10.216516+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "23c4508b34b938accd94c808262f2164a1a364e4440199a6a62609a7c2cdb3f7",
              "outputSha256": "a11c3bd242728496213e13dbe6927e0f0f1faa64a2762ab35b5d531128590b22",
              "passLines": 20,
              "checks": 20,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-map-responsiveness.log"
            },
            {
              "suite": "scripts/check-poi-popup.cjs",
              "testedAt": "2026-10-09T02:26:10.182079+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "21684ea3286696e78c05d21d802e83bab694b86d7278bea3aace557bb16487f7",
              "outputSha256": "e2ad17f68d950ad9bc452640d883ad7d19f7a316c4974a5d3e39dc44fb1726c7",
              "passLines": 17,
              "checks": 17,
              "countBasis": "exact_PASS_output_lines",
              "outputEvidence": "evidence/automated-v1.9.9/check-poi-popup.log"
            },
            {
              "suite": "scripts/check-supply-poi-modes.cjs",
              "testedAt": "2026-10-09T02:26:22.494867+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "f38b8ce314f8c30afb6cfd531aeef7367bedf7dde35e6cbaf8bd64f8c00c1d1c",
              "outputSha256": "cda18a628e95a10fb5da907c71b471cdd8971513c5c74d836cf58e08336ef648",
              "passLines": 9,
              "checks": 9,
              "countBasis": "reported_named_test_cases",
              "outputEvidence": "evidence/automated-v1.9.9/check-supply-poi-modes.log"
            },
            {
              "suite": "scripts/check-unclustered-poi.cjs",
              "testedAt": "2026-10-09T02:26:25.025392+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "0fb21a2e6da085a5bf76b9340e27985a52994b2eeb71b46a4f8b6aa497f63da7",
              "outputSha256": "7e987677eda80fa5b877e47b7a0c08a6c457c1e9c9137b08473107fcd099703b",
              "passLines": 14,
              "checks": 14,
              "countBasis": "reported_named_test_cases",
              "outputEvidence": "evidence/automated-v1.9.9/check-unclustered-poi.log"
            },
            {
              "suite": "scripts/check-workspace-map.cjs",
              "testedAt": "2026-10-09T02:26:04.942632+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "d54f3995cb50361c9df68c2cd2d5fd0a3d1870aadb1d4cc754053c91edf75fb9",
              "outputSha256": "f1ab6c324ef3bf251bc77bb5f7cc8fcbe0ba985395f66edb6898b481f9a40e0c",
              "passLines": 28,
              "checks": 28,
              "countBasis": "reported_test_case_total",
              "outputEvidence": "evidence/automated-v1.9.9/check-workspace-map.log"
            },
            {
              "suite": "scripts/check-workspace-transactions.cjs",
              "testedAt": "2026-10-09T02:26:29.587606+00:00",
              "exitCode": 0,
              "passed": true,
              "testSourceSha256": "1d229c0465d36904bbbaa63117a512aa658ba915552a629d6314aa937523f6ae",
              "outputSha256": "82cc7fb24a0987107263e6bfecb4546539cfe627253478b55de54448c15603ba",
              "passLines": 14,
              "checks": 14,
              "countBasis": "reported_named_test_cases",
              "outputEvidence": "evidence/automated-v1.9.9/check-workspace-transactions.log"
            }
          ]
        },
        "native": {
          "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
          "receipt": "evidence/browser-v1.9.9/native-browser-review.json",
          "receiptSha256": "a40c879dc25a24d85f3f84f44ad3955c2cfa2cd2d605e3891abf9ee88720eaac",
          "review": {
            "passed": true,
            "checkIds": [
              "dense_poi_search",
              "nonbank_points_performance",
              "expanded_tiles_and_light"
            ]
          }
        },
        "publication": "not_performed_by_contract"
      },
      "failureHandling": {
        "status": "current_QA_bound",
        "scope": "Explicit map-source retry and browser-local write failures; current QA receipt pending",
        "mapSources": {
          "control": "[data-workspace-source-retry]",
          "api": [
            "YolkWorkspaceMap.retrySources()",
            "YolkWorkspaceMap.sourceRetryState()"
          ],
          "policy": "Retry failed province/hierarchy, native district, fine geometry and source-point work explicitly without whole-page reload. Delegate source geometry retry to YOLK_RUNTIME.retrySourceGeometry(). Deduplicate pending requests; parse/shape failures remain retryable. Late results cannot redraw a different current industry/context. Successful retry preserves permitted camera and editable criteria/form drafts.",
          "basemap": "Basemap provider retry remains a distinct existing action; source retry does not establish external provider availability."
        },
        "browserLocalWrites": "The model owns transactional write/rollback and recovery behavior, as specified by contracts/red-team-remediation.v1.9.9.json. Map display must not announce a save or modify team records. This static preview does not provide shared backend transactions."
      },
      "api": {
        "setPointMode": "setPointMode('all'|'groups')",
        "getPointMode": "getPointMode() defaults all",
        "state": "getState().pointMode; pointLimit(null in all,1000 in groups), groupPointLimit1000, detailPointLimit120; pointCanvas {records,lastDrawMs,frames,pending,epoch}; overlap {total,filteredTotal,page,pageSize:12,query,brand}; points {total,shown,represented,clusters,coordinateState,cellPx,mode,renderer,detailMarks,canvasMarks,overlapGroups}",
        "modeMeaning": "all = all filtered valid coordinates; groups = explicit optional screen-space groups",
        "retry": "retrySources() explicitly retries failed current map sources; sourceRetryState() reports pending/error source state"
      },
      "nativeEvidence": {
        "review": {
          "passed": true,
          "checkIds": [
            "dense_poi_search",
            "nonbank_points_performance",
            "expanded_tiles_and_light"
          ]
        },
        "checks": [
          {
            "id": "dense_poi_search",
            "passed": true,
            "details": "26,336 Grocery points; native keyboard hit opens6,852 screen-near records at current camera; Thai search รัชดา gives65, brand filter gives shown subset;12 rows maximum, query/focus retained. No source count changed.",
            "status": "PASS"
          },
          {
            "id": "expanded_tiles_and_light",
            "passed": true,
            "details": "Expand at1440×900 after nearby zoom:18/18 tile images complete with nonzero natural width; no horizontal overflow, four controls in one row; light-theme branch glyphs/boundary underlay visible.",
            "status": "PASS"
          },
          {
            "id": "nonbank_points_performance",
            "passed": true,
            "details": "Finalruntime nativeChrome1440×900:13564filteredcoordinates represented/painted individually,3sprites; recorded frame51.1ms;24/24basemaptiles complete; no horizontal overflow. Not FPS/wholeinteraction/deviceSLA.",
            "status": "PASS"
          }
        ],
        "runtimeFiles": [
          {
            "path": "prototype/app.js",
            "bytes": 85803,
            "sha256": "a9f717915c026bb41c923c938d8d4fb5e45edc894a4e9cc386ca470e697d2964"
          },
          {
            "path": "prototype/bootstrap.js",
            "bytes": 5821,
            "sha256": "fa599d3a7de4ef664900365bd6af23aba328e13daba59e478e3a6a9ad54d4ca0"
          },
          {
            "path": "prototype/industry-workspace.js",
            "bytes": 24279,
            "sha256": "cc1c763b983440355b3dcfa9792f28e5ea8947be57f6a2b5dbea112de9126920"
          },
          {
            "path": "prototype/map-hover.css",
            "bytes": 1964,
            "sha256": "7a2ff89b8e930859b8df82ba08a394c63f3e9df5d24ab83bbf680c6a99a626bf"
          },
          {
            "path": "prototype/map-hover.js",
            "bytes": 10421,
            "sha256": "cb1578b82452cd33007a32dd7394bf02d074484a35843a95b7199a23c5ab910f"
          },
          {
            "path": "prototype/model.js",
            "bytes": 47953,
            "sha256": "1ef1c44d7aa73e8769b1777cfdd053f2810d59827b1190c6decce5e5d1a07db5"
          },
          {
            "path": "prototype/poi-popup.js",
            "bytes": 11779,
            "sha256": "8d961c2851c7eb5305673ac89ea180dbc167292fba0f47d82f63083d1335e19e"
          },
          {
            "path": "prototype/workspace-map.css",
            "bytes": 28452,
            "sha256": "5f95f3b7b15d44a667079bd294fb519e780718546ab9ce9ece148204d87e8df0"
          },
          {
            "path": "prototype/workspace-map.js",
            "bytes": 140151,
            "sha256": "ccc7ae424b1dfc26bcc51108e32333dd4d0ca4002517bd492a8c02a8eb20d6c3"
          }
        ],
        "coverageBoundary": "Observed current browser/viewport/dataset only; no all-device, all-provider, universal performance or zero-bug guarantee."
      },
      "semanticChangeBoundary": {
        "protected": "Demand definitions and eligibility thresholds, numerical industry/brand presets, source dataset bytes, original artwork and exact LDS values are retained.",
        "corrected": "The v1.9.9 weighted model handles missing/suppressed/invalid Supply and unknown-supply bounds explicitly. Captured decision criteria and incomplete/unsupported Strategy queues also change behavior; analytical outputs are not globally asserted unchanged.",
        "authority": "contracts/red-team-remediation.v1.9.9.json"
      }
    },
    "redTeamRemediation": {
      "schemaVersion": "yolk.red-team-remediation/1.0",
      "version": "1.9.9",
      "scope": "Owner-authorized remediation of 19 findings, keeping data truth and exact LDS0.9.7 assets.",
      "status": "implementation_scoped_resolution_bounded_local_acceptance_complete_publication_pending",
      "invariants": [
        "Demand alone gates eligibility; source cohort and numerical brand presets unchanged",
        "Supply uncertainty is not an exact zero",
        "All points remain default; no arbitrary POI cap",
        "Source-first assignment, immutable saved decisions, one persistent map",
        "No public production-backend or physical-device acceptance claim"
      ],
      "findings": [
        {
          "id": "SR-01",
          "severity": "P1",
          "title": "สองแท็บต่างแบรนด์เขียนทับงานที่บันทึกแล้ว",
          "status": "resolved",
          "originalEvidenceType": "confirmed_vm",
          "change": "บันทึกผ่าน Web Lock เดียวกัน อ่านค่าล่าสุดและเทียบ revision ก่อน merge แต่ละ context; ร่างไม่เขียนทับงานยืนยัน",
          "files": [
            "prototype/model.js",
            "prototype/industry-workspace.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-workspace-transactions.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-workspace-transactions.log"
            ],
            "acceptance": "สองแท็บต่าง context คงทั้งงานและ events; stale record ถูกปฏิเสธ",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ยังเป็นข้อมูลในเบราว์เซอร์เดียว ไม่ใช่ shared server"
        },
        {
          "id": "SR-02",
          "severity": "P1",
          "title": "แจ้งสำเร็จหลังการเขียนครั้งที่สองล้มเหลว; reload แล้ว shortlist หาย",
          "status": "resolved",
          "originalEvidenceType": "confirmed_vm",
          "change": "เขียน entity, context และ event ครั้งเดียว แจ้งสำเร็จหลังเขียนสำเร็จเท่านั้น",
          "files": [
            "prototype/model.js",
            "prototype/app.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-workspace-transactions.cjs",
              "scripts/check-action-guidance.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-workspace-transactions.log",
              "evidence/automated-v1.9.9/check-action-guidance.log"
            ],
            "acceptance": "quota failure ไม่เปลี่ยน disk/memory และไม่แจ้งสำเร็จ; retry เกิด event เดียว",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ต้องมี Web Locks; เบราว์เซอร์ที่ไม่รองรับจะปฏิเสธการบันทึกพร้อมคำอธิบาย"
        },
        {
          "id": "SR-05",
          "severity": "P1",
          "title": "แก้สาขาระหว่างรอรูปแล้ว event ไม่ตรงกับ record",
          "status": "resolved",
          "originalEvidenceType": "confirmed_vm",
          "change": "หลังรอรูป resolve สาขาปัจจุบันใหม่ ตรวจ revision/context/actor/route แล้ว commit; conflict เก็บร่างรูปไว้",
          "files": [
            "prototype/app.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-save-context.cjs",
              "scripts/check-workspace-transactions.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-save-context.log",
              "evidence/automated-v1.9.9/check-workspace-transactions.log"
            ],
            "acceptance": "แทนที่หรือลบ record ระหว่าง await ไม่สร้าง event ผิดสาขาหรือ finalize รูป",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ยังไม่ใช่ transaction รูปบน backend"
        },
        {
          "id": "ANA-01",
          "severity": "P1",
          "title": "Shortlist บางปุ่มไม่เก็บเกณฑ์และเหตุผล ณ วันที่เลือก",
          "status": "resolved",
          "originalEvidenceType": "confirmed_vm",
          "change": "ทุกทางเพิ่ม/คืน shortlist ใช้ immutable decision snapshot ร่วมกัน ก่อน atomic commit; ลบออกคงหลักฐานเดิม",
          "files": [
            "prototype/decision-snapshot.js",
            "prototype/strategy-ui.js",
            "prototype/app.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-decision-evidence.cjs",
              "scripts/check-strategy-ui.cjs",
              "scripts/check-workspace-transactions.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-decision-evidence.log",
              "evidence/automated-v1.9.9/check-strategy-ui.log",
              "evidence/automated-v1.9.9/check-workspace-transactions.log"
            ],
            "acceptance": "handler จริงเก็บ criteria/context/evidence; restore เก็บเหตุผลใหม่โดยคง owner/status/note",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "รายการเก่าที่ไม่มี snapshot ไม่ถูกเติมเหตุผลย้อนหลังเอง"
        },
        {
          "id": "UX-01",
          "severity": "P1",
          "title": "ร่างสาขาหายเมื่อเปลี่ยนหน้า; Skip link เปลี่ยน route ผิด",
          "status": "resolved",
          "originalEvidenceType": "confirmed_native",
          "change": "เก็บร่างแยก context+route; กลับหน้าเดิมกู้ค่าได้ ทิ้งร่างโดยชัดแจ้ง; skip link focus เนื้อหาโดยไม่เปลี่ยน route",
          "files": [
            "prototype/app.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-form-drafts.cjs",
              "scripts/check-workspace-transactions.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-form-drafts.log",
              "evidence/automated-v1.9.9/check-workspace-transactions.log"
            ],
            "acceptance": "journal/restore/tombstone และ skip handler ผ่าน DOM adapter; stale target draft ไม่ทับค่าล่าสุด",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "native acceptance รอบรวมยังต้องมี receipt แยก"
        },
        {
          "id": "ANA-02",
          "severity": "P2",
          "title": "ผลแบบร่างกับหน้ารายละเอียดใช้คนละเกณฑ์",
          "status": "resolved",
          "originalEvidenceType": "confirmed_vm",
          "change": "รายละเอียดและแผนที่ใช้เกณฑ์ที่ผู้ใช้เปิดมาจริง พร้อมแจ้งแบบร่างและปุ่มกลับเกณฑ์ทีม",
          "files": [
            "prototype/decision-snapshot.js",
            "prototype/decision-ui.js",
            "prototype/strategy-ui.js",
            "prototype/app.js",
            "prototype/workspace-map.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-decision-evidence.cjs",
              "scripts/check-map-redteam.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-decision-evidence.log",
              "evidence/automated-v1.9.9/check-map-redteam.log"
            ],
            "acceptance": "ทำเล Tier 2 ที่ผ่านแบบร่างยังผ่านใน detail และ snapshot; ต่างทำเล/แบรนด์กลับใช้เกณฑ์ทีม",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "อ่านและเล็งทำเลไม่ Apply แบบร่างโดยอัตโนมัติ"
        },
        {
          "id": "SR-03",
          "severity": "P2",
          "title": "Cache JSON ผิด schema ทำให้แอปเปิดไม่ได้และไม่มีกู้คืน",
          "status": "resolved",
          "originalEvidenceType": "fault_injection",
          "change": "ตรวจ schema ก่อนใช้ cache กักต้นฉบับดิบไว้กู้คืน แสดงข้อความและปุ่ม export; เก็บส่วนข้อมูลที่ยังใช้ได้",
          "files": [
            "prototype/model.js",
            "prototype/app.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-workspace-transactions.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-workspace-transactions.log"
            ],
            "acceptance": "root/array/actor/criteria/event/snapshot ผิดรูปไม่ทำให้ประเมินพัง และเก็บ raw original",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ถ้าพื้นที่เก็บเต็ม ต้องส่งออกสำเนาก่อนปิดหน้า"
        },
        {
          "id": "SR-04",
          "severity": "P2",
          "title": "Popup เรียกสาขาที่ทีมยืนยันแล้วว่ายังไม่ตรวจ",
          "status": "resolved",
          "originalEvidenceType": "confirmed_vm",
          "change": "popup แยกสถานะ source record, team-verified และ archived พร้อมข้อจำกัดของพิกัด/ขอบเขต",
          "files": [
            "prototype/poi-popup.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-poi-popup.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-poi-popup.log"
            ],
            "acceptance": "ข้อความตรงสถานะใน TH/EN โดยไม่แปลงการยืนยันของทีมเป็นการรับรองต้นทาง",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ไม่ใช้คำว่า team-verified รับรองเขตกฎหมายหรือการเปิดจริงอิสระ"
        },
        {
          "id": "SR-06",
          "severity": "P2",
          "title": "Supply source โหลดพลาดแล้ว retry ไม่ได้จน reload",
          "status": "resolved",
          "originalEvidenceType": "fault_injection",
          "change": "เพิ่ม retry แหล่งข้อมูลที่ล้มเหลวโดยไม่ reload ทั้งหน้า ป้องกัน retry ซ้ำและผลเก่าเปลี่ยน context ใหม่",
          "files": [
            "prototype/workspace-map.js",
            "prototype/industry-workspace.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-map-redteam.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-map-redteam.log"
            ],
            "acceptance": "HTTP/JSON/grain/boundary error กู้คืนได้ โดยคง map instance, camera, ร่างและ context",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ความพร้อมของ provider ภายนอกยังเป็นข้อจำกัดเครือข่าย"
        },
        {
          "id": "DR-02",
          "severity": "P2",
          "title": "Tooltip บังแผนที่ กด Escape ไม่หาย",
          "status": "resolved",
          "originalEvidenceType": "confirmed_native",
          "change": "Escape ปิด tooltip และระงับการเปิดซ้ำจนออกจากขอบเขต hover เดิม; เลื่อนไปอ่านข้อความ tooltip ได้",
          "files": [
            "prototype/map-hover.js",
            "prototype/map-hover.css"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-map-hover.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-map-hover.log"
            ],
            "acceptance": "Escape, pointer persistence และไม่แย่ง Escape จาก control ผ่าน handler/DOM adapter",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "physical keyboard/screen-reader matrix ยังอยู่ DR-05"
        },
        {
          "id": "DR-06",
          "severity": "P2",
          "title": "เลือกจุดซ้อนเปิด 6,070 สาขา แต่มีเพียง Next/Previous",
          "status": "resolved",
          "originalEvidenceType": "confirmed_native_usability",
          "change": "รายการจุดซ้อนค้นชื่อ/รหัสและกรองแบรนด์ได้ มีปุ่มซูม โดยไม่ลดจำนวนหรือย้ายพิกัด",
          "files": [
            "prototype/workspace-map.js",
            "prototype/workspace-map.css"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-unclustered-poi.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-unclustered-poi.log"
            ],
            "acceptance": "ชุด 6,070 จุดค้น exact ID และ narrow brand ได้; เปิด ID ถูกและยอดไม่เปลี่ยน",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "Canvas/DOM tests ไม่ใช่ physical-device performance benchmark"
        },
        {
          "id": "ANA-03",
          "severity": "P2",
          "title": "น้ำหนักมีผลต่ออันดับหน้า Demand แต่ไม่ต่ออันดับหน้าโอกาสขยาย",
          "status": "resolved",
          "originalEvidenceType": "design_risk",
          "change": "ระบุชัดว่าน้ำหนักเรียงหน้า Demand ส่วนโอกาสขยายเรียงตาม Strategy พร้อมลิงก์ไปดู Demand",
          "files": [
            "prototype/decision-ui.js",
            "prototype/strategy-ui.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-decision-evidence.cjs",
              "scripts/check-strategy-ui.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-decision-evidence.log",
              "evidence/automated-v1.9.9/check-strategy-ui.log"
            ],
            "acceptance": "weights ไม่เปลี่ยน eligibility หรือ Strategy order; มีคำอธิบาย TH/EN",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "คงสูตรจัดอันดับเดิม ไม่เพิ่ม score ยอดขาย"
        },
        {
          "id": "ANA-04",
          "severity": "P2",
          "title": "Weighted ranking ยอมรับ bounds ที่ระบุว่ายังไม่ทราบ",
          "status": "resolved",
          "originalEvidenceType": "fault_injection",
          "change": "ข้อมูล Supply ไม่พร้อม/suppressed/invalid และ unknown bounds ไม่ให้คะแนนช่องว่างแบบแน่นอน",
          "files": [
            "prototype/model.js",
            "prototype/opportunity-engine.js",
            "prototype/relative-supply.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-decision-evidence.cjs",
              "scripts/check-relative-supply.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-decision-evidence.log",
              "evidence/automated-v1.9.9/check-relative-supply.log"
            ],
            "acceptance": "fault injection ได้ช่วงคะแนน/coverage ไม่แน่นอน; measured zero ยังใช้ได้",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "การแก้นี้ไม่เพิ่มหลักฐาน Supply ที่ไม่มี"
        },
        {
          "id": "ANA-05",
          "severity": "P2",
          "title": "Decision snapshot ยังตรึง dependency hashes ไม่ครบ",
          "status": "resolved",
          "originalEvidenceType": "confirmed_source",
          "change": "ตรึง source/profile/license/bounds และ semantic runtime พร้อม canonical criteria SHA, manifest SHA และ evidence SHA",
          "files": [
            "prototype/decision-snapshot.js",
            "prototype/strategy-ui.js",
            "prototype/bootstrap.js",
            "prototype/data/evaluation-manifest.json",
            "scripts/build-evaluation-manifest.py"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-decision-evidence.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-decision-evidence.log"
            ],
            "acceptance": "ตรวจ raw bytes และ dependency ครบ; manifest ขาด/คนละ release ปฏิเสธ capture",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "source commit ผูกใน release attestation แยกหลัง commit เพื่อเลี่ยง hash วนตัวเอง"
        },
        {
          "id": "ANA-06",
          "severity": "P2",
          "title": "Non-bank preset ยังไม่ calibrated และ incomplete count ไม่เด่น",
          "status": "mitigated",
          "originalEvidenceType": "data_readiness_risk",
          "change": "แสดงคิวข้อมูลไม่พอ/ยังไม่พบสัญญาณ พร้อม sample n และคำว่า Supply reference ยังเป็นสมมติฐาน",
          "files": [
            "prototype/strategy-ui.js"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-decision-evidence.cjs",
              "scripts/check-relative-supply.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-decision-evidence.log",
              "evidence/automated-v1.9.9/check-relative-supply.log"
            ],
            "acceptance": "37 presets ถูกต้อง; Demand แบ่งครบสามคิว; 10 Non-bank ไม่ปลอม n=0 เป็น calibration",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ยังไม่มี exact samples เพียงพอสำหรับ Non-bank หรือหลักฐานยอดขายเพื่อ calibrate"
        },
        {
          "id": "DR-03",
          "severity": "P2",
          "title": "Handoff ZIP ขาด raw test logs 37 ไฟล์ที่ receipt อ้าง",
          "status": "resolved",
          "originalEvidenceType": "confirmed_archive",
          "change": "เพิ่มตัวตรวจ evidence closure บังคับ raw log และ test source ทุกไฟล์อยู่ใน artifact พร้อม SHA และตรวจ extracted ZIP ได้",
          "files": [
            "scripts/check-evidence-closure.py",
            "scripts/seal-pages-v1.9.9.py",
            "scripts/verify-pages-v1.9.9.py",
            ".github/workflows/pages.yml",
            "HANDOFF_v1.9.9.md"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-evidence-closure.py"
            ],
            "currentLogPaths": [],
            "acceptance": "ตรวจเส้นทางภายใน artifact, SHA, exitCode และยอดจาก logs จริง; ไม่เอาผลเก่ามาแทน",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "final integrated receipt และ final ZIP closure ยังรอการรันยืนยันของ release owner"
        },
        {
          "id": "DR-04",
          "severity": "P2",
          "title": "เอกสารสถานะ release และ social metadata ยังขัดกับรุ่นจริง",
          "status": "resolved",
          "originalEvidenceType": "confirmed_source",
          "change": "ตั้ง current index/handoff ชี้ 1.9.9 และแยก source seal จาก post-publication attestation; social metadata ระบุ release ปัจจุบัน",
          "files": [
            "START_HERE.md",
            "AGENTS.md",
            "README.md",
            "HANDOFF.md",
            "HANDOFF_v1.9.9.md",
            "prototype/index.html"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/verify-pages-v1.9.9.py"
            ],
            "currentLogPaths": [],
            "acceptance": "ตรวจเส้นทางอำนาจปัจจุบันและ OG/Twitter source; retained share image ระบุว่าเป็น asset เดิม",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "live/provider/ZIP final receipts ต้องยืนยันหลังเผยแพร่จริง"
        },
        {
          "id": "DR-05",
          "severity": "P2",
          "title": "ยังไม่มีหลักฐาน acceptance บน physical mobile/Safari/screen reader/high zoom",
          "status": "open",
          "originalEvidenceType": "coverage_gap",
          "change": "ยังไม่อ้างว่าตรวจอุปกรณ์และ assistive technology ครบ; รักษา gate แยกจาก VM/desktop viewport",
          "files": [
            "HANDOFF_v1.9.9.md"
          ],
          "verification": {
            "kind": "coverage_gap",
            "testSources": [],
            "currentLogPaths": [],
            "acceptance": "ไม่มีหลักฐานผ่าน matrix นี้ จึงไม่ปิดประเด็น",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "ต้องตรวจ physical iOS Safari, Android Chrome, keyboard/screen reader, high zoom/reflow และ reduced motion พร้อม TH/EN/light/dark"
        },
        {
          "id": "DR-07",
          "severity": "P3",
          "title": "source บรรทัดยาวและเอกสารหลายรุ่นเพิ่มความเสี่ยงแก้ต่อ",
          "status": "mitigated",
          "originalEvidenceType": "maintainability_risk",
          "change": "แยก decision snapshot เป็นโมดูล มี current index และ machine contract; คง regression ก่อนเปลี่ยนโครงสร้างใหญ่",
          "files": [
            "prototype/decision-snapshot.js",
            "START_HERE.md",
            "AGENTS.md",
            "contracts/full-product.v1.9.9.json"
          ],
          "verification": {
            "kind": "implementation_and_scoped_regression",
            "testSources": [
              "scripts/check-decision-evidence.cjs"
            ],
            "currentLogPaths": [
              "evidence/automated-v1.9.9/check-decision-evidence.log"
            ],
            "acceptance": "โมดูลใหม่และ entrypoint ปัจจุบันตรวจตามไฟล์ได้; ไม่อ้างว่า refactor ทั้งระบบแล้ว",
            "finalIntegratedStatus": "PASS_40_suites_663_reported_cases",
            "manualAcceptance": "not_inferred_from_automated_tests"
          },
          "remaining": "source เดิมบรรทัดยาวและการแยกชั้นใหญ่ยังต้องทำเป็นงานถัดไป; full brief รุ่นนี้รวมเป็น narrative และ machine block เดียวแล้ว"
        }
      ],
      "openGates": [
        {
          "id": "DR-05",
          "gate": "Physical devices and assistive-technology matrix",
          "status": "open"
        },
        {
          "id": "ANA-06",
          "gate": "Non-bank calibration and anchor/offering evidence",
          "status": "mitigated_not_calibrated"
        },
        {
          "id": "DR-07",
          "gate": "Bounded legacy-source refactoring; single current full brief completed",
          "status": "mitigated"
        },
        {
          "id": "release_acceptance",
          "gate": "Final ZIP closure and provider/live attestation; bounded local integrated/native checks passed",
          "status": "pending"
        },
        {
          "id": "production_backend",
          "gate": "Authenticated tenant RBAC, server transactions/revisions/outbox/private media",
          "status": "not_implemented_by_static_preview"
        }
      ],
      "sourceReview": {
        "version": "1.9.8",
        "sourceCommit": "ee6eb51a16360458288f549c9d98ee22e8b0b2da",
        "date": "2026-10-09",
        "findingCount": 19,
        "originalPriorities": {
          "P0": 0,
          "P1": 5,
          "P2": 13,
          "P3": 1
        },
        "priorityPolicy": "Preserve original report priority; resolved implementation does not erase original severity."
      },
      "statusDefinitions": {
        "resolved": "The reported implementation/documentation cause has been addressed with the bounded evidence named here. This does not assert final integrated, live, archive or physical-device acceptance.",
        "mitigated": "Useful risk reduction is implemented, but the original evidence/structural gap is not fully closed.",
        "open": "Acceptance evidence is not available; do not claim this gate has passed."
      },
      "verification": {
        "finalIntegrated": {
          "status": "PASS",
          "expectedReceipt": "evidence/automated-v1.9.9.json",
          "expectedRawLogs": "evidence/automated-v1.9.9/",
          "finalSuiteCount": 40,
          "finalChecksPassed": 663,
          "receiptSha256": "752140f94bdcf4b7bffb9726ca22a5dc848204322f8356764e91eac49760b448"
        },
        "native": {
          "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
          "expectedReceipt": "evidence/browser-v1.9.9/native-browser-review.json",
          "physicalDeviceAcceptance": "open_DR-05",
          "checks": 11,
          "receiptSha256": "a40c879dc25a24d85f3f84f44ad3955c2cfa2cd2d605e3891abf9ee88720eaac"
        },
        "archive": {
          "status": "pending_final_archive_closure",
          "command": "python3 scripts/check-evidence-closure.py --zip <final-handoff.zip>"
        },
        "publication": {
          "status": "pending_provider_and_live_attestation",
          "expectedArchiveReceipt": "release-evidence/RELEASE_ATTESTATION_v1.9.9.json"
        },
        "policy": "Only a current successful receipt can advance acceptance. Scripts and screenshots alone do not prove final release acceptance; historical counts are not reused."
      },
      "summary": {
        "resolved": 16,
        "mitigated": 2,
        "open": 1,
        "total": 19
      }
    }
  },
  "production": {
    "stackPolicy": "Reuse realCityMETERstack afterT00; no framework/datastore presumption.",
    "moduleBoundaries": [
      "SourceAdapters",
      "MetricAST+Benchmark",
      "IndustryBrandScopeProfiles",
      "PureDemandSupplyRanking",
      "PureOpportunityEngine",
      "CalculationService",
      "ContextRevisionService",
      "SpatialMapController",
      "TargetBranchEvidenceMediaServices",
      "EventOutboxDelivery"
    ],
    "contextKey": [
      "workspaceId",
      "industryId",
      "ownEntityId",
      "supplyScope",
      "profileVersion"
    ],
    "additionalResultIdentity": [
      "sourceReleaseId",
      "benchmarkReleaseId",
      "criteriaHash",
      "engineVersion",
      "strategyContractVersion"
    ],
    "entities": [
      {
        "entity": "Workspace",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "name",
          "defaultLocale",
          "defaultIndustryId",
          "createdAt",
          "revision"
        ],
        "invariants": "Tenant root; all private records must have workspaceId."
      },
      {
        "entity": "Membership",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "workspaceId",
          "userId",
          "role",
          "status",
          "joinedAt",
          "revision"
        ],
        "invariants": "Unique workspace/user; active seat limits 1 admin + 3 editors + 6 viewers; preserve a last admin."
      },
      {
        "entity": "IndustryProfile",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "industryId",
          "profileVersion",
          "factorPresets",
          "defaultParameters",
          "sourceRefs",
          "status"
        ],
        "invariants": "Versioned immutable preset template, adjustable copied workspace criteria."
      },
      {
        "entity": "Entity",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "industryId",
          "kind",
          "legalCompanyId?",
          "names",
          "brandAliases",
          "formatIds",
          "logoAssetRefs"
        ],
        "invariants": "Identity and aliases are explicit, never name-only joins; a company license does not prove a branch product."
      },
      {
        "entity": "CriteriaScope",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "industryId",
          "ownEntityId",
          "supplyScope",
          "formatId?",
          "productId?",
          "profileVersion",
          "acceptedRevisionId"
        ],
        "invariants": "Unique workspaceId/industryId/ownEntityId/supplyScope/profileVersion; explicit validated formatId/productId mapping, not ambiguous concatenation."
      },
      {
        "entity": "CriteriaRevision",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "scopeId",
          "revision",
          "criteriaJson",
          "sourceReleaseId",
          "benchmarkReleaseId",
          "actorId",
          "createdAt",
          "criteriaHash"
        ],
        "invariants": "Immutable accepted max3-factor revision; baseRevision and idempotency key at Apply; strategy view personal until target assessment save."
      },
      {
        "entity": "CriteriaDraft",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "scopeId",
          "userId",
          "baseRevision",
          "draftJson",
          "updatedAt"
        ],
        "invariants": "Private user draft; preview never writes team feed/outbox."
      },
      {
        "entity": "SourceRelease",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "datasetId",
          "schemaVersion",
          "sourceUrl",
          "retrievedAt",
          "sourcePeriod",
          "contentHash",
          "coverage",
          "rightsRef"
        ],
        "invariants": "Immutable provenance/version; source correction creates a new release, not in-place silent change."
      },
      {
        "entity": "Area",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "reportingUUID",
          "grain",
          "names",
          "provinceId",
          "sourceReleaseId",
          "sourceAreaSqm",
          "geometryRef",
          "geometryVersion"
        ],
        "invariants": "Source reporting UUID is identity; source area denominator stays separate from simplified display area."
      },
      {
        "entity": "AreaCrosswalk",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "fineUUID",
          "parentDistrictId",
          "method",
          "overlapShare",
          "sourceReleaseId",
          "geometryVersion",
          "displayOnly"
        ],
        "invariants": "Versioned many-to-many display relationships, dedupe UUIDs for national/province counts; not statutory affiliation."
      },
      {
        "entity": "MetricObservation",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "areaId",
          "grain",
          "reportingUUID?",
          "metricId",
          "sourceReleaseId",
          "value?",
          "evidenceState",
          "unit",
          "sourcePeriod",
          "sourceFields"
        ],
        "invariants": "Unique release/UUID/metric; null unknown remains distinct from observed zero. Fine reportingUUID is present only at fine grain; native district area IDs are a separate namespace. Compare/aggregate at matching grain."
      },
      {
        "entity": "SupplyObservation",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "areaId",
          "grain",
          "reportingUUID?",
          "industryId",
          "entityId",
          "formatId?",
          "productScope?",
          "sourceReleaseId",
          "assignedCount?",
          "lower?",
          "upper?",
          "evidenceState",
          "supplyScope",
          "jointConstraint?",
          "adapterVersion",
          "reconciliationReleaseId?"
        ],
        "invariants": "Immutable source inventory; role classification derives from selected own/comparator identities and scope. Fine reportingUUID is present only at fine grain; native district area IDs are a separate namespace. Compare/aggregate at matching grain. Preserve joint admissible allocations where counts share the same unknown pool; marginal bounds alone cannot certify feasibility."
      },
      {
        "entity": "BranchOverlay",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "industryId",
          "sourceRecordId?",
          "entityId?",
          "reportingUUID?",
          "lat?",
          "lng?",
          "name?",
          "verificationStatus",
          "operatingStatus",
          "evidenceRef?",
          "customFields",
          "archivedAt?",
          "revision",
          "assignmentState",
          "coordinateEvidence",
          "formatId?",
          "productId?",
          "createdBy",
          "createdAt",
          "provinceId?",
          "coordinateAssignmentProvenance?",
          "fieldOrigins?",
          "assignmentGeometryReleaseId?"
        ],
        "invariants": "Private team overlay; archive preserves history; source aggregates do not change until governed reconciliation. Existing unresolved records may save valid notes/evidence/photos without a reporting UUID. New record requires name && (valid coordinate pair || valid reporting area); partial/invalid supplied pair is rejected. Coordinate proposals never verify operation or source membership."
      },
      {
        "entity": "LocationTarget",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "scopeId",
          "reportingUUID?",
          "geometryRef?",
          "geometryKind",
          "ownerId",
          "workflowStatus",
          "note",
          "customFields",
          "archivedAt?",
          "revision",
          "title",
          "priority",
          "rationale",
          "criteriaRevisionId",
          "sourceReleaseId",
          "geometryReleaseId",
          "createdBy",
          "createdAt"
        ],
        "invariants": "Current launch targets use source areas. Custom polygon/corridor work is a separately approved extension with explicit grain/cohort."
      },
      {
        "entity": "CustomFieldDefinition",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "entityType",
          "key",
          "labelTH",
          "labelEN",
          "type",
          "required",
          "options?",
          "validation",
          "revision"
        ],
        "invariants": "PROPOSED generic typed extension, not implemented in current fixed-field editor; do not execute formulas from these values."
      },
      {
        "entity": "Event",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "scopeId?",
          "entityType",
          "entityId",
          "eventType",
          "actorId",
          "occurredAt",
          "beforeAfterDiff",
          "revision",
          "idempotencyKey"
        ],
        "invariants": "Immutable record after successful shared mutation; no image bytes, credentials or unnecessary personal data."
      },
      {
        "entity": "Outbox",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "eventId",
          "channel",
          "recipientId",
          "state",
          "attempts",
          "nextAttemptAt",
          "dedupeKey"
        ],
        "invariants": "Created transactionally with event/mutation; delivery dedupe event+recipient+channel; actual external delivery remains proposed."
      },
      {
        "entity": "Media",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "branchId?",
          "privateObjectKey",
          "mime",
          "byteSize",
          "width",
          "height",
          "contentHash",
          "caption",
          "cover",
          "createdBy",
          "revision",
          "state",
          "stagedForEntityId?",
          "expiresAt?",
          "committedAt?",
          "draftContextId?",
          "draftRecordKey?"
        ],
        "invariants": "Private object storage; max five current photos per branch enforced by server, scoped signed access. State=staged|committed|expired; commit checks record/context/revision, count cap, tenant permission; clean unused staged objects. Staged new-record media is scoped to context/draft key before a branch ID exists; committed media requires branchId. No cross-context carryover."
      },
      {
        "entity": "ReviewEvidence",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "scopeId",
          "reportingUUID",
          "issueType",
          "sourceReleaseId",
          "evidenceRef",
          "observedAt",
          "reviewerId",
          "state",
          "resolutionDiff?",
          "revision",
          "sourceRecordId",
          "proposedPatch",
          "reconciliationReleaseId?",
          "recordVersion"
        ],
        "invariants": "PROPOSED documented evidence/reconciliation workflow; no generic approve button that removes uncertainty without corrected inputs."
      },
      {
        "entity": "AnalysisRun",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "scopeId",
          "sourceReleaseId",
          "benchmarkReleaseId",
          "criteriaHash",
          "requestId",
          "engineVersion",
          "createdAt",
          "diagnostics"
        ],
        "invariants": "Immutable reproducibility identity and cache key; results are screening proxies, not sales predictions."
      },
      {
        "entity": "GeographyRelease",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "sourceReleaseId",
          "geometryVersion",
          "grain",
          "contentHash",
          "crosswalkVersion",
          "provenance",
          "publishedAt"
        ],
        "invariants": "Immutable geometry and crosswalk provenance; administrative evidence and display context are distinguished."
      },
      {
        "entity": "BranchSource",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "sourceReleaseId",
          "sourceRecordId",
          "industryId",
          "entityId?",
          "sourceAreaAssignment?",
          "formatId?",
          "productScope?",
          "coordinates?",
          "sourceFields",
          "evidenceState"
        ],
        "invariants": "Immutable stable source identity. Team overlays never overwrite this record."
      },
      {
        "entity": "BranchVerification",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "branchId",
          "operatingStatus",
          "verificationStatus",
          "assignmentState",
          "evidenceRefs",
          "observedAt",
          "reviewedBy",
          "reviewedAt",
          "revision"
        ],
        "invariants": "Audit each verification dimension separately; operating active is not a certified source assignment or brand identity. No automatic aggregate approval."
      },
      {
        "entity": "WorkItem",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "entityType",
          "entityId",
          "ownerId",
          "title",
          "state",
          "dueAt?",
          "evidenceRefs",
          "revision"
        ],
        "invariants": "Work belongs to a permitted location/branch. Successful mutation creates one scoped event."
      },
      {
        "entity": "ReconciliationRelease",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "scopeId",
          "sourceReleaseId",
          "reviewEvidenceIds",
          "adapterVersion",
          "contentHash",
          "diagnostics",
          "createdBy",
          "createdAt"
        ],
        "invariants": "Versioned effective correction layer, only after reviewed evidence and comparable-grain reconciliation; source remains immutable."
      },
      {
        "entity": "Notification",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "eventId",
          "recipientId",
          "channel",
          "deliveryState",
          "readAt?",
          "deepLink",
          "createdAt"
        ],
        "invariants": "Recipient-only read/update; access rechecked at delivery and deep-link opening; unique event/recipient/channel."
      },
      {
        "entity": "NotificationPreference",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "workspaceId",
          "userId",
          "channels",
          "eventTypes",
          "digestMode",
          "revision"
        ],
        "invariants": "Self-only updates within workspace policy; preferences do not grant access."
      },
      {
        "entity": "ShareGrant",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "resourceType",
          "resourceId",
          "snapshotRefs",
          "recipientIds",
          "permissions",
          "expiresAt?",
          "revokedAt?",
          "createdBy",
          "revision"
        ],
        "invariants": "No public visibility by default; authorization for both link creation and reading including media/private fields."
      },
      {
        "entity": "BrandProfile",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "industryId",
          "brandId",
          "profileVersion",
          "segmentId",
          "defaultScope",
          "perScopeProfiles",
          "offerings",
          "positioning",
          "researchStatus",
          "sourceIds",
          "limitations"
        ],
        "invariants": "Versioned corporate offering evidence separate from operator claim/inference; consumer perception unknown until survey."
      },
      {
        "entity": "SegmentProfile",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "industryId",
          "scopeId",
          "mission",
          "offeringDimensions",
          "evidenceStatus",
          "sourceRefs"
        ],
        "invariants": "Source format/license family is comparable scope; actual branch product/price/customer segment requires evidence."
      },
      {
        "entity": "StrategyAssessment",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "scopeId",
          "reportingAreaId",
          "strategyIds",
          "criteriaRevisionId?",
          "privateDraftHash?",
          "criteriaSnapshot",
          "sourceReleaseId",
          "benchmarkReleaseId",
          "profileVersion",
          "engineVersion",
          "strategyContractVersion",
          "status",
          "assessments",
          "actorId",
          "assessedAt",
          "revision"
        ],
        "invariants": "Immutable captured assessment; maximum3strategies; older plan is retained when criteria/source changes."
      },
      {
        "entity": "EvidenceRecord",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "subjectType",
          "subjectId",
          "question",
          "value",
          "unit",
          "sourcePeriod",
          "observedAt",
          "sourceRef",
          "geographicScope",
          "productScope",
          "evidenceState",
          "verifier",
          "rightsRef",
          "limitations",
          "revision"
        ],
        "invariants": "Keep observed zero/no data/out of scope/unresolved/confirmed distinct; confirmed evidence does not mean confirmed investment outcome."
      },
      {
        "entity": "FieldAction",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "assessmentId?",
          "siteId?",
          "question",
          "ownerId",
          "dueAt",
          "status",
          "result",
          "evidenceRefs",
          "closedAt",
          "revision"
        ],
        "invariants": "Task closed with evidence/result; own actor/clock/server permission, not generated engine date."
      },
      {
        "entity": "CandidateSite",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "relatedAreaIds",
          "entranceLocation",
          "coordinateMethod",
          "accessConstraints",
          "usableAreaSqm",
          "rentQuote",
          "quoteDate",
          "availableFrom",
          "landlordEvidence",
          "assessmentRefs",
          "ownerId",
          "status",
          "revision"
        ],
        "invariants": "P1 lease/site evidence separate from existing operating Supply records."
      },
      {
        "entity": "AnchorPOI",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "datasetId",
          "sourceReleaseId",
          "names",
          "type",
          "coordinates",
          "coordinateMethod",
          "operatingState",
          "sourcePeriod",
          "observedAt",
          "sourceRefs",
          "areaCrosswalk",
          "rightsRef"
        ],
        "invariants": "P1 verified spatial reference; presence alone does not establish sent customer flow."
      },
      {
        "entity": "FutureProject",
        "status": "PROPOSED_PRODUCTION",
        "fields": [
          "id",
          "workspaceId",
          "geometryRef",
          "milestones",
          "status",
          "evidenceRefs",
          "holdingCost",
          "stoppingTrigger",
          "ownerId",
          "revision"
        ],
        "invariants": "P2 separatewatchlist, never currentDemand membership."
      }
    ],
    "indexes": [
      "Membership(workspaceId,userId) unique",
      "CriteriaScope(workspaceId,industryId,ownEntityId,supplyScope,profileVersion) unique",
      "CriteriaDraft(scopeId,userId) unique",
      "MetricObservation(sourceReleaseId,reportingUUID,metricId) unique",
      "LocationTarget active(workspaceId,scopeId,reportingUUID/customLocationId) unique",
      "Event(workspaceId,entityType,entityId,occurredAt)",
      "Outbox(eventId,recipientId,channel) unique",
      "Outbox(state,nextAttemptAt)",
      "spatial geometry/points when datastore supports it",
      "unique(workspaceId, scopeId, reportingAreaId) on activeTarget",
      "unique(workspaceId, idempotencyKey) on mutations",
      "unique(eventId, recipientId, channel) on outboxDelivery",
      "index(workspaceId, assessmentId, status) on fieldActions",
      "index(sourceReleaseId, metricId, reportingUUID) on observations"
    ],
    "rbac": {
      "status": "PROPOSED_SERVER_ENFORCED",
      "admin": "Manage workspace/members/custom field definitions plus editor actions",
      "editor": "Branch/target/evidence/media CRUD and scoped criteria Apply; permitted sharing",
      "viewer": "Read permitted data, maps/details/feed; personal filters/theme/locale and notification read state; no shared writes",
      "seats": {
        "admin": 1,
        "editor": 3,
        "viewer": 6
      },
      "checks": "Tenant+role+entity scope at every API/storage/signed URL/share path; do not trust actor selectors or client canEdit",
      "viewerPrivateDraft": "Permitted self-only preview/draft, never Apply/shared mutation",
      "reviewer": "Assigned capability within editor/admin, not an extra seat role",
      "viewerForwarding": "May copy/forward an existing link only within its authorized audience. Cannot create a new ShareGrant or grant new access."
    },
    "transaction": "authorize→validate/max3/baseRevision→writeentity+revision+event+outbox atomically→acknowledge→asyncdelivery; idempotencykey dedupesretry",
    "media": {
      "maxCount": 5,
      "maxBytesPerFile": 10485760,
      "mimeAllowlist": [
        "image/jpeg",
        "image/png",
        "image/webp"
      ],
      "verify": "Content sniffing plus permission/revision/cap validation; strip unnecessary EXIF; private signed reads"
    },
    "privacy": "Publicpreview only approvedsource snapshots andmockmedia. Privatecustomerdata/photos/evidence/signedURLsneverpublicmanifest. P3minimize/aggregate andsetretentionpurpose/access. Nonbankproxiesneverborrowereligibility/creditdetermination.",
    "errors": {
      "409": "Revisionconflict; preserve draft and returncurrentrevision/diff",
      "422": "Field/metric/op/max3validation stablecode+path",
      "401/403": "Existingauthpolicy, no tenantdata disclosure"
    },
    "migration": [
      "Pincriteria/profile/source versions; never overwriteacceptedhistory",
      "Keep legacy8patternfields inert; no mapping to8strategies",
      "Historicalfuelvotes notsilentlyrewritten tofactorpaths",
      "Seedunseenbrand/scope or explicitpresetdraft only",
      "No event/revision fromopeningpage/migration/personalview",
      "Savedstrategyassessment retains exactoldcriteria/sourceversions"
    ]
  },
  "api": {
    "status": "PROPOSED_PRODUCTION_NOT_IMPLEMENTED_BY_STATIC_PREVIEW",
    "requestEnvelope": {
      "workspaceId": "server-authorized tenant",
      "context": {
        "industryId": "fuel|grocery|nonbank",
        "ownEntityId": "stable entity ID",
        "formatId": "optional explicit grocery format",
        "productId": "optional explicit Non-bank product/license scope",
        "profileVersion": "pinned profile version",
        "supplyScope": "stable validated Supply scope; formatId/productId mapping required"
      },
      "sourceReleaseId": "immutable release",
      "benchmarkReleaseId": "pinned national distribution",
      "criteriaHash": "canonical JSON hash",
      "requestId": "unique request/ticket",
      "baseRevision": "required accepted revision for mutation",
      "idempotencyKey": "required for retryable shared mutation",
      "scopeId": "authorized CriteriaScope ID matching complete context tuple",
      "criteria": "validated criteria payload for private preview/Apply; server verifies or derives criteriaHash"
    },
    "responseEnvelope": {
      "requestId": "echo",
      "contextKey": "echo stable full tuple",
      "sourceReleaseId": "exact",
      "benchmarkReleaseId": "exact",
      "criteriaHash": "exact",
      "engineVersion": "exact",
      "rows": "DTO by reporting UUID: raw metrics/units/evidence states/Demand tier/eligible/Supply bounds/rank; historical patterns optional and inactive.",
      "diagnostics": "validN/missingN/zeroN/coverage/denominator/errors",
      "revision": "new immutable accepted revision after mutation only"
    },
    "endpoints": [
      {
        "method": "POST",
        "path": "/v1/workspaces/:id/analyses/preview",
        "meaning": "PrivateDemand/Supply/Strategycalculation; no sharedevent"
      },
      {
        "method": "POST",
        "path": "/v1/workspaces/:id/scopes/:scopeId/criteria/apply",
        "meaning": "Acceptedrevision/baseRevision/idempotency+event/outbox"
      },
      {
        "method": "POST",
        "path": "/v1/workspaces/:id/targets",
        "meaning": "SaveareawithStrategyAssessmentsnapshot+owner/action"
      },
      {
        "method": "PATCH",
        "path": "/v1/workspaces/:id/targets/:targetId",
        "meaning": "Update/archive/restorewithrevision"
      },
      {
        "method": "POST",
        "path": "/v1/workspaces/:id/branches",
        "meaning": "Teamoverlay; immutableSupplyaggregateuntouched"
      },
      {
        "method": "POST",
        "path": "/v1/workspaces/:id/branches/:branchId/media-intents",
        "meaning": "Privatevalidateduploadandfinalize"
      },
      {
        "method": "POST",
        "path": "/v1/workspaces/:id/evidence",
        "meaning": "Purpose/source/scope/statevalidatedevidence"
      },
      {
        "method": "GET",
        "path": "/v1/workspaces/:id/events",
        "meaning": "Authorizedentity/contextfeed"
      },
      {
        "method": "POST",
        "path": "/v1/workspaces/:id/shares",
        "meaning": "Editor/adminpermissionedgrant, expiry/revoke"
      }
    ],
    "decisionDTO": {
      "areaId": "reportingUUIDatfine; nativeIDsseparatenamespace",
      "demand": "boolean|null",
      "qualifyingTier": "1|2|3|null",
      "eligible": "boolean",
      "rawMetrics": "metricId→numeric|null +states/units/periods",
      "supply": "own/competitor/total bounds +unknownstate/referenceunit",
      "rank": "lower/upper/coverage +mode, notconfidence",
      "opportunity": "perselectedstrategyassessmentwithsource/criteria/profile/engineversions",
      "counters": "Demand beforeview, candidatesafterview, shortlistindependent"
    }
  },
  "tasks": [
    {
      "id": "T00",
      "title": "ตรวจ stack และ source ที่ทีมใช้จริง",
      "dependsOn": [],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "This full document",
        "Current CityMETER source/auth/spatial/media/queue repositories",
        "DS integration"
      ],
      "outputs": [
        "Stack map",
        "rights/source inventory",
        "exact runtime-to-production field map"
      ],
      "steps": [
        "Identify existing ownership, auth/tenant identifiers and storage boundaries.",
        "Inventory source fields, periods, coverage, UUID grain, rights and missing states.",
        "Map current runtime globals to typed services; retain immutable snapshots."
      ],
      "acceptance": [
        "No new framework/datastore chosen before stack mapping.",
        "25 metrics and fixed 7954 UUIDs accounted for; hospital/school adapters explicitly pending."
      ],
      "verification": [
        "Source hash/catalog validation",
        "Review source/permission registry"
      ],
      "codingPrompt": "Implement only T00: ตรวจ stack และ source ที่ทีมใช้จริง. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T01",
      "title": "ตั้ง shell ตาม LDS และ responsive map layout",
      "dependsOn": [
        "T00"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Verified LDS0.9.7 base/profile",
        "Current routes and UI assets",
        "expansion-experience.v1.9.3.json",
        "contracts/map-space.v1.9.4.json",
        "contracts/mobile-flow.v1.9.5.json",
        "contracts/map-readability.v1.9.6.json",
        "contracts/supply-inventory.v1.9.9.json",
        "contracts/visual-refinement.v1.9.9.json",
        "contracts/branch-points.v1.9.9.json"
      ],
      "outputs": [
        "Accessible TH/EN light/dark shell",
        "One persistent map host",
        "Compact map toolbar, responsive explicit expanded mode and soft foundation surfaces"
      ],
      "steps": [
        "Use existing fonts/logos/icons with verified role/hash.",
        "Build mobile-first content panels; desktop map remains large and visible.",
        "Keep visible keyboard focus, captions and theme surfaces; no motifs/logo frames/left rails.",
        "Isolate semantic icon font from caption/body/strong rules; use fixed nonshrinking icon box and a single readable caption per Supply role control.",
        "Use fixed22px nonshrinking semantic glyphs,8px gaps, a single DS caption and an explicit JetBrains counter span. Wrap the five filters within available persistent-map workspace width without horizontal page overflow; preserve keyboard focus/caption-only hover underline.",
        "Use approved softer foundation canvas/panel tokens in light theme; keep analytical colors unchanged.",
        "Build one compact toolbar with progressive options and an explicit mobile Expand/Compact control, minimum44px touch targets.",
        "Use generic store for overall Supply and retain shield/swords only for their own/competitor roles; define readable accent link/focus states.",
        "For widths <=1099px, apply the retained mobile-flow1.9.5 normal document-flow map panel clamp(420px,80svh,800px), page-scroll gestures until explicit Expand, and unchanged expanded height/desktop layout. Distinguish host height from actual canvas and review actual narrow content."
      ],
      "acceptance": [
        "No map recreation on route change.",
        "Rendered real Thai/English headings fit 390/1440px in both themes.",
        "No raw icon ligature text, overlapping icons/captions or horizontal page overflow.",
        "Expanded/compact layout does not recreate the map, apply criteria or emit team events.",
        "Real TH/EN control text remains readable and touch-accessible with map occupying useful screen space.",
        "Supply optional point view retains enough visible map canvas after its controls/footer; actual narrow native measurements are required.",
        "Apply current map-space extension without changing retained calculations; record actual rendered map dimensions and accessible disclosure behavior.",
        "At narrow widths, ordinary page scroll reaches the work panel after the map without a sticky map trapping the viewport; preserve map/context/drafts and desktop behavior.",
        "Use neutral boundary contrast underlays and approved one-egg Demand / three-egg Opportunity mnemonic graphics without changing data fill, hierarchy, criteria or map/mobile behavior; review actual rendered states.",
        "Honor current visual-refinement contract without changing analytical/source/storage semantics.",
        "Honor all-points default and explicit optional screen grouping; preserve native totals/coordinates and document measured performance separately."
      ],
      "verification": [
        "Font/logo network checks",
        "Native visual review and keyboard navigation",
        "check-icon-controls.cjs",
        "Native computed glyph/caption/counter faces and no overlap at390/1440"
      ],
      "codingPrompt": "Implement only T01: ตั้ง shell ตาม LDS และ responsive map layout. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T02",
      "title": "สร้าง workspace, auth, seats และ schema",
      "dependsOn": [
        "T00",
        "T01"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Existing auth/datastore",
        "Proposed entities/indexes/RBAC"
      ],
      "outputs": [
        "Tenant-scoped database schema",
        "Server-enforced role/seat checks"
      ],
      "steps": [
        "Define full context tuple and tenant indexes.",
        "Enforce 1 admin + 3 editors + 6 viewers, preserve last admin.",
        "Authorize every API, storage read and share path; actor selectors are preview only."
      ],
      "acceptance": [
        "Cross-tenant IDs are inaccessible.",
        "Viewer can preview privately but cannot mutate shared criteria/records."
      ],
      "verification": [
        "Two-tenant attack fixtures",
        "Seat concurrent writes",
        "RBAC service/API tests"
      ],
      "codingPrompt": "Implement only T02: สร้าง workspace, auth, seats และ schema. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T03",
      "title": "นำเข้า snapshot และ geometry",
      "dependsOn": [
        "T00",
        "T02"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Immutable source files",
        "Source hashes/periods/rights",
        "Display geometry/crosswalk"
      ],
      "outputs": [
        "SourceRelease/Area/MetricObservation/SupplyObservation stores",
        "Explicit many-to-many display crosswalk"
      ],
      "steps": [
        "Import rows by exact source UUID, preserving raw states.",
        "Keep native928district inventory independent from fine-area totals.",
        "Keep source area denominator separate from simplified display geometry.",
        "Validate geometry and state missing geometry as unfilled extent, not a fabricated polygon."
      ],
      "acceptance": [
        "No name-only joins or allocation of residuals.",
        "45 multi-district display links do not duplicate national/province fine UUID counts."
      ],
      "verification": [
        "Hash and row uniqueness",
        "Geometry/crosswalk counts",
        "Native-vs-fine reconciliation fixtures"
      ],
      "codingPrompt": "Implement only T03: นำเข้า snapshot และ geometry. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T04",
      "title": "ทำ metric registry และ safe formula evaluator",
      "dependsOn": [
        "T03"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "25 metric definitions/formula AST",
        "Allowed source fields"
      ],
      "outputs": [
        "Typed registry",
        "Safe arithmetic evaluator with provenance"
      ],
      "steps": [
        "Implement only allowlisted fields/operations, selectors and age slices.",
        "Require positive extensive denominators; preserve no_data/zero/not_applicable/suppressed.",
        "Attach unit/source period/measurement and lineage to each result."
      ],
      "acceptance": [
        "No eval, arbitrary JS or request-provided SQL.",
        "GFA per person uses population dataset; fiscal per person uses fiscal.population."
      ],
      "verification": [
        "AST allowlist/injection rejection",
        "Zero/missing denominator",
        "Age20:65 slice endpoints"
      ],
      "codingPrompt": "Implement only T04: ทำ metric registry และ safe formula evaluator. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T05",
      "title": "ตรึง benchmark ทั่วประเทศ",
      "dependsOn": [
        "T04"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Fixed7954UUID source release",
        "Known values per metric"
      ],
      "outputs": [
        "Immutable national distributions",
        "Benchmark release/hash/cohort"
      ],
      "steps": [
        "Build each metric distribution from valid comparable values including observed zero.",
        "Use declared INC percentile cutoff; maintain rank-midrank as a distinct display statistic.",
        "Do not recalculate benchmark by selected province, brand or map viewport."
      ],
      "acceptance": [
        "Zoom/brand/province filters leave benchmark hashes/cutoffs unchanged.",
        "Missing observations do not enter denominator or become zero."
      ],
      "verification": [
        "INC/ties fixtures",
        "Known-zero fixture",
        "Cohort isolation"
      ],
      "codingPrompt": "Implement only T05: ตรึง benchmark ทั่วประเทศ. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T06",
      "title": "ทำ Industry→Segment→Brand→Scope profiles",
      "dependsOn": [
        "T00",
        "T04",
        "T05"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "37-brand researched registry",
        "9 preset families",
        "Current source format/license scopes"
      ],
      "outputs": [
        "Versioned IndustryProfile/SegmentProfile/BrandProfile registry",
        "Per-scope starter criteria"
      ],
      "steps": [
        "Separate official offering/positioning, Yolk inference and unresolved consumer perception.",
        "Bind grocery important/source-supported default format, preserving alternatives.",
        "Keep only10selectableNonbankcompanies but compare the full compatible source inventory.",
        "Treat COSMO/current identity, PURE rebrand and legal-company/office capability as explicit verification topics.",
        "Seed only unseen context or explicit Try preset; saved draft/revision wins.",
        "Bind owner-provided VillaMarket/Lawson108/Tops artwork to existing brand IDs and preserve exact original bytes/hash/MIME/dimensions; no format/preset/profile changes."
      ],
      "acceptance": [
        "No company/group marketing auto-merges distinct IDs.",
        "Numeric presets are labeled Yolk hypotheses, not operator-endorsed thresholds.",
        "Brand name remains adjacent to original compact artwork; identity and source-scope counts do not change."
      ],
      "verification": [
        "37 bindings/9 families validation",
        "Official source links and profile status",
        "Context restore and brand switch tests"
      ],
      "codingPrompt": "Implement only T06: ทำ Industry→Segment→Brand→Scope profiles. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T07",
      "title": "คำนวณ Demand ด้วย factor paths จำกัด 3",
      "dependsOn": [
        "T04",
        "T05",
        "T06"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Brand per-scope factorPresets/criteriaOverrides",
        "National benchmark"
      ],
      "outputs": [
        "Pure Demand/Tier engine",
        "Maximum-three factor validators"
      ],
      "steps": [
        "Allow at most3enabledfactor families and at most3distinct metrics within each.",
        "AND within path; OR across alternative paths; choose best confirmed tier.",
        "Require known positive value when positive_presence is enabled.",
        "Retain interval/unknown possibility separately from confirmed result.",
        "Declare new fuel path hypothesis explicitly; do not equate it with historical6-activity5/3/1 votes."
      ],
      "acceptance": [
        "eligible = demand===true AND Tier1..3 AND tier<=maxDemandTier.",
        "Unknown does not qualify; disabled factors do not affect result; a fourth factor/metric is rejected server-side."
      ],
      "verification": [
        "Pure fixture per family",
        "No-data path logic",
        "Max3 enforcement",
        "Saved historical criteria migration"
      ],
      "codingPrompt": "Implement only T07: คำนวณ Demand ด้วย factor paths จำกัด 3. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T08",
      "title": "ทำ Supply adapters และตัวหาร",
      "dependsOn": [
        "T03",
        "T06",
        "T07"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Native/fine source inventory",
        "Selected source scope",
        "Raw extensive denominator"
      ],
      "outputs": [
        "Own/competitor/unresolved bounds",
        "Count/rate comparisons and exploratory references"
      ],
      "steps": [
        "Filter grocery by source format; Nonbank by declared company-license scope.",
        "Preserve unknown brand, unknown operations and Nonbank assignment intervals.",
        "Relative mode divides count by one selected positive raw market base; default fuelGFA100000m², Grocery/Nonbankpopulation10000persons.",
        "Seed per-role national positive exact medians with N>=5; exclude intervals/nonzero-or-unknown U.",
        "If boundsKnown=false, no upper-bound certainty is assumed."
      ],
      "acceptance": [
        "Missing denominator or assignment bounds remain unresolved.",
        "Do not classify registered adult population as borrowers or all fuel stations as identical fuel offerings."
      ],
      "verification": [
        "Joint-U/interval tests",
        "Scope identity/licence fixtures",
        "Relative median exclusion",
        "Count/rate units"
      ],
      "codingPrompt": "Implement only T08: ทำ Supply adapters และตัวหาร. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T09",
      "title": "แยก eligibility จาก ranking",
      "dependsOn": [
        "T07",
        "T08"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Demand results",
        "Supply gap references",
        "At most3weights"
      ],
      "outputs": [
        "Stable context and weighted comparators",
        "Rank bounds and coverage"
      ],
      "steps": [
        "Context ordering uses Demand tier/path strength; weighted ordering uses Demand/ownGap/competitorGap.",
        "Use nonnegative weights, positive weight sum and retained gap100/(1+N/T).",
        "Compute conservative bounds for valid joint uncertainty allocations.",
        "Keep historical pattern fields inert and preserve history."
      ],
      "acceptance": [
        "Supply modes/references/weights change order only, never Demand/Tier/eligible IDs.",
        "No negative-weight hack for competitive-entry or cluster strategy."
      ],
      "verification": [
        "Membership invariants",
        "Allzero weights rejection",
        "Joint allocation admissibility",
        "Deterministic ties"
      ],
      "codingPrompt": "Implement only T09: แยก eligibility จาก ranking. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T10",
      "title": "เพิ่ม 8 Strategy เป็นชั้นคิวสำรวจ",
      "dependsOn": [
        "T07",
        "T08",
        "T09"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "opportunity-strategies.v1.9.0.json",
        "Evaluated rows",
        "Brand/scope profile"
      ],
      "outputs": [
        "Pure OpportunityEngine",
        "Separate candidate/incomplete/unsupported queues"
      ],
      "steps": [
        "Call assess/view after Demand evaluation.",
        "Limit selected strategies to3; current market candidates require confirmed eligible Demand.",
        "Implement supported cue rules1/3/5/7 with bounds and relevant actual area metrics.",
        "Show2/4/6/8missing-data guides without artificial scores.",
        "Return reasons/evidenceRefs/missingEvidence/nextAction and source/criteria/profile versions.",
        "Feed the first-page candidate-to-check queue through the same assessor/view comparator; do not calculate a new sales/opportunity score."
      ],
      "acceptance": [
        "Every candidate has an explicit first field task.",
        "Future areas cannot enter current Yolk counts.",
        "Population alone is not a Complementary anchor."
      ],
      "verification": [
        "check-opportunity-strategies.cjs",
        "Real national membership invariants",
        "KhanHamworkers49339 example"
      ],
      "codingPrompt": "Implement only T10: เพิ่ม 8 Strategy เป็นชั้นคิวสำรวจ. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T11",
      "title": "ทำ calculation API/worker และ cancellation",
      "dependsOn": [
        "T02",
        "T05",
        "T07",
        "T08",
        "T09",
        "T10"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Request/response envelopes",
        "Pure engines"
      ],
      "outputs": [
        "Calculation endpoints",
        "Content-addressed cache",
        "Latest-request guard"
      ],
      "steps": [
        "Send full context/source/benchmark/profile/criteria hash/requestId.",
        "Compute in worker/service appropriate to real stack; reject stale context/route tickets.",
        "Return added/removed IDs separately even when net count is unchanged.",
        "Return validation state, not stale results, for invalid input."
      ],
      "acceptance": [
        "Race brand/route/source changes cannot publish old result.",
        "Preview does not create shared events."
      ],
      "verification": [
        "Deferred reversed responses",
        "Same-countdifferentIDs",
        "Cache version invalidation"
      ],
      "codingPrompt": "Implement only T11: ทำ calculation API/worker และ cancellation. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T12",
      "title": "ทำ persistent maps และ POIทุกdrilldown",
      "dependsOn": [
        "T01",
        "T03",
        "T11"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Map semantics/DS scales",
        "Native district and fine geometry",
        "Source coordinate adapters",
        "Expansion map hierarchy/layout/tile-recovery contract",
        "contracts/map-space.v1.9.4.json",
        "contracts/mobile-flow.v1.9.5.json",
        "contracts/map-readability.v1.9.6.json",
        "contracts/supply-inventory.v1.9.9.json",
        "contracts/visual-refinement.v1.9.9.json",
        "contracts/branch-points.v1.9.9.json"
      ],
      "outputs": [
        "One map controller",
        "Demand/Supply/Strategy layers",
        "Supply optional point mode",
        "Direct source-vector identified totals/share and reusable brand-count treemap panel/hover"
      ],
      "steps": [
        "Country paintdistrict/clickprovince; provincepaintfine/clickdistrict; districtpaintfine/clickfine.",
        "Supplydefaultsregions; pointview optional country/province/district/fine withsamecamera.",
        "Render every filtered valid coordinate by default without clustering/truncation; optional screen grouping preserves every record and is enabled explicitly in Map Options.",
        "Keep selectedfine/point interiors transparent, relativewhiteboundary hierarchy and yellowclickablehover.",
        "Reuse exact41LUTcolors; retain egg-tier recipe separately.",
        "Make one escaped name/value/unit hover tooltip owned by clickable scope. Current Supply count/share and supported market context use the direct hovered native parent vector or fine reporting UUID vector, never maximum or averaged child metrics. Keep POI filtered in-boundary coordinate counts distinct from source totals. Clamp the compact treemap tooltip to the visible map with8px inset; keyboard focus opens the same tooltip.",
        "Apply quiet point-only stroke schedule: country provinces1.2px; province districts0.65px; district chosen parent1.1px with transparent fine hit targets; fine selection0.8px. Retain yellow2px hover and all geometry/data.",
        "Preserve existing white parent/child widths and pair every currently visible ordinary source outline with the neutral #101318 stroke-only underlay at foreground width +0.80px. Apply current panes410/411 and yellow hover412; retire parent-only halo/generic drop-shadow and never fill, filter or transform analytical paint. Quiet POI adds no child mesh. Read current map-readability1.9.6 values.",
        "Invalidate after explicit expanded/compact host sizing; preserve same map/camera/navigation and open popup anchor for height-only changes.",
        "Implement and verify readable tile loading/partial failure/retry status separately from analytical/source status; remain explicit if the runtime/provider evidence is still pending.",
        "Retry recreates only the existing same-style public tile layer via setBasemap(S.basemap), retaining Leaflet map/camera/source/criteria/provider. Never GridLayer.redraw at fractional map zoom: native10.25 review emitted an invalid tile URL; verify integer tile zoom requests and actual recovery.",
        "Retire the previous tile layer through public map.removeLayer(previous) before previous.off(). Leaflet once(remove) must perform map-event cleanup first; check repeated retry/style replacement and later zoom/resize for one active listener/layer without retired callbacks.",
        "Read the pinned source dimensions/scope adapters and test exact0/100/undefined ratios and unknown coverage first.",
        "Implement the pure direct-vector count/share API with source rows, bounds and explicit flags; preserve existing screening/ranking.",
        "Add fixed0..10041-LUT share alongside existing count/rate maps; totalcount uses relationtotal.",
        "Reuse one treemap renderer in panel and the single boundary-hover owner, with compact/full limits and named list disclosure.",
        "Bind exact verified DS brand-color mapping, near-Thailand display envelope, settled-host tile invalidation, four controls in two compact pairs, and comma-grouped visible quantities; retain raw numerics and camera/context.",
        "Default Branch points to all filtered valid coordinates with efficient Canvas, preserved detailed logo/popup access and duplicate discovery; bind exact frozen source and current measured evidence."
      ],
      "acceptance": [
        "Camera changes only explicit navigation/focus/fit/clusterclick.",
        "Screen bins are not physical market-cluster evidence.",
        "Source coordinates and native supply counts never conflated.",
        "No duplicate paint/navigation tooltips.",
        "POI view remains readable at all four administrative scopes.",
        "Parent hierarchy is visible without dense child mesh; POI quiet policy stays unchanged.",
        "Basemap failure never changes source metrics, eligible IDs or saved evidence; retry must have actual evidence before claiming success.",
        "A fractional map zoom followed by retry emits provider-valid integer tile zoom requests, preserves camera/criteria, and has bounded native recovery evidence.",
        "Apply current map-space extension without changing retained calculations; record actual rendered map dimensions and accessible disclosure behavior.",
        "At narrow widths, ordinary page scroll reaches the work panel after the map without a sticky map trapping the viewport; preserve map/context/drafts and desktop behavior.",
        "Use neutral boundary contrast underlays and approved one-egg Demand / three-egg Opportunity mnemonic graphics without changing data fill, hierarchy, criteria or map/mobile behavior; review actual rendered states.",
        "Native parent vectors supply parent totals/distribution; no LAO crosswalk or POI-marker rollup.",
        "Unknown U and unresolved licence evidence never silently become own/competitor exact counts.",
        "O+C count0 stays known while0/0 share remains undefined; valid0/100 ratios retain percentage domain.",
        "Exact fixed-domain41 share LUT matches pinned LDS bytes in both themes; no percentile stretch/opacity or color transformation.",
        "Every plotted rectangle equals observed count fraction; Other preserves total and own remains inspectable.",
        "Honor current visual-refinement contract without changing analytical/source/storage semantics.",
        "Honor all-points default and explicit optional screen grouping; preserve native totals/coordinates and document measured performance separately."
      ],
      "verification": [
        "check-workspace-map.cjs",
        "check-supply-poi-modes.cjs",
        "Paint/click boundaries",
        "Real light/dark narrow/desktop",
        "check-map-clarity.cjs",
        "Native hover name/value and point-boundary review",
        "check-map-hierarchy.cjs",
        "Native expanded/compact controls, actual boundary hierarchy and tile failure/retry review",
        "check-map-recovery.cjs",
        "scripts/check-supply-market-share.cjs",
        "scripts/check-supply-treemap.cjs"
      ],
      "codingPrompt": "Implement only T12: ทำ persistent maps และ POIทุกdrilldown. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T13",
      "title": "ทำ criteria drafts และ Apply แบบตรวจ diff",
      "dependsOn": [
        "T02",
        "T07",
        "T08",
        "T09",
        "T11",
        "T12"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Scoped CriteriaRevision",
        "Factor controls and defaults"
      ],
      "outputs": [
        "Private draft editor",
        "Revision/event/outbox Apply transaction"
      ],
      "steps": [
        "Separate Demand, Supply and ranking controls; all numeric thresholds have slider+exact input.",
        "Validate max3choices at UIandserver.",
        "Apply withbaseRevision/idempotencykey and full diff; reject stale409whilepreservingdraft.",
        "Try preset seeds private draft only; migration creates no team revision on load."
      ],
      "acceptance": [
        "No-op and retries emit at mostone event; fourthfactor/strategy rejected.",
        "Saved criteria are not overwritten by registry update."
      ],
      "verification": [
        "Concurrent editors/no-op/retry",
        "Draft context isolation",
        "Range+number/focus retention"
      ],
      "codingPrompt": "Implement only T13: ทำ criteria drafts และ Apply แบบตรวจ diff. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T14",
      "title": "ทำหน้าโอกาสขยาย: preset → เหตุผล → เล็งทำเล",
      "dependsOn": [
        "T06",
        "T10",
        "T11",
        "T12",
        "T13"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Brand profiles",
        "Opportunity outputs",
        "Source/criteria versions",
        "expansion-experience.v1.9.3.json",
        "prototype/data/strategy-guide.v1.9.3.json"
      ],
      "outputs": [
        "One canonical Expansion opportunities first page",
        "Eight strategies within that page, maximum3selected",
        "Two visible primary counters: confirmed Demand and places to investigate; separate navbar shortlist count and evidence states in disclosure",
        "Candidate reasons and first field task before save",
        "Read-only bilingual eight-strategy guide with hypothetical explanatory diagrams"
      ],
      "steps": [
        "Reuse the selected brand/scope researched preset or saved criteria/draft to show the evidence-limited candidate queue immediately.",
        "Merge country overview and Strategy into canonical#market without a second map or new analytical score.",
        "Show1–3selectedstrategies within this page; expose the same eight strategies with clear capability/missing-evidence states.",
        "Keep Demand and Supply as dedicated supporting pages and preserve the same map/camera while inspecting them.",
        "Map legacy#strategy to#market while preserving context, selected strategies, camera, team criteria and private drafts; no remount, implicit Apply or event.",
        "Show location reason, actual value/unit/period, missing evidence, first field task and shortlist action.",
        "Keep Demand tier paint only on candidates; transparent nonmatch is not low Demand. Explain zero results and current scope.",
        "Show two first-page counters: confirmed Demand and candidate-to-check in the selected scope. Retain the shortlist count in navigation.",
        "Show concise first reason per candidate; disclose complete reasons, missing evidence and first field task progressively.",
        "Build a read-only guide from the bilingual registry, with a clean eight-icon overview and detail dialog. Diagrams are illustrative and examples hypothetical.",
        "Expose each strategy guide from main-page cards/tags and the lazy inline chooser; do not change selection or criteria when opening a guide.",
        "Close on Escape/explicit control and restore focus to the opener; protect focus order, scrolling and long TH/EN paragraphs at narrow widths."
      ],
      "acceptance": [
        "Demand count, strategy candidate count and shortlisted count remain distinct.",
        "Keyboard/touch choices work and max3states are explained.",
        "An unseen brand context reaches a meaningful evidence-limited view without mandatory user data; missing evidence is explicit, not fabricated.",
        "Old strategy links preserve current map/context/draft and do not create a duplicate active page.",
        "All eight guide IDs/icons/text and three-step examples match the registry and retained strategy semantics.",
        "Every guide states P0 capability versus additional evidence, including unsupported strategies and separate future watchlist.",
        "Guide open/read/close does not change criteria, Demand IDs, selected strategies, map camera, team events or saved work."
      ],
      "verification": [
        "Projection doesnotmutatebaseIDs",
        "Card counter consistency",
        "TH/EN actual UI review",
        "Fresh-context preset entry and saved-context precedence",
        "Legacy hash alias/context/camera regression",
        "Native first-page reasons/selection/save and empty-state review",
        "Bilingual guide schema/ID/icon/hypothetical-policy consistency",
        "Native eight-guide overview and detail/dialog keyboard/narrow/desktop review"
      ],
      "codingPrompt": "Implement only T14: Expansion opportunities and read-only eight-strategy guide. Read the full-product, expansion-experience and bilingual strategy-guide contracts plus the existing stack map. Reuse the retained assessor/presets and one map instance. Preserve saved context, drafts, eligibility, source totals and events. Build the current queue, collapsed maximum-three selector and accessible guide dialog from the registry; examples/diagrams are hypothetical. Opening a guide never changes selection or criteria. Verify alias, camera, guide focus/close and shortlist success/failure behavior. Report changed files, actual evidence and open gates; do not deploy or claim a production backend."
    },
    {
      "id": "T15",
      "title": "ทำ Target CRUD และ snapshotแผนสำรวจ",
      "dependsOn": [
        "T02",
        "T10",
        "T13",
        "T14"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "ReportingUUID/fullcontext",
        "Assessment result",
        "Owner/status/custom fields",
        "First-page candidate card and retained action-guidance contract"
      ],
      "outputs": [
        "Targets",
        "Immutable StrategyAssessment snapshots",
        "FieldActions/EvidenceRecords"
      ],
      "steps": [
        "Unique target percontext/area; retain archivedhistory.",
        "Capture exactcriteria/source/benchmark/profile/engine/strategy versions and whetherprivateDraftoraccepted.",
        "Save strategy evidence/missing data/next task withowner and actor/time.",
        "Keep personalview selection outside sharedrevision untilexplicit targetsave.",
        "After committed target state change derive count from actual active target records. New/unarchived +1 and removal -1; existing plan update no false +1. Dedupe receipt IDs and use the finite200ms pointer-inert surrogate only when endpoints are visible.",
        "Preserve source focus and current map; duplicate/failure does not fly or increment.",
        "Maintain persistent polite live region and linked7s confirmation; pause confirmation on focus/hover. Reduced motion/offscreen destination/hidden page/pagehide exposes final count/status without motion or delayed mutation.",
        "Shortlist directly from the first-page candidate card with the exact current assessment; distinct active count and retained success/failure/+1 guidance remain authoritative."
      ],
      "acceptance": [
        "Old assessment remains reproducible after threshold/source change.",
        "Target status never means source verified or parcel approved.",
        "New save increments once; duplicate/failure does not fabricate a +1.",
        "Reduced-motion/failure/interruption final state remains usable."
      ],
      "verification": [
        "CRUD/dedupe/archive/restore",
        "Snapshot hash/version parity",
        "Cross-brand isolation",
        "check-action-guidance.cjs",
        "Native new/duplicate save and reduced-motion review"
      ],
      "codingPrompt": "Implement only T15: ทำ Target CRUD และ snapshotแผนสำรวจ. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T16",
      "title": "ทำ Branch CRUD รูป5รูปและ source-first autofill",
      "dependsOn": [
        "T02",
        "T03",
        "T12",
        "T15"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Immutable source branch records",
        "branch-context.v1.7.5.json",
        "Private media policy"
      ],
      "outputs": [
        "Team overlays",
        "Context-safe editor",
        "Private media finalize"
      ],
      "steps": [
        "Source/manual/saved geography wins over coordinatehint; unique strict-interior suggestion can fill draft.",
        "Filter dependent province/area options; expose ambiguous boundaries and conflicts.",
        "Newrecord requires name plusvalidcoordinatesorvalidarea; unresolvedexisting permits notes/photos.",
        "Capture context/route/form/revision/coordinate signatures across awaits; cancel stale lookup/photo completions.",
        "Validate content/mime/size/dimensions/EXIF/cap<=5server-side."
      ],
      "acceptance": [
        "LocalPOIedits never rewrite aggregateSupply.",
        "Unknown/unbranded/closed/verified/assigned meanings remain separate."
      ],
      "verification": [
        "check-branch-context.cjs",
        "Photo-cap concurrency and rollback",
        "Editor/popup parity",
        "Tenant signed-media reads"
      ],
      "codingPrompt": "Implement only T16: ทำ Branch CRUD รูป5รูปและ source-first autofill. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T17",
      "title": "ทำ Location detail และ governed review",
      "dependsOn": [
        "T10",
        "T12",
        "T15",
        "T16"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Demand paths",
        "Supply intervals",
        "Strategy snapshots",
        "Spatial source geometry"
      ],
      "outputs": [
        "Market landscape detail",
        "Review reason/action workflow",
        "New correction releases"
      ],
      "steps": [
        "Show relevant market values/tier/brand scope and mapped POIs without invented traffic.",
        "Popup retains sourcebrandgraphic(originalcontain/aspect)or explicitnamedthemefallback/name and partyshield/swords, StreetView/GoogleAIMode contextual questions.",
        "Review unknown Demand/geometry/category/license evidence; corrections requireexactsourceIDandcrosswalk.",
        "Publish accepted correction as newsource release and recompute; donot overwriteoldsource."
      ],
      "acceptance": [
        "No bulkapprove button turning missing data into Yolk.",
        "Correction can remove an area; nativecounts do not resolve fine residuals."
      ],
      "verification": [
        "Reason/evidence acceptance",
        "UNKNOWNvsunbranded",
        "Read-onlysource",
        "Externalquestion context privacy"
      ],
      "codingPrompt": "Implement only T17: ทำ Location detail และ governed review. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T18",
      "title": "ทำ Feed Outbox Share และ leaderboard",
      "dependsOn": [
        "T02",
        "T13",
        "T15",
        "T16",
        "T17"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Immutable accepted mutation events",
        "Existing channel integrations"
      ],
      "outputs": [
        "Per-page/entity/global feeds",
        "Retryable delivery adapters",
        "Permissioned shares"
      ],
      "steps": [
        "Entity/revision/Event/Outbox commit atomically.",
        "Recipients must be authorized; email/LINE need configured productionprovidersanduserauthorizeddelivery.",
        "Dedupe delivery byeventId+recipient+channel; recordretry/deadletter.",
        "Leaderboard counts real successful sharedactions, excludesmap/drafts/theme/sample/retry."
      ],
      "acceptance": [
        "One action creates oneauditevent, no repeated notification on retry.",
        "Link permissions checked at everyopen; viewer cannot widen access."
      ],
      "verification": [
        "Outbox failure/retry",
        "Share expiry/revoke",
        "Actor/actioncount filters"
      ],
      "codingPrompt": "Implement only T18: ทำ Feed Outbox Share และ leaderboard. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T19",
      "title": "ทำ source refresh และ accepted adoption",
      "dependsOn": [
        "T03",
        "T05",
        "T11",
        "T13",
        "T17",
        "T18"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Versioned source release",
        "Coverage/state diff"
      ],
      "outputs": [
        "Refresh pipeline",
        "Preview/adoption diff",
        "Reproducible historical runs"
      ],
      "steps": [
        "Stagevalidate newsource/rights/schema/hash.",
        "Show changedcoverage/metrics/eligibleIDsandsupply intervalsbefore accepted adoption.",
        "Do not silently reseed edited criteria or defaultbrandprofile."
      ],
      "acceptance": [
        "Old result/assessment remains available.",
        "Source updates trigger only approvedteam events, not browsing actions."
      ],
      "verification": [
        "Historicalreplay",
        "ChangedUUIDandcoverage",
        "Manualpresetpreservation"
      ],
      "codingPrompt": "Implement only T19: ทำ source refresh และ accepted adoption. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T20",
      "title": "P1 เพิ่ม anchors offerings และจุดเช่าจริง",
      "dependsOn": [
        "T03",
        "T15",
        "T16",
        "T17"
      ],
      "dataPhase": "P1",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Rights-approved hospital/school/other anchor sources",
        "Fieldsurvey protocols"
      ],
      "outputs": [
        "Verified AnchorPOI and spatial crosswalk",
        "Offering/hour/occasion evidence",
        "CandidateSite entity"
      ],
      "steps": [
        "Audit CityMETER sourceavailability before externalacquisition.",
        "Add actualanchorcoordinates/name/type/period/source/status; validate nearest/access relationships.",
        "Survey branchformat/products/pricebands/hours and customeroccasionswithpurpose.",
        "Store candidatelease sites separately fromoperatingbranches; support several sites perarea.",
        "Test physicalclusters/visits/costs; screen markerbins alone do not qualify strategy4."
      ],
      "acceptance": [
        "Hospitalnearpharmacy/schoolnearstationery remain hypotheses untilrelevantobservations.",
        "CandidateSite doesnot increaseSupply counts."
      ],
      "verification": [
        "Anchorcrosswalkandrights",
        "Observedfieldstates",
        "Cluster-versus-screenbins",
        "Sitebranchseparation"
      ],
      "codingPrompt": "Implement only T20: P1 เพิ่ม anchors offerings และจุดเช่าจริง. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T21",
      "title": "P2 เพิ่ม routes และ future watchlist",
      "dependsOn": [
        "T12",
        "T15",
        "T20"
      ],
      "dataPhase": "P2",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Directednetwork/version",
        "Fieldaccess/daypartdata",
        "Verifiedfutureprojects"
      ],
      "outputs": [
        "Routecaptureresults",
        "Separatefuturewatchlist"
      ],
      "steps": [
        "Modeldirection/turnrestrictions/access/mode/daypart.",
        "Countpass/stop/buy separately; validate stoppingfeasibility.",
        "Trackmilestones/open/occupied dates andholdingcosts/stoppingtriggers.",
        "Futurewatchlist maycontain noncurrentDemandareas buthasseparatecounts."
      ],
      "acceptance": [
        "Roadrankortrafficdoesnotprovemeasuredstorebuying.",
        "Futureevidence doesnotpromote currentYolk eligibility."
      ],
      "verification": [
        "Directedreachabilityfixtures",
        "Roadside/turnbarriers",
        "Noncurrentfutureentrycount"
      ],
      "codingPrompt": "Implement only T21: P2 เพิ่ม routes และ future watchlist. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T22",
      "title": "P3 เพิ่มข้อมูลผลธุรกิจเพื่อ calibration",
      "dependsOn": [
        "T02",
        "T15",
        "T17",
        "T19"
      ],
      "dataPhase": "P3",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Privatebrand POS/branchperformance/cost/capacity",
        "Purposeandpermission-reviewed customerdata"
      ],
      "outputs": [
        "Restricted operational connector",
        "Holdout outcome models",
        "Networkdisplacement estimates"
      ],
      "steps": [
        "Minimizepersonaldata; aggregate/spatiallyprotect customerlocationsanddayparts.",
        "Separatetransferredsales fromnewnetworksales.",
        "Useholdout/temporaltests andassumptionintervals; versioncalibratedprofile separately.",
        "Retain humanreview andclearlimits fornonbank financialbehavior."
      ],
      "acceptance": [
        "Noborrowingneed/creditworthiness inferredfrompublicpopulation alone.",
        "Calibration doesnotclaimbusinesssuccesswithout observedvalidation."
      ],
      "verification": [
        "Connectorpermission/delete",
        "Holdoutleakage",
        "Netincrementversuscannibalization"
      ],
      "codingPrompt": "Implement only T22: P3 เพิ่มข้อมูลผลธุรกิจเพื่อ calibration. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T23",
      "title": "ตรวจรับ end-to-end และ production",
      "dependsOn": [
        "T01",
        "T02",
        "T03",
        "T04",
        "T05",
        "T06",
        "T07",
        "T08",
        "T09",
        "T10",
        "T11",
        "T12",
        "T13",
        "T14",
        "T15",
        "T16",
        "T17",
        "T18",
        "T19"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Currentcontracts",
        "RealTH/ENcontent",
        "Two-tenantsfixtures",
        "contracts/supply-inventory.v1.9.9.json",
        "contracts/visual-refinement.v1.9.9.json",
        "contracts/branch-points.v1.9.9.json"
      ],
      "outputs": [
        "CurrentQAreceipt",
        "Nativevisualevidence",
        "Remaininggates"
      ],
      "steps": [
        "Runmodel/workflowtests fromcurrentfiles.",
        "Inspectallnewsections actualrenderedTH/EN at390and1440inlight/dark.",
        "Exercisecontextswitch/loadsave races,RBAC,transactions,outboxprivateuploads.",
        "Keep browser/nativeviewport/physicaldevice/backend outcomesseparate.",
        "Review tooltip cardinality, scope/value labels, quiet POI boundaries, shortlist destination/count, reduced motion and interruption against the interaction extension.",
        "Review current Supply icon/caption chips and all three supplied brand images in TH/EN/light/dark/narrow/desktop bounded states; record current source receipts.",
        "Review actual new first-page queue, inline strategy controls, alias, supporting Demand/Supply pages, compact/expanded map and all link/icon/foundation states in TH/EN at narrow/desktop light/dark.",
        "Record tile provider loading/error/retry evidence separately; preserve an explicit unverified gate if unavailable.",
        "Do not promote old1.9.2 QA/browser counts to current1.9.6 results.",
        "Review the eight explanatory diagrams/examples and accessible guide dialog in actual TH/EN at narrow/desktop; confirm no guide action changes calculations or saved state.",
        "Review current O+C/share fixed-domain map and panel/one boundary-hover treemap in actual TH/EN narrow/desktop themes; report only actually reviewed states."
      ],
      "acceptance": [
        "AllrequiredtaskAC passed; unresolvedgates named.",
        "Noimportedoldreleasepassesclaimedcurrent.",
        "Each verified brand has a stable exact approved DS categorical swatch chosen near its original artwork primary color; names/counts remain readable in both themes; no artwork mutation.",
        "Near-Thailand envelope blocks unrelated distant panning/zooming without changing administrative scope or Demand membership.",
        "Expand/Compact settles the existing host and refreshes visible tiles while preserving map instance, camera and unsaved work; sampled native tiles visibly load after repeated cycles.",
        "Options/Expand and areas/points remain four usable, labeled, meaningful-icon buttons in one compact row at recorded narrow and desktop widths.",
        "All visible numerical quantities consistently use comma grouping and preserve precision/units/no-data/bounds, while calculation/storage/input values stay numerical.",
        "Actual TH/EN narrow/desktop and both themes are reviewed; per-state observed checks are not a physical-device/full-matrix certificate.",
        "Supply opens in Region colours; Branch points defaults to every filtered valid source coordinate without screen clustering or an arbitrary marker cap.",
        "Optional screen grouping lives in Map Options, preserves every member/count and never changes source coordinates or native administrative totals.",
        "Country point rendering is efficient; detailed original logos, readable names, role cues and existing popup actions remain available where appropriate.",
        "Coincident/overlapping records remain discoverable without moving their source coordinates.",
        "Filter/context/theme/route/resize updates retain map instance, permitted camera, drafts and source semantics; stale draw or popup work cannot overwrite a newer context.",
        "Actual core journeys and load/render/interaction timings are recorded with environment, dataset and limits; no zero-bug, all-device, all-network or backend guarantee.",
        "Actual TH/EN, light/dark, desktop/narrow all/grouped points and popup content are reviewed; old screenshots and test counts are not current acceptance."
      ],
      "verification": [
        "Suitesinventory+actualresults",
        "Visualsnapshots",
        "Security/failureflow tests",
        "check-map-clarity.cjs",
        "check-action-guidance.cjs",
        "check-icon-controls.cjs",
        "check-map-hierarchy.cjs",
        "check-strategy-guide.cjs",
        "Actual mobile Supply region/points canvas measurements and explicit expanded override",
        "Current map-space native measurements and sidebar/header/footer controls",
        "Current mobile-flow native scrolling/geometry evidence and unchanged desktop map-space behavior",
        "Current boundary/icon native contrast evidence, retained quantitative paint and mobile-flow regression",
        "scripts/check-supply-market-share.cjs",
        "scripts/check-supply-treemap.cjs"
      ],
      "codingPrompt": "Implement only T23: ตรวจรับ end-to-end และ production. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    },
    {
      "id": "T24",
      "title": "Seal publish และส่ง handoff",
      "dependsOn": [
        "T23"
      ],
      "dataPhase": "P0",
      "status": "PLANNED_PRODUCTION",
      "inputs": [
        "Approvedoutputscope",
        "Exactsourcecommit",
        "CurrentQAandpublicallowlist",
        "contracts/branch-points.v1.9.9.json"
      ],
      "outputs": [
        "Publishedpreview",
        "SinglefullMD",
        "Machinecontracts/assets",
        "VerifiedZIPandattestation"
      ],
      "steps": [
        "Sealonlyexplicitapprovedpaths afterfinalQA.",
        "Verifyassetreferences/bytes andsourcehashes, pushauthorizedcommit, awaitterminalproviderresult.",
        "VerifylivecriticalfilesHTTP/MIME/bytes/SHAatpublishedURL.",
        "Packageexactsource plusseparateexternalpostpublishreceipts/checksum; no secrets/rawpersonaldata."
      ],
      "acceptance": [
        "Releaseclaims pin exactsourceSHA/provider/livebytes.",
        "ArtifactZIPdownloadhashverified; historicalmanifestsnot overwritten.",
        "Honor all-points default and explicit optional screen grouping; preserve native totals/coordinates and document measured performance separately."
      ],
      "verification": [
        "Currentsealer/verifier",
        "ProviderterminalSHA",
        "Live-byteverification",
        "ZIP/APIassetdigest"
      ],
      "codingPrompt": "Implement only T24: Seal publish และส่ง handoff. Read the named contracts and existing stack map. Preserve all invariants and source snapshots. Write a pure or bounded module, run the listed acceptance checks, and report changed files, evidence, open gates. Do not implement a dependent task, change thresholds silently, deploy, or claim backend completion without evidence."
    }
  ],
  "acceptance": [
    "SupplyweightsandstrategiespreserveDemand/Tier/eligibleIDs",
    "Atmost3choicesperdeclaredpoint, serverandclient",
    "Savedcriteria/preset/sourceversionsisolatecontext",
    "Zero/missing/interval/outofscope distinct",
    "FuturewatchlistnotcurrentYolk",
    "Nativecountsnotcoordinatecoverage",
    "Markerbinnotphysicalcluster",
    "NoPOIedit/sourcecountmutation",
    "Oneacceptedmutation→oneEvent+Outbox",
    "No private data in public handoff",
    "ActualTH/ENnarrowdesktopreview required",
    "Provider/live-byteproofseparatefromlocalQA",
    "One scope-owned area tooltip at a time with name, key value and unit",
    "Branch points keep quiet boundary context without opaque interiors",
    "Only a successful new target produces actual shortlist count +1",
    "Reduced motion, interruption and unavailable destination preserve final saved state and readable status",
    "Owner-provided VillaMarket/Lawson108/Tops artwork binds to unchanged reporting identities with exact bytes/provenance",
    "Supply role captions and semantic icon glyphs remain readable at narrow widths without font collision or raw ligature text",
    "Merged first-page candidate queue is a projection of existing Demand/Supply/strategy outputs, never a new eligibility rule.",
    "Legacy#strategy remains a compatibility alias, preserving map/context/drafts.",
    "Neutral paired boundary strokes are pointer-inert and fill-free; they cannot filter or change analytical colors/opacity, POI marks or selectedfine interiors. Parent-only halo/drop-shadow is retired.",
    "Expanded/compact display state is personal navigation only, not a team criteria change.",
    "Tiles and analytics have separate loading/error/recovery states; no external availability or retry pass without evidence.",
    "Eight-strategy guide is read-only; all examples/diagrams are hypothetical and evidence limits remain visible.",
    "Each verified brand has a stable exact approved DS categorical swatch chosen near its original artwork primary color; names/counts remain readable in both themes; no artwork mutation.",
    "Near-Thailand envelope blocks unrelated distant panning/zooming without changing administrative scope or Demand membership.",
    "Expand/Compact settles the existing host and refreshes visible tiles while preserving map instance, permitted camera and unsaved work; clamp only out-of-envelope zoom/center; sampled native tiles visibly load after repeated cycles.",
    "Options/Expand and areas/points remain four usable, labeled, meaningful-icon buttons in one compact row at recorded narrow and desktop widths.",
    "All visible numerical quantities consistently use comma grouping and preserve precision/units/no-data/bounds, while calculation/storage/input values stay numerical.",
    "Actual TH/EN narrow/desktop and both themes are reviewed; per-state observed checks are not a physical-device/full-matrix certificate.",
    "Supply opens in Region colours; Branch points defaults to every filtered valid source coordinate without screen clustering or an arbitrary marker cap.",
    "Optional screen grouping lives in Map Options, preserves every member/count and never changes source coordinates or native administrative totals.",
    "Country point rendering is efficient; detailed original logos, readable names, role cues and existing popup actions remain available where appropriate.",
    "Coincident/overlapping records remain discoverable without moving their source coordinates.",
    "Filter/context/theme/route/resize updates retain map instance, permitted camera, drafts and source semantics; stale draw or popup work cannot overwrite a newer context.",
    "Actual core journeys and load/render/interaction timings are recorded with environment, dataset and limits; no zero-bug, all-device, all-network or backend guarantee.",
    "Actual TH/EN, light/dark, desktop/narrow all/grouped points and popup content are reviewed; old screenshots and test counts are not current acceptance.",
    "Release-query public JSON caching and concurrent script download preserve declared execution order, late-context guards and source-byte semantics.",
    "Failed browser-local persistence restores prior overlays/target/event state, keeps editable drafts and emits no false save success.",
    "Actual native pointer clicks operate close/page/back/detail/View branch controls inside the visible popup; Canvas must remain below popupPane and popup content must fit or scroll within the actual host. Keyboard-only or Node click dispatch is not pointer/placement acceptance."
  ],
  "verification": {
    "currentRelease": {
      "status": "PASS_BOUNDED_CURRENT_LOCAL_QA",
      "receipt": "evidence/qa-v1.9.9.json",
      "automatedReceipt": "evidence/automated-v1.9.9.json",
      "releaseChecksReceipt": "evidence/release-checks-v1.9.9.json",
      "nativeBrowserReceipt": "evidence/browser-v1.9.9/native-browser-review.json",
      "receiptSha256": "0576ee9c985a2449caed4230c34d3ae18ec9e60ad2d0c40a061c74e63261295d",
      "automatedReceiptSha256": "752140f94bdcf4b7bffb9726ca22a5dc848204322f8356764e91eac49760b448",
      "releaseChecksReceiptSha256": "cd7ec0fd3e0bbd8d8c2218f4f3b1514bb4b7333ee897c08e8ba0528c786f7eb3",
      "nativeBrowserReceiptSha256": "a40c879dc25a24d85f3f84f44ad3955c2cfa2cd2d605e3891abf9ee88720eaac",
      "automatedSuites": 40,
      "automatedChecks": 663,
      "checkCountMeaning": "Sum of positive actual reported test-case totals, named-case list lengths or exact PASS output lines; not individual assertion counts. Every suite freshly executed for1.9.9; no imported prior results.",
      "browserStatus": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
      "browserChecks": 11,
      "snapshots": [
        "evidence/browser-v1.9.9/desktop-th-dark-supply.jpg",
        "evidence/browser-v1.9.9/desktop-th-poi-search.jpg",
        "evidence/browser-v1.9.9/desktop-en-light-expanded.jpg",
        "evidence/browser-v1.9.9/mobile-en-light-details.jpg",
        "evidence/browser-v1.9.9/mobile-en-draft-detail.jpg",
        "evidence/browser-v1.9.9/desktop-th-shortlist-two-contexts.jpg",
        "evidence/browser-v1.9.9/mobile-th-dark-evidence-queue.jpg",
        "evidence/browser-v1.9.9/mobile-th-320-evidence.jpg"
      ],
      "snapshotFiles": [
        {
          "path": "evidence/browser-v1.9.9/desktop-th-dark-supply.jpg",
          "bytes": 147450,
          "sha256": "ef752e22f381f7f8d3f673eac07bbb53041d32c755dfec4201c23f3a94c6747a",
          "imagePixels": {
            "width": 1440,
            "height": 900
          },
          "viewport": {
            "width": 1440,
            "height": 900
          },
          "description": "Thai desktop, native branch count map; Escape dismissed boundary treemap tooltip without changing route."
        },
        {
          "path": "evidence/browser-v1.9.9/desktop-th-poi-search.jpg",
          "bytes": 120796,
          "sha256": "d44710e7dd720b333653708d6307659380ed001a70105351b919e01b96b8345e",
          "imagePixels": {
            "width": 1440,
            "height": 900
          },
          "viewport": {
            "width": 1440,
            "height": 900
          },
          "description": "Grocery individual points; dense-hit search and brand filtering retain focus/query and expose exact branch buttons."
        },
        {
          "path": "evidence/browser-v1.9.9/desktop-en-light-expanded.jpg",
          "bytes": 215146,
          "sha256": "0b558faa890db36c8a287ad998b592bdd0c459f8885fa2e1e5387ec0a7fe6c84",
          "imagePixels": {
            "width": 1440,
            "height": 900
          },
          "viewport": {
            "width": 1440,
            "height": 900
          },
          "description": "English light theme, expanded Grocery point map after explicit nearby zoom; basemap complete in observed view."
        },
        {
          "path": "evidence/browser-v1.9.9/mobile-en-light-details.jpg",
          "bytes": 37629,
          "sha256": "d9b521a0b916ad554633601f00863ab04bbc9d2bd30e3c73bf545107ccb45b57",
          "imagePixels": {
            "width": 390,
            "height": 844
          },
          "viewport": {
            "width": 390,
            "height": 844
          },
          "description": "Mobile viewport scrolled to work cards and survey action; normal page flow, readable English copy and Thai names, no horizontal overflow."
        },
        {
          "path": "evidence/browser-v1.9.9/mobile-en-draft-detail.jpg",
          "bytes": 48544,
          "sha256": "484e077fd468ea16c7cc3b826e5ab8f8b564d07153d70ee21e9246e20031f58b",
          "imagePixels": {
            "width": 390,
            "height": 844
          },
          "viewport": {
            "width": 390,
            "height": 844
          },
          "description": "Detail retains the private Demand draft, shows explicit team-criteria reset action without silently applying."
        },
        {
          "path": "evidence/browser-v1.9.9/desktop-th-shortlist-two-contexts.jpg",
          "bytes": 124874,
          "sha256": "a9eac096bca90b09b2b3b848a1c8c0275787999b7b3f94a7d3fa624e9c2f9bb9",
          "imagePixels": {
            "width": 1440,
            "height": 900
          },
          "viewport": {
            "width": 1440,
            "height": 900
          },
          "description": "Fuel shortlist preserved after different-context second-tab preference write and reload; readable evidence history."
        },
        {
          "path": "evidence/browser-v1.9.9/mobile-th-dark-evidence-queue.jpg",
          "bytes": 33980,
          "sha256": "2433e13b9326d87285f32781336073f31aec8f1e7ce4b7b8d9bd667c09a267e6",
          "imagePixels": {
            "width": 390,
            "height": 844
          },
          "viewport": {
            "width": 390,
            "height": 844
          },
          "description": "Thai mobile normal page flow, incomplete-evidence cards with reasons and shortlist action."
        },
        {
          "path": "evidence/browser-v1.9.9/mobile-th-320-evidence.jpg",
          "bytes": 30301,
          "sha256": "e6548f071993fb3271afa6e3b3cd35041fd507c597015603686cdacf433a2483",
          "imagePixels": {
            "width": 320,
            "height": 760
          },
          "viewport": {
            "width": 320,
            "height": 760
          },
          "description": "320px Thai evidence cards and actions readable; documentwidth320 and maprelative."
        }
      ],
      "physicalDevices": "unverified",
      "fullLanguageThemeMatrix": false,
      "scope": "Bounded actual local native review: main workflows across Fuel/Grocery/Nonbank, draft retention, two-tab cross-context writes, captured draft detail, dense-hit search/filter/exact POI, Escape hover, Expand tiles, evidence queues, TH/EN light/dark sampled states. Not full matrix/physical hardware/provider certification.",
      "productionBackend": "not_implemented_in_static_preview"
    },
    "semanticBaseline": "Analytical/source/model semantics remain unchanged; point rendering and broad core-journey/performance evidence need fresh v1.9.9 checks.",
    "newRegressionCommands": [
      "scripts/check-action-guidance.cjs",
      "scripts/check-analysis-integration.cjs",
      "scripts/check-bootstrap-loader.cjs",
      "scripts/check-branch-context.cjs",
      "scripts/check-brand-presets.cjs",
      "scripts/check-cold-branch.cjs",
      "scripts/check-criteria-controls.cjs",
      "scripts/check-criteria-map.cjs",
      "scripts/check-decision-evidence.cjs",
      "scripts/check-demand-factors.cjs",
      "scripts/check-form-drafts.cjs",
      "scripts/check-icon-controls.cjs",
      "scripts/check-location-review.cjs",
      "scripts/check-map-analysis.cjs",
      "scripts/check-map-clarity.cjs",
      "scripts/check-map-hierarchy.cjs",
      "scripts/check-map-hover.cjs",
      "scripts/check-map-lut41.cjs",
      "scripts/check-map-recovery.cjs",
      "scripts/check-map-redteam.cjs",
      "scripts/check-map-responsiveness.cjs",
      "scripts/check-opportunity-strategies.cjs",
      "scripts/check-pattern-counts.cjs",
      "scripts/check-photo-runtime.cjs",
      "scripts/check-poi-popup.cjs",
      "scripts/check-relative-supply.cjs",
      "scripts/check-save-context.cjs",
      "scripts/check-simple-criteria.cjs",
      "scripts/check-strategy-guide.cjs",
      "scripts/check-strategy-ui.cjs",
      "scripts/check-supply-compare.cjs",
      "scripts/check-supply-market-share.cjs",
      "scripts/check-supply-poi-modes.cjs",
      "scripts/check-supply-symbols.cjs",
      "scripts/check-supply-treemap.cjs",
      "scripts/check-three-industry.cjs",
      "scripts/check-unclustered-poi.cjs",
      "scripts/check-workspace-map.cjs",
      "scripts/check-workspace-transactions.cjs",
      "scripts/check-yolk-tier.cjs"
    ],
    "productionBackend": "not_implemented_in_static_preview",
    "physicalDevices": "unverified",
    "fullLanguageThemeMatrix": false,
    "designSystemPackage": {
      "status": "CURRENT_PACKAGE_PARITY_PASS_ONLY",
      "releaseRef": "v0.9.7-owner.1",
      "checks": 9768,
      "warnings": 65,
      "scope": "Package parity, theme-invariant Story and Location light values, inherited signed source, analytical math, CSS projection and standalone document/schema consistency only. No artifact or team-installation conformance claim.",
      "version": "0.9.7",
      "receipt": "evidence/lds-package-verification.v1.9.9.json",
      "receiptSha256": "a4160b26df2a4a414eaaf6c6806b20942b83bb328be9be97e732d9c3f2c82313",
      "artifactAndAccountTeamCertification": false
    },
    "newGuideRegression": {
      "command": "node scripts/check-strategy-guide.cjs",
      "scope": "Guide loader/controller/data/model through a native-dialog-shaped adapter; not actual browser geometry, Escape behavior, screen-reader speech or physical devices.",
      "currentIntegratedReceipt": "evidence/automated-v1.9.9.json",
      "nativeGuideReview": {
        "status": "bounded_native_pass",
        "receipt": "evidence/browser-v1.9.3/native-browser-review.json",
        "scope": {
          "englishDesktop": 8,
          "thaiMobile": 8,
          "englishMobile": 8,
          "examples": "hypothetical; illustrations are concept scenes, not measured map data"
        },
        "remaining": "Actual screen-reader speech and full brand-language-theme-device matrix unverified."
      },
      "evidenceMeaning": "Retained guide native evidence remains history; fresh current suite coverage is listed separately in currentRelease."
    },
    "retained1_9_3Review": {
      "receipt": "evidence/qa-v1.9.3.json",
      "sha256": "93c4f585ddf58a6000684a6a27c7c026df0b63759375632e675f75b73bb93cd9",
      "meaning": "Historical bounded baseline, not a1.9.4 pass."
    },
    "retained1_9_4Review": {
      "receipt": "evidence/qa-v1.9.4.json",
      "sha256": "b32165a28b2e1082b42e0297530377314b72c6bb5f8a343827d08ec15d3a23d2",
      "meaning": "Published historical bounded baseline; not a 1.9.5 pass."
    },
    "retained1_9_5Review": {
      "receipt": "evidence/qa-v1.9.5.json",
      "sha256": "2efc05f64f7dad7d775601ac5529b89a3ffd08e7e7a3cdcd815ae51c343e46df",
      "meaning": "Historical published baseline; not a 1.9.6 pass."
    },
    "retained1_9_6Review": {
      "receipt": "evidence/qa-v1.9.6.json",
      "sha256": "63e714d2982b88bea8579364ab437741bc35bd6d25bc5f19c673b664108e28ab",
      "meaning": "Historical bounded published baseline, never a current 1.9.9 pass."
    },
    "retained1_9_7Review": {
      "receipt": "evidence/qa-v1.9.7.json",
      "sha256": "cb94463ff088627cb25054a6656d1c5809d4bc1d44d79c0d7cef044406e8b3cd",
      "meaning": "Historical bounded published baseline, never a current v1.9.9 pass."
    },
    "persistenceBoundary": "Current browser-local locking/atomic snapshot and fault injection checks do not implement production shared backend/RBAC/outbox/private media."
  },
  "schemas": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$defs": {
      "Condition": {
        "type": "object",
        "required": [
          "metric",
          "percentile"
        ],
        "properties": {
          "metric": {
            "enum": [
              "population",
              "population_per_km2",
              "working_age_15_64",
              "working_age_15_64_per_km2",
              "adult_population_20_64",
              "adult_population_20_64_per_km2",
              "children_0_14",
              "population_65_plus",
              "gfa",
              "building_count",
              "gfa_per_km2",
              "gfa_per_person",
              "factory_count",
              "factory_count_per_km2",
              "factory_workers",
              "factory_workers_per_km2",
              "hotel_count",
              "hotel_rooms",
              "hotel_rooms_per_km2",
              "office_count",
              "office_count_per_km2",
              "fiscal_total_thb",
              "fiscal_ex_grants_thb",
              "fiscal_ex_grants_per_km2",
              "fiscal_ex_grants_per_person"
            ]
          },
          "op": {
            "enum": [
              "gte_percentile"
            ]
          },
          "percentile": {
            "type": "number",
            "minimum": 1,
            "maximum": 100
          },
          "positive_presence": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "TierPath": {
        "type": "object",
        "required": [
          "tier",
          "all"
        ],
        "properties": {
          "id": {
            "type": "string"
          },
          "factorId": {
            "type": "string"
          },
          "tier": {
            "enum": [
              1,
              2,
              3
            ]
          },
          "all": {
            "type": "array",
            "minItems": 1,
            "maxItems": 3,
            "items": {
              "$ref": "#/$defs/Condition"
            }
          },
          "label_th": {
            "type": "string"
          },
          "label_en": {
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "DemandFactor": {
        "type": "object",
        "required": [
          "id",
          "enabled",
          "tierPaths"
        ],
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1
          },
          "enabled": {
            "type": "boolean"
          },
          "label": {
            "type": "object",
            "required": [
              "th",
              "en"
            ],
            "properties": {
              "th": {
                "type": "string"
              },
              "en": {
                "type": "string"
              }
            }
          },
          "tierPaths": {
            "type": "array",
            "minItems": 1,
            "items": {
              "$ref": "#/$defs/TierPath"
            }
          }
        },
        "additionalProperties": false
      },
      "SelectedStrategies": {
        "type": "array",
        "minItems": 1,
        "maxItems": 3,
        "uniqueItems": true,
        "items": {
          "enum": [
            "underserved_market",
            "segment_gap",
            "competitive_entry",
            "cluster_participation",
            "complementary_location",
            "route_capture",
            "network_infill",
            "future_entry"
          ]
        }
      },
      "RankingWeights": {
        "type": "object",
        "required": [
          "demand",
          "ownGap",
          "competitorGap"
        ],
        "properties": {
          "demand": {
            "type": "number",
            "minimum": 0,
            "maximum": 100
          },
          "ownGap": {
            "type": "number",
            "minimum": 0,
            "maximum": 100
          },
          "competitorGap": {
            "type": "number",
            "minimum": 0,
            "maximum": 100
          }
        },
        "additionalProperties": false
      }
    },
    "additionalSemanticValidation": [
      "At most3 enabled Demand factors; each factor uses at most3 distinct metric IDs across all its paths",
      "Factor IDs unique; condition metric IDs in same AND path unique; no contradictory silent deduping",
      "Compile enabled factor paths only; path factorId matches owner factor ID",
      "Positive sum of ranking weights; positive raw extensive denominator; invalid source state not coerced",
      "Server tenant/context/source/profile/baseRevision/idempotency authorization and validation",
      "JSON Schema fragments are in schemas.$defs with local #/$defs refs; compile the registry with a $ref to the chosen definition plus semantic validators."
    ],
    "compilePolicy": "Compile {$schema, $defs, $ref: #/$defs/<definition>} for the chosen DTO plus the listed semantic validators."
  }
}
```
