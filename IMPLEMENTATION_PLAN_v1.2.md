---
title: "CityMETER: Yolk — developer implementation plan"
version: "public-preview-1.3"
status: "proposed-production-contract"
task_ids: ["00", "01", "02", "03", "04", "04b", "05", "06", "07", "08", "09", "10"]
source_policy: "Public demo fixtures are synthetic; approved real data is imported privately"
---

# CityMETER: Yolk v1.3 · 12 core tasks + experience extension

This plan turns the static, **synthetic** web preview into a tenant-safe production product. The public repository is an interaction/design reference; its place and POI examples are **not operational data**. Use an approved private CityMETER/customer data release only after the import gate below. The module names, commands, APIs, and migrations here are implementation contracts to create, not claims that a backend already exists.

**Product baseline:** Bangchak/fuel is the first configured business context. Bangkok analysis uses **khwaeng**; outside Bangkok it uses verified, non-overlapping area-level **อปท. / LAO** boundaries. Province is initially a navigation/summary layer. All national percentile comparisons use one pinned cohort and data release. Team default: **1 Admin, 3 Editors, 6 Viewers**. UI: Thai/English and Landometer DS 0.9.4.

## Read this before coding

Current preview release status is **`ready_with_open_manual_gate`**. Browser visual/responsive QA remains open; deployment or source tests do not close it. The v1.2 filename stays stable for existing links.

1. Read the [product statement](CityMETER_Yolk_Product_Brief_v1.2.md) for user jobs and domain terms, [DS asset integration](DS_ASSET_INTEGRATION.md) for visual authority, and [the asset manifest](contracts/ds-assets.v1.2.json) for exact shipped bytes. Pin hashes; do not load assets from a developer's home directory or an unversioned `latest` URL.
2. Use the public preview only as a **synthetic fixture**. Keep public code/tests free of private source rows, customer POI records, member records, secrets, or source-artifact links. Production snapshots belong in access-controlled storage and are referenced by release ID/checksum.
3. Build each task as a vertical slice with migration, DTO/API, UI, tests, and traceability. Preserve the last published run on job failure. Treat `missing`, `observed_zero`, `unverified`, and `not_applicable` as different states.
4. Use the existing CityMETER infrastructure if it already provides these guarantees. The suggested monorepo below is a mapping, not a requirement to duplicate services.
5. Read [EXPERIENCE_v1.3.md](docs/EXPERIENCE_v1.3.md) and [experience.v1.3.json](contracts/experience.v1.3.json) for persisted themes, readable bilingual UI, explicit location geometry/POIs/basemaps and max-five branch photos. These extend tasks 00, 02/03 and 04/07 without changing the criteria engine or analytical counts.

### Scope and dependency graph

| ID | Deliverable | Depends on |
|---|---|---|
| 00 | Runnable shell, contracts, DS, CI | — |
| 01 | Source catalog and private import gate | 00 |
| 02 | Geography universe/crosswalk | 01 |
| 03 | Read-only map/list/detail | 01, 02 |
| 04 | Supply CRUD and verification | 00, 01, 02 |
| 04b | POI-to-aggregate reconciliation | 04, 06 |
| 05 | Pure Demand/Supply criteria engine | 01, 02 |
| 06 | Shared criteria and immutable runs | 03, 05 |
| 07 | Shortlists, contextual feeds, notifications | 04, 06 |
| 08 | Activity summary/leaderboard | 07 |
| 09 | Extensible metric catalog | 01, 02, 05 |
| 10 | Sharing, bilingual/mobile QA, release | 03–09 |

The shortest useful sequence is **00 → 01 → 02 → 03**. Tasks 04 and 05 can then proceed in parallel; 06 joins them. Task 04b waits for the run-publishing path in 06. Task 09 can add adapters without delaying a pilot whose core source release passes gate 01.

### v1.3 extensions, executed within the core tasks

| ID | Add to | Deliverable and acceptance |
|---|---|---|
| EXP-01 | 00, 10 | Personal light/dark/system preference, prepaint resolution, OS/storage sync, readable Thai/English and complete component themes; preference changes never notify the workspace |
| EXP-02 | 02, 03, 10 | Versioned GeoJSON boundary and coordinate-aware POIs, fit-only bbox, accessible list, Simplified/Detailed OSM and labelled 2021 10 m satellite basemap, resilient tile failures |
| EXP-03 | 04, 07, 10 | Five-photo cap, local draft UX, production private object storage, server upload validation/RBAC, optimistic revision and one branch/event/outbox DB transaction |

