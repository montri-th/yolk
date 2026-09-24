---
title: "CityMETER: Yolk — product statement"
version: "public-preview-1.2"
status: "concept-and-synthetic-preview"
languages: ["th-TH", "en-US"]
design_system: "Landometer 0.9.4; see DS_ASSET_INTEGRATION.md"
default_geography: "Bangkok khwaeng; upcountry non-overlapping area-level LAO"
default_workspace_seats: {admin: 1, editor: 3, viewer: 6}
data_policy: "Synthetic demo only; production requires an approved private import"
---

# CityMETER: Yolk

**Find the yolk. Grow your market. / หาไข่แดง ขยายตลาด**

Yolk helps expansion teams find promising markets, explain the evidence, and coordinate what to inspect next. It separates **Demand** (signals that people or activity may generate visits) from **Supply** (our branches, competitors, and unverified sites). A ranked area is a place to investigate, not a promise of traffic, sales, or parcel suitability.

> **Preview boundary:** The records bundled with the public web preview are **synthetic, illustrative fixtures**. They do not represent actual CityMETER observations, Bangchak branches, specific areas' commercial conditions, or a validated national ranking. A production release must import licensed, approved source snapshots through the data gate in the [implementation plan](IMPLEMENTATION_PLAN_v1.2.md).

## Who — ใครใช้

Teams expanding physical access to customers: fuel stations, convenience stores, laundromats, cafés, restaurants, non-bank services, and other branch networks. One enterprise workspace starts with **10 members: 1 Admin, 3 Editors, 6 Viewers**. Admins govern members and shared criteria; Editors verify records and move locations forward; Viewers inspect evidence and can try a private criteria preview without changing the shared result.

The public preview uses **Bangchak/fuel as the fixed illustrative business context**. There is no industry dropdown in this demo. The production architecture keeps business-specific demand metrics and default rules configurable so another industry can use the same workspace, Supply CRUD, shortlist, and collaboration model.

## What — ตัดสินใจอะไร

Yolk answers three sequential questions:

1. **Where should we look?** Screen the country's areas using demand signals and branch supply, with the analysis unit and data period visible.
2. **Why this area?** Open a location's *Market landscape*: demand values and percentile thresholds, our/competitor/unverified counts, brand mix when covered, the eight Demand–Supply patterns, and missing-evidence reasons.
3. **What happens next?** Shortlist the area, assign an owner, check records, collect notes and field evidence, then inspect a particular street segment or land parcel separately.

The default production unit is **แขวง in Bangkok and an area-level อปท. (local administrative organisation, LAO) outside Bangkok**. The upcountry cohort must include only verified, non-overlapping municipality/SAO or eligible special-form areas; province-level PAOs are not interchangeable with these area-level units. Province is a navigation and summary layer. Optional future modes—province, district, subdistrict, LAO, custom polygon, and road segment—each require their own source mapping, cohort, raw aggregation, and benchmark; zooming or filtering never silently changes the unit.

## Why — ผลลัพธ์ที่ต้องการ

Expansion work often lives across maps, spreadsheets, messages, and individual judgement. Yolk gives the team one versioned set of criteria, one map/list result per published analytical run, a shared shortlist, and a traceable answer to *who changed what, when, and why*. The first result appears from an approved workspace data release; adding verified branch records, survey findings, and later business data can improve the evidence without overwriting prior conclusions.

Success means fewer unexamined candidates, faster decisions about where to survey, and reasons the next person can reproduce. It is **not** measured by a raw count of edits or by assuming the highest-ranked area will sell the most.

## Which — แข่งกับวิธีใด

The practical alternative is the team's existing cycle of manually comparing map layers and spreadsheets, sending candidate locations through chat, and rebuilding the rationale each time criteria or ownership changes. Yolk competes with that fragmented workflow by preserving the criteria version, source period, candidate status, discussion, and decision history together. It is not a substitute for field visits, traffic counts, legal land-use checks, or financial underwriting.

## How — ทำงานอย่างไร

### 1. Begin with a recommended, editable model

The fuel example has three building metrics: **GFA (m²), GFA per person (m²/person), GFA density (m²/km²)**. Its six activity metrics are **factory count, factory density, factory workers, worker density, hotel rooms, and hotel-room density**. Percentile cutoffs are calculated across the same approved **national analysis cohort**, not separately inside each province.

