const test=require('node:test'),assert=require('node:assert/strict'),energy=require('../nutrition-energy');
const profile={schemaVersion:1,assessments:[{date:'2026-01-01',weightKg:90,bodyFatPercent:30,method:'dexa'}],rmrTests:[{date:'2026-01-01',kcal:1800}]};
const base={cal:1650,protein:185,carbs:140,fat:40},session={type:'Strength',effort:'Easy',duration:'30–40 min',steps:[{type:'Strength',dose:'3 × 8'}]};
const derive=extra=>energy.derive({week:1,base,profile,session,referenceDate:new Date('2026-09-20T12:00:00Z'),...extra});
test('unknown measurements and rowing power do not become invented expenditure',()=>{
 assert.equal(derive({profile:null}).cal,base.cal);
 assert.equal(energy.sessionEstimate({duration:'30 min',steps:[{type:'Row'}]},90).status,'needs-rowing-power');
 assert.equal(energy.minutes('40–20 min'),null);
});
test('shrinking fat reference can raise but never deepen initial restriction',()=>{
 const first=derive(),later=derive({trend:{status:'ready',meanWeight:145}});
 assert.ok(first.cal>=base.cal);assert.ok(later.cal>first.cal);
 assert.equal(later.energyModel.bodyCompositionSource,'lean-mass-preserved projection');
 assert.equal(later.cal,later.protein*4+later.carbs*4+later.fat*9);
});
test('restriction ends after week 16 or a recorded goal, and snapshots validate',()=>{
 assert.equal(derive({week:17}).energyModel.cutting,false);
 assert.equal(derive({profile:{...profile,goalBodyFatPercent:30}}).energyModel.cutting,false);
 assert.equal(energy.validModel(derive().energyModel),true);
 assert.equal(energy.validModel({...derive().energyModel,exerciseKcalRange:[100,50]}),false);
});
test('future records cannot rewrite a historical energy estimate',()=>{
 assert.equal(derive({referenceDate:new Date('2025-12-20T12:00:00Z')}).energyStatus,'needs-measurements');
});
test('wearable calibration needs three comparable prior sessions',()=>{
 const row={type:'Row',effort:'Easy',duration:'30 min',steps:[{type:'Row'}]};
 const history=[17,18,19].map(day=>({date:`2026-09-${day}T12:00:00Z`,prescription:row,completed:'YES',duration:30,activeCalories:200}));
 assert.equal(energy.sessionEstimate(row,90,history,new Date('2026-09-20T12:00:00Z')).central,200);
 history[0].prescription={...row,effort:'Hard'};
 assert.equal(energy.sessionEstimate(row,90,history,new Date('2026-09-20T12:00:00Z')).status,'needs-rowing-power');
});
