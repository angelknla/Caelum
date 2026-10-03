import type { BirthInput, NatalChart } from './chart';
export type Person = {
  id: string;
  name: string;
  relationship: string;
  birth: BirthInput;
  chart: NatalChart | null;
  updated_at: string;
};
export type JournalEntry = {
  id: string;
  entry_date: string;
  title: string;
  body: string;
  tags: string[];
  sky: { at: string; moon: string; phase: string; illumination: number; engine: string } | null;
  created_at: string;
  updated_at: string;
};
