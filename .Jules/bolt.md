## 2026-01-10 - Duplicate Script Execution
**Learning:** I discovered that including the main logic script (`assets/app.js`) via a `<script>` tag AND having the same logic inline in `index.html` causes the code to execute twice. This leads to subtle bugs like duplicate DOM elements (found by `locator.count()`) or race conditions, and doubles the processing work.
**Action:** Always check `index.html` for inline scripts that might duplicate external script references. When optimizing, verify if external scripts are actually used or redundant. In this case, removing the redundant `<script src="...">` fixed both visual glitches and performance overhead.

## 2026-01-10 - Blobs vs Data URLs
**Learning:** Switching from `canvas.toDataURL()` (synchronous, main-thread blocking) to `canvas.toBlob()` (asynchronous) significantly improved UI responsiveness during heavy processing. However, `toBlob` is async, so it must be wrapped in a Promise when used inside an `await` loop to ensure sequential processing if order matters (or to manage concurrency).
**Action:** Use `canvas.toBlob` for image generation in performance-critical paths, especially for large images or loops. Remember to handle the asynchronous nature and revoke Object URLs to avoid memory leaks.
