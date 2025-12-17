# Bolt's Journal

## 2024-05-22 - [Optimizing Image Handling]
**Learning:** Using `canvas.toDataURL()` is synchronous and can block the main thread, especially for large images or inside loops. It also increases memory usage by creating large base64 strings.
**Action:** Use `canvas.toBlob()` (async) combined with `URL.createObjectURL()` for displaying canvas content in `<img>` tags. Pass `HTMLCanvasElement` directly to `pdf.addImage()` in `jspdf` instead of base64 strings.
