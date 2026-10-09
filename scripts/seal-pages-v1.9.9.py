#!/usr/bin/env python3
"""Seal approved Yolk1.9.9 bytes only after final QA; never publish.

No historical manifest/receipt is rewritten. The explicit allowlist is authoritative.
--dry-run inspects missing/unapproved paths without modifying files.
"""
from pathlib import Path
import argparse, hashlib, json, re, shutil, sys

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.9.9'
SELECTION = ROOT / 'contracts/public-copy-selection.v1.9.9.json'
MANIFEST = 'contracts/pages-public-manifest.v1.9.9.json'
GENERATED = {'contracts/assets.v1.9.9.json'}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (ROOT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def safe_path(name):
    if not isinstance(name,str) or not name or '\\' in name:
        return False
    path=Path(name)
    if not path.parts or path.as_posix()!=name or path.is_absolute() or '..' in path.parts or path.parts[0] in {'outputs','sources','deliverables','.git'}:
        return False
    try:
        (ROOT/path).resolve().relative_to(ROOT.resolve())
    except ValueError:
        return False
    return not any((ROOT/Path(*path.parts[:i])).is_symlink() for i in range(1,len(path.parts)+1))

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
    if selected & excluded or any(re.fullmatch(r'contracts/pages-public-manifest\.v[^/]+\.json',p) for p in selected):
        raise ValueError('Self-referential manifest/checksum must not be a selected hash row')
    if set(selection.get('generatedAtSeal',[]))!=GENERATED or set(selection.get('hashExclusions',[]))!=excluded:
        raise ValueError('Generated/excluded release paths do not match this sealer')
    problems=[]
    for name in sorted(selected):
        if not safe_path(name):
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
        qa = json.loads((ROOT/'evidence/qa-v1.9.9.json').read_text())
        automated = json.loads((ROOT/'evidence/automated-v1.9.9.json').read_text())
        native = json.loads((ROOT/'evidence/browser-v1.9.9/native-browser-review.json').read_text())
        docs = json.loads((ROOT/'contracts/doc-validation.v1.9.9.json').read_text())
        guards = json.loads((ROOT/'evidence/release-checks-v1.9.9.json').read_text())
        if qa.get('version') != VERSION or qa.get('status') != 'PASS_BOUNDED_CURRENT_LOCAL_QA':
            raise ValueError('Current final integrated QA receipt is missing or pending')
        if automated.get('version') != VERSION or automated.get('status') != 'PASS' or not automated.get('results'):
            raise ValueError('Current automated evidence is missing or not passed')
        if native.get('version') != VERSION or native.get('status') != 'PASS_BOUNDED_NATIVE_BROWSER_REVIEW':
            raise ValueError('Current bounded native-browser evidence is missing or pending')
        if docs.get('version') != VERSION or docs.get('result') != 'bounded_document_consistency_pass':
            raise ValueError('Current document consistency receipt is missing or pending')
        if guards.get('version')!=VERSION or guards.get('status')!='PASS_BOUNDED_RELEASE_SCRIPT_GUARDS' or not guards.get('results') or any(r.get('status')!='PASS' for r in guards['results']) or guards.get('checks')!=len(guards['results']):
            raise ValueError('Current bounded release-script guard receipt is missing or pending')
        if guards.get('selection',{}).get('sha256')!=sha(SELECTION):
            raise ValueError('Explicit public selection changed after release-script guard checks')
        guard_bindings={r.get('path'):r for r in guards.get('reviewedFiles',[])}
        for name in ('scripts/seal-pages-v1.9.9.py','scripts/verify-pages-v1.9.9.py','.github/workflows/pages.yml'):
            row=guard_bindings.get(name,{})
            if row.get('sha256')!=sha(ROOT/name) or row.get('bytes')!=(ROOT/name).stat().st_size:
                raise ValueError('Release utility bytes changed after guard checks: '+name)
        if len({r.get('suite') for r in automated['results']})!=len(automated['results']):
            raise ValueError('Duplicate current regression suite')
        for row in automated['results']:
            if not safe_path(row.get('suite','')) or not row.get('suite','').startswith('scripts/'):
                raise ValueError('Unsafe current regression path')
            path = ROOT / row.get('suite','')
            if not path.is_file() or row.get('passed') is not True or row.get('exitCode') != 0 or sha(path) != row.get('testSourceSha256'):
                raise ValueError('Current suite bytes/result differ from final receipt: '+row.get('suite','missing'))
            if not isinstance(row.get('checks'),int) or isinstance(row.get('checks'),bool) or row['checks']<=0:
                raise ValueError('Current suite lacks a positive reported test-case count: '+row['suite'])
        runtime_inputs=[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}for p in sorted((ROOT/'prototype').rglob('*'))if p.is_file()and p.suffix in {'.js','.css'}]
        if automated.get('runtimeInputs')!=runtime_inputs:
            raise ValueError('Current runtime bytes differ from fresh integrated suite execution')
        screenshots=qa.get('nativeBrowser',{}).get('snapshotFiles',[])
        if not screenshots or {r.get('path') for r in screenshots}!={r.get('path') for r in native.get('screenshots',[])}:
            raise ValueError('Current actual browser snapshots are missing or differ between receipts')
        if len({r.get('path') for r in screenshots})!=len(screenshots) or len({r.get('path') for r in native.get('screenshots',[])})!=len(native.get('screenshots',[])):
            raise ValueError('Duplicate current browser snapshot path')
        for row in screenshots:
            if not safe_path(row.get('path','')) or not row.get('path','').startswith('evidence/browser-v1.9.9/') or row.get('path') not in selected:
                raise ValueError('Current browser snapshot is not explicitly approved')
            path = ROOT / row.get('path','')
            if not path.is_file() or path.stat().st_size != row.get('bytes') or sha(path) != row.get('sha256'):
                raise ValueError('Actual browser snapshot differs from final QA receipt: '+row.get('path','missing'))
            native_row=next(r for r in native['screenshots'] if r.get('path')==row['path'])
            if native_row.get('bytes')!=row['bytes'] or native_row.get('sha256')!=row['sha256']:
                raise ValueError('Native and integrated snapshot bytes differ: '+row['path'])
        if not native.get('results') or any(r.get('status')!='PASS' for r in native['results']) or native.get('checks')!=len(native['results']):
            raise ValueError('Current bounded native results are missing or not passed')
        reviewed_runtime=native.get('reviewedRuntime',[])
        if not reviewed_runtime:
            raise ValueError('Current native review has no source-runtime SHA bindings')
        for row in reviewed_runtime:
            name=row.get('path','')
            if not safe_path(name) or not name.startswith('prototype/') or name not in selected or not(ROOT/name).is_file() or sha(ROOT/name)!=row.get('sha256'):
                raise ValueError('Current reviewed native runtime changed or is not approved: '+name)
        if automated.get('suites')!=len(automated['results']) or automated.get('checksPassed')!=sum(r.get('checks',0) for r in automated['results']):
            raise ValueError('Current automated receipt counts do not reconcile')
        if docs.get('document',{}).get('sha256') != sha(ROOT/'CityMETER_Yolk_Full_Product_and_Implementation_v1.9.9.md') or docs.get('machineContract',{}).get('sha256') != sha(ROOT/'contracts/full-product.v1.9.9.json'):
            raise ValueError('Current document bytes differ from consistency receipt')
        if docs.get('narrativeRegistry',{}).get('sha256')!=sha(ROOT/'prototype/data/strategy-guide.v1.9.3.json'):
            raise ValueError('Current guide registry bytes differ from consistency receipt')
        if docs.get('mapReadabilityContract',{}).get('sha256')!=sha(ROOT/'contracts/map-readability.v1.9.6.json'):
            raise ValueError('Current map-readability contract bytes differ from consistency receipt')
        if docs.get('supplyInventoryContract',{}).get('sha256')!=sha(ROOT/'contracts/supply-inventory.v1.9.9.json'):
            raise ValueError('Current Supply inventory contract bytes differ from consistency receipt')
        space=json.loads((ROOT/'contracts/map-readability.v1.9.6.json').read_text())
        supply=json.loads((ROOT/'contracts/supply-inventory.v1.9.9.json').read_text())
        full=json.loads((ROOT/'contracts/full-product.v1.9.9.json').read_text())
        if space.get('status')!='final_runtime_values_current_QA_bound' or full.get('experience',{}).get('mapReadability')!=space:
            raise ValueError('Current layout contract lacks final runtime/current QA binding or differs from full blueprint')
        if supply.get('status')!='final_runtime_values_current_QA_bound' or full.get('experience',{}).get('supplyInventoryDisplay')!=supply:
            raise ValueError('Current Supply inventory display lacks final runtime/current QA binding or differs from full blueprint')
        suite_names={r['suite'] for r in automated['results']}
        declared=re.findall(r'^\s+node (scripts/[a-z0-9-]+\.cjs)\s*$',(ROOT/'.github/workflows/pages.yml').read_text(),re.M)
        if set(declared)!=suite_names or len(declared)!=automated['suites'] or not set(supply['verification']['requiredSuites'])<=suite_names:
            raise ValueError('Current complete workflow and new Supply suite evidence differ')
        supply_review=native.get('supplyInventoryReview',{})
        if supply_review.get('passed')is not True or not supply_review.get('checkIds') or not set(supply_review['checkIds'])<={r['id']for r in native['results']}:
            raise ValueError('Current Supply-specific native observations are missing or pending')
        if not set(supply['treemap']['runtimeFiles'])<={r['path']for r in reviewed_runtime}:
            raise ValueError('Current new treemap runtime was not bound by native review')
        if supply['verification']['integrated'].get('receiptSha256')!=sha(ROOT/'evidence/automated-v1.9.9.json') or supply['verification']['native'].get('receiptSha256')!=sha(ROOT/'evidence/browser-v1.9.9/native-browser-review.json'):
            raise ValueError('Current Supply QA receipt bytes changed after final binding')
    # Current1.9.9 visual/navigation evidence is separate from retained1.9.6 identity.
    if not args.dry_run:
        refinement=json.loads((ROOT/'contracts/visual-refinement.v1.9.9.json').read_text())
        if docs.get('visualRefinementContract',{}).get('sha256')!=sha(ROOT/'contracts/visual-refinement.v1.9.9.json'):
            raise ValueError('Current visual-refinement contract changed after document checks')
        if refinement.get('version')!=VERSION or refinement.get('status')!='final_runtime_values_current_QA_bound' or full.get('experience',{}).get('visualRefinement')!=refinement:
            raise ValueError('Current visual-refinement runtime/QA projection missing or pending')
        for key in ('treemapBrandColors','mapCameraEnvelope','expandedBasemapResize','compactMapControls','numberDisplay'):
            if refinement.get(key,{}).get('status')!='runtime_confirmed':
                raise ValueError('Current runtime values are pending: '+key)
        if not set(refinement.get('requiredSuites',[]))<=suite_names or not set(refinement.get('runtimeFiles',[]))<={r['path']for r in reviewed_runtime}:
            raise ValueError('Current refinement suites/runtime native SHA bindings missing')
        current_review=native.get('visualRefinementReview',{})
        if current_review.get('passed')is not True or not current_review.get('checkIds') or not set(current_review['checkIds'])<={r['id']for r in native['results']}:
            raise ValueError('Current actual visual-refinement native observations missing')
        camera_source=refinement.get('mapCameraEnvelope',{}).get('runtimeSource',{})
        if camera_source.get('path')!='prototype/workspace-map.js' or camera_source.get('sha256')!=sha(ROOT/'prototype/workspace-map.js'):
            raise ValueError('Current dynamic camera runtime changed after contract binding')
        colors=refinement['treemapBrandColors'];registry=colors.get('mappingRegistry','')
        if not safe_path(registry) or registry not in selected or not registry.startswith('prototype/') or not(ROOT/registry).is_file() or colors.get('mappingRegistrySha256')!=sha(ROOT/registry):
            raise ValueError('Current approved brand-color registry bytes missing/drifted')
        bindings={r.get('path'):r for r in native.get('reviewedRegistries',[])}
        if bindings.get(registry,{}).get('sha256')!=sha(ROOT/registry) or docs.get('brandColorRegistry',{}).get('sha256')!=sha(ROOT/registry):
            raise ValueError('Current brand-color registry lacks exact actual native/document SHA binding')
        for key in ('integrated','native'):
            row=refinement.get('verification',{}).get(key,{})
            if not isinstance(row,dict) or not safe_path(row.get('receipt','')) or row.get('receiptSha256')!=sha(ROOT/row['receipt']):
                raise ValueError('Current refinement QA receipt drifted: '+key)
    if not args.dry_run:
        branch=json.loads((ROOT/'contracts/branch-points.v1.9.9.json').read_text())
        if branch.get('version')!=VERSION or branch.get('status')!='final_runtime_values_current_QA_bound' or full.get('experience',{}).get('branchPoints')!=branch:
            raise ValueError('Current all-point contract missing or pending')
        if docs.get('branchPointsContract',{}).get('sha256')!=sha(ROOT/'contracts/branch-points.v1.9.9.json'):
            raise ValueError('Current branch contract drifted after document checks')
        if not set(branch['requiredSuites'])<=suite_names or not set(branch['runtimeFiles'])<={r['path']for r in reviewed_runtime}:
            raise ValueError('Current all-point suites or native runtime bindings missing')
        if not branch.get('runtimeSources') or not all(safe_path(r.get('path','')) and r['path']in selected and r.get('sha256')==sha(ROOT/r['path'])for r in branch['runtimeSources']):
            raise ValueError('Current all-point runtime source drift')
        for key in ('branchPointsReview','wholeSiteReview','performanceReview'):
            row=native.get(key,{})
            if row.get('passed')is not True or not row.get('checkIds') or not set(row['checkIds'])<={r['id']for r in native['results']}:
                raise ValueError('Actual current native review missing: '+key)
        if not native.get('performanceBenchmarks') or branch.get('performance',{}).get('benchmarks')!=native['performanceBenchmarks']:
            raise ValueError('Current measured performance projection missing/drifted')
    hashes={p.relative_to(ROOT/'prototype').as_posix():sha(p)[:12]for p in(ROOT/'prototype').rglob('*')if p.is_file()and p.suffix in{'.js','.css'}}
    (ROOT/'contracts/runtime-asset-hashes.json').write_text(json.dumps(hashes,separators=(',',':'))+'\n')
    for name in ('industry-profiles.json','runtime-asset-hashes.json'):
        shutil.copy2(ROOT/'contracts'/name,ROOT/'prototype/contracts'/name)
    index=ROOT/'prototype/index.html';html=index.read_text()
    html=re.sub(r'(href|src)=([\"\'])([^\"\']+\.(?:css|js))(?:\?v=[^\"\']*)?\2',lambda m:m.group(1)+'='+m.group(2)+m.group(3)+'?v='+hashes[m.group(3)]+m.group(2)if m.group(3)in hashes else m.group(0),html)
    index.write_text(html)
    assets=[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}for p in sorted((ROOT/'prototype').rglob('*'))if p.is_file()]
    write('contracts/assets.v1.9.9.json',{'schemaVersion':'yolk.assets/1.9','version':VERSION,'dsVersion':'0.9.7','entrypoint':'prototype/index.html','publicPath':'https://montri-th.github.io/yolk/','assetFiles':assets,'source':'Version1.9.9 renders every filtered valid branch point by default with optional screen grouping and efficient Canvas; current whole-site usability/performance evidence is bounded to recorded environments; retained v1.9.7 colors, camera, resizing, controls and comma formatting remain; boundary/egg identity1.9.6 and direct-source count/share semantics are retained. Retained share display uses exact li.market_share41 fixed0..100; retained count palettes/quantiles/Tier colors stay unchanged. Mobile flow1.9.5/desktop map-space1.9.4, expansion guide1.9.3, criteria/profile/engine/strategy1.9.0, interaction1.9.1 and identity1.9.2 are retained. Same cohort/source counts/criteria/DS assets; no identity crop/redraw/frame or analytical opacity/color transformation.','shareImage':'Approved 1.7-family image unchanged.'})
    rows=[{'path':name,'bytes':(ROOT/name).stat().st_size,'sha256':sha(ROOT/name)}for name in sorted(selected)]
    manifest={'schemaVersion':'yolk.public_artifact/1.9','version':VERSION,'acceptedLocalSource':'1.9.9-all-branch-points','date':'2026-10-09','publicUrl':'https://montri-th.github.io/yolk/','artifactPath':'prototype','files':rows,'hashExclusions':sorted(excluded),'sourceEvidenceBoundary':'Only explicit public compact projections/assets/summary evidence. Private raw acquisition, logs and full provenance remain outside public artifact.'}
    write(MANIFEST,manifest);write('handoff-manifest.json',manifest)
    (ROOT/'SHA256SUMS.txt').write_text(''.join(r['sha256']+'  '+r['path']+'\n'for r in rows))
    print(json.dumps({'version':VERSION,'status':'SEALED_LOCALLY','sealedFiles':len(rows),'bytes':sum(r['bytes']for r in rows),'publication':'not_performed'}));return 0

if __name__=='__main__':
    try:raise SystemExit(main())
    except (OSError,ValueError,KeyError,TypeError)as error:
        print(json.dumps({'version':VERSION,'status':'FAIL','error':str(error),'publication':'not_performed'}),file=sys.stderr);raise SystemExit(1)
