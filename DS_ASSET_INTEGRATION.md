# CityMETER: Yolk v1.5 · DS asset integration

**For dev:** use this with [the machine manifest](contracts/ds-assets.v1.5.json), [the implementation plan](IMPLEMENTATION_PLAN_v1.5.md), and [the DS resolution](evidence/ds-resolution.md). All paths in the manifest are relative to this package root. The prototype is a multi-file static browser preview; its `prototype/index.html` loads assets by relative URL, so it can sit below a repository base path such as `/yolk/prototype/`.

## Authority and exact bytes

- Pinned authority: **Landometer Design System 0.9.4**, authoring `0.9.4-r2`, ruleset `lds-rules-0.9.4`, frozen machine package `v0.9.4-mp1`. The package SHA256SUMS hash is `9a261eb4df7bf3be5cf1e23f7fb2bd7079c67ca481fc55dccc7049ac52d325cc`.
- [Runtime receipt](evidence/ds-runtime-assets-receipt.json) binds the original packaged assets to SHA-256; [logo projection receipt](evidence/logo-web-projection-v12.json) binds the additional web-sized logo. The inventory includes historical references; **21 entries are shipped**. Hashes, byte counts, roles, and source locations are enumerated in `contracts/ds-assets.v1.5.json`.
- The exact DS production color file is `prototype/assets/color-srgb-07.production.css`. `fonts.css` and `yolk-analytical.css` are **Yolk adapters**, with their own hashes; they are not canonical DS release files. Do not ship raw color provenance JSON or scales JSON as audience assets.
- The bundled WOFF2 files and license texts travel together. The font and Material Symbols bytes are exact registered assets. Decorative motif SVGs are excluded from this Yolk release. The additional decision-icon font is a separately pinned product extension described in [the icon contract](contracts/icons.v1.5.json).
- The large `Landometer-Logo-TransparentBG.png` is a source reference, not loaded by the page. The web runtime uses `landometer-logo-horizontal-v12-889.png`, a full-image proportional projection with no crop or recolor. The original DS source remains a **candidate** for a generic public/app-header role. The current request authorizes a GitHub preview and asset handoff for this Yolk artifact; it does not amend the canonical DS registry. Keep the original source PNG out of the deployed preview tree; retain its hash and projection receipt for provenance. Before production identity claims, record the role, surface, rights, clear space, and minimum size for the final product use.

## Connect the real implementation

