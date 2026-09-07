from pathlib import Path
import json

app_path=Path('app.js')
index_path=Path('index.html')
sw_path=Path('service-worker.js')
source=app_path.read_text()
index=index_path.read_text()
sw=sw_path.read_text()

def must_replace(text,old,new,label):
    if old not in text:
        raise SystemExit(f'missing patch target: {label}')
    return text.replace(old,new,1)

weekly=[
 {'week':1,'weekType':'ENTRY','runCeiling':0,'run':'~0 mi/wk ceiling','row':'2–3 × 40–60 min','ruck':''},
 {'week':2,'weekType':'BUILD','runCeiling':1,'run':'~1 mi/wk ceiling','row':'2–3 × 40–60 min','ruck':''},
 {'week':3,'weekType':'BUILD','runCeiling':2,'run':'~2 mi/wk ceiling','row':'2–3 × 40–60 min','ruck':''},
 {'week':4,'weekType':'CONSOLIDATE','runCeiling':1,'run':'~1 mi/wk ceiling','row':'2–3 × 40–60 min','ruck':''},
 {'week':5,'weekType':'ENTRY','runCeiling':4,'run':'~4 mi/wk ceiling','row':'2 × 45–75 min','ruck':'~2 mi easy ruck'},
 {'week':6,'weekType':'BUILD','runCeiling':5,'run':'~5 mi/wk ceiling','row':'2 × 45–75 min','ruck':'~3 mi easy ruck'},
 {'week':7,'weekType':'BUILD','runCeiling':5,'run':'~5 mi/wk ceiling','row':'2 × 45–75 min','ruck':'~4 mi easy ruck'},
 {'week':8,'weekType':'CONSOLIDATE','runCeiling':5,'run':'~5 mi/wk ceiling','row':'2 × 45–75 min','ruck':'~3 mi easy ruck'},
 {'week':9,'weekType':'ENTRY','runCeiling':7,'run':'~7 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~4 mi easy ruck'},
 {'week':10,'weekType':'BUILD','runCeiling':8,'run':'~8 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~4 mi easy ruck'},
 {'week':11,'weekType':'BUILD','runCeiling':9,'run':'~9 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~5 mi easy ruck'},
 {'week':12,'weekType':'CONSOLIDATE','runCeiling':9,'run':'~9 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~4 mi easy ruck'},
 {'week':13,'weekType':'ENTRY','runCeiling':12,'run':'~12 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~4 mi easy ruck'},
 {'week':14,'weekType':'BUILD','runCeiling':13,'run':'~13 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~5 mi easy ruck'},
 {'week':15,'weekType':'BUILD','runCeiling':15,'run':'~15 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~6 mi easy ruck'},
 {'week':16,'weekType':'CONSOLIDATE','runCeiling':14,'run':'~14 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~5 mi easy ruck'},
 {'week':17,'weekType':'ENTRY','runCeiling':16,'run':'~16 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~6 mi easy ruck'},
 {'week':18,'weekType':'BUILD','runCeiling':17,'run':'~17 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~7 mi easy ruck'},
 {'week':19,'weekType':'BUILD','runCeiling':19,'run':'~19 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~7 mi easy ruck'},
 {'week':20,'weekType':'CONSOLIDATE','runCeiling':18,'run':'~18 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~7 mi easy ruck'},
 {'week':21,'weekType':'ENTRY','runCeiling':18,'run':'~18 mi/wk ceiling','row':'1–2 × 45–60 min','ruck':'~7 mi easy ruck'},
 {'week':22,'weekType':'BUILD','runCeiling':19,'run':'~19 mi/wk ceiling','row':'1–2 × 45–60 min','ruck':'~8 mi easy ruck'},
 {'week':23,'weekType':'BUILD','runCeiling':21,'run':'~21 mi/wk ceiling','row':'1–2 × 45–60 min','ruck':'~9 mi easy ruck'},
 {'week':24,'weekType':'CONSOLIDATE','runCeiling':20,'run':'~20 mi/wk ceiling','row':'1–2 × 45–60 min','ruck':'~9 mi easy ruck'},
 {'week':25,'weekType':'ENTRY','runCeiling':22,'run':'~22 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~8 mi easy ruck'},
 {'week':26,'weekType':'BUILD','runCeiling':23,'run':'~23 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~9 mi easy ruck'},
 {'week':27,'weekType':'BUILD','runCeiling':25,'run':'~25 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~10 mi easy ruck'},
 {'week':28,'weekType':'CONSOLIDATE','runCeiling':24,'run':'~24 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~9 mi easy ruck'},
 {'week':29,'weekType':'ENTRY','runCeiling':24,'run':'~24 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~9 mi easy ruck'},
 {'week':30,'weekType':'BUILD','runCeiling':26,'run':'~26 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~10 mi easy ruck'},
 {'week':31,'weekType':'BUILD','runCeiling':28,'run':'~28 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~11 mi easy ruck'},
 {'week':32,'weekType':'CONSOLIDATE','runCeiling':27,'run':'~27 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~11 mi easy ruck'},
 {'week':33,'weekType':'ENTRY','runCeiling':28,'run':'~28 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~11 mi easy ruck'},
 {'week':34,'weekType':'BUILD','runCeiling':30,'run':'~30 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~12 mi easy ruck'},
 {'week':35,'weekType':'BUILD','runCeiling':32,'run':'~32 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~13 mi easy ruck'},
 {'week':36,'weekType':'CONSOLIDATE','runCeiling':31,'run':'~31 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~13 mi easy ruck'},
 {'week':37,'weekType':'ENTRY','runCeiling':26,'run':'~26 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~11 mi easy ruck'},
 {'week':38,'weekType':'BUILD','runCeiling':28,'run':'~28 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~12 mi easy ruck'},
 {'week':39,'weekType':'BUILD','runCeiling':30,'run':'~30 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~13 mi easy ruck'},
 {'week':40,'weekType':'CONSOLIDATE','runCeiling':29,'run':'~29 mi/wk ceiling','row':'1–2 × 45–75 min','ruck':'~13 mi easy ruck'},
 {'week':41,'weekType':'ENTRY','runCeiling':30,'run':'~30 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~13 mi easy ruck'},
 {'week':42,'weekType':'BUILD','runCeiling':34,'run':'~34 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~14 mi easy ruck'},
 {'week':43,'weekType':'BUILD','runCeiling':36,'run':'~36 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~15 mi easy ruck'},
 {'week':44,'weekType':'CONSOLIDATE','runCeiling':34,'run':'~34 mi/wk ceiling','row':'1 × 45–60 min','ruck':'~15 mi easy ruck'},
 {'week':45,'weekType':'ENTRY','runCeiling':37,'run':'~37 mi/wk ceiling','row':'1 × 30–60 min','ruck':'~16 mi easy ruck'},
 {'week':46,'weekType':'BUILD','runCeiling':40,'run':'~40 mi/wk ceiling','row':'1 × 30–60 min','ruck':'~17 mi easy ruck'},
 {'week':47,'weekType':'BUILD','runCeiling':43,'run':'~43 mi/wk ceiling','row':'1 × 30–60 min','ruck':'~19 mi easy ruck'},
 {'week':48,'weekType':'CONSOLIDATE','runCeiling':41,'run':'~41 mi/wk ceiling','row':'1 × 30–60 min','ruck':'~18 mi easy ruck'},
 {'week':49,'weekType':'ENTRY','runCeiling':41,'run':'~41 mi/wk ceiling','row':'Strategic recovery','ruck':'~18 mi easy ruck'},
 {'week':50,'weekType':'BUILD','runCeiling':45,'run':'~45 mi/wk ceiling','row':'Strategic recovery','ruck':'~20 mi easy ruck'},
 {'week':51,'weekType':'BUILD','runCeiling':48,'run':'~48 mi/wk ceiling','row':'Strategic recovery','ruck':'~22 mi easy ruck'},
 {'week':52,'weekType':'CONSOLIDATE','runCeiling':46,'run':'~46 mi/wk ceiling','row':'Strategic recovery','ruck':'~21 mi easy ruck'},
 {'week':53,'weekType':'TAPER','runCeiling':35,'run':'30–35 mi or ~70% of recent normal','row':'Short easy C2','ruck':'8–10 mi easy'},
 {'week':54,'weekType':'TAPER','runCeiling':25,'run':'20–25 mi or ~50%','row':'Short easy C2','ruck':'4–6 mi easy'},
 {'week':55,'weekType':'TAPER','runCeiling':15,'run':'10–15 mi or ~25–30%','row':'Short easy C2','ruck':''},
 {'week':56,'weekType':'TAPER','runCeiling':None,'run':'Minimal easy work','row':'Short easy C2','ruck':''},
]
weekly_js='const weeklyTargets='+json.dumps(weekly,ensure_ascii=False,separators=(',',':'))+';\n'
weekly_js+='function weekTarget(w){return weeklyTargets[Math.max(1,Math.min(56,Number(w)||1))-1]}\n'
weekly_js+='function weeklyRunDose(w){const t=weekTarget(w);return t.runCeiling===0?"No running planned this week":"Week "+w+" · "+t.run}\n'
weekly_js+='function weeklyEnduranceDose(w){const t=weekTarget(w);return "Week "+w+" · "+t.run+(t.ruck?" · "+t.ruck:"")}\n'
weekly_js+='function qualityRunDose(w){const t=weekTarget(w);return "1 controlled quality session this week · "+t.run}\n'
marker='];\nconst templates={'
pos=source.find(marker,source.find('const blocks=['))
if pos<0: raise SystemExit('missing weekly target insertion marker')
source=source[:pos+3]+weekly_js+source[pos+3:]

