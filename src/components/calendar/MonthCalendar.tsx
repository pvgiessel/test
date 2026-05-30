import { isSameMonth, isToday } from 'date-fns';
import type { User } from '../../types/models';
import type { DayItems } from '../../lib/calendar';
import { dayKey, fmtTime, WEEKDAY_LABELS } from '../../lib/date';
import { Avatar } from '../Avatar';

const MAX_VISIBLE = 3;

export function MonthCalendar({
  month,
  days,
  itemsByDay,
  usersById,
  selectedDay,
  onSelectDay,
}: {
  month: Date;
  days: Date[];
  itemsByDay: Map<string, DayItems>;
  usersById: Map<string, User>;
  selectedDay: string | null;
  onSelectDay: (key: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = dayKey(day);
          const items = itemsByDay.get(key);
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const selected = selectedDay === key;
          const occs = items?.occurrences ?? [];
          const dayTasks = items?.tasks ?? [];
          const total = occs.length + dayTasks.length;
          const visibleOccs = occs.slice(0, MAX_VISIBLE);
          const remainingTaskSlots = Math.max(0, MAX_VISIBLE - visibleOccs.length);
          const visibleTasks = dayTasks.slice(0, remainingTaskSlots);
          const hidden = total - visibleOccs.length - visibleTasks.length;

          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={`flex min-h-[78px] flex-col gap-1 border-b border-r border-slate-100 p-1 text-left align-top sm:min-h-[110px] ${
                inMonth ? 'bg-white' : 'bg-slate-50/60'
              } ${selected ? 'ring-2 ring-inset ring-brand-500' : ''}`}
            >
              <span
                className={`mx-auto mb-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:mx-0 ${
                  today
                    ? 'bg-brand-600 text-white'
                    : inMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                }`}
              >
                {day.getDate()}
              </span>

              <div className="flex flex-col gap-0.5">
                {visibleOccs.map((occ) => {
                  const owner = usersById.get(occ.userIds[0] ?? '');
                  return (
                    <div
                      key={occ.appointmentId + occ.occurrenceKey}
                      className="flex items-center gap-1 rounded-md bg-brand-50 px-1 py-0.5"
                      title={occ.title}
                    >
                      {owner ? (
                        <Avatar user={owner} size="xs" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      )}
                      <span className="hidden truncate text-[11px] font-medium text-brand-800 sm:inline">
                        {!occ.allDay && <span className="text-brand-500">{fmtTime(occ.start)} </span>}
                        {occ.title}
                      </span>
                    </div>
                  );
                })}
                {visibleTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-1 rounded-md px-1 py-0.5 ${
                      task.completed ? 'bg-slate-100' : 'bg-task-100'
                    }`}
                    title={task.title}
                  >
                    <span className={`h-1.5 w-1.5 rounded-sm ${task.completed ? 'bg-slate-400' : 'bg-task-500'}`} />
                    <span
                      className={`hidden truncate text-[11px] font-medium sm:inline ${
                        task.completed ? 'text-slate-400 line-through' : 'text-task-700'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
                {hidden > 0 && (
                  <span className="px-1 text-[10px] font-semibold text-slate-400">+{hidden} meer</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
