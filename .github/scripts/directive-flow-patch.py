from pathlib import Path
import re


def read(path):
    return Path(path).read_text()


def write(path, text):
    Path(path).write_text(text)


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 exact match, found {count}")
    return text.replace(old, new, 1)


def sub_once(text, pattern, repl, label, flags=0):
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 regex match, found {count}")
    return out


# index.html — add one dominant Today directive and reduce check-in to one submit.
p = "index.html"
s = read(p)
anchor = '  <div id="missedDayBanner" class="missed-banner hidden"></div>\n  <div id="readinessCard" class="readiness-card readiness-button" role="button" tabindex="0">'
directive = '''  <div id="missedDayBanner" class="missed-banner hidden"></div>
  <section id="dailyDirective" class="daily-directive hidden" aria-live="polite">
    <div class="directive-top"><span id="directiveStage">MORNING</span><span id="directiveStep">STEP 1 OF 4</span></div>
    <div class="directive-status-row"><span id="directiveState" class="directive-state neutral">CHECK IN</span><span id="directiveJourney">Week 1 · Foundation</span></div>
    <h2 id="directiveTitle">Morning check-in</h2>
    <p id="directiveCopy">Enter today’s measured recovery values, then tap the quick subjective checks.</p>
    <div id="directiveReason" class="directive-reason"></div>
    <div id="directiveWorkout" class="directive-workout hidden"></div>
    <div id="directiveMacros" class="directive-macros hidden"></div>
    <div id="directiveTimeline" class="directive-timeline"></div>
    <button id="directivePrimary" class="directive-primary">Begin morning check-in</button>
    <button id="directiveSecondary" class="directive-secondary hidden"></button>
  </section>
  <div id="readinessCard" class="readiness-card readiness-button" role="button" tabindex="0">'''
s = replace_once(s, anchor, directive, "insert daily directive")
s = replace_once(
    s,
    '    <button class="sheet-primary" id="evaluateBtn">Evaluate Today</button>',
    '    <button class="sheet-primary" id="evaluateBtn">Generate Today’s Directive</button>',
    "one-tap check-in CTA",
)
s = replace_once(
    s,
    '    <div id="checkinProgress" class="attention-banner"><span class="attention-icon">!</span><div><strong>Needs attention</strong><small id="checkinProgressText">Complete the fields below.</small></div></div>',
    '    <div id="checkinProgress" class="attention-banner"><span class="attention-icon">!</span><div><strong>Needs attention</strong><small id="checkinProgressText">Complete the fields below.</small></div></div>\n    <p class="checkin-mode-note">Measured values use the keypad. Daily judgments use large tap choices—no notes required.</p>',
    "check-in interaction note",
)
write(p, s)


# app.js — mobility reminders, trustworthy images, tap choices, guided Today state.
p = "app.js"
s = read(p)

replacements = [
    (
        ' if(name.includes("Long easy row + lower-leg durability"))return{title:name,type:"Aerobic + Durability",duration:"65–90 min",effort:"Easy",why:"Extend low-impact aerobic work while building lower-leg capacity before running begins.",steps:[ex("Easy row","50–70 min","Continuous","Conversational effort throughout.","Row"),ex("Tibialis raises","3 × 15–25","60 sec","Controlled full range.","Durability"),ex("Calf / soleus raises","3 × 12–20","60 sec","Use straight- and bent-knee work without bouncing.","Durability"),ex("Ankle mobility","5–8 min","—","Controlled, pain-free range.","Mobility")]};',
        ' if(name.includes("Long easy row + lower-leg durability"))return{title:name,type:"Aerobic + Durability",duration:"65–90 min",effort:"Easy",why:"Extend low-impact aerobic work while building lower-leg capacity before running begins.",steps:[ex("Easy row","50–70 min","Continuous","Conversational effort throughout.","Row"),ex("Tibialis raises","3 × 15–25","60 sec","Controlled full range.","Durability"),ex("Calf / soleus raises","3 × 12–20","60 sec","Use straight- and bent-knee work without bouncing.","Durability"),ex("Mobility reminder","5–8 min","—","Use your preferred pain-free ankle and hip mobility routine.","Reminder")]};',
        "lower-leg mobility reminder",
    ),
    (
        ' if(name.includes("Recovery & mobility"))return{title:name,type:"Recovery",duration:"25–45 min",effort:"Very easy",why:"Reduce fatigue while keeping the body moving and joints comfortable.",steps:[ex("Easy walk or row","20–30 min","Continuous","Very easy.","Aerobic"),ex("Ankle mobility","2 × 8–10 each side","—","Move through pain-free range.","Mobility"),ex("Hip mobility","5–10 min","—","Gentle controlled movement.","Mobility"),ex("Light trunk work","2–3 easy sets","60 sec","Plank, side plank or dead bug.","Core")]};',
        ' if(name.includes("Recovery & mobility"))return{title:name,type:"Recovery",duration:"25–45 min",effort:"Very easy",why:"Reduce fatigue while keeping the body moving and joints comfortable.",steps:[ex("Easy walk or row","20–30 min","Continuous","Very easy.","Aerobic"),ex("Mobility reminder","5–10 min","—","Use your preferred gentle, pain-free mobility routine. The app does not prescribe a specific stretch sequence.","Reminder"),ex("Light trunk work","2–3 easy sets","60 sec","Plank, side plank or dead bug.","Core")]};',
        "recovery mobility reminder",
    ),
    (
        ' if(dec.b==="RED")return{title:"Mechanical Recovery Override",type:"Recovery",duration:"20–45 min",effort:"Very easy / pain-free",why:"Pain or altered movement triggered the mechanical stop rule. Impact and loaded walking are removed until the red flag resolves.",steps:[ex("Easy row or walk","20–30 min","Continuous","Only if pain-free and movement remains normal.","Recovery"),ex("Gentle mobility","10–15 min","—","Use comfortable ranges only.","Mobility")]};',
        ' if(dec.b==="RED")return{title:"Mechanical Recovery Override",type:"Recovery",duration:"20–45 min",effort:"Very easy / pain-free",why:"Pain or altered movement triggered the mechanical stop rule. Impact and loaded walking are removed until the red flag resolves.",steps:[ex("Easy row or walk","20–30 min","Continuous","Only if pain-free and movement remains normal.","Recovery"),ex("Mobility reminder","10–15 min","—","Use your preferred comfortable, pain-free mobility routine.","Reminder")]};',
        "mechanical override mobility reminder",
    ),
    (
        ' if(dec.o==="RED")return{title:"Recovery Override",type:"Recovery",duration:"25–50 min",effort:"Very easy",why:"Systemic recovery is too suppressed for the planned workload. Today prioritizes recovery while preserving routine.",steps:[ex("Easy row","20–40 min","Continuous","Conversational effort; finish fresher than you started.","Recovery"),ex("Light mobility","10 min","—","Gentle, non-fatiguing movement.","Mobility"),ex("Easy trunk work","2 light sets","60 sec","No grinding or failure.","Core")]};',
        ' if(dec.o==="RED")return{title:"Recovery Override",type:"Recovery",duration:"25–50 min",effort:"Very easy",why:"Systemic recovery is too suppressed for the planned workload. Today prioritizes recovery while preserving routine.",steps:[ex("Easy row","20–40 min","Continuous","Conversational effort; finish fresher than you started.","Recovery"),ex("Mobility reminder","10 min","—","Use your preferred gentle, non-fatiguing mobility routine.","Reminder"),ex("Easy trunk work","2 light sets","60 sec","No grinding or failure.","Core")]};',
        "systemic override mobility reminder",
    ),
]
for old, new, label in replacements:
    s = replace_once(s, old, new, label)

