import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { webkit } from 'playwright';

const origin = 'http://127.0.0.1:8081';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function startServer() {
  const child = spawn('python3', ['-m', 'http.server', '8081'], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    if (child.exitCode !== null) throw new Error('Temporary PWA server exited before startup');
    try {
      const response = await fetch(origin + '/');
      if (response.ok) return child;
    } catch {}
    await sleep(100);
  }
  child.kill('SIGTERM');
  throw new Error('Temporary PWA server did not start');
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([once(child, 'exit'), sleep(3000)]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

const requireState = (condition, message) => {
  if (!condition) throw new Error(message);
};

let server = await startServer();
const browser = await webkit.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    serviceWorkers: 'allow'
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable');
    await navigator.serviceWorker.ready;
  });
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) {
    await page.reload({ waitUntil: 'networkidle' });
  }

  requireState(await page.evaluate(() => !!navigator.serviceWorker.controller), 'Online reload is not controlled by the service worker');
  requireState(await page.locator('#journeyStartCard').isVisible(), 'Fresh app shell did not render before offline test');

  await page.evaluate(() => {
    localStorage.setItem('pwa-offline-sentinel', 'kept');
    localStorage.setItem('input_hrv', '61');
  });

  // Remove the network origin entirely. A successful reload can now only come
  // from the installed service worker and its cached application shell.
  await stopServer(server);
  server = null;
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.locator('#journeyStartCard').waitFor({ state: 'visible', timeout: 5000 });

  const offline = await page.evaluate(() => ({
    controlled: !!navigator.serviceWorker.controller,
    sentinel: localStorage.getItem('pwa-offline-sentinel'),
    hrv: localStorage.getItem('input_hrv'),
    appLoaded: typeof renderAll === 'function',
    stylesLoaded: document.styleSheets.length > 0,
    title: document.title
  }));

  requireState(offline.controlled, 'Offline reload lost service-worker control');
  requireState(offline.sentinel === 'kept', 'Offline reload lost local device state');
  requireState(offline.hrv === '61', 'Offline reload lost saved athlete input');
  requireState(offline.appLoaded, 'Offline reload did not execute the application shell');
  requireState(offline.stylesLoaded, 'Offline reload did not restore cached styles');
  requireState(offline.title === 'Adaptive Land Prep', 'Offline reload returned the wrong document');

  server = await startServer();
  await page.reload({ waitUntil: 'networkidle' });
  requireState(await page.locator('#journeyStartCard').isVisible(), 'App did not recover after reconnecting');
  requireState(await page.evaluate(() => localStorage.getItem('pwa-offline-sentinel') === 'kept'), 'Reconnect changed local state');

  if (pageErrors.length) throw new Error('Runtime page errors during PWA acceptance: ' + JSON.stringify(pageErrors));
  console.log('PWA_OFFLINE_ACCEPTANCE passed');
} finally {
  await browser.close();
  await stopServer(server);
}
