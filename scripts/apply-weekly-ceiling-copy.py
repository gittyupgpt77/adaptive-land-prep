from pathlib import Path

app=Path('app.js')
source=app.read_text()

def swap(old,new,label):
    global source
    if old not in source:
        raise SystemExit(f'missing target: {label}')
    source=source.replace(old,new,1)

swap('function weeklyRunDose(w){const t=weekTarget(w);return t.runCeiling===0?"No running planned this week":"Week "+w+" · "+t.run}',
     'function weeklyRunDose(w){const t=weekTarget(w);return t.runCeiling===0?"No running planned this week":"Weekly run guardrail — not today’s distance · "+t.run}',
     'weekly run dose')
swap('function weeklyEnduranceDose(w){const t=weekTarget(w);return "Week "+w+" · "+t.run+(t.ruck?" · "+t.ruck:"")}',
     'function weeklyEnduranceDose(w){const t=weekTarget(w);return "Weekly guardrails · run: "+t.run+" (not today’s distance)"+(t.ruck?" · ruck: "+t.ruck:"")}',
     'weekly endurance dose')
swap('function qualityRunDose(w){const t=weekTarget(w);return "1 controlled quality session this week · "+t.run}',
     'function qualityRunDose(w){const t=weekTarget(w);return "Controlled quality work · weekly run guardrail: "+t.run+" (not today’s distance)"}',
     'quality run dose')

for bad in ['"Week "+w+" · "+t.run','1 controlled quality session this week · "+t.run']:
    if bad in source:
        raise SystemExit('ambiguous weekly dose wording remains')
app.write_text(source)
