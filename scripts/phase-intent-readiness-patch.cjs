const fs=require('node:fs');
const path=require('node:path');

const appPath=path.join(__dirname,'../app.js');
let source=fs.readFileSync(appPath,'utf8');

const oldSystemic=`function systemic(){const sl=num("sleep"),q=num("sleepQ"),f=num("fatigue"),h=num("hrv"),hb=num("hrvBase"),r=num("rhr"),rb=num("rhrBase"),g=num("grip"),gb=num("gripBase"),p=val("performance");if([sl,q,f,h,r].every(x=>x===null)&&!p)return"";if((sl!==null&&sl<6)||(q!==null&&q<=2)||(f!==null&&f>=4)||(hb&&h!==null&&h<.85*hb)||(rb&&r!==null&&r>rb+8)||p==="NO")return"RED";if((sl!==null&&sl<7)||q===3||f===3||(hb&&h!==null&&h<.92*hb)||(rb&&r!==null&&r>rb+5)||(gb&&g!==null&&g<.9*gb))return"YELLOW";return"GREEN"}`;
const newSystemic=`function systemicDomainsFromRecord(x,phaseOne){
 const metric=v=>v===null||v===undefined||v===""?null:Number(v),out={},set=(key,level)=>{if(level==="RED"||out[key]!=="RED")out[key]=level};
 const sl=metric(x?.sleep),q=metric(x?.sleepQ),f=metric(x?.fatigue),h=metric(x?.hrv),hb=metric(x?.hrvBase),r=metric(x?.rhr),rb=metric(x?.rhrBase),g=metric(x?.grip),gb=metric(x?.gripBase),p=String(x?.performance||"");
 if((sl!==null&&sl<6)||(q!==null&&q<=2))set("sleep","RED");else if((sl!==null&&sl<7)||q===3)set("sleep","YELLOW");
 if(f!==null&&f>=4)set("fatigue","RED");else if(f===3)set("fatigue","YELLOW");
 if((hb&&h!==null&&h<.85*hb)||(rb&&r!==null&&r>rb+8))set("autonomic","RED");else if((hb&&h!==null&&h<.92*hb)||(rb&&r!==null&&r>rb+5))set("autonomic","YELLOW");
 if(gb&&g!==null&&g<.9*gb)set("neuromuscular","YELLOW");
 // Phase 1 deliberately accepts some performance suppression while fat loss is prioritized.
 // A poor performance report is therefore context, not an isolated recovery stop signal.
 if(p==="NO")set("performance",phaseOne?"YELLOW":"RED");
 return out
}
function recentSystemicRecords(referenceDate=new Date(),limit=3){
 const end=new Date(referenceDate);end.setHours(0,0,0,0);
 return logs().filter(x=>{const d=new Date(x.date);return !Number.isNaN(d.getTime())&&d<end}).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,limit)
}
function previousSessionStrain(referenceDate=new Date()){
 const y=new Date(referenceDate);y.setDate(y.getDate()-1);const x=workouts().filter(w=>dayKey(w.date)===dayKey(y)&&w.completed!=="NO").sort((a,b)=>new Date(b.date)-new Date(a.date))[0];if(!x)return null;
 const rpe=Number(x.rpe);return Number.isFinite(rpe)&&rpe>=9?{level:"YELLOW",reason:"Yesterday’s session was rated "+rpe+"/10 effort."}:null
}
function systemic(){
 const current={sleep:num("sleep"),sleepQ:num("sleepQ"),fatigue:num("fatigue"),hrv:num("hrv"),hrvBase:num("hrvBase"),rhr:num("rhr"),rhrBase:num("rhrBase"),grip:num("grip"),gripBase:num("gripBase"),performance:val("performance")};
 const hasInput=[current.sleep,current.sleepQ,current.fatigue,current.hrv,current.rhr,current.grip].some(Number.isFinite)||!!current.performance;if(!hasInput)return"";
 const referenceDate=historicalDate||new Date(),w=historicalDate?programWeekForDate(referenceDate):prescriptionWeek(),phaseOne=w<=16,domains=systemicDomainsFromRecord(current,phaseOne),strain=previousSessionStrain(referenceDate);
 if(strain)domains.sessionStrain="YELLOW";
 const prior=recentSystemicRecords(referenceDate).map(x=>systemicDomainsFromRecord(x,phaseOne)),red=Object.keys(domains).filter(k=>domains[k]==="RED"),yellow=Object.keys(domains).filter(k=>domains[k]==="YELLOW");
 // These are product guardrails, not validated diagnostic cutoffs: strong intervention requires
 // corroboration across domains or persistence of the same abnormal domain across check-ins.
 const repeatedRed=red.some(k=>prior.some(d=>d[k]==="RED")),repeatedYellow=yellow.some(k=>prior.some(d=>d[k]==="YELLOW"||d[k]==="RED"));
 if(red.length>=2||repeatedRed)return"RED";
 if(red.length||yellow.length>=2||repeatedYellow)return"YELLOW";
 return"GREEN"
}`;
if(!source.includes(oldSystemic))throw new Error('systemic block no longer matches main');
source=source.replace(oldSystemic,newSystemic);