source=must_replace(source,'function makeSession(name){\n const row=mins=>','function makeSession(name,w=prescriptionWeek()){\n const wt=weekTarget(w),runDose=weeklyRunDose(w),enduranceDose=weeklyEnduranceDose(w);\n const row=mins=>','week-aware session builder')
source=source.replace('"Use quality-run structure"','qualityRunDose(w)')
source=source.replace('"Use current phase target"','runDose')
source=source.replace('"Phase-specific intervals or tempo"','qualityRunDose(w)')
source=source.replace('"Use weekly allocation"','runDose')
source=source.replace('"Use this week’s mileage allocation"','runDose')
source=source.replace('"Use current weekly target"','enduranceDose')
source=source.replace('"Follow current block target"','enduranceDose')
source=source.replace('"Complete the faster running first."','"Use an established pace/HR/lactate calibration. If none is current, replace the quality segment with 20–40 min easy rowing rather than guessing."')
source=source.replace('"Use individual pace, heart-rate and lactate data."','"Use an established pace, heart-rate or lactate calibration. If none is current, replace the quality segment with 20–40 min easy rowing rather than guessing."')
source=source.replace('"Hard but controlled; never all-out."','"Hard but controlled; never all-out. If no current quality calibration exists, use easy rowing instead of inventing an interval pace."')
source=source.replace('"Hard but controlled; do not force a universal number."','"Use an established threshold calibration. If none is current, row easy for 30–45 min instead of guessing at threshold."')

