/* Synthetic illustrative geometry. No CityMETER customer polygons or branch coordinates.
 * These generic scene anchors are only used when area.synthetic === true.
 * Generated shapes do not represent administrative or service boundaries.
 */
(function(global){
  'use strict';
  const anchors={
    central:[13.731,100.521],east:[13.354,100.997],north:[18.782,98.994],
    northeast:[14.979,102.098],west:[16.477,99.517],south:[7.010,100.475]
  };
  const text=(lang,th,en)=>lang==='en'?en:th;
  function scene(area,records,lang){
    if(!area || area.synthetic!==true)return null;
    const code=Number(area.province)||10;
    const region=code>=80?'south':code>=50&&code<=58?'north':code>=60?'west':code>=30&&code<=49?'northeast':code>=20&&code<=27?'east':'central';
    const base=anchors[region];
    const seed=String(area.id||'demo').split('').reduce((s,c)=>s+c.charCodeAt(0),0);
    const lat=base[0]+(seed%7-3)*.004, lng=base[1]+(seed%5-2)*.005;
    const dx=.026,dy=.020;
    const offsets=[[-.94,-.34],[-.58,-.95],[.37,-.82],[.93,-.18],[.72,.72],[-.16,.98],[-.88,.56],[-.94,-.34]];
    const boundary={type:'Feature',properties:{synthetic:true,area_id:area.id,source:'illustrative_demo'},geometry:{type:'Polygon',coordinates:[offsets.map(([x,y])=>[lng+x*dx,lat+y*dy])]}};
    const supply=Array.isArray(records)?records.filter(r=>String(r.area)===String(area.id)&&!r.archived&&r.status!=='closed').slice(0,16):[];
    const points=supply.map((r,i)=>{
      const angle=(i*2.399)+(seed%4),radius=.004+(i%4)*.003;
      return {id:r.id,name:lang==='en'?'Demo station '+(i+1):(r.name||'สาขาจำลอง '+(i+1)),lat:lat+Math.sin(angle)*radius,lng:lng+Math.cos(angle)*radius*1.2,
        category:r.relation==='own'?'own':r.relation==='competitor'?'competitor':'unverified',brand:r.brand||'',synthetic:true,recordId:r.id};
    });
    const context=[
      {id:'factory',category:'factory',th:'โรงงานตัวอย่าง',en:'Example factory',x:.47,y:.47},
      {id:'hotel',category:'hotel',th:'โรงแรมตัวอย่าง',en:'Example hotel',x:-.48,y:.50},
      {id:'hospital',category:'hospital',th:'โรงพยาบาลตัวอย่าง',en:'Example hospital',x:.47,y:-.45},
      {id:'school',category:'school',th:'โรงเรียนตัวอย่าง',en:'Example school',x:-.41,y:-.54}
    ];
    context.forEach(r=>points.push({id:area.id+'-'+r.id,name:text(lang,r.th,r.en),category:r.category,lat:lat+r.y*dy,lng:lng+r.x*dx,synthetic:true}));
    return {boundary,boundaryStatus:'synthetic',sourceLabel:text(lang,'ฉากจำลองเพื่อทดลองแผนที่','Illustrative map scene'),pois:points,center:[lat,lng],synthetic:true};
  }
  global.YolkDemoMapContext={scene};
})(window);
