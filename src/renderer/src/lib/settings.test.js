import {
  loadSettings,
  saveSettings,
  applySettings,
  DEFAULT_SETTINGS,
  FONT_MIN,
  FONT_MAX,
} from '@/lib/settings.js';

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.fontSize = '';
  });

  it('returns defaults when storage is empty', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('merges saved settings with defaults', () => {
    saveSettings({ ...DEFAULT_SETTINGS, fontSize: 20, highContrast: true });
    const loaded = loadSettings();
    expect(loaded.fontSize).toBe(20);
    expect(loaded.highContrast).toBe(true);
    expect(loaded.reminderSounds).toBe(true);
  });

  it('applySettings updates document font size and contrast class', () => {
    applySettings({ ...DEFAULT_SETTINGS, fontSize: 22, highContrast: true });
    expect(document.documentElement.style.fontSize).toBe('22px');
    expect(document.documentElement.classList.contains('cc-contrast')).toBe(true);

    applySettings({ ...DEFAULT_SETTINGS, highContrast: false });
    expect(document.documentElement.classList.contains('cc-contrast')).toBe(false);
  });

  it('font size stays within configured bounds in defaults', () => {
    expect(DEFAULT_SETTINGS.fontSize).toBeGreaterThanOrEqual(FONT_MIN);
    expect(DEFAULT_SETTINGS.fontSize).toBeLessThanOrEqual(FONT_MAX);
  });
});
