(()=>{
 if(!('serviceWorker' in navigator)||!['https:','http:'].includes(location.protocol))return;
 let ready=false;
 function status(){const el=document.getElementById('offline-status');if(el)el.textContent=ready?'离线缓存已就绪 · 可断网使用':'正在准备离线缓存…';}
 new MutationObserver(status).observe(document.getElementById('app'),{childList:true});
 navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{ready=true;status();}).catch(()=>{const el=document.getElementById('offline-status');if(el)el.textContent='缓存未完成，可下载离线网页使用';});
})();