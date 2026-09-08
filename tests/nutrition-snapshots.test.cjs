const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const c=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function baseMealPlan('),source.indexOf('function weightTrend('))+source.slice(source.indexOf('function mealPlanForLog('),source.indexOf('function hydrationForDay(')),c);
const target=cal=>({cal});
test('confirmed extra fuel keeps its quantity when updated recovery adds more food',()=>{
 const original=c.mealPlanForTarget(1,target(1650)),log={meals:['m1','fuel-addon-1'],prescribedMeals:JSON.parse(JSON.stringify(original))};
 const next=c.mealPlanForLog(1,target(1850),log);
 assert.deepEqual(JSON.parse(JSON.stringify(next.find(m=>m.id==='fuel-addon-1'))),log.prescribedMeals.find(m=>m.id==='fuel-addon-1'));
 assert.equal(next.reduce((s,m)=>s+m.kcal,0),1850);
 assert.equal(next.find(m=>m.id==='fuel-addon-2').kcal,200);
 // Serialize/restore before the following meal: stable IDs and portions persist.
 const restored=JSON.parse(JSON.stringify({...log,prescribedMeals:next}));
 assert.equal(JSON.stringify(c.mealPlanForLog(1,target(1850),restored)),JSON.stringify(next));
});
test('lower target never erases consumed fuel or assigns negative remaining food',()=>{
 const original=c.mealPlanForTarget(1,target(2050)),log={meals:original.map(m=>m.id),prescribedMeals:original};
 const next=c.mealPlanForLog(1,target(1450),log);
 assert.equal(next.reduce((s,m)=>s+m.kcal,0),2050);
 assert.equal(next.filter(m=>!log.meals.includes(m.id)).length,0);
});
test('unconfirmed changed additions are recalculated and legacy records remain readable',()=>{
 const old=c.mealPlanForTarget(1,target(2050));
 const next=c.mealPlanForLog(1,target(1450),{meals:['m1'],prescribedMeals:old});
 assert.equal(next.length,4);assert.equal(next.reduce((s,m)=>s+m.kcal,0),1450);
 assert.equal(c.mealPlanForLog(1,target(1450),{meals:['m1']}).length,4);
});
test('base meal quantities stay fixed across a prescription-week change',()=>{
 const old=c.mealPlanForTarget(24,target(1650));
 const next=c.mealPlanForLog(25,target(3600),{meals:['m1'],prescribedMeals:old});
 assert.equal(JSON.stringify(next.find(m=>m.id==='m1')),JSON.stringify(old[0]));
 assert.equal(next.reduce((s,m)=>s+m.kcal,0),3600);
});
