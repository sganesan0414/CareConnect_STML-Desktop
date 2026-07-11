import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  loadReminders,
  saveReminders,
  makeReminder,
  TYPES,
  TYPE_TONE,
  REPEATS,
  RECURRING,
  timeToMinutes,
  minutesToTime,
} from '../../lib/reminders.js';
import { onNew } from '../../lib/appEvents.js';

const EMPTY_FORM = { text: '', time: '08:00 AM', repeat: 'Daily', type: 'Medication', alert: true };

const FILTERS = [
  { key: 'all', label: 'All reminders' },
  { key: 'Medication', label: 'Medications' },
  { key: 'Social', label: 'Social' },
  { key: 'Appointment', label: 'Appointments' },
  { key: 'Activity', label: 'Activities' },
];

function nextFilterKey(current, key) {
  const index = FILTERS.findIndex((item) => item.key === current);
  if (key === 'Home') return FILTERS[0].key;
  if (key === 'End') return FILTERS[FILTERS.length - 1].key;
  if (key === 'ArrowRight') return FILTERS[(index + 1) % FILTERS.length].key;
  return FILTERS[(index - 1 + FILTERS.length) % FILTERS.length].key;
}

/**
 * The patient's Reminders screen — reached from the sidebar, the toolbar tabs
 * and the native View → Reminders menu (all route to /app/reminders, also
 * Ctrl/Cmd+4). Desktop patterns: inline New Reminder form (New button /
 * File → New / Ctrl+N focuses it, Ctrl+S saves), type filters, and per-reminder
 * mark-done / snooze / edit.
 */
