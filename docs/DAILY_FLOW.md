# Daily flow

Today is derived from confirmed records, not an independently saved screen number. The persisted daySession date keeps an unfinished day open across midnight. Reloading, offline operation and cloud recovery reconstruct the next task from the same evidence used by adaptation. This extends the existing application; it does not create a separate onboarding app.

| Condition | Primary experience |
| --- | --- |
| Journey not deliberately started | Baseline and explicit Day 1 |
| No current-day check-in | Hello with four measured inputs; then recovery taps; then pain/movement |
| Check-in saved, no session response | Today's adapted session and its one primary start action |
| Session response recorded, intake unfinished | Next prescribed meal with confirmation as eaten |
| Session response and intake complete | Summary with explicit End day |
| Day explicitly closed | Rest state; a later-date app opening begins the next morning |

## Morning transaction

The greeting is the first task: HRV, resting HR, sleep hours and weight are immediately editable. Usual-value baseline fields remain available in the full edit sheet, but do not compete for attention in the guided entry. Subjective recovery and safety checks are disclosed in two subsequent steps. Continue never silently confirms a measured value while the athlete is typing. Back preserves input.

Save & continue validates required answers, enters a saving lock, calculates the existing adaptation, and writes one dated check-in into the existing on-device record store. Only then does the controller recompute the daily state and reveal its session. A second save replaces that day's record rather than appending another one. A failed write retains the form with a retry message and releases the lock. IndexedDB mirroring and the existing private cloud backup operate separately; this transition does not claim cloud synchronization has finished.

The routing rule is centralized in advanceDailyFlow. Completing the session opens nutrition directly; finishing intake opens the day summary. A partial or skipped session is still a recorded response. Incomplete intake never counts as confirmed under-eating. Historical corrections do not advance the current day's screen. Saved check-ins remain explicitly editable.

## Motion and control

The next task appears with a 220 ms fade and eight-pixel upward movement. It never waits for an animation callback or an artificial loading timer. Reduced-motion preference removes this transition. Focus moves to the new heading without scrolling away from the task. No celebratory overlay, automatic keyboard opening, countdown, sound or mandatory menu choice is needed. Existing tabs remain optional access to history, settings and exceptions.

The greeting displays its task date, training week out of 56, phase, and a progress rail. Calendar time remains distinct from the active task date. Records carry their task date plus recordedAt when logged later. A carryover training directive says to record what actually happened, not repeat a workout to catch up.

Morning drafts carry their date. Same-day unfinished measurements survive reopening; old draft measurements are not offered as today's answers when no current check-in exists. Confirmed history is preserved. Reopening an unfinished guided form says Let’s continue, with its measurements populated for review rather than silently completing it or repeating Hello. Opening or returning to the Home Screen app routes directly to the unfinished daily task. An ended day stays closed on the same date; only a later-date opening starts another morning.

## Remaining boundaries

This is a daily sequence, not a clock-based scheduler: it does not yet infer training time or route a breakfast before an afternoon session. Nutrition can be opened whenever eating actually occurs. Future scheduling must model intent and due time explicitly without marking future tasks done. Baseline onboarding still requires deliberate Journey activation. No new physiological thresholds or nutrient prescriptions are introduced by this routing change.
