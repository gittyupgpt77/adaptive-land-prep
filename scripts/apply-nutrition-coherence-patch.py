from pathlib import Path

app=Path('app.js')
sw=Path('service-worker.js')
source=app.read_text()
worker=sw.read_text()

def replace_between(start,end,replacement,label):
    global source
    a=source.find(start)
    if a<0: raise SystemExit(f'missing start marker: {label}')
    b=source.find(end,a)
    if b<0: raise SystemExit(f'missing end marker: {label}')
    source=source[:a]+replacement.rstrip()+'\n'+source[b:]

def must_replace(old,new,label):
    global source
    if old not in source: raise SystemExit(f'missing patch target: {label}')
    source=source.replace(old,new,1)

replace_between('function nutritionHtml(w,name){','function hydrationForDay(w,name){',r'''function nutritionHtml(w,name){
 const n=nutritionForWeek(w,name),meals=mealPlanForTarget(w,n);
 return '<div class="nutrition-hero"><small>'+n.phase.toUpperCase()+'</small><strong>≈ '+n.cal.toLocaleString()+' kcal</strong><p>'+n.why+'</p></div><div class="macro-grid"><div><span>Protein</span><strong>'+n.protein+' g</strong></div><div><span>Carbs</span><strong>'+n.carbs+' g</strong></div><div><span>Fat</span><strong>'+n.fat+' g</strong></div></div><div class="calendar-meal-plan">'+meals.map(m=>'<div><small>≈ '+m.kcal+' KCAL</small><strong>'+m.name+'</strong><p>'+m.foods.join(" · ")+'</p></div>').join("")+'</div><div class="nutrition-note"><strong>Adaptive rule</strong><p>Readiness and body-weight trend override an aggressive deficit when recovery or performance deteriorates.</p></div>';
}
function nutritionLogKey(d=new Date()){return"nutrition_"+dayKey(d)}
function getNutritionLog(d=new Date()){try{return JSON.parse(localStorage.getItem(nutritionLogKey(d))||"{}")}catch(e){return{}}}
function baseMealPlan(w){
 if(w<=24)return[
  {id:"m1",name:"Breakfast",kcal:400,foods:["6 egg whites + 1 whole egg","½ cup cooked oats + 1 tsp chia","½ medium banana"]},
  {id:"m2",name:"Lunch",kcal:350,foods:["6 oz chicken breast","3 cups spinach / kale / baby chard","1 cup mushrooms + bell peppers","1 oz avocado"]},
  {id:"m3",name:"Training snack",kcal:300,foods:["1 slice sourdough","1.5 scoops whey isolate in water"]},
  {id:"m4",name:"Dinner",kcal:400,foods:["5 oz sirloin or wild salmon","½ cup cooked brown rice","2 cups greens + lemon"]}
 ];
 return[
  {id:"m1",name:"Breakfast",kcal:650,foods:["1 cup cooked oats + 2 tbsp chia","1 large banana","1 cup whole milk","1 scoop whey"]},
  {id:"m2",name:"After-training meal",kcal:750,foods:["4 whole eggs + 4 egg whites","2 slices sourdough","1 oz cheese","1 cup greens","1 cup blueberries"]},
  {id:"m3",name:"Lunch",kcal:700,foods:["6 oz chicken or wild salmon","1 cup cooked white rice","2 cups greens","Mushrooms + bell peppers","1 tbsp extra virgin olive oil"]},
  {id:"m4",name:"Training snack",kcal:400,foods:["2 slices sourdough","1 tbsp honey or 1 banana","1 scoop whey in water"]},
  {id:"m5",name:"Dinner",kcal:900,foods:["6 oz top sirloin","1½ cups white rice or 1 large sweet potato","1 oz cheese","¼ avocado","2 cups greens"]}
 ];
}
function fuelAddOnFoods(kcal){
 if(kcal<=225)return["Add roughly "+kcal+" kcal of carbohydrate around training","Example: about 1 cup cooked rice, or a similar portion of oats / bread / fruit"];
 if(kcal<=550)return["Add roughly "+kcal+" kcal, primarily carbohydrate, across the meals nearest training","Example: about 1½ cups cooked rice plus 2 slices sourdough, adjusted with labels for your usual brands"];
 return["Distribute roughly "+kcal+" kcal of additional fuel across breakfast, pre/post-training and dinner","Favor the rice, oats, sourdough and fruit already in the plan rather than adding another protein-heavy meal"];
}
function mealPlanForTarget(w,target){
 const meals=baseMealPlan(w).map(m=>({...m,foods:[...m.foods]})),base=meals.reduce((s,m)=>s+m.kcal,0),goal=Math.round(Number(target?.cal)||base),gap=goal-base;
 if(gap<0)throw new Error("Meal template exceeds nutrition target");
 if(gap>0)meals.push({id:"fuel-addon",name:target?.adjustment?.level==="red"?"Recovery Fuel Add-On":w<=24?"Training Fuel Add-On":"Performance Fuel Add-On",kcal:gap,foods:fuelAddOnFoods(gap)});
 return meals
}
function mealPlanForWeek(w){return baseMealPlan(w)}
function todayNutritionPrescription(w=prescriptionWeek(),name=sessionName()){
 const base={...nutritionForWeek(w,name)},dec=savedDecision(),out={...base,adjustment:null};
 if(dec?.c==="RED"){
   out.cal+=200;out.carbs+=50;
   out.adjustment={level:"red",title:"Recovery fueling override",copy:"Yesterday’s intake was materially below target. Add energy and carbohydrate today and reassess the deficit before returning to aggressive restriction."};
 }else if(dec?.c==="YELLOW"){
   out.adjustment={level:"yellow",title:"Carbohydrate timing emphasis",copy:"Fueling is somewhat below the preferred range. Keep daily intake near target, but place more of today’s carbohydrate before and after training."};
 }
 return out
}
function todayMealPlan(w=prescriptionWeek(),name=sessionName()){
 return mealPlanForTarget(w,todayNutritionPrescription(w,name))
}
''','nutrition plan coherence')

