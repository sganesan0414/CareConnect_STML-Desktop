import {
  DEMO_EMAIL,
  findAccount,
  createAccount,
  updatePassword,
  verifyPassword,
  verifyPin,
  setSession,
  getSession,
  clearSession,
  setMode,
  getMode,
  getCurrentUser,
  signInWithPin,
  signInWithPassword,
} from '@/lib/auth.js';

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('finds the built-in demo account by email (case/whitespace insensitive)', () => {
    expect(findAccount(` ${DEMO_EMAIL.toUpperCase()} `)).toMatchObject({ email: DEMO_EMAIL });
  });

  it('returns null for an unknown email', () => {
    expect(findAccount('nobody@example.com')).toBeNull();
  });

  it('creates a new account and can find it afterward', () => {
    const result = createAccount({
      name: ' Jane Doe ',
      email: 'Jane@Example.com',
      password: 'secret',
      role: 'caregiver',
    });
    expect(result).toEqual({ ok: true });

    const found = findAccount('jane@example.com');
    expect(found).toMatchObject({ name: 'Jane Doe', email: 'jane@example.com', role: 'caregiver' });
  });

  it('rejects creating an account with an email that already exists', () => {
    createAccount({ name: 'Jane', email: 'jane@example.com', password: 'a', role: 'patient' });
    const result = createAccount({ name: 'Jane 2', email: 'jane@example.com', password: 'b', role: 'patient' });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/already exists/i);
  });

  it('rejects creating an account that collides with the demo email', () => {
    const result = createAccount({ name: 'Someone', email: DEMO_EMAIL, password: 'x', role: 'patient' });
    expect(result.ok).toBe(false);
  });

  it('updates the password for a stored account', () => {
    createAccount({ name: 'Jane', email: 'jane@example.com', password: 'old', role: 'patient' });
    const result = updatePassword('jane@example.com', 'new-password');
    expect(result).toEqual({ ok: true });
    expect(verifyPassword('jane@example.com', 'new-password')).toBe(true);
    expect(verifyPassword('jane@example.com', 'old')).toBe(false);
  });

  it('updates the in-memory demo account password', () => {
    const result = updatePassword(DEMO_EMAIL, 'new-demo-password');
    expect(result).toEqual({ ok: true });
    expect(verifyPassword(DEMO_EMAIL, 'new-demo-password')).toBe(true);
    // Restore the original demo password — it's a module-level singleton
    // shared across every test in this file, not reset by localStorage.clear().
    updatePassword(DEMO_EMAIL, 'caregiver');
  });

  it('fails to update the password for an unknown account', () => {
    const result = updatePassword('missing@example.com', 'whatever');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no account found/i);
  });

  it('verifyPassword returns false for a nonexistent account', () => {
    expect(verifyPassword('missing@example.com', 'whatever')).toBe(false);
  });

  it('verifyPin only accepts the demo PIN', () => {
    expect(verifyPin('1234')).toBe(true);
    expect(verifyPin('0000')).toBe(false);
  });

  it('tracks the current session email', () => {
    expect(getSession()).toBeNull();
    setSession(' Someone@Example.com ');
    expect(getSession()).toBe('someone@example.com');
  });

  it('clearSession removes both session and mode', () => {
    setSession('someone@example.com');
    setMode('caregiver');
    clearSession();
    expect(getSession()).toBeNull();
    expect(getMode()).toBe('patient');
  });

  it('getMode defaults to patient when unset', () => {
    expect(getMode()).toBe('patient');
  });

  it('getCurrentUser returns null when there is no session', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('getCurrentUser resolves the account for the active session', () => {
    setSession(DEMO_EMAIL);
    expect(getCurrentUser()).toMatchObject({ email: DEMO_EMAIL });
  });

  it('signInWithPin opens a patient session on a correct PIN', () => {
    expect(signInWithPin('0000')).toBe(false);
    expect(getSession()).toBeNull();

    expect(signInWithPin('1234')).toBe(true);
    expect(getSession()).toBe(DEMO_EMAIL);
    expect(getMode()).toBe('patient');
  });

  it('signInWithPassword opens a caregiver session on correct credentials', () => {
    expect(signInWithPassword(DEMO_EMAIL, 'wrong')).toBe(false);
    expect(getSession()).toBeNull();

    expect(signInWithPassword(DEMO_EMAIL, 'caregiver')).toBe(true);
    expect(getSession()).toBe(DEMO_EMAIL);
    expect(getMode()).toBe('caregiver');
  });

  it('findAccount returns null when localStorage holds malformed JSON', () => {
    localStorage.setItem('careconnect.accounts', '{not-json');
    expect(findAccount('anyone@example.com')).toBeNull();
  });

  it('findAccount returns null when localStorage holds a non-array value', () => {
    localStorage.setItem('careconnect.accounts', JSON.stringify({ not: 'an array' }));
    expect(findAccount('anyone@example.com')).toBeNull();
  });
});
