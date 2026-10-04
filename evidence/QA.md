# Yolk 1.6.1 — public QA boundary

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
