## 2024-05-23 - Toast Accessibility Patterns
**Learning:** Dynamic content updates (like toasts) are invisible to screen readers without ARIA live regions. Using `aria-live="polite"` on the container ensures users are notified of new messages without being rudely interrupted.
**Action:** Always wrap dynamic notification containers with `aria-live="polite"` and `aria-atomic="true"`. Ensure icon-only close buttons inside dynamic content have explicit `aria-label`s.
