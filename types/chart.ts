export type BirthInput = {
  date: string;
  time: string | null;
  timeZone: string;
  disambiguation: 'reject' | 'earlier' | 'later';
  place: string;
  latitude: number;
  longitude: number;
  placeSource: string;
};

export type Placement = {
  id: string;
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  degree: number;
  retrograde: boolean;
  house: number | null;
};

export type Aspect = {
  from: string;
  to: string;
  name: string;
  angle: number;
  orb: number;
  motion: 'applying' | 'separating' | 'exact';
};

export type NatalChart = {
  schemaVersion: 1;
  utc: string;
  julianDayUT: number;
  placements: Placement[];
  angles: { ascendant: Placement; midheaven: Placement };
  houses: number[];
  aspects: Aspect[];
  provenance: {
    engine: string;
    dataRevision: string;
    zodiac: 'tropical';
    frame: 'geocentric';
    houses: 'Placidus';
    node: 'true';
    lilith: 'mean apogee';
    timezone: string;
    offset: string;
  };
};

export type ProfileDetails = {
  nickname?: string;
  currentLocation?: string;
  pronouns?: string;
  experience?: string;
  interests?: string[];
};

export type SavedBirthProfile = {
  birth: BirthInput;
  chart: NatalChart | null;
  details?: ProfileDetails;
  updatedAt: string;
};
