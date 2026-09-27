# Nutrition calculation milestone — not a live prescription

Status: offline calculation core and traceable menu audit. The browser still uses the legacy plan. Do not connect this module to the daily loop until the release blockers below are closed. No personal health measurements or supplement-use history belong in this document or the food catalog.

## Confirmed failures in the live system

- Week 25 switches the baseline from 2,250 to 3,400 kcal (4,000 for title-matched demanding sessions), independent of observed energy needs.
- Macro energy does not consistently reconcile with calorie targets.
- Meal calories are assigned estimates, not totals derived from the quantities shown.
- Alternatives such as beef/salmon and potato/rice have no portion-equivalence calculation.
- Supplement nutrients are not counted, and there is no micronutrient audit.

## Proposed all-Journey rule boundary

Use the existing macro-phase map, without changing the training curriculum:

| Weeks | Objective | Proposed energy rule |
| --- | --- | --- |
| 1–16 | Fat loss with lean tissue and recovery protected | A modest planned deficit, limited by workload fueling; suspend the deficit during recovery concerns |
| 17–32 | Engine and loaded-work development | Maintenance estimate plus the needs of actual prescribed work; no deliberate deficit by default |
| 33–44 | Specific preparation | Same calculation, with workload determining carbohydrate needs |
| 45–52 | Peak work capacity | Fuel the actual workload, never an assumed extreme weekly mileage |
| 53–56 | Taper | Reassess energy for reduced work; retain recovery nutrition; no automatic return to fat-loss intake |

`nutrition-core.js` implements a **draft product policy**, not a clinically validated individualized prescription: 15% requested deficit during Foundation; protein 2.2 g/kg during Foundation and 2.0 g/kg afterward; fat allocation 25% of energy. These point choices require review during integration. They are not claims of optimal fat loss, tissue adaptation, or injury prevention. Existing 2.7 lb/week guardrail is not a recommended loss rate.

The workload carbohydrate reference bands are 3–5, 5–7, 6–10, and 8–12 g/kg/day for light, moderate, high and very high training, from the AND/DC/ACSM position statement. The prototype uses each lower edge as a planning constraint. These are not universal clinical minimums. An unmet fuel constraint raises the candidate energy target and reports that the requested deficit cannot be maintained under those assumptions.

Inputs are prescription week, representative body mass, an explicitly established maintenance-energy estimate for the day's total activity, quantified workload class, and recovery state. The activity estimate already includes exercise: do not add exercise calories again. RMR alone is insufficient. Missing energy/workload produces an incomplete result, not a made-up target. Whole-gram macro energy reconciles by construction. Food-label calories need not equal simple 4/4/9 arithmetic because of labeling conventions, fiber and food-specific energy factors.

A date-dependent calorie table is not the final architecture. The same workload/energy inputs at Weeks 24 and 25 produce the same target. Future calendar previews must be labeled estimates and may not claim knowledge of future body mass, recovery, or earned workload.

## Ingredient data and calculations

`data/nutrition/foods.json` contains 21 exact USDA SR Legacy records and two manufacturer-label whey records. Each row retains its source and gram basis. Weigh cooked meat, rice, lentils and potato; dry oats/chia; raw produce and egg ingredients. Never apply raw composition to cooked weights. The salmon record is **farmed Atlantic, cooked**, not wild salmon. A wild-salmon option needs its own source row.

Manufacturer labels inspected 2026-09-27:
- Dutch Chocolate: 41 g, 150 kcal, 25 g protein, 4 g carbohydrate, 4 g fat, 2 g fiber, 20 ug vitamin D, 146 mg calcium, 4 mg iron, 250 mg sodium, 341 mg potassium.
- Creamy Vanilla: 36 g, 140 kcal, 25 g protein, 2 g carbohydrate, 3.5 g fat, 2 g fiber, 20 ug vitamin D, 130 mg calcium, 260 mg sodium, 140 mg potassium. Iron is unreported, not zero.

Exact label-image URLs are retained in the catalog. Reformulations require a new catalog version; saved meals retain their original nutrient snapshots. Never add BCAAs/leucine again to the label's protein amount.

Unknown nutrients remain null. Reports show known subtotals and completeness independently: a known subtotal above a reference supports coverage; an incomplete subtotal below it does not diagnose deficiency. Iodine is absent from these source records. Missing iodine must not display as zero intake. This is a selected-nutrient audit, not proof of total nutritional adequacy or bioavailability.

## Candidate menu audit

`data/nutrition/menu-candidates.json` contains two four-meal candidates using eggs/oats/fruit, chicken/lentils/rice/vegetables, yogurt/berries/almonds/whey, and either salmon or sirloin with potato and vegetables. They are **audit candidates**, not approved daily portions. Daily totals do not yet solve for every target. Run `node scripts/audit-nutrition.cjs` to reproduce totals.

The added dairy, legumes, almonds, fruit and defined vegetable portions improve the candidate's nutrient coverage without relying on irregular supplementation. Vitamin D in the whey must be counted alongside any separate D3 or multivitamin. No collagen, bilberry recovery benefit, or automatic supplement regimen is assumed. Fiber is comparatively high; tolerability and placement away from training still need consideration.

References in the audit are adult male 19–30 RDA/AI values, not personalized diagnoses or intake upper limits. Niacin is conservatively reported as preformed niacin rather than adding tryptophan equivalents. Sodium is reported without prescribing a fixed sweat-replacement dose. The audit does not yet implement upper-limit checks, iodine coverage, all essential nutrients, or supplement interactions.

## Integration/release blockers

1. Establish the private profile and energy-estimation/calibration method. Do not hardcode an athlete's RMR or body measurements into public source. The prospective model needs explicit uncertainty and trend validation, not 3,500-kcal back-calculation.
2. Quantify workload from the prescription, with a safe unresolved state where daily doses are absent. Do not classify solely by session name or weekly ceilings. Resolve Foundation deficits against actual training and review phase-transition behavior.
3. Portion solver: satisfy energy/macros using sensible ingredient bounds while checking nutrient coverage. Do not multiply all vegetables/protein indefinitely to meet carbohydrate demand. Freeze eaten snapshots and solve only the uneaten remainder. Include nutrition during prolonged training within daily totals.
4. Close iodine and remaining nutrient-data gaps; add upper-limit checks and product-specific supplement doses before recommendations. Do not prescribe supplements merely because a source value is missing.
5. Connect one-tap confirmation to known meal macros; retain null for old templates. Preserve old histories, raw/cooked descriptions, Journey isolation and restore validation. No backfilling old intake with newly calculated values.
6. Run focused integration tests and one milestone consumer/release gate only after the live feature is coherent. This offline milestone does not warrant a Pages release or browser audit.

## Sources

- USDA downloadable datasets: https://fdc.nal.usda.gov/download-datasets/ ; selected exact FDC IDs and source URLs are in the catalog.
- AND/DC/ACSM 2016 joint position statement, DOI 10.1249/MSS.0000000000000852: https://drugfreesport.org.za/wp-content/uploads/2018/04/Position-stand-on-Nutrition-Athletic-Performance-ACSM-2016-1.pdf
- IOC 2023 REDs consensus: https://bjsm.bmj.com/content/57/17/1073
- NIDDK Body Weight Planner: https://www.niddk.nih.gov/bwp
- National Academies DRI summary tables (2019): https://www.ncbi.nlm.nih.gov/books/NBK545442/
- NIH nutrient references: https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/
- AIS collagen evidence category: https://www.ais.gov.au/nutrition/supplements/group_b
