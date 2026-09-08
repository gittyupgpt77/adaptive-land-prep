from pathlib import Path

app=Path('app.js')
test=Path('tests/nutrition-trend-guardrail.test.cjs')
source=app.read_text()
tests=test.read_text()

def replace(old,new,label):
    global source
    if old not in source: raise SystemExit(f'missing app patch target: {label}')
    source=source.replace(old,new,1)

def treplace(old,new,label):
    global tests
    if old not in tests: raise SystemExit(f'missing test patch target: {label}')
    tests=tests.replace(old,new,1)

replace('return{status:"ready",recentCount:recent.length,priorCount:prior.length,recentAvg,priorAvg,pct,level:pct<=-.01?"red":pct<=-.005?"yellow":"green"}',
        'return{status:"ready",recentCount:recent.length,priorCount:prior.length,recentAvg,priorAvg,pct,lossLbPerWeek:priorAvg-recentAvg,level:pct<=-.01?"red":pct<=-.005?"yellow":"green"}',
        'weight trend weekly pounds')

old='''function nutritionTrendCopy(t){
 if(!t||t.status!=="ready")return"Calibration is still learning. Log body weight on at least four days in each of two consecutive 7-day windows before the app uses weight trend as a fueling guardrail.";
 const pct=Math.abs(t.pct*100).toFixed(1);
 if(t.pct<=-.01)return"Your recent 7-day average is "+pct+"% below the preceding 7-day average. The app will not tighten intake; it adds recovery fuel and prioritizes training quality and recovery.";
 if(t.pct<=-.005)return"Your recent 7-day average is down "+pct+"%. This is within the app’s observation band; intake is not automatically reduced.";
 if(t.pct>=.005)return"Your recent 7-day average is up "+pct+"%. The app does not automatically cut calories from weight trend alone.";
 return"Your recent 7-day average is broadly stable versus the preceding week. The app does not automatically reduce intake from this signal.";
}'''
new='''function nutritionTrendCopy(t,w=prescriptionWeek()){
 const phaseOne=w<=16;
 if(!t||t.status!=="ready")return phaseOne?"Phase 1 prioritizes aggressive fat loss while retaining lean mass. Log body weight on at least four days in each of two consecutive 7-day windows; the weight-trend fueling guardrail only intervenes if loss exceeds 2.7 lb/week.":"Calibration is still learning. Log body weight on at least four days in each of two consecutive 7-day windows before the app uses weight trend as a fueling guardrail.";
 const pct=Math.abs(t.pct*100).toFixed(1),loss=Math.max(0,Number(t.lossLbPerWeek)||0);
 if(phaseOne){
   if(loss>2.7)return"Your recent trend is falling about "+loss.toFixed(1)+" lb/week, above the Phase 1 guardrail. The app adds recovery fuel rather than pushing the deficit harder.";
   if(loss>0)return"Your recent trend is down about "+loss.toFixed(1)+" lb/week. Phase 1 intentionally prioritizes aggressive fat loss; no weight-trend fueling override is applied unless loss exceeds 2.7 lb/week.";
   return"Phase 1 intentionally prioritizes aggressive fat loss. Weight trend is being tracked, but it does not trigger a fueling increase unless loss exceeds 2.7 lb/week.";
 }
 if(t.pct<=-.01)return"Your recent 7-day average is "+pct+"% below the preceding 7-day average. The app will not tighten intake; it adds recovery fuel and prioritizes training quality and recovery.";
 if(t.pct<=-.005)return"Your recent 7-day average is down "+pct+"%. This is within the app’s observation band; intake is not automatically reduced.";
 if(t.pct>=.005)return"Your recent 7-day average is up "+pct+"%. The app does not automatically cut calories from weight trend alone.";
 return"Your recent 7-day average is broadly stable versus the preceding week. The app does not automatically reduce intake from this signal.";
}'''
replace(old,new,'phase-aware nutrition trend copy')

old='''function nutritionPrescription(w,name,dec,referenceDate=new Date()){
 const base={...nutritionForWeek(w,name)},trend=weightTrend(referenceDate),out={...base,adjustment:null,trend};
 const rapidLoss=trend.status==="ready"&&trend.pct<=-.01;
 if(dec?.c==="RED"||rapidLoss){
   out.cal+=200;out.carbs+=50;
   const both=dec?.c==="RED"&&rapidLoss;
   out.adjustment={level:"red",title:"Recovery fueling override",copy:both?"Fueling readiness is red and the 14-day body-weight trend is falling faster than the guardrail. Add energy and carbohydrate today; do not deepen the deficit until recovery and trend normalize.":rapidLoss?"The recent body-weight trend crossed the rapid-loss guardrail. Add energy and carbohydrate today; do not deepen the deficit from this signal.":"Yesterday’s intake was materially below target. Add energy and carbohydrate today and reassess the deficit before returning to aggressive restriction."};
 }else if(dec?.c==="YELLOW"){'''
