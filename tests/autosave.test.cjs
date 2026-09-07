const test=require('node:test');
const assert=require('node:assert/strict');
const {createAutomaticBackup}=require('../autosave-core');
function harness(){
 let time=0,data={trainingLogs:'one'},action=async()=>{};
 const saved=[],states=[];
 const core=createAutomaticBackup({collect:()=>data,save:async(d,id)=>{await action();saved.push({d,id})},notify:s=>states.push(s),now:()=>time,delay:10,retryBase:20,retryMax:80});
 core.configure('A','A');
 return {core,saved,states,set:v=>data=v,at:t=>time=t,action:fn=>action=fn};
}
test('bursts coalesce and unchanged polling does not append versions',async()=>{const h=harness();await h.core.tick();h.at(5);h.set({trainingLogs:'two'});await h.core.tick();assert.equal(h.saved.length,0);h.at(10);await h.core.tick();assert.equal(h.saved[0].d.trainingLogs,'two');h.at(100);await h.core.tick();assert.equal(h.saved.length,1)});
test('offline changes automatically resume after connectivity returns',async()=>{const h=harness();await h.core.tick(false);h.at(100);await h.core.tick(false);assert.equal(h.saved.length,0);await h.core.tick(true);assert.equal(h.saved.length,1)});
test('network errors retry with backoff without a user action',async()=>{const h=harness();let calls=0;h.action(async()=>{if(++calls===1)throw Error('offline')});await h.core.tick();h.at(10);await h.core.tick();assert.equal(calls,1);h.at(29);await h.core.tick();assert.equal(calls,1);h.at(30);await h.core.tick();assert.equal(h.saved.length,1)});
test('another signed-in account cannot inherit device backup permission',async()=>{const h=harness();await h.core.tick();h.core.configure('B','A');h.at(100);await h.core.tick();assert.equal(h.saved.length,0);h.core.configure('B','B');await h.core.tick(true,true);assert.equal(h.saved[0].id,'B')});
test('edits made during upload create a subsequent immutable snapshot',async()=>{const h=harness();let finish;h.action(()=>new Promise(r=>finish=r));const task=h.core.tick(true,true);h.set({trainingLogs:'two'});finish();await task;assert.equal(h.saved[0].d.trainingLogs,'one');h.action(async()=>{});await h.core.tick(true,true);assert.equal(h.saved[1].d.trainingLogs,'two')});
test('empty device does not create cloud history',async()=>{const h=harness();h.set({});await h.core.tick(true,true);assert.equal(h.saved.length,0)});
test('late upload completion from old account cannot mark new account as saved',async()=>{const h=harness();let finish;h.action(()=>new Promise(r=>finish=r));const task=h.core.tick(true,true);h.core.configure('B','A');finish();await task;assert.notEqual(h.states.at(-1),'saved');await h.core.tick(true,true);assert.equal(h.saved.length,1)});
test('recovery pause suppresses automatic writes',async()=>{const h=harness();h.core.pause(true);await h.core.tick(true,true);assert.equal(h.saved.length,0);h.core.pause(false);await h.core.tick(true,true);assert.equal(h.saved.length,1)});
