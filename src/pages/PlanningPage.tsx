import { useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarPlus, ListPlus, ListChecks } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { buildDayItems } from '../lib/calendar';
import { monthGridDays, fmtMonthYear } from '../lib/date';
import type { Appointment, Occurrence, Task } from '../types/models';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { DayDetailSheet } from '../components/calendar/DayDetailSheet';
import { UserFilterBar } from '../components/UserFilterBar';
import { TaskItem } from '../components/tasks/TaskItem';
import { AppointmentForm } from '../components/forms/AppointmentForm';
import { TaskForm } from '../components/forms/TaskForm';

interface ApptFormState {
  appointment?: Appointment;
  occurrence?: Occurrence;
  defaultDate?: string;
}
interface TaskFormState {
  task?: Task;
  defaultDate?: string;
}

export function PlanningPage() {
  const { users, locations, appointments, tasks, toggleTask } = useApp();

  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filter, setFilter] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [daySheet, setDaySheet] = useState(false);
  const [apptForm, setApptForm] = useState<ApptFormState | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState | null>(null);

  const days = useMemo(() => monthGridDays(month), [month]);
  const range = useMemo(() => {
    const start = new Date(days[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(days[days.length - 1]);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [days]);

  const itemsByDay = useMemo(
    () => buildDayItems(appointments, tasks, range.start, range.end, filter),
    [appointments, tasks, range, filter],
  );

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const locationsById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const appointmentsById = useMemo(() => new Map(appointments.map((a) => [a.id, a])), [appointments]);

  // Takenlijst onder de kalender (gefilterd op gebruiker + afgehandeld-toggle).
  const matchesFilter = (ids: string[]) => filter.length === 0 || ids.some((id) => filter.includes(id));
  const listTasks = useMemo(() => {
    return tasks
      .filter((t) => matchesFilter(t.userIds))
      .filter((t) => (showCompleted ? true : !t.completed))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const da = a.date ?? '9999';
        const db = b.date ?? '9999';
        return da.localeCompare(db);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filter, showCompleted]);

  const openCount = tasks.filter((t) => matchesFilter(t.userIds) && !t.completed).length;

  const toggleFilter = (id: string) =>
    setFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectDay = (key: string) => {
    setSelectedDay(key);
    setDaySheet(true);
  };

  const dayItems = selectedDay ? itemsByDay.get(selectedDay) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-safe">
      <header className="flex items-center justify-between gap-2 py-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{fmtMonthYear(month)}</h1>
          <button
            className="text-xs font-semibold text-brand-600"
            onClick={() => setMonth(new Date())}
          >
            Naar vandaag
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="Vorige maand"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="rounded-xl bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Volgende maand"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mb-3">
        <UserFilterBar
          users={users}
          selected={filter}
          onToggle={toggleFilter}
          onClear={() => setFilter([])}
        />
      </div>

      <MonthCalendar
        month={month}
        days={days}
        itemsByDay={itemsByDay}
        usersById={usersById}
        selectedDay={selectedDay}
        onSelectDay={selectDay}
      />

      <div className="mt-3 flex gap-2">
        <button className="btn-primary flex-1" onClick={() => setApptForm({})}>
          <CalendarPlus className="h-4 w-4" /> Nieuwe afspraak
        </button>
        <button
          className="btn flex-1 bg-task-500 text-white hover:bg-task-600"
          onClick={() => setTaskForm({})}
        >
          <ListPlus className="h-4 w-4" /> Nieuwe taak
        </button>
      </div>

      {/* Takenlijst */}
      <section className="mt-6 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <ListChecks className="h-5 w-5 text-task-500" /> Taken
            {openCount > 0 && (
              <span className="rounded-full bg-task-100 px-2 py-0.5 text-xs font-bold text-task-700">
                {openCount}
              </span>
            )}
          </h2>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            Toon afgehandelde
          </label>
        </div>

        <p className="mb-2 text-[11px] text-slate-400">Tip: swipe een taak naar rechts om af te handelen.</p>

        {listTasks.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-400">
            {showCompleted ? 'Nog geen taken.' : 'Geen openstaande taken 🎉'}
          </div>
        ) : (
          <div className="space-y-2">
            {listTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                users={users}
                onToggle={() => toggleTask(task.id)}
                onOpen={() => setTaskForm({ task })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dag-detail */}
      <DayDetailSheet
        open={daySheet}
        dayKey={selectedDay}
        occurrences={dayItems?.occurrences ?? []}
        tasks={dayItems?.tasks ?? []}
        usersById={usersById}
        locationsById={locationsById}
        onClose={() => setDaySheet(false)}
        onEditOccurrence={(occ) => {
          setDaySheet(false);
          setApptForm({ appointment: appointmentsById.get(occ.appointmentId), occurrence: occ });
        }}
        onEditTask={(task) => {
          setDaySheet(false);
          setTaskForm({ task });
        }}
        onToggleTask={toggleTask}
        onAddAppointment={() => {
          setDaySheet(false);
          setApptForm({ defaultDate: selectedDay ?? undefined });
        }}
        onAddTask={() => {
          setDaySheet(false);
          setTaskForm({ defaultDate: selectedDay ?? undefined });
        }}
      />

      {/* Formulieren */}
      {apptForm && (
        <AppointmentForm
          open
          onClose={() => setApptForm(null)}
          appointment={apptForm.appointment}
          occurrence={apptForm.occurrence}
          defaultDate={apptForm.defaultDate}
        />
      )}
      {taskForm && (
        <TaskForm
          open
          onClose={() => setTaskForm(null)}
          task={taskForm.task}
          defaultDate={taskForm.defaultDate}
        />
      )}
    </div>
  );
}
