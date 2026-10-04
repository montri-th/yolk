#!/usr/bin/env python3
"""Verify the bounded Yolk 1.7 Pages artifact, without network or file writes.

Checks declared public bytes, own-subpath dependencies, source dimensions,
current DS assets, active document links and actual emitted identity metadata.
This is not a fresh browser, native-device or production-service certification.
"""
from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import struct
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "prototype"
CANONICAL = "https://montri-th.github.io/yolk/"
MANIFEST = ROOT / "contracts/pages-public-manifest.v1.7.0.json"
ACTIVE_ROOT_DOCS = (
    "AGENTS.md", "README.md", "DESIGN.md", "START_HERE.md", "HANDOFF.md",
    "ASSET_INDEX_v1.7.md", "DS_ASSET_INTEGRATION.md",
    "CityMETER_Yolk_Product_Statement_v1.7.md", "IMPLEMENTATION_PLAN_v1.7.md",
)
TEXT_SUFFIXES = {".html", ".js", ".css", ".json", ".webmanifest", ".svg", ".md", ".txt"}
failures: list[str] = []
checks = 0


def check(condition: bool, message: str) -> bool:
    global checks
    checks += 1
    if not condition:
        failures.append(message)
    return bool(condition)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path):
    if not check(path.is_file(), f"Missing JSON: {path.relative_to(ROOT)}"):
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        check(False, f"Invalid JSON: {path.relative_to(ROOT)}: {exc}")
        return None


def within(path: Path, boundary: Path) -> bool:
    try:
        path.resolve().relative_to(boundary.resolve())
        return True
    except ValueError:
        return False


def local_target(source: Path, reference: str, *, hosted: bool = False) -> Path | None:
    """Resolve emitted own-site URLs; ignore fragments/data/external URLs."""
    value = reference.strip().strip("<>")
    parsed = urlsplit(value)
    if not parsed.path or value.startswith("#"):
        return None
    if parsed.scheme or parsed.netloc or value.startswith("//"):
        if not hosted or parsed.scheme != "https" or parsed.netloc != "montri-th.github.io":
            return None
        if not check(parsed.path.startswith("/yolk/"), f"URL escapes owned Pages subpath: {value}"):
            return None
        target = SITE / unquote(parsed.path[len("/yolk/"):])
    elif parsed.path.startswith("/"):
        if not check(hosted and parsed.path.startswith("/yolk/"), f"Root-relative dependency escapes Pages: {value}"):
            return None
        target = SITE / unquote(parsed.path[len("/yolk/"):])
    else:
        target = source.parent / unquote(parsed.path)
    boundary = SITE if hosted else ROOT
    if parsed.path.endswith("/") and target.is_dir():
        target = target / "index.html"
    if not check(within(target, boundary), f"Dependency outside {'site' if hosted else 'repo'}: {source.relative_to(ROOT)} → {value}"):
        return None
    return target.resolve()


def verify_reference(source: Path, reference: str, *, hosted: bool = False) -> Path | None:
    target = local_target(source, reference, hosted=hosted)
    if target is None:
        return None
    if not check(target.is_file(), f"Missing dependency: {source.relative_to(ROOT)} → {reference}"):
        return None
    query = urlsplit(reference).query
    # Content-addressed revision IDs must represent the file actually emitted.
    revisions = re.findall(r"(?:^|&)v=([0-9a-f]{12,64})(?:&|$)", query)
    for revision in revisions:
        check(digest(target).startswith(revision), f"Stale URL content hash: {source.relative_to(ROOT)} → {reference}")
    return target


class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, list[dict[str, str]]] = {}
        self.links: list[dict[str, str]] = []
        self.references: list[str] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ("src", "href"):
            if values.get(key):
                self.references.append(values[key])
        if tag == "meta":
            key = values.get("property", values.get("name", ""))
            self.meta.setdefault(key, []).append(values)
        if tag == "link":
            self.links.append(values)

    def content(self, key):
        rows = self.meta.get(key, [])
        return rows[0].get("content") if rows else None


def png_dimensions(path: Path) -> tuple[int, int] | None:
    data = path.read_bytes()[:24]
    if not check(len(data) == 24 and data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR",
                 f"Expected PNG/IHDR: {path.relative_to(ROOT)}"):
        return None
    return struct.unpack(">II", data[16:24])


