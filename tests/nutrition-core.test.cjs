const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../nutrition-core'),catalog=require('../data/nutrition/foods.json'),menus=require('../data/nutrition/menu-candidates.json');
test('all 56 weeks have explicit goals, including maintenance during taper',()=>{
 for(let week=1;week<=56;week++){
  const p=core.phaseForWeek(week);assert.ok(week>=p.from&&week<=p.to);
  const t=core.targets({week,weightKg:80,maintenanceKcal:2800,workload:'light'});
  assert.equal(t.cal,t.protein*4+t.carbs*4+t.fat*9);assert.ok(Number.isFinite(t.cal));
 }
 assert.equal(core.phaseForWeek(17).id,'engine');assert.equal(core.phaseForWeek(33).id,'specificity');assert.equal(core.phaseForWeek(45).id,'peak');assert.equal(core.phaseForWeek(53).deficitFraction,0);
 assert.throws(()=>core.phaseForWeek(57));assert.throws(()=>core.phaseForWeek(1.5));
});
test('missing energy or workload yields an explicit incomplete result, never a guessed prescription',()=>{
 assert.equal(core.targets({week:1,weightKg:80,workload:'light'}).status,'needs-energy-estimate');
 assert.equal(core.targets({week:1,weightKg:80,maintenanceKcal:2800,workload:'long'}).status,'needs-workload');
 assert.equal(core.targets({week:1,weightKg:NaN,maintenanceKcal:2800,workload:'light'}).status,'needs-body-mass');
});
test('workload and recovery protect fuel; calendar alone does not cause the old week-25 jump',()=>{
 const input={weightKg:80,maintenanceKcal:2800,workload:'light'};
 const a=core.targets({...input,week:24}),b=core.targets({...input,week:25});assert.equal(a.cal,b.cal);
 const cut=core.targets({...input,week:1}),recovery=core.targets({...input,week:1,recovery:true}),hard=core.targets({...input,week:1,workload:'high'});
 assert.ok(recovery.cal>cut.cal);assert.ok(hard.cal>cut.cal);assert.equal(hard.deficitLimitedByFuel,true);
});
test('manufacturer label servings remain flavor-specific with vitamin D counted',()=>{
 const a=core.totalIngredients([{foodId:'wheyChocolate',grams:41}],catalog),b=core.totalIngredients([{foodId:'wheyVanilla',grams:36}],catalog);
 assert.equal(a.kcal.known,150);assert.equal(b.kcal.known,140);assert.equal(a.protein.known,25);assert.equal(b.protein.known,25);assert.equal(a.vitaminD.known,20);assert.equal(b.vitaminD.known,20);
 assert.equal(b.iron.complete,false);assert.equal(b.iron.known,0);
});
test('gram scaling is linear and food substitutions actually change totals',()=>{
 const one=core.totalIngredients([{foodId:'salmon',grams:100}],catalog),two=core.totalIngredients([{foodId:'salmon',grams:200}],catalog),beef=core.totalIngredients([{foodId:'beef',grams:100}],catalog);
 assert.equal(two.kcal.known,one.kcal.known*2);assert.notEqual(beef.fat.known,one.fat.known);
 assert.throws(()=>core.totalIngredients([{foodId:'invented',grams:100}],catalog));assert.throws(()=>core.totalIngredients([{foodId:'beef',grams:-1}],catalog));
});
test('confirmed snapshot survives source and recipe edits; unknown intake is never subtracted as zero',()=>{
 const foods=structuredClone(catalog),recipe=structuredClone(menus.days.salmon[0]),snapshot=core.recipeSnapshot(recipe,foods),saved=JSON.stringify(snapshot);
 recipe.ingredients[0].grams=999;foods.foods.egg.nutrients.protein=999;assert.equal(JSON.stringify(snapshot),saved);
 assert.deepEqual(core.remainingTargets({cal:100,protein:1,carbs:1,fat:1},[snapshot]),{cal:0,protein:0,carbs:0,fat:0});
 assert.deepEqual(core.remainingTargets({cal:100,protein:1,carbs:1,fat:1},[{}]),{cal:null,protein:null,carbs:null,fat:null});
});
test('candidate days have calculable macros and explicitly unquantified iodine',()=>{
 for(const meals of Object.values(menus.days)){
  const n=core.totalIngredients(meals.flatMap(m=>m.ingredients),catalog);
  for(const k of ['kcal','protein','carbs','fat','fiber','calcium'])assert.equal(n[k].complete,true,k);
  assert.ok(n.kcal.known>2000&&n.kcal.known<2400);assert.ok(n.calcium.known>=1000);
  assert.equal(n.iodine.complete,false);assert.ok(n.iodine.missing.length>0);
 }
});
