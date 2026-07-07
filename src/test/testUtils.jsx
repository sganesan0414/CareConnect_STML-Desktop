import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { setupMockCareConnect } from './mockCareConnect.js';

export function renderWithRouter(ui, { route = '/app/medications', ...options } = {}) {
  setupMockCareConnect();

  function Wrapper({ children }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