strict_mapper = r'''function datasetExerciseId(name){
 const n=name.toLowerCase().trim();
 // Technique imagery is opt-in: ambiguous labels are text-only rather than paired with a misleading photo.
 if(/mobility|stretch|reminder| or |main session|long session|main quality work/.test(n))return"";
 const map=[
  [/split squat|reverse lunge|walking lunge|lunge/,"Split_Squat_with_Dumbbells"],
  [/back squat|^squat$/,"Barbell_Full_Squat"],
  [/romanian deadlift|^hip hinge$|^hinge$/,"Romanian_Deadlift"],
  [/overhead press|military press|^press$/,"Standing_Military_Press"],
  [/pull-up|pullups|pull up/,"Pullups"],
  [/push-up|pushups|push up/,"Pushups"],
  [/soleus|seated calf/,"Seated_Calf_Raise"],
  [/calf/,"Standing_Calf_Raises"],
  [/tibialis/,"Anterior_Tibialis-SMR"],
  [/neck harness|neck resistance/,"Lying_Face_Down_Plate_Neck_Resistance"],
  [/grip work|plate pinch|hand squeeze/,"Standing_Olympic_Plate_Hand_Squeeze"],
  [/forearm roller|wrist/,"Palms-Up_Barbell_Wrist_Curl_Over_A_Bench"],
  [/one-arm row|horizontal row/,"One-Arm_Dumbbell_Row"],
  [/rkc plank|^plank$|light trunk work|easy trunk work/,"Plank"],
  [/sit-up|sit up/,"Sit-Up"],
  [/russian twist/,"Russian_Twist"],
  [/controlled threshold work|aerobic row|warm-up row|cool-down row|easy row|rowing/,"Rowing_Stationary"],
  [/controlled quality run|quality run|medium run|easy run|run \/ walk|running/,"Running_Treadmill"],
  [/weighted-pack|ruck/,"Trail_Running_Walking"],
  [/jump rope|rope jumping/,"Rope_Jumping"],
  [/step-up|step up/,"Step-up_with_Knee_Raise"],
  [/deadlift/,"Barbell_Deadlift"]
 ];
 for(const [re,id] of map)if(re.test(n))return id;
 return"";
}'''
s = sub_once(
    s,
    r"function datasetExerciseId\(name\)\{.*?\n\}",
    strict_mapper,
    "strict exercise mapping",
    flags=re.S,
)
s = s.replace(' "Ankle_Circles":{name:"Ankle Mobility",category:"Mobility",tags:"ankle mobility range of motion"},\n', "")
s = s.replace(' "Upward_Stretch":{name:"Hip / General Mobility",category:"Mobility",tags:"hip mobility stretch warm up recovery"},\n', "")

