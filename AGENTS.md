# Adaptive Land Prep

Existing iPhone-first 56-week PWA; never replace it. Today answers what to do next from recovery, training, nutrition and history. Preserve local data, Firebase per-user backup isolation, deliberate Day 1 and scientific integrity. Swimming is excluded; prefer rowing when impact is unnecessary.

Work on branches. Keep PRs coherent. Use focused regression tests per edit, one Consumer Audit release gate, then verify Pages and Consumer Audit against exact merged SHA. WebKit simulation is not physical-iPhone testing. Do not invent training doses or ingredient macros. Distinguish incomplete nutrition logging from confirmed low intake. Preserve noisy-signal filtering and established 14-day trend guardrails.

App is plain app.js/index.html/styles.css, with Firebase integration in cloud.js. Tests are tests/*.test.cjs; permanent WebKit and Firebase checks are .github/workflows/ui-audit.yml. Prefer meaningful persistence/behavior tests; avoid repeated broad audits. Keep docs/PROJECT_STATE.md concise and current. Never record secrets or private athlete records.
