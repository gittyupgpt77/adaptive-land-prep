const CACHE='land-prep-v70';
const ASSETS=['./','./index.html','./styles.css?v=70','./app.js?v=70','./training-tools.js?v=70','./manifest.webmanifest','./vendor/supabase.js','./cloud-core.js?v=70','./autosave-core.js','./cloud.js?v=70','./vendor/firebase.js','./firestore-backup.js'];
const scope=new URL(self.registration.scope);
const shell=new Set(ASSETS.map(path=>new URL(path,scope).href));
const exerciseImages='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(ASSETS);
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('land-prep-v')&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||request.headers.has('authorization'))return;
 // Never cache authentication, athlete data, or unrelated applications on this origin.
 if(!shell.has(request.url)&&!request.url.startsWith(exerciseImages))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request);
   if(response.ok){
    try{await cache.put(request,response.clone())}catch(error){/* A full cache must not block a live response. */}
    return response;
   }
   return await cache.match(request)||response;
  }catch(error){
   const cached=await cache.match(request);
   if(cached)return cached;
   throw error;
  }
 })());
});