const oldWorkout=`function previousWorkoutSignal(referenceDate=new Date()){const y=new Date(referenceDate);y.setDate(y.getDate()-1);const x=workouts().filter(w=>dayKey(w.date)===dayKey(y)&&w.completed!=="NO").sort((a,b)=>new Date(b.date)-new Date(a.date))[0];if(!x)return null;const pain=Number(x.postPain),rpe=Number(x.rpe);if(Number.isFinite(pain)&&pain>=5)return{level:"RED",reason:"Yesterday’s session ended with pain "+pain+"/10."};if((Number.isFinite(pain)&&pain>=3)||(Number.isFinite(rpe)&&rpe>=9))return{level:"YELLOW",reason:Number.isFinite(pain)&&pain>=3?"Yesterday’s session ended with pain "+pain+"/10.":"Yesterday’s session was rated "+rpe+"/10 effort."};return null}`;
const newWorkout=`function previousWorkoutSignal(referenceDate=new Date()){const y=new Date(referenceDate);y.setDate(y.getDate()-1);const x=workouts().filter(w=>dayKey(w.date)===dayKey(y)&&w.completed!=="NO").sort((a,b)=>new Date(b.date)-new Date(a.date))[0];if(!x)return null;const pain=Number(x.postPain);if(Number.isFinite(pain)&&pain>=5)return{level:"RED",reason:"Yesterday’s session ended with pain "+pain+"/10."};if(Number.isFinite(pain)&&pain>=3)return{level:"YELLOW",reason:"Yesterday’s session ended with pain "+pain+"/10."};return null}`;
if(!source.includes(oldWorkout))throw new Error('previousWorkoutSignal block no longer matches main');
source=source.replace(oldWorkout,newWorkout);

const oldFuelCopy=`if(dec.c==="RED")reasons.push("recent fueling and body-weight trend suggest meaningful under-fueling");`;
const newFuelCopy=`if(dec.c==="RED")reasons.push("confirmed recent intake suggests meaningful under-fueling");`;
if(!source.includes(oldFuelCopy))throw new Error('adaptation fueling copy no longer matches main');
source=source.replace(oldFuelCopy,newFuelCopy);

fs.writeFileSync(appPath,source);