source=must_replace(source,'function adaptiveSessionFor(name,d){\n const base=makeSession(name),dec=d?.decision;','function adaptiveSessionFor(name,d,w=prescriptionWeek()){\n const base=makeSession(name,w),dec=d?.decision;','historical week-aware adaptation')
source=must_replace(source,'function adaptiveSession(){return adaptiveSessionFor(sessionName(),todayCheckin())}','function adaptiveSession(){return adaptiveSessionFor(sessionName(),todayCheckin(),prescriptionWeek())}','current week adaptation')
source=must_replace(source,'const det=work?.prescription||adaptiveSessionFor(name,check);','const det=work?.prescription||adaptiveSessionFor(name,check,w);','historical adaptation week')

workout_marker='function todayKey(){return new Date().toDateString()}function todayCheckin(){return logs().find(x=>new Date(x.date).toDateString()===todayKey())}function todayWorkoutRecord(){return workouts().find(x=>new Date(x.date).toDateString()===todayKey())}function todayWorkout(){const x=todayWorkoutRecord();return x?.completed==="YES"?x:null}\n'
helpers=r'''function weekMetrics(w){
 const out={runMiles:0,ruckMiles:0,rowMeters:0};
 for(const x of workouts().filter(x=>x.week===w&&x.completed!=="NO")){
   if(Number.isFinite(x.runMiles))out.runMiles+=x.runMiles;
   if(Number.isFinite(x.ruckMiles))out.ruckMiles+=x.ruckMiles;
   if(Number.isFinite(x.rowMeters))out.rowMeters+=x.rowMeters;
 }
 return out
}
function sessionModalities(det){
 const text=((det?.title||"")+" "+(det?.type||"")+" "+(det?.steps||[]).map(e=>(e.name||"")+" "+(e.type||"")).join(" ")).toLowerCase();
 return{run:/\brun|running|jog/.test(text),ruck:/ruck|weighted-pack/.test(text),row:/\brow|rowing|concept2/.test(text)}
}
function renderSessionMetricFields(det){
 const m=sessionModalities(det);
 [["sessionRunMilesField",m.run],["sessionRuckMilesField",m.ruck],["sessionRowMetersField",m.row],["sessionPackWeightField",m.ruck]].forEach(([id,show])=>$(id)?.classList.toggle("hidden",!show));
}
function actualWorkSummary(work){
 if(!work)return"";const bits=[];
 if(Number.isFinite(work.runMiles))bits.push("Run "+work.runMiles+" mi");
 if(Number.isFinite(work.ruckMiles))bits.push("Ruck "+work.ruckMiles+" mi");
 if(Number.isFinite(work.packWeight))bits.push("Pack "+work.packWeight+" lb");
 if(Number.isFinite(work.rowMeters))bits.push("Row "+Math.round(work.rowMeters).toLocaleString()+" m");
 return bits.length?'<div class="nutrition-note"><strong>Actual work</strong><p>'+bits.join(" · ")+'</p></div>':""
}
function renderWeekTargetCard(w,det){
 const t=weekTarget(w),m=weekMetrics(w),runLogged=m.runMiles?m.runMiles.toFixed(1)+" mi logged · ":"",ruckLogged=m.ruckMiles?m.ruckMiles.toFixed(1)+" mi logged · ":"",rowLogged=m.rowMeters?Math.round(m.rowMeters).toLocaleString()+" m logged · ":"";
 $("weekTargetCard").innerHTML='<strong>Week '+w+' · '+t.weekType+'</strong><p><b>Running:</b> '+runLogged+t.run+'<br><b>Concept2:</b> '+rowLogged+t.row+'<br><b>Ruck:</b> '+ruckLogged+(t.ruck||"None scheduled")+'</p><small>Weekly ceilings are limits, not quotas. Do not force remaining mileage into today.</small>';
 renderSessionMetricFields(det)
}
'''
source=must_replace(source,workout_marker,workout_marker+helpers,'workout metric helpers')