export default function Reminders() {
  const [reminders, setReminders] = useState(loadReminders);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [recurringLit, setRecurringLit] = useState(false);

  const textRef = useRef(null);
  const formRef = useRef(null);
  const recurringRef = useRef(null);
  const filterRefs = useRef({});

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Bring the New Reminder form into view and focus it for a fresh entry.
  const focusNewForm = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    formRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    textRef.current?.focus();
  }, []);

  const saveForm = useCallback(() => {
    if (!form.text.trim()) {
      setFormError('Please enter the reminder text.');
      textRef.current?.focus();
      return;
    }
    if (editingId) {
      setReminders((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...form, text: form.text.trim() } : r))
      );
    } else {
      setReminders((prev) => [...prev, makeReminder(form)]);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
  }, [form, editingId]);

  const startEdit = useCallback((r) => {
    setEditingId(r.id);
    setForm({ text: r.text, time: r.time, repeat: r.repeat, type: r.type, alert: r.alert });
    setFormError('');
    formRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    textRef.current?.focus();
  }, []);

  const toggleDone = (id) =>
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));

  const snooze = (id) =>
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, time: minutesToTime(timeToMinutes(r.time) + 10) } : r))
    );

  const manageRecurring = () => {
    recurringRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setRecurringLit(true);
    setTimeout(() => setRecurringLit(false), 1400);
  };

  // Page shortcuts: Ctrl/Cmd+N focuses a new reminder, Ctrl/Cmd+S saves the form.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'n') {
        e.preventDefault();
        focusNewForm();
      } else if (k === 's') {
        e.preventDefault();
        saveForm();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [focusNewForm, saveForm]);

  // Native menu / in-window menu bar → "New".
  useEffect(() => onNew(focusNewForm), [focusNewForm]);

  const counts = useMemo(() => {
    const c = { all: reminders.length };
    for (const t of TYPES) c[t] = reminders.filter((r) => r.type === t).length;
    return c;
  }, [reminders]);

  const visible = filter === 'all' ? reminders : reminders.filter((r) => r.type === filter);
  const byTime = (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time);
  const upcoming = visible.filter((r) => !r.done).sort(byTime);
  const done = visible.filter((r) => r.done).sort(byTime);

  const doneCount = reminders.filter((r) => r.done).length;
  const remaining = reminders.length - doneCount;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onFilterKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setFilter((current) => nextFilterKey(current, event.key));
  };

  useEffect(() => {
    filterRefs.current[filter]?.focus();
  }, [filter]);

  return (
    <div className="reminders">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Reminders</h1>
          <p className="page-head__sub">
            {today} · {doneCount} done · {remaining} remaining
          </p>
        </div>
        <div className="page-head__actions page-head__actions--row">
          <button className="ghost-btn" onClick={manageRecurring}>
            <span aria-hidden="true">🔁</span> Manage recurring
          </button>
          <button className="hero-btn hero-btn--navy add-task-btn" onClick={focusNewForm}>
            + New Reminder <kbd className="kbd-hint">Ctrl+N</kbd>
          </button>
        </div>
      </header>

      <div className="rem-layout">
        <div className="rem-main">
          <div className="rem-filters" role="tablist" aria-label="Filter reminders">
            {FILTERS.map((f) => (
              <button
                ref={(el) => {
                  filterRefs.current[f.key] = el;
                }}
                key={f.key}
                role="tab"
                id={`rem-filter-${f.key}`}
                tabIndex={filter === f.key ? 0 : -1}
                aria-selected={filter === f.key}
                aria-controls="reminders-panel"
                className={`chip ${filter === f.key ? 'is-active' : ''}`}
                onClick={() => setFilter(f.key)}
                onKeyDown={onFilterKeyDown}
              >
                {f.label} <span className="chip__count">{counts[f.key] ?? 0}</span>
              </button>
            ))}
          </div>

          <div id="reminders-panel" role="tabpanel" aria-labelledby={`rem-filter-${filter}`}>
          <h2 className="rem-section"><span aria-hidden="true">🔔</span> Upcoming today</h2>
          {upcoming.length === 0 ? (
            <p className="rem-empty">Nothing upcoming{filter !== 'all' ? ' in this filter' : ''}.</p>
          ) : (
            <ul className="rem-list">
              {upcoming.map((r) => (
                <ReminderCard key={r.id} r={r} onToggle={toggleDone} onEdit={startEdit} onSnooze={snooze} />
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <>
              <h2 className="rem-section rem-section--done"><span aria-hidden="true">✓</span> Done today</h2>
              <ul className="rem-list">
                {done.map((r) => (
                  <ReminderCard key={r.id} r={r} onToggle={toggleDone} onEdit={startEdit} onSnooze={snooze} />
                ))}
              </ul>
            </>
          )}
          </div>
        </div>

        <aside className="rem-aside">
          <section className={`rem-form ${editingId ? 'is-editing' : ''}`} ref={formRef}>
            <h2 className="rem-form__title"><span aria-hidden="true">🔔</span> {editingId ? 'Edit Reminder' : 'New Reminder'}</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveForm();
              }}
              noValidate
            >
              {formError && (
                <div className="alert" role="alert">
                  <span className="alert__icon" aria-hidden="true">⚠</span>
                  <span className="alert__text">{formError}</span>
                </div>
              )}

              <label className="task-field">
                <span className="task-field__label">Reminder text <span className="req">*</span></span>
                <input
                  ref={textRef}
                  type="text"
                  className="task-field__input"
                  placeholder="e.g. Take Aspirin 81 mg"
                  value={form.text}
                  onChange={(e) => update({ text: e.target.value })}
                />
              </label>

              <div className="task-field-row">
                <label className="task-field">
                  <span className="task-field__label">Time <span className="req">*</span></span>
                  <input
                    type="text"
                    className="task-field__input"
                    value={form.time}
                    onChange={(e) => update({ time: e.target.value })}
                  />
                </label>
                <label className="task-field">
                  <span className="task-field__label">Date / Repeat</span>
                  <select
                    className="task-field__input"
                    value={form.repeat}
                    onChange={(e) => update({ repeat: e.target.value })}
                  >
                    {REPEATS.map((rp) => (
                      <option key={rp} value={rp}>{rp}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="task-field">
                <span className="task-field__label">Type</span>
                <div className="type-pills" role="radiogroup" aria-label="Reminder type">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={form.type === t}
                      className={`type-pill type-pill--${TYPE_TONE[t]} ${form.type === t ? 'is-selected' : ''}`}
                      onClick={() => update({ type: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rem-toggle-row">
                <div>
                  <p className="rem-toggle-row__label">Alert sound</p>
                  <p className="rem-toggle-row__hint">Play chime when reminder fires</p>
                </div>
                <button
                  type="button"
                  className={`switch ${form.alert ? 'is-on' : ''}`}
                  role="switch"
                  aria-checked={form.alert}
                  aria-label="Alert sound"
                  onClick={() => update({ alert: !form.alert })}
                >
                  <span className="switch__knob" />
                </button>
              </div>

              <button type="submit" className="hero-btn hero-btn--navy rem-save">
                {editingId ? 'Update Reminder' : 'Save Reminder'} <kbd className="kbd-hint">Ctrl+S</kbd>
              </button>
              {editingId && (
                <button type="button" className="rem-cancel" onClick={focusNewForm}>
                  Cancel edit
                </button>
              )}
            </form>
          </section>

          <section
            className={`rem-recurring ${recurringLit ? 'is-lit' : ''}`}
            ref={recurringRef}
          >
            <h2 className="rem-recurring__title">Recurring Reminders</h2>
            <ul className="rem-recurring__list">
              {RECURRING.map((rc) => (
                <li key={rc.id} className="rem-recurring__item">
                  <div>
                    <p className="rem-recurring__name">{rc.title}</p>
                    <p className="rem-recurring__detail">{rc.detail}</p>
                  </div>
                  <button className="link-edit" onClick={manageRecurring}>Edit</button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ReminderCard({ r, onToggle, onEdit, onSnooze }) {
  return (
    <li className={`rem-card ${r.done ? 'is-done' : ''}`}>
      <span className="rem-card__time">{r.time}</span>
      <button
        className="rem-card__dot"
        onClick={() => onToggle(r.id)}
        aria-pressed={r.done}
        aria-label={`${r.done ? 'Mark not done' : 'Mark done'}: ${r.text}`}
      >
        {r.done ? '✓' : ''}
      </button>
      <div className="rem-card__body">
        <span className="rem-card__title">{r.text}</span>
        <span className="rem-card__meta">
          <span className={`type-badge type-badge--${TYPE_TONE[r.type] || 'activity'}`}>{r.type}</span>
          <span className="rem-card__repeat">↻ {r.repeat}</span>
        </span>
      </div>
      <div className="rem-card__actions">
        {r.done ? (
          <button className="pill-btn" onClick={() => onToggle(r.id)}>Undo</button>
        ) : (
          <>
            <button className="pill-btn" onClick={() => onEdit(r)}>Edit</button>
            <button className="pill-btn" onClick={() => onSnooze(r.id)}>Snooze</button>
          </>
        )}
      </div>
    </li>
  );
}
