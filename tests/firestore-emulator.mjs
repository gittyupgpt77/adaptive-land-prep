import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomBytes} from 'node:crypto';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,collection,getDocsFromServer as getDocs,getDoc,setDoc,deleteDoc,runTransaction,serverTimestamp} from 'firebase/firestore';
import backup from '../firestore-backup.js';
import coreModule from '../cloud-core.js';
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-adaptive-land-prep',firestore:{host:'127.0.0.1',port:8085,rules:fs.readFileSync('firestore.rules','utf8').replace('REPLACE_WITH_YOUR_USER_UID','owner')}})});
after(async()=>env?.cleanup());
beforeEach(async()=>env.clearFirestore());
const dbFor=(uid='owner',verified=true,provider='password')=>env.authenticatedContext(uid,{email:'athlete@example.test',email_verified:verified,firebase:{sign_in_provider:provider}}).firestore();
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v))}};
function store(db=dbFor(),storage=memory(),now=()=>Date.now()+1e7){return backup.createFirestoreStore({sdk:{doc,collection,getDocs,runTransaction,serverTimestamp},db,storage,now,assertOwner:uid=>assert.equal(uid,'owner')})}
const payload=n=>({app:'Adaptive Land Prep',formatVersion:3,exportedAt:new Date().toISOString(),data:{trainingLogs:JSON.stringify([{date:'2026-09-07',weight:170-n}])}});

test('real rules isolate the owner and deny unverified, anonymous, and arbitrary accounts',async()=>{
 const s=store();await s.insert('owner',payload(1),'manual');
 for(const db of [env.unauthenticatedContext().firestore(),dbFor('other'),dbFor('owner',false),dbFor('owner',true,'anonymous')]){
  await assertFails(getDoc(doc(db,'athletes','owner','state','head')));
  await assertFails(setDoc(doc(db,'athletes','owner','state','head'),{normal:0,safety:0,updatedAt:serverTimestamp()}));
 }
 await assertFails(setDoc(doc(dbFor('other'),'athletes','other','state','head'),{normal:0,safety:0,updatedAt:serverTimestamp()}));
 await assertFails(deleteDoc(doc(dbFor(),'athletes','owner','state','head')));
 await assertFails(setDoc(doc(dbFor(),'athletes','owner','chunks','normal-99-0'),{data:'bad',revision:1}));
 await assertFails(setDoc(doc(dbFor(),'athletes','owner','chunks','normal-0-24'),{data:'bad',revision:1}));
 await assertFails(setDoc(doc(dbFor(),'athletes','owner','chunks','normal-0-0'),{data:'a'.repeat(349529),revision:1}));
});
test('bounded rotating copies retain complete history and reject stale list selections',async()=>{
 const s=store();const first=await s.insert('owner',payload(0),'manual');
 for(let i=1;i<19;i++)await s.insert('owner',payload(i),'manual');
 const list=await s.list('owner');assert.equal(list.length,16);
 await assert.rejects(s.read('owner',first.id),{code:'backup/expired'});
 const latest=await s.read('owner',list[0].id);assert.deepEqual(latest.payload.data,payload(18).data);
 for(let i=0;i<6;i++)await s.insert('owner',payload(i),'before-restore');
 assert.equal((await s.list('owner')).length,20);
 assert.deepEqual((await s.read('owner',list[0].id)).payload.data,payload(18).data);
});
test('fresh/stale devices cannot replace cloud history; identical retries acknowledge the committed copy',async()=>{
 const s=store(),row=await s.insert('owner',payload(1),'manual'),fresh=store();
 await assert.rejects(fresh.insert('owner',payload(0),'manual'),{code:'backup/conflict'});
 assert.equal((await fresh.insert('owner',payload(1),'manual')).id,row.id);
 await s.insert('owner',payload(2),'manual');
 await assert.rejects(fresh.insert('owner',payload(3),'manual'),{code:'backup/conflict'});
 assert.equal((await s.list('owner')).length,2);
});
test('fresh-device guarded recovery restores data and allows subsequent backups',async()=>{
 const source=store(),row=await source.insert('owner',payload(1),'manual');
 const target=store();let data={};
 const core=coreModule.createCloudBackup({client:{auth:{getUser:async()=>({data:{user:{id:'owner'}}})}},store:target,
  getCurrentId:()=> 'owner',assertCurrent:uid=>assert.equal(uid,'owner'),collect:()=>data,validate:p=>assert.equal(p.formatVersion,3),confirm:()=>true,
  restore:async f=>{data=JSON.parse(await f.text()).data}});
 assert.equal(await core.recover(row.id),true);assert.deepEqual(data,payload(1).data);
 await target.insert('owner',payload(2),'manual');
 assert.equal((await target.list('owner')).length,2);
});
test('server pacing keeps automatic writes below the free daily allowance',async()=>{
 const s=store(dbFor(),memory(),()=>Date.now());await s.insert('owner',payload(1),'manual');
 await assert.rejects(s.insert('owner',payload(2),'manual'),{code:'backup/pending'});
 assert.equal((await s.list('owner')).length,1);
});
test('corrupt chunks and concurrent recovery changes cannot replace local records',async()=>{
 const s=store(),row=await s.insert('owner',payload(1),'manual');
 const selected=await s.read('owner',row.id);
 await s.insert('owner',payload(2),'manual');
 await assert.rejects(s.prepareRecovery('owner',selected),{code:'backup/conflict'});
 await assertSucceeds(setDoc(doc(dbFor(),'athletes','owner','chunks','normal-0-0'),{data:btoa('corrupted'),revision:1}));
 await assert.rejects(s.read('owner',row.id));
});
test('a failed atomic write leaves the previously acknowledged copy recoverable',async()=>{
 const db=dbFor(),s=store(db),row=await s.insert('owner',payload(1),'manual');
 await assertFails(runTransaction(db,async tx=>{
  tx.set(doc(db,'athletes','owner','state','head'),{normal:99,safety:0,updatedAt:serverTimestamp()});
  tx.set(doc(db,'athletes','owner','chunks','normal-99-0'),{data:'not allowed',revision:99});
 }));
 assert.equal((await getDoc(doc(db,'athletes','owner','state','head'))).data().normal,1);
 assert.deepEqual((await s.read('owner',row.id)).payload.data,payload(1).data);
});
test('full-size multi-document upload and recovery are atomic and fit Firestore limits',async()=>{
 const s=store(),large=payload(1);large.data.notes='x'.repeat(4*1024*1024)+randomBytes(600000).toString('base64');
 const row=await s.insert('owner',large,'manual');
 assert.deepEqual((await s.read('owner',row.id)).payload.data,large.data);
});
