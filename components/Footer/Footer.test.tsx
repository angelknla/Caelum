import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import Footer from './Footer';

vi.mock('@components/InstallApp/InstallApp', () => ({
  default: () => <button type="button">Install Caelum</button>,
}));

it('includes the Caelum identity and install control in the footer', () => {
  render(<Footer />);
  const footer = within(screen.getByRole('contentinfo'));
  expect(footer.getByRole('link', { name: 'Caelum' })).toHaveAttribute('href', '/');
  expect(footer.getByText('Your sky. Your story.')).toBeInTheDocument();
  expect(footer.getByRole('button', { name: 'Install Caelum' })).toBeInTheDocument();
  expect(footer.getByText(`\u00a9 ${new Date().getUTCFullYear()} Caelum.`)).toBeInTheDocument();
  expect(footer.getByText('AGPL-3.0-only.')).toBeInTheDocument();
});
