#!/usr/bin/env python3
"""Build a deterministic public handoff inventory and optional ZIP (standard library only).

The manifest does not hash itself or SHA256SUMS.txt. SHA256SUMS.txt hashes the
manifest and every distributable artifact. ZIP content includes both files.
This utility does not attest browser QA, publication, or production readiness.
"""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path, PurePosixPath

VERSION = "1.3.1"
ZIP_ROOT = "CityMETER-Yolk-v1.3.1"
SELF_FILES = {"handoff-manifest.json", "SHA256SUMS.txt"}
SKIP_DIRS = {".git", ".cache", "__pycache__", "node_modules", ".venv", "venv", ".pytest_cache", ".mypy_cache", "coverage"}
SKIP_NAMES = {".DS_Store", "Thumbs.db"}
SKIP_SUFFIXES = {".zip", ".pyc", ".pyo", ".log", ".tmp", ".swp"}
PRIVATE_DIRS = {"private", "secrets", "sources", "realdata", "real-data", "uploads", "master-assets"}
ARTWORK_SUFFIXES = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm"}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def safe_relative(name):
    p = PurePosixPath(name)
    return bool(name) and not p.is_absolute() and ".." not in p.parts and "\\" not in name and not re.search(r"[\x00-\x1f:]", name)


def forbidden_payload(relative):
    p = PurePosixPath(relative)
    low = p.name.lower()
    if any(part.lower() in PRIVATE_DIRS for part in p.parts):
        return "private/source directory"
    if low == ".env" or low.startswith(".env.") or low.endswith((".pem", ".key", ".p12")):
        return "secret/config payload"
    if re.search(r"(?:bangchak-data|real[-_]?data)", low):
        return "real-data payload"
    if low == "landometer-logo-transparentbg.png":
        return "master logo asset"
    if p.suffix.lower() in ARTWORK_SUFFIXES and ("motif" in low or re.match(r"(?:dial|rings)-", low)):
        return "motif artwork"
    return None


def distributable_files(root):
    root = Path(root)
    files = []
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root).as_posix()
        parts = PurePosixPath(relative).parts
        if any(part in SKIP_DIRS for part in parts) or path.name in SKIP_NAMES or path.suffix.lower() in SKIP_SUFFIXES:
            continue
        if relative in SELF_FILES:
            continue
        if path.is_symlink():
            raise ValueError("Symlinks are not distributable: " + relative)
        if not path.is_file():
            continue
        if not safe_relative(relative):
            raise ValueError("Unsafe package path: " + relative)
        reason = forbidden_payload(relative)
        if reason:
            raise ValueError("Blocked " + reason + ": " + relative)
        files.append(relative)
    return files


def role_for(name):
    if name.startswith("contracts/"):
        return "developer-contract"
    if name.startswith("evidence/"):
        return "verification-evidence"
    if name.startswith(("scripts/", ".github/")):
        return "release-check"
    if name.startswith("prototype/assets/"):
        return "runtime-asset"
    if name.startswith("prototype/"):
        return "web-preview"
    return "handoff-document"


