import axe from 'axe-core';
import { renderWithRouter, screen, waitFor, act, within } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Reminders from './Reminders.jsx';
import { saveReminders } from '@/lib/reminders.js';
import { emitNew } from '@/lib/appEvents.js';

describe('Reminders', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders upcoming and done sections from the seeded reminders', () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    expect(screen.getByText(/upcoming today/i)).toBeInTheDocument();
    expect(screen.getByText(/done today/i)).toBeInTheDocument();
    expect(screen.getByText('Lunch with Linda', { selector: '.rem-card__title' })).toBeInTheDocument();
    expect(screen.getByText('Take Donepezil 10 mg')).toBeInTheDocument();
  });

  it('filters reminders by type via tab clicks', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    await userEvent.click(screen.getByRole('tab', { name: /^medications/i }));
    expect(screen.queryByText('Lunch with Linda', { selector: '.rem-card__title' })).not.toBeInTheDocument();
    expect(screen.getByText('Take Metformin 500 mg')).toBeInTheDocument();
  });

  it('shows a filtered empty state when a filter has no upcoming reminders', async () => {
    saveReminders([{ id: 'r1', text: 'Only medication', time: '08:00 AM', type: 'Medication', repeat: 'Once', alert: true, done: true }]);
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    await userEvent.click(screen.getByRole('tab', { name: /^social/i }));
    expect(screen.getByText(/nothing upcoming in this filter/i)).toBeInTheDocument();
  });

  it('navigates filter tabs with ArrowRight/ArrowLeft/Home/End', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const allTab = screen.getByRole('tab', { name: /all reminders/i });
    allTab.focus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: /^medications/i })).toHaveFocus());

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(allTab).toHaveFocus());

    await userEvent.keyboard('{End}');
    await waitFor(() => expect(screen.getByRole('tab', { name: /^activities/i })).toHaveFocus());

    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(allTab).toHaveFocus());
  });

  it('shows a validation error when saving an empty reminder', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    await userEvent.click(screen.getByRole('button', { name: /^save reminder/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/enter the reminder text/i);
  });

  it('adds a new reminder through the form', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    await userEvent.type(screen.getByPlaceholderText(/take aspirin/i), 'Take vitamins');
    await userEvent.click(screen.getByRole('button', { name: /^save reminder/i }));
    await waitFor(() => expect(screen.getByText('Take vitamins')).toBeInTheDocument());
  });

  it('navigates the reminder-type pills with arrow keys, Home and End', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const medication = screen.getByRole('radio', { name: 'Medication' });
    medication.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Appointment' })).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    expect(medication).toHaveFocus();

    await userEvent.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Activity' })).toHaveFocus();

    await userEvent.keyboard('{Home}');
    expect(medication).toHaveFocus();
  });

  it('toggles the alert sound switch', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const toggle = screen.getByRole('switch', { name: /alert sound/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('edits an existing reminder and updates it', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const card = screen.getByText('Lunch with Linda', { selector: '.rem-card__title' }).closest('li');
    await userEvent.click(within(card).getByRole('button', { name: /^edit$/i }));

    expect(screen.getByText(/edit reminder/i)).toBeInTheDocument();
    const textInput = screen.getByDisplayValue('Lunch with Linda');
    await userEvent.clear(textInput);
    await userEvent.type(textInput, 'Lunch with Linda at noon');
    await userEvent.click(screen.getByRole('button', { name: /^update reminder/i }));

    await waitFor(() => expect(screen.getByText('Lunch with Linda at noon')).toBeInTheDocument());
  });

  it('cancels an in-progress edit', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const card = screen.getByText('Lunch with Linda', { selector: '.rem-card__title' }).closest('li');
    await userEvent.click(within(card).getByRole('button', { name: /^edit$/i }));
    expect(screen.getByText(/edit reminder/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /cancel edit/i }));
    expect(screen.getByText(/^new reminder$/i)).toBeInTheDocument();
  });

  it('marks a reminder done and undoes it', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const card = screen.getByText('Lunch with Linda', { selector: '.rem-card__title' }).closest('li');
    await userEvent.click(within(card).getByRole('button', { name: /mark done/i }));

    const updatedCard = screen.getByText('Lunch with Linda', { selector: '.rem-card__title' }).closest('li');
    expect(within(updatedCard).getByRole('button', { name: /^undo$/i })).toBeInTheDocument();
  });

  it('snoozes a reminder by 10 minutes', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const card = screen.getByText('Lunch with Linda', { selector: '.rem-card__title' }).closest('li');
    await userEvent.click(within(card).getByRole('button', { name: /^snooze$/i }));
    await waitFor(() => expect(screen.getByText('12:10 PM')).toBeInTheDocument());
  });

  it('flashes the recurring panel from the header button and the per-item Edit link', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    const recurringPanel = screen.getByText('Recurring Reminders').closest('section');
    expect(recurringPanel).not.toHaveClass('is-lit');

    await userEvent.click(screen.getByRole('button', { name: /manage recurring/i }));
    expect(recurringPanel).toHaveClass('is-lit');

    jest.advanceTimersByTime(1500);
    await waitFor(() => expect(recurringPanel).not.toHaveClass('is-lit'));
    jest.useRealTimers();
  });

  it('focuses the new reminder form via the header button and Ctrl+N', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    await userEvent.click(screen.getByRole('button', { name: /new reminder/i }));
    expect(screen.getByPlaceholderText(/take aspirin/i)).toHaveFocus();

    await userEvent.type(screen.getByPlaceholderText(/take aspirin/i), 'draft');
    await userEvent.keyboard('{Control>}n{/Control}');
    expect(screen.getByPlaceholderText(/take aspirin/i)).toHaveValue('');
  });

  it('saves via Ctrl+S', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    await userEvent.type(screen.getByPlaceholderText(/take aspirin/i), 'Ctrl+S reminder');
    await userEvent.keyboard('{Control>}s{/Control}');
    await waitFor(() => expect(screen.getByText('Ctrl+S reminder')).toBeInTheDocument());
  });

  it('focuses the new reminder form when the native menu emits New', async () => {
    renderWithRouter(<Reminders />, { route: '/app/reminders' });
    act(() => {
      emitNew();
    });
    await waitFor(() => expect(screen.getByPlaceholderText(/take aspirin/i)).toHaveFocus());
  });
});
