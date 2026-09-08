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
 localStorage.setItem(exerciseSetKey(),JSON.stringify(rows));
}
function exerciseMeasure(e){return /sec/.test(e.dose)?'seconds':/\bm\b|meters/.test(e.dose)?'meters':'reps'}
function priorExerciseSets(name){
 return workouts().filter(w=>w.completed!=='NO'&&dayKey(w.date)!==dayKey(dayDate())&&new Date(w.date)<dayDate()&&validExerciseSets(w.exerciseSets||[])).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(w=>({date:w.date,rows:(w.exerciseSets||[]).filter(r=>r.name===name)})).filter(w=>w.rows.length).slice(0,6);
}
function setDescription(r){return r.load+' '+r.unit+' × '+r.work+' '+r.measure}
function renderTrainingRecords(steps){
 const host=$('trainingRecords');if(!host)return;host.replaceChildren();
 const eligible=steps.filter(e=>['Strength','Bodyweight','Core','Durability','Carry'].includes(e.type)&&!/^Mobility/.test(e.name));
 if(!eligible.length)return;
 const title=document.createElement('h3');title.textContent='Record your sets';host.append(title);
 const help=document.createElement('p');help.textContent='Record actual work. Use 0 for bodyweight; for dumbbells enter the weight of one dumbbell consistently. Entries save on this device as you add them and join your session when you save it.';host.append(help);
 eligible.forEach(e=>{
  const details=document.createElement('details');details.className='set-record';
  const summary=document.createElement('summary');summary.textContent=e.name;details.append(summary);
  const instruction=document.createElement('p');instruction.textContent=e.dose+' · Rest '+e.rest;details.append(instruction);
  const prior=priorExerciseSets(e.name);
  if(prior.length){const history=document.createElement('details');const heading=document.createElement('summary');heading.textContent='Previous sessions';history.append(heading);prior.forEach(w=>{const p=document.createElement('p');p.textContent=new Date(w.date).toLocaleDateString()+': '+w.rows.map(setDescription).join(' · ');history.append(p)});details.append(history)}
  const list=document.createElement('div');details.append(list);
  const paint=()=>{list.replaceChildren();recordedExerciseSets().forEach((r,i)=>{if(r.name!==e.name)return;const row=document.createElement('div');row.className='recorded-set';const span=document.createElement('span');span.textContent=setDescription(r);const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+e.name+' set '+(i+1));remove.onclick=()=>{try{saveExerciseSets(recordedExerciseSets().filter((_,index)=>index!==i));paint()}catch(error){errorText.textContent='Could not save. Your previous sets remain.'}};row.append(span,remove);list.append(row)})};
  const form=document.createElement('form');form.className='set-entry';
  const load=document.createElement('input');load.type='number';load.min='0';load.max='2000';load.step='.1';load.inputMode='decimal';load.required=true;
  const unit=document.createElement('select');['lb','kg'].forEach(u=>{const option=document.createElement('option');option.value=u;option.textContent=u;unit.append(option)});unit.setAttribute('aria-label','Load unit');
  const work=document.createElement('input');work.type='number';work.min='1';work.max='10000';work.step='1';work.inputMode='numeric';work.required=true;
  const label=(text,input)=>{const l=document.createElement('label');const span=document.createElement('span');span.textContent=text;l.append(span,input);return l};
  const add=document.createElement('button');add.type='submit';add.textContent='Save set';
  const errorText=document.createElement('p');errorText.setAttribute('role','status');
  const last=recordedExerciseSets().filter(r=>r.name===e.name).at(-1)||prior[0]?.rows.at(-1);if(last){load.value=last.load;unit.value=last.unit;work.value=last.work}
  form.append(label('Load',load),label('Unit',unit),label(exerciseMeasure(e),work),add);
  form.onsubmit=event=>{event.preventDefault();const row={name:e.name,load:Number(load.value),unit:unit.value,work:Number(work.value),measure:exerciseMeasure(e)};try{saveExerciseSets([...recordedExerciseSets(),row]);errorText.textContent='Set saved.';paint()}catch(error){errorText.textContent='Could not save this set. Check the values and available storage.'}};
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
