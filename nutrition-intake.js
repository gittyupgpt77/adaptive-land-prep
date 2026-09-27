'use strict';
// Meal-level records are independent of the target policy and never rewrite a prescription.
const NutritionIntake=(()=>{
 const fields=['calories','protein','carbs','fat'];
 const nutrientKeys={calories:'kcal',protein:'protein',carbs:'carbs',fat:'fat'};
 function validEntry(entry){
  if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!entry.id||
   !['portion','replacement','skipped'].includes(entry.kind))return false;
  if(entry.note!==undefined&&(typeof entry.note!=='string'||entry.note.length>500))return false;
  if(entry.kind==='portion'&&(!Number.isFinite(entry.fraction)||entry.fraction<=0||entry.fraction>2))return false;
  if(entry.kind==='replacement'&&(!Number.isFinite(entry.calories)||entry.calories<0))return false;
  return fields.every(k=>entry[k]==null||(Number.isFinite(entry[k])&&entry[k]>=0));
 }
 function validEntries(entries,meals,confirmed){
  return Array.isArray(entries)&&new Set(entries.map(e=>e?.id)).size===entries.length&&
   entries.every(e=>validEntry(e)&&meals.some(m=>m.id===e.id)&&confirmed.includes(e.id));
 }
 function resolve(meal,entry){
  if(entry&&!validEntry(entry))throw Error('Invalid meal record');
  if(entry&&entry.id!==meal.id)throw Error('Meal identity mismatch');
  const out={};
  for(const key of fields){
   const nutrient=meal.nutrients?.[nutrientKeys[key]];
   const known=nutrient?.complete&&Number.isFinite(nutrient.known)?nutrient.known:
    key==='calories'&&Number.isFinite(meal.kcal)?meal.kcal:null;
   out[key]=entry?.kind==='skipped'?0:entry?.kind==='replacement'?(entry[key]??null):
    known===null?null:known*(entry?.fraction??1);
  }
  return out;
 }
 function summary(meals,confirmed=[],entries=[]){
  if(!validEntries(entries,meals,confirmed))throw Error('Invalid meal records');
  const selected=meals.filter(m=>confirmed.includes(m.id));
  const actual=selected.map(m=>resolve(m,entries.find(e=>e.id===m.id)));
  const totals=Object.fromEntries(fields.map(k=>[k,actual.every(m=>m[k]!==null)?actual.reduce((s,m)=>s+m[k],0):null]));
  return {...totals,recorded:selected.length,complete:meals.length>0&&meals.every(m=>confirmed.includes(m.id)),
   remainingMeals:meals.filter(m=>!confirmed.includes(m.id)).map(m=>m.id)};
 }
 return {validEntry,validEntries,resolve,summary};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NutritionIntake;
