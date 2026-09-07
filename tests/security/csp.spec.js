import { test, expect } from '@playwright/test';

test.describe('Content Security Policy', () => {
  test('should have a strict CSP meta tag', async ({ page }) => {
    await page.goto('/');

    // Check for meta tag presence
    const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(cspMeta).toHaveCount(1);

    // Get the content attribute
    const content = await cspMeta.getAttribute('content');

    // Check for critical directives
    expect(content).toContain('default-src \'self\'');
    expect(content).toContain('script-src \'self\'');
    expect(content).toContain('style-src \'self\'');
    // Check for Google Fonts allowance
    expect(content).toContain('https://fonts.googleapis.com');
    expect(content).toContain('https://fonts.gstatic.com');
    // Verify that script-src does not allow 'unsafe-inline' or 'unsafe-eval'
    const scriptSrcMatch = content.match(/script-src\s+([^;]+)/);
    expect(scriptSrcMatch).not.toBeNull();
    const scriptSrc = scriptSrcMatch[1];
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });
});
