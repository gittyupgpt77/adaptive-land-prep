# Project state

## Release candidate

Branch `feat/nutrition-calculation-core`, assets v75. Not deployed yet. Latest verified production remains `fc66124a0506f15d6f4de7bad333d6785e779b1f` (PR #24, exact-main Consumer Audit and Pages passed).

Implemented in this candidate:
- Four ingredient-backed base meals, additional fueling capacity, exact weighed quantities, known macros and preparation guidance.
- One-tap confirmation, portion/skip/manual deviations, and food-level edits; frozen receipts preserve quantities and sources. Only uneaten portions recalculate. Unknown intake stays unknown. Legacy started days finish their original plan.
- Private dated/undated composition and RMR records, optional endpoints, explicit provisional energy estimates, phase transitions and existing recovery guardrails. No personal health values in source.
- Food-only micronutrient reference comparisons; missing data and unlogged supplements remain explicit.
- Strength repeat/build-within-range guidance from comparable recorded sets and pain feedback, never automatic load escalation.
- Compressed food receipts with legacy compatibility and bounded import decompression, included in existing Firebase backups and Journey archives.

Foundation already shipped: persistent explicit day close; reopen resumes current task; breakfast before training; safe corrections; persistent Journey epochs; latest two archives visible with older records retained; kg/lb grip; neutral no-workout response; corrected exercise imagery; set recording/edit/repeat; measured modality-specific HR guidance.

## Verification

Source suite: 183 passing after integration and bounded-storage checks. Final Consumer Audit pending; new browser acceptance covers measurements, ingredient correction, reopening and actual restore validation. Local WebKit cannot launch because system libraries are absent; use the permanent GitHub gate rather than repeat local installation investigations. Do not call this release deployed until exact-main Pages and Consumer Audit pass.

## Remaining limits / issue register

1. Daily hard-work doses remain unresolved where curriculum lacks calibrated prescriptions. Show the existing easy fallback; do not invent intervals or escalate from weekly ceilings.
2. Energy estimates, fat-transfer reference, performance gates and readiness cannot certify tissue adaptation or injury-free BUD/S readiness. Independent review of aggressive restriction and later peak workloads remains outstanding.
3. Iodine and some nutrient data are absent; unlogged supplement doses and upper-limit interactions are not assessed. Food estimates do not certify nutritional adequacy.
4. Multiple archived Journeys can exceed storage capacity; never silently delete history. Existing safe failures and export remain available.
5. Physical-iPhone acceptance remains outstanding; iPhone-sized WebKit is simulation.

## Working discipline

Use this register, focused changes and one coherent release gate. Do not restart repository-wide investigation or speculative cleanup. Firebase remains authoritative; Supabase stays dormant. Preserve user data, explicit Journey/day semantics, noisy-signal filtering and the established trend guardrails. See `docs/NUTRITION_MODEL.md` for provenance and model limits; earlier checkpoints remain in git history.
