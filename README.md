# Adaptive Land Prep — preserved experiment

> **Status (2026-09-27): development stopped by user decision.** This repository is preserved as the final PWA experiment and as the provenance for the 56-week land-preparation doctrine. The active operating system has moved to a ChatGPT Project using COROS, Health/Apple Health, and a dedicated nutrition ledger.

Final product code remains intact. Do not delete or rewrite history merely because the application is no longer the primary interface.

The compact ChatGPT-native migration doctrine is in [docs/chatgpt-native](docs/chatgpt-native/):
- [Project instructions](docs/chatgpt-native/PROJECT_INSTRUCTIONS.md)
- [56-week curriculum](docs/chatgpt-native/CURRICULUM.md)
- [Daily decision protocol](docs/chatgpt-native/DAILY_DECISION_PROTOCOL.md)
- [Connected data contract](docs/chatgpt-native/DATA_CONTRACT.md)
- [Journey state](docs/chatgpt-native/JOURNEY_STATE.md)

## Final verified PWA state

Final main product commit before archival transition: `b45403838d1fc9685cbea113a704c71dff83a754` (assets v77). Exact-main Consumer Audit and GitHub Pages deployment passed. The app also retains the real-browser service-worker/offline acceptance added in PR #27.

The deployed PWA may remain available at https://gittyupgpt77.github.io/adaptive-land-prep/ as a historical/backup interface, but no continued product development is planned unless the user explicitly reverses this decision.

## Historical architecture

Adaptive Land Prep is an iPhone-first 56-week adaptive land-preparation PWA. Training data is local-first with optional private Firebase backup/recovery. The repository contains the full historical implementation, tests, nutrition model, service worker, and CI Consumer Audit.

No athlete secrets or private records belong in this public repository.
