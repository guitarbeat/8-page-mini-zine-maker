## 2024-12-24 - Canvas Optimization
**Learning:** Using 'canvas.toBlob' with 'URL.createObjectURL' is significantly more performant than 'canvas.toDataURL' for large images, preventing main-thread blocking.
**Action:** Always prefer 'toBlob' for image previews generated from canvas, and remember to revoke object URLs to avoid memory leaks.
