import { useState } from 'react';
import { LogOut, CalendarDays, ListChecks, Pencil } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Avatar } from '../components/Avatar';
import { Sheet } from '../components/ui/Sheet';

const COLORS = ['#1f47d8', '#db2777', '#0d9488', '#ca8a04', '#7c3aed', '#dc2626', '#0891b2', '#65a30d'];

export function ProfilePage() {
  const { currentUser, household, appointments, tasks, updateUser, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState('');
  const [busy, setBusy] = useState(false);

  if (!currentUser) return null;

  const myAppointments = appointments.filter((a) => a.userIds.includes(currentUser.id)).length;
  const myOpenTasks = tasks.filter((t) => t.userIds.includes(currentUser.id) && !t.completed).length;

  const openEdit = () => {
    setName(currentUser.name);
    setColor(currentUser.color);
    setEmoji(currentUser.avatarEmoji ?? '');
    setEditing(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await updateUser(currentUser.id, {
        name: name.trim(),
        color,
        avatarEmoji: emoji.trim() || undefined,
      });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-safe">
      <header className="py-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Profiel</h1>
      </header>

      <div className="card flex flex-col items-center gap-3 p-6">
        <Avatar user={currentUser} size="lg" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
          {household && <p className="text-sm text-slate-400">{household.name}</p>}
        </div>
        <button className="btn-ghost" onClick={openEdit}>
          <Pencil className="h-4 w-4" /> Profiel bewerken
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{myAppointments}</p>
            <p className="text-xs text-slate-400">afspraken</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-task-100 text-task-600">
            <ListChecks className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{myOpenTasks}</p>
            <p className="text-xs text-slate-400">open taken</p>
          </div>
        </div>
      </div>

      <button className="btn-ghost mt-6 w-full" onClick={() => void logout()}>
        <LogOut className="h-4 w-4" /> Uitloggen
      </button>

      <p className="mt-6 text-center text-xs text-slate-400">
        Gegevens worden veilig in de cloud bewaard en gedeeld met je gezin.
      </p>

      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Profiel bewerken"
        footer={
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setEditing(false)}>
              Annuleren
            </button>
            <button className="btn-primary flex-1" onClick={save} disabled={busy || !name.trim()}>
              {busy ? 'Bezig…' : 'Opslaan'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Avatar user={{ id: 'p', name: name || '?', color, avatarEmoji: emoji || undefined }} size="lg" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Naam</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Emoji</label>
            <input
              className="field text-center text-2xl"
              value={emoji}
              maxLength={2}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🙂"
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
        </div>
      </Sheet>
    </div>
  );
}
