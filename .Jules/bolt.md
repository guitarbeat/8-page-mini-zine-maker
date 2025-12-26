## 2025-12-26 - DOM String Cache Avoidance
**Learning:** Converting canvases to Base64 strings (via `toDataURL`) for image previews significantly increases memory usage and blocks the main thread. Switching to `toBlob` and `createObjectURL` keeps data in binary form and offloads processing, but requires manual memory management (`revokeObjectURL`).
**Action:** Prefer Blob URLs for dynamically generated image previews, ensuring proper cleanup on update.
