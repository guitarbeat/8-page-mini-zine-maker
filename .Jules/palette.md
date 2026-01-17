## 2024-05-22 - Accessibility for Dynamic Notifications
**Learning:** Toast notifications (dynamic content updates) are silent to screen readers unless wrapped in a container with `aria-live="polite"` and `aria-atomic="true"`.
**Action:** Always wrap dynamic notification areas with these attributes. Ensure close buttons in these notifications have `aria-label`.

## 2024-05-22 - Keyboard Shortcut Discoverability
**Learning:** Keyboard shortcuts are powerful but invisible. Adding them to `title` attributes (e.g., "Print (Ctrl+P)") and using `aria-keyshortcuts` makes them discoverable and accessible to screen reader users without cluttering the UI.
**Action:** When implementing keyboard shortcuts, always update the UI element's `title` and add `aria-keyshortcuts`.

## 2024-05-23 - Interactive Mock Buttons
**Learning:** Elements styled as buttons with `role="button"` and `tabindex="0"` must have corresponding JavaScript event listeners for both `click` and `keydown` (Enter/Space) to be truly accessible. Merely adding ARIA roles is insufficient functionality.
**Action:** When identifying "fake" buttons in HTML, immediately verify and add the missing JS interaction logic to handle both mouse and keyboard activation.
