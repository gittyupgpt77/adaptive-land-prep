const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function contextWithWeights(weights,decision=null){
 const rows=weights.map(([date,weight])=>({date,weight}));
 const context=vm.createContext({dayDate:()=>new Date(),
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
 const c=vm.createContext({dayDate:()=>new Date(),num:id=>values[id]??null,previousNutritionSignal:()=>null,historicalDate:null});
 vm.runInContext(source.slice(start,end),c);
 assert.equal(c.fueling(),'GREEN');
 const c2=vm.createContext({dayDate:()=>new Date(),num:id=>values[id]??null,previousNutritionSignal:()=>({ratio:.6}),historicalDate:null});
 vm.runInContext(source.slice(start,end),c2);
 assert.equal(c2.fueling(),'RED');
});
