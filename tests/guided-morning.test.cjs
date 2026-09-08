const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
function harness({fail=false,historical=false,complete=true}={}){
 const nodes={},events=[],storage={programStart:'2026-09-01',trainingLogs:'[]'};
 const $=id=>nodes[id]??={value:'1',checked:false,disabled:false,classList:{add(){},remove(){}},focus(){}};
 const context=vm.createContext({dayDate:()=>new Date(),advanceDailyFlow:()=>{},$,checkinSaving:false,morningStep:2,historicalDate:historical?new Date('2026-09-02'):null,localStorage:storage,
 checkinRequiredComplete:()=>complete,requiredFields:()=>{},evaluate(){if(fail)throw Error('quota')},decision:()=>({o:'GREEN'}),logs:()=>JSON.parse(storage.trainingLogs),
 programWeekForDate:()=>1,prescriptionWeek:()=>1,dayKey:d=>new Date(d).toDateString(),num:()=>1,val:()=>'YES',previousWorkoutSignal:()=>null,
 dbSet:()=>events.push('persist'),setTask:()=>{},resetHistorical:()=>{},closeCheckin:()=>{},renderAll:()=>events.push('render'),advanceDailyFlow:()=>events.push('advance')});
 const start=source.indexOf('function saveCheckin(){'),end=source.indexOf('\nfunction previousWorkoutSignal',start);vm.runInContext(source.slice(start,end),context);
 return {context,storage,events,$};
}
test('confirmed check-in persists before routing and repeated saves replace the day',()=>{const h=harness();h.context.saveCheckin();assert.equal(JSON.parse(h.storage.trainingLogs).length,1);assert.deepEqual(h.events,['persist','render','advance']);h.context.saveCheckin();assert.equal(JSON.parse(h.storage.trainingLogs).length,1)});
test('incomplete check-in never commits or advances',()=>{const h=harness({complete:false});h.context.saveCheckin();assert.equal(h.storage.trainingLogs,'[]');assert.deepEqual(h.events,[])});
test('failed save retains the form and releases the saving lock for retry',()=>{const h=harness({fail:true});h.context.saveCheckin();assert.deepEqual(h.events,[]);assert.equal(h.context.checkinSaving,false);assert.equal(h.$('morningContinue').disabled,false);assert.match(h.$('checkinError').textContent,/could not be saved/)});
test('historical correction does not reroute the current day',()=>{const h=harness({historical:true});h.context.saveCheckin();assert.deepEqual(h.events,['persist','render'])});
