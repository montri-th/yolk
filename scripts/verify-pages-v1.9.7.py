#!/usr/bin/env python3
"""Verify the bounded Yolk 1.9.7 Pages artifact, without network or file writes.

Checks declared public bytes, own-subpath dependencies, source dimensions,
current DS assets, active document links and actual emitted identity metadata.
This is not a fresh browser, native-device or production-service certification.
"""
from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import struct
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "prototype"
CANONICAL = "https://montri-th.github.io/yolk/"
MANIFEST = ROOT / "contracts/pages-public-manifest.v1.9.7.json"
ACTIVE_ROOT_DOCS = (
    "AGENTS.md", "README.md", "DESIGN.md", "START_HERE.md", "HANDOFF.md", "HANDOFF_v1.9.7.md",
    "ASSET_INDEX_v1.9.7.md", "DS_ASSET_INTEGRATION.md",
    "IMPLEMENTATION_PLAN_v1.9.7.md", "CityMETER_Yolk_Full_Product_and_Implementation_v1.9.7.md",
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
    check(head.content("yolk-release") == "1.9.7", "Emitted release metadata must be 1.9.7")
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

    # Delivery1.9.3 changes the opportunity entry and guide/map experience; semantic1.9.0 authorities remain pinned.
    selection = read_json(ROOT / "contracts/public-copy-selection.v1.9.7.json")
    if isinstance(selection, dict):
        check(selection.get("version") == "1.9.7", "Public selection version mismatch")
        check(paths == set(selection.get("selectedFiles", [])), "Manifest paths differ from the explicit current public allowlist")
    check(public.get("version") == "1.9.7", "Current manifest version mismatch")
    analysis = read_json(ROOT / "contracts/map-analysis.v1.7.2.json")
    if isinstance(analysis, dict):
        check(analysis.get("version") == "1.7.2", "Map analysis contract version mismatch")
        inv = analysis.get("invariants", {})
        check(inv.get("reportingUUIDs") == 7954 and inv.get("metrics") == 25, "Map extension changes fine-model dimensions")
        check(analysis.get("nativeDistrictSource", {}).get("fineCorrectionsAppliedToDistricts") is False, "Fine corrections may not be applied to native districts")
        check(analysis.get("classification", {}).get("viewportRecalibration") is False, "Map bins must stay national within grain")
        for command in analysis.get("verification", {}).get("newCommands", []):
            match = re.fullmatch(r"node (scripts/[a-z-]+\.cjs)", command)
            check(bool(match) and (ROOT / match.group(1)).is_file(), "Missing/invalid new regression command: " + command)
    review = read_json(ROOT / "contracts/location-review.v1.7.3.json")
    if isinstance(review, dict):
        check(review.get("version") == "1.7.3", "Retained review extension version mismatch")
        check(review.get("invariants", {}).get("reportingUUIDs") == 7954, "Review extension changed national cohort")
        check(review.get("runtime", {}).get("changesSource") is False, "Review explanation must not mutate source")
        check(review.get("tierAppearance", {}).get("kind") == "categorical_screening_tier", "Egg tier category contract missing")
        check(review.get("tierAppearance", {}).get("tier2", {}).get("hex") == "#FFBC1F", "Native Yolk yellow mismatch")
        check(review.get("quantitativeLUT41", {}).get("screeningCutoffsChanged") is False, "LUT41 cannot change Demand screening cutoffs")
        for command in review.get("verification", {}).get("newCommands", []):
            match = re.fullmatch(r"node (scripts/[a-z0-9-]+\.cjs)", command)
            check(bool(match) and (ROOT / match.group(1)).is_file(), "Missing new review/LUT regression: " + command)
    appearance = read_json(ROOT / "contracts/map-boundary-appearance.v1.7.4.json")
    if isinstance(appearance, dict):
        check(appearance.get("version") == "1.7.4", "Retained boundary appearance version mismatch")
        tokens = appearance.get("sourceTokens", {})
        check(tokens.get("ordinaryStroke", {}).get("hex") == "#FFFFFF", "Owner white boundary token mismatch")
        check(tokens.get("hoverStroke", {}).get("hex") == "#FFBC1F", "Owner Yolk hover token mismatch")
        widths = appearance.get("strokeSchedulePx", {})
        check(widths.get("province", 0) > widths.get("districtCloser", 0) > widths.get("fineOrdinary", 0), "Parent-child stroke hierarchy mismatch")
        check(appearance.get("selectedFine", {}).get("fill") is False, "Selected fine interior must remain transparent")
        inv = appearance.get("invariants", {})
        check(inv.get("supplyCutoffFormulaUnchanged") is True and inv.get("supplyOnlyChangeMutatesDemand") is False, "Supply clarity must not change Demand/formula")
    branch = read_json(ROOT / "contracts/branch-context.v1.7.5.json")
    if isinstance(branch, dict):
        check(branch.get("version") == "1.7.5" and branch.get("baseline") == "1.7.4", "Retained branch-context baseline version mismatch")
        source_first = branch.get("sourceFirst", {})
        check(source_first.get("existingSourceAssignmentPreserved") is True and source_first.get("sourceOverwrite") is False, "Context hints must preserve source assignment")
        coordinates = branch.get("coordinates", {})
        check(coordinates.get("aggregateMutation") is False and coordinates.get("automaticEvent") is False and coordinates.get("autoFit") is False, "Coordinate suggestions must not mutate aggregates/events/camera")
        check(branch.get("savePolicy", {}).get("statusUnchangedByAutofill") is True, "Autofill must not certify a branch")
    experience = read_json(ROOT / "contracts/criteria-experience.v1.8.0.json")
    if isinstance(experience, dict):
        check(experience.get("version") == "1.8.0" and experience.get("industries") == ["fuel", "grocery", "nonbank"], "Retained criteria baseline version/scope mismatch")
        check(experience.get("demand", {}).get("defaultMaxDemandTier") == 3, "Default Demand-tier inclusion must retain all three qualifying tiers")
        check(experience.get("supply", {}).get("membershipEffect") == "NONE" and experience.get("ranking", {}).get("membershipEffect") == "NONE", "Supply and ranking cannot change active Demand membership")
        patterns = experience.get("patterns", {})
        check(all(patterns.get(key) is False for key in ("active", "uiCards", "filter", "starPriority")), "Retired pattern selection/filter/star gates may not remain active")
        symbols = experience.get("symbols", {})
        check(symbols.get("our", {}).get("icon") == "shield" and symbols.get("competitor", {}).get("icon") == "swords", "Supply-party icon contract mismatch")
        check(experience.get("map", {}).get("selectedFineFill") is False, "Selected fine area must retain transparent interior")
        for name in ("simple-criteria.js", "simple-criteria.css", "supply-compare.js", "supply-symbols.css"):
            check((SITE / name).is_file(), "Missing current experience runtime: " + name)
    icons = read_json(ROOT / "contracts/icons.v1.8.0.json")
    if isinstance(icons, dict):
        check(icons.get("ds_version") == "0.9.7" and icons.get("kind") == "product_specific_subset_extension_not_canonical_ds_asset", "Icon extension must preserve canonical DS authority")
        check({"shield", "swords", "arrow_forward"} <= set(icons.get("glyphs", [])), "Required new/retained icon glyphs missing")
        check(icons.get("axes") == {"FILL": 0, "wght": 300, "GRAD": 0, "opsz": 24}, "Icon extension axes differ from intended runtime")
        for row in icons.get("assets", []):
            path = ROOT / row.get("path", "")
            if check(within(path, SITE) and path.is_file(), "Missing/unsafe product icon font"):
                check(path.read_bytes()[:4] == b"wOF2", "Product .woff2 asset is not actual WOFF2 bytes")
                check(path.stat().st_size == row.get("bytes") and digest(path) == row.get("sha256"), "Product icon font manifest drift")
    # Current v1.9 source contracts: evidence queues, not renamed historical market patterns.
    strategy = read_json(ROOT / "contracts/opportunity-strategies.v1.9.0.json")
    strategy_ids = {"underserved_market", "segment_gap", "competitive_entry", "cluster_participation", "complementary_location", "route_capture", "network_infill", "future_entry"}
    if isinstance(strategy, dict):
        check(strategy.get("releaseVersion") == "1.9.0" and strategy.get("engineVersion") == "1.9.0", "Current strategy version mismatch")
        check(strategy.get("flow") == ["confirm_Demand", "compare_Supply_and_competition", "choose_brand_strategy"], "Strategy flow must follow confirmed Demand and Supply comparison")
        check(strategy.get("maximumJointFactorsPerChoice") == 3 and strategy.get("maximumSelectedStrategies") == 3, "Joint factor/strategy cap must be three")
        check(strategy.get("oldEightPatterns", {}).get("active") is False and strategy.get("oldEightPatterns", {}).get("mustNotMapToNewStrategies") is True, "Historical D/C/B patterns must not be revived as strategies")
        strategies = strategy.get("strategies", [])
        check(len(strategies) == 8 and {r.get("id") for r in strategies} == strategy_ids, "Exactly eight distinct current strategies required")
        check(all(len(r.get("jointFactors", [])) <= 3 and r.get("confirmedBusinessOpportunity") is False for r in strategies), "Strategy factor cap / unconfirmed-opportunity boundary missing")
        p0_ids = {r.get("id") for r in strategies if r.get("p0CandidateSupported") is True}
        check(p0_ids == {"underserved_market", "competitive_entry", "complementary_location", "network_infill"}, "P0 must use current datasets only, keeping unsupported strategies incomplete")
        check(strategy.get("complementaryP0", {}).get("maximumSelectedActivityMetrics") == 3, "Complementary activity choice cap missing")
        check(set(strategy.get("complementaryP0", {}).get("availableActivityMetrics", [])) == {"factory_count", "factory_workers", "hotel_rooms"}, "Current complementary cues cannot invent hospital/school point coverage")
        check(strategy.get("ordering", {}).get("mutatesExistingRank") is False and strategy.get("ordering", {}).get("scoreNotProduced") is True, "Strategy sorting must not imply a calibrated investment score or rewrite legacy rank")
        check("evidence_incomplete" in strategy.get("states", []) and "not_supported_by_current_evidence" in strategy.get("states", []), "Strategy evidence states missing")
    brands = read_json(SITE / "data/brand-strategy-profiles.v1.9.0.json")
    if isinstance(brands, dict):
        policy = brands.get("policy", {}); records = brands.get("brands", [])
        check(brands.get("version") == "1.9.0" and len(records) == 37 and len({r.get("brandId") for r in records}) == 37, "Current brand profiles require 37 distinct selectable identities")
        check({r.get("industryId") for r in records} == {"fuel", "grocery", "nonbank"}, "Current profiles must retain exactly three industries")
        check(sum(r.get("industryId") == "nonbank" for r in records) == 10, "Selectable nonbank scope must retain top ten")
        check(policy.get("maxJointFactors") == 3 and all(policy.get("choicePoints", {}).get(k) == 3 for k in ("demandFactorFamilies", "metricsWithinFactor", "supplyFactors", "strategySelection")), "Brand/profile choice caps must be three at every joint choice")
        source_ids = {r.get("id") for r in brands.get("sources", [])}
        check(all(r.get("id") and re.match(r"^https?://", r.get("url", "")) for r in brands.get("sources", [])), "Research sources need public IDs and exact source URLs")
        known_metrics = {r.get("id") for r in area.get("metrics", [])} if isinstance(area, dict) else set()
        for brand in records:
            name = brand.get("brandId", "missing")
            check(brand.get("positioning", {}).get("consumerPerceptionStatus") == "not_measured", "Operator positioning may not become measured consumer perception: " + name)
            check(set(brand.get("sourceIds", [])) <= source_ids, "Unresolved brand source references: " + name)
            scopes = brand.get("perScopeProfiles", {})
            check(isinstance(scopes, dict) and brand.get("defaultScope") in scopes, "Default brand format/scope needs a matching preset: " + name)
            for scope, profile in scopes.items():
                factors = profile.get("factorPresets", [])
                check(isinstance(factors, list) and 1 <= len(factors) <= 3, "Preset factor-family cap mismatch: " + name + ":" + scope)
                check(len(profile.get("defaultStrategyIds", [])) <= 3 and set(profile.get("defaultStrategyIds", [])) <= strategy_ids, "Default strategy selection invalid: " + name + ":" + scope)
                for factor in factors:
                    metrics = factor.get("metricIds", [])
                    check(1 <= len(metrics) <= 3 and set(metrics) <= known_metrics, "Preset factor metric cap/source mismatch: " + name + ":" + scope)
                    for rule in factor.get("tierPaths", []):
                        conditions = rule.get("all", [])
                        check(rule.get("tier") in (1, 2, 3) and 1 <= len(conditions) <= 3, "Joint rule must have a valid tier and at most three metrics: " + name + ":" + scope)
                        for condition in conditions:
                            cut = condition.get("percentile")
                            check(condition.get("metric") in known_metrics and condition.get("op") == "gte_percentile" and isinstance(cut, (int, float)) and not isinstance(cut, bool) and 1 <= cut <= 100 and condition.get("positive_presence") is True, "Unsupported preset metric/cutoff/presence rule: " + name + ":" + scope)
    full = read_json(ROOT / "contracts/full-product.v1.9.7.json")
    if isinstance(full, dict):
        check(full.get("version") == "1.9.7", "Current full-product blueprint version mismatch")
        check(full.get("scope", {}).get("industries") == ["fuel", "grocery", "nonbank"] and full.get("source", {}).get("fixedUniverse") == 7954, "Current full blueprint must retain three industries and the fixed national cohort")
        demand_current = full.get("demand", {})
        check(all(demand_current.get(key) == 3 for key in ("maxEnabledFactors", "maxDistinctMetricsPerFactor", "maxConditionsPerPath")), "Current Demand factor/joint metric limits must be three")
        check("National parity is mandatory" in demand_current.get("percentile", ""), "Current factor mode must use the fixed nationwide cohort")
    for name in ("opportunity-engine.js", "strategy-ui.js", "strategy-ui.css", "demand-factors.js"):
        check((SITE / name).is_file(), "Missing current strategy/factor runtime: " + name)
    app = (SITE / "app.js").read_text(encoding="utf-8")
    nav_match = re.search(r"const navItems=([^;]+);", app)
    nav_ids = re.findall(r"\['([^']+)'", nav_match.group(1)) if nav_match else []
    check(nav_ids == ["market", "demand", "targets", "supply", "criteria", "feed"], "Current navigation must have one opportunity entry with dedicated support tasks, not a duplicate Strategy menu")
    check("function market(){return YolkStrategyUI.page();}" in app and "if(route==='strategy')route='market'" in app, "Canonical market entry and legacy Strategy compatibility alias missing")
    check("['market','demand','supply','targets','criteria'].includes(id)" in app, "Mobile navigation should retain five primary tasks including Opportunities")
    map_code = (SITE / "workspace-map.js").read_text(encoding="utf-8")
    check("S.supplyView='regions'" in map_code and "getSupplyView:()=>S.supplyView" in map_code and "POINT_GRID_PX=56" in map_code, "Supply default regions, optional point-view API and bounded display grouping missing")
    check("YolkStrategyUI.mapRows(s.nextRows)" in map_code, "Strategy map must receive a separate projection of current Demand rows")

    map_space = read_json(ROOT / "contracts/map-space.v1.9.4.json")
    if isinstance(map_space, dict):
        check(map_space.get("version") == "1.9.4", "Retained map-space version mismatch")
        check(map_space.get("status") == "final_runtime_values_current_QA_bound", "Retained map-space runtime/QA binding pending")
        check(map_space.get("retainedVersions", {}).get("strategyGuide") == "1.9.3", "Map-space patch cannot migrate the retained illustrated guide")
        check(all(map_space.get("invariants", {}).get(key) is True for key in ("nationalBenchmarkUnchanged", "demandMembershipUnchanged", "supplyTotalsUnchanged", "savedCriteriaAndDraftsPreserved", "samePersistentMap", "analyticalColorAndOpacityUnchanged", "originalBrandAssetsUnchanged", "guideRegistryUnchanged", "personalDisplayOnly")), "Map-space invariants missing")
        check(full.get("experience", {}).get("mapSpace") == map_space, "Full blueprint map-space projection differs")
    mobile_flow = read_json(ROOT / "contracts/mobile-flow.v1.9.5.json")
    if isinstance(mobile_flow, dict):
        check(mobile_flow.get("version") == "1.9.5", "Retained mobile-flow version mismatch")
        check(mobile_flow.get("status") == "final_runtime_values_current_QA_bound", "Retained mobile-flow runtime/QA binding pending")
        check(all(mobile_flow.get("invariants", {}).get(k) is True for k in ("normalDocumentFlowAtNarrowWidths", "workPaneReachableByPageScroll", "desktopLayoutUnchanged", "samePersistentMap", "routeAndCriteriaPreserveCamera", "savedCriteriaAndDraftsPreserved", "nationalBenchmarkUnchanged", "demandMembershipUnchanged", "supplyTotalsUnchanged", "analyticalColorAndOpacityUnchanged", "originalBrandAssetsUnchanged", "guideRegistryUnchanged", "personalDisplayOnly")), "Retained mobile-flow invariants missing")
        check(full.get("experience", {}).get("mobileFlow") == mobile_flow, "Full blueprint mobile-flow projection differs")
    map_readability = read_json(ROOT / "contracts/map-readability.v1.9.6.json")
    if isinstance(map_readability, dict):
        check(map_readability.get("version") == "1.9.6", "Current map-readability version mismatch")
        check(map_readability.get("status") == "final_runtime_values_current_QA_bound", "Current map-readability runtime/QA binding pending")
        check(all(map_readability.get("invariants", {}).get(k) is True for k in ("nationalBenchmarkUnchanged", "demandMembershipUnchanged", "supplyTotalsUnchanged", "savedCriteriaAndDraftsPreserved", "samePersistentMap", "cameraAndNavigationUnchanged", "analyticalFillColorAndOpacityUnchanged", "originalBrandAssetsUnchanged", "guideRegistryUnchanged", "parentChildHierarchyPreserved", "whiteOutlineAndYellowHoverPreserved", "mobileDocumentFlowPreserved", "readableCaptionsPreserved", "personalDisplayOnly")), "Current map-readability invariants missing")
        check(full.get("experience", {}).get("mapReadability") == map_readability, "Current full blueprint map-readability projection differs")
        check(map_readability.get("demandIdentity", {}).get("newArtworkOrFont") is False, "Demand semantic wrapper cannot claim new artwork/font")
        check(map_readability.get("demandIdentity", {}).get("eggCount") == 1 and map_readability.get("opportunityIdentity", {}).get("eggCount") == 3, "Demand/Opportunity mnemonic must be one/three approved eggs")
        check(map_readability.get("opportunityIdentity", {}).get("newArtworkOrFont") is False, "Opportunity semantic composition cannot claim new artwork/font")
    supply_display = read_json(ROOT / "contracts/supply-inventory.v1.9.7.json")
    if isinstance(supply_display, dict):
        check(supply_display.get("version") == "1.9.7" and supply_display.get("status") == "final_runtime_values_current_QA_bound", "Current Supply count/share/treemap runtime/QA binding pending")
        check(full.get("experience", {}).get("supplyInventoryDisplay") == supply_display, "Full blueprint Supply display projection differs")
        check(all(supply_display.get("invariants", {}).get(k) is True for k in ("demandTierAndEligibleIdsUnchanged", "supplyCriteriaAndRankingUnchanged", "sourceVectorsAndPOICoverageSeparate", "sameMapCameraAndNavigation", "noTeamEventOrSourceMutation", "unknownNotZeroOrCompetitor")), "Supply display invariants missing")
        metric = supply_display.get("metrics", {}).get("ownBranchShare", {})
        check(metric.get("formula") == "100 * own / (own + identified competitors)" and metric.get("unknownExcluded") is True and "undefined_ratio" in metric.get("exactZeroDenominator", ""), "Identified branch share formula/unknown/empty-basis semantics missing")
        palette = supply_display.get("mapPalette", {})
        source_palette = read_json(ROOT / palette.get("source", ""))
        approved = next((r for r in source_palette.get("scales", []) if r.get("scaleId") == "li.market_share" and r.get("theme") == "light"), {}) if isinstance(source_palette, dict) else {}
        check(palette.get("scaleId") == "li.market_share" and palette.get("domain") == [0, 100] and palette.get("samples") == 41 and palette.get("lut") == approved.get("lut") and palette.get("scaleVersion") == approved.get("scaleVersion"), "Share display must retain exact fixed-domain41 LDS scale")
        check((ROOT / palette.get("source", "")).is_file() and digest(ROOT / palette["source"]) == palette.get("sourceSha256"), "Pinned Supply share palette source SHA drift")
        treemap = supply_display.get("treemap", {})
        check(treemap.get("panelMaximumRectangles") == 10 and treemap.get("hoverMaximumRectangles") == 5 and treemap.get("brandListInitialRows") == treemap.get("brandListMoreStep") == 40, "Current treemap/list disclosure caps differ")
        check(set(treemap.get("runtimeFiles", [])) == {"prototype/supply-treemap.js", "prototype/supply-treemap.css"} and all((ROOT / n).is_file() for n in treemap.get("runtimeFiles", [])), "Current new treemap runtime files missing")
        verification = supply_display.get("verification", {})
        check(set(verification.get("requiredSuites", [])) == {"scripts/check-supply-market-share.cjs", "scripts/check-supply-treemap.cjs"} and all((ROOT / n).is_file() for n in verification.get("requiredSuites", [])), "New current Supply regression suites missing")
        for key in ("integrated", "native"):
            row = verification.get(key, {})
            check(isinstance(row, dict) and (ROOT / row.get("receipt", "")).is_file() and digest(ROOT / row["receipt"]) == row.get("receiptSha256"), "Fresh current Supply " + key + " receipt SHA mismatch")
        review = verification.get("native", {}).get("review", {})
        check(review.get("passed") is True and bool(review.get("checkIds")), "Current Supply-specific native evidence missing")
        hover = full.get("experience", {}).get("interactionGuidance", {}).get("hover", {}).get("aggregation", {})
        check("Direct native source vector" in hover.get("countrySupplyRegion", "") and "Direct native hovered district vector" in hover.get("provinceOrDistrictSupplyRegion", ""), "Active Supply hover cannot retain retired maximum-child summaries")
    refinement = read_json(ROOT / "contracts/visual-refinement.v1.9.7.json")
    if isinstance(refinement, dict):
        check(refinement.get("version") == "1.9.7" and refinement.get("status") == "final_runtime_values_current_QA_bound", "Current visual refinement runtime/QA binding missing or pending")
        check(full.get("experience", {}).get("visualRefinement") == refinement, "Current visual refinement full projection differs")
        for key in ("treemapBrandColors", "mapCameraEnvelope", "expandedBasemapResize", "compactMapControls", "numberDisplay"):
            check(refinement.get(key, {}).get("status") == "runtime_confirmed", "Current visual refinement values pending: " + key)
        check(all(refinement.get("invariants", {}).values()) and bool(refinement.get("invariants")), "Current refinement retained invariants missing")
        colors = refinement.get("treemapBrandColors", {})
        registry_name = colors.get("mappingRegistry", "")
        registry_path = ROOT / registry_name
        if check(registry_path.is_file() and within(registry_path, SITE) and registry_name in paths, "Current brand-color registry absent or not explicitly approved"):
            check(digest(registry_path) == colors.get("mappingRegistrySha256"), "Current brand-color registry SHA drift")
        check(colors.get("exactDSValuesOnly") is True and colors.get("originalLogoBytesUnchanged") is True, "Current brand colors must use exact approved DS values with original artwork")
        check(refinement.get("mapCameraEnvelope", {}).get("administrativeTotalsFollowScopeNotViewport") is True, "Camera envelope cannot alter administrative totals")
        camera_envelope = refinement.get("mapCameraEnvelope", {})
        floor = camera_envelope.get("minimumZoomFormula", {})
        check(camera_envelope.get("absoluteBaseMinimumZoom") == 3 and camera_envelope.get("maximumZoom") == 19 and floor.get("hostPaddingPixels") == 36 and floor.get("quantum") == 0.25 and floor.get("floor") == "max(3, min(19, floor(4 * (fitZoom - 0.25)) / 4))", "Current camera floor must use frozen host-dependent context projection rather than global minZoom3")
        camera_source = camera_envelope.get("runtimeSource", {})
        check(camera_source.get("path") == "prototype/workspace-map.js" and camera_source.get("sha256") == digest(SITE / "workspace-map.js"), "Current dynamic camera runtime SHA drift")
        check(all(refinement.get("expandedBasemapResize", {}).get(k) is True for k in ("samePersistentMap", "cameraPreservedWithinEnvelope", "geographicConstraintMayClamp")), "Expand resize must retain map and permitted camera with only explicit geographic constraint clamping")
        controls = refinement.get("compactMapControls", {})
        check(controls.get("displayOptions") == ["options", "expand"] and controls.get("representationOptions") == ["regions", "points"] and controls.get("wrapAtNarrowWidths") is False, "Current four paired controls contract differs")
        number_display = refinement.get("numberDisplay", {})
        check(number_display.get("thousandsSeparator") == "," and number_display.get("grouping") is True and number_display.get("calculationOrStoredValuesChanged") is False, "Number formatting must group visible values without altering raw numeric values")
        for key in ("integrated", "native"):
            row = refinement.get("verification", {}).get(key, {})
            path = ROOT / row.get("receipt", "") if isinstance(row, dict) else ROOT
            check(isinstance(row, dict) and path.is_file() and within(path, ROOT) and digest(path) == row.get("receiptSha256"), "Fresh current refinement " + key + " QA receipt SHA differs")
        check(all((ROOT / n).is_file() for n in refinement.get("requiredSuites", [])), "Current refinement regression path missing")
    expansion = read_json(ROOT / "contracts/expansion-experience.v1.9.3.json")
    if isinstance(expansion, dict):
        check(expansion.get("version") == "1.9.3", "Current expansion experience version mismatch")
        check(expansion.get("retainedVersions") == {"criteria": "1.9.0", "profiles": "1.9.0", "strategyEngine": "1.9.0", "interaction": "1.9.1", "brandIdentityUI": "1.9.2", "DS": "0.9.7"}, "Experience patch cannot silently migrate analytical, identity or DS authorities")
        first = expansion.get("firstPage", {})
        check(first.get("route") == "#market" and first.get("compatibilityAlias", {}).get("from") == "#strategy", "Current first-page route/compatibility contract mismatch")
        check(first.get("queue", {}).get("primaryCounters") == ["confirmed Demand eligible in selected scope", "candidate-to-check locations in selected scope"], "First-page main counters must distinguish confirmed Demand from strategy candidates")
        inv = expansion.get("invariants", {})
        check(all(inv.get(k) is True for k in ("nationalBenchmarkUnchanged", "demandMembershipUnchanged", "supplyTotalsUnchanged", "savedCriteriaAndDraftsPreserved", "samePersistentMap", "analyticalColorAndOpacityUnchanged")), "Experience patch lacks preserved source, calculation, camera or colour invariants")
        check(first.get("strategySelection", {}).get("maximumSelected") == 3, "Current opportunity view must retain the three-strategy cap")
    strategy_ui = (SITE / "strategy-ui.js").read_text(encoding="utf-8")
    strip = re.search(r'<div class="strategy-counters opportunity-counters"[^>]*>(.*?)</div></div>', strategy_ui, re.S)
    check(bool(strip) and re.findall(r'\$\{num\(([^)]+)\)\}', strip.group(1)) == ["eligible", "scoped.length"], "Emitted first-page counter strip must have the two actual scope-specific quantities")
    check("eligible=rows.filter(a=>a.eligible&&inMapArea(a)).length" in strategy_ui and "scoped=candidates(v).filter(item=>inMapArea(candidateRow(item)))" in strategy_ui, "Opportunity counters must use administrative scope, not visible markers or camera viewport")
    check("['criteria','market','strategy'].includes(Y.route)?draft:Y.criteria" in strategy_ui, "Canonical and legacy opportunity routes must use the same private draft")
    check("setMapExpanded" in map_code and "retryBasemap" in map_code and "observer.observe(S.host)" in map_code, "Current personal map expansion, explicit imagery recovery or host resize observer missing")
    for name in ("check-map-hierarchy.cjs", "check-map-recovery.cjs", "check-strategy-guide.cjs"):
        check((ROOT / "scripts" / name).is_file(), "Missing current bounded experience regression: " + name)

    guide_path = SITE / "data/strategy-guide.v1.9.3.json"
    guide = read_json(guide_path)
    if isinstance(guide, dict):
        check(guide.get("version") == "1.9.3" and guide.get("engineVersion") == "1.9.0", "Guide identity or retained engine authority mismatch")
        check(guide.get("readOnly") is True and guide.get("languages") == ["th", "en"], "Guide must be read-only and bilingual")
        examples = guide.get("examplePolicy", {})
        check(all(examples.get(k) is True for k in ("allExamplesHypothetical", "noRealLocationsBrandsResults", "noEligibilityOrThresholdMutation")), "Guide illustrations must remain hypothetical and cannot alter screening")
        guide_rows = guide.get("strategies", [])
        check(len(guide_rows) == 8 and {r.get("id") for r in guide_rows} == strategy_ids, "Guide must have exactly the eight current strategy IDs")
        glyphs = set(icons.get("glyphs", [])) if isinstance(icons, dict) else set()
        for row in guide_rows:
            check(row.get("icon") in glyphs, "Guide icon missing from retained approved product font subset: " + str(row.get("id")))
            for key in ("name", "shortLabel", "oneSentence", "why", "tradeoff", "question"):
                check(all(isinstance(row.get(key, {}).get(lang), str) and row[key][lang].strip() for lang in ("th", "en")), "Guide field lacks usable Thai/English copy: " + str(row.get("id")) + ":" + key)
            check(len(row.get("howToUse", [])) == 3, "Each guide requires three concise steps")
            for key in ("scenario", "action", "caveat"):
                check(all(row.get("illustrativeExample", {}).get(key, {}).get(lang) for lang in ("th", "en")), "Guide example/caveat translation missing")
    for name in ("strategy-guide.js", "strategy-guide.css"):
        check((SITE / name).is_file(), "Missing current read-only guide runtime: " + name)
    guide_code = (SITE / "strategy-guide.js").read_text(encoding="utf-8")
    for reference in re.findall(r"fetch\(['\"]([^'\"]+)['\"]", guide_code):
        verify_reference(SITE / "strategy-guide.js", reference, hosted=True)
    check("'strategy-guide.js'" in (SITE / "bootstrap.js").read_text(encoding="utf-8"), "Actual runtime loader does not include the guide")
    for name in ("app.js", "bootstrap.js", "strategy-ui.js", "strategy-guide.js", "workspace-map.js"):
        code = (SITE / name).read_text(encoding="utf-8")
        check(not re.search(r"\bdebugger\s*;|console\.(?:log|debug)\s*\(|__YOLK_DEBUG", code), "Temporary debug instrumentation in emitted runtime: " + name)

    retained_assets = read_json(ROOT / "contracts/assets.v1.9.2.json")
    baseline = {r.get("path"): r for r in retained_assets.get("assetFiles", [])} if isinstance(retained_assets, dict) else {}
    unchanged_semantics = ("relative-supply.js", "demand-factors.js", "opportunity-engine.js", "data/brand-strategy-profiles.v1.9.0.json", "data/real/area-context.json", "data/real/fuel-supply.json", "data/real/grocery-supply.json", "data/real/nonbank-supply.json")
    for name in unchanged_semantics:
        row = baseline.get("prototype/" + name)
        check(bool(row) and (SITE / name).is_file() and digest(SITE / name) == row.get("sha256"), "Experience-only release changed retained analytical/profile/source bytes: " + name)

    display_guard = read_json(ROOT / "contracts/model-display-only.v1.9.7.json")
    if isinstance(display_guard, dict):
        prefixes = display_guard.get("excludedLinePrefixes", [])
        model_code = (SITE / "model.js").read_text()
        normalized = "\n".join(line for line in model_code.splitlines() if not any(line.startswith(prefix) for prefix in prefixes)) + "\n"
        check(prefixes == ["function formatDisplayNumber(", "function supplyCountText(", "function displayValue(", "// Display formatting only: source values, coordinates and input values remain numeric."], "Model guard may exclude only named display helpers/comment")
        check(hashlib.sha256(normalized.encode()).hexdigest() == display_guard.get("unchangedNormalizedSha256"), "Retained analytical/storage model lines changed outside approved display helpers")
    interaction = read_json(ROOT / "contracts/interaction-guidance.v1.9.1.json")
    if isinstance(interaction, dict):
        check(interaction.get("version") == "1.9.1", "Current interaction extension version mismatch")
        inv = interaction.get("invariants", {})
        check(inv.get("demandMembershipUnchanged") is True and inv.get("sourceCountsUnchanged") is True, "Interaction patch must not change source or eligibility")
        hover = interaction.get("hover", {})
        check(hover.get("maxVisibleAreaTooltips") == 1 and hover.get("owner") == "clickable_navigation_scope", "Area hover must have one navigation-scope owner")
        check(hover.get("paintLayerTooltipAtBroaderScope") is False, "Paint children must not duplicate broader hover")
        cue = interaction.get("actionGuidance", {})
        check(cue.get("maximumConcurrentCues") == 1 and cue.get("countAuthority"), "Action cue must be bounded and use real target count")
        check(cue.get("reducedMotion") and cue.get("focusPolicy") and cue.get("interruption"), "Final-state/reduced-motion/focus behavior required")
        for name in ("action-guidance.js", "action-guidance.css"):
            check((SITE / name).is_file(), "Missing functional action runtime: " + name)
        for command in interaction.get("verification", {}).get("commands", []):
            match = re.fullmatch(r"node (scripts/[a-z-]+\.cjs)", command)
            check(bool(match) and (ROOT / match.group(1)).is_file(), "Missing interaction regression: " + command)

    brand_ui = read_json(ROOT / "contracts/brand-identity-ui.v1.9.2.json")
    if isinstance(brand_ui, dict):
        check(brand_ui.get("version") == "1.9.2", "Current brand/control extension version mismatch")
        check(brand_ui.get("retainedVersions") == {"criteria": "1.9.0", "profiles": "1.9.0", "strategyEngine": "1.9.0", "interaction": "1.9.1", "DS": "0.9.7"}, "Presentation patch must retain calculation and interaction versions")
        inv = brand_ui.get("invariants", {})
        check(inv.get("sourceTotalsUnchanged") is True and inv.get("demandMembershipUnchanged") is True, "Brand/control update must not change Supply totals or Demand eligibility")
        artwork = brand_ui.get("brandArtwork", {})
        art = artwork.get("brands", [])
        check(len(art) == 3 and {row.get("brandName") for row in art} == {"Villa Market", "Lawson108", "Tops"}, "Exactly three owner-supplied artwork bindings required")
        registry_path = ROOT / artwork.get("registry", "")
        registry = read_json(registry_path) if registry_path.is_file() and within(registry_path, SITE) else None
        check(isinstance(registry, dict) and digest(registry_path) == artwork.get("registrySha256"), "Current brand registry bytes must match the artwork extension")
        registry_entries = {row.get("brandId"): row for row in registry.get("entries", [])} if isinstance(registry, dict) else {}
        receipt = read_json(ROOT / artwork.get("provenanceReceipt", ""))
        check(isinstance(receipt, dict) and receipt.get("version") == "1.9.2" and receipt.get("registrySha256") == artwork.get("registrySha256"), "Current supplied-artwork provenance receipt must match the registry")
        for row in art:
            path = ROOT / row.get("path", "")
            if check(path.is_file() and within(path, SITE), "Missing/unsafe current brand artwork: " + row.get("brandName", "missing")):
                check(path.stat().st_size == row.get("bytes") and digest(path) == row.get("sha256"), "Current supplied artwork bytes/hash drift: " + row.get("brandName", "missing"))
                check(row.get("mime") == "image/png" and png_dimensions(path) == (row.get("width"), row.get("height")), "Current supplied PNG dimensions/MIME drift: " + row.get("brandName", "missing"))
                bound = registry_entries.get(row.get("brandId"), {})
                check(bound.get("sourceKind") == "owner_supplied" and bound.get("sha256") == row.get("sha256") and "prototype/" + bound.get("localPath", "") == row.get("path"), "Owner-supplied graphic must bind the existing brand ID: " + row.get("brandName", "missing"))
                check(bound.get("dimensions") == [row.get("width"), row.get("height")] and row.get("sourceReference", "").startswith("owner-attachment:"), "Artwork aspect/provenance must remain explicit: " + row.get("brandName", "missing"))
        check(artwork.get("runtimeLoader") == "prototype/bootstrap.js" and artwork.get("registryUrl", "").removeprefix("data/") in (SITE / "bootstrap.js").read_text(), "Actual runtime loader must request the current owner artwork revision")
        chip = brand_ui.get("supplyChips", {})
        check(chip.get("fontOwnership") and chip.get("accessibility"), "Icon font/caption/accessibility contract missing")
        check(chip.get("tabIds") == ["all", "own", "competitor", "unverified", "archived"], "Five Supply tabs must preserve current meanings")
        check(chip.get("layout", {}).get("glyphPx") == 22 and chip.get("layout", {}).get("gapPx") == 8, "Chip typography/layout contract mismatch")
        check((ROOT / "scripts/check-icon-controls.cjs").is_file(), "Current icon-control regression missing")

    hierarchy = read_json(SITE / "data/real/hierarchy-index.json")
    district_ids = {row.get("id") for row in hierarchy.get("districts", [])} if isinstance(hierarchy, dict) else set()
    check(len(district_ids) == 928 and None not in district_ids, "Expected928exact native district IDs")
    district_context = read_json(SITE / "data/real/district-context.json")
    if isinstance(district_context, dict):
        contexts = district_context.get("contextsById", {})
        check(set(contexts) == district_ids, "Native district context IDs differ from geometry hierarchy")
        for name, row in contexts.items():
            check(row.get("id") == name and row.get("grain") == "DISTRICT", "Invalid direct district context identity: " + name)
            for key in ("areaKm2", "population", "gfa"):
                value = row.get(key)
                check(isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and value > 0, "Missing/nonpositive direct district denominator: " + name + ":" + key)
    for industry in ("fuel", "grocery", "nonbank"):
        source = read_json(SITE / f"data/real/{industry}-district-supply.json")
        if not isinstance(source, dict):
            continue
        fields = source.get("fields", [])
        check(fields[:6] == ["areaId", "state", "dimensionCounts", "total", "sourceKey", "mapped"], "Native district supply schema mismatch: " + industry)
        rows, provinces = source.get("rows", []), source.get("provinceRows", [])
        check(len(rows) == 928 and len({r[0] for r in rows}) == 928 and {r[0] for r in rows} == district_ids, "Native district Supply IDs mismatch: " + industry)
        check(len(provinces) == 77 and len({r[0] for r in provinces}) == 77, "Expected77direct province rows: " + industry)
        totals = []
        for label, records in (("district", rows), ("province", provinces)):
            dimensions = {}
            total = 0
            for row in records:
                if not check(len(row) >= 6 and row[1] == "source_row_present" and isinstance(row[2], dict), "Invalid current native source row: " + industry + ":" + label):
                    continue
                valid = all(isinstance(n, int) and not isinstance(n, bool) and n >= 0 for n in row[2].values())
                check(valid, "Invalid native dimension count: " + industry + ":" + str(row[0]))
                if not valid:
                    continue
                check(sum(row[2].values()) == row[3], "Native dimensions do not reconcile row total: " + industry + ":" + str(row[0]))
                total += row[3]
                for key, n in row[2].items():
                    dimensions[key] = dimensions.get(key, 0) + n
            totals.append((total, dimensions))
        check(totals[0] == totals[1] == (source.get("countryTotal"), source.get("countryDimensionCounts")), "Native D/P/country dimension reconciliation failed: " + industry)
        check(source.get("metadata", {}).get("sourceManifest") == "district-source-provenance.json", "Native source must reference compact public provenance, not private acquisition path: " + industry)
    provenance = read_json(SITE / "data/real/district-source-provenance.json")
    check(isinstance(provenance, dict), "Missing compact native district public provenance")
    release = read_json(ROOT / "contracts/release.v1.9.7.json")
    if isinstance(release, dict):
        share = release.get("shareImage", {})
        check(share.get("family") == "1.7" and share.get("changedInThisRelease") is False, "Retained1.7family share image declaration missing")
        older = read_json(ROOT / "evidence/share-image-v1.7.json")
        older_row = next((row for row in older.get("files", []) if row.get("path") == share.get("asset")), None) if isinstance(older, dict) else None
        share_path = ROOT / share.get("asset", "")
        check(bool(older_row) and share_path.is_file() and digest(share_path) == older_row.get("sha256"), "Declared unchanged1.7family share image bytes differ from retained1.7 share-image receipt")

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
        "scope": "Declared public bytes, local emitted dependencies, current fine/district source dimensions and reconciliation, explicit public allowlist, DS hashes, active document links and public identity/privacy boundaries; no fresh visual/native-device or production-service certification",
    }, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, OSError, ValueError) as exc:
        check(False, f"Malformed required release input: {type(exc).__name__}: {exc}")
        raise SystemExit(finish())