must_replace('const y=new Date(referenceDate);y.setDate(y.getDate()-1);const log=getNutritionLog(y);if(!log.saved)return null;\n const x=dateSession(y),target=nutritionForWeek(x.w,x.name),actual=typeof log.actualCalories==="number"&&Number.isFinite(log.actualCalories)?log.actualCalories:null,mealRatio=(log.meals||[]).length/mealPlanForWeek(x.w).length;','const y=new Date(referenceDate);y.setDate(y.getDate()-1);const log=getNutritionLog(y);if(!log.saved)return null;\n const x=dateSession(y),target=nutritionForWeek(x.w,x.name),actual=typeof log.actualCalories==="number"&&Number.isFinite(log.actualCalories)?log.actualCalories:null,plannedMeals=Array.isArray(log.prescribedMeals)&&log.prescribedMeals.length?log.prescribedMeals:mealPlanForTarget(x.w,{...target,cal:Number(log.targetCalories)>0?Number(log.targetCalories):target.cal}),mealRatio=(log.meals||[]).length/plannedMeals.length;','previous nutrition plan denominator')

must_replace('const w=prescriptionWeek(),name=sessionName(),target=todayNutritionPrescription(w,name),meals=todayMealPlan(w),log=getNutritionLog(),done=new Set(log.meals||[]),hydr=hydrationForDay(w,name);','const w=prescriptionWeek(),name=sessionName(),target=todayNutritionPrescription(w,name),meals=todayMealPlan(w,name),log=getNutritionLog(),done=new Set(log.meals||[]),hydr=hydrationForDay(w,name);','today meal target args')
must_replace("'<div class=\"meal-card '+(done.has(m.id)?\"done\":\"\")+'\"><button class=\"meal-check\" data-meal=\"'+m.id+'\">'+(done.has(m.id)?\"✓\":\"○\")+'</button><button class=\"meal-main\" data-mealopen=\"'+m.id+'\"><div><small>'+m.kcal+' KCAL</small><strong>'+m.name+'</strong>'","'<div class=\"meal-card '+(done.has(m.id)?\"done\":\"\")+'\"><button class=\"meal-check\" data-meal=\"'+m.id+'\">'+(done.has(m.id)?\"✓\":\"○\")+'</button><button class=\"meal-main\" data-mealopen=\"'+m.id+'\"><div><small>≈ '+m.kcal+' KCAL</small><strong>'+m.name+'</strong>'",'meal calorie estimate label')
must_replace("'<div class=\"meal-detail\"><small>'+m.kcal+' KCAL TARGET</small>'","'<div class=\"meal-detail\"><small>≈ '+m.kcal+' KCAL PLANNED</small>'",'meal detail estimate label')
must_replace('const log=captureNutritionDraft(),meals=todayMealPlan(prescriptionWeek()),target=todayNutritionPrescription(prescriptionWeek(),sessionName()),','const log=captureNutritionDraft(),target=todayNutritionPrescription(prescriptionWeek(),sessionName()),meals=mealPlanForTarget(prescriptionWeek(),target),','save target-coherent meals')

# Calendar/history fallback should use the same target-coherent plan when no saved snapshot exists.
must_replace('const meals=Array.isArray(log.prescribedMeals)&&log.prescribedMeals.length?log.prescribedMeals:mealPlanForWeek(x.w);','const meals=Array.isArray(log.prescribedMeals)&&log.prescribedMeals.length?log.prescribedMeals:mealPlanForTarget(x.w,n);','historical target coherent meals')

if "const CACHE='land-prep-v63';" not in worker: raise SystemExit('unexpected service worker cache version')
worker=worker.replace("const CACHE='land-prep-v63';","const CACHE='land-prep-v64';",1)

app.write_text(source)
sw.write_text(worker)
