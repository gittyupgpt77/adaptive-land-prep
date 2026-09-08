from pathlib import Path

app=Path('app.js')
source=app.read_text()
old='const prev=previousNutritionSignal(),trendCopy=nutritionTrendCopy(target.trend);'
new='const prev=previousNutritionSignal(),trendCopy=typeof nutritionTrendCopy==="function"?nutritionTrendCopy(target.trend):"";'
if old not in source:
    raise SystemExit('missing trend render declaration')
source=source.replace(old,new,1)
app.write_text(source)