tap_code = '''const TAP_CHECKIN_FIELDS={
 sleepQ:[["1","Very poor"],["2","Poor"],["3","Fair"],["4","Good"],["5","Excellent"]],
 fatigue:[["1","Fresh"],["2","Mild"],["3","Noticeable"],["4","High"],["5","Exhausted"]],
 load:Array.from({length:11},(_,i)=>[String(i),String(i)]),
 pain:Array.from({length:11},(_,i)=>[String(i),String(i)]),
 performance:[["YES","Normal"],["NO","Not normal"]]
};
function syncCheckinTapControls(){
 for(const [id] of Object.entries(TAP_CHECKIN_FIELDS)){
   const source=$(id),scale=source?.closest(".field")?.querySelector(".tap-scale");if(!source||!scale)continue;
   scale.querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b.dataset.value===source.value));
 }
}
function enhanceCheckinTapControls(){
 for(const [id,options] of Object.entries(TAP_CHECKIN_FIELDS)){
   const source=$(id),host=source?.closest(".field");if(!source||!host||host.querySelector(".tap-scale"))continue;
   source.classList.add("tap-source");
   const scale=document.createElement("div");scale.className="tap-scale "+(options.length>6?"scrolling":"");scale.setAttribute("role","group");scale.setAttribute("aria-label",host.querySelector("span")?.textContent?.trim()||id);
   scale.innerHTML=options.map(([value,label])=>'<button type="button" data-value="'+value+'"><strong>'+label+'</strong></button>').join("");
   source.insertAdjacentElement("afterend",scale);
   scale.querySelectorAll("button").forEach(b=>b.onclick=()=>{source.value=b.dataset.value;source.dispatchEvent(new Event("change",{bubbles:true}));persistInputs();requiredFields();syncCheckinTapControls()});
   source.addEventListener("change",syncCheckinTapControls);
 }
 syncCheckinTapControls();
}
function checkinRequiredComplete(){return["hrv","rhr","sleep","sleepQ","fatigue","load","pain","performance","weight"].every(id=>String($(id)?.value||"").trim()!=="")}
'''
s = replace_once(s, "function requiredFields(){", tap_code + "function requiredFields(){", "tap check-in controls")
s = replace_once(
    s,
    'function saveCheckin(){\n evaluate();const d=decision();if(!d.o)return;',
    'function saveCheckin(){\n if(!checkinRequiredComplete()){requiredFields();return}\n evaluate();const d=decision();if(!d.o)return;',
    "required check-in guard",
)
s = replace_once(
    s,
    ' resetHistorical();closeCheckin();renderAll()\n}\nfunction previousWorkoutSignal',
    ' resetHistorical();closeCheckin();renderAll();if(localStorage.programStart)switchTab("today")\n}\nfunction previousWorkoutSignal',
    "check-in returns to directive",
)

