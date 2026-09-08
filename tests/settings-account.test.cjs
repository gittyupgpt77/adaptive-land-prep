const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../cloud.js'),'utf8');
function harness(owner='account-a',error=null){
 const nodes={cloudAccount:{textContent:'athlete@example.com'},cloudAccountReset:{}},calls=[],messages=[];
 const context=vm.createContext({owner,el:id=>nodes[id],run:action=>action(),status:message=>messages.push(message),
  client:{auth:{resetPasswordForEmail:async email=>{calls.push(email);return{error}}}},
  assertCurrent:id=>{if(id!==context.owner)throw Error('Account changed')}
 });
 const start=source.indexOf(" el('cloudAccountReset').onclick="),end=source.indexOf(" el('cloudSignout').onclick=",start);
 vm.runInContext(source.slice(start,end),context);
 return{nodes,calls,messages,context,reset:()=>nodes.cloudAccountReset.onclick()};
}
test('signed-in password reset uses the account email without requiring password entry',async()=>{
 const h=harness();await h.reset();assert.deepEqual(h.calls,['athlete@example.com']);assert.equal(h.messages.length,1);
});
test('signed-out account cannot initiate a reset from stale displayed identity',async()=>{
 const h=harness(null);await h.reset();assert.deepEqual(h.calls,[]);assert.deepEqual(h.messages,[]);
});
test('provider rejection never reports a reset email as sent',async()=>{
 const h=harness('account-a',Error('Unavailable'));await assert.rejects(h.reset(),/Unavailable/);assert.deepEqual(h.messages,[]);
});
