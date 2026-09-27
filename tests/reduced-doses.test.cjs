const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8'),context=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function reduceDoseText('),source.indexOf('function adaptiveSessionFor(')),context);
test('existing reduction becomes explicit sets and minutes without reducing reps twice',()=>{
 for(const [input,expected] of [['3 × 6–8','2 × 6–8'],['3–5 submaximal sets','2–4 submaximal sets'],['40–75 min','28–53 min'],['3 × 40–100 m each side','2 × 40–100 m each side'],['2–3 climbs','1–2 climbs'],['1 × 5','1 × 5'],['5 min','4 min']])assert.equal(context.reduceDoseText(input),expected);
});
test('weekly guardrails remain context and unsupported doses stay explicit about uncertainty',()=>{
 const weekly='Weekly run guardrail — not today’s distance · ~5 mi/wk ceiling';
 assert.equal(context.reduceDoseText(weekly),weekly);
 assert.equal(context.reduceDoseText('—'),'—');
 assert.equal(context.reduceDoseText(''), '');
 assert.match(context.reduceDoseText('As prescribed'),/Reduce the planned work by about 30%/);
});
