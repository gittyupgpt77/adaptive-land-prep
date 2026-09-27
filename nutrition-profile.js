'use strict';
const NutritionProfile=(()=>{
 const methods=['dexa','bia','calipers','estimate'];
 const positive=n=>Number.isFinite(n)&&n>0;
 function date(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const parsed=new Date(value+'T12:00:00Z');
  return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
 }
 function valid(profile){
  if(!profile||profile.schemaVersion!==1||!Array.isArray(profile.assessments)||!Array.isArray(profile.rmrTests))return false;
  if(profile.backgroundPal!=null&&![1.4,1.6,1.8].includes(profile.backgroundPal))return false;
  if(profile.goalWeightKg!=null&&!positive(profile.goalWeightKg))return false;
  if(profile.goalBodyFatPercent!=null&&(!positive(profile.goalBodyFatPercent)||profile.goalBodyFatPercent>=100))return false;
  if(!profile.assessments.every(a=>a&&(a.date===null||date(a.date))&&positive(a.weightKg)&&positive(a.bodyFatPercent)&&a.bodyFatPercent<100&&methods.includes(a.method)))return false;
  if(!profile.rmrTests.every(r=>r&&(r.date===null||date(r.date))&&positive(r.kcal)))return false;
  return new Set(profile.assessments.map(a=>a.date)).size===profile.assessments.length&&new Set(profile.rmrTests.map(r=>r.date)).size===profile.rmrTests.length;
 }
 function upsert(profile,{assessment,rmr}){
  const next=JSON.parse(JSON.stringify(profile||{schemaVersion:1,assessments:[],rmrTests:[]}));
  if(!valid(next))throw Error('Invalid nutrition profile');
  if(assessment)next.assessments=[...next.assessments.filter(a=>a.date!==assessment.date),{...assessment}];
  if(rmr)next.rmrTests=[...next.rmrTests.filter(r=>r.date!==rmr.date),{...rmr}];
  if(!valid(next))throw Error('Enter valid paired measurements; leave an unknown date blank');
  next.assessments.sort((a,b)=>(a.date||'').localeCompare(b.date||''));next.rmrTests.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  return next;
 }
 function latest(profile){
  if(!valid(profile))throw Error('Invalid nutrition profile');
  const last=items=>[...items].sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0]||null;
  return {assessment:last(profile.assessments),rmr:last(profile.rmrTests)};
 }
 return {valid,upsert,latest};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NutritionProfile;