directive_code = '''function directiveReason(d){
 if(!d)return"Your saved check-in becomes the input for today’s training and nutrition directive.";
 const reasons=[],pct=(v,b)=>Math.round((1-v/b)*100),dec=d.decision||decision();
 if(Number.isFinite(d.sleep)&&d.sleep<7)reasons.push("Sleep "+d.sleep+" h");
 if(Number.isFinite(d.grip)&&Number.isFinite(d.gripBase)&&d.gripBase>0&&d.grip<.9*d.gripBase)reasons.push("Grip "+pct(d.grip,d.gripBase)+"% below usual");
 if(Number.isFinite(d.hrv)&&Number.isFinite(d.hrvBase)&&d.hrvBase>0&&d.hrv<.92*d.hrvBase)reasons.push("HRV "+pct(d.hrv,d.hrvBase)+"% below usual");
 if(Number.isFinite(d.rhr)&&Number.isFinite(d.rhrBase)&&d.rhrBase>0&&d.rhr>d.rhrBase+5)reasons.push("Resting HR "+Math.round(d.rhr-d.rhrBase)+" bpm above usual");
 if(Number.isFinite(d.pain)&&d.pain>=3)reasons.push("Pain "+d.pain+"/10");
 if(d.priorWorkoutSignal?.reason)reasons.push(d.priorWorkoutSignal.reason.replace(/\\.$/,""));
 const prev=typeof previousNutritionSignal==="function"?previousNutritionSignal():null;
 if(prev&&dec.c!=="GREEN")reasons.push("Recent fueling "+Math.round(prev.ratio*100)+"% of target");
 if(reasons.length)return reasons.join(" · ");
 return d.overall==="GREEN"?"Recovery, mechanical status and fueling support the planned session.":"Today’s saved recovery inputs call for a lower-stress prescription.";
}
function nutritionDayComplete(log=getNutritionLog(),meals=todayMealPlan()){
 if(!log?.saved)return false;
 if(log.intakeSource==="manual-deviation")return true;
 const checked=new Set(log.meals||[]);return meals.length>0&&meals.every(m=>checked.has(m.id));
}
function todayFlowState(){
 if(!localStorage.programStart)return"onboarding";
 if(!todayCheckin())return"morning";
 if(!todayWorkoutRecord())return"directive";
 if(!nutritionDayComplete())return"nutrition";
 return"evening";
}
function directiveTimeline(state,record,nutrition,meals){
 const order=["morning","directive","nutrition","evening"],idx=Math.max(0,order.indexOf(state)),items=[
  ["Check-in",state!=="morning"],
  ["Training",!!record],
  ["Nutrition",nutritionDayComplete(nutrition,meals)],
  ["Day",state==="evening"]
 ];
 return items.map(([label,done],i)=>'<div class="'+(done?"done ":"")+(i===idx?"current":"")+'"><i>'+(done?"✓":i+1)+'</i><span>'+label+'</span></div>').join("");
}
function renderDailyDirective(){
 const card=$("dailyDirective");if(!card)return;
 if(!localStorage.programStart){card.classList.add("hidden");return}
 const state=todayFlowState(),d=todayCheckin(),det=adaptiveSession(),record=todayWorkoutRecord(),target=todayNutritionPrescription(),meals=todayMealPlan(),nutrition=getNutritionLog(),doneMeals=new Set(nutrition.meals||[]),w=prescriptionWeek(),calendar=currentWeek(),phase=macroForWeek(w),rstate=readinessStateMeta(d?.overall);
 card.className="daily-directive "+state;
 $("directiveJourney").textContent=w<calendar?"Held Week "+w+" · Calendar "+calendar+" · "+phase.name:"Week "+w+" · "+phase.name;
 $("directiveTimeline").innerHTML=directiveTimeline(state,record,nutrition,meals);
 $("directiveWorkout").classList.toggle("hidden",state==="morning"||state==="evening");
 $("directiveMacros").classList.toggle("hidden",state==="morning");
 $("directivePrimary").classList.toggle("hidden",state==="evening");
 $("directiveSecondary").classList.toggle("hidden",state==="morning"||state==="evening");
 if(state==="morning"){
   $("directiveStage").textContent="MORNING";$("directiveStep").textContent="STEP 1 OF 4";$("directiveState").textContent="CHECK IN";$("directiveState").className="directive-state neutral";
   $("directiveTitle").textContent="Morning check-in";$("directiveCopy").textContent="Enter today’s measured recovery values, then tap the quick subjective checks. No narrative entry is required.";
   $("directiveReason").innerHTML='<strong>Measured</strong><span>HRV · resting HR · sleep · grip · body weight</span><strong>Tap</strong><span>sleep quality · fatigue · yesterday’s load · pain · training feel</span>';
   $("directivePrimary").textContent="Begin morning check-in";$("directivePrimary").onclick=openCheckin;return
 }
 $("directiveState").textContent=rstate.badge;$("directiveState").className="directive-state "+rstate.cls;
 $("directiveMacros").innerHTML='<div><span>Calories</span><strong>'+target.cal.toLocaleString()+'</strong><small>kcal</small></div><div><span>Protein</span><strong>'+target.protein+'</strong><small>g</small></div><div><span>Carbs</span><strong>'+target.carbs+'</strong><small>g</small></div><div><span>Fat</span><strong>'+target.fat+'</strong><small>g</small></div>';
 if(state==="directive"){
   $("directiveStage").textContent="TODAY’S DIRECTIVE";$("directiveStep").textContent="STEP 2 OF 4";$("directiveTitle").textContent=det.title;
   $("directiveCopy").textContent=d.overall==="GREEN"?"Do this session today, then record how it landed.":d.overall==="YELLOW"?"Use the modified session below. Do not add intensity back in.":"Recovery is the assignment today. Follow the recovery session below.";
   $("directiveReason").textContent=directiveReason(d);
   $("directiveWorkout").innerHTML='<div class="directive-workout-head"><div><small>'+det.type.toUpperCase()+'</small><strong>'+det.duration+'</strong></div><span>'+det.effort+'</span></div><div class="directive-step-list">'+det.steps.slice(0,4).map((e,i)=>'<div><i>'+(i+1)+'</i><span><strong>'+e.name+'</strong><small>'+e.dose+'</small></span></div>').join("")+'</div>'+(det.steps.some(e=>/Reminder/.test(e.type||""))?'<p class="directive-mobility-note">Mobility is a reminder only: use your preferred pain-free routine.</p>':'');
   $("directivePrimary").textContent="Start today’s session";$("directivePrimary").onclick=()=>switchTab("workout");$("directiveSecondary").textContent="Why this prescription?";$("directiveSecondary").onclick=openReadiness;return
 }
 if(state==="nutrition"){
   const status=record?.completed==="YES"?"Session completed":record?.completed==="PARTIAL"?"Partial session recorded":"Skipped session recorded";
   $("directiveStage").textContent="FUEL & RECOVER";$("directiveStep").textContent="STEP 3 OF 4";$("directiveTitle").textContent="Finish today’s prescribed nutrition";
   $("directiveCopy").textContent=status+". Confirm prescribed meals as you eat them; enter calories or macros only if the day differed from plan.";
   $("directiveReason").textContent=target.adjustment?.copy||"Today’s meal target is matched to the saved readiness decision and training day.";
   $("directiveWorkout").innerHTML='<div class="directive-meal-progress"><strong>'+doneMeals.size+' of '+meals.length+' meals confirmed</strong><span>'+status+'</span><div><i style="width:'+(meals.length?Math.round(doneMeals.size/meals.length*100):0)+'%"></i></div></div>';
   $("directivePrimary").textContent="Continue today’s meals";$("directivePrimary").onclick=()=>switchTab("nutrition");$("directiveSecondary").textContent="Review session";$("directiveSecondary").onclick=()=>switchTab("workout");return
 }
 const actual=Number.isFinite(nutrition.actualCalories)?nutrition.actualCalories:null,status=record?.completed==="YES"?"completed":record?.completed==="PARTIAL"?"partial":"skipped";
 $("directiveStage").textContent="EVENING";$("directiveStep").textContent="STEP 4 OF 4";$("directiveState").textContent="DAY COMPLETE";$("directiveState").className="directive-state complete";
 $("directiveTitle").textContent="Today is captured";$("directiveCopy").textContent="Check-in saved · session "+status+" · intake complete. Tomorrow’s directive will use today’s response and confirmed fueling.";
 $("directiveReason").textContent="No more input is required today.";
 $("directiveWorkout").innerHTML="";$("directiveMacros").innerHTML='<div><span>Recorded</span><strong>'+(actual===null?"—":Math.round(actual).toLocaleString())+'</strong><small>kcal</small></div><div><span>Target</span><strong>'+target.cal.toLocaleString()+'</strong><small>kcal</small></div><div><span>Meals</span><strong>'+doneMeals.size+'/'+meals.length+'</strong><small>confirmed</small></div><div><span>Readiness</span><strong>'+rstate.label+'</strong><small>today</small></div>';
}
'''
s = replace_once(s, "function renderToday(){", directive_code + "function renderToday(){", "daily directive helpers")
s = replace_once(
    s,
    'function renderToday(){$("today").classList.toggle("pre-journey",!localStorage.programStart);',
    'function renderToday(){$("today").classList.toggle("pre-journey",!localStorage.programStart);$("today").classList.toggle("guided-flow",!!localStorage.programStart);',
    "guided Today class",
)
s = replace_once(
    s,
    '$("todayTaskCount").textContent=Object.values(state).filter(Boolean).length+"/"+Object.keys(state).length}',
    '$("todayTaskCount").textContent=Object.values(state).filter(Boolean).length+"/"+Object.keys(state).length;renderDailyDirective()}',
    "render directive at Today end",
)

