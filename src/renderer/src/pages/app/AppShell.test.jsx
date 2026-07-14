import axe from 'axe-core';
import { Routes, Route } from 'react-router-dom';
import { renderWithRouter, screen, waitFor, act } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import AppShell from './AppShell.jsx';
import { loadSettings } from '@/lib/settings.js';
import { getSession, createAccount, setSession } from '@/lib/auth.js';

function renderShell(route = '/app') {
  return renderWithRouter(
    <Routes>
      <Route path="/app" element={<AppShell />}>
        <Route index element={<div>Home Content</div>} />
        <Route path="daily-plan" element={<div>Daily Plan Content</div>} />
      </Route>
    </Routes>,
    { route }
  );
}

describe('AppShell', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('careconnect.session', 'margaret@memory.care');
    localStorage.setItem('careconnect.mode', 'patient');
    document.documentElement.className = '';
    document.documentElement.style.fontSize = '';
    window.print = jest.fn();
    window.alert = jest.fn();
  });

  it('has no axe violations', async () => {
    const { container } = renderShell();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders the toolbar tabs, sidebar navigation and emergency contact', () => {
    renderShell();
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByText(/emergency/i)).toBeInTheDocument();
    expect(screen.getByText('Linda Chen')).toBeInTheDocument();
    expect(screen.getByText('Home Content')).toBeInTheDocument();
  });

  it('shortens a two-word user name to first name + last initial', () => {
    renderShell();
    expect(screen.getByText(/margaret h\./i)).toBeInTheDocument();
  });

  it('uses the full name as-is when it has no surname', () => {
    createAccount({ name: 'Solo', email: 'solo@example.com', password: 'x', role: 'patient' });
    setSession('solo@example.com');
    renderShell();
    expect(screen.getByText(/^solo$/i)).toBeInTheDocument();
  });

  it('shows the Patient role badge for a patient session', () => {
    renderShell();
    expect(screen.getByText('Patient')).toBeInTheDocument();
  });

  it('shows the Caregiver role badge for a caregiver session', () => {
    createAccount({ name: 'Linda Chen', email: 'linda@example.com', password: 'x', role: 'caregiver' });
    setSession('linda@example.com');
    localStorage.setItem('careconnect.mode', 'caregiver');
    renderShell();
    expect(screen.getByText('Caregiver')).toBeInTheDocument();
  });

  it('navigates to a route via Ctrl+2', async () => {
    renderShell();
    await userEvent.keyboard('{Control>}2{/Control}');
    await waitFor(() => expect(screen.getByText('Daily Plan Content')).toBeInTheDocument());
  });

  it('opens and closes the shortcuts modal with F1 / Escape', async () => {
    renderShell();
    await userEvent.keyboard('{F1}');
    expect(screen.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens the shortcuts modal via Ctrl+/', async () => {
    renderShell();
    await userEvent.keyboard('{Control>}/{/Control}');
    expect(screen.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeInTheDocument();
  });

  it('opens the shortcuts modal via the header button', async () => {
    renderShell();
    await userEvent.click(screen.getByTitle(/keyboard shortcuts/i));
    expect(screen.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeInTheDocument();
  });

  it('flashes the emergency contact on F9', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    renderShell();
    const emergency = screen.getByText(/emergency/i).closest('div');
    expect(emergency).not.toHaveClass('is-lit');

    await userEvent.keyboard('{F9}');
    expect(emergency).toHaveClass('is-lit');

    jest.advanceTimersByTime(1700);
    await waitFor(() => expect(emergency).not.toHaveClass('is-lit'));
    jest.useRealTimers();
  });

  it('signs out on Ctrl+Q, clearing the session', async () => {
    renderShell();
    await userEvent.keyboard('{Control>}q{/Control}');
    expect(getSession()).toBeNull();
  });

  it('signs out from the header sign-out button', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(getSession()).toBeNull();
  });

  it('toggles high contrast on Ctrl+H and persists it', async () => {
    renderShell();
    await userEvent.keyboard('{Control>}h{/Control}');
    expect(document.documentElement.classList.contains('cc-contrast')).toBe(true);
    expect(loadSettings().highContrast).toBe(true);

    await userEvent.keyboard('{Control>}h{/Control}');
    expect(document.documentElement.classList.contains('cc-contrast')).toBe(false);
  });

  it('adjusts font size with Ctrl+= and Ctrl+-', async () => {
    renderShell();
    const initial = loadSettings().fontSize;

    await userEvent.keyboard('{Control>}={/Control}');
    expect(loadSettings().fontSize).toBe(initial + 1);

    await userEvent.keyboard('{Control>}-{/Control}');
    expect(loadSettings().fontSize).toBe(initial);
  });

  it('prints via Ctrl+P', async () => {
    renderShell();
    await userEvent.keyboard('{Control>}p{/Control}');
    expect(window.print).toHaveBeenCalled();
  });

  it('responds to native menu actions for shortcuts, sign out, emergency, print and text size', async () => {
    renderShell();

    act(() => {
      window.careconnect.__emit('menuAction', 'shortcuts');
    });
    expect(screen.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeInTheDocument();
    act(() => {
      window.careconnect.__emit('menuAction', 'shortcuts');
    });

    act(() => {
      window.careconnect.__emit('menuAction', 'print');
    });
    expect(window.print).toHaveBeenCalled();

    const before = loadSettings().fontSize;
    act(() => {
      window.careconnect.__emit('menuAction', 'bigger-text');
    });
    expect(loadSettings().fontSize).toBe(before + 1);
    act(() => {
      window.careconnect.__emit('menuAction', 'smaller-text');
    });
    expect(loadSettings().fontSize).toBe(before);

    act(() => {
      window.careconnect.__emit('menuAction', 'high-contrast');
    });
    expect(loadSettings().highContrast).toBe(true);

    act(() => {
      window.careconnect.__emit('menuAction', 'signout');
    });
    expect(getSession()).toBeNull();
  });
});