old_entry='const arr=workouts(),prescription=adaptiveSession(),entry={date:new Date().toISOString(),week:prescriptionWeek(),session:prescription.title,prescription,rpe,duration:num("sessionDuration"),postPain,completed:status,note:val("sessionNote")};'
new_entry='const arr=workouts(),prescription=adaptiveSession(),entry={date:new Date().toISOString(),week:prescriptionWeek(),session:prescription.title,prescription,rpe,duration:num("sessionDuration"),postPain,runMiles:num("sessionRunMiles"),ruckMiles:num("sessionRuckMiles"),rowMeters:num("sessionRowMeters"),packWeight:num("sessionPackWeight"),completed:status,note:val("sessionNote")};'
source=must_replace(source,old_entry,new_entry,'actual session metrics')

source=must_replace(source,'$("workoutWhy").textContent=det.why;','$("workoutWhy").textContent=det.why;renderWeekTargetCard(prescriptionWeek(),det);','train weekly context')

source=must_replace(source,'const trainingLabel=state.status==="YES"?\'<span class="done">✓ Training complete</span>\':state.status==="PARTIAL"?\'<span>◐ Partial session</span>\':state.status==="NO"?\'<span class="failed">× Session skipped</span>\':\'<span>○ Training</span>\';\n $("daySheetBody").innerHTML=\'<div class="day-status-line"><span class="\'+(state.check?"done":"")+\'">\'+(state.check?"✓":"○")+\' Check-in</span>\'+trainingLabel+(state.failed?\'<span class="failed">× Missed day</span>\':\'\')+\'</div><div class="day-training-hero"><small>\'+x.det.type.toUpperCase()+\'</small><h3>\'+x.det.title+\'</h3><p>\'+x.det.why+\'</p></div><div class="day-exercises">\'+x.det.steps.map((e,i)=>\'<button data-dayex="\'+i+\'"><b>\'+(i+1)+\'</b><div><strong>\'+e.name+\'</strong><small>\'+e.dose+\' · \'+e.rest+\'</small></div><span>›</span></button>\').join("")+\'</div>\';','const trainingLabel=state.status==="YES"?\'<span class="done">✓ Training complete</span>\':state.status==="PARTIAL"?\'<span>◐ Partial session</span>\':state.status==="NO"?\'<span class="failed">× Session skipped</span>\':\'<span>○ Training</span>\';\n $("daySheetBody").innerHTML=\'<div class="day-status-line"><span class="\'+(state.check?"done":"")+\'">\'+(state.check?"✓":"○")+\' Check-in</span>\'+trainingLabel+(state.failed?\'<span class="failed">× Missed day</span>\':\'\')+\'</div>\'+actualWorkSummary(x.work)+\'<div class="day-training-hero"><small>\'+x.det.type.toUpperCase()+\'</small><h3>\'+x.det.title+\'</h3><p>\'+x.det.why+\'</p></div><div class="day-exercises">\'+x.det.steps.map((e,i)=>\'<button data-dayex="\'+i+\'"><b>\'+(i+1)+\'</b><div><strong>\'+e.name+\'</strong><small>\'+e.dose+\' · \'+e.rest+\'</small></div><span>›</span></button>\').join("")+\'</div>\';','historical actual work')

