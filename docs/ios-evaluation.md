# iOS migration evaluation

Decision: retain the working PWA while evaluating Capacitor reuse. The shell is a developer prototype, not a released native application or a durability solution. No paid service or Apple enrollment is enabled by this change.

`npm ci && npm run build:native && npx cap add ios` generates an Xcode project with bundled assets, not a remotely hosted WebView. `npx cap open ios` opens it on a Mac. GitHub Actions compiles an unsigned simulator application. There is no signed iPhone distribution yet.

## Gates before an athlete uses the native app

- Implement and test native database transactions (SQLite or equivalent), startup recovery, and migrations. Capacitor Preferences uses UserDefaults and is intended for lightweight settings, not the growing athlete history. Existing localStorage remains the source in this prototype.
- Implement an explicit, validated migration from the PWA's separate storage origin. Installing a native shell cannot read Safari/PWA data automatically. Cloud recovery already provides a guarded path, but must be exercised on real iOS.
- Implement native authentication link handling and test confirmation/reset on a physical device. Current email links target the PWA.
- Choose durable off-device recovery. Supabase free can pause after low activity; automatic writes during app use do not guarantee it stays active during a training break. No keepalive workaround or paid upgrade is assumed. Apple CloudKit is a candidate for an Apple-only app, but requires native integration, account and conflict handling. Native storage alone does not protect against device loss/uninstall.
- Verify offline cold launch, app termination immediately after an entry, interrupted database migration, phone replacement, conflicting devices, accessibility, and iPhone safe areas.
- Configure signing/distribution with the owner's Apple developer account only after these gates pass.

The current PWA improvement is automatic private versioned backup while the app runs, with local-first entries and reconnect retries. It does not promise iOS background execution or automatic merging between devices. Complete check-in/session actions remain intentional physiological records; backup is not a daily chore.

References: https://capacitorjs.com/docs/getting-started, https://capacitorjs.com/docs/apis/preferences, https://supabase.com/docs/guides/platform/free-project-pausing
