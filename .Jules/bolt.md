# Bolt's Journal

## 2024-05-22 - [Optimizing PDF Rendering Pipeline]
**Learning:** `canvas.toDataURL()` is synchronous and can block the main thread for large images. `canvas.toBlob()` is asynchronous and when combined with `URL.createObjectURL()`, it reduces main thread blocking and memory usage by avoiding base64 string creation.
**Action:** Replace `toDataURL` with `toBlob` + `createObjectURL` for image previews generated from canvas, and ensure ObjectURLs are revoked to prevent memory leaks.