train_helpers = '''function techniqueReferenceAvailable(e){return!!datasetExerciseId(e.name)&&!/Mobility|Reminder/.test(e.type||"")}
function trainingStepMarkup(e,i){
 if(!techniqueReferenceAvailable(e))return'<div class="exercise-reminder"><div class="exercise-index">'+(i+1)+'</div><div><strong>'+e.name+'</strong><span>'+e.dose+'</span><small>'+(e.type==="Reminder"?e.cue:"Technique image omitted because this movement label is not specific enough for a trustworthy reference.")+'</small></div></div>';
 return'<button class="exercise-card" data-i="'+i+'"><div class="exercise-thumb">'+exerciseMedia(e.name)+'</div><div class="exercise-copy"><strong>'+(i+1)+'. '+e.name+'</strong><span>'+e.dose+'</span><small>Rest: '+e.rest+'</small></div><b>›</b></button>';
}
'''
s = replace_once(s, "function renderTrain(){", train_helpers + "function renderTrain(){", "training media policy")
s = sub_once(
    s,
    r'\$\("exerciseCount"\)\.textContent=det\.steps\.length\+" movements";\$\("workoutPrescription"\)\.innerHTML=det\.steps\.map\(\(e,i\)=>.*?\.join\(""\);',
    '$("exerciseCount").textContent=det.steps.length+" steps";$("workoutPrescription").innerHTML=det.steps.map(trainingStepMarkup).join("");',
    "render text-only ambiguous training steps",
)

mobility_guide = '''function openMobilityGuide(){
 const det=adaptiveSession(),dur=det.steps.filter(e=>/tibialis|soleus|calf|trunk|core/i.test(e.name));
 $("modalTitle").textContent="Mobility reminder";
 $("modalContent").innerHTML='<div class="mobility-reminder-callout"><strong>Use the routine that works for you.</strong><p>Spend 5–10 minutes moving through comfortable, pain-free ranges. The app intentionally does not prescribe or illustrate generic ankle/hip stretches.</p></div>'+(dur.length?'<div class="mobility-guide"><p>Separate durability work in today’s plan:</p>'+dur.map((e,i)=>'<button data-mob="'+i+'"><b>'+(i+1)+'</b><div><strong>'+e.name+'</strong><small>'+e.dose+'</small></div><span>›</span></button>').join("")+'</div>':'');
 $("infoModal").classList.remove("hidden");$("modalContent").querySelectorAll("[data-mob]").forEach(b=>b.onclick=()=>openExercise(dur[+b.dataset.mob]));
}
'''
s = sub_once(s, r"function openMobilityGuide\(\)\{.*?\n\}\nfunction renderMonth", mobility_guide + "function renderMonth", "mobility reminder guide", flags=re.S)
s = replace_once(
    s,
    'function openCheckin(){resetHistorical();$("checkinSheet").classList.remove("hidden");requiredFields();bindInfo($("checkinSheet"))}',
    'function openCheckin(){resetHistorical();enhanceCheckinTapControls();syncCheckinTapControls();$("checkinSheet").classList.remove("hidden");requiredFields();bindInfo($("checkinSheet"))}',
    "enhance check-in on open",
)
s = replace_once(s, '$("evaluateBtn").onclick=evaluate;$("saveBtn").onclick=saveCheckin;', '$("evaluateBtn").onclick=saveCheckin;$("saveBtn").onclick=saveCheckin;', "one-tap check-in handler")
s = replace_once(
    s,
    '$("completionBanner").classList.remove("hidden");setTimeout(()=>$("completionBanner").classList.add("hidden"),1600);renderAll()',
    '$("completionBanner").classList.remove("hidden");setTimeout(()=>$("completionBanner").classList.add("hidden"),1600);renderAll();switchTab("today")',
    "session returns to Today",
)
s = replace_once(
    s,
    'localStorage.setItem(nutritionLogKey(),JSON.stringify(log));setTask("nutrition",true);renderNutrition();renderToday()',
    'localStorage.setItem(nutritionLogKey(),JSON.stringify(log));setTask("nutrition",nutritionDayComplete(log,meals));renderNutrition();renderToday();switchTab("today")',
    "nutrition returns to Today",
)
write(p, s)


# styles.css — standalone shell, state-machine card, tap controls, text-only reminders.
p = "styles.css"
s = read(p)
if "/* Intent-driven Today:" in s:
    raise SystemExit("guided-flow CSS already present")
