import axe from 'axe-core';
import { renderWithRouter, screen } from '../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import Landing from './Landing.jsx';

describe('Landing', () => {
  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<Landing />, { route: '/' });
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders the hero heading and feature cards', () => {
    renderWithRouter(<Landing />, { route: '/' });
    expect(screen.getByRole('heading', { name: /a calm daily companion/i })).toBeInTheDocument();
    expect(screen.getByText('Medication Reminders')).toBeInTheDocument();
    expect(screen.getByText('Caregiver Dashboard')).toBeInTheDocument();
  });

  it('scrolls to the features section from a nav link', async () => {
    renderWithRouter(<Landing />, { route: '/' });
    document.getElementById('features').scrollIntoView = jest.fn();
    await userEvent.click(screen.getByRole('link', { name: 'Features' }));
    expect(document.getElementById('features').scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    );
  });

  it('scrolls to top from the brand link', async () => {
    renderWithRouter(<Landing />, { route: '/' });
    document.getElementById('top').scrollIntoView = jest.fn();
    await userEvent.click(screen.getByRole('link', { name: /care connect/i }));
    expect(document.getElementById('top').scrollIntoView).toHaveBeenCalled();
  });

  it('links Sign In and Get Started to the login screen', () => {
    renderWithRouter(<Landing />, { route: '/' });
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /get started free/i })).toHaveAttribute('href', '/login');
  });
});
