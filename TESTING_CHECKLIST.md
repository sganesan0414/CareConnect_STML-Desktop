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

## Current Results

- [x] `npm run test:a11y` passes.
- [x] `npm run test -- src/renderer/src/pages/Login.keyboard.test.jsx src/renderer/src/pages/app/ShortcutsModal.keyboard.test.jsx src/renderer/src/App.a11y.test.jsx` passes.
- [x] `npm run test -- src/renderer/src/App.live-routes.test.jsx` passes (10/10 routes).
- [x] Live app shortcuts verified manually as working as designed.
- [x] Visible focus indicators verified manually as working as intended.
- [x] Screen-reader verification completed manually with Windows Narrator.

## Notes

- The current automated coverage uses stable DOM fixtures for axe so the suite stays reliable in jsdom.
- React router-based live component rendering is now covered route-by-route in `App.live-routes.test.jsx`.
- The Enter/Space keyboard path in the login test is simulated through DOM events because jsdom does not provide native browser button activation.