import axe from 'axe-core';
import { Routes, Route } from 'react-router-dom';
import { renderWithRouter, screen, waitFor, act } from '../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Register from './Register.jsx';
import { findAccount } from '@/lib/auth.js';

function renderRegister() {
  return renderWithRouter(
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>,
    { route: '/register' }
  );
}

async function fillValidForm({ email = 'new.user@example.com' } = {}) {
  await userEvent.type(screen.getByLabelText(/full name/i), 'New User');
  await userEvent.type(screen.getByLabelText(/email address/i), email);
  await userEvent.type(screen.getByLabelText(/^password/i, { selector: 'input' }), 'password123');
  await userEvent.type(screen.getByLabelText(/confirm password/i, { selector: 'input' }), 'password123');
  await userEvent.click(screen.getByRole('checkbox'));
}

describe('Register', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no axe violations', async () => {
    const { container } = renderRegister();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('requires a full name', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/enter your full name/i);
  });

  it('requires a valid email address', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/full name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email address/i);
  });

  it('requires an 8+ character password', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/full name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'new.user@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i, { selector: 'input' }), 'short');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
  });

  it('requires matching passwords', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/full name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'new.user@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i, { selector: 'input' }), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i, { selector: 'input' }), 'different');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/passwords do not match/i);
  });

  it('requires accepting the terms of service', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/full name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'new.user@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i, { selector: 'input' }), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i, { selector: 'input' }), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/accept the terms/i);
  });

  it('rejects an email that is already registered', async () => {
    renderRegister();
    await fillValidForm({ email: 'margaret@memory.care' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i);
  });

  it('creates the account, shows success and redirects to sign in', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    renderRegister();
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/account created/i);
    expect(findAccount('new.user@example.com')).toMatchObject({ name: 'New User' });

    act(() => {
      jest.advanceTimersByTime(1300);
    });
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument());
    jest.useRealTimers();
  });

  it('selects the caregiver role', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('radio', { name: /caregiver/i }));
    await fillValidForm({ email: 'caregiver.new@example.com' });
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(findAccount('caregiver.new@example.com')).toMatchObject({ role: 'caregiver' });
  });

  it('toggles password visibility for both password fields', async () => {
    renderRegister();
    const password = screen.getByLabelText(/^password/i, { selector: 'input' });
    const confirm = screen.getByLabelText(/confirm password/i, { selector: 'input' });
    expect(password).toHaveAttribute('type', 'password');
    expect(confirm).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: /show/i }));
    expect(password).toHaveAttribute('type', 'text');
    expect(confirm).toHaveAttribute('type', 'text');
  });

  it('links back to sign in', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('link', { name: 'Sign In' }));
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument());
  });
});