css = r'''

/* iPhone standalone PWA shell: topbar/tabbar already consume the safe-area variables. */
html,body{overscroll-behavior-y:contain}
body{min-height:100dvh}

/* Intent-driven Today: one current action; tabs remain available as escape hatches. */
#today.guided-flow #readinessCard,
#today.guided-flow #adaptationBanner,
#today.guided-flow #todayPlanHeader,
#today.guided-flow .plan-list,
#today.guided-flow #todayProgressCard{display:none!important}
.daily-directive{background:#fff;border:1px solid #d9e4ed;border-radius:24px;padding:20px 18px 18px;color:var(--ink);box-shadow:0 14px 38px rgba(28,48,66,.10);min-height:430px;display:flex;flex-direction:column;gap:12px}
.directive-top,.directive-status-row{display:flex;justify-content:space-between;align-items:center;gap:12px}.directive-top span{font-size:9px;font-weight:760;letter-spacing:.09em;color:#718493}.directive-top span:first-child{color:#147be8}.directive-status-row{padding-top:2px}.directive-state{display:inline-flex;align-items:center;min-height:30px;border-radius:999px;padding:7px 10px;font-size:9px;font-weight:800;letter-spacing:.05em;background:#eaf2f8;color:#5f7486}.directive-state.green{background:#edf9f1;color:#21864b}.directive-state.yellow{background:#fff6e5;color:#9b6915}.directive-state.red{background:#fff0f0;color:#a33b3b}.directive-state.complete{background:#eaf7ef;color:#1d8248}.directive-status-row>span:last-child{font-size:9px;color:#768998;font-weight:600}.daily-directive h2{font-size:28px;line-height:1.08;letter-spacing:-.04em;margin:2px 0 0;color:#14202b}.daily-directive>p{font-size:13px;line-height:1.52;color:#607485;margin:0}.directive-reason{background:#f5f8fb;border:1px solid #e2eaf1;border-radius:14px;padding:12px 13px;font-size:11px;line-height:1.5;color:#536979;display:grid;grid-template-columns:auto 1fr;gap:5px 8px}.directive-reason:empty{display:none}.directive-reason strong{font-size:9px;color:#263947;text-transform:uppercase;letter-spacing:.06em}.directive-workout{background:#0f263a;color:#f7fbff;border-radius:17px;padding:14px}.directive-workout-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.directive-workout-head small{display:block;font-size:8px;color:#61b9ff;font-weight:750;letter-spacing:.06em}.directive-workout-head strong{display:block;font-size:14px;margin-top:3px}.directive-workout-head>span{font-size:10px;color:#b5c8d8}.directive-step-list{display:flex;flex-direction:column;margin-top:10px}.directive-step-list>div{display:grid;grid-template-columns:24px 1fr;gap:8px;padding:8px 0;border-top:1px solid rgba(255,255,255,.07)}.directive-step-list i{font-style:normal;width:22px;height:22px;border-radius:7px;background:rgba(23,148,255,.14);color:#61b9ff;display:grid;place-items:center;font-size:9px}.directive-step-list span{display:flex;flex-direction:column;gap:2px}.directive-step-list strong{font-size:10px}.directive-step-list small{font-size:9px;color:#91a8bb}.directive-mobility-note{font-size:9px!important;color:#9db1c3!important;margin:7px 0 0!important}.directive-macros{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.directive-macros>div{background:#f4f7fa;border:1px solid #e2e9ef;border-radius:12px;padding:9px 7px;text-align:center}.directive-macros span,.directive-macros small{display:block;font-size:8px;color:#788b9a}.directive-macros strong{display:block;font-size:15px;color:#172531;margin:3px 0}.directive-timeline{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:auto}.directive-timeline>div{display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;color:#91a0ac}.directive-timeline>div:before{content:"";position:absolute;top:11px;left:-50%;width:100%;height:2px;background:#e0e8ef}.directive-timeline>div:first-child:before{display:none}.directive-timeline i{position:relative;z-index:1;width:23px;height:23px;border-radius:50%;background:#eef3f7;border:1px solid #d6e0e8;display:grid;place-items:center;font-style:normal;font-size:8px}.directive-timeline span{font-size:8px}.directive-timeline .done i{background:#42cf78;border-color:#42cf78;color:#fff}.directive-timeline .current i{box-shadow:0 0 0 3px rgba(20,123,232,.12);border-color:#147be8}.directive-primary,.directive-secondary{width:100%;min-height:52px;border-radius:14px;font-weight:720;font-size:14px}.directive-primary{border:0;background:#147be8;color:#fff;box-shadow:0 6px 16px rgba(20,123,232,.20)}.directive-secondary{border:1px solid #d6e1e9;background:#f7fafc;color:#385064}.directive-meal-progress strong,.directive-meal-progress span{display:block}.directive-meal-progress strong{font-size:13px}.directive-meal-progress span{font-size:9px;color:#9db2c3;margin-top:3px}.directive-meal-progress>div{height:5px;background:#263e52;border-radius:999px;overflow:hidden;margin-top:10px}.directive-meal-progress i{display:block;height:100%;background:#4ee382;border-radius:999px}

/* Morning check-in: measured fields stay numeric; judgments become large tap targets. */
.checkin-mode-note{font-size:10px;line-height:1.45;color:#9db0c1;margin:0 2px 12px}.field:has(.tap-scale){grid-column:1/-1}.field select.tap-source{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;padding:0!important;border:0!important}.tap-scale{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:3px}.tap-scale.scrolling{display:flex;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:3px;scrollbar-width:none}.tap-scale.scrolling::-webkit-scrollbar{display:none}.tap-scale button{min-width:52px;min-height:46px;border:1px solid #284761;background:#112b41;color:#a9bfd1;border-radius:11px;padding:7px 5px;font-size:9px}.tap-scale button strong{font-size:9px;line-height:1.15}.tap-scale button.selected{background:#147be8;border-color:#147be8;color:#fff;box-shadow:0 0 0 2px rgba(23,148,255,.16)}.checkin-section .field input:not([readonly]){font-size:21px;min-height:36px}

/* Images are reserved for trustworthy technique references. */
.exercise-reminder{border:1px solid rgba(255,255,255,.06);background:#0d2032;border-radius:16px;padding:12px;display:grid;grid-template-columns:32px 1fr;gap:11px;align-items:start;color:#f7fbff}.exercise-index{width:30px;height:30px;border-radius:10px;background:rgba(23,148,255,.13);color:#61b9ff;display:grid;place-items:center;font-size:11px;font-weight:750}.exercise-reminder>div:last-child{display:flex;flex-direction:column;gap:4px}.exercise-reminder strong{font-size:13px}.exercise-reminder span{font-size:11px;color:#a7bdd1}.exercise-reminder small{font-size:9px;line-height:1.45;color:#839caf}.mobility-reminder-callout{background:#10273a;border-radius:14px;padding:14px;color:#f7fbff}.mobility-reminder-callout strong{font-size:13px}.mobility-reminder-callout p{font-size:10px;line-height:1.5;color:#9fb3c5;margin:5px 0 0}
@media(max-width:370px){.directive-macros{grid-template-columns:repeat(2,1fr)}.tap-scale{grid-template-columns:repeat(3,1fr)}}
'''
s += css
write(p, s)


# service worker — force the installed PWA shell to pick up this release.
p = "service-worker.js"
s = read(p)
s = replace_once(s, "const CACHE='land-prep-v64';", "const CACHE='land-prep-v65';", "service worker cache bump")
write(p, s)


