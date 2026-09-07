/* Transport-independent backup operations. Never mutate device state on sign-in. */
(function(root){
 'use strict';
 function createCloudBackup({client,collect,validate,restore,confirm,assertCurrent,getCurrentId}){
  const table='athlete_backups';
  async function user(){
   const expected=getCurrentId();
   const {data,error}=await client.auth.getUser();
   if(error||!data?.user||data.user.is_anonymous)throw Error('Sign in to your backup account first.');
   if(data.user.id!==expected)throw Error("Your account changed. Please try again.");
   assertCurrent(data.user.id);
   return data.user;
  }
  function snapshot(){
   const payload={app:'Adaptive Land Prep',formatVersion:3,exportedAt:new Date().toISOString(),data:collect()};
   validate(payload);
   if(new TextEncoder().encode(JSON.stringify(payload)).length>9*1024*1024)throw Error('This backup is too large. Export a file backup instead.');
   return payload;
  }
  async function insert(owner,payload,kind){
   assertCurrent(owner.id);
   const {data,error}=await client.from(table).insert({user_id:owner.id,payload,kind}).select('id,created_at,kind').single();
   if(error)throw error;
   assertCurrent(owner.id);
   return data;
  }
  return {
   async save(){const owner=await user();return insert(owner,snapshot(),'manual')},
   async list(offset=0){
    const owner=await user();
    const {data,error}=await client.from(table).select('id,created_at,kind').eq('user_id',owner.id).order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+19);
    if(error)throw error;assertCurrent(owner.id);return data;
   },
   async recover(id){
    const owner=await user();
    const {data,error}=await client.from(table).select('payload,created_at').eq('user_id',owner.id).eq('id',id).single();
    if(error)throw error;
    validate(data.payload);assertCurrent(owner.id);
    if(!confirm('Restore the backup from '+new Date(data.created_at).toLocaleString()+'? This replaces this device’s training data. Its current data will be saved as a separate recovery backup first.'))return false;
    // Capture after confirmation; retain an immutable cloud copy before any local mutation.
    const previous=collect();
    if(Object.keys(previous).length)await insert(owner,snapshot(),'before-restore');
    assertCurrent(owner.id);
    if(JSON.stringify(collect())!==JSON.stringify(previous))throw Error('Device data changed during recovery. Please try again.');
    await restore({text:async()=>JSON.stringify(data.payload)});
    return true;
   }
  };
 }
 if(typeof module!=='undefined')module.exports={createCloudBackup};
 else root.createCloudBackup=createCloudBackup;
})(globalThis);
