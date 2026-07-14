import { renderWithRouter, screen, waitFor, act } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Medications from './Medications.jsx';
import { saveMeds } from '@/lib/meds.js';
import { emitNew } from '@/lib/appEvents.js';

describe('Medications page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders medication list from store', async () => {
    renderWithRouter(<Medications />, { route: '/app/medications' });
    expect(await screen.findByRole('heading', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByText('Donepezil')).toBeInTheDocument();
    expect(screen.getByText('Lisinopril')).toBeInTheDocument();
  });

  it('opens add medication modal and adds a new entry', async () => {
    renderWithRouter(<Medications />, { route: '/app/medications' });
    await userEvent.click(screen.getByRole('button', { name: /add medication/i }));

    const nameInput = screen.getByPlaceholderText(/atorvastatin/i);
    await userEvent.type(nameInput, 'Ibuprofen');
    await userEvent.type(screen.getByPlaceholderText(/cholesterol/i), 'Pain relief');
    await userEvent.click(screen.getByRole('button', { name: /^add medication/i }));

    await waitFor(() => {
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    });
  });

  it('marks medication as taken for today', async () => {
    saveMeds([
      {
        id: 'test-med',
        name: 'Test Med',
        category: 'General',
        dose: '5 mg',
        schedule: '08:00 AM',
        week: ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'],
      },
    ]);

    renderWithRouter(<Medications />, { route: '/app/medications' });
    await screen.findByText('Test Med');

    const markBtn = screen.getByRole('button', { name: 'Mark as taken' });
    await userEvent.click(markBtn);

    expect(screen.getByText('✓ Taken today')).toBeInTheDocument();
  });

  it('shows refill alert in header', () => {
    renderWithRouter(<Medications />, { route: '/app/medications' });
    expect(screen.getByRole('status')).toHaveTextContent(/refill/i);
  });

  it('opens add modal on Ctrl+N keyboard shortcut', async () => {
    renderWithRouter(<Medications />, { route: '/app/medications' });
    await userEvent.keyboard('{Control>}n{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add Medication' })).toBeInTheDocument();
  });

  it('opens add modal when native menu emits New via appEvents', async () => {
    renderWithRouter(<Medications />, { route: '/app/medications' });
    act(() => {
      emitNew();
    });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('toggles taken status via today adherence cell', async () => {
    saveMeds([
      {
        id: 'test-med',
        name: 'Cell Med',
        category: 'General',
        dose: '5 mg',
        schedule: '08:00 AM',
        week: ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'],
      },
    ]);

    renderWithRouter(<Medications />, { route: '/app/medications' });
    await screen.findByText('Cell Med');

    const todayCell = screen.getByRole('button', { name: /today.*mark as taken/i });
    await userEvent.click(todayCell);
    expect(screen.getByText('✓ Taken today')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /today.*mark as not taken/i }));
    expect(screen.getByRole('button', { name: 'Mark as taken' })).toBeInTheDocument();
  });
});
