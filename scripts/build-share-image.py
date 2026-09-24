#!/usr/bin/env python3
"""Deterministic social-card composition from the shipped LDS assets.
Run with Python + Pillow 12.3.0/FreeType supporting WOFF2. No browser capture,
AI-generated mark, font substitution, source artwork edit or private dataset.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
import hashlib, json, re
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'prototype/assets'
OUT=ASSETS/'identity'
OUT.mkdir(exist_ok=True)
css=(ASSETS/'color-srgb-07.production.css').read_text()
def token(name):
    m=re.search(r'--ldm-'+re.escape(name)+r':\s*(#[0-9A-Fa-f]{6});',css)
    assert m, name
    return m.group(1)
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def font(name,size):return ImageFont.truetype(str(ASSETS/name),size)
inputs={
 'landometer-logo-horizontal-v12-889.png':'989f58583bc54e4b9a743d0f04308df92fb7cf0bb2ae3ba9398ec9c03c481554',
 'arvo-latin-700-normal.woff2':'3d908a2c04ec4c59d26d1454008b2d6744480654663a5f88e439f6483976bd37',
 'bai-jamjuree-latin-400-normal.woff2':None,
 'bai-jamjuree-latin-600-normal.woff2':None,
 'color-srgb-07.production.css':None,
}
for name,digest in inputs.items():
    actual=sha(ASSETS/name)
    if digest:assert actual==digest,f'Source hash mismatch: {name}'
    inputs[name]=actual
img=Image.new('RGB',(1200,630),token('brand-beige'))
draw=ImageDraw.Draw(img)
# Two full compositional surfaces; the logo itself has no carrier or frame.
draw.rectangle((0,0,284,629),fill=token('brand-blue'))
logo=Image.open(ASSETS/'landometer-logo-horizontal-v12-889.png').convert('RGBA')
logo=logo.resize((220,60),Image.Resampling.LANCZOS)
img.paste(logo,(325,51),logo)
placements=[]
def line(text,x,y,f,color,limit=None):
    bounds=draw.textbbox((x,y),text,font=f,anchor='lt')
    assert bounds[2]<=1100 and bounds[3]<=595,(text,bounds)
    if limit:assert bounds[2]<=limit,(text,'outside central share crop',bounds)
    draw.text((x,y),text,font=f,fill=color,anchor='lt')
    placements.append({'text':text,'bounds':list(bounds)})
blue=token('brand-blue'); ink=token('foundation-text-primary-light'); muted=token('foundation-text-secondary-light'); light=token('brand-beige')
line('CityMETER:',325,141,font('bai-jamjuree-latin-600-normal.woff2',29),blue,915)
line('Yolk',322,182,font('arvo-latin-700-normal.woff2',86),blue,915)
line('Find the yolk.',325,287,font('arvo-latin-700-normal.woff2',40),ink,915)
line('Grow your market.',325,339,font('arvo-latin-700-normal.woff2',40),ink,915)
line('Find demand.',325,405,font('bai-jamjuree-latin-400-normal.woff2',28),muted,915)
line('Spot supply gaps.',325,439,font('bai-jamjuree-latin-400-normal.woff2',28),muted,915)
line('Plan your next location.',325,473,font('bai-jamjuree-latin-400-normal.woff2',28),muted,915)
line('LOCATION',100,464,font('bai-jamjuree-latin-600-normal.woff2',22),light)
line('INTELLIGENCE',100,496,font('bai-jamjuree-latin-600-normal.woff2',22),light)
line('Interactive preview · v1.4',325,532,font('bai-jamjuree-latin-400-normal.woff2',22),muted,915)
line('montri-th.github.io/yolk',325,565,font('bai-jamjuree-latin-600-normal.woff2',22),blue,915)
path=OUT/'yolk-share-v1.4.png'
img.save(path,format='PNG',compress_level=9,optimize=False)
receipt={
 'schemaVersion':'yolk.social-composition/1.0','version':'1.4','output':str(path.relative_to(ROOT)),
 'mediaType':'image/png','width':1200,'height':630,'bytes':path.stat().st_size,'sha256':sha(path),
 'sourceVersion':'LDS0.9.4 / authoring0.9.4-r2 / machinev0.9.4-mp1',
 'sourceHashes':{'prototype/assets/'+k:v for k,v in inputs.items()},
 'recipe':{'script':'scripts/build-share-image.py','canvas':'brand.beige','leftPanel':'brand.blue','decorativeRules':False,'logo':{'source':'prototype/assets/landometer-logo-horizontal-v12-889.png','fullImage':True,'crop':None,'recolour':False,'renderSize':[220,60],'position':[325,51],'backingPlate':False,'resampling':'LANCZOS'},'fontSource':'exact shipped WOFF2 loaded through FreeType; no substitute','textLocale':'en','pillow':Image.__version__,'freeType':features.version('freetype2'),'format':'RGB PNG','compressLevel':9,'optimize':False,'metadata':'stripped','colorHandling':'assumed_srgb'},
 'layout':{'titleAndIdentitySafeArea':[285,0,630,630],'textSafeArea':[100,35,1000,560],'text':placements},
 'contentBoundary':'Product name, owner-approved tagline, capability summary and preview version only. No geographic claims, private records, rankings or screenshots.',
 'approvalBasis':'Owner requested Landometer identity, share hero, and republish for this Yolk preview on2026-09-24; applies to this asset/role, not a canonical DS amendment.',
 'verification':{'sourceHashes':True,'dimensions':True,'textBounds':True,'localImageInspection':'pending','browserOrSocialCrawlerInspection':'not performed'},
 'alt':'CityMETER: Yolk by Landometer. Find the yolk. Grow your market. Find demand. Spot supply gaps. Plan your next location. Interactive preview v1.4.'
}
(ROOT/'evidence/share-image-v1.4.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'file':str(path.relative_to(ROOT)),'bytes':path.stat().st_size,'sha256':sha(path),'dimensions':[1200,630]}))
