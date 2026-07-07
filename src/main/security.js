// Central place for the main-process security hardening. Keeping it in one
// module makes the app's security posture easy to audit.
//
// Applied elsewhere:
//   • webPreferences in index.js — contextIsolation, sandbox, no nodeIntegration
//   • single-instance lock in index.js
import { shell } from 'electron';

const isDev = !!process.env.ELECTRON_RENDERER_URL;

// Content-Security-Policy. Strict in production (bundled assets are same-origin);
// relaxed just enough in development for Vite's HMR (inline/eval + dev-server
// websocket). Having *any* CSP is what clears Electron's "Insecure
// Content-Security-Policy" warning.
function contentSecurityPolicy() {
  const common = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'", // React sets inline style attributes
    "img-src 'self' data:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (isDev) {
    // Vite injects an inline React-Refresh module script and talks to its HMR
    // server over a websocket. 'unsafe-inline' covers the former; we
    // deliberately omit 'unsafe-eval' so Electron raises no CSP warning.
    return [
      ...common,
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' ws: http://localhost:* http://127.0.0.1:*",
    ].join('; ');
  }

  return [...common, "script-src 'self'", "connect-src 'self'"].join('; ');
}

/**
 * Harden a session: attach the CSP response header and deny every permission
 * request (the app needs no camera / mic / geolocation / notifications).
 */
export function applySessionSecurity(session) {
  session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [contentSecurityPolicy()],
      },
    });
  });

  session.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.setPermissionCheckHandler(() => false);
}

/**
 * Harden a webContents: open external links in the system browser and block any
 * in-app navigation away from the app's own origin.
 */
export function hardenWebContents(contents) {
  const isExternal = (url) => /^https?:\/\//i.test(url);

  contents.setWindowOpenHandler(({ url }) => {
    if (isExternal(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    const appOrigin = isDev ? process.env.ELECTRON_RENDERER_URL : 'file://';
    if (!url.startsWith(appOrigin)) {
      event.preventDefault();
      if (isExternal(url)) shell.openExternal(url);
    }
  });

  // Never allow attaching a webview.
  contents.on('will-attach-webview', (event) => event.preventDefault());
}
