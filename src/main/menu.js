// Native application menu with keyboard accelerators. Navigation items send an
// IPC message to the renderer, which drives React Router. The dashboard's
// Ctrl+1..6 / Ctrl+/ keys are handled inside the renderer, so those menu items
// display their accelerator (registerAccelerator: false) without registering it
// twice.
import { app, Menu, shell, dialog } from 'electron';
import { IPC, MENU_ACTIONS } from '@shared/ipc.js';
import { ROUTES } from '@shared/routes.js';

const isMac = process.platform === 'darwin';

export function buildAppMenu(win) {
  const navigate = (to) => win?.webContents.send(IPC.MENU_NAVIGATE, to);
  const action = (name) => win?.webContents.send(IPC.MENU_ACTION, name);

  const showAbout = () => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'About CareConnect STML',
      message: 'CareConnect STML',
      detail:
        `A calm daily companion for patients living with short-term memory loss.\n\n` +
        `Version ${app.getVersion()}\n` +
        `Electron ${process.versions.electron}\n` +
        `Chromium ${process.versions.chrome}\n` +
        `Node ${process.versions.node}`,
      buttons: ['OK'],
    });
  };

  const navItem = (label, digit, to) => ({
    label,
    accelerator: `CmdOrCtrl+${digit}`,
    registerAccelerator: false, // renderer handles the key; this is display-only
    click: () => navigate(to),
  });

  /** @type {import('electron').MenuItemConstructorOptions[]} */
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { label: 'About CareConnect STML', click: showAbout },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),

    // File
    {
      label: 'File',
      submenu: [
        { label: 'New…', accelerator: 'CmdOrCtrl+N', registerAccelerator: false, click: () => action(MENU_ACTIONS.NEW) },
        { label: 'New Journal Entry', accelerator: 'CmdOrCtrl+J', registerAccelerator: false, click: () => navigate(ROUTES.JOURNAL) },
        { type: 'separator' },
        { label: 'Print Daily Plan', accelerator: 'CmdOrCtrl+P', registerAccelerator: false, click: () => action(MENU_ACTIONS.PRINT) },
        { type: 'separator' },
        { label: 'Sign Out', accelerator: 'Ctrl+Q', registerAccelerator: false, click: () => action(MENU_ACTIONS.SIGN_OUT) },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // Edit (kept for native text editing on inputs)
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },

    // View
    {
      label: 'View',
      submenu: [
        navItem('Home', 1, ROUTES.HOME),
        navItem('Daily Plan', 2, ROUTES.DAILY_PLAN),
        navItem('Medications', 3, ROUTES.MEDICATIONS),
        navItem('Reminders', 4, ROUTES.REMINDERS),
        navItem('Journal', 5, ROUTES.JOURNAL),
        navItem('Settings', 6, ROUTES.SETTINGS),
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    // Tools
    {
      label: 'Tools',
      submenu: [
        { label: 'Keyboard Shortcuts', accelerator: 'CmdOrCtrl+/', registerAccelerator: false, click: () => action(MENU_ACTIONS.SHORTCUTS) },
        { label: 'Settings', accelerator: 'CmdOrCtrl+6', registerAccelerator: false, click: () => navigate(ROUTES.SETTINGS) },
        { type: 'separator' },
        { label: 'Bigger Text', accelerator: 'CmdOrCtrl+=', registerAccelerator: false, click: () => action(MENU_ACTIONS.BIGGER_TEXT) },
        { label: 'Smaller Text', accelerator: 'CmdOrCtrl+-', registerAccelerator: false, click: () => action(MENU_ACTIONS.SMALLER_TEXT) },
        { label: 'High Contrast', accelerator: 'Ctrl+H', registerAccelerator: false, click: () => action(MENU_ACTIONS.HIGH_CONTRAST) },
        { type: 'separator' },
        { label: 'Emergency Contact', accelerator: 'F9', registerAccelerator: false, click: () => action(MENU_ACTIONS.EMERGENCY) },
      ],
    },

    // Window
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }]),
      ],
    },

    // Help
    {
      role: 'help',
      submenu: [
        { label: 'Keyboard Shortcuts', accelerator: 'F1', registerAccelerator: false, click: () => action('shortcuts') },
        { label: 'Learn More', click: () => shell.openExternal('https://www.electronjs.org') },
        ...(isMac ? [] : [{ type: 'separator' }, { label: 'About CareConnect STML', click: showAbout }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
}
