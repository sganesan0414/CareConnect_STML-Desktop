import axe from 'axe-core';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTaskModal from './AddTaskModal.jsx';

describe('AddTaskModal', () => {
  it('has no axe violations', async () => {
    const { container } = render(<AddTaskModal onAdd={jest.fn()} onClose={jest.fn()} />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('shows a validation error when description is empty', async () => {
    const onAdd = jest.fn();
    render(<AddTaskModal onAdd={onAdd} onClose={jest.fn()} />);

    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/describe what needs to happen/i);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('submits task data with defaults and closes', async () => {
    const onAdd = jest.fn();
    const onClose = jest.fn();
    render(<AddTaskModal onAdd={onAdd} onClose={onClose} />);

    await userEvent.type(screen.getByPlaceholderText(/describe what needs to happen/i), 'Water the plants');
    await userEvent.click(screen.getByRole('button', { name: /^add task/i }));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Water the plants', type: 'Activity', done: false })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('lets the user pick a task type and includes notes', async () => {
    const onAdd = jest.fn();
    render(<AddTaskModal onAdd={onAdd} onClose={jest.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/describe what needs to happen/i), 'Take medication');
    await userEvent.click(screen.getByRole('radio', { name: 'Medication' }));
    await userEvent.type(screen.getByPlaceholderText(/optional notes/i), 'Give with food');
    await userEvent.click(screen.getByRole('button', { name: /^add task/i }));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Medication', notes: 'Give with food' })
      );
    });
  });

  it('submits via Ctrl+S', async () => {
    const onAdd = jest.fn();
    render(<AddTaskModal onAdd={onAdd} onClose={jest.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/describe what needs to happen/i), 'Call the pharmacy');
    await userEvent.keyboard('{Control>}s{/Control}');

    await waitFor(() => expect(onAdd).toHaveBeenCalled());
  });

  it('closes on Escape and via the Cancel/close buttons', async () => {
    const onCloseEsc = jest.fn();
    const { unmount } = render(<AddTaskModal onAdd={jest.fn()} onClose={onCloseEsc} />);
    await userEvent.keyboard('{Escape}');
    expect(onCloseEsc).toHaveBeenCalled();
    unmount();

    const onCloseCancel = jest.fn();
    render(<AddTaskModal onAdd={jest.fn()} onClose={onCloseCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCloseCancel).toHaveBeenCalled();
  });
});
