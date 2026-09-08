from pathlib import Path

app=Path('app.js')
trend_test=Path('tests/nutrition-trend-guardrail.test.cjs')
cal_test=Path('tests/calibration-transparency.test.cjs')
source=app.read_text()
cal=cal_test.read_text()

def replace_function(text,name,next_name,new_body):
    start=text.index('function '+name+'(')
    end=text.index('\nfunction '+next_name+'(',start)
    return text[:start]+new_body+text[end:]

weight_trend='''function weightTrend(referenceDate=new Date()){
 const end=new Date(referenceDate);end.setHours(12,0,0,0);
 const start=new Date(end);start.setDate(start.getDate()-13);
 const buckets=new Map();
 for(const x of logs()){
   const weight=Number(x.weight),d=new Date(x.date);if(!Number.isFinite(weight)||weight<=0||Number.isNaN(d.getTime()))continue;
   d.setHours(12,0,0,0);if(d<start||d>end)continue;
   const key=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(),bucket=buckets.get(key)||{day:new Date(d),weights:[]};bucket.weights.push(weight);buckets.set(key,bucket)
 }
 const daily=[...buckets.values()].map(x=>({day:x.day,weight:x.weights.reduce((s,v)=>s+v,0)/x.weights.length})).sort((a,b)=>a.day-b.day);
 if(daily.length<10)return{status:"learning",observations:daily.length,spanDays:daily.length?Math.round((daily.at(-1).day-daily[0].day)/86400000):0};
 const first=daily[0].day,spanDays=Math.round((daily.at(-1).day-first)/86400000);if(spanDays<12)return{status:"learning",observations:daily.length,spanDays};
 const points=daily.map(x=>({x:(x.day-first)/86400000,y:x.weight})),meanX=points.reduce((s,p)=>s+p.x,0)/points.length,meanY=points.reduce((s,p)=>s+p.y,0)/points.length;
 const denom=points.reduce((s,p)=>s+(p.x-meanX)**2,0),slope=denom?points.reduce((s,p)=>s+(p.x-meanX)*(p.y-meanY),0)/denom:0,weeklyDelta=slope*7,pct=meanY?weeklyDelta/meanY:0;
 return{status:"ready",observations:daily.length,spanDays,meanWeight:meanY,weeklyDelta,lossLbPerWeek:Math.max(0,-weeklyDelta),pct,level:pct<=-.01?"red":pct<=-.005?"yellow":"green"}
}'''
source=replace_function(source,'weightTrend','weightTrendHeadline',weight_trend)

headline='''function weightTrendHeadline(t,latest){
 if(!Number.isFinite(latest))return"No data";
 const weight=latest.toFixed(1)+" lb";
 if(!t||t.status!=="ready")return weight+" · calibrating 14-day trend";
 const pct=Math.abs(t.pct*100).toFixed(1),direction=t.pct<0?"down":t.pct>0?"up":"stable";
 return direction==="stable"?weight+" · 14-day trend stable":weight+" · 14-day trend "+direction+" "+pct+"%/wk";
}'''
source=replace_function(source,'weightTrendHeadline','nutritionTrendCopy',headline)

trend_copy='''function nutritionTrendCopy(t,w=prescriptionWeek()){
 const phaseOne=w<=16;
 if(!t||t.status!=="ready")return phaseOne?"Phase 1 prioritizes aggressive fat loss while retaining lean mass. The app waits for at least 10 weigh-ins spanning 12 or more days before using body weight to change fueling; once established, it only intervenes above 2.7 lb/week of loss.":"Body-weight calibration is still learning. The app waits for at least 10 weigh-ins spanning 12 or more days before using the 14-day trend as a fueling guardrail.";
 const pct=Math.abs(t.pct*100).toFixed(1),loss=Math.max(0,Number(t.lossLbPerWeek)||0);
 if(phaseOne){
   if(loss>2.7)return"The established 14-day trend implies about "+loss.toFixed(1)+" lb/week of loss, above the Phase 1 guardrail. The app adds recovery fuel rather than pushing the deficit harder.";
   if(loss>0)return"The established 14-day trend implies about "+loss.toFixed(1)+" lb/week of loss. Phase 1 intentionally prioritizes aggressive fat loss; body weight does not trigger a fueling increase unless the trend exceeds 2.7 lb/week.";
   return"Phase 1 intentionally prioritizes aggressive fat loss. The established 14-day trend is not losing weight, so no weight-trend fueling increase is applied.";
 }
 if(t.pct<=-.01)return"The established 14-day trend implies a "+pct+"%/week decline. The normal post-Phase-1 recovery guardrail adds fuel rather than deepening the deficit.";
 if(t.pct<=-.005)return"The established 14-day trend implies a "+pct+"%/week decline. This remains in the observation band; intake is not automatically reduced.";
 if(t.pct>=.005)return"The established 14-day trend implies a "+pct+"%/week increase. The app does not automatically cut calories from weight trend alone.";
 return"The established 14-day trend is broadly stable. The app does not automatically reduce intake from this signal.";
}'''
source=replace_function(source,'nutritionTrendCopy','nutritionPrescription',trend_copy)

