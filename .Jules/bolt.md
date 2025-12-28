## 2024-05-23 - Duplicate Execution & Base64 Bottlenecks
**Learning:** `assets/app.js` was included in `index.html` but contained duplicate logic to the inline script, causing potential double execution and event listener conflicts. Removing unused script tags is a critical first step in performance optimization.
**Action:** Always verify if included scripts are actually used and unique before optimizing their content.

**Learning:** `canvas.toDataURL()` is synchronous and blocks the main thread, while creating large Base64 strings that spike memory usage.
**Action:** Use `canvas.toBlob()` (async) combined with `URL.createObjectURL()` for image previews to keep the UI responsive and reduce memory footprint.

**Learning:** `jspdf.addImage()` accepts `HTMLCanvasElement` directly. Converting to Base64 first is an unnecessary intermediate step that wastes memory and CPU.
**Action:** Pass canvas elements directly to PDF generation libraries whenever supported.
