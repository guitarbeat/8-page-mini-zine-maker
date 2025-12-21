# Bolt's Journal

## 2024-05-22 - [Optimizing Image Previews]
**Learning:** `canvas.toDataURL()` is synchronous and can block the main thread for large images. Using `canvas.toBlob()` combined with `URL.createObjectURL()` is much more performant for generating previews as it avoids large base64 string allocations and operations.
**Action:** When generating image previews from canvas, always prefer `toBlob` + `createObjectURL`. Remember to `revokeObjectURL` to avoid memory leaks.

## 2024-05-22 - [App Architecture]
**Learning:** The application logic is embedded in `index.html`. `assets/app.js` appears to be a duplicate or unused file. Modifying `assets/app.js` has no effect on the running application.
**Action:** Always verify where the active logic resides. In this case, target `index.html`.
