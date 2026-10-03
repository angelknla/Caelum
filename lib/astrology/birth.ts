import { Temporal } from '@js-temporal/polyfill';
import type { BirthInput } from '@/types/chart';

export function validateBirth(input: BirthInput): BirthInput {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Enter a valid birth date.');
  const date = Temporal.PlainDate.from(input.date);
  if (
    date.year < 1900 ||
    date.year > 2099 ||
    Temporal.PlainDate.compare(date, Temporal.Now.plainDateISO()) > 0
  ) {
    throw new Error('Birth dates must be between 1900 and today.');
  }
  if (!input.place.trim() || input.place.length > 160 || input.placeSource.length > 200)
    throw new Error('Enter a birthplace.');
  if (
    !Number.isFinite(input.latitude) ||
    Math.abs(input.latitude) > 90 ||
    !Number.isFinite(input.longitude) ||
    Math.abs(input.longitude) > 180
  ) {
    throw new Error('Enter valid birthplace coordinates.');
  }
  if (!['reject', 'earlier', 'later'].includes(input.disambiguation))
    throw new Error('Invalid time selection.');
  if (!input.timeZone || input.timeZone.length > 80 || /^[+-]/.test(input.timeZone))
    throw new Error('Use a named IANA timezone.');
  try {
    new Intl.DateTimeFormat('en', { timeZone: input.timeZone });
  } catch {
    throw new Error('Choose a valid IANA timezone, such as Europe/London.');
  }
  if (input.time !== null && !/^\d{2}:\d{2}$/.test(input.time))
    throw new Error('Enter a valid birth time.');
  if (input.time !== null) Temporal.PlainTime.from(input.time, { overflow: 'reject' });
  return { ...input, place: input.place.trim() };
}

export function resolveBirthTime(input: BirthInput) {
  validateBirth(input);
  if (input.time === null) throw new Error('A known birth time is required for an exact chart.');
  const local = Temporal.PlainDateTime.from(`${input.date}T${input.time}:00`);
  let zoned: Temporal.ZonedDateTime;
  try {
    zoned = local.toZonedDateTime(input.timeZone, { disambiguation: input.disambiguation });
  } catch {
    throw new Error(
      'This local time is ambiguous or does not exist. Check the time; for a repeated hour choose its first or second occurrence.'
    );
  }
  if (!zoned.toPlainDateTime().equals(local))
    throw new Error(
      'This local time did not exist because of a clock change. Check the birth time.'
    );
  return { utc: zoned.toInstant().toString(), offset: zoned.offset };
}
