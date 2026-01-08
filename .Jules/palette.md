## 2024-02-14 - [Toast & Shortcut Accessibility]
**Learning:** Toast notifications often lack `aria-live` regions and labeled close buttons, making them invisible or unusable for screen reader users. Additionally, keyboard shortcuts (Ctrl+O, etc.) are often undocumented for non-visual users.
**Action:** Always add `aria-live="polite"` (or `assertive`) to toast containers and ensure icon-only close buttons have `aria-label`. Expose keyboard shortcuts via `title` (e.g., "Action (Key)") and `aria-keyshortcuts` for full accessibility.
