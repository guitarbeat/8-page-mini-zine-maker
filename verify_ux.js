const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the local server
  await page.goto('http://127.0.0.1:8080/index.html');

  console.log('Verifying initial UX state...');

  // Check Print Button
  const printTitle = await page.getAttribute('#printBtn', 'title');
  const printKeys = await page.getAttribute('#printBtn', 'aria-keyshortcuts');
  console.log(`Print Button Title: ${printTitle}, aria-keyshortcuts: ${printKeys}`);

  // Check Export Button
  const exportTitle = await page.getAttribute('#exportPdfBtn', 'title');
  const exportKeys = await page.getAttribute('#exportPdfBtn', 'aria-keyshortcuts');
  console.log(`Export Button Title: ${exportTitle}, aria-keyshortcuts: ${exportKeys}`);

  // Check Upload Zone
  const uploadTitle = await page.getAttribute('#upload-zone', 'title');
  const uploadKeys = await page.getAttribute('#upload-zone', 'aria-keyshortcuts');
  console.log(`Upload Zone Title: ${uploadTitle}, aria-keyshortcuts: ${uploadKeys}`);

  // Check Theme Toggle
  const themeTitle = await page.getAttribute('#themeToggle', 'title');
  const themeKeys = await page.getAttribute('#themeToggle', 'aria-keyshortcuts');
  console.log(`Theme Toggle Title: ${themeTitle}, aria-keyshortcuts: ${themeKeys}`);

  // Check Toast Container
  const toastLive = await page.getAttribute('#toast-container', 'aria-live');
  const toastAtomic = await page.getAttribute('#toast-container', 'aria-atomic');
  console.log(`Toast Container aria-live: ${toastLive}, aria-atomic: ${toastAtomic}`);

  // Trigger a toast to check the close button (programmatically via console)
  await page.evaluate(() => {
    // Calling showToast directly if accessible, but it's scoped.
    // We can simulate a file drop or something, but easier to inspect static code or just check static attributes first.
    // The showToast function is inside DOMContentLoaded.
    // We can't access it easily. But we can check the static HTML for toast container.
  });

  await browser.close();
})();
