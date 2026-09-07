from pathlib import Path
p=Path('app.js')
s=p.read_text()
old='if(key==="workout"){switchTab("workout");if(!todayWorkout()){requestAnimationFrame(()=>{ $("sessionFeedback").open=true;$("sessionFeedback").scrollIntoView({behavior:"smooth",block:"center"});$("completed").value="YES" })}return}'
new='if(key==="workout"){switchTab("workout");if(!todayWorkout()){$("sessionFeedback").open=true;$("completed").value="YES";requestAnimationFrame(()=>$("sessionFeedback").scrollIntoView({behavior:"smooth",block:"center"))}return}'
if old not in s: raise SystemExit('workout toggle target not found')
s=s.replace(old,new,1)
p.write_text(s)
