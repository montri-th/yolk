# Yolk developer instructions

Scope: this repository only. These are development handoff rules for product v1.4 / handoff1.4.0, not permission to deploy, message customers, or import private data.

## Read first

1. `START_HERE.md`
2. `CityMETER_Yolk_Product_Statement_v1.4.md` and `contracts/product.v1.4.json`
3. `IMPLEMENTATION_PLAN_v1.4.md` and `contracts/implementation-tasks.v1.4.json`
4. `contracts/criteria.v1.4.json`
5. `ASSET_INDEX_v1.4.md`, `DS_ASSET_INTEGRATION.md`, `contracts/assets.v1.4.json`, `contracts/ds-assets.v1.4.json`, `contracts/icons.v1.3.json`

## Work one bounded task at a time

- Select a task whose dependencies have acceptance evidence. Use its `coding_prompt`, inputs, proposed outputs and tests. Report task ID, files changed, migrations, commands/results, acceptance evidence and remaining gates.
- Reuse existing CityMETER infrastructure first. `apps/*`, migrations and pnpm scripts in the production plan are proposed paths/commands. Task00 must map them to the actual stack and create the commands; do not claim the static preview already has a backend.
- Coordinate shared contracts/migration edits with one integration owner. Do not overwrite another task's work. Preserve previous source snapshots and immutable published runs.
- Public fixtures stay synthetic. Production inputs require approved private releases; do not put customer records, member addresses, credentials or private source links into this repository or public logs.

## Preserve domain meaning

- Bangkok uses khwaeng; upcountry uses verified, non-overlapping area-level LAOs. Use stable IDs and a versioned crosswalk before aggregation. Province filtering never rebuilds the pinned national benchmark.
- Use `PERCENTILE.INC` for cutoffs and the exact canonical criteria contract for tiers, unknown states and ranking. Display midrank/choropleth score is separate from cutoff and ranked order. Ratio remains disabled. Fresh workspaces use weighted ranking; saved pre-v1.4 criteria retain legacy ordering until explicit opt-in and apply.
- Missing is not zero. Preserve missing/observed_zero/unverified/not_applicable and denominator/coverage provenance.
- Supply source aggregates and workspace POI overlays remain separate. POI/photo edits change analytical B/C/U only after reviewed reconciliation and a new run.
- Enforce all tenant/RBAC/seat permissions server-side in production. One committed mutation creates one immutable event/outbox entry; private drafts, personal theme/language and views do not create team actions.
- Locale Insight is a contextual prior only. Do not treat it as official population, statutory boundaries, eligibility or observed behaviour. Parcel feasibility follows area/corridor screening.

- Keep criteria in four sections: Demand, Supply, Preferred location types, Ranking weights. Tier and selected patterns screen; weights rank without changing eligibility. Use native checkboxes with dynamic D/C/B explanations.
- maxDemandTier defaults to3 and filters proven-high Demand only. Low-Demand patterns have no Tier and stay eligible when demandMode=all and selected. Unknown never silently qualifies.
- Missing weighted metrics retain weight as [0,100] contributions. U uses joint B/C allocations for score bounds. Stars and map score do not dictate weighted order. Zero metric weight changes ranking only, not Tier logic.
- Preserve criteria drafts and saved values across locale/theme/reload; apply writes one event with mode/weights/Tier/pattern differences. Normalization of historical stored data creates no event.

## UI and assets

- Pin LDS0.9.4 and shipped hashes. Do not modify canonical asset bytes or invent logo variants.
- No motifs in runtime or asset bundle. Use the unchanged native Landometer logo in every theme. The whole sidebar/header uses DS beige for contrast, not a logo frame/card/backing plate. Follow contracts/web-identity.v1.4.json for logo, favicon and public share metadata; no recolour/crop.
- Use the separately pinned Material Symbols Rounded product extension with meaningful text labels. Icons do not prove data verification; retain text fallback and accessible names.
- Preserve TH/EN, mobile-first layout, light/dark/system, readable type and unsaved drafts. Keep synthetic/map-source/photo-mockup labels.
- Map bbox is fit-only, never a substitute boundary. Preserve geometry status, POI coverage, basemap attribution and the satellite2021/10m note. No tile prefetch/offline bundle.
- Branch photos: max5, staged drafts, private server media for production. Server validates and locks final count/revision; event payloads contain metadata IDs, not image bytes or signed URLs.

## Checks that exist now

Run from repository root:

```sh
python3 scripts/verify-public-release.py
node scripts/check-public-runtime.cjs
node scripts/check-theme-runtime.cjs
node scripts/check-map-runtime.cjs
node scripts/check-photo-runtime.cjs
node scripts/check-photo-form.cjs
node scripts/check-brand-identity.cjs
node scripts/check-icons.cjs
node scripts/check-ranking-v1.4.cjs
node scripts/check-decisions-v1.4.cjs
node scripts/check-web-identity.cjs
```

Local preview: `python3 -m http.server 8849 --bind 127.0.0.1`, then open `/prototype/`.

These are source/VM/controller checks. Browser visual, real-device interaction, keyboard/touch and zoom QA remain open until observed on the actual build. Do not invent screenshots or mark a blocked/unperformed check passed. Use `contracts/release.v1.4.0.json` and handoff manifests to identify exact release evidence.
