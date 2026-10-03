import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

vi.mock('@/app/personal-actions', () => ({ submitJournal: vi.fn(async () => ({ error: 'Storage is unavailable.' })) }));

import JournalEditor from './JournalEditor';

it('retains the draft after a failed save instead of resetting private text', async () => {
  render(<JournalEditor />);
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A private reflection' } });
  fireEvent.change(screen.getByLabelText('Entry'), { target: { value: 'This draft should not disappear.' } });
  fireEvent.change(screen.getByLabelText('Tags, comma-separated'), { target: { value: 'reflection, rest' } });
  await userEvent.click(screen.getByRole('button', { name: 'Save entry' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Storage is unavailable.');
  expect(screen.getByLabelText('Title')).toHaveValue('A private reflection');
  expect(screen.getByLabelText('Entry')).toHaveValue('This draft should not disappear.');
  expect(screen.getByLabelText('Tags, comma-separated')).toHaveValue('reflection, rest');
});