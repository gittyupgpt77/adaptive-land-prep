/* Pure calculation layer. Not yet connected to live prescriptions.
 * Energy estimates must come from an explicit profile; never infer TDEE from RMR alone.
 * Policy choices and release blockers: docs/NUTRITION_MODEL.md.
 */
'use strict';
const NutritionCore=(()=>{
 const phases=[
  {id:'foundation',from:1,to:16,goal:'Fat loss with recovery protected',deficitFraction:null,proteinGKg:2.2},
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
 function targets({week,weightKg,maintenanceKcal,workload,recovery=false,foundationDeficitFraction}){
  const phase=phaseForWeek(week);
  if(!Number.isFinite(weightKg)||weightKg<=0)return{status:'needs-body-mass',phase};
  if(!Number.isFinite(maintenanceKcal)||maintenanceKcal<=0)return{status:'needs-energy-estimate',phase};
  const band=carbohydrateBands[workload];
  if(!band)return{status:'needs-workload',phase};
  // No implicit replacement of the athlete's fat-loss goal with a default deficit.
  const deficit=phase.id==='foundation'?foundationDeficitFraction:phase.deficitFraction;
  if(phase.id==='foundation'&&(!Number.isFinite(deficit)||deficit<0||deficit>=1))
   return {status:'needs-fat-loss-policy',phase};
  const protein=Math.round(weightKg*phase.proteinGKg),carbFloor=Math.ceil(weightKg*band[0]);
  const requested=maintenanceKcal*(1-(recovery?0:deficit));
  const macroFloor=(protein*4+carbFloor*4)/.75;
  // These draft reference bands are not clinical minima. Surface the conflict
  // for discussion instead of silently raising calories or ignoring the conflict.
  if(macroFloor>requested)return {status:'needs-policy-review',phase,
   requestedEnergyKcal:requested,referenceEnergyKcal:macroFloor,
   foundationDeficitFraction:phase.id==='foundation'?deficit:null,
   reason:'Requested energy conflicts with the draft workload and macro assumptions'};
  const energy=Math.ceil(requested/25)*25;
  const fat=Math.round(energy*.25/9),carbs=Math.max(carbFloor,Math.ceil((energy-protein*4-fat*9)/4));
  return {status:'estimate',phase,cal:protein*4+carbs*4+fat*9,protein,carbs,fat,
   maintenanceKcal,workload,carbohydrateBandGKg:[...band],
   foundationDeficitFraction:phase.id==='foundation'?deficit:null,
   reasons:[recovery?'Deliberate deficit suspended for recovery':phase.goal]};
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
 // Bounded numerical fit only: success does not establish dietary adequacy.
 function portionPlan({target,meals,confirmed=[]},catalog){
  const keys=['kcal','protein','carbs','fat'];
  const wanted=[target?.cal,target?.protein,target?.carbs,target?.fat];
  if(wanted.some(v=>!Number.isFinite(v)||v<=0))throw Error('Positive finite targets required');
  if(!Array.isArray(meals)||!meals.length||!Array.isArray(confirmed))throw Error('Meals required');
  const ids=meals.map(m=>m.id),savedIds=confirmed.map(m=>m.id);
  if(ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length||
   new Set(savedIds).size!==savedIds.length||savedIds.some(id=>!ids.includes(id)))throw Error('Ambiguous meal identity');
  const frozen=JSON.parse(JSON.stringify(confirmed));
  if(confirmed.some(m=>keys.some(k=>!m.nutrients?.[k]?.complete||!Number.isFinite(m.nutrients[k].known)||m.nutrients[k].known<0)))
   return {status:'needs-known-intake',confirmed:frozen,planned:[],nutritionAdequacy:'unassessed'};
  const pending=JSON.parse(JSON.stringify(meals.filter(m=>!savedIds.includes(m.id))));
  const eaten=keys.map(k=>confirmed.reduce((s,m)=>s+m.nutrients[k].known,0));
  const achieved=[...eaten],variables=[];
  for(const meal of pending){
   const nutrients=totalIngredients(meal.ingredients,catalog);
   if(keys.some(k=>!nutrients[k].complete))return {status:'needs-food-data',confirmed:frozen,planned:[],nutritionAdequacy:'unassessed'};
   keys.forEach((k,j)=>achieved[j]+=nutrients[k].known);
   for(const item of meal.ingredients){
    if(!item.portion)continue;
    const {minGrams:min,maxGrams:max,stepGrams:step}=item.portion;
    if(![min,max,step].every(Number.isFinite)||min<=0||max<min||step<=0||item.grams<min||item.grams>max)
     throw Error('Invalid portion bounds');
    const food=catalog.foods[item.foodId];
    variables.push({item,min,max,step,coeff:keys.map(k=>food.nutrients[k]/food.basisGrams)});
   }
  }
  // Relative tolerances are computational acceptance criteria, not safety thresholds.
  const tolerance=wanted.map((v,j)=>v*(j===0?.05:.10));
  const shift=(v,next)=>{const delta=next-v.item.grams;v.item.grams=next;v.coeff.forEach((c,j)=>achieved[j]+=c*delta);};
  for(let pass=0;pass<500;pass++){
   let movement=0;
   for(const v of variables){
    const denom=v.coeff.reduce((s,c,j)=>s+(c/tolerance[j])**2,0);
    if(!denom)continue;
    const delta=-v.coeff.reduce((s,c,j)=>s+c*(achieved[j]-wanted[j])/tolerance[j]**2,0)/denom;
    const next=Math.max(v.min,Math.min(v.max,v.item.grams+delta));
    movement=Math.max(movement,Math.abs(next-v.item.grams));shift(v,next);
   }
   if(movement<.001)break;
  }
  // Round within the bounded gram grid, then recompute from source data.
  for(const v of variables){
   const steps=Math.min(Math.floor((v.max-v.min)/v.step),Math.max(0,Math.round((v.item.grams-v.min)/v.step)));
   v.item.grams=v.min+steps*v.step;
  }
  const planned=pending.map(m=>recipeSnapshot(m,catalog));
  const totals=Object.fromEntries(keys.map((k,j)=>[k,eaten[j]+planned.reduce((s,m)=>s+m.nutrients[k].known,0)]));
  const residual=Object.fromEntries(keys.map((k,j)=>[k,totals[k]-wanted[j]]));
  const fits=keys.every((k,j)=>Math.abs(residual[k])<=tolerance[j]);
  return {status:pending.length?(fits?'candidate':'cannot-fit'):'complete',confirmed:frozen,planned,
   totals,residual,matchesTarget:fits,nutritionAdequacy:'unassessed',
   exceededByConfirmed:keys.filter((k,j)=>eaten[j]>wanted[j])};
 }
 return {phaseForWeek,targets,totalIngredients,recipeSnapshot,remainingTargets,portionPlan};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NutritionCore;
