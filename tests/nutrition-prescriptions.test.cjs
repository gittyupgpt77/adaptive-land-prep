// Prepared for the final rescue release gate.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const NutritionCore=require('../nutrition-core'),NutritionIntake=require('../nutrition-intake');
const NutritionData={catalog:require('../data/nutrition/foods.json'),prescriptions:require('../data/nutrition/prescription-meals.json')};
function planner(){const c=vm.createContext({NutritionCore,NutritionIntake,NutritionData,nutritionFoodNames:{}});vm.runInContext(fs.readFileSync('nutrition-plan.js','utf8'),c);return c.sourceBackedMealPlan}
const target={cal:1450,protein:185,carbs:90,fat:40};
test('prescribed portions derive actual macros from weighed ingredients',()=>{
 const meals=planner()(1,target);assert.equal(meals.length,4);
 for(const m of meals){assert.ok(NutritionIntake.validSnapshot(m));const actual=NutritionCore.totalIngredients(m.ingredients,NutritionData.catalog);assert.equal(m.kcal,actual.kcal.known);assert.equal(m.nutrients.protein.known,actual.protein.known)}
 const recorded=NutritionIntake.summary(meals,meals.map(m=>m.id));assert.equal(recorded.complete,true);assert.ok(recorded.protein>0);assert.ok(Math.abs(recorded.calories-target.cal)<target.cal*.05);
});
test('confirmed prescribed portions survive target changes, and unknown deviations do not become zero',()=>{
 const plan=planner(),meals=plan(1,target),saved=JSON.stringify(meals[0]);
 const log={meals:[meals[0].id],prescribedMeals:meals};
 const updated=plan(1,{cal:1650,protein:185,carbs:140,fat:40},log);
 const kept={...updated.find(m=>m.id===meals[0].id),portionStatus:meals[0].portionStatus};assert.equal(JSON.stringify(kept),saved);
 const unknown=plan(1,target,{...log,mealEntries:[{id:meals[0].id,kind:'replacement',calories:300}]});
 assert.equal(unknown[0].portionStatus,'unknown-intake');assert.equal(unknown[1].kcal,meals[1].kcal);
});
test('already-started legacy days do not migrate to new recipe identities',()=>{
 assert.equal(planner()(1,target,{meals:['m1'],prescribedMeals:[{id:'m1',name:'Legacy',kcal:400,foods:['original']}]}),null);
});
