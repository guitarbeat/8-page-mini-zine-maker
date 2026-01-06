## 2026-01-06 - [Toast Notifications Accessibility]
**Learning:** Dynamic toast notifications must live within a container with `aria-live="polite"` (or "assertive" for critical alerts) to be announced by screen readers. Additionally, interactive elements like close buttons inside these dynamic containers often get missed by screen readers if they lack explicit `aria-label` attributes.
**Action:** When implementing or fixing toast notifications, always ensure the container has the appropriate `aria-live` attribute and all interactive child elements have clear `aria-label` descriptions.
