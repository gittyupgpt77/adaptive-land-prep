const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../nutrition-core'),catalog=require('../data/nutrition/foods.json'),menus=require('../data/nutrition/menu-candidates.json');
test('all 56 weeks have explicit goals, including maintenance during taper',()=>{
 for(let week=1;week<=56;week++){
  const p=core.phaseForWeek(week);assert.ok(week>=p.from&&week<=p.to);
  const t=core.targets({week,foundationDeficitFraction:.15,weightKg:80,maintenanceKcal:2800,workload:'light'});
  assert.equal(t.cal,t.protein*4+t.carbs*4+t.fat*9);assert.ok(Number.isFinite(t.cal));
 }
 assert.equal(core.phaseForWeek(17).id,'engine');assert.equal(core.phaseForWeek(33).id,'specificity');assert.equal(core.phaseForWeek(45).id,'peak');assert.equal(core.phaseForWeek(53).deficitFraction,0);
 assert.throws(()=>core.phaseForWeek(57));assert.throws(()=>core.phaseForWeek(1.5));
});
test('missing energy or workload yields an explicit incomplete result, never a guessed prescription',()=>{
 assert.equal(core.targets({week:1,weightKg:80,workload:'light'}).status,'needs-energy-estimate');
 assert.equal(core.targets({week:1,foundationDeficitFraction:.15,weightKg:80,maintenanceKcal:2800,workload:'long'}).status,'needs-workload');
 assert.equal(core.targets({week:1,weightKg:NaN,maintenanceKcal:2800,workload:'light'}).status,'needs-body-mass');
});
test('workload conflicts require discussion; calendar alone does not cause the old week-25 jump',()=>{
 const input={foundationDeficitFraction:.15,weightKg:80,maintenanceKcal:2800,workload:'light'};
 const a=core.targets({...input,week:24}),b=core.targets({...input,week:25});assert.equal(a.cal,b.cal);
 const cut=core.targets({...input,week:1}),recovery=core.targets({...input,week:1,recovery:true}),hard=core.targets({...input,week:1,workload:'high'});
 assert.ok(recovery.cal>cut.cal);assert.equal(hard.status,'needs-policy-review');assert.equal(hard.cal,undefined);assert.ok(hard.referenceEnergyKcal>hard.requestedEnergyKcal);
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
test('portion planning preserves confirmed source snapshots and fixed foods',()=>{
 const meals=structuredClone(menus.days.salmon),foods=structuredClone(catalog);
 const breakfast=core.recipeSnapshot(meals[0],foods),before=JSON.stringify(breakfast),original=JSON.stringify(meals);
 foods.foods.egg.nutrients.protein=900; // Today's catalog must not rewrite yesterday's saved composition.
 const target=core.targets({week:1,foundationDeficitFraction:.15,weightKg:80,maintenanceKcal:2800,workload:'light'});
 const plan=core.portionPlan({target,meals,confirmed:[breakfast]},foods);
 assert.equal(JSON.stringify(plan.confirmed[0]),before);assert.equal(JSON.stringify(meals),original);
 assert.equal(plan.planned.length,3);assert.ok(!plan.planned.some(m=>m.id==='breakfast'));
 for(const meal of plan.planned){
  const source=meals.find(m=>m.id===meal.id);
  for(const [j,item] of meal.ingredients.entries()){
   const initial=source.ingredients[j];
   if(!initial.portion)assert.equal(item.grams,initial.grams);
   else {const p=initial.portion;assert.ok(item.grams>=p.minGrams&&item.grams<=p.maxGrams);assert.equal((item.grams-p.minGrams)%p.stepGrams,0);}
  }
 }
 assert.equal(plan.totals.protein,breakfast.nutrients.protein.known+plan.planned.reduce((s,m)=>s+m.nutrients.protein.known,0));
});
test('all-week portion matrix honestly reports fit or bounded shortfall',()=>{
 let candidates=0,reviews=0;
 for(let week=1;week<=56;week++)for(const workload of ['light','moderate','high','veryHigh'])for(const meals of Object.values(menus.days)){
  const target=core.targets({week,foundationDeficitFraction:.15,weightKg:80,maintenanceKcal:2800,workload});
  if(target.status==='needs-policy-review'){reviews++;assert.equal(target.cal,undefined);continue;}
  const plan=core.portionPlan({target,meals},catalog);
  const actual=core.totalIngredients(plan.planned.flatMap(m=>m.ingredients),catalog);
  const mapping={kcal:'cal',protein:'protein',carbs:'carbs',fat:'fat'};
  let fits=true;
  for(const [key,targetKey] of Object.entries(mapping)){
   assert.ok(Math.abs(plan.totals[key]-actual[key].known)<1e-8);
   assert.ok(Math.abs(plan.residual[key]-(actual[key].known-target[targetKey]))<1e-8);
   fits&&=Math.abs(plan.residual[key])<=target[targetKey]*(key==='kcal'?.05:.10);
  }
  assert.equal(plan.matchesTarget,fits);assert.equal(plan.status,fits?'candidate':'cannot-fit');
  assert.equal(plan.nutritionAdequacy,'unassessed');
  if(fits)candidates++;
 }
 assert.ok(candidates>0,'ordinary targets can fit');assert.ok(reviews>0,'conflicting workload assumptions need discussion');
 const bounded=core.portionPlan({target:{cal:6000,protein:200,carbs:900,fat:100},meals:menus.days.salmon},catalog);
 assert.equal(bounded.status,'cannot-fit');
});
test('unknown legacy intake and missing food macros block recalculation',()=>{
 const target={cal:2400,protein:180,carbs:270,fat:65},meals=menus.days.salmon;
 const unknown=core.portionPlan({target,meals,confirmed:[{id:'breakfast',kcal:500}]},catalog);
 assert.equal(unknown.status,'needs-known-intake');assert.equal(unknown.planned.length,0);
 const foods=structuredClone(catalog);foods.foods.oats.nutrients.carbs=null;
 assert.equal(core.portionPlan({target,meals},foods).status,'needs-food-data');
});
test('completed and over-target meals are retained without compensatory deletion',()=>{
 const meals=menus.days.salmon,confirmed=meals.map(m=>core.recipeSnapshot(m,catalog));
 const target={cal:100,protein:1,carbs:1,fat:1};
 const plan=core.portionPlan({target,meals,confirmed},catalog);
 assert.equal(plan.status,'complete');assert.equal(plan.matchesTarget,false);assert.deepEqual(plan.planned,[]);
 assert.deepEqual(plan.confirmed,confirmed);assert.deepEqual(plan.exceededByConfirmed,['kcal','protein','carbs','fat']);
 const partial=core.portionPlan({target,meals,confirmed:confirmed.slice(0,1)},catalog);
 assert.equal(partial.status,'cannot-fit');assert.equal(partial.planned.length,3);
});
test('ambiguous meal identity, malformed bounds and invalid targets cannot generate a plan',()=>{
 const target={cal:2400,protein:180,carbs:270,fat:65},meals=structuredClone(menus.days.salmon);
 assert.throws(()=>core.portionPlan({target,meals:[meals[0],meals[0]]},catalog));
 assert.throws(()=>core.portionPlan({target,meals,confirmed:[{id:'unknown'}]},catalog));
 assert.throws(()=>core.portionPlan({target:{...target,cal:NaN},meals},catalog));
 meals[0].ingredients[1].portion.stepGrams=0;
 assert.throws(()=>core.portionPlan({target,meals},catalog));
});

test('Foundation requires explicit policy and never silently substitutes a deficit',()=>{
 const input={week:1,weightKg:80,maintenanceKcal:2800,workload:'light'};
 assert.equal(core.targets(input).status,'needs-fat-loss-policy');
 for(const fraction of [-1,1,NaN,Infinity])assert.equal(core.targets({...input,foundationDeficitFraction:fraction}).status,'needs-fat-loss-policy');
 const conflict=core.targets({...input,foundationDeficitFraction:.40});
 assert.equal(conflict.status,'needs-policy-review');assert.equal(conflict.requestedEnergyKcal,1680);assert.equal(conflict.cal,undefined);
 const agreed=core.targets({...input,foundationDeficitFraction:.10});
 assert.equal(agreed.status,'estimate');assert.equal(agreed.foundationDeficitFraction,.10);
});

// Deferred until the final rescue verification gate, per user direction.
test('fat-energy reference follows paired composition and is not a calorie prescription',()=>{
 const before=core.fatEnergyReference({weightKg:90,bodyFatPercent:25});
 const after=core.fatEnergyReference({weightKg:80,bodyFatPercent:20});
 assert.equal(before.fatMassKg,22.5);assert.equal(after.fatMassKg,16);
 assert.ok(after.modelEnergyKcal<before.modelEnergyKcal);
 assert.equal(before.modelEnergyKcal,22.5/.45359237*31);
 assert.equal(before.establishesSafeDeficit,false);assert.equal(before.cal,undefined);
 assert.equal(core.fatEnergyReference({weightKg:80}).status,'needs-body-composition');
 for(const value of [0,100,NaN])assert.equal(core.fatEnergyReference({weightKg:80,bodyFatPercent:value}).status,'needs-body-composition');
});
