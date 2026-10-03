'use client';

import { ArrowLeft, ArrowRight, Check, Search } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { findBirthplaces, submitBirth } from '@/app/birth-actions';
import type { Place } from '@/lib/places';
import type { BirthInput } from '@/types/chart';
import styles from './BirthFlow.module.css';

const steps = ['Date', 'Time', 'Place', 'Your sky'];
const empty: BirthInput = { date: '', time: '', timeZone: '', disambiguation: 'reject', place: '', latitude: 0, longitude: 0, placeSource: 'manual' };

export default function BirthFlow({ initial }: { initial?: BirthInput }) {
  const [step, setStep] = useState(0);
  const [birth, setBirth] = useState<BirthInput>(initial ?? empty);
  const [query, setQuery] = useState(initial?.place ?? '');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState(Boolean(initial));
  const [manual, setManual] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const request = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const set = <Key extends keyof BirthInput>(key: Key, value: BirthInput[Key]) => setBirth(previous => ({ ...previous, [key]: value }));

  function move(next: number) {
    setError('');
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }

  async function search() {
    const current = ++request.current;
    setSearching(true);
    setSearchError('');
    try {
      const result = await findBirthplaces(query);
      if (current !== request.current) return;
      setPlaces(result.places);
      setSearchError(result.error ?? (result.places.length ? '' : 'No matching cities. Try a nearby city or enter the birthplace manually.'));
    } catch {
      if (current === request.current) setSearchError('Could not search. Try again or enter the birthplace manually.');
    } finally {
      if (current === request.current) setSearching(false);
    }
  }

  const titles = ['When did your story begin?', 'At what time?', 'Where did the sky meet you?', 'A moment, made yours.'];
  return (
    <section className={styles.flow}>
      <nav className={styles.progress} aria-label={`Step ${step + 1} of 4`}>
        {steps.map((label, index) => <span key={label} className={index === step ? styles.active : ''} aria-current={index === step ? 'step' : undefined}>{String(index + 1).padStart(2, '0')} <span>{label}</span></span>)}
      </nav>
      <p className={styles.eyebrow}>The sky / Your beginning</p>
      <h1 ref={heading} tabIndex={-1}>{titles[step]}</h1>
      <form onSubmit={event => {
        event.preventDefault();
        if (step < 3) {
          if (step === 2 && !selected) { setError('Select a birthplace or enter its coordinates and timezone.'); return; }
          move(step + 1);
        } else {
          startTransition(async () => {
            try { const result = await submitBirth(birth); setError(result.error ?? ''); }
            catch (failure) { if (failure instanceof Error && failure.message === 'NEXT_REDIRECT') throw failure; setError('Could not save. Check your connection and try again.'); }
          });
        }
      }}>
        <fieldset disabled={pending}>
          {step === 0 && <div className={styles.fields}><label htmlFor="birth-date">Birth date</label><input id="birth-date" type="date" value={birth.date} min="1900-01-01" max={new Date().toLocaleDateString('en-CA')} onChange={event => set('date', event.target.value)} required /></div>}
          {step === 1 && <div className={styles.fields}>
            <label htmlFor="birth-time">Local birth time</label>
            <input id="birth-time" type="time" value={birth.time ?? ''} disabled={birth.time === null} onChange={event => set('time', event.target.value)} required={birth.time !== null} />
            <label className={styles.check}><input type="checkbox" checked={birth.time === null} onChange={event => set('time', event.target.checked ? null : '')} /> I don&apos;t know my birth time</label>
            {birth.time === null && <p className={styles.note}>Your details will be saved as a draft. No rising sign or houses will be assigned.</p>}
          </div>}
          {step === 2 && <div className={styles.fields}>
            {!manual && <>
              <label htmlFor="place-search">Birth city</label>
              <div className={styles.search}><input id="place-search" value={query} placeholder="City or town" maxLength={80} onChange={event => { request.current++; setSearching(false); setQuery(event.target.value); setSelected(false); setPlaces([]); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} /><button type="button" onClick={() => void search()} disabled={searching || query.trim().length < 2} title="Search birthplaces" aria-label="Search birthplaces"><Search size={20} /></button></div>
              {searching && <p role="status">Searching...</p>}
              {searchError && <p role="status">{searchError}</p>}
              <ul className={styles.results}>{places.map(place => <li key={place.id}><button type="button" onClick={() => { setBirth(previous => ({ ...previous, place: `${place.name}, ${place.country}`, latitude: place.latitude, longitude: place.longitude, timeZone: place.timeZone, placeSource: `GeoNames:${place.id}` })); setQuery(`${place.name}, ${place.country}`); setSelected(true); setPlaces([]); }}><span>{place.name}<small>{place.region ? `${place.region} / ` : ''}{place.country}</small></span><ArrowRight size={16} /></button></li>)}</ul>
              {selected && <p className={styles.selected}><Check size={16} /> {birth.place} · {birth.timeZone}</p>}
            </>}
            <button type="button" className={styles.textButton} onClick={() => { setManual(!manual); setSelected(false); }}>{manual ? 'Search cities instead' : 'Enter birthplace manually'}</button>
            {manual && <>
              <label htmlFor="manual-place">Birthplace</label><input id="manual-place" value={birth.place} maxLength={160} onChange={event => { set('place', event.target.value); setSelected(true); set('placeSource', 'manual'); }} required />
              <div className={styles.coordinates}><div><label htmlFor="latitude">Latitude</label><input id="latitude" type="number" min={-90} max={90} step="any" value={birth.latitude} onChange={event => set('latitude', Number(event.target.value))} required /></div><div><label htmlFor="longitude">Longitude</label><input id="longitude" type="number" min={-180} max={180} step="any" value={birth.longitude} onChange={event => set('longitude', Number(event.target.value))} required /></div></div>
              <label htmlFor="timezone">IANA timezone</label><input id="timezone" value={birth.timeZone} placeholder="Europe/London" maxLength={80} onChange={event => set('timeZone', event.target.value)} required />
            </>}
            <label htmlFor="clock-occurrence">Clock occurrence</label><select id="clock-occurrence" value={birth.disambiguation} onChange={event => set('disambiguation', event.target.value as BirthInput['disambiguation'])}><option value="reject">Automatic, unless the hour repeats</option><option value="earlier">First occurrence of a repeated hour</option><option value="later">Second occurrence of a repeated hour</option></select>
            <p className={styles.attribution}>Place data: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a>, CC BY 4.0</p>
          </div>}
          {step === 3 && <dl className={styles.summary}><div><dt>Date</dt><dd>{birth.date}</dd></div><div><dt>Time</dt><dd>{birth.time ?? 'Unknown'} {birth.time && '(local)'}</dd></div><div><dt>Place</dt><dd>{birth.place}</dd></div><div><dt>Timezone</dt><dd>{birth.timeZone}</dd></div><div><dt>Chart</dt><dd>Tropical / Placidus</dd></div></dl>}
          <div className={styles.actions}>{step > 0 ? <button type="button" className={styles.back} onClick={() => move(step - 1)} title="Previous step" aria-label="Previous step"><ArrowLeft size={20} /></button> : <Link href="/" className={styles.back} title="Return to arrival" aria-label="Return to arrival"><ArrowLeft size={20} /></Link>}<button type="submit" className={styles.primary}>{pending ? 'Calculating...' : step === 3 ? birth.time === null ? 'Save my beginning' : 'Reveal my sky' : 'Continue'}<ArrowRight size={18} /></button></div>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          {step === 3 && birth.time !== null && error.includes('Placidus') && <button type="button" className={styles.textButton} onClick={() => startTransition(async () => { const result = await submitBirth(birth, true); setError(result.error ?? ''); })}>Save details without a chart</button>}
        </fieldset>
      </form>
    </section>
  );
}