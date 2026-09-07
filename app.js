
const $=id=>document.getElementById(id);
const num=id=>{const v=parseFloat($(id)?.value);return Number.isFinite(v)?v:null};
const val=id=>$(id)?.value||"";
const DAY=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const blocks=[
 ["Re-entry I",1,2,"No running yet · rowing dominant","No weighted-pack walking yet","Rebuild routine and aerobic fitness without impact while lower-leg tissues begin reconditioning."],
 ["Re-entry II",3,4,"1 short run/walk session each week","No weighted-pack walking yet","Introduce small doses of impact while rowing remains the main aerobic modality."],
 ["Foundation I",5,8,"2 runs each week · about 3–6 miles","2–4 miles easy with a light pack","Build continuous running tolerance and introduce loaded walking."],
 ["Foundation II",9,12,"2–3 runs each week · about 6–10 miles","3–5 miles easy","Build the aerobic base, bodyweight strength and loaded-carry durability."],
 ["Build I",13,16,"3 runs each week · about 10–16 miles","4–6 miles","Introduce controlled faster running while increasing loaded walking."],
 ["Build II",17,20,"3 runs each week · about 14–20 miles","5–8 miles","Grow the long run and weighted-pack walking while maintaining strength."],
 ["Build III",21,24,"3 runs each week · about 16–22 miles","6–10 miles","Consolidate the build and test aerobic/bodyweight progress."],
 ["Specificity I",25,28,"3–4 runs each week · about 20–26 miles","8–10 miles","Improve running economy, weighted-pack walking technique and carries."],
 ["Specificity II",29,32,"3–4 runs each week · about 22–30 miles","8–12 miles","Combine faster running with long aerobic work and loaded movement."],
 ["Specificity III",33,36,"4 runs each week · about 26–34 miles","10–14 miles","Build consecutive-day durability while maintaining strength."],
 ["Specificity IV",37,40,"3–4 runs each week · about 24–32 miles","10–14 miles","Absorb accumulated work and test durability."],
 ["Work Capacity I",41,44,"4 runs each week · about 28–38 miles","12–16 miles","Build large accumulated workload and time on feet."],
 ["Work Capacity II",45,48,"4–5 runs each week · about 34–45 miles","14–20 miles","Peak specificity and consecutive-day work."],
 ["Peak / Consolidate",49,52,"About 38–50 miles only if earned","16–24 miles only if earned","Assess peak work capacity without forcing arbitrary mileage."],
 ["Taper",53,56,"Reduce volume progressively","Reduce, then eliminate","Dissipate fatigue while retaining selected intensity."]
];
const weeklyTargets=[{"week":1,"weekType":"ENTRY","runCeiling":0,"run":"~0 mi/wk ceiling","row":"2–3 × 40–60 min","ruck":""},{"week":2,"weekType":"BUILD","runCeiling":1,"run":"~1 mi/wk ceiling","row":"2–3 × 40–60 min","ruck":""},{"week":3,"weekType":"BUILD","runCeiling":2,"run":"~2 mi/wk ceiling","row":"2–3 × 40–60 min","ruck":""},{"week":4,"weekType":"CONSOLIDATE","runCeiling":1,"run":"~1 mi/wk ceiling","row":"2–3 × 40–60 min","ruck":""},{"week":5,"weekType":"ENTRY","runCeiling":4,"run":"~4 mi/wk ceiling","row":"2 × 45–75 min","ruck":"~2 mi easy ruck"},{"week":6,"weekType":"BUILD","runCeiling":5,"run":"~5 mi/wk ceiling","row":"2 × 45–75 min","ruck":"~3 mi easy ruck"},{"week":7,"weekType":"BUILD","runCeiling":5,"run":"~5 mi/wk ceiling","row":"2 × 45–75 min","ruck":"~4 mi easy ruck"},{"week":8,"weekType":"CONSOLIDATE","runCeiling":5,"run":"~5 mi/wk ceiling","row":"2 × 45–75 min","ruck":"~3 mi easy ruck"},{"week":9,"weekType":"ENTRY","runCeiling":7,"run":"~7 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~4 mi easy ruck"},{"week":10,"weekType":"BUILD","runCeiling":8,"run":"~8 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~4 mi easy ruck"},{"week":11,"weekType":"BUILD","runCeiling":9,"run":"~9 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~5 mi easy ruck"},{"week":12,"weekType":"CONSOLIDATE","runCeiling":9,"run":"~9 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~4 mi easy ruck"},{"week":13,"weekType":"ENTRY","runCeiling":12,"run":"~12 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~4 mi easy ruck"},{"week":14,"weekType":"BUILD","runCeiling":13,"run":"~13 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~5 mi easy ruck"},{"week":15,"weekType":"BUILD","runCeiling":15,"run":"~15 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~6 mi easy ruck"},{"week":16,"weekType":"CONSOLIDATE","runCeiling":14,"run":"~14 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~5 mi easy ruck"},{"week":17,"weekType":"ENTRY","runCeiling":16,"run":"~16 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~6 mi easy ruck"},{"week":18,"weekType":"BUILD","runCeiling":17,"run":"~17 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~7 mi easy ruck"},{"week":19,"weekType":"BUILD","runCeiling":19,"run":"~19 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~7 mi easy ruck"},{"week":20,"weekType":"CONSOLIDATE","runCeiling":18,"run":"~18 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~7 mi easy ruck"},{"week":21,"weekType":"ENTRY","runCeiling":18,"run":"~18 mi/wk ceiling","row":"1–2 × 45–60 min","ruck":"~7 mi easy ruck"},{"week":22,"weekType":"BUILD","runCeiling":19,"run":"~19 mi/wk ceiling","row":"1–2 × 45–60 min","ruck":"~8 mi easy ruck"},{"week":23,"weekType":"BUILD","runCeiling":21,"run":"~21 mi/wk ceiling","row":"1–2 × 45–60 min","ruck":"~9 mi easy ruck"},{"week":24,"weekType":"CONSOLIDATE","runCeiling":20,"run":"~20 mi/wk ceiling","row":"1–2 × 45–60 min","ruck":"~9 mi easy ruck"},{"week":25,"weekType":"ENTRY","runCeiling":22,"run":"~22 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~8 mi easy ruck"},{"week":26,"weekType":"BUILD","runCeiling":23,"run":"~23 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~9 mi easy ruck"},{"week":27,"weekType":"BUILD","runCeiling":25,"run":"~25 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~10 mi easy ruck"},{"week":28,"weekType":"CONSOLIDATE","runCeiling":24,"run":"~24 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~9 mi easy ruck"},{"week":29,"weekType":"ENTRY","runCeiling":24,"run":"~24 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~9 mi easy ruck"},{"week":30,"weekType":"BUILD","runCeiling":26,"run":"~26 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~10 mi easy ruck"},{"week":31,"weekType":"BUILD","runCeiling":28,"run":"~28 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~11 mi easy ruck"},{"week":32,"weekType":"CONSOLIDATE","runCeiling":27,"run":"~27 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~11 mi easy ruck"},{"week":33,"weekType":"ENTRY","runCeiling":28,"run":"~28 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~11 mi easy ruck"},{"week":34,"weekType":"BUILD","runCeiling":30,"run":"~30 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~12 mi easy ruck"},{"week":35,"weekType":"BUILD","runCeiling":32,"run":"~32 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~13 mi easy ruck"},{"week":36,"weekType":"CONSOLIDATE","runCeiling":31,"run":"~31 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~13 mi easy ruck"},{"week":37,"weekType":"ENTRY","runCeiling":26,"run":"~26 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~11 mi easy ruck"},{"week":38,"weekType":"BUILD","runCeiling":28,"run":"~28 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~12 mi easy ruck"},{"week":39,"weekType":"BUILD","runCeiling":30,"run":"~30 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~13 mi easy ruck"},{"week":40,"weekType":"CONSOLIDATE","runCeiling":29,"run":"~29 mi/wk ceiling","row":"1–2 × 45–75 min","ruck":"~13 mi easy ruck"},{"week":41,"weekType":"ENTRY","runCeiling":30,"run":"~30 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~13 mi easy ruck"},{"week":42,"weekType":"BUILD","runCeiling":34,"run":"~34 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~14 mi easy ruck"},{"week":43,"weekType":"BUILD","runCeiling":36,"run":"~36 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~15 mi easy ruck"},{"week":44,"weekType":"CONSOLIDATE","runCeiling":34,"run":"~34 mi/wk ceiling","row":"1 × 45–60 min","ruck":"~15 mi easy ruck"},{"week":45,"weekType":"ENTRY","runCeiling":37,"run":"~37 mi/wk ceiling","row":"1 × 30–60 min","ruck":"~16 mi easy ruck"},{"week":46,"weekType":"BUILD","runCeiling":40,"run":"~40 mi/wk ceiling","row":"1 × 30–60 min","ruck":"~17 mi easy ruck"},{"week":47,"weekType":"BUILD","runCeiling":43,"run":"~43 mi/wk ceiling","row":"1 × 30–60 min","ruck":"~19 mi easy ruck"},{"week":48,"weekType":"CONSOLIDATE","runCeiling":41,"run":"~41 mi/wk ceiling","row":"1 × 30–60 min","ruck":"~18 mi easy ruck"},{"week":49,"weekType":"ENTRY","runCeiling":41,"run":"~41 mi/wk ceiling","row":"Strategic recovery","ruck":"~18 mi easy ruck"},{"week":50,"weekType":"BUILD","runCeiling":45,"run":"~45 mi/wk ceiling","row":"Strategic recovery","ruck":"~20 mi easy ruck"},{"week":51,"weekType":"BUILD","runCeiling":48,"run":"~48 mi/wk ceiling","row":"Strategic recovery","ruck":"~22 mi easy ruck"},{"week":52,"weekType":"CONSOLIDATE","runCeiling":46,"run":"~46 mi/wk ceiling","row":"Strategic recovery","ruck":"~21 mi easy ruck"},{"week":53,"weekType":"TAPER","runCeiling":35,"run":"30–35 mi or ~70% of recent normal","row":"Short easy C2","ruck":"8–10 mi easy"},{"week":54,"weekType":"TAPER","runCeiling":25,"run":"20–25 mi or ~50%","row":"Short easy C2","ruck":"4–6 mi easy"},{"week":55,"weekType":"TAPER","runCeiling":15,"run":"10–15 mi or ~25–30%","row":"Short easy C2","ruck":""},{"week":56,"weekType":"TAPER","runCeiling":null,"run":"Minimal easy work","row":"Short easy C2","ruck":""}];
function weekTarget(w){return weeklyTargets[Math.max(1,Math.min(56,Number(w)||1))-1]}
function weeklyRunDose(w){const t=weekTarget(w);return t.runCeiling===0?"No running planned this week":"Week "+w+" · "+t.run}
function weeklyEnduranceDose(w){const t=weekTarget(w);return "Week "+w+" · "+t.run+(t.ruck?" · "+t.ruck:"")}
function qualityRunDose(w){const t=weekTarget(w);return "1 controlled quality session this week · "+t.run}
const templates={
 "Re-entry I":["Recovery & mobility","Full-body strength — Session A","Easy aerobic row","Full-body strength — Session B","Easy aerobic row","Long easy row + lower-leg durability","Easy row + trunk work"],
 "Re-entry II":["Recovery & mobility","Full-body strength — Session A","Easy aerobic row","Full-body strength — Session B","Easy aerobic row","Introductory run/walk","Easy row + trunk work"],
 "Foundation I":["Recovery & mobility","Full-body strength + bodyweight training","Easy aerobic row","Easy run + lower-leg durability","Full-body strength — Session B","Long easy run or light weighted-pack walk","Easy recovery row"],
 "Foundation II":["Recovery & mobility","Full-body strength + bodyweight training","Easy aerobic row","Easy run + lower-leg durability","Full-body strength — Session B","Long easy run or light weighted-pack walk","Easy recovery row"],
 "Build I":["Recovery & mobility","Quality run + strength","Easy run","Rowing threshold work","Strength + bodyweight training","Long run or weighted-pack walk","Easy recovery row"],
 "Build II":["Recovery & mobility","Quality run + strength","Easy run","Easy aerobic row","Strength + bodyweight training","Long run or weighted-pack walk","Easy recovery row"],
 "Build III":["Recovery & mobility","Quality run","Easy run + strength","Easy aerobic row","Strength + bodyweight training","Long run or weighted-pack walk","Easy recovery row"],
 "Specificity I":["Recovery & mobility","Quality run + bodyweight training","Easy run","Strength + easy row","Easy run + loaded carries","Long weighted-pack walk or run","Recovery aerobic work"],
 "Specificity II":["Recovery & mobility","Quality run + bodyweight training","Easy run","Strength + easy row","Easy run + loaded carries","Long weighted-pack walk or run","Recovery aerobic work"],
 "Specificity III":["Recovery & mobility","Quality run","Easy run","Strength + loaded carries","Easy run","Long weighted-pack walk or run","Recovery aerobic work"],
 "Specificity IV":["Recovery & mobility","Quality run","Easy run","Strength + easy row","Easy run","Long weighted-pack walk or run","Recovery aerobic work"],
 "Work Capacity I":["Recovery & mobility","Quality run","Medium aerobic run","Strength + loaded carries","Easy run","Long weighted-pack walk or run","Easy aerobic work while fatigued"],
 "Work Capacity II":["Recovery & mobility","Quality run","Medium aerobic run","Strength + loaded carries","Easy run","Long weighted-pack walk or run","Easy aerobic work while fatigued"],
 "Peak / Consolidate":["Recovery & mobility","Specific hard session","Medium aerobic run","Carries + strength maintenance","Easy run","Peak specific session","Recovery aerobic work"],
 "Taper":["Recovery & mobility","Short quality session","Easy aerobic work","Light strength","Easy aerobic work","Short specific session","Recovery"]
};
const ex=(name,dose,rest,cue,type)=>({name,dose,rest,cue,type:type||"Strength"});
const A=[ex("Back squat","3 × 5","2–3 min","Keep the whole foot planted and finish each rep tall."),ex("Romanian deadlift","3 × 6–8","2–3 min","Push the hips back while keeping the spine neutral."),ex("Overhead press","3 × 5","2 min","Brace the trunk and press without leaning backward."),ex("Pull-ups","3–5 submaximal sets","2 min","Stop before form breaks. Use a resistance band if needed.","Bodyweight"),ex("Tibialis raises","3 × 15–25","60–90 sec","Lift the forefoot toward the shin through a controlled range.","Durability"),ex("Calf / soleus raises","3 × 12–20","60–90 sec","Use straight-knee and bent-knee variations across the week.","Durability"),ex("Neck harness","2–3 sets each direction","60 sec","Use light load and smooth motion. Never jerk the neck.","Durability"),ex("Grip work","2–3 sets","60–90 sec","Use hangs, carries or grip tools without max testing.","Durability")];
const B=[ex("Split squat or reverse lunge","3 × 6–8 each leg","2 min","Stay balanced and keep the front foot planted."),ex("Hip hinge","3 × 6–8","2–3 min","Use a deadlift or dumbbell hinge with a neutral spine."),ex("Press + row","3 × 6–10 each","90–120 sec","Pair a horizontal press with a controlled row."),ex("Suitcase carry","3 × 40–100 m each side","As needed","Walk tall without leaning toward the weight.","Carry"),ex("Tibialis + soleus","3 sets each","60–90 sec","Control the full range rather than bouncing.","Durability"),ex("Neck harness","2–3 controlled sets","60 sec","Keep the load modest.","Durability"),ex("Forearm roller","2–3 climbs","60–90 sec","Use smooth wrist flexion and extension.","Durability")];
const definitions={readiness:"A daily signal built from recovery, pain/movement and fueling information. It changes training stress; it is not a medical diagnosis.",HRV:"Heart-rate variability is the beat-to-beat variation in time between heartbeats. The app compares your value with your own history.","resting heart rate":"Your heart rate when rested, ideally measured under similar morning conditions.","grip strength":"A standardized grip measurement used as one small neuromuscular readiness signal.","session effort":"Your overall rating of how hard the session felt: 1 is extremely easy and 10 is maximal.",threshold:"A hard but controlled intensity that can be sustained for meaningful work.","RKC plank":"A high-tension forearm plank: squeeze glutes, quads and abs hard while holding a straight body line."};
function mondayDate(src){const d=new Date(src||Date.now()),i=(d.getDay()+6)%7;d.setHours(12,0,0,0);d.setDate(d.getDate()-i);return d}
function programStart(){return localStorage.programStart?new Date(localStorage.programStart):new Date()}
function currentWeek(){if(!localStorage.programStart)return 1;const start=new Date(localStorage.programStart),now=new Date();start.setHours(12,0,0,0);now.setHours(12,0,0,0);return Math.max(1,Math.min(56,Math.floor((now-start)/604800000)+1))}
let viewedWeek=currentWeek();
function blockForWeek(w){const b=blocks.find(x=>w>=x[1]&&w<=x[2])||blocks[0];return{name:b[0],start:b[1],end:b[2],run:b[3],ruck:b[4],focus:b[5]}}
function daysFor(b){return templates[b.name]||templates["Re-entry I"]}
function dayIndex(){if(!localStorage.programStart)return 0;const a=new Date(programStart()),b=new Date();a.setHours(12,0,0,0);b.setHours(12,0,0,0);const days=Math.floor((b-a)/86400000);return((days%7)+7)%7}
function sessionName(){const w=prescriptionWeek(),b=blockForWeek(w);return daysFor(b)[dayIndex()]}
function makeSession(name,w=prescriptionWeek()){
 const wt=weekTarget(w),runDose=weeklyRunDose(w),enduranceDose=weeklyEnduranceDose(w);
 const row=mins=>[ex("Warm-up",mins,"—","Start easy and build gradually.","Warm-up")];
 if(name==="Full-body strength — Session A")return{title:name,type:"Full Body",duration:"55–75 min",effort:"Moderate",why:"Build fundamental strength for running, loaded walking, posture and injury resistance.",steps:A};
 if(name==="Full-body strength — Session B")return{title:name,type:"Full Body",duration:"55–75 min",effort:"Moderate",why:"Build unilateral leg strength, trunk stability and loaded-carry durability.",steps:B};
 if(name.includes("Quality run + bodyweight"))return{title:name,type:"Run + Bodyweight",duration:"60–85 min",effort:"Hard / controlled",why:"Develop faster running while maintaining strict push-up and pull-up capacity.",steps:[ex("Quality run",qualityRunDose(w),"—","Use an established pace/HR/lactate calibration. If none is current, do not guess at intensity; replace the quality segment with easy Concept2 work within this week’s C2 target.","Run"),ex("Push-ups","4–6 submaximal sets","2 min","Strict reps; stop before failure.","Bodyweight"),ex("Pull-ups","4–6 submaximal sets","2 min","Strict or assisted.","Bodyweight"),ex("RKC plank","3 × 20–40 sec","60 sec","Squeeze glutes, quads and abs hard.","Core")]}; if(name.includes("Easy run + loaded carries"))return{title:name,type:"Run + Carry",duration:"60–90 min",effort:"Moderate",why:"Combine running durability with posture and awkward-load capacity.",steps:[ex("Easy run",runDose,"Continuous","Conversational pace.","Run"),ex("Bear-hug sandbag carry","3–5 rounds","As needed","Use a manageable load.","Carry"),ex("Suitcase carry","3 rounds each side","As needed","Stay tall without leaning.","Carry")]}; if(name.includes("bodyweight training"))return{title:name,type:"Full Body",duration:"60–80 min",effort:"Moderate",why:"Maintain strength while improving strict push-up and pull-up capacity.",steps:[...A.slice(0,4),ex("Push-ups","4–6 submaximal sets","2 min","Leave 2–4 clean reps in reserve.","Bodyweight"),ex("RKC plank","3 × 20–40 sec","60 sec","Squeeze glutes, quads and abs hard; keep a straight line.","Core")]};
 if(name.includes("Strength + loaded carries")||name.includes("Carries + strength"))return{title:name,type:"Strength + Carry",duration:"60–85 min",effort:"Moderate",why:"Maintain force production and train posture under external load.",steps:[...B.slice(0,3),ex("Sandbag bear-hug carry","3–5 rounds","As needed","Walk under control.","Carry"),ex("Suitcase carry","3 rounds each side","As needed","Stay tall without leaning.","Carry")]};
 if(name.includes("Strength + easy row"))return{title:name,type:"Strength + Aerobic",duration:"70–100 min",effort:"Moderate",why:"Maintain strength and add low-impact aerobic volume.",steps:[...B.slice(0,4),ex("Easy row","30–45 min","Continuous","Keep a conversational effort.","Row")]};
 if(name.includes("strength")&&name.includes("run"))return{title:name,type:"Run + Strength",duration:"70–100 min",effort:"Moderate / hard",why:"Develop running while preserving strength.",steps:[...row("15 min"),ex("Controlled quality run","20–30 min total","Variable","Hard but controlled; never all-out. If no current quality calibration exists, use easy Concept2 work within this week’s C2 target instead of inventing an interval pace.","Run"),...A.slice(0,3)]};
 if(name.includes("Easy aerobic row"))return{title:name,type:"Aerobic",duration:"50–90 min",effort:"Easy",why:"Build the aerobic engine with minimal impact.",steps:[ex("Warm-up row","5–10 min","—","Very easy rowing.","Row"),ex("Main aerobic row","40–75 min","Continuous","Conversational effort.","Row"),ex("Cool-down row","5 min","—","Very easy.","Row")]};
 if(name.includes("recovery row")||name.includes("Recovery aerobic"))return{title:name,type:"Recovery",duration:"25–60 min",effort:"Very easy",why:"Support recovery while preserving aerobic rhythm.",steps:[ex("Easy row or walk","25–60 min","Continuous","Finish feeling better than you started.","Aerobic")]};
 if(name.includes("row")&&name.includes("trunk"))return{title:name,type:"Aerobic + Core",duration:"45–70 min",effort:"Easy",why:"Build aerobic capacity and trunk stiffness.",steps:[ex("Easy row","30–60 min","Continuous","Conversational effort.","Row"),ex("RKC plank","3 × 20–40 sec","60 sec","Squeeze glutes, quads and abs hard.","Core"),ex("Suitcase carry","3 rounds each side","As needed","Stay tall and breathe under control.","Carry")]};
 if(name.includes("Rowing threshold"))return{title:name,type:"Aerobic",duration:"35–60 min",effort:"Moderate / hard",why:"Develop higher aerobic power with low mechanical cost.",steps:[ex("Warm-up row","10 min","—","Easy.","Row"),ex("Controlled threshold work","20–40 min total","Variable","Use an established threshold calibration. If none is current, keep the row conversational and stay within this week’s C2 target instead of guessing at threshold.","Row"),ex("Cool-down row","5–10 min","—","Easy.","Row")]};
 if(name.includes("Long easy row + lower-leg durability"))return{title:name,type:"Aerobic + Durability",duration:"65–90 min",effort:"Easy",why:"Extend low-impact aerobic work while building lower-leg capacity before running begins.",steps:[ex("Easy row","50–70 min","Continuous","Conversational effort throughout.","Row"),ex("Tibialis raises","3 × 15–25","60 sec","Controlled full range.","Durability"),ex("Calf / soleus raises","3 × 12–20","60 sec","Use straight- and bent-knee work without bouncing.","Durability"),ex("Ankle mobility","5–8 min","—","Controlled, pain-free range.","Mobility")]};
 if(name.includes("Recovery & mobility"))return{title:name,type:"Recovery",duration:"25–45 min",effort:"Very easy",why:"Reduce fatigue while keeping the body moving and joints comfortable.",steps:[ex("Easy walk or row","20–30 min","Continuous","Very easy.","Aerobic"),ex("Ankle mobility","2 × 8–10 each side","—","Move through pain-free range.","Mobility"),ex("Hip mobility","5–10 min","—","Gentle controlled movement.","Mobility"),ex("Light trunk work","2–3 easy sets","60 sec","Plank, side plank or dead bug.","Core")]};
 if(name.includes("Introductory run/walk"))return{title:name,type:"Run",duration:"20–40 min",effort:"Easy",why:"Reintroduce running-specific bone, tendon and foot stress without unnecessary overload.",steps:[ex("Warm-up walk","5–10 min","—","Brisk but comfortable.","Run"),ex("Run / walk","10–25 min total","Alternate as needed","Keep it easy. Stop for focal pain or altered gait.","Run"),ex("Cool-down walk","5 min","—","Easy.","Run")]};
 if(name.includes("lower-leg durability"))return{title:name,type:"Run + Durability",duration:"45–70 min",effort:"Easy",why:"Pair controlled running with targeted shin, calf and ankle strengthening.",steps:[ex("Easy run",runDose,"Continuous","Conversational pace.","Run"),ex("Tibialis raises","3 × 20","60 sec","Control the movement.","Durability"),ex("Seated soleus raises","3 × 15–20","60–90 sec","Use moderate load.","Durability"),ex("Eccentric calf raises","3 × 12–15","60–90 sec","Lower slowly.","Durability")]};
 if(name.includes("Quality run"))return{title:name,type:"Run",duration:"45–75 min",effort:"Hard / controlled",why:"Improve sustainable speed after aerobic and tissue tolerance are established.",steps:[ex("Warm-up","15–20 min","—","Easy jog plus relaxed strides.","Run"),ex("Main quality work",qualityRunDose(w),"Variable","Use an established pace, heart-rate or lactate calibration. If none is current, do not guess at intensity; replace the quality segment with easy Concept2 work within this week’s C2 target.","Run"),ex("Cool-down","10–15 min","—","Easy jog.","Run")]};
 if(name.includes("Medium aerobic run"))return{title:name,type:"Run",duration:"45–75 min",effort:"Easy / moderate",why:"Accumulate meaningful running volume between easy and long sessions.",steps:[ex("Medium run",runDose,"Continuous","Stay below threshold and finish controlled.","Run")]};
 if(name.includes("Easy run"))return{title:name,type:"Run",duration:"Varies",effort:"Easy",why:"Build running-specific aerobic fitness and tissue tolerance.",steps:[ex("Warm-up","5–10 min","—","Walk or jog easily.","Run"),ex("Main run",runDose,"Continuous","Conversational pace; do not chase speed.","Run"),ex("Cool-down","5–10 min","—","Easy jog or walk.","Run")]};
 if(name.includes("Long"))return{title:name,type:"Endurance",duration:"Long",effort:"Easy / moderate",why:"Build time-on-feet and loaded-movement durability.",steps:[ex("Long session",enduranceDose,"Continuous","Increase distance before pack load; keep gait normal.","Endurance")]};
 if(name.includes("Light strength"))return{title:name,type:"Strength",duration:"35–50 min",effort:"Easy",why:"Retain movement quality during taper without creating soreness.",steps:[ex("Squat","2 × 5","2 min","Use about 60–70% of normal training load."),ex("Hinge","2 × 6","2 min","Easy to moderate."),ex("Press","2 × 5","90 sec","Easy."),ex("Pull-ups","2–3 easy sets","90 sec","No failure.","Bodyweight")]};
 return{title:name,type:"Specific",duration:"30–60 min",effort:"Controlled",why:"Complete the current phase-specific session with clean technique and adaptive restraint.",steps:[ex("Main session",enduranceDose,"—","Stop for focal pain, altered gait or red recovery flags.","Specific")]};
}
function logs(){return JSON.parse(localStorage.trainingLogs||"[]")}function workouts(){return JSON.parse(localStorage.workoutHistory||"[]")}
function todayKey(){return new Date().toDateString()}function todayCheckin(){return logs().find(x=>new Date(x.date).toDateString()===todayKey())}function todayWorkoutRecord(){return workouts().find(x=>new Date(x.date).toDateString()===todayKey())}function todayWorkout(){const x=todayWorkoutRecord();return x?.completed==="YES"?x:null}
function weekMetrics(w){
 const out={runMiles:0,ruckMiles:0,rowMinutes:0};
 for(const x of workouts().filter(x=>x.week===w&&x.completed!=="NO")){
   if(Number.isFinite(x.runMiles))out.runMiles+=x.runMiles;
   if(Number.isFinite(x.ruckMiles))out.ruckMiles+=x.ruckMiles;
   if(Number.isFinite(x.rowMinutes))out.rowMinutes+=x.rowMinutes;
 }
 return out
}
function sessionModalities(det){
 const text=((det?.title||"")+" "+(det?.type||"")+" "+(det?.steps||[]).map(e=>(e.name||"")+" "+(e.type||"")+" "+(e.dose||"")+" "+(e.cue||"")).join(" ")).toLowerCase();
 return{run:/\brun|running|jog/.test(text),ruck:/ruck|weighted-pack/.test(text),row:/\brow|rowing|concept2/.test(text)}
}
function renderSessionMetricFields(det){
 const m=sessionModalities(det);
 [["sessionRunMilesField",m.run],["sessionRuckMilesField",m.ruck],["sessionRowMinutesField",m.row],["sessionPackWeightField",m.ruck]].forEach(([id,show])=>$(id)?.classList.toggle("hidden",!show));
}
function actualWorkSummary(work){
 if(!work)return"";const bits=[];
 if(Number.isFinite(work.runMiles))bits.push("Run "+work.runMiles+" mi");
 if(Number.isFinite(work.ruckMiles))bits.push("Ruck "+work.ruckMiles+" mi");
 if(Number.isFinite(work.packWeight))bits.push("Pack "+work.packWeight+" lb");
 if(Number.isFinite(work.rowMinutes))bits.push("Row "+work.rowMinutes+" min");
 return bits.length?'<div class="nutrition-note"><strong>Actual work</strong><p>'+bits.join(" · ")+'</p></div>':""
}
function renderWeekTargetCard(w,det){
 const t=weekTarget(w),m=weekMetrics(w),runLogged=m.runMiles?m.runMiles.toFixed(1)+" mi logged · ":"",ruckLogged=m.ruckMiles?m.ruckMiles.toFixed(1)+" mi logged · ":"",rowLogged=m.rowMinutes?m.rowMinutes.toFixed(0)+" min logged · ":"";
 $("weekTargetCard").innerHTML='<strong>Week '+w+' · '+t.weekType+'</strong><p><b>Running:</b> '+runLogged+t.run+'<br><b>Concept2:</b> '+rowLogged+t.row+'<br><b>Ruck:</b> '+ruckLogged+(t.ruck||"None scheduled")+'</p><small>Weekly ceilings are limits, not quotas. Do not force remaining mileage into today.</small>';
 renderSessionMetricFields(det)
}
function taskDone(k){return localStorage.getItem("task_"+k+"_"+todayKey())==="1"}function setTask(k,v){localStorage.setItem("task_"+k+"_"+todayKey(),v?"1":"0")}
function systemic(){const sl=num("sleep"),q=num("sleepQ"),f=num("fatigue"),h=num("hrv"),hb=num("hrvBase"),r=num("rhr"),rb=num("rhrBase"),g=num("grip"),gb=num("gripBase"),p=val("performance");if([sl,q,f,h,r].every(x=>x===null)&&!p)return"";if((sl!==null&&sl<6)||(q!==null&&q<=2)||(f!==null&&f>=4)||(hb&&h!==null&&h<.85*hb)||(rb&&r!==null&&r>rb+8)||p==="NO")return"RED";if((sl!==null&&sl<7)||q===3||f===3||(hb&&h!==null&&h<.92*hb)||(rb&&r!==null&&r>rb+5)||(gb&&g!==null&&g<.9*gb))return"YELLOW";return"GREEN"}
function mechanical(){const p=num("pain"),prev=typeof previousWorkoutSignal==="function"?previousWorkoutSignal(historicalDate||new Date()):null;if(p===null&&!$("focal").checked&&!$("gait").checked){return prev?.level||""}if($("focal").checked||$("gait").checked||(p!==null&&p>=5)||prev?.level==="RED")return"RED";if((p!==null&&p>=3)||prev?.level==="YELLOW")return"YELLOW";return"GREEN"}
function fueling(){const w=num("weight"),a=num("weightAvg"),l=num("load"),prev=typeof previousNutritionSignal==="function"?previousNutritionSignal(historicalDate||new Date()):null;if(w===null||a===null||l===null){if(prev&&prev.ratio<.7)return"YELLOW";return""}if((w<a*.985&&l>=7)||(prev&&prev.ratio<.65&&l>=6))return"RED";if((w<a*.99&&l>=5)||(prev&&prev.ratio<.8&&l>=4))return"YELLOW";return"GREEN"}
function decision(){const a=systemic(),b=mechanical(),c=fueling(),o=!a&&!b&&!c?"":(a==="RED"||b==="RED"?"RED":(a==="YELLOW"||b==="YELLOW"||c==="RED"?"YELLOW":"GREEN"));let score=92;if(a==="YELLOW")score-=18;if(a==="RED")score-=42;if(b==="YELLOW")score-=18;if(b==="RED")score-=55;if(c==="YELLOW")score-=8;if(c==="RED")score-=16;score=Math.max(15,Math.min(98,score));let run="Full phase plan",ruck="Full phase plan",row="Phase plan",strength="Full plan",intensity="Planned",nutrition="Follow phase target",warning="";if(!o)return{a,b,c,o,score:0,run:"Complete check-in",ruck:"Complete check-in",row:"Complete check-in",strength:"Complete check-in",intensity:"Complete check-in",nutrition:"Complete check-in",warning:""};if(b==="RED"){run="No running";ruck="No weighted-pack walking";row="Easy row if pain-free";strength="Non-aggravating only";intensity="No hard training";warning="Mechanical override: favorable recovery metrics do not justify impact or loaded walking."}else if(o==="RED"){run="Row or walk only";ruck="No loaded walking";row="Recovery row";strength="Reduce about 50%";intensity="No hard training"}else if(o==="YELLOW"){run="Reduce about 25–40%; keep easy";ruck="Reduce distance/load";row="Prefer easy rowing";strength="Reduce about 30%";intensity="No hard intervals"}if(c==="RED")nutrition="Add energy/carbohydrate; review deficit";else if(c==="YELLOW")nutrition="Hold intake; add carbohydrate around training";return{a,b,c,o,score,run,ruck,row,strength,intensity,nutrition,warning}}
function dayKey(d){return new Date(d).toDateString()}
function missedDays(){if(!localStorage.programStart)return[];const start=new Date(localStorage.programStart),end=new Date();start.setHours(12,0,0,0);end.setHours(12,0,0,0);end.setDate(end.getDate()-1);const resolved=new Set(logs().map(x=>dayKey(x.date))),failed=new Set(JSON.parse(localStorage.failedDays||"[]")),out=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const k=d.toDateString();if(!resolved.has(k)&&!failed.has(k))out.push(new Date(d))}return out}
let historicalDate=null,historicalInputs=null;
function openHistoricalCheckin(d){resetHistorical();historicalInputs=Object.fromEntries(["hrv","rhr","sleep","sleepQ","fatigue","grip","load","pain","performance","weight","hrvBase","rhrBase","gripBase","weightAvg","focal","gait"].map(id=>[id,{value:$(id).value,checked:$(id).checked}]));historicalDate=new Date(d);["hrvBase","rhrBase","gripBase","weightAvg"].forEach(id=>$(id).value="");applyBaselines();["hrv","rhr","sleep","sleepQ","fatigue","grip","load","pain","performance","weight"].forEach(id=>{if($(id))$(id).value=""});$("focal").checked=false;$("gait").checked=false;$("checkinSheet").querySelector(".sheet-head small").textContent="RETROSPECTIVE";$("checkinSheet").querySelector(".sheet-head h2").textContent=historicalDate.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});$("checkinSheet").classList.remove("hidden");requiredFields()}
function resetHistorical(){if(historicalInputs){for(const [id,state] of Object.entries(historicalInputs)){ $(id).value=state.value;$(id).checked=state.checked }historicalInputs=null}historicalDate=null;$("checkinSheet").querySelector(".sheet-head small").textContent="MORNING";$("checkinSheet").querySelector(".sheet-head h2").textContent="Check-In"}
function markMissedDay(d){const arr=JSON.parse(localStorage.failedDays||"[]"),k=dayKey(d);if(!arr.includes(k))arr.push(k);localStorage.failedDays=JSON.stringify(arr);renderAll()}
function renderMissedBanner(){const m=missedDays(),b=$("missedDayBanner");if(!b)return;if(!m.length){b.classList.add("hidden");b.innerHTML="";return}const d=m[0];b.classList.remove("hidden");b.innerHTML='<div class="missed-icon">!</div><div><small>CURRICULUM DEBT</small><strong>Missed check-in · '+d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})+'</strong><p>Resolve this day before it can count toward phase mastery.</p><div class="missed-actions"><button id="resolveMissed">Enter remembered data</button><button id="failMissed">Mark missed</button></div></div>';$("resolveMissed").onclick=()=>openHistoricalCheckin(d);$("failMissed").onclick=()=>markMissedDay(d)}
function migrateProductState(){
 const l=logs(),w=workouts();
 if(!l.length&&!w.length){localStorage.removeItem("programStart");localStorage.removeItem("baselineDate");localStorage.failedDays="[]";localStorage.removeItem("journeyPending");return}
 if(l.length&&!localStorage.baselineDate){const earliest=l.slice().sort((a,b)=>new Date(a.date)-new Date(b.date))[0];localStorage.baselineDate=earliest.date}
}
function beginJourney(){
 if(localStorage.programStart)return;
 const base=todayCheckin()||logs().slice().sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
 if(!base){openCheckin();return}
 const start=new Date();
 localStorage.programStart=start.toISOString();
 localStorage.baselineDate=base.date;
 localStorage.failedDays="[]";
 localStorage.removeItem("journeyPending");
 if(dayKey(base.date)===dayKey(start)){
   const l=logs(),hit=l.find(x=>x===base||x.date===base.date);if(hit){hit.preJourney=false;hit.week=1;localStorage.trainingLogs=JSON.stringify(l);dbSet("trainingLogs",localStorage.trainingLogs)}
 }
 viewedWeek=1;viewedMonth=new Date(start);
 renderAll()
}
function renderJourneyStart(){
 const card=$("journeyStartCard");if(!card)return;
 if(localStorage.programStart){card.classList.add("hidden");return}
 card.classList.remove("hidden");const base=logs().slice().sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
 card.querySelector(".journey-mark").textContent=base?"✓":"01";
 card.querySelector("small").textContent=base?"BASELINE CAPTURED":"YOUR PROGRAM HAS NOT STARTED";
 card.querySelector("h2").textContent=base?"Ready for Day 1":"Set your Day 1";
 card.querySelector("p").textContent=base?"Your baseline is saved. Begin when you want the 56-week clock and curriculum accountability to start.":"Complete a baseline morning check-in, then begin the journey. Nothing before Day 1 can create curriculum debt.";
 card.querySelector("button").textContent=base?"Begin Journey":"Log Baseline";
}
function requiredFields(){const ids=["hrv","rhr","sleep","sleepQ","fatigue","load","pain","performance","weight"];let done=0;ids.forEach(id=>{const el=$(id),ok=String(el.value).trim()!=="";done+=ok?1:0;el.closest(".field").classList.toggle("field-done",ok);el.closest(".field").classList.toggle("field-needed",!ok)});const left=ids.length-done,b=$("checkinProgress");if(left===0){b.classList.add("complete");b.querySelector(".attention-icon").textContent="✓";b.querySelector("strong").textContent="Ready to evaluate";$("checkinProgressText").textContent="Required fields complete."}else{b.classList.remove("complete");b.querySelector(".attention-icon").textContent="!";b.querySelector("strong").textContent="Needs attention";$("checkinProgressText").textContent=left+" required field"+(left===1?"":"s")+" remaining."}}
function avg(a){const x=a.filter(Number.isFinite);return x.length?x.reduce((p,c)=>p+c,0)/x.length:null}
function applyBaselines(){const l=logs().filter(x=>!historicalDate||new Date(x.date)<new Date(new Date(historicalDate).setHours(0,0,0,0))).sort((a,b)=>new Date(b.date)-new Date(a.date)),hb=avg(l.slice(0,28).map(x=>x.hrv)),rb=avg(l.slice(0,28).map(x=>x.rhr)),gb=avg(l.slice(0,28).map(x=>x.grip)),wa=avg(l.slice(0,7).map(x=>x.weight));if(hb!==null)$("hrvBase").value=hb.toFixed(0);if(rb!==null)$("rhrBase").value=rb.toFixed(0);if(gb!==null)$("gripBase").value=gb.toFixed(1);if(wa!==null)$("weightAvg").value=wa.toFixed(1)}
function persistInputs(){if(historicalDate)return;["hrv","rhr","sleep","sleepQ","fatigue","grip","load","pain","performance","weight"].forEach(id=>localStorage.setItem("input_"+id,$(id).value));localStorage.input_focal=$("focal").checked?"1":"0";localStorage.input_gait=$("gait").checked?"1":"0"}
function evaluate(){const d=decision();[["sysStatus",d.a],["mechStatus",d.b],["fuelStatus",d.c]].forEach(x=>{$(x[0]).textContent=x[1]||"—";$(x[0]).style.color=x[1]==="GREEN"?"var(--green)":x[1]==="YELLOW"?"var(--yellow)":x[1]==="RED"?"var(--red)":""});[["runDecision",d.run],["ruckDecision",d.ruck],["c2Decision",d.row],["strengthDecision",d.strength],["intensityDecision",d.intensity],["nutritionDecision",d.nutrition]].forEach(x=>$(x[0]).textContent=x[1]);$("warningBox").textContent=d.warning;$("warningBox").classList.toggle("hidden",!d.warning);$("results").classList.remove("hidden");persistInputs()}
function saveCheckin(){
 evaluate();const d=decision();if(!d.o)return;
 const l=logs(),saveDate=historicalDate?new Date(historicalDate):new Date();
 const saveWeek=historicalDate?programWeekForDate(saveDate):(localStorage.programStart?prescriptionWeek():1);
 const sameDay=l.findIndex(x=>dayKey(x.date)===dayKey(saveDate));if(sameDay>=0)l.splice(sameDay,1);
 l.unshift({date:saveDate.toISOString(),week:saveWeek,preJourney:!localStorage.programStart,weight:num("weight"),weightAvg:num("weightAvg"),hrv:num("hrv"),hrvBase:num("hrvBase"),rhr:num("rhr"),rhrBase:num("rhrBase"),grip:num("grip"),gripBase:num("gripBase"),sleep:num("sleep"),sleepQ:num("sleepQ"),fatigue:num("fatigue"),load:num("load"),pain:num("pain"),performance:val("performance"),focal:$("focal").checked,gait:$("gait").checked,overall:d.o,score:d.score,decision:d,priorWorkoutSignal:previousWorkoutSignal(saveDate)});
 localStorage.trainingLogs=JSON.stringify(l);dbSet("trainingLogs",localStorage.trainingLogs);
 if(!historicalDate){setTask("checkin",true);if(!localStorage.programStart)localStorage.baselineDate=saveDate.toISOString()}
 resetHistorical();closeCheckin();renderAll()
}
function previousWorkoutSignal(referenceDate=new Date()){const y=new Date(referenceDate);y.setDate(y.getDate()-1);const x=workouts().filter(w=>dayKey(w.date)===dayKey(y)&&w.completed!=="NO").sort((a,b)=>new Date(b.date)-new Date(a.date))[0];if(!x)return null;const pain=Number(x.postPain),rpe=Number(x.rpe);if(Number.isFinite(pain)&&pain>=5)return{level:"RED",reason:"Yesterday’s session ended with pain "+pain+"/10."};if((Number.isFinite(pain)&&pain>=3)||(Number.isFinite(rpe)&&rpe>=9))return{level:"YELLOW",reason:Number.isFinite(pain)&&pain>=3?"Yesterday’s session ended with pain "+pain+"/10.":"Yesterday’s session was rated "+rpe+"/10 effort."};return null}
function saveWorkout(c){
 if(!localStorage.programStart){beginJourney();return}
 const status=c||"YES",rpe=num("sessionRPE"),postPain=num("postPain"),needsFeedback=status==="YES"||status==="PARTIAL";
 if(needsFeedback&&(rpe===null||postPain===null)){
   $("sessionFeedback").open=true;
   $("completionBanner").textContent="Add effort and post-session pain before saving this session.";
   $("completionBanner").classList.add("attention");$("completionBanner").classList.remove("hidden");
   setTimeout(()=>$("completionBanner").classList.add("hidden"),2200);return
 }
 const arr=workouts(),prescription=adaptiveSession(),entry={date:new Date().toISOString(),week:prescriptionWeek(),session:prescription.title,prescription,rpe,duration:num("sessionDuration"),postPain,runMiles:num("sessionRunMiles"),ruckMiles:num("sessionRuckMiles"),rowMinutes:num("sessionRowMinutes"),packWeight:num("sessionPackWeight"),completed:status,note:val("sessionNote")};
 const existing=arr.findIndex(x=>dayKey(x.date)===todayKey());if(existing>=0)arr.splice(existing,1);arr.unshift(entry);
 localStorage.workoutHistory=JSON.stringify(arr);dbSet("workoutHistory",localStorage.workoutHistory);setTask("workout",entry.completed==="YES");
 $("sessionFeedback").open=false;$("completionBanner").classList.remove("attention");
 $("completionBanner").textContent=status==="YES"?"Session complete ✓":status==="PARTIAL"?"Partial session saved":"Skipped session saved";
 $("completionBanner").classList.remove("hidden");setTimeout(()=>$("completionBanner").classList.add("hidden"),1600);renderAll()
}
const EXERCISE_DB_BASE="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
function datasetExerciseId(name){
 const n=name.toLowerCase();
 const map=[
  [/back squat|squat$/,"Barbell_Full_Squat"],
  [/romanian deadlift|hip hinge|hinge$/,"Romanian_Deadlift"],
  [/overhead press|military press|press$/,"Standing_Military_Press"],
  [/pull-up|pullups|pull up/,"Pullups"],
  [/push-up|pushups|push up/,"Pushups"],
  [/split squat|reverse lunge|walking lunge|lunge/,"Split_Squat_with_Dumbbells"],
  [/soleus|seated calf/,"Seated_Calf_Raise"],
  [/calf/,"Standing_Calf_Raises"],
  [/tibialis/,"Anterior_Tibialis-SMR"],
  [/neck harness|neck resistance/,"Lying_Face_Down_Plate_Neck_Resistance"],
  [/grip work|plate pinch|hand squeeze/,"Standing_Olympic_Plate_Hand_Squeeze"],
  [/forearm roller|wrist/,"Palms-Up_Barbell_Wrist_Curl_Over_A_Bench"],
  [/one-arm row|press \+ row|horizontal row/,"One-Arm_Dumbbell_Row"],
  [/suitcase|farmer|loaded carry/,"Rickshaw_Carry"],
  [/bear-hug sandbag|sandbag/,"Sandbag_Load"],
  [/rkc plank|plank|trunk work|core/,"Plank"],
  [/sit-up|sit up/,"Sit-Up"],
  [/russian twist/,"Russian_Twist"],
  [/ankle mobility|ankle circles/,"Ankle_Circles"],
  [/hip mobility|mobility|stretch/,"Upward_Stretch"],
  [/controlled threshold work/,"Rowing_Stationary"],
  [/main quality work/,"Running_Treadmill"],
  [/long session/,"Trail_Running_Walking"],
  [/main session/,"Running_Treadmill"],
  [/cool-down|cool down/,"Walking_Treadmill"],
  [/warm-up|warmup/,"Jogging_Treadmill"],
  [/row|rowing/,"Rowing_Stationary"],
  [/run|running|jog/,"Running_Treadmill"],
  [/walk|weighted-pack|ruck/,"Trail_Running_Walking"],
  [/jump rope|rope jumping/,"Rope_Jumping"],
  [/step-up|step up/,"Step-up_with_Knee_Raise"],
  [/deadlift/,"Barbell_Deadlift"]
 ];
 for(const [re,id] of map)if(re.test(n))return id;
 return"";
}
function exerciseDbUrl(id,index=0){return EXERCISE_DB_BASE+encodeURIComponent(id).replace(/%2C/g,",")+"/"+index+".jpg"}
function exerciseMedia(name,detail=false){
 const id=datasetExerciseId(name);
 if(!id)return '<div class="exercise-photo-missing"><span>Visual guide pending</span><small>'+name+'</small></div>';
 const first=exerciseDbUrl(id,0),second=exerciseDbUrl(id,1);
 if(detail)return '<div class="exercise-photo-pair"><figure><img src="'+first+'" alt="'+name+' start position" onerror="this.closest(\'figure\').classList.add(\'image-failed\')"><figcaption>Start</figcaption></figure><figure><img src="'+second+'" alt="'+name+' finish position" onerror="this.closest(\'figure\').classList.add(\'image-failed\')"><figcaption>Finish</figcaption></figure></div>';
 return '<div class="exercise-photo-frame"><img src="'+first+'" alt="'+name+' demonstration" loading="lazy" onerror="this.closest(\'.exercise-photo-frame\').classList.add(\'image-failed\')"></div>';
}
function exerciseSteps(e){const n=e.name.toLowerCase();
 if(n.includes("back squat"))return["Set the bar across the upper back, brace the trunk, and plant the whole foot.","Sit down between the hips while keeping the knees tracking with the toes.","Drive the floor away and finish tall without losing trunk position."];
 if(n.includes("romanian deadlift"))return["Stand tall with the load close to the thighs and soften the knees.","Push the hips backward while the load stays close to the legs and the spine remains neutral.","Stop when hamstring tension limits the hinge, then drive the hips forward to stand."];
 if(n.includes("lunge")||n.includes("split squat"))return["Take a stable stance long enough to keep the front heel planted.","Lower under control until both legs are strongly loaded without collapsing inward.","Drive through the front foot and return to a balanced position before the next rep."];
 if(n.includes("rkc plank")||n==="plank")return["Place forearms under the shoulders and make a straight line from shoulders through heels.","Squeeze glutes and quads, brace the abdomen, and pull the elbows subtly toward the toes.","Hold maximal useful tension without letting the hips sag, rise, or the low back extend."];
 if(n.includes("pull-up"))return["Start from a controlled hang with the ribs stacked and shoulders active.","Pull the elbows down toward the ribs without kicking or craning the neck.","Lower to a controlled full hang and stop the set before form deteriorates."];
 if(n.includes("press"))return["Brace the trunk and begin with the load stacked over the forearms.","Press in a controlled path while keeping the ribs from flaring.","Finish with the load balanced overhead, then lower under control."];
 return["Set up deliberately using the coaching cue shown for this movement.","Complete each repetition or interval with controlled technique and normal breathing.","Stop the set if pain changes your movement pattern or technique begins to break down."]}
