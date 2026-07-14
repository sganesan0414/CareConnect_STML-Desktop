import { MOODS, moodEmoji, loadEntries, saveEntries, makeEntry } from '@/lib/journal.js';

describe('journal store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads seeded default entries when storage is empty', () => {
    const entries = loadEntries();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toHaveProperty('author');
    expect(entries[0]).toHaveProperty('text');
  });

  it('persists entries to localStorage', () => {
    const entries = loadEntries();
    saveEntries([...entries, { id: 'new', text: 'hello' }]);
    expect(loadEntries()).toHaveLength(entries.length + 1);
  });

  it('returns defaults when localStorage holds malformed JSON', () => {
    localStorage.setItem('careconnect.journal', '{not-json');
    expect(loadEntries().length).toBeGreaterThan(0);
  });

  it('returns defaults when localStorage holds an empty array', () => {
    localStorage.setItem('careconnect.journal', JSON.stringify([]));
    expect(loadEntries().length).toBeGreaterThan(0);
  });

  it('moodEmoji looks up the emoji for a known mood', () => {
    expect(moodEmoji('Happy')).toBe('😊');
    expect(MOODS.find((m) => m.key === 'Calm').emoji).toBe('😌');
  });

  it('moodEmoji returns empty string for an unknown mood', () => {
    expect(moodEmoji('Unknown')).toBe('');
  });

  it('makeEntry builds a stamped entry from form input', () => {
    const entry = makeEntry({ text: '  Had a good day  ', mood: 'Happy', author: 'margaret h.', role: 'Patient' });
    expect(entry.text).toBe('Had a good day');
    expect(entry.initial).toBe('M');
    expect(entry.mood).toBe('Happy');
    expect(entry.role).toBe('Patient');
    expect(entry.id).toMatch(/^j-/);
    expect(typeof entry.ts).toBe('number');
  });

  it('makeEntry falls back to "?" initial when author is empty', () => {
    const entry = makeEntry({ text: 'note', mood: 'Calm', author: '', role: 'Patient' });
    expect(entry.initial).toBe('?');
  });
});
