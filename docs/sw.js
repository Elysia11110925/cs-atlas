const CACHE='cs-atlas-9d987aa9ad09';
const ASSETS=["./","./algorithms.js","./app.js","./beginner-base.js","./beginner-ui.js","./beginner.css","./content.js","./curriculum.js","./database.js","./expanded-algo-network.js","./expanded-foundations.js","./expanded-network-final.js","./expanded-special-topics.js","./expanded-sql-compiler.js","./expanded-stl-ds.js","./expanded-strings.js","./guides-ds-algo.js","./guides-net-advanced-stl.js","./guides-sql-compiler.js","./guides-stl-core.js","./index.html","./offline-client.js","./offline.html","./style.css","./systems.js","./walkthrough-traces.js","./worked-examples.js"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cs-atlas-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  if(event.request.mode==='navigate'){try{return await fetch(event.request);}catch{return await cache.match('./index.html');}}
  const stored=await cache.match(event.request);return stored||fetch(event.request);
 }));
});
