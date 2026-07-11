import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '💊',
    title: 'Medication Reminders',
    body: 'Visual daily tracker with taken/pending status and automatic refill alerts.',
  },
  {
    icon: '📅',
    title: 'Daily Plan',
    body: 'Morning, afternoon and evening task groups. One tap to mark done.',
  },
  {
    icon: '📝',
    title: 'Memory Journal',
    body: 'Shared log for patient and caregiver. Mood check-ins, notes, and history.',
  },
  {
    icon: '🔔',
    title: 'Gentle Reminders',
    body: 'Time-of-day alerts delivered in calm, plain language — never alarming.',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    body: 'Each account is private. Data is never shared between patients.',
  },
  {
    icon: '❤',
    title: 'Caregiver Dashboard',
    body: 'Real-time RPVs, task status and journal access for the people who help.',
  },
];

export default function Landing() {
  const scrollTo = (id) => (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing">
      {/* ============================ NAVBAR ============================ */}
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="#" onClick={scrollTo('top')}>
            <span className="brand__mark" aria-hidden="true" />
            <span className="brand__name">Care Connect</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            <a href="#features" onClick={scrollTo('features')}>Features</a>
            <a href="#features" onClick={scrollTo('features')}>How It Works</a>
            <a href="#features" onClick={scrollTo('features')}>For Caregivers</a>
            <a href="#features" onClick={scrollTo('features')}>Privacy</a>
            <a href="#features" onClick={scrollTo('features')}>Pricing</a>
          </nav>

          <div className="nav__actions">
            <Link className="btn btn--ghost" to="/login">Sign In</Link>
            <Link className="btn btn--primary" to="/login">Get Started Free →</Link>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex="-1">
        {/* ============================ HERO ============================ */}
        <section className="hero" id="top">
          <div className="hero__inner">
            <div className="hero__copy">
              <span className="badge">
                <span className="badge__dot" aria-hidden="true" />
                Designed for Short-Term Memory Loss (STML)
              </span>

              <h1 className="hero__title">
                A calm daily companion<br />
                for patients <span className="accent">&amp; caregivers.</span>
              </h1>

              <p className="hero__lead">
                Care Connect helps people living with short-term memory loss stay on top of
                medications, daily routines and appointments — while keeping caregivers
                informed and reassured.
              </p>

              <div className="hero__cta">
                <Link className="btn btn--primary btn--lg" to="/login">
                  Start for free
                  <span className="btn__sub">No credit card needed</span>
                </Link>
                <button type="button" className="btn btn--outline btn--lg">
                  <span className="play" aria-hidden="true">▶</span>
                  Watch 2-min demo
                </button>
              </div>

              <ul className="hero__checks">
                <li>✓ HIPAA-aligned</li>
                <li>✓ Plain language</li>
                <li>✓ WCAG AA accessible</li>
              </ul>
            </div>

            <div className="hero__art">
              <div className="shot shot--main">App screenshot — Dashboard (Patient view)</div>
              <div className="shot shot--small">Medication tracker</div>
              <div className="shot shot--small">Daily plan checklist</div>
            </div>
          </div>
        </section>

        {/* ========================== TRUST BAR ========================== */}
        <section className="trust">
          <div className="trust__inner">
            <span>Trusted by 1,400+ families</span>
            <span className="dot">•</span>
            <span>4.8 / 5 on App Store</span>
            <span className="dot">•</span>
            <span>Used in 30 memory care clinics</span>
            <span className="dot">•</span>
            <span>WCAG 2.1 AA certified</span>
          </div>
        </section>

        {/* =========================== FEATURES =========================== */}
        <section className="features" id="features">
          <div className="features__inner">
            <h2 className="section__title">Everything in one calm place</h2>
            <p className="section__lead">
              Designed with simplicity and dignity in mind — for patients and the people who care for
              them.
            </p>

            <div className="cards">
              {FEATURES.map((f) => (
                <article className="card" key={f.title}>
                  <span className="card__icon" aria-hidden="true">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
