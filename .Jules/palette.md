## 2024-05-22 - [Keyboard Focus & Discovery]
**Learning:** Adding clear `:focus-visible` rings with `box-shadow` (offset by 2px) significantly improves keyboard navigation visibility on custom components like buttons and upload zones, where default browser outlines often fail or look broken.
**Action:** Always implement custom `:focus-visible` styles using `outline: none` and `box-shadow: 0 0 0 2px bg, 0 0 0 4px accent` for interactive elements in this design system.