The recommended building tiers are: Tier 1 when all three metrics reach P99; Tier 2 when all three reach P95; Tier 3 when any one reaches P95. Activity tiers are Tier 1 for at least five of six P95 hits; Tier 2 for at least three; Tier 3 for at least one. An area has a high-demand signal if **either** enabled group qualifies. These are configurable starting hypotheses, not observed traffic. Missing observations stay unknown; zero is used only when the source truly measured zero.

Supply starts with separate counts of **our branches (B)**, **competitor branches (C)**, and **unverified/unbranded sites (U)**. The illustrative fuel default calls B or C “high” at **3**. U remains a verification/acquisition queue and never silently becomes B or C. A team may change thresholds and metric switches, preview the impact privately, then an Admin or Editor applies a shared criteria version. A shared apply creates a new immutable analysis run; it does not rewrite an earlier result.

### 2. Read eight simple market patterns

Each pattern is the high/low combination of Demand (D), competitor Supply (C), and our Supply (B). Names help conversation; they are **descriptive, not a final investment recommendation**.

| D | C | B | Pattern | First question |
|---|---|---|---|---|
| High | High | High | Crowded | Is there a distinct gap within a supplied market? |
| High | High | Low | FOMO | Which competitor needs can we serve better? |
| High | Low | High | Our Farm | Are our own branches covering this demand well? |
| High | Low | Low | Pioneer | Can the location and access turn demand into visits? |
| Low | Low | Low | Quiet | Is there evidence beyond the current model? |
| Low | High | Low | Their War | Why are rivals here despite weak measured demand? |
| Low | Low | High | Our Island | What do our branches know that the model misses? |
| Low | High | High | Winter War | Is the market saturated or the demand proxy incomplete? |

Unknown D, C, or B must produce a **review state**, not a forced pattern. Users can compare the model's result with a field observation before choosing a target.

### 3. Move from market to location work

The country view is a choropleth and ranked list driven by the **same published run**. Colour describes a documented signal/score and legend, while ranking may also use tiers, supply, and criteria; the UI must not imply that province colour equals parcel attractiveness. The location detail leads with Market landscape, followed by shortlist status, custom fields, owner, notes, source quality, and contextual activity. Supply records can be created, corrected, verified, archived, or restored without modifying the public source layer. Source-to-branch deduplication and snapshot reconciliation must occur before POI edits change screening counts.

### 4. Give changes a conversation trail

Every committed shared change creates **one immutable event** linked to its record, relevant page feed, and notifications for authorised teammates. A criteria change appears on the criteria page; a location note appears with that location. Notification is a trigger back to work, with read state per recipient. Email/LINE sharing can be added through explicit server-checked grants and delivery adapters. The activity leaderboard shows committed actions, categories, period, and distinct records—not employee quality or time spent.

### 5. Make evidence grow safely

The first production release works with approved CityMETER observations and verified Supply. Later, a customer may provide sales by branch and transaction and membership data under a separate permission, privacy, and retention contract. Those datasets can test and calibrate demand hypotheses, catch cannibalisation, and account for daypart or direction of travel. Personal addresses should not be exposed in ordinary location views; analysis should use purpose-limited aggregates and a clear minimum-cell policy. Do not claim improved accuracy until holdout tests against actual outcomes show it.

## Product and design requirements

- **Mobile first, TH/EN parity:** map/list switch on phones, readable full-width detail/forms, accessible controls and keyboard navigation; language switching preserves the draft and current location.
- **Landometer DS 0.9.4:** source the exact pinned colour, fonts, motifs, and runtime logo assets from [DS_ASSET_INTEGRATION.md](DS_ASSET_INTEGRATION.md) and [the machine asset manifest](contracts/ds-assets.v1.2.json). Product analytics colours must keep zero, missing, ineligible, and suppressed distinct; never turn a motif into a logo or data mark.
- **Transparent data:** every result states analysis unit, source version/as-of, criteria version, known coverage, and unknown reasons. Observed, inferred, synthetic, and user-entered values are labelled distinctly.
- **Tenant safety:** 1/3/6 seats, server-side roles, optimistic revisions, workspace-scoped access, immutable event IDs, and no unreviewed data import affecting a published run.

## What this public repository enables

The static preview demonstrates interaction and design with synthetic records. [The implementation plan](IMPLEMENTATION_PLAN_v1.2.md) defines the private-data import gate and twelve vertical tasks for turning it into a production service. The preview has no production authentication, live workspace sync, production notifications, or verified market assessment.
