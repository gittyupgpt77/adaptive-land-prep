# Adaptive Land Prep

Mobile-first 56-week adaptive land-preparation PWA.

Training data stays on-device until the athlete explicitly chooses to upload a private cloud snapshot. JSON export/restore remains available offline. No athlete data or secret keys belong in this repository.

## iPhone installation
Open https://gittyupgpt77.github.io/adaptive-land-prep/ in Safari and choose **Share → Add to Home Screen**.

## Private backup and recovery
Open **Program → View Recovery & Weight Trends → Private cloud backup**.
Create a backup account with email and password, confirm the email, then sign in. This account is separate from a Supabase dashboard login. Tap **Back Up Now** to save this device's complete training history, nutrition and drafts, benchmarks, journey dates, tasks, and check-in inputs. Backups are manual; an iPhone PWA cannot promise background uploads while closed.

On another device, sign in to the same account, tap **Browse & Recover**, and select a version. Recovery validates the snapshot, asks for confirmation, and saves the current device state as an immutable **Before recovery** snapshot before replacing local data. A failed safety upload aborts recovery. Quota failures roll back local writes. Signing in/out never clears or imports training data. Signing out leaves local training history available to anyone using that device. Every upload explicitly identifies its destination account.

Snapshots are append-only: a blank or older device cannot overwrite an earlier snapshot. Older snapshots are paginated, not automatically deleted. Storage consumption grows with manual backups. Backups are private through database authorization; this is not end-to-end encryption against the project administrator.

## Supabase configuration
Project: `pfpfttgfzmpexlbezmcs`. Only the public `sb_publishable_…` key is bundled in `cloud.js`; it grants no unauthenticated table access. Do not add service-role keys, secret keys, database passwords, access tokens, or exported athlete backups to GitHub or GitHub Pages.

Applied migrations are in `supabase/migrations`. `athlete_backups` has forced row-level security, explicit authenticated-only SELECT/INSERT grants, per-user ownership checks, anonymous-identity denial, an ownership/date index, and bounded payload envelopes. Clients have no UPDATE/DELETE privileges. Sessions are managed by pinned Supabase JS and excluded from exports. The service worker caches only public shell assets and approved exercise images; auth and private API responses bypass it.

For confirmation and password-reset emails, Supabase **Authentication → URL Configuration** must have Site URL and an allowed Redirect URL of `https://gittyupgpt77.github.io/adaptive-land-prep/`. The connector does not expose auth configuration, so these settings cannot be inspected or changed by the repository code. Keep email confirmation enabled. Configure production SMTP if expanding beyond the built-in email sender's limits. Email delivery and redirect completion require a real mailbox and have not been exercised by automated tests.

## Development and verification
`npm ci` installs pinned dependencies. `npm run build:cloud` reproduces the committed offline SDK bundle. `npm test` runs backup, restore, nutrition, and service-worker regressions. Consumer Audit also runs WebKit at iPhone dimensions. `supabase/tests/backup-isolation.sql` runs isolated database role tests in a transaction and rolls back all fixtures. It was executed against the configured Supabase project; public REST access was separately confirmed to return HTTP 401. No real athlete records are used in testing.