1. **Pin and verify.** Copy the `ship_with_preview` entries from `contracts/ds-assets.v1.5.json` into the same relative asset layout, or remap every URL together. Verify their SHA-256 before committing and again in the built site. Keep the manifest and receipts with the source release; do not resolve assets from a `latest` alias or a developer's Downloads folder.
2. **Load the DS layer first.** Use the production color CSS, the WOFF2 loader, and the five-class analytical adapter before product styles. `prototype/index.html` shows the current order. In the production app, centralize font faces in one loader: the static prototype also declares faces in `base.css`, so do not copy both declarations into the final app.
3. **Use roles, not arbitrary colors.** UI surfaces, text, border, action and focus should consume `--ldm-*` variables from the production CSS. The `--yolk-heat-1`…`--yolk-heat-5` values map to five ordered model percentile classes: `#FBF1C6`, `#F0CA90`, `#E3A257`, `#B55E43`, `#850E2E`. The app, not the DS, defines class thresholds. Show metric, unit, direction, thresholds, scenario, analysis unit, source snapshot and as-of in the legend. Keep measured zero, missing, suppressed and out-of-scope visually and textually distinct; provide a map-equivalent list/table.
4. **Use the registered type and glyphs.** Latin display: Arvo 700; Thai display: IBM Plex Sans Thai Looped 700; body/UI: Bai Jamjuree 400/600; technical Latin: JetBrains Mono 400; technical Thai: IBM Plex Sans Thai 400. Thai headings need line height at least 1.25 until a size/script fixture proves otherwise. The nav symbol subset contains `open_in_new`, `menu`, `close`, `light_mode`, `dark_mode`, `contrast`, `groups`; the separate `open_in_new` file is for external-link use. Decision controls use a separately pinned **37-glyph Material Symbols Rounded subset**, FILL 0 / weight 300 / GRAD 0 / optical size 24, with source and licence receipts in [icons.v1.5.json](contracts/icons.v1.5.json). It follows the DS style but does not alter the canonical DS font. Load `icons.css` before `experience.css` and `icons.js` before feature rendering. Use `YolkIcons.icon(name)` beside a visible label; unsupported names return empty, and a failed font load keeps the label visible without showing a ligature word.
5. **Place identity directly; omit motifs.** Place the unchanged transparent logo directly on the desktop sidebar or inside the mobile settings disclosure. Do not create a frame, card, badge or backing plate. Chrome follows the selected theme; do not force a large beige strip in dark mode. No approved reverse-logo variant is bundled, so do not invent, invert or recolour one. The owner-directed preview uses the unchanged native asset on dark chrome; full DS identity-role/contrast conformance is not claimed and rendered logo legibility remains an open QA item. Do not substitute a typed wordmark. Six exact approved portfolio icon files and the product share image are bound in [the web identity contract](contracts/web-identity.v1.5.json). Do not recolour or crop the logo. All motifs are disabled and excluded from Yolk runtime, following the owner’s explicit correction. Use DS-style interface icons only where they clarify a control, alongside visible labels. See [asset index](ASSET_INDEX_v1.5.md).
6. **Verify the shipped UI.** Confirm every asset request resolves at the deployed base path, all fonts load without silent fallback, English and Thai text wrap, focus and target sizes remain usable, and the map legend matches the values shown. Check 390, 768 and 1440 CSS px and keyboard/touch behavior before calling visual QA passed. The prior source/hash checks did **not** verify rendered browser layout; see [handoff verification](HANDOFF.md#verification).

## Theme, type and identity adapters

Load component CSS, including map/photo styles, before `prototype/experience.css`, followed by `decision-ui.css`, `identity.css` and `yolk-focus.css` for decision controls, compact navigation and Yolk presentation. Load `theme.js` in the head so the selected preference applies before body paint. The exact runtime load order remains visible in `prototype/index.html`.

`experience.css` maps **product roles** to exact LDS 0.9.4 tokens; it does not redefine canonical `--ldm-*` values. Light uses `surface-alt-light` (#EEF1EE) for canvas and `surface-canvas-light` (#F6F7F3) for cards, reducing large bright surfaces. Dark uses canonical canvas/card/soft/text/border/action roles. This is a Yolk surface choice; the DS still includes brighter raised/card roles for their appropriate contexts.

The dark analytical heat classes are the exact pinned five-class projection: `#393129`, `#7A5933`, `#C28336`, `#E0AA89`, `#FFD1D3`. Do not interpolate or substitute a decorative gradient. The app owns thresholds and meaning in both themes. Yolk v1.5 uses the first three steps of the existing analytical heat palette for three product-defined confirmed-Yolk bins (<95,95–<99,≥99); this is not a new canonical DS ramp. UI Yolk chips use series03 paired with primary-dark ink; accents use the pinned warning-foreground light token and energy-yellow dark token. This product gold meaning is Demand, not the warning-status meaning, so visible Yolk labels are required.

Main text is 17 px on phones and 18 px on larger screens; main controls are 16 px and ordinary metadata is 14 px. Keep Thai body leading 1.65 and script-aware display families. These sizes are product implementation choices, not new DS normative tokens. No logo plate or decorative motif is allowed in this Yolk release. The native image is available directly in the desktop sidebar and mobile menu. Theme-aware chrome does not add a separate logo carrier. Mobile closes to Yolk/inbox/menu; theme, language and actor controls are inside the disclosure.

`theme.js` provides light/dark/system with default `system`, local preference persistence, OS updates, cross-tab sync and `yolk:themechange`. Do not notify teammates when someone changes their personal theme. Map controls/popups and branch-photo controls use the same theme aliases; satellite pixels remain unchanged. Provider maps and AI-generated photo mockups are content, not canonical DS assets.

See [the experience contract](contracts/experience.v1.3.json) and [ordered implementation steps](docs/EXPERIENCE_v1.3.md). The active `ds-assets.v1.5.json` pins the selected immutable DS assets; `icons.v1.5.json` pins the product icon extension. Older v1.2/v1.3/v1.4 inventories are historical only. The v1.4 calculation contract remains active; asset versions and calculation versions are independent. The six portfolio favicon PNGs are additional exact DS bytes recorded separately by web-identity.v1.5.json. Current product adapter hashes belong in [the release contract](contracts/release.v1.5.0.json). Release status is `ready_with_open_manual_gate`: source token/contrast checks are not rendered visual verification.

## Reproducible asset check

From the package root, this checks every file marked `ship_with_preview` in the manifest:

```sh
python3 - <<'PY'
import hashlib, json, pathlib
m = json.loads(pathlib.Path('contracts/ds-assets.v1.5.json').read_text())
for a in m['assets']:
    if a['previewDistribution'] != 'ship_with_preview':
        continue
    p = pathlib.Path(a['path'])
    assert p.is_file(), f'missing: {p}'
    assert hashlib.sha256(p.read_bytes()).hexdigest() == a['sha256'], f'drift: {p}'
print('DS runtime asset hashes passed')
PY
```

The manifest records asset linkage and byte identity. The product brief and implementation contracts remain the authority for Yolk's data, behavior and business meaning; the DS release does not validate those product facts.
