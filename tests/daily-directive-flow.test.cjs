const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const audit=fs.readFileSync('.github/workflows/ui-audit.yml','utf8');
const sw=fs.readFileSync('service-worker.js','utf8');

test('Today is an intent-driven single-card state machine',()=>{
  assert.match(html,/id="dailyDirective"/);
  assert.match(app,/function todayFlowState\(\)/);
  for(const state of ['morning','directive','nutrition','evening']) assert.match(app,new RegExp('"'+state+'"'));
  assert.match(css,/#today\.guided-flow #readinessCard[\s\S]*#today\.guided-flow \.plan-list/);
  assert.match(app,/switchTab\("today"\)/);
});

test('daily subjective check-in uses tap choices while measured inputs remain numeric',()=>{
  assert.match(app,/const TAP_CHECKIN_FIELDS=/);
  for(const id of ['sleepQ','fatigue','load','pain','performance']) assert.match(app,new RegExp(id+':'));
  assert.match(css,/\.tap-scale button\{[^}]*min-height:46px/);
  assert.match(html,/Generate Today’s Directive/);
});

test('mobility is a reminder and ambiguous movement labels do not get forced imagery',()=>{
  assert.doesNotMatch(app,/\[\/ankle mobility\|ankle circles\//);
  assert.doesNotMatch(app,/\[\/hip mobility\|mobility\|stretch\//);
  assert.match(app,/Technique imagery is opt-in/);
  assert.match(app,/Mobility reminder/);
  assert.match(app,/exercise-reminder/);
  assert.doesNotMatch(app,/"Ankle_Circles":\{name:"Ankle Mobility"/);
});

test('nutrition does not advance to evening until intake is explicitly complete',()=>{
  assert.match(app,/function nutritionDayComplete\(/);
  assert.match(app,/log\.intakeSource==="manual-deviation"/);
  assert.match(app,/meals\.every\(m=>checked\.has\(m\.id\)\)/);
});

test('iPhone 16 standalone shell consumes safe areas and contains overscroll',()=>{
  assert.match(html,/viewport-fit=cover/);
  assert.match(css,/env\(safe-area-inset-top\)/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/overscroll-behavior-y:contain/);
  assert.match(audit,/width: 393, height: 852/);
  assert.match(audit,/deviceScaleFactor: 3/);
  assert.match(sw,/land-prep-v\d+/);
});
