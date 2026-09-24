# Identity and sharing · Yolk v1.4

The owner requested a visible Landometer logo, browser icon and sharing hero. The earlier instruction still applies: no motifs and no frame, card or painted plate around the logo.

The native transparent image is now placed prominently in the existing sidebar (desktop) and header (mobile/tablet). Those **whole navigation surfaces** use LDS `brand.beige` and the matching light foreground tokens in both themes. Main content still follows the selected theme. The image is unchanged; no recolouring, filtering, tracing, cropped symbol or inverse logo is manufactured. Governed live text is no longer the displayed dark-theme fallback.

The six favicon/touch/manifest PNGs are copied byte-for-byte from the pinned **LDS0.9.4 / authoring0.9.4-r2 / machinev0.9.4-mp1** build kit. They are the approved **Landometer portfolio** set. This Yolk preview uses those marks as Landometer identity under the owner's present request. It does not claim that the package contains a separately approved CityMETER gradient tile, and it does not change the canonical DS register. That distinction remains in the machine contract.

The new sharing image is a deterministic **1200 ×630 PNG**. It uses the existing complete transparent logo, packaged Arvo/Bai Jamjuree font bytes and DS colour tokens. It contains the product name, tagline and preview description, with no private records, location scores or claims of validated sales performance. Its important text and identity fit the central square used by LINE. No browser screenshot or substitute glyph has been used. The original art remains immutable.

- [Asset roles, hashes, metadata boundary](../contracts/web-identity.v1.4.json)
- [Share-image recipe and source hashes](share-image-v1.4.json)
- [Share-image generation script](../scripts/build-share-image.py)
- [Original logo projection](logo-web-projection-v12.json)

The generated PNG was inspected directly as a local asset. Source tests cover exact bytes, dimensions, accessible alt text, cache revisions, initial Open Graph/Twitter metadata, canonical URL and manifest sizes. `noindex,nofollow` stays unchanged. These checks do not replace browser/device, tab-strip, installed-icon or live social-crawler review; those gates remain open. The GitHub project can declare `/yolk/` icons but cannot control a crawler's cached hostname-level icon. Hash routes share the product-level preview image.

Commands from the repository root:

```sh
node scripts/check-web-identity.cjs
node scripts/check-brand-identity.cjs
```

`build-share-image.py` requires Python with Pillow12.3.0 and FreeType support for WOFF2. Changing encoder/font source versions creates new output bytes and requires updating the receipt and metadata revision. Do not treat the image generator as a browser-QA tool.
