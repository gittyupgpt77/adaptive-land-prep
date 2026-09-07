const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

test('historical calendar prefers the saved adapted prescription',()=>{
  const savedPrescription={title:'Recovery Override',type:'Recovery',duration:'25 min',effort:'Very easy',why:'Saved reason',steps:[]};
  const rows=[{date:'2026-09-07T12:00:00Z',completed:'PARTIAL',prescription:savedPrescription}];
  const checks=[{date:'2026-09-07T08:00:00Z',decision:{o:'YELLOW',b:'GREEN'}}];
  const context=vm.createContext({
    localStorage:{failedDays:'[]'},logs:()=>checks,workouts:()=>rows,dayKey:d=>new Date(d).toDateString(),
    programWeekForDate:()=>1,blockForWeek:()=>({name:'Re-entry I'}),daysFor:()=>['Base session'],programDayIndex:()=>0,
    adaptiveSessionFor:()=>({title:'Reconstructed'}),nutritionForWeek:()=>({phase:'x',cal:1,protein:1,carbs:1,fat:1,why:''}),
    getNutritionLog:()=>({}),mealPlanForWeek:()=>[],$:()=>({}),document:{querySelectorAll:()=>[]},window:{},todayKey:()=>new Date('2026-09-07T12:00:00Z').toDateString()
  });
  const start=source.indexOf('function checkinForDate('),end=source.indexOf('\nfunction renderJourney(){',start);
  assert.ok(start>=0&&end>start,'historical date functions are present');
  vm.runInContext(source.slice(start,end),context);
  const x=context.dateSession(new Date('2026-09-07T18:00:00Z'));
  assert.equal(x.det.title,'Recovery Override');
  const state=context.dateState(new Date('2026-09-07T18:00:00Z'));
  assert.equal(state.status,'PARTIAL');
  assert.equal(state.work,false);
});

test('partial sessions require effort and pain feedback just like completed sessions',()=>{
  const nodes={sessionFeedback:{open:false},completionBanner:{textContent:'',classList:{add(){},remove(){}}}};
  const localStorage={programStart:'2026-09-01'};
  const context=vm.createContext({
    localStorage,$:id=>nodes[id]??={value:''},num:()=>null,val:()=>'',beginJourney(){},setTimeout(){},workouts:()=>[],adaptiveSession:()=>({title:'Base',steps:[]}),
    prescriptionWeek:()=>1,dayKey:x=>x,todayKey:()=> 'today',dbSet(){},setTask(){},renderAll(){}
  });
  const start=source.indexOf('function saveWorkout(c){'),end=source.indexOf('\nconst EXERCISE_DB_BASE=',start);
  assert.ok(start>=0&&end>start,'saveWorkout is present');
  vm.runInContext(source.slice(start,end),context);
  context.saveWorkout('PARTIAL');
  assert.equal(localStorage.workoutHistory,undefined);
  assert.match(nodes.completionBanner.textContent,/effort and post-session pain/i);
});
