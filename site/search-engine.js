(function(){
if(window.__sfSS)return;window.__sfSS=1;
try{
/* ===== Настройки ===== */
var SHOW=10, MAXALL=60, MINLEN=2;
/* Синонимы: слова в одной строке считаются равнозначными. Можно дописывать свои строки. */
var SYN=[
 'картошка картофель','помидор томат','курица куриный цыпленок бройлер','говядина говяжий',
 'свинина свиной','баранина бараний','индейка индюшка индюшиный','лосось семга сёмга',
 'креветка шримс','майонез майо','кетчуп кечап','фри frites fries','рис рисовый',
 'хайнц heinz','барилла barilla','хохланд hochland','печагин pechagin','тамаки tamaki',
 'чекко cecco','кюне kuhne','монари monari','пуратос puratos','калебо каллебаут callebaut',
 'бонфесто bonfesto','эрой aroy','бабл bubble','гауда gouda','пармезан parmesan',
 'моцарелла mozzarella','маскарпоне mascarpone','капучино кофе','чай tea'
];
var EN='qwertyuiop[]asdfghjkl;\'zxcvbnm,.`',RU='йцукенгшщзхъфывапролджэячсмитьбюё';
var ENDS=['ыми','ими','ого','его','ому','ему','ами','ями','ов','ев','ей','ий','ый','ой','ая','яя','ое','ее','ые','ие','ых','их','ом','ем','ам','ям','ах','ях','ую','юю','а','я','о','е','ы','и','у','ю','ь','й'];
function norm(s){return String(s).toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim();}
function stem(w){
 if(/^[a-z0-9]+$/.test(w)||w.length<=3)return w;
 for(var i=0;i<ENDS.length;i++){var e=ENDS[i];if(w.length-e.length>=3&&w.slice(-e.length)===e)return w.slice(0,-e.length);}
 return w;
}
function toks(s){var a=norm(s).split(' '),r=[];for(var i=0;i<a.length;i++){if(a[i]&&(a[i].length>1||/\d/.test(a[i])))r.push(stem(a[i]));}return r;}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function dist(a,b){ /* Дамерау–Левенштейн */
 var al=a.length,bl=b.length,d=[],i,j;
 for(i=0;i<=al;i++){d[i]=[i];}for(j=0;j<=bl;j++)d[0][j]=j;
 for(i=1;i<=al;i++)for(j=1;j<=bl;j++){
  var c=a[i-1]===b[j-1]?0:1;
  d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
  if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
 }
 return d[al][bl];
}
function translit(s){
 var m={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
 return s.toLowerCase().replace(/[а-яё]/g,function(c){return m[c]||'';}).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50);
}
function swapLayout(s,from,to){var r='';s=s.toLowerCase();for(var i=0;i<s.length;i++){var k=from.indexOf(s[i]);r+=k>=0?to[k]:s[i];}return r;}

/* ===== Индекс ===== */
var P=null,SYNMAP=null,READY=null;
var INDEX_URL='https://tyapkin96.github.io/shefiko-search/index.json';
function loadRemote(){
 return new Promise(function(res,rej){
  if(typeof fetch==='undefined'){rej(new Error('no fetch'));return;}
  var done=false,t=setTimeout(function(){if(!done){done=true;rej(new Error('timeout'));}},7000);
  fetch(INDEX_URL+'?t='+Math.floor(Date.now()/3600000),{cache:'default'}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();}).then(function(j){
   if(done)return;done=true;clearTimeout(t);
   if(!j||!j.p||j.p.length<100)throw new Error('bad index');res(j);
  }).catch(function(e){if(!done){done=true;clearTimeout(t);rej(e);}});
 });
}
function loadEmbedded(){
 return new Promise(function(res,rej){
  function go(){
   var els=[].slice.call(document.querySelectorAll('script[data-sf-part]'));
   if(!els.length||els.length!==+els[0].getAttribute('data-n')||typeof DecompressionStream==='undefined'){rej(new Error('no data'));return;}
   els.sort(function(a,b){return a.getAttribute('data-sf-part')-b.getAttribute('data-sf-part');});
   var bin=atob(els.map(function(e){return e.textContent.replace(/\s+/g,'');}).join('')),u=new Uint8Array(bin.length);
   for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
   new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text().then(function(t){res(JSON.parse(t));},rej);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
 });
}
function loadData(){
 if(READY)return READY;
 READY=loadRemote().catch(function(){return loadEmbedded();}).then(function(j){build(j);});
 return READY;
}
function build(j){
 var cw=j.c.map(function(c){return toks(c);});
 P=j.p.map(function(r){
  var tt=toks(r[1]);
  return {u:r[0],t:r[1],pr:r[2],ph:r[3],w:tt,cw:cw[r[4]]||[],nt:norm(r[1]),slug:translit(r[1])};
 });
 SYNMAP={};
 SYN.forEach(function(line){
  var g=toks(line);
  g.forEach(function(a){SYNMAP[a]=(SYNMAP[a]||[]).concat(g.filter(function(b){return b!==a;}));});
 });
}
function match(q,w){ /* 10 точное, 7 начало слова, 0 нет */
 if(q===w)return 10;
 if(/^\d+$/.test(q))return 0;
 if(q.length>=2&&w.length>q.length&&w.indexOf(q)===0)return 7;
 return 0;
}
function titleScore(q,p,mode){
 var best=0,pos=0;
 for(var i=0;i<p.w.length;i++){
  var w=p.w[i],s=0;
  if(mode==='fuzzy'){
   if(q.length>=4&&!/^\d+$/.test(q)){
    var lim=q.length>=8?2:1;
    var d=Math.min(dist(q,w),w.length>q.length?dist(q,w.slice(0,q.length)):99);
    if(d<=lim)s=4-d*0.5;
   }
  } else s=match(q,w);
  if(s>best){best=s;pos=i;}
 }
 if(best>0)best+= pos===0?3:(pos===1?1.2:0);
 return best;
}
function catHit(q,p){for(var i=0;i<p.cw.length;i++){if(match(q,p.cw[i])>0)return true;}return false;}
function run(qs){
 var T=toks(qs);if(!T.length)return [];
 var n=P.length,tot=new Array(n).fill(0),ok=new Array(n).fill(true),th=new Array(n).fill(0),i,k;
 T.forEach(function(q){
  var sc=new Array(n).fill(0),any=false,syn=SYNMAP[q]||[];
  for(i=0;i<n;i++){
   var s=titleScore(q,P[i],'pre');
   for(k=0;k<syn.length;k++){var s2=titleScore(syn[k],P[i],'pre')*0.85;if(s2>s)s=s2;}
   sc[i]=s;if(s>0)any=true;
  }
  if(!any){for(i=0;i<n;i++){sc[i]=titleScore(q,P[i],'fuzzy');}}
  for(i=0;i<n;i++){
   if(!ok[i])continue;
   if(sc[i]>0){tot[i]+=sc[i]+(catHit(q,P[i])?2.5:0);th[i]++;}
   else if(catHit(q,P[i])){tot[i]+=2;}
   else ok[i]=false;
  }
 });
 var nq=norm(qs),res=[];
 for(i=0;i<n;i++){
  if(!ok[i])continue;
  var s=tot[i],nt=P[i].nt;
  if(nt.indexOf(nq)===0)s+=4;else if((' '+nt).indexOf(' '+nq)>=0)s+=2;
  res.push({p:P[i],s:s,th:th[i],len:P[i].t.length});
 }
 var withTitle=res.filter(function(r){return r.th>0;});
 if(withTitle.length>=5)res=withTitle;
 res.sort(function(a,b){return b.s-a.s||a.len-b.len;});
 return res;
}
function search(q){
 var r=run(q),note='';
 if(!r.length){
  var alt=/[a-z]/i.test(q)&&!/[а-я]/i.test(q)?swapLayout(q,EN,RU):(/[а-я]/i.test(q)&&!/[a-z]/i.test(q)?swapLayout(q,RU,EN):'');
  if(alt&&alt!==q.toLowerCase()){var r2=run(alt);if(r2.length){r=r2;note=alt;}}
 }
 return {r:r,note:note};
}

/* ===== Интерфейс (разметка как у штатного списка Tilda, поэтому подхватывает ваш дизайн) ===== */
function price(v){if(v===''||v==null)return '';var n=Number(v);return isFinite(n)&&n>0?(String(n)+' р.'):'';}
function item(p){
 var img=p.ph?"background-image:url('https://static.tildacdn.com/"+p.ph+"')":'';
 var pr=price(p.pr);
 return '<div class="t-site-search-dm__result"><a class="t-site-search-dm__result__product" href="/catalog/tproduct/'+esc(p.u)+'-'+esc(p.slug||'item')+'">'+
  '<div class="t-site-search-dm__thubmnail"><div class="t-site-search-dm__result__product_img" style="'+img+'"></div></div>'+
  '<div class="t-site-search-dm__result__product_text"><div class="t-site-search-dm__result__product_title t-name t-name_xs">'+esc(p.t)+'</div>'+
  (pr?'<div class="t-site-search-dm__result__product_price t-descr t-descr_xs">'+pr+'</div>':'')+'</div></a></div>';
}
window.sfSearch=function(q){if(!P)return null;try{return search(q).r.map(function(x){return x.p;});}catch(e){return null;}};
function bind(inp){
 if(inp.getAttribute('data-sf'))return;inp.setAttribute('data-sf','1');
 var host=inp.closest('.t838__blockinput')||inp.parentNode;
 var dm=document.createElement('div');dm.className='sf-dm';
 dm.style.cssText='display:none;position:absolute;top:100%;left:-1px;box-sizing:border-box;z-index:9999;max-height:min(72vh,600px);overflow-y:auto;font-family:inherit;';
 host.appendChild(dm);
 var all=false,last='';
 function hide(){dm.style.display='none';}
 function render(){
  var q=inp.value.trim();
  if(q.length<MINLEN){hide();last='';return;}
  if(!P)return;
  if(q!==last){all=false;last=q;}
  var w=host.offsetWidth;if(w){dm.style.setProperty('width',w+'px','important');dm.style.setProperty('left','-1px','important');}
  var s=search(q),r=s.r,html='';
  if(!r.length){html='<div class="t-site-search-dm__result"><div class="t-site-search-dm__result__product_text" style="padding:16px"><div class="t-site-search-dm__result__product_title t-name t-name_xs">Ничего не найдено</div><div class="t-site-search-dm__result__product_descr t-descr t-descr_xs" style="display:block !important">Проверьте написание или попробуйте другое слово</div></div></div>';}
  else{
   if(s.note)html+='<div class="sf-allresultslink t-descr" style="padding:8px 16px 0;font-size:13px">Показаны результаты для «'+esc(s.note)+'»</div>';
   var lim=all?MAXALL:SHOW;
   html+=r.slice(0,lim).map(function(x){return item(x.p);}).join('');
   if(r.length>lim)html+='<a class="sf-allresultslink t-descr" href="#" data-sf-all="1" style="display:block;padding:12px 16px">Показать все результаты ('+r.length+')</a>';
  }
  dm.innerHTML=html;dm.style.display='block';
  if(!dm.offsetHeight){document.documentElement.classList.remove('sf-smart');}else{document.documentElement.classList.add('sf-smart');}
 }
 inp.addEventListener('input',render);
 inp.addEventListener('focus',function(){if(inp.value.trim().length>=MINLEN)render();});
 inp.addEventListener('keyup',function(e){if(e.key!=='Enter'&&e.key!=='Escape')render();});
 inp._sfExpand=function(){if(inp.value.trim().length>=MINLEN){all=true;render();}};
 inp.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
 dm.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('[data-sf-all]');
  if(a){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();all=true;render();}
 });
 document.addEventListener('click',function(e){
  if(e.target.closest&&e.target.closest('.t-site-search-close')){setTimeout(function(){render();},30);return;}
  if(!host.contains(e.target))hide();
 });
 return true;
}
var started=false;
function partsReady(){var e=document.querySelectorAll('script[data-sf-part]');return e.length>0&&e.length===+e[0].getAttribute('data-n');}
function init(){
 var ins=document.querySelectorAll('.t838__input');
 if(!ins.length)return false;
 if(started)return true;started=true;
 loadData().then(function(){
  for(var i=0;i<ins.length;i++)bind(ins[i]);
  document.documentElement.classList.add('sf-smart');
 },function(){});
 return true;
}
['keydown','keypress','keyup'].forEach(function(t){
 window.addEventListener(t,function(e){
  var el=e.target;
  if(el&&el._sfExpand&&(e.key==='Enter'||e.keyCode===13)){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(t==='keydown')el._sfExpand();}
 },true);
});
var tries=0,iv=setInterval(function(){tries++;if(init()||tries>50)clearInterval(iv);},300);
init();
}catch(e){try{console.warn('sf-search',e);}catch(_){}}
})();
