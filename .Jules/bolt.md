## 2026-01-08 - Canvas Serialization Performance
**Learning:** `canvas.toBlob()` combined with `URL.createObjectURL()` is significantly more memory-efficient than `canvas.toDataURL()` for high-resolution images, avoiding the 33% overhead of Base64 strings.
**Action:** Use `toBlob` for generating preview images in memory-intensive applications, but ensure to manage object URL cleanup with `URL.revokeObjectURL()` to prevent memory leaks.

## 2026-01-09 - Decoupling Render Scale from Device Pixel Ratio
**Learning:** Binding canvas rendering scale to `window.devicePixelRatio` for print generation can lead to catastrophic memory usage on high-DPI mobile devices (e.g., 3x DPR results in ~540 DPI renders).
**Action:** Use a fixed, high-quality scale (e.g., 3.0 for ~216 DPI or 4.17 for 300 DPI) for generating printable assets to ensure consistent performance and quality across all devices, independent of the screen they are viewed on.
