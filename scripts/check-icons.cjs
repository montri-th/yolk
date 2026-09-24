/* Source/runtime contract checks only. This does not close rendered browser QA. */
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const manifest = JSON.parse(read('contracts/icons.v1.5.json'));
const source = read('prototype/icons.js').toString();
const css = read('prototype/icons.css').toString();
function context(fontResult) {
  const classes = new Set();
  const doc = {documentElement:{classList:{toggle:(n,on)=>on?classes.add(n):classes.delete(n),remove:n=>classes.delete(n)}},fonts:{load:()=>fontResult()}};
  const sandbox={window:{document:doc},Promise,Set,Object};vm.createContext(sandbox);vm.runInContext(source,sandbox);
  return {api:sandbox.window.YolkIcons, classes};
}
(async () => {
  assert.equal(manifest.glyphs.length,37);
  assert.deepEqual(manifest.axes,{FILL:0,wght:300,GRAD:0,opsz:24});
  for(const a of manifest.assets) {
    const b=read(a.path);assert.equal(b.length,a.bytes);assert.equal(hash(b),a.sha256);assert.equal(b.subarray(0,4).toString(),'wOF2');
  }
  assert.equal(hash(read(manifest.approvalReceiptRef)),manifest.approvalReceiptSha256);
  assert.equal(hash(read(manifest.licenseOrPermission.path)),manifest.licenseOrPermission.sha256);
  const ready=context(()=>Promise.resolve([{}]));
  assert.deepEqual(Array.from(ready.api.glyphs).sort(),manifest.glyphs.slice().sort());
  for(const n of manifest.glyphs) assert.match(ready.api.icon(n),new RegExp('aria-hidden="true".*>'+n+'</span>'));
  for(const n of ['unknown','<img src=x>','constructor','__proto__','']) { assert.equal(ready.api.icon(n),'');assert.equal(ready.api.patternIcon(n),''); }
  for(const [pattern,glyph] of Object.entries(manifest.pattern_mapping)) assert(ready.api.patternIcon(pattern).includes('data-yolk-glyph="'+glyph+'"'));
  assert(ready.api.yolkIcon().includes('data-yolk-glyph="egg_alt"'));
  const el={inserted:0,getAttribute:()=> 'save',querySelector(){return this.inserted?{}:null},insertAdjacentHTML(pos,html){assert.equal(pos,'afterbegin');assert.match(html,/>save<\/span>/);this.inserted++}};
  const fakeRoot={querySelectorAll:()=>[el]};assert.equal(ready.api.decorate(fakeRoot),1);assert.equal(ready.api.decorate(fakeRoot),0);
  assert.equal(await ready.api.load(),true);assert(ready.classes.has('yolk-icons-ready'));
  const failed=context(()=>Promise.reject(new Error('font unavailable')));assert.equal(await failed.api.load(),false);assert(!failed.classes.has('yolk-icons-ready'));
  const empty=context(()=>Promise.resolve([]));assert.equal(await empty.api.load(),false);
  assert.match(css,/"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24/);
  assert.match(css,/visibility: hidden/);assert.match(css,/\.yolk-icons-ready \.yl-icon\s*\{ visibility: visible/);
  assert.match(css,/font-size: 24px/);assert(!/font-family:\s*["']?(?:Arial|sans-serif)/.test(css));
  const modules={window:{YolkIcons:ready.api},Map,Set,Promise,JSON,Math,Number,Object,Array,String,Date};vm.createContext(modules);
  for(const name of ['location-map.js','branch-photos.js'])vm.runInContext(read('prototype/'+name).toString(),modules,{filename:name});
  const mapHTML=modules.window.YolkLocationMap.render({id:'icon-test'},[],'en');
  for(const n of ['map','satellite_alt','layers','location_on'])assert(mapHTML.includes('data-yolk-glyph="'+n+'"'));
  for(const label of ['Simplified','Satellite','Detailed','Fit location'])assert(mapHTML.includes(label));
  assert(!mapHTML.includes('⌖'));
  const newPhotos=modules.window.YolkBranchPhotos.render('new',{lang:'en',editable:true});
  const samplePhotos=modules.window.YolkBranchPhotos.render('icon-sample',{lang:'en',editable:true});
  assert(newPhotos.includes('data-yolk-glyph="add_photo_alternate"'));assert(newPhotos.includes('Add photo'));
  for(const n of ['photo','delete'])assert(samplePhotos.includes('data-yolk-glyph="'+n+'"'));
  assert(samplePhotos.includes('Set cover'));assert(samplePhotos.includes('Remove'));assert(!newPhotos.includes('＋'));
  console.log('Icon contract passed: 37 allowed icon names, WOFF2/receipt/license hashes, supported names, safe fallback and decoration idempotency. Visual gate remains open.');
})().catch(e=>{console.error(e);process.exitCode=1});