nutrition='''function nutritionPrescription(w,name,dec,referenceDate=new Date()){
 const base={...nutritionForWeek(w,name)},trend=weightTrend(referenceDate),out={...base,adjustment:null,trend};
 const phaseOne=w<=16,lossLb=trend.status==="ready"?Math.max(0,Number(trend.lossLbPerWeek)||0):0;
 const rapidLoss=trend.status==="ready"&&(phaseOne?lossLb>2.7:trend.pct<=-.01);
 if(dec?.c==="RED"||rapidLoss){
   out.cal+=200;out.carbs+=50;
   const both=dec?.c==="RED"&&rapidLoss,phaseOneRapid=phaseOne&&rapidLoss;
   out.adjustment={level:"red",title:"Recovery fueling override",copy:both?(phaseOneRapid?"Recorded under-fueling is red and the established Phase 1 trend exceeds 2.7 lb/week of loss. Add energy and carbohydrate today; do not deepen the deficit until the trend returns below the guardrail.":"Recorded under-fueling is red and the established 14-day trend is falling faster than the post-Phase-1 guardrail. Add energy and carbohydrate today; do not deepen the deficit until recovery and trend normalize."):rapidLoss?(phaseOneRapid?"The established Phase 1 trend exceeds 2.7 lb/week of loss. Add energy and carbohydrate today; do not deepen the deficit from this signal.":"The established 14-day trend crossed the post-Phase-1 rapid-loss guardrail. Add energy and carbohydrate today; do not deepen the deficit from this signal."):"Yesterday’s recorded intake was materially below target. Add energy and carbohydrate today and reassess the deficit before returning to aggressive restriction."};
 }else if(dec?.c==="YELLOW"){
   out.adjustment={level:"yellow",title:"Carbohydrate timing emphasis",copy:"Recorded fueling is somewhat below the preferred range. Keep daily intake near target, but place more of today’s carbohydrate before and after training."};
 }
 return out
}'''
source=replace_function(source,'nutritionPrescription','todayNutritionPrescription',nutrition)

old_fueling='function fueling(){const w=num("weight"),a=num("weightAvg"),l=num("load"),prev=typeof previousNutritionSignal==="function"?previousNutritionSignal(historicalDate||new Date()):null;if(w===null||a===null||l===null){if(prev&&prev.ratio<.7)return"YELLOW";return""}if((w<a*.985&&l>=7)||(prev&&prev.ratio<.65&&l>=6))return"RED";if((w<a*.99&&l>=5)||(prev&&prev.ratio<.8&&l>=4))return"YELLOW";return"GREEN"}'
new_fueling='function fueling(){const l=num("load"),prev=typeof previousNutritionSignal==="function"?previousNutritionSignal(historicalDate||new Date()):null;if(l===null){if(prev&&prev.ratio<.7)return"YELLOW";return""}if(prev&&prev.ratio<.65&&l>=6)return"RED";if(prev&&prev.ratio<.8&&l>=4)return"YELLOW";return"GREEN"}'
if old_fueling not in source: raise SystemExit('missing acute-weight fueling function')
source=source.replace(old_fueling,new_fueling,1)

if 'nutritionTrendCopy(target.trend):""' not in source: raise SystemExit('missing nutrition trend render call')
source=source.replace('nutritionTrendCopy(target.trend):""','nutritionTrendCopy(target.trend,w):""',1)
old_rule='Readiness and body-weight trend override an aggressive deficit when recovery or performance deteriorates.'
new_rule='Body weight changes fueling only after an established 14-day trend. During Phase 1, that trend must exceed 2.7 lb/week of loss; afterward, the normal recovery guardrail applies. Recorded under-fueling remains an independent readiness signal.'
if old_rule not in source: raise SystemExit('missing historical adaptive rule copy')
source=source.replace(old_rule,new_rule,1)

