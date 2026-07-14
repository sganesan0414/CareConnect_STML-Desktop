import axe from 'axe-core';
import { renderWithRouter, screen, waitFor } from '../../../../test/testUtils.jsx';
import userEvent from '@testing-library/user-event';
import MenuBar from './MenuBar.jsx';

function setup(props = {}) {
  const onSignOut = jest.fn();
  const onShowShortcuts = jest.fn();
  const utils = renderWithRouter(
    <MenuBar userLabel="Margaret H." onSignOut={onSignOut} onShowShortcuts={onShowShortcuts} {...props} />,
    { route: '/app' }
  );
  return { ...utils, onSignOut, onShowShortcuts };
}

describe('MenuBar', () => {
  it('has no axe violations', async () => {
    const { container } = setup();
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('renders the brand and user label', () => {
    setup();
    expect(screen.getByText('Care Connect')).toBeInTheDocument();
    expect(screen.getByText(/margaret h\./i)).toBeInTheDocument();
  });

  it('opens and closes a top-level menu on click', async () => {
    setup();
    const fileLabel = screen.getByRole('button', { name: 'File' });
    await userEvent.click(fileLabel);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await userEvent.click(fileLabel);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the open menu when clicking outside the menu bar', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'File' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await userEvent.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu and focuses the first item with ArrowDown from the label', async () => {
    setup();
    const fileLabel = screen.getByRole('button', { name: 'File' });
    fileLabel.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /new…/i })).toHaveFocus());
  });

  it('opens the menu and focuses the last item with ArrowUp from the label', async () => {
    setup();
    const fileLabel = screen.getByRole('button', { name: 'File' });
    fileLabel.focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /sign out/i })).toHaveFocus());
  });

  it('toggles the menu open/closed with Enter on the label', async () => {
    setup();
    const fileLabel = screen.getByRole('button', { name: 'File' });
    fileLabel.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fileLabel.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('moves between top-level menu labels with ArrowRight/ArrowLeft', async () => {
    setup();
    const fileLabel = screen.getByRole('button', { name: 'File' });
    const viewLabel = screen.getByRole('button', { name: 'View' });
    fileLabel.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(viewLabel).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(fileLabel).toHaveFocus());
  });

  it('closes the menu with Escape from the label', async () => {
    setup();
    const fileLabel = screen.getByRole('button', { name: 'File' });
    await userEvent.click(fileLabel);
    fileLabel.focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('navigates menu items with ArrowDown/ArrowUp/Home/End and wraps around', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'View' }));
    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    expect(items[0]).toHaveFocus();

    await userEvent.keyboard('{End}');
    expect(items[items.length - 1]).toHaveFocus();

    await userEvent.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
  });

  it('moves to the adjacent menu with ArrowRight/ArrowLeft from a menu item', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'File' }));
    const firstItem = screen.getAllByRole('menuitem')[0];
    firstItem.focus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /home/i })).toHaveFocus());
  });

  it('closes the menu item list with Escape and returns focus to the label', async () => {
    setup();
    const fileLabel = screen.getByRole('button', { name: 'File' });
    await userEvent.click(fileLabel);
    const firstItem = screen.getAllByRole('menuitem')[0];
    firstItem.focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(fileLabel).toHaveFocus();
  });

  it('closes the menu on Tab from a menu item', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'File' }));
    const firstItem = screen.getAllByRole('menuitem')[0];
    firstItem.focus();
    await userEvent.keyboard('{Tab}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('navigates to a route when a View menu item is clicked', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'View' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /daily plan/i }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls onShowShortcuts from the Tools menu and the header shortcut button', async () => {
    const { onShowShortcuts } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Tools' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /keyboard shortcuts/i }));
    expect(onShowShortcuts).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTitle(/keyboard shortcuts/i));
    expect(onShowShortcuts).toHaveBeenCalledTimes(2);
  });

  it('calls onSignOut from the File menu and the header sign-out button', async () => {
    const { onSignOut } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'File' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /^sign out$/i }));
    expect(onSignOut).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalledTimes(2);
  });

  it('shows an About alert from the Help menu', async () => {
    window.alert = jest.fn();
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /about care connect/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/care connect/i));
  });

  it('opens an external link from the Help menu', async () => {
    window.open = jest.fn();
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /learn more/i }));
    expect(window.open).toHaveBeenCalledWith('https://www.electronjs.org', '_blank');
  });
});
