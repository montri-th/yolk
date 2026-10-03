# CityMETER evidence for three-industry Yolk

Acquired public CityMETER APIs on 3 October 2026, without credentials. Existing Sheets and original repositories were not changed. All source requests and exact uncompressed SHA-256 hashes are recorded; original JSON responses are preserved losslessly in the local acquisition archive, not distributed in this public repo. Runtime projections are under prototype/data/real/.

The screening universe has **7,954 exact source UUIDs: 180 Bangkok khwaeng and 7,774 outside-Bangkok CityMETER municipality/TAO units**. Every UUID, code, name and land area matches the prior national universe. Direct area summaries avoid Locale allocation. Current legal boundary vintage and full national non-overlap topology have not been independently verified; do not call the source geography legally certified.

## Ready inputs

| File | Contents |
|---|---|
| `areas-context.json`, `areas-context-by-id.json` | All 7,954 units, original IDs, labels/province/cohort, land area, fit-only extent/bbox, 25 metrics with values, states, source keys and quality flags |
| `areas-context-flat.csv` | Flat numeric view; empty cells represent missing, not zero |
| `metric-catalog.json` | Raw fields, period, unit, formula/denominator meaning and measured/model/proxy scope for all 25 metrics |
| `pinc-distributions.json` | P50/P75/P90/P95/P99 with fixed known-value cohorts, zero/tie rules and N; national 7,954 is the user-requested default, BKK/LAO results are diagnostics |
| `source-catalogue.json`, `schema-sample.json` | Source availability, supported grains, source keys and actual example rows |
| `grocery-area-supply.json` | All 7,954 direct source categoryStats by exact format/brand |
| `nonbank-area-supply.json` | All 7,954 direct source office/company counts and mapped count, with potential license-scope counts |
| `nonbank-assignment-uncertainty.json` | Exact province/company residuals and geographic assignment bounds; never ordinary unknown-brand allocation |
| `fuel-area-supply.json`, `fuel-merged-qa.json` | All 7,954 current published merged brand counts; national and every brand reconcile |
| `supply-peer-distributions.json` | Actual source own/peer count distributions for C_STORE/SEVEN_ELEVEN and legal company 0107557000195 |
| `quality-assurance.json`, `metric-coverage.json` | Recomputed formulas, finite values, missing/zero states and coverage |
| `country-reconciliation.json`, `province-reconciliation.json` | Unallocated source aggregate/detail residuals |

## Demand context coverage

| Signal | Valid / 7,954 | Source period | Meaning |
|---|---:|---|---|
| Total reported population, age15–64, age20–64 and densities | 7,830 | 2026-08 | Administrative-area age population context; not customers, employment or borrowers |
| Estimated GFA, building count and GFA/land-area | 7,939 | V4, frontend label 2024-12 | Modeled GFA/building inventory; not occupied residential area or household count |
| Estimated GFA/person | 7,828 | GFA2024-12 / population2026-08 | Mixed-vintage ratio; denominator must be positive |
| Registered factory count/workers and land densities | 5,822 | ACTIVE2025-04 | Registry context; 13 explicit zero worker rows; no measured attendance or traffic |
| Hotel property/room catalog and room land density | 7,506 | Effective date unpublished | 3,494 explicit zero rows; catalog capacity, not occupancy/arrivals |
| Office catalog and land density from direct summaries | 45 | V3, frontend label 2025-05 | 329 BKK catalog buildings; 7 outside-BKK buildings lack direct LAO summaries; absent stays null |
| Local fiscal receipts / grant-excluded receipts / land density | 7,751 | Source year2024 | Public fiscal context, not household income or purchasing power |
| Grant-excluded fiscal receipts / fiscal population | 7,717 | Fiscal2024 / denominator vintage unknown | Source fiscal population is a separate denominator; BKK not applicable |

All population age arrays have 102 male and 102 female slots. The public frontend iterates age index n and reads ms[n]/fs[n]. Adult20–64 is `sum(ms[20:65])+sum(fs[20:65])`; its density divides the same value by `base.areaSqm / 1,000,000`. Independent recomputation passed all 7,830 valid population rows; 124 missing rows remain missing. `age-index-formula-evidence.json` records the client URL/hash and indexing excerpts.

Population local sums differ from their province summaries in 75 of 77 provinces; national direct-area sum is short by 891,286. Building local GFA is short by 14,165.46 estimated m² and 64 modeled building records. Factory local sums exceed country by 5 factories/266 workers. Hotel local rooms are short by 2,709. No discrepancy was spread, scaled or assigned to missing areas. These are CityMETER reported proxies; the upstream official municipal population generation has not been independently validated.

