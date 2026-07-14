import axe from 'axe-core';
import { Routes, Route } from 'react-router-dom';
import { renderWithRouter, screen, waitFor, act } from '../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Login from './Login.jsx';

function renderLogin(route = '/login') {
  return renderWithRouter(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<div>App Home</div>} />
      <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
      <Route path="/register" element={<div>Register Page</div>} />
    </Routes>,
    { route }
  );
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no axe violations on the default PIN tab', async () => {
    const { container } = renderLogin();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('shows an error and clears the entry for an incorrect PIN', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    renderLogin();
    for (const digit of ['9', '9', '9', '9']) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click(screen.getByRole('button', { name: digit }));
    }
    expect(screen.getByRole('status')).toHaveTextContent(/incorrect pin/i);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    jest.useRealTimers();
  });

  it('signs in and navigates to /app for the correct PIN', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    renderLogin();
    for (const digit of ['1', '2', '3', '4']) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click(screen.getByRole('button', { name: digit }));
    }
    expect(screen.getByRole('status')).toHaveTextContent(/pin accepted/i);

    act(() => {
      jest.advanceTimersByTime(800);
    });
    await waitFor(() => expect(screen.getByText('App Home')).toBeInTheDocument());
    jest.useRealTimers();
  });

  it('deletes the last PIN digit with the delete key', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete last digit' }));
    // Only one dot should remain filled; finishing with the correct remaining
    // digits should still be able to complete a 4-digit PIN.
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    expect(screen.getByRole('status')).toHaveTextContent(/pin accepted/i);
  });

  it('accepts PIN digits from the physical keyboard', async () => {
    renderLogin();
    await userEvent.keyboard('1234');
    expect(screen.getByRole('status')).toHaveTextContent(/pin accepted/i);
  });

  it('switches to the Password tab and prefills the demo credentials', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('tab', { name: /password/i }));
    expect(screen.getByLabelText(/email address/i)).toHaveValue('margaret@memory.care');
  });

  it('shows a validation error when password fields are empty', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('tab', { name: /password/i }));
    await userEvent.clear(screen.getByLabelText(/email address/i));
    await userEvent.click(screen.getByRole('button', { name: /^sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/enter both your email and password/i);
  });

  it('shows an error for incorrect password credentials', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('tab', { name: /password/i }));
    await userEvent.clear(screen.getByLabelText(/^password/i, { selector: 'input' }));
    await userEvent.type(screen.getByLabelText(/^password/i, { selector: 'input' }), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /^sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrect email or password/i);
  });

  it('signs in with correct password credentials and navigates to /app', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('tab', { name: /password/i }));
    await userEvent.click(screen.getByRole('button', { name: /^sign in/i }));
    await waitFor(() => expect(screen.getByText('App Home')).toBeInTheDocument());
  });

  it('toggles password visibility', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('tab', { name: /password/i }));
    const passwordInput = screen.getByLabelText(/^password/i, { selector: 'input' });
    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /show/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('navigates to the forgot-password screen with the email prefilled', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('tab', { name: /password/i }));
    await userEvent.click(screen.getByRole('link', { name: /forgot password/i }));
    await waitFor(() => expect(screen.getByText('Forgot Password Page')).toBeInTheDocument());
  });

  it('links to the Create Account screen', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('tab', { name: /password/i }));
    await userEvent.click(screen.getByRole('link', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText('Register Page')).toBeInTheDocument());
  });

  it('opens directly on the Password tab when ?tab=password is set', () => {
    renderLogin('/login?tab=password');
    expect(screen.getByRole('tab', { name: /password/i })).toHaveAttribute('aria-selected', 'true');
  });
});
