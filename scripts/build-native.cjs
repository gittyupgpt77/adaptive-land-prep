const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'www');
fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target);
// Explicit public assets only: never copy repository metadata, env files or exports.
for (const name of ['index.html', 'styles.css', 'app.js', 'firestore-backup.js', 'cloud-core.js', 'autosave-core.js', 'cloud.js', 'vendor', 'assets', 'manifest.webmanifest']) {
  fs.cpSync(path.join(root, name), path.join(target, name), { recursive: true });
}
console.log('Built bundled web assets for the iOS evaluation shell.');
