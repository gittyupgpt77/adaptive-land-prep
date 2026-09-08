const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function harness(initial={}){
 const values=new Map(Object.entries(initial));let failure;
 const storage={get length(){return values.size},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null,setItem(k,v){if(failure===k){failure=null;throw Error('quota')}values.set(k,String(v))},removeItem:k=>values.delete(k)};
 const localStorage=new Proxy(storage,{get:(t,k)=>k in t?t[k]:values.get(k)}),mirrors=[];
 const context=vm.createContext({localStorage,dbSet:(...args)=>mirrors.push(args),location:{reload(){}},Date});
 vm.runInContext(source.slice(source.indexOf('const APP_STORAGE_KEYS='),source.indexOf('\n$("exportBackup").onclick')),context);
 return {context,values,mirrors,fail:k=>failure=k};
}
const original={programStart:'2026-09-01T12:00:00.000Z',baselineDate:'2026-09-01T12:00:00.000Z',trainingLogs:'[{"date":"2026-09-01","week":1,"weight":170}]',workoutHistory:'[{"date":"2026-09-01","week":1,"session":"Strength","completed":"YES"}]',benchmarks:'{"strength":true}',failedDays:'["2026-09-02"]',daySession:'{"date":"2026-09-01T12:00:00.000Z","closedAt":null}',input_hrv:'50',input_hrvBase:'60',input_session_today_sessionRPE:'9',task_checkin_today:'1',nutrition_today:'{"complete":true,"actualCalories":1400}', 'alp-firestore-device-owner':'athlete',unrelated:'keep'};
const now=new Date('2026-09-08T12:00:00.000Z');
test('restart archives all prior adaptation data and leaves a fresh active Day 1, preserving account identity',()=>{
 const h=harness(original);h.context.restartJourney(now);
 const archives=JSON.parse(h.values.get('journeyArchives'));assert.equal(archives.length,1);
 for(const [key,value] of Object.entries(original)){
  if(key==='unrelated'||key.startsWith('alp-'))assert.equal(h.values.get(key),value);
  else{assert.equal(archives[0].data[key],value);if(key!=='programStart')assert.equal(h.values.has(key),false)}
 }
 assert.equal(h.values.get('programStart'),now.toISOString());assert.equal(h.values.get('journeyEpoch'),now.toISOString());assert.equal(h.mirrors.length,2);
});
test('repeat restart preserves earlier snapshots without nesting or contaminating next baseline',()=>{
 const h=harness(original);h.context.restartJourney(now);h.values.set('input_weight','168');h.context.restartJourney(new Date('2026-09-09T12:00:00.000Z'));
 const archives=JSON.parse(h.values.get('journeyArchives'));assert.equal(archives.length,2);assert.equal(archives[1].data.input_weight,'168');assert.equal(archives[1].data.journeyArchives,undefined);assert.equal(archives[1].data.trainingLogs,undefined);
});
test('each quota failure preserves exact prior state before any records are removed',()=>{
 for(const key of ['journeyArchives','journeyEpoch','programStart']){
  const h=harness(original);h.fail(key);assert.throws(()=>h.context.restartJourney(now));assert.deepEqual(Object.fromEntries(h.values),original);assert.equal(h.mirrors.length,0);
 }
});
test('archives round-trip through shared local and cloud backup validation with active isolation',async()=>{
 const h=harness(original);h.context.restartJourney(now);const data=h.context.collectBackupData();
 const restored=harness(original);await restored.context.importBackup({text:async()=>JSON.stringify({app:'Adaptive Land Prep',formatVersion:3,data})});
 assert.equal(restored.values.get('journeyArchives'),h.values.get('journeyArchives'));assert.equal(restored.values.has('trainingLogs'),false);assert.equal(restored.values.has('nutrition_today'),false);
});
test('malformed or nested archive snapshots are rejected before mutation',()=>{
 for(const data of [{programStart:'invalid'},{programStart:original.programStart,trainingLogs:'{}'},{programStart:original.programStart,journeyArchives:'[]'},{programStart:original.programStart,secret:'bad'}]){
  const h=harness(original);assert.throws(()=>h.context.validateBackup({app:'Adaptive Land Prep',formatVersion:3,data:{journeyArchives:JSON.stringify([{id:'old',endedAt:now.toISOString(),data}])}}));assert.deepEqual(Object.fromEntries(h.values),original);
 }
});
test('interrupted restart rolls back before startup and backups expose only the committed Journey',()=>{
 const h=harness(original),before=h.context.collectBackupData();
 h.values.set('alp-journey-restart-pending',JSON.stringify(before));h.values.set('journeyArchives','[]');h.values.set('journeyEpoch',now.toISOString());h.values.set('programStart',now.toISOString());h.values.delete('trainingLogs');h.values.delete('nutrition_today');
 assert.equal(JSON.stringify(h.context.collectBackupData()),JSON.stringify(before));
 h.context.recoverInterruptedJourneyRestart();assert.deepEqual(Object.fromEntries(h.values),original);
});
test('insufficient space for the recovery snapshot leaves the Journey untouched',()=>{
 const h=harness(original);h.fail('alp-journey-restart-pending');assert.throws(()=>h.context.restartJourney(now));assert.deepEqual(Object.fromEntries(h.values),original);
});
