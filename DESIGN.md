# CityMETER: Yolk · public design contract

The product is a workspace for choosing what market to investigate next. The **public preview uses synthetic, illustrative records**. Its appearance and interactions can guide implementation; no map colour or example POI is evidence about a real market.

## Design authority and identity

- Use **Landometer Design System 0.9.4**, pinned authoring `0.9.4-r2`, ruleset `lds-rules-0.9.4`, machine package `v0.9.4-mp1`. [DS asset integration](DS_ASSET_INTEGRATION.md) explains usage; [the asset manifest](contracts/ds-assets.v1.5.json) gives exact paths, roles and SHA-256 hashes.
- Use **CityMETER: Yolk** as ordinary product typography. The bundled Landometer runtime logo derivative is for this preview's portfolio identity. Its presence is not a general licence or an amendment to canonical DS role approval. Preserve proportions and use an accessible name. Show it directly on the theme-aware desktop sidebar or mobile menu; do not introduce a light backing plate or a large forced-light shell. Keep the native bytes unchanged and leave dark-logo legibility as an observed QA requirement, not a guessed pass.
- Do not render or ship decorative motifs in Yolk. Use DS-style Material Symbols Rounded icons beside labels at decisions such as shortlist, verify, apply criteria, save, basemap and photo selection. See `contracts/icons.v1.5.json`. Place the Landometer identity directly on the existing surface; never create a frame, card or backing plate around it.
- Source colours, fonts, and glyph assets from the pinned DS bytes. Use DS semantic UI tokens for actions, surfaces, text and focus. Analytical map colours are a separate ordered scale with a stated metric and legend.

## Information hierarchy

1. **Context:** workspace, business preset, analysis unit, source status, criteria version and published run.
2. **Answer:** country map and ranked list from the same run, with a visible reason to open a place.
3. **Explanation:** Market landscape at a place—Demand signals and cutoffs, B/C/U Supply counts, brand mix only where covered, eight-pattern matrix, and quality gaps.
4. **Next action:** shortlist, verify branch, add note, assign owner, or adjust criteria.
5. **History:** contextual event feed and notifications that link back to the affected record.

The illustrative Bangchak/fuel preset is fixed in the public demo; do not add an industry switcher there. Production supports other industries through versioned metric catalogues and presets that pass a data-availability gate.

## Demand, Supply and map honesty

Keep Demand and Supply as distinct visual and conceptual groups. The baseline fuel criteria are the three building and six activity metrics specified in the [product statement](CityMETER_Yolk_Product_Statement_v1.5.md). A high-demand flag is an evidence-based **proxy**, not measured visits or sales. A branch count is not market share or capacity. An unverified POI stays unverified until reviewed.

The default future production area is **Bangkok khwaeng / verified area-level LAO elsewhere**. A province map is an overview used to drill into those units. The public map is illustrative and must carry a prominent “synthetic demo” label. In production, the province fill formula, metric, denominator, thresholds, source period, and eligibility/coverage belong in the legend and detail. Province colour and location ranking may answer different questions; label them separately. Missing evidence, measured zero, no eligible result, suppressed, and out-of-scope must have distinct text and visual states. Provide a list/table equivalent to map data.

The detail page must not invent branch coordinates or roads. A point layer appears only when an approved source includes coordinates and coverage. The system may use real boundaries only after the production geography and import gate passes; a prototype shape must never be taken as a verified operational boundary.

## Interaction and collaboration

- Criteria edits are local drafts. Show their impact privately; **Apply to workspace** is an explicit Admin/Editor action that starts a new run. Pending, failed and latest-good run states must look different.
- Supply CRUD covers own, competitor and unknown/unbranded records, plus verification and archive/restore. Source records are immutable; tenant overlays carry corrections. POI edits do not silently change aggregate Supply until reconciliation.
- A committed shared change creates one event reused in the relevant page feed and teammate inbox. Local drafts, reads, clicks and retries do not create a new shared action.
- Activity leaderboard counts committed actions and distinct affected records over a stated period. It does not score employee quality; Viewers are not portrayed as underperforming because they have no write role.

## Mobile first and bilingual

Start with a 390 CSS px phone: one primary map or list, full-width detail and forms, reachable main actions, minimum 44×44 CSS px targets. At wider widths, pair map/list or criteria/impact panels without shrinking a desktop table onto a phone. Validate 390, 768, and 1440 CSS px plus 200% text zoom, keyboard focus, screen reader names, reduced motion and touch.

TH/EN parity includes labels, navigation, map legend, metric units, explanatory copy, feed templates, notifications, empty/error states and accessible names. Language switching preserves selected place, view and unsaved draft. Do not auto-translate user notes, brand names, or source fields. Use Thai-safe line heights and wrapping.

## Release checks

Verify every shipped DS asset hash and licence, network request path at the deployed base URL, actual font loading, logo carrier/clearance, map/list equivalence, synthetic-demo disclosure, and the complete keyboard/touch flows. Screenshots must be captured from the actual build. A check that could not run remains **pending**; source/hash validation alone does not certify rendered layout.

[Product statement](CityMETER_Yolk_Product_Statement_v1.5.md) · [Implementation plan](IMPLEMENTATION_PLAN_v1.5.md) · [DS assets](DS_ASSET_INTEGRATION.md)


## v1.3 experience extension

The [experience contract](docs/EXPERIENCE_v1.3.md) and [machine specification](contracts/experience.v1.3.json) extend this design with readable type, personal light/dark/system preferences, location maps and five-photo branch editing. Product colour aliases live in `prototype/experience.css`, loaded after all component styles; canonical DS bytes remain untouched. Use `prototype/theme.js`, `location-map.js` and `branch-photos.js` as interaction references, with production permissions, data services and storage implemented under the plan. Browser visual review remains open.

## v1.5 Yolk and mobile reading

Yolk means confirmed high Demand, not a recommended opening or a supply gap. Use the pinned gold tokens and `egg_alt` with the visible name Yolk / ไข่แดง. Other market-pattern icons are fixed in the product/icon contracts; visible names and D/C/B explanations remain authoritative.

Country-map preferred scope includes confirmed Yolk that are eligible; all-Yolk scope includes all confirmed Yolk. Province fill shows the highest known enabled-signal percentile of the matching Yolk locations plus a count. Distinguish no matching Yolk, no confirmed Yolk and unknown Demand. Scope does not change the ranked list or criteria.

Percentile presentation starts with metric label, raw value/unit, Top 1/5/10% band and a 0–100 meter. Exact percentiles and cutoff definitions are expandable. Missing values use text, not a zero bar. Bands are not probabilities and are never fed back to the screening engine.

The closed mobile header contains only Yolk, inbox and menu; theme/language/actor controls and the native logo are available through an accessible disclosure. Dark chrome follows dark DS tokens. Bottom navigation retains labels, 44px targets and safe-area spacing. Synthetic place names consistently use ทำเลจำลอง / Demo location while boundary metadata remains unchanged.

The current ranking/filter contract is `contracts/criteria.v1.4.json`. Tier filters screen high-demand locations; weights reorder the qualifying set. `contracts/web-identity.v1.5.json` owns native logos, favicons and sharing metadata.
