import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import ProfileDetails from './ProfileDetails';

vi.mock('@/app/birth-actions', () => ({ submitDetails: vi.fn() }));

it('loads saved details for editing without clearing existing preferences', () => {
    render(<ProfileDetails initial={{ nickname: 'Sky', currentLocation: 'London', pronouns: 'they/them', experience: 'advanced', interests: ['Career', 'Creativity'] }} />);
    expect(screen.getByLabelText(/Nickname/)).toHaveValue('Sky');
    expect(screen.getByLabelText(/Current location/)).toHaveValue('London');
    expect(screen.getByLabelText(/Pronouns/)).toHaveValue('they/them');
    expect(screen.getByLabelText('Your relationship with astrology')).toHaveValue('advanced');
    expect(screen.getByLabelText('Career')).toBeChecked();
    expect(screen.getByLabelText('Creativity')).toBeChecked();
    expect(screen.getByLabelText('Love')).not.toBeChecked();
    expect(screen.getByRole('link', { name: 'Edit birth details' })).toHaveAttribute('href', '/begin');
});

it('provides empty defaults when details have not been saved', () => {
    render(<ProfileDetails />);
    expect(screen.getByLabelText(/Nickname/)).toHaveValue('');
    expect(screen.getByLabelText('Your relationship with astrology')).toHaveValue('beginner');
    expect(screen.getByLabelText('Career')).not.toBeChecked();
});