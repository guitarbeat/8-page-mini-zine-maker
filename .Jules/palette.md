## 2024-05-23 - Toast Accessibility Patterns
**Learning:** Dynamic toast notifications are a major accessibility barrier if they lack `aria-live` regions and labeled close buttons. Users on screen readers may miss the notification entirely or get stuck on an unlabeled button.
**Action:** Always ensure toast containers have `aria-live="polite"` (or "assertive") and dynamically generated close buttons include `aria-label`.
