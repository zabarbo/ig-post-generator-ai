## 2025-05-14 - Mobile Navigation Accessibility
**Learning:** Icon-only navigation bars in mobile-first designs are completely inaccessible to screen readers if they lack ARIA labels. Users relying on assistive technology cannot distinguish between different navigation options (e.g., Home, Calendar, History) without textual descriptions.
**Action:** Always provide `aria-label` to navigation links and buttons that only contain icons, and use `aria-current` to indicate the active page.
