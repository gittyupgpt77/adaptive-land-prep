# Daily Decision Protocol

## Baselines
Use valid longitudinal data. Repository defaults: HRV/RHR up to 28 prior valid observations; grip up to 28 unit-aware observations; body-weight trend uses 14 days and should not change fueling until there are at least 10 observations spanning >=12 days.

## Systemic recovery heuristics
- Sleep RED: <6 h or quality <=2/5; YELLOW: <7 h or quality 3/5.
- Fatigue RED: >=4/5; YELLOW: 3/5.
- Autonomic RED: HRV <85% baseline OR RHR > baseline +8 bpm.
- Autonomic YELLOW: HRV <92% baseline OR RHR > baseline +5 bpm.
- Grip <90% baseline: YELLOW.
- Prior-day RPE >=9/10: YELLOW context.
- Performance not normal: Weeks 1–16 = YELLOW context; Week 17+ = RED domain.
- Systemic RED: >=2 current RED domains or persistence of the same RED domain in recent check-ins.
- Systemic YELLOW: one RED, >=2 YELLOW, or persistent YELLOW.
- Otherwise GREEN.
- Recent corroboration means recent calendar days, not old historical abnormalities.

## Mechanical
- RED: focal bone pain, altered gait, pain >=5/10, or prior-session post-pain >=5/10.
- YELLOW: pain 3–4/10 or prior-session post-pain 3–4/10.
- GREEN otherwise.
- Mechanical RED overrides all other favorable signals.

## Fueling
Use confirmed intake only.
- If current workload is unknown: prior intake <70% target => YELLOW.
- Workload >=6/10 + prior intake <65% target => RED.
- Workload >=4/10 + prior intake <80% target => YELLOW.
- Otherwise GREEN.

## Overall
RED if systemic RED or mechanical RED. YELLOW if systemic YELLOW, mechanical YELLOW, or fueling RED. GREEN otherwise.

## Adaptation
Mechanical RED: no running or weighted-pack walking; easy row/walk only if pain-free; non-aggravating strength; no hard work.
Overall RED without mechanical RED: row/walk only, no loaded walking, recovery row 20–40 min conversational, strength about -50%, no hard training.
YELLOW: running about -25–40% and easy; reduce ruck distance/load; prefer easy row; strength about -30%; no hard intervals; replace hard segments with 20–40 min easy aerobic work.
GREEN: use earned curriculum session subject to weekly ceilings and completed work.

## Quality rule
Never invent interval pace/HR/lactate targets. Use current calibration. Without current calibration, replace the hard segment with easy Concept2 work within the week's C2 guardrail.

## Nutrition policy
Foundation (Weeks 1–16) prioritizes fat loss, with lean-tissue retention and basic health/recovery as constraints; performance optimization is secondary. The athlete-directed policy is change-controlled.
Legacy reference targets preserved from the app:
- Weeks 1–16: 1450 kcal lower-volume / 1650 kcal high-volume; 185 g protein; 90/140 g carbs; 40 g fat.
- Weeks 17–20: 1950 kcal; 185 P / 190 C / 50 F.
- Weeks 21–24: 2250 kcal; 185 P / 240 C / 60 F.
- Week 25+: 3400 kcal baseline / 4000 kcal high-demand; 200 P / 450/600 C / 88 F.
These are preserved policy/reference values, not proof of optimal or medically safe intake.
Weeks 1–16: established 14-day loss >2.7 lb/week triggers recovery fueling rather than deeper restriction.
After Week 16: >=1%/week loss is a red recovery-fueling guardrail; 0.5–1%/week decline is an observation band.
Repository recovery-fueling behavior: about +200 kcal and +50 g carbohydrate for RED fueling/rapid-loss guardrail; YELLOW emphasizes carbohydrate timing.
Never infer adequacy from incomplete logging. Do not double-count exercise energy. RMR alone is not TDEE.

## Manual data only when needed
Pain 0–10; focal bone pain; altered gait; fatigue; perceived performance; post-session pain/RPE; pack weight if not recorded; grip if retained; DEXA/body-fat measurement; loaded-walk comfort.

## Safety
This is training decision support, not diagnosis. Concerning symptoms or significant injury signs warrant appropriate medical evaluation.