trend_tests=r'''const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function contextWithWeights(weights,decision=null){
 const rows=weights.map(([date,weight])=>({date,weight}));
 const context=vm.createContext({
  logs:()=>rows,
  nutritionForWeek:()=>({phase:'Test',cal:2000,protein:180,carbs:200,fat:60,why:'Base'}),
  prescriptionWeek:()=>10,sessionName:()=> 'Easy run',savedDecision:()=>decision
 });
 const start=source.indexOf('function weightTrend('),end=source.indexOf('\nfunction todayMealPlan(',start);
 assert.ok(start>=0&&end>start,'trend nutrition functions are present');
 vm.runInContext(source.slice(start,end),context);
 return context;
}

function trendWeights(weeklyLoss,noise=[0,.8,-.6,.4,-.9,.7,-.3,.5,-.5,.9,-.7,.3,-.4,.2]){
 const out=[],start=new Date('2026-08-25T08:00:00Z');
 for(let i=0;i<14;i++){const d=new Date(start);d.setUTCDate(d.getUTCDate()+i);out.push([d.toISOString(),170-weeklyLoss*(i/7)+(noise[i]||0)])}
 return out;
}

test('Phase 1 uses an established 14-day trend and ignores normal day-to-day scale noise',()=>{
 const c=contextWithWeights(trendWeights(2.5));
 const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));
 assert.equal(trend.status,'ready');
 assert.equal(trend.observations,14);
 assert.ok(trend.spanDays>=12);
 assert.ok(trend.lossLbPerWeek>2.2&&trend.lossLbPerWeek<2.7);
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2000);
 assert.equal(target.carbs,200);
 assert.equal(target.adjustment,null);
 assert.match(c.nutritionTrendCopy(target.trend,10),/unless the trend exceeds 2.7 lb\/week/i);
});

test('Phase 1 guardrail activates only when the established trend exceeds 2.7 lb per week',()=>{
 const c=contextWithWeights(trendWeights(3.2));
 const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));
 assert.equal(trend.status,'ready');
 assert.ok(trend.lossLbPerWeek>2.7);
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2200);
 assert.equal(target.carbs,250);
 assert.equal(target.adjustment.level,'red');
 assert.match(target.adjustment.copy,/exceeds 2.7 lb\/week/i);
});

test('large alternating daily fluctuations without a sustained trend do not trigger the Phase 1 guardrail',()=>{
 const noise=[1.8,-1.7,1.5,-1.6,1.9,-1.8,1.6,-1.5,1.7,-1.9,1.8,-1.6,1.5,-1.7];
 const c=contextWithWeights(trendWeights(0,noise));
 const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));
 assert.equal(trend.status,'ready');
 assert.ok(trend.lossLbPerWeek<.5);
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.adjustment,null);
});

test('weight trend cannot affect fueling before enough observations span nearly two weeks',()=>{
 const rows=trendWeights(4).slice(5);
 const c=contextWithWeights(rows);
 const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));
 assert.equal(trend.status,'learning');
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2000);
 assert.equal(target.adjustment,null);
});

test('after Phase 1 the normal percentage-based guardrail uses the established 14-day trend',()=>{
 const c=contextWithWeights(trendWeights(2.2,[0,0,0,0,0,0,0,0,0,0,0,0,0,0]));
 const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));
 assert.ok(trend.pct<-.01);
 const target=c.nutritionPrescription(17,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2200);
 assert.equal(target.adjustment.level,'red');
});

test('rising weight trend alone never automatically cuts calories',()=>{
 const c=contextWithWeights(trendWeights(-1));
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2000);
 assert.equal(target.adjustment,null);
 assert.match(c.nutritionTrendCopy(target.trend,10),/no weight-trend fueling increase/i);
});

test('recorded under-fueling and excessive Phase 1 loss do not stack duplicate calorie increases',()=>{
 const c=contextWithWeights(trendWeights(3.2),{c:'RED'});
 const target=c.nutritionPrescription(10,'Easy run',{c:'RED'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2200);
 assert.equal(target.carbs,250);
 assert.match(target.adjustment.copy,/Recorded under-fueling is red.*2.7 lb\/week/i);
});

test('acute scale drops do not independently change fueling readiness',()=>{
 const start=source.indexOf('function fueling(){'),end=source.indexOf('\nfunction decision()',start);
 const values={weight:160,weightAvg:170,load:8};
 const c=vm.createContext({num:id=>values[id]??null,previousNutritionSignal:()=>null,historicalDate:null});
 vm.runInContext(source.slice(start,end),c);
 assert.equal(c.fueling(),'GREEN');
 const c2=vm.createContext({num:id=>values[id]??null,previousNutritionSignal:()=>({ratio:.6}),historicalDate:null});
 vm.runInContext(source.slice(start,end),c2);
 assert.equal(c2.fueling(),'RED');
});
'''

cal=cal.replace("'170.0 lb · calibrating'","'170.0 lb · calibrating 14-day trend'")
cal=cal.replace("'168.0 lb · 7-day average down 1.2%'","'168.0 lb · 14-day trend down 1.2%/wk'")
cal=cal.replace("'171.0 lb · 7-day average up 0.6%'","'171.0 lb · 14-day trend up 0.6%/wk'")
cal=cal.replace("'170.0 lb · 7-day average stable'","'170.0 lb · 14-day trend stable'")

app.write_text(source)
trend_test.write_text(trend_tests)
cal_test.write_text(cal)
