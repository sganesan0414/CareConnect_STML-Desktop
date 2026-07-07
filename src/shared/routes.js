// Shared route paths used by both the renderer (React Router, sidebar/toolbar)
// and the main process (native View menu navigation). Single source of truth so
// the menu and the router can never point at different paths.

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  HOME: '/app',
  DAILY_PLAN: '/app/daily-plan',
  MEDICATIONS: '/app/medications',
  REMINDERS: '/app/reminders',
  JOURNAL: '/app/journal',
  SETTINGS: '/app/settings',
};
