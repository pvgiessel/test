import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Avatar } from '../components/Avatar';

export function FamilyPage() {
  const { users, currentUser, household } = useApp();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!household) return;
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* klembord niet beschikbaar */
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-safe">
      <header className="py-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          {household?.name ?? 'Gezin'}
        </h1>
        <p className="text-sm text-slate-400">{users.length} {users.length === 1 ? 'lid' : 'leden'}</p>
      </header>

      {/* Uitnodigingscode */}
      <div className="card mb-4 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Share2 className="h-4 w-4 text-brand-600" /> Nieuw gezinslid uitnodigen
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Laat het nieuwe gezinslid een account aanmaken en daarna "Aansluiten" kiezen met deze code:
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-center text-lg font-bold tracking-widest text-slate-800">
            {household?.inviteCode ?? '—'}
          </code>
          <button className="btn-ghost shrink-0" onClick={copyCode} aria-label="Kopiëren">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Leden */}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
            <Avatar user={u} size="md" />
            <p className="flex-1 text-sm font-semibold text-slate-900">
              {u.name}
              {currentUser?.id === u.id && (
                <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                  jij
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Je eigen profiel (naam, kleur, emoji) wijzig je op het tabblad Profiel.
      </p>
    </div>
  );
}
