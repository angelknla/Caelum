import type { Aspect } from './chart';

export type Distribution = { label: string; score: number; percentage: number; bodies: string[] };
export type Configuration = {
  name: 'Grand trine' | 'T-square' | 'Grand cross' | 'Stellium';
  bodies: string[];
  evidence: string[];
};
export type ChartInsight = {
  title: string;
  reflection: string;
  prompt: string;
  evidence: string[];
};
export type ChartDNA = {
  elements: Distribution[];
  modalities: Distribution[];
  dominantSigns: Distribution[];
  emphasis: { house: number; bodies: string[] }[];
  configurations: Configuration[];
  strongestAspect: Aspect | null;
  insight: ChartInsight;
  method: string;
};

export type TransitContact = {
  transiting: string;
  natal: string;
  name: string;
  angle: number;
  orb: number;
  motion: 'applying' | 'separating' | 'exact';
};
export type TodayFocus = {
  id: string;
  label: string;
  title: string;
  reflection: string;
  explanation: string;
  prompt: string;
  evidence: string[];
};
