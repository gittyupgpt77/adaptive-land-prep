const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function readinessContext({week=10,values={},logs=[],workouts=[]}={}){
 const ctx=vm.createContext({
  num:id=>Object.hasOwn(values,id)?values[id]:null,
  val:id=>String(values[id]??''),
  logs:()=>logs,
  workouts:()=>workouts,
  historicalDate:null,
  prescriptionWeek:()=>week,
  programWeekForDate:()=>week,
  dayKey:d=>new Date(d).toDateString()
 });
 const start=source.indexOf('function systemicDomainsFromRecord('),end=source.indexOf('\nfunction mechanical()',start);
 assert.ok(start>=0&&end>start,'systemic readiness functions are present');
 vm.runInContext(source.slice(start,end),ctx);
 return ctx;
}

const normal={sleep:8,sleepQ:4,fatigue:2,hrv:100,hrvBase:100,rhr:50,rhrBase:50,grip:50,gripBase:50,performance:'YES'};

test('an isolated autonomic excursion is caution, not an automatic systemic red day',()=>{
 const c=readinessContext({values:{...normal,hrv:80}});
 assert.equal(c.systemic(),'YELLOW');
});

test('the same red autonomic domain persisting across check-ins escalates to systemic red',()=>{
 const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
 const c=readinessContext({values:{...normal,hrv:80},logs:[{date:yesterday.toISOString(),...normal,hrv:82}]});
 assert.equal(c.systemic(),'RED');
});

test('one mild noisy recovery marker does not modify an otherwise normal day',()=>{
 const c=readinessContext({values:{...normal,hrv:90}});
 assert.equal(c.systemic(),'GREEN');
});

test('two caution domains corroborate one another and produce yellow',()=>{
 const c=readinessContext({values:{...normal,sleep:6.5,fatigue:3}});
 assert.equal(c.systemic(),'YELLOW');
});

test('Phase 1 does not treat one poor performance report as a recovery failure',()=>{
 const c=readinessContext({week:10,values:{...normal,performance:'NO'}});
 assert.equal(c.systemic(),'GREEN');
});

test('Phase 1 repeated poor performance remains contextual but does trigger caution',()=>{
 const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
 const c=readinessContext({week:10,values:{...normal,performance:'NO'},logs:[{date:yesterday.toISOString(),...normal,performance:'NO'}]});
 assert.equal(c.systemic(),'YELLOW');
});

test('after Phase 1 performance is weighted more heavily, but still requires persistence for red',()=>{
 const today=readinessContext({week:17,values:{...normal,performance:'NO'}});
 assert.equal(today.systemic(),'YELLOW');
 const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
 const repeated=readinessContext({week:17,values:{...normal,performance:'NO'},logs:[{date:yesterday.toISOString(),...normal,performance:'NO'}]});
 assert.equal(repeated.systemic(),'RED');
});

test('a maximal-feeling prior session is context, not a mechanical injury flag',()=>{
 const start=source.indexOf('function previousWorkoutSignal('),end=source.indexOf('\nfunction saveWorkout(',start);
 assert.ok(start>=0&&end>start,'previous workout signal function is present');
 const d=new Date();const yesterday=new Date(d);yesterday.setDate(yesterday.getDate()-1);
 const ctx=vm.createContext({workouts:()=>[{date:yesterday.toISOString(),completed:'YES',postPain:0,rpe:10}],dayKey:x=>new Date(x).toDateString()});
 vm.runInContext(source.slice(start,end),ctx);
 assert.equal(ctx.previousWorkoutSignal(d),null);
});

test('post-session pain remains an immediate mechanical signal',()=>{
 const start=source.indexOf('function previousWorkoutSignal('),end=source.indexOf('\nfunction saveWorkout(',start);
 const d=new Date();const yesterday=new Date(d);yesterday.setDate(yesterday.getDate()-1);
 const ctx=vm.createContext({workouts:()=>[{date:yesterday.toISOString(),completed:'YES',postPain:5,rpe:5}],dayKey:x=>new Date(x).toDateString()});
 vm.runInContext(source.slice(start,end),ctx);
 assert.equal(ctx.previousWorkoutSignal(d).level,'RED');
});
