/* Only the publishable key belongs in this public client. RLS enforces ownership. */
(()=>{
 'use strict';
 const el=id=>document.getElementById(id),panel=el('cloudPanel');
 const status=text=>{el('cloudStatus').textContent=text};
 if(!window.SupabaseSDK){status('Cloud backup is unavailable. On-device storage and file backups still work.');return}
 const client=SupabaseSDK.createClient('https://pfpfttgfzmpexlbezmcs.supabase.co','sb_publishable_K4UzvlOQXTgRbEUJWq7qpA_9p54dG8o',{
  auth:{storageKey:'alp-cloud-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
  global:{fetch:(url,options)=>fetch(url,{...options,cache:'no-store',signal:options?.signal||AbortSignal.timeout(20000)})}
 });
 let owner=null,busy=false,offset=0,generation=0;
 const core=createCloudBackup({client,collect:collectBackupData,validate:validateBackup,restore:importBackup,confirm:window.confirm.bind(window),assertCurrent:id=>{if(owner!==id)throw Error('Your account changed. Please try again.')}});
 function render(){
  el('cloudAuth').classList.toggle('hidden',!!owner);
  el('cloudSignedIn').classList.toggle('hidden',!owner);
  panel.querySelectorAll('button,input').forEach(node=>node.disabled=busy);
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
   button.onclick=()=>run(async()=>{status('Preparing recovery…');if(!await core.recover(row.id))status('Recovery cancelled. Device data is unchanged.')});
   el('cloudVersions').append(button);
  }
  offset+=rows.length;el('cloudMore').classList.toggle('hidden',rows.length<20);
  if(reset&&!rows.length)status('No cloud backups yet. Tap Back Up Now to save this device.');
 }
 client.auth.onAuthStateChange((event,session)=>{
  const next=session?.user&&!session.user.is_anonymous?session.user.id:null;
  if(next!==owner){generation++;owner=next;el('cloudVersions').replaceChildren();el('cloudMore').classList.add('hidden');
   el('cloudAccount').textContent=next?session.user.email||'Signed in':'';
   status(next?'Signed in. Your on-device data is unchanged. Back up now or browse saved backups.':'Sign in to save private backups. Your on-device data stays on this device.');render();
  }
  if(event==='PASSWORD_RECOVERY'){el('cloudNewPassword').classList.remove('hidden');panel.open=true;document.querySelector('[data-target="program"]').click();el('openTrends').click()}
 });
 el('cloudAuth').onsubmit=e=>{e.preventDefault();run(async()=>{
  const {error}=await client.auth.signInWithPassword({email:el('cloudEmail').value.trim(),password:el('cloudPassword').value});el('cloudPassword').value='';if(error)throw error;
 })};
 el('cloudSignup').onclick=()=>run(async()=>{
  if(!el('cloudAuth').reportValidity())return;
  const {error}=await client.auth.signUp({email:el('cloudEmail').value.trim(),password:el('cloudPassword').value,options:{emailRedirectTo:'https://gittyupgpt77.github.io/adaptive-land-prep/'}});
  el('cloudPassword').value='';if(error)throw error;
  status('Check your email to confirm your account, then return here and sign in. Your training data is unchanged.');
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
 el('cloudSignout').onclick=()=>run(async()=>{const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;status('Signed out. On-device training data is still available on this device.');el('cloudNewPassword').classList.add('hidden')});
 el('cloudSave').onclick=()=>run(async()=>{
  if(!window.confirm('Save this device’s training data to '+el('cloudAccount').textContent+'?'))return;
  status('Saving private backup…');const row=await core.save();await list();status('Cloud backup saved '+new Date(row.created_at).toLocaleString()+'.');
 });
 el('cloudRefresh').onclick=()=>run(async()=>{status('Loading your backups…');await list();if(offset)status('Choose a backup to recover. Your current device data will be saved first.')});
 el('cloudMore').onclick=()=>run(()=>list(false));
 render();
})();