new='''function nutritionPrescription(w,name,dec,referenceDate=new Date()){
 const base={...nutritionForWeek(w,name)},trend=weightTrend(referenceDate),out={...base,adjustment:null,trend};
 const phaseOne=w<=16,lossLb=trend.status==="ready"?Math.max(0,Number(trend.lossLbPerWeek)||0):0;
 const rapidLoss=trend.status==="ready"&&(phaseOne?lossLb>2.7:trend.pct<=-.01);
 if(dec?.c==="RED"||rapidLoss){
   out.cal+=200;out.carbs+=50;
   const both=dec?.c==="RED"&&rapidLoss,phaseOneRapid=phaseOne&&rapidLoss;
   out.adjustment={level:"red",title:"Recovery fueling override",copy:both?(phaseOneRapid?"Fueling readiness is red and Phase 1 weight loss exceeds 2.7 lb/week. Add energy and carbohydrate today; do not deepen the deficit until the trend returns below the guardrail.":"Fueling readiness is red and the 14-day body-weight trend is falling faster than the guardrail. Add energy and carbohydrate today; do not deepen the deficit until recovery and trend normalize."):rapidLoss?(phaseOneRapid?"Phase 1 weight loss exceeds 2.7 lb/week. Add energy and carbohydrate today; do not deepen the deficit from this signal.":"The recent body-weight trend crossed the rapid-loss guardrail. Add energy and carbohydrate today; do not deepen the deficit from this signal."):"Yesterday’s intake was materially below target. Add energy and carbohydrate today and reassess the deficit before returning to aggressive restriction."};
 }else if(dec?.c==="YELLOW"){'''
replace(old,new,'phase-aware rapid loss rule')

replace('nutritionTrendCopy(target.trend):""','nutritionTrendCopy(target.trend,w):""','pass current week to nutrition copy')
replace('Readiness and body-weight trend override an aggressive deficit when recovery or performance deteriorates.','During Phase 1, the body-weight trend override only applies above 2.7 lb/week of loss; afterward, the normal recovery guardrail applies. Readiness signals remain active throughout.','historical adaptive rule copy')

# Rewrite focused regression coverage around the new phase-specific contract.
start=tests.index("test('rapid weekly-average loss activates the existing recovery-fueling step'")
end=tests.index("test('weight trend alone never automatically cuts calories'",start)
new_tests='''test('Phase 1 allows aggressive loss up to 2.7 lb per week without a weight-trend calorie override',()=>{\n const c=contextWithWeights(dailyWeights(170,168));\n const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));\n assert.equal(trend.status,'ready');\n assert.equal(trend.lossLbPerWeek,2);\n const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));\n assert.equal(target.cal,2000);\n assert.equal(target.carbs,200);\n assert.equal(target.adjustment,null);\n assert.match(c.nutritionTrendCopy(target.trend,10),/no weight-trend fueling override.*unless loss exceeds 2.7 lb\/week/i);\n});\n\ntest('Phase 1 weight-trend guardrail activates only above 2.7 lb per week',()=>{\n const c=contextWithWeights(dailyWeights(170,167));\n const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));\n assert.equal(trend.lossLbPerWeek,3);\n const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));\n assert.equal(target.cal,2200);\n assert.equal(target.carbs,250);\n assert.equal(target.adjustment.level,'red');\n assert.match(target.adjustment.copy,/exceeds 2.7 lb\/week/i);\n});\n\ntest('after Phase 1 the normal percentage-based weight guardrail resumes',()=>{\n const c=contextWithWeights(dailyWeights(170,168));\n const target=c.nutritionPrescription(17,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));\n assert.equal(target.cal,2200);\n assert.equal(target.carbs,250);\n assert.equal(target.adjustment.level,'red');\n assert.match(target.adjustment.copy,/rapid-loss guardrail/i);\n});\n\n'''
tests=tests[:start]+new_tests+tests[end:]

# Existing combined-signal test needs Phase 1 loss above its new threshold.
tests=tests.replace("dailyWeights(170,168),{c:'RED'}","dailyWeights(170,167),{c:'RED'}",1)
tests=tests.replace("assert.match(target.adjustment.copy,/Fueling readiness is red/i);","assert.match(target.adjustment.copy,/Fueling readiness is red.*2.7 lb\\/week/i);",1)

app.write_text(source)
test.write_text(tests)
