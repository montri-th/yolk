# Brand demo permalink — implementation and acceptance notes

This bounded patch supplies 37 stable, source-supported prospect demo links. It preserves the retained identity registry, default important source scope and numerical hypotheses. Release publication/versioning remains owned by the main release workflow.

## User outcome

- Open `https://montri-th.github.io/yolk/?brand=tops#market` and start with Tops, Grocery, SUPERMARKET and Expansion opportunities.
- A new recipient gets the existing brand factor preset. If that browser already has work for the same brand/scope, saved criteria, draft and shortlist win, with a readable notice and explicit “Try starter preset” action.
- “Copy this brand demo” lives under the brand picker; “All brands” opens a standalone searchable catalog. The catalog can switch Thai/English, copy or open each demo and disclose source limitations/count/valid-coordinate coverage.
- URL contains a stable public brand alias plus optional language. It never includes criteria/drafts/customer files, signed URLs, a team mutation, or a required release version.

## Source authority and coverage

`prototype/data/brand-presets.v1.7.json` supplies exact identities/default scopes; `brand-strategy-profiles.v1.9.0.json` must agree. The generated link registry has 11 Fuel, 16 Grocery and the first 10 selectable Non-bank companies. Each has positive direct native country inventory in its default scope. Country counts come from `countryDimensionCounts`, never summed areas or POI points. Coordinate records are a separate evidence count. All eight generating source files carry exact SHA-256 values in the catalog JSON.

Fuel remains source inventory without operating/fuel-offering confirmation; COSMO/PURE remain source identities. Grocery format distinctions and incomplete coordinate coverage remain explicit. Non-bank labels bind source legal-company identities; licenses are company-level and 5,534 of 23,524 office records lack reporting-UUID assignments. This is not measured consumer perception, customers, sales or operator-endorsed numeric criteria.

## Implementation order for an intern

1. Run `scripts/build-brand-demo-links.cjs` only after intentionally changing the authoritative identity/source registry. Review stable aliases; do not rename public aliases casually.
2. Generated artifacts: `prototype/data/brand-demo-links.json`, `prototype/brand-demo-catalog.js`, `docs/BRAND_DEMO_LINKS.md`.
3. `brand-demo-links.js` resolves only known aliases or exact percent-encoded source IDs. Validate duplicate/malformed/industry/scope/language inputs; allow only six safe top-level routes. Unsupported detail routes open Opportunities. Unknown/unavailable links show safe copy without echoing untrusted input.
4. Load catalog and resolver before `bootstrap.js`. Bootstrap selects the requested industry before loading its public source snapshot, avoiding a spurious default-industry request.
5. In `industry-workspace.js`, initialize only the active personal display identity/scope/language before normal `loadCriteriaContext()`. Do not call save, stash, commit or emit a team action from link opening. Let existing context restoration preserve criteria/draft/targets. Read-only startup does not rewrite browser storage.
6. Render a compact notice before the brand disclosure and append copy/catalog controls to the brand picker. The explicit Try starter action retains existing draft semantics: it creates a draft for inspection rather than replacing confirmed criteria.
7. Standalone `brands.html` uses LDS foundation tokens/fonts and responsive grid cards. Its controller never reads workspace records. Provide search, language, readable source caveats, copy fallback dialog and an editable-selection-friendly readonly URL field.
8. For clipboard work, capture the context and a monotonic request ticket. Do not show stale success/fallback after the user changes context or a newer copy action completes. Failed Clipboard API access opens a text-selection dialog; no permission confirmation is required.
9. Run the bounded permalink suite and retained source/criteria suites, then review actual Thai/English UI at 320, 390, 768 and desktop widths. Add all emitted files to the release allowlist/runtime hash closure; publish only via the main authorized release workflow.

## Local automated evidence

- `scripts/check-brand-demo-links.cjs`: **49 passed / 0 failed**. Scope: bounded local VM/source checks, 200 actual area rows per initialization harness; full retained native country counts and all 37 identities. This is not a native-browser, physical-device, backend or publication certificate.
- All 37 aliases open the exact industry/default scope/factor preset without writes/events.
- Exact percent-encoded identities, safe routes, explicit language, malformed/duplicate/conflicting/unknown inputs and unavailable source identity fallback tested.
- Warm saved target criteria/draft/version/targets, old contexts, branch overlays, form drafts and events remain unchanged; raw stored workspace bytes remain unchanged on opening.
- Stale/context-changed and concurrent clipboard completion guards tested.
- `scripts/check-brand-presets.cjs`: **13 retained checks passed** after this patch; numeric/source/identity/saved-work invariants retained.
- Native catalog review found UA dark inputs on a light surface. The catalog now shares `experience.css` theme aliases and explicitly uses DS foreground/background/border roles with 16px input text/padding; final native recheck remains release-owner acceptance.
- JavaScript syntax checks passed for new modules and bounded bootstrap/context integration.

## Native acceptance still to record by the main reviewer

1. On a fresh browser-context/local server open `?brand=lotus&lang=th#market`; verify Grocery/HYPERMARKET brand starter, Opportunities, one map, no activity event.
2. Switch/create a criteria draft for Tops, return elsewhere, open `?brand=tops#market`; verify saved criteria/draft notice and retained draft; verify previous storage business content did not change.
3. At 320 Thai and 390 English open `/brands.html`; inspect real headings, long company names, summary/URL fields, search results, keyboard focus and no document horizontal overflow. Inspect dark and light foundation contrast.
4. Open brand disclosure, copy a brand link, confirm it contains only brand/lang/#market; test the text-selection fallback when Clipboard API is unavailable. Test focus return and copied status in the standalone catalog.
5. Click a catalog link for each industry, including Non-bank legal-company limitations. For all37 use the automated identity matrix, not a claim that every native viewport/physical device was inspected.
6. Recheck final emitted URLs/hashes after sealing; include catalog and full Markdown in the complete handoff.

```json
{
  "schemaVersion": "yolk.brand-demo-permalink-acceptance/1",
  "aliasCount": 37,
  "industryCounts": {"fuel": 11, "grocery": 16, "nonbank": 10},
  "defaultRoute": "market",
  "safeRoutes": ["market", "demand", "supply", "criteria", "targets", "feed"],
  "queryParameters": {"brand": "known slug or exact percent-encoded source identity", "lang": "optional th/en"},
  "startupWritesWorkspace": false,
  "startupEmitsTeamEvent": false,
  "savedTargetWorkWins": true,
  "newRecipientUsesBrandDefaultPreset": true,
  "privateWorkspaceStateSerialized": false,
  "requiredReleaseVersionInUrl": false,
  "sourceInventoriesWithPositiveDefaultCounts": 37,
  "localPermalinkChecks": {"passed": 49, "failed": 0},
  "retainedBrandPresetChecks": {"passed": 13, "failed": 0},
  "nativeAcceptance": "record separately by the main release reviewer",
  "publication": "not established by these local checks"
}
```
