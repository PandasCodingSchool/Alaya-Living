'use client';

import { LANGUAGES, LOCALITIES, TECH_PARKS, officeLocalities } from '@fmr/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { api, apiUpload } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const steps = ['Intent', 'About you', 'Location', 'Budget', 'Lifestyle', 'Languages'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const editing = !!user?.onboardingDone;
  const existingName = user?.name && user.name !== 'Member' ? user.name : '';
  const [form, setForm] = useState({
    intent: 'NEED_ROOM',
    firstName: existingName,
    age: 27,
    gender: 'MALE',
    occupation: '',
    bio: '',
    workLocation: 'RMZ Ecoworld',
    workMode: 'HYBRID',
    localities: ['Bellandur'] as string[],
    preferredRadiusKm: 5,
    minBudget: 8000,
    maxBudget: 12000,
    moveInDate: '2026-10-01',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 4,
    noiseTolerance: 3,
    cookingFrequency: 3,
    guestFrequency: 2,
    foodPreference: 'BOTH',
    smokingPreference: 'NO',
    smokingRequired: true,
    alcoholPreference: 'SOCIALLY',
    pets: false,
    languages: ['English', 'Hindi'] as string[],
    languageMatters: false,
  });

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      firstName: user.name && user.name !== 'Member' ? user.name : current.firstName,
      age: user.age ?? current.age,
      gender: user.gender ?? current.gender,
      occupation: user.occupation ?? current.occupation,
      bio: user.bio ?? current.bio,
      workLocation: user.workLocation ?? current.workLocation,
      workMode: user.workMode ?? current.workMode,
      intent: user.intent ?? current.intent,
      localities: user.localities.length ? user.localities : current.localities,
      preferredRadiusKm: user.preferredRadiusKm ?? current.preferredRadiusKm,
      minBudget: user.minBudget ?? current.minBudget,
      maxBudget: user.maxBudget ?? current.maxBudget,
      moveInDate: user.moveInDate ? user.moveInDate.slice(0, 10) : current.moveInDate,
      sleepStart: user.sleepStart ?? current.sleepStart,
      sleepEnd: user.sleepEnd ?? current.sleepEnd,
      cleanliness: user.cleanliness ?? current.cleanliness,
      noiseTolerance: user.noiseTolerance ?? current.noiseTolerance,
      cookingFrequency: user.cookingFrequency ?? current.cookingFrequency,
      guestFrequency: user.guestFrequency ?? current.guestFrequency,
      foodPreference: user.foodPreference ?? current.foodPreference,
      smokingPreference: user.smokingPreference ?? current.smokingPreference,
      alcoholPreference: user.alcoholPreference ?? current.alcoholPreference,
      pets: user.pets ?? current.pets,
      languages: user.languages.length ? user.languages : current.languages,
      languageMatters: user.languageMatters ?? current.languageMatters,
    }));
  }, [user]);

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  async function finish() {
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: form.firstName || existingName || undefined,
          age: Number(form.age),
          gender: form.gender,
          occupation: form.occupation,
          bio: form.bio,
          workLocation: form.workLocation,
          workMode: form.workMode,
          intent: form.intent,
          onboardingDone: true,
        }),
      });
      await api('/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          minBudget: Number(form.minBudget),
          maxBudget: Number(form.maxBudget),
          moveInDate: form.moveInDate,
          sleepStart: Number(form.sleepStart),
          sleepEnd: Number(form.sleepEnd),
          cleanliness: Number(form.cleanliness),
          noiseTolerance: Number(form.noiseTolerance),
          cookingFrequency: Number(form.cookingFrequency),
          guestFrequency: Number(form.guestFrequency),
          foodPreference: form.foodPreference,
          smokingPreference: form.smokingPreference,
          smokingRequired: form.smokingRequired,
          alcoholPreference: form.alcoholPreference,
          pets: form.pets,
          localities: form.localities,
          preferredRadiusKm: form.preferredRadiusKm,
          languages: form.languages,
          languageMatters: form.languageMatters,
        }),
      });
      await refresh();
      router.push(editing ? '/profile' : form.intent === 'HAVE_ROOM' ? '/rooms/new' : '/discover');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    }
  }

  function leave() {
    if (editing) router.push('/profile');
    else if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/discover');
  }

  async function onPhoto(file?: File) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await apiUpload('/users/me/photo', file);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <div className="flex items-center justify-between">
        <button type="button" onClick={leave} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          {editing ? 'Back to profile' : 'Exit'}
        </button>
        <button type="button" onClick={leave} className="text-sm text-muted hover:text-ink">
          Cancel
        </button>
      </div>
      <p className="mt-6 font-mono text-[11px] text-muted">
        STEP {step + 1}/{steps.length} · {steps[step].toUpperCase()}
      </p>
      <h1 className="mt-3 text-3xl font-semibold">{editing ? 'Edit preferences' : 'How you actually live'}</h1>
      {existingName && (
        <p className="mt-2 text-sm text-muted">Hi {existingName} — we already have your name from sign-up.</p>
      )}

      {step === 0 && (
        <div className="mt-8 space-y-3">
          {[
            ['HAVE_ROOM', 'I have a room', 'Find one compatible person to share it.'],
            ['NEED_ROOM', 'I need a room', 'Find affordable rooms and compatible occupants.'],
            ['FIND_FLATMATES', 'I want flatmates', 'Captured for later — no group workflow yet.'],
            ['OTHER', 'Other', 'Exploring options, helping someone else, or not sure yet.'],
          ].map(([value, title, copy]) => (
            <button
              key={value}
              onClick={() => setForm({ ...form, intent: value })}
              className={`w-full rounded-xl border p-5 text-left ${form.intent === value ? 'border-clay bg-white' : 'border-sand bg-white'}`}
            >
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-ink/60">{copy}</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={form.firstName || user?.name || 'Member'} photoUrl={user?.photoUrl} size={72} />
            <div>
              <button type="button" onClick={() => photoRef.current?.click()} className="btn-ghost" disabled={uploading}>
                {uploading ? 'Uploading…' : user?.photoUrl ? 'Change photo' : 'Upload photo'}
              </button>
              <p className="mt-2 text-xs text-muted">Shown on Discover and Matches.</p>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(event) => onPhoto(event.target.files?.[0])} />
            </div>
          </div>
          {!existingName && (
            <input className="field" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          )}
          <input className="field" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          <select className="field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="NON_BINARY">Non-binary</option>
            <option value="PREFER_NOT_TO_SAY">Other / prefer not to say</option>
          </select>
          <input className="field" placeholder="Occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
          <textarea className="field" placeholder="Short bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <select className="field" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
            <option value="OFFICE">Office</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
            <option value="STUDENT">Student</option>
          </select>
          <p className="text-xs text-muted">Same-gender matches only. Most PGs do not allow mixed sharing.</p>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm font-medium">Where do you work?</p>
            <p className="mt-1 text-xs text-muted">Rooms and people are ranked by km from this office, then farther parks.</p>
            <select
              className="field mt-2"
              value={form.workLocation}
              onChange={(e) => {
                const workLocation = e.target.value;
                const nearby = officeLocalities(workLocation);
                setForm({
                  ...form,
                  workLocation,
                  localities: form.localities.length ? form.localities : nearby,
                });
              }}
            >
              {TECH_PARKS.map((park) => (
                <option key={park.name} value={park.name}>
                  {park.locality ? `${park.name} · ${park.locality}` : park.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-medium">Where do you want to live?</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {LOCALITIES.map((locality) => (
                <button
                  key={locality}
                  onClick={() => setForm({ ...form, localities: toggle(form.localities, locality) })}
                  className={`rounded-lg border px-3 py-3 text-sm ${form.localities.includes(locality) ? 'border-clay bg-white' : 'border-sand bg-white'}`}
                >
                  {locality}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Show rooms within</p>
            <p className="mt-1 text-xs text-muted">Default 5 km from your office. You can change this on Discover.</p>
            <select
              className="field mt-2"
              value={form.preferredRadiusKm}
              onChange={(e) => setForm({ ...form, preferredRadiusKm: Number(e.target.value) })}
            >
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={0}>All of Bengaluru</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 space-y-4">
          <label className="block text-sm">Min budget
            <input type="number" className="field mt-1" value={form.minBudget} onChange={(e) => setForm({ ...form, minBudget: Number(e.target.value) })} />
          </label>
          <label className="block text-sm">Max budget
            <input type="number" className="field mt-1" value={form.maxBudget} onChange={(e) => setForm({ ...form, maxBudget: Number(e.target.value) })} />
          </label>
          <label className="block text-sm">Move-in date
            <input type="date" className="field mt-1" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8 space-y-4">
          <label className="block text-sm">Sleep hour (0–23)
            <input type="number" className="field mt-1" value={form.sleepStart} onChange={(e) => setForm({ ...form, sleepStart: Number(e.target.value) })} />
          </label>
          <label className="block text-sm">Wake hour
            <input type="number" className="field mt-1" value={form.sleepEnd} onChange={(e) => setForm({ ...form, sleepEnd: Number(e.target.value) })} />
          </label>
          {(['cleanliness', 'noiseTolerance', 'cookingFrequency', 'guestFrequency'] as const).map((key) => (
            <label key={key} className="block text-sm capitalize">
              {key.replace(/([A-Z])/g, ' $1')} (1–5)
              <input type="number" min={1} max={5} className="field mt-1" value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
            </label>
          ))}
          <select className="field" value={form.foodPreference} onChange={(e) => setForm({ ...form, foodPreference: e.target.value })}>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="NON_VEGETARIAN">Non-vegetarian</option>
            <option value="BOTH">Both</option>
            <option value="OTHER">Other</option>
          </select>
          <select className="field" value={form.smokingPreference} onChange={(e) => setForm({ ...form, smokingPreference: e.target.value })}>
            <option value="NO">Non-smoker</option>
            <option value="OUTSIDE_ONLY">Outside only</option>
            <option value="YES">Smokes</option>
          </select>
          <select className="field" value={form.alcoholPreference} onChange={(e) => setForm({ ...form, alcoholPreference: e.target.value })}>
            <option value="NO">No alcohol</option>
            <option value="SOCIALLY">Drinks socially</option>
            <option value="YES">Drinks</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.pets} onChange={(e) => setForm({ ...form, pets: e.target.checked })} />
            I have or want pets
          </label>
        </div>
      )}

      {step === 5 && (
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((language) => (
              <button
                key={language}
                onClick={() => setForm({ ...form, languages: toggle(form.languages, language) })}
                className={`rounded-lg border px-3 py-3 text-sm ${form.languages.includes(language) ? 'border-clay bg-white' : 'border-sand bg-white'}`}
              >
                {language}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.languageMatters} onChange={(e) => setForm({ ...form, languageMatters: e.target.checked })} />
            Language compatibility is important to me
          </label>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button disabled={step === 0} onClick={() => setStep(step - 1)} className="text-sm text-ink/50 disabled:opacity-40">
            Back
          </button>
          <button type="button" onClick={leave} className="text-sm text-muted hover:text-ink">
            Cancel
          </button>
        </div>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="btn-dark">
            Next
          </button>
        ) : (
          <button onClick={finish} className="btn-primary">
            {editing ? 'Save preferences' : 'See matches'}
          </button>
        )}
      </div>
    </div>
  );
}
