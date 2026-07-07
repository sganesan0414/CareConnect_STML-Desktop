import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@shared/ipc.js';

// Expose a minimal, explicit API to the renderer. Nothing else from Node or
// Electron leaks into the page because contextIsolation is enabled.
contextBridge.exposeInMainWorld('careconnect', {
  getVersions: () => ipcRenderer.invoke(IPC.GET_VERSIONS),

  // Subscribe to navigation requests coming from the native menu. Returns an
  // unsubscribe function so React effects can clean up.
  onNavigate: (callback) => {
    const listener = (_event, to) => callback(to);
    ipcRenderer.on(IPC.MENU_NAVIGATE, listener);
    return () => ipcRenderer.removeListener(IPC.MENU_NAVIGATE, listener);
  },

  // Subscribe to non-navigation menu actions (e.g. 'shortcuts', 'signout').
  onMenuAction: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on(IPC.MENU_ACTION, listener);
    return () => ipcRenderer.removeListener(IPC.MENU_ACTION, listener);
  },
});
