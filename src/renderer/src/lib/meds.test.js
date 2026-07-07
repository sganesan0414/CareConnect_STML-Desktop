import {
  loadMeds,
  saveMeds,
  makeMed,
  todayIndex,
  WEEK_DAYS,
} from '@/lib/meds.js';

describe('meds store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default medications when storage is empty', () => {
    const meds = loadMeds();
    expect(meds.length).toBeGreaterThan(0);
    expect(meds[0]).toHaveProperty('name');
    expect(meds[0].week).toHaveLength(7);
  });

  it('persists medications to localStorage', () => {
    const meds = loadMeds();
    meds[0].name = 'Updated Name';
    saveMeds(meds);
    expect(loadMeds()[0].name).toBe('Updated Name');
  });

  it('creates a new medication with pending week history', () => {
    const med = makeMed({
      name: ' Vitamin D ',
      category: 'Supplement',
      dose: '1000 IU',
      schedule: '08:00 AM',
    });
    expect(med.name).toBe('Vitamin D');
    expect(med.category).toBe('Supplement');
    expect(med.week).toEqual(Array(7).fill('pending'));
    expect(med.id).toMatch(/^m-/);
  });

  it('todayIndex maps weekdays Mon=0 through Sun=6', () => {
    const monday = new Date('2026-07-06T12:00:00');
    expect(todayIndex(monday)).toBe(0);
    expect(WEEK_DAYS[todayIndex(monday)]).toBe('Mon');
  });
});