Follow the ordered steps in [the v1.3 extension](docs/EXPERIENCE_v1.3.md). Object storage and database writes are not one atomic transaction: stage uploads, validate, commit metadata/event, then promote or clean orphan objects idempotently.

## Suggested repository contracts

```text
apps/web                 TH/EN map, list, detail, criteria, supply, activity
apps/api                 authenticated, workspace-scoped HTTP API
apps/worker              import, analysis jobs, event outbox
packages/contracts       versioned JSON Schema/OpenAPI and event DTOs
packages/domain          workspace, roles, targets, POI, events
packages/criteria-engine pure percentile, tier, pattern and ranking functions
packages/geo             cohort, crosswalk, spatial aggregation
packages/data-adapters   approved source → normalized observations
packages/ui              pinned LDS wrappers and accessible components
packages/i18n            th-TH/en-US dictionaries
db/migrations            ordered, reversible schema changes
fixtures/synthetic       public edge cases, explicitly marked synthetic
tests                    contract, engine, API, browser, accessibility
```

PostgreSQL/PostGIS is a sensible reference stack for spatial records; an existing stack is fine if it preserves stable IDs, spatial predicates, transactions, idempotency, revisions, row/tenant isolation, and immutable published results. Do not mix domain calculations into map components.

### Core entities and ownership

| Entity | Key fields / invariant |
|---|---|
| `Workspace`, `Membership` | `workspace_id`, `user_id`, role, active interval; enforce 1/3/6 seat limits and an Admin handoff path |
| `SourceRelease` | release ID, source owner, licence, schema version, as-of/period, checksum, approval, coverage |
| `GeographyProfile`, `AnalysisUniverse`, `Place` | versioned boundary type/geometry, stable place ID, non-overlapping cohort membership, province relation |
| `MetricDefinition`, `Observation` | field mapping, unit, grain, period, quality, zero/missing semantics, provenance |
| `POISource`, `POIOverlay`, `Brand`, `Verification` | immutable licensed source record plus workspace edit/review, physical-site identity status |
| `ScenarioVersion`, `AnalysisRun`, `Result`, `PublicationPointer` | immutable inputs and criteria; one atomic pointer to the currently published run |
| `Target`, `CustomField`, `Task`, `Note` | workspace-owned shortlist work, revision, archive state |
| `ActivityEvent`, `Outbox`, `Notification` | one committed mutation → one event ID → feeds and recipient notifications |

Every tenant-owned read/write is authorised **server-side**. A client-supplied workspace ID is not proof of access. Source data and workspace overlays remain separate; refreshes never erase notes or verification history.

## Production data import gate

Production adapters may ingest CityMETER or customer snapshots **only through a private, reviewed release**. The public preview has no such release and must continue to label all area/POI records synthetic. Import flow:

1. Register data owner, permission, intended use, schema, source period, refresh policy, checksum, and storage location without exposing secrets in the repository.
2. Map source IDs and fields to canonical `place_id`, metric IDs, units, period, and quality states. Reject joins by place name alone; keep a versioned crosswalk.
3. Run `import:preview`: report coverage, duplicate IDs, overlaps, missing/invalid values, denominator problems, changes versus prior release, and records quarantined for review. It writes no published results.
4. Admin reviews the diff and commits an idempotent `SourceRelease` under access control. Build an immutable analysis run from that release and criteria version. Publish only after contract, geography, distribution, and result QA pass.
5. Retain source, transformation, and previous run IDs for audit. A later POI source period does not silently update earlier aggregate Supply counts.

The import gate must fail closed for unlicensed data, missing coverage metadata, ambiguous boundary identity, unknown units, invented zeros, invalid geospatial membership, or a source file containing executable formulas. A pilot may show a partial data metric only when the UI carries the partial-coverage reason; it must not present a national ranking as complete.

## Twelve vertical tasks

### 00 · Runnable foundation

