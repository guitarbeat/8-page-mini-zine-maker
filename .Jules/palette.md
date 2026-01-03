## 2024-05-24 - Duplicate Logic & Focus Accessibility
**Learning:** Conflicting scripts (inline vs external) can silently degrade UX by causing double actions (e.g., alert + toast) or race conditions. Cleaning this up is a prerequisite for reliable UX.
**Action:** Always check for duplicate event listeners or script inclusions when interactions feel "off" or redundant.

**Learning:** Missing `:focus-visible` styles makes keyboard navigation difficult as users can't see what they are focused on.
**Action:** Standardize on a high-contrast outline (e.g., `outline: 2px solid var(--color-accent)`) for `:focus-visible` in the base styles.
