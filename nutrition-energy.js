/* Provisional planning estimates, not measured expenditure or validated safety limits.
 * Sources and conservative boundaries are documented in docs/NUTRITION_MODEL.md.
 */
const NutritionEnergy=(()=>{
 const profileModel=typeof NutritionProfile!=='undefined'?NutritionProfile:require('./nutrition-profile');
 function minutes(text){
  const m=/^(?:~|≈\s*)?(\d+)(?:[–-](\d+))?\s*min(?:utes)?(?:\s+total)?$/i.exec((text||'').trim());
  return m&&+m[1]>0&&+(m[2]||m[1])>=+m[1]?{low:+m[1],high:+(m[2]||m[1])}:null;
 }
 function sessionEstimate(session,weightKg,history=[],referenceDate=new Date()){
  const total=minutes(session?.duration);
  if(!total||!Number.isFinite(weightKg)||weightKg<=0)return {status:'needs-session-dose'};
  const samples=history.filter(w=>w.prescription?.type===session.type&&w.prescription?.effort===session.effort&&w.completed==='YES'&&Number.isFinite(w.activeCalories)&&w.activeCalories>0&&Number.isFinite(w.duration)&&w.duration>0&&
   new Date(w.date)<referenceDate&&(referenceDate-new Date(w.date))/86400000<=21).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  if(samples.length>=3){
   const rates=samples.map(w=>w.activeCalories/w.duration).sort((a,b)=>a-b);
   return {status:'estimate',low:rates[0]*total.low,high:rates.at(-1)*total.high,
    central:rates[Math.floor(rates.length/2)]*(total.low+total.high)/2,
    source:'recent wearable active-energy estimates',samples:samples.length};
  }
  let low=0,high=0,timedLow=0,timedHigh=0;
  const segments=[];let untimedStrength=false;
  for(const e of session.steps||[]){
   const duration=minutes(e.dose);
   // MET mapping requires a known activity. No pace, watts or loaded-ruck guess.
   let met;
   if(e.type==='Row'){
    // Watts are absent: report unresolved instead of assuming <100 W or vigorous rowing.
    return {status:'needs-rowing-power'};
   }else if(e.type==='Run'||e.type==='Carry'||e.type==='Ruck'||e.type==='Endurance'||e.type==='Aerobic'||e.type==='Recovery'){
    return {status:'needs-activity-calibration'};
   }else if(e.type==='Strength'||e.type==='Bodyweight'||e.type==='Core'||e.type==='Durability'){
    untimedStrength=true;continue;
   }else if(e.type==='Mobility'||e.type==='Reminder'){
    if(!duration)return {status:'needs-session-dose'};
    met=2.3;
   }else return {status:'needs-activity-calibration'};
   // Net above the resting hour; baseline activity is separately identified below.
   low+=(met-1)*weightKg*duration.low/60;high+=(met-1)*weightKg*duration.high/60;
   timedLow+=duration.low;timedHigh+=duration.high;segments.push({activity:e.name,met,minutes:duration});
  }
  if(timedLow>total.high)return {status:'needs-session-dose'};
  if(untimedStrength){
   const a=Math.max(0,total.low-timedHigh),b=Math.max(0,total.high-timedLow);
   low+=2.5*weightKg*a/60;high+=2.5*weightKg*b/60;
   segments.push({activity:'Resistance work including between-set rests',met:3.5,minutes:{low:a,high:b}});
  }
  if(!segments.length)return {status:'needs-session-dose'};
  return {status:'estimate',low,high,segments};
 }
 function derive({week,base,profile,session,trend,history=[],referenceDate=new Date()}){
  if(!profileModel.valid(profile))return {...base,energyStatus:'needs-measurements'};
  const localDay=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const cutoff=localDay(referenceDate),allowUndated=cutoff>=localDay(new Date());
  const asOf={...profile,assessments:profile.assessments.filter(a=>a.date?a.date<=cutoff:allowUndated),rmrTests:profile.rmrTests.filter(r=>r.date?r.date<=cutoff:allowUndated)};
  const latest=profileModel.latest(asOf),assessment=latest.assessment,rmr=latest.rmr;
  if(!assessment||!rmr)return {...base,energyStatus:'needs-measurements'};
  const observedKg=trend?.status==='ready'&&Number.isFinite(trend.meanWeight)?trend.meanWeight*.45359237:assessment.weightKg;
  const exercise=sessionEstimate(session,observedKg,history,referenceDate);
  const baselinePal=profile.backgroundPal??1.4;
  const maintenance=rmr.kcal*baselinePal+(exercise.status==='estimate'?(exercise.central??(exercise.low+exercise.high)/2):0);
  if(!Number.isFinite(maintenance)||maintenance<1450||maintenance>10000)return {...base,energyStatus:'needs-energy-review'};
  const leanReference=assessment.weightKg*(1-assessment.bodyFatPercent/100);
  const projectedFatKg=Math.max(0,Math.min(assessment.weightKg-leanReference,observedKg-leanReference));
  const fatReferenceKcal=projectedFatKg/.45359237*31;
  const reachedWeight=profile.goalWeightKg!=null&&trend?.status==='ready'&&observedKg<=profile.goalWeightKg;
  const reachedFat=profile.goalBodyFatPercent!=null&&assessment.bodyFatPercent<=profile.goalBodyFatPercent;
  const cutting=week<=16&&!reachedWeight&&!reachedFat;
  // The existing initial intake remains a floor, not a guarantee of adequacy.
  // The historical fat model may raise intake; it never deepens the initial cut.
  // With unquantified activity, retain the program reference rather than pretend
  // the resting/background estimate covers the entire training day.
  const requested=cutting?Math.max(base.cal,maintenance-fatReferenceKcal):exercise.status==='estimate'?maintenance:Math.max(base.cal,maintenance);
  const protein=base.protein,fat=cutting?Math.max(base.fat,Math.round(requested*.25/9)):Math.round(requested*.25/9);
  const carbs=Math.max(0,Math.ceil((requested-protein*4-fat*9)/4));
  const cal=protein*4+carbs*4+fat*9;
  return {...base,cal,protein,carbs,fat,energyStatus:exercise.status==='estimate'?'estimate':'provisional-activity',
   phase:cutting?'Foundation · fat loss':week<=16?'Foundation · goal reached':week>=53?'Taper · workload fueling':'Performance · workload fueling',
   why:cutting?'Initial intake is retained unless the changing fat-mass reference calls for more fuel. This projection assumes lean mass is unchanged.':exercise.status==='estimate'?'Deliberate fat-loss restriction is off. Intake is estimated from resting metabolism, background activity and today’s work.':'Deliberate restriction is off. The program reference and resting/background estimate are retained until training energy can be estimated from comparable sessions.',
   energyModel:{maintenanceEstimateKcal:exercise.status==='estimate'?maintenance:null,backgroundEnergyKcal:rmr.kcal*baselinePal,baselinePal,
    exerciseKcalRange:exercise.status==='estimate'?[exercise.low,exercise.high]:null,exerciseSource:exercise.source||'activity reference',activityStatus:exercise.status,fatReferenceKcal,
    bodyCompositionSource:trend?.status==='ready'?'lean-mass-preserved projection':'recorded assessment',rmrDate:rmr.date,assessmentDate:assessment.date,cutting}};
 }
 function validModel(m){
  if(!m||typeof m!=='object'||typeof m.cutting!=='boolean')return false;
  for(const k of ['maintenanceEstimateKcal','backgroundEnergyKcal','fatReferenceKcal'])if(m[k]!=null&&(!Number.isFinite(m[k])||m[k]<0))return false;
  if(![1.4,1.6,1.8].includes(m.baselinePal))return false;
  if(m.exerciseKcalRange!=null&&(!Array.isArray(m.exerciseKcalRange)||m.exerciseKcalRange.length!==2||!m.exerciseKcalRange.every(x=>Number.isFinite(x)&&x>=0)||m.exerciseKcalRange[1]<m.exerciseKcalRange[0]))return false;
  return true;
 }
 return {minutes,sessionEstimate,derive,validModel};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NutritionEnergy;