**Build:** app shell, local development command, CI, migration runner, shared DTO generation, feature flags, `th-TH`/`en-US` dictionaries, accessible navigation, synthetic workspace seed, and exact DS asset loader. Load `color-srgb-07.production.css`, fonts, registered motifs, and runtime logo according to [DS_ASSET_INTEGRATION.md](DS_ASSET_INTEGRATION.md). Verify `contracts/ds-assets.v1.2.json` SHA-256s at build time. A motif is decorative, never a score mark or replacement logo.

**Accept:** a new dev can clone → install → migrate → seed synthetic data → run web/API/tests; CI fails on contract drift, missing DS bytes, missing font licences, secrets, or private data fixtures. No real data is required to boot.

**v1.3 extension:** implement EXP-01 here. Use exact DS token aliases, persist a personal theme with default `system`, and keep this setting out of shared activity/leaderboard. Run controller tests now and record browser/manual checks separately.

### 01 · Source catalog and approved import

**Build:** `SourceRelease`, metric registry, read-only adapters, import preview/commit, checksum/idempotency, provenance and per-metric coverage. Normalize value, unit, period, and quality in one place. Keep raw input in restricted storage and normalized observations in the database.

**Accept:** a deterministic synthetic fixture imports identically on retry; true zero remains zero; blanks remain unknown; an invalid unit/ID/period is quarantined; no public build or log contains private rows. A production release cannot be committed without documented owner/permission and QA sign-off.

### 02 · Geography profile and crosswalk

**Build:** `bkk_khwaeng_upcountry_lao` profile. Use khwaeng for Bangkok; outside Bangkok resolve area-level municipality/SAO and eligible special-form LAOs via verified type/ID allowlist. Exclude province-wide PAOs and overlapping layers from the same analytical universe. Version boundary geometries, effective periods, source-to-place crosswalks, and metric-specific aggregation methods.

**Accept:** every source entity maps once or enters a review queue; overlaps/gaps and unmatched IDs are reported; area is measured in km² with denominator lineage; province filtering does not recompute the national cohort. Future province/district/subdistrict/custom modes generate a **new** universe, raw aggregates, and benchmark rather than averaging old percentiles.

### 03 · Read-only market, list and location detail

**Build:** one published-run API for country map, ranked list, and detail. A province choropleth is a drill-down summary; labels say what its colour measures, which local units qualify, the known coverage, and the source period. Detail begins with `MarketLandscape`: Demand values/units/cutoffs/national percentile ranks; B/C/U aggregate counts; brand breakdown only where a real POI source has coverage; eight-pattern matrix with unknown states; shortlist entry point. Draw POI points only when approved coordinates exist.

**Accept:** map, list, and detail show the same `run_id` and place IDs; no area or branch in the production UI is taken from synthetic public fixtures; missing-data and no-eligible states are distinct; map has an equivalent accessible list; colour is not presented as a parcel or sales prediction.

**v1.3 extension:** implement EXP-02 here after task 02. Draw only explicit Polygon/MultiPolygon geometry with source/version/status; bbox is fit-only. A `source` polygon is not automatically `verified`. The public map scene remains synthetic and cannot modify Supply.

### 04 · Supply CRUD and verification

**Build:** source/overlay separation for our, competitor, unknown/unbranded POIs; brand catalogue; create/edit, duplicate review, verify, archive and restore; optimistic revision; custom fields and acquisition candidate flag. Every committed workspace edit records actor, time, before/after, and an outbox event in one transaction.

**Accept:** Viewer writes are rejected at the API; tenant IDs cannot cross workspace boundaries; no-op/retry does not duplicate an event; unknown brand/operating status stays unknown; source records are never overwritten by an overlay. A POI edit is marked **pending aggregate reconciliation** and does not instantly change the published B/C/U counts.

**v1.3 extension:** implement EXP-03 photo CRUD here, then connect events in 07. Enforce at most five active photos again under a branch revision lock; validate staged uploads server-side; persist branch metadata, photo changes, one event and outbox together. Keep signed URLs and image bytes out of event payloads.

### 04b · Reconcile physical sites and Supply counts

**Build:** compare imported aggregate counts with canonicalised POI records. Resolve duplicate layers/brands, physical-site identity, boundary membership, operating status, completeness, source period, and missing/extra sites. Show proposed B/C/U changes and their reasons; a reviewer publishes a new source/reconciliation version and task 06 run.

