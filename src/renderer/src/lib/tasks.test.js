import { loadTasks, saveTasks, makeTask } from '@/lib/tasks.js';

describe('tasks store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads seeded default tasks when storage is empty', () => {
    const tasks = loadTasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toHaveProperty('label');
    expect(tasks[0]).toHaveProperty('id');
  });

  it('persists tasks to localStorage', () => {
    const tasks = loadTasks();
    saveTasks([...tasks, makeTask({ label: 'Extra' })]);
    expect(loadTasks()).toHaveLength(tasks.length + 1);
  });

  it('returns defaults when localStorage holds malformed JSON', () => {
    localStorage.setItem('careconnect.tasks', '{not-json');
    expect(loadTasks().length).toBeGreaterThan(0);
  });

  it('backfills ids for legacy tasks stored without one', () => {
    localStorage.setItem(
      'careconnect.tasks',
      JSON.stringify([{ label: 'Legacy task', time: '10:00', type: 'Social', done: false }])
    );
    const [task] = loadTasks();
    expect(task.id).toBeTruthy();
    expect(task.label).toBe('Legacy task');
  });

  it('makeTask normalises optional fields and defaults done to false', () => {
    const task = makeTask({ label: 'New task' });
    expect(task.label).toBe('New task');
    expect(task.date).toBe('');
    expect(task.time).toBe('');
    expect(task.type).toBe('');
    expect(task.notes).toBe('');
    expect(task.done).toBe(false);
    expect(task.id).toMatch(/^t-/);
  });

  it('makeTask keeps explicit optional fields', () => {
    const task = makeTask({ label: 'New task', date: '2026-07-12', time: '09:00', type: 'Medication', notes: 'note' });
    expect(task.date).toBe('2026-07-12');
    expect(task.time).toBe('09:00');
    expect(task.type).toBe('Medication');
    expect(task.notes).toBe('note');
  });
});
