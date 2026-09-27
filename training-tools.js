/* Recorded work is descriptive: no invented 1RM, lean-mass estimate or automatic load increase. */
function validExerciseSets(rows){
 return Array.isArray(rows)&&rows.length<=500&&rows.every(r=>r&&typeof r.name==='string'&&r.name.length<=120&&['kg','lb'].includes(r.unit)&&['reps','seconds','meters'].includes(r.measure)&&Number.isFinite(r.load)&&r.load>=0&&r.load<=2000&&Number.isFinite(r.work)&&r.work>0&&r.work<=10000);
}
function exerciseSetKey(){return 'input_exerciseSets_'+dayKey(dayDate())}
function recordedExerciseSets(){
 try{const raw=localStorage.getItem(exerciseSetKey());const rows=raw?JSON.parse(raw):(todayWorkoutRecord()?.exerciseSets||[]);return validExerciseSets(rows)?rows:[]}catch(e){return []}
}
function saveExerciseSets(rows){
 if(!validExerciseSets(rows))throw new Error('Invalid sets');
 const key=exerciseSetKey(),oldDraft=localStorage.getItem(key),history=workouts();
 const index=history.findIndex(w=>dayKey(w.date)===dayKey(dayDate()));
 // Completed/partial/skipped status and feedback are unchanged by a set correction.
 // Keep the draft and the saved session consistent, rolling back if history cannot save.
 localStorage.setItem(key,JSON.stringify(rows));
 if(index>=0){
  history[index]={...history[index],exerciseSets:rows};
  try{localStorage.setItem('workoutHistory',JSON.stringify(history))}
  catch(error){if(oldDraft===null)localStorage.removeItem(key);else localStorage.setItem(key,oldDraft);throw error}
  if(typeof dbSet==='function')dbSet('workoutHistory',localStorage.getItem('workoutHistory'));
 }
}
function exerciseMeasure(e){return /sec/.test(e.dose)?'seconds':/\bm\b|meters/.test(e.dose)?'meters':'reps'}
function priorExerciseSets(name){
 return workouts().filter(w=>w.completed!=='NO'&&dayKey(w.date)!==dayKey(dayDate())&&new Date(w.date)<dayDate()&&validExerciseSets(w.exerciseSets||[])).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(w=>({date:w.date,rows:(w.exerciseSets||[]).filter(r=>r.name===name)})).filter(w=>w.rows.length).slice(0,6);
}
function setDescription(r){return (r.load===0?'Bodyweight':r.load+' '+r.unit)+' × '+r.work+' '+r.measure}
function strengthNextStep(exercise,history,today,readiness){
 const dose=/^(\d+)\s*[×x]\s*(\d+)(?:[–-](\d+))?(?:\s*reps)?$/i.exec(exercise.dose||'');
 if(exercise.type!=='Strength'||!dose)return null;
 const count=Number(dose[1]),low=Number(dose[2]),high=Number(dose[3]||dose[2]);
 if(readiness!=='GREEN')return 'Use today’s adjusted prescription. Do not increase load on a modified day.';
 const sessions=history.filter(w=>new Date(w.date)<today&&w.exerciseSets?.some(r=>r.name===exercise.name)).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,2);
 if(!sessions.length)return 'Choose a manageable load for the prescribed repetitions and record each set. Keep the movement controlled; this is your starting reference.';
 const latest=sessions[0],rows=latest.exerciseSets.filter(r=>r.name===exercise.name);
 if(!validExerciseSets(rows)||rows.some(r=>r.measure!=='reps')||latest.completed!=='YES'||latest.postPain!==0)
  return 'Your last record does not establish a pain-free completed session. Follow today’s prescription without increasing load.';
 const load=rows[0].load,unit=rows[0].unit;
 if(rows.length!==count||rows.some(r=>r.load!==load||r.unit!==unit))return 'Keep today’s prescribed sets and repetitions. The previous work used a different set count or mixed loads, so it is not a like-for-like progression reference.';
 const oldDose=latest.prescription?.steps?.find(e=>e.name===exercise.name)?.dose;
 const age=(today-new Date(latest.date))/86400000;
 if(oldDose!==exercise.dose||age>21)return 'Re-establish the prescribed sets with a manageable load. The last comparable prescription is missing, changed, or more than three weeks old.';
 const prefix=load===0?'At bodyweight':'At '+load+' '+unit;
 if(rows.some(r=>r.work<low))return prefix+', repeat the prescribed range without increasing load. Reduce load if needed to complete controlled repetitions.';
 if(rows.some(r=>r.work<high))return prefix+', work toward '+high+' controlled repetitions per set, staying inside today’s prescribed range.';
 const cleanTwice=sessions.length===2&&sessions.every(w=>{
  const r=w.exerciseSets.filter(x=>x.name===exercise.name);
  return w.completed==='YES'&&w.postPain===0&&(today-new Date(w.date))/86400000<=21&&w.prescription?.steps?.find(e=>e.name===exercise.name)?.dose===exercise.dose&&
   validExerciseSets(r)&&r.length===count&&r.every(x=>x.measure==='reps'&&x.unit===unit&&x.load===load&&x.work>=high);
 });
 return prefix+', repeat '+high+' controlled repetitions per set. '+(cleanTwice?'You have reached the top of this range in two completed, pain-free sessions. Consider a small load increase only if technique and recovery remain good; the app has not raised the load.':'Build another comparable, pain-free session before considering more load.');
}
function trainingHistoryRows(limit=8){
 const grouped=new Map();
 workouts().filter(w=>w.completed!=='NO'&&Array.isArray(w.exerciseSets)&&w.exerciseSets.length&&validExerciseSets(w.exerciseSets)).sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(w=>{
  const session=new Map();
  w.exerciseSets.forEach(row=>{if(!session.has(row.name))session.set(row.name,[]);session.get(row.name).push(row)});
  for(const [name,rows] of session){if(!grouped.has(name))grouped.set(name,[]);grouped.get(name).push({date:w.date,rows})}
 });
 return [...grouped].map(([name,sessions])=>({name,sessions:sessions.slice(0,6)})).sort((a,b)=>new Date(b.sessions[0].date)-new Date(a.sessions[0].date)).slice(0,limit);
}
function renderTrainingTrends(){
 const host=$('trainingTrendList');if(!host)return;host.replaceChildren();
 const movements=trainingHistoryRows();
 if(!movements.length){const empty=document.createElement('div');empty.className='training-trend-empty';empty.textContent='Saved sets will appear here after your first strength, bodyweight, carry or durability session.';host.append(empty);return}
 const note=document.createElement('p');note.className='training-trend-note';note.textContent='Recorded work only. These comparisons do not estimate muscle gain and never increase your load automatically.';host.append(note);
 movements.forEach(item=>{
  const card=document.createElement('div');card.className='training-trend-card';
  const head=document.createElement('div'),title=document.createElement('strong'),count=document.createElement('small');title.textContent=item.name;count.textContent=item.sessions.length+' recorded session'+(item.sessions.length===1?'':'s');head.append(title,count);card.append(head);
  item.sessions.slice(0,2).forEach((session,index)=>{const row=document.createElement('p'),label=document.createElement('b'),text=document.createElement('span');label.textContent=index===0?'Latest':'Previous';text.textContent=new Date(session.date).toLocaleDateString()+' · '+session.rows.map(setDescription).join(' · ');row.append(label,text);card.append(row)});
  host.append(card);
 });
}
function renderTrainingRecords(steps){
 const host=$('trainingRecords');if(!host)return;host.replaceChildren();
 const eligible=steps.filter(e=>['Strength','Bodyweight','Core','Durability','Carry'].includes(e.type)&&!/^Mobility/.test(e.name));
 if(!eligible.length)return;
 const title=document.createElement('h3');title.textContent='Record your sets';host.append(title);
 const help=document.createElement('p');help.textContent='Record actual work. Use 0 for bodyweight; for dumbbells enter the weight of one dumbbell consistently. Sets save as you go. Corrections also update an already-saved session.';host.append(help);
 eligible.forEach(e=>{
  const details=document.createElement('details');details.className='set-record';
  const summary=document.createElement('summary');summary.textContent=e.name;details.append(summary);
  const instruction=document.createElement('p');instruction.textContent=e.dose+' · Rest '+e.rest;details.append(instruction);
  const nextStep=strengthNextStep(e,workouts(),dayDate(),typeof savedDecision==='function'?savedDecision()?.o:null);
  if(nextStep){const guidance=document.createElement('p');guidance.className='strength-next-step';guidance.textContent=nextStep;details.append(guidance)}
  const prior=priorExerciseSets(e.name);
  if(prior.length){const history=document.createElement('details');const heading=document.createElement('summary');heading.textContent='Previous sessions';history.append(heading);prior.forEach(w=>{const p=document.createElement('p');p.textContent=new Date(w.date).toLocaleDateString()+': '+w.rows.map(setDescription).join(' · ');history.append(p)});details.append(history)}
  const list=document.createElement('div');details.append(list);
  let editing=null;
  const paint=()=>{list.replaceChildren();let count=0;recordedExerciseSets().forEach((r,i)=>{if(r.name!==e.name)return;count++;const row=document.createElement('div');row.className='recorded-set';const span=document.createElement('span');span.textContent=count+'. '+setDescription(r);
   const actions=document.createElement('div');actions.className='set-actions';
   const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+e.name+' set '+count);edit.onclick=()=>{editing=i;load.value=r.load;unit.value=r.unit;work.value=r.work;add.textContent='Save correction';cancel.hidden=false;errorText.textContent='Editing set '+row.querySelector('span').textContent;load.focus()};
   const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+e.name+' set '+count);remove.onclick=()=>{try{saveExerciseSets(recordedExerciseSets().filter((_,index)=>index!==i));resetEdit();errorText.textContent='Set removed.';paint()}catch(error){errorText.textContent='Could not save. Your previous sets remain.'}};
   actions.append(edit,remove);row.append(span,actions);list.append(row)});summary.textContent=e.name+(count?' · '+count+' saved':'');repeat.hidden=count===0;};
  const form=document.createElement('form');form.className='set-entry';
  const load=document.createElement('input');load.type='number';load.min='0';load.max='2000';load.step='.1';load.inputMode='decimal';load.required=true;
  const unit=document.createElement('select');['lb','kg'].forEach(u=>{const option=document.createElement('option');option.value=u;option.textContent=u;unit.append(option)});unit.setAttribute('aria-label','Load unit');
  const work=document.createElement('input');work.type='number';work.min='1';work.max='10000';work.step='1';work.inputMode='numeric';work.required=true;
  const label=(text,input)=>{const l=document.createElement('label');const span=document.createElement('span');span.textContent=text;l.append(span,input);return l};
  const add=document.createElement('button');add.type='submit';add.textContent='Save set';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel edit';cancel.hidden=true;cancel.className='set-secondary';
  const resetEdit=()=>{editing=null;add.textContent='Save set';cancel.hidden=true};cancel.onclick=()=>{resetEdit();errorText.textContent='Correction cancelled. Saved sets are unchanged.'};
  const repeat=document.createElement('button');repeat.type='button';repeat.textContent='Repeat last set';repeat.className='set-secondary';
  repeat.onclick=()=>{const rows=recordedExerciseSets(),last=rows.filter(r=>r.name===e.name).at(-1);if(!last)return;try{saveExerciseSets([...rows,{...last}]);resetEdit();errorText.textContent='Repeated set saved.';paint()}catch(error){errorText.textContent='Could not save. Your previous sets remain.'}};
  const errorText=document.createElement('p');errorText.setAttribute('role','status');
  const last=recordedExerciseSets().filter(r=>r.name===e.name).at(-1)||prior[0]?.rows.at(-1);if(last){load.value=last.load;unit.value=last.unit;work.value=last.work}
  form.append(label('Load',load),label('Unit',unit),label(exerciseMeasure(e),work),add,cancel,repeat);
  form.onsubmit=event=>{event.preventDefault();const rows=recordedExerciseSets(),old=editing===null?null:rows[editing];const row={name:e.name,load:Number(load.value),unit:unit.value,work:Number(work.value),measure:old?.measure||exerciseMeasure(e)};try{if(editing===null)rows.push(row);else{if(old?.name!==e.name)throw Error('Set changed');rows[editing]=row}saveExerciseSets(rows);errorText.textContent=editing===null?'Set saved.':'Correction saved.';resetEdit();paint()}catch(error){errorText.textContent='Could not save this set. Check the values and available storage.'}};
  details.append(form,errorText);host.append(details);paint();
 });
}
function aerobicGuidance(e){
 if(!['Run','Row','Aerobic','Endurance'].includes(e.type))return '';
 const modality=e.type==='Run'?'run':'row';
 const low=Number(localStorage['input_'+modality+'EasyLow']),high=Number(localStorage['input_'+modality+'EasyHigh']);
 const calibrated=low>=40&&high>low&&high<=220;
 const quality=/quality|threshold/.test(e.name.toLowerCase());
 if(quality)return e.cue;
 const easy=/easy|aerobic|recovery|walk|main run|medium run/.test(e.name.toLowerCase());
 if(!easy)return e.cue;
 return (/run \/ walk/i.test(e.name)?'Easy run/walk, alternating as needed. ':'Steady easy work, not intervals. ')+(calibrated?'Your saved '+modality+' easy range: '+low+'–'+high+' bpm. ':'No measured '+modality+' heart-rate range saved yet. ')+'Keep breathing controlled and conversation comfortable; slow down if needed.';
}
function setupTrainingTargets(){
 for(const mode of ['run','row'])for(const end of ['Low','High']){const id=mode+'Easy'+end;$(id).value=localStorage['input_'+id]||''}
 $('saveTrainingTargets').onclick=()=>{
  const data={};for(const mode of ['run','row']){const a=$(mode+'EasyLow').value,b=$(mode+'EasyHigh').value;if((a||b)&&!(Number(a)>=40&&Number(b)>Number(a)&&Number(b)<=220)){$('trainingTargetStatus').textContent='Enter both ends of each measured range, with the upper value higher than the lower.';return}data['input_'+mode+'EasyLow']=a;data['input_'+mode+'EasyHigh']=b}
  const old=Object.fromEntries(Object.keys(data).map(k=>[k,localStorage.getItem(k)]));try{for(const [k,v] of Object.entries(data))localStorage.setItem(k,v);$('trainingTargetStatus').textContent='Training targets saved.';renderTrain()}catch(e){for(const [k,v] of Object.entries(old)){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}$('trainingTargetStatus').textContent='Could not save targets; previous values restored.'}
 };
}
