# UX review checklist

Use only what a tester can observe. Light: report obvious items only. Full: walk every item per representative page. Each note is Observation plus Suggestion; keep one wording per suggestion everywhere.

**States**
- Loading: visible indicator, no layout jump, no stale data shown as fresh.
- Empty: explains why and offers the next action.
- Error: says what failed and what to do; not a raw status code.
- Session expired and 404: clear message, a way back.

**Feedback**
- Every action gets a response: toast, inline message or state change. Destructive actions confirm first.
- Buttons disable or show progress while submitting; no double submit.
- Success and failure look different and stay long enough to read.

**Forms**
- Required fields marked; messages sit next to the field; the first invalid field is focused.
- Field limits and formats are visible before the user hits them.
- Lost input on error or back navigation is a finding.

**Keyboard and a11y**
- Tab order follows the visual order; focus is visible; dialogs trap and restore focus; Esc closes.
- Controls have accessible names; contrast is readable; targets at least 44 px on mobile.

**Responsive**
- No horizontal page scroll at phone width; tables degrade to something usable. Automated checks only measure scroll and drawers, not "looks right"; real-device reports outrank them.

**Motion**
- Transitions respond quickly (roughly under 300 ms for UI feedback) and never block the next action. Animations that delay a task are a finding.

**Copy**
- Labels consistent across pages (one term per concept); no jargon in user-facing errors.

**Lists and data**
- Pagination, sort and filter keep state after refresh and back. Filters that change results show what is applied.
