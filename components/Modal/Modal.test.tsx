import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import Modal from './Modal';

const mocks = vi.hoisted(() => ({ replace: vi.fn(), show: vi.fn(), close: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
      mocks.show();
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
      mocks.close();
    },
  });
});

it('opens a labelled native dialog and restores scrolling when unmounted', () => {
  document.documentElement.style.overflow = 'auto';
  const { unmount } = render(
    <Modal label="Sign in" closeHref="/">
      <input aria-label="Username" />
    </Modal>
  );
  expect(screen.getByRole('dialog', { name: 'Sign in' })).toBeInTheDocument();
  expect(mocks.show).toHaveBeenCalledOnce();
  expect(document.documentElement.style.overflow).toBe('hidden');
  unmount();
  expect(mocks.close).toHaveBeenCalledOnce();
  expect(document.documentElement.style.overflow).toBe('auto');
  document.documentElement.style.overflow = '';
});

it('closes to the parent page with the close control, Escape, and native cancel', () => {
  render(
    <Modal label="Sun" closeHref="/explore">
      Planet details
    </Modal>
  );
  const dialog = screen.getByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  fireEvent.keyDown(dialog, { key: 'Escape' });
  fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));
  expect(mocks.replace).toHaveBeenCalledTimes(3);
  expect(mocks.replace).toHaveBeenLastCalledWith('/explore', { scroll: false });
});

it('dismisses backdrop clicks and leaves content and dialog padding clicks open', () => {
  render(
    <Modal label="Sun" closeHref="/explore">
      <p>Planet details</p>
    </Modal>
  );
  const dialog = screen.getByRole('dialog');
  vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    right: 600,
    top: 100,
    bottom: 600,
  } as DOMRect);
  fireEvent.click(screen.getByText('Planet details'));
  fireEvent.click(dialog, { clientX: 150, clientY: 150 });
  expect(mocks.replace).not.toHaveBeenCalled();
  fireEvent.click(dialog, { clientX: 10, clientY: 10 });
  expect(mocks.replace).toHaveBeenCalledOnce();
});
