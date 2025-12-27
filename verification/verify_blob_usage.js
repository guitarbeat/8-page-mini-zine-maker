
const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Subscribe to console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    // 1. Load the app
    await page.goto('http://localhost:8080');
    console.log('App loaded');

    // 2. Generate a valid PDF using the page's jsPDF library
    // We wait for jsPDF to be available
    await page.waitForFunction(() => window.jspdf);

    const pdfBuffer = await page.evaluate(() => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Hello world!", 10, 10);
        const arrayBuffer = doc.output('arraybuffer');
        return Array.from(new Uint8Array(arrayBuffer));
    });

    const buffer = Buffer.from(pdfBuffer);
    console.log('Generated PDF buffer of size:', buffer.length);

    // 3. Upload PDF
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: buffer
    });
    console.log('PDF uploaded');

    // 4. Wait for processing (wait for the first preview image to have a src)
    // The placeholder is in a div .placeholder, the img is #preview-1
    await page.waitForFunction(() => {
        const img = document.getElementById('preview-1');
        return img && img.src && img.src.length > 0;
    }, { timeout: 15000 });
    console.log('Processing complete');

    // 5. Check the src of the preview image
    const src = await page.$eval('#preview-1', el => el.src);
    console.log('Preview Image Src starts with:', src.substring(0, 50));

    if (src.startsWith('blob:')) {
        console.log('SUCCESS: Using Blob URL');
    } else if (src.startsWith('data:')) {
        console.log('FAIL: Using Data URL (Expected before optimization)');
    } else {
        console.log('UNKNOWN: ' + src);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
