/* Read-only review diagnostics and Demand shortlist controls, real source model. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let fixture=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
fixture=fixture.replace("'model.js', 'brand-experience.js'","'model.js', 'relative-supply.js', 'brand-experience.js'").replace("if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands;","if (file === 'brand-experience.js') sandbox.YolkBrands = window.YolkBrands; if(file==='relative-supply.js')sandbox.YolkRelativeSupply=window.YolkRelativeSupply;");
const h=Function('require','__dirname',fixture+'\nreturn harness;')(require,__dirname)(),run=h.evaluate;
const app=fs.readFileSync(path.join(root,'prototype/app.js'),'utf8');vm.runInContext(app.split('\n').find(x=>x.startsWith('const num=')),h.sandbox);
for(const name of ['decision-ui.js','location-review.js'])vm.runInContext(fs.readFileSync(path.join(root,'prototype',name),'utf8'),h.sandbox,{filename:name});
const R=h.sandbox.window.YolkLocationReview,plain=x=>JSON.parse(JSON.stringify(x));let passed=0;
async function check(name,f){await f();passed++;console.log('PASS',name)}
(async()=>{
 await h.select('fuel','bangchak');const c=plain(run('Y.criteria')),rows=plain(run('evaluate()'));
 await check('Unknown brand is reviewed rather than certified unbranded or forced competitor',()=>{const a=rows.find(x=>x.demand===true&&x.possiblePatterns.length>1&&x.supply.unverified>0);assert(a);const r=R.report(a,c);assert(r.classificationUnresolved);assert(r.reasons.some(x=>x.id==='brand_allocation'));assert(r.roles.some(x=>x.state==='crosses'));});
 await check('Positive denominator is mandatory and does not infer empty network',()=>{const a={...rows[0],supplyThresholds:{valid:false},possiblePatterns:['Pioneer','FOMO','Our Farm','Crowded']};const r=R.report(a,c);assert(r.reasons.some(x=>x.id==='market_base_missing'));assert(r.roles.every(x=>x.state==='unknown'));});
 await check('Confirmed pattern can coexist with uncertain branch counts',()=>{const a={...rows[0],demand:true,possiblePatterns:['FOMO'],supply:{own:0,competitor:100,unverified:1},supplyThresholds:{valid:true,own:3,competitor:3}};const r=R.report(a,c);assert(r.patternConfirmed);assert(!r.classificationUnresolved);assert.equal(r.reasons.length,0);});
 await check('Unknown Demand is separate from pattern review and exposes missing metrics',()=>{const a=rows.find(x=>x.demand===null);assert(a);const r=R.report(a,c);assert(r.reasons.some(x=>x.id==='demand_missing'));assert(r.missing.length);assert.equal(r.possible.length,0);});
 await check('Each of eight review counts is an actionable semantic button without changing checkboxes',()=>{run('draft=structuredClone(Y.criteria)');const html=h.sandbox.window.YolkDecisions.preferred();assert.equal((html.match(/data-pattern-review-open=/g)||[]).length,8);assert(html.includes('ดูสิ่งที่ต้องตรวจ'));assert(!/<button[^>]*data-pattern-review-open[^>]*>[\s\S]*?<input/.test(html.split('</button>')[0]));});
 await check('Inspection changes no criteria, source, events, shortlist or ranking',()=>{const before=run('JSON.stringify({criteria:Y.criteria,draft,areas:AREAS,events:Y.events,targets:Y.targets,rows:evaluate()})');for(const a of rows)R.report(a,c);for(const a of rows.slice(0,20))R.body(a,c);assert.equal(run('JSON.stringify({criteria:Y.criteria,draft,areas:AREAS,events:Y.events,targets:Y.targets,rows:evaluate()})'),before);});
 await check('Review copy is bilingual and does not offer a fake approval action',()=>{for(const lang of ['th','en']){h.sandbox.testLang=lang;run('Y.lang=testLang');const html=R.body(rows.find(a=>a.possiblePatterns.length>1),c);assert(html.includes(lang==='th'?'กระทบยอด':'reconcile'));assert(!html.includes('data-review-approve'));}});
 await h.select('grocery','grocery-brand:SEVEN_ELEVEN');
 await check('Grocery reconciliation is explained separately from unknown brands',()=>{const a=plain(run('evaluate().find(a=>a.demand===true&&a.possiblePatterns.length>1&&a.supply.reconciliationReview)'));assert(a);assert(R.report(a,plain(run('Y.criteria'))).reasons.some(x=>x.id==='source_reconciliation'));});
 await h.select('nonbank','legal:0107557000195');
 await check('Nonbank residuals require record-level area assignment and are never auto allocated',()=>{const a=plain(run('evaluate().find(a=>a.demand===true&&a.possiblePatterns.length>1)'));assert(a);assert(R.report(a,plain(run('Y.criteria'))).reasons.some(x=>x.id==='area_assignment'));});
 await check('Demand cards have a separate accessible shortlist control and reuse existing workspace action',()=>{const ui=fs.readFileSync(path.join(root,'prototype/analysis-ui.js'),'utf8');assert(ui.includes('analysis-shortlist-action'));assert(ui.includes('data-action="target"'));assert(ui.includes("!canEdit()?'disabled':''"));assert(ui.includes('Add to shortlist'));assert(app.includes("case 'target':"));assert(ui.includes('analysis-location-card'));});
 console.log(`LOCATION REVIEW REGRESSION: ${passed} PASS`);
})().catch(e=>{console.error(e);process.exitCode=1});
