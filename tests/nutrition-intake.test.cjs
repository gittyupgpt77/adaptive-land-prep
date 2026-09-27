// Regression cases prepared for the final rescue gate; not run during implementation.
const test=require('node:test'),assert=require('node:assert/strict');
const intake=require('../nutrition-intake');
const meals=[{id:'breakfast',kcal:500},{id:'lunch',kcal:600}];
test('partial portions retain unknown template macros without fabricating intake',()=>{
 const result=intake.summary(meals,['breakfast'],[{id:'breakfast',kind:'portion',fraction:.5}]);
 assert.equal(result.calories,250);assert.equal(result.protein,null);assert.equal(result.complete,false);
 assert.deepEqual(result.remainingMeals,['lunch']);assert.equal(meals[0].kcal,500);
});
test('replacement is counted once, with optional macros kept unknown',()=>{
 const entries=[{id:'breakfast',kind:'replacement',calories:350,protein:25}];
 const result=intake.summary(meals,['breakfast','lunch'],entries);
 assert.equal(result.calories,950);assert.equal(result.protein,null);assert.equal(result.complete,true);
 assert.deepEqual(JSON.parse(JSON.stringify(entries)),entries);
});
test('explicitly skipped differs from unfinished logging',()=>{
 const skipped=meals.map(m=>({id:m.id,kind:'skipped'}));
 const complete=intake.summary(meals,meals.map(m=>m.id),skipped);
 assert.equal(complete.complete,true);assert.equal(complete.calories,0);assert.equal(complete.protein,0);
 assert.equal(intake.summary(meals).complete,false);
});
test('ingredient-backed snapshots supply macros without reentry',()=>{
 const meal={id:'breakfast',kcal:500,nutrients:{kcal:{complete:true,known:500},protein:{complete:true,known:40},carbs:{complete:true,known:60},fat:{complete:true,known:10}}};
 const actual=intake.resolve(meal,{id:'breakfast',kind:'portion',fraction:.5});
 assert.deepEqual(actual,{calories:250,protein:20,carbs:30,fat:5});
});
test('restore validation rejects orphaned, duplicate and invalid meal records',()=>{
 const entry={id:'breakfast',kind:'portion',fraction:.5};
 assert.equal(intake.validEntries([entry],meals,['breakfast']),true);
 assert.equal(intake.validEntries([entry,entry],meals,['breakfast']),false);
 assert.equal(intake.validEntries([entry],meals,[]),false);
 assert.equal(intake.validEntries([{...entry,id:'unknown'}],meals,['unknown']),false);
 for(const fraction of [0,-1,3,Infinity])assert.equal(intake.validEntry({...entry,fraction}),false);
 assert.equal(intake.validEntry({id:'breakfast',kind:'replacement',calories:null}),false);
 assert.equal(intake.validEntry({id:'breakfast',kind:'replacement',calories:200,protein:-1}),false);
});
test('ingredient receipts survive catalog changes and require complete known macros',()=>{
 const core=require('../nutrition-core'),catalog=structuredClone(require('../data/nutrition/foods.json'));
 const snapshot=core.recipeSnapshot({id:'breakfast',name:'Chocolate shake',ingredients:[{foodId:'wheyChocolate',grams:41}]},catalog);
 const entry={id:'breakfast',kind:'ingredients',snapshot};
 assert.equal(intake.validEntry(entry),true);catalog.foods.wheyChocolate.nutrients.protein=0;
 const actual=intake.summary(meals,['breakfast'],[JSON.parse(JSON.stringify(entry))]);
 assert.equal(actual.calories,150);assert.equal(actual.protein,25);
 const corrupt=structuredClone(entry);corrupt.snapshot.nutrients.protein.complete=false;
 assert.equal(intake.validEntry(corrupt),false);
 assert.equal(intake.validEntry({...entry,id:'lunch'}),false);
});