**Accept:** multiple source records are not counted as multiple physical branches without evidence; matching totals alone do not prove same vintage or completeness; failed/partial reconciliation leaves last-good results visible with a review badge; prior runs remain reproducible.

### 05 · Pure Demand/Supply criteria engine

**Build:** documented `PERCENTILE.INC` implementation over the pinned national cohort; deterministic ties and zero-cutoff behaviour; versioned metric switches, thresholds, high/low/unknown flags, demand tiers, eight-pattern classification, and ranking. Baseline fuel building signals: GFA, GFA/person, GFA/km²; activity: factory count, factory/km², factory workers, workers/km², hotel rooms, rooms/km². Building tiers: P99 all 3 / P95 all 3 / P95 ≥1. Activity tiers: P95 hits ≥5 / ≥3 / ≥1. Either enabled group may qualify demand. Default high B and C thresholds are each 3. Explain ranking separately from a choropleth's colour metric.

**Accept:** pure unit fixtures cover exact cutoff/ties, missing vs measured zero, denominator zero, disabled groups, unknown B/C, tier precedence, all eight patterns, and stable ordering. Disabled metrics do not count as misses or hits. If all Demand groups are disabled, block apply with a clear explanation. Preview is private and creates no shared event.

### 06 · Shared criteria and immutable publication

**Build:** `validate → private preview → apply(base_revision) → analysis job → atomic publication pointer`. Admin/Editor can apply shared changes; Viewers can preview privately. Store scenario version, source release, geography profile, metric catalogue version, code version, and output hash with each run. Make pending/failed/latest-good states visible.

**Accept:** concurrent applies produce a conflict, never silent last-write-wins; a failed job cannot remove the last good result; map/list/detail switch to one new run together; rollback creates a new revision; the event says who changed which field and when.

### 07 · Shortlists, contextual feeds and notification inbox

**Build:** targets for areas and later street/parcel candidates, owner, status, notes, attachments metadata, custom fields, history, and context feeds for place/criteria/supply. Fan out a committed event to other currently authorised members via an outbox; store per-recipient read state and a stable cursor.

**Accept:** one mutation/event ID appears consistently in relevant feeds and notification links; actor does not notify themselves; revoked members cannot retrieve old private payloads; delivery retry is idempotent; local drafts, views, searches, and read receipts are not shared actions. Data refresh preserves shortlist work.

### 08 · Activity summary and leaderboard

**Build:** projection of committed human operations by actor, category, time interval, affected record count, and distinct entity count. Show the default recent-period view and drill-down to the events. Bulk changes count as one action plus their affected-record count.

**Accept:** totals equal category subtotals; no-op, failed writes, clicks, reads, login, system refreshes, and delivery retries do not earn action counts; ties share rank; timezone and `[from,to)` are explicit; UI does not imply employee-performance quality.

### 09 · Expand demand metric catalogue by evidence gate

**Build:** reusable metric adapters for other industries and candidate signals such as population, schools/students, large schools, large hospitals, retail destinations, factories and workers. Each metric declares source schema, unit, denominator, period, geography grain, coverage, privacy rule, semantic meaning, and aggregation. A large-school or large-hospital metric remains disabled until a defensible size measure and threshold exist.

**Accept:** catalog displays `ready`, `partial`, or `blocked` with reason; hospital count is never presented as beds; missing coverage is not zero; new metrics add a catalog/preset version and distribution QA; a business preset does not assert actual traffic without validation.

### 10 · Sharing, responsive/i18n quality and release

**Build:** server-checked share grants and revocation, link previews, optionally email/LINE delivery adapters after a workspace explicitly enables them; mobile-first page flows, desktop panels, TH/EN completeness, focus and touch behavior, 200% text zoom, reduced motion, accessible map/list equivalence. Verify the deployed DS asset requests and logo treatment.

**Accept:** a user can go map → place detail → criteria preview → shared apply → Supply edit → contextual feed on phone and desktop; expired/revoked links fail; exports obey tenant and source permissions; visual/browser QA uses the actual build at 390/768/1440 CSS px; production readiness has data-source, permission, security, geography, and DS sign-off. Record a pending state for any check not actually run.

## API sketch and migration order

