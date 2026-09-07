const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');

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
