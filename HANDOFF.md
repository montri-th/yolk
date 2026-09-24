# CityMETER: Yolk v1.3 · public developer handoff

## Work object

This repository carries a bilingual, mobile-first Yolk static preview, Landometer DS 0.9.4 runtime assets, a product statement, and a 12-task production implementation plan. The preview area and POI records are **synthetic** and demonstrate interface/rule behaviour only. Location maps use explicitly labelled synthetic boundary/pin scenes over a real basemap; scene pins are excluded from Supply calculations. No customer source records are distributed here.

## Start

Run `python3 -m http.server 8849 --bind 127.0.0.1` at repository root and open `/prototype/`. Routes are hash-based: `#market`, `#criteria`, `#supply`, `#feed`, and `#place/demo-area-001`. Toggle TH/EN and light/dark/system inside the app. Open a location to compare basemaps; open a branch to try up to five local photo drafts. Local edits/notifications are browser simulation; no real authentication, shared database or outgoing messages exist.

Read [the product statement](CityMETER_Yolk_Product_Brief_v1.2.md), [implementation plan](IMPLEMENTATION_PLAN_v1.2.md), [DS integration](DS_ASSET_INTEGRATION.md), and [machine asset manifest](contracts/ds-assets.v1.2.json). Follow task 00 first, then the private SourceRelease gate in task 01. Do not substitute the demo fixtures for real observations.

The [v1.3 experience extension](docs/EXPERIENCE_v1.3.md) and [machine contract](contracts/experience.v1.3.json) define the theme, geometry adapter and photo workflows.

## Asset and data boundaries

The preview loads relative CSS, JS, font, logo and geometry files; keep their graph intact. The exact runtime DS bytes and roles are pinned by SHA-256. The full-resolution source logo is reference-only in the manifest and absent from this tree. The country overview uses a 2017 province display layer from geoBoundaries/OSM under ODbL; [attribution and licence](evidence/geography-source.md) must remain. Production needs separately approved current khwaeng/LAO geometry, crosswalks, observations and Supply source releases. Location boundary adapters accept explicit GeoJSON polygons; `extent3857` frames the viewport and never substitutes for the boundary. A source polygon is not automatically a certified statutory boundary.

Satellite uses ESA WorldCover Sentinel-2 imagery from 2021 at 10 m via Terrascope. Preserve provider attribution and the visible vintage/resolution note; do not bundle or prefetch third-party tiles. Branch examples are labelled AI-generated mockups; selected photos are browser-local drafts. Production must add private object storage, server roles, validation, revisions and one transactional branch/event contract before shared photo use.

## Verification

**Current release state: `ready_with_open_manual_gate`.** Automatic approval review blocked browser visual inspection. Source checks, theme controller tests and deployed-file verification cannot substitute for observing the actual UI.

Public release validation checks synthetic-only records, absence of private-source markers, asset hashes, link targets and JavaScript syntax. The synthetic demo's model/render-function checks are recorded in the publication work. Browser visual QA, Thai/English layout, both themes/system mode, zoom and real-device interaction remain pending. No screenshot or browser claim is made.

GitHub Pages is live at [montri-th.github.io/yolk](https://montri-th.github.io/yolk/). The Pages workflow deploys the synthetic `prototype/` tree from `main` after the public safety and runtime checks pass. The static app has no indexable business claims and uses `noindex`. Deployment/content hashes do not replace pending browser visual QA.