def main() -> int:
    public = read_json(MANIFEST)
    if not isinstance(public, dict):
        return finish()
    rows = public.get("files")
    if not check(isinstance(rows, list) and bool(rows), "Public manifest must contain nonempty files rows"):
        return finish()
    paths: set[str] = set()
    for row in rows:
        if not check(isinstance(row, dict) and isinstance(row.get("path"), str), "Malformed public manifest row"):
            continue
        name = row["path"]
        path = ROOT / name
        if not check(not Path(name).is_absolute() and ".." not in Path(name).parts and within(path, ROOT), f"Unsafe manifest path: {name}"):
            continue
        check(name not in paths, f"Duplicate public manifest path: {name}")
        paths.add(name)
        if check(path.is_file(), f"Missing declared public file: {name}"):
            check(path.stat().st_size == row.get("bytes"), f"Declared public byte length drift: {name}")
            check(digest(path) == row.get("sha256"), f"Declared public SHA-256 drift: {name}")
    site_files = {p.relative_to(ROOT).as_posix() for p in SITE.rglob("*") if p.is_file()}
    check(site_files <= paths, "Public prototype files omitted from manifest: " + ", ".join(sorted(site_files - paths)))
    for name in ("data/demo-data.js", "data/demo-data.json", "data/demo-map-context.js"):
        check(not (SITE / name).exists(), f"Unused synthetic feed remains in public artifact: {name}")

    index = SITE / "index.html"
    if not check(index.is_file(), "Missing prototype entrypoint"):
        return finish()
    html = index.read_text(encoding="utf-8")
    head = HeadParser()
    head.feed(html)
    for reference in head.references:
        verify_reference(index, reference, hosted=True)
    for stylesheet in SITE.rglob("*.css"):
        for reference in re.findall(r"url\(\s*([^)]*?)\s*\)", stylesheet.read_text(encoding="utf-8")):
            verify_reference(stylesheet, reference.strip("\"' "), hosted=True)

    bootstrap = SITE / "bootstrap.js"
    if check(bootstrap.is_file(), "Missing bootstrap"):
        code = bootstrap.read_text(encoding="utf-8")
        check("../contracts/" not in code, "Bootstrap contracts escape owned Pages subpath")
        for name in ("industry-profiles.json", "runtime-asset-hashes.json"):
            check(f"contracts/{name}" in code, f"Bootstrap does not emit owned contract path: {name}")
            root_copy, site_copy = ROOT / "contracts" / name, SITE / "contracts" / name
            if check(root_copy.is_file() and site_copy.is_file(), f"Missing runtime contract pair: {name}"):
                check(root_copy.read_bytes() == site_copy.read_bytes(), f"Runtime contract copy drift: {name}")
        check("data/demo-" not in code, "Bootstrap imports illustrative synthetic feeds")
    check("color-srgb-07" not in html and "data/demo-" not in html, "Index imports historical colour/synthetic data authority")
    hashes = read_json(ROOT / "contracts/runtime-asset-hashes.json")
    if check(isinstance(hashes, dict) and bool(hashes), "Missing/empty runtime asset hash map"):
        for name, value in hashes.items():
            path = SITE / name
            if check(within(path, SITE) and path.is_file(), f"Hash-map runtime asset missing: {name}"):
                check(isinstance(value, str) and len(value) >= 12 and digest(path).startswith(value), f"Runtime JS/CSS hash drift: {name}")

    area = read_json(SITE / "data/real/area-context.json")
    if isinstance(area, dict):
        areas, metrics, states = area.get("rows", []), area.get("metrics", []), area.get("stateCatalog", [])
        check(len(areas) == 7954 and len({r[0] for r in areas}) == 7954, "Expected 7,954 unique reporting UUIDs")
        check(sum(r[3] == "SUBDISTRICT" for r in areas) == 180, "Expected 180 BKK subdistrict units")
        check(sum(r[3] == "MUNICIPALITY" for r in areas) == 7774, "Expected 7,774 upcountry municipality units")
        check(len(metrics) == 25 and len({m.get("id") for m in metrics}) == 25, "Expected 25 unique metric dimensions")
        check(all(len(r[8]) == 25 and len(r[9]) == 25 for r in areas), "Area metric/state vector dimensions changed")
        check(all(all(isinstance(i, int) and 0 <= i < len(states) for i in r[9]) for r in areas), "Invalid metric-state catalogue index")
        check("source_row_missing" in states and "observed_zero" in states, "Missing and observed-zero states not distinct")
        check(all(m.get("formula") and m.get("sourceMetricId") and m.get("display") for m in metrics), "Metric formula/source/display disclosure missing")
    product = read_json(ROOT / "contracts/product.v1.7.json")
    if isinstance(product, dict):
        check(product.get("activeIndustries") == ["fuel", "grocery", "nonbank"], "Product scope must contain exactly three industries")
        check(product.get("ds", {}).get("version") == "0.9.7", "Product DS authority must be 0.9.7")
    profiles = read_json(ROOT / "contracts/industry-profiles.json")
    if isinstance(profiles, dict):
        check([p.get("industry_id") for p in profiles.get("profiles", [])] == ["fuel", "grocery", "nonbank"], "Preset profile scope must contain exactly three industries")
    ds = read_json(ROOT / "contracts/ds-assets.v1.6.json")
    if isinstance(ds, dict):
        check(ds.get("dsVersion") == "0.9.7" and ds.get("release") == "v0.9.7-owner.1", "Unexpected current DS release")
        for row in ds.get("currentFiles", []):
            path = ROOT / row["path"]
            if check(within(path, ROOT) and path.is_file(), f"DS/approved asset missing: {row['path']}"):
                check(digest(path) == row["sha256"], f"DS/approved asset hash drift: {row['path']}")
                if "bytes" in row:
                    check(path.stat().st_size == row["bytes"], f"DS/approved asset byte length drift: {row['path']}")

    docs = [ROOT / name for name in ACTIVE_ROOT_DOCS]
    docs.extend(p for p in (ROOT / "docs").rglob("*.md") if not re.search(r"v1\.[2-5](?:\D|$)", p.name))
    if (ROOT / "evidence/QA.md").is_file():
        docs.append(ROOT / "evidence/QA.md")
    for document in sorted(set(docs)):
        if not check(document.is_file(), f"Missing active document: {document.relative_to(ROOT)}"):
            continue
        for reference in re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", document.read_text(encoding="utf-8")):
            verify_reference(document, reference)

    # Narrow known privacy markers and high-confidence literal credentials only.
    # Normative DS prose is not interpreted as a prohibition or user instruction.
    secrets = (
        ("private-key block", r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        ("GitHub token literal", r"\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b"),
        ("AWS access key literal", r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    )
    for path in sorted(SITE.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for marker in ("/Users/", "/var/folders/", "docs.google.com/spreadsheets/"):
            check(marker not in text, f"Private/local reference in public runtime: {path.relative_to(ROOT)}: {marker}")
        for description, pattern in secrets:
            check(re.search(pattern, text) is None, f"{description} in public runtime: {path.relative_to(ROOT)}")

    check(head.content("robots") == "noindex,nofollow", "Indexing boundary changed")
    canonical_links = [link.get("href") for link in head.links if link.get("rel") == "canonical"]
    check(canonical_links == [CANONICAL], "Canonical URL missing/incorrect")
    check(head.content("og:url") == CANONICAL, "OG URL does not match owned live route")
    check(head.content("og:type") == "website", "OG type missing/incorrect")
    check(head.content("twitter:card") == "summary_large_image", "Twitter large-card metadata missing")
    image_url = head.content("og:image")
    check(bool(image_url), "OG image missing")
    check(head.content("og:image:secure_url") == image_url, "Secure OG image differs")
    check(head.content("twitter:image") == image_url, "Twitter and OG images differ")
    if image_url:
        check(image_url.startswith(CANONICAL), "Share image must use owned canonical path")
        image = verify_reference(index, image_url, hosted=True)
        if image:
            dimensions = png_dimensions(image)
            check(dimensions == (1200, 630), "Share PNG must be 1200×630")
            check(head.content("og:image:width") == "1200" and head.content("og:image:height") == "630", "OG dimensions differ from actual asset")
            check(head.content("og:image:type") == "image/png", "OG image MIME missing/incorrect")
    check(bool(head.content("og:image:alt")) and bool(head.content("twitter:image:alt")), "Share-image alt text missing")
    check("Local three-industry preview" not in html, "Public social metadata still calls this a local preview")

    favicons = [link for link in head.links if link.get("rel") == "icon"]
    check({link.get("sizes") for link in favicons} >= {"16x16", "32x32", "48x48"}, "Approved favicon size set missing")
    for link in favicons + [link for link in head.links if link.get("rel") == "apple-touch-icon"]:
        image = verify_reference(index, link.get("href", ""), hosted=True)
        if image:
            dimensions = png_dimensions(image)
            size = link.get("sizes", "")
            if re.fullmatch(r"\d+x\d+", size):
                check(dimensions == tuple(map(int, size.split("x"))), f"Favicon dimensions differ: {image.relative_to(ROOT)}")
    touch = [link for link in head.links if link.get("rel") == "apple-touch-icon"]
    check(any(link.get("sizes") == "180x180" for link in touch), "Approved 180px touch icon missing")
    manifests = [link for link in head.links if link.get("rel") == "manifest"]
    if check(len(manifests) == 1, "Expected one webmanifest link"):
        path = verify_reference(index, manifests[0].get("href", ""), hosted=True)
        webmanifest = read_json(path) if path else None
        if isinstance(webmanifest, dict):
            check(all(webmanifest.get(key) == "/yolk/" for key in ("id", "scope", "start_url")), "Webmanifest route/scope must stay /yolk/")
            light = next((row.get("content") for row in head.meta.get("theme-color", []) if row.get("media") == "(prefers-color-scheme: light)"), None)
            check(webmanifest.get("theme_color") == light, "Webmanifest theme colour differs from emitted light foundation")
            check(webmanifest.get("background_color") == light, "Webmanifest background differs from emitted light foundation")
            for icon in webmanifest.get("icons", []):
                image = verify_reference(path, icon.get("src", ""), hosted=True)
                if image:
                    dimensions = png_dimensions(image)
                    size = icon.get("sizes", "")
                    if re.fullmatch(r"\d+x\d+", size):
                        check(dimensions == tuple(map(int, size.split("x"))), f"Install-icon dimensions differ: {image.relative_to(ROOT)}")
    return finish()


def finish() -> int:
    print(json.dumps({
        "status": "PASS" if not failures else "FAIL", "checks": checks,
        "failures": failures, "canonical": CANONICAL,
        "scope": "Declared public bytes, local emitted dependencies, current source dimensions, DS hashes, active document links and public identity/privacy boundaries; no fresh visual/native-device or production-service certification",
    }, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, OSError, ValueError) as exc:
        check(False, f"Malformed required release input: {type(exc).__name__}: {exc}")
        raise SystemExit(finish())
