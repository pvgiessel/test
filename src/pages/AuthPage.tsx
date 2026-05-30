import { useState } from 'react';
import { CalendarDays, Mail, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function AuthPage() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim() || password.length < 6) {
      setError('Vul een e-mailadres in en een wachtwoord van minstens 6 tekens.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email.trim(), password);
        if (res.error) setError(res.error);
      } else {
        const res = await signUp(email.trim(), password);
        if (res.error) setError(res.error);
        else if (res.needsConfirmation)
          setInfo('Account aangemaakt! Bevestig je e-mailadres via de link in je mailbox en log daarna in.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10">
      <div className="mb-8 flex flex-col items-center text-white">
        <span className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/15">
          <CalendarDays className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-extrabold">Gezinsplanner</h1>
        <p className="text-sm text-white/70">
          {mode === 'signin' ? 'Log in op je account' : 'Maak een account aan'}
        </p>
      </div>

      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-3xl bg-white p-6 shadow-xl">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">E-mailadres</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              className="field pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@voorbeeld.nl"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Wachtwoord</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="field pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
        {info && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Bezig…' : mode === 'signin' ? 'Inloggen' : 'Account aanmaken'}
        </button>

        <p className="pt-1 text-center text-sm text-slate-500">
          {mode === 'signin' ? 'Nog geen account?' : 'Al een account?'}{' '}
          <button
            type="button"
            className="font-semibold text-brand-600"
            onClick={() => {
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
              setError('');
              setInfo('');
            }}
          >
            {mode === 'signin' ? 'Registreer' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}
