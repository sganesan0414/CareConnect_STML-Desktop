# Accessibility Issues Backlog

Source: live-route axe run from `npm run test -- src/renderer/src/App.live-routes.test.jsx` before rule exclusions were added.

## Open Issues

### Current Priority Summary (2026-07-11)

- Highest priority route by critical count: `/app/journal` (`critical: 10`, mostly `keyboard-inaccessible`).
- Highest total route volume: `/app/medications` (`39` total) and `/app/settings` (`38` total).
- Shared highest-frequency rule: `color-contrast` (`97` combined across latest route exports).
- App-wide keyboard operability risk: `keyboard-inaccessible` (`20` combined, with 15 on Journal + Settings).
- Manual keyboard tab-order pass is now complete after fixes; route counts below remain baseline until new axe exports are captured.

### Fix Queue

1. Keyboard operability: resolve all `keyboard-inaccessible` findings.
2. Shared color tokens/components: reduce repeated `color-contrast` failures.
3. Focus styling: resolve `contrast-link-infocus-4.5-1` across affected routes.
4. Medications semantics: resolve `aria-prohibited-attr` misuse.
5. Verification: re-scan each route and update evidence/test IDs in this file.

1. Medications route
- Route: /app/medications
- Rules: aria-prohibited-attr (18), color-contrast (20), keyboard-inaccessible (1)
- Impact: critical (1) and serious (38)
- Summary: latest local axe DevTools Medications export shows 39 issues across ARIA attribute validity, contrast, and one keyboard accessibility finding.
- Evidence: local axe DevTools JSON export `localhost_5173-Medications-or-CareConnect-STML-2026-07-11.json` (2026-07-11), test id `9864bb9a-ccf8-4245-8ff4-6618bb34a729`.
- Recommendation:
	- Replace invalid `aria-label` usage on non-interactive span elements in the adherence strip with a valid semantic pattern (for example, text content or role-appropriate markup).
	- Apply shared shell contrast fixes (tabs/date/sidebar labels/shortcut badges) and re-check route-specific medication card text chips.
	- Investigate and fix keyboard-inaccessible finding from manual keyboard checks; confirm target element is tabbable and activatable with Enter/Space.
	- Re-run axe on `/app/medications` and verify no regressions on `/app/settings` and `/app/daily-plan`.


2. Reminders route
- Route: /app/reminders
- Rules: color-contrast (16), contrast-link-infocus-4.5-1 (5), keyboard-inaccessible (3)
- Impact: critical (3) and serious (21)
- Summary: latest local axe DevTools Reminders export shows 24 issues, dominated by contrast/focused-link contrast plus three keyboard accessibility findings.
- Evidence: local axe DevTools JSON export `localhost_5173-Reminders-or-CareConnect-STML-2026-07-11.json` (2026-07-11), test id `aecfd4fa-4485-4b59-b727-3b30315f2bec`.
- Recommendation:
	- Apply shared shell contrast fixes (tabs/date/sidebar labels/shortcut badges) and re-check route-specific reminder chips/buttons for AA contrast.
	- Verify focused link/button states satisfy contrast requirements (`contrast-link-infocus-4.5-1`) after hover/focus style updates.
	- Investigate and fix all three keyboard-inaccessible findings from manual keyboard checks; confirm each target is tabbable and Enter/Space operable.
	- Re-run axe on `/app/reminders` after fixes and smoke-check `/app/settings` and `/app/daily-plan` for shared-style regressions.

3. Settings route
- Route: /app/settings
- Rules: color-contrast (28), contrast-link-infocus-4.5-1 (5), keyboard-inaccessible (5)
- Impact: critical (5) and serious (33)
- Summary: latest local axe DevTools export (7) shows 38 issues on the Settings route, with increased contrast failures and five critical keyboard accessibility findings.
- Evidence: local axe DevTools JSON export `localhost_5173-Settings-or-CareConnect-STML-2026-07-11 (7).json` (2026-07-11), test id `3eca842b-1b48-4fc5-ad35-37960b6452db`.
- Recommendation:
	- Darken muted text token used by toolbar tabs/date and page subtitles (target at least 4.5:1 on #e8eaed backgrounds).
	- Darken `.sidebar__label` text from very light gray to a mid-gray that meets AA.
	- Darken `.side-link__kbd` text and slightly darken its chip background for AA contrast.
	- Keep role badge visual style but darken badge text color to pass AA on the green badge background.
	- Ensure focused link states still meet contrast requirements (`contrast-link-infocus-4.5-1`) after hover/focus styling changes.
	- Investigate and fix all five `keyboard-inaccessible` findings (confirm each target control is tabbable and operable by keyboard).
	- Re-run axe on `/app/settings` and then smoke-check `/app`, `/app/reminders`, `/app/journal` because these shared styles affect multiple routes.

4. Daily Plan route
- Route: /app/daily-plan
- Rules: color-contrast (19), contrast-link-infocus-4.5-1 (5), keyboard-inaccessible (1)
- Impact: critical (1) and serious (24)
- Summary: latest local axe DevTools Daily Plan export shows 25 issues, largely the same shared shell contrast problems plus one keyboard accessibility finding.
- Evidence: local axe DevTools JSON export `localhost_5173-Daily-Plan-or-CareConnect-STML-2026-07-11.json` (2026-07-11), test id `0543e5a3-b180-4ab9-b980-2a3a17916f52`.
- Recommendation:
	- Apply the same shared shell contrast fixes tracked for Settings (toolbar tabs/date, sidebar labels, keyboard badge chips).
	- Validate focused-link contrast states after hover/focus styling adjustments.
	- Investigate and fix the keyboard-inaccessible issue from manual keyboard checks; confirm the target is reachable with Tab and activatable via Enter/Space.
	- Re-run axe on `/app/daily-plan` after style and keyboard fixes, then verify `/app/settings` regression-free.

5. Memory Journal route
- Route: /app/journal
- Rules: color-contrast (14), keyboard-inaccessible (10), contrast-link-infocus-4.5-1 (5)
- Impact: critical (10) and serious (19)
- Summary: latest local axe DevTools Memory Journal export shows 29 issues, with keyboard-inaccessible findings elevated to critical severity and additional shared contrast failures.
- Evidence: local axe DevTools JSON export `localhost_5173-Memory-Journal-or-CareConnect-STML-2026-07-11.json` (2026-07-11), test id `d55a30cf-ea99-4032-a690-3b01e8e1cc54`.
- Recommendation:
	- Investigate and fix all 10 keyboard-inaccessible findings first; verify each target can be reached with Tab and activated with Enter/Space without pointer input.
	- Apply shared shell contrast fixes and verify route-specific journal text/actions meet AA contrast.
	- Validate focused-link and focused-action states against `contrast-link-infocus-4.5-1` requirements after hover/focus style updates.
	- Re-run axe on `/app/journal` and smoke-check `/app/reminders` and `/app/settings` for shared-style regressions.


## Notes

- These issues are intentionally deferred per project direction (testing/documentation only in this phase).
- The live-route suite currently disables two route-test rules in [src/renderer/src/App.live-routes.test.jsx](src/renderer/src/App.live-routes.test.jsx) so coverage can continue while fixes are scheduled.
