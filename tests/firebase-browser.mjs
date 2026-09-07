import {webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import {initializeApp as adminApp,deleteApp} from 'firebase-admin/app';
import {getAuth as adminAuth} from 'firebase-admin/auth';

// Only this ephemeral test bundle points to emulators. Production has no emulator switch.
process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099';
const admin=adminApp({projectId:'demo-adaptive-land-prep'},'browser-test');
const account={email:'owner@example.test',password:'Test-only-password123!'};
await adminAuth(admin).createUser({uid:'owner',...account,emailVerified:true});
await adminAuth(admin).createUser({uid:'other',email:'other@example.test',password:account.password,emailVerified:true});
const env=await initializeTestEnvironment({projectId:'demo-adaptive-land-prep',firestore:{host:'127.0.0.1',port:8085,rules:fs.readFileSync('firestore.rules','utf8').replace('REPLACE_WITH_YOUR_USER_UID','owner')}});
let source=fs.readFileSync('src/firebase.js','utf8').replace('getAuth,','getAuth, connectAuthEmulator,').replace('getFirestore,','getFirestore, connectFirestoreEmulator,')
 .replace("projectId:'adaptive-land-prep'","projectId:'demo-adaptive-land-prep'")
 .replace('const auth=getAuth(app),db=getFirestore(app);',"const auth=getAuth(app),db=getFirestore(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8085);");
const bundle=(await build({stdin:{contents:source,resolveDir:process.cwd(),loader:'js'},bundle:true,write:false,format:'iife',globalName:'FirebaseSDK'})).outputFiles[0].text;
const browser=await webkit.launch(),errors=[];
async function device(){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
 await context.route('**/vendor/firebase.js',route=>route.fulfill({contentType:'application/javascript',body:bundle}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());
 await page.clock.install();return {context,page};
}
async function openPanel(page){await page.locator('[data-target="program"]').click();await page.locator('#openTrends').click();await page.locator('#cloudPanel summary').click()}
async function login(page,email=account.email){await page.locator('#cloudEmail').fill(email);await page.locator('#cloudPassword').fill(account.password);await page.locator('#cloudAuth button[type=submit]').click();await page.locator('#cloudSignedIn').waitFor({state:'visible'})}
const saved=page=>page.waitForFunction(()=>document.getElementById('cloudStatus').textContent.includes('up to date'),null,{timeout:25000});
try{
 const {context,page}=await device();
 await page.goto('http://127.0.0.1:8080/?backup=firebase');
 await page.evaluate(()=>{localStorage.trainingLogs=JSON.stringify([{date:'2026-09-07',weight:170}]);localStorage.baselineDate='2026-09-07';localStorage.setItem('alp-cloud-device-owner','previous-supabase-owner')});
 await openPanel(page);await login(page);
 assert.equal(await page.evaluate(()=>localStorage.getItem('alp-backup-provider')),null,'No migration before cloud acknowledgement');
 await page.locator('#cloudEnable').click();await page.clock.fastForward(7000);await saved(page);
 assert.equal(await page.evaluate(()=>localStorage.getItem('alp-backup-provider')),'firebase');
 assert.equal(await page.evaluate(()=>localStorage.getItem('alp-cloud-device-owner')),'previous-supabase-owner','Old recovery binding preserved');
 const revision=await page.evaluate(()=>localStorage.getItem('alp-firestore-revision-owner'));
 await page.goto('http://127.0.0.1:8080/');await page.clock.fastForward(7000);await saved(page);
 assert.equal(await page.evaluate(()=>localStorage.getItem('alp-firestore-revision-owner')),revision,'Reload confirms rather than duplicates the server copy');
 await context.setOffline(true);await page.evaluate(()=>localStorage.input_weight='168');await page.clock.fastForward(45000);
 assert.equal(await page.evaluate(()=>localStorage.getItem('alp-firestore-revision-owner')),revision);
 await context.setOffline(false);await page.clock.fastForward(7000);await saved(page);
 assert.notEqual(await page.evaluate(()=>localStorage.getItem('alp-firestore-revision-owner')),revision);
 await openPanel(page);await page.locator('#cloudSignout').click();await login(page,'other@example.test');
 await page.clock.fastForward(7000);
 assert.equal(await page.evaluate(()=>localStorage.getItem('alp-firestore-revision-other')),null,'Other account does not inherit upload consent');
 await page.locator('#cloudSignout').click();await login(page);await page.clock.fastForward(7000);await saved(page);
 fs.mkdirSync('audit-cloud',{recursive:true});await page.locator('#cloudPanel').scrollIntoViewIfNeeded();await page.screenshot({path:'audit-cloud/firebase-iphone.png'});

 const fresh=await device();await fresh.page.goto('http://127.0.0.1:8080/?backup=firebase');await openPanel(fresh.page);await login(fresh.page);
 await fresh.page.locator('#cloudRefresh').click();await fresh.page.locator('#cloudVersions button').first().waitFor();
 await fresh.page.locator('#cloudVersions button').first().click();
 await fresh.page.waitForFunction(()=>localStorage.input_weight==='168',null,{timeout:25000});
 assert.equal(await fresh.page.evaluate(()=>JSON.parse(localStorage.trainingLogs)[0].weight),170,'Clean device recovers complete saved history');
 assert.deepEqual(errors,[]);
 console.log('PASS Firebase WebKit: real emulator authentication, consent, atomic upload, reload deduplication, offline retry, account switch, clean-device recovery, iPhone screenshot.');
}catch(error){
 for(const [i,context] of browser.contexts().entries())for(const page of context.pages()){
  console.error('Browser state',i,await page.evaluate(()=>({status:document.getElementById('cloudStatus')?.textContent,url:location.href})).catch(()=>null),errors);
  fs.mkdirSync('audit-cloud',{recursive:true});await page.screenshot({path:'audit-cloud/firebase-failure-'+i+'.png'}).catch(()=>{});
 }
 throw error;
}finally{await browser.close();await env.cleanup();await deleteApp(admin)}
