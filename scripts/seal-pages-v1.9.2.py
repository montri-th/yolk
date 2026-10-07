#!/usr/bin/env python3
"""Seal approved Yolk1.9.2 bytes only after final QA; never publish.

No historical manifest/receipt is rewritten. The explicit allowlist is authoritative.
--dry-run inspects missing/unapproved paths without modifying files.
"""
from pathlib import Path
import argparse, hashlib, json, re, shutil, sys

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.9.2'
SELECTION = ROOT / 'contracts/public-copy-selection.v1.9.2.json'
MANIFEST = 'contracts/pages-public-manifest.v1.9.2.json'
GENERATED = {'contracts/assets.v1.9.2.json'}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (ROOT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--after-final-qa',action='store_true',help='Release owner has completed final QA and frozen source bytes.')
    parser.add_argument('--dry-run',action='store_true',help='Read-only allowlist preflight; no hash/index/manifest changes.')
    args=parser.parse_args()
    if not args.dry_run and not args.after_final_qa:
        parser.error('Seal requires --after-final-qa; use --dry-run while final QA is pending.')
    selection=json.loads(SELECTION.read_text())
    selected=set(selection['selectedFiles'])
    if len(selected) != len(selection['selectedFiles']):
        raise ValueError('Duplicate explicit selected file')
    if selection.get('version')!=VERSION:
        raise ValueError('Selection version mismatch')
    excluded={MANIFEST,'handoff-manifest.json','SHA256SUMS.txt'}
    if selected & excluded:
        raise ValueError('Self-referential manifest/checksum must not be a selected hash row')
    problems=[]
    for name in sorted(selected):
        path=Path(name)
        if path.is_absolute() or '..' in path.parts or path.parts[0] in {'outputs','sources','deliverables','.git'}:
            problems.append('Unsafe/private path: '+name)
        elif name not in GENERATED and not (ROOT/name).is_file():
            problems.append('Missing approved path: '+name)
        elif (ROOT/name).is_symlink():
            problems.append('Symlink not approved: '+name)
    runtime={p.relative_to(ROOT).as_posix()for p in(ROOT/'prototype').rglob('*')if p.is_file()}
    for name in sorted(runtime-selected):problems.append('Unapproved runtime path: '+name)
    for name in ('data/demo-data.js','data/demo-data.json','data/demo-map-context.js'):
        if (ROOT/'prototype'/name).exists():problems.append('Unused synthetic runtime feed: '+name)
    result={'version':VERSION,'status':'FAIL'if problems else'PREFLIGHT_PASS','selectedFiles':len(selected),'runtimeFiles':len(runtime),'problems':problems,'publication':'not_performed'}
    if args.dry_run or problems:
        print(json.dumps(result,ensure_ascii=False,indent=2));return 1 if problems else 0
    # The release flag cannot promote pending or historical evidence to a final pass.
    if not args.dry_run:
        qa = json.loads((ROOT/'evidence/qa-v1.9.2.json').read_text())
        automated = json.loads((ROOT/'evidence/automated-v1.9.2.json').read_text())
        native = json.loads((ROOT/'evidence/browser-v1.9.2/native-browser-review.json').read_text())
        docs = json.loads((ROOT/'contracts/doc-validation.v1.9.2.json').read_text())
        if qa.get('version') != VERSION or qa.get('status') != 'PASS_BOUNDED_CURRENT_LOCAL_QA':
            raise ValueError('Current final integrated QA receipt is missing or pending')
        if automated.get('version') != VERSION or automated.get('status') != 'PASS' or not automated.get('results'):
            raise ValueError('Current automated evidence is missing or not passed')
        if native.get('version') != VERSION or native.get('status') != 'PASS_BOUNDED_NATIVE_BROWSER_REVIEW':
            raise ValueError('Current bounded native-browser evidence is missing or pending')
        if docs.get('version') != VERSION or docs.get('result') != 'bounded_document_consistency_pass':
            raise ValueError('Current document consistency receipt is missing or pending')
        for row in automated['results']:
            path = ROOT / row.get('suite','')
            if not path.is_file() or row.get('passed') is not True or row.get('exitCode') != 0 or sha(path) != row.get('testSourceSha256'):
                raise ValueError('Current suite bytes/result differ from final receipt: '+row.get('suite','missing'))
        for row in qa.get('nativeBrowser',{}).get('snapshotFiles',[]):
            path = ROOT / row.get('path','')
            if not path.is_file() or path.stat().st_size != row.get('bytes') or sha(path) != row.get('sha256'):
                raise ValueError('Actual browser snapshot differs from final QA receipt: '+row.get('path','missing'))
        if docs.get('document',{}).get('sha256') != sha(ROOT/'CityMETER_Yolk_Full_Product_and_Implementation_v1.9.2.md') or docs.get('machineContract',{}).get('sha256') != sha(ROOT/'contracts/full-product.v1.9.2.json'):
            raise ValueError('Current document bytes differ from consistency receipt')
    hashes={p.relative_to(ROOT/'prototype').as_posix():sha(p)[:12]for p in(ROOT/'prototype').rglob('*')if p.is_file()and p.suffix in{'.js','.css'}}
    (ROOT/'contracts/runtime-asset-hashes.json').write_text(json.dumps(hashes,separators=(',',':'))+'\n')
    for name in ('industry-profiles.json','runtime-asset-hashes.json'):
        shutil.copy2(ROOT/'contracts'/name,ROOT/'prototype/contracts'/name)
    index=ROOT/'prototype/index.html';html=index.read_text()
    html=re.sub(r'(href|src)=([\"\'])([^\"\']+\.(?:css|js))(?:\?v=[^\"\']*)?\2',lambda m:m.group(1)+'='+m.group(2)+m.group(3)+'?v='+hashes[m.group(3)]+m.group(2)if m.group(3)in hashes else m.group(0),html)
    index.write_text(html)
    assets=[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}for p in sorted((ROOT/'prototype').rglob('*'))if p.is_file()]
    write('contracts/assets.v1.9.2.json',{'schemaVersion':'yolk.assets/1.9','version':VERSION,'dsVersion':'0.9.7','entrypoint':'prototype/index.html','publicPath':'https://montri-th.github.io/yolk/','assetFiles':assets,'source':'Version1.9.2 binds three owner-supplied brand graphics to existing identities and repairs Supply-chip semantic icon/caption fonts and responsive layout. Criteria/profile/engine/strategy remain1.9.0 and interaction1.9.1 remains retained. Same cohort/source counts/thresholds/DS assets; no identity crop/redraw/frame and no evidence animation.','shareImage':'Approved 1.7-family image unchanged.'})
    rows=[{'path':name,'bytes':(ROOT/name).stat().st_size,'sha256':sha(ROOT/name)}for name in sorted(selected)]
    manifest={'schemaVersion':'yolk.public_artifact/1.9','version':VERSION,'acceptedLocalSource':'1.9.2-brand-artwork-supply-chips','date':'2026-10-07','publicUrl':'https://montri-th.github.io/yolk/','artifactPath':'prototype','files':rows,'hashExclusions':sorted(excluded),'sourceEvidenceBoundary':'Only explicit public compact projections/assets/summary evidence. Private raw acquisition, logs and full provenance remain outside public artifact.'}
    write(MANIFEST,manifest);write('handoff-manifest.json',manifest)
    (ROOT/'SHA256SUMS.txt').write_text(''.join(r['sha256']+'  '+r['path']+'\n'for r in rows))
    print(json.dumps({'version':VERSION,'status':'SEALED_LOCALLY','sealedFiles':len(rows),'bytes':sum(r['bytes']for r in rows),'publication':'not_performed'}));return 0

if __name__=='__main__':
    try:raise SystemExit(main())
    except (OSError,ValueError,KeyError,TypeError)as error:
        print(json.dumps({'version':VERSION,'status':'FAIL','error':str(error),'publication':'not_performed'}),file=sys.stderr);raise SystemExit(1)
