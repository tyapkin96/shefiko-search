/* ШЕФиКО: умный поиск для всех окон поиска Tilda (мобильный виджет и большое окно).
   Подменяет ответ сервера поиска Tilda нашими результатами. Если данные не загружены, работает штатный поиск.
   Откат: удалить блок. */
(function(){
 var X=XMLHttpRequest.prototype,o=X.open,s=X.send;
 X.open=function(m,u){this._sf=(typeof u==='string'&&u.indexOf('search.tildacdn.com/search/')>-1)?u:null;return o.apply(this,arguments);};
 X.send=function(){
  var u=this._sf,x=this;
  if(u&&window.sfSearch){
   var q=/[?&]q=([^&]*)/.exec(u);q=q?decodeURIComponent(q[1]):'';
   var r=window.sfSearch(q);
   if(r){
    var pg=+((/[?&]page=(\d+)/.exec(u)||[])[1])||1,num=+((/[?&]num=(\d+)/.exec(u)||[])[1])||10;
    var pages=r.slice((pg-1)*num,pg*num).map(function(p){
     return {id:p.u,pageurl:'/catalog/tproduct/'+p.u+'-'+(p.slug||'item'),title:p.t,highlight:p.t,
      product:{title:p.t,img:p.ph?'https://static.tildacdn.com/'+p.ph:'',price:p.pr===''||p.pr==null?'':String(p.pr),currency:'р.',currency_dec:'',currency_side:'r'}};
    });
    var body=JSON.stringify(r.length?{total:r.length,pagin:Math.ceil(r.length/num),pages:pages}:{total:0});
    try{Object.defineProperty(x,'response',{value:body,configurable:true});Object.defineProperty(x,'status',{value:200,configurable:true});}catch(e){return s.apply(this,arguments);}
    setTimeout(function(){try{if(x.onprogress)x.onprogress({});if(x.onload)x.onload({});}catch(e){}},20);
    return;
   }
  }
  return s.apply(this,arguments);
 };
})();
