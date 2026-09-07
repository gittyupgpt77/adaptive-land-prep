# Adaptive Land Prep

Mobile-first 56-week adaptive land-preparation PWA.

Training data stays on-device until the athlete enables automatic private backup for their signed-in account. JSON export/restore remains available offline. No athlete data or secret keys belong in this repository.

## iPhone installation
Open https://gittyupgpt77.github.io/adaptive-land-prep/ in Safari and choose **Share → Add to Home Screen**.

The no-cost, no-routine-maintenance storage requirements are tracked in [the storage decision](docs/free-storage-decision.md). Firebase support is implemented with a guarded opt-in migration; [one-time Firebase setup](docs/firebase-setup.md) and production verification remain outstanding. Ordinary launches keep the existing provider until a successful Firebase backup. The Capacitor prototype is paused because free personal iPhone provisioning requires recurring reinstallation. The legacy backup behavior below describes Supabase.

## Private backup and recovery
Open **Program → View Recovery & Weight Trends → Private cloud backup**.
Create a backup account with email and password, confirm the email, then sign in. This account is separate from a Supabase dashboard login. Enable **Automatic Backup** once to associate this device's existing and future data with that account. Saved changes then back up automatically, including training history, nutrition and drafts, benchmarks, journey dates, tasks, and check-in inputs. There is no manual backup button. The app observes local changes every two seconds, coalesces nearby changes, retries connectivity failures with bounded backoff, and avoids unchanged uploads using a SHA-256 receipt. Offline changes remain local and retry when the app is online again. An iPhone PWA cannot promise uploads while closed; reopening resumes pending work. Switching accounts requires a new explicit device/account association before uploads can begin.

On another device, sign in to the same account, tap **Browse & Recover**, and select a version. Recovery validates the snapshot, asks for confirmation, and saves the current device state as an immutable **Before recovery** snapshot before replacing local data. A failed safety upload aborts recovery. Quota failures roll back local writes. Signing in/out never clears or imports training data. Signing out leaves local training history available to anyone using that device. Every upload explicitly identifies its destination account.

Snapshots are append-only: a blank or older device cannot overwrite an earlier snapshot. Older snapshots are paginated, not automatically deleted. Storage consumption grows with changed-data snapshots. This release does not implement retention; production scaling should add an owner-safe retention policy. The existing database labels automatic snapshots `manual` internally for migration compatibility; that legacy label does not control their behavior. Backups are private through database authorization; this is not end-to-end encryption against the project administrator.

## Supabase configuration
Project: `pfpfttgfzmpexlbezmcs`. Only the public `sb_publishable_…` key is bundled in `cloud.js`; it grants no unauthenticated table access. Do not add service-role keys, secret keys, database passwords, access tokens, or exported athlete backups to GitHub or GitHub Pages.

Applied migrations are in `supabase/migrations`. `athlete_backups` has forced row-level security, explicit authenticated-only SELECT/INSERT grants, per-user ownership checks, anonymous-identity denial, an ownership/date index, and bounded payload envelopes. Clients have no UPDATE/DELETE privileges. Sessions are managed by pinned Supabase JS and excluded from exports. The service worker caches only public shell assets and approved exercise images; auth and private API responses bypass it.

For confirmation and password-reset emails, Supabase **Authentication → URL Configuration** must have Site URL and an allowed Redirect URL of `https://gittyupgpt77.github.io/adaptive-land-prep/`. The connector does not expose auth configuration, so these settings cannot be inspected or changed by the repository code. Keep email confirmation enabled. Configure production SMTP if expanding beyond the built-in email sender's limits. Email delivery and redirect completion require a real mailbox and have not been exercised by automated tests.

## Development and verification
`npm ci` installs pinned dependencies. `npm run build:cloud` reproduces the committed offline SDK bundle. `npm test` runs backup, restore, nutrition, and service-worker regressions. Consumer Audit also runs WebKit at iPhone dimensions. `supabase/tests/backup-isolation.sql` runs isolated database role tests in a transaction and rolls back all fixtures. It was executed against the configured Supabase project; public REST access was separately confirmed to return HTTP 401. No real athlete records are used in testing.
