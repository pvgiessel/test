import type { User } from '../types/models';
import { Avatar } from './Avatar';
import { Check } from 'lucide-react';

/** Meerdere gebruikers selecteren via avatar-knoppen (voor afspraken & taken). */
export function UserPicker({
  users,
  selected,
  onChange,
}: {
  users: User[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {users.map((u) => {
        const active = selected.includes(u.id);
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => toggle(u.id)}
            className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-all ${
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            <span className="relative">
              <Avatar user={u} size="sm" />
              {active && (
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-brand-600 p-0.5 ring-2 ring-white">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </span>
            {u.name}
          </button>
        );
      })}
    </div>
  );
}
