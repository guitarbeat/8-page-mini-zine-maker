
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 }); // Emulate a mobile device
  await page.goto('http://localhost:8000');
  await page.screenshot({ path: '/home/jules/verification/verification.png' });
  await browser.close();
})();