# Permanent Consumer Audit — actual iPhone 16 viewport and guided-flow expectations.
p = ".github/workflows/ui-audit.yml"
s = read(p)
s = replace_once(s, "const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });", "const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });", "iPhone 16 audit viewport")
s = replace_once(s, "const inViewport = async sel => { const box=await page.locator(sel).boundingBox().catch(()=>null); return !!box && box.y < 844 && box.y+box.height > 0 && box.x < 390 && box.x+box.width > 0; };", "const inViewport = async sel => { const box=await page.locator(sel).boundingBox().catch(()=>null); return !!box && box.y < 852 && box.y+box.height > 0 && box.x < 393 && box.x+box.width > 0; };", "viewport bounds")

# Hidden native selects are still the source of truth, so legacy browser fixtures force-select them.
s = s.replace(".selectOption(v); else await el.fill(v);", ".selectOption(v,{force:true}); else await el.fill(v);")
for fid in ("sleepQ", "fatigue", "load", "pain", "performance"):
    pattern = rf"(page\.locator\('#{fid}'\)\.selectOption\(([^\n;]+?)\))(;)"
    s = re.sub(pattern, lambda m: m.group(1)[:-1] + ",{force:true})" + m.group(3), s)

# Evaluate is now the save/advance action; remove legacy second-submit clicks.
s = s.replace("          await page.locator('#saveBtn').click();\n", "")
s = replace_once(s, "          check('Evaluate reveals adaptive results', await visible('#results'));\n", "          check('One-tap check-in saves baseline', await page.evaluate(()=>logs().length===1));\n", "baseline submit assertion")

old = '''          check('Started Journey reveals command center', await visible('#readinessCard') && await visible('#todayPlanHeader'));
          check('Readiness uses categorical state', ['ON PLAN','ADJUST','RECOVERY'].includes((await page.locator('#readinessState').innerText()).trim()));
          check('Readiness omits pseudo-physiological percentage', await page.locator('#readinessScore').count()===0 && !(await page.locator('#readinessCard').innerText()).includes('/100'));
          await shot('02-started-today');
          const taskTargets=await page.locator('.task-toggle:visible,.task-main:visible').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height}}));
          check('Started Today actually audits task touch targets',taskTargets.length>=6&&taskTargets.every(r=>r.w>=40&&r.h>=40));


          // Readiness is actually interactive.
          await page.locator('#readinessCard').click();'''
new = '''          check('Started Journey reveals one directive card', await visible('#dailyDirective') && !(await visible('#todayPlanHeader')) && !(await visible('.plan-list')));
          check('Directive uses categorical state', ['ON PLAN','ADJUST','RECOVERY'].includes((await page.locator('#directiveState').innerText()).trim()));
          check('Directive omits pseudo-physiological percentage', !(await page.locator('#dailyDirective').innerText()).includes('/100'));
          check('Directive contains the generated session and macro target',(await page.locator('#directiveWorkout').innerText()).length>20&&(await page.locator('#directiveMacros').innerText()).includes('Protein'));
          await shot('02-started-today');
          const directiveTargets=await page.locator('#directivePrimary:visible,#directiveSecondary:visible').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height}}));
          check('Directive actions are finger-friendly',directiveTargets.length>=1&&directiveTargets.every(r=>r.w>=40&&r.h>=44));

          // Directive explanation is actually interactive.
          await page.locator('#directiveSecondary').click();'''
s = replace_once(s, old, new, "started directive audit")
s = replace_once(
    s,
    "          const savedReadinessLabel=(await page.locator('#readinessLabel').innerText()).trim();\n          const savedWorkoutTitle=(await page.locator('#taskWorkoutTitle').innerText()).trim();\n          await page.locator('.task-main[data-action=\"checkin\"]').click();",
    "          const savedReadinessLabel=(await page.locator('#directiveState').innerText()).trim();\n          const savedWorkoutTitle=(await page.locator('#directiveTitle').innerText()).trim();\n          await page.evaluate(()=>openCheckin());",
    "immutable directive setup",
)
s = replace_once(
    s,
    "          check('Unsaved check-in edits do not change saved readiness',(await page.locator('#readinessLabel').innerText()).trim()===savedReadinessLabel);\n          check('Unsaved check-in edits do not change saved prescription',(await page.locator('#taskWorkoutTitle').innerText()).trim()===savedWorkoutTitle);",
    "          check('Unsaved check-in edits do not change saved readiness',(await page.locator('#directiveState').innerText()).trim()===savedReadinessLabel);\n          check('Unsaved check-in edits do not change saved prescription',(await page.locator('#directiveTitle').innerText()).trim()===savedWorkoutTitle);",
    "immutable directive assertions",
)
s = s.replace("          await page.locator('.task-main[data-action=\"checkin\"]').click();", "          await page.evaluate(()=>openCheckin());")
s = replace_once(s, "          check('Saved yellow state surfaces adaptation explanation',await visible('#adaptationBanner'));", "          check('Saved yellow state surfaces adaptation explanation',(await page.locator('#directiveReason').innerText()).length>8&&(await page.locator('#directiveState').innerText()).trim()==='ADJUST');", "yellow directive explanation")
s = replace_once(s, "          check('Under-fueling is explained on Today',(await page.locator('#adaptationBanner').innerText()).toLowerCase().includes('fuel'));", "          check('Under-fueling is explained on Today',(await page.locator('#directiveReason').innerText()).toLowerCase().includes('fuel'));", "fueling directive explanation")
s = replace_once(s, "          check('Today explains prior-session pain',(await page.locator('#adaptationBanner').innerText()).includes('Yesterday'));", "          check('Today explains prior-session pain',(await page.locator('#directiveReason').innerText()).includes('Yesterday'));", "prior pain directive explanation")

