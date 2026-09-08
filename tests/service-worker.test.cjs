const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../service-worker.js'),'utf8');
const assetVersion=source.match(/app\.js\?v=(\d+)/)[1];
const currentCache=source.match(/const CACHE='([^']+)'/)[1];
function harness(){
 const handlers={},removed=[],writes=[];
 const cache={addAll:async()=>{},match:async()=>({offline:true}),put:async(req,res)=>writes.push(req.url)};
 const context={URL,Set,Promise,self:{registration:{scope:'https://example.com/adaptive-land-prep/'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>cache,keys:async()=>['other-app-v1','land-prep-v47',currentCache],delete:async k=>removed.push(k)},fetch:async()=>({ok:true,clone:()=>({})})};
 vm.runInNewContext(source,context);
 return {handlers,removed,writes,request:async(url,authorized=false)=>{let response;handlers.fetch({request:{url,method:'GET',headers:{has:()=>authorized}},respondWith:p=>response=p});return response&&await response;}};
}
test('upgrade removes only this application’s obsolete caches',async()=>{const h=harness();let done;h.handlers.activate({waitUntil:p=>done=p});await done;assert.deepEqual(h.removed,['land-prep-v47']);});
test('private API and authenticated responses never enter offline cache',async()=>{const h=harness();assert.equal(await h.request('https://example.supabase.co/rest/v1/athlete'),undefined);assert.equal(await h.request('https://example.com/adaptive-land-prep/app.js?v='+assetVersion,true),undefined);assert.equal(h.writes.length,0);});
test('application shell remains available for offline caching',async()=>{const h=harness();await h.request('https://example.com/adaptive-land-prep/app.js?v='+assetVersion);assert.equal(h.writes.length,1);});

test('every versioned entry asset is cached for offline use',async()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),h=harness();
 const assets=[...html.matchAll(/(?:src|href)="([^"?]+\?v=\d+)"/g)].map(m=>m[1]);
 assert.equal(assets.length,4);
 for(const asset of assets){await h.request('https://example.com/adaptive-land-prep/'+asset);assert.ok(h.writes.includes('https://example.com/adaptive-land-prep/'+asset));}
});
