from pathlib import Path

app=Path('app.js')
source=app.read_text()

def replace_once(old,new,label):
    global source
    if old not in source:
        raise SystemExit(f'missing patch target: {label}')
    source=source.replace(old,new,1)

marker='function nutritionTrendCopy(t){\n'
helper=r'''function weightTrendHeadline(t,latest){
 if(!Number.isFinite(latest))return"No data";
 const weight=latest.toFixed(1)+" lb";
 if(!t||t.status!=="ready")return weight+" · calibrating";
 const pct=Math.abs(t.pct*100).toFixed(1),direction=t.pct<0?"down":t.pct>0?"up":"stable";
 return direction==="stable"?weight+" · 7-day average stable":weight+" · 7-day average "+direction+" "+pct+"%";
}
'''
if marker not in source: raise SystemExit('missing nutrition trend marker')
source=source.replace(marker,helper+marker,1)

replace_once('<span>kcal target</span>','<span>program kcal target</span>','program target label')
old='$("trendRecovery").textContent=l.length?l.length+" check-in"+(l.length===1?"":"s"):"No data";$("trendWeight").textContent=wt.length?wt.at(-1).toFixed(1)+" lb":"No data";'
new='const weightState=typeof weightTrend==="function"?weightTrend(new Date()):null;$("trendRecovery").textContent=l.length?l.length+" check-in"+(l.length===1?"":"s"):"No data";$("trendWeight").textContent=weightTrendHeadline(weightState,wt.length?wt.at(-1):NaN);'
replace_once(old,new,'trend weight headline')

if '<span>kcal target</span>' in source: raise SystemExit('ambiguous calorie label remains')
app.write_text(source)
