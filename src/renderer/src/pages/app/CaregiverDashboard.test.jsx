import axe from 'axe-core';
import { renderWithRouter, screen, waitFor, act } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import CaregiverDashboard from './CaregiverDashboard.jsx';
import { emitNew } from '../../lib/appEvents.js';

describe('CaregiverDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('careconnect.session', 'margaret@memory.care');
    localStorage.setItem('careconnect.mode', 'caregiver');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders the caregiver hero and task list', async () => {
    renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    expect(await screen.findByText('Margaret Hughes')).toBeInTheDocument();
    expect(screen.getByText('Task Status')).toBeInTheDocument();
    expect(screen.getByText('Lunch with Linda')).toBeInTheDocument();
  });

  it('toggles a task done/not-done', async () => {
    renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    const checkButton = await screen.findByRole('button', { name: /mark done: lunch with linda/i });
    await userEvent.click(checkButton);
    expect(screen.getByRole('button', { name: /mark not done: lunch with linda/i })).toBeInTheDocument();
  });

  it('opens the add task modal via the hero button', async () => {
    renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(screen.getByRole('dialog', { name: /add new task/i })).toBeInTheDocument();
  });

  it('opens the add task modal via Ctrl+N', async () => {
    renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    await userEvent.keyboard('{Control>}n{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('opens the add task modal when the native menu emits New', async () => {
    renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    act(() => {
      emitNew();
    });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('adds a task through the modal', async () => {
    renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    await userEvent.type(screen.getByPlaceholderText(/describe what needs to happen/i), 'Refill prescription');
    await userEvent.click(screen.getByRole('button', { name: /^add task/i }));
    await waitFor(() => expect(screen.getByText('Refill prescription')).toBeInTheDocument());
  });

  it('shows a window alert when calling the patient', async () => {
    window.alert = jest.fn();
    renderWithRouter(<CaregiverDashboard />, { route: '/app' });
    await userEvent.click(screen.getByRole('button', { name: /call patient/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/calling patient/i));
  });
});
