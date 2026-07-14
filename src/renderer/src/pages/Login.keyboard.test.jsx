import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigate = jest.fn();
const mockUseSearchParams = jest.fn(() => [new URLSearchParams(), jest.fn()]);

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={typeof to === 'string' ? to : '#'} {...props}>{children}</a>,
  useNavigate: () => mockNavigate,
  useSearchParams: () => mockUseSearchParams(),
}));

import Login from './Login.jsx';

describe('Login keyboard behavior', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('moves between PIN and password tabs with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const pinTab = screen.getByRole('tab', { name: /pin/i });
    const passwordTab = screen.getByRole('tab', { name: /password/i });

    pinTab.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(passwordTab).toHaveAttribute('aria-selected', 'true'));
    expect(passwordTab).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(pinTab).toHaveAttribute('aria-selected', 'true'));
    expect(pinTab).toHaveFocus();

    await user.keyboard('{End}');
    await waitFor(() => expect(passwordTab).toHaveAttribute('aria-selected', 'true'));

    await user.keyboard('{Home}');
    await waitFor(() => expect(pinTab).toHaveAttribute('aria-selected', 'true'));
  });

  it('activates password controls with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole('tab', { name: /password/i }));

    const toggleButton = screen.getByRole('button', { name: /show/i });
    toggleButton.focus();

    fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });
    fireEvent.click(toggleButton);
    await waitFor(() => expect(screen.getByRole('button', { name: /hide/i })).toBeVisible());

    const hideButton = screen.getByRole('button', { name: /hide/i });
    hideButton.focus();
    fireEvent.keyDown(hideButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(hideButton);
    await waitFor(() => expect(screen.getByRole('button', { name: /show/i })).toBeVisible());
  });
});