flow_block = '''          // Today state machine: one next action at a time, tabs remain escape hatches.
          await page.locator('[data-target="today"]').click();
          check('Legacy Today checklist is hidden in guided mode',!(await visible('#todayPlanHeader'))&&!(await visible('.plan-list')));
          check('After a recorded session the directive advances to nutrition',(await page.locator('#directiveStage').innerText()).includes('FUEL'));
          check('Nutrition directive is the single primary action',(await page.locator('#directivePrimary').innerText()).includes('meals'));
          await page.locator('#directivePrimary').click();
          check('Directive advances athlete to Nutrition',await visible('#nutrition'));
          check('Directive navigation does not fabricate saved intake',await page.evaluate(()=>!getNutritionLog().saved));
          await page.locator('[data-target="today"]').click();
          await page.evaluate(()=>{const n=getNutritionLog(),meals=todayMealPlan();n.saved=true;n.savedAt=new Date().toISOString();n.intakeSource='prescribed-meals';n.meals=meals.map(m=>m.id);n.actualCalories=todayNutritionPrescription().cal;localStorage.setItem(nutritionLogKey(),JSON.stringify(n));renderAll();switchTab('today')});
          check('Saved complete nutrition advances Today to evening summary',(await page.locator('#directiveStage').innerText()).includes('EVENING')&&(await page.locator('#directiveState').innerText()).includes('DAY COMPLETE'));
          check('Evening summary has no compulsory next-action button',!(await visible('#directivePrimary')));
          check('Directive retains Journey context',(await page.locator('#directiveJourney').innerText()).includes('Week'));
          await page.locator('[data-target="program"]').click();
          check('Escape-hatch navigation still opens Program',await visible('#program'));
          await page.locator('[data-target="today"]').click();

'''
s = sub_once(s, r"          // Today split interactions\..*?          // Header calendar icon is a real navigation control\.\n", flow_block + "          // Header calendar icon is a real navigation control.\n", "replace split Today audit", flags=re.S)
s = replace_once(
    s,
    "          check('Today shows current Journey position',(await page.locator('#todayJourneyWeek').innerText()).includes('of 56'));\n          check('Today surfaces next qualification',(await page.locator('#todayJourneyNext').innerText()).length>8);\n          await page.locator('#todayProgressCard').click();\n          check('Journey progress card opens Program',await visible('#program'));\n          await page.locator('[data-target=\"today\"]').click();\n\n",
    "",
    "remove hidden legacy journey audit",
)
s = replace_once(s, "          check('Today distinguishes held prescription from calendar time',(await page.locator('#todayJourneyWeek').innerText()).includes('Held at Week'));", "          check('Today distinguishes held prescription from calendar time',(await page.locator('#directiveJourney').innerText()).includes('Held Week'));", "held directive journey")
s = replace_once(s, "          const criticalSelectors=['#headerAction','.task-toggle','.task-main','.tab'];", "          const criticalSelectors=['#headerAction','#directivePrimary','#directiveSecondary','.tab'];", "critical directive touch selectors")
s = replace_once(s, "          check('Library contains no scheduler-only labels',!libraryNames.some(n=>/main session|main run|quality work|warm-up|cool-down|long session|threshold work/i.test(n)),JSON.stringify(libraryNames));", "          check('Library contains no scheduler-only labels',!libraryNames.some(n=>/main session|main run|quality work|warm-up|cool-down|long session|threshold work|mobility|stretch/i.test(n)),JSON.stringify(libraryNames));", "library excludes mobility labels")
s = replace_once(s, "          const sessionCount=await page.locator('.exercise-card').count(); report.counts.sessionExercises=sessionCount;", "          check('Mobility and ambiguous steps never receive fake technique images',await page.locator('.exercise-reminder img').count()===0);\n          const sessionCount=await page.locator('.exercise-card').count(); report.counts.sessionExercises=sessionCount;", "session reminder audit")
write(p, s)


# Focused source-level regression.
test = Path("tests/daily-directive-flow.test.cjs")
test.write_text(r'''const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const audit=fs.readFileSync('.github/workflows/ui-audit.yml','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');

test('Today is an intent-driven single-card state machine',()=>{
  assert.match(html,/id="dailyDirective"/);
  assert.match(app,/function todayFlowState\(\)/);
  for(const state of ['morning','directive','nutrition','evening']) assert.match(app,new RegExp('"'+state+'"'));
  assert.match(css,/#today\.guided-flow #readinessCard[\s\S]*#today\.guided-flow \.plan-list/);
  assert.match(app,/switchTab\("today"\)/);
});

test('daily subjective check-in uses tap choices while measured inputs remain numeric',()=>{
  assert.match(app,/const TAP_CHECKIN_FIELDS=/);
  for(const id of ['sleepQ','fatigue','load','pain','performance']) assert.match(app,new RegExp(id+':'));
  assert.match(css,/\.tap-scale button\{[^}]*min-height:46px/);
  assert.match(html,/Generate Today’s Directive/);
});

test('mobility is a reminder and ambiguous movement labels do not get forced imagery',()=>{
  assert.doesNotMatch(app,/\[\/ankle mobility\|ankle circles\//);
  assert.doesNotMatch(app,/\[\/hip mobility\|mobility\|stretch\//);
  assert.match(app,/Technique imagery is opt-in/);
  assert.match(app,/Mobility reminder/);
  assert.match(app,/exercise-reminder/);
  assert.doesNotMatch(app,/"Ankle_Circles":\{name:"Ankle Mobility"/);
});

test('nutrition does not advance to evening until intake is explicitly complete',()=>{
  assert.match(app,/function nutritionDayComplete\(/);
  assert.match(app,/log\.intakeSource==="manual-deviation"/);
  assert.match(app,/meals\.every\(m=>checked\.has\(m\.id\)\)/);
});

test('iPhone 16 standalone shell consumes safe areas and contains overscroll',()=>{
  assert.match(html,/viewport-fit=cover/);
  assert.match(css,/env\(safe-area-inset-top\)/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/overscroll-behavior-y:contain/);
  assert.match(audit,/width: 393, height: 852/);
  assert.match(audit,/deviceScaleFactor: 3/);
  assert.match(sw,/land-prep-v65/);
});
''')
