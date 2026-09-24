# Location map preview v1.3

Reviewed 2026-09-24. This is a functional map implementation and source receipt. Browser visual QA remains open; the checks below use data validation, template output and stub controllers only.

## What the preview demonstrates

The location page provides a pan/zoom map, location boundary, category filters, fit-to-location, keyboard-accessible pins with popups, and a matching list of available points. Thai and English labels follow the app language. Controls, pins, popups and boundary follow the selected light/dark theme. Satellite colours stay unmodified.

The three basemap choices are:

| Choice | Source | Behaviour |
| --- | --- | --- |
| Simplified | OpenStreetMap standard raster tiles | The same street map is subdued with a CSS colour treatment, allowing boundaries and pins to stand out. It is not a separate generalised cartographic dataset. |
| Detailed | OpenStreetMap standard raster tiles | Street and place-name context. |
| Satellite | ESA WorldCover Sentinel-2 RGBNIR annual median composite, 2021, served by Terrascope | Genuine satellite imagery at 10 m native data resolution. The UI states its year and resolution. Native WMTS tiles end at z14; closer zooms enlarge the same imagery. This is area context, not a current parcel survey. |

The public site uses 308 synthetic areas. `data/demo-map-context.js` creates explicitly illustrative polygons and points only for `area.synthetic === true`. These shapes are unrelated to administrative boundaries; they are not used in demand, supply or ranking calculations. Public demo pins do not expose the private source workbook's branch coordinates.

No coordinates are sent in an application-specific API query. As with other interactive web maps, the browser requests the tiles for the visible map viewport directly from the selected provider. This preview does not prefetch, scrape, export, persist or download offline tile packs.

## Approved-data adapter for implementation

Load a deployment-approved mapping before `app.js`, or set the same object as `area.mapContext`:

```js
window.YOLK_MAP_CONTEXT = {
  "location-id": {
    boundary: {
      type: "Feature",
      properties: { source: "approved_dataset" },
      geometry: { type: "Polygon", coordinates: [/* closed WGS84 rings */] }
    },
    boundaryStatus: "source", // source | verified | draft | synthetic
    sourceLabel: "CityMETER · boundary dataset",
    observedAt: "2026-09-24",
    officialBoundaryVerified: false,
    // Optional: omit `pois` to use matching workspace POI records.
    pois: [{
      id: "poi-id", name: "Display name", lat: 13.7, lng: 100.5,
      category: "own", // own | competitor | unverified | factory | hotel | hospital | school | other
      brand: "Brand", sourceDataset: "approved_dataset"
    }]
  }
};
```

`source` means that the polygon was supplied by the named dataset; it does not certify a statutory boundary. The UI distinguishes `source`, `verified`, `draft`, `synthetic`, and missing boundary states. Production adapters must establish the dataset's authority and permission scope before assigning `verified`.

`extent3857` can fit the viewport but is **never converted into a polygon**. A missing boundary is disclosed. Invalid coordinates and missing-coordinate POIs are excluded from the map, with a count shown. The point list is an available-record sample, not a complete inventory, and the page explicitly says so.

The internal sample adapter was reviewed separately: nine CityMETER-sourced polygon records match their existing area IDs and viewport extents. That deployment-only adapter and its coordinates are not included in this public receipt or public bundle.

## Integration

Load `vendor/leaflet-1.9.4/leaflet.css` before `location-map.css`. Script order is Leaflet, `data/demo-map-context.js`, optional approved map context, `location-map.js`, then `app.js`.

```js
// Template stage:
YolkLocationMap.render(area, workspacePOIs, language); // HTML string
// After inserting the new page DOM:
YolkLocationMap.mount(area, workspacePOIs, language);
// Before replacing page DOM or leaving the detail route:
YolkLocationMap.destroy();
```

The module is read-only. It does not mutate demand, supply, criteria, target status or permissions. Language and actor changes rerender the map with its current page; theme changes restyle its boundary without destroying the map. Layer buttons and point navigation are available to viewers, while the surrounding app retains its existing edit permissions.

Tile errors and a 9-second loading delay show a readable notice and Retry control. Boundaries, pins and the point list stay available when the basemap cannot load. Failure does not silently substitute a different basemap or a fabricated satellite image.

## Library and provider sources

- [Leaflet 1.9.4 official distribution](https://leafletjs.com/download.html): vendored with its BSD-2-Clause [license](../prototype/vendor/leaflet-1.9.4/LICENSE) and [hash manifest](../prototype/vendor/leaflet-1.9.4/vendor-manifest.json). `leaflet.js` matches the official SRI: `sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=`.
- [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/): normal interactive viewport tile loading; visible `© OpenStreetMap contributors` linked to the [copyright page](https://www.openstreetmap.org/copyright); browser referrer and HTTP caching are retained. Public standard tiles have no service-level guarantee. Production capacity planning should select an appropriately supported provider.
- [ESA WorldCover data access, annual composites and licence](https://esa-worldcover.org/en/data-access): the 2021 Sentinel-2 RGB composite is available without restriction of use under CC BY 4.0. Required credit is displayed on the map: “© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium”.
- [Terrascope WMTS documentation](https://docs.terrascope.be/Developers/WebServices/OGC/WMTSv2.html): public layers do not require authentication; the satellite layer is `esa-worldcover-s2rgbnir-10m-2021-v2_tcc`. The implementation uses the advertised WMTS GetTile endpoint with `TILEMATRIXSET=EPSG:3857` and `TIME=2021-01-01`.

Only library code and its assets are vendored. Provider tile images are not stored in the repository. No API token is embedded.

## Checks completed

Run `node scripts/check-map-runtime.cjs` from the repository root:

- 2,493 data/render assertions: all 308 public area scenes have valid closed polygons; illustrative pins are inside their scene; missing coordinates, unsupported geometry, viewport-only extents and untrusted strings are handled.
- 24 controller assertions: basemap choice, satellite metadata/credit, category filter/list count, tile error, offline state, boundary theme refresh, map destruction and listener cleanup.
- 15 app integration assertions: script/CSS order; detail-route destroy/render/mount order; Thai-to-English update; editor/viewer switching with read-only map access and preserved shortlist permission; leaving the detail route.
- A documented Terrascope GetTile request at z13 returned HTTP 200, `image/png` with a valid PNG signature. This is a network integration check, not visual QA or a service availability guarantee.

Not checked here: rendered layout, pointer/touch behaviour on real devices, visible tile appearance, screenshot quality or colour contrast measurements over actual imagery. Those remain a browser QA task.
