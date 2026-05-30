import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { User } from '../types/models';
import { useApp } from '../store/AppContext';
import { Avatar } from '../components/Avatar';
import { Sheet } from '../components/ui/Sheet';

const COLORS = ['#1f47d8', '#db2777', '#0d9488', '#ca8a04', '#7c3aed', '#dc2626', '#0891b2', '#65a30d'];

export function FamilyPage() {
  const { users, currentUser, addUser, updateUser, removeUser } = useApp();
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [emoji, setEmoji] = useState('');
  const [pin, setPin] = useState('');

  const open = (u?: User) => {
    setEditing(u ?? null);
    setCreating(!u);
    setName(u?.name ?? '');
    setColor(u?.color ?? COLORS[0]);
    setEmoji(u?.avatarEmoji ?? '');
    setPin(u?.pin ?? '');
  };
  const close = () => {
    setEditing(null);
    setCreating(false);
  };
  const save = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      color,
      avatarEmoji: emoji.trim() || undefined,
      pin: pin.trim() || undefined,
    };
    if (editing) updateUser(editing.id, payload);
    else addUser(payload);
    close();
  };

  const isOpen = creating || !!editing;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-safe">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Gezin</h1>
        <button className="btn-primary" onClick={() => open()}>
          <Plus className="h-4 w-4" /> Nieuw lid
        </button>
      </header>

      <div className="space-y-2">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => open(u)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left hover:border-brand-300"
          >
            <Avatar user={u} size="md" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {u.name}
                {currentUser?.id === u.id && (
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                    jij
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">{u.pin ? 'Beveiligd met pincode' : 'Geen pincode'}</p>
            </div>
          </button>
        ))}
      </div>

      <Sheet
        open={isOpen}
        onClose={close}
        title={editing ? 'Gezinslid bewerken' : 'Nieuw gezinslid'}
        footer={
          <div className="flex gap-2">
            {editing && users.length > 1 && (
              <button
                className="btn-danger"
                onClick={() => {
                  removeUser(editing.id);
                  close();
                }}
                aria-label="Verwijderen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button className="btn-ghost flex-1" onClick={close}>
              Annuleren
            </button>
            <button className="btn-primary flex-1" onClick={save} disabled={!name.trim()}>
              Opslaan
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Avatar
              user={{ id: 'preview', name: name || '?', color, avatarEmoji: emoji || undefined }}
              size="lg"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Naam</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Emoji (avatar)</label>
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
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Pincode (optioneel)
            </label>
            <input
              type="text"
              inputMode="numeric"
              className="field"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Laat leeg voor geen pincode"
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
