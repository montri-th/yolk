/* Bounded source/controller regression. No browser, layout or visual claim. */
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../prototype'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),css=fs.readFileSync(path.join(root,'identity.css'),'utf8'),theme=fs.readFileSync(path.join(root,'theme.js'),'utf8');
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name)}
function render(lang,route='market',unread=2,settings={}){
 const focus={count:0},elements=new Map();const $=key=>{if(!elements.has(key))elements.set(key,{querySelector:s=>s==='[data-header-settings]'?{open:!!settings.open}:{focus:()=>focus.count++}});return elements.get(key)};
 const context={document:{documentElement:{},title:'',activeElement:{matches:()=>!!settings.languageFocused}},$,
   Y:{lang,route,pois:[],actor:'m'},window:{YolkIcons:{icon:n=>`<span data-yolk-glyph="${n}"></span>`}},
   tr:(a,b)=>lang==='th'?a:b,YolkTheme:{renderControl:()=>'<select data-yolk-theme></select>'},
   PEOPLE:[{id:'m',role:'admin'}],person:()=>lang==='th'?'มณี':'Manee',unreadCount:()=>unread};
 const defs=['const uiIcon=','const navIcon=','const navItems=','const tabTitle='].map(p=>app.split('\n').find(l=>l.startsWith(p))).join('\n');
 const start=app.indexOf('function header()'),end=app.indexOf('\nfunction ',start+1);
 vm.runInNewContext(defs+'\n'+app.slice(start,end)+'\nheader()',context);
 return{header:$('#header').innerHTML,sidebar:$('#sidebar').innerHTML,bottom:$('#mobile-nav').innerHTML,focus};
}
for(const lang of ['th','en'])check(`${lang} shell keeps controls discoverable inside a native disclosure`,()=>{
 const {header,sidebar,bottom}=render(lang);
 const start=header.indexOf('<details'),end=header.indexOf('</details>'),menu=header.slice(start,end);
 assert(start>0);assert(!header.slice(start,start+100).includes(' open'));
 assert(header.includes('class="compact-brand"'));assert(header.includes('aria-label="CityMETER: Yolk'));
 for(const control of ['data-yolk-theme','data-action="language"','id="actor-select"','href="#team"','header-identity'])assert(menu.includes(control),control);
 assert(!header.slice(0,start).includes('data-yolk-theme'));
 assert(header.slice(0,start).includes('data-action="inbox"'));
 assert(header.includes('Notifications')||header.includes('แจ้งเตือน'));
 assert(menu.includes('data-yolk-glyph="menu"'));assert(menu.includes('English')||menu.includes('ไทย'));
 assert(sidebar.includes('sidebar-identity'));
 assert.equal((bottom.match(/<a /g)||[]).length,5);
 assert.equal((bottom.match(/aria-current="page"/g)||[]).length,1);
 assert(!bottom.includes('ภาพรวมประเทศ'));assert(bottom.includes(lang==='th'?'ไข่แดง':'Yolk'));
});
check('same-page user/criteria renders preserve the open settings disclosure',()=>{
 const x=render('th','criteria',2,{open:true});assert(x.header.includes('data-header-settings open>'));
});
check('language rerender keeps its menu and restores focus to the replacement control',()=>{
 const x=render('en','criteria',2,{open:true,languageFocused:true});assert(x.header.includes('data-header-settings open>'));assert.equal(x.focus.count,1);
});
check('all five mobile destinations show their current state',()=>{
 for(const route of ['market','targets','supply','criteria','feed'])assert(render('th',route).bottom.includes(`href="#${route}" aria-current="page"`));
});
check('header remains one row and menu bounds avoid horizontal overflow by construction',()=>{
 const block=css.match(/^#header \{([\s\S]*?)\}/m)[1];
 assert(block.includes('flex-wrap: nowrap'));assert(block.includes('align-items: center'));assert(block.includes('min-height: 76px'));
 assert(css.includes('width: min(328px, calc(100vw - 32px))'));
 assert(css.includes('max-height: calc(100dvh - 176px)'));
 assert(css.includes('overflow-y: auto'));
 assert(css.includes('min-width: 48px'));assert(css.includes('min-height: 48px'));
 assert(css.includes('min-height: 52px'));
 assert(!css.includes('var(--ldm-brand-beige)'));
});
function controller(){
 const handlers={},winHandlers={},focus={count:0},menu={open:true,contains:t=>t==='inside',querySelector:()=>({focus:()=>focus.count++})};
 const doc={documentElement:{dataset:{},style:{}},querySelector:s=>menu.open&&s==='[data-header-settings][open]'?menu:null,querySelectorAll:()=>[],addEventListener:(n,f)=>handlers[n]=f};
 const w={document:doc,localStorage:{getItem:()=>null,setItem(){}},addEventListener:(n,f)=>winHandlers[n]=f};
 vm.runInNewContext(theme,{window:w});return{handlers,winHandlers,menu,focus};
}
check('outside pointer closes the disclosure without stealing focus',()=>{const x=controller();x.handlers.pointerdown({target:'outside'});assert(!x.menu.open);assert.equal(x.focus.count,0)});
check('inside pointer preserves controls in the open disclosure',()=>{const x=controller();x.handlers.pointerdown({target:'inside'});assert(x.menu.open)});
check('Escape closes and returns focus to the native summary',()=>{const x=controller();x.handlers.keydown({key:'Escape'});assert(!x.menu.open);assert.equal(x.focus.count,1)});
check('other keys do not collapse the disclosure',()=>{const x=controller();x.handlers.keydown({key:'Tab'});assert(x.menu.open)});
check('navigation closes the disclosure',()=>{const x=controller();x.winHandlers.hashchange();assert(!x.menu.open)});
console.log(`${checks} shell source/controller checks passed; device layout and contrast inspection remain open.`);
