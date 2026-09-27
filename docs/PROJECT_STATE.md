# Project state

## Verified production

Production `157a6670fc3b2bc0fd434ed128ab81cd132debd2` (PR #26), assets v76. Exact-main GitHub Pages and Consumer Audit passed.

Current verified functionality includes the 56-week local-first Journey, guided daily flow, recovery/readiness adaptation, exercise/set history and corrections, calculated ingredient-backed meals and meal corrections, private composition/RMR inputs, conservative history-informed strength guidance, Firebase per-user automatic backup/recovery, Journey archives and versioned PWA caching. General Aerobic/Endurance work no longer borrows a rowing-specific heart-rate range; explicit Run and Row prescriptions retain their own measured ranges.

## Verification

- Source suite: 184/184 passing.
- Consumer Audit: 213/213 iPhone-sized WebKit checks, 0 runtime errors.
- Firebase emulator/recovery browser regression: passed.
- Automatic cloud backup browser regression: passed.
- Exact-main Pages deployment: passed.
- Live production assets previously matched the merged release flow; physical-iPhone acceptance remains outstanding because WebKit simulation is not a physical iPhone.

## In-progress QA

- PR #27 adds a permanent real-browser PWA acceptance: install/control the service worker, remove the origin server, reload from cached shell with local state preserved, then reconnect. This is test infrastructure only until merged.
- PR #28 addresses two defects found by visually reviewing exact-main audit artifacts: pale cloud/account text on white Settings cards, and missing session-feedback validation appearing behind the fixed tab bar and disappearing too quickly. Assets v77 are not production until exact-main release gates pass.

## Remaining limits / issue register

1. Daily hard-work doses remain unresolved where curriculum lacks calibrated prescriptions. Show the existing easy fallback; do not invent intervals or escalate from weekly ceilings.
2. Energy estimates, fat-transfer reference, performance gates and readiness cannot certify tissue adaptation or injury-free BUD/S readiness. The athlete-directed fat-loss/calorie policy is change-controlled: surface evidence or safety conflicts and discuss them with the user before changing encoded policy.
3. Iodine and some nutrient data are absent; unlogged supplement doses and upper-limit interactions are not assessed. Food estimates do not certify nutritional adequacy.
4. Multiple archived Journeys can exceed storage capacity; never silently delete history. Existing safe failures and export remain available.
5. Physical-iPhone acceptance remains outstanding.

## Working discipline

Use this register, `AGENTS.md`, and `docs/WORK_HANDOFF.md` as durable project memory. Do not restart repository-wide investigation or speculative cleanup. Firebase remains authoritative; Supabase stays dormant. Preserve user data, explicit Journey/day semantics, noisy-signal filtering and the established trend guardrails. Standard Chat is the default for repository engineering; use Work only when the unresolved task materially requires interactive graphical browser/computer control. See `docs/NUTRITION_MODEL.md` for provenance and model limits; earlier checkpoints remain in git history.
