const CACHE='vancheck-v1.6';
const ASSETS=['./','./index.html','./style.css','./app.js','./inventory.js','./sync.js','./jax-sync-bridge.js','./manifest.webmanifest','./icon.svg'];
const FRESH_PATHS=new Set(['/sync.js','/jax-sync-bridge.js']);

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>clients.claim())));

async function networkFirst(request){
 const cache=await caches.open(CACHE);
 try{
  const response=await fetch(request,{cache:'no-store'});
  if(response.ok)await cache.put(request,response.clone());
  return response;
 }catch(error){
  return (await cache.match(request))||Response.error();
 }
}

self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 const path=url.pathname.replace(/^\/vancheck(?=\/|$)/,'')||'/';
 if(e.request.method==='GET'&&url.origin===self.location.origin&&FRESH_PATHS.has(path)){
  e.respondWith(networkFirst(e.request));
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});

self.addEventListener('push',e=>{let d={title:'VanCheck',body:'Equipment reminder'};try{d={...d,...e.data.json()}}catch{}e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'./icon.svg',badge:'./icon.svg'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('./'))});
