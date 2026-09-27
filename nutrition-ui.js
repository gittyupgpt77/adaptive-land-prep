/* Consumer meal entry. Targets and prescriptions are intentionally separate. */
const nutritionFoodNames={oats:'Oats · dry',egg:'Whole egg · raw weight',eggWhite:'Egg whites · raw weight',banana:'Banana · edible portion',chia:'Chia seeds · dry',yogurt:'Greek yogurt · plain, nonfat',milk:'Milk · 1%, fortified',rice:'Brown rice · cooked',lentils:'Lentils · cooked, unsalted',spinach:'Spinach · raw',kale:'Kale · raw',pepper:'Red pepper · raw',mushroom:'White mushrooms · raw',blueberry:'Blueberries',salmon:'Atlantic salmon · farmed, cooked',beef:'Lean top sirloin · cooked',chicken:'Chicken breast · cooked',oliveOil:'Olive oil',potato:'Potato with skin · baked',almonds:'Almonds',bread:'French / sourdough bread',wheyChocolate:'Sports Research · Dutch Chocolate',wheyVanilla:'Sports Research · Creamy Vanilla'};
function weighedMealPreparation(ingredients){
 const has=id=>ingredients.some(i=>i.foodId===id),steps=[];
 if(has('oats'))steps.push('Weigh oats dry, then cook using the package directions.');
 if(has('rice')||has('lentils'))steps.push('Cook rice or lentils using package directions, then weigh the cooked portion.');
 if(has('egg')||has('eggWhite'))steps.push('Weigh eggs without the shell and whites before cooking. Cook egg dishes to 160°F.');
 if(has('chicken'))steps.push('Cook chicken to 165°F at the thickest part. Weigh the cooked meat for the portion shown.');
 if(has('beef'))steps.push('Cook whole-cut sirloin to 145°F and rest 3 minutes. Weigh the cooked lean portion.');
 if(has('salmon'))steps.push('Cook salmon to 145°F and weigh the cooked portion. This food entry is farmed Atlantic salmon.');
 if(has('potato'))steps.push('Bake the potato with its skin, then weigh the cooked edible portion.');
 if(ingredients.some(i=>['spinach','kale','pepper','mushroom'].includes(i.foodId)))steps.push('Wash produce and weigh it raw, as listed. Cook mushrooms and any vegetables you prefer cooked. Cooking can change micronutrients; these entries retain their stated raw-food estimates.');
 if(has('wheyChocolate')||has('wheyVanilla'))steps.push('Weigh the selected whey flavor in grams. Mix with water or a separately logged milk portion; the flavors have different serving sizes.');
 if(has('oliveOil'))steps.push('Include the oil you actually consume; do not add an unrecorded pour during cooking.');
 return '<ol>'+steps.map(x=>'<li>'+nutritionText(x)+'</li>').join('')+'</ol><p>Batch-prep cooked foods into shallow containers. Refrigerate within 2 hours (1 hour above 90°F), at 40°F or below. Use within 3–4 days or freeze; reheat leftovers to 165°F.</p><p><a href="https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures" target="_blank" rel="noopener">Cooking temperatures</a> · <a href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety" target="_blank" rel="noopener">Storage guidance</a></p>';
}
function openFoodMeal(meal,meals,editContext=null){
 editContext=editContext||{key:nutritionLogKey(),raw:localStorage.getItem(nutritionLogKey())};
 const catalog=NutritionData.catalog,old=(getNutritionLog().mealEntries||[]).find(e=>e.id===meal.id);
 let ingredients=old?.kind==='ingredients'?old.snapshot.ingredients.map(i=>({foodId:i.foodId,grams:i.grams})):[];
 const recipes=[];
 for(const [day,items] of Object.entries(NutritionData.menus.days))for(const recipe of items)
  if(!recipes.some(r=>r.recipe.name===recipe.name))recipes.push({key:day+':'+recipe.id,recipe});
 $('modalTitle').textContent='Foods you ate';
 $('modalContent').innerHTML='<form id="foodMealForm" class="meal-correction"><p>Amounts are for this meal only. Calories and known nutrients are calculated from the food labels.</p><label>Meal name<input id="foodMealName" maxlength="120" required></label><label>Start with a meal<select id="foodRecipe"><option value="">Choose a starting point…</option>'+recipes.map(r=>'<option value="'+nutritionText(r.key)+'">'+nutritionText(r.recipe.name)+'</option>').join('')+'</select></label><p>These are editable meal ideas, not automatic prescriptions for today’s calorie target.</p><div id="foodMealRows"></div><button type="button" id="addMealFood">Add a food</button><p id="foodMealTotal" role="status" aria-live="polite"></p><details><summary>Preparation & storage</summary><div id="foodPreparation"></div></details><details><summary>Food labels & nutrient details</summary><div id="foodMealNutrients"></div><p>Missing nutrient data means unknown, not zero intake. Calculated values are estimates from the listed food sources.</p></details><p id="foodMealError" role="alert"></p><button type="submit" class="nutrition-save">Save meal & continue</button><button type="button" id="foodManual">Enter totals instead</button><button type="button" id="foodCancel">Cancel</button></form>';
 $('foodMealName').value=old?.kind==='ingredients'?old.snapshot.name:meal.name;
 const snapshot=()=>NutritionCore.recipeSnapshot({id:meal.id,name:$('foodMealName').value.trim()||meal.name,ingredients},catalog);
 const update=()=>{
  $('foodPreparation').innerHTML=weighedMealPreparation(ingredients);
  try{
   const s=snapshot(),n=s.nutrients;
   $('foodMealTotal').textContent=Math.round(s.kcal)+' kcal · '+Math.round(n.protein.known)+' g protein · '+Math.round(n.carbs.known)+' g carbs · '+Math.round(n.fat.known)+' g fat';
   $('foodMealNutrients').innerHTML='<ul>'+Object.entries(n).map(([key,v])=>'<li>'+nutritionText(key.replace(/([A-Z])/g,' $1'))+': '+(v.complete?Math.round(v.known*10)/10+' '+nutritionText(v.unit):'at least '+Math.round(v.known*10)/10+' '+nutritionText(v.unit)+'; incomplete data')+'</li>').join('')+'</ul><ul>'+[...new Set(ingredients.map(i=>i.foodId))].map(id=>'<li><a target="_blank" rel="noopener" href="'+nutritionText(catalog.foods[id].source)+'">'+nutritionText(nutritionFoodNames[id]||catalog.foods[id].name)+'</a></li>').join('')+'</ul>';
   $('foodMealError').textContent='';
  }catch(error){$('foodMealTotal').textContent='Add foods and positive gram amounts to calculate this meal.';$('foodMealNutrients').textContent='No complete calculation yet.'}
 };
 const renderRows=()=>{
  $('foodMealRows').innerHTML=ingredients.map((item,index)=>'<fieldset class="food-entry"><legend>Food '+(index+1)+'</legend><label>Food<select data-food="'+index+'">'+(!catalog.foods[item.foodId]?'<option value="'+nutritionText(item.foodId)+'">Unavailable source — choose a food</option>':'')+Object.keys(catalog.foods).map(id=>'<option value="'+id+'"'+(item.foodId===id?' selected':'')+'>'+nutritionText(nutritionFoodNames[id]||catalog.foods[id].name)+'</option>').join('')+'</select></label><label>Amount · grams<input data-grams="'+index+'" type="number" inputmode="decimal" min="0.1" step="any" value="'+(Number.isFinite(item.grams)?item.grams:'')+'" required></label><button type="button" data-removefood="'+index+'">Remove food '+(index+1)+'</button></fieldset>').join('');
  $('foodMealRows').querySelectorAll('[data-food]').forEach(el=>el.onchange=()=>{ingredients[+el.dataset.food].foodId=el.value;update()});
  $('foodMealRows').querySelectorAll('[data-grams]').forEach(el=>el.oninput=()=>{ingredients[+el.dataset.grams].grams=el.value===''?NaN:Number(el.value);update()});
  $('foodMealRows').querySelectorAll('[data-removefood]').forEach(el=>el.onclick=()=>{ingredients.splice(+el.dataset.removefood,1);renderRows();update()});
 };
 $('addMealFood').onclick=()=>{ingredients.push({foodId:'oats',grams:catalog.foods.oats.basisGrams});renderRows();update()};
 $('foodRecipe').onchange=()=>{const selected=recipes.find(r=>r.key===$('foodRecipe').value);if(!selected)return;ingredients=selected.recipe.ingredients.map(i=>({foodId:i.foodId,grams:i.grams}));$('foodMealName').value=selected.recipe.name;renderRows();update()};
 $('foodManual').onclick=()=>openMealCorrection(meal,meals,true,editContext);$('foodCancel').onclick=closeModal;
 $('foodMealForm').onsubmit=event=>{
  event.preventDefault();if(!localStorage.programStart){beginJourney();return}
  try{const entry={id:meal.id,kind:'ingredients',snapshot:snapshot()};if(!NutritionIntake.validEntry(entry))throw Error('Incomplete food data');commitMealCorrection(meal,meals,entry,'foodMealError',editContext)}
  catch(error){$('foodMealError').textContent='Choose foods with valid gram amounts before saving.'}
 };
 renderRows();update();
}
function renderNutritionProfile(){
 const host=$('nutritionProfile');if(!host)return;
 const originalProfileRaw=localStorage.getItem('athleteNutritionProfile');let profile;
 try{profile=JSON.parse(originalProfileRaw||'{"schemaVersion":1,"assessments":[],"rmrTests":[]}');if(!NutritionProfile.valid(profile))throw Error('Invalid profile')}
 catch(error){host.textContent='Your nutrition measurements could not be read. Restore a valid backup before editing them.';return}
 const current=NutritionProfile.latest(profile),a=current.assessment,r=current.rmr;
 host.innerHTML='<summary>Nutrition measurements</summary><p>Keep body weight and body-fat percentage paired to the same assessment. The latest dated record is shown first; undated records remain explicitly uncertain. Daily scale weights stay in your morning check-in.</p><form id="nutritionProfileForm" class="meal-correction"><fieldset><legend>Body composition</legend><label>Assessment date · if known<input id="compositionDate" type="date"></label><label>Method<select id="compositionMethod"><option value="dexa">DEXA</option><option value="bia">Body-composition scale</option><option value="calipers">Calipers</option><option value="estimate">Estimate</option></select></label><label>Body weight · lb<input id="compositionWeight" type="number" inputmode="decimal" min="1" step="any"></label><label>Body fat · %<input id="compositionFat" type="number" inputmode="decimal" min="0.1" max="99.9" step="any"></label></fieldset><fieldset><legend>Measured resting metabolism</legend><label>Test date · if known<input id="rmrDate" type="date"></label><label>RMR · kcal/day<input id="rmrKcal" type="number" inputmode="decimal" min="1" step="any"></label><p>RMR measures energy used at rest. It is not your total daily expenditure or your calorie target. Leave the date blank if you do not know it; the test will be marked undated.</p></fieldset><p id="nutritionProfileStatus" role="status"></p><button type="submit">Save measurements</button></form><details><summary>Saved measurements</summary><ul>'+profile.assessments.slice().reverse().map(x=>'<li>'+nutritionText(x.date||'Date unknown')+' · '+nutritionText(x.method.toUpperCase())+' · '+(x.weightKg/.45359237).toFixed(1)+' lb · '+x.bodyFatPercent+'%</li>').join('')+profile.rmrTests.slice().reverse().map(x=>'<li>'+nutritionText(x.date||'Date unknown')+' · RMR '+x.kcal+' kcal/day</li>').join('')+'</ul></details><p>These records are included in your device and private account backups. Restarting your Journey archives them with that Journey; old measurements will not silently become new baselines.</p>';
 if(a){$('compositionDate').value=a.date||'';$('compositionMethod').value=a.method;$('compositionWeight').value=Number((a.weightKg/.45359237).toFixed(2));$('compositionFat').value=a.bodyFatPercent}
 if(r){$('rmrDate').value=r.date||'';$('rmrKcal').value=r.kcal}
 const baseline={date:$('compositionDate').value,method:$('compositionMethod').value,weight:$('compositionWeight').value,fat:$('compositionFat').value,rmrDate:$('rmrDate').value,rmrKcal:$('rmrKcal').value};
 $('nutritionProfileForm').onsubmit=event=>{
  event.preventDefault();
  const date=$('compositionDate').value,method=$('compositionMethod').value,weight=$('compositionWeight').value,fat=$('compositionFat').value,rmrDate=$('rmrDate').value,rmrKcal=$('rmrKcal').value;
  const assessmentChanged=date!==baseline.date||method!==baseline.method||weight!==baseline.weight||fat!==baseline.fat;
  const rmrChanged=rmrDate!==baseline.rmrDate||rmrKcal!==baseline.rmrKcal;
  try{
   if(!(date||weight||fat)&&assessmentChanged&&a)throw Error('Existing assessments are retained. Enter a corrected or new dated assessment to update them.');
   if(!(rmrDate||rmrKcal)&&rmrChanged&&r)throw Error('Existing RMR tests are retained. Enter a corrected or new dated test to update them.');
   const assessment=assessmentChanged&&(date||weight||fat)?{date:date||null,method,weightKg:Number(weight)*.45359237,bodyFatPercent:Number(fat)}:undefined;
   const rmr=rmrChanged&&(rmrDate||rmrKcal)?{date:rmrDate||null,kcal:Number(rmrKcal)}:undefined;
   const now=new Date(),today=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
   if(assessment?.date>today||rmr?.date>today)throw Error('Use the date the measurement was taken, not a future date.');
   const next=NutritionProfile.upsert(profile,{assessment,rmr});
   // One write: validation and all field parsing complete before storage changes.
   if(localStorage.getItem('athleteNutritionProfile')!==originalProfileRaw)throw Error('Measurements changed while this form was open. Reopen Settings before saving.');
   localStorage.setItem('athleteNutritionProfile',JSON.stringify(next));renderNutritionProfile();$('nutritionProfileStatus').textContent='Measurements saved. These records do not change your calorie target yet.';
  }catch(error){$('nutritionProfileStatus').textContent=error.name==='QuotaExceededError'?'Measurements could not be saved. Free device storage and try again.':error.message}
 };
}
