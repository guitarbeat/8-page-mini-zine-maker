## 2026-01-03 - [Optimized PDF Previews]
**Learning:** Replacing `canvas.toDataURL()` with `canvas.toBlob()` + `URL.createObjectURL()` significantly reduces memory overhead and main-thread blocking when rendering large images (like high-res PDF pages).
**Action:** Always prefer Blob URLs for dynamically generated images, especially when dealing with high-resolution canvas outputs. Ensure to implement a cleanup mechanism (URL revocation) to avoid memory leaks.
