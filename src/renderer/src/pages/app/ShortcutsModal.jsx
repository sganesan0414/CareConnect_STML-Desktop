import { useRef } from 'react';
import { NAV_ITEMS } from '../../lib/nav.js';
import { useModalAccessibility } from '../../lib/accessibility.js';

// Navigation rows come straight from the shared NAV_ITEMS so the reference
// always matches the real Ctrl+1..6 bindings (and the sidebar badges).
const NAVIGATION = NAV_ITEMS.map((item) => [item.label, item.shortcut.split('+')]);

const ACTIONS = [
  ['New note / task', ['Ctrl', 'N']],
  ['Save form', ['Ctrl', 'S']],
  ['Print plan', ['Ctrl', 'P']],
  ['Sign out', ['Ctrl', 'Q']],
  ['This dialog', ['Ctrl', '/']],
];

const ACCESSIBILITY = [
  ['Bigger text', ['Ctrl', '=']],
  ['Smaller text', ['Ctrl', '-']],
  ['High contrast', ['Ctrl', 'H']],
  ['Help guide', ['F1']],
  ['Emergency contacts', ['F9']],
];

const GENERAL = [
  ['Focus forward', ['Tab']],
  ['Focus back', ['Shift', 'Tab']],
  ['Activate', ['Enter']],
  ['Close / cancel', ['Escape']],
  ['Toggle', ['Space']],
];

// Accessible keyboard-shortcuts overlay (common desktop pattern). Grouped into
// Navigation / Actions / Accessibility / General to match the reference sheet.
export default function ShortcutsModal({ onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useModalAccessibility({ onClose, containerRef: dialogRef, initialFocusRef: closeRef });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal modal--shortcuts"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sc-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head modal__head--navy">
          <h2 id="sc-title"><span aria-hidden="true">⌨</span> Keyboard Shortcuts</h2>
          <button ref={closeRef} className="modal__close modal__close--light" onClick={onClose} aria-label="Close">
            <span className="modal__esc">Esc</span> ✕
          </button>
        </div>

        <div className="sc-sections">
          <ShortcutGroup title="Navigation" rows={NAVIGATION} />
          <ShortcutGroup title="Actions" rows={ACTIONS} />
          <ShortcutGroup title="Accessibility" rows={ACCESSIBILITY} />
          <ShortcutGroup title="General" rows={GENERAL} />
        </div>

        <div className="sc-foot">
          <span className="sc-foot__note">Tab / Shift+Tab works on all screens at all times.</span>
          <button className="hero-btn hero-btn--navy" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

function ShortcutGroup({ title, rows }) {
  return (
    <section className="sc-group">
      <h3 className="sc-group__title">{title}</h3>
      <ul className="sc-group__list">
        {rows.map(([label, keys]) => (
          <li className="sc-row" key={label}>
            <span className="sc-row__label">{label}</span>
            <span className="sc-keys">
              {keys.map((k, i) => (
                <kbd className="kc" key={i}>{k}</kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
