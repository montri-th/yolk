# Design authority for Yolk three-industry preview

Use LDS0.9.7 full standalone base and matching Location Intelligence Profile in reference/lds-0.9.7. Preserve Yolk's original UI/icon semantics/logo positions. Remove motifs; logo stays directly on the page, without frame/backing plate. No decorative bracket or selected coloured left rail.

Exact foundation tokens and verified assets are in prototype/vendor/lds-0.9.7. The original rounded Material Symbols product extension retains its byte hash/license; it is an explicitly preserved Yolk extension, not a relabelled canonical DS pack. Original Arvo Yolk title and DS Thai/body/mono roles remain distinct.

Analytical colours preserve source HEX, LUT/classes and direction across light/dark. Data zero, missing, suppressed and not-yet remain separate. Label Demand proxy, units, denominator, cohort and source period. In retained market/criteria screening views, the national map colours districts by the best confirmed eligible fine-area Tier, then colours reporting areas after drilling down. The1.7.3 owner-selected categorical tiers are Tier1 nativearea-LUT20–40 gradient, Tier2#FFBC1F and Tier3#F1F4EF in both themes; rawquantitativeLUTs remain unchanged. A selected fine area's interior is transparent; its outline and Tier label carry selection. These tiers are not district/province percentiles or ranking scores.

TH/EN and mobile/desktop light/dark screenshots must be reviewed on the actual build. Focus outlines, map attribution, direct polygon vs fit extent and POI coverage remain visible. See active product contract and implementation plan for behaviour. Legacy DS0.9.4 references are historical only.

Retained map-analysis1.7.2 defines the dedicated pure Demand and count/area/market-rate Supply views. Current1.7.3 overrides their appearance with native41LUT raw classes and owner-selected categorical egg tiers; formulas, fine Demand cutoffs and same-grain national cohorts remain unchanged. Raw-country Demand maxima remain labelled as fine-area maxima, never district aggregates. Previous1.7.2 QA (217 automated checks) is historical. Current1.7.3 QA passed260runtimechecks,65independent snapshotchecks and boundednativeChrome selected flows; provider/live-byte evidence is still pending for1.7.3.

Current1.7.3 authority for review, fried-egg categories and native quantitativeLUT41: [extension](contracts/location-review.v1.7.3.json), [review guide](docs/LOCATION_REVIEW_v1.7.3.md). Previous1.7.2 QA statements are historical; currentchecks/provider/livebyteproof are recorded separately in release.v1.7.3.json.

## Final interaction refinements - 1.7.3

Buttons, links and disclosure summaries containing icons underline only their caption on hover (the Yolk wordmark is excluded); the icon glyph is undecorated and keyboard focus remains visible. Map and tile minZoom is 3, overriding the retained 1.7.2 value 4 so explicit mobile country fit can show the full country. Mobile bottom fit padding uses max(50, ceil(actual rendered footer legend height) + 18) px; desktop uses 18 px. Menu changes, criteria previews and ordinary sync retain the camera; only explicit navigation/home/fit changes it.

Current automated results: 17 suites / 260 checks passed. Independent snapshot consistency audit: 65 checks passed separately. Bounded native Chrome review passed selected Thai/dark and English/light flows at 1440x900 and390x844. See [native browser receipt](evidence/browser-v1.7.3/native-browser-review.json). This is not a full language/theme matrix or a physical-device/backend pass. Provider/live-byte evidence remains pending.

## Current boundary override - 1.7.4

Owner-scoped white #FFFFFF outlines use province 1.2 px, country district 0.45, closer district 1.05, chosen parent district 1.1, ordinary fine 0.45 and selected fine 0.8 px. Clickable hover outlines use Yolk yellow #FFBC1F / 2 px. Both themes use the same stroke paints. Selected fine interiors remain unfilled; the chosen parent district is the only location-level context, noninteractive and excluded from counts.

Keep draw order and gradient definitions in the existing renderer. Quantitative fills/LUT41 and egg-tier fills remain unchanged. See [appearance contract](contracts/map-boundary-appearance.v1.7.4.json) and [guide](docs/MAP_BOUNDARIES_v1.7.4.md). Current 1.7.4 QA/provider/live-byte evidence is pending; 1.7.3 QA statements above are historical.

## Supply cutoff clarity - 1.7.4

A Supply slider sets the point that starts High: observed count/rate >= cutoff is High, and < cutoff is Low. Moving right raises that point; it does not increase actual branches, the denominator or Demand. The same rate 0.5 is High at cutoff 0.3 and Low at cutoff 0.8, in the same displayed unit. Preserve interval bounds and possible patterns; no inversion or preset-threshold reseeding while dragging.

Show Demand Yolks separately from all-criteria matches. The raw Demand count uses the current context and draft: `s.nextRows.filter(a => a.demand === true && areaMatchesNavigation(a)).length`, before maxDemandTier, preferred patterns and Supply gates. Its scope is the selected administrative area, not viewport/camera visibility. Unknown Demand is not counted as High or zero. Supply-only changes retain this count and Demand/Tier membership. Final matches still use all existing gates; arbitrary pattern selections have no guaranteed monotonic result.

The [Supply semantics receipt](evidence/supply-cutoff-semantics-v1.7.4.json) covers 37 current default contexts / 444 probes. It supports model semantics, not browser/touch usability, arbitrary strategies or final release verification. Current release QA/provider/live-byte gates remain pending.
