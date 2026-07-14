import axe from 'axe-core';
import { renderWithRouter, screen, waitFor, act } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import DailyPlan from './DailyPlan.jsx';
import { saveTasks } from '@/lib/tasks.js';
import { emitNew } from '@/lib/appEvents.js';

describe('DailyPlan', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('groups tasks into morning/afternoon/evening sections', () => {
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Afternoon')).toBeInTheDocument();
    expect(screen.getByText('Evening')).toBeInTheDocument();
    expect(screen.getByText('Take morning medications')).toBeInTheDocument();
  });

  it('hides the Anytime section when nothing lands there', () => {
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    expect(screen.queryByText('Anytime')).not.toBeInTheDocument();
  });

  it('shows the Anytime section for tasks with no recognisable time', () => {
    saveTasks([{ id: 'x1', label: 'Untimed task', time: '', type: 'Social', done: false }]);
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    expect(screen.getByText('Anytime')).toBeInTheDocument();
    expect(screen.getByText('Untimed task')).toBeInTheDocument();
  });

  it('shows an empty-section message when a section has no tasks', () => {
    saveTasks([{ id: 'x1', label: 'Morning only', time: '08:00', type: 'Social', done: false }]);
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    expect(screen.getAllByText('Nothing scheduled.').length).toBeGreaterThan(0);
  });

  it('toggles a task done/not-done', async () => {
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    const checkButton = screen.getByRole('button', { name: /mark done: lunch with linda/i });
    await userEvent.click(checkButton);
    expect(screen.getByRole('button', { name: /mark not done: lunch with linda/i })).toBeInTheDocument();
  });

  it('opens the add task modal via the header button', async () => {
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(screen.getByRole('dialog', { name: /add new task/i })).toBeInTheDocument();
  });

  it('opens the add task modal via Ctrl+N', async () => {
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    await userEvent.keyboard('{Control>}n{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('opens the add task modal when the native menu emits New', async () => {
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    act(() => {
      emitNew();
    });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('adds a new task with a type badge through the modal', async () => {
    renderWithRouter(<DailyPlan />, { route: '/app/daily-plan' });
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    await userEvent.type(screen.getByPlaceholderText(/describe what needs to happen/i), 'Refill prescription');
    await userEvent.click(screen.getByRole('radio', { name: 'Medication' }));
    await userEvent.click(screen.getByRole('button', { name: /^add task/i }));
    await waitFor(() => expect(screen.getByText('Refill prescription')).toBeInTheDocument());
  });
});
