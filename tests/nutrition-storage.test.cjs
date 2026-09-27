const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),storage=require('../nutrition-storage');
test('legacy and compact receipts round-trip exactly, including Unicode',()=>{
 for(const value of [{meals:['m1']},{note:'🥚 café '.repeat(2000),meals:['m1']}])assert.deepEqual(storage.decode(storage.encode(value)),value);
 assert.throws(()=>storage.decode('{"encoding":"nutrition-deflate-v1","data":"invalid"}'));
});
test('full Journey food history stays below device and backup limits',()=>{
 const c=vm.createContext({NutritionCore:require('../nutrition-core'),NutritionIntake:require('../nutrition-intake'),NutritionData:{catalog:require('../data/nutrition/foods.json'),prescriptions:require('../data/nutrition/prescription-meals.json')},nutritionFoodNames:{}});
 vm.runInContext(fs.readFileSync('nutrition-plan.js','utf8'),c);
 const meals=c.sourceBackedMealPlan(30,{cal:4000,protein:200,carbs:590,fat:95}),record={prescribedMeals:meals,meals:meals.map(m=>m.id),saved:true,complete:true};
 const encoded=storage.encode(record);assert.deepEqual(storage.decode(encoded),JSON.parse(JSON.stringify(record)));
 assert.ok(encoded.length*2*392<3*1024*1024,'leave storage capacity for training records');
});
test('decompression is bounded before accepting an imported record',()=>{
 const pako=require('../vendor/pako'),data=Buffer.from(pako.deflate('x'.repeat(600000))).toString('base64');
 assert.throws(()=>storage.decode(JSON.stringify({encoding:'nutrition-deflate-v1',data})),/limit/);
});
