
try {
  require('playwright');
  console.log('Playwright module found successfully.');
} catch (e) {
  console.error('Error finding Playwright module:', e);
}
