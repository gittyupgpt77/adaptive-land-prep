import { webkit } from 'playwright';

const browser = await webkit.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  serviceWorkers: 'allow'
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

const requireState = (condition, message) => {
  if (!condition) throw new Error(message);
};

await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable');
  await navigator.serviceWorker.ready;
  if (navigator.serviceWorker.controller) return;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Service worker did not take control')), 5000);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
  });
});

await page.reload({ waitUntil: 'networkidle' });
requireState(await page.evaluate(() => !!navigator.serviceWorker.controller), 'Online reload is not controlled by the service worker');
requireState(await page.locator('#journeyStartCard').isVisible(), 'Fresh app shell did not render before offline test');

await page.evaluate(() => {
  localStorage.setItem('pwa-offline-sentinel', 'kept');
  localStorage.setItem('input_hrv', '61');
});

await context.setOffline(true);
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

await context.setOffline(false);
await page.reload({ waitUntil: 'networkidle' });
requireState(await page.locator('#journeyStartCard').isVisible(), 'App did not recover after reconnecting');
requireState(await page.evaluate(() => localStorage.getItem('pwa-offline-sentinel') === 'kept'), 'Reconnect changed local state');

if (pageErrors.length) throw new Error('Runtime page errors during PWA acceptance: ' + JSON.stringify(pageErrors));

console.log('PWA_OFFLINE_ACCEPTANCE passed');
await browser.close();
