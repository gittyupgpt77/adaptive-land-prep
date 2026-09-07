from pathlib import Path

app=Path('app.js')
test=Path('tests/weekly-targets.test.cjs')
source=app.read_text().replace('sessionRowMeters','sessionRowMinutes')
tests=test.read_text().replace('sessionRowMeters','sessionRowMinutes')
if 'sessionRowMeters' in source or 'sessionRowMeters' in tests:
    raise SystemExit('stale Concept2 field id remains')
app.write_text(source)
test.write_text(tests)