old_week='function renderWeek(){const w=viewedWeek,bl=blockForWeek(w),days=daysFor(bl),st=dateFor(w,0),en=dateFor(w,6);$("weekTitle").textContent="Week "+w;$("weekRange").textContent=st.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" – "+en.toLocaleDateString(undefined,{month:"short",day:"numeric"});$("weekSummary").innerHTML=\'<div class="week-card"><div class="week-overview"><small>\'+bl.name.toUpperCase()+\'</small><strong>\'+bl.focus+\'</strong><p>\'+bl.run+\' · \'+bl.ruck+\'</p></div>\'+days.map((name,i)=>{'
new_week='function renderWeek(){const w=viewedWeek,bl=blockForWeek(w),wt=weekTarget(w),days=daysFor(bl),st=dateFor(w,0),en=dateFor(w,6);$("weekTitle").textContent="Week "+w;$("weekRange").textContent=st.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" – "+en.toLocaleDateString(undefined,{month:"short",day:"numeric"});$("weekSummary").innerHTML=\'<div class="week-card"><div class="week-overview"><small>\'+bl.name.toUpperCase()+\' · \'+wt.weekType+\'</small><strong>\'+bl.focus+\'</strong><p>Run: \'+wt.run+\' · C2: \'+wt.row+\' · Ruck: \'+(wt.ruck||"none")+\'</p></div>\'+days.map((name,i)=>{'
source=must_replace(source,old_week,new_week,'exact week calendar context')

source=must_replace(source,'const fields={sessionRPE:"rpe",sessionDuration:"duration",postPain:"postPain",completed:"completed",sessionNote:"note"};','const fields={sessionRPE:"rpe",sessionDuration:"duration",postPain:"postPain",sessionRunMiles:"runMiles",sessionRuckMiles:"ruckMiles",sessionRowMeters:"rowMeters",sessionPackWeight:"packWeight",completed:"completed",sessionNote:"note"};','restore actual metrics')
source=must_replace(source,'["sessionRPE","sessionDuration","postPain","completed","sessionNote"].forEach(id=>{','["sessionRPE","sessionDuration","postPain","sessionRunMiles","sessionRuckMiles","sessionRowMeters","sessionPackWeight","completed","sessionNote"].forEach(id=>{','remember actual metrics')
source=must_replace(source,'"score","rpe","duration","postPain"]','"score","rpe","duration","postPain","runMiles","ruckMiles","rowMeters","packWeight"]','backup metric validation')

index=must_replace(index,'    <div class="why-card"><strong>Why this session?</strong><p id="workoutWhy"></p></div>\n    <div class="section-row"><h2>Exercises</h2>','    <div class="why-card"><strong>Why this session?</strong><p id="workoutWhy"></p></div>\n    <div class="why-card" id="weekTargetCard"></div>\n    <div class="section-row"><h2>Exercises</h2>','week target card')
index=must_replace(index,'      </div>\n      <label class="note-input"><span>Session note</span><input id="sessionNote" type="text" placeholder="Optional"></label>','      </div>\n      <div class="feedback-grid">\n        <label id="sessionRunMilesField" class="hidden"><span>Run distance · mi</span><input id="sessionRunMiles" type="number" inputmode="decimal" step=".01" placeholder="actual"></label>\n        <label id="sessionRuckMilesField" class="hidden"><span>Ruck distance · mi</span><input id="sessionRuckMiles" type="number" inputmode="decimal" step=".01" placeholder="actual"></label>\n        <label id="sessionRowMetersField" class="hidden"><span>Row distance · m</span><input id="sessionRowMeters" type="number" inputmode="numeric" placeholder="actual"></label>\n        <label id="sessionPackWeightField" class="hidden"><span>Pack weight · lb</span><input id="sessionPackWeight" type="number" inputmode="decimal" step=".1" placeholder="actual"></label>\n      </div>\n      <label class="note-input"><span>Session note</span><input id="sessionNote" type="text" placeholder="Optional"></label>','session actual fields')

sw=must_replace(sw,"const CACHE='land-prep-v62';","const CACHE='land-prep-v63';",'service worker cache bump')

for phrase in ['Use current phase target','Use weekly allocation','Use this week’s mileage allocation','Use current weekly target','Follow current block target','Phase-specific intervals or tempo','Use quality-run structure']:
    if phrase in source: raise SystemExit(f'placeholder still present: {phrase}')

app_path.write_text(source)
index_path.write_text(index)
sw_path.write_text(sw)
