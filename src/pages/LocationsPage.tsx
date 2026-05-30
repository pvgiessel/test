import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import type { FamilyLocation } from '../types/models';
import { useApp } from '../store/AppContext';
import { Sheet } from '../components/ui/Sheet';

export function LocationsPage() {
  const { locations, addLocation, updateLocation, removeLocation } = useApp();
  const [editing, setEditing] = useState<FamilyLocation | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const open = (loc?: FamilyLocation) => {
    setEditing(loc ?? null);
    setCreating(!loc);
    setName(loc?.name ?? '');
    setAddress(loc?.address ?? '');
    setNotes(loc?.notes ?? '');
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = () => {
    if (!name.trim()) return;
    const payload = { name: name.trim(), address: address.trim() || undefined, notes: notes.trim() || undefined };
    if (editing) updateLocation(editing.id, payload);
    else addLocation(payload);
    close();
  };

  const isOpen = creating || !!editing;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-safe">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Locaties</h1>
        <button className="btn-primary" onClick={() => open()}>
          <Plus className="h-4 w-4" /> Nieuw
        </button>
      </header>

      {locations.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-400">Nog geen locaties.</div>
      ) : (
        <div className="space-y-2">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => open(loc)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left hover:border-brand-300"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{loc.name}</p>
                {loc.address && <p className="truncate text-xs text-slate-500">{loc.address}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <Sheet
        open={isOpen}
        onClose={close}
        title={editing ? 'Locatie bewerken' : 'Nieuwe locatie'}
        footer={
          <div className="flex gap-2">
            {editing && (
              <button
                className="btn-danger"
                onClick={() => {
                  removeLocation(editing.id);
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
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Naam</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Adres</label>
            <input className="field" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Notities</label>
            <textarea
              className="field min-h-[72px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
