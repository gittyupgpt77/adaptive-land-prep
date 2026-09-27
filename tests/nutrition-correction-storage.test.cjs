// Prepared for the deferred rescue gate: stale editors and failed writes must preserve data.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function harness(){
 const values=new Map([['nutrition_today',JSON.stringify({meals:[],draft:{actualCalories:''}})],['task_nutrition_today','1'],['daySession','closed']]);
 const node={textContent:''};let saveFails=false,closed=false;
 const context=vm.createContext({nutritionLogKey:()=> 'nutrition_today',todayKey:()=> 'today',$:()=>node,
  localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},
  captureNutritionDraft:()=>{values.set('daySession','open');values.set('task_nutrition_today','0');return JSON.parse(values.get('nutrition_today'))},
  saveNutrition:()=>{if(saveFails)throw Error('storage failure')},closeModal:()=>{closed=true}});
 vm.runInContext(source.slice(source.indexOf('function commitMealCorrection('),source.indexOf('function openMealCorrection(')),context);
 return {context,values,node,fail:()=>{saveFails=true},get closed(){return closed},token:()=>({key:'nutrition_today',raw:values.get('nutrition_today')})};
}
const meal={id:'breakfast',name:'Breakfast',kcal:400,foods:['Original food']},entry={id:'breakfast',kind:'skipped'};
test('a stale meal editor cannot overwrite data changed in another context',()=>{
 const h=harness(),token=h.token();h.values.set('nutrition_today','{"meals":["later-change"]}');const before=Object.fromEntries(h.values);
 h.context.commitMealCorrection(meal,[meal],entry,'error',token);
 assert.deepEqual(Object.fromEntries(h.values),before);assert.equal(h.closed,false);assert.match(h.node.textContent,/changed/);
});
test('failed meal save restores nutrition, task completion and the closed-day state',()=>{
 const h=harness(),before=Object.fromEntries(h.values),token=h.token();h.fail();
 h.context.commitMealCorrection(meal,[meal],entry,'error',token);
 assert.deepEqual(Object.fromEntries(h.values),before);assert.equal(h.closed,false);assert.match(h.node.textContent,/could not be saved/);
});
