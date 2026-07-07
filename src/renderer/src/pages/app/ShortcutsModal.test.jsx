import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShortcutsModal from './ShortcutsModal.jsx';

describe('ShortcutsModal', () => {
  it('renders grouped keyboard shortcuts', () => {
    render(<ShortcutsModal onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Medications')).toBeInTheDocument();
    expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0);
  });

  it('calls onClose when Got it is clicked', async () => {
    const onClose = jest.fn();
    render(<ShortcutsModal onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /got it/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = jest.fn();
    render(<ShortcutsModal onClose={onClose} />);
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose from close button', async () => {
    const onClose = jest.fn();
    render(<ShortcutsModal onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
