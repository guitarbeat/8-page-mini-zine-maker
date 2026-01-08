## 2026-01-08 - Canvas Serialization Performance
**Learning:** `canvas.toBlob()` combined with `URL.createObjectURL()` is significantly more memory-efficient than `canvas.toDataURL()` for high-resolution images, avoiding the 33% overhead of Base64 strings.
**Action:** Use `toBlob` for generating preview images in memory-intensive applications, but ensure to manage object URL cleanup with `URL.revokeObjectURL()` to prevent memory leaks.
