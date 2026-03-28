## 2024-05-22 - Accessibility in Utility Buttons
**Learning:** Utility buttons (like 'Clear' or 'Close') within forms or dynamic sections should always specify `type="button"` to avoid accidental form submissions and should return focus to the relevant input to maintain accessibility for keyboard and screen reader users.
**Action:** Always include `type="button"` and a `.focus()` call when implementing 'Clear' functionality on inputs.
