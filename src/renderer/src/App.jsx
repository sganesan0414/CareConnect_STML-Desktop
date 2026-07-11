import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { loadSettings, applySettings } from './lib/settings.js';
import { useRouteAccessibility } from './lib/accessibility.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import AppShell from './pages/app/AppShell.jsx';
import Home from './pages/app/Home.jsx';
import DailyPlan from './pages/app/DailyPlan.jsx';
import Medications from './pages/app/Medications.jsx';
import Reminders from './pages/app/Reminders.jsx';
import Journal from './pages/app/Journal.jsx';
import Settings from './pages/app/Settings.jsx';

export default function App() {
  const navigate = useNavigate();
  const announcement = useRouteAccessibility();

  // Apply saved display preferences (font size, high contrast) app-wide on load.
  useEffect(() => {
    applySettings(loadSettings());
  }, []);

  // Bridge native-menu navigation into React Router.
  useEffect(() => {
    if (!window.careconnect?.onNavigate) return;
    const unsubscribe = window.careconnect.onNavigate((to) => navigate(to));
    return unsubscribe;
  }, [navigate]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/app" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="daily-plan" element={<DailyPlan />} />
          <Route path="medications" element={<Medications />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="journal" element={<Journal />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}
