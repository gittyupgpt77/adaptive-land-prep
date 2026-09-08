const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function harness(initial={}){
 const values=new Map(Object.entries(initial));let failKey=null,reloads=0;
 const storage={get length(){return values.size},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null,setItem(k,v){if(k===failKey){failKey=null;throw Error('quota')}values.set(k,String(v))},removeItem:k=>values.delete(k)};
 const localStorage=new Proxy(storage,{get:(target,k)=>k in target?target[k]:values.get(k)});
 const context=vm.createContext({localStorage,dbSet:async()=>{},location:{reload(){reloads++}}});
 vm.runInContext(source.slice(source.indexOf('const APP_STORAGE_KEYS='),source.indexOf('\n$("exportBackup").onclick')),context);
 return {values,context,fail:k=>failKey=k,get reloads(){return reloads},restore:o=>context.importBackup({text:async()=>JSON.stringify(o)})};
}
const payload=data=>({app:'Adaptive Land Prep',formatVersion:3,data});
const old={'trainingLogs':'[]','programStart':'2026-09-01T12:00:00.000Z',unrelated:'keep'};
test('reject malformed backups before any mutation',async()=>{
 for(const data of [{},{trainingLogs:'{}'},{trainingLogs:'[null]'},{trainingLogs:'[{"date":"invalid"}]'},{workoutHistory:'[{"date":"2026-09-01","session":{},"completed":"YES"}]'},{nutrition_today:'{"meals":{}}'},{programStart:'invalid'},{trainingLogs:[]}]){
  const h=harness(old);await assert.rejects(h.restore(payload(data)));assert.deepEqual(Object.fromEntries(h.values),old);assert.equal(h.reloads,0);
 }
 const h=harness(old);await assert.rejects(h.restore({...payload({trainingLogs:'[]'}),formatVersion:99}));assert.deepEqual(Object.fromEntries(h.values),old);
});
test('quota failure rolls back overwritten keys and keeps existing journey',async()=>{
 const h=harness(old);h.fail('workoutHistory');await assert.rejects(h.restore(payload({trainingLogs:JSON.stringify([{date:'2026-09-02',week:1}]),workoutHistory:'[]'})));assert.deepEqual(Object.fromEntries(h.values),old);assert.equal(h.reloads,0);
});
test('version 3 replaces app data while retaining unrelated origin data',async()=>{
 const h=harness(old);await h.restore(payload({trainingLogs:'[]',nutrition_today:'{"meals":["m1"],"actualCalories":500}'}));assert.equal(h.values.has('programStart'),false);assert.equal(h.values.get('unrelated'),'keep');assert.equal(h.reloads,1);
});
test('legacy version 2 merges without deleting existing data',async()=>{
 const h=harness(old);await h.restore({...payload({workoutHistory:'[]'}),formatVersion:2});assert.equal(h.values.get('programStart'),old.programStart);
});
test('full 56-week and multi-year histories survive restore',async()=>{
 const rows=Array.from({length:800},(_,i)=>({date:new Date(Date.UTC(2024,0,i+1)).toISOString(),week:Math.min(56,Math.floor(i/7)+1)}));
 const h=harness();await h.restore(payload({trainingLogs:JSON.stringify(rows)}));assert.equal(JSON.parse(h.values.get('trainingLogs')).length,800);
});
test('restored confirmed meal snapshots retain quantities and malformed snapshots are rejected',async()=>{
 const log={meals:['m1'],prescribedMeals:[{id:'m1',name:'Breakfast',kcal:400,foods:['½ cup cooked oats']}],actualCalories:400,saved:true,complete:false};
 const h=harness(old);await h.restore(payload({nutrition_today:JSON.stringify(log)}));assert.deepEqual(JSON.parse(h.values.get('nutrition_today')),log);
 for(const prescribedMeals of [[null],[{id:'m1',name:'Breakfast',kcal:400,foods:'oats'}],[...log.prescribedMeals,...log.prescribedMeals]]){
  const invalid=harness(old);await assert.rejects(invalid.restore(payload({nutrition_today:JSON.stringify({...log,prescribedMeals})})));assert.deepEqual(Object.fromEntries(invalid.values),old);
 }
});
