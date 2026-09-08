const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function migrate(initial={},checkins=[],sessions=[]){
 const localStorage={...initial,removeItem(k){delete this[k]}};
 const context=vm.createContext({localStorage,logs:()=>checkins,workouts:()=>sessions});
 const start=source.indexOf('function migrateProductState('),end=source.indexOf('\nfunction beginJourney(',start);
 vm.runInContext(source.slice(start,end),context);context.migrateProductState();return localStorage;
}
test('explicit Day 1 persists even when no check-ins or sessions remain',()=>{
 const start='2026-09-01T12:00:00.000Z',state=migrate({programStart:start,baselineDate:start,failedDays:'["2026-09-02"]'});
 assert.equal(state.programStart,start);assert.equal(state.baselineDate,start);assert.equal(state.failedDays,'["2026-09-02"]');
});
test('a new device stays unstarted and historical check-ins do not silently begin Day 1',()=>{
 assert.equal(migrate().programStart,undefined);
 const state=migrate({},[{date:'2026-08-20T12:00:00.000Z'},{date:'2026-08-01T12:00:00.000Z'}]);
 assert.equal(state.programStart,undefined);assert.equal(state.baselineDate,'2026-08-01T12:00:00.000Z');
});
test('migration does not rewrite existing history or the start of an active journey',()=>{
 const checkins=[{date:'2026-08-01T12:00:00.000Z',week:1,preJourney:true}],before=JSON.stringify(checkins);
 const state=migrate({programStart:'2026-09-01T12:00:00.000Z'},checkins);
 assert.equal(state.programStart,'2026-09-01T12:00:00.000Z');assert.equal(JSON.stringify(checkins),before);
});
