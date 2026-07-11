# Testing Checklist

## Keyboard and Accessibility Baseline

- [x] Axe accessibility scan runs with `npm run test:a11y`.
- [x] Landing page fixture has no axe violations.
- [x] Login page fixture has no axe violations.
- [x] App shell landmark structure fixture has no axe violations.
- [x] Shortcuts modal opens with an initial focus target.
- [x] Escape closes the shortcuts modal.
- [x] Tab and Shift+Tab trapping are covered for the shortcuts modal.
- [x] Full live-route React render tests for every page.
- [x] Screen reader pass on the packaged Electron app (Windows Narrator manual verification).

See [TEST_MATRIX.md](TEST_MATRIX.md) for the route-by-route coverage plan and the manual screen-reader checklist.

Known deferred fixes are tracked in [ACCESSIBILITY_ISSUES_BACKLOG.md](ACCESSIBILITY_ISSUES_BACKLOG.md).

## Keyboard Coverage To Verify

- [x] Tab/Shift+Tab behavior in the shortcuts modal.
- [x] Arrow key navigation in the login tablist.
- [x] Enter and Space keyboard activation path on the password visibility toggle.
- [x] No keyboard traps across the shortcuts modal.
- [x] App-wide keyboard shortcuts in the live shell (manual verification).
- [x] Visible focus indicators on all interactive controls (manual verification).
- [x] End-to-end Tab/Shift+Tab order is logical across Login and app-shell routes (manual verification).

## Current Results

- [x] `npm run test:a11y` passes.
- [x] `npm run test -- src/renderer/src/pages/Login.keyboard.test.jsx src/renderer/src/pages/app/ShortcutsModal.keyboard.test.jsx src/renderer/src/App.a11y.test.jsx` passes.
- [x] `npm run test -- src/renderer/src/App.live-routes.test.jsx` passes (10/10 routes).
- [x] Live app shortcuts verified manually as working as designed.
- [x] Visible focus indicators verified manually as working as intended.
- [x] Screen-reader verification completed manually with Windows Narrator.
- [x] Keyboard tab-order pass completed manually after latest keyboard/focus fixes.

## Notes

- The current automated coverage uses stable DOM fixtures for axe so the suite stays reliable in jsdom.
- React router-based live component rendering is now covered route-by-route in `App.live-routes.test.jsx`.
- The Enter/Space keyboard path in the login test is simulated through DOM events because jsdom does not provide native browser button activation.
- Current route-level `keyboard-inaccessible` counts in snapshots/backlog are pre-rescan baselines; rerun axe exports to confirm post-fix deltas.

## Latest Scan Snapshot (2026-07-11)

- Source: axe DevTools JSON export `localhost_5173-Settings-or-CareConnect-STML-2026-07-11 (7).json`.
- Route: `http://localhost:5173/#/app/settings`.
- Total issues: 38 (`critical: 5`, `serious: 33`).
- Rule breakdown:
	- `color-contrast`: 28
	- `contrast-link-infocus-4.5-1`: 5
	- `keyboard-inaccessible`: 5
- See [ACCESSIBILITY_ISSUES_BACKLOG.md](ACCESSIBILITY_ISSUES_BACKLOG.md) for remediation recommendations and tracking.

## Latest Scan Snapshot - Daily Plan (2026-07-11)

- Source: axe DevTools JSON export `localhost_5173-Daily-Plan-or-CareConnect-STML-2026-07-11.json`.
- Route: `http://localhost:5173/#/app/daily-plan`.
- Total issues: 25 (`critical: 1`, `serious: 24`).
- Rule breakdown:
	- `color-contrast`: 19
	- `contrast-link-infocus-4.5-1`: 5
	- `keyboard-inaccessible`: 1
- See [ACCESSIBILITY_ISSUES_BACKLOG.md](ACCESSIBILITY_ISSUES_BACKLOG.md) for remediation recommendations and tracking.

## Latest Scan Snapshot - Medications (2026-07-11)

- Source: axe DevTools JSON export `localhost_5173-Medications-or-CareConnect-STML-2026-07-11.json`.
- Route: `http://localhost:5173/#/app/medications`.
- Total issues: 39 (`critical: 1`, `serious: 38`).
- Rule breakdown:
	- `aria-prohibited-attr`: 18
	- `color-contrast`: 20
	- `keyboard-inaccessible`: 1
- See [ACCESSIBILITY_ISSUES_BACKLOG.md](ACCESSIBILITY_ISSUES_BACKLOG.md) for remediation recommendations and tracking.

## Latest Scan Snapshot - Reminders (2026-07-11)

- Source: axe DevTools JSON export `localhost_5173-Reminders-or-CareConnect-STML-2026-07-11.json`.
- Route: `http://localhost:5173/#/app/reminders`.
- Total issues: 24 (`critical: 3`, `serious: 21`).
- Rule breakdown:
	- `color-contrast`: 16
	- `contrast-link-infocus-4.5-1`: 5
	- `keyboard-inaccessible`: 3
- See [ACCESSIBILITY_ISSUES_BACKLOG.md](ACCESSIBILITY_ISSUES_BACKLOG.md) for remediation recommendations and tracking.

## Latest Scan Snapshot - Memory Journal (2026-07-11)

- Source: axe DevTools JSON export `localhost_5173-Memory-Journal-or-CareConnect-STML-2026-07-11.json`.
- Route: `http://localhost:5173/#/app/journal`.
- Total issues: 29 (`critical: 10`, `serious: 19`).
- Rule breakdown:
	- `color-contrast`: 14
	- `keyboard-inaccessible`: 10
	- `contrast-link-infocus-4.5-1`: 5
- See [ACCESSIBILITY_ISSUES_BACKLOG.md](ACCESSIBILITY_ISSUES_BACKLOG.md) for remediation recommendations and tracking.

## Cross-Route Rollup (Latest Exports)

- Total documented issues across latest route exports: 155.
- Severity totals:
	- `critical`: 20
	- `serious`: 135
- Rule-family totals:
	- `keyboard-inaccessible`: 20
	- `color-contrast`: 97
	- `contrast-link-infocus-4.5-1`: 20
	- `aria-prohibited-attr`: 18

## Recommended Fix Order

1. Fix all `keyboard-inaccessible` findings first (highest user-impact blockers).
2. Apply shared-shell color contrast token updates to reduce cross-route regressions.
3. Correct focused-link/interactive focus-state contrast (`contrast-link-infocus-4.5-1`).
4. Resolve Medications semantic ARIA misuse (`aria-prohibited-attr`).
5. Re-run route scans and log post-fix deltas in this checklist and backlog.