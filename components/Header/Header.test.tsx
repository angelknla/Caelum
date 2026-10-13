import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('@/app/auth-actions', () => ({ lock: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/today' }));

it('places profile editing beside sign out for signed-in accounts', () => {
    render(<Header signedIn chartReady />);
    expect(screen.getByRole('link', { name: 'Your profile' })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
});

it('keeps profile editing out of the signed-out header', () => {
    render(<Header signedIn={false} />);
    expect(screen.queryByRole('link', { name: 'Your profile' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
});