const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');

test('failed session persistence keeps feedback open and never advances the day',()=>{
 const nodes={},storage={programStart:'2026-09-01'};let advanced=false;
 Object.defineProperty(storage,'workoutHistory',{set(){throw Error('quota')}});
 const ctx=vm.createContext({localStorage:storage,recordedExerciseSets:()=>[],dayDate:()=>new Date('2026-09-27'),workouts:()=>[],adaptiveSession:()=>({title:'Strength'}),prescriptionWeek:()=>1,num:()=>0,val:()=>'',advanceDailyFlow:()=>{advanced=true},$:id=>nodes[id]??={classList:{add(){},remove(){}}}});
 vm.runInContext(source.slice(source.indexOf('function saveWorkout(c){'),source.indexOf('\nconst EXERCISE_DB_BASE=')),ctx);
 ctx.saveWorkout('YES');assert.equal(advanced,false);assert.equal(nodes.sessionFeedback.open,true);assert.match(nodes.completionBanner.textContent,/could not be saved/);
});

test('session feedback restores saved partial details but preserves newer drafts and deliberate clearing',()=>{
 const nodes={},drafts=new Map(),rows=[{date:'today',rpe:7,postPain:0,duration:35,completed:'PARTIAL',note:'Stopped early'}];
 const context=vm.createContext({recordedExerciseSets:()=>[],dayDate:()=>new Date(),advanceDailyFlow:()=>{},$:id=>nodes[id]??={value:''},workouts:()=>rows,dayKey:x=>x,todayKey:()=> 'today',localStorage:{getItem:k=>drafts.get(k)??null}});
 const start=source.indexOf('function restoreSessionFeedback(){');
 vm.runInContext(source.slice(start,source.indexOf('\nrestoreSessionFeedback();',start)),context);
 context.restoreSessionFeedback();
 assert.equal(nodes.sessionRPE.value,'7');assert.equal(nodes.postPain.value,'0');assert.equal(nodes.sessionDuration.value,'35');assert.equal(nodes.completed.value,'PARTIAL');assert.equal(nodes.sessionNote.value,'Stopped early');
 drafts.set('input_session_today_sessionRPE','8');drafts.set('input_session_today_sessionNote','');
 context.restoreSessionFeedback();assert.equal(nodes.sessionRPE.value,'8');assert.equal(nodes.sessionNote.value,'');
 rows[0].date='yesterday';drafts.clear();context.restoreSessionFeedback();
 for(const node of Object.values(nodes))assert.equal(node.value,'');
});

test('completion records the prescribed session for normal, reduced and recovery days',()=>{
 for(const [decision,expected] of [
  [{o:'GREEN',b:'GREEN'},'Full-body strength'],
  [{o:'YELLOW',b:'GREEN'},'Full-body strength · Modified'],
  [{o:'RED',b:'GREEN'},'Recovery Override'],
  [{o:'RED',b:'RED'},'Mechanical Recovery Override']
 ]){
  const localStorage={programStart:'2026-09-01'};
  const context=vm.createContext({recordedExerciseSets:()=>[],dayDate:()=>new Date(),advanceDailyFlow:()=>{},localStorage,
   sessionName:()=> 'Full-body strength',
   makeSession:title=>({title,steps:[]}),todayCheckin:()=>({decision}),ex:()=>({}),
   num:id=>({sessionRPE:5,postPain:0,sessionDuration:30}[id]),val:()=>'',
   workouts:()=>[],prescriptionWeek:()=>1,dbSet:()=>{},setTask:()=>{},
   $:()=>({classList:{add(){},remove(){}}}),setTimeout:()=>{},renderAll:()=>{}
  });
  const start=source.indexOf('function adaptiveSessionFor(');
  vm.runInContext(source.slice(start,source.indexOf('\nfunction readinessBreakdown',start)),context);
  vm.runInContext(source.slice(source.indexOf('function saveWorkout(c){'),source.indexOf('\nconst EXERCISE_DB_BASE=',source.indexOf('function saveWorkout(c){'))),context);
  context.saveWorkout('YES');
  const saved=JSON.parse(localStorage.workoutHistory)[0];
  assert.equal(saved.session,expected);
  assert.equal(saved.prescription.title,expected);
  assert.equal(saved.rpe,5);assert.equal(saved.postPain,0);assert.equal(saved.completed,'YES');
 }
});


test('missing required session response remains visible and scrolls into view',()=>{
 const nodes={},storage={programStart:'2026-09-01'};let scrolled=false,focused=false,timeouts=0;
 const makeNode=id=>({classList:{add(){},remove(){}},scrollIntoView(){if(id==='completionBanner')scrolled=true},focus(){if(id==='sessionRPE')focused=true}});
 const ctx=vm.createContext({localStorage:storage,recordedExerciseSets:()=>[],workouts:()=>[],adaptiveSession:()=>({title:'Strength'}),prescriptionWeek:()=>1,
  num:id=>['sessionRPE','postPain'].includes(id)?null:0,val:()=>'',setTimeout:()=>{timeouts++},$:id=>nodes[id]??=makeNode(id)});
 vm.runInContext(source.slice(source.indexOf('function saveWorkout(c){'),source.indexOf('\nconst EXERCISE_DB_BASE=')),ctx);
 ctx.saveWorkout('YES');
 assert.equal(nodes.sessionFeedback.open,true);assert.match(nodes.completionBanner.textContent,/effort and post-session pain/);
 assert.equal(scrolled,true);assert.equal(focused,true);assert.equal(timeouts,0);assert.equal(storage.workoutHistory,undefined);
});
