const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Minimal PDF file content
const minimalPdf = `%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000111 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF`;

const pdfBuffer = Buffer.from(minimalPdf);
const testPdfPath = path.join(__dirname, 'test_screenshot.pdf');
fs.writeFileSync(testPdfPath, pdfBuffer);

let serverProcess;

function startServer() {
  return new Promise((resolve) => {
    serverProcess = spawn('npx', ['http-server', '-p', '8081', '.'], {
      stdio: 'ignore', // Clean output
      shell: true,
      cwd: process.cwd()
    });
    setTimeout(resolve, 2000);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
}

async function run() {
  try {
    await startServer();
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:8081');

    console.log('Uploading PDF...');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    console.log('Waiting for conversion...');
    const toast = page.locator('.toast.success');
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for the preview images to be populated
    await page.waitForTimeout(1000);

    const screenshotPath = path.join(__dirname, 'verification.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

    await browser.close();
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    stopServer();
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
    try {
        require('child_process').execSync('pkill -f "http-server -p 8081"');
    } catch (e) {}
  }
}

run();
