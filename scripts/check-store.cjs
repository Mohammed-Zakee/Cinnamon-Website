const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function boot(stored={}){
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',value:'',hidden:false,dataset:{},listeners:{},classList:{add(){},remove(){},toggle(){}},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(){},showModal(){this.open=true},close(){this.open=false},scrollIntoView(){},getBoundingClientRect(){return {left:0,right:500,top:0,bottom:500}}});return elements.get(id)};
 const ctx={console,Intl,Map,Object,Number,String,JSON,encodeURIComponent,setTimeout:()=>0,clearTimeout(){},location:{hash:''},MutationObserver:class{observe(){}},navigator:{clipboard:{writeText:async()=>{}}},FormData:class{constructor(form){this.data=form.data}get(k){return this.data[k]}},localStorage:{getItem:k=>stored[k]??null,setItem:(k,v)=>stored[k]=v},document:{documentElement:{},body:{style:{}},querySelector:element,querySelectorAll:()=>[]}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../frontend/app.js','utf8'),ctx);return {ctx,element,run:s=>vm.runInContext(s,ctx),stored};
}
const a=boot();
assert.match(a.element('#products').innerHTML,/Cinnamon sticks/);
assert.equal(a.element('#orderForm').hidden,true,'empty bag must hide enquiry form');
for(const lang of ['en','si','ta','de']){
 a.element('#language').listeners.change({target:{value:lang}});
 assert.equal(a.ctx.document.documentElement.lang,lang);
 assert.ok(!a.element('#products').innerHTML.includes('undefined'));
 assert.equal(a.run('Object.keys(translations.en).filter(k=>!translations[lang][k]).length'),0,'all copy must be translated');
}
a.element('#language').listeners.change({target:{value:'en'}});
for(const currency of ['LKR','EUR','USD','PLN']){a.element('#currency').listeners.change({target:{value:currency}});assert.ok(!a.element('#products').innerHTML.includes('NaN'))}
// Preserve the seller's exact base prices, then check displayed line-item arithmetic.
a.element('#currency').listeners.change({target:{value:'EUR'}});
assert.equal(a.run("unitMinor(catalog.find(p=>p.id==='sticks'))"),890);
assert.equal(a.run("unitMinor(catalog.find(p=>p.id==='powder'))"),790);
assert.equal(a.run("unitMinor(catalog.find(p=>p.id==='oil100'))"),1390);
a.element('#currency').listeners.change({target:{value:'LKR'}});
assert.equal(a.run("unitMinor(catalog.find(p=>p.id==='oil10'))"),139000);
assert.equal(a.run("catalog.find(p=>p.id==='powder').unit"),'100 g');
for(const code of ['EUR','LKR','USD','PLN']){
 a.element('#currency').listeners.change({target:{value:code}});
 assert.equal(a.run("(()=>{bag={sticks:3,powder:2,oil10:1,oil100:1};return bagTotal()===catalog.reduce((s,p)=>s+unitMinor(p)*bag[p.id],0)})()"),true);
}
a.run('bag={}');
a.element('#currency').listeners.change({target:{value:'EUR'}});
a.element('#products').listeners.click({target:{closest:()=>({dataset:{add:'sticks'}})}});
a.element('#products').listeners.click({target:{closest:()=>({dataset:{add:'powder'}})}});
assert.equal(a.element('#count').textContent,2);
assert.equal(a.element('#orderForm').hidden,false);
assert.match(a.element('#cartItems').innerHTML,/Excludes shipping and taxes/);
assert.equal(boot(a.stored).element('#count').textContent,2,'cart should persist across reloads');
a.element('#orderForm').data={name:'Test Buyer',email:'buyer@example.com',country:'Germany',notes:'Please confirm delivery'};
a.element('#orderForm').listeners.submit({preventDefault(){},target:a.element('#orderForm')});
assert.equal(a.element('#orderResult').hidden,false);
assert.match(a.element('#emailOrder').href,/^mailto:mohammedzakee2006@gmail.com\?subject=/);
const message=decodeURIComponent(a.element('#emailOrder').href.split('&body=')[1]);
assert.match(message,/Test Buyer/);assert.match(message,/1 × Cinnamon sticks/);assert.match(message,/1 × Cinnamon powder/);assert.match(message,/Please confirm delivery/);
assert.equal(boot({'cz_bag':'{"sticks":-2,"oil10":100000,"evil":1}'}).element('#count').textContent,0,'invalid quantities must not be loaded');
assert.equal(boot({'cz_bag':'invalid json','cz_language':'"xx"'}).ctx.document.documentElement.lang,'en');
const html=fs.readFileSync(__dirname+'/../frontend/index.html','utf8');
assert.ok(!html.includes('translate.google'));
for(const file of ['app.js','style.css','assets/hero.png','assets/mark.svg',...['sticks','powder','oil-10','oil-100'].map(s=>'assets/'+s+'.jpeg')])assert.ok(fs.existsSync(__dirname+'/../frontend/'+file),file+' must exist');
console.log('Passed: four languages, four currencies, cart persistence, invalid storage, seller prices and item totals, email enquiry, local assets.');
