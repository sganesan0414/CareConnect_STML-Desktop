import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
}

if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
}

if (!globalThis.HTMLElement?.prototype?.scrollIntoView) {
  globalThis.HTMLElement.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
  document.documentElement.lang = 'en';
  document.title = 'CareConnect STML';
});