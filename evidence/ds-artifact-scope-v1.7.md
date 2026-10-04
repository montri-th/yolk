# LDS artifact check — bounded coverage

LDS0.9.7 package integrity passed9,768 checks. The modified brand chooser CSS/JS, workspace layout and map controller passed the static registered-colour gate. The mobile map-options panel uses foundation background/border with no added alpha shadow. The rendered analytical map uses exact `li.demand` HEX and transparent selected interiors.

The full `index.html` dependency scan is **not PASS**: the pinned, original Leaflet1.9.4 CSS contains third-party colours/alpha shadows, and inherited Yolk UI CSS uses alpha shadows or backdrop compositing. This release does not certify full DS conformance or exhaustive contrast. The unchanged Leaflet source is preserved with licence/hash; Yolk's visible map controls, scale, attribution and popups are overridden with foundation roles.

Scope review: inherited backdrop/shadow compositing applies to neutral UI overlays or shadows, not data-valued choropleth colours. Basemap grayscale/invert/brightness is confined to the tile pane, not polygon fills, O/C/U markers or `li.demand` classes. Numerical scale values remain exact across themes. Canonical colour/scale/font binaries are not edited to suppress checker findings.

Follow-up production gate: audit inherited neutral UI compositing and the resolved Leaflet control cascade, then run actual contrast/accessibility/physical-device checks. Current source/hash/dependency/privacy checks and native Chrome responsive review are separate evidence, not substitutes for that gate.
