#!/usr/bin/env python3
"""Fail a public release if demo data or pinned DS assets drift."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
data_path = ROOT / "prototype/data/demo-data.json"
data = json.loads(data_path.read_text(encoding="utf-8"))
meta = data["metadata"]
areas = data["areas"]
pois = data["pois"]

assert meta["sourceType"] == "synthetic_public_demo" and meta["demoOnly"] is True
assert len(areas) == meta["areaCount"] == 308
assert len(pois) == meta["poiCount"] == 16
assert all(a.get("synthetic") is True and a["id"].startswith("demo-area-") for a in areas)
assert all(
    p.get("synthetic") is True
    and p["id"].startswith("demo-poi-")
    and p.get("lat") is None
    and p.get("lng") is None
    for p in pois
)
assert len({a["province"] for a in areas}) == 77

script_data = (ROOT / "prototype/data/demo-data.js").read_text(encoding="utf-8")
assert script_data.startswith("/* Synthetic public demo data")
assert "window.YOLK_DEMO_DATA=" in script_data
assert (ROOT / "prototype/index.html").read_text(encoding="utf-8").find('name="robots" content="noindex,nofollow"') >= 0

manifest = json.loads((ROOT / "contracts/ds-assets.v1.4.json").read_text(encoding="utf-8"))
runtime_assets = [a for a in manifest["assets"] if a["previewDistribution"] == "ship_with_preview"]
for asset in runtime_assets:
    path = ROOT / asset["path"]
    assert path.is_file(), f"missing DS asset: {asset['path']}"
    assert path.stat().st_size == asset["bytes"], f"DS asset size drift: {asset['path']}"
    assert hashlib.sha256(path.read_bytes()).hexdigest() == asset["sha256"], f"DS asset hash drift: {asset['path']}"
assert not (ROOT / "prototype/assets/Landometer-Logo-TransparentBG.png").exists()

text_suffixes = {".md", ".json", ".js", ".css", ".html", ".yaml", ".yml", ".svg", ".txt"}
for path in ROOT.rglob("*"):
    if not path.is_file() or path == Path(__file__) or path.suffix.lower() not in text_suffixes:
        continue
    if ".git" in path.parts:
        continue
    content = path.read_text(encoding="utf-8", errors="replace")
    forbidden = [
        "/Users/", "/var/folders/", "/private/raw/",
        "docs.google.com/" + "spreadsheets/d/",
        "bangchak-data." + "json", "bangchak-data." + "js",
        "7," + "954", "795" + "4",
    ]
    for marker in forbidden:
        assert marker not in content, f"private-source marker in {path.relative_to(ROOT)}"

for path in ROOT.rglob("*.md"):
    for raw in re.findall(r"(?<!!)\[[^]]+\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
        rel = raw.split("#", 1)[0].split("?", 1)[0]
        if not rel or urlparse(rel).scheme:
            continue
        assert (path.parent / rel).resolve().is_file(), f"broken local link in {path.relative_to(ROOT)}: {raw}"

print(f"Public release safe: {len(areas)} synthetic areas, {len(pois)} synthetic POIs, {len(runtime_assets)} pinned DS assets")
