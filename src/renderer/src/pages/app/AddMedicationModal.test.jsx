import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddMedicationModal from './AddMedicationModal.jsx';

describe('AddMedicationModal', () => {
  it('shows validation error when name is empty', async () => {
    const onAdd = jest.fn();
    render(<AddMedicationModal onAdd={onAdd} onClose={jest.fn()} />);

    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/medication name/i);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('submits medication data and closes', async () => {
    const onAdd = jest.fn();
    const onClose = jest.fn();
    render(<AddMedicationModal onAdd={onAdd} onClose={onClose} />);

    await userEvent.type(screen.getByPlaceholderText(/atorvastatin/i), 'Memantine');
    await userEvent.click(screen.getByRole('button', { name: /^add medication/i }));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Memantine' })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key', async () => {
    const onClose = jest.fn();
    render(<AddMedicationModal onAdd={jest.fn()} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
