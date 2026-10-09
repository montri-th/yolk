#!/usr/bin/env python3
"""Validate current regression evidence locally or in an extracted handoff archive."""
from pathlib import Path
import argparse,hashlib,json,re,zipfile,tempfile

def validate(root,version):
    receipt=json.loads((root/f'evidence/automated-v{version}.json').read_text())
    assert receipt['version']==version and receipt['status']=='PASS'
    rows=receipt['results']; assert rows and len({r['suite'] for r in rows})==len(rows)
    for row in rows:
        name=row['outputEvidence'];p=(root/name).resolve()
        assert not Path(name).is_absolute() and p.is_relative_to(root.resolve()),name
        data=p.read_bytes()
        assert hashlib.sha256(data).hexdigest()==row['outputSha256'],name
        assert row['passed'] is True and row['exitCode']==0 and row['checks']>0,row['suite']
        source=root/row['suite'];assert hashlib.sha256(source.read_bytes()).hexdigest()==row['testSourceSha256']
    assert receipt['suites']==len(rows) and receipt['checksPassed']==sum(r['checks'] for r in rows)
    return {'status':'PASS','version':version,'suites':len(rows),'checks':len(rows)*3+2,'meaning':'Every current raw log and test source resolves inside the standalone artifact with matching SHA; historical receipts remain historical.'}

def main():
    p=argparse.ArgumentParser();p.add_argument('--zip',type=Path);p.add_argument('--version',default='1.9.10');a=p.parse_args()
    if a.zip:
        with tempfile.TemporaryDirectory() as td,zipfile.ZipFile(a.zip) as z:
            for n in z.namelist():
                parts=Path(n).parts;assert not Path(n).is_absolute() and '..'not in parts,n
            z.extractall(td);result=validate(Path(td),a.version)
    else:result=validate(Path(__file__).resolve().parents[1],a.version)
    print(json.dumps(result))
if __name__=='__main__':main()
