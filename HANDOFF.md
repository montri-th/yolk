# CityMETER: Yolk · public developer handoff

## Work object

This repository carries a bilingual, mobile-first Yolk static preview, Landometer DS 0.9.4 runtime assets, a product statement, and a 12-task production implementation plan. The preview records are **synthetic**: 308 made-up areas across 77 display provinces and 16 made-up POI records with no coordinates. They are for interface and rule demonstrations only. The true Bangchak/CityMETER source data is not in this public repository.

## Start

Run `python3 -m http.server 8849 --bind 127.0.0.1` at repository root and open `/prototype/`. Routes are hash-based: `#market`, `#criteria`, `#supply`, `#feed`, and `#place/demo-area-001`. Toggle TH/EN inside the app. Local edits/notifications are browser simulation; no real authentication, shared database or outgoing messages exist.

Read [the product statement](CityMETER_Yolk_Product_Brief_v1.2.md), [implementation plan](IMPLEMENTATION_PLAN_v1.2.md), [DS integration](DS_ASSET_INTEGRATION.md), and [machine asset manifest](contracts/ds-assets.v1.2.json). Follow task 00 first, then the private SourceRelease gate in task 01. Do not substitute the demo fixtures for real observations.

## Asset and data boundaries

The preview loads relative CSS, JS, font, logo and geometry files; keep their graph intact. The exact runtime DS bytes and roles are pinned by SHA-256. The full-resolution source logo is reference-only in the manifest and absent from this tree. The public geometry is a 2017 province display layer from geoBoundaries/OSM under ODbL; [attribution and licence](evidence/geography-source.md) must remain. Production needs separately approved current khwaeng/LAO geometry, crosswalks, observations and Supply source releases.

## Verification

Public release validation checks synthetic-only records, absence of private-source markers, asset hashes, link targets and JavaScript syntax. The original full-data local preview passed model/function checks before sanitisation; those checks are **not** evidence that this public demo reflects actual markets. The synthetic demo's own model/render-function checks are recorded in the publication work. Browser visual QA at 390/768/1440 CSS px, Thai/English layout and real-device interaction remain pending. No screenshot or browser claim is made.

GitHub Pages deployment is prepared as a manual workflow after a repository administrator enables Pages. A separately hosted public preview, when available, will link from `README.md`. The static app has no indexable business claims and uses `noindex`.
