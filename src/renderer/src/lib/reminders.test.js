import {
  TYPES,
  TYPE_TONE,
  REPEATS,
  RECURRING,
  loadReminders,
  saveReminders,
  makeReminder,
  timeToMinutes,
  minutesToTime,
} from '@/lib/reminders.js';

describe('reminders store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads seeded default reminders when storage is empty', () => {
    const reminders = loadReminders();
    expect(reminders.length).toBeGreaterThan(0);
    expect(reminders[0]).toHaveProperty('text');
    expect(reminders[0]).toHaveProperty('type');
  });

  it('persists reminders to localStorage', () => {
    const reminders = loadReminders();
    saveReminders([...reminders, { id: 'new', text: 'Extra' }]);
    expect(loadReminders()).toHaveLength(reminders.length + 1);
  });

  it('returns defaults when localStorage holds malformed JSON', () => {
    localStorage.setItem('careconnect.reminders', '{not-json');
    expect(loadReminders().length).toBeGreaterThan(0);
  });

  it('exposes the expected static option lists', () => {
    expect(TYPES).toContain('Medication');
    expect(TYPE_TONE.Medication).toBe('medication');
    expect(REPEATS).toContain('Daily');
    expect(RECURRING.length).toBeGreaterThan(0);
  });

  it('makeReminder builds a reminder with defaults applied', () => {
    const reminder = makeReminder({ text: '  Call Linda  ' });
    expect(reminder.text).toBe('Call Linda');
    expect(reminder.time).toBe('08:00 AM');
    expect(reminder.type).toBe('Medication');
    expect(reminder.repeat).toBe('Once');
    expect(reminder.alert).toBe(true);
    expect(reminder.done).toBe(false);
    expect(reminder.id).toMatch(/^r-/);
  });

  it('makeReminder respects explicit fields including alert: false', () => {
    const reminder = makeReminder({
      text: 'Walk',
      time: ' 03:15 pm ',
      type: 'Activity',
      repeat: 'Daily',
      alert: false,
    });
    expect(reminder.time).toBe('03:15 pm');
    expect(reminder.type).toBe('Activity');
    expect(reminder.repeat).toBe('Daily');
    expect(reminder.alert).toBe(false);
  });

  it('timeToMinutes converts AM/PM clock strings to minutes since midnight', () => {
    expect(timeToMinutes('08:00 AM')).toBe(480);
    expect(timeToMinutes('12:00 PM')).toBe(720);
    expect(timeToMinutes('12:00 AM')).toBe(0);
    expect(timeToMinutes('01:30 PM')).toBe(810);
  });

  it('timeToMinutes returns 0 for unparseable input', () => {
    expect(timeToMinutes('not a time')).toBe(0);
    expect(timeToMinutes('')).toBe(0);
  });

  it('minutesToTime converts minutes since midnight back to a clock string', () => {
    expect(minutesToTime(480)).toBe('08:00 AM');
    expect(minutesToTime(720)).toBe('12:00 PM');
    expect(minutesToTime(0)).toBe('12:00 AM');
  });

  it('minutesToTime wraps values outside the 0-1439 range', () => {
    expect(minutesToTime(-30)).toBe('11:30 PM');
    expect(minutesToTime(1440 + 60)).toBe('01:00 AM');
  });

  it('timeToMinutes and minutesToTime round-trip', () => {
    expect(minutesToTime(timeToMinutes('06:00 PM'))).toBe('06:00 PM');
  });
});
