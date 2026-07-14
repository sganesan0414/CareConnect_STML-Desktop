# CareConnect_STML-Desktop

CareConnect STML Desktop Application — an [Electron](https://www.electronjs.org/) desktop app.

## Requirements

- Node.js 18+ and npm

## Setup

```bash
npm install
```

## Run

```bash
npm run dev    # Development mode with hot reload
npm start      # Preview the built app
```

> **Note:** If `npm start` exits immediately with `Cannot read properties of
> undefined (reading 'handle')`, the `ELECTRON_RUN_AS_NODE` environment variable
> is set, which forces Electron to run as plain Node.js (no GUI). Launch with it
> cleared:
> ```bash
> ELECTRON_RUN_AS_NODE= npm start
> ```

## Part 3: Desktop Accessibility Implementation

The app implements the desktop accessibility requirement across the main screens and dialogs:

- **Keyboard navigation** — All core features are reachable with keyboard only; Tab/Shift+Tab moves through controls, Escape closes dialogs, and custom controls such as Login tabs and Reminders filters support Left/Right/Home/End.
- **Focus indicators** — Interactive elements use a visible `:focus-visible` outline, and main content receives focus on route changes so keyboard users can track where they are.
- **Screen reader support** — Route changes announce through a live region, pages use semantic headings/labels, and dialogs expose proper ARIA roles and labels.
- **High contrast mode** — The app includes an in-app high-contrast toggle (`Ctrl/Cmd+H`) that updates the global theme class and increases contrast across the shell. This should still be checked on Windows High Contrast / macOS Increase Contrast during manual testing.
- **Reduced motion support** — Motion is reduced automatically for users with `prefers-reduced-motion` enabled.

**Keyboard shortcuts available across the app:**
- `Ctrl/Cmd + 1–6` — Navigate to Home, Daily Plan, Medications, Reminders, Journal, Settings
- `Ctrl/Cmd + N` — New task/reminder/journal entry (context-dependent)
- `Ctrl/Cmd + S` — Save (Settings, Reminders, Journal)
- `Ctrl/Cmd + /` or `F1` — Show keyboard shortcuts
- `Ctrl/Cmd + P` — Print Daily Plan
- `Ctrl/Cmd + H` — Toggle the app's high-contrast mode (Ctrl-only on macOS)
- `Ctrl/Cmd + =/–` — Increase/decrease text size
- `F9` — Highlight emergency contact

Manual verification target: test the app with keyboard only, NVDA on Windows (or VoiceOver on Mac), and the operating system's high-contrast setting.

## Testing

Testing status, route coverage, and manual verification details are tracked in:

- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
- [TEST_MATRIX.md](TEST_MATRIX.md)
- [COVERAGE_REPORT.md](COVERAGE_REPORT.md)
- [VPAT.md](VPAT.md) — WCAG 2.1 A/AA accessibility conformance report

Run the full suite:

```bash
npm test               # all Jest suites
npm run test:coverage  # all suites + coverage report (90% threshold on stmts/branches/funcs/lines)
npm run test:a11y      # static axe fixtures (vitest)
```

Every page/component has its own test file (render, validation, keyboard interaction, and
an `axe-core` accessibility scan) alongside the full-route render pass in
`src/renderer/src/App.live-routes.test.jsx`.

Known deferred accessibility fixes are tracked in:

- [ACCESSIBILITY_ISSUES_BACKLOG.md](ACCESSIBILITY_ISSUES_BACKLOG.md)

## Build a distributable

```bash
npm run dist     # packaged installer for the current platform
npm run package  # unpacked app directory only
```

## Project structure

```
src/
  main/
    index.js           Main process: app lifecycle, windows, IPC handlers
    menu.js            Native menu with keyboard shortcuts
    window-state.js    Window size/position persistence
  preload/
    index.js           Secure bridge exposing minimal API to renderer (contextBridge)
  renderer/
    index.html         App UI (with strict Content-Security-Policy)
    main.jsx           React entry point and router setup (HashRouter)
    src/
      App.jsx          Main app routing
      lib/
        accessibility.js   Shared accessibility hooks and focus management
        auth.js            Session and account management (localStorage)
        tasks.js           Task data store (localStorage)
        meds.js            Medication data store (localStorage)
        journal.js         Journal entry store (localStorage)
        settings.js        Display preferences and accessibility settings
        [... other shared modules ...]
      pages/
        Landing.jsx        Home / marketing page
        Login.jsx          PIN and password sign-in
        Register.jsx       Account creation
        ForgotPassword.jsx Password reset
        app/
          AppShell.jsx     Layout wrapper with menu, sidebar, toolbar
          Home.jsx         Patient or caregiver dashboard (mode-dependent)
          DailyPlan.jsx    Patient's task checklist
          Medications.jsx  Medication tracker with adherence strip
          Reminders.jsx    Reminder management with filters
          Journal.jsx      Shared patient–caregiver log
          Settings.jsx     Display, accessibility, and account settings
          [... modals: AddTaskModal, AddMedicationModal, ShortcutsModal ...]
      styles/
        base.css         Global styles and accessibility (skip link, focus, reduced-motion)
        landing.css      Landing page styles
        login.css        Auth pages (Login, Register, ForgotPassword)
        dashboard.css    App shell and content area styles
```

## Security

The app follows Electron's recommended hardening defaults:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- A `contextBridge` preload exposes only an explicit, minimal API
- A restrictive `Content-Security-Policy` in `index.html`
