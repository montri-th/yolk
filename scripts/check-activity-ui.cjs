/* Actual activity renderers + real displayValue source. Native layout is a separate gate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prototype=path.join(root,'prototype'),read=name=>fs.readFileSync(path.join(prototype,name),'utf8');
const prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const make=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname),app=read('app.js');
const start=app.indexOf('function activityValuePair('),end=app.indexOf('\nfunction numberControl(',start);
assert(start>=0&&end>start,'Actual bounded activity renderers must resolve');
const actual=app.slice(start,end),checks=[];
function fixture(lang='en'){
 const h=make();h.sandbox.Intl=Intl;h.sandbox.num=n=>new Intl.NumberFormat(lang==='en'?'en-GB':'th-TH').format(n);
 vm.runInContext(actual,h.sandbox,{filename:'actual-activity-renderers.js'});h.evaluate('Y.lang='+JSON.stringify(lang)+';Y.actor="admin";Y.pois=[]');
 const event={id:'event-fixture',type:'supply.updated',entity:'supply',entity_id:'grocery:83025d88-038a-4c8e-a990-339c091787c0',actor:'admin',at:'2026-10-07T12:18:00Z',recipients:['editor1'],meta:{industry:'grocery',industryName:{th:'ร้านค้าของกินของใช้',en:'Grocery'},ownBrandId:'grocery-brand:MAKRO',ownBrandName:'Makro',supplyScope:'WHOLESALE'},changes:[{field:'note',before:null,after:'รายงานการตรวจสภาพพื้นที่บริเวณ GO Wholesale สาขาพระราม 2 (พิกัด: 13.664920, 100.437012) แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร เพื่อใช้เป็นข้อมูลสนับสนุนการลงสำรวจทำเลและตรวจสอบบริบทสาขา ก่อนทีมตัดสินใจเปิดสาขาใหม่\nThis observation is a fieldwork note, not a verified operating claim. '+ 'Long context and original evidence are retained. '.repeat(10)}]};
 return{h,event,html(overrides={}){h.sandbox.testEvents=[{...event,...overrides}];return h.evaluate('feed(testEvents,{limit:6,links:true})')},change(changes){h.sandbox.testChanges=changes;return h.evaluate('changeView({changes:testChanges})')}};
}
function check(name,fn){try{fn();checks.push({name,passed:true})}catch(error){checks.push({name,passed:false,error:String(error.stack||error)})}}
check('Long Thai/English field notes preserve complete escaped old/new text in native disclosure',()=>{
 for(const lang of ['th','en']){const f=fixture(lang),html=f.html();f.h.sandbox.text=f.event.changes[0].after;const escaped=f.h.evaluate('escapeHTML(text)');assert(html.includes('<details class="activity-change-detail">'));assert(html.includes(escaped));assert(html.includes(lang==='en'?'>Before<':'>เดิม<'));assert(html.includes(lang==='en'?'>After<':'>ใหม่<'));assert(!html.includes('<del>'));assert(!html.includes('change-arrow'));}
});
check('Long values use bounded preview but retain all content exactly, without changing source event',()=>{
 const f=fixture(),before=JSON.stringify(f.event),html=f.html(),preview=html.match(/<p class="activity-change-preview">([\s\S]*?)<\/p>/)[1];assert(preview.includes('…'));assert(preview.length<260);assert.equal(JSON.stringify(f.event),before);assert(html.includes(f.event.changes[0].after));
});
check('Short scalars keep measured zero, false and missing as distinct before/after labels',()=>{
 const f=fixture(),html=f.change([{field:'lat',before:null,after:0},{field:'archived',before:true,after:false}]);assert(!html.includes('activity-change-detail'));assert(html.includes('Not set'));assert(html.includes('>0</dd>'));assert(html.includes('>Yes</dd>'));assert(html.includes('>No</dd>'));assert.equal((html.match(/class="activity-change-values"/g)||[]).length,2);
});
check('Record identifiers are secondary disclosure rather than primary branch caption',()=>{
 const f=fixture(),html=f.html();assert(html.includes('Recorded branch'));const idsStart=html.indexOf('<details class="activity-event-ids">'),idsEnd=html.indexOf('</details>',idsStart);assert(idsStart>=0);assert(html.slice(idsStart,idsEnd).includes(f.event.entity_id));assert(!html.slice(0,idsStart).includes(f.event.entity_id));
});
check('Branch name resolves from current record or immutable name change when source list is cold',()=>{
 const f=fixture(),html=f.html({changes:[{field:'name',before:'Original branch',after:'Recorded branch name'}]});assert(html.includes('activity-entity-name">Recorded branch name'));f.h.evaluate('Y.pois=[{id:"grocery:83025d88-038a-4c8e-a990-339c091787c0",name:"Current source branch"}]');assert(f.html().includes('activity-entity-name">Current source branch'));
});
check('User text, unknown field/type, branch name, event ID and brand metadata are escaped',()=>{
 const f=fixture(),bad='<img src=x onerror="bad()">',html=f.html({id:'event" onclick="bad()',type:bad,meta:{ownBrandId:'x',ownBrandName:bad,industryName:{en:bad},supplyScope:bad},changes:[{field:bad,before:bad,after:bad+' '.repeat(190)}]});assert(!html.includes('<img'));assert(!html.includes('data-id="event" onclick'));assert(html.includes('&lt;img'));assert(html.includes('event&quot; onclick=&quot;bad()'));assert(!html.includes('<script'));
});
check('Feed limit, unread state and explicit context links keep their retained behavior',()=>{
 const f=fixture();f.h.sandbox.testEvents=Array.from({length:8},(_,i)=>({...f.event,id:'event-'+i,recipients:['admin']}));const html=f.h.evaluate('feed(testEvents,{limit:3,links:false})');assert.equal((html.match(/class="feed-item unread"/g)||[]).length,3);assert(!html.includes('data-action="event-context"'));assert(!html.includes('event-3'));assert(f.h.evaluate('feed([])').includes('No changes in this context yet'));
});
check('Context captions, event time and escaped action labels remain readable in both languages',()=>{
 for(const lang of ['th','en']){const f=fixture(lang),html=f.html();assert(html.includes('Makro'));assert(html.includes('WHOLESALE'));assert(html.includes('<time datetime="2026-10-07T12:18:00Z">'));assert(html.includes(lang==='en'?'updated a branch':'แก้ไขข้อมูลสาขา'));assert(html.includes('feed-event-header'));assert(html.includes('aria-hidden="true"'));}
});
check('Activity layout is panel-width safe and has non-color labels plus native focusable disclosures',()=>{
 const css=read('activity-ui.css');assert(css.includes('.change-line.activity-change{display:block'));assert(css.includes('grid-template-columns:32px minmax(0,1fr)'));assert(css.includes('white-space:pre-wrap'));assert(css.includes('overflow-wrap:break-word'));assert(css.includes('overflow-wrap:anywhere'));assert(css.includes('word-break:normal'));assert(css.includes('summary:focus-visible'));assert(css.includes('min-height:44px'));assert(!css.includes('@media'));assert(!/#[\da-f]{3,8}\b/i.test(css));assert(!css.includes('border-inline-start'));assert(!css.includes('overflow:hidden'));
});
const report={schemaVersion:1,suite:'activity-ui',kind:'actual_renderers_vm_and_source_checks_not_native',checks,passed:checks.every(c=>c.passed),scope:'Real activity HTML renderers and display formatting, safe output and preservation. Actual Thai/English layout, fonts, focus, all viewports and physical devices require separate native evidence.'};
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
