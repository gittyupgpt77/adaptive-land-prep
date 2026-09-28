# Adaptive Land Prep — data-source contract

## Principle
Assign one authoritative source per data type. Do not average conflicting devices/apps. If sources disagree materially, surface the conflict and prefer the authority listed here until the user changes it.

## 1. Curriculum and policy authority
**Project files are authoritative** for:
- 56-week curriculum
- phase gates and weekly ceilings
- adaptation rules
- fat-loss/nutrition change-control policy
- current private Journey state

Memory is a convenience layer only. It should remember the broad objective and the instruction to consult these files; it should not be trusted as the exact curriculum database.

## 2. COROS — authoritative training/recovery telemetry
Use COROS for:
- recorded activities and sport type
- activity duration, distance, pace/speed, cadence, elevation
- laps/segments and FIT files when detailed analysis is needed
- running/training load assessment
- recovery status
- sleep overview
- sleep HRV and COROS HRV baseline
- resting HR trend
- stress when relevant
- fitness assessment, threshold pace and COROS performance estimates
- COROS training schedule and workout library
- writing/scheduling supported run, trail-run and cycling workouts when useful

Do not use COROS to infer:
- pain
- focal bone pain
- altered gait
- subjective fatigue
- whether a ruck “felt comfortable”
- precise food intake
- private policy decisions

If COROS has no data, say so; do not manufacture a normal baseline.

## 3. Foodnoms+ — authoritative nutrition ledger
Use Foodnoms+ as the primary food and supplement ledger because it combines detailed nutrient tracking with native Apple Health export.

For daily adaptation, use:
- calories
- protein
- carbohydrate
- fat
- fiber
- meal timing when available
- whether the day is complete versus partially logged

For nutrient-quality auditing, review when available:
- calcium, iron, magnesium, phosphorus, potassium, sodium, zinc, copper, manganese, selenium
- vitamins A, C, D, E, K, thiamin, riboflavin, niacin, B6, folate, B12 and choline
- omega-3 / omega-6 and useful nutrient balances
- iodine only when the underlying food/supplement records actually include it

Missing nutrient data is UNKNOWN, never zero. Database completeness varies by food record. Log supplements when practical so food-only and food-plus-supplement views can be separated and duplicated exposures / upper-limit issues can be reviewed.

### ChatGPT access path
Foodnoms can write nutrition data to Apple Health. ChatGPT Health can use data that connected nutrition apps make available through Apple Health when the user authorizes it. This is the preferred low-friction path:
**Foodnoms+ → Apple Health → ChatGPT Health**.

Do not assume every nutrient always survives that transport. Verify actual field availability after setup. If a required nutrient is not visible through Health, use a Foodnoms daily summary, CSV/export, or other Foodnoms report as the authoritative fallback.

Foodnoms also supports remote MCP for compatible AI clients, but it is not currently listed as a direct ChatGPT plugin; do not depend on an unavailable direct connector.

### Alternatives
Cronometer is a strong nutrient-analysis alternative but has a less certain automatic path into ChatGPT on iPhone. Prefer it only if the user values its reporting over the frictionless Apple Health bridge.
Calorie Tracker is a fallback for direct-in-ChatGPT logging only after confirming the needed fields are retained/retrievable. Do not maintain two co-equal food ledgers.

## 4. Health / Apple Health — secondary health-data bridge
When ChatGPT Health is available and connected, use Apple Health primarily for data that COROS does not own cleanly, such as:
- body weight from a connected scale
- other user-authorized health measurements or records
- nutrition data written by a richer food tracker, if exposed

Do not duplicate COROS sleep/HRV/activity into the decision simply because Apple Health also contains copies. COROS remains primary for COROS-recorded training/recovery telemetry unless the user changes the source hierarchy.

## 5. Micronutrients — periodic audit source
Daily training adaptation does not require a full vitamin/mineral panel. Periodically audit diet quality using a nutrition source that exposes food-level micronutrients (for example a detailed food-log export or Health-connected source if available).

Audit at least:
- calcium
- iron
- magnesium
- potassium
- sodium in training context
- zinc
- vitamin D
- folate
- vitamin B12
- vitamin C
- vitamin A
- vitamin E
- vitamin K
- iodine when data exists
- fiber

Unknown micronutrients remain unknown, never zero. Include supplements only when their actual doses are logged. Check upper-limit interactions before recommending additions.

## 6. User self-report — authoritative subjective/mechanical data
Ask only for information that cannot be retrieved automatically:
- current pain 0–10
- focal bone pain yes/no
- altered gait yes/no
- subjective fatigue if not otherwise supplied
- perceived performance normal/not normal
- session RPE if COROS cannot infer it
- post-session pain
- ruck pack weight if not encoded
- whether loaded walking felt comfortable
- grip test if being used
- unusual illness, heat exposure or circumstances likely to change interpretation

Prefer a compact check-in and avoid asking for COROS/ledger data already available.

## 7. Conflict rules
- Missing ≠ normal.
- Unlogged food ≠ under-eating.
- A wearable estimate ≠ measured energy expenditure.
- COROS recovery score is context, not a substitute for mechanical stop rules.
- One unusual HRV/RHR value is noisy until corroborated or persistent.
- Never let a generic AI-generated workout exceed the earned curriculum ceiling.
