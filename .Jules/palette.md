## 2026-01-07 - [Accessiblity: Progress Bars and Toasts]
**Learning:** Custom components like progress bars and toasts often lack semantic meaning for screen readers. A simple `div` implementation for a progress bar is invisible to assistive technology unless it has `role='progressbar'` and dynamic `aria-valuenow` updates. Similarly, toast containers need `aria-live='polite'` to announce updates without disrupting the user.
**Action:** Always wrap custom progress indicators with `role='progressbar'` and ensure the value is updated via JS. Check toast containers for `aria-live` attributes.
