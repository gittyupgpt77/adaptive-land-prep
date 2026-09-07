const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');

test('session feedback restores saved partial details but preserves newer drafts and deliberate clearing',()=>{
 const nodes={},drafts=new Map(),rows=[{date:'today',rpe:7,postPain:0,duration:35,completed:'PARTIAL',note:'Stopped early'}];
 const context=vm.createContext({$:id=>nodes[id]??={value:''},workouts:()=>rows,dayKey:x=>x,todayKey:()=> 'today',localStorage:{getItem:k=>drafts.get(k)??null}});
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
  const context=vm.createContext({localStorage,
   sessionName:()=> 'Full-body strength',
   makeSession:title=>({title,steps:[]}),todayCheckin:()=>({decision}),ex:()=>({}),
   num:id=>({sessionRPE:5,postPain:0,sessionDuration:30}[id]),val:()=>'',
   workouts:()=>[],prescriptionWeek:()=>1,dbSet:()=>{},setTask:()=>{},
   $:()=>({classList:{add(){},remove(){}}}),setTimeout:()=>{},renderAll:()=>{}
  });
  vm.runInContext(source.slice(source.indexOf('function adaptiveSession(){'),source.indexOf('\nfunction ',source.indexOf('function adaptiveSession(){')+1)),context);
  vm.runInContext(source.slice(source.indexOf('function saveWorkout(c){'),source.indexOf('\n',source.indexOf('function saveWorkout(c){'))),context);
  context.saveWorkout('YES');
  const saved=JSON.parse(localStorage.workoutHistory)[0];
  assert.equal(saved.session,expected);
  assert.equal(saved.rpe,5);assert.equal(saved.postPain,0);assert.equal(saved.completed,'YES');
 }
});
