import { webkit } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// The real controller and state machine run against an isolated SDK transport.
// This tests browser integration, not live authentication or database policies.
const browser=await webkit.launch();
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/vendor/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:`
 window.__mockOwner='A';
 window.__mockBackups=()=>JSON.parse(localStorage.getItem('mock-backups')||'[]');
 window.SupabaseSDK={createClient:()=>({auth:{
 onAuthStateChange(fn){window.__switchAccount=id=>{window.__mockOwner=id;fn('SIGNED_IN',{user:{id,email:id+'@example.test'}})};queueMicrotask(()=>window.__switchAccount('A'))},
 getUser:async()=>({data:{user:{id:window.__mockOwner}}})
 },from(){let row;const q={insert(value){row=value;return q},select(){return q},eq(){return q},order(){return q},range:async()=>({data:[]}),single:async()=>{
 if(!navigator.onLine)return {error:Error('Offline')};
 const records=window.__mockBackups();const result={id:String(records.length+1),created_at:new Date().toISOString(),...row};records.push(result);localStorage.setItem('mock-backups',JSON.stringify(records));return {data:result};
 }};return q}})};
 `}));
const count=()=>page.evaluate(()=>window.__mockBackups().length);
const saved=async n=>page.waitForFunction(n=>window.__mockBackups().length===n,n,{timeout:15000});
try{
 await page.goto(process.env.ALP_AUDIT_URL||'http://127.0.0.1:8080',{waitUntil:'networkidle'});
 await page.evaluate(()=>{localStorage.clear();localStorage.trainingLogs=JSON.stringify([{date:'2026-09-07',weight:170}])});
 await page.reload({waitUntil:'networkidle'});
 await page.locator('[data-target="program"]').click();await page.locator('#openTrends').click();await page.locator('#cloudPanel summary').click();
 assert.equal(await page.locator('#cloudSave').count(),0,'No manual backup action');
 assert.equal(await count(),0,'Signing in does not upload before device/account consent');
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#cloudEnable').click();await saved(1);
 await page.evaluate(()=>localStorage.input_weight='169');await saved(2);
 assert.equal(await page.evaluate(()=>window.__mockBackups().at(-1).payload.data.input_weight),'169','Direct localStorage assignments are included');
 await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(8000);
 assert.equal(await count(),2,'Reload of unchanged data does not create duplicate snapshot');
 await context.setOffline(true);await page.evaluate(()=>localStorage.input_weight='168');await page.waitForTimeout(7000);
 assert.equal(await count(),2,'Offline writes remain on device');
 await context.setOffline(false);await saved(3);
 await page.evaluate(()=>{window.__switchAccount('B');localStorage.input_weight='167'});await page.waitForTimeout(7000);
 assert.equal(await count(),3,'Account switching cannot upload previous athlete data');
 await page.evaluate(()=>window.__switchAccount('A'));await saved(4);
 await page.locator('[data-target="program"]').click();await page.locator('#openTrends').click();await page.locator('#cloudPanel summary').click();
 await page.locator('#cloudPanel').scrollIntoViewIfNeeded();
 fs.mkdirSync('audit-cloud',{recursive:true});await page.screenshot({path:'audit-cloud/automatic-backup-iphone.png'});
 assert.deepEqual(errors,[],'No browser runtime errors');
 console.log('PASS: automatic consent, property writes, reload deduplication, offline retry, account isolation, iPhone status screenshot.');
}finally{await browser.close()}
