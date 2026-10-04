#!/usr/bin/env python3
"""Seal current public files after all approved bytes settle. No publication."""
from pathlib import Path
import hashlib, json, re, shutil

ROOT=Path(__file__).resolve().parents[1]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(path, obj): (ROOT/path).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
hashes={p.relative_to(ROOT/'prototype').as_posix():sha(p)[:12]
        for p in (ROOT/'prototype').rglob('*') if p.is_file() and p.suffix in ['.js','.css']}
(ROOT/'contracts/runtime-asset-hashes.json').write_text(json.dumps(hashes,separators=(',',':'))+'\n')
for name in ['industry-profiles.json','runtime-asset-hashes.json']:
    shutil.copy2(ROOT/'contracts'/name,ROOT/'prototype/contracts'/name)
index=ROOT/'prototype/index.html';html=index.read_text()
html=re.sub(r'(href|src)=([\"\'])([^\"\']+\.(?:css|js))(?:\?v=[^\"\']*)?\2',
            lambda m:m.group(1)+'='+m.group(2)+m.group(3)+'?v='+hashes[m.group(3)]+m.group(2)
            if m.group(3) in hashes else m.group(0),html)
index.write_text(html)
assets=[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}
        for p in sorted((ROOT/'prototype').rglob('*')) if p.is_file()]
write('contracts/assets.v1.7.json',{'schemaVersion':'yolk.assets/1.7','version':'1.7.1','dsVersion':'0.9.7',
      'entrypoint':'prototype/index.html','publicPath':'https://montri-th.github.io/yolk/','assetFiles':assets,
      'source':'Persistent map and brand experience1.7; source values and national cohort unchanged; family seed hypotheses explicitly versioned.'})
selected=set(json.loads((ROOT/'contracts/public-copy-selection.v1.7.1.json').read_text())['selectedFiles'])
selected.update(row['path'] for row in assets)
selected.update(['.github/workflows/pages.yml','.nojekyll','evidence/QA.md','contracts/release.v1.7.1.json',
                 'contracts/public-copy-selection.v1.7.1.json','scripts/verify-pages-v1.7.py','scripts/seal-pages-v1.7.py',
                 'evidence/share-image-v1.7.json','design/share-v1.7.html','design/yolk-share-v1.7-browser.jpg'])
rows=[{'path':name,'bytes':(ROOT/name).stat().st_size,'sha256':sha(ROOT/name)} for name in sorted(selected)]
manifest={'schemaVersion':'yolk.public_artifact/1.7','version':'1.7.1','acceptedLocalSource':'1.7.1-map-responsiveness-poi-research','date':'2026-10-04',
          'publicUrl':'https://montri-th.github.io/yolk/','artifactPath':'prototype','files':rows,
          'hashExclusions':['contracts/pages-public-manifest.v1.7.1.json','handoff-manifest.json','SHA256SUMS.txt'],
          'sourceEvidenceBoundary':'Compact public runtime projections and bounded summaries; full normalized acquisition/archive and detailed browser logs remain in local handoff.'}
write('contracts/pages-public-manifest.v1.7.1.json',manifest);write('handoff-manifest.json',manifest)
(ROOT/'SHA256SUMS.txt').write_text(''.join(r['sha256']+'  '+r['path']+'\n' for r in rows))
print(json.dumps({'sealedFiles':len(rows),'bytes':sum(r['bytes'] for r in rows)}))
