import axe from 'axe-core';
import { Routes, Route } from 'react-router-dom';
import { renderWithRouter, screen, waitFor, act } from '../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import ForgotPassword from './ForgotPassword.jsx';
import { verifyPassword, DEMO_EMAIL } from '@/lib/auth.js';

function renderForgotPassword(route = '/forgot-password') {
  return renderWithRouter(
    <Routes>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>,
    { route }
  );
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no axe violations', async () => {
    const { container } = renderForgotPassword();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('prefills the email address from the query string', () => {
    renderForgotPassword(`/forgot-password?email=${encodeURIComponent(DEMO_EMAIL)}`);
    expect(screen.getByLabelText(/email address/i)).toHaveValue(DEMO_EMAIL);
  });

  it('requires a valid email address', async () => {
    renderForgotPassword();
    await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email address/i);
  });

  it('requires an 8+ character new password', async () => {
    renderForgotPassword();
    await userEvent.type(screen.getByLabelText(/email address/i), DEMO_EMAIL);
    await userEvent.type(screen.getByLabelText(/^new password/i, { selector: 'input' }), 'short');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
  });

  it('requires matching passwords', async () => {
    renderForgotPassword();
    await userEvent.type(screen.getByLabelText(/email address/i), DEMO_EMAIL);
    await userEvent.type(screen.getByLabelText(/^new password/i, { selector: 'input' }), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm new password/i, { selector: 'input' }), 'different');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/passwords do not match/i);
  });

  it('shows an error for an account that does not exist', async () => {
    renderForgotPassword();
    await userEvent.type(screen.getByLabelText(/email address/i), 'nobody@example.com');
    await userEvent.type(screen.getByLabelText(/^new password/i, { selector: 'input' }), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm new password/i, { selector: 'input' }), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/no account found/i);
  });

  it('resets the password, shows success and redirects to sign in', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    renderForgotPassword();
    await userEvent.type(screen.getByLabelText(/email address/i), DEMO_EMAIL);
    await userEvent.type(screen.getByLabelText(/^new password/i, { selector: 'input' }), 'brand-new-password');
    await userEvent.type(screen.getByLabelText(/confirm new password/i, { selector: 'input' }), 'brand-new-password');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/password changed/i);
    expect(verifyPassword(DEMO_EMAIL, 'brand-new-password')).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1300);
    });
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument());
    jest.useRealTimers();
  });

  it('toggles password visibility for both password fields', async () => {
    renderForgotPassword();
    const password = screen.getByLabelText(/^new password/i, { selector: 'input' });
    const confirm = screen.getByLabelText(/confirm new password/i, { selector: 'input' });
    expect(password).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /show/i }));
    expect(password).toHaveAttribute('type', 'text');
    expect(confirm).toHaveAttribute('type', 'text');
  });

  it('links back to sign in', async () => {
    renderForgotPassword();
    await userEvent.click(screen.getByRole('link', { name: 'Sign In' }));
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument());
  });
});
