/* Exact-asset and initial metadata checks; not browser/social crawler QA. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const contract=JSON.parse(fs.readFileSync(path.join(root,'contracts/web-identity.v1.5.json')));
const html=fs.readFileSync(path.join(root,'prototype/index.html'),'utf8');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name)}
check('asset bytes, PNG dimensions and provenance match the current role contract',()=>{
 for(const asset of contract.assets){
  const bytes=fs.readFileSync(path.join(root,asset.path));
  assert.equal(hash(bytes),asset.sha256,asset.path);
  assert.equal(bytes.length,asset.bytes);
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  assert.equal(bytes.readUInt32BE(16),asset.width);
  assert.equal(bytes.readUInt32BE(20),asset.height);
  assert(asset.artifactScope);
 }
});
check('all favicons and the app manifest resolve locally with content revisions',()=>{
 const refs=[...html.matchAll(/<link[^>]+rel="(icon|apple-touch-icon|manifest)"[^>]+href="([^"]+)"/g)];
 assert.equal(refs.length,5);
 for(const [,role,url]of refs){
  const [file,query]=url.split('?');const data=fs.readFileSync(path.join(root,'prototype',file));
  assert.equal(query,'v='+hash(data).slice(0,12),role);
 }
 const m=JSON.parse(fs.readFileSync(path.join(root,contract.runtime.manifest)));
 assert.equal(m.start_url,'/yolk/');assert.equal(m.scope,'/yolk/');assert.equal(m.display,'browser');
 assert.deepEqual(m.icons.map(i=>i.sizes),['192x192','512x512']);
 assert.equal(m.icons[1].purpose,'maskable');
 for(const icon of m.icons){
  const [file,query]=icon.src.split('?');const data=fs.readFileSync(path.join(root,path.dirname(contract.runtime.manifest),file));
  assert.equal(query,'v='+hash(data).slice(0,12));
 }
});
function meta(key){const re=new RegExp('<meta (?:name|property)="'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'" content="([^"]+)"');return html.match(re)?.[1]}
check('initial HTML delivers truthful product-level social preview metadata',()=>{
 assert.equal(meta('robots'),'noindex,nofollow');
 assert(html.includes('<link rel="canonical" href="https://montri-th.github.io/yolk/">'));
 assert.equal(meta('og:url'),contract.canonicalUrl);assert.equal(meta('og:type'),'website');
 assert.equal(meta('og:image:width'),'1200');assert.equal(meta('og:image:height'),'630');
 assert.equal(meta('og:image:type'),'image/png');assert.equal(meta('twitter:card'),'summary_large_image');
 assert.equal(meta('og:image'),meta('twitter:image'));assert.equal(meta('og:image'),meta('og:image:secure_url'));
 const share=contract.assets.find(a=>a.role==='social_preview');
 assert.equal(meta('og:image'),contract.canonicalUrl+'assets/identity/yolk-share-v1.4.png?v='+share.sha256.slice(0,12));
 assert(meta('og:image:alt').includes('Landometer'));assert(meta('og:description').includes('preview'));
 assert.equal(meta('og:locale'),'th_TH');assert.equal(meta('og:locale:alternate'),'en_US');
 assert.equal((html.match(/name="theme-color"/g)||[]).length,2);
 assert(html.includes('media="(prefers-color-scheme: dark)"'));
});
check('share output binds full native art and exact DS font sources',()=>{
 const r=JSON.parse(fs.readFileSync(path.join(root,'evidence/share-image-v1.4.json')));
 assert.equal(r.recipe.logo.crop,null);assert.equal(r.recipe.logo.recolour,false);assert.equal(r.recipe.logo.backingPlate,false);
 assert.equal(r.recipe.decorativeRules,false);
 const copy=r.layout.text.map(x=>x.text);
 for(const label of ['Find demand.','Spot supply gaps.','Plan your next location.'])assert(copy.includes(label));
 assert(!copy.join(' ').includes('Compare demand, supply'));
 assert(!fs.readFileSync(path.join(root,'scripts/build-share-image.py'),'utf8').includes('energy-coral'));
 for(const [file,digest]of Object.entries(r.sourceHashes))assert.equal(hash(fs.readFileSync(path.join(root,file))),digest,file);
 const share=contract.assets.find(a=>a.role==='social_preview');assert.equal(r.sha256,share.sha256);
 for(const text of r.layout.text){assert(text.bounds[2]<=1100);assert(text.bounds[3]<=595)}
 assert.equal(contract.canonicalDsAmended,false);
 assert.equal(contract.approvalBoundary.fullDsIdentityConformanceClaimed,false);
});
console.log(`${checks} identity/metadata checks passed. Browser, install and share-crawler rendering remain unverified.`);
