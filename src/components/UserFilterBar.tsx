import type { User } from '../types/models';
import { Avatar } from './Avatar';
import { Users } from 'lucide-react';

/**
 * Filterbalk: toggle per gezinslid welke afspraken/taken zichtbaar zijn.
 * Een lege selectie = iedereen tonen.
 */
export function UserFilterBar({
  users,
  selected,
  onToggle,
  onClear,
}: {
  users: User[];
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const allActive = selected.length === 0;
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
      <button
        type="button"
        onClick={onClear}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
          allActive
            ? 'border-brand-500 bg-brand-600 text-white'
            : 'border-slate-200 bg-white text-slate-500'
        }`}
      >
        <Users className="h-3.5 w-3.5" />
        Iedereen
      </button>
      {users.map((u) => {
        const active = selected.includes(u.id);
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => onToggle(u.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold transition-all ${
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-500 opacity-70'
            }`}
          >
            <Avatar user={u} size="sm" />
            {u.name}
          </button>
        );
      })}
    </div>
  );
}
