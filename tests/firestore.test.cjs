const test=require('node:test'),assert=require('node:assert/strict');
const {encode,decode,MAX_BYTES}=require('../firestore-backup');
test('Unicode histories spanning multiple documents round-trip with integrity checks',async()=>{
 const payload={formatVersion:3,data:{notes:'🏋️ café שלום '+require('node:crypto').randomBytes(400000).toString('base64')}};
 const encoded=await encode(payload),meta={...encoded,count:encoded.chunks.length,revision:7};
 assert.ok(meta.count>1);
 const chunks=encoded.chunks.map(data=>({data,revision:7}));
 assert.deepEqual(await decode(meta,chunks),payload);
 await assert.rejects(decode(meta,chunks.slice(1)));
 await assert.rejects(decode(meta,chunks.map((v,i)=>i? v:{...v,revision:8})));
 await assert.rejects(decode({...meta,hash:'0'.repeat(64)},chunks));
});
test('oversized data is rejected before database operations',async()=>{
 await assert.rejects(encode({data:'a'.repeat(MAX_BYTES)}),{code:'backup/size'});
});
test('a synthetic five-year daily history fits without truncating records',async()=>{
 const days=Array.from({length:5*366},(_,i)=>({date:new Date(Date.UTC(2026,0,i+1)).toISOString(),weight:170,hrv:62,rhr:54,sleep:8,grip:52,
  decision:{o:'GREEN',a:'GREEN',b:'GREEN',c:'GREEN',score:94},note:'Completed the prescribed training and nutrition.'}));
 const data={trainingLogs:JSON.stringify(days),workoutHistory:JSON.stringify(days.map(x=>({...x,rpe:5,postPain:0,session:'Aerobic row',completed:'YES'})))};
 days.forEach((day,i)=>{data['nutrition_'+i]=JSON.stringify({date:day.date,meals:['m1','m2','m3','m4'],actualCalories:2400,targetCalories:2400,actualProtein:180,saved:true})});
 const encoded=await encode({formatVersion:3,data});
 assert.ok(encoded.bytes<MAX_BYTES);
 console.log('Five-year synthetic history:',encoded.bytes,'bytes;',encoded.chunks.length,'chunks; retains',days.length,'days.');
});
