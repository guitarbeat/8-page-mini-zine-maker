## 2025-12-16 - [Frontend Image Optimization]
**Learning:** `canvas.toDataURL` is synchronous and can block the main thread for large images, causing UI freezes. It also creates large strings that increase memory pressure. `canvas.toBlob` is asynchronous and creates Blob objects that are more memory-efficient and can be used with `URL.createObjectURL`.
**Action:** Always prefer `canvas.toBlob` + `URL.createObjectURL` for generating image previews from canvas, especially in loops or for large images. Remember to revoke the object URLs to prevent memory leaks.
