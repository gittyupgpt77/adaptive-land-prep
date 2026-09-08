/* Legacy backup stays available until Firebase acknowledges this device's first copy. */
(()=>{
 'use strict';
 const el=id=>document.getElementById(id),panel=el('cloudPanel');
 const status=text=>{el('cloudStatus').textContent=text};
 const requested=new URLSearchParams(location.search).get('backup');
 if(requested==='firebase')localStorage.setItem('alp-backup-setup','firebase');
 const firebase=requested==='firebase'||(requested!=='legacy'&&(localStorage.getItem('alp-backup-provider')==='firebase'||localStorage.getItem('alp-backup-setup')==='firebase'));
 if((firebase&&!window.FirebaseSDK)||(!firebase&&!window.SupabaseSDK)){status('Cloud setup is unavailable. Your entries remain on this device.');return}
 const client=firebase?FirebaseSDK.createClient():SupabaseSDK.createClient('https://pfpfttgfzmpexlbezmcs.supabase.co','sb_publishable_K4UzvlOQXTgRbEUJWq7qpA_9p54dG8o',{
  auth:{storageKey:'alp-cloud-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
  global:{fetch:(url,options)=>fetch(url,{...options,cache:'no-store',signal:options?.signal||AbortSignal.timeout(20000)})}
 });
 let owner=null,busy=false,offset=0,generation=0,lastSaved=null;
 const bindingKey=firebase?'alp-firestore-device-owner':'alp-cloud-device-owner';
 const receiptKey=firebase?'alp-firestore-receipt':'alp-cloud-receipt';
 const assertCurrent=id=>{if(owner!==id)throw Error('Your account changed. Please try again.')};
 const store=firebase?client.makeStore(assertCurrent):null;
 el('cloudLegacy').classList.toggle('hidden',!firebase);
 el('cloudSetup').classList.toggle('hidden',firebase);
 const startFirebaseSetup=()=>{localStorage.setItem('alp-backup-setup','firebase');location.search='?backup=firebase'};
 el('cloudSetup').onclick=startFirebaseSetup;
 el('cloudAuth').querySelector('[type="submit"]').textContent=firebase?'Sign In to Firebase':'Sign In to Older Backup';
 el('cloudSignup').textContent=firebase?'Create Firebase Account':'Set Up Firebase Account';
 function selectFirebase(){
  if(!firebase)return;
  localStorage.setItem('alp-backup-provider','firebase');
  // Return to the cacheable launch URL once setup/recovery has succeeded.
  if(requested==='firebase'){const url=new URL(location.href);url.searchParams.delete('backup');history.replaceState(null,'',url.href)}
 }
 const boundOwner=()=>localStorage.getItem(bindingKey);
 async function saveAutomatic(data,id){
  const serialized=JSON.stringify(Object.keys(data).sort().map(key=>[key,data[key]]));
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(serialized))),n=>n.toString(16).padStart(2,'0')).join('');
  let receipt;try{receipt=JSON.parse(localStorage.getItem(receiptKey)||'null')}catch{}
  if(!firebase&&receipt?.owner===id&&receipt.hash===hash){lastSaved=new Date(receipt.at);return}
  const row=await core.save(data,id);lastSaved=new Date(row.created_at);
  selectFirebase();
  try{localStorage.setItem(receiptKey,JSON.stringify({owner:id,hash,at:row.created_at}))}catch{}
 }
 const automatic=createAutomaticBackup({collect:collectBackupData,save:saveAutomatic,notify:(state,error)=>{
  if(busy)return;
  const messages={empty:'Automatic backup is ready. Your first saved entry will back up automatically.',pending:'Saved on this device. Cloud backup pending…',offline:'Saved on this device. Cloud backup will retry when you’re online.',saving:'Saving private backup…',saved:'Automatic backup is up to date'+(lastSaved?' · '+lastSaved.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'')+'.',error:'Saved on this device. Cloud backup could not connect and will retry automatically.'};
  if(state==='saved'&&!lastSaved)lastSaved=new Date();
  status(state==='error'&&error?.code?.startsWith('backup/')?error.message:state==='error'&&error?.code==='permission-denied'?'Private backup setup needs to be completed. Your entries remain on this device.':messages[state]);
 }});
 async function checkBackup(flush=false){try{automatic.configure(owner,boundOwner());await automatic.tick(navigator.onLine!==false,flush)}catch(error){status('Saved on this device. Automatic cloud backup is unavailable; check device storage.')}}
 const core=createCloudBackup({client,store,collect:collectBackupData,validate:validateBackup,restore:async file=>{selectFirebase();return importBackup(file)},confirm:window.confirm.bind(window),getCurrentId:()=>owner,assertCurrent});
 function render(){
  el('cloudAuth').classList.toggle('hidden',!!owner);
  el('cloudSignedIn').classList.toggle('hidden',!owner);
  panel.querySelectorAll('button,input').forEach(node=>node.disabled=busy);
  el('cloudEnable').classList.toggle('hidden',!!owner&&boundOwner()===owner);
 }
 async function run(action){
  if(busy)return;busy=true;render();const epoch=generation;
  try{await action()}catch(error){if(epoch===generation)status(navigator.onLine===false?'You’re offline. Your device data is safe; retry when connected.':error.message||'Cloud request failed. Your device data is unchanged.')}
  finally{busy=false;render()}
 }
 async function list(reset=true){
  const epoch=generation;if(reset){offset=0;el('cloudVersions').replaceChildren()}
  const rows=await core.list(offset);if(epoch!==generation)return;
  for(const row of rows){
   const button=document.createElement('button');button.type='button';
   button.textContent=new Date(row.created_at).toLocaleString()+(row.kind==='before-restore'?' · Before recovery':' · Backup');
   button.onclick=()=>run(async()=>{automatic.pause(true);try{if(automatic.isRunning())throw Error('Your latest backup is finishing. Try recovery again in a moment.');status('Preparing recovery…');if(!await core.recover(row.id))status('Recovery cancelled. Device data is unchanged.')}finally{automatic.pause(false)}});
   el('cloudVersions').append(button);
  }
  offset+=rows.length;el('cloudMore').classList.toggle('hidden',rows.length<20);
  if(reset&&!rows.length)status('No cloud backups yet. Enable automatic backup to protect saved changes.');
 }
 client.auth.onAuthStateChange((event,session)=>{
  const next=session?.user&&!session.user.is_anonymous?session.user.id:null;
  if(next!==owner){generation++;owner=next;el('cloudVersions').replaceChildren();el('cloudMore').classList.add('hidden');
   el('cloudAccount').textContent=next?session.user.email||'Signed in':'';
   lastSaved=null;automatic.configure(next,boundOwner());status(next?(boundOwner()===next?'Automatic backup is enabled. Checking saved changes…':'Enable automatic backup to connect this device’s data to this account. You can also recover an existing backup.'):'Your entries stay on this device. Sign in to enable automatic private backups.');render();
  }
  if(event==='PASSWORD_RECOVERY'){el('cloudNewPassword').classList.remove('hidden');panel.open=true;switchTab('settings')}
 });
 el('cloudAuth').onsubmit=e=>{e.preventDefault();run(async()=>{
  const {error}=await client.auth.signInWithPassword({email:el('cloudEmail').value.trim(),password:el('cloudPassword').value});el('cloudPassword').value='';if(error)throw error;
 })};
 el('cloudSignup').onclick=()=>run(async()=>{
  if(!firebase){startFirebaseSetup();return}
  if(!el('cloudAuth').reportValidity())return;
  const {error}=await client.auth.signUp({email:el('cloudEmail').value.trim(),password:el('cloudPassword').value,options:{emailRedirectTo:'https://gittyupgpt77.github.io/adaptive-land-prep/'}});
  el('cloudPassword').value='';if(error)throw error;
  status('Check your email for the Firebase confirmation, then return here and sign in. Your training data is unchanged.');
 });
 el('cloudForgot').onclick=()=>run(async()=>{
  if(!el('cloudEmail').reportValidity())return;
  const {error}=await client.auth.resetPasswordForEmail(el('cloudEmail').value.trim(),{redirectTo:'https://gittyupgpt77.github.io/adaptive-land-prep/'});if(error)throw error;
  status('If that account exists, a password reset link has been sent.');
 });
 el('cloudNewPassword').onsubmit=e=>{e.preventDefault();run(async()=>{
  const {error}=await client.auth.updateUser({password:el('cloudReplacement').value});if(error)throw error;
  el('cloudReplacement').value='';el('cloudNewPassword').classList.add('hidden');status('Password updated. You can access your backups.');
 })};
 el('cloudAccountReset').onclick=()=>run(async()=>{
  const email=el('cloudAccount').textContent.trim();if(!owner||!email)return;
  const id=owner,{error}=await client.auth.resetPasswordForEmail(email,{redirectTo:'https://gittyupgpt77.github.io/adaptive-land-prep/'});assertCurrent(id);if(error)throw error;
  status('A password reset link has been sent to your account email. Your saved data is unchanged.');
 });
 el('cloudSignout').onclick=()=>run(async()=>{const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;status('Signed out. On-device training data is still available on this device.');el('cloudNewPassword').classList.add('hidden')});
 el('cloudEnable').onclick=()=>run(async()=>{
  if(!owner)return;
  if(!window.confirm('Automatically back up this device’s existing and future training data to '+el('cloudAccount').textContent+'? Enable this only if the data belongs to this account.'))return;
  localStorage.setItem(bindingKey,owner);automatic.configure(owner,owner);status('Automatic backup enabled. Saved changes will back up shortly.');
 });
 el('cloudRefresh').onclick=()=>run(async()=>{status('Loading your backups…');await list();if(offset)status('Choose a backup to recover. Your current device data will be saved first.')});
 el('cloudMore').onclick=()=>run(()=>list(false));
 setInterval(()=>{if(!document.hidden&&!busy)checkBackup()},2000);
 window.addEventListener('online',()=>checkBackup());
 window.addEventListener('storage',()=>checkBackup());
 document.addEventListener('visibilitychange',()=>{if(!busy)checkBackup(true)});
 render();
 if(requested==='firebase'||requested==='legacy'){
  switchTab('settings');panel.open=true;
 }
})();
