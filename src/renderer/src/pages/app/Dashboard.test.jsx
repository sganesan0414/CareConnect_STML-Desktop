import axe from 'axe-core';
import { renderWithRouter, screen, waitFor } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard.jsx';

describe('Dashboard (patient home)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<Dashboard />, { route: '/app' });
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("renders the greeting, today's plan and medications strip", () => {
    renderWithRouter(<Dashboard />, { route: '/app' });
    expect(screen.getByText(/good (morning|afternoon|evening), there\./i)).toBeInTheDocument();
    expect(screen.getByText("Today's Plan")).toBeInTheDocument();
    expect(screen.getByText('Medications Today')).toBeInTheDocument();
    expect(screen.getByText('Donepezil')).toBeInTheDocument();
  });

  it('toggles a plan item done/not-done', async () => {
    renderWithRouter(<Dashboard />, { route: '/app' });
    const checkButton = screen.getByRole('button', { name: /mark done: lunch with linda/i });
    await userEvent.click(checkButton);
    expect(screen.getByRole('button', { name: /mark not done: lunch with linda/i })).toBeInTheDocument();
  });

  it('reveals a memory prompt answer by default, and hides it when tapped', async () => {
    renderWithRouter(<Dashboard />, { route: '/app' });
    const card = screen.getByRole('button', { name: /what year were you born/i });
    expect(card).toHaveClass('is-open');
    expect(screen.getByText(/1952/)).toBeInTheDocument();

    await userEvent.click(card);
    expect(card).not.toHaveClass('is-open');

    await userEvent.click(card);
    expect(card).toHaveClass('is-open');
  });

  it('falls back to the current date for a prompt with no fixed answer', async () => {
    renderWithRouter(<Dashboard />, { route: '/app' });
    const dateCard = screen.getByRole('button', { name: /today's date/i });
    await userEvent.click(dateCard);
    expect(dateCard).toHaveClass('is-open');
    expect(dateCard.textContent).toMatch(/\d{4}/);
  });

  it('navigates to the full daily plan', async () => {
    renderWithRouter(<Dashboard />, { route: '/app' });
    await userEvent.click(screen.getByRole('button', { name: /view full plan/i }));
  });

  it('shows the "all done" message once every task is complete', async () => {
    renderWithRouter(<Dashboard />, { route: '/app' });
    const checkButtons = screen.getAllByRole('button', { name: /^mark done:/i });
    for (const btn of checkButtons) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click(btn);
    }
    await waitFor(() => expect(screen.getByText(/all done for today/i)).toBeInTheDocument());
  });
});
