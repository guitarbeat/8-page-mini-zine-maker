## 2026-01-02 - Duplicate Logic in assets/app.js
**Learning:** The project had a critical issue where `assets/app.js` was a near-duplicate of the inline script in `index.html`. This caused `DOMContentLoaded` to run twice, doubling the DOM elements (pages) and causing ID collisions. The memory warned about this, but the file was still present.
**Action:** Always verify if external script files are duplicates of inline scripts in simple HTML projects. When optimizing, ensure you are editing the active logic source.

## 2026-01-02 - Canvas toBlob vs toDataURL
**Learning:** Replacing `canvas.toDataURL()` with `canvas.toBlob()` + `URL.createObjectURL()` significantly reduces main-thread blocking and memory usage during image generation loops. However, `toBlob` is asynchronous (callback-based), requiring a Promise wrapper when used in `async/await` loops to maintain sequential processing (e.g., for progress bars).
**Action:** Use the `await new Promise(r => canvas.toBlob(r))` pattern when optimizing synchronous canvas operations to async ones.
