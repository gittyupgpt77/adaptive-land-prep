const test=require('node:test');
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
 const start=source.indexOf('function objectiveSetsForPhase('),end=source.indexOf('\nfunction phaseExitQualified(',start);
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


test('final qualification cannot pass unknown mechanics or unfinished nutrition',()=>{
 const c=objectiveContext();let checkin=null,food={saved:true,complete:false};
 c.todayCheckin=()=>checkin;c.getNutritionLog=()=>food;
 const final=()=>c.objectiveSetsForPhase({name:'Taper'},stats,{})[1];
 assert.equal(final()[0].done,false);assert.equal(final()[1].done,false);
 checkin={overall:'GREEN',decision:{b:'YELLOW'}};assert.equal(final()[0].done,false);
 checkin={overall:'GREEN',decision:{b:'GREEN'}};assert.equal(final()[0].done,true);
 food={saved:true,complete:true};assert.equal(final()[1].done,true);
});
