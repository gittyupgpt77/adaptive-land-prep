const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

test('weekly run targets cannot be read as today’s distance',()=>{
 const start=source.indexOf('const weeklyTargets='),end=source.indexOf('\nconst templates=',start);
 assert.ok(start>=0&&end>start,'weekly target helpers are present');
 const c=vm.createContext({});
 vm.runInContext(source.slice(start,end),c);
 assert.equal(c.weeklyRunDose(13),'Weekly run guardrail — not today’s distance · ~12 mi/wk ceiling');
 assert.equal(c.qualityRunDose(13),'Controlled quality work · weekly run guardrail: ~12 mi/wk ceiling (not today’s distance)');
 assert.equal(c.weeklyEnduranceDose(13),'Weekly guardrails · run: ~12 mi/wk ceiling (not today’s distance) · ruck: ~4 mi easy ruck');
 assert.equal(c.weeklyRunDose(1),'No running planned this week');
});

test('old dose-shaped weekly wording is removed',()=>{
 assert.equal(source.includes('return "Week "+w+" · "+t.run'),false);
 assert.equal(source.includes('1 controlled quality session this week · "+t.run'),false);
});
