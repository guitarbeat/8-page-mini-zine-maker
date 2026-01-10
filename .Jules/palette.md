## 2024-02-14 - [Toast & Shortcut Accessibility]
**Learning:** Toast notifications often lack `aria-live` regions and labeled close buttons, making them invisible or unusable for screen reader users. Additionally, keyboard shortcuts (Ctrl+O, etc.) are often undocumented for non-visual users.
**Action:** Always add `aria-live="polite"` (or `assertive`) to toast containers and ensure icon-only close buttons have `aria-label`. Expose keyboard shortcuts via `title` (e.g., "Action (Key)") and `aria-keyshortcuts` for full accessibility.

## 2024-05-24 - [Slider and Focus Accessibility]
**Learning:** Range inputs (`<input type="range">`) announce raw numbers by default. Adding `aria-valuetext` with formatted strings (e.g., "100%") provides critical context. Also, removing focus outlines (`outline: none`) without a replacement makes the app unusable for keyboard users.
**Action:** Always include `aria-valuetext` on sliders if the unit matters. Ensure global `:focus-visible` styles are defined (e.g., `outline: 2px solid var(--color-accent)`) to guarantee keyboard navigability.
