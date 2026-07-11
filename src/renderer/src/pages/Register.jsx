import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAccount } from '../lib/auth.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'patient',
    password: '',
    confirm: '',
    terms: false,
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!EMAIL_PATTERN.test(form.email.trim())) return setError('Please enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (!form.terms) return setError('Please accept the Terms of Service to continue.');

    // Persist the new account so it can be used to sign in.
    const result = createAccount({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });
    if (!result.ok) return setError(result.error);

    setSuccess(true);
    setTimeout(
      () => navigate(`/login?tab=password&email=${encodeURIComponent(form.email.trim())}`),
      1200
    );
  };

  return (
    <div className="login-body">
      <main className="login" id="main-content" tabIndex="-1">
        <Link className="login__home" to="/login">← Back to sign in</Link>

        <h1 className="login__brand">Care Connect</h1>

        <section className="signin" aria-labelledby="register-title">
          <header className="signin__header">
            <h2 id="register-title">Create Account</h2>
          </header>

          <div className="panel is-active">
            {error && (
              <div className="alert" role="alert">
                <span className="alert__icon" aria-hidden="true">⚠</span>
                <span className="alert__text">{error}</span>
              </div>
            )}

            {success && (
              <p className="success" role="status">
                <span aria-hidden="true">✓</span>
                <span>Account created. Redirecting to sign in…</span>
              </p>
            )}

            <form onSubmit={onSubmit} noValidate>
              <label className="field">
                <span className="field__label">Full name <span className="req">*</span></span>
                <input
                  type="text"
                  className="field__input"
                  placeholder="Margaret Doe"
                  value={form.name}
                  onChange={update('name')}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">Email address <span className="req">*</span></span>
                <input
                  type="email"
                  className="field__input"
                  placeholder="you@memory.care"
                  value={form.email}
                  onChange={update('email')}
                  autoComplete="username"
                  required
                />
              </label>

              <fieldset className="field role-field">
                <legend className="field__label">I am a <span className="req">*</span></legend>
                <div className="role-options">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="patient"
                      checked={form.role === 'patient'}
                      onChange={update('role')}
                    />
                    <span>Patient</span>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="caregiver"
                      checked={form.role === 'caregiver'}
                      onChange={update('role')}
                    />
                    <span>Caregiver</span>
                  </label>
                </div>
              </fieldset>

              <label className="field">
                <span className="field__label">Password <span className="req">*</span></span>
                <span className="field__wrap">
                  <span className="field__icon" aria-hidden="true">🔒</span>
                  <input
                    type={show ? 'text' : 'password'}
                    className="field__input field__input--icon"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={update('password')}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="field__toggle"
                    aria-pressed={show}
                    onClick={() => setShow((s) => !s)}
                  >
                    <span aria-hidden="true">👁</span> {show ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>

              <label className="field">
                <span className="field__label">Confirm password <span className="req">*</span></span>
                <span className="field__wrap">
                  <span className="field__icon" aria-hidden="true">🔒</span>
                  <input
                    type={show ? 'text' : 'password'}
                    className="field__input field__input--icon"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={update('confirm')}
                    autoComplete="new-password"
                    required
                  />
                </span>
              </label>

              <label className="terms">
                <input type="checkbox" checked={form.terms} onChange={update('terms')} required />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>

              <button type="submit" className="btn-signin">Create Account</button>
            </form>

            <p className="signup-cta">
              Already have an account?
              <Link className="link-btn" to="/login?tab=password">Sign In</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
