const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8');

test('readiness UI exposes categorical state instead of invented percentage precision',()=>{
 assert.doesNotMatch(html,/readinessScore|scoreRing|\/\s*100/);
 assert.match(html,/readinessStateBadge/);
 assert.match(app,/ON PLAN/);
 assert.match(app,/ADJUST/);
 assert.match(app,/RECOVERY/);
 assert.doesNotMatch(app,/let score=92|score=d\?\.score|x=>x\.score\|\|/);
});

test('new check-ins do not persist a synthetic readiness score',()=>{
 assert.doesNotMatch(app,/score:d\.score/);
 assert.doesNotMatch(app,/return\{a,b,c,o,score/);
});

test('recovery history is discrete rather than a fabricated continuous score chart',()=>{
 assert.doesNotMatch(html,/id="recoveryChart"/);
 assert.match(html,/id="recoveryHistory"/);
 assert.match(app,/recovery-strip/);
 assert.doesNotMatch(app,/map=\{RED:30,YELLOW:65,GREEN:90\}/);
});

test('legacy backup validation still tolerates historical score fields',()=>{
 assert.match(app,/"pain","score","rpe"/);
});

test('obsolete percentage-ring styling is removed',()=>{
 assert.doesNotMatch(css,/\.score-ring/);
 assert.match(css,/Categorical readiness/);
});
