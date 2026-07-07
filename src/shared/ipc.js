// Shared IPC contract between the main and preload processes. Keeping the
// channel names in one place stops the send/receive sides from drifting apart.
// Plain constants only — no Electron/Node/DOM imports — so this module is safe
// to bundle into any process.

export const IPC = {
  /** Renderer → main (invoke): fetch app/runtime version strings. */
  GET_VERSIONS: 'app:getVersions',
  /** Main → renderer (send): navigate the router to a route. */
  MENU_NAVIGATE: 'menu:navigate',
  /** Main → renderer (send): run a named UI action (see MENU_ACTIONS). */
  MENU_ACTION: 'menu:action',
};

// Named actions carried on the MENU_ACTION channel. Shared so the native menu
// (sender) and AppShell (receiver) agree on the exact strings.
export const MENU_ACTIONS = {
  SHORTCUTS: 'shortcuts',
  SIGN_OUT: 'signout',
  NEW: 'new',
  EMERGENCY: 'emergency',
  PRINT: 'print',
  BIGGER_TEXT: 'bigger-text',
  SMALLER_TEXT: 'smaller-text',
  HIGH_CONTRAST: 'high-contrast',
};
