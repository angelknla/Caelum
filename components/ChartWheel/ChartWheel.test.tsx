import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal } from '@/lib/astrology/engine';
import ChartWheel from './ChartWheel';
import { layoutBodies } from './layout';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
});

const chart = () =>
  calculateNatal({
    date: '2000-01-01',
    time: '12:00',
    timeZone: 'UTC',
    disambiguation: 'reject',
    place: 'Greenwich',
    latitude: 51.4779,
    longitude: 0,
    placeSource: 'test',
  });
it('sizes the wheel from the controls and updates when their content changes', () => {
  let notify = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe() {}
      disconnect = disconnect;
    }
  );
  const { unmount } = render(<ChartWheel chart={chart()} />);
  const explorer = screen.getByRole('region', { name: 'Natal chart explorer' });
  const artwork = explorer.children[0] as HTMLElement;
  const inspector = explorer.children[1] as HTMLElement;
  vi.spyOn(inspector, 'getBoundingClientRect').mockReturnValue({ height: 760 } as DOMRect);
  notify();
  expect(artwork.style.getPropertyValue('--controls-height')).toBe('760px');
  vi.spyOn(inspector, 'getBoundingClientRect').mockReturnValue({ height: 580 } as DOMRect);
  notify();
  expect(artwork.style.getPropertyValue('--controls-height')).toBe('580px');
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
it('selects bodies, angles, and houses without changing chart data', () => {
  const natal = chart();
  const original = JSON.stringify(natal);
  render(<ChartWheel chart={natal} />);
  fireEvent.click(screen.getByRole('button', { name: 'Inspect Moon' }));
  expect(screen.getByRole('heading', { name: 'Moon' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Inspect Moon' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  fireEvent.change(screen.getByLabelText('Body or angle'), { target: { value: 'Ascendant' } });
  expect(screen.getByRole('heading', { name: 'Ascendant' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Inspect house 12' }));
  expect(screen.getByRole('heading', { name: 'House 12' })).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Aspect lines'));
  expect(screen.getByLabelText('Aspect lines')).not.toBeChecked();
  expect(JSON.stringify(natal)).toBe(original);
});
it('supports keyboard activation of wheel controls', async () => {
  render(<ChartWheel chart={chart()} />);
  const moon = screen.getByRole('button', { name: 'Inspect Moon' });
  moon.focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('heading', { name: 'Moon' })).toBeInTheDocument();
});
it('keeps person chart details collapsed and lets a connection select another planet', () => {
  const natal = chart();
  render(<ChartWheel chart={natal} compact subject="Alex" />);
  const panel = screen.getByRole('region', { name: 'Natal chart explorer' });
  expect(screen.getByText('Position details').closest('details')).not.toHaveAttribute('open');
  const connections = screen.getByText(/^Connections \(/).closest('details')!;
  expect(connections).not.toHaveAttribute('open');
  fireEvent.click(screen.getByText(/^Connections \(/));
  const first = natal.aspects.find((aspect) => aspect.from === 'Sun' || aspect.to === 'Sun')!;
  const target = first.from === 'Sun' ? first.to : first.from;
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`${first.name} ${target}`) }));
  expect(screen.getByRole('heading', { name: target })).toBeInTheDocument();
  expect(panel.querySelector('details')?.hasAttribute('open')).toBe(false);
});
it('separates crowded controls while preserving exact longitude marks', () => {
  const natal = chart();
  const bodies = natal.placements.map((body) => ({ ...body, longitude: 359.5 }));
  const marks = layoutBodies(bodies, natal.angles.ascendant.longitude);
  for (const [index, mark] of marks.entries()) {
    for (const other of marks.slice(index + 1))
      expect(
        Math.abs(mark.label.x - other.label.x) >= 64 || Math.abs(mark.label.y - other.label.y) >= 64
      ).toBe(true);
    expect(Math.hypot(mark.exact.x - 300, mark.exact.y - 300)).toBeCloseTo(215);
  }
  expect(marks.every((mark) => mark.body.longitude === 359.5)).toBe(true);
});
