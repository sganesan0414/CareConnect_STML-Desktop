import { useState, useEffect, useRef, useCallback } from 'react';
import { useModalAccessibility } from '../../lib/accessibility.js';

/**
 * "Add Medication" modal (common desktop pattern: modal dialog with primary /
 * cancel actions, Esc to close, Ctrl/Cmd+S to submit, focus on the first field
 * when it opens). Mirrors AddTaskModal so both dialogs feel the same.
 *
 * @param {{ onAdd: (med: object) => void, onClose: () => void }} props
 */
export default function AddMedicationModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [dose, setDose] = useState('');
  const [schedule, setSchedule] = useState('08:00 AM');
  const [error, setError] = useState('');

  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);

  const submit = useCallback(() => {
    if (!name.trim()) {
      setError('Please enter the medication name.');
      firstFieldRef.current?.focus();
      return;
    }
    onAdd({ name, category, dose, schedule });
    onClose();
  }, [name, category, dose, schedule, onAdd, onClose]);

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
        aria-labelledby="add-med-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head modal__head--navy">
          <h2 id="add-med-title">Add Medication</h2>
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
            <span className="task-field__label">Medication name <span className="req">*</span></span>
            <input
              ref={firstFieldRef}
              type="text"
              className="task-field__input"
              placeholder="e.g. Atorvastatin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="task-field">
            <span className="task-field__label">What it's for</span>
            <input
              type="text"
              className="task-field__input"
              placeholder="e.g. Cholesterol"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>

          <div className="task-field-row">
            <label className="task-field">
              <span className="task-field__label">Dose</span>
              <input
                type="text"
                className="task-field__input"
                placeholder="e.g. 20 mg"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
              />
            </label>
            <label className="task-field">
              <span className="task-field__label">Schedule</span>
              <input
                type="text"
                className="task-field__input"
                placeholder="e.g. 08:00 AM"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </label>
          </div>

          <div className="task-form__actions">
            <button type="submit" className="hero-btn hero-btn--navy task-form__submit">
              Add Medication <kbd className="kbd-hint">Ctrl+S</kbd>
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
