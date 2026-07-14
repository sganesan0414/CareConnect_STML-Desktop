import { useRef } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useRouteAccessibility, useModalAccessibility, handleArrowNavigation } from '@/lib/accessibility.js';

function RouteProbe() {
  const announcement = useRouteAccessibility();
  return (
    <>
      <div id="main-content" tabIndex="-1" />
      <div data-testid="announcement">{announcement}</div>
    </>
  );
}

describe('useRouteAccessibility', () => {
  it('sets the document title and an announcement for a known route, and focuses main', async () => {
    render(
      <MemoryRouter initialEntries={['/app/journal']}>
        <RouteProbe />
      </MemoryRouter>
    );

    await waitFor(() => expect(document.title).toBe('Memory Journal | CareConnect STML'));
    expect(screen.getByTestId('announcement')).toHaveTextContent('Memory Journal screen loaded');
    await waitFor(() => expect(document.getElementById('main-content')).toHaveFocus());
  });

  it('falls back to a generic label for an unmapped route', async () => {
    render(
      <MemoryRouter initialEntries={['/not-a-real-route']}>
        <RouteProbe />
      </MemoryRouter>
    );

    await waitFor(() => expect(document.title).toBe('CareConnect STML | CareConnect STML'));
  });
});

function ModalProbe({ onClose }) {
  const containerRef = useRef(null);
  const closeRef = useRef(null);
  useModalAccessibility({ onClose, containerRef, initialFocusRef: closeRef });

  return (
    <div ref={containerRef}>
      <button ref={closeRef}>Close</button>
      <button>Middle</button>
      <button id="last">Last</button>
    </div>
  );
}

describe('useModalAccessibility', () => {
  it('moves initial focus to the initialFocusRef target', async () => {
    render(<ModalProbe onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText('Close')).toHaveFocus());
  });

  it('calls onClose on Escape', () => {
    const onClose = jest.fn();
    render(<ModalProbe onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab forward from the last element back to the first', async () => {
    render(<ModalProbe onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText('Close')).toHaveFocus());

    screen.getByText('Last').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByText('Close')).toHaveFocus();
  });

  it('traps Shift+Tab from the first element back to the last', async () => {
    render(<ModalProbe onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText('Close')).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByText('Last')).toHaveFocus();
  });

  it('does nothing on Tab when the container has no focusable elements', () => {
    function EmptyModalProbe({ onClose }) {
      const containerRef = useRef(null);
      const closeRef = useRef(null);
      useModalAccessibility({ onClose, containerRef, initialFocusRef: closeRef });
      return <div ref={containerRef} />;
    }

    render(<EmptyModalProbe onClose={() => {}} />);
    expect(() => fireEvent.keyDown(document, { key: 'Tab' })).not.toThrow();
  });

  it('ignores keys other than Escape/Tab', async () => {
    const onClose = jest.fn();
    render(<ModalProbe onClose={onClose} />);
    await waitFor(() => expect(screen.getByText('Close')).toHaveFocus());

    fireEvent.keyDown(document, { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('restores focus to the previously focused element on unmount', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Trigger';
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<ModalProbe onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText('Close')).toHaveFocus());

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});

function ArrowNavProbe({ orientation }) {
  return (
    <div onKeyDown={(e) => handleArrowNavigation(e, orientation)}>
      <button>One</button>
      <button>Two</button>
      <button>Three</button>
    </div>
  );
}

describe('handleArrowNavigation', () => {
  it('moves focus forward and wraps around with ArrowDown (vertical)', () => {
    render(<ArrowNavProbe orientation="vertical" />);
    const [one, two, three] = screen.getAllByRole('button');

    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowDown' });
    expect(two).toHaveFocus();

    fireEvent.keyDown(two, { key: 'ArrowDown' });
    expect(three).toHaveFocus();

    fireEvent.keyDown(three, { key: 'ArrowDown' });
    expect(one).toHaveFocus();
  });

  it('moves focus backward and wraps around with ArrowUp (vertical)', () => {
    render(<ArrowNavProbe orientation="vertical" />);
    const [one, , three] = screen.getAllByRole('button');

    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowUp' });
    expect(three).toHaveFocus();
  });

  it('supports horizontal orientation with ArrowLeft/ArrowRight', () => {
    render(<ArrowNavProbe orientation="horizontal" />);
    const [one, two] = screen.getAllByRole('button');

    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(two).toHaveFocus();

    fireEvent.keyDown(two, { key: 'ArrowLeft' });
    expect(one).toHaveFocus();
  });

  it('Home and End jump to the first and last item', () => {
    render(<ArrowNavProbe orientation="horizontal" />);
    const [one, , three] = screen.getAllByRole('button');

    one.focus();
    fireEvent.keyDown(one, { key: 'End' });
    expect(three).toHaveFocus();

    fireEvent.keyDown(three, { key: 'Home' });
    expect(one).toHaveFocus();
  });

  it('ignores unrelated keys', () => {
    render(<ArrowNavProbe orientation="horizontal" />);
    const [one] = screen.getAllByRole('button');
    one.focus();
    fireEvent.keyDown(one, { key: 'a' });
    expect(one).toHaveFocus();
  });

  it('does nothing when the container has no focusable items', () => {
    function EmptyProbe() {
      return <div onKeyDown={(e) => handleArrowNavigation(e, 'horizontal')} data-testid="empty" />;
    }
    render(<EmptyProbe />);
    expect(() => fireEvent.keyDown(screen.getByTestId('empty'), { key: 'ArrowRight' })).not.toThrow();
  });
});
