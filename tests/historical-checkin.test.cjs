const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function harness(){
 const nodes={},values={},rows=[],sessions=[];
 const $=id=>nodes[id]??={value:'',checked:false,classList:{add(){},remove(){}},querySelector:selector=>$(selector)};
 const context=vm.createContext({$,localStorage:{setItem:(k,v)=>values[k]=v},historicalDate:null,historicalInputs:null,
  logs:()=>rows,workouts:()=>sessions,requiredFields:()=>{},dayKey:d=>new Date(d).toDateString(),
  getNutritionLog:d=>({saved:true,actualCalories:d.getDate()===9?500:1500,targetCalories:2000}),
  dateSession:()=>({w:1,name:'row'}),nutritionForWeek:()=>({cal:2000}),mealPlanForWeek:()=>[1,2],mealPlanForTarget:()=>[1,2]
 });
 for(const name of ['avg','applyBaselines','persistInputs','openHistoricalCheckin','resetHistorical','previousWorkoutSignal','previousNutritionSignal']){
  const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);
  vm.runInContext(source.slice(start,end),context);
 }
 return {context,$,values,rows,sessions};
}
test('historical entry cannot overwrite the current draft and closing restores its fields',()=>{
 const h=harness();h.$('weight').value='170';h.$('focal').checked=true;h.context.persistInputs();
 h.context.openHistoricalCheckin('2026-09-10T12:00:00');h.$('weight').value='160';h.context.persistInputs();
 assert.equal(h.values.input_weight,'170');assert.equal(h.context.localStorage.input_focal,'1');
 h.context.resetHistorical();assert.equal(h.$('weight').value,'170');assert.equal(h.$('focal').checked,true);
 assert.equal(h.context.historicalDate,null);
});
test('historical baselines exclude later records and clear when no earlier records exist',()=>{
 const h=harness();h.rows.push({date:'2026-09-15',hrv:90,weight:180},{date:'2026-09-08',hrv:50,weight:165});
 h.$('hrvBase').value='70';h.context.openHistoricalCheckin('2026-09-10T12:00:00');
 assert.equal(h.$('hrvBase').value,'50');assert.equal(h.$('weightAvg').value,'165.0');
 h.context.resetHistorical();assert.equal(h.$('hrvBase').value,'70');
 h.context.openHistoricalCheckin('2026-09-01T12:00:00');assert.equal(h.$('hrvBase').value,'');
});
test('prior session and fueling signals use the day before the check-in being reconstructed',()=>{
 const h=harness();h.sessions.push({date:'2026-09-09T12:00:00',completed:'YES',postPain:6,rpe:5},{date:'2026-09-14T12:00:00',completed:'YES',postPain:0,rpe:4});
 assert.equal(h.context.previousWorkoutSignal(new Date('2026-09-10T12:00:00')).level,'RED');
 assert.equal(h.context.previousWorkoutSignal(new Date('2026-09-15T12:00:00')),null);
 assert.equal(h.context.previousNutritionSignal(new Date('2026-09-10T12:00:00')).ratio,.25);
 assert.equal(h.context.previousNutritionSignal(new Date('2026-09-15T12:00:00')).ratio,.75);
});