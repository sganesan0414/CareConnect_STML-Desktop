import { render, fireEvent, waitFor } from '@testing-library/react';
import ShortcutsModal from './ShortcutsModal.jsx';

function renderModal() {
  const onClose = jest.fn();
  const utils = render(<ShortcutsModal onClose={onClose} />);
  const closeButton = utils.getByRole('button', { name: /close/i });
  return { ...utils, onClose, closeButton };
}

describe('ShortcutsModal keyboard behavior', () => {
  it('moves initial focus to the close button', async () => {
    const { closeButton } = renderModal();

    await waitFor(() => expect(closeButton).toHaveFocus());
  });

  it('closes on Escape', () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps focus with Tab and Shift+Tab inside the dialog', async () => {
    const { closeButton, getByRole } = renderModal();

    await waitFor(() => expect(closeButton).toHaveFocus());

    const gotItButton = getByRole('button', { name: /got it/i });

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(gotItButton).toHaveFocus();

    gotItButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });
});