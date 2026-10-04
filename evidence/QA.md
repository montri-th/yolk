# Yolk — public QA boundary

## Current release: 1.7.0 · 4 October 2026

The current preview retains the exact source snapshot values and national Demand cutoffs. New brand contexts start with relative Supply; saved count-mode criteria/drafts remain count mode until explicitly changed. Geometry coverage now includes928 districts and all7,954 reporting UUIDs. One persistent map supports all5 main routes; selected fine areas have **no interior fill**, so the basemap remains visible.

| Current check | Actual scope |
|---|---|
| Runtime regressions | **126 checks passed**: core30, brand13, photos28, map20, paired controls12, asynchronous save context9, relative Supply14. Core30 intentionally checks the preserved count baseline; relative Supply14 separately checks37 default and66 alternate brand/scope contexts ×7,954 areas. See [bounded receipt](release-checks-v1.7.json). |
| Compact brand identity | 34 of37 brands have verified official compact originals;34 usable in light and33 in dark. COSMO, PURE and Lawson108 use neutral icon/name; Saksiam also falls back in dark. Sources, hashes, native dimensions and theme variants are in the [runtime manifest](../prototype/data/brand-logos.v1.7.json). No crop, redraw, recolour or added frame. |
| Native browser review | Chrome at320×740,390×844,768×1024 and1440×900; actual TH/EN light/dark layouts, accessible map options/Escape, source polygon drill-down, retained map across5 routes, selected transparent outline, and logos for3 industries. [Receipt and gallery](browser-v1.7/browser-qa.json). |
| Source geometry | 928 districts +7,954 fine polygons are valid after disclosed repair/simplification;7909 UUIDs have one district parent and45 have multiple parents. This is a view crosswalk, not a statutory boundary decision. Source model metric areas remain unchanged. |
| Design authority | LDS0.9.7 package/source integrity was verified at9,768 checks; static artifact colour checks and rendered review are separate, bounded checks. Package validation is not whole-product accessibility certification. The full dependency static scan retains inherited Leaflet/UI compositing findings; see [actual scope](ds-artifact-scope-v1.7.md). |
| Publication | The manifest/source/privacy/dependency check is run after sealing. Exact provider commit success, live bytes and final live browser review are recorded separately after deployment. |

For fresh default contexts, relative Supply gives confirmed/review results: Bangchak **987/64**, Seven-Eleven C_STORE **1779/30**, MTC **28/1194**. Demand proxy-high remains1067/2859/2298. These are reproducible screening outcomes, not purchases, traffic, lending propensity or sales. MTC uses an explicit1-per10,000-person exploratory fallback because there are no exact positive source-count rows meeting the calibration sample conditions; uncertain assignments remain intervals.

Physical iPhone/Safari/Firefox, native touch,200% zoom, exhaustive accessibility/contrast and shared server workflows are still not certified. This public preview uses browser-local state, not shared enterprise authentication, real team delivery or live Sheets sync.

## Historical evidence: 1.6.1

UX1.6.1 adds a persistent criteria map, paired range/exact controls and UUID-based area/rank comparisons. All runtime real-data JSON, accepted industry profiles, criteria proposal, parameter presets and metric definitions remain byte-identical to published commit12d1d030. Fonts, logo, analytical colours and icons remain LDS0.9.7 assets.

| Check | Actual evidence |
|---|---|
| Core runtime | [30 checks](three-industry-core-checks.json), including default results, brand isolation, national thresholds, unknown Supply and cold event races |
| Branch photos | [28 checks](three-industry-photo-checks.json) |
| Data/source integration | 26 checks /2.44 million comparisons; [bounded summary](data/INTEGRATION_QA.md) |
| Independent criteria/Supply | [21 criteria checks](independent-criteria-check.json) +[20 Supply checks](independent-supply-check.json); proposed production checks remain pending |
| DS package | [9,768/9,768](lds-package-verification.json), package/schema/colour/source coverage only |
| Rendered local UI | Grocery72 unique states:9 routes ×desktop/mobile ×TH/EN ×light/dark, plus initial state and targeted Fuel/Nonbank/map/event checks. [Representative gallery](../docs/EXPERIENCE_v1.6.md) |
| Public projection | Current source manifest/dependency/privacy checks via scripts/verify-pages-v1.6.py; provider workflow and live-byte/runtime checks are separate release evidence |

Default high/confirmed/review: Fuel1067/915/79; Grocery2859/1455/14; Nonbank2298/37/1378. These are reproducible source/default results, not measured purchases, visits, borrowers or sales forecasts.

Viewport emulation is not a physical iPhone, Safari or Firefox test. Native device, exhaustive contrast, zoom, system/offline and shared backend checks are not certified by this publication. Local browser logs and raw acquisition files remain in the accepted local handoff; they are not included in the public site.

Public edits remove workbook URLs while retaining public CityMETER dataset links, put the two bootstrap contracts within /yolk/, restore canonical/social metadata, update install manifest theme colours and re-render the approved share composition at1200×630 for1.6. App/model parameters and source record values are unchanged.

## Criteria workspace1.6.1

[Browser receipt](criteria-workspace-v1.6.1/browser-qa.json) records actual TH/EN light/dark renders at1440×900,1366×768,1000×768,390×844 and320×740, mouse/keyboard range operation, precise P99.7, province selection, blank-input pause and expanded-view resize/focus. [18 map checks](criteria-workspace-v1.6.1/map-checks.json) and [11 control checks](criteria-workspace-v1.6.1/control-checks.json) are focused contract tests; they do not replace rendered checks. Core30 and photo28 were rerun with unchanged default results. The historic source-integration audit above was not repeated for this UI-only change; byte parity is recorded instead.

Changing Fuel own-high3→4 yields915→966, +51/−0. A weight-only20→21 yields915→915 with726 ranks changed. Membership and ordering are intentionally separate. Province summaries are retained because the source has only18 verified detailed polygons; badges are area counts, not branch coordinates.

## Patch 1.7.1 — 2026-10-04

179 bounded automated checks pass, plus exact ordered-row model parity across 12 cases × 7,954 reporting UUIDs. Native Chrome review covered POI popup TH/EN, light/dark at 1440×1000 and 390×844, settled zoom, cold branch route, criteria input/reset and the three hover/click hierarchy levels. Hover uses an exact unfilled source target independently of choropleth grain; mobile popup expansion retains its eligible anchor during autopan without counting offscreen anchors as within-view pins. [Release review](release-checks-v1.7.1.json) records scope and limits; [implementation guide](../docs/RESPONSIVENESS_v1.7.1.md) and [machine contract](../contracts/responsiveness.v1.7.1.json) describe the patch. Physical-device/Safari/Firefox timing and actual external Google provider availability remain unverified. The stopped 515-case exploration is not a pass.
