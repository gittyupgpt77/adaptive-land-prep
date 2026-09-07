const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=()=>fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

test('56-week curriculum exposes exact week-specific ceilings and taper guidance',()=>{
 const s=source(),start=s.indexOf('const weeklyTargets='),end=s.indexOf('\nconst templates=',start);
 assert.ok(start>=0&&end>start,'weekly target table is present');
 const context=vm.createContext({});
 vm.runInContext(s.slice(start,end),context);
 assert.equal(vm.runInContext('weeklyTargets.length',context),56);
 assert.equal(vm.runInContext('weekTarget(1).runCeiling',context),0);
 assert.equal(vm.runInContext('weekTarget(13).run',context),'~12 mi/wk ceiling');
 assert.equal(vm.runInContext('weekTarget(25).ruck',context),'~8 mi easy ruck');
 assert.equal(vm.runInContext('weekTarget(52).runCeiling',context),46);
 assert.equal(vm.runInContext('weekTarget(53).run',context),'30–35 mi or ~70% of recent normal');
});

test('developer shorthand is removed from athlete-facing workout doses',()=>{
 const s=source();
 for(const phrase of ['Use current phase target','Use weekly allocation','Use this week’s mileage allocation','Use current weekly target','Follow current block target','Phase-specific intervals or tempo','Use quality-run structure']){
   assert.equal(s.includes(phrase),false,phrase);
 }
 assert.match(s,/If none is current, replace the quality segment with 20–40 min easy rowing/);
});

test('weekly actual work counts completed and partial work but not skipped work',()=>{
 const s=source(),start=s.indexOf('function weekMetrics('),end=s.indexOf('\nfunction sessionModalities',start);
 const rows=[
  {week:13,completed:'YES',runMiles:3.25,rowMinutes:40},
  {week:13,completed:'PARTIAL',runMiles:1.5,ruckMiles:2,rowMinutes:20},
  {week:13,completed:'NO',runMiles:9,ruckMiles:9,rowMinutes:90},
  {week:14,completed:'YES',runMiles:7}
 ];
 const context=vm.createContext({workouts:()=>rows});
 vm.runInContext(s.slice(start,end),context);
 const metrics=vm.runInContext('weekMetrics(13)',context);
 assert.equal(metrics.runMiles,4.75);
 assert.equal(metrics.ruckMiles,2);
 assert.equal(metrics.rowMinutes,60);
});

test('saved sessions retain actual run ruck row and pack work',()=>{
 const s=source(),start=s.indexOf('function saveWorkout(c){'),end=s.indexOf('\nconst EXERCISE_DB_BASE=',start);
 const localStorage={programStart:'2026-09-01'};
 const nodes={sessionFeedback:{open:false},completionBanner:{textContent:'',classList:{add(){},remove(){}}}};
 const values={sessionRPE:6,postPain:0,sessionDuration:52,sessionRunMiles:4.2,sessionRuckMiles:null,sessionRowMinutes:45,sessionPackWeight:null};
 const context=vm.createContext({
  localStorage,$:id=>nodes[id]??={value:'',classList:{add(){},remove(){}}},num:id=>values[id]??null,val:()=>'',beginJourney(){},
  setTimeout(){},workouts:()=>[],adaptiveSession:()=>({title:'Run + row',type:'Run',steps:[]}),prescriptionWeek:()=>13,
  dayKey:x=>x,todayKey:()=> 'today',dbSet(){},setTask(){},renderAll(){}
 });
 vm.runInContext(s.slice(start,end),context);
 context.saveWorkout('YES');
 const saved=JSON.parse(localStorage.workoutHistory)[0];
 assert.equal(saved.runMiles,4.2);
 assert.equal(saved.rowMinutes,45);
 assert.equal(saved.ruckMiles,null);
 assert.equal(saved.packWeight,null);
});
