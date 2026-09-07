const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function nutritionContext(){
 const start=source.indexOf('function isHighVolumeSession('),end=source.indexOf('\nfunction hydrationForDay(',start);
 assert.ok(start>=0&&end>start,'nutrition plan functions are present');
 const context=vm.createContext({prescriptionWeek:()=>1,sessionName:()=> 'Recovery',savedDecision:()=>null});
 vm.runInContext(source.slice(start,end),context);
 return context;
}

test('prescribed meals reconcile to the displayed calorie target across program transitions',()=>{
 const c=nutritionContext();
 const cases=[
  [1,'Recovery',1450],[1,'Quality run',1650],[20,'Long run',1650],
  [21,'Recovery',1950],[24,'Recovery',2250],
  [25,'Recovery',3400],[25,'Quality run',4000],[52,'Long run',4000],[56,'Recovery',3400]
 ];
 for(const [week,name,expected] of cases){
  const target=c.nutritionForWeek(week,name),meals=c.mealPlanForTarget(week,target),sum=meals.reduce((s,m)=>s+m.kcal,0);
  assert.equal(target.cal,expected,`week ${week} target`);
  assert.equal(sum,target.cal,`week ${week} ${name} meal sum`);
  assert.ok(meals.every(m=>Number.isFinite(m.kcal)&&m.kcal>0));
 }
});

test('recovery fueling adds to the meal prescription rather than only changing the dashboard',()=>{
 const c=nutritionContext(),target={...c.nutritionForWeek(25,'Quality run'),cal:4200,adjustment:{level:'red'}},meals=c.mealPlanForTarget(25,target);
 assert.equal(meals.reduce((s,m)=>s+m.kcal,0),4200);
 const addons=meals.filter(m=>m.id.startsWith('fuel-addon-'));
 assert.equal(addons.length,2);
 assert.equal(addons[0].kcal,400);
 assert.equal(addons[1].kcal,400);
 assert.equal(addons[0].name,'Pre-Training Fuel Add-On');
 assert.equal(addons[1].name,'Post-Training Fuel Add-On');
});

test('post-transition base meal template is the 3400-kcal lower-volume plan',()=>{
 const c=nutritionContext(),meals=c.baseMealPlan(25);
 assert.equal(meals.reduce((s,m)=>s+m.kcal,0),3400);
 assert.match(meals[0].foods.join(' '),/1 cup cooked oats/);
 assert.match(meals.at(-1).foods.join(' '),/6 oz top sirloin/);
});

test('meal helper refuses a target below its base template instead of silently overprescribing',()=>{
 const c=nutritionContext();
 assert.throws(()=>c.mealPlanForTarget(25,{cal:3300}),/exceeds nutrition target/);
});
