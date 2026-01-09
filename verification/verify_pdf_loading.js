
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

async function createDummyPDF(outputPath) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  page.drawText('Dummy PDF Content', { x: 50, y: 350, size: 30 });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

async function run() {
  console.log('Starting verification script...');

  // Create dummy PDF
  const pdfPath = path.resolve(__dirname, 'dummy.pdf');
  await createDummyPDF(pdfPath);
  console.log('Dummy PDF created at:', pdfPath);

  // Start server
  console.log('Starting server...');
  const server = spawn('npx', ['http-server', '-p', '8081', '.']);

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Log console messages from the browser
    page.on('console', msg => console.log('Browser console:', msg.text()));

    console.log('Navigating to page...');
    await page.goto('http://localhost:8081/index.html');

    // Wait for the page to be ready
    await page.waitForSelector('#upload-zone');

    // Upload PDF
    console.log('Uploading PDF...');
    const fileInput = await page.$('#pdf-upload');
    await fileInput.setInputFiles(pdfPath);

    // Wait for processing
    console.log('Waiting for processing to complete...');
    // We can wait for the first preview image to have a source
    await page.waitForFunction(() => {
        const img = document.querySelector('#preview-1');
        return img && img.src && img.src !== '';
    }, { timeout: 10000 });

    console.log('Processing complete. Verifying image sources...');

    // Check image source type
    const src = await page.evaluate(() => {
        const img = document.querySelector('#preview-1');
        return img.src;
    });

    console.log('Image src:', src.substring(0, 50) + '...');

    if (src.startsWith('blob:')) {
        console.log('SUCCESS: Image is using blob URL.');
    } else if (src.startsWith('data:image')) {
        console.log('INFO: Image is using data URL (current behavior).');
    } else {
        console.log('UNKNOWN: Image src is unexpected.');
    }

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    server.kill();
    // Clean up dummy PDF
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  }
}

run();
