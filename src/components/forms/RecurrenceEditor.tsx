import type { RecurrenceFreq, RecurrenceRule, WeekdayNum } from '../../types/models';
import { WEEKDAY_LABELS } from '../../lib/date';

const FREQ_OPTIONS: { value: RecurrenceFreq | 'NONE'; label: string }[] = [
  { value: 'NONE', label: 'Nooit' },
  { value: 'DAILY', label: 'Dagelijks' },
  { value: 'WEEKLY', label: 'Wekelijks' },
  { value: 'MONTHLY', label: 'Maandelijks' },
  { value: 'YEARLY', label: 'Jaarlijks' },
];

type EndMode = 'never' | 'count' | 'until';

function endMode(rule: RecurrenceRule): EndMode {
  if (rule.count) return 'count';
  if (rule.until) return 'until';
  return 'never';
}

export function RecurrenceEditor({
  value,
  onChange,
}: {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
}) {
  const rule = value;

  const setFreq = (freq: RecurrenceFreq | 'NONE') => {
    if (freq === 'NONE') {
      onChange(null);
      return;
    }
    onChange({
      freq,
      interval: rule?.interval ?? 1,
      byweekday: freq === 'WEEKLY' ? rule?.byweekday ?? [] : undefined,
      count: rule?.count ?? null,
      until: rule?.until ?? null,
    });
  };

  const patch = (p: Partial<RecurrenceRule>) => rule && onChange({ ...rule, ...p });

  const toggleWeekday = (wd: WeekdayNum) => {
    if (!rule) return;
    const cur = rule.byweekday ?? [];
    patch({ byweekday: cur.includes(wd) ? cur.filter((d) => d !== wd) : [...cur, wd] });
  };

  const mode = rule ? endMode(rule) : 'never';

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Herhalen</label>
        <select
          className="field"
          value={rule?.freq ?? 'NONE'}
          onChange={(e) => setFreq(e.target.value as RecurrenceFreq | 'NONE')}
        >
          {FREQ_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {rule && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Elke</span>
            <input
              type="number"
              min={1}
              max={99}
              value={rule.interval}
              onChange={(e) => patch({ interval: Math.max(1, Number(e.target.value) || 1) })}
              className="field w-20"
            />
            <span className="text-sm text-slate-600">
              {rule.freq === 'DAILY' && (rule.interval === 1 ? 'dag' : 'dagen')}
              {rule.freq === 'WEEKLY' && (rule.interval === 1 ? 'week' : 'weken')}
              {rule.freq === 'MONTHLY' && (rule.interval === 1 ? 'maand' : 'maanden')}
              {rule.freq === 'YEARLY' && 'jaar'}
            </span>
          </div>

          {rule.freq === 'WEEKLY' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Op weekdagen</label>
              <div className="flex gap-1">
                {WEEKDAY_LABELS.map((label, i) => {
                  const wd = (i + 1) as WeekdayNum;
                  const active = rule.byweekday?.includes(wd);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleWeekday(wd)}
                      className={`h-9 flex-1 rounded-lg text-xs font-semibold transition-colors ${
                        active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Eindigt</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={mode === 'never'}
                  onChange={() => patch({ count: null, until: null })}
                />
                Nooit
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={mode === 'count'}
                  onChange={() => patch({ count: rule.count ?? 10, until: null })}
                />
                Na
                <input
                  type="number"
                  min={1}
                  disabled={mode !== 'count'}
                  value={rule.count ?? 10}
                  onChange={(e) => patch({ count: Math.max(1, Number(e.target.value) || 1), until: null })}
                  className="field w-20 disabled:opacity-50"
                />
                keer
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={mode === 'until'}
                  onChange={() =>
                    patch({ until: rule.until ?? new Date().toISOString().slice(0, 10), count: null })
                  }
                />
                Op
                <input
                  type="date"
                  disabled={mode !== 'until'}
                  value={rule.until ?? ''}
                  onChange={(e) => patch({ until: e.target.value, count: null })}
                  className="field flex-1 disabled:opacity-50"
                />
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
