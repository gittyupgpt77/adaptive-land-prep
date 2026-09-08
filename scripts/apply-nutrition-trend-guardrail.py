from pathlib import Path

app=Path('app.js')
source=app.read_text()

def replace_once(old,new,label):
    global source
    if old not in source:
        raise SystemExit(f'missing patch target: {label}')
    source=source.replace(old,new,1)

marker='function mealPlanForWeek(w){return baseMealPlan(w)}\n'
insert=r'''function weightTrend(referenceDate=new Date()){
 const end=new Date(referenceDate);end.setHours(23,59,59,999);
 const recentStart=new Date(end);recentStart.setDate(recentStart.getDate()-6);recentStart.setHours(0,0,0,0);
 const priorEnd=new Date(recentStart);priorEnd.setMilliseconds(-1);
 const priorStart=new Date(recentStart);priorStart.setDate(priorStart.getDate()-7);
 const rows=logs().filter(x=>Number.isFinite(Number(x.weight))&&Number(x.weight)>0&&new Date(x.date)<=end);
 const inWindow=(a,b)=>rows.filter(x=>{const d=new Date(x.date);return d>=a&&d<=b}).map(x=>Number(x.weight));
 const recent=inWindow(recentStart,end),prior=inWindow(priorStart,priorEnd);
 if(recent.length<4||prior.length<4)return{status:"learning",recentCount:recent.length,priorCount:prior.length};
 const mean=a=>a.reduce((s,x)=>s+x,0)/a.length,recentAvg=mean(recent),priorAvg=mean(prior),pct=(recentAvg-priorAvg)/priorAvg;
 return{status:"ready",recentCount:recent.length,priorCount:prior.length,recentAvg,priorAvg,pct,level:pct<=-.01?"red":pct<=-.005?"yellow":"green"}
}
function nutritionTrendCopy(t){
 if(!t||t.status!=="ready")return"Calibration is still learning. Log body weight on at least four days in each of two consecutive 7-day windows before the app uses weight trend as a fueling guardrail.";
 const pct=Math.abs(t.pct*100).toFixed(1);
 if(t.pct<=-.01)return"Your recent 7-day average is "+pct+"% below the preceding 7-day average. The app will not tighten intake; it adds recovery fuel and prioritizes training quality and recovery.";
 if(t.pct<=-.005)return"Your recent 7-day average is down "+pct+"%. This is within the app’s observation band; intake is not automatically reduced.";
 if(t.pct>=.005)return"Your recent 7-day average is up "+pct+"%. The app does not automatically cut calories from weight trend alone.";
 return"Your recent 7-day average is broadly stable versus the preceding week. The app does not automatically reduce intake from this signal.";
}
function nutritionPrescription(w,name,dec,referenceDate=new Date()){
 const base={...nutritionForWeek(w,name)},trend=weightTrend(referenceDate),out={...base,adjustment:null,trend};
 const rapidLoss=trend.status==="ready"&&trend.pct<=-.01;
 if(dec?.c==="RED"||rapidLoss){
   out.cal+=200;out.carbs+=50;
   const both=dec?.c==="RED"&&rapidLoss;
   out.adjustment={level:"red",title:"Recovery fueling override",copy:both?"Fueling readiness is red and the 14-day body-weight trend is falling faster than the guardrail. Add energy and carbohydrate today; do not deepen the deficit until recovery and trend normalize.":rapidLoss?"The recent body-weight trend crossed the rapid-loss guardrail. Add energy and carbohydrate today; do not deepen the deficit from this signal.":"Yesterday’s intake was materially below target. Add energy and carbohydrate today and reassess the deficit before returning to aggressive restriction."};
 }else if(dec?.c==="YELLOW"){
   out.adjustment={level:"yellow",title:"Carbohydrate timing emphasis",copy:"Fueling is somewhat below the preferred range. Keep daily intake near target, but place more of today’s carbohydrate before and after training."};
 }
 return out
}
'''
if marker not in source: raise SystemExit('missing mealPlanForWeek marker')
source=source.replace(marker,marker+insert,1)

