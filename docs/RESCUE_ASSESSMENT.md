# Rescue assessment

Historical takeover assessment. Current implementation, verification status and remaining issues are maintained in `docs/PROJECT_STATE.md`; the percentage below is the original takeover estimate, not a current completion claim.

Verified against production and `main` at `58796831e42ce626d1ecdba080badf31ca284e41` on 2026-09-26 Pacific time.

## Architecture and data flow

The application is a small, maintainable static PWA: `index.html` and `styles.css` provide the shell; `app.js` owns curriculum, readiness, daily routing, nutrition and local persistence; `training-tools.js` records exercise work; `cloud.js` and `cloud-core.js` coordinate authenticated backup; Firebase/Firestore is the active private cloud store. Local storage is authoritative for adaptation, IndexedDB is a secondary mirror, and versioned service-worker assets support offline use.

Morning inputs → saved dated check-in → readiness decision → prescribed session → saved session response → confirmed nutrition → explicit End day. The persisted `daySession` date reconstructs the next task after reopening.

## Confirmed behavior

- Production files match current `main`; Pages and Consumer Audit passed for the exact commit.
- A live synthetic consumer walkthrough completed baseline → Journey start → breakfast → training → session response → remaining meals → End day.
- Reopening before End day resumed the evening task; reopening after End day stayed closed on the same date.
- Journey restart archives prior records, isolates the new Journey and preserves account identity.
- Focused foundation tests pass for daily continuity, guided saving, restart, restore and task routing.

## Broken or unreliable journeys

- The curriculum does not supply calibrated hard-session doses everywhere, so some future sessions correctly fall back rather than inventing precision.
- Nutrition is still template-based: ingredient totals, micronutrients and equivalent substitutions are not fully modeled.
- Strength records exist, but there is no safe autonomous progression engine.
- Exit gates mostly measure adherence and benchmarks; they do not prove connective-tissue or bone adaptation.
- Physical-iPhone behavior has not been verified; browser simulation and the live cloud walkthrough are not a substitute.

## Data and safety risks

- Aggressive energy targets and later peak workload need independent expert review before the app becomes the sole training authority.
- Journey archives remain preserved and can eventually increase backup size. The interface shows the newest two first and collapses older history; it does not silently delete it.
- Calendar-week progression can outpace demonstrated tissue adaptation. Readiness gates reduce risk but cannot certify injury-free readiness.

## Duplicate or conflicting systems

- Firebase is authoritative. Dormant Supabase source and migrations remain historical implementation residue and must not be reactivated accidentally.
- Local storage is authoritative while IndexedDB mirrors only selected records. This is deliberate but should eventually become one transactional persistence boundary.
- Today and the optional tab views expose the same records. Today remains the authoritative next-action controller.

## Definition of finished

1. The daily state machine survives reopening, midnight, backup restore and Journey restart without ambiguity.
2. Every prescribed session is executable or explicitly identifies the calibration needed before hard work.
3. Exercise work and response history support conservative, explainable progression without automatic unsafe escalation.
4. Nutrition provides ingredient-backed quantities, known macros/micronutrients and simple deviation handling.
5. Safety logic distinguishes acute mechanical danger from noisy systemic signals and never claims readiness certainty.
6. The complete journey passes automated iPhone-sized regression and a real-device acceptance pass.
7. Normal screens present one obvious action with consistent consumer-quality hierarchy.

## Completion estimate

Approximately **68% complete**. The daily foundation and backup model are substantially built; the largest remaining work is trustworthy training progression, nutrient-backed meal architecture, independent safety review and final consumer polish.
