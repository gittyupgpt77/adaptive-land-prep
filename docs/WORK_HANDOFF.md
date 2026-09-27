# Chat / Work handoff

Adaptive Land Prep uses the cheapest capable execution surface rather than treating Work as the default.

## Default: standard Chat

Stay in standard Chat for repository inspection, GitHub edits, focused code review, tests and CI investigation, release-state documentation, scientific/source review, and planning. These tasks do not require a graphical browser and should not consume scarce Work usage merely because they are engineering tasks.

## Switch to Work only for an unresolved observation gap

Use Work when the next decision genuinely depends on interactive graphical browser/computer control that standard Chat cannot reproduce reliably, especially:

- a deployed end-to-end consumer walkthrough;
- visual hierarchy, scrolling, touch-target, keyboard, safe-area or sheet behavior;
- runtime behavior that requires clicking through the live PWA while observing console/network state;
- an authenticated browser flow that the permanent CI gate cannot validate.

WebKit CI remains the permanent deterministic gate. Work is an acceptance/observation tool, not a substitute for source control or tests.

## Before switching

1. Update `docs/PROJECT_STATE.md` with the current main SHA, deployment state, verification state, and unresolved objective.
2. Preserve the current architecture and user data.
3. Do not silently change the athlete-directed fat-loss/calorie policy or personal-health assumptions. Surface a conflict and discuss it with the user before changing encoded policy.
4. Give the user a paste-ready handoff prompt. Do not make the user reconstruct project context.

## Work handoff prompt template

Continue the existing Adaptive Land Prep project; do not create or replace the application.

Repository: https://github.com/gittyupgpt77/adaptive-land-prep
Deployed PWA: https://gittyupgpt77.github.io/adaptive-land-prep/

First read `AGENTS.md` and `docs/PROJECT_STATE.md` from the repository and treat them as authoritative. Verify the current main SHA recorded there before acting.

Your task is acceptance testing, not speculative redesign. Open the deployed PWA and perform the specific unresolved consumer walkthrough described in `docs/PROJECT_STATE.md` using synthetic test data. Click through the real UI, inspect visual behavior and runtime/console/network evidence when available, and report only reproducible defects. Preserve existing user data and architecture. Do not alter the athlete-directed fat-loss/calorie policy, priority hierarchy, guardrails, or personal-health assumptions without first surfacing the conflict and discussing it with the user.

If interactive browser control repeatedly fails, stop retrying rather than consuming the remaining Work allowance. Record the exact browser failure and return the task to standard Chat. Do not respond to browser-tool failure with an architectural rewrite.

## Fallback if Work browser remains unreliable

Return to standard Chat for source/CI work. If the unresolved issue still requires a persistent interactive browser, use Cursor Agent Browser as the first external fallback. Cline is secondary. Moving to either tool is a QA/execution-environment change, not permission to migrate the application architecture.
