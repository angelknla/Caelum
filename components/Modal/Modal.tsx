'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef } from 'react';
import styles from './Modal.module.css';

export default function Modal({
  children,
  label,
  closeHref,
  size = 'reading',
}: {
  children: ReactNode;
  label: string;
  closeHref: string;
  size?: 'auth' | 'reading';
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const dismiss = () => router.replace(closeHref, { scroll: false });

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.documentElement.style.overflow;
    element.showModal();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      element.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      data-size={size}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          dismiss();
        } else if (event.key === 'Tab') {
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button, input, select, textarea, [tabindex]'
            ),
          ].filter(
            (element) =>
              element.tabIndex >= 0 &&
              !element.matches(':disabled') &&
              element.getClientRects().length > 0
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          dismiss();
        }
      }}
    >
      <button type="button" className={styles.close} onClick={dismiss} aria-label="Close dialog">
        <X size={22} aria-hidden="true" />
      </button>
      {children}
    </dialog>
  );
}
