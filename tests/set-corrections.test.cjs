const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const row={name:'Squat',load:40,unit:'lb',measure:'reps',work:8};
function harness(completed){
 const values=new Map(),mirrors=[];let failure=null;
 const storage={getItem:k=>values.get(k)??null,setItem(k,v){if(k===failure){failure=null;throw Error('quota')}values.set(k,v)},removeItem:k=>values.delete(k)};
 const history=()=>JSON.parse(values.get('workoutHistory')||'[]');
 if(completed)values.set('workoutHistory',JSON.stringify([{date:'2026-09-27',completed,rpe:6,postPain:0,prescription:{title:'Keep this'},exerciseSets:[row]}]));
 const ctx=vm.createContext({localStorage:storage,workouts:history,dayKey:d=>new Date(d).toISOString().slice(0,10),dayDate:()=>new Date('2026-09-27'),todayWorkoutRecord:()=>history()[0],dbSet:(k,v)=>mirrors.push([k,v])});
 vm.runInContext(fs.readFileSync('training-tools.js','utf8'),ctx);
 return{ctx,values,mirrors,history,fail:k=>failure=k};
}
test('set correction updates saved session and draft without changing feedback or completion',()=>{
 for(const status of ['YES','PARTIAL','NO']){const h=harness(status);h.ctx.saveExerciseSets([{...row,load:35}]);assert.equal(h.ctx.recordedExerciseSets()[0].load,35);const saved=h.history()[0];assert.equal(saved.exerciseSets[0].load,35);assert.equal(saved.completed,status);assert.equal(saved.rpe,6);assert.equal(saved.postPain,0);assert.equal(saved.prescription.title,'Keep this');assert.equal(h.mirrors.length,1)}
});
test('removing all sets remains empty after reload rather than resurrecting saved sets',()=>{
 const h=harness('YES');h.ctx.saveExerciseSets([]);assert.equal(h.ctx.recordedExerciseSets().length,0);h.values.delete(h.ctx.exerciseSetKey());assert.equal(h.ctx.recordedExerciseSets().length,0);assert.equal(h.history()[0].exerciseSets.length,0);
});
test('quota failure preserves history and rolls draft back whether previously present or absent',()=>{
 for(const existingDraft of [false,true]){const h=harness('YES');if(existingDraft)h.values.set(h.ctx.exerciseSetKey(),JSON.stringify([row]));const before=[...h.values];h.fail('workoutHistory');assert.throws(()=>h.ctx.saveExerciseSets([{...row,load:35}]));assert.deepEqual([...h.values],before);assert.equal(h.mirrors.length,0)}
});
test('new sets remain drafts until session completion; failed draft write changes nothing',()=>{
 const h=harness();h.ctx.saveExerciseSets([row]);assert.equal(h.history().length,0);assert.equal(h.mirrors.length,0);h.fail(h.ctx.exerciseSetKey());assert.throws(()=>h.ctx.saveExerciseSets([]));assert.equal(h.ctx.recordedExerciseSets().length,1);
});
