from pathlib import Path
p=Path('app.js')
s=p.read_text()
old='recovery?"Recovery Fuel Add-On":w<=24?"Training Fuel Add-On":"Performance Fuel Add-On"'
new='recovery?"Recovery Carbohydrate Add-On":w<=24?"Training Fuel Add-On":"Performance Fuel Add-On"'
if old not in s: raise SystemExit('recovery fuel label target not found')
s=s.replace(old,new,1)
if 'Recovery Carbohydrate Add-On' not in s: raise SystemExit('explicit recovery carbohydrate label missing')
p.write_text(s)
