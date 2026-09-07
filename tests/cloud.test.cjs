const test=require('node:test');
const assert=require('node:assert/strict');
const {createCloudBackup}=require('../cloud-core.js');
function harness(){
 let owner='A',data={trainingLogs:'[]'},confirmed=true,error=null,afterInsert=()=>{},insertError=null,authChange=null;
 const writes=[],restores=[],filters=[];
 const payload={app:'Adaptive Land Prep',formatVersion:3,data:{trainingLogs:'[{"date":"2026-09-01"}]'}};
 const client={auth:{getUser:async()=>{if(authChange)owner=authChange;return {data:{user:owner?{id:owner}:null}}}},from(){
  let insert=null;const q={insert(row){insert=row;return q},select(){return q},eq(k,v){filters.push([k,v]);return q},order(){return q},range:async()=>({data:[],error}),single:async()=>{
   if(error)return {error};
   if(insert){if(insertError)return {error:insertError};writes.push(insert);afterInsert();return {data:{id:'new',created_at:'2026-09-07'}}}
   return {data:{payload,created_at:'2026-09-01'}};
  }};return q;
 }};
 const core=createCloudBackup({client,collect:()=>({...data}),validate:p=>{if(!p.data||p.formatVersion!==3)throw Error('invalid')},restore:async f=>restores.push(JSON.parse(await f.text())),confirm:()=>confirmed,getCurrentId:()=>owner,assertCurrent:id=>{if(id!==owner)throw Error('account changed')}});
 return {core,writes,restores,filters,payload,setOwner:v=>owner=v,changeDuringAuth:v=>authChange=v,setData:v=>data=v,cancel:()=>confirmed=false,fail:()=>error=Error('network failed'),failInsert:()=>insertError=Error("safety upload failed"),afterInsert:fn=>afterInsert=fn};
}
test('signed-out operations never upload or restore',async()=>{const h=harness();h.setOwner(null);await assert.rejects(h.core.save());await assert.rejects(h.core.recover('old'));assert.equal(h.writes.length,0);assert.equal(h.restores.length,0)});
test('each save appends a snapshot under the authenticated owner',async()=>{const h=harness();await h.core.save();await h.core.save();assert.equal(h.writes.length,2);assert.equal(h.writes[0].user_id,'A');assert.equal(h.writes[0].kind,'manual')});
test('list and recovery filter by owner and selected snapshot',async()=>{const h=harness();await h.core.list();await h.core.recover('old');assert.ok(h.filters.some(([k,v])=>k==='user_id'&&v==='A'));assert.ok(h.filters.some(([k,v])=>k==='id'&&v==='old'))});
test('recovery preserves current device state in cloud before replacement',async()=>{const h=harness();await h.core.recover('old');assert.deepEqual(h.writes[0].payload.data,{trainingLogs:'[]'});assert.equal(h.writes[0].kind,'before-restore');assert.equal(h.restores.length,1)});
test('cancelled and invalid recovery leave local and cloud data untouched',async()=>{const h=harness();h.cancel();await h.core.recover('old');assert.equal(h.writes.length,0);assert.equal(h.restores.length,0);h.payload.formatVersion=99;await assert.rejects(h.core.recover('old'));assert.equal(h.restores.length,0)});
test('network failure cannot mutate the device',async()=>{const h=harness();h.fail();await assert.rejects(h.core.recover('old'));assert.equal(h.restores.length,0)});
test('account change while preserving a snapshot aborts recovery',async()=>{const h=harness();h.afterInsert(()=>h.setOwner('B'));await assert.rejects(h.core.recover('old'));assert.equal(h.restores.length,0)});
test('device edits during network operations abort recovery',async()=>{const h=harness();h.afterInsert(()=>h.setData({trainingLogs:'new data'}));await assert.rejects(h.core.recover('old'));assert.equal(h.restores.length,0)});
test('fresh device can recover without uploading an empty snapshot',async()=>{const h=harness();h.setData({});await h.core.recover('old');assert.equal(h.writes.length,0);assert.equal(h.restores.length,1)});

test('failed safety upload aborts recovery before local writes',async()=>{const h=harness();h.failInsert();await assert.rejects(h.core.recover('old'));assert.equal(h.restores.length,0)});

test('account switch during identity verification cannot redirect an upload',async()=>{const h=harness();h.changeDuringAuth('B');await assert.rejects(h.core.save());assert.equal(h.writes.length,0)});
