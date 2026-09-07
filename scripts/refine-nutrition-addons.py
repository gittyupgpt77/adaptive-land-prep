from pathlib import Path

app=Path('app.js')
test=Path('tests/nutrition-plan-coherence.test.cjs')
source=app.read_text()
tests=test.read_text()
old='''function fuelAddOnFoods(kcal){
 if(kcal<=225)return["Add roughly "+kcal+" kcal of carbohydrate around training","Example: about 1 cup cooked rice, or a similar portion of oats / bread / fruit"];
 if(kcal<=550)return["Add roughly "+kcal+" kcal, primarily carbohydrate, across the meals nearest training","Example: about 1½ cups cooked rice plus 2 slices sourdough, adjusted with labels for your usual brands"];
 return["Distribute roughly "+kcal+" kcal of additional fuel across breakfast, pre/post-training and dinner","Favor the rice, oats, sourdough and fruit already in the plan rather than adding another protein-heavy meal"];
}
function mealPlanForTarget(w,target){
 const meals=baseMealPlan(w).map(m=>({...m,foods:[...m.foods]})),base=meals.reduce((s,m)=>s+m.kcal,0),goal=Math.round(Number(target?.cal)||base),gap=goal-base;
 if(gap<0)throw new Error("Meal template exceeds nutrition target");
 if(gap>0)meals.push({id:"fuel-addon",name:target?.adjustment?.level==="red"?"Recovery Fuel Add-On":w<=24?"Training Fuel Add-On":"Performance Fuel Add-On",kcal:gap,foods:fuelAddOnFoods(gap)});
 return meals
}'''
new='''function fuelAddOnFoods(kcal){
 if(kcal<=225)return["Add roughly "+kcal+" kcal of carbohydrate near training","Example: about 1 cup cooked rice, or a similar portion of oats / bread / fruit"];
 if(kcal<=450)return["Add roughly "+kcal+" kcal, primarily carbohydrate, near training","Example: cooked rice plus fruit, or sourdough plus oats, adjusted with labels for your usual brands"];
 return["Add roughly "+kcal+" kcal, primarily carbohydrate, near training","Example: about 1½ cups cooked rice + 2 slices sourdough + a banana is roughly 600 kcal; scale the portions to this card’s target"];
}
function mealPlanForTarget(w,target){
 const meals=baseMealPlan(w).map(m=>({...m,foods:[...m.foods]})),base=meals.reduce((s,m)=>s+m.kcal,0),goal=Math.round(Number(target?.cal)||base),gap=goal-base;
 if(gap<0)throw new Error("Meal template exceeds nutrition target");
 if(gap>0){
   const chunks=gap>600?[Math.round(gap/2),gap-Math.round(gap/2)]:[gap],recovery=target?.adjustment?.level==="red";
   chunks.forEach((kcal,i)=>meals.push({id:"fuel-addon-"+(i+1),name:chunks.length>1?(i===0?"Pre-Training Fuel Add-On":"Post-Training Fuel Add-On"):(recovery?"Recovery Fuel Add-On":w<=24?"Training Fuel Add-On":"Performance Fuel Add-On"),kcal,foods:fuelAddOnFoods(kcal)}));
 }
 return meals
}'''
if old not in source: raise SystemExit('nutrition add-on block not found')
source=source.replace(old,new,1)
oldtest=""" assert.equal(meals.reduce((s,m)=>s+m.kcal,0),4200);\n assert.equal(meals.at(-1).name,'Recovery Fuel Add-On');\n assert.equal(meals.at(-1).kcal,800);"""
newtest=""" assert.equal(meals.reduce((s,m)=>s+m.kcal,0),4200);\n const addons=meals.filter(m=>m.id.startsWith('fuel-addon-'));\n assert.deepEqual(addons.map(m=>m.kcal),[400,400]);\n assert.deepEqual(addons.map(m=>m.name),['Pre-Training Fuel Add-On','Post-Training Fuel Add-On']);"""
if oldtest not in tests: raise SystemExit('recovery add-on test target not found')
tests=tests.replace(oldtest,newtest,1)
app.write_text(source)
test.write_text(tests)
