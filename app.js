const $=id=>document.getElementById(id),n=id=>{const v=parseFloat($(id)?.value);return Number.isFinite(v)?v:null},s=id=>$(id)?.value||"";
const blocks=[["Re-entry",1,4,"Up to 2 short run/walk sessions per week; aerobic rowing 2–3×40–60 min","No weighted-pack walking yet","Recondition and establish baselines"],["Foundation I",5,8,"2 runs/week; ~3–6 mi","2–4 mi easy","Continuous running tolerance"],["Foundation II",9,12,"2–3 runs/week; ~6–10 mi","3–5 mi easy","Aerobic base and bodyweight training"],["Build I",13,16,"3 runs/week; ~10–16 mi","4–6 mi","Controlled threshold introduction"],["Build II",17,20,"3 runs/week; ~14–20 mi","5–8 mi","Long-run growth"],["Build III",21,24,"3 runs/week; ~16–22 mi","6–10 mi","Consolidate and test"],["Specificity I",25,28,"3–4 runs/week; ~20–26 mi","8–10 mi","Running economy and weighted-pack walking technique"],["Specificity II",29,32,"3–4 runs/week; ~22–30 mi","8–12 mi","Threshold + long aerobic"],["Specificity III",33,36,"4 runs/week; ~26–34 mi","10–14 mi","Consecutive-day exposure"],["Specificity IV",37,40,"3–4 runs/week; ~24–32 mi","10–14 mi","Absorb training"],["Work Capacity I",41,44,"4 runs/week; ~28–38 mi","12–16 mi","Accumulated workload"],["Work Capacity II",45,48,"4–5 runs/week; ~34–45 mi","14–20 mi","Peak specificity"],["Peak / Consolidate",49,52,"~38–50 mi only if earned","16–24 mi only if earned","Peak work-capacity assessment"],["Taper",53,56,"Reduce 30→80%","Reduce then eliminate","Dissipate fatigue"]];
const templates={
Re:["Recovery & mobility","Full-body strength — Session A","Easy aerobic row","Full-body strength — Session B","Easy aerobic row","Introductory run/walk","Easy row + trunk work"],
Fo:["Recovery & mobility","Full-body strength + bodyweight training","Easy aerobic row","Easy run + lower-leg durability","Full-body strength — Session B","Long easy run or light ruck","Easy recovery row"],
Bu:["Recovery & mobility","Faster aerobic work + strength","Easy run","Rowing or controlled threshold work","Strength + bodyweight training","Long run or weighted-pack walk","Easy recovery row"],
Sp:["Recovery & mobility","Quality run + bodyweight training","Easy run","Strength + easy row","Easy run + loaded carries","Long weighted-pack walk or run","Recovery aerobic work"],
Wo:["Recovery & mobility","Quality run","Medium aerobic run","Strength + loaded carries","Easy run","Long ruck/run session","Easy aerobic work while fatigued"],
Pe:["Recovery & mobility","Specific hard session","Medium aerobic run","Carries + strength maintenance","Easy run","Peak specific session","Recovery aerobic work"],
Ta:["Recovery & mobility","Short quality session","Easy aerobic work","Light strength","Easy aerobic work","Short specific session","Recovery"]
};

