import { IPC, MENU_ACTIONS } from '@shared/ipc.js';
import { ROUTES } from '@shared/routes.js';
import { mockCareConnect } from './mockCareConnect.js';

describe('shared contracts', () => {
  it('defines stable IPC channel names', () => {
    expect(IPC.GET_VERSIONS).toBe('app:getVersions');
    expect(IPC.MENU_NAVIGATE).toBe('menu:navigate');
    expect(IPC.MENU_ACTION).toBe('menu:action');
  });

  it('defines app route paths used by menu and router', () => {
    expect(ROUTES.MEDICATIONS).toBe('/app/medications');
    expect(ROUTES.SETTINGS).toBe('/app/settings');
    expect(ROUTES.JOURNAL).toBe('/app/journal');
  });

  it('defines menu action constants', () => {
    expect(MENU_ACTIONS.SHORTCUTS).toBe('shortcuts');
    expect(MENU_ACTIONS.NEW).toBe('new');
  });
});

describe('careconnect preload contract (integration)', () => {
  beforeEach(() => {
    mockCareConnect.__reset();
    Object.defineProperty(window, 'careconnect', {
      value: mockCareConnect,
      writable: true,
      configurable: true,
    });
  });

  it('getVersions returns runtime info', async () => {
    const versions = await window.careconnect.getVersions();
    expect(versions.app).toBe('1.0.0');
    expect(versions.electron).toBeTruthy();
  });

  it('onNavigate receives menu navigation events', () => {
    const onNavigate = jest.fn();
    window.careconnect.onNavigate(onNavigate);
    mockCareConnect.__emit('navigate', ROUTES.SETTINGS);
    expect(onNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS);
  });

  it('onMenuAction receives shortcuts and new actions', () => {
    const onAction = jest.fn();
    window.careconnect.onMenuAction(onAction);
    mockCareConnect.__emit('menuAction', MENU_ACTIONS.SHORTCUTS);
    mockCareConnect.__emit('menuAction', MENU_ACTIONS.NEW);
    expect(onAction).toHaveBeenCalledWith(MENU_ACTIONS.SHORTCUTS);
    expect(onAction).toHaveBeenCalledWith(MENU_ACTIONS.NEW);
  });
});