const testPath=path.join(__dirname,'../tests/readiness-phase-intent.test.cjs');
fs.writeFileSync(testPath,`const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

function readinessContext({week=10,values={},logs=[],workouts=[]}={}){
 const ctx=vm.createContext({
  num:id=>Object.hasOwn(values,id)?values[id]:null,
  val:id=>String(values[id]??''),
  logs:()=>logs,
  workouts:()=>workouts,
  historicalDate:null,
  prescriptionWeek:()=>week,
  programWeekForDate:()=>week,
  dayKey:d=>new Date(d).toDateString()
 });
 const start=source.indexOf('function systemicDomainsFromRecord('),end=source.indexOf('\\nfunction mechanical()',start);
 assert.ok(start>=0&&end>start,'systemic readiness functions are present');
 vm.runInContext(source.slice(start,end),ctx);
 return ctx;
}

const normal={sleep:8,sleepQ:4,fatigue:2,hrv:100,hrvBase:100,rhr:50,rhrBase:50,grip:50,gripBase:50,performance:'YES'};

test('an isolated autonomic excursion is caution, not an automatic systemic red day',()=>{
 const c=readinessContext({values:{...normal,hrv:80}});
 assert.equal(c.systemic(),'YELLOW');
});

test('the same red autonomic domain persisting across check-ins escalates to systemic red',()=>{
 const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
 const c=readinessContext({values:{...normal,hrv:80},logs:[{date:yesterday.toISOString(),...normal,hrv:82}]});
 assert.equal(c.systemic(),'RED');
});

test('one mild noisy recovery marker does not modify an otherwise normal day',()=>{
 const c=readinessContext({values:{...normal,hrv:90}});
 assert.equal(c.systemic(),'GREEN');
});

test('two caution domains corroborate one another and produce yellow',()=>{
 const c=readinessContext({values:{...normal,sleep:6.5,fatigue:3}});
 assert.equal(c.systemic(),'YELLOW');
});

test('Phase 1 does not treat one poor performance report as a recovery failure',()=>{
 const c=readinessContext({week:10,values:{...normal,performance:'NO'}});
 assert.equal(c.systemic(),'GREEN');
});

test('Phase 1 repeated poor performance remains contextual but does trigger caution',()=>{
 const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
 const c=readinessContext({week:10,values:{...normal,performance:'NO'},logs:[{date:yesterday.toISOString(),...normal,performance:'NO'}]});
 assert.equal(c.systemic(),'YELLOW');
});

test('after Phase 1 performance is weighted more heavily, but still requires persistence for red',()=>{
 const today=readinessContext({week:17,values:{...normal,performance:'NO'}});
 assert.equal(today.systemic(),'YELLOW');
 const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
 const repeated=readinessContext({week:17,values:{...normal,performance:'NO'},logs:[{date:yesterday.toISOString(),...normal,performance:'NO'}]});
 assert.equal(repeated.systemic(),'RED');
});

test('a maximal-feeling prior session is context, not a mechanical injury flag',()=>{
 const start=source.indexOf('function previousWorkoutSignal('),end=source.indexOf('\\nfunction saveWorkout(',start);
 assert.ok(start>=0&&end>start,'previous workout signal function is present');
 const d=new Date();const yesterday=new Date(d);yesterday.setDate(yesterday.getDate()-1);
 const ctx=vm.createContext({workouts:()=>[{date:yesterday.toISOString(),completed:'YES',postPain:0,rpe:10}],dayKey:x=>new Date(x).toDateString()});
 vm.runInContext(source.slice(start,end),ctx);
 assert.equal(ctx.previousWorkoutSignal(d),null);
});

test('post-session pain remains an immediate mechanical signal',()=>{
 const start=source.indexOf('function previousWorkoutSignal('),end=source.indexOf('\\nfunction saveWorkout(',start);
 const d=new Date();const yesterday=new Date(d);yesterday.setDate(yesterday.getDate()-1);
 const ctx=vm.createContext({workouts:()=>[{date:yesterday.toISOString(),completed:'YES',postPain:5,rpe:5}],dayKey:x=>new Date(x).toDateString()});
 vm.runInContext(source.slice(start,end),ctx);
 assert.equal(ctx.previousWorkoutSignal(d).level,'RED');
});
`);

console.log('Phase-intent readiness patch applied.');
