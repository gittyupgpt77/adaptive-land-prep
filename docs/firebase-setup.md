# One-time Firebase setup

Project: `adaptive-land-prep`. Public Web app configuration is in `src/firebase.js`.

The code is implemented, but project administration cannot be performed with the public configuration. No real account, database rules deployment, real-email verification, or production recovery has been verified yet. Keep the Spark plan and leave billing unlinked.

## Console setup

1. Open Authentication (under Security or Build), then Sign-in method. Enable Email/Password, without enabling passwordless email links.
2. Open Firestore Database and create the **Standard edition**, default database. Choose a US location and **Production mode**. Do not enable a trial, Enterprise edition, billing, SQL Connect, Storage, or Functions. Production mode initially denies all client access.
3. Open `https://gittyupgpt77.github.io/adaptive-land-prep/?backup=firebase`. Go to Program → View Recovery & Weight Trends → Private cloud backup. Create an account and confirm its email using Firebase's hosted confirmation page, then sign in again. The existing Supabase account is separate.
4. In Authentication → Users, copy this account's **User UID**. Replace `REPLACE_WITH_YOUR_USER_UID` in `firestore.rules` with that exact UID. Paste the entire file into Firestore Database → Rules, and Publish. The UID is an identifier, not a password. Rules deny every other account, including other verified users. Do not use test-mode rules or `allow read, write: if true`.
5. Optionally apply the payload index exemption in `firestore.indexes.json` through the Firestore index settings. It avoids indexing compressed chunks; no query uses that field. Omitting the exemption does not grant access or prevent normal backup, but adds needless index storage.
6. In the app, enable automatic backup once for this account. Confirm the status reaches **Automatic backup is up to date**. Only a successful server acknowledgement selects Firebase for subsequent ordinary launches. Confirm recovery on a clean device/browser before retiring the old destination.

Email verification and password reset use Firebase's default hosted action handler; custom redirect URLs are not required for this implementation. Return to the original Home Screen app to sign in after confirming. Do not confuse its separate local storage with Safari's browser tab.

## Migration behavior

Before successful migration, ordinary launches retain Supabase. The explicit `?backup=firebase` setup link opens the new connection without deleting any local data. After a confirmed Firebase upload, a local provider preference selects Firebase on ordinary launches. On a replacement phone, use the setup link until Firebase becomes the globally configured default in a subsequent verified release. This release intentionally does not silently cut over every device before backend setup.

The link **Recover an older backup** opens `?backup=legacy` and retains access to the previous Supabase account and snapshots. Signing into either provider never imports or erases athlete records. Authentication, binding, and revision metadata are excluded from athlete exports by the existing storage-key allowlist.

## Storage and recovery design

The complete current athlete history is saved as gzip-compressed, base64-encoded chunks, together with an SHA-256 digest. A Firestore transaction commits all chunks and the snapshot manifest together. Recovery reads a consistent manifest/chunk set and verifies revisions, sizes, decompression bounds, hash, and the app's existing backup schema before replacement. Current device data is copied into a separate safety slot before a non-empty device is restored. A cloud change during recovery aborts the restore.

Sixteen ordinary versions and four before-recovery versions rotate automatically. These are complete snapshots, not a rolling limit on training days. At most eight 256 KiB compressed chunks are used per version, bounding encoded payload storage to roughly 54 MiB per permitted owner, plus small metadata/index overhead. The supported envelope is 6 MiB uncompressed and 2 MiB compressed; oversized backups leave device data unchanged and report the problem. This is bounded storage, not a claim that all conceivable histories fit indefinitely.

Writes are paced against the server's last-save time, with a 30-second minimum and additional spacing for larger copies. Unchanged data is acknowledged without creating a new copy, including after a lost upload receipt. Ordinary automatic writes remain below 12,000 document writes per 24 hours even under continuous changes within the supported envelope; this leaves headroom under the current 20,000/day allowance. Recovery operations are additional. No background scheduler, artificial activity, TTL job, or paid backup feature is used.

Different devices use the last acknowledged cloud revision to prevent stale state from silently taking over. An unrecognized or outdated device must recover a selected version first. This is backup and guarded recovery, not automatic multi-device merging.

## Tests

- `npm test`: app regression tests, Unicode/chunk integrity, oversize rejection, and a synthetic five-year history (1,830 days, approximately 1.35 MiB before compression and 27 KiB after; synthetic records are highly repetitive).
- `npm run test:firebase`: real Firestore emulator authorization and transaction tests, including large snapshots, rotation, stale devices, clean-device recovery, and interrupted writes. The test replaces the UID placeholder with `owner` only inside its isolated ruleset.
- `npm run test:firebase-browser`: actual Firebase Auth and Firestore SDKs against local emulators in iPhone-sized WebKit. It builds an ephemeral test bundle; the production bundle contains no emulator switch.

Tests exercise the SDK, app and rules against emulators. They do not verify production account configuration, real email delivery, the owner's browser installation, or future service availability.

References: https://firebase.google.com/docs/auth/web/password-auth, https://firebase.google.com/docs/auth/web/manage-users, https://firebase.google.com/docs/firestore/quickstart, https://firebase.google.com/docs/firestore/quotas
