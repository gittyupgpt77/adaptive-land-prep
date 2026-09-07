const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
function harness(initial={}){
 let log=initial,task=false;
 const buttons=[{dataset:{meal:'m1'}},{dataset:{meal:'m2'}}],nodes={};
 const $=id=>nodes[id]??=( {value:'',textContent:'',innerHTML:'',querySelectorAll:selector=>selector==='.meal-check'?buttons:[]} );
 const context=vm.createContext({$,getNutritionLog:()=>JSON.parse(JSON.stringify(log)),nutritionLogKey:()=> 'nutrition_today',localStorage:{programStart:'2026-09-01',setItem:(k,v)=>log=JSON.parse(v)},setTask:(k,v)=>task=v,prescriptionWeek:()=>1,sessionName:()=> 'Recovery',todayNutritionPrescription:()=>({phase:'Foundation',cal:1000,protein:100,carbs:100,fat:30,why:'Fuel today'}),todayMealPlan:()=>[{id:'m1',name:'Breakfast',kcal:400,foods:[]},{id:'m2',name:'Dinner',kcal:600,foods:[]}],hydrationForDay:()=>({label:'Drink to thirst',note:''}),previousNutritionSignal:()=>null,renderToday:()=>{},val:id=>$(id).value});
 vm.runInContext(source.slice(source.indexOf('function nutritionDraft('),source.indexOf('function programWeekForDate(')),context);
 context.renderNutrition();
 return {context,$,buttons,get log(){return log},get task(){return task}};
}
test('manual and hydration drafts survive meal toggle and navigation rerender',()=>{
 const h=harness();h.$('actualCalories').value='750';h.$('waterActual').value='64';h.$('waterActual').oninput();h.buttons[0].onclick();h.context.renderNutrition();assert.equal(h.$('actualCalories').value,'750');assert.equal(h.$('waterActual').value,'64');h.context.saveNutrition();assert.equal(h.log.actualCalories,750);assert.equal(h.log.waterOz,64);assert.equal(h.log.intakeSource,'manual-deviation');
});
test('meal totals stay inferred when a saved full prescription becomes partial',()=>{
 const h=harness({meals:['m1','m2']});h.context.saveNutrition();assert.equal(h.log.actualCalories,1000);assert.equal(h.log.actualProtein,100);assert.equal(h.$('actualCalories').value,'');assert.equal(h.$('actualProtein').value,'');h.buttons[1].onclick();h.context.saveNutrition();assert.equal(h.log.actualCalories,400);assert.equal(h.log.actualProtein,null);assert.equal(h.log.intakeSource,'prescribed-meals');
});
test('editing saved intake immediately clears completion and visible saved label',()=>{
 const h=harness({meals:['m1']});h.context.saveNutrition();assert.equal(h.task,true);assert.match(h.$('saveNutritionDay').textContent,/saved/);h.$('actualCarbs').value='80';h.$('actualCarbs').oninput();assert.equal(h.log.saved,false);assert.equal(h.task,false);assert.equal(h.log.savedAt,undefined);assert.equal(h.$('saveNutritionDay').textContent,'Save Today’s Intake');
});
test('legacy meal estimates remain blank; legacy explicit intake remains available',()=>{
 const h=harness({intakeSource:'prescribed-meals',actualCalories:1000,actualProtein:100,waterOz:40});assert.equal(h.$('actualCalories').value,'');assert.equal(h.$('waterActual').value,'40');
 const manual=harness({actualCalories:720,actualProtein:90});assert.equal(manual.$('actualCalories').value,'720');assert.equal(manual.$('actualProtein').value,'90');
});
test('clearing an explicit deviation restores meal inference and retains other drafts',()=>{
 const h=harness({meals:['m1','m2']});h.$('actualCalories').value='0';h.$('actualCalories').oninput();h.context.saveNutrition();assert.equal(h.log.actualCalories,0);h.$('actualCalories').value='';h.$('actualCalories').oninput();h.context.saveNutrition();assert.equal(h.log.actualCalories,1000);
});