Additional public inventory snapshots exist for school-year/type/size strata (latest2024, country+BKK) and derived Road DNA (BKK180 subdistricts; country response currently contains only BKK). They are not among the validated 25 screening metrics. No complete comparable household spending, measured customer traffic, loan need or branch offering dataset was established. No household, traffic or borrower values were invented.

## Industry supply and peers

- **Grocery:** compare the exact selected `store_type_raw` using categoryStats. C_STORE totals 26,337 on the selected units. For SEVEN_ELEVEN, local own counts sum 16,487 and other C_STORE counts sum 9,850. National source own aggregate 16,488 differs by one; NMA TOOGDEE local +1 and SNI SevenEleven local −1 cancel the all-format total. Preserve those assignment differences. Pharmacy is a separate format. The 27,608 aggregate is the covered public catalog, not a census of every Thai grocery or franchise capacity. The previously acquired POI details contain 27,607 IDs; the one Ko Tao aggregate/detail gap remains documented.
- **Non-bank:** national counted cohort23,524 offices (1,233 directory companies) plus54 BOT_HQ references in a separate cohort. All 7,954 local summaries assign17,990 counted records; mapped records17,752 reconcile exactly, and5,534 offices remain unassigned to the selected local units. Local zeros are assigned-source zeros, not proved absence. Province/company residuals bound possible own/peer counts for one area; never allocate the same residual into every area total. MTC company0107557000195 has6,462 locally assigned versus8,738 national records. Company license status describes potential company scope, never actual branch operation, offering or borrower demand.
- **Fuel:** use the current public `gasStation/brandCountsMerged` and `gasStation/brandStats` data: national8,736 and every selected-area brand sum reconcile exactly. Adding legacy4,124 and scraped4,637 yields8,761, differing by25 from the published merged result. Do not replace merged data with that additive total or claim physical/current operational deduplication was independently proven. UNKNOWN3,130 is unknown brand, distinct from verified unbranded.

Own/peer count thresholds are configurable screening hypotheses. For positive C_STORE own areas, source P50=2/P75=3; other-chain P50=1/P75=2. For positive MTC assigned own areas, P50=1/P75=2; other assigned-company P50=2/P75=5. Those counts support transparent repeat-network examples, not business capacity cutoffs.

## Mapping

`direct-area-geometries.geojson` and `direct-area-geometries-by-id.json` contain18 actual source WGS84 MultiPolygons, each tied to the exact UUID and original source snapshot. Every ring is closed; coordinates are finite and match the source extent within0.0000005 degrees. No bbox rectangle, tile clipping, polygon simplification or invented adjacency was used. The observed endpoint is `grocery/info/geom/{UUID}/{SUBDISTRICT|MUNICIPALITY}`—ID first. Other units retain source extent for fit-only use until their actual outline is fetched. This is source geometry, not independent certification of statutory boundaries/non-overlap.

`nonbank-bkk-points.json` preserves1,658 unique BKK province records. Exact single-area membership covers1,596 counted offices plus31 separate BOT_HQ references; all1,358 mappable counted records match their khwaeng summary. The remaining31 counted unmapped records appeared in multiple khwaeng queries as coarser records and retain `area_id=null`, with candidate relations in `nonbank-bkk-membership-ambiguous.json`. No name/address/bbox join was substituted. See `nonbank-bkk-membership-qa.json`.

Grocery BKK POIs already have exact source subdistrict-overlay membership. Upcountry grocery/non-bank province points are not automatically assigned to municipalities. Existing fuel source positions carry source subdistrict membership, but the position audit is separate from merged area counts; z0 quantized points are not precise site locations. `poi-input-inventory.json` records safe source paths.

## Existing Fuel workbooks

Read-only Drive metadata confirms [CityMETER Gas Station Master Data V4 — 2026-09-26](https://landometer.com/v3/citymeter) and [CityMETER × บางจาก — P3 v2.1 โรงงานแทนสำนักงาน · Tier 5/3/1 — 23 ก.ย. 2569](https://landometer.com/v3/citymeter). These remain unchanged. Fuel defaults belong to the Fuel contract; they are not borrowed for Grocery/Non-bank.

## Reproduction

Run `acquire_context.py`, `acquire_fuel_brand.py`, `normalize_context.py`, `derive_supply_qa.py`, `acquire_membership_geometry.py`, `acquire_geometry_correct.py`, `normalize_membership.py`, `finalize_mapping.py`, then `validate_and_catalog.py`. Only public acquisition scripts require network access. The last validation confirms formulas and refreshes per-row source-quality flags. The unsuccessful exploratory Type/ID geometry paths are preserved in probe metadata; the corrected ID/type paths succeeded. Never modify old source snapshots or native Sheets to reproduce this package.

## Public distribution boundary

This repo distributes compact runtime projections and evidence summaries. File names above describe the full local acquisition archive; they are not claims that all raw/normalized inputs are bundled here. Working workbook links are omitted from public distribution.