function exerciseTips(e){const n=e.name.toLowerCase(),tips=["Keep every repetition technically repeatable rather than chasing fatigue.","Use the prescribed rest period before the next set.","Pain that changes your gait or movement is a stop signal, not a toughness test."];if(n.includes("rkc plank"))tips[0]="Think full-body tension: glutes, quads and abdomen should all be working hard.";if(n.includes("romanian"))tips[0]="The movement comes from the hips traveling backward, not from rounding the spine.";if(n.includes("squat"))tips[0]="Maintain pressure through heel, big-toe base and little-toe base throughout the rep.";return tips}
function detailStats(e){const m=e.dose.match(/^(\d+(?:[–-]\d+)?)\s*[×x]\s*(.+)$/);return{sets:m?m[1]:(e.dose.match(/^\d+(?:[–-]\d+)?/)||["—"])[0],work:m?m[2]:e.dose,rest:e.rest}}
function renderExerciseDetailTab(e,tab){const stats=detailStats(e),steps=exerciseSteps(e),tips=exerciseTips(e);if(tab==="steps")return'<div class="detail-tab-copy"><h3>How to perform it</h3><div class="numbered-steps">'+steps.map((x,i)=>'<div><b>'+(i+1)+'</b><p>'+x+'</p></div>').join("")+'</div></div>';if(tab==="tips")return'<div class="detail-tab-copy"><h3>Coaching tips</h3><div class="tips-list">'+tips.map(x=>'<p>✓ '+x+'</p>').join("")+'</div></div>';return'<div class="exercise-visual reference-visual">'+exerciseMedia(e.name,true)+'</div><div class="detail-overview-copy"><p>'+e.cue+'</p></div><div class="modal-stats"><div><span>SETS</span><strong>'+stats.sets+'</strong></div><div><span>WORK</span><strong>'+stats.work+'</strong></div><div><span>REST</span><strong>'+stats.rest+'</strong></div></div><div class="detail-tab-copy"><h3>How to perform it</h3><div class="numbered-steps">'+steps.map((x,i)=>'<div><b>'+(i+1)+'</b><p>'+x+'</p></div>').join("")+'</div></div>'}
function openInfo(t){$("modalTitle").textContent=t.charAt(0).toUpperCase()+t.slice(1);$("modalContent").innerHTML='<div class="modal-copy"><p>'+(definitions[t]||"Defined by the current session context.")+'</p></div>';$("infoModal").classList.remove("hidden")}
function openExercise(e){$("modalTitle").textContent=e.name;$("modalContent").innerHTML='<div class="exercise-detail-tabs"><button class="active" data-exdetail="overview">Overview</button><button data-exdetail="steps">Steps</button><button data-exdetail="tips">Tips</button></div><div id="exerciseDetailPanel">'+renderExerciseDetailTab(e,"overview")+'</div>';$("infoModal").classList.remove("hidden");$("modalDone").textContent="Got it";$("modalDone").classList.add("confirm-green");$("modalContent").querySelectorAll("[data-exdetail]").forEach(b=>b.onclick=()=>{$("modalContent").querySelectorAll("[data-exdetail]").forEach(x=>x.classList.toggle("active",x===b));$("exerciseDetailPanel").innerHTML=renderExerciseDetailTab(e,b.dataset.exdetail)})}
function closeModal(){$("infoModal").classList.add("hidden")}function bindInfo(root){(root||document).querySelectorAll(".info-dot[data-term]").forEach(b=>b.onclick=e=>{e.stopPropagation();openInfo(b.dataset.term)})}
function savedDecision(){const d=todayCheckin();return d?.decision||null}
function effectiveDecision(){return savedDecision()||decision()}
function reduceDoseText(dose){if(!dose||dose==="—")return dose;if(/\d+\s*[×x]\s*/.test(dose))return dose.replace(/^(\d+)/,(m)=>String(Math.max(1,Math.round(Number(m)*.7))));return "≈70% of planned volume · "+dose}
function adaptiveSessionFor(name,d,w=prescriptionWeek()){
 const base=makeSession(name,w),dec=d?.decision;
 if(!d||!dec)return base;
 if(dec.b==="RED")return{title:"Mechanical Recovery Override",type:"Recovery",duration:"20–45 min",effort:"Very easy / pain-free",why:"Pain or altered movement triggered the mechanical stop rule. Impact and loaded walking are removed until the red flag resolves.",steps:[ex("Easy row or walk","20–30 min","Continuous","Only if pain-free and movement remains normal.","Recovery"),ex("Gentle mobility","10–15 min","—","Use comfortable ranges only.","Mobility")]};
 if(dec.o==="RED")return{title:"Recovery Override",type:"Recovery",duration:"25–50 min",effort:"Very easy",why:"Systemic recovery is too suppressed for the planned workload. Today prioritizes recovery while preserving routine.",steps:[ex("Easy row","20–40 min","Continuous","Conversational effort; finish fresher than you started.","Recovery"),ex("Light mobility","10 min","—","Gentle, non-fatiguing movement.","Mobility"),ex("Easy trunk work","2 light sets","60 sec","No grinding or failure.","Core")]};
 if(dec.o==="YELLOW"){
   const steps=base.steps.map(e=>{const n=e.name.toLowerCase();if(/quality|threshold|interval/.test(n))return ex("Easy aerobic substitute","20–40 min","Continuous","Replace hard work with easy aerobic work today.","Recovery");return{...e,dose:reduceDoseText(e.dose),cue:e.cue+" Keep today comfortably submaximal."}});
   return{...base,title:base.title+" · Modified",effort:"Reduced",why:"Recovery or fueling signals warrant a lower-stress version of the planned session.",steps};
 }
 return base;
}
function adaptiveSession(){return adaptiveSessionFor(sessionName(),todayCheckin(),prescriptionWeek())}
function readinessBreakdown(){
 const d=todayCheckin(),dec=d?.decision||decision();
 if(!d)return{score:null,status:"No readiness score yet",copy:"Complete today’s morning check-in to generate an adaptive training recommendation."};
 return{score:d.score,status:d.overall==="GREEN"?"Ready to train":d.overall==="YELLOW"?"Train with caution":"Recovery priority",copy:d.overall==="GREEN"?"Recovery, mechanical status and fueling support the planned workload.":d.overall==="YELLOW"?"One or more inputs suggest reducing today’s stress.":"A red recovery or mechanical flag overrides the planned workload.",dec};
}
function openReadiness(){
 const r=readinessBreakdown(),d=todayCheckin(),ring=d?(d.overall==="GREEN"?"var(--green)":d.overall==="YELLOW"?"var(--yellow)":"var(--red)"):"var(--blue)";
 $("readinessDetail").innerHTML='<div class="readiness-sheet-score"><div class="score-ring" style="--score:'+(r.score||0)+';--ring:'+ring+'"><div><strong>'+(r.score??"—")+'</strong><small>/100</small></div></div><div><small>TODAY</small><strong>'+r.status+'</strong><p>'+r.copy+'</p></div></div>'+(d?'<div class="readiness-factors"><div><span>Recovery</span><strong>'+r.dec.a+'</strong></div><div><span>Injury risk</span><strong>'+r.dec.b+'</strong></div><div><span>Fueling</span><strong>'+r.dec.c+'</strong></div></div><div class="readiness-prescription"><strong>Adaptive prescription</strong><p><b>Run:</b> '+r.dec.run+'</p><p><b>Strength:</b> '+r.dec.strength+'</p><p><b>Intensity:</b> '+r.dec.intensity+'</p><p><b>Nutrition:</b> '+r.dec.nutrition+'</p></div>':'')+'<button class="sheet-primary" id="readinessEdit">'+(d?"Edit morning check-in":"Complete morning check-in")+'</button>';
 $("readinessSheet").classList.remove("hidden");$("readinessEdit").onclick=()=>{$("readinessSheet").classList.add("hidden");openCheckin()};
}
function adaptationExplanation(d){
 if(!d)return null;const dec=d.decision||decision(),reasons=[];
 if(dec.a==="RED")reasons.push("recovery markers are substantially outside your normal range");
 else if(dec.a==="YELLOW")reasons.push("recovery markers are mildly suppressed");
 if(dec.b==="RED")reasons.push(d.priorWorkoutSignal?.level==="RED"?d.priorWorkoutSignal.reason.replace(/\.$/,""):"pain or movement quality triggered a mechanical stop rule");
 else if(dec.b==="YELLOW")reasons.push(d.priorWorkoutSignal?.level==="YELLOW"?d.priorWorkoutSignal.reason.replace(/\.$/,""):"mechanical symptoms warrant reduced loading");
 if(dec.c==="RED")reasons.push("recent fueling and body-weight trend suggest meaningful under-fueling");
 else if(dec.c==="YELLOW")reasons.push("recent fueling is below the preferred range for the current workload");
 if(!reasons.length)return null;
 return{title:dec.o==="RED"?"Today is a recovery-priority day":"Today’s plan has been modified",copy:reasons.join("; ")+".",dec};
}
function formatDelta(value,baseline,suffix=""){if(value==null||!baseline)return"baseline";const delta=value-baseline;if(Math.abs(delta)<0.05)return"at baseline";return(delta>0?"+":"")+delta.toFixed(Math.abs(delta)<1?1:0)+suffix}
function renderTodayJourney(){
 const w=prescriptionWeek(),calendar=currentWeek(),phase=macroForWeek(w),stats=macroStats(phase),sets=objectiveSetsForPhase(phase,stats,getBenchmarks()),all=sets.flat(),next=all.find(o=>!o.done),progress=Math.round(((w-1)/55)*100);
 $("todayJourneyWeek").textContent=w<calendar?"Held at Week "+w+" · calendar Week "+calendar:"Week "+w+" of 56";
 $("todayJourneyPhase").textContent=phase.name;
 $("todayJourneyNext").textContent=next?"Next: "+next.name+" · "+next.label:"Phase qualification complete";
 $("todayJourneyBar").style.width=progress+"%";
}
function sessionIncludesPrehab(det){return /mobility|durability|trunk/i.test(det.title)||det.steps.filter(e=>/Mobility|Durability/.test(e.type||"")).length>=2}
function renderToday(){$("today").classList.toggle("pre-journey",!localStorage.programStart);renderJourneyStart();renderTodayJourney();const d=todayCheckin(),det=adaptiveSession(),record=todayWorkoutRecord(),done=record?.completed==="YES";$("todayDate").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});$("taskWorkoutTitle").textContent=det.title;const heroMove=det.steps?.[0]?.name;if(heroMove)$("taskWorkoutThumb").innerHTML=exerciseMedia(heroMove);$("taskWorkoutSub").textContent=done?"Completed today":record?.completed==="PARTIAL"?"Partial session recorded · review details":record?.completed==="NO"?"Skipped today · review if this changes":det.duration+" · "+det.effort;const score=d?.score||0;$("readinessScore").textContent=d?score:"—";$("scoreRing").style.setProperty("--score",score);$("scoreRing").style.setProperty("--ring",d?(d.overall==="GREEN"?"var(--green)":d.overall==="YELLOW"?"var(--yellow)":"var(--red)"):"var(--green)");$("readinessLabel").textContent=!localStorage.programStart?(d?"Baseline ready":"Not started"):d?(d.overall==="GREEN"?"Good":d.overall==="YELLOW"?"Caution":"Recover"):"Check in";$("readinessLabel").style.color=d?(d.overall==="GREEN"?"var(--green)":d.overall==="YELLOW"?"var(--yellow)":"var(--red)"):"";$("readinessMessage").textContent=!localStorage.programStart?"Complete a baseline and begin the journey when you are ready.":d?(d.overall==="GREEN"?"You’re ready for the planned session.":d.overall==="YELLOW"?"Train, but reduce today’s stress.":"Recovery takes priority today."):"Log your morning metrics to personalize today’s training.";$("todayHRV").textContent=d?.hrv??"—";$("todayRHR").textContent=d?.rhr??"—";$("todaySleep").textContent=d?.sleep??"—";$("hrvDelta").textContent=d?formatDelta(d.hrv,num("hrvBase")):"baseline";$("rhrDelta").textContent=d?formatDelta(d.rhr,num("rhrBase")," bpm"):"baseline";const adapt=adaptationExplanation(d),ab=$("adaptationBanner");if(adapt){ab.classList.remove("hidden");ab.className="adaptation-banner "+(adapt.dec.o==="RED"?"red":"yellow");ab.innerHTML="<div><small>WHY TODAY CHANGED</small><strong>"+adapt.title+"</strong><span>"+adapt.copy+"</span></div><b>›</b>";ab.onclick=openReadiness}else{ab.className="adaptation-banner hidden";ab.innerHTML="";ab.onclick=null}const separateMobility=!sessionIncludesPrehab(det);$("taskMobility").classList.toggle("hidden",!separateMobility);const state={taskCheckin:!!d,taskWorkout:!!done,taskNutrition:!!getNutritionLog().saved,...(separateMobility?{taskMobility:taskDone("mobility")}:{})};Object.entries(state).forEach(([id,doneState])=>{const el=$(id);el.classList.toggle("done",doneState);el.querySelector(".task-circle").textContent=doneState?"✓":"○"});$("todayTaskCount").textContent=Object.values(state).filter(Boolean).length+"/"+Object.keys(state).length}
function renderTrain(){const det=adaptiveSession(),c=todayCheckin(),label=!c?"CHECK IN":c.overall==="GREEN"?"PRIMARY":c.overall==="YELLOW"?"MODIFIED":"RECOVERY";$("workoutKicker").textContent="TODAY · WEEK "+prescriptionWeek()+" · "+blockForWeek(prescriptionWeek()).name.toUpperCase();$("workoutTitle").textContent=det.title;$("workoutWhy").textContent=det.why;renderWeekTargetCard(prescriptionWeek(),det);$("workoutTags").innerHTML='<span>◷ '+det.duration+'</span><span>◈ '+det.effort+'</span><span>'+det.type+'</span>';$("sessionStatus").textContent=label;$("sessionStatus").className="session-status "+(!c?"yellow":c.overall==="YELLOW"?"yellow":c.overall==="RED"?"red":"");$("exerciseCount").textContent=det.steps.length+" movements";$("workoutPrescription").innerHTML=det.steps.map((e,i)=>'<button class="exercise-card" data-i="'+i+'"><div class="exercise-thumb">'+exerciseMedia(e.name)+'</div><div class="exercise-copy"><strong>'+(i+1)+'. '+e.name+'</strong><span>'+e.dose+'</span><small>Rest: '+e.rest+'</small></div><b>›</b></button>').join("");$("workoutPrescription").querySelectorAll(".exercise-card").forEach(b=>b.onclick=()=>openExercise(det.steps[+b.dataset.i]));const record=todayWorkoutRecord(),done=record?.completed==="YES";$("completeWorkoutQuick").textContent=done?"✓ Session Complete":record?.completed==="PARTIAL"?"Partial saved · Review":record?.completed==="NO"?"Skipped · Review":"Review & Complete Session";$("completeWorkoutQuick").disabled=!!done;$("postSessionPrompt").classList.toggle("done",!!done);renderLibrary()}
const LIB_META={
 "Barbell_Full_Squat":{name:"Back Squat",category:"Strength",tags:"barbell legs squat quads glutes"},
 "Romanian_Deadlift":{name:"Romanian Deadlift",category:"Strength",tags:"barbell dumbbell hinge hamstrings glutes"},
 "Standing_Military_Press":{name:"Overhead Press",category:"Strength",tags:"barbell dumbbell shoulders press"},
 "Pullups":{name:"Pull-Up",category:"Bodyweight",tags:"pull up back lats grip bar"},
 "Pushups":{name:"Push-Up",category:"Bodyweight",tags:"push up chest triceps bodyweight"},
 "Split_Squat_with_Dumbbells":{name:"Split Squat / Reverse Lunge",category:"Strength",tags:"dumbbell legs unilateral lunge"},
 "Seated_Calf_Raise":{name:"Seated Soleus Raise",category:"Durability",tags:"calf soleus lower leg seated"},
 "Standing_Calf_Raises":{name:"Standing Calf Raise",category:"Durability",tags:"calf achilles lower leg"},
 "Anterior_Tibialis-SMR":{name:"Tibialis Raise",category:"Durability",tags:"shin tibialis lower leg ankle"},
 "Lying_Face_Down_Plate_Neck_Resistance":{name:"Neck Resistance",category:"Durability",tags:"neck harness plate resistance"},
 "Standing_Olympic_Plate_Hand_Squeeze":{name:"Grip / Plate Pinch",category:"Durability",tags:"grip hand forearm plate"},
 "Palms-Up_Barbell_Wrist_Curl_Over_A_Bench":{name:"Forearm / Wrist Curl",category:"Durability",tags:"forearm wrist roller barbell"},
 "One-Arm_Dumbbell_Row":{name:"One-Arm Row",category:"Strength",tags:"dumbbell row back lats"},
 "Rickshaw_Carry":{name:"Suitcase / Loaded Carry",category:"Carry",tags:"carry kettlebell dumbbell suitcase trunk grip"},
 "Sandbag_Load":{name:"Sandbag Bear-Hug Carry",category:"Carry",tags:"sandbag carry bear hug trunk"},
 "Plank":{name:"RKC Plank",category:"Core",tags:"plank core trunk anti extension"},
 "Sit-Up":{name:"Sit-Up",category:"Core",tags:"sit up core trunk"},
 "Russian_Twist":{name:"Russian Twist",category:"Core",tags:"rotation core trunk"},
 "Ankle_Circles":{name:"Ankle Mobility",category:"Mobility",tags:"ankle mobility range of motion"},
 "Upward_Stretch":{name:"Hip / General Mobility",category:"Mobility",tags:"hip mobility stretch warm up recovery"},
 "Rowing_Stationary":{name:"Concept2 Rowing",category:"Conditioning",tags:"rower concept2 aerobic threshold conditioning"},
 "Running_Treadmill":{name:"Running",category:"Conditioning",tags:"run running aerobic intervals threshold road"},
 "Trail_Running_Walking":{name:"Weighted-Pack Walking / Ruck",category:"Conditioning",tags:"ruck weighted pack walking endurance"},
 "Rope_Jumping":{name:"Jump Rope",category:"Conditioning",tags:"rope jump conditioning footwork"},
 "Step-up_with_Knee_Raise":{name:"Step-Up",category:"Strength",tags:"step up legs unilateral box"},
 "Barbell_Deadlift":{name:"Deadlift",category:"Strength",tags:"barbell deadlift hinge posterior chain"}
};
let libraryFilter="All";
function libraryExercises(){
 const raw=[];Object.values(templates).flat().forEach(name=>makeSession(name).steps.forEach(e=>raw.push(e)));raw.push(...A,...B);
 const byMovement=new Map();
 for(const e of raw){
   const id=datasetExerciseId(e.name);if(!id)continue;
   const meta=LIB_META[id];if(!meta)continue;
   if(!byMovement.has(id))byMovement.set(id,{...e,name:meta.name,category:meta.category,tags:meta.tags,movementId:id});
 }
 return[...byMovement.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
function renderLibraryFilters(){
 const cats=["All",...new Set(libraryExercises().map(e=>e.category))];
 $("libraryFilters").innerHTML=cats.map(c=>'<button class="library-filter '+(c===libraryFilter?"active":"")+'" data-libfilter="'+c+'">'+c+'</button>').join("");
 $("libraryFilters").querySelectorAll(".library-filter").forEach(b=>b.onclick=()=>{libraryFilter=b.dataset.libfilter;renderLibrary($("librarySearch").value);renderLibraryFilters()});
}
function renderLibrary(q=""){
 const all=libraryExercises(),query=q.trim().toLowerCase();
 const arr=all.filter(e=>(libraryFilter==="All"||e.category===libraryFilter)&&(!query||(e.name+" "+e.category+" "+e.tags+" "+e.cue).toLowerCase().includes(query)));
 if($("libraryCount"))$("libraryCount").textContent=arr.length+" movement"+(arr.length===1?"":"s");
 $("exerciseLibrary").innerHTML=arr.length?arr.map((e,i)=>'<button class="library-item" data-i="'+i+'"><div class="library-thumb">'+exerciseMedia(e.name)+'</div><div><strong>'+e.name+'</strong><small>'+e.category+' · '+e.dose+'</small></div><b>›</b></button>').join(""):'<div class="empty-search">No matching movements.</div>';
 $("exerciseLibrary").querySelectorAll(".library-item").forEach(b=>b.onclick=()=>openExercise(arr[+b.dataset.i]));
 renderLibraryFilters();
}
function dateFor(w,i){const d=new Date(programStart());d.setHours(12,0,0,0);d.setDate(d.getDate()+(w-1)*7+i);return d}
let viewedMonth=new Date();
const phasePalette={"Foundation":"#48a7ff","Engine + Load":"#7d8cff","Specificity":"#ad73e6","Peak Work Capacity":"#ef9a57","Taper":"#55cfa0"};
function isHighVolumeSession(name){return /long|quality|threshold|specific|medium aerobic/i.test(name)}
function nutritionForWeek(w,name){const high=isHighVolumeSession(name);if(w<=20)return{phase:"Aggressive Recomposition",cal:high?1650:1450,protein:185,carbs:high?140:90,fat:40,why:high?"Higher carbohydrate allowance for a longer or harder session.":"Lower-volume day: preserve protein while keeping energy intake conservative and carbohydrate matched to today’s training demand."};if(w<=22)return{phase:"Metabolic Pivot · Step 1",cal:1950,protein:185,carbs:190,fat:50,why:"Step calories upward before high-volume work expands."};if(w<=24)return{phase:"Metabolic Pivot · Step 2",cal:2250,protein:185,carbs:240,fat:60,why:"Second step before full performance fueling."};return{phase:"Performance Fueling",cal:high?4000:3400,protein:200,carbs:high?600:450,fat:88,why:high?"High-demand target emphasizing glycogen replacement.":"Baseline Phase B performance target."}}
function nutritionHtml(w,name){
 const n=nutritionForWeek(w,name),meals=mealPlanForTarget(w,n);
 return '<div class="nutrition-hero"><small>'+n.phase.toUpperCase()+'</small><strong>≈ '+n.cal.toLocaleString()+' kcal</strong><p>'+n.why+'</p></div><div class="macro-grid"><div><span>Protein</span><strong>'+n.protein+' g</strong></div><div><span>Carbs</span><strong>'+n.carbs+' g</strong></div><div><span>Fat</span><strong>'+n.fat+' g</strong></div></div><div class="calendar-meal-plan">'+meals.map(m=>'<div><small>≈ '+m.kcal+' KCAL</small><strong>'+m.name+'</strong><p>'+m.foods.join(" · ")+'</p></div>').join("")+'</div><div class="nutrition-note"><strong>Adaptive rule</strong><p>Readiness and body-weight trend override an aggressive deficit when recovery or performance deteriorates.</p></div>';
}
function nutritionLogKey(d=new Date()){return"nutrition_"+dayKey(d)}
function getNutritionLog(d=new Date()){try{return JSON.parse(localStorage.getItem(nutritionLogKey(d))||"{}")}catch(e){return{}}}
function baseMealPlan(w){
 if(w<=24)return[
  {id:"m1",name:"Breakfast",kcal:400,foods:["6 egg whites + 1 whole egg","½ cup cooked oats + 1 tsp chia","½ medium banana"]},
  {id:"m2",name:"Lunch",kcal:350,foods:["6 oz chicken breast","3 cups spinach / kale / baby chard","1 cup mushrooms + bell peppers","1 oz avocado"]},
  {id:"m3",name:"Training snack",kcal:300,foods:["1 slice sourdough","1.5 scoops whey isolate in water"]},
  {id:"m4",name:"Dinner",kcal:400,foods:["5 oz sirloin or wild salmon","½ cup cooked brown rice","2 cups greens + lemon"]}
 ];
 return[
  {id:"m1",name:"Breakfast",kcal:650,foods:["1 cup cooked oats + 2 tbsp chia","1 large banana","1 cup whole milk","1 scoop whey"]},
  {id:"m2",name:"After-training meal",kcal:750,foods:["4 whole eggs + 4 egg whites","2 slices sourdough","1 oz cheese","1 cup greens","1 cup blueberries"]},
  {id:"m3",name:"Lunch",kcal:700,foods:["6 oz chicken or wild salmon","1 cup cooked white rice","2 cups greens","Mushrooms + bell peppers","1 tbsp extra virgin olive oil"]},
  {id:"m4",name:"Training snack",kcal:400,foods:["2 slices sourdough","1 tbsp honey or 1 banana","1 scoop whey in water"]},
  {id:"m5",name:"Dinner",kcal:900,foods:["6 oz top sirloin","1½ cups white rice or 1 large sweet potato","1 oz cheese","¼ avocado","2 cups greens"]}
 ];
}
function fuelAddOnFoods(kcal){
 if(kcal<=225)return["Add roughly "+kcal+" kcal of carbohydrate near training","Example: about 1 cup cooked rice, or a similar portion of oats / bread / fruit"];
 if(kcal<=450)return["Add roughly "+kcal+" kcal, primarily carbohydrate, near training","Example: cooked rice plus fruit, or sourdough plus oats, adjusted with labels for your usual brands"];
 return["Add roughly "+kcal+" kcal, primarily carbohydrate, near training","Example: about 1½ cups cooked rice + 2 slices sourdough + a banana is roughly 600 kcal; scale the portions to this card’s target"];
}
function mealPlanForTarget(w,target){
 const meals=baseMealPlan(w).map(m=>({...m,foods:[...m.foods]})),base=meals.reduce((s,m)=>s+m.kcal,0),goal=Math.round(Number(target?.cal)||base),gap=goal-base;
 if(gap<0)throw new Error("Meal template exceeds nutrition target");
 if(gap>0){
   const chunks=gap>600?[Math.round(gap/2),gap-Math.round(gap/2)]:[gap],recovery=target?.adjustment?.level==="red";
   chunks.forEach((kcal,i)=>meals.push({id:"fuel-addon-"+(i+1),name:chunks.length>1?(i===0?"Pre-Training Fuel Add-On":"Post-Training Fuel Add-On"):(recovery?"Recovery Carbohydrate Add-On":w<=24?"Training Fuel Add-On":"Performance Fuel Add-On"),kcal,foods:fuelAddOnFoods(kcal)}));
 }
 return meals
}
function mealPlanForWeek(w){return baseMealPlan(w)}
function todayNutritionPrescription(w=prescriptionWeek(),name=sessionName()){
 const base={...nutritionForWeek(w,name)},dec=savedDecision(),out={...base,adjustment:null};
 if(dec?.c==="RED"){
   out.cal+=200;out.carbs+=50;
   out.adjustment={level:"red",title:"Recovery fueling override",copy:"Yesterday’s intake was materially below target. Add energy and carbohydrate today and reassess the deficit before returning to aggressive restriction."};
 }else if(dec?.c==="YELLOW"){
   out.adjustment={level:"yellow",title:"Carbohydrate timing emphasis",copy:"Fueling is somewhat below the preferred range. Keep daily intake near target, but place more of today’s carbohydrate before and after training."};
 }
 return out
}
function todayMealPlan(w=prescriptionWeek(),name=sessionName()){
 return mealPlanForTarget(w,todayNutritionPrescription(w,name))
}
function hydrationForDay(w,name){
 const n=name.toLowerCase();
 const prolonged=/long|peak specific|medium aerobic|weighted-pack|ruck|specific hard/.test(n);
 const hard=/quality|threshold|interval|hard session|run \+ strength|strength \+.*run/.test(n);
 const recovery=/recovery|mobility|easy row|easy aerobic|light strength/.test(n);
 if(prolonged)return{label:"Sweat-rate plan",note:"Begin hydrated, then drink to thirst and use your own sweat-rate/body-mass change to guide intake. Do not deliberately gain body mass during exercise. Replace sodium in proportion to sweat losses, heat and duration."};
 if(hard)return{label:"Thirst + sweat rate",note:"Bring fluid and drink according to thirst, heat and observed sweat losses. If you finish meaningfully lighter, use that pre/post body-mass change to refine future sessions."};
 if(recovery)return{label:"Drink to thirst",note:"No forced hydration target today. Begin normally hydrated and let thirst, urine color and usual body weight guide intake."};
 return{label:"Individualized",note:"Use thirst and your observed sweat losses rather than forcing a fixed daily volume. Heat, body size, session duration and acclimatization all change fluid needs."}
}
function previousNutritionSignal(referenceDate=new Date()){
 const y=new Date(referenceDate);y.setDate(y.getDate()-1);const log=getNutritionLog(y);if(!log.saved)return null;
 const x=dateSession(y),target=nutritionForWeek(x.w,x.name),actual=typeof log.actualCalories==="number"&&Number.isFinite(log.actualCalories)?log.actualCalories:null,plannedMeals=Array.isArray(log.prescribedMeals)&&log.prescribedMeals.length?log.prescribedMeals:mealPlanForTarget(x.w,{...target,cal:Number(log.targetCalories)>0?Number(log.targetCalories):target.cal}),mealRatio=(log.meals||[]).length/plannedMeals.length;
 const savedTarget=Number(log.targetCalories)>0?Number(log.targetCalories):target.cal;
 return{ratio:actual!==null?actual/savedTarget:mealRatio,target:savedTarget,actual,mealRatio};
}
// Raw entries are distinct from computed totals: meal estimates must never become overrides.
function nutritionDraft(log=getNutritionLog()){
 const fields=["actualCalories","actualProtein","actualCarbs","actualFat"],draft={};
 for(const id of fields)draft[id]=String(log.draft?.[id]??(log.intakeSource==="prescribed-meals"?"":log[id]??""));
 draft.waterActual=String(log.draft?.waterActual??log.waterOz??"");
 return draft;
}
function captureNutritionDraft(log=getNutritionLog()){
 const draft=nutritionDraft(log);
 for(const id of Object.keys(draft)){const el=$(id);if(el)draft[id]=el.value.trim()}
 log.draft=draft;log.saved=false;delete log.savedAt;
 localStorage.setItem(nutritionLogKey(),JSON.stringify(log));setTask("nutrition",false);
 $("saveNutritionDay").textContent="Save Today’s Intake";
 return log;
}
function renderNutrition(){
 const w=prescriptionWeek(),name=sessionName(),target=todayNutritionPrescription(w,name),meals=todayMealPlan(w,name),log=getNutritionLog(),done=new Set(log.meals||[]),hydr=hydrationForDay(w,name);
 $("nutritionToday").innerHTML='<div class="nutrition-dashboard"><small>'+target.phase.toUpperCase()+'</small><div class="nutrition-dashboard-top"><div><strong>'+target.cal.toLocaleString()+'</strong><span>kcal target</span></div><div class="nutrition-ring" style="--p:'+Math.round(done.size/meals.length*100)+'"><b>'+Math.round(done.size/meals.length*100)+'%</b></div></div><div class="macro-grid page-macros"><div><span>Protein</span><strong>'+target.protein+' g</strong></div><div><span>Carbs</span><strong>'+target.carbs+' g</strong></div><div><span>Fat</span><strong>'+target.fat+' g</strong></div></div><p>'+target.why+'</p>'+(target.adjustment?'<div class="nutrition-adjustment '+target.adjustment.level+'"><strong>'+target.adjustment.title+'</strong><span>'+target.adjustment.copy+'</span></div>':'')+'</div>';
 $("mealProgress").textContent=done.size+"/"+meals.length;
 $("nutritionMeals").innerHTML=meals.map(m=>'<div class="meal-card '+(done.has(m.id)?"done":"")+'"><button class="meal-check" data-meal="'+m.id+'">'+(done.has(m.id)?"✓":"○")+'</button><button class="meal-main" data-mealopen="'+m.id+'"><div><small>≈ '+m.kcal+' KCAL</small><strong>'+m.name+'</strong>'+m.foods.map(f=>'<span>'+f+'</span>').join("")+'</div><b>›</b></button></div>').join("");
 $("nutritionMeals").querySelectorAll(".meal-check").forEach(b=>b.onclick=()=>{const cur=captureNutritionDraft(),set=new Set(cur.meals||[]);set.has(b.dataset.meal)?set.delete(b.dataset.meal):set.add(b.dataset.meal);cur.meals=[...set];cur.saved=false;delete cur.savedAt;localStorage.setItem(nutritionLogKey(),JSON.stringify(cur));setTask("nutrition",false);renderNutrition();renderToday()});
 $("nutritionMeals").querySelectorAll(".meal-main").forEach(b=>b.onclick=()=>{const m=meals.find(x=>x.id===b.dataset.mealopen);$("modalTitle").textContent=m.name;$("modalContent").innerHTML='<div class="meal-detail"><small>≈ '+m.kcal+' KCAL PLANNED</small>'+m.foods.map((f,i)=>'<div><b>'+(i+1)+'</b><span>'+f+'</span></div>').join("")+'</div>';$("infoModal").classList.remove("hidden")});
 const draft=nutritionDraft(log);
 $("hydrationTarget").textContent=hydr.label;$("hydrationCard").innerHTML='<strong>'+hydr.label+'</strong><p>'+hydr.note+'</p><label><span>Fluid consumed today</span><input id="waterActual" type="number" inputmode="decimal" placeholder="oz" value=""></label>';
 Object.entries(draft).forEach(([id,value])=>{$(id).value=value});
 const prev=previousNutritionSignal();$("nutritionInfluence").innerHTML=prev?'<strong>Yesterday’s fueling signal</strong><p>'+Math.round(prev.ratio*100)+'% of planned intake was recorded. '+(prev.ratio<.8?"Today’s readiness engine will treat this as a fueling caution when training load is high.":"No fueling penalty is currently indicated.")+'</p>':'<strong>How nutrition changes training</strong><p>Saved intake carries into tomorrow’s fueling status. Substantial under-fueling on a high-load day can downgrade the next prescription even when HRV looks favorable.</p>';
 $("saveNutritionDay").textContent=log.saved?"✓ Intake saved":"Save Today’s Intake";
 ["actualCalories","actualProtein","actualCarbs","actualFat","waterActual"].forEach(id=>{const el=$(id);if(el)el.oninput=()=>{captureNutritionDraft();renderToday()}});
}
function saveNutrition(){
 if(!localStorage.programStart){beginJourney();return}
 const log=captureNutritionDraft(),target=todayNutritionPrescription(prescriptionWeek(),sessionName()),meals=mealPlanForTarget(prescriptionWeek(),target),checkedCalories=(log.meals||[]).reduce((sum,id)=>sum+(meals.find(m=>m.id===id)?.kcal||0),0),prescribedCalories=meals.reduce((sum,m)=>sum+m.kcal,0),mealRatio=prescribedCalories?Math.min(1,checkedCalories/prescribedCalories):0;
 log.waterOz=Number($("waterActual")?.value)||0;
 log.saved=true;log.savedAt=new Date().toISOString();
 const rawCalories=val("actualCalories").trim(),rawProtein=val("actualProtein").trim(),rawCarbs=val("actualCarbs").trim(),rawFat=val("actualFat").trim(),enteredCalories=rawCalories===""?null:Number(rawCalories),enteredProtein=rawProtein===""?null:Number(rawProtein),enteredCarbs=rawCarbs===""?null:Number(rawCarbs),enteredFat=rawFat===""?null:Number(rawFat),hasManualDeviation=[rawCalories,rawProtein,rawCarbs,rawFat].some(Boolean);
 log.actualCalories=Number.isFinite(enteredCalories)&&enteredCalories>=0?enteredCalories:checkedCalories;
 const fullPrescription=(log.meals||[]).length===meals.length&&meals.every(m=>(log.meals||[]).includes(m.id));
 log.actualProtein=Number.isFinite(enteredProtein)&&enteredProtein>=0?enteredProtein:(fullPrescription?target.protein:null);
 log.actualCarbs=Number.isFinite(enteredCarbs)&&enteredCarbs>=0?enteredCarbs:(fullPrescription?target.carbs:null);
 log.actualFat=Number.isFinite(enteredFat)&&enteredFat>=0?enteredFat:(fullPrescription?target.fat:null);
 log.intakeSource=hasManualDeviation?"manual-deviation":"prescribed-meals";
 log.targetCalories=target.cal;log.targetProtein=target.protein;log.targetCarbs=target.carbs;log.targetFat=target.fat;log.prescribedMeals=meals.map(m=>({...m,foods:[...m.foods]}));log.prescriptionReason=target.adjustment?.copy||target.why;
 localStorage.setItem(nutritionLogKey(),JSON.stringify(log));setTask("nutrition",true);renderNutrition();renderToday()
}
function programWeekForDate(d){const a=new Date(programStart()),b=new Date(d);a.setHours(12,0,0,0);b.setHours(12,0,0,0);return Math.max(1,Math.min(56,Math.floor((b-a)/604800000)+1))}
function programDayIndex(d){const a=new Date(programStart()),b=new Date(d);a.setHours(12,0,0,0);b.setHours(12,0,0,0);const days=Math.floor((b-a)/86400000);return((days%7)+7)%7}
function checkinForDate(d){const k=dayKey(d);return logs().find(x=>dayKey(x.date)===k)||null}
function workoutForDate(d){const k=dayKey(d);return workouts().find(x=>dayKey(x.date)===k)||null}
function dateSession(d){
 const w=programWeekForDate(d),bl=blockForWeek(w),name=daysFor(bl)[programDayIndex(d)],work=workoutForDate(d),check=checkinForDate(d);
 const det=work?.prescription||adaptiveSessionFor(name,check,w);
 return{w,bl,name,det,work,check}
}
function dateState(d){const k=dayKey(d),check=!!checkinForDate(d),record=workoutForDate(d),status=record?.completed||"",work=status==="YES",failed=JSON.parse(localStorage.failedDays||"[]").includes(k);return{check,work,status,failed}}
function openDaySheet(d,tab="training"){const x=dateSession(d);window.selectedDay=new Date(d);$("daySheetKicker").textContent="WEEK "+x.w+" · "+x.bl.name.toUpperCase();$("daySheetTitle").textContent=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});$("daySheet").classList.remove("hidden");document.querySelectorAll(".day-tab").forEach(b=>b.classList.toggle("active",b.dataset.daytab===tab));renderDaySheetTab(tab)}
function nutritionHtmlForDate(d,x){
 const log=getNutritionLog(d),check=checkinForDate(d),n={...nutritionForWeek(x.w,x.name)},dec=check?.decision;
 let adjustment=null;
 if(Number(log.targetCalories)>0){n.cal=Number(log.targetCalories);if(Number(log.targetProtein)>=0)n.protein=Number(log.targetProtein);if(Number(log.targetCarbs)>=0)n.carbs=Number(log.targetCarbs);if(Number(log.targetFat)>=0)n.fat=Number(log.targetFat)}
 else if(dec?.c==="RED"){n.cal+=200;n.carbs+=50;adjustment={level:"red",title:"Recovery fueling override",copy:"This day’s saved readiness decision called for additional carbohydrate and a review of the energy deficit."}}
 else if(dec?.c==="YELLOW"){adjustment={level:"yellow",title:"Carbohydrate timing emphasis",copy:"This day’s saved readiness decision called for keeping intake near target while emphasizing carbohydrate around training."}}
 const meals=Array.isArray(log.prescribedMeals)&&log.prescribedMeals.length?log.prescribedMeals:mealPlanForTarget(x.w,n);
 const recorded=log.saved?'<div class="nutrition-note"><strong>Recorded intake</strong><p>'+(Number.isFinite(log.actualCalories)?Math.round(log.actualCalories).toLocaleString()+' kcal recorded. ':'')+'This is the intake saved for this date.</p></div>':'';
 return '<div class="nutrition-hero"><small>'+n.phase.toUpperCase()+'</small><strong>≈ '+n.cal.toLocaleString()+' kcal</strong><p>'+(log.prescriptionReason||n.why)+'</p></div><div class="macro-grid"><div><span>Protein</span><strong>'+n.protein+' g</strong></div><div><span>Carbs</span><strong>'+n.carbs+' g</strong></div><div><span>Fat</span><strong>'+n.fat+' g</strong></div></div>'+(adjustment?'<div class="nutrition-adjustment '+adjustment.level+'"><strong>'+adjustment.title+'</strong><span>'+adjustment.copy+'</span></div>':'')+'<div class="calendar-meal-plan">'+meals.map(m=>'<div><small>'+m.kcal+' KCAL</small><strong>'+m.name+'</strong><p>'+m.foods.join(" · ")+'</p></div>').join("")+'</div>'+recorded+'<div class="nutrition-note"><strong>Adaptive rule</strong><p>Readiness and body-weight trend override an aggressive deficit when recovery or performance deteriorates.</p></div>'
}
function renderDaySheetTab(tab){
 const d=window.selectedDay||new Date(),x=dateSession(d),state=dateState(d);
 if(tab==="nutrition"){
   $("daySheetBody").innerHTML=nutritionHtmlForDate(d,x)+(dayKey(d)===todayKey()?'<button class="nutrition-complete" id="nutritionCompleteBtn">'+(getNutritionLog().saved?"✓ Intake saved":"Open today’s nutrition log")+'</button>':"");
   if($("nutritionCompleteBtn"))$("nutritionCompleteBtn").onclick=()=>{$("daySheet").classList.add("hidden");switchTab("nutrition")};return
 }
 const trainingLabel=state.status==="YES"?'<span class="done">✓ Training complete</span>':state.status==="PARTIAL"?'<span>◐ Partial session</span>':state.status==="NO"?'<span class="failed">× Session skipped</span>':'<span>○ Training</span>';
 $("daySheetBody").innerHTML='<div class="day-status-line"><span class="'+(state.check?"done":"")+'">'+(state.check?"✓":"○")+' Check-in</span>'+trainingLabel+(state.failed?'<span class="failed">× Missed day</span>':'')+'</div>'+actualWorkSummary(x.work)+'<div class="day-training-hero"><small>'+x.det.type.toUpperCase()+'</small><h3>'+x.det.title+'</h3><p>'+x.det.why+'</p></div><div class="day-exercises">'+x.det.steps.map((e,i)=>'<button data-dayex="'+i+'"><b>'+(i+1)+'</b><div><strong>'+e.name+'</strong><small>'+e.dose+' · '+e.rest+'</small></div><span>›</span></button>').join("")+'</div>';
 $("daySheetBody").querySelectorAll("[data-dayex]").forEach(b=>b.onclick=()=>openExercise(x.det.steps[+b.dataset.dayex]))
}
function renderJourney(){
 const start=new Date(programStart()),months=[];start.setHours(12,0,0,0);
 for(let w=1;w<=56;w++){const d=new Date(start);d.setDate(d.getDate()+(w-1)*7);const key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");let m=months.find(x=>x.key===key);if(!m){m={key,date:new Date(d.getFullYear(),d.getMonth(),1),weeks:[],phases:new Set()};months.push(m)}m.weeks.push(w);m.phases.add(macroForWeek(w).name)}
 $("journeySummary").textContent=localStorage.programStart?"From "+start.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"})+" through 56 weeks of progressive training.":"Preview only — Day 1 has not been set.";
 $("journeyPhaseMap").innerHTML='<div class="journey-rail">'+macroPhases.map(p=>'<i style="--grow:'+(p[2]-p[1]+1)+';background:'+phasePalette[p[0]]+'"></i>').join("")+'</div><div class="journey-phase-list">'+macroPhases.map((p,i)=>{const active=currentWeek()>=p[1]&&currentWeek()<=p[2],qualified=phaseExitQualified({name:p[0],start:p[1],end:p[2],focus:p[3]});return '<button class="journey-phase-card '+(active?"active ":"")+(qualified?"qualified":"")+'" data-phaseweek="'+p[1]+'"><span class="phase-dot" style="background:'+phasePalette[p[0]]+'"></span><div><small>PHASE '+(i+1)+' · WEEKS '+p[1]+'–'+p[2]+'</small><strong>'+p[0]+'</strong><p>'+p[3]+'</p></div><b>'+(qualified?"✓":active?"NOW":"›")+'</b></button>'}).join("")+'</div>';$("journeyPhaseMap").querySelectorAll(".journey-phase-card").forEach(b=>b.onclick=()=>{viewedWeek=+b.dataset.phaseweek;document.querySelector('[data-calview="week"]').click();renderWeek()});
 $("journeyTimeline").innerHTML=months.map((m,i)=>{const first=m.weeks[0],last=m.weeks.at(-1),phase=[...m.phases],done=workouts().filter(x=>x.week>=first&&x.week<=last&&x.completed==="YES").length,total=(last-first+1)*7,pct=Math.min(100,Math.round(done/total*100));return'<button class="journey-month" data-week="'+first+'"><div class="journey-month-num">'+String(i+1).padStart(2,"0")+'</div><div class="journey-month-copy"><small>'+m.date.toLocaleDateString(undefined,{month:"long",year:"numeric"}).toUpperCase()+'</small><strong>Weeks '+first+'–'+last+'</strong><span>'+phase.join(" → ")+'</span><div class="journey-phase-bars">'+phase.map(p=>'<i style="background:'+phasePalette[p]+'"></i>').join("")+'</div></div><div class="journey-month-progress"><b>'+pct+'%</b><span>complete</span></div></button>'}).join("");
 $("journeyTimeline").querySelectorAll(".journey-month").forEach(b=>b.onclick=()=>{viewedWeek=+b.dataset.week;document.querySelector('[data-calview="week"]').click();renderWeek()});
}
function openMobilityGuide(){
 const det=makeSession(sessionName()),dur=det.steps.filter(e=>/mobility|tibialis|soleus|calf|trunk|core/i.test(e.name));
 const work=dur.length?dur:[ex("Ankle mobility","2 × 8–10 each side","—","Controlled pain-free knee-over-toe movement.","Mobility"),ex("Tibialis raises","3 × 15–20","60 sec","Control the full range.","Durability"),ex("Eccentric calf raise","2 × 12 each side","60 sec","Lower slowly and remain pain-free.","Durability"),ex("Hip mobility","5 min","—","Gentle controlled movement.","Mobility")];
 $("modalTitle").textContent="Mobility & Prehab";$("modalContent").innerHTML='<div class="mobility-guide"><p>Today’s durability work should leave you better prepared, not fatigued.</p>'+work.map((e,i)=>'<button data-mob="'+i+'"><b>'+(i+1)+'</b><div><strong>'+e.name+'</strong><small>'+e.dose+'</small></div><span>›</span></button>').join("")+'</div>';$("infoModal").classList.remove("hidden");$("modalContent").querySelectorAll("[data-mob]").forEach(b=>b.onclick=()=>openExercise(work[+b.dataset.mob]));
}
function renderMonth(){const base=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth(),1,12),year=base.getFullYear(),month=base.getMonth();$("monthTitle").textContent=base.toLocaleDateString(undefined,{month:"long",year:"numeric"});const first=(base.getDay()+6)%7,last=new Date(year,month+1,0).getDate(),cells=[];for(let i=0;i<first;i++)cells.push('<div class="month-cell empty"></div>');for(let day=1;day<=last;day++){const d=new Date(year,month,day,12),afterStart=!localStorage.programStart||d>=new Date(programStart()),w=programWeekForDate(d),macro=macroForWeek(w),state=dateState(d),today=d.toDateString()===new Date().toDateString(),future=d>new Date();cells.push('<button class="month-cell '+(today?"today ":"")+(state.check&&state.work?"complete ":"")+(state.failed?"failed ":"")+(future?"future ":"")+'" data-date="'+d.toISOString()+'" '+(!afterStart?"disabled":"")+'><span>'+day+'</span><i style="background:'+phasePalette[macro.name]+'"></i></button>')} $("monthGrid").innerHTML=cells.join("");$("monthLegend").innerHTML=macroPhases.map(x=>'<span><i style="background:'+phasePalette[x[0]]+'"></i>'+x[0]+'</span>').join("");$("monthGrid").querySelectorAll("[data-date]").forEach(b=>b.onclick=()=>openDaySheet(new Date(b.dataset.date)))}
function renderWeek(){const w=viewedWeek,bl=blockForWeek(w),wt=weekTarget(w),days=daysFor(bl),st=dateFor(w,0),en=dateFor(w,6);$("weekTitle").textContent="Week "+w;$("weekRange").textContent=st.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" – "+en.toLocaleDateString(undefined,{month:"short",day:"numeric"});$("weekSummary").innerHTML='<div class="week-card"><div class="week-overview"><small>'+bl.name.toUpperCase()+' · '+wt.weekType+'</small><strong>'+bl.focus+'</strong><p>Run: '+wt.run+' · C2: '+wt.row+' · Ruck: '+(wt.ruck||"none")+'</p></div>'+days.map((name,i)=>{const date=dateFor(w,i),det=dateSession(date).det,is=date.toDateString()===todayKey(),state=dateState(date);return'<div class="day-row '+(state.check&&state.work?"done ":"")+(state.failed?"failed ":"")+(is?"today-row":"")+'"><button class="day-button" data-i="'+i+'"><div class="day-date"><strong>'+date.toLocaleDateString(undefined,{weekday:"short"})+'</strong><small>'+date.getDate()+'</small></div><span class="day-state">'+(state.failed?"×":state.status==="PARTIAL"?"◐":state.status==="NO"?"×":state.check&&state.work?"✓":"○")+'</span><div class="day-desc"><strong>'+det.title+'</strong><small>'+det.type+' · '+det.effort+'</small></div><span class="day-chevron">›</span></button></div>'}).join("")+'</div>';$("weekSummary").querySelectorAll(".day-button").forEach(btn=>btn.onclick=()=>openDaySheet(dateFor(w,+btn.dataset.i)))}
function phaseComplete(bl){const hs=workouts().filter(x=>x.week>=bl.start&&x.week<=bl.end&&x.completed==="YES"),total=(bl.end-bl.start+1)*7,done=new Set(hs.map(x=>new Date(x.date).toDateString())).size;return{done,total,pct:Math.min(100,Math.round(done/total*100))}}
const macroPhases=[["Foundation",1,16,"Lose excess body fat, rebuild the aerobic base, establish strength consistency and prepare tissues for impact."],["Engine + Load",17,32,"Build running speed, threshold capacity and loaded-walking durability."],["Specificity",33,44,"Shift resources toward selection-specific running, bodyweight performance and loaded movement."],["Peak Work Capacity",45,52,"Demonstrate high accumulated workload without localized bone pain or mechanical breakdown."],["Taper",53,56,"Dissipate fatigue, retain key qualities and arrive healthy."]];
function getBenchmarks(){try{return JSON.parse(localStorage.benchmarks||"{}")}catch(e){return{}}}
function parseClock(v){if(!v)return null;const p=String(v).trim().split(":").map(Number);if(p.some(x=>!Number.isFinite(x)))return null;return p.length===2?p[0]*60+p[1]:Number(v)}
function saveBenchmarkData(){
 const b={pushups:num("benchPushups"),pullups:num("benchPullups"),situps:num("benchSitups"),run4:val("benchRun4"),ruckMiles:num("benchRuckMiles"),ruckWeight:num("benchRuckWeight"),ruckComfortable:val("benchRuckComfortable"),bodyFat:num("benchBodyFat"),peakPainFree:val("benchPeakPainFree"),updatedAt:new Date().toISOString()};
 localStorage.benchmarks=JSON.stringify(b);$("benchmarkSheet").classList.add("hidden");renderProgram();
}
function loadBenchmarkForm(){const b=getBenchmarks();const pairs={benchPushups:b.pushups,benchPullups:b.pullups,benchSitups:b.situps,benchRun4:b.run4,benchRuckMiles:b.ruckMiles,benchRuckWeight:b.ruckWeight,benchRuckComfortable:b.ruckComfortable,benchBodyFat:b.bodyFat,benchPeakPainFree:b.peakPainFree};Object.entries(pairs).forEach(([id,v])=>{if($(id))$(id).value=v??""})}
function macroForWeek(w){const x=macroPhases.find(p=>w>=p[1]&&w<=p[2])||macroPhases[0];return{name:x[0],start:x[1],end:x[2],focus:x[3]}}
function macroStats(p){const start=localStorage.programStart?new Date(localStorage.programStart):null,ls=logs().filter(x=>x.week>=p.start&&x.week<=p.end&&!x.preJourney&&(!start||new Date(x.date)>=start||dayKey(x.date)===dayKey(start))),ws=workouts().filter(x=>x.week>=p.start&&x.week<=p.end&&x.completed==="YES"),failed=JSON.parse(localStorage.failedDays||"[]").filter(k=>{const w=programWeekForDate(new Date(k));return w>=p.start&&w<=p.end}).length,checkKeys=new Set(ls.map(x=>dayKey(x.date))),completeKeys=new Set(ws.filter(w=>checkKeys.has(dayKey(w.date))).map(x=>dayKey(x.date))),total=(p.end-p.start+1)*7;return{checkins:checkKeys.size,strength:ws.filter(x=>/strength|carry/i.test(x.session||"")).length,aerobic:ws.filter(x=>/run|row|aerobic|recovery|quality|medium/i.test(x.session||"")).length,loaded:ws.filter(x=>/weighted-pack|ruck|carry|long/i.test(x.session||"")).length,completeDays:completeKeys.size,failed,total,mastery:Math.max(0,(completeKeys.size-failed*.5)/total)}}
function unresolvedInPhase(p){return missedDays().filter(d=>{const w=programWeekForDate(d);return w>=p.start&&w<=p.end}).length}
function objectiveSetsForPhase(p,stats,b){
 const runSec=parseClock(b.run4);
 const base=(name,done,progress,label)=>({name,done,progress:Math.max(0,Math.min(1,progress)),label});
 if(p.name==="Foundation")return[
  [base("Seven-day operating rhythm",stats.checkins>=7,stats.checkins/7,stats.checkins+"/7 check-ins"),base("Eight strength sessions",stats.strength>=8,stats.strength/8,stats.strength+"/8 strength"),base("Eight aerobic sessions",stats.aerobic>=8,stats.aerobic/8,stats.aerobic+"/8 aerobic"),base("Fourteen complete days",stats.completeDays>=14,stats.completeDays/14,stats.completeDays+"/14 complete days")],
  [base("Body fat under 18%",b.bodyFat!=null&&b.bodyFat<18,b.bodyFat==null?0:Math.min(1,28/Math.max(b.bodyFat,1)),"Current: "+(b.bodyFat??"—")+"%"),base("60 strict push-ups",(b.pushups||0)>=60,(b.pushups||0)/60,(b.pushups||0)+"/60"),base("12 strict pull-ups",(b.pullups||0)>=12,(b.pullups||0)/12,(b.pullups||0)+"/12"),base("No unresolved curriculum debt",unresolvedInPhase(p)===0,unresolvedInPhase(p)?0:1,unresolvedInPhase(p)+" unresolved")]
 ];
 if(p.name==="Engine + Load")return[
  [base("Twenty-eight complete days",stats.completeDays>=28,stats.completeDays/28,stats.completeDays+"/28 complete days"),base("Twelve loaded-work sessions",stats.loaded>=12,stats.loaded/12,stats.loaded+"/12 loaded"),base("Sixteen aerobic sessions",stats.aerobic>=16,stats.aerobic/16,stats.aerobic+"/16 aerobic"),base("No unresolved curriculum debt",unresolvedInPhase(p)===0,unresolvedInPhase(p)?0:1,unresolvedInPhase(p)+" unresolved")],
  [base("4 miles under 24:00",runSec!=null&&runSec<1440,runSec==null?0:Math.min(1,1440/runSec),b.run4||"Not tested"),base("12 miles with 30 lb",(b.ruckMiles||0)>=12&&(b.ruckWeight||0)>=30,Math.min((b.ruckMiles||0)/12,(b.ruckWeight||0)/30),(b.ruckMiles||0)+" mi · "+(b.ruckWeight||0)+" lb"),base("Loaded walk feels comfortable",b.ruckComfortable==="YES",b.ruckComfortable==="YES"?1:0,b.ruckComfortable==="YES"?"Qualified":"Not yet"),base("Phase mastery ≥75%",stats.mastery>=.75,stats.mastery/.75,Math.round(stats.mastery*100)+"% mastery")]
 ];
 if(p.name==="Specificity")return[
  [base("80 strict push-ups",(b.pushups||0)>=80,(b.pushups||0)/80,(b.pushups||0)+"/80"),base("15 strict pull-ups",(b.pullups||0)>=15,(b.pullups||0)/15,(b.pullups||0)+"/15"),base("70 sit-ups",(b.situps||0)>=70,(b.situps||0)/70,(b.situps||0)+"/70"),base("Phase mastery ≥75%",stats.mastery>=.75,stats.mastery/.75,Math.round(stats.mastery*100)+"% mastery")],
  [base("100 strict push-ups",(b.pushups||0)>=100,(b.pushups||0)/100,(b.pushups||0)+"/100"),base("20 strict pull-ups",(b.pullups||0)>=20,(b.pullups||0)/20,(b.pullups||0)+"/20"),base("90 sit-ups",(b.situps||0)>=90,(b.situps||0)/90,(b.situps||0)+"/90"),base("4 miles in 22:00 or faster",runSec!=null&&runSec<=1320,runSec==null?0:Math.min(1,1320/runSec),b.run4||"Not tested")]
 ];
 if(p.name==="Peak Work Capacity")return[
  [base("Fourteen complete phase days",stats.completeDays>=14,stats.completeDays/14,stats.completeDays+"/14 complete"),base("Eight loaded/endurance sessions",stats.loaded>=8,stats.loaded/8,stats.loaded+"/8 loaded"),base("Phase mastery ≥75%",stats.mastery>=.75,stats.mastery/.75,Math.round(stats.mastery*100)+"% mastery"),base("No unresolved curriculum debt",unresolvedInPhase(p)===0,unresolvedInPhase(p)?0:1,unresolvedInPhase(p)+" unresolved")],
  [base("Peak simulation completed pain-free",b.peakPainFree==="YES",b.peakPainFree==="YES"?1:0,b.peakPainFree==="YES"?"Qualified":"Not yet"),base("100 strict push-ups",(b.pushups||0)>=100,(b.pushups||0)/100,(b.pushups||0)+"/100"),base("20 strict pull-ups",(b.pullups||0)>=20,(b.pullups||0)/20,(b.pullups||0)+"/20"),base("4 miles ≤22:00",runSec!=null&&runSec<=1320,runSec==null?0:Math.min(1,1320/runSec),b.run4||"Not tested")]
 ];
 return[
  [base("Taper adherence",stats.completeDays>=14,stats.completeDays/14,stats.completeDays+"/14 complete"),base("No unresolved curriculum debt",unresolvedInPhase(p)===0,unresolvedInPhase(p)?0:1,unresolvedInPhase(p)+" unresolved"),base("Peak durability remains pain-free",b.peakPainFree==="YES",b.peakPainFree==="YES"?1:0,b.peakPainFree==="YES"?"Qualified":"Not yet"),base("Maintain selection benchmark",runSec!=null&&runSec<=1320&&(b.pushups||0)>=100&&(b.pullups||0)>=20,Math.min(runSec?1320/runSec:0,(b.pushups||0)/100,(b.pullups||0)/20),"Run + bodyweight standards")],
  [base("Arrive with no red mechanical flag",!todayCheckin()||todayCheckin().overall!=="RED",todayCheckin()?.overall==="RED"?0:1,todayCheckin()?.overall||"No red flag"),base("Nutrition intake saved",!!getNutritionLog().saved,getNutritionLog().saved?1:0,getNutritionLog().saved?"Saved":"Not saved"),base("Final check-in complete",!!todayCheckin(),todayCheckin()?1:0,todayCheckin()?"Complete":"Pending"),base("Program mastery ≥80%",stats.mastery>=.8,stats.mastery/.8,Math.round(stats.mastery*100)+"% mastery")]
 ];
}
function phaseExitQualified(p){const sets=objectiveSetsForPhase(p,macroStats(p),getBenchmarks());return sets.every(set=>set.every(o=>o.done))}
function promotionGate(p){const s=macroStats(p);return{passed:phaseExitQualified(p)&&unresolvedInPhase(p)===0,stats:s}}
function prescriptionWeek(){const cw=currentWeek();for(const x of macroPhases){const p={name:x[0],start:x[1],end:x[2],focus:x[3]};if(p.end<cw&&!promotionGate(p).passed)return p.end}return cw}
function renderProgram(){
 const earned=prescriptionWeek(),calendar=currentWeek(),cur=macroForWeek(earned),stats=macroStats(cur),b=getBenchmarks(),sets=objectiveSetsForPhase(cur,stats,b);let setIndex=sets.findIndex(set=>!set.every(o=>o.done));if(setIndex<0)setIndex=sets.length-1;const shown=sets[setIndex],completedShown=shown.filter(o=>o.done).length,pc=Math.round(stats.mastery*100);
 $("currentPhaseCard").innerHTML=(earned<calendar?'<div class="phase-lock"><strong>Phase promotion locked</strong><span>Meet the exit qualification and clear unresolved days before the prescription advances.</span></div>':"")+'<div class="phase-feature-top"><div><small>PHASE '+(macroPhases.findIndex(x=>x[0]===cur.name)+1)+' OF '+macroPhases.length+'</small><h2>'+cur.name+'</h2><p>Weeks '+cur.start+'–'+cur.end+'<br>'+cur.focus+'</p></div><div class="xp-chip">SET '+(setIndex+1)+'/'+sets.length+'</div></div><div class="phase-progress-box"><div class="phase-ring" style="--p:'+pc+'"><span>'+pc+'%</span></div><div class="phase-progress-copy"><strong>'+stats.completeDays+' complete days</strong><small>'+stats.failed+' failed · '+missedDays().length+' unresolved</small><div class="progress-bar"><i style="width:'+pc+'%"></i></div></div></div>';
 $("objectiveMeta").innerHTML='<strong>Qualification Set '+(setIndex+1)+'</strong><span>'+(setIndex===sets.length-1?"Exit standards — earn progression.":"Complete all four to unlock the next standards.")+'</span>';
 $("milestoneCount").textContent=completedShown+"/"+shown.length;
 $("phaseMilestones").innerHTML=shown.map((o,i)=>'<div class="milestone quest '+(o.done?"done":"")+'"><span class="milestone-state">'+(o.done?"✓":i+1)+'</span><div><strong>'+o.name+'</strong><small>'+o.label+'</small><div class="quest-progress"><i style="width:'+Math.round(o.progress*100)+'%"></i></div></div><b>'+(o.done?"QUALIFIED":Math.round(o.progress*100)+"%")+'</b></div>').join("");
 $("programBlocks").innerHTML=macroPhases.map((x,i)=>{const p={name:x[0],start:x[1],end:x[2],focus:x[3]},st=macroStats(p),active=cur.name===p.name,qualified=phaseExitQualified(p);return'<div class="phase-card '+(active?"current ":"")+(qualified?"qualified":"")+'"><span class="phase-num">'+(qualified?"✓":i+1)+'</span><div><strong>'+p.name+'</strong><small>Weeks '+p.start+'–'+p.end+'</small></div><span class="phase-pct">'+(qualified?"Qualified":Math.round(st.mastery*100)+"%")+'</span></div>'}).join("");
}
function draw(id,a){const c=$(id),ctx=c.getContext("2d"),w=c.clientWidth||320,h=160,d=devicePixelRatio||1;c.width=w*d;c.height=h*d;ctx.scale(d,d);ctx.clearRect(0,0,w,h);if(a.length<2){ctx.fillStyle="#8fa8bd";ctx.font="12px -apple-system, BlinkMacSystemFont, sans-serif";ctx.fillText("Save more check-ins to build this trend.",10,80);return}const mn=Math.min(...a),mx=Math.max(...a),sp=mx-mn||1,p=12;ctx.strokeStyle="#1794ff";ctx.lineWidth=2.5;ctx.beginPath();a.forEach((v,i)=>{const x=p+i*(w-2*p)/(a.length-1),y=h-p-(v-mn)*(h-2*p)/sp;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}
function setTrendState(canvasId,count,message){
 const canvas=$(canvasId),card=canvas.parentElement,empty=count<2;
 card.classList.toggle("trend-empty-card",empty);card.dataset.empty=message;canvas.style.display=empty?"none":"block";
}
function renderTrends(){
 const l=logs().slice(0,28).reverse(),map={RED:30,YELLOW:65,GREEN:90},wt=l.filter(x=>Number.isFinite(x.weight)).map(x=>x.weight);
 $("trendRecovery").textContent=l.length?l.length+" check-in"+(l.length===1?"":"s"):"No data";$("trendWeight").textContent=wt.length?wt.at(-1).toFixed(1)+" lb":"No data";
 setTrendState("recoveryChart",l.length,l.length===1?"One check-in saved. Add one more morning check-in to begin the recovery trend.":"Complete two morning check-ins to begin the recovery trend.");
 setTrendState("weightChart",wt.length,wt.length===1?"One weigh-in saved. Add one more to begin the body-weight trend.":"Save two body-weight entries to begin the trend.");
 requestAnimationFrame(()=>{if(l.length>=2)draw("recoveryChart",l.map(x=>x.score||map[x.overall]||50));if(wt.length>=2)draw("weightChart",wt)});
 const a=[...logs().map(x=>({...x,k:"Check-in"})),...workouts().map(x=>({...x,k:"Session"}))].sort((x,y)=>new Date(y.date)-new Date(x.date)).slice(0,8);
 $("trendLogList").innerHTML=a.length?a.map(x=>'<div class="log-card"><div><strong>'+(x.k==="Session"?x.session:"Morning check-in")+'</strong><small>'+new Date(x.date).toLocaleDateString()+(Number.isInteger(x.week)?' · Week '+x.week:'')+'</small></div><small>'+(x.k==="Session"?(x.completed||""):(x.overall||""))+'</small></div>').join(""):'<div class="log-card"><small>No activity saved yet.</small></div>';countRecords()
}
function openCheckin(){resetHistorical();$("checkinSheet").classList.remove("hidden");requiredFields();bindInfo($("checkinSheet"))}function closeCheckin(){resetHistorical();$("checkinSheet").classList.add("hidden")}function closeModal(){$("infoModal").classList.add("hidden")}function bindInfo(root){(root||document).querySelectorAll(".info-dot[data-term]").forEach(b=>b.onclick=e=>{e.stopPropagation();openInfo(b.dataset.term)})}
function resetViewport(){document.documentElement.scrollTop=0;document.body.scrollTop=0;window.scrollTo(0,0)}
function switchTab(t){
 $("headerAction").style.display=t==="today"?"grid":"none";document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(t).classList.add("active");document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.target===t));
 const titles={today:"Today",workout:"Train",week:"Calendar",nutrition:"Nutrition",program:"Program",trends:"Insights"};$("pageTitle").textContent=titles[t]||t;
 $("todayDate").textContent=t==="today"?new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}):"";resetViewport();
 if(t==="workout")renderTrain();if(t==="week")renderWeek();if(t==="nutrition")renderNutrition();if(t==="trends")renderTrends();if(t==="program")renderProgram();
}
function renderAll(){applyBaselines();renderMissedBanner();renderToday();renderTrain();renderWeek();renderMonth();renderJourney();renderNutrition();renderTrends();renderProgram();requiredFields();bindInfo(document)}
function handleTaskToggle(key){
 if(key!=="checkin"&&!localStorage.programStart){beginJourney();return}
 if(key==="checkin"){if(todayCheckin())return;openCheckin();return}
 if(key==="workout"){switchTab("workout");if(!todayWorkout()){requestAnimationFrame(()=>{ $("sessionFeedback").open=true;$("sessionFeedback").scrollIntoView({behavior:"smooth",block:"center"});$("completed").value="YES" })}return}
 if(key==="nutrition"){switchTab("nutrition");return}
 if(key==="mobility"){setTask("mobility",!taskDone("mobility"));renderToday();return}
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.target));
$("headerAction").onclick=()=>switchTab("week");
$("todayProgressCard").onclick=()=>switchTab("program");
$("beginJourneyBtn").onclick=beginJourney;
$("readinessCard").onclick=e=>{if(!e.target.closest(".info-dot"))openReadiness()};
$("readinessCard").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openReadiness()}};
$("readinessClose").onclick=()=>$("readinessSheet").classList.add("hidden");
$("readinessSheet").onclick=e=>{if(e.target===$("readinessSheet"))$("readinessSheet").classList.add("hidden")};

