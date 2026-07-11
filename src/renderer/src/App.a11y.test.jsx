import axe from 'axe-core';

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
  },
};

async function expectNoA11yViolations(markup) {
  document.body.innerHTML = markup;
  const results = await axe.run(document.body, AXE_OPTIONS);
  expect(results.violations).toEqual([]);
}

describe('Accessibility fixtures', () => {
  it('has no axe violations on the landing page', async () => {
    document.documentElement.lang = 'en';
    document.title = 'CareConnect STML | Landing';

    await expectNoA11yViolations(`
      <div class="landing">
        <header class="nav">
          <div class="nav__inner">
            <a class="brand" href="#top">
              <span class="brand__mark" aria-hidden="true"></span>
              <span class="brand__name">Care Connect</span>
            </a>

            <nav class="nav__links" aria-label="Primary">
              <a href="#features">Features</a>
              <a href="#features">How It Works</a>
              <a href="#features">For Caregivers</a>
              <a href="#features">Privacy</a>
              <a href="#features">Pricing</a>
            </nav>

            <div class="nav__actions">
              <a class="btn btn--ghost" href="/login">Sign In</a>
              <a class="btn btn--primary" href="/login">Get Started Free</a>
            </div>
          </div>
        </header>

        <main id="main-content" tabindex="-1">
          <section class="hero" id="top">
            <div class="hero__inner">
              <div class="hero__copy">
                <h1 class="hero__title">A calm daily companion for patients and caregivers.</h1>
                <p class="hero__lead">Care Connect helps people living with short-term memory loss stay on top of medications, daily routines and appointments.</p>
                <div class="hero__cta">
                  <a class="btn btn--primary btn--lg" href="/login">Start for free</a>
                  <button type="button" class="btn btn--outline btn--lg">Watch 2-min demo</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    `);
  });

  it('has no axe violations on the login screen', async () => {
    document.documentElement.lang = 'en';
    document.title = 'CareConnect STML | Login';

    await expectNoA11yViolations(`
      <div class="login-body">
        <main class="login" id="main-content" tabindex="-1">
          <a class="login__home" href="/">← Back</a>

          <h1 class="login__brand">Care Connect</h1>

          <section class="signin" aria-labelledby="signin-title">
            <header class="signin__header">
              <h2 id="signin-title">Patient Sign In</h2>
            </header>

            <div class="tabs" role="tablist" aria-label="Sign in method">
              <button id="signin-tab-pin" role="tab" tabindex="0" aria-selected="true" aria-controls="signin-panel-pin">
                PIN
              </button>
              <button id="signin-tab-password" role="tab" tabindex="-1" aria-selected="false" aria-controls="signin-panel-password">
                Password
              </button>
            </div>

            <div class="panel is-active" role="tabpanel" id="signin-panel-pin" aria-labelledby="signin-tab-pin">
              <p>Enter your 4-digit PIN</p>
              <label>
                <span>Email address</span>
                <input type="email" />
              </label>
            </div>
          </section>
        </main>
      </div>
    `);
  });

  it('has no axe violations on the app shell landmark structure', async () => {
    document.documentElement.lang = 'en';
    document.title = 'CareConnect STML | Home';

    await expectNoA11yViolations(`
      <div class="app-shell">
        <header>
          <button type="button" aria-label="Open menu">☰</button>
          <button type="button" aria-label="Show keyboard shortcuts">⌨</button>
        </header>

        <div class="toolbar">
          <nav class="toolbar__tabs" aria-label="Sections">
            <a href="/app" aria-current="page">Home</a>
            <a href="/app/daily-plan">Daily Plan</a>
            <a href="/app/medications">Medications</a>
          </nav>
        </div>

        <div class="shell-body">
          <aside class="sidebar">
            <nav class="sidebar__nav" aria-label="Primary">
              <a href="/app" aria-current="page">Home</a>
              <a href="/app/reminders">Reminders</a>
            </nav>
          </aside>

          <main class="content" id="main-content" tabindex="-1">
            <h1>Home</h1>
            <p>Welcome back.</p>
          </main>
        </div>
      </div>
    `);
  });
});