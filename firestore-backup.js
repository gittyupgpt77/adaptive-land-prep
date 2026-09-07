/* Bounded, atomic, account-scoped snapshots. SDK operations are injected for tests. */
(function(root){
 'use strict';
 const CHUNK_BYTES=256*1024,MAX_BYTES=6*1024*1024,MAX_STORED_BYTES=2*1024*1024,NORMAL_SLOTS=16,SAFETY_SLOTS=4;
 function fail(code,message){return Object.assign(Error(message),{code})}
 async function transform(bytes,stream,limit){
  const reader=new Blob([bytes]).stream().pipeThrough(stream).getReader();
  const parts=[];let length=0;
  try{while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;
   if(length>limit)throw fail('backup/size','This backup exceeds the supported size. Your device data is unchanged.');parts.push(value);
  }}finally{await reader.cancel()}
  const result=new Uint8Array(length);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length}return result;
 }
 async function encode(payload){
  const bytes=new TextEncoder().encode(JSON.stringify(payload));
  if(bytes.length>MAX_BYTES)throw fail('backup/size','This device’s backup exceeds the supported size. Your device data is unchanged.');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  const packed=await transform(bytes,new CompressionStream('gzip'),MAX_STORED_BYTES);
  const chunks=[];
  for(let i=0;i<packed.length;i+=CHUNK_BYTES){
   const part=packed.subarray(i,i+CHUNK_BYTES);let binary='';
   for(let j=0;j<part.length;j+=8192)binary+=String.fromCharCode(...part.subarray(j,j+8192));
   chunks.push(btoa(binary));
  }
  return {chunks,hash,bytes:packed.length,originalBytes:bytes.length,encoding:'gzip'};
 }
 async function decode(meta,chunks){
  if(meta.encoding!=='gzip'||!Number.isInteger(meta.originalBytes)||meta.originalBytes<1||meta.originalBytes>MAX_BYTES||!Number.isInteger(meta.count)||meta.count<1||meta.count>8||chunks.length!==meta.count)throw fail('backup/corrupt','This recovery copy is incomplete. Your device data is unchanged.');
  const parts=chunks.map(chunk=>{
   if(!chunk||chunk.revision!==meta.revision||typeof chunk.data!=='string'||chunk.data.length>349528)throw fail('backup/corrupt','This recovery copy is incomplete. Your device data is unchanged.');
   return Uint8Array.from(atob(chunk.data),x=>x.charCodeAt(0));
  });
  const length=parts.reduce((n,p)=>n+p.length,0);
  if(length!==meta.bytes||length>MAX_STORED_BYTES)throw fail('backup/corrupt','This recovery copy has an invalid size.');
  const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length}
  const unpacked=await transform(bytes,new DecompressionStream('gzip'),MAX_BYTES);
  if(unpacked.length!==meta.originalBytes)throw fail('backup/corrupt','This recovery copy has an invalid size.');
  const text=new TextDecoder('utf-8',{fatal:true}).decode(unpacked),payload=JSON.parse(text);
  if((await encode(payload)).hash!==meta.hash)throw fail('backup/corrupt','This recovery copy failed its integrity check.');
  return payload;
 }
 function createFirestoreStore({sdk,db,storage,assertOwner,now=()=>Date.now()}){
  const {doc,collection,getDocs,runTransaction,serverTimestamp}=sdk;
  const ref=(uid,...path)=>doc(db,'athletes',uid,...path);
  const cursorKey=uid=>'alp-firestore-revision-'+uid;
  const cursor=uid=>{const value=storage.getItem(cursorKey(uid));return value===null?null:Number(value)};
  const remember=(uid,n)=>storage.setItem(cursorKey(uid),String(n));
  const date=value=>value?.toDate?value.toDate().toISOString():new Date(value).toISOString();
  return {
   async insert(uid,payload,kind){
    assertOwner(uid);
    const {exportedAt,...canonical}=payload;
    const encoded=await encode(canonical),safety=kind==='before-restore',expected=cursor(uid);
    const result=await runTransaction(db,async tx=>{
     assertOwner(uid);
     const headRef=ref(uid,'state','head'),head=(await tx.get(headRef)).data()||{normal:0,safety:0};
     if(!safety&&head.normal>0){
      const slot='normal-'+((head.normal-1)%NORMAL_SLOTS),latest=(await tx.get(ref(uid,'snapshots',slot))).data();
      if(latest?.hash===encoded.hash)return {id:slot+':'+head.normal,kind:'automatic',normal:head.normal};
     }
     if(!safety&&head.normal>0&&expected!==head.normal)throw fail('backup/conflict','A newer cloud history exists. Browse & Recover before backing up from this device.');
     const wait=Math.max(30000,encoded.chunks.length*10000);
     if(!safety&&head.updatedAt&&now()-head.updatedAt.toMillis()<wait)throw fail('backup/pending','Saved on this device. Your next automatic backup is pending.');
     const revision=(safety?head.safety:head.normal)+1,lane=safety?'safety':'normal';
     const slot=lane+'-'+((revision-1)%(safety?SAFETY_SLOTS:NORMAL_SLOTS));
     const createdAt=serverTimestamp();
     tx.set(ref(uid,'snapshots',slot),{revision,count:encoded.chunks.length,bytes:encoded.bytes,originalBytes:encoded.originalBytes,encoding:encoded.encoding,hash:encoded.hash,createdAt,kind:safety?'before-restore':'automatic'});
     encoded.chunks.forEach((data,i)=>tx.set(ref(uid,'chunks',slot+'-'+i),{data,revision}));
     tx.set(headRef,{normal:safety?head.normal:revision,safety:safety?revision:head.safety,updatedAt:safety?(head.updatedAt||createdAt):createdAt});
     return {id:slot+':'+revision,kind:safety?'before-restore':'automatic',normal:safety?head.normal:revision};
    });
    assertOwner(uid);
    remember(uid,result.normal);
    // Read server time, never describe a locally queued write as backed up.
    const saved=await runTransaction(db,async tx=>(await tx.get(ref(uid,'snapshots',result.id.split(':')[0]))).data());
    assertOwner(uid);
    if(!saved||saved.revision!==Number(result.id.split(':')[1]))throw fail('backup/conflict','The cloud changed while saving. Check recovery before continuing.');
    return {...result,created_at:date(saved.createdAt)};
   },
   async list(uid,offset=0){
    assertOwner(uid);const rows=await getDocs(collection(db,'athletes',uid,'snapshots'));assertOwner(uid);
    return rows.docs.map(row=>{const d=row.data();return {id:row.id+':'+d.revision,created_at:date(d.createdAt),kind:d.kind}})
     .sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id)).slice(offset,offset+20);
   },
   async read(uid,id){
    assertOwner(uid);
    const match=/^((?:normal-(?:[0-9]|1[0-5])|safety-[0-3])):([1-9][0-9]*)$/.exec(id);
    if(!match)throw fail('backup/corrupt','Invalid recovery selection.');
    const value=await runTransaction(db,async tx=>{
     assertOwner(uid);const head=(await tx.get(ref(uid,'state','head'))).data();
     const meta=(await tx.get(ref(uid,'snapshots',match[1]))).data();
     if(!meta||meta.revision!==Number(match[2]))throw fail('backup/expired','That recovery version has rotated out. Refresh the recovery list.');
     if(!Number.isInteger(meta.count)||meta.count<1||meta.count>8)throw fail('backup/corrupt','Invalid recovery copy.');
     const chunks=[];for(let i=0;i<meta.count;i++)chunks.push((await tx.get(ref(uid,'chunks',match[1]+'-'+i))).data());
     return {meta,chunks,normal:head?.normal||0};
    });
    const payload=await decode(value.meta,value.chunks);assertOwner(uid);
    return {payload,created_at:date(value.meta.createdAt),normal:value.normal};
   },
   async prepareRecovery(uid,selected){
    assertOwner(uid);
    await runTransaction(db,async tx=>{
     const head=(await tx.get(ref(uid,'state','head'))).data();
     if((head?.normal||0)!==selected.normal)throw fail('backup/conflict','Cloud history changed during recovery. Refresh and try again.');
    });
    assertOwner(uid);remember(uid,selected.normal);
   }
  };
 }
 const api={createFirestoreStore,encode,decode,CHUNK_BYTES,MAX_BYTES,NORMAL_SLOTS,SAFETY_SLOTS};
 if(typeof module!=='undefined')module.exports=api;else root.FirestoreBackup=api;
})(globalThis);
