/* Compact detailed food receipts without changing historical values. Legacy JSON stays readable. */
const NutritionStorage=(()=>{
 const codec=typeof pako!=='undefined'?pako:require('./vendor/pako');
 const LIMIT=512*1024;
 function encode(record){
  const json=JSON.stringify(record);
  if(new TextEncoder().encode(json).length>LIMIT)throw Error('This meal record is too large to save.');
  if(json.length<4096)return json;
  const bytes=codec.deflate(json);let binary='';
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  const compact=JSON.stringify({encoding:'nutrition-deflate-v1',data:btoa(binary)});
  return compact.length<json.length?compact:json;
 }
 function decode(raw){
  const record=JSON.parse(raw||'{}');
  if(record?.encoding!=='nutrition-deflate-v1')return record;
  if(typeof record.data!=='string'||record.data.length>LIMIT*2)throw Error('Invalid nutrition record');
  const bytes=Uint8Array.from(atob(record.data),c=>c.charCodeAt(0));
  const inflater=new codec.Inflate(),parts=[];let length=0;
  inflater.onData=part=>{length+=part.length;if(length>LIMIT)throw Error('Nutrition record exceeds its limit');parts.push(part)};
  inflater.push(bytes,true);if(inflater.err||!inflater.ended)throw Error('Invalid compressed nutrition record');
  const out=new Uint8Array(length);let offset=0;for(const part of parts){out.set(part,offset);offset+=part.length}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(out));
 }
 return {encode,decode};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NutritionStorage;
