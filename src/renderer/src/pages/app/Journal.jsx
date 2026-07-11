import { useState, useEffect, useCallback, useRef } from 'react';
import { loadEntries, saveEntries, makeEntry, MOODS, moodEmoji } from '../../lib/journal.js';
import { getCurrentUser } from '../../lib/auth.js';
import { onNew } from '../../lib/appEvents.js';

// "Margaret Hughes" → "Margaret H." (matches the AppShell greeting).
function shortName(fullName) {
  const parts = (fullName || 'Patient').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}

/**
 * The Memory Journal — a shared log both patient and caregiver write to.
 * Reached from the sidebar, the toolbar tabs and the native View → Journal menu
 * (all route to /app/journal, also Ctrl/Cmd+5). Desktop patterns: an inline New
 * Entry form (New button / File → New / Ctrl+N focuses it, Ctrl+S saves, Esc
 * clears), mood picker, and a reverse-chronological feed.
 */
export default function Journal() {
  const user = getCurrentUser();
  const authorName = shortName(user?.name);
  const authorRole = user?.role === 'caregiver' ? 'Caregiver' : 'Patient';
  const firstName = (user?.name || 'Margaret').trim().split(/\s+/)[0];

  const [entries, setEntries] = useState(loadEntries);
  const [mood, setMood] = useState('Calm');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [openedAt] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  );

  const notesRef = useRef(null);
  const formRef = useRef(null);
  const moodRefs = useRef({});

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const focusForm = useCallback(() => {
    formRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    notesRef.current?.focus();
  }, []);

  const reset = useCallback(() => {
    setText('');
    setMood('Calm');
    setError('');
  }, []);

  const save = useCallback(() => {
    if (!text.trim()) {
      setError('Please write a short note before saving.');
      notesRef.current?.focus();
      return;
    }
    setEntries((prev) => [
      makeEntry({ text, mood, author: authorName, role: authorRole }),
      ...prev,
    ]);
    reset();
  }, [text, mood, authorName, authorRole, reset]);

  // Page shortcuts: Ctrl/Cmd+N focuses the form, Ctrl/Cmd+S saves, Esc clears.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        focusForm();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape' && document.activeElement === notesRef.current) {
        reset();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [focusForm, save, reset]);

  // Native menu / in-window menu bar → "New".
  useEffect(() => onNew(focusForm), [focusForm]);

  const sorted = [...entries].sort((a, b) => b.ts - a.ts);

  const onMoodKeyDown = useCallback(
    (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = MOODS.findIndex((m) => m.key === mood);
      if (index < 0) return;
      let nextIndex = index;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = MOODS.length - 1;
      else if (event.key === 'ArrowRight') nextIndex = (index + 1) % MOODS.length;
      else nextIndex = (index - 1 + MOODS.length) % MOODS.length;

      const nextMood = MOODS[nextIndex].key;
      setMood(nextMood);
      moodRefs.current[nextMood]?.focus();
    },
    [mood]
  );

  return (
    <div className="journal">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Memory Journal</h1>
          <p className="page-head__sub">Shared log for patient and caregiver.</p>
        </div>
        <button className="hero-btn hero-btn--navy add-task-btn" onClick={focusForm}>
          + New Entry <kbd className="kbd-hint">Ctrl+N</kbd>
        </button>
      </header>

      <section className="je-form" ref={formRef}>
        <div className="je-form__head">New Entry — today {openedAt}</div>

        <form
          className="je-form__body"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          noValidate
        >
          <p className="je-form__prompt">How is {firstName} feeling right now?</p>

          <div className="mood-picker" role="radiogroup" aria-label="Mood">
            {MOODS.map((m) => (
              <button
                key={m.key}
                ref={(el) => {
                  moodRefs.current[m.key] = el;
                }}
                type="button"
                role="radio"
                tabIndex={mood === m.key ? 0 : -1}
                aria-checked={mood === m.key}
                className={`mood-choice ${mood === m.key ? 'is-selected' : ''}`}
                onClick={() => setMood(m.key)}
                onKeyDown={onMoodKeyDown}
              >
                <span aria-hidden="true">{m.emoji}</span> {m.key}
              </button>
            ))}
          </div>

          {error && (
            <div className="alert" role="alert">
              <span className="alert__icon" aria-hidden="true">⚠</span>
              <span className="alert__text">{error}</span>
            </div>
          )}

          <textarea
            ref={notesRef}
            className="je-form__notes"
            placeholder="Notes — multiline free text area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />

          <div className="je-form__actions">
            <button type="submit" className="hero-btn hero-btn--navy je-save">
              Save Entry <kbd className="kbd-hint">Ctrl+S</kbd>
            </button>
            <button type="button" className="task-form__cancel" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      </section>

      <ul className="je-feed">
        {sorted.map((e) => (
          <li key={e.id} className={`je-card je-card--${e.role.toLowerCase()}`}>
            <div className="je-card__head">
              <span className="je-card__avatar" aria-hidden="true">{e.initial}</span>
              <div className="je-card__id">
                <p className="je-card__author">{e.author}</p>
                <p className="je-card__role">{e.role}</p>
              </div>
              <div className="je-card__meta">
                <span className="mood-pill">{moodEmoji(e.mood)} {e.mood}</span>
                <span className="je-card__time">{e.date} · {e.time}</span>
              </div>
            </div>
            <p className="je-card__text">{e.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
