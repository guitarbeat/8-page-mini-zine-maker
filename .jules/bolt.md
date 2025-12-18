## 2025-12-18 - [Object URL Optimization]
**Learning:** Replacing `canvas.toDataURL` with `canvas.toBlob` + `URL.createObjectURL` significantly reduces main thread blocking and memory usage when handling multiple high-res images (PDF pages).
**Action:** Always prefer Blob/Object URL for generated image previews. Ensure URLs are revoked to prevent memory leaks.
