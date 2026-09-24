#!/usr/bin/env python3
"""Verify exact public inventory, checksums, declared asset contracts and optional ZIP.

No archive extraction is needed: ZIP entries are validated and compared directly
with the package bytes, rejecting traversal, duplicates, symlinks and additions.
This does not replace verify-public-release.py or rendered browser QA.
"""
import argparse
import importlib.util
import json
import re
import stat
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("yolk_handoff_build", Path(__file__).with_name("build-handoff.py"))
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def verify_declared_assets(root, contract_name):
    contract = read_json(root / contract_name)
    checked = set()
    def walk(value):
        if isinstance(value, dict):
            name = value.get("path")
            digest = value.get("sha256")
            distribution = value.get("previewDistribution")
            if isinstance(name, str) and isinstance(digest, str) and distribution not in {"reference_only", "reference-only", "not_distributed", "excluded"}:
                # Source-only entries are retained as evidence, never copied into the public package.
                if distribution is not None and distribution != "ship_with_preview":
                    return
                require(build.safe_relative(name), "Unsafe asset path in " + contract_name)
                p = root / name
                require(p.is_file() and not p.is_symlink(), "Missing declared asset: " + name)
                data = p.read_bytes()
                require(build.sha(data) == digest, "Declared asset hash mismatch: " + name)
                if "bytes" in value:
                    require(len(data) == value["bytes"], "Declared asset byte size mismatch: " + name)
                checked.add(name)
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)
    walk(contract)
    return checked


def verify(root, zip_path=None):
    root = root.resolve()
    manifest = read_json(root / "handoff-manifest.json")
    require(manifest.get("schemaVersion") == 1, "Unsupported manifest schema")
    require(manifest.get("version") == build.VERSION, "Handoff version differs from builder")
    require(manifest.get("distribution", {}).get("dataPolicy") == "public_synthetic_only", "Public synthetic policy missing")
    require(manifest.get("distribution", {}).get("motifsEnabled") is False, "Motifs must remain disabled")
    require(any(g.get("status") == "open" and "Browser" in g.get("gate", "") for g in manifest.get("gates", [])), "Manual browser gate must remain open")
    entries = manifest.get("artifacts", [])
    require(isinstance(entries, list) and entries, "Empty artifact inventory")
    indexed = {}
    for entry in entries:
        name = entry.get("path", "")
        require(build.safe_relative(name), "Unsafe artifact path")
        require(name not in indexed and name not in build.SELF_FILES, "Duplicate or self-cyclic artifact: " + name)
        require(re.fullmatch(r"[a-f0-9]{64}", entry.get("sha256", "")), "Invalid digest: " + name)
        indexed[name] = entry
    actual = set(build.distributable_files(root))
    expected = set(indexed)
    require(actual == expected, "Inventory drift: missing=" + repr(sorted(expected-actual)) + "; added=" + repr(sorted(actual-expected)))
    for name, entry in indexed.items():
        data = (root / name).read_bytes()
        require(build.sha(data) == entry["sha256"], "Artifact hash mismatch: " + name)
        require(len(data) == entry.get("bytes"), "Artifact byte size mismatch: " + name)
    checksum_entries = {}
    for line in (root / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
        match = re.fullmatch(r"([a-f0-9]{64})  (.+)", line)
        require(match is not None, "Invalid checksum line")
        digest, name = match.groups()
        require(build.safe_relative(name) and name not in checksum_entries, "Duplicate/unsafe checksum entry")
        checksum_entries[name] = digest
    require(set(checksum_entries) == expected | {"handoff-manifest.json"}, "Checksum inventory differs from manifest")
    for name, digest in checksum_entries.items():
        require(build.sha((root / name).read_bytes()) == digest, "Checksum mismatch: " + name)
    contracts = ["contracts/assets.v1.4.json", "contracts/ds-assets.v1.4.json", "contracts/icons.v1.3.json", "contracts/web-identity.v1.4.json"]
    assets = set()
    for name in contracts:
        require((root / name).is_file(), "Required release asset contract missing: " + name)
        assets.update(verify_declared_assets(root, name))
    release_path = root / "contracts/release.v1.4.0.json"
    require(release_path.is_file(), "Release contract is missing")
    release = read_json(release_path)
    require(isinstance(release, dict) and release, "Release contract must be an object")
    require(release.get("handoff_revision", release.get("version")) == build.VERSION, "Release version mismatch")
    runtime_paths = verify_declared_assets(root, "contracts/release.v1.4.0.json")
    require(runtime_paths == {n for n in expected if n.startswith("prototype/")}, "Release runtime inventory differs from package")
    fingerprint = release.get("runtime_fingerprint", {})
    require(fingerprint.get("algorithm") == "sha256", "Unsupported runtime fingerprint")
    fingerprint_text = "".join(build.sha((root / name).read_bytes()) + "  " + name + "\n" for name in sorted(runtime_paths))
    require(fingerprint.get("value") == build.sha(fingerprint_text.encode("utf-8")), "Runtime fingerprint mismatch")
    require(fingerprint.get("file_count") == len(runtime_paths), "Runtime fingerprint count mismatch")
    asset_contract = read_json(root / "contracts/assets.v1.4.json")
    declared_asset_names = [a["path"] for a in asset_contract.get("assets", [])]
    require(len(declared_asset_names) == len(set(declared_asset_names)), "Duplicate product asset entries")
    require(asset_contract.get("shipped_asset_count") == len(declared_asset_names), "Shipped asset count mismatch")
    if zip_path:
        names = sorted(expected | build.SELF_FILES)
        with zipfile.ZipFile(zip_path) as archive:
            infos = archive.infolist()
            archive_names = [i.filename for i in infos]
            required_names = {build.ZIP_ROOT + "/" + name for name in names}
            require(len(archive_names) == len(set(archive_names)), "Duplicate ZIP entries")
            require(set(archive_names) == required_names, "ZIP inventory differs from package")
            for info in infos:
                require(build.safe_relative(info.filename), "Unsafe ZIP path")
                require(not stat.S_ISLNK(info.external_attr >> 16), "ZIP symlink is forbidden")
                require(info.date_time == (2026, 9, 24, 0, 0, 0), "ZIP timestamp is not deterministic")
                relative = info.filename[len(build.ZIP_ROOT) + 1:]
                require(archive.read(info) == (root / relative).read_bytes(), "ZIP byte mismatch: " + relative)
    return {"status":"passed", "version":build.VERSION, "artifacts":len(entries), "declaredAssets":len(assets), "zipVerified":bool(zip_path), "manualVisualGate":"open"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--zip", type=Path, dest="zip_path", help="Verify a built ZIP against these package bytes without extracting")
    parser.add_argument("--check", action="store_true", help="Explicit read-only verification (the default)")
    args = parser.parse_args()
    print(json.dumps(verify(args.root, args.zip_path)))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, json.JSONDecodeError, zipfile.BadZipFile) as error:
        raise SystemExit(str(error))
