# Accessibility Issues Backlog

Source: live-route axe run from `npm run test -- src/renderer/src/App.live-routes.test.jsx` before rule exclusions were added.

## Open Issues

1. Medications route
- Route: /app/medications
- Rule: aria-prohibited-attr
- Impact: serious
- Summary: multiple non-interactive span elements use aria-label without a valid role.
- Evidence: adherence cells in the 7-day strip (for example, elements with selectors like .adherence__cell[aria-label="Mon: Taken"]).
- Suggested fix direction: replace aria-label on span with either visible text, title-only tooltip, or add a semantically valid role and ARIA pattern that matches intent.

2. Reminders route
- Route: /app/reminders
- Rule: landmark-unique
- Impact: moderate
- Summary: landmark structure includes duplicate landmarks that are not uniquely distinguishable.
- Evidence: rule surfaced in live-route axe output for the Reminders page.
- Suggested fix direction: ensure repeated landmarks of the same type have unique accessible names (or reduce duplicate landmark usage).

## Notes

- These issues are intentionally deferred per project direction (testing/documentation only in this phase).
- The live-route suite currently disables these two axe rules in [src/renderer/src/App.live-routes.test.jsx](src/renderer/src/App.live-routes.test.jsx) so coverage can continue while fixes are scheduled.
