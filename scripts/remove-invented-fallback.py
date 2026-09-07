from pathlib import Path

app=Path('app.js')
test=Path('tests/weekly-targets.test.cjs')
source=app.read_text()
tests=test.read_text()
source=source.replace('If none is current, replace the quality segment with 20–40 min easy rowing rather than guessing.','If none is current, do not guess at intensity; replace the quality segment with easy Concept2 work within this week’s C2 target.')
source=source.replace('If no current quality calibration exists, use easy rowing instead of inventing an interval pace.','If no current quality calibration exists, use easy Concept2 work within this week’s C2 target instead of inventing an interval pace.')
source=source.replace('If none is current, row easy for 30–45 min instead of guessing at threshold.','If none is current, keep the row conversational and stay within this week’s C2 target instead of guessing at threshold.')
tests=tests.replace('If none is current, replace the quality segment with 20–40 min easy rowing','If none is current, do not guess at intensity; replace the quality segment with easy Concept2 work within this week’s C2 target')
for phrase in ['20–40 min easy rowing rather than guessing','row easy for 30–45 min instead of guessing']:
    if phrase in source: raise SystemExit(f'invented fallback remains: {phrase}')
app.write_text(source)
test.write_text(tests)
