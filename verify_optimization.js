
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Listen for console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));

    console.log('Navigating to http://localhost:8000');
    await page.goto('http://localhost:8000');

    // Check title
    const title = await page.title();
    console.log('Title:', title);

    if (title !== 'PDF to Zine Maker') {
      throw new Error('Wrong page title');
    }

    // Upload PDF
    console.log('Uploading test.pdf...');
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'test.pdf'));

    // Wait for processing
    console.log('Waiting for processing...');
    await page.waitForTimeout(5000); // Wait for processing to complete

    // Check if previews are generated (img src should be blob: or data:)
    const previewSrc = await page.evaluate(() => {
        const img = document.getElementById('preview-1');
        return img ? img.src : null;
    });

    console.log('Preview 1 src:', previewSrc);

    if (!previewSrc) {
        throw new Error('Preview image not generated');
    }

    if (!previewSrc.startsWith('blob:')) {
        throw new Error('Optimization check failed: Preview src is not a blob URL (' + previewSrc + ')');
    }
    console.log('Optimization verified: Preview uses blob URL.');

    // Screenshot
    await page.screenshot({ path: 'verification_result.png' });
    console.log('Verification successful!');

    await browser.close();
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
})();
