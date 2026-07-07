import { MENU_ACTIONS } from '@shared/ipc.js';

const listeners = {
  navigate: new Set(),
  menuAction: new Set(),
};

function emit(channel, ...args) {
  if (channel === 'navigate') {
    listeners.navigate.forEach((cb) => cb(...args));
  } else if (channel === 'menuAction') {
    listeners.menuAction.forEach((cb) => cb(...args));
  }
}

export const mockCareConnect = {
  getVersions: jest.fn(async () => ({
    app: '1.0.0',
    electron: '42.0.0',
    chrome: '120.0.0',
    node: '20.0.0',
  })),
  onNavigate: (callback) => {
    listeners.navigate.add(callback);
    return () => listeners.navigate.delete(callback);
  },
  onMenuAction: (callback) => {
    listeners.menuAction.add(callback);
    return () => listeners.menuAction.delete(callback);
  },
  __emit: emit,
  __reset: () => {
    listeners.navigate.clear();
    listeners.menuAction.clear();
    jest.clearAllMocks();
  },
  MENU_ACTIONS,
};

export function setupMockCareConnect() {
  mockCareConnect.__reset();
  Object.defineProperty(window, 'careconnect', {
    value: mockCareConnect,
    writable: true,
    configurable: true,
  });
}
