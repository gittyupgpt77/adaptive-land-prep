# Project state

## Status — archived

Product development stopped by explicit user decision on 2026-09-27. Preserve this repository as an implementation/provenance experiment. Do not resume product feature work unless the user explicitly reverses that decision.

The active operating system is now ChatGPT-native. Its durable public doctrine is in `docs/chatgpt-native/`:

- `CURRICULUM.md` — exact 56-week curriculum, blocks, weekly ceilings, day templates and phase exit criteria.
- `ADAPTATION_RULES.md` — systemic/mechanical/fueling guardrails and fat-loss policy change control.
- `DATA_SOURCES.md` — source hierarchy for COROS, nutrition, Health and self-report.
- `DAILY_PROTOCOL.md` — how ChatGPT should produce the daily directive and weekly review.
- `CURRENT_STATE_TEMPLATE.md` — template for the private live Journey state; never populate private athlete metrics in this public repository.

## Final implementation checkpoint

Main application code remains a working historical implementation of the 56-week iPhone-first PWA. The repository includes local-first Journey state, readiness adaptation, training history, calculated nutrition, Firebase backup/recovery, versioned PWA caching and the real-browser offline acceptance gate.

The last product changes reached assets v77 at main commit `b45403838d1fc9685cbea113a704c71dff83a754` before archival documentation. Earlier exact-main v76 Consumer Audit and Pages passed; PR #27 added a passing real-browser service-worker/offline/reconnect gate; PR #28 fixed artifact-discovered readability/validation issues and advanced v77. No further product QA is required for the archived experiment unless development is explicitly resumed.

## Operational doctrine

The ChatGPT-native system should:
- use Project files, not Memory, as the exact curriculum/policy source;
- use COROS as the primary training/recovery telemetry source;
- use Foodnoms+ as the preferred authoritative nutrition ledger because it combines micronutrient tracking with Apple Health export; use Cronometer as a reporting alternative and Calorie Tracker only as a fallback;
- use Health/Apple Health only for assigned non-duplicative fields when available;
- obtain subjective/mechanical data directly from the user;
- use Foodnoms+ → Apple Health → ChatGPT Health as the preferred nutrition transport, while verifying which fields actually arrive; use Foodnoms reports/exports for any missing micronutrient detail; missing nutrient fields remain unknown, never zero;
- preserve the user's approved fat-loss/calorie policy as change-controlled and discuss conflicts before altering it;
- never interpret missing nutrition logging as confirmed under-eating;
- never invent hard-work doses or exceed weekly ceilings because recovery appears favorable.

Private health measurements, daily food logs and connected-account data do not belong in this public repository.
