import { renderWithRouter, screen, fireEvent } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Settings from './Settings.jsx';
import { loadSettings } from '@/lib/settings.js';

describe('Settings page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders accessibility controls and account fields', () => {
    renderWithRouter(<Settings />, { route: '/app/settings' });
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/base font size/i)).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /high contrast mode/i })).toBeInTheDocument();
    expect(screen.getByText(/margaret holloway/i)).toBeInTheDocument();
  });

  it('saves settings to localStorage', async () => {
    renderWithRouter(<Settings />, { route: '/app/settings' });
    const slider = screen.getByLabelText(/base font size/i);
    fireEvent.change(slider, { target: { value: '20' } });

    await userEvent.click(screen.getByRole('button', { name: /save settings/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/saved/i);
    expect(loadSettings().fontSize).toBe(20);
  });

  it('toggles high contrast switch', async () => {
    renderWithRouter(<Settings />, { route: '/app/settings' });
    const toggle = screen.getByRole('switch', { name: /high contrast mode/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('resets settings to defaults', async () => {
    renderWithRouter(<Settings />, { route: '/app/settings' });
    await userEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));
    expect(loadSettings().fontSize).toBe(17);
  });

  it('shows keyboard shortcut reference grid', () => {
    renderWithRouter(<Settings />, { route: '/app/settings' });
    expect(screen.getByText('Ctrl+3')).toBeInTheDocument();
    expect(screen.getByText('Medications')).toBeInTheDocument();
  });

  it('saves settings on Ctrl+S keyboard shortcut', async () => {
    renderWithRouter(<Settings />, { route: '/app/settings' });
    const slider = screen.getByLabelText(/base font size/i);
    fireEvent.change(slider, { target: { value: '22' } });

    await userEvent.keyboard('{Control>}s{/Control}');

    expect(screen.getByRole('status')).toHaveTextContent(/saved/i);
    expect(loadSettings().fontSize).toBe(22);
  });
});
