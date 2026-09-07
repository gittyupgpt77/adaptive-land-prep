/* Debounced immutable backups. No timer or browser dependencies in the state machine. */
(function(root){
 'use strict';
 function createAutomaticBackup({collect,save,notify=()=>{},now=()=>Date.now(),delay=4000,retryBase=15000,retryMax=300000}){
  let account=null,bound=null,pending=null,last=null,due=0,retries=0,running=false,epoch=0,paused=false,notice=null;
  const emit=(state,error)=>{if(state!==notice){notice=state;notify(state,error)}};
  const signature=data=>JSON.stringify(Object.keys(data).sort().map(key=>[key,data[key]]));
  function configure(id,enabledOwner){if(id!==account||enabledOwner!==bound){epoch++;account=id;bound=enabledOwner;pending=null;last=null;due=0;retries=0;notice=null}}
  async function tick(online=true,flush=false){
   if(!account||account!==bound||paused||running)return;
   const data=collect(),sig=signature(data);
   if(!Object.keys(data).length){emit('empty');return}
   if(sig===last){emit('saved');return}
   if(!pending||pending.sig!==sig){pending={data:JSON.parse(JSON.stringify(data)),sig};if(!due)due=now()+delay;emit('pending')}
   if(!online){emit('offline');return}
   if(!flush&&now()<due)return;
   const current=pending,id=account,version=epoch;running=true;emit('saving');
   try{
    await save(current.data,id);
    if(version!==epoch)return;
    last=current.sig;pending=null;due=0;retries=0;emit('saved');
   }catch(error){
    if(version!==epoch)return;
    due=now()+Math.min(retryMax,retryBase*2**Math.min(retries++,5));emit('error',error);
   }finally{running=false}
  }
  return {configure,tick,pause(value){paused=value},isRunning:()=>running};
 }
 if(typeof module!=='undefined')module.exports={createAutomaticBackup};else root.createAutomaticBackup=createAutomaticBackup;
})(globalThis);
