import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ search: vi.fn(), submit: vi.fn() }));
vi.mock('@/app/birth-actions', () => ({
  findBirthplaces: mocks.search,
  submitBirth: mocks.submit,
}));

import BirthFlow from './BirthFlow';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.submit.mockResolvedValue({ error: 'Test save failed.' });
});

it('preserves birth details while moving forward and back', () => {
  render(<BirthFlow />);
  fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '2000-01-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByLabelText('Local birth time')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Previous step' }));
  expect(screen.getByLabelText('Birth date')).toHaveValue('2000-01-01');
});

it('reuses normalized birthplace searches without another server request', async () => {
  mocks.search.mockResolvedValue({ places: [] });
  render(
    <BirthFlow
      initial={{
        date: '2000-01-01',
        time: null,
        timeZone: 'UTC',
        disambiguation: 'reject',
        latitude: 0,
        longitude: 0,
        place: 'Test',
        placeSource: 'manual',
      }}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  const field = screen.getByLabelText('Birth city');
  fireEvent.change(field, { target: { value: ' London ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search birthplaces' }));
  await screen.findByText(/No matching cities/);
  fireEvent.change(field, { target: { value: 'LONDON' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search birthplaces' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Search birthplaces' })).toBeEnabled()
  );
  expect(mocks.search).toHaveBeenCalledTimes(1);
  expect(mocks.search).toHaveBeenCalledWith('london');
});

it('retries failed birthplace searches', async () => {
  mocks.search
    .mockResolvedValueOnce({ places: [], error: 'Offline' })
    .mockResolvedValueOnce({ places: [] });
  render(
    <BirthFlow
      initial={{
        date: '2000-01-01',
        time: null,
        timeZone: 'UTC',
        disambiguation: 'reject',
        latitude: 0,
        longitude: 0,
        place: 'Test',
        placeSource: 'manual',
      }}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.change(screen.getByLabelText('Birth city'), { target: { value: 'London' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search birthplaces' }));
  await screen.findByText('Offline');
  fireEvent.click(screen.getByRole('button', { name: 'Search birthplaces' }));
  await screen.findByText(/No matching cities/);
  expect(mocks.search).toHaveBeenCalledTimes(2);
});

it('saves unknown birth time without inventing a rising sign', async () => {
  mocks.search.mockResolvedValue({
    places: [
      {
        id: '2643743',
        name: 'London',
        country: 'GB',
        region: 'ENG',
        latitude: 51.5,
        longitude: -0.12,
        timeZone: 'Europe/London',
      },
    ],
  });
  render(<BirthFlow />);
  fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '2000-01-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByLabelText("I don't know my birth time"));
  expect(screen.getByLabelText('Local birth time')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.change(screen.getByLabelText('Birth city'), { target: { value: 'London' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search birthplaces' }));
  fireEvent.click(await screen.findByRole('button', { name: /London/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save my beginning' }));
  await waitFor(() =>
    expect(mocks.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        time: null,
        timeZone: 'Europe/London',
        placeSource: 'GeoNames:2643743',
      })
    )
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('Test save failed.');
});
