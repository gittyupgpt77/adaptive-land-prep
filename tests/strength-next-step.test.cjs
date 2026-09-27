// Prepared for final rescue gate. No autonomous weight increase is introduced.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('training-tools.js','utf8'),c);
const exercise={name:'Dumbbell press',type:'Strength',dose:'3 × 6–8'},today=new Date('2026-09-20');
const session=date=>({date,completed:'YES',postPain:0,prescription:{steps:[exercise]},exerciseSets:Array.from({length:3},()=>({name:exercise.name,unit:'lb',load:30,measure:'reps',work:8}))});
test('readiness and incomplete feedback prevent progression suggestions',()=>{
 const h=[session('2026-09-18')];assert.match(c.strengthNextStep(exercise,h,today,'YELLOW'),/Do not increase/);
 h[0].postPain=null;assert.match(c.strengthNextStep(exercise,h,today,'GREEN'),/does not establish/);
});
test('two comparable clean sessions invite consideration, without changing recorded load',()=>{
 const h=[session('2026-09-18'),session('2026-09-14')],before=JSON.stringify(h);
 assert.match(c.strengthNextStep(exercise,h,today,'GREEN'),/two completed, pain-free/);assert.equal(JSON.stringify(h),before);
 h[0].prescription={steps:[{...exercise,dose:'2 × 6–8'}]};assert.match(c.strengthNextStep(exercise,h,today,'GREEN'),/Re-establish/);
});
test('old records, mixed loads and unsupported doses cannot imply readiness to progress',()=>{
 assert.match(c.strengthNextStep(exercise,[session('2026-08-01')],today,'GREEN'),/Re-establish/);
 const mixed=session('2026-09-18');mixed.exerciseSets[1].load=35;assert.match(c.strengthNextStep(exercise,[mixed],today,'GREEN'),/mixed loads/);
 assert.equal(c.strengthNextStep({...exercise,dose:'3 rounds'},[],today,'GREEN'),null);
});
