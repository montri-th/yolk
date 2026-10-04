/* Exact LDS provenance and SVG paint-server checks, without changing model data. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),checks=[];
function check(name,task){try{task();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}}
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'prototype/yolk-tier-style.js'),'utf8'),context);
const tier=context.window.YolkTierStyle,css=fs.readFileSync(path.join(root,'prototype/yolk-tier-style.css'),'utf8');
const normativePath=path.join(root,'reference/lds-0.9.7/Landometer-Design-System-v0.9.7.md');
let normative='';if(fs.existsSync(normativePath))normative=fs.readFileSync(normativePath,'utf8');
else{const files=fs.readdirSync(path.dirname(normativePath),{recursive:true});const file=files.find(x=>x.endsWith('Landometer-Design-System-v0.9.7.md'));if(file)normative=fs.readFileSync(path.join(path.dirname(normativePath),file),'utf8');}
check('Pinned LDS base hash matches the tier appearance source',()=>assert.equal(crypto.createHash('sha256').update(normative).digest('hex'),tier.source.baseDocumentSha256));
check('Tier gradient uses every exact native area LUT sample 20–40 in order',()=>{
 const match=normative.match(/"scaleId"\s*:\s*"density\.area"\s*,\s*"kind"\s*:\s*"sequential"\s*,\s*"theme"\s*:\s*"light"[\s\S]*?"lut"\s*:\s*\[([^\]]+)\]/);
 assert(match,'Exact native density.area LUT not found in pinned LDS base');
 const lut=JSON.parse('['+match[1]+']');assert.deepEqual(Array.from(tier.stops),lut.slice(20,41));
});
check('Native Yolk yellow and egg-white are exact, theme-invariant tokens',()=>{assert.equal(tier.color(2),'#FFBC1F');assert.equal(tier.color(3),'#F1F4EF');assert(normative.includes('"yellow":"#FFBC1F"'));assert(normative.includes('"dark":"#F1F4EF"'));});
check('Tier1 solid fallback is the orange endpoint, with one explicit gradient ID',()=>{assert.equal(tier.color(1),'#D6600C');assert.equal(tier.paint(1),'url(#yl-yolk-tier-1-v173)');assert.equal(tier.paint(2),'#FFBC1F');assert.equal(tier.paint(3),'#F1F4EF');});
check('Unknown, zero and invalid tiers never become egg-white',()=>{for(const x of [0,null,undefined,4,-1,'1',NaN]){assert.equal(tier.definition(x),null);assert.equal(tier.paint(x),null);assert.equal(tier.css(x),null);assert.equal(tier.outline(x),null);}});
check('CSS gradient uses exact21 samples and stable positions without theme transformations',()=>{assert(css.includes(tier.css(1)));assert.equal(tier.css(1).match(/#[0-9A-F]{6}/g).length,21);assert(css.includes(':root[data-theme="dark"]'));assert(!/(opacity|color-mix|filter):/.test(css));});
check('Category recipe explicitly disclaims atmosphere and within-polygon magnitude',()=>{assert.equal(tier.source.kind,'categorical_screening_tier');assert.equal(tier.source.quantitativeScale,false);assert.equal(tier.source.atmosphereRecipe,false);assert.equal(tier.source.withinPolygonMagnitude,false);assert.equal(tier.source.selectedInterior,'transparent');});
check('Tier labels retain a non-color cue in Thai and English',()=>{for(const x of [1,2,3]){assert(tier.definition(x).labelTh.startsWith('Tier '+x));assert(tier.definition(x).labelEn.startsWith('Tier '+x));assert.equal(tier.outline(x),'#182327');}});
function element(name){return {name,children:[],attributes:{},ownerDocument:document,setAttribute(key,value){this.attributes[key]=value;},appendChild(node){this.children.push(node);},insertBefore(node){this.children.unshift(node);},querySelector(selector){const match=node=>selector.startsWith('#')?node.attributes.id===selector.slice(1):node.name===selector;const walk=node=>match(node)?node:node.children.map(walk).find(Boolean);return this.children.map(walk).find(Boolean)||null;}};}
const document={createElementNS(namespace,name){assert.equal(namespace,'http://www.w3.org/2000/svg');return element(name);}};
const svg=element('svg'),map={getPanes:()=>({overlayPane:{querySelector:selector=>selector==='svg'?svg:null}})};
check('SVG definition installs the native21 stops with full opacity',()=>{assert.equal(tier.ensureDefs(map),true);const server=svg.querySelector('#'+tier.gradientId);assert(server);assert.equal(server.attributes.gradientUnits,'objectBoundingBox');assert.equal(server.children.length,21);for(let i=0;i<21;i++){assert.equal(server.children[i].attributes.offset,i*5+'%');assert.equal(server.children[i].attributes['stop-color'],tier.stops[i]);assert.equal(server.children[i].attributes['stop-opacity'],'1');}});
check('Repeated map sync does not duplicate the SVG paint server',()=>{assert.equal(tier.ensureDefs(map),true);assert.equal(svg.children.length,1);assert.equal(svg.children[0].children.length,1);});
check('Before Leaflet mounts its SVG, gradient setup remains a safe no-op',()=>{assert.equal(tier.ensureDefs(null),false);assert.equal(tier.ensureDefs({getPanes:()=>({overlayPane:{querySelector:()=>null}})}),false);});
for(const item of checks)console.log((item.passed?'PASS ':'FAIL ')+item.name+(item.error?'\n'+item.error:''));
console.log(JSON.stringify({passed:checks.every(x=>x.passed),checks:checks.length}));
if(checks.some(x=>!x.passed))process.exitCode=1;
