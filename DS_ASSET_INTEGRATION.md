# CityMETER: Yolk v1.2 · DS asset integration

**For dev:** use this with [the machine manifest](contracts/ds-assets.v1.2.json), [the implementation plan](IMPLEMENTATION_PLAN_v1.2.md), and [the DS resolution](evidence/ds-resolution.md). All paths in the manifest are relative to this package root. The prototype is a multi-file static browser preview; its `prototype/index.html` loads assets by relative URL, so it can sit below a repository base path such as `/yolk/prototype/`.

## Authority and exact bytes

- Pinned authority: **Landometer Design System 0.9.4**, authoring `0.9.4-r2`, ruleset `lds-rules-0.9.4`, frozen machine package `v0.9.4-mp1`. The package SHA256SUMS hash is `9a261eb4df7bf3be5cf1e23f7fb2bd7079c67ca481fc55dccc7049ac52d325cc`.
- [Runtime receipt](evidence/ds-runtime-assets-receipt.json) binds 25 packaged assets to SHA-256; [logo projection receipt](evidence/logo-web-projection-v12.json) binds the additional web-sized logo. The 26 entries, hashes, byte counts, roles, and source locations are enumerated in `contracts/ds-assets.v1.2.json`.
- The exact DS production color file is `prototype/assets/color-srgb-07.production.css`. `fonts.css` and `yolk-analytical.css` are **Yolk adapters**, with their own hashes; they are not canonical DS release files. Do not ship raw color provenance JSON or scales JSON as audience assets.
- The bundled WOFF2 files and license texts travel together. The font and Material Symbols bytes are exact registered assets. The static SVGs are exact registered motif overlay bytes.
- The large `Landometer-Logo-TransparentBG.png` is a source reference, not loaded by the page. The web runtime uses `landometer-logo-horizontal-v12-889.png`, a full-image proportional projection with no crop or recolor. The original DS source remains a **candidate** for a generic public/app-header role. The current request authorizes a GitHub preview and asset handoff for this Yolk artifact; it does not amend the canonical DS registry. Keep the original source PNG out of the deployed preview tree; retain its hash and projection receipt for provenance. Before production identity claims, record the role, surface, rights, clear space, and minimum size for the final product use.

## Connect the real implementation

1. **Pin and verify.** Copy the `ship_with_preview` entries from `contracts/ds-assets.v1.2.json` into the same relative asset layout, or remap every URL together. Verify their SHA-256 before committing and again in the built site. Keep the manifest and receipts with the source release; do not resolve assets from a `latest` alias or a developer's Downloads folder.
2. **Load the DS layer first.** Use the production color CSS, the WOFF2 loader, and the five-class analytical adapter before product styles. `prototype/index.html` shows the current order. In the production app, centralize font faces in one loader: the static prototype also declares faces in `base.css`, so do not copy both declarations into the final app.
3. **Use roles, not arbitrary colors.** UI surfaces, text, border, action and focus should consume `--ldm-*` variables from the production CSS. The `--yolk-heat-1`…`--yolk-heat-5` values map to five ordered model percentile classes: `#FBF1C6`, `#F0CA90`, `#E3A257`, `#B55E43`, `#850E2E`. The app, not the DS, defines class thresholds. Show metric, unit, direction, thresholds, scenario, analysis unit, source snapshot and as-of in the legend. Keep measured zero, missing, suppressed and out-of-scope visually and textually distinct; provide a map-equivalent list/table.
4. **Use the registered type and glyphs.** Latin display: Arvo 700; Thai display: IBM Plex Sans Thai Looped 700; body/UI: Bai Jamjuree 400/600; technical Latin: JetBrains Mono 400; technical Thai: IBM Plex Sans Thai 400. Thai headings need line height at least 1.25 until a size/script fixture proves otherwise. The nav symbol subset contains `open_in_new`, `menu`, `close`, `light_mode`, `dark_mode`, `contrast`, `groups`; the separate `open_in_new` file is for external-link use. Use readable text for any other action instead of a missing glyph.
5. **Connect identity and motif by role.** The runtime logo belongs on a solid light plate; preserve the whole image, aspect ratio and accessible name `Landometer`. The preview uses `dial-quiet.svg` only as a decorative orientation motif on Brand Blue, with `alt=""` and `aria-hidden="true"`. It is not a logo, score, loading state or data mark. `dial-full.svg` and both `rings-*` variants are available as exact assets but are not loaded by the current screen; add them only for their registered opening/transition jobs and carriers.
6. **Verify the shipped UI.** Confirm every asset request resolves at the deployed base path, all fonts load without silent fallback, English and Thai text wrap, focus and target sizes remain usable, and the map legend matches the values shown. Check 390, 768 and 1440 CSS px and keyboard/touch behavior before calling visual QA passed. The prior source/hash checks did **not** verify rendered browser layout; see [handoff verification](HANDOFF.md#verification).

## Reproducible asset check

From the package root, this checks every file marked `ship_with_preview` in the manifest:

```sh
python3 - <<'PY'
import hashlib, json, pathlib
m = json.loads(pathlib.Path('contracts/ds-assets.v1.2.json').read_text())
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
