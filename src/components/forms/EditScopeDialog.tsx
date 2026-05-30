import { Sheet } from '../ui/Sheet';
import { CalendarClock, CalendarRange } from 'lucide-react';

/**
 * Vraagt bij een herhalende afspraak of een wijziging/verwijdering geldt voor
 * alleen deze afspraak of voor de hele reeks.
 */
export function EditScopeDialog({
  open,
  mode,
  onClose,
  onChooseSingle,
  onChooseSeries,
}: {
  open: boolean;
  mode: 'save' | 'delete';
  onClose: () => void;
  onChooseSingle: () => void;
  onChooseSeries: () => void;
}) {
  const verb = mode === 'delete' ? 'Verwijderen' : 'Wijzigen';
  return (
    <Sheet open={open} onClose={onClose} title={`${verb} — herhalende afspraak`}>
      <p className="mb-4 text-sm text-slate-500">
        Dit is een afspraak uit een reeks. Wil je {mode === 'delete' ? 'verwijderen' : 'de wijziging toepassen op'}:
      </p>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onChooseSingle}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-brand-400 hover:bg-brand-50"
        >
          <CalendarClock className="h-6 w-6 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Alleen deze afspraak</p>
            <p className="text-xs text-slate-500">De rest van de reeks blijft ongewijzigd.</p>
          </div>
        </button>
        <button
          type="button"
          onClick={onChooseSeries}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-brand-400 hover:bg-brand-50"
        >
          <CalendarRange className="h-6 w-6 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Hele reeks</p>
            <p className="text-xs text-slate-500">Alle afspraken in de reeks worden bijgewerkt.</p>
          </div>
        </button>
      </div>
    </Sheet>
  );
}
