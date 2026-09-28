# Project state

## Status: FROZEN / PRESERVED EXPERIMENT

On 2026-09-27 the user explicitly chose to stop Adaptive Land Prep product development and move the operating system to ChatGPT directly.

The repository must be preserved intact as:
1. the historical software experiment;
2. provenance for the 56-week land-preparation curriculum and adaptation rules;
3. a fallback/reference implementation.

Do not resume feature work unless the user explicitly reverses this decision.

## Final verified PWA

Final product commit before the archival-transition documentation: `b45403838d1fc9685cbea113a704c71dff83a754`, assets v77.

Verified on exact main:
- GitHub Pages deployment: passed.
- Consumer Audit: passed.
- Real-browser service-worker/offline acceptance: passed after replacing Playwright's flaky synthetic offline switch with actual origin-server removal/restart.
- Firebase emulator/recovery regression: passed in the release-gate lineage.
- Automatic cloud backup browser regression: passed in the release-gate lineage.

PR #28 was merged and fixed the final artifact-discovered readability defects without changing training/nutrition prescriptions.

## Active successor

The active operating model is ChatGPT-native. Compact durable doctrine lives in `docs/chatgpt-native/`.

Source hierarchy:
1. `docs/chatgpt-native/CURRICULUM.md`
2. `docs/chatgpt-native/DAILY_DECISION_PROTOCOL.md`
3. `docs/chatgpt-native/DATA_CONTRACT.md`
4. `docs/chatgpt-native/JOURNEY_STATE.md`
5. live COROS / Health / nutrition data
6. Memory/conversation for broad context only

COROS is connected. Health/Apple Health connection remains to be confirmed. Cronometer is recommended as the authoritative nutrition ledger because micronutrient coverage matters; no direct Cronometer ChatGPT plugin is currently available, so full micronutrient review may require a Cronometer report/export when Health does not expose the necessary fields.

## Preserved policy boundary

The athlete-directed Foundation fat-loss/calorie policy is change-controlled. A model recommendation must not silently overwrite it. If evidence or a safety concern conflicts with the current policy, surface the conflict and discuss it with the user before changing the durable policy.

Swimming remains outside this 56-week land curriculum unless a separate coordinated swim track is explicitly created.

## Historical known limitations

These remain relevant when interpreting the archived implementation:
- unresolved hard-work doses require a calibrated prescription or easy fallback; never invent intervals;
- readiness/energy models are decision heuristics, not medical certification;
- nutrient databases may omit iodine/other fields; missing is unknown, not zero;
- physical-iPhone behavior is distinct from WebKit simulation even though the automated release gates passed.

Earlier development checkpoints remain in git history.