const sessionCatalog={
"Full-body strength — Session A":{
 title:"Full-body strength — Session A",
 why:"Build the basic strength that supports running, weighted-pack walking, bodyweight training, posture and injury resistance.",
 steps:[
  ["Back squat","3 sets × 5 reps","Rest 2–3 min","Use a load you could lift for about 2 more good reps at the end of each set."],
  ["Romanian deadlift","3 × 6–8","Rest 2–3 min","Hinge at the hips; keep the back neutral."],
  ["Overhead press","3 × 5","Rest 2 min","Controlled reps; no grinding."],
  ["Pull-ups","3–5 submaximal sets","Rest 2 min","Stop each set before form breaks. Use a resistance band if needed."],
  ["Tibialis raises","3 × 15–25","Rest 60–90 sec","Use the tibialis device; controlled full range."],
  ["Calf or seated soleus raises","3 × 12–20","Rest 60–90 sec","Alternate straight-knee and bent-knee emphasis across sessions."],
  ["Neck harness","2–3 sets each direction","Rest 60 sec","Light, controlled flexion/extension/lateral work. Never jerk the neck."],
  ["Grip work","2–3 sets","Rest 60–90 sec","Use hangs, carries or grip tools. Do not max-test every session."]
 ]},
"Full-body strength — Session B":{
 title:"Full-body strength — Session B",
 why:"Build unilateral leg strength, trunk stability, pulling strength and loaded-carry durability.",
 steps:[
  ["Split squat or reverse lunge","3 × 6–8 each leg","Rest 2 min","Stay controlled and balanced."],
  ["Hip hinge","3 × 6–8","Rest 2–3 min","Use RDL, deadlift variation or dumbbells depending equipment and fatigue."],
  ["Horizontal press + row","3 × 6–10 each","Rest 90–120 sec","Examples: dumbbell bench press and one-arm row."],
  ["Suitcase carry","3 × 40–100 m each side","Rest as needed","Stay tall; do not lean toward the weight."],
  ["Tibialis + soleus","3 sets each","Rest 60–90 sec","Lower-leg durability work."],
  ["Neck harness","2–3 controlled sets","Rest 60 sec","Use modest loading."],
  ["Forearm roller","2–3 climbs","Rest 60–90 sec","Smooth wrist flexion/extension."]
 ]},
"Easy aerobic row":{
 title:"Easy aerobic row",
 why:"Build the aerobic engine with very little impact, preserving your running and bone-loading capacity for when it is actually needed.",
 steps:[
  ["Warm up","5–10 min","—","Very easy rowing."],
  ["Main row","40–75 min by phase","Continuous","Conversational effort. You should be able to speak in full sentences."],
  ["Cool down","5 min","—","Very easy."]
 ]},
"Recovery & mobility":{
 title:"Recovery & mobility",
 why:"Reduce fatigue while keeping the body moving.",
 steps:[
  ["Easy walk or row","20–40 min","Continuous","Very easy; this should leave you feeling better, not tired."],
  ["Ankle mobility","2 × 8–10 each side","—","Controlled knee-over-toe range without pain."],
  ["Hip mobility","5–10 min","—","Gentle movement, not aggressive stretching."],
  ["Optional light trunk work","2–3 easy sets","—","Plank, side plank or dead bug."]
 ]},
"Introductory run/walk":{
 title:"Introductory run/walk",
 why:"Start rebuilding running-specific bone, tendon, foot and coordination tolerance without spending unnecessary mechanical load.",
 steps:[
  ["Warm up walk","5–10 min","—","Brisk but easy."],
  ["Run/walk","10–25 min total","Alternate as needed","Easy running only. Stop if gait changes or pain becomes localized."],
  ["Cool down walk","5 min","—","Easy."]
 ]},
"Easy run":{
 title:"Easy run",
 why:"Build running-specific aerobic fitness and tissue tolerance.",
 steps:[
  ["Warm up","5–10 min","—","Walk/jog easily."],
  ["Main run","Use this week's mileage target","Continuous","Comfortable conversational pace. Do not chase pace."],
  ["Cool down","5–10 min","—","Easy jog/walk."]
 ]},
"Easy run + lower-leg durability":{
 title:"Easy run + lower-leg durability",
 why:"Combine a controlled running stimulus with targeted shin, calf and ankle strengthening.",
 steps:[
  ["Easy run","Use current phase target","Continuous","Conversational pace."],
  ["Tibialis raises","3 × 20","60 sec","Controlled."],
  ["Seated soleus raises","3 × 15–20","60–90 sec","Moderate load."],
  ["Eccentric calf raises","3 × 12–15","60–90 sec","Lower slowly for ~3 seconds."]
 ]},
"Full-body strength + bodyweight training":{
 title:"Full-body strength + bodyweight training",
 why:"Maintain strength while improving strict push-up and pull-up capacity.",
 steps:[
  ["Strength","Use Session A or B","—","Alternate A/B each time this session appears."],
  ["Push-ups","4–6 submaximal sets","2 min","Leave 2–4 reps in reserve."],
  ["Pull-ups","4–6 submaximal sets","2 min","Band-assisted if needed."],
  ["Core","3 sets","60–90 sec","RKC plank, side plank or controlled sit-up work."]
 ]},
"Easy recovery row":{
 title:"Easy recovery row",
 why:"Add aerobic volume without adding more running impact.",
 steps:[
  ["Row","30–60 min","Continuous","Very easy to easy conversational effort."]
 ]},
"Easy row + trunk work":{
 title:"Easy row + trunk work",
 why:"Build aerobic capacity and reinforce posture under fatigue.",
 steps:[
  ["Easy row","30–60 min","Continuous","Conversational effort."],
  ["RKC plank","3 × 20–40 sec","60 sec","High tension, perfect position."],
  ["Suitcase carry","3 rounds each side","As needed","Tall posture and controlled breathing."]
 ]},
"Long easy run or light ruck":{
 title:"Long easy run or light ruck",
 why:"Build time-on-feet tolerance. Choose the modality prescribed by the current phase and weekly load.",
 steps:[
  ["If running","Use weekly long-run target","Continuous","Easy conversational pace."],
  ["If weighted-pack walking","Use weekly ruck target","Continuous walking","Light pack in early phases. Maintain normal gait and upright posture."]
 ]},
"Long run or weighted-pack walk":{
 title:"Long run or weighted-pack walk",
 why:"Build endurance and load-carriage tolerance without trying to progress every variable at once.",
 steps:[
  ["Long session","Use current weekly target","Continuous","Keep it mostly easy. Increase distance before increasing pack load."]
 ]},
"Long weighted-pack walk or run":{
 title:"Long weighted-pack walk or run",
 why:"Build event-specific durability and prolonged time on feet.",
 steps:[
  ["Long session","Use current phase target","Continuous","Ruck by walking unless the program explicitly calls for running. Keep pace controlled."]
 ]},
"Quality run":{
 title:"Quality run",
 why:"Improve sustainable speed and threshold performance after the aerobic base and tissue tolerance are established.",
 steps:[
  ["Warm up","15–20 min","—","Easy jog plus a few relaxed strides."],
  ["Main work","Phase-specific intervals or tempo","Variable","Use individual heart-rate/lactate/pace data; do not force a universal lactate number."],
  ["Cool down","10–15 min","—","Easy jog."]
 ]},
"Quality run + bodyweight training":{
 title:"Quality run + bodyweight training",
 why:"Develop faster running while maintaining BUD/S-relevant bodyweight strength.",
 steps:[
  ["Run","Use Quality run structure","—","Complete running first."],
  ["Push-ups","4–6 submaximal sets","2 min","Strict reps."],
  ["Pull-ups","4–6 submaximal sets","2 min","Strict or assisted."],
  ["Core","3 sets","60–90 sec","Controlled sit-ups/planks."]
 ]},
"Strength + easy row":{
 title:"Strength + easy row",
 why:"Maintain strength and add low-impact aerobic volume.",
 steps:[
  ["Strength","Use Session A or B","—","Alternate sessions."],
  ["Easy row","30–45 min","Continuous","Very easy to easy."]
 ]},
"Easy run + loaded carries":{
 title:"Easy run + loaded carries",
 why:"Combine running durability with posture and awkward-load capacity.",
 steps:[
  ["Easy run","Use phase target","Continuous","Conversational."],
  ["Bear-hug sandbag carry","3–5 rounds","As needed","Use a manageable sandbag load."],
  ["Suitcase carry","3 rounds each side","As needed","Stay tall."]
 ]},
"Strength + loaded carries":{
 title:"Strength + loaded carries",
 why:"Maintain force production and train posture under external load.",
 steps:[
  ["Strength","Use Session A or B","—","Lower volume if fatigue is high."],
  ["Sandbag bear-hug carry","3–5 rounds","As needed","Controlled walking."],
  ["Suitcase carry","3 rounds each side","As needed","No leaning."]
 ]},
"Light strength":{
 title:"Light strength",
 why:"Retain movement quality during taper without creating soreness.",
 steps:[
  ["Squat","2 × 5","2 min","About 60–70% of normal training load."],
  ["Hinge","2 × 6","2 min","Easy/moderate."],
  ["Press","2 × 5","90 sec","Easy."],
  ["Pull-ups","2–3 easy sets","90 sec","No failure."]
 ]},
"Easy aerobic work":{title:"Easy aerobic work",why:"Maintain aerobic fitness with low fatigue.",steps:[["Easy row, walk or run","20–60 min","Continuous","Choose the lowest-impact option that fits the phase."]]},
"Short quality session":{title:"Short quality session",why:"Retain some speed during taper without accumulating fatigue.",steps:[["Warm up","10–15 min","—","Easy."],["Short controlled efforts","20–30 min total session","—","Finish feeling capable of more."],["Cool down","5–10 min","—","Easy."]]},
"Specific hard session":{title:"Specific hard session",why:"Practice the type of demanding work required in the current peak block.",steps:[["Main session","Follow current block prescription","—","Only execute at full load when readiness is green and pain-free."]]},
"Peak specific session":{title:"Peak specific session",why:"Assess high work capacity after the preceding months of progression.",steps:[["Peak session","Use the current block target","—","This is earned, not automatic. Stop for focal pain, altered gait or systemic red flags."]]},
"Recovery aerobic work":{title:"Recovery aerobic work",why:"Support recovery while preserving aerobic rhythm.",steps:[["Easy row or walk","20–45 min","Continuous","Very easy."]]},
"Easy aerobic work while fatigued":{title:"Easy aerobic work while fatigued",why:"Practice moving under accumulated fatigue without turning a recovery day into another hard session.",steps:[["Easy run or row","30–60 min","Continuous","Strictly easy. Use the rower if additional impact is unnecessary."]]},
"Medium aerobic run":{title:"Medium aerobic run",why:"Build steady running volume between easy and long-run days.",steps:[["Run","Use weekly distribution","Continuous","Easy to moderate; below threshold."]]},
"Faster aerobic work + strength":{title:"Faster aerobic work + strength",why:"Introduce controlled faster work while retaining full-body strength.",steps:[["Aerobic work","Controlled intervals or tempo","—","Not maximal."],["Strength","Abbreviated Session A/B","—","Reduce volume after harder running."]]},
"Rowing or controlled threshold work":{title:"Rowing or controlled threshold work",why:"Develop higher aerobic power with the lowest mechanical cost appropriate to the phase.",steps:[["Main work","30–60 min total","—","Use rowing unless running specificity is required that week."]]},
"Strength + bodyweight training":{title:"Strength + bodyweight training",why:"Maintain strength and improve strict bodyweight performance.",steps:[["Strength","Session A/B","—","Alternate."],["Push-ups & pull-ups","4–6 submaximal sets","—","Avoid daily failure."]]},
"Medium run":{title:"Medium run",why:"Accumulate running volume without the fatigue of a long or quality session.",steps:[["Run","Use weekly distribution","Continuous","Comfortable aerobic pace."]]},
"Carries + strength maintenance":{title:"Carries + strength maintenance",why:"Retain strength while emphasizing loaded posture and awkward-object endurance.",steps:[["Strength","2–3 main lifts, 2 sets each","—","Moderate loads."],["Carries","3–5 rounds","—","Sandbag, suitcase or farmer carry."]]},
"Short specific session":{title:"Short specific session",why:"Retain familiarity with event-specific movement during taper.",steps:[["Specific work","20–40 min","—","Low volume, technically clean."]]}
};
function currentWeek(){return Math.max(1,Math.min(56,parseInt(localStorage.programWeek||1)))}
function blockForWeek(w){const x=blocks.find(b=>w>=b[1]&&w<=b[2])||blocks[0];return{phase:x[0],start:x[1],end:x[2],run:x[3],ruck:x[4],focus:x[5]}}
function daysFor(p){const k=p.startsWith("Re")?"Re":p.startsWith("Fo")?"Fo":p.startsWith("Bu")?"Bu":p.startsWith("Sp")?"Sp":p.startsWith("Wo")?"Wo":p.startsWith("Pe")?"Pe":"Ta";return templates[k]}
const definitions={"threshold":"A hard but controlled intensity you can sustain for meaningful work. It is below an all-out effort and should be individualized.","easy aerobic":"A comfortable effort where breathing stays controlled and you can speak in full sentences.","weighted-pack walk":"Walking with a loaded backpack. This is commonly called a ruck.","submaximal":"Stop the set before failure, leaving several clean repetitions you could still perform.","RKC plank":"A high-tension forearm plank. Squeeze glutes, quads and abs hard while keeping a straight line from shoulders to heels.","soleus":"A deep calf muscle that works strongly when the knee is bent and helps absorb running impact.","tibialis":"The muscle along the front of the shin that lifts the foot upward."};
const movementVisuals={"RKC plank":"<div class='movement-visual'><div class='ground'></div><div class='stick plank'><i class='head'></i><i class='body'></i><i class='arm a1'></i><i class='arm a2'></i><i class='leg l1'></i><i class='leg l2'></i></div></div>","Back squat":"<div class='movement-visual'><div class='ground'></div><div class='stick squat'><i class='head'></i><i class='body'></i><i class='arm a1'></i><i class='arm a2'></i><i class='leg l1'></i><i class='leg l2'></i><i class='bar'></i></div></div>","Romanian deadlift":"<div class='movement-visual'><div class='ground'></div><div class='stick hinge'><i class='head'></i><i class='body'></i><i class='arm a1'></i><i class='arm a2'></i><i class='leg l1'></i><i class='leg l2'></i><i class='bar'></i></div></div>","Pull-ups":"<div class='movement-visual'><i class='pullbar'></i><div class='stick pullup'><i class='head'></i><i class='body'></i><i class='arm a1'></i><i class='arm a2'></i><i class='leg l1'></i><i class='leg l2'></i></div></div>","Overhead press":"<div class='movement-visual'><div class='ground'></div><div class='stick press'><i class='head'></i><i class='body'></i><i class='arm a1'></i><i class='arm a2'></i><i class='leg l1'></i><i class='leg l2'></i><i class='bar'></i></div></div>"};
function infoButton(term){return definitions[term]?" <button class='info-btn' data-term='"+term+"' aria-label='Explain "+term+"'>i</button>":""}
function explainText(text){let out=String(text);Object.keys(definitions).forEach(k=>{const re=new RegExp("\\b"+k.replace(/[.*+?^$()|[\]{}]/g,"\\function systemic(){")+"\\b","gi");out=out.replace(re,m=>m+infoButton(k))});return out}
function openInfo(title,body,visual=""){$("modalContent").innerHTML=(visual||"")+"<div class='modal-kicker'>GUIDANCE</div><h2>"+title+"</h2><p>"+body+"</p>";$("infoModal").classList.remove("hidden")}
function closeInfo(){$("infoModal").classList.add("hidden")}
function bindInfoButtons(root=document){root.querySelectorAll(".info-btn").forEach(b=>b.onclick=e=>{e.stopPropagation();const term=b.dataset.term;openInfo(term.charAt(0).toUpperCase()+term.slice(1),definitions[term])})}
function requiredFieldStatus(){const required=["hrv","rhr","sleep","sleepQ","fatigue","load","pain","performance","weight"];let done=0;required.forEach(id=>{const el=$(id),field=el?.closest(".field"),ok=el&&String(el.value).trim()!=="";if(ok)done++;if(field){field.classList.toggle("field-done",ok);field.classList.toggle("field-needed",!ok)}});const left=required.length-done,b=$("checkinProgress"),t=$("checkinProgressText");if(!b)return;if(left===0){b.classList.add("complete");b.querySelector(".attention-icon").textContent="✓";b.querySelector("strong").textContent="Morning check-in complete";t.textContent="Ready to evaluate today’s plan."}else{b.classList.remove("complete");b.querySelector(".attention-icon").textContent="!";b.querySelector("strong").textContent="Morning check-in needs attention";t.textContent=left+" required field"+(left===1?"":"s")+" remaining."}}
function systemic(){const sleep=n("sleep"),sq=n("sleepQ"),fat=n("fatigue"),h=n("hrv"),hb=n("hrvBase"),r=n("rhr"),rb=n("rhrBase"),g=n("grip"),gb=n("gripBase"),perf=s("performance");if([sleep,sq,fat,h,r].every(v=>v===null)&&!perf)return"";if((sleep!==null&&sleep<6)||(sq!==null&&sq<=2)||(fat!==null&&fat>=4)||(hb&&h!==null&&h<.85*hb)||(rb&&r!==null&&r>rb+8)||perf==="NO")return"RED";if((sleep!==null&&sleep<7)||sq===3||fat===3||(hb&&h!==null&&h<.92*hb)||(rb&&r!==null&&r>rb+5)||(gb&&g!==null&&g<.9*gb))return"YELLOW";return"GREEN"}
function mechanical(){const p=n("pain");if(p===null&&!$("focal").checked&&!$("gait").checked)return"";if($("focal").checked||$("gait").checked||(p!==null&&p>=5))return"RED";if(p!==null&&p>=3)return"YELLOW";return"GREEN"}
function fueling(){const w=n("weight"),a=n("weightAvg"),l=n("load");if(w===null||a===null||l===null)return"";if(w<a*.985&&l>=7)return"RED";if(w<a*.99&&l>=5)return"YELLOW";return"GREEN"}
function overall(a,b,c){if(!a&&!b&&!c)return"";if(a==="RED"||b==="RED")return"RED";if(a==="YELLOW"||b==="YELLOW"||c==="RED")return"YELLOW";return"GREEN"}
function color(el,v){if(!el)return;el.textContent=v||"—";el.style.color=v==="GREEN"?"var(--green)":v==="YELLOW"?"var(--yellow)":v==="RED"?"var(--red)":"var(--muted)"}
function persistInputs(){["hrv","hrvBase","rhr","rhrBase","sleep","sleepQ","fatigue","grip","gripBase","load","pain","performance","weight","weightAvg"].forEach(id=>localStorage.setItem("input_"+id,$(id).value));localStorage.input_focal=$("focal").checked?"1":"0";localStorage.input_gait=$("gait").checked?"1":"0"}
function evaluate(){const a=systemic(),b=mechanical(),c=fueling(),o=overall(a,b,c);color($("sysStatus"),a);color($("mechStatus"),b);color($("fuelStatus"),c);color($("overallStatus"),o);$("statusPill").textContent=o||"Check in";$("statusPill").className="status-pill "+(o?o.toLowerCase():"neutral");let run,ruck,c2,strength,intensity,nutrition,warn="";if(!o)run=ruck=c2=strength=intensity=nutrition="Complete inputs";else{run=b==="RED"?"NO RUN":o==="RED"?"C2 / WALK ONLY":o==="YELLOW"?"Reduce 25–40%; easy":"Full phase plan";ruck=b==="RED"?"NO RUCK":o==="RED"?"No loaded ruck":o==="YELLOW"?"Reduce / light":"Full phase plan";c2=b==="RED"?"Easy C2 if pain-free":o==="RED"?"Recovery C2":o==="YELLOW"?"Prefer easy C2":"Phase plan";strength=b==="RED"?"Non-aggravating only":a==="RED"?"Cut ~50%":o==="YELLOW"?"Cut ~30%":"Full plan";intensity=o==="GREEN"?"Planned":o==="YELLOW"?"Easy only / no hard intervals":"No hard training";nutrition=c==="RED"?"Add energy/carbs; review deficit":c==="YELLOW"?"Hold / add carbs around training":"Follow phase target";if(b==="RED")warn="Mechanical override: do not let favorable HRV justify impact or load carriage.";else if(a==="RED")warn="Systemic recovery flag: reduce stress and reassess."}for(const [id,v] of [["runDecision",run],["ruckDecision",ruck],["c2Decision",c2],["strengthDecision",strength],["intensityDecision",intensity],["nutritionDecision",nutrition]])$(id).textContent=v;$("warningBox").textContent=warn;$("warningBox").classList.toggle("hidden",!warn);$("results").classList.remove("hidden");persistInputs();return{sys:a,mech:b,fuel:c,ov:o,run,ruck,c2}}
function saveLog(){const r=evaluate();if(!r.ov)return;const logs=JSON.parse(localStorage.trainingLogs||"[]");logs.unshift({date:new Date().toISOString(),week:currentWeek(),weight:n("weight"),hrv:n("hrv"),rhr:n("rhr"),grip:n("grip"),sleep:n("sleep"),overall:r.ov,run:r.run,ruck:r.ruck,c2:r.c2});localStorage.trainingLogs=JSON.stringify(logs.slice(0,180));dbSet("trainingLogs",localStorage.trainingLogs);updateDashboard();updateCalibration();applyLearnedBaselines();renderTrends();$("saveBtn").textContent="Saved ✓";setTimeout(()=>$("saveBtn").textContent="Save Today to Log",1200)}
function renderWeek(){const w=Math.max(1,Math.min(56,parseInt($("weekInput").value||1)));localStorage.programWeek=w;dbSet("programWeek",String(w));const b=blockForWeek(w),days=daysFor(b.phase);$("heroPhase").textContent="Week "+w+" · "+b.phase;$("weekSummary").innerHTML='<div class="week-card"><h3>Week '+w+' · '+b.phase+'</h3><div class="meta">'+(w>=53?"TAPER":w%4===0?"CONSOLIDATE WEEK":"BUILD WEEK")+'</div><div class="kv"><span>Running target</span><strong>'+explainText(b.run)+'</strong><span>Weighted-pack target</span><strong>'+explainText(b.ruck)+'</strong><span>Main purpose</span><strong>'+explainText(b.focus)+'</strong></div><div class="day-list">'+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>{const det=sessionDetails(days[i]);return '<div class="day-wrap"><button class="day day-button" data-session="'+encodeURIComponent(days[i])+'"><b>'+d+'</b><div><strong>'+explainText(det.title)+'</strong><small>'+explainText(det.why)+'</small></div><span class="day-chevron">⌄</span></button><div class="day-detail"></div></div>'}).join("")+'</div></div>';bindInfoButtons($("weekSummary"));document.querySelectorAll(".day-button").forEach(btn=>btn.addEventListener("click",e=>{if(e.target.closest(".info-btn"))return;const wrap=btn.closest(".day-wrap"),box=wrap.querySelector(".day-detail"),wasOpen=wrap.classList.contains("open");document.querySelectorAll(".day-wrap.open").forEach(x=>{x.classList.remove("open");x.querySelector(".day-detail").innerHTML=""});if(!wasOpen){const det=sessionDetails(decodeURIComponent(btn.dataset.session));wrap.classList.add("open");box.innerHTML='<div class="detail-sheet"><p>'+explainText(det.why)+'</p>'+stepsHtml(det)+'</div>';bindExerciseButtons(box)}}));updateDashboard()}
function renderProgram(){const w=currentWeek(),history=JSON.parse(localStorage.workoutHistory||"[]");$("programBlocks").innerHTML=blocks.map(x=>{const active=w>=x[1]&&w<=x[2],completed=new Set(history.filter(y=>y.week>=x[1]&&y.week<=x[2]&&y.completed==="YES").map(y=>new Date(y.date).toDateString())).size,total=(x[2]-x[1]+1)*7,pct=Math.min(100,Math.round(completed/total*100));return '<div class="block-card '+(active?"current-phase":"")+'">'+(active?'<div class="current-badge">CURRENT PHASE</div>':'')+'<div class="range">WEEKS '+x[1]+'–'+x[2]+'</div><div class="phase-head"><div><h3>'+x[0]+'</h3><p>'+explainText(x[5])+'</p></div><div class="phase-ring" style="--p:'+pct+'"><span>'+pct+'%</span></div></div><div class="kv"><span>Running</span><strong>'+explainText(x[3])+'</strong><span>Weighted pack</span><strong>'+explainText(x[4])+'</strong></div><small class="phase-progress-copy">'+completed+' of '+total+' scheduled days completed</small></div>'}).join("");bindInfoButtons($("programBlocks"))}
function updateDashboard(){const w=currentWeek(),b=blockForWeek(w),logs=JSON.parse(localStorage.trainingLogs||"[]");$("dashWeek").textContent=w;$("dashPhase").textContent=b.phase;$("dashFocus").textContent=b.focus;$("weekProgress").style.width=(w/56*100)+"%";$("dashRecovery").textContent=logs[0]?.overall||"—"}
function avg(vals){const x=vals.filter(v=>Number.isFinite(v));return x.length?x.reduce((a,b)=>a+b,0)/x.length:null}
function applyLearnedBaselines(){const logs=JSON.parse(localStorage.trainingLogs||"[]");const recent28=logs.slice(0,28),recent7=logs.slice(0,7);const hb=avg(recent28.map(x=>x.hrv)),rb=avg(recent28.map(x=>x.rhr)),gb=avg(recent28.map(x=>x.grip)),wa=avg(recent7.map(x=>x.weight));if(hb!==null&&!$("hrvBase").matches(":focus"))$("hrvBase").value=hb.toFixed(0);if(rb!==null&&!$("rhrBase").matches(":focus"))$("rhrBase").value=rb.toFixed(0);if(gb!==null&&!$("gripBase").matches(":focus"))$("gripBase").value=gb.toFixed(1);if(wa!==null&&!$("weightAvg").matches(":focus"))$("weightAvg").value=wa.toFixed(1)}
function updateCalibration(){const c=Math.min(7,JSON.parse(localStorage.trainingLogs||"[]").length);$("calCount").textContent=c;$("calibrationTitle").textContent=c>=7?"Baseline established":"Baseline calibration";$("calibrationText").textContent=c>=7?"Adaptive decisions now have useful personal history.":`${7-c} more check-in${7-c===1?"":"s"} to establish an initial trend.`}
function todaySession(){const b=blockForWeek(currentWeek()),i=(new Date().getDay()+6)%7;return{b,name:daysFor(b.phase)[i]}}
function sessionDetails(name){if(sessionCatalog[name])return sessionCatalog[name];if(name.includes("Strength"))return sessionCatalog["Full-body strength — Session A"];if(name.includes("row")||name.includes("Concept2"))return sessionCatalog["Easy aerobic row"];if(name.includes("Quality"))return sessionCatalog["Quality run"];if(name.includes("Easy run"))return sessionCatalog["Easy run"];if(name.includes("Recovery"))return sessionCatalog["Recovery & mobility"];if(name.includes("Long"))return sessionCatalog["Long run or weighted-pack walk"];return{title:name,why:"Complete the scheduled work using the current phase target.",steps:[["Main session","Use current phase target","—","Keep technique clean and follow today's adaptive recommendation."]]}}
function stepsHtml(det){return '<div class="exercise-list">'+det.steps.map((x,i)=>'<button class="exercise-row exercise-button" data-exercise="'+encodeURIComponent(x[0])+'"><div class="exercise-num">'+(i+1)+'</div><div><strong>'+explainText(x[0])+'</strong><span>'+explainText(x[1]+' · '+x[2])+'</span><small>'+explainText(x[3])+'</small></div><div class="exercise-chevron">›</div></button>').join("")+'</div>'}
function bindExerciseButtons(root=document){root.querySelectorAll(".exercise-button").forEach(btn=>btn.onclick=e=>{if(e.target.closest(".info-btn"))return;const name=decodeURIComponent(btn.dataset.exercise),visual=movementVisuals[name]||"<div class='movement-placeholder'>Movement guide</div>";openInfo(name,"Review the set and repetition target shown in the workout. Move slowly through setup and technique before adding load.",visual)});bindInfoButtons(root)}
function renderWeekDetail(name){const det=sessionDetails(name),box=$("weekDetail");box.innerHTML=`<div class="detail-sheet"><div class="detail-head"><div><small>SESSION BREAKDOWN</small><h3>${det.title}</h3></div><button class="close-detail">×</button></div><p>${det.why}</p>${stepsHtml(det)}</div>`;box.querySelector(".close-detail").onclick=()=>box.innerHTML=""}
function renderWorkout(){const x=todaySession(),logs=JSON.parse(localStorage.trainingLogs||"[]"),last=logs[0],det=sessionDetails(x.name);let mod="FULL",cls="",exp="Follow the scheduled prescription.";if(last&&new Date(last.date).toDateString()===new Date().toDateString()){if(last.overall==="RED"){mod="RECOVERY";cls="stop";exp="Today’s check-in calls for recovery-level work. Do not perform impact or loaded work that conflicts with a red injury/recovery flag."}else if(last.overall==="YELLOW"){mod="MODIFIED";cls="reduce";exp="Reduce mechanical load or total work by roughly 25–40%. Keep the session easy unless the plan specifically says otherwise."}}$("workoutKicker").textContent=`TODAY · WEEK ${currentWeek()} · ${x.b.phase.toUpperCase()}`;$("workoutTitle").textContent=det.title;$("workoutPrescription").innerHTML=`<div class="rx-card"><div class="rx-top"><div><div class="rx-type">TODAY'S SESSION</div><h3>${det.title}</h3></div><div class="rx-badge ${cls}">${mod}</div></div><p>${det.why}</p>${stepsHtml(det)}</div><div class="insight-copy"><strong>Today’s adjustment:</strong> ${exp}<br><br><strong>Why this phase matters:</strong> ${x.b.focus}</div>`;bindExerciseButtons($("workoutPrescription"))}
function completeWorkout(){const comp=s("completed");if(!comp){alert("Choose whether the session was completed.");return}const x=todaySession(),arr=JSON.parse(localStorage.workoutHistory||"[]"),rpe=n("sessionRPE"),dur=n("sessionDuration");arr.unshift({date:new Date().toISOString(),week:currentWeek(),session:x.name,rpe,duration:dur,postPain:n("postPain"),completed:comp,note:s("sessionNote")});localStorage.workoutHistory=JSON.stringify(arr.slice(0,365));dbSet("workoutHistory",localStorage.workoutHistory);if(rpe!==null&&dur!==null){const l=Math.min(10,Math.round(rpe*dur/60));localStorage.input_load=l;$("load").value=l}$("completionBanner").classList.remove("hidden");setTimeout(()=>$("completionBanner").classList.add("hidden"),2000);renderTrends()}
function draw(id,vals){const c=$(id),ctx=c.getContext("2d"),w=c.clientWidth,h=150,d=devicePixelRatio||1;c.width=w*d;c.height=h*d;ctx.scale(d,d);if(vals.length<2){ctx.fillStyle="#a9bad0";ctx.font="13px -apple-system";ctx.fillText("Save check-ins to build this trend.",8,75);return}const mn=Math.min(...vals),mx=Math.max(...vals),sp=mx-mn||1;ctx.strokeStyle="#4da3ff";ctx.lineWidth=2.5;ctx.beginPath();vals.forEach((v,i)=>{const x=10+i*(w-20)/(vals.length-1),y=h-10-(v-mn)*(h-20)/sp;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}
function renderTrends(){const logs=JSON.parse(localStorage.trainingLogs||"[]").slice(0,28).reverse(),map={RED:0,YELLOW:1,GREEN:2},wv=logs.filter(x=>x.weight!=null).map(x=>x.weight);$("trendRecovery").textContent=logs.length?`${logs.length} check-ins`:"No data";$("trendWeight").textContent=wv.length?`${wv.at(-1).toFixed(1)} lb`:"No data";requestAnimationFrame(()=>{draw("recoveryChart",logs.map(x=>map[x.overall]));draw("weightChart",wv)});$("trendLogList").innerHTML=logs.slice(-5).reverse().map(x=>`<div class="log-card"><strong>Week ${x.week} · ${x.overall}</strong><div class="hero-sub">${new Date(x.date).toLocaleDateString()}</div></div>`).join("")||'<div class="week-card"><p class="hero-sub">No saved check-ins yet.</p></div>';countRecords()}
const DB_NAME="AdaptiveLandPrepDB",STORE="kv";function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}async function dbSet(k,v){try{const d=await openDB(),t=d.transaction(STORE,"readwrite");t.objectStore(STORE).put(v,k)}catch(e){}}async function requestPersistence(){let p=false;try{p=await navigator.storage?.persisted?.()||await navigator.storage?.persist?.()}catch(e){}$("persistBadge").textContent=p?"PERSISTENT":"ON DEVICE";$("persistBadge").classList.toggle("good",p);$("dbStatus").textContent=p?"Persistent storage granted":"IndexedDB active; periodic backup recommended"}
function countRecords(){const a=JSON.parse(localStorage.trainingLogs||"[]").length,b=JSON.parse(localStorage.workoutHistory||"[]").length;$("recordCount").textContent=`${a+b} records`;$("lastBackup").textContent=localStorage.lastBackupAt?new Date(localStorage.lastBackupAt).toLocaleString():"Never"}
function exportBackup(){const payload={app:"Adaptive Land Prep",formatVersion:1,exportedAt:new Date().toISOString(),data:{trainingLogs:localStorage.trainingLogs||"[]",workoutHistory:localStorage.workoutHistory||"[]",programWeek:String(currentWeek())}};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="adaptive-land-prep-backup.json";a.click();localStorage.lastBackupAt=payload.exportedAt;countRecords()}
async function importBackup(f){const o=JSON.parse(await f.text());if(o.app!=="Adaptive Land Prep")throw Error();Object.entries(o.data).forEach(([k,v])=>localStorage.setItem(k,v));location.reload()}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(btn.dataset.target).classList.add("active");$("pageTitle").textContent=btn.querySelector("small").textContent;if(btn.dataset.target==="workout")renderWorkout();if(btn.dataset.target==="week")renderWeek();if(btn.dataset.target==="trends")renderTrends();if(btn.dataset.target==="program")renderProgram();window.scrollTo({top:0,left:0,behavior:"instant"})}));
$("evaluateBtn").onclick=()=>{requiredFieldStatus();evaluate()};$("modalClose").onclick=closeInfo;$("infoModal").onclick=e=>{if(e.target===$("infoModal"))closeInfo()};$("saveBtn").onclick=saveLog;$("completeWorkout").onclick=completeWorkout;$("weekInput").onchange=renderWeek;$("exportBackup").onclick=exportBackup;$("importBackup").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]).catch(()=>alert("That backup could not be restored."));
["hrv","hrvBase","rhr","rhrBase","sleep","sleepQ","fatigue","grip","gripBase","load","pain","performance","weight","weightAvg"].forEach(id=>{const v=localStorage.getItem("input_"+id);if(v!==null)$(id).value=v;$(id).addEventListener("input",requiredFieldStatus);$(id).addEventListener("change",requiredFieldStatus)});$("focal").checked=localStorage.input_focal==="1";$("gait").checked=localStorage.input_gait==="1";$("weekInput").value=currentWeek();renderWeek();renderProgram();renderWorkout();renderTrends();updateCalibration();applyLearnedBaselines();requiredFieldStatus();requestPersistence();if("serviceWorker"in navigator)addEventListener("load",async()=>{const reg=await navigator.serviceWorker.register("./service-worker.js");reg.update();navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!sessionStorage.swReloaded){sessionStorage.swReloaded="1";location.reload()}})});