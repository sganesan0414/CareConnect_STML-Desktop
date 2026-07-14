# Test Coverage Report

Generated from `npm run test:coverage` (Jest, jsdom environment). Regenerate with the
same command — the table below is a snapshot, not a live badge.

## Summary (2026-07-12)

| Metric | Coverage | Threshold |
|---|---|---|
| Statements | 96.43% | 90% |
| Branches | 92.15% | 90% |
| Functions | 95.69% | 90% |
| Lines | 98.41% | 90% |

Test suites: **29 passed / 29 total** · Tests: **245 passed / 245 total**.

The threshold is enforced in [jest.config.cjs](jest.config.cjs) (`coverageThreshold.global`,
all four metrics at 90%) — `npm test` and `npm run test:coverage` fail the build if any
metric regresses below that line. Coverage is collected across the whole renderer app
(`src/renderer/src/lib/**`, `src/renderer/src/pages/**`, `src/renderer/src/App.jsx`) and
the shared code (`src/shared/**`); the Electron main/preload processes are excluded since
they run outside jsdom and are covered separately by manual/packaged verification (see
[TEST_MATRIX.md](TEST_MATRIX.md)).

## Per-file coverage

| File | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| renderer/src/App.jsx | 81.81% | 50% | 75% | 100% |
| renderer/src/lib/accessibility.js | 100% | 82.97% | 100% | 100% |
| renderer/src/lib/appEvents.js | 100% | 100% | 100% | 100% |
| renderer/src/lib/auth.js | 100% | 96.15% | 100% | 100% |
| renderer/src/lib/journal.js | 100% | 100% | 100% | 100% |
| renderer/src/lib/meds.js | 100% | 100% | 100% | 100% |
| renderer/src/lib/nav.js | 100% | 100% | 100% | 100% |
| renderer/src/lib/reminders.js | 100% | 100% | 100% | 100% |
| renderer/src/lib/settings.js | 100% | 100% | 100% | 100% |
| renderer/src/lib/tasks.js | 100% | 100% | 100% | 100% |
| renderer/src/pages/ForgotPassword.jsx | 100% | 100% | 100% | 100% |
| renderer/src/pages/Landing.jsx | 100% | 100% | 100% | 100% |
| renderer/src/pages/Login.jsx | 95% | 93.33% | 92.85% | 96.96% |
| renderer/src/pages/Register.jsx | 100% | 100% | 100% | 100% |
| renderer/src/pages/app/AddMedicationModal.jsx | 87.09% | 77.77% | 81.81% | 86.66% |
| renderer/src/pages/app/AddTaskModal.jsx | 94.59% | 100% | 86.66% | 94.44% |
| renderer/src/pages/app/AppShell.jsx | 95.28% | 94.44% | 92.3% | 97.72% |
| renderer/src/pages/app/CaregiverDashboard.jsx | 97.36% | 89.47% | 94.73% | 96.66% |
| renderer/src/pages/app/DailyPlan.jsx | 96.36% | 88% | 100% | 100% |
| renderer/src/pages/app/Dashboard.jsx | 91.42% | 92.3% | 93.75% | 100% |
| renderer/src/pages/app/Home.jsx | 100% | 50% | 100% | 100% |
| renderer/src/pages/app/Journal.jsx | 97.36% | 92.5% | 100% | 100% |
| renderer/src/pages/app/Medications.jsx | 97.87% | 92.68% | 100% | 100% |
| renderer/src/pages/app/MenuBar.jsx | 94.78% | 85.5% | 100% | 100% |
| renderer/src/pages/app/Reminders.jsx | 95.3% | 93.58% | 92.85% | 96.63% |
| renderer/src/pages/app/Settings.jsx | 97.56% | 93.33% | 93.75% | 100% |
| renderer/src/pages/app/ShortcutsModal.jsx | 100% | 100% | 100% | 100% |
| shared/ipc.js | 100% | 100% | 100% | 100% |
| shared/routes.js | 100% | 100% | 100% | 100% |

Remaining gaps are almost entirely defensive branches that are impractical to hit in
jsdom (e.g. `App.jsx`'s guard for a missing native-menu bridge, `Home.jsx`'s caregiver-mode
ternary already exercised via `CaregiverDashboard.test.jsx` directly, and a couple of
`AddMedicationModal.jsx` field-normalisation fallbacks) rather than untested features.

## What's covered

- **Every store module** in `src/renderer/src/lib/` (`auth`, `meds`, `tasks`, `journal`,
  `reminders`, `settings`, `appEvents`, `nav`) has a dedicated unit test file with
  malformed-storage and default-fallback branches.
- **Every route/page component** (Landing, Login, Register, ForgotPassword, Home/Dashboard,
  CaregiverDashboard, DailyPlan, Medications, Reminders, Journal, Settings, AppShell,
  MenuBar, and the Add Task/Medication/Shortcuts modals) has its own test file covering
  render, validation, keyboard interaction and, where applicable, native-menu bridge
  events.
- **Accessibility**: every one of the above test files includes an `axe-core` scan
  (`axe.run(container)` asserting zero violations) in addition to the existing
  `App.a11y.test.jsx` static fixtures and the `App.live-routes.test.jsx` full-route axe
  pass. New keyboard-navigation coverage was added for the in-app menu bar (arrow key/
  Home/End/Escape/Tab menu traversal), the reminders and journal mood/type pickers, and
  the AppShell global shortcuts (F1/F9/Ctrl+Q/Ctrl+H/Ctrl+P/Ctrl+=/Ctrl+-).

## Regenerating this report

```bash
npm run test:coverage
```

Copy the printed table back into this file after any significant test or source change.