def mime_for(name):
    # Set common types explicitly, keeping the manifest stable across operating systems.
    return {".md":"text/markdown", ".json":"application/json", ".js":"text/javascript", ".cjs":"text/javascript", ".css":"text/css", ".html":"text/html", ".yaml":"application/yaml", ".yml":"application/yaml", ".woff2":"font/woff2", ".txt":"text/plain", ".py":"text/x-python", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml"}.get(Path(name).suffix.lower(), "application/octet-stream")


def build_manifest(root, files):
    artifacts = []
    for name in files:
        data = (root / name).read_bytes()
        artifacts.append({"path":name, "role":role_for(name), "sha256":sha(data), "bytes":len(data), "mime":mime_for(name)})
    return {
        "schemaVersion":1,
        "version":VERSION,
        "workObject":"CityMETER: Yolk v1.3.1 public synthetic web preview and developer handoff",
        "source":{"kind":"directory", "identity":"Yolk public synthetic edition; private operational data is not distributed"},
        "artifacts":artifacts,
        "routes":["/", "/#market", "/#targets", "/#criteria", "/#supply", "/#feed", "/#inbox", "/#team", "/#place/demo-area-001", "/#poi/new"],
        "locales":["th", "en"],
        "runtime":{"mode":"http-static", "provider":"GitHub Pages", "status":"prepared", "url":"https://montri-th.github.io/yolk/"},
        "dependencies":["prototype/assets/", "prototype/data/", "prototype/vendor/leaflet-1.9.4/", "Landometer DS 0.9.4-r2 / v0.9.4-mp1"],
        "claims":[
            {"claim":"Artifact hashes and byte sizes are computed from the files in this package", "status":"verified", "evidence":"scripts/verify-handoff.py"},
            {"claim":"Public preview has synthetic area/POI fixtures and is not an operational market assessment", "status":"supplied", "evidence":"CityMETER_Yolk_Product_Statement_v1.3.md"},
            {"claim":"Production authentication, data services and shared collaboration are implementation work", "status":"proposed", "evidence":"IMPLEMENTATION_PLAN_v1.3.md"},
            {"claim":"Rendered responsive TH/EN UI is visually verified", "status":"unresolved", "evidence":"HANDOFF.md"}
        ],
        "gates":[
            {"gate":"Package inventory and SHA-256 consistency", "status":"passed", "owner":"release operator", "evidence":"scripts/verify-handoff.py"},
            {"gate":"Browser responsive, bilingual, theme and interaction review", "status":"open", "owner":"Yolk frontend and QA", "evidence":"HANDOFF.md"},
            {"gate":"Public release commit and external web verification", "status":"open", "owner":"release operator", "evidence":"contracts/release.v1.3.1.json"},
            {"gate":"Approved production data, permissions and identity role review", "status":"open", "owner":"data and product owners", "evidence":"IMPLEMENTATION_PLAN_v1.3.md"}
        ],
        "distribution":{"zipRoot":ZIP_ROOT, "dataPolicy":"public_synthetic_only", "motifsEnabled":False, "manifestSelfHashExcluded":True, "checksumIndex":"SHA256SUMS.txt", "checksumIndexIncludesManifest":True},
        "delivery":{"status":"prepared", "recipient":"Yolk development team", "channel":"public GitHub repository montri-th/yolk", "evidence":"HANDOFF.md", "acknowledgmentEvidence":None}
    }


def write_inventory(root):
    files = distributable_files(root)
    if not files:
        raise ValueError("Cannot build an empty handoff")
    manifest = build_manifest(root, files)
    (root / "handoff-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    names = sorted(files + ["handoff-manifest.json"])
    checksums = "".join(sha((root / name).read_bytes()) + "  " + name + "\n" for name in names)
    (root / "SHA256SUMS.txt").write_text(checksums, encoding="utf-8")
    return manifest, names + ["SHA256SUMS.txt"]


def write_zip(root, output, names):
    output = Path(output)
    if output.suffix.lower() != ".zip":
        output = output / (ZIP_ROOT + "-handoff.zip")
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name in sorted(names):
            info = zipfile.ZipInfo(ZIP_ROOT + "/" + name, date_time=(2026, 9, 24, 0, 0, 0))
            info.create_system = 3
            info.external_attr = (0o100644 << 16)
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, (root / name).read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, help="Optional ZIP file or directory; archive has one deterministic root directory")
    parser.add_argument("--dry-run", action="store_true", help="Inspect distributable inventory without changing files")
    args = parser.parse_args()
    root = args.root.resolve()
    if args.dry_run:
        files = distributable_files(root)
        print(json.dumps({"status":"inventory_ready", "artifacts":len(files), "version":VERSION, "writes":False}))
        return
    manifest, names = write_inventory(root)
    result = {"status":"prepared", "version":VERSION, "artifacts":len(manifest["artifacts"]), "manualVisualGate":"open"}
    if args.output:
        output = write_zip(root, args.output, names)
        digest = sha(output.read_bytes())
        Path(str(output) + ".sha256").write_text(digest + "  " + output.name + "\n", encoding="utf-8")
        result["zip"] = {"name":output.name, "sha256":digest, "bytes":output.stat().st_size, "root":ZIP_ROOT}
    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, zipfile.BadZipFile) as error:
        raise SystemExit(str(error))