old=r'''function todayNutritionPrescription(w=prescriptionWeek(),name=sessionName()){
 const base={...nutritionForWeek(w,name)},dec=savedDecision(),out={...base,adjustment:null};
 if(dec?.c==="RED"){
   out.cal+=200;out.carbs+=50;
   out.adjustment={level:"red",title:"Recovery fueling override",copy:"Yesterday’s intake was materially below target. Add energy and carbohydrate today and reassess the deficit before returning to aggressive restriction."};
 }else if(dec?.c==="YELLOW"){
   out.adjustment={level:"yellow",title:"Carbohydrate timing emphasis",copy:"Fueling is somewhat below the preferred range. Keep daily intake near target, but place more of today’s carbohydrate before and after training."};
 }
 return out
}'''
new='function todayNutritionPrescription(w=prescriptionWeek(),name=sessionName()){return nutritionPrescription(w,name,savedDecision(),new Date())}'
replace_once(old,new,'today nutrition prescription')

old='const prev=previousNutritionSignal();$("nutritionInfluence").innerHTML=prev?\'<strong>Yesterday’s fueling signal</strong><p>\'+Math.round(prev.ratio*100)+\'% of planned intake was recorded. \'+(prev.ratio<.8?"Today’s readiness engine will treat this as a fueling caution when training load is high.":"No fueling penalty is currently indicated.")+\'</p>\':\'<strong>How nutrition changes training</strong><p>Saved intake carries into tomorrow’s fueling status. Substantial under-fueling on a high-load day can downgrade the next prescription even when HRV looks favorable.</p>\';'
new='const prev=previousNutritionSignal(),trendCopy=nutritionTrendCopy(target.trend);$("nutritionInfluence").innerHTML=(prev?\'<strong>Yesterday’s fueling signal</strong><p>\'+Math.round(prev.ratio*100)+\'% of planned intake was recorded. \'+(prev.ratio<.8?"Today’s readiness engine will treat this as a fueling caution when training load is high.":"No fueling penalty is currently indicated.")+\'</p>\':\'<strong>How nutrition changes training</strong><p>Saved intake carries into tomorrow’s fueling status. Substantial under-fueling on a high-load day can downgrade the next prescription even when HRV looks favorable.</p>\')+\'<strong>Body-weight calibration</strong><p>\'+trendCopy+\'</p>\';'
replace_once(old,new,'nutrition influence trend copy')

old=r'''function nutritionHtmlForDate(d,x){
 const log=getNutritionLog(d),check=checkinForDate(d),n={...nutritionForWeek(x.w,x.name)},dec=check?.decision;
 let adjustment=null;
 if(Number(log.targetCalories)>0){n.cal=Number(log.targetCalories);if(Number(log.targetProtein)>=0)n.protein=Number(log.targetProtein);if(Number(log.targetCarbs)>=0)n.carbs=Number(log.targetCarbs);if(Number(log.targetFat)>=0)n.fat=Number(log.targetFat)}
 else if(dec?.c==="RED"){n.cal+=200;n.carbs+=50;adjustment={level:"red",title:"Recovery fueling override",copy:"This day’s saved readiness decision called for additional carbohydrate and a review of the energy deficit."}}
 else if(dec?.c==="YELLOW"){adjustment={level:"yellow",title:"Carbohydrate timing emphasis",copy:"This day’s saved readiness decision called for keeping intake near target while emphasizing carbohydrate around training."}}
 const meals=Array.isArray(log.prescribedMeals)&&log.prescribedMeals.length?log.prescribedMeals:mealPlanForTarget(x.w,n);'''
new=r'''function nutritionHtmlForDate(d,x){
 const log=getNutritionLog(d),check=checkinForDate(d),savedTarget=Number(log.targetCalories)>0,n=savedTarget?{...nutritionForWeek(x.w,x.name)}:nutritionPrescription(x.w,x.name,check?.decision,d);
 let adjustment=savedTarget?null:n.adjustment;
 if(savedTarget){n.cal=Number(log.targetCalories);if(Number(log.targetProtein)>=0)n.protein=Number(log.targetProtein);if(Number(log.targetCarbs)>=0)n.carbs=Number(log.targetCarbs);if(Number(log.targetFat)>=0)n.fat=Number(log.targetFat)}
 const meals=Array.isArray(log.prescribedMeals)&&log.prescribedMeals.length?log.prescribedMeals:mealPlanForTarget(x.w,n);'''
replace_once(old,new,'historical nutrition reconstruction')

if 'function nutritionPrescription(' not in source or 'Body-weight calibration' not in source:
    raise SystemExit('trend guardrail not installed')
app.write_text(source)
