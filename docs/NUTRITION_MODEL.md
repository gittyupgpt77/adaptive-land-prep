# Nutrition calculation milestone — not a live prescription

Status: offline calculation core and traceable menu audit; meal-level actual-intake UI is implemented on the development branch but not released. The browser still uses the legacy prescription plan. Do not connect this module to the daily loop until the release blockers below are closed. No personal health measurements or supplement-use history belong in this document or the food catalog.

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

`nutrition-core.js` implements a **draft product policy**, not a clinically validated individualized prescription: an explicitly agreed Foundation deficit (no default); protein 2.2 g/kg during Foundation and 2.0 g/kg afterward; fat allocation 25% of energy. These point choices require review during integration. They are not claims of optimal fat loss, tissue adaptation, or injury prevention. Existing 2.7 lb/week guardrail is not a recommended loss rate.

The workload carbohydrate reference bands are 3–5, 5–7, 6–10, and 8–12 g/kg/day for light, moderate, high and very high training, from the AND/DC/ACSM position statement. The prototype uses each lower edge as a planning constraint. These are not universal clinical minimums. A conflict between requested energy and these draft reference assumptions returns `needs-policy-review` with both values, without issuing a calorie target. Discuss the conflict before changing the fat-loss policy; neither silently raise calories nor silently discard the fueling concern. Missing Foundation policy returns `needs-fat-loss-policy`. A numerical deficit input is a calculation parameter, not medical approval or a recommendation.

Inputs are prescription week, representative body mass, an explicitly established maintenance-energy estimate for the day's total activity, quantified workload class, and recovery state. The activity estimate already includes exercise: do not add exercise calories again. RMR alone is insufficient. Missing energy/workload produces an incomplete result, not a made-up target. Whole-gram macro energy reconciles by construction. Food-label calories need not equal simple 4/4/9 arithmetic because of labeling conventions, fiber and food-specific energy factors.

A date-dependent calorie table is not the final architecture. The same workload/energy inputs at Weeks 24 and 25 produce the same target. Future calendar previews must be labeled estimates and may not claim knowledge of future body mass, recovery, or earned workload.

## Foundation priority and changing body composition

Foundation prioritizes fat loss, with lean-tissue retention and basic health/recovery as constraints. Performance optimization is secondary in this phase. Do not silently substitute a maintenance/performance objective or default deficit for the agreed goal. Training demand and dietary feasibility must be reconciled explicitly, not by treating general athlete carbohydrate bands as mandatory clinical minima.

`fatEnergyReference` computes fat mass × 31 kcal/lb/day from a paired body-mass/body-fat assessment. It recalculates with each supplied assessment; it is not a fixed initial allowance. The coefficient is a rounded historical model reference from Alpert (2005), not a measured individual rate, validated safe deficit, or prescribed intake. No automated calorie target is obtained by simply subtracting this value from RMR or maintenance. The eventual policy still needs to combine the agreed goal, energy estimate, intake feasibility and longitudinal response.

A baseline DEXA assessment and a later scale weight are not interchangeable with a fresh composition assessment. Preserve assessment date, method and paired measurements privately during integration. Any projection assuming unchanged lean mass must be labeled a projection; never silently count every pound lost as fat or hold the initial body-fat percentage constant. Do not publish athlete measurements in repository data. Body-fat/weight endpoints remain goals, not evidence of physiological readiness.

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

## Bounded portion calculation

`portionPlan` connects explicit targets to candidate meals. Fixed ingredients remain fixed; only ingredients with declared gram bounds can change. Bounds are draft culinary choices, not established safety limits. The bounded least-squares calculation rounds to declared gram increments and recalculates actual food totals afterward. Acceptance tolerances are 5% for calories and 10% for each macro: numerical comparison criteria, not nutritional adequacy or physiological safety thresholds.

Confirmed meals retain their full original ingredient/nutrient/source snapshots. Only unconfirmed meals are adjusted. Missing legacy intake or unknown food macros blocks calculation rather than treating them as zero. Duplicate/unknown meal identities and malformed targets/bounds are rejected. An already-completed day remains complete regardless of target fit; exceeding a target never deletes consumed food or removes remaining meals.

Outputs distinguish a macro-fitting `candidate`, `cannot-fit`, missing data, and an already `complete` day. `cannot-fit` means this bounded, rounded calculation did not find an acceptable result; it is not a mathematical proof that every possible menu is infeasible. Every output leaves nutritional adequacy explicitly unassessed. Saved-source calories and 4/4/9 target energy are compared with tolerances, not forced into false equality.

The previous 12-test checkpoint passed before the explicit-policy revision. Updated, not-yet-run cases include a 448-case matrix (56 weeks × four workload classes × two menus), recalculated residuals, fixed-food and gram-bound checks, frozen intake, incomplete data, over-target intake and completion. The updated cases require explicit policy, retain ordinary-target candidates, and distinguish policy conflicts from menus that cannot fit a supplied target. Verification is deferred to the final rescue gate at the user’s request. These cases are software verification, not a personalized prescription. Additional meal/training-fuel design and nutrient auditing remain required before live use. No full browser audit is needed for this unconnected calculation module.

## Integration/release blockers

1. Establish the private profile and energy-estimation/calibration method. Do not hardcode an athlete's RMR or body measurements into public source. The prospective model needs explicit uncertainty and trend validation, not 3,500-kcal back-calculation.
2. Quantify workload from the prescription, with a safe unresolved state where daily doses are absent. Do not classify solely by session name or weekly ceilings. Resolve Foundation deficits against actual training and review phase-transition behavior.
3. Portion solver foundation is implemented offline; higher-workload menu capacity and post-adjustment nutrient coverage remain unresolved. Satisfy energy/macros using sensible ingredient bounds while checking nutrient coverage. Do not multiply all vegetables/protein indefinitely to meet carbohydrate demand. Freeze eaten snapshots and solve only the uneaten remainder. Include nutrition during prolonged training within daily totals.
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

## Meal-level actual intake (development branch)

`nutrition-intake.js` separates the unchanged prescribed meal from a confirmed portion, replacement or explicit skip. Portion percentages require the same fraction of every ingredient; replacing individual foods uses a replacement meal record instead. Replacement calories are required and macros are optional. A skip is recorded zero intake, not missing logging. Empty/missing records never imply a completed day.

The existing `nutrition_DATE` object gains optional `mealEntries`, each referencing a confirmed prescribed meal ID. Backup validation rejects duplicate/orphaned entries and invalid amounts. One-tap prescribed confirmations and corrections feed actual totals; template macros remain unknown. Ingredient-backed snapshots will contribute their known macros when integrated. Full-day entries override meal totals and leave unspecified macros unknown. Undo removes the corresponding correction. Existing historical records are not rewritten.

The UI exposes corrections inside meal details, preserves changes in calendar history, and moves full-day overrides under disclosure. Save failure attempts restoration of the original nutrition, task and day-session values. Final release verification must exercise storage failure and cloud/archived Journey round trips; regression cases are prepared, not yet executed. Template energy remains approximate and this increment does not activate the draft target engine or automatically compensate for skipped meals.
