import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const ROUTE_LABELS = {
  '/': 'Landing',
  '/login': 'Login',
  '/register': 'Create Account',
  '/forgot-password': 'Reset Password',
  '/app': 'Home',
  '/app/daily-plan': 'Daily Plan',
  '/app/medications': 'Medications',
  '/app/reminders': 'Reminders',
  '/app/journal': 'Memory Journal',
  '/app/settings': 'Settings',
};

export function useRouteAccessibility() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const label = ROUTE_LABELS[location.pathname] || 'CareConnect STML';
    document.title = `${label} | CareConnect STML`;
    setAnnouncement(`${label} screen loaded`);

    const main = document.getElementById('main-content');
    if (main) {
      requestAnimationFrame(() => main.focus());
    }
  }, [location.pathname]);

  return announcement;
}

export function useModalAccessibility({ onClose, containerRef, initialFocusRef }) {
  useEffect(() => {
    const previous = document.activeElement;
    const container = containerRef.current;

    requestAnimationFrame(() => {
      initialFocusRef.current?.focus();
    });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !container) return;

      const focusable = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [containerRef, initialFocusRef, onClose]);
}
