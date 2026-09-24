/* Semantic presentation checks in a VM, not rendered browser/device evidence. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../prototype'));
let checks=0;function check(ok,message){assert.ok(ok,message);checks++}
const criteria={ownMany:3,competitorMany:3,patterns:['Pioneer','FOMO','Our Farm'],demandMode:'high',maxDemandTier:3,rankingMode:'weighted',extraMetrics:[],buildingEnabled:true,activityEnabled:true,buildingP1:99};
const c={lang:'en',Number,String,Object,Array,Set,Map,Math,Promise,Y:{criteria,pois:[]},draft:criteria,num:(p,n=0)=>Number(p).toLocaleString('en',{minimumFractionDigits:n,maximumFractionDigits:n})};
c.tr=(th,en)=>c.lang==='th'?th:en;c.window=c;vm.createContext(c);
for(const p of ['icons.js','decision-ui.js','landscape.js'])vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),c,{filename:p});
const expected={'Crowded':'groups','FOMO':'flag','Our Farm':'potted_plant','Pioneer':'explore','Quiet':'bedtime','Their War':'swords','Our Island':'beach_access','Winter War':'ac_unit'};
for(const lang of ['th','en']){
 c.lang=lang;
 const preferred=c.YolkDecisions.preferred();
 for(const [name,glyph] of Object.entries(expected)){
  const card=preferred.split('data-pattern="'+name+'"')[1]?.split('</label>')[0];
  check(card?.includes('data-yolk-glyph="'+glyph+'"')&&card.includes(name),lang+': '+name+' has the semantic icon and visible name');
  check(card.includes('pattern-levels')&&card.includes('pattern-description'),lang+': '+name+' keeps its actual D/C/B explanation');
 }
 const texts=lang==='en'?['Top 1%','Top 5%','Top 10%','Upper half','Below the midpoint']:['กลุ่มสูงสุด 1%','กลุ่มสูงสุด 5%','กลุ่มสูงสุด 10%','ครึ่งบน','ต่ำกว่ากึ่งกลาง'];
 for(const [p,which] of [[100,0],[99.7,0],[99,0],[98.999,1],[97.4,1],[95,1],[94.99,2],[90,2],[89.9,3],[50,3],[49.9,4],[0,4]])check(c.YolkDecisions.percentileText(p)===texts[which],lang+': percentile band boundary '+p);
 for(const p of [99.7,100,99.7,97.4]){
  const html=c.YolkDecisions.percentileView(p);
  check(html.includes('<details class="percentile-exact">')&&html.includes('<b>P'+p.toFixed(1)+'</b>'),lang+': exact percentile remains reachable '+p);
  check(html.includes('percentile-benchmark')&&html.includes('percentile-mini-track'),lang+': readable comparison has benchmark context and track');
  check(!html.includes('Top 0%')&&!html.includes('#1'),lang+': P100 does not assert unique first place');
 }
 for(const p of [null,undefined,NaN,-1,101,'99.7']){
  const html=c.YolkDecisions.percentileView(p);check(html.includes('percentile-unavailable')&&!html.includes('<details')&&!html.includes('width:'),lang+': missing/invalid percentile has no numeric graphic');
 }
 const base={id:'safe-fixture',pattern:'Pioneer',demand:true,buildingTier:1,activityTier:3,supply:{own:1,competitor:1,unverified:0},metrics:{gfa:7200,gfa_per_person:0,factory_workers:null},percentiles:{gfa:99.7,gfa_per_person:0,factory_workers:99.9},metricStates:{factory_workers:{state:'suppressed',reason:'Unavailable under source policy'}}};
 const before=JSON.stringify(base);let html=c.renderMarketLandscape(base);
 const demandSection=html.split('aria-labelledby="yl-demand-title"')[1].split('</section>')[0];
 check(demandSection.includes('data-yolk-glyph="egg_alt"'),lang+': confirmed high demand receives the Yolk cue');
 check(demandSection.includes('7,200')&&demandSection.includes('m²')||demandSection.includes('7,200')&&demandSection.includes('ตร.ม.'),lang+': raw metric and unit remain visible');
 check(demandSection.includes('P99.7')&&!demandSection.includes('P99.9'),lang+': unavailable raw value cannot leak a stale percentile');
 check(demandSection.includes(lang==='th'?'ค่าที่รายงานเป็น 0':'Reported zero'),lang+': reported zero remains explicit, unlike missing');
 for(const [name,glyph] of Object.entries(expected))check(html.includes('data-yolk-glyph="'+glyph+'"')&&html.includes(name),lang+': landscape has '+name+' icon and name');
 check(before===JSON.stringify(base),lang+': read-only visualization does not mutate analytical input');
 for(const state of [false,null,undefined]){
  html=c.renderMarketLandscape({...base,demand:state,pattern:state===false?'Quiet':null});
  const heading=html.split('id="yl-demand-title"')[1].split('</h2>')[0];
  check(!heading.includes('egg_alt')&&!heading.includes('yl-yolk-label'),lang+': low/unknown demand is not labelled Yolk');
 }
}
const css=fs.readFileSync(path.join(root,'icons.css'),'utf8');check(css.includes('.percentile-exact>summary')&&css.includes('min-height:44px'),'precise percentile disclosure is a native touch-size control');
check(css.includes('.percentile-exact>summary:focus-visible'),'keyboard-visible focus for precise value disclosure');
check(Object.keys(expected).length===new Set(Object.values(expected)).size,'all eight patterns have distinct mnemonic glyphs');
console.log(JSON.stringify({suite:'patterns-v1.5',checks,passed:checks,evidence:'VM/source semantics only; rendered font shaping and device layout remain open'}));
