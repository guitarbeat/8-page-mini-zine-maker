## 2025-12-16 - Accessible Progress Indicators
**Learning:** Custom progress bars (using `div`s) are invisible to screen readers without ARIA roles.
**Action:** Always add `role="progressbar"`, `aria-label`, and keep `aria-valuenow` updated in sync with the visual width.

## 2025-12-16 - Dynamic Aria Labels
**Learning:** Mode toggles (like Dark/Light mode) need dynamic `aria-label`s to describe the *next* state or current action, not just a static label.
**Action:** Update `aria-label` in the same function that toggles the visual state.
