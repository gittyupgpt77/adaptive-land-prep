const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

test('nutrition dashboard identifies calories as a program target',()=>{
 assert.match(source,/program kcal target/);
 assert.equal(source.includes('<span>kcal target</span>'),false);
});

test('weight trend headline distinguishes calibration from measured trend',()=>{
 const start=source.indexOf('function weightTrendHeadline('),end=source.indexOf('\nfunction nutritionTrendCopy',start);
 assert.ok(start>=0&&end>start,'weight trend headline helper is present');
 const c=vm.createContext({});
 vm.runInContext(source.slice(start,end),c);
 assert.equal(c.weightTrendHeadline({status:'learning'},170),'170.0 lb · calibrating');
 assert.equal(c.weightTrendHeadline({status:'ready',pct:-.012},168),'168.0 lb · 7-day average down 1.2%');
 assert.equal(c.weightTrendHeadline({status:'ready',pct:.006},171),'171.0 lb · 7-day average up 0.6%');
 assert.equal(c.weightTrendHeadline({status:'ready',pct:0},170),'170.0 lb · 7-day average stable');
 assert.equal(c.weightTrendHeadline(null,NaN),'No data');
});

test('trends screen uses the same weight-trend calibration state as nutrition',()=>{
 const renderStart=source.indexOf('function renderTrends(){'),renderEnd=source.indexOf('\nfunction openCheckin()',renderStart);
 const render=source.slice(renderStart,renderEnd);
 assert.match(render,/weightTrend\(new Date\(\)\)/);
 assert.match(render,/weightTrendHeadline\(weightState/);
});
