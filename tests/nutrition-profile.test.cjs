// Prepared for the deferred rescue verification gate.
const test=require('node:test'),assert=require('node:assert/strict'),profile=require('../nutrition-profile');
test('dated assessments stay paired, retain history, and correct the same date explicitly',()=>{
 const first=profile.upsert(null,{assessment:{date:'2026-01-01',weightKg:80,bodyFatPercent:25,method:'dexa'}});
 const next=profile.upsert(first,{assessment:{date:'2026-03-01',weightKg:75,bodyFatPercent:22,method:'estimate'}});
 assert.equal(first.assessments.length,1);assert.equal(next.assessments.length,2);assert.equal(profile.latest(next).assessment.weightKg,75);
 const correction=profile.upsert(next,{assessment:{date:'2026-03-01',weightKg:76,bodyFatPercent:23,method:'dexa'}});
 assert.equal(correction.assessments.length,2);assert.equal(profile.latest(correction).assessment.weightKg,76);
});
test('unknown test date stays unknown, and RMR never becomes a maintenance estimate',()=>{
 const saved=profile.upsert(null,{rmr:{date:null,kcal:1800}});
 assert.equal(profile.latest(saved).rmr.date,null);assert.equal(saved.maintenanceKcal,undefined);
 assert.deepEqual(JSON.parse(JSON.stringify(saved)),saved);
});
test('invalid dates, nonphysical percentages and malformed imports are rejected before storage',()=>{
 for(const date of ['2026-02-30','bad'])assert.throws(()=>profile.upsert(null,{assessment:{date,weightKg:80,bodyFatPercent:25,method:'dexa'}}));
 for(const bodyFatPercent of [0,100,NaN])assert.throws(()=>profile.upsert(null,{assessment:{date:null,weightKg:80,bodyFatPercent,method:'dexa'}}));
 assert.equal(profile.valid({schemaVersion:99,assessments:[],rmrTests:[]}),false);
 assert.throws(()=>profile.upsert(null,{rmr:{date:null,kcal:-1}}));
});
