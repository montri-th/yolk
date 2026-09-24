# CityMETER: Yolk · public web preview

**Find the yolk. Grow your market. / หาไข่แดง ขยายตลาด**

This repository shares a bilingual, mobile-first **illustrative prototype** and a production handoff for CityMETER: Yolk. The included area and POI records are **synthetic demo fixtures**. They are not actual Bangchak branches, actual CityMETER observations, or a validated market ranking. The production plan requires an approved, access-controlled real-data import before operational use.

Start with the [product statement](CityMETER_Yolk_Product_Brief_v1.2.md), then the [12-task implementation plan](IMPLEMENTATION_PLAN_v1.2.md). [DESIGN.md](DESIGN.md) describes interaction and visual requirements. [DS_ASSET_INTEGRATION.md](DS_ASSET_INTEGRATION.md) and [the machine asset manifest](contracts/ds-assets.v1.2.json) pin the Landometer DS 0.9.4 assets, roles, and hashes used by the preview. These files are the dev contract; the prototype is a visual/interaction reference, not a production backend.

To run the static preview locally from the repository root:

```sh
python3 -m http.server 8849 --bind 127.0.0.1
```

Open `http://127.0.0.1:8849/prototype/`. The preview's local edits, roles, feeds and notifications are simulated in the browser. There is no production authentication, tenant sync, live email/LINE delivery or approved real-data ingestion in this static app.

The intended production geography is **Bangkok khwaeng and verified, non-overlapping area-level LAOs elsewhere**. A national choropleth summarises the primary units; analysis modes for province, district, subdistrict, custom polygons and road segments require separate geography/metric runs. Demand is a proxy signal and Supply is a branch-count view; neither alone establishes actual traffic, revenue or parcel feasibility.

Development begins with source/schema/permission review and the private import gate in the plan. Keep private datasets, customer POI rows, personal information, credentials and source-artifact URLs out of this public repository. Use synthetic fixtures for public CI. A deployed preview should carry the same synthetic-data label and preserve the exact DS asset graph.

This is an artifact-specific Landometer preview and handoff. Bundled font licences travel with their fonts; the logo derivative and motifs must be used only in the roles described in [DS_ASSET_INTEGRATION.md](DS_ASSET_INTEGRATION.md).
