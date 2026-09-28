# Connected Data Contract

## COROS — authoritative for training telemetry
Use for completed activities, sport/date/duration/distance, run pace/HR/cadence/elevation/laps, FIT detail, rowing, hikes/ruck activity records, strength activities when recorded, training-load assessment, recovery status, fitness assessment, COROS sleep HRV, schedule, workout library, and supported watch-workout scheduling. Do not ask the user to re-enter COROS data. Never infer pack weight from a hike/ruck unless separately recorded.

## ChatGPT Health / Apple Health — authoritative for non-COROS health aggregation
Use for body weight/body composition from connected scales, non-COROS measurements/workouts, and health records/labs when relevant. COROS wins for COROS-native workout/proprietary metrics; Health wins for measurements whose primary recorder is elsewhere. Never average conflicting duplicates just to make them agree.

## Nutrition — authoritative ledger: Cronometer
Cronometer is preferred because micronutrients matter, not merely calories/macros.
Daily adaptation needs: energy, protein, carbohydrate, fat, fiber, meal timing when available, and whether the day is complete.
Periodic nutrient-quality audit should inspect, when data exists: calcium, iron, magnesium, phosphorus, potassium, sodium, zinc, copper, manganese, selenium; vitamins A/C/D/E/K, thiamin, riboflavin, niacin, B6, folate, B12, choline; omega-3/omega-6 and useful nutrient balances; iodine only when source data actually includes it.
Missing nutrient data is UNKNOWN, never zero. Include supplements when practical so food-only and food-plus-supplement views can be separated and duplication/upper-limit risk can be reviewed.

### ChatGPT access boundary
There is no direct Cronometer plugin in the current ChatGPT plugin directory. Cronometer connects with Apple Health on iPhone, but do not assume its full nutrient report reaches ChatGPT Health.
Use live Health nutrition fields when actually exposed. For full micronutrient review, use a Cronometer Daily/Nutrition Report screenshot/export/paste when direct access is unavailable. Micronutrient audit can be periodic rather than gating every morning decision unless a specific concern is active.

### Fallback
Calorie Tracker may be used for direct-in-ChatGPT logging only after confirming the needed fields are retained/retrievable. AI-estimated entries are lower confidence than weighed/barcode/database entries. Do not maintain two co-equal food ledgers.

## Derived by ChatGPT
Earned week vs calendar week; weekly run/ruck/row totals versus ceilings; workload changes; recovery classification; 14-day weight trend; phase qualification/mastery; whether hard work has valid calibration; nutrition-policy conflicts and temporary fueling overrides.

## Never infer
Missing nutrition = zero; missing workout = skipped until sources checked; missing pack weight; COROS recovery = medical clearance; body-fat goal = BUD/S readiness; weekly ceiling = quota.
