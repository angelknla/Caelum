import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ReferenceLibrary from './ReferenceLibrary';

it('searches and filters the authored reference library', () => {
  render(<ReferenceLibrary />);
  fireEvent.change(screen.getByLabelText('Collection'), { target: { value: 'Signs' } });
  expect(screen.getByRole('link', { name: 'Aries' })).toHaveAttribute('href', '/explore/aries');
  expect(screen.queryByRole('link', { name: 'Sun' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'Cancer' } });
  expect(screen.getByRole('link', { name: 'Cancer' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Aries' })).not.toBeInTheDocument();
});