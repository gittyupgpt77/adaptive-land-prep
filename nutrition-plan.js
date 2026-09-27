/* Ingredient-backed portions preserve the existing target policy while that policy is reviewed. */
function sourceBackedMealPlan(week,target,log={}){
 const data=NutritionData.prescriptions,catalog=NutritionData.catalog;
 const recipes=JSON.parse(JSON.stringify(data.meals));
 if(target.cal>2500){recipes.splice(1,0,JSON.parse(JSON.stringify(data.extraFuel[0])));recipes.splice(recipes.length-1,0,JSON.parse(JSON.stringify(data.extraFuel[1])))}
 const fixed=(log.prescribedMeals||[]).filter(m=>(log.meals||[]).includes(m.id));
 // Existing template days finish with their original plan; no mid-day migration.
 if(fixed.some(m=>!m.nutrients))return null;
 const confirmed=fixed.map(m=>{
  const actual=NutritionIntake.resolve(m,(log.mealEntries||[]).find(e=>e.id===m.id));
  const mapping={kcal:'calories',protein:'protein',carbs:'carbs',fat:'fat'};
  return {...m,nutrients:Object.fromEntries(Object.entries(mapping).map(([k,v])=>[k,{known:actual[v],complete:actual[v]!==null}]))};
 });
 for(const m of fixed)if(!recipes.some(r=>r.id===m.id))recipes.push({id:m.id,name:m.name,ingredients:m.ingredients});
 let result=NutritionCore.portionPlan({target,meals:recipes,confirmed},catalog);
 // Missing replacement macros cannot become zero, or an invented remainder.
 if(result.status==='needs-known-intake'){
  const saved=log.prescribedMeals||[];
  return saved.map(m=>({...m,portionStatus:'unknown-intake'}));
 }
 const planned=new Map(result.planned.map(m=>[m.id,m])),frozen=new Map(fixed.map(m=>[m.id,m]));
 return recipes.map(recipe=>{
  if(frozen.has(recipe.id))return {...frozen.get(recipe.id),portionStatus:result.status};
  const m=planned.get(recipe.id);if(!m)throw Error('Meal plan could not be calculated');
  return {...m,portionStatus:result.status,foods:m.ingredients.map(i=>{
   const grams=Number.isInteger(i.grams)?i.grams:i.grams.toFixed(1);
   return grams+' g '+(nutritionFoodNames[i.foodId]||i.name);
  })};
 });
}
function plannedNutrientCoverage(meals){
 const references={calcium:1000,iron:8,magnesium:400,potassium:3400,zinc:11,selenium:55,vitaminA:900,vitaminD:15,vitaminE:15,vitaminC:90,thiamin:1.2,riboflavin:1.3,niacin:16,vitaminB6:1.3,folate:400,vitaminB12:2.4,choline:550,vitaminK:120,iodine:150};
 if(!meals.every(m=>m.nutrients))return '';
 const rows=Object.entries(references).map(([key,reference])=>{
  const values=meals.map(m=>m.nutrients[key]),known=values.reduce((s,n)=>s+(n?.known||0),0),complete=values.every(n=>n?.complete),unit=NutritionData.catalog.units[key];
  const finding=known>=reference?'Reference reached':complete?'Below reference':'Unresolved';
  return '<tr><th scope="row">'+nutritionText(key.replace(/([A-Z])/g,' $1'))+'</th><td>'+(complete?'':'≥ ')+(Math.round(known*10)/10)+' '+nutritionText(unit)+'</td><td>'+reference+' '+nutritionText(unit)+'</td><td>'+finding+'</td></tr>';
 });
 return '<details class="nutrient-coverage"><summary>Nutrients in this meal plan</summary><p>Planned food only, not confirmed intake. Adult male 19–30 reference amounts; these do not diagnose deficiency or establish total dietary adequacy. Supplements are not included. An incomplete subtotal below a reference stays unresolved.</p><div class="nutrient-table"><table><thead><tr><th>Nutrient</th><th>Known</th><th>Reference</th><th>Status</th></tr></thead><tbody>'+rows.join('')+'</tbody></table></div><p>Vitamin D in whey is included. Account for it when reviewing a separate D3 product or multivitamin. Iodine data are missing; that is not proof of zero intake.</p><a href="https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/" target="_blank" rel="noopener">NIH nutrient reference information</a></details>';
}
