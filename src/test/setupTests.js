import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';
import { setupMockCareConnect } from './mockCareConnect.js';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

beforeEach(() => {
  localStorage.clear();
  setupMockCareConnect();
});
