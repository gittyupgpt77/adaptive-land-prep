const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function contextWithWeights(weights,decision=null){
 const rows=weights.map(([date,weight])=>({date,weight}));
 const context=vm.createContext({
  logs:()=>rows,
  nutritionForWeek:(w,name)=>({phase:'Test',cal:2000,protein:180,carbs:200,fat:60,why:'Base'}),
  prescriptionWeek:()=>10,sessionName:()=> 'Easy run',savedDecision:()=>decision
 });
 const start=source.indexOf('function weightTrend('),end=source.indexOf('\nfunction todayMealPlan(',start);
 assert.ok(start>=0&&end>start,'trend nutrition functions are present');
 vm.runInContext(source.slice(start,end),context);
 return context;
}

function dailyWeights(prior,recent){
 const out=[];
 for(let i=0;i<7;i++)out.push([`2026-08-${String(25+i).padStart(2,'0')}T08:00:00Z`,prior]);
 for(let i=0;i<7;i++)out.push([`2026-09-${String(1+i).padStart(2,'0')}T08:00:00Z`,recent]);
 return out;
}

test('rapid weekly-average loss activates the existing recovery-fueling step',()=>{
 const c=contextWithWeights(dailyWeights(170,168));
 const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));
 assert.equal(trend.status,'ready');
 assert.equal(trend.level,'red');
 assert.ok(trend.pct<-0.01);
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2200);
 assert.equal(target.carbs,250);
 assert.equal(target.adjustment.level,'red');
 assert.match(target.adjustment.copy,/rapid-loss guardrail/i);
});

test('weight trend alone never automatically cuts calories',()=>{
 const c=contextWithWeights(dailyWeights(168,170));
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2000);
 assert.equal(target.carbs,200);
 assert.equal(target.adjustment,null);
 assert.match(c.nutritionTrendCopy(target.trend),/does not automatically cut calories/i);
});

test('trend calibration stays inactive until both seven-day windows have enough observations',()=>{
 const c=contextWithWeights([
  ['2026-08-30T08:00:00Z',170],['2026-08-31T08:00:00Z',170],
  ['2026-09-04T08:00:00Z',168],['2026-09-05T08:00:00Z',168],['2026-09-06T08:00:00Z',168],['2026-09-07T08:00:00Z',168]
 ]);
 const trend=c.weightTrend(new Date('2026-09-07T12:00:00Z'));
 assert.equal(trend.status,'learning');
 const target=c.nutritionPrescription(10,'Easy run',{c:'GREEN'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2000);
 assert.equal(target.adjustment,null);
});

test('fueling readiness red and rapid loss do not stack duplicate calorie increases',()=>{
 const c=contextWithWeights(dailyWeights(170,168),{c:'RED'});
 const target=c.nutritionPrescription(10,'Easy run',{c:'RED'},new Date('2026-09-07T12:00:00Z'));
 assert.equal(target.cal,2200);
 assert.equal(target.carbs,250);
 assert.match(target.adjustment.copy,/Fueling readiness is red/i);
});
