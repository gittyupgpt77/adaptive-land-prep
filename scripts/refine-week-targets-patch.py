from pathlib import Path

app=Path('app.js')
index=Path('index.html')
test=Path('tests/weekly-targets.test.cjs')
source=app.read_text()
html=index.read_text()
tests=test.read_text()

source=source.replace('rowMeters','rowMinutes')
source=source.replace('Math.round(work.rowMinutes).toLocaleString()+" m"','work.rowMinutes+" min"')
source=source.replace('Math.round(m.rowMinutes).toLocaleString()+" m logged · "','m.rowMinutes.toFixed(0)+" min logged · "')
old='const text=((det?.title||"")+" "+(det?.type||"")+" "+(det?.steps||[]).map(e=>(e.name||"")+" "+(e.type||"")).join(" ")).toLowerCase();'
new='const text=((det?.title||"")+" "+(det?.type||"")+" "+(det?.steps||[]).map(e=>(e.name||"")+" "+(e.type||"")+" "+(e.dose||"")+" "+(e.cue||"")).join(" ")).toLowerCase();'
if old not in source: raise SystemExit('missing modality text target')
source=source.replace(old,new,1)

html=html.replace('sessionRowMetersField','sessionRowMinutesField').replace('sessionRowMeters','sessionRowMinutes')
html=html.replace('<span>Row distance · m</span><input id="sessionRowMinutes" type="number" inputmode="numeric" placeholder="actual">','<span>Row time · min</span><input id="sessionRowMinutes" type="number" inputmode="decimal" step=".1" placeholder="actual">')

# Keep the regression test aligned with the time-based source curriculum.
tests=tests.replace('rowMeters','rowMinutes')
tests=tests.replace('5000','40').replace('2500','20').replace('9000','90').replace('7500','60').replace('6200','45')
tests=tests.replace("assert.equal(saved.rowMinutes,45);","assert.equal(saved.rowMinutes,45);")

if 'rowMeters' in source or 'sessionRowMeters' in html or 'rowMeters' in tests:
    raise SystemExit('meter-based row actual remains')
if 'Row distance · m' in html:
    raise SystemExit('old row label remains')

app.write_text(source)
index.write_text(html)
test.write_text(tests)
