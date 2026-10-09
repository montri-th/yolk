/* DS EVID-05 value states exercise the production helper; fixtures are labelled synthetic. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prefix=fs.readFileSync(path.join(__dirname,'check-brand-presets.cjs'),'utf8').split('(async () => {')[0];
const make=Function('require','__dirname',prefix+'\nreturn harness;')(require,__dirname),h=make();
for(const file of ['relative-supply.js','yolk-tier-style.js','map-analysis.js'])vm.runInContext(fs.readFileSync(path.join(root,'prototype',file),'utf8'),h.sandbox,{filename:file});
const A=h.sandbox.window.YolkMapAnalysis,checks=[],criteria={industry:'fuel',supplyDenominatorId:'gfa'},state={kind:'supply',metric:'count',relation:'total'};
const fixture=(id,own,competitor=0,extra={})=>({id,supply:{own,competitor,unverified:0,state:'source_reported_inventory',...extra},metrics:{population:20000,gfa:100000},areaKm2:2});
const plain=x=>JSON.parse(JSON.stringify(x));
async function check(name,fn){try{await fn();checks.push({name,passed:true});console.log('PASS '+name)}catch(error){checks.push({name,passed:false,error:String(error.stack||error)});console.error('FAIL '+name+'\n'+error.stack)}}
(async()=>{
 await check('Evidence neutral tokens match complete pinned LDS 0.9.7 machine contract exactly',()=>{
  const normative=fs.readFileSync(path.join(root,'reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md'),'utf8'),machine=JSON.parse(normative.split('```json\n')[1].split('\n```')[0]);
  for(const theme of ['light','dark']){const actual=A.evidenceTokens[theme],tokens=machine.tokens;assert.deepEqual(plain(actual),{zero:tokens.dataState.zero[theme],noData:tokens.dataState.noData[theme],border:tokens.foundation['border.emphasis'][theme],soft:tokens.foundation['surface.soft'][theme],metadata:tokens.foundation['text.metadata'][theme],pendingFill:tokens.semanticState.pending[theme].surface,pendingInk:tokens.semanticState.pending[theme].content});}
  assert.equal(machine.tokens.dataState.valueStates.treatments.measured_zero.map.outlineWidthPx,2);assert.equal(machine.tokens.dataState.valueStates.treatments.no_data.map.pattern,'135deg hatch');
 });
 await check('Numeric zero keeps exact lowest LUT fill on both themes and distinct solid 2px outline',()=>{
  const rows=[fixture('synthetic_zero',0),fixture('synthetic_positive',10)],p=A.prepare(rows,state,criteria,{cohortRows:rows,cohortId:'synthetic_zero_known'}),zero=p.records.get(rows[0].id),positive=p.records.get(rows[1].id);
  assert.equal(zero.value,0);assert.equal(zero.classIndex,0);assert.equal(zero.color,A.palettes.count[0]);assert.equal(A.evidenceCue(zero,state).key,'known_zero');
  for(const theme of ['light','dark']){const style=A.styleForEvidence(zero,state,{theme});assert.equal(style.fillColor,A.palettes.count[0]);assert.equal(style.fillOpacity,1);assert.equal(style.color,A.evidenceTokens[theme].zero);assert.equal(style.weight,2);assert.equal(style.dashArray,null);assert.equal(A.styleForEvidence(positive,state,{theme}).fillColor,positive.color);}
 });
 await check('Null, suppression, out-of-scope and future-cycle values stay null with separate cues',()=>{
  const keys={missing:'no_data',no_data:'no_data',suppressed:'suppressed',withheld:'suppressed',out_of_scope:'out_of_scope',not_applicable:'out_of_scope',not_yet:'not_yet'};
  for(const [source,key]of Object.entries(keys)){const record=A.value(fixture('synthetic_'+source,123,456,{state:source}),state,criteria);assert.equal(record.value,null);assert.equal(record.lo,null);assert.equal(record.hi,null);assert.equal(record.zero,false);assert.equal(A.evidenceCue(record,state).key,key);for(const theme of ['light','dark']){const style=A.styleForEvidence(record,state,{theme});assert.notEqual(style.fillColor,A.palettes.count[0]);if(key==='no_data')assert.equal(style.fillColor,'url(#yolk-map-no-data-'+theme+')');if(key==='out_of_scope')assert.equal(style.fill,false);if(key==='suppressed'){assert.equal(style.fillColor,A.evidenceTokens[theme].soft);assert.equal(style.dashArray,'6 4');}if(key==='not_yet')assert.equal(style.fillColor,A.evidenceTokens[theme].pendingFill);}}
 });
 await check('0/0 inventory share is undefined; zero own with positive competition is known 0 percent',()=>{
  const share={kind:'supply',metric:'share',relation:'total'},empty=A.value(fixture('synthetic_empty',0,0),share,criteria),zero=A.value(fixture('synthetic_ownzero',0,20),share,criteria);
  assert.equal(empty.value,null);assert.equal(empty.denominatorValue,0);assert.equal(A.evidenceCue(empty,share).key,'undefined_ratio');assert.equal(empty.zero,false);assert.equal(zero.value,0);assert.equal(zero.denominatorValue,20);assert.equal(A.evidenceCue(zero,share).key,'known_zero');
 });
 await check('Below Demand cutoff is known category with bare basemap, distinct from missing and review',()=>{
  const tier={kind:'demand',metric:'tier'},below=A.value({...fixture('synthetic_below',0),demand:false,qualifyingTier:null},tier,criteria),review=A.value({...fixture('synthetic_review',0),demand:null,qualifyingTier:null},tier,criteria),missing=A.value({...fixture('synthetic_missing',0),metrics:{population:null},metricStates:{population:{state:'missing_source'}}},{kind:'demand',metric:'population'},criteria);
  assert.equal(A.evidenceCue(below,tier).key,'below_criteria');assert.equal(A.styleForEvidence(below,tier).fill,false);assert.equal(below.value,null);assert.equal(below.zero,false);
  assert.equal(A.evidenceCue(review,tier).key,'review');assert.equal(A.styleForEvidence(review,tier).dashArray,'1 4');assert.equal(A.evidenceCue(missing,{kind:'demand',metric:'population'}).key,'no_data');
 });
 await check('Legend states are separate and fully localised; analytical LUT stays 41 samples',()=>{
  const rows=[fixture('synthetic_zero',0),fixture('synthetic_missing',null),fixture('synthetic_review',1,1,{ownLower:1,ownUpper:2}),fixture('synthetic_suppressed',20,0,{state:'suppressed'})],p=A.prepare(rows,state,criteria,{cohortRows:rows,cohortId:'synthetic_legend'});
  for(const lang of ['th','en']){const html=A.evidenceLegend(p,{lang});for(const key of ['known_zero','no_data','review','suppressed'])assert(html.includes('data-evidence-cue="'+key+'"'));assert(!html.includes('No data / review'));assert(!html.includes('ไม่มีข้อมูล / รอตรวจ'));assert(html.includes(lang==='en'?'Source-reported zero':'ศูนย์ตามต้นทาง'));}assert.equal(p.palette.length,41);assert.deepEqual(plain(p.palette),plain(A.palettes.count));
 });
 await check('Suppressed Demand and denominator values never leak source amount into governed result',()=>{
  const source={...fixture('synthetic_suppressed_demand',1),metrics:{population:123456789,gfa:987654321},metricStates:{population:{state:'suppressed'},gfa:{state:'withheld'}}},demand=A.value(source,{kind:'demand',metric:'population'},criteria),rate=A.value(source,{kind:'supply',metric:'market',relation:'total'},criteria);
  for(const record of [demand,rate]){assert.equal(record.value,null);assert.equal(record.lo,null);assert.equal(record.hi,null);assert.equal(A.evidenceCue(record).key,'suppressed');assert(!JSON.stringify(record).includes('123456789'));assert(!JSON.stringify(record).includes('987654321'));}assert.equal(rate.denominatorValue,null);
 });
 await check('Map SVG installs source hatch defs once, and label text stays outside hatch swatches',()=>{
  class Element{constructor(name){this.name=name;this.attrs={};this.children=[];}setAttribute(k,v){this.attrs[k]=v}appendChild(c){this.children.push(c);return c}insertBefore(c){this.children.unshift(c)}get firstChild(){return this.children[0]||null}querySelector(){return this.children.find(c=>c.name==='defs'&&c.attrs['data-yolk-evidence-patterns'])||null}}
  const svg=new Element('svg'),container={querySelectorAll:()=>[svg]},doc=h.sandbox.window.document=h.sandbox.document||{};doc.createElementNS=(ns,name)=>new Element(name);
  assert.equal(A.ensureEvidencePatterns(container),1);assert.equal(A.ensureEvidencePatterns(container),0);const patterns=svg.children[0].children;assert.equal(patterns.length,2);for(const p of patterns){assert.equal(p.attrs.patternTransform,'rotate(135)');assert.equal(p.attrs.patternUnits,'userSpaceOnUse');assert.equal(p.children.length,2)}
  const p=A.prepare([fixture('synthetic_null',null)],state,criteria,{cohortRows:[],cohortId:'synthetic_empty_cohort'}),html=A.evidenceLegend(p,{lang:'en'});assert(html.includes('aria-hidden="true"'));assert(html.includes('</i><span>No data</span>'));assert(!html.includes('<i>No data'));
 });
 const result={test:'check-map-evidence-states',passed:checks.every(c=>c.passed),checks:checks.length,scope:'Production helper and actual pinned DS machine contract; synthetic values and SVG mock; rendered both-theme QA separate'};console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
