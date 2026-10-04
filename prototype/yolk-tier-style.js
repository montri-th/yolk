/* Owner-requested fried-egg tier appearances, 2026-10-04.
   Categorical screening tiers: this is not an LDS atmosphere gradient or a new
   quantitative scale. Raw metric ramps and tier calculations stay unchanged.
   Tier 1 reuses exact density.area LIGHT LUT samples 20–40 from LDS 0.9.7.
   All paints are identical in both themes; a gradient within a Tier 1 polygon
   carries no spatial magnitude. Selected fine-area interiors remain unfilled. */
(function(global){
 'use strict';
 const gradientId='yl-yolk-tier-1-v173';
 const source=Object.freeze({
  id:'yolk.owner-fried-egg-tiers.v1.7.3',kind:'categorical_screening_tier',
  authority:'owner-request:2026-10-04:fried-egg-tier-appearance',
  dsVersion:'0.9.7',releaseRef:'v0.9.7-owner.1',
  baseDocumentSha256:'d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96',
  gradientSource:'density.area/light/lut[20:41]',
  yellowSource:'energy.yellow',eggWhiteSource:'foundation.text.primary.dark',
  themePolicy:'identical-paints-on-both-themes',
  quantitativeScale:false,atmosphereRecipe:false,withinPolygonMagnitude:false,
  selectedInterior:'transparent',solidFallback:'#D6600C'
 });
 const stops=Object.freeze([
  '#E6AB30','#E5A72E','#E5A42D','#E4A02B','#E49D2A','#E39928','#E29526',
  '#E29225','#E18E23','#E08A21','#DF8720','#DF831E','#DE7F1C','#DD7B1A',
  '#DC7818','#DB7417','#DA7015','#D96C13','#D86811','#D7640E','#D6600C'
 ]);
 const gradient='linear-gradient(135deg, '+stops.map((hex,i)=>hex+' '+(i*5)+'%').join(', ')+')';
 const definitions=Object.freeze({
  1:Object.freeze({tier:1,color:'#D6600C',css:gradient,paint:'url(#'+gradientId+')',labelTh:'Tier 1 · ไข่แดงเข้ม',labelEn:'Tier 1 · Strongest Yolk',source:source.gradientSource}),
  2:Object.freeze({tier:2,color:'#FFBC1F',css:'#FFBC1F',paint:'#FFBC1F',labelTh:'Tier 2 · ไข่แดง',labelEn:'Tier 2 · Yolk',source:source.yellowSource}),
  3:Object.freeze({tier:3,color:'#F1F4EF',css:'#F1F4EF',paint:'#F1F4EF',labelTh:'Tier 3 · ไข่ขาว',labelEn:'Tier 3 · Egg-white',source:source.eggWhiteSource})
 });
 const definition=tier=>Number.isInteger(tier)&&Object.hasOwn(definitions,tier)?definitions[tier]:null;
 const color=tier=>definition(tier)?.color??null;
 const css=tier=>definition(tier)?.css??null;
 const paint=tier=>definition(tier)?.paint??null;
 // Neutral ink keeps the light egg-white distinguishable from a neutral canvas.
 // Hover, selected and keyboard focus continue to use the shared map tokens.
 const outline=tier=>definition(tier)?'#182327':null;
 const svgNamespace='http://www.w3.org/2000/svg';
 function ensureDefs(map){
  const pane=map?.getPanes?.()?.overlayPane;
  const svg=pane?.querySelector?.('svg');
  if(!svg)return false; // Leaflet may not have mounted its SVG renderer yet.
  if(svg.querySelector?.('#'+gradientId))return true;
  const document=svg.ownerDocument||global.document;
  if(!document?.createElementNS)return false;
  let defs=svg.querySelector?.('defs');
  if(!defs){defs=document.createElementNS(svgNamespace,'defs');svg.insertBefore(defs,svg.firstChild||null);}
  const server=document.createElementNS(svgNamespace,'linearGradient');
  for(const [key,value] of Object.entries({id:gradientId,gradientUnits:'objectBoundingBox',x1:'0%',y1:'0%',x2:'100%',y2:'100%'}))server.setAttribute(key,value);
  for(let i=0;i<stops.length;i++){
   const stop=document.createElementNS(svgNamespace,'stop');
   stop.setAttribute('offset',(i*5)+'%');stop.setAttribute('stop-color',stops[i]);
   stop.setAttribute('stop-opacity','1');server.appendChild(stop);
  }
  defs.appendChild(server);return true;
 }
 global.YolkTierStyle=Object.freeze({source,stops,definitions,gradientId,definition,color,css,paint,outline,ensureDefs});
})(window);
