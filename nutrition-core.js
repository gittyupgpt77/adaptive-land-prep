/* Pure calculation layer. Not yet connected to live prescriptions.
 * Energy estimates must come from an explicit profile; never infer TDEE from RMR alone.
 * Policy choices and release blockers: docs/NUTRITION_MODEL.md.
 */
'use strict';
const NutritionCore=(()=>{
 const phases=[
  {id:'foundation',from:1,to:16,goal:'Fat loss with recovery protected',deficitFraction:.15,proteinGKg:2.2},
  {id:'engine',from:17,to:32,goal:'Fuel increasing training; end deliberate deficit',deficitFraction:0,proteinGKg:2},
  {id:'specificity',from:33,to:44,goal:'Support specific training and recovery',deficitFraction:0,proteinGKg:2},
  {id:'peak',from:45,to:52,goal:'Support completed and upcoming workload',deficitFraction:0,proteinGKg:2},
  {id:'taper',from:53,to:56,goal:'Reduce workload fuel without restarting fat loss',deficitFraction:0,proteinGKg:2}
 ];
 // Lower edges of ACSM carbohydrate planning bands, not diagnostic minima.
 const carbohydrateBands={light:[3,5],moderate:[5,7],high:[6,10],veryHigh:[8,12]};
 function phaseForWeek(week){
  if(!Number.isInteger(week)||week<1||week>56)throw Error('Invalid prescription week');
  return {...phases.find(p=>week>=p.from&&week<=p.to)};
 }
 function targets({week,weightKg,maintenanceKcal,workload,recovery=false}){
  const phase=phaseForWeek(week);
  if(!Number.isFinite(weightKg)||weightKg<=0)return{status:'needs-body-mass',phase};
  if(!Number.isFinite(maintenanceKcal)||maintenanceKcal<=0)return{status:'needs-energy-estimate',phase};
  const band=carbohydrateBands[workload];
  if(!band)return{status:'needs-workload',phase};
  const protein=Math.round(weightKg*phase.proteinGKg),carbFloor=Math.ceil(weightKg*band[0]);
  const requested=maintenanceKcal*(1-(recovery?0:phase.deficitFraction));
  const macroFloor=(protein*4+carbFloor*4)/.75;
  const energy=Math.ceil(Math.max(requested,macroFloor)/25)*25;
  const fat=Math.round(energy*.25/9),carbs=Math.max(carbFloor,Math.ceil((energy-protein*4-fat*9)/4));
  return {status:'estimate',phase,cal:protein*4+carbs*4+fat*9,protein,carbs,fat,
   maintenanceKcal,workload,carbohydrateBandGKg:[...band],
   deficitLimitedByFuel:macroFloor>requested,
   reasons:[recovery?'Deliberate deficit suspended for recovery':phase.goal,
    ...(macroFloor>requested?['Workload fueling takes priority over the requested deficit']:[])]};
 }
 function totalIngredients(ingredients,catalog){
  if(!Array.isArray(ingredients)||!ingredients.length)throw Error('Ingredients required');
  const result=Object.fromEntries(Object.keys(catalog.units).map(k=>[k,{known:0,missing:[]}])) ;
  for(const item of ingredients){
   const food=catalog.foods[item.foodId];
   if(!food||!Number.isFinite(item.grams)||item.grams<=0||!Number.isFinite(food.basisGrams)||food.basisGrams<=0)throw Error('Invalid ingredient');
   for(const [key,out] of Object.entries(result)){
    const value=food.nutrients[key];
    if(value===null||value===undefined)out.missing.push(item.foodId);
    else if(!Number.isFinite(value)||value<0)throw Error('Invalid nutrient');
    else out.known+=value*item.grams/food.basisGrams;
   }
  }
  return Object.fromEntries(Object.entries(result).map(([key,out])=>[key,{...out,complete:out.missing.length===0,unit:catalog.units[key]}]));
 }
 function recipeSnapshot(recipe,catalog){
  const nutrients=totalIngredients(recipe.ingredients,catalog);
  if(!nutrients.kcal.complete)throw Error('Recipe energy is unknown');
  return {id:recipe.id,name:recipe.name,ingredients:recipe.ingredients.map(i=>({...i})),
   kcal:nutrients.kcal.known,nutrients,catalogVersion:catalog.schemaVersion,
   sources:[...new Set(recipe.ingredients.map(i=>catalog.foods[i.foodId].source))]};
 }
 function remainingTargets(target,confirmed){
  const keys={cal:'kcal',protein:'protein',carbs:'carbs',fat:'fat'},out={};
  for(const [key,nutrient] of Object.entries(keys)){
   const known=confirmed.every(m=>m.nutrients?.[nutrient]?.complete);
   out[key]=known?Math.max(0,target[key]-confirmed.reduce((s,m)=>s+m.nutrients[nutrient].known,0)):null;
  }
  return out;
 }
 return {phaseForWeek,targets,totalIngredients,recipeSnapshot,remainingTargets};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NutritionCore;
