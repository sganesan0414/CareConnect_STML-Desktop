import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';
import { setupMockCareConnect } from './mockCareConnect.js';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

beforeEach(() => {
  localStorage.clear();
  setupMockCareConnect();
});
