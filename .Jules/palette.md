## 2024-05-22 - Custom Progress Bar Accessibility
**Learning:** Custom progress bars (using divs) are invisible to screen readers unless they have `role="progressbar"` and proper ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`). Dynamic updates must be reflected in these attributes, not just in CSS width.
**Action:** Always wrap custom progress indicators with proper ARIA roles and update `aria-valuenow` via JavaScript alongside visual updates. Use `aria-valuetext` to provide context (e.g., "50% - Converting page 1...").
