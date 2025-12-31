## 2024-05-22 - Focus Visibility & Keyboard Hints
**Learning:** Custom UI components (like the `.slider` and `.upload-zone`) that explicitly remove `outline` or lack default focus styles create significant accessibility barriers.
**Action:** When creating custom components, always implement `:focus-visible` styles using the design system's accent color. Explicitly add `aria-keyshortcuts` and keyboard hints in `title` attributes for invisible shortcuts.
