## 2024-03-20 - PDF Preview Generation
**Learning:** For generating image previews from canvas elements, using `canvas.toBlob()` with `URL.createObjectURL()` is significantly more performant than `canvas.toDataURL()` because it avoids creating massive base64 strings that block the main thread.
**Action:** Use the blob/objectURL pattern for all canvas-to-image preview features, and ensure `URL.revokeObjectURL()` is called to prevent memory leaks.
