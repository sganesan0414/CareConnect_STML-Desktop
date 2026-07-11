import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithPin, signInWithPassword } from '../lib/auth.js';
import { loadSettings } from '../lib/settings.js';

const PIN_LENGTH = 4;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'password' ? 'password' : 'pin');
  const pinTabRef = useRef(null);
  const passwordTabRef = useRef(null);

  const switchTab = useCallback((nextTab) => setTab(nextTab), []);

  useEffect(() => {
    const target = tab === 'pin' ? pinTabRef.current : passwordTabRef.current;
    target?.focus();
  }, [tab]);

  const onTabKeyDown = useCallback(
    (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') return switchTab('pin');
      if (event.key === 'End') return switchTab('password');
      switchTab(tab === 'pin' ? 'password' : 'pin');
    },
    [switchTab, tab]
  );

  return (
    <div className="login-body">
      <main className="login" id="main-content" tabIndex="-1">
        <Link className="login__home" to="/">← Back</Link>

        <h1 className="login__brand">Care Connect</h1>

        <section className="signin" aria-labelledby="signin-title">
          <header className="signin__header">
            <h2 id="signin-title">Patient Sign In</h2>
          </header>

          <div className="tabs" role="tablist" aria-label="Sign in method">
            <button
              ref={pinTabRef}
              id="signin-tab-pin"
              className={`tab ${tab === 'pin' ? 'is-active' : ''}`}
              role="tab"
              tabIndex={tab === 'pin' ? 0 : -1}
              aria-selected={tab === 'pin'}
              aria-controls="signin-panel-pin"
              onClick={() => switchTab('pin')}
              onKeyDown={onTabKeyDown}
            >
              PIN
            </button>
            <button
              ref={passwordTabRef}
              id="signin-tab-password"
              className={`tab ${tab === 'password' ? 'is-active' : ''}`}
              role="tab"
              tabIndex={tab === 'password' ? 0 : -1}
              aria-selected={tab === 'password'}
              aria-controls="signin-panel-password"
              onClick={() => switchTab('password')}
              onKeyDown={onTabKeyDown}
            >
              Password
            </button>
          </div>

          {tab === 'pin' ? (
            <PinPanel navigate={navigate} />
          ) : (
            <PasswordPanel navigate={navigate} initialEmail={searchParams.get('email') || ''} />
          )}
        </section>
      </main>
    </div>
  );
}

function PinPanel({ navigate }) {
  const [entry, setEntry] = useState('');
  const [status, setStatus] = useState({ text: '', kind: '' });

  const submit = useCallback(
    (value) => {
      if (signInWithPin(value)) {
        setStatus({ text: 'PIN accepted. Signing in…', kind: 'ok' });
        setTimeout(() => navigate('/app'), 700);
      } else {
        setStatus({ text: 'Incorrect PIN. Please try again.', kind: 'error' });
        setTimeout(() => setEntry(''), 400);
      }
    },
    [navigate]
  );

  const add = useCallback(
    (digit) => {
      setStatus({ text: '', kind: '' });
      setEntry((prev) => {
        if (prev.length >= PIN_LENGTH) return prev;
        const next = prev + digit;
        if (next.length === PIN_LENGTH) submit(next);
        return next;
      });
    },
    [submit]
  );

  const del = useCallback(() => {
    setStatus({ text: '', kind: '' });
    setEntry((prev) => prev.slice(0, -1));
  }, []);

  // Physical keyboard support while the PIN panel is mounted.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key >= '0' && event.key <= '9') add(event.key);
      else if (event.key === 'Backspace') del();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [add, del]);

  return (
    <div className="panel is-active" role="tabpanel" id="signin-panel-pin" aria-labelledby="signin-tab-pin">
      <p className="pin__label">Enter your 4-digit PIN</p>

      <div className="pin__dots" aria-hidden="true">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span key={i} className={`dot ${i < entry.length ? 'is-filled' : ''}`} />
        ))}
      </div>

      <p className={`pin__status ${status.kind === 'error' ? 'is-error' : ''} ${status.kind === 'ok' ? 'is-ok' : ''}`} role="status" aria-live="polite">
        {status.text}
      </p>

      <div className={`keypad ${loadSettings().largePinPad ? 'keypad--large' : ''}`}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="key" onClick={() => add(d)}>{d}</button>
        ))}
        <span className="key key--spacer" aria-hidden="true" />
        <button className="key" onClick={() => add('0')}>0</button>
        <button className="key key--del" onClick={del} aria-label="Delete last digit">⌫</button>
      </div>

      <p className="pin__demo">Demo PIN: 1-2-3-4</p>
    </div>
  );
}

function PasswordPanel({ navigate, initialEmail }) {
  // When arriving straight from Create Account we prefill the new email and
  // leave the password blank; otherwise fall back to the demo credentials.
  const [email, setEmail] = useState(initialEmail || 'margaret@memory.care');
  const [password, setPassword] = useState(initialEmail ? '' : 'caregiver');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }
    if (signInWithPassword(email, password)) {
      navigate('/app');
    } else {
      setError('Incorrect email or password.');
    }
  };

  return (
    <div className="panel is-active" role="tabpanel" id="signin-panel-password" aria-labelledby="signin-tab-password">
      {error && (
        <div className="alert" role="alert">
          <span className="alert__icon" aria-hidden="true">⚠</span>
          <span className="alert__text">{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Email address <span className="req">*</span></span>
          <input
            type="email"
            className="field__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Password <span className="req">*</span></span>
          <span className="field__wrap">
            <span className="field__icon" aria-hidden="true">🔒</span>
            <input
              type={show ? 'text' : 'password'}
              className="field__input field__input--icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        <button type="submit" className="btn-signin">
          Sign in <span className="enter-key">Enter</span>
        </button>
      </form>

      <p className="trouble">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/forgot-password?email=${encodeURIComponent(email.trim())}`);
          }}
        >
          Forgot password?
        </a>
      </p>

      <p className="signup-cta">
        Don't have an account?
        <Link className="link-btn" to="/register">Create Account</Link>
      </p>
    </div>
  );
}
