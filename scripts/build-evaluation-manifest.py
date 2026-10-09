#!/usr/bin/env python3
"""Bind replayable decision dependencies; generated before final release sealing, never changes source data."""
import argparse, hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--release',required=True);args=p.parse_args()
def record(file,**kw):
    data=(ROOT/'prototype'/file).read_bytes()
    return dict(file=file,sha256=hashlib.sha256(data).hexdigest(),bytes=len(data),**kw)
sources={'area-context':'data/real/area-context.json','fuel-supply':'data/real/fuel-supply.json','grocery-supply':'data/real/grocery-supply.json','nonbank-supply':'data/real/nonbank-supply.json','industry-profiles':'contracts/industry-profiles.json','brand-presets':'data/brand-presets.v1.7.json','brand-strategy-profiles':'data/brand-strategy-profiles.v1.9.0.json','nonbank-company-scopes':'data/real/nonbank-company-scopes.json','nonbank-assignment-bounds':'data/real/nonbank-assignment-bounds.json'}
engines=['bootstrap.js','metrics.js','model.js','relative-supply.js','brand-experience.js','demand-factors.js','industry-workspace.js','opportunity-engine.js','decision-snapshot.js','strategy-ui.js','decision-ui.js','app.js']
out={'schemaVersion':'yolk.evaluation-manifest/1.0','app':{'release':args.release,'binding':'Exact semantic runtime files; source commit is attested separately after commit to avoid self-reference.','runtimeFiles':[record(f) for f in engines]},'dependencies':[record(f,id=i) for i,f in sources.items()]}
(ROOT/'prototype/data/evaluation-manifest.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'release':args.release,'dependencies':len(sources),'runtimeFiles':len(engines),'output':'prototype/data/evaluation-manifest.json'}))
