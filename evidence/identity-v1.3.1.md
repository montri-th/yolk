# Identity correction · Yolk v1.3.1

The owner rejected the white rounded frame around the Landometer logo in the v1.3 preview. This instruction supersedes the earlier handoff recommendation to place that image on a light plate. Do not reintroduce a card, badge, rounded frame or a painted rectangle behind the logo. The owner then asked to remove all decorative motifs from this preview and use DS decision icons where they support a real action. This latest instruction supersedes the earlier decorative-footer treatment.

## Source and decision

The pinned authority remains LDS **0.9.4**, authoring **0.9.4-r2**, machine package **v0.9.4-mp1**. In that package, `asset-registry.json#/identity` contains one horizontal full-colour transparent PNG source, `identity.landometer.horizontal.source-candidate.01`; it contains no native inverse/white horizontal logo. The registered `logo-full.svg` and `logo-quiet.svg` files belong to the motif family. They are not substitutes for a navigation or corporate identity image.

The current artifact continues to use the unchanged proportional web derivative already supplied for Yolk:

- Runtime file: `prototype/assets/landometer-logo-horizontal-v12-889.png`.
- SHA-256: `989f58583bc54e4b9a743d0f04308df92fb7cf0bb2ae3ba9398ec9c03c481554`.
- Dimensions: 889 × 244 pixels; retain the complete transparent image and its ratio.
- Source and conversion record: [logo projection receipt](logo-web-projection-v12.json).

**Light theme:** place the transparent image directly under the existing sidebar/page container, with no new frame wrapper or decorative blue section. There is no logo plate. Use ordinary layout margin for clear space; never add background, border, radius, shadow, filter, masking, opacity or padding to the image.

**Dark theme:** show the canonical portfolio name **Landometer** as governed live text. This is an approved text identity, not an inverse logo or a reconstruction of the wordmark. Use the exact packaged Arvo 700 face, 18 CSS px, line height 1.2, tracking 0 and clear space 0.75 em from `identity-typography.app-header.browser.01`. Keep the spelling in Thai and English. Do not recolour the image to invent a white logo.

No motif is rendered in the current app. The blue decorative footer blocks are removed. Motif SVG files are excluded from this runtime and asset bundle. Their immutable upstream hashes may remain as historical provenance in the manifest; those reference records do not authorize rendering or shipping them in this Yolk version. Use only the appropriate DS icon asset and its allowed action/semantic role for interface controls; never treat an icon or motif as a substitute logo.

This decision follows LOGO-01 (approved asset or governed live-text implementation), the identity media rule (no crop, recolour or distortion) and the motif separation rules in the pinned DS. It records the current Yolk artifact's presentation correction; it does not promote the source candidate into a new generic DS logo role. [DS resolution](ds-resolution.md) retains the exact release provenance.

## Verification scope

Run `node scripts/check-brand-identity.cjs` from the package root. It checks template output and source rules: the rejected wrapper is absent, image/font hashes match, desktop/mobile identity is a direct child of its existing surface, image styles do not add a frame or recolour treatment, dark theme selects the canonical text, and app markup contains no motif bindings/assets or decorative footer panels.

The same check also verifies the [supplemental icon contract](../contracts/icons.v1.3.json): 29 requested glyphs agree with the runtime allowlist and [source receipt](yolk-icons-v1.3.json), the font/licence hashes match, unsupported names produce no icon, and icons stay hidden until their separate font loads. This product-specific subset follows the DS icon style; it is not a replacement for or an amendment to the immutable seven-glyph DS font.

These checks do not inspect a browser, decode the font shaping tables, or certify rendered spacing, glyph appearance, legibility or responsive layout. The existing manual visual/device gate remains open.
