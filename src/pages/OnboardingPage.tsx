import { useState } from 'react';
import { Home, UserPlus, LogOut } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Avatar } from '../components/Avatar';

const COLORS = ['#1f47d8', '#db2777', '#0d9488', '#ca8a04', '#7c3aed', '#dc2626', '#0891b2', '#65a30d'];

export function OnboardingPage() {
  const { createHousehold, joinHousehold, logout } = useApp();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [familyName, setFamilyName] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState('🙂');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Vul je naam in.');
    if (tab === 'create' && !familyName.trim()) return setError('Vul een gezinsnaam in.');
    if (tab === 'join' && !code.trim()) return setError('Vul de uitnodigingscode in.');
    setBusy(true);
    try {
      const res =
        tab === 'create'
          ? await createHousehold(familyName.trim(), name.trim(), color, emoji)
          : await joinHousehold(code.trim(), name.trim(), color, emoji);
      if (res.error) setError(res.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex flex-col items-center">
          <Avatar user={{ id: 'p', name: name || '?', color, avatarEmoji: emoji || undefined }} size="lg" />
          <h1 className="mt-3 text-lg font-extrabold text-slate-900">Welkom!</h1>
          <p className="text-center text-sm text-slate-500">Maak een gezin aan of sluit je aan bij een bestaand gezin.</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab('create')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold ${
              tab === 'create' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Home className="h-4 w-4" /> Nieuw gezin
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold ${
              tab === 'join' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            <UserPlus className="h-4 w-4" /> Aansluiten
          </button>
        </div>

        <div className="space-y-3">
          {tab === 'create' ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Naam van het gezin</label>
              <input className="field" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Bijv. Gezin Jansen" />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Uitnodigingscode</label>
              <input className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="bijv. a1b2c3d4" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Jouw naam</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. Papa" />
          </div>

          <div className="flex gap-3">
            <div className="shrink-0">
              <label className="mb-1 block text-xs font-semibold text-slate-500">Emoji</label>
              <input
                className="field w-16 text-center text-2xl"
                value={emoji}
                maxLength={2}
                onChange={(e) => setEmoji(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-500">Kleur</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-brand-500' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

          <button className="btn-primary w-full" onClick={submit} disabled={busy}>
            {busy ? 'Bezig…' : tab === 'create' ? 'Gezin aanmaken' : 'Aansluiten'}
          </button>
        </div>
      </div>

      <button onClick={() => void logout()} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
        <LogOut className="h-4 w-4" /> Uitloggen
      </button>
    </div>
  );
}
