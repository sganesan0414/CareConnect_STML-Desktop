import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { updatePassword } from '../lib/auth.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!EMAIL_PATTERN.test(email.trim())) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('New password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    const result = updatePassword(email, password);
    if (!result.ok) return setError(result.error);

    // Password changed — send the user to the password sign-in with email prefilled.
    setSuccess(true);
    setTimeout(
      () => navigate(`/login?tab=password&email=${encodeURIComponent(email.trim())}`),
      1200
    );
  };

  return (
    <div className="login-body">
      <main className="login" id="main-content" tabIndex="-1">
        <Link className="login__home" to="/login?tab=password">← Back to sign in</Link>

        <h1 className="login__brand">Care Connect</h1>

        <section className="signin" aria-labelledby="reset-title">
          <header className="signin__header">
            <h2 id="reset-title">Reset Password</h2>
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
                <span>Password changed. Redirecting to sign in…</span>
              </p>
            )}

            <form onSubmit={onSubmit} noValidate>
              <label className="field">
                <span className="field__label">Email address <span className="req">*</span></span>
                <input
                  type="email"
                  className="field__input"
                  placeholder="you@memory.care"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">New password <span className="req">*</span></span>
                <span className="field__wrap">
                  <span className="field__icon" aria-hidden="true">🔒</span>
                  <input
                    type={show ? 'text' : 'password'}
                    className="field__input field__input--icon"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <span className="field__label">Confirm new password <span className="req">*</span></span>
                <span className="field__wrap">
                  <span className="field__icon" aria-hidden="true">🔒</span>
                  <input
                    type={show ? 'text' : 'password'}
                    className="field__input field__input--icon"
                    placeholder="Re-enter your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </span>
              </label>

              <button type="submit" className="btn-signin">Reset Password</button>
            </form>

            <p className="signup-cta">
              Remember your password?
              <Link className="link-btn" to="/login?tab=password">Sign In</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