document.querySelectorAll(".task-toggle").forEach(b=>b.onclick=e=>{e.stopPropagation();handleTaskToggle(b.dataset.task)});
document.querySelectorAll(".task-main").forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==="checkin")openCheckin();if(a==="workout")switchTab("workout");if(a==="nutrition")switchTab("nutrition");if(a==="mobility")openMobilityGuide()});
$("closeCheckin").onclick=closeCheckin;$("checkinSheet").onclick=e=>{if(e.target===$("checkinSheet"))closeCheckin()};
$("evaluateBtn").onclick=evaluate;$("saveBtn").onclick=saveCheckin;
$("completeWorkoutQuick").onclick=()=>{if(todayWorkout())return;$("sessionFeedback").open=true;$("sessionFeedback").scrollIntoView({behavior:"smooth",block:"center"});$("completed").value="YES";};$("completeWorkout").onclick=()=>saveWorkout(val("completed")||"YES");
$("modalClose").onclick=closeModal;$("modalDone").onclick=closeModal;$("infoModal").onclick=e=>{if(e.target===$("infoModal"))closeModal()};
document.querySelectorAll(".calendar-mode-btn").forEach(b=>b.onclick=()=>{document.querySelectorAll(".calendar-mode-btn").forEach(x=>x.classList.toggle("active",x===b));$("weekView").classList.toggle("hidden",b.dataset.calview!=="week");$("monthView").classList.toggle("hidden",b.dataset.calview!=="month");$("journeyView").classList.toggle("hidden",b.dataset.calview!=="journey");if(b.dataset.calview==="month")renderMonth();if(b.dataset.calview==="journey")renderJourney();resetViewport()});
$("prevMonth").onclick=()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()-1,1);renderMonth()};$("nextMonth").onclick=()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()+1,1);renderMonth()};
$("daySheetClose").onclick=()=>$("daySheet").classList.add("hidden");$("daySheet").onclick=e=>{if(e.target===$("daySheet"))$("daySheet").classList.add("hidden")};
document.querySelectorAll(".day-tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".day-tab").forEach(x=>x.classList.toggle("active",x===b));renderDaySheetTab(b.dataset.daytab)});
$("prevWeek").onclick=()=>{viewedWeek=Math.max(1,viewedWeek-1);renderWeek()};$("nextWeek").onclick=()=>{viewedWeek=Math.min(56,viewedWeek+1);renderWeek()};
if($("librarySearch"))$("librarySearch").addEventListener("input",e=>renderLibrary(e.target.value));
document.querySelectorAll(".segment").forEach(b=>b.onclick=()=>{document.querySelectorAll(".segment").forEach(x=>x.classList.toggle("active",x===b));$("trainSessionView").classList.toggle("hidden",b.dataset.trainview!=="session");$("trainLibraryView").classList.toggle("hidden",b.dataset.trainview!=="library");resetViewport()});
$("saveNutritionDay").onclick=saveNutrition;
$("openBenchmarks").onclick=()=>{loadBenchmarkForm();$("benchmarkSheet").classList.remove("hidden")};$("benchmarkClose").onclick=()=>$("benchmarkSheet").classList.add("hidden");$("benchmarkSheet").onclick=e=>{if(e.target===$("benchmarkSheet"))$("benchmarkSheet").classList.add("hidden")};$("saveBenchmarks").onclick=saveBenchmarkData;$("openTrends").onclick=()=>switchTab("trends");
["hrv","rhr","sleep","sleepQ","fatigue","grip","load","pain","performance","weight"].forEach(id=>{const v=localStorage.getItem("input_"+id);if(v!==null)$(id).value=v;$(id).addEventListener("input",requiredFields);$(id).addEventListener("change",requiredFields)});$("focal").checked=localStorage.input_focal==="1";$("gait").checked=localStorage.input_gait==="1";
// Remember unfinished entries without changing a confirmed readiness/session decision.
["hrv","rhr","sleep","sleepQ","fatigue","grip","load","pain","performance","weight","focal","gait"].forEach(id=>{
 const field=$(id),remember=()=>{if(!historicalDate)localStorage.setItem("input_"+id,field.type==="checkbox"?(field.checked?"1":"0"):field.value)};
 field.addEventListener("input",remember);field.addEventListener("change",remember);
});
function restoreSessionFeedback(){
 const saved=workouts().find(x=>dayKey(x.date)===todayKey());
 const fields={sessionRPE:"rpe",sessionDuration:"duration",postPain:"postPain",sessionRunMiles:"runMiles",sessionRuckMiles:"ruckMiles",sessionRowMinutes:"rowMinutes",sessionPackWeight:"packWeight",completed:"completed",sessionNote:"note"};
 for(const [id,property] of Object.entries(fields)){
  const draft=localStorage.getItem("input_session_"+todayKey()+"_"+id);
  $(id).value=draft!==null?draft:String(saved?.[property]??"");
 }
}
restoreSessionFeedback();
["sessionRPE","sessionDuration","postPain","sessionRunMiles","sessionRuckMiles","sessionRowMinutes","sessionPackWeight","completed","sessionNote"].forEach(id=>{
 const field=$(id),key=()=>"input_session_"+todayKey()+"_"+id;
 const remember=()=>localStorage.setItem(key(),field.value);
 field.addEventListener("input",remember);field.addEventListener("change",remember);
});
const DB_NAME="AdaptiveLandPrepDB",STORE="kv";function openDB(){return new Promise((r,j)=>{const q=indexedDB.open(DB_NAME,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(STORE))q.result.createObjectStore(STORE)};q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)})}async function dbSet(k,v){try{const d=await openDB();d.transaction(STORE,"readwrite").objectStore(STORE).put(v,k)}catch(e){}}async function requestPersistence(){let p=false;try{p=await navigator.storage?.persisted?.()||await navigator.storage?.persist?.()}catch(e){}$("persistBadge").textContent=p?"Persistent":"On device";$("dbStatus").textContent=p?"Persistent storage granted":"Local database active; keep periodic backups"}function countRecords(){$("recordCount").textContent=(logs().length+workouts().length)+" records";$("lastBackup").textContent=localStorage.lastBackupAt?new Date(localStorage.lastBackupAt).toLocaleString():"Never"}const APP_STORAGE_KEYS=new Set(["trainingLogs","workoutHistory","programStart","baselineDate","failedDays","benchmarks","input_focal","input_gait"]);
function isAppStorageKey(k){return APP_STORAGE_KEYS.has(k)||k.startsWith("input_")||k.startsWith("task_")||k.startsWith("nutrition_")}
function collectBackupData(){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&isAppStorageKey(k))data[k]=localStorage.getItem(k)}return data}
function exportBackup(){const p={app:"Adaptive Land Prep",formatVersion:3,exportedAt:new Date().toISOString(),data:collectBackupData()},b=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="adaptive-land-prep-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);localStorage.lastBackupAt=p.exportedAt;countRecords()}
function validateBackup(o){
 const object=v=>v!==null&&typeof v==="object"&&!Array.isArray(v),date=v=>typeof v==="string"&&v.trim()!==""&&Number.isFinite(Date.parse(v));
 const fail=()=>{throw new Error("Invalid or unsupported backup")};
 if(!object(o)||o.app!=="Adaptive Land Prep"||!object(o.data)||![2,3].includes(o.formatVersion??2))fail();
 const data={};
 for(const [k,v] of Object.entries(o.data)){
  if(!isAppStorageKey(k))continue;
  if(typeof v!=="string")fail();
  if(k==="programStart"||k==="baselineDate"){if(!date(v))fail()}
  else if(k==="trainingLogs"||k==="workoutHistory"){
   const rows=JSON.parse(v);if(!Array.isArray(rows))fail();
   for(const r of rows){
    if(!object(r)||!date(r.date))fail();
    if(r.week!==undefined&&(!Number.isInteger(r.week)||r.week<1||r.week>56))fail();
    for(const field of ["weight","weightAvg","hrv","hrvBase","rhr","rhrBase","grip","gripBase","sleep","sleepQ","fatigue","load","pain","score","rpe","duration","postPain","runMiles","ruckMiles","rowMinutes","packWeight"]){if(r[field]!=null&&(typeof r[field]!=="number"||!Number.isFinite(r[field])))fail()}
    if(k==="workoutHistory"&&(typeof r.session!=="string"||!["YES","NO","PARTIAL"].includes(r.completed)))fail();
    if(r.overall!==undefined&&!["GREEN","YELLOW","RED"].includes(r.overall))fail();
    if(r.decision!=null){if(!object(r.decision)||!["GREEN","YELLOW","RED"].includes(r.decision.o))fail();for(const field of ["a","b","c"]){if(r.decision[field]!=null&&!["","GREEN","YELLOW","RED"].includes(r.decision[field]))fail()}}
   }
  }else if(k==="failedDays"){const days=JSON.parse(v);if(!Array.isArray(days)||!days.every(date))fail()}
  else if(k==="benchmarks"||k.startsWith("nutrition_")){
   const record=JSON.parse(v);if(!object(record))fail();
   if(k.startsWith("nutrition_")){
    if(record.meals!==undefined&&(!Array.isArray(record.meals)||!record.meals.every(x=>typeof x==="string")))fail();
    if(record.saved!==undefined&&typeof record.saved!=="boolean")fail();
    for(const field of ["waterOz","actualCalories","actualProtein","actualCarbs","actualFat","targetCalories","targetProtein","targetCarbs","targetFat"]){if(record[field]!=null&&(typeof record[field]!=="number"||!Number.isFinite(record[field])||record[field]<0))fail()}
   }
  }else if(k.startsWith("task_")||k==="input_focal"||k==="input_gait"){if(v!=="0"&&v!=="1")fail()}
  data[k]=v;
 }
 // An empty or unrelated file must never erase an existing journey.
 if(!Object.keys(data).length)fail();
 return {version:o.formatVersion??2,data};
}
async function importBackup(f){
 const backup=validateBackup(JSON.parse(await f.text())),previous=collectBackupData();
 try{
  // Write first so a quota failure cannot erase the existing history.
  for(const [k,v] of Object.entries(backup.data))localStorage.setItem(k,v);
  if(backup.version===3)for(const k of Object.keys(previous))if(!Object.hasOwn(backup.data,k))localStorage.removeItem(k);
 }catch(error){
  for(const k of Object.keys(backup.data))if(!Object.hasOwn(previous,k))localStorage.removeItem(k);
  for(const [k,v] of Object.entries(previous))localStorage.setItem(k,v);
  throw error;
 }
 await Promise.all([dbSet("trainingLogs",localStorage.trainingLogs||"[]"),dbSet("workoutHistory",localStorage.workoutHistory||"[]")]);
 location.reload();
}
$("exportBackup").onclick=exportBackup;$("importBackup").onchange=e=>e.target.files[0]&&importBackup(e.target.files[0]).catch(()=>alert("That backup could not be restored."));
migrateProductState();viewedWeek=currentWeek();viewedMonth=new Date(programStart());$("headerAction").innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/></svg>';$("headerAction").style.display="grid";renderAll();requestPersistence();if(!window.Capacitor?.isNativePlatform?.()&&"serviceWorker"in navigator)addEventListener("load",async()=>{try{const r=await navigator.serviceWorker.register("./service-worker.js");await r.update();navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!sessionStorage.swReloaded){sessionStorage.swReloaded="1";location.reload()}})}catch(e){console.info("Offline cache unavailable in this environment")}});
