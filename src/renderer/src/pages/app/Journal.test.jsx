import axe from 'axe-core';
import { renderWithRouter, screen, waitFor, act } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Journal from './Journal.jsx';
import { emitNew } from '@/lib/appEvents.js';

describe('Journal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<Journal />, { route: '/app/journal' });
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders the feed seeded with default entries', () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    expect(screen.getByText('Memory Journal')).toBeInTheDocument();
    expect(screen.getByText(/margaret had a settled morning/i)).toBeInTheDocument();
  });

  it('shows a validation error when saving an empty note', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    await userEvent.click(screen.getByRole('button', { name: /^save entry/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/write a short note/i);
  });

  it('adds a new entry with the selected mood and clears the form', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    await userEvent.type(screen.getByPlaceholderText(/notes/i), 'Had a lovely walk today');
    await userEvent.click(screen.getByRole('radio', { name: /happy/i }));
    await userEvent.click(screen.getByRole('button', { name: /^save entry/i }));

    await waitFor(() => expect(screen.getByText('Had a lovely walk today')).toBeInTheDocument());
    expect(screen.getByPlaceholderText(/notes/i)).toHaveValue('');
  });

  it('navigates the mood picker with arrow keys, Home and End', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    const calm = screen.getByRole('radio', { name: /calm/i });
    calm.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: /confused/i })).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    expect(calm).toHaveFocus();

    await userEvent.keyboard('{End}');
    expect(screen.getByRole('radio', { name: /tired/i })).toHaveFocus();

    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: /happy/i })).toHaveFocus();
  });

  it('clears the form on Cancel', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    await userEvent.type(screen.getByPlaceholderText(/notes/i), 'Draft note');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByPlaceholderText(/notes/i)).toHaveValue('');
  });

  it('clears the form on Escape while the notes field is focused', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    const notes = screen.getByPlaceholderText(/notes/i);
    await userEvent.type(notes, 'Draft note');
    await userEvent.keyboard('{Escape}');
    expect(notes).toHaveValue('');
  });

  it('focuses the notes field via Ctrl+N', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    await userEvent.keyboard('{Control>}n{/Control}');
    await waitFor(() => expect(screen.getByPlaceholderText(/notes/i)).toHaveFocus());
  });

  it('saves via Ctrl+S', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    await userEvent.type(screen.getByPlaceholderText(/notes/i), 'Quick save test');
    await userEvent.keyboard('{Control>}s{/Control}');
    await waitFor(() => expect(screen.getByText('Quick save test')).toBeInTheDocument());
  });

  it('focuses the notes field when the native menu emits New', async () => {
    renderWithRouter(<Journal />, { route: '/app/journal' });
    act(() => {
      emitNew();
    });
    await waitFor(() => expect(screen.getByPlaceholderText(/notes/i)).toHaveFocus());
  });
});
