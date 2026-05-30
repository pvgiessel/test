import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Avatar } from '../components/Avatar';
import { Sheet } from '../components/ui/Sheet';

const COLORS = ['#1f47d8', '#db2777', '#0d9488', '#ca8a04', '#7c3aed', '#dc2626', '#0891b2', '#65a30d'];

export function LoginPage() {
  const { users, login, addUser } = useApp();
  const navigate = useNavigate();
  const [pinFor, setPinFor] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState('🙂');

  const pinUser = users.find((u) => u.id === pinFor);

  const tryLogin = (userId: string, pinValue?: string) => {
    if (login(userId, pinValue)) {
      navigate('/');
    } else {
      setError('Onjuiste pincode');
    }
  };

  const onSelect = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u?.pin) {
      setPinFor(userId);
      setPin('');
      setError('');
    } else {
      tryLogin(userId);
    }
  };

  const createAndLogin = () => {
    if (!name.trim()) return;
    const u = addUser({ name: name.trim(), color, avatarEmoji: emoji || undefined });
    login(u.id);
    navigate('/');
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10">
      <div className="mb-8 flex flex-col items-center text-white">
        <span className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/15">
          <CalendarDays className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-extrabold">Gezinsplanner</h1>
        <p className="text-sm text-white/70">Kies je profiel om in te loggen</p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u.id)}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/95 p-5 shadow-lg transition-transform active:scale-95"
          >
            <Avatar user={u} size="lg" />
            <span className="text-sm font-bold text-slate-800">{u.name}</span>
          </button>
        ))}
        <button
          onClick={() => setShowNew(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/40 p-5 text-white/80"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-semibold">Nieuw lid</span>
        </button>
      </div>

      {/* Pincode-dialog */}
      <Sheet open={!!pinFor} onClose={() => setPinFor(null)} title={`Hallo ${pinUser?.name ?? ''}`}>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Voer je pincode in.</p>
          <input
            type="password"
            inputMode="numeric"
            className="field text-center text-lg tracking-[0.5em]"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="btn-primary w-full" onClick={() => pinFor && tryLogin(pinFor, pin)}>
            Inloggen
          </button>
        </div>
      </Sheet>

      {/* Nieuw gezinslid */}
      <Sheet open={showNew} onClose={() => setShowNew(false)} title="Nieuw gezinslid">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Naam</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Emoji</label>
            <input
              className="field text-center text-2xl"
              value={emoji}
              maxLength={2}
              onChange={(e) => setEmoji(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Kleur</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-brand-500' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" onClick={createAndLogin} disabled={!name.trim()}>
            Aanmaken &amp; inloggen
          </button>
        </div>
      </Sheet>
    </div>
  );
}
