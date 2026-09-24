/* Source/VM model regression checks; no browser or rendered UI claims. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const prototype=path.resolve(process.argv[2]||path.join(__dirname,'../prototype'));
const metricsSource=fs.readFileSync(path.join(prototype,'metrics.js'),'utf8'),modelSource=fs.readFileSync(path.join(prototype,'model.js'),'utf8');
let assertions=0;
const check=(value,message)=>{assert.ok(value,message);assertions++};
const close=(actual,expected,message)=>check(Math.abs(actual-expected)<1e-9,`${message}: ${actual} != ${expected}`);
const core=['gfa','gfa_per_person','gfa_per_km2','factory_count','factory_count_per_km2','factory_workers','factory_workers_per_km2','hotel_rooms','hotel_rooms_per_km2'];
const sourceArea=(id,building,activity,supply={own:0,competitor:0,unverified:0},extra={})=>({id,th:id,en:id,province:id==='p1'?'10':'11',geoType:'khwaeng',sourceRank:10+Number(id.replace(/\D/g,'')),population:100,areaKm2:2,metrics:Object.fromEntries([...core.map((k,i)=>[k,i<3?building[i]:activity[i-3]]),...Object.entries(extra)]),supply});
const fixture={metadata:{thresholds:Object.fromEntries([...core,'population','population_per_km2'].map(id=>[id,{p95:95,p99:99}])),poiSampleAreaIds:['p1']},pois:[],areas:[
 sourceArea('p1',[100,100,100],[10,10,10,10,10,10]),
 sourceArea('p2',[96,96,96],[20,20,20,20,20,20]),
 sourceArea('p3',[95,1,1],[30,30,30,30,30,30]),
 sourceArea('p4',[50,50,50],[100,100,100,100,100,20]),
 sourceArea('p5',[40,40,40],[96,96,96,20,20,20]),
 sourceArea('p6',[30,30,30],[95,20,20,20,20,20]),
 sourceArea('p7',[20,20,20],[10,10,10,10,10,10]),
 sourceArea('p8',[null,96,96],[null,null,null,null,null,null]),
 sourceArea('p9',[null,null,null],[null,null,null,null,null,null]),
 sourceArea('p10',[100,100,100],[10,10,10,10,10,10],{own:0,competitor:6,unverified:0}),
 sourceArea('p11',[100,100,100],[10,10,10,10,10,10],{own:6,competitor:0,unverified:0})]};
function load({saved,real=false}={}){
 const listeners={},writes=[];
 const ctx=vm.createContext({console,structuredClone,localStorage:{getItem(){return saved?JSON.stringify(saved):null},setItem(k,v){writes.push([k,v])}},crypto:{randomUUID(){return 'test-event'}},render(){},notify(){},addEventListener(type,fn){listeners[type]=fn}});
 ctx.window=ctx;ctx.YOLK_PROVINCES=[];ctx.YOLK_DEMO_DATA=structuredClone(fixture);ctx.YOLK_REAL_DATA=structuredClone(fixture);
 vm.runInContext(metricsSource,ctx);vm.runInContext(modelSource,ctx);
 return {run:s=>vm.runInContext(s,ctx),listeners,writes,ctx};
}
const {run}=load();
check(run("Y.criteria.rankingMode==='weighted'&&Y.criteria.maxDemandTier===3"),'fresh workspaces use weighted ranking and all high-demand tiers');
check(run('criteriaErrors(Y.criteria).length===0'),'new defaults are valid');
const eligible=limit=>run(`evaluate({...structuredClone(Y.criteria),maxDemandTier:${limit}}).filter(a=>a.eligible).map(a=>a.id).sort().join(',')`);
check(eligible(1)!==eligible(2)&&eligible(2)!==eligible(3),'tier gate changes membership at each level');
check(run("evaluate({...structuredClone(Y.criteria),maxDemandTier:2}).find(a=>a.id==='p8').qualifyingTier===3"),'missing building data cannot promote the confirmed Tier3 to possible Tier1');
check(run("!evaluate({...structuredClone(Y.criteria),maxDemandTier:2}).find(a=>a.id==='p8').tierEligible"),'partially known Tier3 fails maximum Tier2');
check(run("evaluate({...structuredClone(Y.criteria),maxDemandTier:3}).find(a=>a.id==='p8').tierEligible"),'confirmed Tier3 can qualify despite missing other signals');
check(run("evaluate().find(a=>a.id==='p9').demand===null&&!evaluate().find(a=>a.id==='p9').eligible"),'fully unknown demand never enters shortlist candidate set');
check(run("(()=>{let c={...structuredClone(Y.criteria),buildingEnabled:false,activityEnabled:false,extraMetrics:['population']};let a=evaluate(c).find(a=>a.id==='p7');return a.qualifyingTier===3&&a.tierEligible&&!evaluate({...c,maxDemandTier:2}).find(a=>a.id==='p7').tierEligible})()"),'enabled extra passes enter explicitly at Tier3 only');
check(run("(()=>{let c={...structuredClone(Y.criteria),demandMode:'all',patterns:patternNames,maxDemandTier:1},a=evaluate(c).find(a=>a.id==='p7');return a.eligible&&a.demand===false&&a.qualifyingTier===null&&!a.tierEligible})()"),'all-demand mode retains selected low-demand patterns without a tier');
check(run("(()=>{let c=structuredClone(Y.criteria);c.patterns=patternNames;let before=evaluate(c);c.rankingWeights={demand:0,ownGap:100,competitorGap:0};let after=evaluate(c);return before.map(a=>a.id).join()!==after.map(a=>a.id).join()&&before.every(a=>{let b=after.find(x=>x.id===a.id);return a.eligible===b.eligible&&a.qualifyingTier===b.qualifyingTier&&a.pattern===b.pattern})})()"),'ranking weights change order without changing membership, tiers or pattern classification');
check(run("(()=>{let c=structuredClone(Y.criteria);c.rankingWeights={demand:100,ownGap:0,competitorGap:0};c.demandGroupWeights={building:100,activity:0,extra:50};let a=evaluate(c).map(a=>a.id).join();c.demandGroupWeights={building:0,activity:100,extra:50};return a!==evaluate(c).map(a=>a.id).join()})()"),'group weights can change ranked order');
check(run("(()=>{let c=structuredClone(Y.criteria);c.rankingWeights={demand:100,ownGap:0,competitorGap:0};c.demandGroupWeights={building:100,activity:0,extra:50};let a=evaluate(c).map(a=>a.id).join();c.metricWeights.gfa=100;c.metricWeights.gfa_per_person=0;c.metricWeights.gfa_per_km2=0;return a!==evaluate(c).map(a=>a.id).join()})()"),'metric weights can change ranked order');
const missing=run("(()=>{let c=structuredClone(Y.criteria);c.activityEnabled=false;return weightedDemand({percentiles:{gfa:100,gfa_per_person:null,gfa_per_km2:null}},c)})()");
close(missing.lower,100/3,'missing keeps configured weight in lower bound');close(missing.upper,100,'missing contributes100 to upper bound');close(missing.coverage,1/3,'coverage uses weighted observed share');
const unknown=run("weightedDemand({percentiles:{}},Y.criteria)");close(unknown.lower,0,'all missing demand lower');close(unknown.upper,100,'all missing demand upper');
const joint=run("(()=>{let c=structuredClone(Y.criteria);c.rankingWeights={demand:0,ownGap:50,competitorGap:50};return weightedEvaluation({percentiles:{},supply:{own:0,competitor:0,unverified:6}},c)})()");
close(joint.rankScore,50,'joint U minimum occurs at an interior allocation');close(joint.rankUpper,200/3,'joint U maximum is a valid endpoint allocation');check(joint.rankScore>joint.rankingComponents.ownGap.lower,'joint lower is not the impossible independent minimum');close(joint.rankCoverage,0,'unresolved U does not count as fully observed weighted supply');
const noSupply=run("weightedEvaluation({percentiles:{},supply:{own:null,competitor:0,unverified:0}},Y.criteria)");close(noSupply.rankScore,0,'unknown observations lower');close(noSupply.rankUpper,100,'unknown observations upper');
check(run("(()=>{let c=structuredClone(Y.criteria);c.rankingWeights={demand:0,ownGap:0,competitorGap:0};return criteriaErrors(c).includes('rankingWeights')})()"),'allzero rank weights rejected');
for(const key of ['rankingWeights','demandGroupWeights','metricWeights'])check(run(`(()=>{let c=structuredClone(Y.criteria);c.${key}[Object.keys(c.${key})[0]]=101;return criteriaErrors(c).includes('${key}')})()`),`${key} bounds validated`);
check(run("(()=>{let c=structuredClone(Y.criteria);BUILDING_IDS.forEach(id=>c.metricWeights[id]=0);return criteriaErrors(c).includes('metricWeights')})()"),'positive enabled group cannot have allzero metrics');
check(run("(()=>{let c=structuredClone(Y.criteria);c.demandGroupWeights={building:0,activity:0,extra:50};return criteriaErrors(c).includes('demandGroupWeights')})()"),'positive demand component requires a positive enabled group');
check(run("criteriaErrors({...structuredClone(Y.criteria),patterns:[]}).includes('patterns')"),'empty preferred type selection rejected');
check(run("(()=>{let a=structuredClone(Y.criteria),b=structuredClone(a);b.metricWeights.gfa=50;b.rankingWeights.demand=90;b.demandGroupWeights.extra=20;b.maxDemandTier=2;let d=diffCriteria(a,b);return d.length===4&&d.every(x=>fieldNames[x.field])&&d.find(x=>x.field==='metricWeights.gfa').before===1})()"),'nested weight changes emit readable individual diffs');
const old=run("(()=>{let c=structuredClone(DEFAULT_CRITERIA);for(let key of ['maxDemandTier','rankingMode','rankingWeights','demandGroupWeights','metricWeights'])delete c[key];c.version=7;return c})()");
const migration=load({saved:{criteria:old,events:[{id:'kept'}],targets:{p2:{status:'study'}}}});
check(migration.run("Y.criteria.rankingMode==='legacy'&&Y.criteria.maxDemandTier===3&&Y.criteria.version===7&&Y.events.length===1&&Y.events[0].id==='kept'&&Y.targets.p2.status==='study'"),'legacy migration preserves criteria version, events and work');
check(migration.writes.length===0,'migration alone creates no storage write/action');
check(migration.run("(()=>{let a=evaluate();let expected=[...a].sort((a,b)=>Number(b.eligible)-Number(a.eligible)||(a.demand===true?0:a.demand===null?1:2)-(b.demand===true?0:b.demand===null?1:2)||b.stars-a.stars||Math.min(a.buildingConfirmed||9,a.activityConfirmed||9)-Math.min(b.buildingConfirmed||9,b.activityConfirmed||9)||b.passingSignalCount-a.passingSignalCount||b.supply.competitor-a.supply.competitor||a.supply.own-b.supply.own||a.sourceRank-b.sourceRank);return a.map(x=>x.id).join()===expected.map(x=>x.id).join()})()"),'legacy mode preserves previous comparator order');
migration.listeners.storage({key:migration.run('STORAGE_KEY'),newValue:JSON.stringify({criteria:old})});check(migration.run("Y.criteria.rankingMode==='legacy'&&criteriaErrors(Y.criteria).length===0"),'cross-tab old criteria normalize before use');
check(run("(()=>{let before=JSON.stringify({p:AREAS.map(a=>a.percentiles),c:CORE_IDS.map(id=>cutoff(id,95)),rank:evaluate().map(a=>[a.id,a.rankScore])});Y.province='10';return before===JSON.stringify({p:AREAS.map(a=>a.percentiles),c:CORE_IDS.map(id=>cutoff(id,95)),rank:evaluate().map(a=>[a.id,a.rankScore])})})()"),'province filter never recomputes national benchmark or weighted scores');
const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'../contracts/criteria.v1.4.json'),'utf8'));
check(run(`(()=>{let expected=${JSON.stringify(contract.ui_defaults)};return Object.entries(expected).every(([k,v])=>JSON.stringify(DEFAULT_CRITERIA[k])===JSON.stringify(v))})()`),'machine contract defaults match runtime');
console.log(JSON.stringify({suite:'ranking-v1.4',checks:assertions,passed:assertions,prototype:path.basename(prototype),evidence:'source/VM model, not rendered browser QA'}));
