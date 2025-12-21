## 2024-05-23 - Toast Accessibility Patterns
**Learning:** Toast notifications dynamically injected into the DOM are invisible to screen readers without explicit ARIA live regions.
**Action:** Always wrap toast containers with `aria-live="polite"` (or `assertive` for critical errors) and ensure interactive elements like close buttons have descriptive `aria-label`s, as visual icons are insufficient context.
