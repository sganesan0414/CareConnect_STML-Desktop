import { useState, useEffect, useRef, useCallback } from 'react';
import { useModalAccessibility } from '../../lib/accessibility.js';

const TASK_TYPES = ['Medication', 'Appointment', 'Social', 'Activity'];

// Sensible defaults for the date/time fields: today, next round hour.
function defaultDate() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function defaultTime() {
  return '08:00 AM';
}

/**
 * "Add New Task" modal (common desktop pattern: modal dialog with primary /
 * cancel actions, Esc to close, Ctrl/Cmd+S to submit, focus trapped on open).
 *
 * @param {{ onAdd: (task: object) => void, onClose: () => void }} props
 */
export default function AddTaskModal({ onAdd, onClose }) {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate());
  const [time, setTime] = useState(defaultTime());
  const [type, setType] = useState('Activity');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);

  const submit = useCallback(() => {
    if (!description.trim()) {
      setError('Please describe what needs to happen.');
      firstFieldRef.current?.focus();
      return;
    }
    onAdd({
      label: description.trim(),
      date,
      time,
      type,
      notes: notes.trim(),
      done: false,
    });
    onClose();
  }, [description, date, time, type, notes, onAdd, onClose]);

  useModalAccessibility({ onClose, containerRef: dialogRef, initialFocusRef: firstFieldRef });

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        submit();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [submit]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="modal modal--task"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head modal__head--navy">
          <h2 id="add-task-title">Add New Task</h2>
          <button className="modal__close modal__close--light" onClick={onClose} aria-label="Close">
            <span className="modal__esc">Esc</span> ✕
          </button>
        </div>

        <form
          className="task-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          {error && (
            <div className="alert" role="alert">
              <span className="alert__icon" aria-hidden="true">⚠</span>
              <span className="alert__text">{error}</span>
            </div>
          )}

          <label className="task-field">
            <span className="task-field__label">Task description <span className="req">*</span></span>
            <input
              ref={firstFieldRef}
              type="text"
              className="task-field__input"
              placeholder="Describe what needs to happen…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="task-field-row">
            <label className="task-field">
              <span className="task-field__label">Date <span className="req">*</span></span>
              <input
                type="text"
                className="task-field__input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="task-field">
              <span className="task-field__label">Time <span className="req">*</span></span>
              <input
                type="text"
                className="task-field__input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>

          <div className="task-field">
            <span className="task-field__label">Task type <span className="req">*</span></span>
            <div className="type-pills" role="radiogroup" aria-label="Task type">
              {TASK_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={type === t}
                  className={`type-pill ${type === t ? 'is-selected' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="task-field">
            <span className="task-field__label">Notes for caregiver</span>
            <textarea
              className="task-field__notes"
              placeholder="Optional notes — plain language"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>

          <div className="task-form__actions">
            <button type="submit" className="hero-btn hero-btn--navy task-form__submit">
              Add Task <kbd className="kbd-hint">Ctrl+S</kbd>
            </button>
            <button type="button" className="task-form__cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
