import { app, BrowserWindow, ipcMain, session } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAppMenu } from './menu.js';
import { getWindowState, trackWindowState } from './window-state.js';
import { applySessionSecurity, hardenWebContents } from './security.js';
import { IPC } from '@shared/ipc.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const isDev = !!process.env.ELECTRON_RENDERER_URL;

let mainWindow = null;

function createWindow() {
  const state = getWindowState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 900,
    minHeight: 640,
    show: false, // avoid a white flash — show once ready
    title: 'CareConnect STML',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: join(currentDir, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  trackWindowState(mainWindow);
  buildAppMenu(mainWindow);

  // Open external links in the browser and block off-origin navigation.
  hardenWebContents(mainWindow.webContents);

  // Common pattern: show the window only when the content is painted.
  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(currentDir, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Common pattern: single-instance lock. Focus the existing window instead of
// launching a second copy.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Attach CSP + permission hardening before any window loads content.
    applySessionSecurity(session.defaultSession);

    // IPC: expose runtime versions to the renderer.
    ipcMain.handle(IPC.GET_VERSIONS, () => ({
      app: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    }));

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
