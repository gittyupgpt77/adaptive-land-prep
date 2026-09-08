const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('app.js','utf8');
function harness(session,complete=true){
 const storage={programStart:'2026-09-01T12:00:00Z',...(session?{daySession:JSON.stringify(session)}:{})},events=[];
 const context=vm.createContext({localStorage:storage,dayKey:d=>new Date(d).toDateString(),logs:()=>[],workouts:()=>[],todayCheckin:()=>complete,todayWorkoutRecord:()=>complete,nutritionDayComplete:()=>complete,greetOnThisOpening:false,todayFlowState:()=>complete?'evening':'nutrition',renderToday:()=>events.push('render'),switchTab:()=>events.push('route'),alert:()=>events.push('error')});
 vm.runInContext(source.slice(source.indexOf('function daySession()'),source.indexOf('function todayKey()')),context);
 return{context,storage,events};
}
const open={date:'2026-09-07T12:00:00Z',closedAt:null};
test('an unfinished session retains its task date across reopening and midnight',()=>{const h=harness(open);h.context.resumeDaySession(new Date('2026-09-09T12:00:00Z'));assert.deepEqual(JSON.parse(h.storage.daySession),open);assert.equal(h.context.dayDate().toISOString(),open.date.replace('Z','.000Z'))});
test('closing explicitly is required even when all records are complete',()=>{const h=harness(open);h.context.resumeDaySession(new Date('2026-09-08T12:00:00Z'));assert.equal(JSON.parse(h.storage.daySession).closedAt,null);h.context.endDaySession();assert.ok(JSON.parse(h.storage.daySession).closedAt)});
test('a closed session does not regreet on the same date, but a later opening starts a fresh day',()=>{const h=harness({...open,closedAt:'2026-09-07T20:00:00Z'});h.context.resumeDaySession(new Date('2026-09-07T21:00:00Z'));assert.equal(h.context.dayDate().getDate(),7);h.context.resumeDaySession(new Date('2026-09-08T08:00:00Z'));assert.equal(h.context.dayDate().getDate(),8);assert.equal(JSON.parse(h.storage.daySession).closedAt,null)});
test('incomplete tasks cannot be ended or rolled forward',()=>{const h=harness(open,false);h.context.endDaySession();assert.deepEqual(h.events,[]);h.context.resumeDaySession(new Date('2026-09-09T12:00:00Z'));assert.equal(h.context.dayDate().getDate(),7)});
test('nutrition reads the open task date rather than changing records at midnight',()=>{const h=harness(open);h.storage.getItem=k=>k==='nutrition_Mon Sep 07 2026'?'{}':null;vm.runInContext(source.slice(source.indexOf('function nutritionLogKey('),source.indexOf('function baseMealPlan(')),h.context);assert.equal(h.context.nutritionLogKey(),'nutrition_Mon Sep 07 2026')});

test('reopening a morning draft resumes it without repeating Hello',()=>{const h=harness(open,false);h.context.resumeDaySession(new Date('2026-09-07T13:00:00Z'));assert.equal(h.context.greetOnThisOpening,false)});
