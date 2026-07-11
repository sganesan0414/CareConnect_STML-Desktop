import { useState, useEffect, useCallback } from 'react';
import {
  loadMeds,
  saveMeds,
  makeMed,
  WEEK_DAYS,
  PRESCRIBER,
  REFILL_ALERT,
  todayIndex,
} from '../../lib/meds.js';
import { onNew } from '../../lib/appEvents.js';
import AddMedicationModal from './AddMedicationModal.jsx';

/**
 * The patient's Medications screen — reached from the sidebar, the toolbar tabs
 * and the native View → Medications menu (all route to /app/medications, also
 * Ctrl/Cmd+3). Each medication shows its dose, schedule and a "Last 7 Days"
 * adherence strip with today highlighted. Desktop patterns: Add Medication
 * dialog (button / File → New / Ctrl+N) and one-click "mark taken" for today.
 */
export default function Medications() {
  const today = todayIndex();
  const [meds, setMeds] = useState(loadMeds);
  const [showAdd, setShowAdd] = useState(false);

  // Persist to the shared store whenever the list changes.
  useEffect(() => {
    saveMeds(meds);
  }, [meds]);

  const openAdd = useCallback(() => setShowAdd(true), []);
  const handleAdd = useCallback((med) => setMeds((prev) => [...prev, makeMed(med)]), []);

  // Toggle today's dose between taken and pending for one medication.
  const toggleTaken = useCallback(
    (id) =>
      setMeds((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const week = m.week.slice();
          week[today] = week[today] === 'taken' ? 'pending' : 'taken';
          return { ...m, week };
        })
      ),
    [today]
  );

  // Page shortcut: Ctrl/Cmd+N opens the Add Medication dialog (matches the button hint).
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openAdd();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openAdd]);

  // Native menu / in-window menu bar → "New".
  useEffect(() => onNew(openAdd), [openAdd]);

  const takenCount = meds.filter((m) => m.week[today] === 'taken').length;

  return (
    <div className="medications">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Medications</h1>
          <p className="page-head__sub">
            Prescribed by {PRESCRIBER.name} · Last reviewed {PRESCRIBER.reviewed} ·{' '}
            {takenCount} of {meds.length} taken today
          </p>
        </div>
        <div className="page-head__actions">
          <div className="refill-alert" role="status">
            <span className="refill-alert__icon" aria-hidden="true">⚠</span>
            {REFILL_ALERT.med} refill in {REFILL_ALERT.days} days
          </div>
          <button className="hero-btn hero-btn--navy add-task-btn" onClick={openAdd}>
            + Add Medication <kbd className="kbd-hint">Ctrl+N</kbd>
          </button>
        </div>
      </header>

      {meds.map((med) => {
        const takenToday = med.week[today] === 'taken';
        return (
          <section className="med-panel" key={med.id}>
            <div className="med-panel__head">
              <span className="med-panel__icon" aria-hidden="true">💊</span>
              <div className="med-panel__id">
                <h2 className="med-panel__name">{med.name}</h2>
                <p className="med-panel__cat">{med.category}</p>
              </div>
              <div className="med-panel__dose">
                <span className="med-panel__mg">{med.dose || '—'}</span>
                <span className="med-panel__time">{med.schedule || 'No set time'}</span>
              </div>
            </div>

            <div className="med-panel__body">
              <p className="med-panel__label">Last 7 Days</p>
              <div className="adherence">
                {WEEK_DAYS.map((day, i) => {
                  const status = med.week[i];
                  const isToday = i === today;
                  const readable =
                    status === 'taken' ? 'Taken' : status === 'missed' ? 'Missed' : 'Not recorded';
                  const cls = `adherence__cell adherence__cell--${status} ${isToday ? 'is-today is-clickable' : ''}`;
                  return (
                    <div className="adherence__day" key={day}>
                      <span className={`adherence__dow ${isToday ? 'is-today' : ''}`}>{day}</span>
                      {isToday ? (
                        <button
                          className={cls}
                          onClick={() => toggleTaken(med.id)}
                          aria-pressed={takenToday}
                          aria-label={`Today (${day}): ${readable}. ${takenToday ? 'Mark not taken' : 'Mark taken'}`}
                          title={`Today: ${readable} — click to ${takenToday ? 'undo' : 'mark taken'}`}
                        />
                      ) : (
                        <span
                          className={cls}
                          title={`${day}: ${readable}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="med-panel__foot">
                <span className={`med-status ${takenToday ? 'is-taken' : ''}`}>
                  {takenToday ? '✓ Taken today' : 'Not taken yet today'}
                </span>
                <button
                  className={`mark-btn ${takenToday ? 'mark-btn--undo' : ''}`}
                  onClick={() => toggleTaken(med.id)}
                >
                  {takenToday ? 'Undo' : 'Mark as taken'}
                </button>
              </div>
            </div>
          </section>
        );
      })}

      {showAdd && <AddMedicationModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
