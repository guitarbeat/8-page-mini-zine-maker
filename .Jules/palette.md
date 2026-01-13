## 2024-05-22 - Accessibility for Dynamic Notifications
**Learning:** Toast notifications (dynamic content updates) are silent to screen readers unless wrapped in a container with `aria-live="polite"` and `aria-atomic="true"`.
**Action:** Always wrap dynamic notification areas with these attributes. Ensure close buttons in these notifications have `aria-label`.

## 2024-05-22 - Keyboard Shortcut Discoverability
**Learning:** Keyboard shortcuts are powerful but invisible. Adding them to `title` attributes (e.g., "Print (Ctrl+P)") and using `aria-keyshortcuts` makes them discoverable and accessible to screen reader users without cluttering the UI.
**Action:** When implementing keyboard shortcuts, always update the UI element's `title` and add `aria-keyshortcuts`.
