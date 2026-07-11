# Testing Matrix

## 1. Full Live-Route React Render Tests

Goal: render the actual page components through the real router entry, then verify the route-level accessibility and interaction basics without relying on static DOM fixtures.

### Common assertions for each route

- Document title matches the route.
- Main landmark exists and receives focus.
- The primary heading for the page is present.
- The route has no axe violations in jsdom.
- The key interactive control for the page can be reached and activated with the keyboard.

### Route coverage

- Landing: verify the hero heading, primary nav, and the Sign In / Get Started links.
- Login: verify the tablist, arrow-key tab switching, and password visibility toggle.
- Register: verify the registration form labels, primary submit button, and back link.
- Forgot Password: verify the email field, submit action, and return-to-login link.
- Home: verify the app shell landmark layout, sidebar nav, and current route heading.
- Daily Plan: verify the page heading, add action, and any task group controls.
- Medications: verify the page heading, add medication action, and medication list controls.
- Reminders: verify the filter tablist, reminder list, and new reminder flow.
- Journal: verify the page heading, new entry action, and journal entry list.
- Settings: verify the page heading, preference controls, and save/update action.

### Suggested automated checks

- Render each route with a router harness using `initialEntries`.
- Stub `window.careconnect` methods that pages expect.
- Stub any persistence helpers or local storage reads/writes needed for deterministic output.
- Assert `axe.run(...)` returns zero violations for the rendered route container.
- Drive the page-specific keyboard path with `user-event` where the route exposes one.

## 2. Packaged Electron Screen-Reader Pass

Goal: confirm the built app speaks correctly in the packaged desktop shell, not just in the browser/test harness.

### Setup

- Build the Windows package with `npm run dist:win`.
- Install or launch the packaged app.
- Start a Windows screen reader (NVDA or Narrator) before opening the app.

### Manual pass checklist

- Launch the app and confirm the app name and current page are announced.
- Move through Landing, Login, and the main app shell with the keyboard.
- Confirm headings are announced in the expected order.
- Confirm buttons, links, tabs, and dialogs announce their labels clearly.
- Confirm route changes announce the new page or screen.
- Confirm modal dialogs announce their title and trap focus until closed.
- Confirm Escape closes dialogs and the reader announces the focus return target.
- Confirm there are no keyboard traps in the packaged app.

### Expected observations

- The page title updates when routes change.
- The live-region announcement fires when a new route loads.
- The currently focused landmark or control is exposed to the active screen reader.
- The shortcuts dialog is announced as a dialog with a clear title and close control.

## 3. Current Status

- Axe baseline tests are automated and passing.
- Login keyboard navigation is automated and passing.
- Shortcuts modal focus trapping is automated and passing.
- App-wide keyboard shortcuts are manually verified as working as designed.
- Visible focus indicators are manually verified as working as intended.
- Live-route React rendering is implemented and passing across all routes.
- Packaged screen-reader verification is completed manually (Windows Narrator).