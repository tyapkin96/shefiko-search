/* ШЕФиКО: поиск, дополнение для телефонов.
   Убирает нативное полноэкранное окно Tilda и вместо него раскрывает наш список. Откат: удалить блок. */
(function(){
 var de=document.documentElement;
 function kill(){
  var pp=document.querySelectorAll('.t-site-search-popup__background');
  if(!pp.length||!de.classList.contains('sf-smart'))return;
  for(var i=0;i<pp.length;i++)pp[i].remove();
  document.body.classList.remove('body-fix');
  try{var u=new URL(location.href);if(u.searchParams.has('search')){['search','slice','searchtarget'].forEach(function(k){u.searchParams.delete(k);});history.replaceState(null,'',u.pathname+u.search+u.hash);}}catch(e){}
  var ins=document.querySelectorAll('.t838__input'),t=null;
  for(var j=0;j<ins.length;j++){if(ins[j]._sfExpand&&ins[j].value.trim().length>=2){t=ins[j];break;}}
  if(t){t._sfExpand();try{t.blur();}catch(e){}}
 }
 try{new MutationObserver(kill).observe(de,{childList:true,subtree:true});}catch(e){}
 kill();
})();
