import { CalendarPlus, ListPlus, MapPin, Repeat, Check } from 'lucide-react';
import type { FamilyLocation, Occurrence, Task, User } from '../../types/models';
import { Sheet } from '../ui/Sheet';
import { Avatar } from '../Avatar';
import { dateOnly, fmtDayLong, fmtTimeRange } from '../../lib/date';

export function DayDetailSheet({
  open,
  dayKey,
  occurrences,
  tasks,
  usersById,
  locationsById,
  onClose,
  onEditOccurrence,
  onEditTask,
  onToggleTask,
  onAddAppointment,
  onAddTask,
}: {
  open: boolean;
  dayKey: string | null;
  occurrences: Occurrence[];
  tasks: Task[];
  usersById: Map<string, User>;
  locationsById: Map<string, FamilyLocation>;
  onClose: () => void;
  onEditOccurrence: (occ: Occurrence) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onAddAppointment: () => void;
  onAddTask: () => void;
}) {
  const title = dayKey ? fmtDayLong(dateOnly(dayKey)) : '';
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={onAddAppointment}>
            <CalendarPlus className="h-4 w-4" /> Afspraak
          </button>
          <button
            className="btn flex-1 bg-task-500 text-white hover:bg-task-600"
            onClick={onAddTask}
          >
            <ListPlus className="h-4 w-4" /> Taak
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-600">Afspraken</h3>
          {occurrences.length === 0 ? (
            <p className="text-sm text-slate-400">Geen afspraken.</p>
          ) : (
            <div className="space-y-2">
              {occurrences.map((occ) => {
                const loc = occ.locationId ? locationsById.get(occ.locationId) : null;
                const occUsers = occ.userIds.map((id) => usersById.get(id)).filter(Boolean) as User[];
                return (
                  <button
                    key={occ.appointmentId + occ.occurrenceKey}
                    onClick={() => onEditOccurrence(occ)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left hover:border-brand-300"
                  >
                    <span className="mt-1 h-full w-1 shrink-0 self-stretch rounded-full bg-brand-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{occ.title}</p>
                        {occ.isRecurring && <Repeat className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                      </div>
                      <p className="text-xs font-medium text-brand-600">
                        {occ.allDay ? 'Hele dag' : fmtTimeRange(occ.start, occ.end)}
                      </p>
                      {occ.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{occ.description}</p>
                      )}
                      {loc && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" /> {loc.name}
                        </p>
                      )}
                    </div>
                    <div className="flex -space-x-1.5">
                      {occUsers.map((u) => (
                        <Avatar key={u.id} user={u} size="sm" ring />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-task-600">Taken</h3>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400">Geen taken.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const taskUsers = task.userIds.map((id) => usersById.get(id)).filter(Boolean) as User[];
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3"
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        task.completed ? 'border-task-500 bg-task-500 text-white' : 'border-slate-300'
                      }`}
                      aria-label="Afhandelen"
                    >
                      {task.completed && <Check className="h-4 w-4" />}
                    </button>
                    <button onClick={() => onEditTask(task)} className="min-w-0 flex-1 text-left">
                      <p
                        className={`truncate text-sm font-semibold ${
                          task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="truncate text-xs text-slate-500">{task.description}</p>
                      )}
                    </button>
                    <div className="flex -space-x-1.5">
                      {taskUsers.map((u) => (
                        <Avatar key={u.id} user={u} size="sm" ring />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Sheet>
  );
}
