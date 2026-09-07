const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');

test('workout task circle opens response capture synchronously before deferred scroll',()=>{
 const nodes={sessionFeedback:{open:false,scrollIntoView(){}},completed:{value:''}};
 let tab='',raf=null;
 const context=vm.createContext({
  localStorage:{programStart:'2026-09-01'},$:id=>nodes[id],switchTab:t=>{tab=t},todayWorkout:()=>null,
  requestAnimationFrame:cb=>{raf=cb},beginJourney(){},todayCheckin:()=>({}),openCheckin(){},taskDone:()=>false,setTask(){},renderToday(){}
 });
 const start=source.indexOf('function handleTaskToggle(key){'),end=source.indexOf('\ndocument.querySelectorAll(".tab")',start);
 assert.ok(start>=0&&end>start,'handleTaskToggle is present');
 vm.runInContext(source.slice(start,end),context);
 context.handleTaskToggle('workout');
 assert.equal(tab,'workout');
 assert.equal(nodes.sessionFeedback.open,true);
 assert.equal(nodes.completed.value,'YES');
 assert.equal(typeof raf,'function');
});
