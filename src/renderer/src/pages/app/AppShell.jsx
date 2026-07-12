import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { NAV_ITEMS, DIGIT_TO_ROUTE, EMERGENCY_CONTACT } from '../../lib/nav.js';
import { getCurrentUser, clearSession } from '../../lib/auth.js';
import { emitNew } from '../../lib/appEvents.js';
import { loadSettings, saveSettings, applySettings, FONT_MIN, FONT_MAX } from '../../lib/settings.js';
import { handleArrowNavigation } from '../../lib/accessibility.js';
import { MENU_ACTIONS } from '@shared/ipc.js';
import MenuBar from './MenuBar.jsx';
import ShortcutsModal from './ShortcutsModal.jsx';

function shortName(fullName) {
  const parts = (fullName || 'Patient').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}

export default function AppShell() {
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [emergencyLit, setEmergencyLit] = useState(false);
  const user = getCurrentUser();
  const userLabel = shortName(user?.name);

  const signOut = useCallback(() => {
    clearSession();
    navigate('/login');
  }, [navigate]);

  // Draw attention to the emergency contact (F9).
  const flashEmergency = useCallback(() => {
    setEmergencyLit(true);
    setTimeout(() => setEmergencyLit(false), 1600);
  }, []);

  // Accessibility quick-adjusts — nudge the base font size / toggle contrast and
  // persist, so they take effect everywhere (same store as the Settings page).
  const adjustFont = useCallback((delta) => {
    const s = loadSettings();
    const fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, s.fontSize + delta));
    const next = { ...s, fontSize };
    saveSettings(next);
    applySettings(next);
  }, []);

  const toggleContrast = useCallback(() => {
    const s = loadSettings();
    const next = { ...s, highContrast: !s.highContrast };
    saveSettings(next);
    applySettings(next);
  }, []);

  const printPlan = useCallback(() => window.print(), []);

  // Keyboard shortcuts. Global: Ctrl/Cmd+1..6 navigate; Ctrl/Cmd+/ and F1 toggle
  // help; F9 highlights emergency; Ctrl/Cmd+P print; Ctrl/Cmd +/- text size;
  // Ctrl+Q sign out; Ctrl+H high contrast (Ctrl-only so macOS Cmd+Q/Cmd+H keep
  // their native quit/hide roles).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcuts((s) => !s);
        return;
      }
      if (e.key === 'F9') {
        e.preventDefault();
        flashEmergency();
        return;
      }
      if (e.ctrlKey && !e.metaKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        signOut();
        return;
      }
      if (e.ctrlKey && !e.metaKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        toggleContrast();
        return;
      }
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key;
      if (k === '/') {
        e.preventDefault();
        setShowShortcuts((s) => !s);
      } else if (k === 'p' || k === 'P') {
        e.preventDefault();
        printPlan();
      } else if (k === '=' || k === '+') {
        e.preventDefault();
        adjustFont(1);
      } else if (k === '-' || k === '_') {
        e.preventDefault();
        adjustFont(-1);
      } else if (DIGIT_TO_ROUTE[k]) {
        e.preventDefault();
        navigate(DIGIT_TO_ROUTE[k]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate, flashEmergency, signOut, toggleContrast, printPlan, adjustFont]);

  // Escape closes the shortcuts modal.
  useEffect(() => {
    if (!showShortcuts) return;
    const onEsc = (e) => e.key === 'Escape' && setShowShortcuts(false);
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [showShortcuts]);

  // Native-menu actions. "New" is fanned out to the active page via the app
  // event bus so each screen decides what New means (task, medication, …).
  useEffect(() => {
    if (!window.careconnect?.onMenuAction) return;
    return window.careconnect.onMenuAction((action) => {
      if (action === MENU_ACTIONS.SHORTCUTS) setShowShortcuts(true);
      if (action === MENU_ACTIONS.SIGN_OUT) signOut();
      if (action === MENU_ACTIONS.NEW) emitNew();
      if (action === MENU_ACTIONS.EMERGENCY) flashEmergency();
      if (action === MENU_ACTIONS.PRINT) printPlan();
      if (action === MENU_ACTIONS.BIGGER_TEXT) adjustFont(1);
      if (action === MENU_ACTIONS.SMALLER_TEXT) adjustFont(-1);
      if (action === MENU_ACTIONS.HIGH_CONTRAST) toggleContrast();
    });
  }, [signOut, flashEmergency, printPlan, adjustFont, toggleContrast]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="app-shell">
      <MenuBar userLabel={userLabel} onSignOut={signOut} onShowShortcuts={() => setShowShortcuts(true)} />

      {/* Toolbar tabs */}
      <div className="toolbar">
        <nav
          className="toolbar__tabs"
          aria-label="Sections"
          onKeyDown={(e) => handleArrowNavigation(e, 'horizontal')}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `tab-btn ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="toolbar__meta">
          <span className="toolbar__date">{today}</span>
          <span className="toolbar__sep">|</span>
          <span className="role-badge"><span className="role-badge__dot" /> {user?.role === 'caregiver' ? 'Caregiver' : 'Patient'}</span>
        </div>
      </div>

      {/* Sidebar + content */}
      <div className="shell-body">
        <aside className="sidebar">
          <p className="sidebar__label">Navigation</p>
          <nav
            className="sidebar__nav"
            aria-label="Primary"
            onKeyDown={(e) => handleArrowNavigation(e, 'vertical')}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `side-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="side-link__icon" aria-hidden="true">{item.icon}</span>
                <span className="side-link__label">{item.label}</span>
                <span className="side-link__kbd">{item.shortcut}</span>
              </NavLink>
            ))}
          </nav>

          <div className={`emergency ${emergencyLit ? 'is-lit' : ''}`}>
            <p className="emergency__title">📞 Emergency</p>
            <p className="emergency__name">{EMERGENCY_CONTACT.name}</p>
            <p className="emergency__phone">{EMERGENCY_CONTACT.phone}</p>
          </div>
        </aside>

        <main className="content" id="main-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
