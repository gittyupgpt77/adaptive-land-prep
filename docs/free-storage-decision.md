# Personal iPhone storage decision — 2026-09-07

## Required outcome

Keep the existing Home Screen app. Entries persist automatically on the device and copy automatically to private off-device storage when connected. A replacement phone must recover the whole journey. No subscription, billing account, manual daily backup, keepalive jobs, recurring app reinstallation, or routine backend administration.

The original decision below is preserved as context. Implementation has since been prepared with the owner's public Firebase configuration; see [Firebase setup](firebase-setup.md) for the implemented format, migration behavior, tests, and outstanding production setup. The replacement is not yet verified against the owner's live database.

## Verified starting point

GitHub main was `a00978583db560be54e3e1a35256e74fa38adbf7`. Consumer Audit run `34134063749` and Pages run `34134062857` succeeded. Live index.html, styles.css, app.js and service-worker.js matched the checkout byte for byte.

The deployed app uses localStorage plus opt-in automatic Supabase snapshots. The iOS simulator prototype is not installed on the athlete's phone. Supabase snapshots are append-only and have no retention policy: both inactivity pausing and unbounded snapshot growth remain obstacles to unattended free operation. Automatic upload solved a manual chore; it did not solve these obstacles.

## Selected direction

Use Firebase Authentication and **Cloud Firestore Standard edition on Spark**, with billing unlinked. This is a proposed replacement for Supabase, not another simultaneous routine backup destination. Do not use Firebase SQL Connect, Cloud Storage, Cloud Functions, managed database backups, or a Blaze upgrade for this feature.

Current published Spark/Firestore allowances: 1 GiB stored data, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, and 10 GiB outbound/month. No payment information is required. These are adequate-looking allowances for one athlete's text records, but must be validated against the implemented retention/write pattern before release. Free managed Firestore backups/PITR are **not** included; app recovery must use ordinary protected Firestore documents.

The reviewed Firestore pricing and quota documentation does not specify Supabase's one-week inactivity-pausing condition. This is not a guarantee that a third-party service can never change its terms, suffer an outage, or require exceptional account recovery. The product target is no routine maintenance under current service terms, not an impossible perpetual-service guarantee.

## Implementation requirements before switching

- Preserve current on-device records and keep old Supabase copies available until the new destination has acknowledged a complete upload and a separate clean-device recovery has passed.
- Use a stable, recoverable non-anonymous account. Bind the athlete's existing device data explicitly to that identity once. A different signed-in account must not inherit upload permission.
- Enforce authorization on the server for every read and write. For this personal deployment, restrict access to the intended owner's verified identity as well as the matching account path. Public web configuration is not a security boundary; never ship administrative credentials.
- Keep offline entry persistence independent of cloud availability. Pending changes resume on reopening/reconnection. Do not label queued or cached data as server-confirmed backup.
- Avoid copying an ever-growing full history on every form edit. Use bounded, versioned recovery with measured capacity and upload frequency. Firestore's 1 MiB document limit means the existing 9 MiB snapshot envelope cannot simply be placed into a single document. Use records/chunks with an atomic manifest and validate completeness before recovery.
- Retain the complete current journey while bounding redundant recovery versions. Do not confuse pruning old backup versions with truncating historical athlete records.
- Reject incomplete/corrupt recovery, preserve existing state before replacement, and handle account changes or concurrent device edits during network operations. A fresh or stale device must not silently replace the latest protected history.
- Surface a concise, truthful protection state in ordinary use: on-device only, upload pending, backed up, or action needed. One-time account setup can be necessary; a daily save action cannot.
- Keep billing disabled. Test quota exhaustion as a recoverable offline-style condition. No workaround should create billable resources or artificial activity.

## Release verification

Use synthetic full 392-day and multi-year histories to measure bytes and daily operations. Test security rules against signed-out, anonymous, other-user and owner sessions; interrupted writes; quota/network failures; app reload; stale/blank second devices; account switches; and recovery into an empty browser. Inspect 390×844 WebKit states. Then test the real configured project and one owner sign-in/backup/recovery flow before declaring the migration complete. A mocked transport or simulator compile is insufficient.

## Current blocker and one-time provisioning

Firebase project-management access is not exposed in the current workspace. The plugin directory returned no Firebase connector. GitHub access does not grant access to the owner's Google account. Do not imply that knowing a project ID or receiving public web configuration grants administrative access.

The owner must initially create a Firebase project on Spark, without connecting billing. Registering a Web app provides its public configuration. Firestore, Authentication, authorized domains, and reviewed security rules must then be configured through an authenticated administrative channel (or one-time console instructions if no supported connection exists). Do not ask the owner to paste service-account keys or passwords into chat.

At the time of this decision-only change, no Firebase project, migration, rules deployment, or replacement authentication flow had been implemented. Subsequent implementation status is recorded in [Firebase setup](firebase-setup.md).

## Sources checked

- https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- https://firebase.google.com/docs/firestore/quotas
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/web/setup
- https://developer.apple.com/help/account/basics/about-your-developer-account/
- https://developer.apple.com/help/account/membership/program-enrollment/