| Migration | Tables |
|---|---|
| `001_workspace_identity` | workspace, membership, role/seat constraints |
| `002_sources_geography` | source_release, geography_profile, analysis_universe, place, geometry, crosswalk |
| `003_metric_registry` | metric_definition, observation, observation_quality |
| `004_supply_targets` | brand, poi_source, poi_overlay, verification, target, custom_field |
| `005_criteria_runs` | scenario, version, analysis_run/result, publication_pointer |
| `006_events_outbox` | activity_event, context, outbox, notification, delivery_attempt |
| `007_tasks_shares` | task, note/attachment metadata, share_grant/snapshot |
| `008_activity_projection` | action projection and watermark |
| `009_branch_photos` | private upload intents, photo metadata/revisions, staged/ready/tombstoned lifecycle |
| `010_personal_preferences` | optional cross-device language/theme preferences; no workspace events |

| API family | Required behaviour |
|---|---|
| `GET /results`, `/results/{place_id}`, `/places/{id}/market-landscape` | explicit `run_id`; coverage and data period; shared DTO |
| `GET /map/summary`, `/map/tiles/{z}/{x}/{y}` | geometry/run version in cache key; no-eligible vs insufficient-evidence |
| `POST /imports/preview`, `/imports/{id}/commit` | Admin, checksum, QA decision, no publish on preview |
| `POST /criteria/validate`, `/preview`, `/apply` | role guard, base revision, immutable run |
| `GET/POST/PATCH /supplies`, `POST /supplies/{id}/{action}` | tenant scope, `If-Match`, source/overlay separation; action = verify, archive or restore |
| `POST /supply-reconciliations/preview`, `/{id}/publish` | physical-site and period QA before aggregate change |
| `GET/POST/PATCH /targets`, `GET /activity`, `/notifications`, `/activity/leaderboard` | contextual history, cursor, recipient filter |
| `POST /shares`, `GET /shares/{token}`, `POST /shares/{id}/revoke` | server-side grant and expiry |
| `GET /places/{id}/map-context?run_id=...` | approved geometry/version/status, source release, access-scoped POIs and coverage; bbox fit-only |
| `POST /supplies/{id}/photo-upload-intents`, branch `PATCH` photo operations | private staging, server validation, max 5 under lock, If-Match, one event/outbox commit |
| `GET/PATCH /me/preferences` (optional) | own personal theme/language; no workspace activity |

Generate OpenAPI and typed clients from common contracts. Do not let the frontend infer that null means zero or decide which events count in the activity summary.

## Vibe-coding prompt and required scripts

Use this bounded prompt for one task at a time:

```text
Implement task <ID> from IMPLEMENTATION_PLAN_v1.2.md.
Read CityMETER_Yolk_Product_Brief_v1.2.md and DS_ASSET_INTEGRATION.md first.
For experience work also read docs/EXPERIENCE_v1.3.md and contracts/experience.v1.3.json.
Build only this vertical slice and its declared dependencies; preserve old runs and source files.
Use synthetic fixtures in the public repo. Real data needs a privately approved SourceRelease.
Keep missing, observed zero, unverified and not applicable distinct.
Add contract/engine/API/browser tests that prove the task's acceptance conditions.
Report changed files, commands and results, remaining data/permission gates, and any unverified claim.
```

Task 00 should create these script names (or documented equivalents) so later tasks can run without guesswork: `db:up`, `db:migrate`, `db:seed:synthetic`, `fixtures:validate`, `import:preview`, `test:contracts`, `test:engine`, `test:api`, `test:browser`, `check:ds-assets`, and `check:release`. CI uses synthetic fixtures and no live network. A private import operation requires a separately authorised commit action; it must never write back to an upstream source by default.

## Pilot and later customer-data track

Pilot completion requires an approved real `SourceRelease`, verified geography cohort and metric coverage, one reproducible published run, Supply CRUD with reconciliation, criteria preview/apply, shortlist, contextual feeds, server-tested tenant isolation, DS-linked responsive TH/EN UI, and an evidence-backed release check. A synthetic preview alone does not meet this gate.

Sales by transaction/branch and membership data are a later **private track**: agree purpose and access; minimise or aggregate personal data; join to branches/areas through reviewed keys; record daypart and temporal effects; evaluate on holdout outcomes; and publish a calibrated model only if it improves decisions without exposing individuals. Keep source records and model versions traceable. Parcel feasibility and road-side access remain field/technical checks after area screening.
