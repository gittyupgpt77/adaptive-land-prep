const fs=require('node:fs');
const path=require('node:path');
const appPath=path.join(__dirname,'../app.js');
let source=fs.readFileSync(appPath,'utf8');

const oldBlock=` if(p.name==="Foundation")return[
  [base("Seven-day operating rhythm",stats.checkins>=7,stats.checkins/7,stats.checkins+"/7 check-ins"),base("Eight strength sessions",stats.strength>=8,stats.strength/8,stats.strength+"/8 strength"),base("Eight aerobic sessions",stats.aerobic>=8,stats.aerobic/8,stats.aerobic+"/8 aerobic"),base("Fourteen complete days",stats.completeDays>=14,stats.completeDays/14,stats.completeDays+"/14 complete days")],
  [base("Body fat under 18%",b.bodyFat!=null&&b.bodyFat<18,b.bodyFat==null?0:Math.min(1,28/Math.max(b.bodyFat,1)),"Current: "+(b.bodyFat??"—")+"%"),base("60 strict push-ups",(b.pushups||0)>=60,(b.pushups||0)/60,(b.pushups||0)+"/60"),base("12 strict pull-ups",(b.pullups||0)>=12,(b.pullups||0)/12,(b.pullups||0)+"/12"),base("No unresolved curriculum debt",unresolvedInPhase(p)===0,unresolvedInPhase(p)?0:1,unresolvedInPhase(p)+" unresolved")]
 ];`;
const newBlock=` if(p.name==="Foundation")return[
  [base("Seven-day operating rhythm",stats.checkins>=7,stats.checkins/7,stats.checkins+"/7 check-ins"),base("Eight strength sessions",stats.strength>=8,stats.strength/8,stats.strength+"/8 strength"),base("Eight aerobic sessions",stats.aerobic>=8,stats.aerobic/8,stats.aerobic+"/8 aerobic"),base("Fourteen complete days",stats.completeDays>=14,stats.completeDays/14,stats.completeDays+"/14 complete days")]
 ];`;
if(source.includes(oldBlock))source=source.replace(oldBlock,newBlock);
else if(!source.includes(newBlock))throw new Error('Foundation objective block no longer matches branch');
fs.writeFileSync(appPath,source);

const testPath=path.join(__dirname,'../tests/phase-objective-intent.test.cjs');
fs.writeFileSync(testPath,`const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function objectiveContext(){
 const ctx=vm.createContext({
  parseClock:v=>v?1500:null,
  unresolvedInPhase:()=>0,
  todayCheckin:()=>null,
  getNutritionLog:()=>({saved:false})
 });
 const start=source.indexOf('function objectiveSetsForPhase('),end=source.indexOf('\\nfunction phaseExitQualified(',start);
 assert.ok(start>=0&&end>start,'phase objective function is present');
 vm.runInContext(source.slice(start,end),ctx);
 return ctx;
}

const stats={checkins:7,strength:8,aerobic:8,loaded:0,completeDays:14,mastery:.8};

test('Phase 1 qualification is based on operating consistency rather than absolute performance benchmarks',()=>{
 const c=objectiveContext();
 const sets=c.objectiveSetsForPhase({name:'Foundation'},stats,{bodyFat:30,pushups:1,pullups:0});
 assert.equal(sets.length,1);
 assert.equal(sets[0].length,4);
 assert.ok(sets[0].every(x=>x.done));
 assert.equal(sets.flat().some(x=>/body fat|push-up|pull-up/i.test(x.name)),false);
});

test('later phases retain performance qualification when performance becomes a program objective',()=>{
 const c=objectiveContext();
 const sets=c.objectiveSetsForPhase({name:'Engine + Load'}, {...stats,loaded:12,completeDays:28,aerobic:16,mastery:.8},{run4:'25:00',ruckMiles:12,ruckWeight:30,ruckComfortable:'YES'});
 assert.equal(sets.flat().some(x=>/4 miles under 24:00/i.test(x.name)),true);
});

test('Phase 1 focus still explicitly includes fat loss without turning an arbitrary body-fat percentage into a promotion lock',()=>{
 assert.ok(source.includes('["Foundation",1,16,"Lose excess body fat,'));
 assert.doesNotMatch(source,/Body fat under 18%/);
});
`);
console.log('Phase 1 promotion intent patch applied.');
