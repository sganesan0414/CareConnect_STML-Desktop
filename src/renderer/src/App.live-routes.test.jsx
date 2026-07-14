import axe from 'axe-core';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    'aria-prohibited-attr': { enabled: false },
    'landmark-unique': { enabled: false },
  },
};

const ROUTE_CASES = [
  {
    path: '/',
    expectedTitle: 'Landing | CareConnect STML',
    heading: /a calm daily companion/i,
    keyboardCheck: async () => {
      const signIn = screen.getByRole('link', { name: /sign in/i });
      signIn.focus();
      expect(signIn).toHaveFocus();
    },
  },
  {
    path: '/login',
    expectedTitle: 'Login | CareConnect STML',
    heading: /patient sign in/i,
    keyboardCheck: async (user) => {
      const pinTab = screen.getByRole('tab', { name: /pin/i });
      const passwordTab = screen.getByRole('tab', { name: /password/i });

      pinTab.focus();
      await user.keyboard('{ArrowRight}');
      await waitFor(() => expect(passwordTab).toHaveAttribute('aria-selected', 'true'));
    },
  },
  {
    path: '/register',
    expectedTitle: 'Create Account | CareConnect STML',
    heading: /create account/i,
    keyboardCheck: async () => {
      const createButton = screen.getByRole('button', { name: /create account/i });
      createButton.focus();
      expect(createButton).toHaveFocus();
    },
  },
  {
    path: '/forgot-password',
    expectedTitle: 'Reset Password | CareConnect STML',
    heading: /reset password/i,
    keyboardCheck: async () => {
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      resetButton.focus();
      expect(resetButton).toHaveFocus();
    },
  },
  {
    path: '/app',
    expectedTitle: 'Home | CareConnect STML',
    heading: /today's plan/i,
    keyboardCheck: async () => {
      fireEvent.keyDown(document, { key: '2', ctrlKey: true });
      await waitFor(() => expect(document.title).toBe('Daily Plan | CareConnect STML'));
    },
  },
  {
    path: '/app/daily-plan',
    expectedTitle: 'Daily Plan | CareConnect STML',
    heading: /^daily plan$/i,
    keyboardCheck: async (user) => {
      await user.click(screen.getByRole('button', { name: /add task/i }));
      expect(screen.getByRole('dialog', { name: /add new task/i })).toBeInTheDocument();
    },
  },
  {
    path: '/app/medications',
    expectedTitle: 'Medications | CareConnect STML',
    heading: /^medications$/i,
    keyboardCheck: async (user) => {
      await user.click(screen.getByRole('button', { name: /add medication/i }));
      expect(screen.getByRole('dialog', { name: /add medication/i })).toBeInTheDocument();
    },
  },
  {
    path: '/app/reminders',
    expectedTitle: 'Reminders | CareConnect STML',
    heading: /^reminders$/i,
    keyboardCheck: async (user) => {
      const allTab = screen.getByRole('tab', { name: /all reminders/i });
      allTab.focus();
      await user.keyboard('{ArrowRight}');
      const medicationTab = screen.getByRole('tab', { name: /medications/i });
      await waitFor(() => expect(medicationTab).toHaveAttribute('aria-selected', 'true'));
    },
  },
  {
    path: '/app/journal',
    expectedTitle: 'Memory Journal | CareConnect STML',
    heading: /^memory journal$/i,
    keyboardCheck: async (user) => {
      await user.click(screen.getByRole('button', { name: /new entry/i }));
      expect(screen.getByPlaceholderText(/notes/i)).toHaveFocus();
    },
  },
  {
    path: '/app/settings',
    expectedTitle: 'Settings | CareConnect STML',
    heading: /^settings$/i,
    keyboardCheck: async () => {
      const saveButton = screen.getByRole('button', { name: /save settings/i });
      saveButton.focus();
      expect(saveButton).toHaveFocus();
    },
  },
];

function seedAppSession(path) {
  localStorage.clear();
  if (path.startsWith('/app')) {
    localStorage.setItem('careconnect.session', 'margaret@memory.care');
    localStorage.setItem('careconnect.mode', 'patient');
  }
}

function ensureElectronBridgeStubs() {
  window.careconnect = {
    onNavigate: jest.fn(() => () => {}),
    onMenuAction: jest.fn(() => () => {}),
  };
  window.print = jest.fn();
  window.alert = jest.fn();
}

async function expectCommonRouteBehavior(container, expectedTitle, heading) {
  await waitFor(() => expect(document.title).toBe(expectedTitle));

  const main = document.getElementById('main-content');
  expect(main).toBeTruthy();
  await waitFor(() => expect(main).toHaveFocus());

  expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();

  const results = await axe.run(container, AXE_OPTIONS);
  expect(results.violations).toEqual([]);
}

describe('App live-route coverage', () => {
  test.each(ROUTE_CASES)(
    'renders $path with route accessibility and keyboard smoke checks',
    async ({ path, expectedTitle, heading, keyboardCheck }) => {
      const user = userEvent.setup();
      seedAppSession(path);
      ensureElectronBridgeStubs();

      const { container } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      );

      await expectCommonRouteBehavior(container, expectedTitle, heading);
      await keyboardCheck(user);
    }
  );
});