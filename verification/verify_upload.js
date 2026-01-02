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
const testPdfPath = path.join(__dirname, 'test.pdf');
fs.writeFileSync(testPdfPath, pdfBuffer);

let serverProcess;

function startServer() {
  return new Promise((resolve) => {
    // Start http-server on port 8080
    // Assuming we are in project root, but this script is in verification/
    // So we run http-server in project root.
    serverProcess = spawn('npx', ['http-server', '-p', '8080', '.'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    // Give it a moment to start
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

    console.log('Navigating to app...');
    await page.goto('http://localhost:8080');

    console.log('Uploading PDF...');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    // Wait for the "PDF Converted" toast or checks for img src changes
    // The toast has class 'toast success'
    console.log('Waiting for conversion...');
    const toast = page.locator('.toast.success');
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Check preview-1
    const img1 = page.locator('#preview-1');
    const src = await img1.getAttribute('src');

    console.log('Preview 1 src type:', src.substring(0, 30));

    if (src.startsWith('data:image/png;base64')) {
      console.log('Verified: Using Data URL');
    } else if (src.startsWith('blob:')) {
      console.log('Verified: Using Blob URL');
    } else {
      console.log('Unknown src format');
    }

    await browser.close();
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    stopServer();
    // Cleanup temporary file
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
    // Kill any hanging http-server processes just in case
    // This is a bit aggressive but ensures cleanup in this environment
    try {
        require('child_process').execSync('pkill -f http-server');
    } catch (e) {}
  }
}

run();
